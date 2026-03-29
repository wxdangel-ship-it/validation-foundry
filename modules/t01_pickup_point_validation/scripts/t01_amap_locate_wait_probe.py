from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from t01_amap_batch import ensure_hwid_disabled, screenshot, start_mock  # noqa: E402


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def adb(adb_path: str, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run([adb_path, *args], check=check)


def sleep_s(seconds: float) -> None:
    time.sleep(seconds)


def dump_compressed(adb_path: str, xml_path: Path) -> ET.Element:
    remote = "/sdcard/__codex_amap_compressed.xml"
    adb(adb_path, "shell", "uiautomator", "dump", "--compressed", remote)
    content = adb(adb_path, "shell", "cat", remote).stdout
    xml_path.write_text(content, encoding="utf-8")
    return ET.fromstring(content)


def capture(adb_path: str, out_dir: Path, label: str) -> ET.Element:
    xml_path = out_dir / f"{label}.xml"
    png_path = out_dir / f"{label}.png"
    txt_path = out_dir / f"{label}_clickables.json"
    root = dump_compressed(adb_path, xml_path)
    screenshot(adb_path, png_path)
    rows = []
    for node in root.iter("node"):
        if node.attrib.get("clickable") != "true":
            continue
        rows.append(
            {
                "text": node.attrib.get("text", ""),
                "desc": node.attrib.get("content-desc", ""),
                "resource_id": node.attrib.get("resource-id", ""),
                "bounds": node.attrib.get("bounds", ""),
                "class": node.attrib.get("class", ""),
            }
        )
    txt_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    return root


def tap(adb_path: str, x: int, y: int, delay_s: float = 4.0) -> None:
    adb(adb_path, "shell", "input", "tap", str(x), str(y))
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

    adb(args.adb, "shell", "am", "force-stop", "com.autonavi.minimap")
    sleep_s(1)
    adb(args.adb, "shell", "am", "start", "-n", "com.autonavi.minimap/com.autonavi.map.activity.SplashActivity")
    sleep_s(8)
    capture(args.adb, out_dir, "step00_home")

    # Taxi entry from previous stable runs.
    tap(args.adb, 720, 1520, 8.0)
    capture(args.adb, out_dir, "step01_taxi_initial")

    # Right-side floating buttons observed on the taxi page.
    candidates = [
        ("step02_tap_right_upper", 973, 708),
        ("step03_tap_right_mid", 974, 890),
        ("step04_tap_right_lower", 1032, 1040),
    ]
    for label, x, y in candidates:
        tap(args.adb, x, y, 2.0)
        capture(args.adb, out_dir, label)
        sleep_s(3.5)
        capture(args.adb, out_dir, f"{label}_wait3p5s")

    location_dump = adb(args.adb, "shell", "dumpsys", "location").stdout
    (out_dir / "final_dumpsys_location.txt").write_text(location_dump, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
