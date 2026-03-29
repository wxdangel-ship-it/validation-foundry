from __future__ import annotations

import argparse
import json
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from t01_amap_batch import (  # noqa: E402
    adb,
    dump_ui,
    ensure_hwid_disabled,
    open_amap_taxi,
    screenshot,
    start_mock,
)


def sleep_s(seconds: float) -> None:
    time.sleep(seconds)


def visible_texts(root: ET.Element) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for node in root.iter("node"):
        text = (node.attrib.get("text") or "").strip()
        desc = (node.attrib.get("content-desc") or "").strip()
        rid = (node.attrib.get("resource-id") or "").strip()
        if not text and not desc:
            continue
        rows.append(
            {
                "text": text,
                "desc": desc,
                "resource_id": rid,
                "bounds": node.attrib.get("bounds", ""),
                "class": node.attrib.get("class", ""),
            }
        )
    return rows


def capture(adb_path: str, out_dir: Path, label: str) -> ET.Element:
    xml_path = out_dir / f"{label}.xml"
    png_path = out_dir / f"{label}.png"
    txt_path = out_dir / f"{label}_texts.json"
    root = dump_ui(adb_path, xml_path)
    screenshot(adb_path, png_path)
    txt_path.write_text(
        json.dumps(visible_texts(root), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return root


def tap(adb_path: str, x: int, y: int, delay_s: float = 4.0) -> None:
    adb(adb_path, "shell", "input", "tap", str(x), str(y))
    sleep_s(delay_s)


def swipe(adb_path: str, x1: int, y1: int, x2: int, y2: int, duration_ms: int = 500, delay_s: float = 4.0) -> None:
    adb(
        adb_path,
        "shell",
        "input",
        "swipe",
        str(x1),
        str(y1),
        str(x2),
        str(y2),
        str(duration_ms),
    )
    sleep_s(delay_s)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--lat", required=True)
    parser.add_argument("--lng", required=True)
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ensure_hwid_disabled(args.adb)

    mock_dir = out_dir / "mock"
    mock_dir.mkdir(parents=True, exist_ok=True)
    mock_ok, mock_reason = start_mock(args.adb, args.lat, args.lng, mock_dir)
    (out_dir / "mock_status.json").write_text(
        json.dumps({"ok": mock_ok, "reason": mock_reason}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if not mock_ok:
        return 1

    bootstrap_dir = out_dir / "bootstrap"
    bootstrap_dir.mkdir(parents=True, exist_ok=True)
    open_amap_taxi(args.adb, bootstrap_dir)
    capture(args.adb, out_dir, "step00_taxi_initial")

    # Try dragging the map itself.
    swipe(args.adb, 540, 950, 540, 650, 600)
    capture(args.adb, out_dir, "step01_map_drag_up")

    swipe(args.adb, 540, 650, 540, 980, 600)
    capture(args.adb, out_dir, "step02_map_drag_down")

    swipe(args.adb, 740, 760, 340, 760, 600)
    capture(args.adb, out_dir, "step03_map_drag_left")

    # Tap the pickup row and map center/bubble areas that may enter a confirm state.
    tap(args.adb, 280, 1335)
    capture(args.adb, out_dir, "step04_tap_pickup_row")

    tap(args.adb, 540, 590)
    capture(args.adb, out_dir, "step05_tap_bubble_area")

    tap(args.adb, 540, 770)
    capture(args.adb, out_dir, "step06_tap_map_center")

    # Lift the sheet slightly in case the explicit point is hidden behind taxi options.
    swipe(args.adb, 540, 1540, 540, 1370, 450)
    capture(args.adb, out_dir, "step07_sheet_drag_up")

    swipe(args.adb, 540, 1370, 540, 1600, 450)
    capture(args.adb, out_dir, "step08_sheet_drag_down")

    location_dump = adb(args.adb, "shell", "dumpsys", "location").stdout
    (out_dir / "final_dumpsys_location.txt").write_text(location_dump, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
