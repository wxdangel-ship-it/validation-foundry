from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np


def parse_xy(raw: str) -> tuple[float, float]:
    parts = [float(part.strip()) for part in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"xy requires 2 numbers, got: {raw!r}")
    return parts[0], parts[1]


def fit_axis_aligned(anchors: list[dict[str, float]]) -> dict[str, dict[str, float]]:
    if len(anchors) < 2:
        raise ValueError("axis-aligned solver requires at least 2 anchors")

    xs = np.array([anchor["tip_x"] for anchor in anchors], dtype=float)
    ys = np.array([anchor["tip_y"] for anchor in anchors], dtype=float)
    lons = np.array([anchor["lon"] for anchor in anchors], dtype=float)
    lats = np.array([anchor["lat"] for anchor in anchors], dtype=float)

    a_lon, b_lon = np.polyfit(xs, lons, 1)
    a_lat, b_lat = np.polyfit(ys, lats, 1)
    return {
        "lon": {"a": float(a_lon), "b": float(b_lon)},
        "lat": {"a": float(a_lat), "b": float(b_lat)},
    }


def solve_tip(transform: dict[str, dict[str, float]], tip_x: float, tip_y: float) -> dict[str, float]:
    lon = transform["lon"]["a"] * tip_x + transform["lon"]["b"]
    lat = transform["lat"]["a"] * tip_y + transform["lat"]["b"]
    return {"output_x": float(lon), "output_y": float(lat)}


def parse_anchors_json(path: Path) -> list[dict[str, float]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    anchors = payload.get("anchors")
    if not isinstance(anchors, dict):
        raise ValueError("expected top-level 'anchors' object")

    rows: list[dict[str, float]] = []
    for name, anchor in anchors.items():
        tip_px = anchor.get("tip_px")
        if not isinstance(tip_px, list) or len(tip_px) != 2:
            raise ValueError(f"anchor {name!r} missing tip_px")
        rows.append(
            {
                "name": name,
                "lon": float(anchor["lon"]),
                "lat": float(anchor["lat"]),
                "tip_x": float(tip_px[0]),
                "tip_y": float(tip_px[1]),
            }
        )
    return rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Solve GCJ-02 from local same-view anchors and tip pixels.")
    parser.add_argument("--anchors-json", help="JSON file containing top-level anchors object")
    parser.add_argument("--tip-xy", required=True, help="target tip pixel, x,y")
    parser.add_argument("--out-json", help="write result to JSON")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.anchors_json:
        raise ValueError("--anchors-json is required")

    anchors = parse_anchors_json(Path(args.anchors_json))
    transform = fit_axis_aligned(anchors)
    tip_x, tip_y = parse_xy(args.tip_xy)
    result = {
        "method": "axis_aligned_same_view",
        "anchor_count": len(anchors),
        "anchors": anchors,
        "transform": transform,
        "target_tip_xy": [tip_x, tip_y],
    }
    result.update(solve_tip(transform, tip_x, tip_y))

    if args.out_json:
        out_path = Path(args.out_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
