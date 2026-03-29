from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np


def parse_xyxy(raw: str) -> tuple[int, int, int, int]:
    parts = [int(part.strip()) for part in raw.split(",")]
    if len(parts) != 4:
        raise ValueError(f"xyxy requires 4 integers, got: {raw!r}")
    x1, y1, x2, y2 = parts
    if x2 <= x1 or y2 <= y1:
        raise ValueError(f"xyxy must define positive area, got: {raw!r}")
    return x1, y1, x2, y2


def parse_xy(raw: str) -> tuple[float, float]:
    parts = [float(part.strip()) for part in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"xy requires 2 numbers, got: {raw!r}")
    return parts[0], parts[1]


def load_image(path: str | Path) -> np.ndarray:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"failed to read image: {path}")
    return image


def crop_xyxy(image: np.ndarray, xyxy: tuple[int, int, int, int]) -> np.ndarray:
    x1, y1, x2, y2 = xyxy
    return image[y1:y2, x1:x2].copy()


def build_mask(size_hw: tuple[int, int], exclude_rois: list[tuple[int, int, int, int]]) -> np.ndarray:
    height, width = size_hw
    mask = np.ones((height, width), dtype=np.uint8) * 255
    for x1, y1, x2, y2 in exclude_rois:
        x1 = max(0, min(width, x1))
        x2 = max(0, min(width, x2))
        y1 = max(0, min(height, y1))
        y2 = max(0, min(height, y2))
        if x2 > x1 and y2 > y1:
            mask[y1:y2, x1:x2] = 0
    return mask


def detect_and_compute(
    gray: np.ndarray,
    mask: np.ndarray,
    feature: str = "akaze",
) -> tuple[list[cv2.KeyPoint], np.ndarray | None]:
    feature = feature.lower()
    if feature == "akaze":
        detector = cv2.AKAZE_create()
    elif feature == "sift":
        detector = cv2.SIFT_create()
    else:
        raise ValueError(f"unsupported feature detector: {feature}")
    return detector.detectAndCompute(gray, mask)


def match_descriptors(
    desc_a: np.ndarray,
    desc_b: np.ndarray,
    feature: str = "akaze",
) -> list[cv2.DMatch]:
    feature = feature.lower()
    if feature == "akaze":
        norm = cv2.NORM_HAMMING
    elif feature == "sift":
        norm = cv2.NORM_L2
    else:
        raise ValueError(f"unsupported feature descriptor: {feature}")
    matcher = cv2.BFMatcher(norm, crossCheck=False)
    raw_matches = matcher.knnMatch(desc_a, desc_b, k=2)
    good_matches: list[cv2.DMatch] = []
    for pair in raw_matches:
        if len(pair) != 2:
            continue
        first, second = pair
        if first.distance < 0.75 * second.distance:
            good_matches.append(first)
    return good_matches


def estimate_homography(
    keypoints_a: list[cv2.KeyPoint],
    keypoints_b: list[cv2.KeyPoint],
    matches: list[cv2.DMatch],
) -> tuple[np.ndarray, np.ndarray]:
    if len(matches) < 8:
        raise ValueError(f"not enough matches for homography: {len(matches)}")
    pts_a = np.float32([keypoints_a[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    pts_b = np.float32([keypoints_b[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
    matrix, inlier_mask = cv2.findHomography(pts_a, pts_b, cv2.RANSAC, 4.0)
    if matrix is None or inlier_mask is None:
        raise ValueError("homography estimation failed")
    return matrix, inlier_mask


def project_point(matrix: np.ndarray, point_xy: tuple[float, float]) -> tuple[float, float]:
    point = np.array([[[point_xy[0], point_xy[1]]]], dtype=np.float32)
    projected = cv2.perspectiveTransform(point, matrix)
    return float(projected[0, 0, 0]), float(projected[0, 0, 1])


def to_roi_local(point_xy: tuple[float, float], roi_xyxy: tuple[int, int, int, int]) -> tuple[float, float]:
    return point_xy[0] - roi_xyxy[0], point_xy[1] - roi_xyxy[1]


def to_full_image(point_xy: tuple[float, float], roi_xyxy: tuple[int, int, int, int]) -> tuple[float, float]:
    return point_xy[0] + roi_xyxy[0], point_xy[1] + roi_xyxy[1]


def draw_registration_overlay(
    target_roi: np.ndarray,
    reference_roi: np.ndarray,
    matrix: np.ndarray,
    target_tip_roi_xy: tuple[float, float] | None,
    projected_tip_roi_xy: tuple[float, float] | None,
) -> np.ndarray:
    h, w = reference_roi.shape[:2]
    warped = cv2.warpPerspective(target_roi, matrix, (w, h))
    overlay = cv2.addWeighted(reference_roi, 0.55, warped, 0.45, 0.0)
    if projected_tip_roi_xy is not None:
        px = int(round(projected_tip_roi_xy[0]))
        py = int(round(projected_tip_roi_xy[1]))
        cv2.drawMarker(overlay, (px, py), (0, 255, 0), cv2.MARKER_CROSS, 28, 2)
        cv2.putText(
            overlay,
            f"projected=({px},{py})",
            (max(10, px - 120), max(24, py - 12)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )
    if target_tip_roi_xy is not None:
        tx = int(round(target_tip_roi_xy[0]))
        ty = int(round(target_tip_roi_xy[1]))
        cv2.putText(
            overlay,
            f"target_tip_roi=({tx},{ty})",
            (10, h - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 0),
            2,
            cv2.LINE_AA,
        )
    return overlay


def parse_profile(path: str | None) -> dict[str, object] | None:
    if not path:
        return None
    return json.loads(Path(path).read_text(encoding="utf-8"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Register app screenshot map ROI to reference basemap ROI.")
    parser.add_argument("--target-image", required=True)
    parser.add_argument("--reference-image", required=True)
    parser.add_argument("--profile-json", help="fixed-view profile JSON")
    parser.add_argument("--target-map-roi", help="override target ROI, x1,y1,x2,y2")
    parser.add_argument("--reference-map-roi", help="override reference ROI, x1,y1,x2,y2")
    parser.add_argument("--target-tip-xy", help="target tip on full target image, x,y")
    parser.add_argument("--feature", default="akaze", choices=["akaze", "sift"])
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--overlay-out")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    profile = parse_profile(args.profile_json)

    target_image = load_image(args.target_image)
    reference_image = load_image(args.reference_image)

    if args.target_map_roi:
        target_map_roi = parse_xyxy(args.target_map_roi)
    elif profile:
        target_map_roi = tuple(profile["map_roi_xyxy"])  # type: ignore[arg-type]
    else:
        raise ValueError("target map ROI is required")

    if args.reference_map_roi:
        reference_map_roi = parse_xyxy(args.reference_map_roi)
    else:
        reference_map_roi = (0, 0, reference_image.shape[1], reference_image.shape[0])

    exclude_rois_local: list[tuple[int, int, int, int]] = []
    if profile:
        for roi in profile.get("exclude_rois_xyxy", []):
            rx1, ry1, rx2, ry2 = roi
            exclude_rois_local.append(
                (
                    int(rx1 - target_map_roi[0]),
                    int(ry1 - target_map_roi[1]),
                    int(rx2 - target_map_roi[0]),
                    int(ry2 - target_map_roi[1]),
                )
            )

    target_roi = crop_xyxy(target_image, target_map_roi)
    reference_roi = crop_xyxy(reference_image, reference_map_roi)
    target_gray = cv2.cvtColor(target_roi, cv2.COLOR_BGR2GRAY)
    reference_gray = cv2.cvtColor(reference_roi, cv2.COLOR_BGR2GRAY)

    target_mask = build_mask(target_gray.shape, exclude_rois_local)
    reference_mask = np.ones(reference_gray.shape, dtype=np.uint8) * 255

    keypoints_a, desc_a = detect_and_compute(target_gray, target_mask, args.feature)
    keypoints_b, desc_b = detect_and_compute(reference_gray, reference_mask, args.feature)
    if desc_a is None or desc_b is None:
        raise ValueError("failed to compute descriptors")

    matches = match_descriptors(desc_a, desc_b, args.feature)
    matrix, inlier_mask = estimate_homography(keypoints_a, keypoints_b, matches)
    inlier_count = int(inlier_mask.ravel().astype(bool).sum())

    result: dict[str, object] = {
        "method": f"{args.feature}_homography_registration",
        "target_image": str(Path(args.target_image)),
        "reference_image": str(Path(args.reference_image)),
        "target_map_roi": list(target_map_roi),
        "reference_map_roi": list(reference_map_roi),
        "keypoints_target": len(keypoints_a),
        "keypoints_reference": len(keypoints_b),
        "match_count": len(matches),
        "inlier_count": inlier_count,
        "inlier_ratio": float(inlier_count / max(len(matches), 1)),
        "homography": matrix.tolist(),
    }

    target_tip_full_xy: tuple[float, float] | None = None
    target_tip_roi_xy: tuple[float, float] | None = None
    projected_tip_roi_xy: tuple[float, float] | None = None
    projected_tip_full_xy: tuple[float, float] | None = None
    if args.target_tip_xy:
        target_tip_full_xy = parse_xy(args.target_tip_xy)
        target_tip_roi_xy = to_roi_local(target_tip_full_xy, target_map_roi)
        projected_tip_roi_xy = project_point(matrix, target_tip_roi_xy)
        projected_tip_full_xy = to_full_image(projected_tip_roi_xy, reference_map_roi)
        result["target_tip_full_xy"] = [target_tip_full_xy[0], target_tip_full_xy[1]]
        result["target_tip_roi_xy"] = [target_tip_roi_xy[0], target_tip_roi_xy[1]]
        result["projected_tip_roi_xy"] = [projected_tip_roi_xy[0], projected_tip_roi_xy[1]]
        result["projected_tip_full_xy"] = [projected_tip_full_xy[0], projected_tip_full_xy[1]]

    out_path = Path(args.out_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.overlay_out:
        overlay = draw_registration_overlay(
            target_roi=target_roi,
            reference_roi=reference_roi,
            matrix=matrix,
            target_tip_roi_xy=target_tip_roi_xy,
            projected_tip_roi_xy=projected_tip_roi_xy,
        )
        overlay_path = Path(args.overlay_out)
        overlay_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(overlay_path), overlay)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
