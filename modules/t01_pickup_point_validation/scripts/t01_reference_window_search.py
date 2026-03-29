from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

import t01_map_registration as reg


@dataclass
class Candidate:
    x: int
    y: int
    w: int
    h: int
    corr_score: float


def to_jsonable(value: object) -> object:
    if isinstance(value, dict):
        return {str(key): to_jsonable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [to_jsonable(item) for item in value]
    if isinstance(value, tuple):
        return [to_jsonable(item) for item in value]
    if isinstance(value, np.floating):
        return float(value)
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    return value


def preprocess_target(
    target_image: np.ndarray,
    target_map_roi: tuple[int, int, int, int],
    exclude_rois_local: list[tuple[int, int, int, int]],
) -> tuple[np.ndarray, np.ndarray]:
    target_roi = reg.crop_xyxy(target_image, target_map_roi)
    gray = cv2.cvtColor(target_roi, cv2.COLOR_BGR2GRAY)
    mask = reg.build_mask(gray.shape, exclude_rois_local)
    edges = cv2.Canny(gray, 60, 160)
    edges[mask == 0] = 0
    return target_roi, edges


def preprocess_reference_window(
    reference_image: np.ndarray,
    window_xywh: tuple[int, int, int, int],
    target_hw: tuple[int, int],
) -> tuple[np.ndarray, np.ndarray]:
    x, y, w, h = window_xywh
    crop = reference_image[y : y + h, x : x + w]
    resized = cv2.resize(crop, (target_hw[1], target_hw[0]), interpolation=cv2.INTER_LINEAR)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    return resized, edges


def normalized_corr(a: np.ndarray, b: np.ndarray, mask: np.ndarray) -> float:
    valid = mask > 0
    if int(valid.sum()) < 4096:
        return -1.0
    av = a[valid].astype(np.float32)
    bv = b[valid].astype(np.float32)
    av = av - float(av.mean())
    bv = bv - float(bv.mean())
    ad = float(np.linalg.norm(av))
    bd = float(np.linalg.norm(bv))
    if ad < 1e-6 or bd < 1e-6:
        return -1.0
    return float(np.dot(av, bv) / (ad * bd))


def search_windows(
    target_edges: np.ndarray,
    target_mask: np.ndarray,
    reference_image: np.ndarray,
    window_heights: list[int],
    aspect: float,
    step_px: int,
    top_k: int,
) -> list[Candidate]:
    ref_h, ref_w = reference_image.shape[:2]
    candidates: list[Candidate] = []
    for height in window_heights:
        width = int(round(height * aspect))
        if width < 120 or width > ref_w or height > ref_h:
            continue
        for y in range(0, ref_h - height + 1, step_px):
            for x in range(0, ref_w - width + 1, step_px):
                _, ref_edges = preprocess_reference_window(reference_image, (x, y, width, height), target_edges.shape)
                score = normalized_corr(target_edges, ref_edges, target_mask)
                candidates.append(Candidate(x=x, y=y, w=width, h=height, corr_score=score))
    candidates.sort(key=lambda item: item.corr_score, reverse=True)
    return candidates[:top_k]


def evaluate_candidate(
    target_roi: np.ndarray,
    target_mask: np.ndarray,
    reference_image: np.ndarray,
    candidate: Candidate,
    target_tip_roi_xy: tuple[float, float] | None,
    feature: str,
) -> dict[str, object] | None:
    ref_resized, _ = preprocess_reference_window(
        reference_image,
        (candidate.x, candidate.y, candidate.w, candidate.h),
        target_roi.shape[:2],
    )

    target_gray = cv2.cvtColor(target_roi, cv2.COLOR_BGR2GRAY)
    ref_gray = cv2.cvtColor(ref_resized, cv2.COLOR_BGR2GRAY)
    keypoints_a, desc_a = reg.detect_and_compute(target_gray, target_mask, feature)
    keypoints_b, desc_b = reg.detect_and_compute(ref_gray, np.ones(ref_gray.shape, dtype=np.uint8) * 255, feature)
    if desc_a is None or desc_b is None:
        return None

    matches = reg.match_descriptors(desc_a, desc_b, feature)
    if len(matches) < 8:
        return None

    try:
        matrix, inlier_mask = reg.estimate_homography(keypoints_a, keypoints_b, matches)
    except Exception:
        return None

    inlier_count = int(inlier_mask.ravel().astype(bool).sum())
    corners = np.array(
        [[[0, 0]], [[target_roi.shape[1], 0]], [[target_roi.shape[1], target_roi.shape[0]]], [[0, target_roi.shape[0]]]],
        dtype=np.float32,
    )
    projected_corners = cv2.perspectiveTransform(corners, matrix).reshape(-1, 2)
    signed_area = 0.0
    for first, second in zip(projected_corners, np.vstack([projected_corners[1:], projected_corners[:1]])):
        signed_area += first[0] * second[1] - second[0] * first[1]
    signed_area *= 0.5
    area_abs = abs(signed_area)
    expected_area = float(target_roi.shape[0] * target_roi.shape[1])
    if area_abs < expected_area * 0.08 or area_abs > expected_area * 8.0:
        return None

    result: dict[str, object] = {
        "candidate_window_xywh": [candidate.x, candidate.y, candidate.w, candidate.h],
        "corr_score": candidate.corr_score,
        "match_count": len(matches),
        "inlier_count": inlier_count,
        "inlier_ratio": float(inlier_count / max(len(matches), 1)),
        "homography": matrix.tolist(),
        "projected_corner_area": area_abs,
    }

    if target_tip_roi_xy is not None:
        projected_tip_resized_xy = reg.project_point(matrix, target_tip_roi_xy)
        margin_x = target_roi.shape[1] * 0.08
        margin_y = target_roi.shape[0] * 0.08
        if (
            projected_tip_resized_xy[0] < -margin_x
            or projected_tip_resized_xy[0] > target_roi.shape[1] + margin_x
            or projected_tip_resized_xy[1] < -margin_y
            or projected_tip_resized_xy[1] > target_roi.shape[0] + margin_y
        ):
            return None
        scale_x = candidate.w / target_roi.shape[1]
        scale_y = candidate.h / target_roi.shape[0]
        projected_tip_mosaic_xy = (
            candidate.x + projected_tip_resized_xy[0] * scale_x,
            candidate.y + projected_tip_resized_xy[1] * scale_y,
        )
        result["projected_tip_candidate_resized_xy"] = [
            projected_tip_resized_xy[0],
            projected_tip_resized_xy[1],
        ]
        result["projected_tip_mosaic_xy"] = [
            projected_tip_mosaic_xy[0],
            projected_tip_mosaic_xy[1],
        ]
    return result


def mosaic_pixel_to_lonlat(
    mosaic_xy: tuple[float, float],
    tile_origin_xy: tuple[int, int],
    z: int,
    tile_size: int = 256,
) -> tuple[float, float]:
    world_px_x = tile_origin_xy[0] * tile_size + mosaic_xy[0]
    world_px_y = tile_origin_xy[1] * tile_size + mosaic_xy[1]
    scale = tile_size * (2**z)
    lon = world_px_x / scale * 360.0 - 180.0
    merc_n = math.pi * (1.0 - 2.0 * world_px_y / scale)
    lat = math.degrees(math.atan(math.sinh(merc_n)))
    return lon, lat


def draw_best_overlay(
    target_roi: np.ndarray,
    reference_image: np.ndarray,
    candidate: Candidate,
    projected_tip_mosaic_xy: tuple[float, float] | None,
    out_path: Path,
) -> None:
    x, y, w, h = candidate.x, candidate.y, candidate.w, candidate.h
    crop = reference_image[y : y + h, x : x + w]
    overlay = cv2.resize(crop, (target_roi.shape[1], target_roi.shape[0]), interpolation=cv2.INTER_LINEAR)
    if projected_tip_mosaic_xy is not None:
        scale_x = target_roi.shape[1] / w
        scale_y = target_roi.shape[0] / h
        px = int(round((projected_tip_mosaic_xy[0] - x) * scale_x))
        py = int(round((projected_tip_mosaic_xy[1] - y) * scale_y))
        cv2.drawMarker(overlay, (px, py), (0, 255, 0), cv2.MARKER_CROSS, 28, 2)
        cv2.putText(
            overlay,
            f"best_tip=({px},{py})",
            (max(10, px - 90), max(24, py - 12)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_path), overlay)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Search best reference window in public tile mosaic.")
    parser.add_argument("--target-image", required=True)
    parser.add_argument("--reference-mosaic", required=True)
    parser.add_argument("--profile-json", required=True)
    parser.add_argument("--target-tip-xy", required=True)
    parser.add_argument("--tile-origin-xy", required=True, help="top-left tile origin for mosaic, x,y")
    parser.add_argument("--zoom", type=int, required=True)
    parser.add_argument("--window-heights", default="420,520,620,720,820,920,1020")
    parser.add_argument("--step-px", type=int, default=64)
    parser.add_argument("--top-k", type=int, default=12)
    parser.add_argument("--feature", default="akaze", choices=["akaze", "sift"])
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--overlay-out")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    profile = json.loads(Path(args.profile_json).read_text(encoding="utf-8"))
    target_image = reg.load_image(args.target_image)
    reference_image = reg.load_image(args.reference_mosaic)

    target_map_roi = tuple(profile["map_roi_xyxy"])
    exclude_rois_local = []
    for roi in profile.get("exclude_rois_xyxy", []):
        x1, y1, x2, y2 = roi
        exclude_rois_local.append((x1 - target_map_roi[0], y1 - target_map_roi[1], x2 - target_map_roi[0], y2 - target_map_roi[1]))

    target_roi, target_edges = preprocess_target(target_image, target_map_roi, exclude_rois_local)
    target_mask = reg.build_mask(target_edges.shape, exclude_rois_local)
    target_tip_full_xy = reg.parse_xy(args.target_tip_xy)
    target_tip_roi_xy = reg.to_roi_local(target_tip_full_xy, target_map_roi)

    aspect = target_roi.shape[1] / target_roi.shape[0]
    window_heights = [int(item.strip()) for item in args.window_heights.split(",") if item.strip()]
    candidates = search_windows(
        target_edges=target_edges,
        target_mask=target_mask,
        reference_image=reference_image,
        window_heights=window_heights,
        aspect=aspect,
        step_px=args.step_px,
        top_k=args.top_k,
    )

    tile_origin_xy = reg.parse_xy(args.tile_origin_xy)
    evals: list[dict[str, object]] = []
    for candidate in candidates:
        evaluated = evaluate_candidate(
            target_roi=target_roi,
            target_mask=target_mask,
            reference_image=reference_image,
            candidate=candidate,
            target_tip_roi_xy=target_tip_roi_xy,
            feature=args.feature,
        )
        if evaluated is None:
            continue
        if "projected_tip_mosaic_xy" in evaluated:
            lon, lat = mosaic_pixel_to_lonlat(
                mosaic_xy=tuple(evaluated["projected_tip_mosaic_xy"]),  # type: ignore[arg-type]
                tile_origin_xy=(int(tile_origin_xy[0]), int(tile_origin_xy[1])),
                z=args.zoom,
            )
            evaluated["projected_tip_lonlat"] = [lon, lat]
        evals.append(evaluated)

    evals.sort(key=lambda item: (item["inlier_count"], item["inlier_ratio"], item["corr_score"]), reverse=True)
    result: dict[str, object] = {
        "method": "reference_window_search",
        "feature": args.feature,
        "reference_mosaic": args.reference_mosaic,
        "zoom": args.zoom,
        "tile_origin_xy": [int(tile_origin_xy[0]), int(tile_origin_xy[1])],
        "target_tip_full_xy": [target_tip_full_xy[0], target_tip_full_xy[1]],
        "candidate_count": len(candidates),
        "evaluated_count": len(evals),
        "best": evals[0] if evals else None,
        "top_results": evals[:8],
    }

    out_path = Path(args.out_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(to_jsonable(result), ensure_ascii=False, indent=2), encoding="utf-8")

    if args.overlay_out and evals:
        best_window = evals[0]["candidate_window_xywh"]
        candidate = Candidate(
            x=int(best_window[0]),
            y=int(best_window[1]),
            w=int(best_window[2]),
            h=int(best_window[3]),
            corr_score=float(evals[0]["corr_score"]),
        )
        projected_tip = tuple(evals[0].get("projected_tip_mosaic_xy")) if evals[0].get("projected_tip_mosaic_xy") else None
        draw_best_overlay(target_roi, reference_image, candidate, projected_tip, Path(args.overlay_out))

    print(json.dumps(to_jsonable(result), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
