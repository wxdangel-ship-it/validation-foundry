from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path


MOCK_COMPONENT = "com.lilstiffy.mockgps/.MainActivity"
AMAP_PACKAGE = "com.autonavi.minimap"
HWID_PACKAGE = "com.huawei.hwid"


def run(cmd: list[str], check: bool = True, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=capture_output)


def adb(adb_path: str, *args: str, check: bool = True, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    return run([adb_path, *args], check=check, capture_output=capture_output)


def sleep_s(seconds: float) -> None:
    time.sleep(seconds)


def dump_ui(adb_path: str, xml_path: Path) -> ET.Element:
    remote = "/sdcard/__codex_t01_dump.xml"
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            adb(adb_path, "shell", "uiautomator", "dump", remote)
            content = adb(adb_path, "shell", "cat", remote).stdout
            xml_path.write_text(content, encoding="utf-8")
            return ET.fromstring(content)
        except Exception as exc:  # pragma: no cover - device-side retry path
            last_error = exc
            sleep_s(2 + attempt)
    raise RuntimeError(f"uiautomator dump failed after retries: {last_error}")


def screenshot(adb_path: str, image_path: Path) -> None:
    with image_path.open("wb") as fh:
        proc = subprocess.run([adb_path, "exec-out", "screencap", "-p"], check=True, stdout=fh)
        if proc.returncode != 0:
            raise RuntimeError("screencap failed")


def bounds_center(bounds: str) -> tuple[int, int]:
    bounds = bounds.strip()
    left_top, right_bottom = bounds.split("][")
    x1, y1 = left_top.lstrip("[").split(",")
    x2, y2 = right_bottom.rstrip("]").split(",")
    return (int(x1) + int(x2)) // 2, (int(y1) + int(y2)) // 2


def find_nodes(root: ET.Element, text: str) -> list[ET.Element]:
    return [node for node in root.iter("node") if node.attrib.get("text") == text]


def tap_bounds(adb_path: str, bounds: str) -> None:
    x, y = bounds_center(bounds)
    adb(adb_path, "shell", "input", "tap", str(x), str(y))


def maybe_tap_text(adb_path: str, evidence_dir: Path, text: str, label: str) -> bool:
    root = dump_ui(adb_path, evidence_dir / f"{label}.xml")
    screenshot(adb_path, evidence_dir / f"{label}.png")
    nodes = find_nodes(root, text)
    if not nodes:
        return False
    tap_bounds(adb_path, nodes[0].attrib["bounds"])
    return True


def dismiss_first_run_and_permissions(adb_path: str, evidence_dir: Path) -> None:
    # First-run privacy gate.
    if maybe_tap_text(adb_path, evidence_dir, "同意并继续", "amap_first_run_prompt"):
        sleep_s(3)

    # Common location permission variants on Huawei / Android 10.
    for text, label in [
        ("始终允许", "amap_perm_always"),
        ("仅使用期间允许", "amap_perm_foreground_period"),
        ("仅在使用中允许", "amap_perm_foreground"),
        ("允许", "amap_perm_allow"),
    ]:
        if maybe_tap_text(adb_path, evidence_dir, text, label):
            sleep_s(2)


def ensure_hwid_disabled(adb_path: str) -> None:
    adb(adb_path, "shell", "pm", "disable-user", "--user", "0", HWID_PACKAGE)


def start_mock(adb_path: str, lat: str, lng: str, evidence_dir: Path) -> tuple[bool, str]:
    adb(adb_path, "shell", "am", "force-stop", "com.lilstiffy.mockgps")
    sleep_s(1)
    root: ET.Element | None = None
    for attempt in range(2):
        adb(
            adb_path,
            "shell",
            "am",
            "start",
            "-n",
            MOCK_COMPONENT,
            "--es",
            "lat",
            lat,
            "--es",
            "lng",
            lng,
        )
        sleep_s(3 + attempt)

        xml_path = evidence_dir / "mockgps_initial.xml"
        root = dump_ui(adb_path, xml_path)
        screenshot(adb_path, evidence_dir / "mockgps_initial.png")
        package_names = {node.attrib.get("package", "") for node in root.iter("node")}
        texts = {node.attrib.get("text", "") for node in root.iter("node")}
        if "com.lilstiffy.mockgps" in package_names or "Start mocking" in texts or "Stop mocking" in texts:
            break
    if root is None:
        return False, "mockgps_launch_failed"

    cancel_nodes = find_nodes(root, "取消")
    if cancel_nodes:
        tap_bounds(adb_path, cancel_nodes[0].attrib["bounds"])
        sleep_s(2)
        root = dump_ui(adb_path, evidence_dir / "mockgps_after_cancel.xml")
        screenshot(adb_path, evidence_dir / "mockgps_after_cancel.png")

    start_nodes = find_nodes(root, "Start mocking")
    if start_nodes:
        tap_bounds(adb_path, start_nodes[0].attrib["bounds"])
        sleep_s(3)
        root = dump_ui(adb_path, evidence_dir / "mockgps_after_start.xml")
        screenshot(adb_path, evidence_dir / "mockgps_after_start.png")
    else:
        (evidence_dir / "mockgps_after_start.xml").write_text(
            ET.tostring(root, encoding="unicode"),
            encoding="utf-8",
        )

    texts = {node.attrib.get("text", "") for node in root.iter("node")}
    if "Stop mocking" not in texts:
        return False, "mockgps_not_started"

    location_dump = adb(adb_path, "shell", "dumpsys", "location").stdout
    (evidence_dir / "location_after_mock.txt").write_text(location_dump, encoding="utf-8")
    return True, "mockgps_started"


def open_amap_taxi(adb_path: str, evidence_dir: Path) -> ET.Element:
    adb(adb_path, "shell", "am", "force-stop", AMAP_PACKAGE)
    sleep_s(1)
    adb(adb_path, "shell", "monkey", "-p", AMAP_PACKAGE, "-c", "android.intent.category.LAUNCHER", "1")
    sleep_s(8)
    dismiss_first_run_and_permissions(adb_path, evidence_dir)
    sleep_s(2)
    screenshot(adb_path, evidence_dir / "amap_home.png")
    dump_ui(adb_path, evidence_dir / "amap_home.xml")
    adb(adb_path, "shell", "input", "tap", "720", "1520")
    sleep_s(8)
    root = dump_ui(adb_path, evidence_dir / "amap_taxi.xml")
    screenshot(adb_path, evidence_dir / "amap_taxi.png")
    return root


def amap_success(root: ET.Element) -> tuple[bool, str]:
    texts = [node.attrib.get("text", "") for node in root.iter("node")]
    joined = "\n".join(texts)
    if "我的位置" in joined and "你要去哪儿" in joined:
        return True, "amap_taxi_pickup_is_my_location"
    return False, "amap_taxi_page_not_stable"


def run_sample(adb_path: str, sample: dict[str, str], out_root: Path) -> dict[str, str]:
    evidence_dir = out_root / sample["id"]
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "input.json").write_text(json.dumps(sample, ensure_ascii=False, indent=2), encoding="utf-8")

    mock_ok, mock_reason = start_mock(adb_path, sample["y"], sample["x"], evidence_dir)
    if not mock_ok:
        return {
            "id": sample["id"],
            "name": sample["name"],
            "input_x": sample["x"],
            "input_y": sample["y"],
            "output_x": "",
            "output_y": "",
            "status": "BLOCKED",
            "app": "amap",
            "reason": mock_reason,
            "evidence_dir": str(evidence_dir),
        }

    root = open_amap_taxi(adb_path, evidence_dir)
    success, reason = amap_success(root)
    output_x = sample["x"] if success else ""
    output_y = sample["y"] if success else ""
    status = "SUCCESS" if success else "FAIL"
    return {
        "id": sample["id"],
        "name": sample["name"],
        "input_x": sample["x"],
        "input_y": sample["y"],
        "output_x": output_x,
        "output_y": output_y,
        "status": status,
        "app": "amap",
        "reason": reason,
        "evidence_dir": str(evidence_dir),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--input-csv", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--ids", help="Comma-separated sample ids to run")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ensure_hwid_disabled(args.adb)

    with open(args.input_csv, "r", encoding="utf-8-sig", newline="") as fh:
        samples = list(csv.DictReader(fh))
    if args.ids:
        wanted = {item.strip() for item in args.ids.split(",") if item.strip()}
        samples = [sample for sample in samples if sample["id"] in wanted]
    if args.limit is not None:
        samples = samples[: args.limit]

    results: list[dict[str, str]] = []
    for sample in samples:
        results.append(run_sample(args.adb, sample, out_dir))

    results_path = out_dir / "results.csv"
    with results_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "id",
                "name",
                "input_x",
                "input_y",
                "output_x",
                "output_y",
                "status",
                "app",
                "reason",
                "evidence_dir",
            ],
        )
        writer.writeheader()
        writer.writerows(results)

    summary = {
        "total": len(results),
        "success": sum(1 for row in results if row["status"] == "SUCCESS"),
        "fail": sum(1 for row in results if row["status"] == "FAIL"),
        "blocked": sum(1 for row in results if row["status"] == "BLOCKED"),
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
