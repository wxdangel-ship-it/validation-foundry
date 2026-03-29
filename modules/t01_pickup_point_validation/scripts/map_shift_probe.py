from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path

try:
    import cv2
except ImportError as exc:  # pragma: no cover - environment dependent
    cv2 = None
    CV2_IMPORT_ERROR = exc
else:
    CV2_IMPORT_ERROR = None

import numpy as np


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")


MIN_MASK_PIXELS = 4096


@dataclass
class ShiftEstimate:
    method: str
    dx: float
    dy: float
    score: float
    details: dict[str, object]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Estimate map translation between two screenshots. "
            "ROI exclusions default to x,y,w,h; use xyxy:x1,y1,x2,y2 for corners."
        )
    )
    parser.add_argument("image_a", help="reference screenshot path")
    parser.add_argument("image_b", help="target screenshot path")
    parser.add_argument(
        "--exclude-roi",
        action="append",
        default=[],
        metavar="ROI",
        help=(
            "repeatable exclusion ROI. Default format is x,y,w,h; "
            "prefix with xyxy: for x1,y1,x2,y2"
        ),
    )
    parser.add_argument(
        "--method",
        choices=("auto", "phase", "feature"),
        default="auto",
        help="estimation method to use",
    )
    parser.add_argument(
        "--phase-min-score",
        type=float,
        default=0.10,
        help="auto mode keeps phaseCorrelate when its score is at least this value",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="pretty-print JSON output",
    )
    return parser.parse_args()


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def parse_roi(text: str) -> tuple[int, int, int, int]:
    raw = text.strip().replace(" ", "")
    if not raw:
        raise ValueError("empty ROI")

    mode = "xywh"
    if ":" in raw:
        prefix, raw = raw.split(":", 1)
        if prefix.lower() != "xyxy":
            raise ValueError(f"unsupported ROI prefix: {prefix!r}")
        mode = "xyxy"

    parts = [part for part in raw.split(",") if part]
    if len(parts) != 4:
        raise ValueError(f"ROI must contain 4 integers: {text!r}")

    values = [int(part) for part in parts]
    if mode == "xyxy":
        x1, y1, x2, y2 = values
    else:
        x, y, w, h = values
        if w <= 0 or h <= 0:
            raise ValueError(f"ROI width/height must be positive: {text!r}")
        x1, y1, x2, y2 = x, y, x + w, y + h

    if x2 <= x1 or y2 <= y1:
        raise ValueError(f"ROI must define a positive area: {text!r}")
    return x1, y1, x2, y2


def normalize_rois(rois: list[str], shape: tuple[int, int]) -> list[list[int]]:
    height, width = shape
    normalized: list[list[int]] = []
    for raw_roi in rois:
        x1, y1, x2, y2 = parse_roi(raw_roi)
        x1 = clamp(x1, 0, width)
        y1 = clamp(y1, 0, height)
        x2 = clamp(x2, 0, width)
        y2 = clamp(y2, 0, height)
        if x2 <= x1 or y2 <= y1:
            continue
        normalized.append([x1, y1, x2, y2])
    return normalized


def read_image(path: str) -> np.ndarray:
    image = cv2.imread(str(Path(path)), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"failed to read image: {path}")
    return image


def ensure_same_shape(image_a: np.ndarray, image_b: np.ndarray) -> None:
    if image_a.shape[:2] != image_b.shape[:2]:
        raise ValueError(
            "images must have the same height/width, "
            f"got {image_a.shape[:2]} vs {image_b.shape[:2]}"
        )


def build_keep_mask(shape: tuple[int, int], excluded_rois: list[list[int]]) -> np.ndarray:
    height, width = shape
    mask = np.ones((height, width), dtype=np.uint8) * 255
    for x1, y1, x2, y2 in excluded_rois:
        mask[y1:y2, x1:x2] = 0
    return mask


def masked_pixel_count(mask: np.ndarray) -> int:
    return int(np.count_nonzero(mask))


def to_gray(image: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def preprocess_for_phase(gray: np.ndarray, mask: np.ndarray) -> np.ndarray:
    gray_f = gray.astype(np.float32)
    blurred = cv2.GaussianBlur(gray_f, (0, 0), 1.2)
    grad_x = cv2.Sobel(blurred, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(blurred, cv2.CV_32F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(grad_x, grad_y)

    mask_f = mask.astype(np.float32) / 255.0
    magnitude *= mask_f

    valid = magnitude[mask > 0]
    if valid.size < MIN_MASK_PIXELS:
        raise ValueError("remaining non-excluded area is too small")

    mean = float(valid.mean())
    std = float(valid.std())
    if std > 1e-6:
        magnitude = (magnitude - mean) / std

    magnitude *= mask_f
    height, width = magnitude.shape
    window = cv2.createHanningWindow((width, height), cv2.CV_32F)
    return magnitude * window


def estimate_phase(gray_a: np.ndarray, gray_b: np.ndarray, mask: np.ndarray) -> ShiftEstimate:
    prepared_a = preprocess_for_phase(gray_a, mask)
    prepared_b = preprocess_for_phase(gray_b, mask)
    (dx, dy), response = cv2.phaseCorrelate(prepared_a, prepared_b)
    return ShiftEstimate(
        method="phase",
        dx=float(dx),
        dy=float(dy),
        score=float(response),
        details={"response": float(response)},
    )


def estimate_feature(gray_a: np.ndarray, gray_b: np.ndarray, mask: np.ndarray) -> ShiftEstimate | None:
    orb = cv2.ORB_create(
        nfeatures=5000,
        scaleFactor=1.2,
        nlevels=8,
        edgeThreshold=31,
        patchSize=31,
        fastThreshold=12,
    )
    keypoints_a, desc_a = orb.detectAndCompute(gray_a, mask)
    keypoints_b, desc_b = orb.detectAndCompute(gray_b, mask)
    if desc_a is None or desc_b is None:
        return None
    if len(keypoints_a) < 8 or len(keypoints_b) < 8:
        return None

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    raw_matches = matcher.knnMatch(desc_a, desc_b, k=2)

    good_matches: list[cv2.DMatch] = []
    for pair in raw_matches:
        if len(pair) != 2:
            continue
        first, second = pair
        if first.distance < 0.75 * second.distance:
            good_matches.append(first)

    if len(good_matches) < 6:
        return None

    pts_a = np.float32([keypoints_a[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    pts_b = np.float32([keypoints_b[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    matrix, inliers = cv2.estimateAffinePartial2D(
        pts_a,
        pts_b,
        method=cv2.RANSAC,
        ransacReprojThreshold=3.0,
        maxIters=4000,
        confidence=0.995,
        refineIters=25,
    )
    if matrix is None or inliers is None:
        return None

    inlier_mask = inliers.ravel().astype(bool)
    inlier_count = int(inlier_mask.sum())
    if inlier_count < 4:
        return None

    a00 = float(matrix[0, 0])
    a01 = float(matrix[0, 1])
    tx = float(matrix[0, 2])
    ty = float(matrix[1, 2])
    scale = math.sqrt(a00 * a00 + a01 * a01)
    rotation_deg = math.degrees(math.atan2(a01, a00))

    inlier_ratio = inlier_count / max(len(good_matches), 1)
    support = min(1.0, inlier_count / 40.0)
    score = float(inlier_ratio * support)
    if abs(scale - 1.0) > 0.15 or abs(rotation_deg) > 8.0:
        score *= 0.35

    return ShiftEstimate(
        method="feature",
        dx=tx,
        dy=ty,
        score=score,
        details={
            "matches": len(good_matches),
            "inliers": inlier_count,
            "inlier_ratio": inlier_ratio,
            "scale": scale,
            "rotation_deg": rotation_deg,
        },
    )


def choose_estimate(
    method: str,
    phase_estimate: ShiftEstimate,
    feature_estimate: ShiftEstimate | None,
    phase_min_score: float,
) -> ShiftEstimate:
    if method == "phase":
        return phase_estimate
    if method == "feature":
        if feature_estimate is None:
            raise ValueError("feature matching failed to find a stable translation")
        return feature_estimate

    if phase_estimate.score >= phase_min_score or feature_estimate is None:
        return phase_estimate
    return feature_estimate


def emit(payload: dict[str, object], pretty: bool) -> None:
    kwargs = {"ensure_ascii": False, "sort_keys": True}
    if pretty:
        kwargs["indent"] = 2
    print(json.dumps(payload, **kwargs))


def main() -> int:
    args = parse_args()

    try:
        if cv2 is None:
            raise RuntimeError(f"opencv-python is required: {CV2_IMPORT_ERROR}")

        image_a = read_image(args.image_a)
        image_b = read_image(args.image_b)
        ensure_same_shape(image_a, image_b)

        image_shape = list(map(int, image_a.shape[:2]))
        excluded_rois = normalize_rois(args.exclude_roi, image_a.shape[:2])
        keep_mask = build_keep_mask(image_a.shape[:2], excluded_rois)
        keep_pixels = masked_pixel_count(keep_mask)
        if keep_pixels < MIN_MASK_PIXELS:
            raise ValueError("remaining non-excluded area is too small")

        gray_a = to_gray(image_a)
        gray_b = to_gray(image_b)
        phase_estimate = estimate_phase(gray_a, gray_b, keep_mask)
        feature_estimate = estimate_feature(gray_a, gray_b, keep_mask)
        best = choose_estimate(args.method, phase_estimate, feature_estimate, args.phase_min_score)

        payload: dict[str, object] = {
            "dx": best.dx,
            "dy": best.dy,
            "score": best.score,
            "image_shape": image_shape,
            "method": best.method,
            "excluded_rois": excluded_rois,
            "kept_pixels": keep_pixels,
            "candidates": {
                "phase": {
                    "dx": phase_estimate.dx,
                    "dy": phase_estimate.dy,
                    "score": phase_estimate.score,
                    **phase_estimate.details,
                }
            },
        }
        if feature_estimate is not None:
            payload["candidates"]["feature"] = {
                "dx": feature_estimate.dx,
                "dy": feature_estimate.dy,
                "score": feature_estimate.score,
                **feature_estimate.details,
            }
        emit(payload, args.pretty)
        return 0
    except Exception as exc:
        emit({"error": str(exc)}, args.pretty)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
