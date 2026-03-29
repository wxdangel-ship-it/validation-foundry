from __future__ import annotations

import argparse
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

import cv2

import t01_map_registration as reg
from t01_amap_batch import adb, dump_ui, open_amap_taxi, screenshot, sleep_s
from t01_amap_tip_locator import annotate, classify_taxi_page_variant, detect_blue_pickup_pin, load_image
from t01_reference_window_search import (
    Candidate,
    draw_best_overlay,
    evaluate_candidate,
    mosaic_pixel_to_lonlat,
    preprocess_target,
    search_windows,
    to_jsonable,
)


def parse_xy(raw: str) -> tuple[int, int]:
    parts = [int(part.strip()) for part in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"xy requires 2 integers, got: {raw!r}")
    return parts[0], parts[1]


def root_texts(root: ET.Element) -> list[str]:
    texts: list[str] = []
    for node in root.iter("node"):
        text = node.attrib.get("text", "").strip()
        if text and text not in texts:
            texts.append(text)
    return texts


def find_first_text_bounds(root: ET.Element, text: str) -> str | None:
    for node in root.iter("node"):
        if node.attrib.get("text", "").strip() == text:
            return node.attrib.get("bounds")
    return None


def bounds_center(bounds: str) -> tuple[int, int]:
    left_top, right_bottom = bounds.split("][")
    x1, y1 = left_top.lstrip("[").split(",")
    x2, y2 = right_bottom.rstrip("]").split(",")
    return (int(x1) + int(x2)) // 2, (int(y1) + int(y2)) // 2


def tap_text_if_present(adb_path: str, root: ET.Element, text: str) -> bool:
    bounds = find_first_text_bounds(root, text)
    if not bounds:
        return False
    x, y = bounds_center(bounds)
    adb(adb_path, "shell", "input", "tap", str(x), str(y))
    return True


def is_taxi_ready(root: ET.Element) -> bool:
    texts = root_texts(root)
    joined = "\n".join(texts)
    return "你要去哪儿" in joined and "上车" in joined


def settle_taxi_front(adb_path: str, run_dir: Path, force_reopen: bool) -> ET.Element:
    reopened = False
    if force_reopen:
        bootstrap_dir = run_dir / "bootstrap_taxi"
        bootstrap_dir.mkdir(parents=True, exist_ok=True)
        open_amap_taxi(adb_path, bootstrap_dir)
        reopened = True

    for attempt in range(5):
        root = dump_ui(adb_path, run_dir / f"settle_{attempt:02d}.xml")
        screenshot(adb_path, run_dir / f"settle_{attempt:02d}.png")
        texts = root_texts(root)
        if any("安装“华为帐号”完整版后即可使用此功能" in text for text in texts):
            if tap_text_if_present(adb_path, root, "取消"):
                sleep_s(2)
                continue
        if is_taxi_ready(root):
            return root
        if not reopened:
            bootstrap_dir = run_dir / "bootstrap_taxi"
            bootstrap_dir.mkdir(parents=True, exist_ok=True)
            open_amap_taxi(adb_path, bootstrap_dir)
            reopened = True
            sleep_s(2)
            continue
        adb(adb_path, "shell", "input", "keyevent", "4")
        sleep_s(2)

    raise RuntimeError("failed to reach stable amap taxi pickup page")


def run_reference_search(
    target_image_path: Path,
    reference_mosaic_path: Path,
    profile_json_path: Path,
    tip_xy: tuple[float, float],
    tile_origin_xy: tuple[int, int],
    zoom: int,
    window_heights: list[int],
    step_px: int,
    top_k: int,
    feature: str,
    out_json: Path,
    overlay_out: Path,
) -> dict[str, object]:
    profile = json.loads(profile_json_path.read_text(encoding="utf-8"))
    target_image = reg.load_image(target_image_path)
    reference_image = reg.load_image(reference_mosaic_path)

    target_map_roi = tuple(profile["map_roi_xyxy"])
    exclude_rois_local = []
    for roi in profile.get("exclude_rois_xyxy", []):
        x1, y1, x2, y2 = roi
        exclude_rois_local.append((x1 - target_map_roi[0], y1 - target_map_roi[1], x2 - target_map_roi[0], y2 - target_map_roi[1]))

    target_roi, target_edges = preprocess_target(target_image, target_map_roi, exclude_rois_local)
    target_mask = reg.build_mask(target_edges.shape, exclude_rois_local)
    target_tip_roi_xy = reg.to_roi_local(tip_xy, target_map_roi)

    aspect = target_roi.shape[1] / target_roi.shape[0]
    candidates = search_windows(
        target_edges=target_edges,
        target_mask=target_mask,
        reference_image=reference_image,
        window_heights=window_heights,
        aspect=aspect,
        step_px=step_px,
        top_k=top_k,
    )

    evals: list[dict[str, object]] = []
    for candidate in candidates:
        evaluated = evaluate_candidate(
            target_roi=target_roi,
            target_mask=target_mask,
            reference_image=reference_image,
            candidate=candidate,
            target_tip_roi_xy=target_tip_roi_xy,
            feature=feature,
        )
        if evaluated is None:
            continue
        if "projected_tip_mosaic_xy" in evaluated:
            lon, lat = mosaic_pixel_to_lonlat(
                mosaic_xy=tuple(evaluated["projected_tip_mosaic_xy"]),  # type: ignore[arg-type]
                tile_origin_xy=tile_origin_xy,
                z=zoom,
            )
            evaluated["projected_tip_lonlat"] = [lon, lat]
        evals.append(evaluated)

    evals.sort(key=lambda item: (item["inlier_count"], item["inlier_ratio"], item["corr_score"]), reverse=True)
    result: dict[str, object] = {
        "method": "reference_window_search",
        "feature": feature,
        "reference_mosaic": str(reference_mosaic_path),
        "zoom": zoom,
        "tile_origin_xy": [tile_origin_xy[0], tile_origin_xy[1]],
        "target_tip_full_xy": [tip_xy[0], tip_xy[1]],
        "candidate_count": len(candidates),
        "evaluated_count": len(evals),
        "best": evals[0] if evals else None,
        "top_results": evals[:8],
    }

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(to_jsonable(result), ensure_ascii=False, indent=2), encoding="utf-8")

    if evals:
        best_window = evals[0]["candidate_window_xywh"]
        candidate = Candidate(
            x=int(best_window[0]),
            y=int(best_window[1]),
            w=int(best_window[2]),
            h=int(best_window[3]),
            corr_score=float(evals[0]["corr_score"]),
        )
        projected_tip = tuple(evals[0].get("projected_tip_mosaic_xy")) if evals[0].get("projected_tip_mosaic_xy") else None
        draw_best_overlay(target_roi, reference_image, candidate, projected_tip, overlay_out)

    return result


def lonlat_distance_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lon1, lat1 = a
    lon2, lat2 = b
    mean_lat = math.radians((lat1 + lat2) / 2.0)
    dx = (lon2 - lon1) * 111320.0 * math.cos(mean_lat)
    dy = (lat2 - lat1) * 110540.0
    return math.hypot(dx, dy)


def build_consensus(items: list[dict[str, object]], threshold_m: float = 30.0) -> dict[str, object] | None:
    if not items:
        return None
    clusters: list[dict[str, object]] = []
    for item in sorted(items, key=lambda row: (int(row["inlier_count"]), float(row["inlier_ratio"])), reverse=True):
        placed = False
        point = (float(item["lon"]), float(item["lat"]))
        for cluster in clusters:
            center = (float(cluster["lon"]), float(cluster["lat"]))
            if lonlat_distance_m(point, center) <= threshold_m:
                weight = int(item["inlier_count"])
                total_weight = int(cluster["weight"]) + weight
                cluster["lon"] = (float(cluster["lon"]) * int(cluster["weight"]) + float(item["lon"]) * weight) / total_weight
                cluster["lat"] = (float(cluster["lat"]) * int(cluster["weight"]) + float(item["lat"]) * weight) / total_weight
                cluster["weight"] = total_weight
                cluster["members"].append(item)
                placed = True
                break
        if not placed:
            clusters.append(
                {
                    "lon": float(item["lon"]),
                    "lat": float(item["lat"]),
                    "weight": int(item["inlier_count"]),
                    "members": [item],
                }
            )

    clusters.sort(key=lambda cluster: (len(cluster["members"]), int(cluster["weight"])), reverse=True)
    best = clusters[0]
    return {
        "cluster_threshold_m": threshold_m,
        "cluster_count": len(clusters),
        "best_cluster": {
            "member_count": len(best["members"]),
            "weighted_lon": best["lon"],
            "weighted_lat": best["lat"],
            "total_inlier_weight": best["weight"],
            "members": best["members"],
        },
        "all_clusters": [
            {
                "member_count": len(cluster["members"]),
                "weighted_lon": cluster["lon"],
                "weighted_lat": cluster["lat"],
                "total_inlier_weight": cluster["weight"],
            }
            for cluster in clusters
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Repeat live AMap S2 experiments on device.")
    parser.add_argument("--adb", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--group-id", required=True)
    parser.add_argument("--reopen-each-run", action="store_true")
    parser.add_argument("--sleep-between", type=float, default=2.0)
    parser.add_argument(
        "--profile-json",
        default="modules/t01_pickup_point_validation/reference_registration/profiles/amap_taxi_portrait_v1.json",
    )
    parser.add_argument(
        "--reference-mosaic",
        default="outputs/_work/20260328_t01_map_registration_validation/real_tiles/mosaic_z17_style7.png",
    )
    parser.add_argument("--tile-origin-xy", default="107921,49600")
    parser.add_argument("--zoom", type=int, default=17)
    parser.add_argument("--window-heights", default="500,540,580")
    parser.add_argument("--step-px", type=int, default=16)
    parser.add_argument("--top-k", type=int, default=30)
    parser.add_argument("--feature", default="sift", choices=["akaze", "sift"])
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    profile_json_path = Path(args.profile_json)
    reference_mosaic_path = Path(args.reference_mosaic)
    tile_origin_xy = parse_xy(args.tile_origin_xy)
    window_heights = [int(item.strip()) for item in args.window_heights.split(",") if item.strip()]

    run_summaries: list[dict[str, object]] = []
    consensus_items: list[dict[str, object]] = []
    for run_index in range(1, args.runs + 1):
        run_dir = out_dir / f"{args.group_id}_run{run_index:02d}"
        run_dir.mkdir(parents=True, exist_ok=True)
        root = settle_taxi_front(args.adb, run_dir, force_reopen=args.reopen_each_run)
        texts = root_texts(root)

        screen_path = run_dir / "front.png"
        xml_path = run_dir / "front.xml"
        screenshot(args.adb, screen_path)
        root = dump_ui(args.adb, xml_path)
        texts = root_texts(root)

        image = load_image(screen_path)
        page_variant = classify_taxi_page_variant(texts)
        tip_result = detect_blue_pickup_pin(image, page_variant=page_variant)
        tip_result["image"] = str(screen_path)
        tip_result["profile"] = "blue_pickup_pin"
        tip_result["page_variant"] = page_variant
        (run_dir / "tip.json").write_text(json.dumps(tip_result, ensure_ascii=False, indent=2), encoding="utf-8")
        cv2.imwrite(str(run_dir / "tip_annotated.png"), annotate(image, tip_result))

        run_summary: dict[str, object] = {
            "run_id": f"{args.group_id}_run{run_index:02d}",
            "page_ready": is_taxi_ready(root),
            "page_variant": page_variant,
            "key_texts": texts[:40],
            "tip_status": tip_result.get("status"),
            "tip_xy": [tip_result.get("tip_x"), tip_result.get("tip_y")] if tip_result.get("status") == "FOUND" else None,
        }

        if tip_result.get("status") == "FOUND":
            tip_xy = (float(tip_result["tip_x"]), float(tip_result["tip_y"]))
            registration_result = run_reference_search(
                target_image_path=screen_path,
                reference_mosaic_path=reference_mosaic_path,
                profile_json_path=profile_json_path,
                tip_xy=tip_xy,
                tile_origin_xy=tile_origin_xy,
                zoom=args.zoom,
                window_heights=window_heights,
                step_px=args.step_px,
                top_k=args.top_k,
                feature=args.feature,
                out_json=run_dir / "registration.json",
                overlay_out=run_dir / "registration_overlay.png",
            )
            run_summary["registration_best"] = registration_result.get("best")
            best = registration_result.get("best")
            if isinstance(best, dict) and "projected_tip_lonlat" in best:
                lon, lat = best["projected_tip_lonlat"]
                consensus_items.append(
                    {
                        "run_id": run_summary["run_id"],
                        "lon": float(lon),
                        "lat": float(lat),
                        "inlier_count": int(best["inlier_count"]),
                        "inlier_ratio": float(best["inlier_ratio"]),
                        "match_count": int(best["match_count"]),
                        "tip_x": tip_xy[0],
                        "tip_y": tip_xy[1],
                        "page_variant": page_variant,
                    }
                )
        run_summaries.append(run_summary)
        if run_index < args.runs:
            sleep_s(args.sleep_between)

    consensus = build_consensus(consensus_items)
    summary = {
        "group_id": args.group_id,
        "runs": run_summaries,
        "consensus": consensus,
    }
    (out_dir / f"{args.group_id}_summary.json").write_text(
        json.dumps(to_jsonable(summary), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(to_jsonable(summary), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
