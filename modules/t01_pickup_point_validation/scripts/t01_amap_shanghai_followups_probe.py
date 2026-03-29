from __future__ import annotations

import argparse
import json
import time
import xml.etree.ElementTree as ET
from pathlib import Path

from t01_amap_batch import (
    AMAP_PACKAGE,
    MOCK_COMPONENT,
    adb,
    dump_ui,
    ensure_hwid_disabled,
    find_nodes,
    open_amap_taxi,
    screenshot,
    tap_bounds,
)


def sleep_s(seconds: float) -> None:
    time.sleep(seconds)


def capture(adb_path: str, out_dir: Path, label: str) -> ET.Element:
    xml_path = out_dir / f"{label}.xml"
    png_path = out_dir / f"{label}.png"
    root = dump_ui(adb_path, xml_path)
    screenshot(adb_path, png_path)
    texts: list[dict[str, str]] = []
    for node in root.iter("node"):
        text = (node.attrib.get("text") or "").strip()
        desc = (node.attrib.get("content-desc") or "").strip()
        if not text and not desc:
            continue
        texts.append(
            {
                "text": text,
                "desc": desc,
                "bounds": node.attrib.get("bounds", ""),
                "class": node.attrib.get("class", ""),
                "resource_id": node.attrib.get("resource-id", ""),
            }
        )
    (out_dir / f"{label}_texts.json").write_text(
        json.dumps(texts, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return root


def tap(adb_path: str, x: int, y: int, label: str, out_dir: Path, delay_s: float = 4.0) -> None:
    adb(adb_path, "shell", "input", "tap", str(x), str(y))
    sleep_s(delay_s)
    capture(adb_path, out_dir, label)


def long_press(
    adb_path: str,
    x: int,
    y: int,
    label: str,
    out_dir: Path,
    duration_ms: int = 900,
    delay_s: float = 4.0,
) -> None:
    adb(
        adb_path,
        "shell",
        "input",
        "swipe",
        str(x),
        str(y),
        str(x),
        str(y),
        str(duration_ms),
    )
    sleep_s(delay_s)
    capture(adb_path, out_dir, label)


def back(adb_path: str, label: str, out_dir: Path, delay_s: float = 3.0) -> None:
    adb(adb_path, "shell", "input", "keyevent", "4")
    sleep_s(delay_s)
    capture(adb_path, out_dir, label)


def clear_amap_state(adb_path: str, out_dir: Path) -> None:
    result = adb(adb_path, "shell", "pm", "clear", AMAP_PACKAGE).stdout
    (out_dir / "amap_pm_clear.txt").write_text(result, encoding="utf-8")
    sleep_s(2)


def start_mock_manual(adb_path: str, lat: str, lng: str, out_dir: Path) -> tuple[bool, str]:
    adb(adb_path, "shell", "am", "force-stop", "com.lilstiffy.mockgps")
    sleep_s(1)

    root: ET.Element | None = None
    for attempt in range(3):
        adb(
            adb_path,
            "shell",
            "am",
            "start",
            "-W",
            "-n",
            MOCK_COMPONENT,
            "--es",
            "lat",
            lat,
            "--es",
            "lng",
            lng,
        )
        sleep_s(2)
        root = capture(adb_path, out_dir, f"mock_launch_{attempt}")
        packages = {node.attrib.get("package", "") for node in root.iter("node")}
        texts = {node.attrib.get("text", "") for node in root.iter("node")}
        if "com.lilstiffy.mockgps" in packages or "Start mocking" in texts or "Stop mocking" in texts:
            break
        adb(adb_path, "shell", "monkey", "-p", "com.lilstiffy.mockgps", "-c", "android.intent.category.LAUNCHER", "1")
        sleep_s(2)
    if root is None:
        return False, "mockgps_launch_failed"

    start_nodes = find_nodes(root, "Start mocking")
    if start_nodes:
        tap_bounds(adb_path, start_nodes[0].attrib["bounds"])
        sleep_s(3)
        root = capture(adb_path, out_dir, "mock_after_start")

    texts = {node.attrib.get("text", "") for node in root.iter("node")}
    if "Stop mocking" not in texts:
        return False, "mockgps_not_started"

    location_dump = adb(adb_path, "shell", "dumpsys", "location").stdout
    (out_dir / "location_after_mock.txt").write_text(location_dump, encoding="utf-8")
    return True, "mockgps_started"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--lat", required=True)
    parser.add_argument("--lng", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--skip-clear-amap", action="store_true")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ensure_hwid_disabled(args.adb)
    if not args.skip_clear_amap:
        clear_amap_state(args.adb, out_dir)

    mock_dir = out_dir / "mock"
    mock_dir.mkdir(parents=True, exist_ok=True)
    mock_ok, mock_reason = start_mock_manual(args.adb, args.lat, args.lng, mock_dir)
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

    # Candidate interactive surfaces on the taxi page:
    # - pickup address row above the input box
    # - bubble itself
    # - bubble's right chevron area
    # - floating route button on the right
    # - long-press on the bubble / tip area
    tap(args.adb, 360, 1275, "step01_tap_pickup_row_left", out_dir)
    back(args.adb, "step01b_back_after_pickup_row_left", out_dir)

    tap(args.adb, 860, 1275, "step02_tap_pickup_row_right", out_dir)
    back(args.adb, "step02b_back_after_pickup_row_right", out_dir)

    tap(args.adb, 460, 545, "step03_tap_bubble_center", out_dir)
    back(args.adb, "step03b_back_after_bubble_center", out_dir)

    tap(args.adb, 720, 545, "step04_tap_bubble_arrow", out_dir)
    back(args.adb, "step04b_back_after_bubble_arrow", out_dir)

    tap(args.adb, 1005, 1090, "step05_tap_route_button", out_dir)
    back(args.adb, "step05b_back_after_route_button", out_dir)

    long_press(args.adb, 540, 680, "step06_longpress_tip_area", out_dir)
    back(args.adb, "step06b_back_after_longpress_tip_area", out_dir)

    long_press(args.adb, 460, 545, "step07_longpress_bubble_center", out_dir)
    back(args.adb, "step07b_back_after_longpress_bubble_center", out_dir)

    location_dump = adb(args.adb, "shell", "dumpsys", "location").stdout
    (out_dir / "final_dumpsys_location.txt").write_text(location_dump, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
