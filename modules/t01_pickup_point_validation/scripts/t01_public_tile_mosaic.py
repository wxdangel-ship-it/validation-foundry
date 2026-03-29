from __future__ import annotations

import argparse
import json
import math
import time
from pathlib import Path

import cv2
import numpy as np
import requests


DEFAULT_URL_TEMPLATE = "http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"


def lonlat_to_tile_xy(lon: float, lat: float, z: int) -> tuple[float, float]:
    scale = 2**z
    tile_x = (lon + 180.0) / 360.0 * scale
    lat_rad = math.radians(lat)
    tile_y = (1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi) / 2.0 * scale
    return tile_x, tile_y


def fetch_tile(url: str, timeout_sec: float, retries: int) -> np.ndarray:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            resp = requests.get(url, timeout=timeout_sec, headers={"User-Agent": "validation-foundry/1.0"})
            resp.raise_for_status()
            data = resp.content
            image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError(f"failed to decode tile: {url}")
            return image
        except Exception as exc:  # pragma: no cover - network retry path
            last_error = exc
            if attempt + 1 >= retries:
                break
            time.sleep(1.0 + attempt)
    raise RuntimeError(f"tile fetch failed after {retries} attempts: {url} :: {last_error}")


def parse_xy(raw: str) -> tuple[int, int]:
    parts = [int(part.strip()) for part in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"xy requires 2 integers, got: {raw!r}")
    return parts[0], parts[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch public appmaptile tiles and build a mosaic.")
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--zoom", type=int, required=True)
    parser.add_argument("--cols", type=int, default=6)
    parser.add_argument("--rows", type=int, default=6)
    parser.add_argument("--url-template", default=DEFAULT_URL_TEMPLATE)
    parser.add_argument("--timeout-sec", type=float, default=10.0)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--tile-origin-xy", help="top-left tile origin x,y")
    parser.add_argument("--center-lon", type=float, help="center longitude if tile-origin-xy is omitted")
    parser.add_argument("--center-lat", type=float, help="center latitude if tile-origin-xy is omitted")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.tile_origin_xy:
        origin_x, origin_y = parse_xy(args.tile_origin_xy)
        center_tile_xy: tuple[float, float] | None = None
    else:
        if args.center_lon is None or args.center_lat is None:
            raise ValueError("either tile-origin-xy or center-lon/center-lat is required")
        tile_x, tile_y = lonlat_to_tile_xy(args.center_lon, args.center_lat, args.zoom)
        origin_x = int(math.floor(tile_x - args.cols / 2.0))
        origin_y = int(math.floor(tile_y - args.rows / 2.0))
        center_tile_xy = (tile_x, tile_y)

    tiles_dir = out_dir / "tiles"
    tiles_dir.mkdir(parents=True, exist_ok=True)

    rows: list[np.ndarray] = []
    fetched: list[dict[str, object]] = []
    tile_size: int | None = None
    for row_idx in range(args.rows):
        row_tiles: list[np.ndarray] = []
        for col_idx in range(args.cols):
            tile_x = origin_x + col_idx
            tile_y = origin_y + row_idx
            url = args.url_template.format(x=tile_x, y=tile_y, z=args.zoom)
            tile_path = tiles_dir / f"z{args.zoom}_x{tile_x}_y{tile_y}.png"
            if tile_path.exists():
                tile = cv2.imread(str(tile_path), cv2.IMREAD_COLOR)
                if tile is None:
                    raise ValueError(f"failed to re-read cached tile: {tile_path}")
            else:
                tile = fetch_tile(url, timeout_sec=args.timeout_sec, retries=args.retries)
                cv2.imwrite(str(tile_path), tile)
            if tile_size is None:
                tile_size = int(tile.shape[0])
            row_tiles.append(tile)
            fetched.append(
                {
                    "x": tile_x,
                    "y": tile_y,
                    "z": args.zoom,
                    "url": url,
                    "path": str(tile_path),
                }
            )
        rows.append(np.hstack(row_tiles))

    mosaic = np.vstack(rows)
    mosaic_path = out_dir / f"mosaic_z{args.zoom}.png"
    cv2.imwrite(str(mosaic_path), mosaic)

    manifest = {
        "url_template": args.url_template,
        "zoom": args.zoom,
        "cols": args.cols,
        "rows": args.rows,
        "tile_origin_xy": [origin_x, origin_y],
        "tile_size": tile_size,
        "mosaic_path": str(mosaic_path),
        "center_tile_xy": list(center_tile_xy) if center_tile_xy else None,
        "fetched_tiles": fetched,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
