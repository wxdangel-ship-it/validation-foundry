from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2

import t01_amap_tip_locator as tip_locator
from t01_local_frame_solver import fit_axis_aligned, solve_tip


def load_site(path: str | Path) -> dict[str, object]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def build_anchor_rows(site: dict[str, object]) -> list[dict[str, float]]:
    raw_anchors = site.get("anchors")
    if not isinstance(raw_anchors, list) or len(raw_anchors) < 2:
        raise ValueError("site must contain at least 2 anchors")

    rows: list[dict[str, float]] = []
    for anchor in raw_anchors:
        tip_px = anchor["tip_px"]
        rows.append(
            {
                "name": anchor["anchor_id"],
                "lon": float(anchor["lon"]),
                "lat": float(anchor["lat"]),
                "tip_x": float(tip_px[0]),
                "tip_y": float(tip_px[1]),
            }
        )
    return rows


def find_target(site: dict[str, object], target_id: str | None) -> dict[str, object]:
    targets = site.get("targets")
    if not isinstance(targets, list) or not targets:
        raise ValueError("site must contain at least one target")

    if target_id is None:
        return targets[0]

    for target in targets:
        if target.get("target_id") == target_id:
            return target
    raise ValueError(f"target_id not found: {target_id}")


def detect_tip(profile: str, image_path: Path) -> dict[str, object]:
    image = tip_locator.load_image(image_path)
    if profile == "red_pin":
        return tip_locator.detect_red_pin(image)
    if profile == "taxi_my_location":
        reference_image = tip_locator.load_image(tip_locator.DEFAULT_REFERENCE_IMAGE)
        return tip_locator.match_taxi_my_location(
            image=image,
            reference_image=reference_image,
            template_xyxy=tip_locator.parse_xyxy("380,500,630,720"),
            tip_offset_xy=tip_locator.parse_xy("159,181"),
            search_xyxy=tip_locator.parse_xyxy("250,350,850,950"),
        )
    raise ValueError(f"unsupported profile: {profile}")


def annotate_and_save(image_path: Path, result: dict[str, object], out_path: Path) -> None:
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    annotated = tip_locator.annotate(image, result)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_path), annotated)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run anchor-library-based local solve on a site target.")
    parser.add_argument("--site-json", required=True)
    parser.add_argument("--target-id")
    parser.add_argument("--image", help="override target image path")
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--annotated-out")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    site = load_site(args.site_json)
    target = find_target(site, args.target_id)
    image_path = Path(args.image) if args.image else Path(target["image"])

    tip_result = detect_tip(str(site["tip_profile"]), image_path)
    if tip_result.get("status") != "FOUND":
        raise RuntimeError(f"tip detection failed: {tip_result}")

    anchors = build_anchor_rows(site)
    transform = fit_axis_aligned(anchors)
    solved = solve_tip(transform, float(tip_result["tip_x"]), float(tip_result["tip_y"]))

    result = {
        "site_id": site["site_id"],
        "provider": site["provider"],
        "site_name": site["site_name"],
        "target_id": target.get("target_id"),
        "target_name": target.get("name"),
        "tip_profile": site["tip_profile"],
        "tip_result": tip_result,
        "transform": transform,
        "anchors": anchors,
        "output_x": solved["output_x"],
        "output_y": solved["output_y"],
    }

    expected_x = target.get("expected_output_x")
    expected_y = target.get("expected_output_y")
    if expected_x is not None and expected_y is not None:
        result["expected_output_x"] = float(expected_x)
        result["expected_output_y"] = float(expected_y)
        result["delta_x"] = float(solved["output_x"] - float(expected_x))
        result["delta_y"] = float(solved["output_y"] - float(expected_y))

    out_path = Path(args.out_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.annotated_out:
        annotate_and_save(image_path, tip_result, Path(args.annotated_out))

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
