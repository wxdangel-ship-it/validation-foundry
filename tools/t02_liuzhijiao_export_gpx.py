from __future__ import annotations

import argparse
import json
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path


RESULTS_ACTIVITY = "ProSearchResultActivity"
DETAIL_ACTIVITY = "TripDetailActivityV3"
DOCS_ACTIVITY = "documentsui/.picker.PickActivity"
CHOOSER_ACTIVITY = "HwChooserActivity"
EXPORT_SHOW_ACTIVITY = "TripExportShowActivity"

TARGETS = [
    {"route_id": "liuzhijiao_1989358", "source_identifier": "#1989358", "distance_prefix": "7.46"},
    {"route_id": "liuzhijiao_4489014", "source_identifier": "#4489014", "distance_prefix": "211.24"},
    {"route_id": "liuzhijiao_9432561", "source_identifier": "#9432561", "distance_prefix": "5"},
    {"route_id": "liuzhijiao_698154", "source_identifier": "#698154", "distance_prefix": "6.93"},
    {"route_id": "liuzhijiao_4097914", "source_identifier": "#4097914", "distance_prefix": "13.46"},
    {"route_id": "liuzhijiao_3541615", "source_identifier": "#3541615", "distance_prefix": "17.42"},
    {"route_id": "liuzhijiao_2048027", "source_identifier": "#2048027", "distance_prefix": "26.56"},
    {"route_id": "liuzhijiao_1959832", "source_identifier": "#1959832", "distance_prefix": "7.02"},
    {"route_id": "liuzhijiao_338618", "source_identifier": "#338618", "distance_prefix": "17.94"},
    {"route_id": "liuzhijiao_8320459", "source_identifier": "#8320459", "distance_prefix": "37.79"},
]


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def adb(adb_path: str, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run([adb_path, *args], check=check)


def parse_bounds(bounds: str) -> tuple[int, int, int, int]:
    left_top, right_bottom = bounds.split("][")
    left, top = left_top.strip("[").split(",")
    right, bottom = right_bottom.strip("]").split(",")
    return int(left), int(top), int(right), int(bottom)


def center(bounds: str) -> tuple[int, int]:
    left, top, right, bottom = parse_bounds(bounds)
    return (left + right) // 2, (top + bottom) // 2


def wait_for_activity(adb_path: str, fragment: str, timeout_sec: float = 10.0) -> str:
    deadline = time.time() + timeout_sec
    last = ""
    while time.time() < deadline:
        last = adb(adb_path, "shell", "dumpsys", "activity", "activities").stdout
        if fragment in last:
            return last
        time.sleep(0.5)
    raise RuntimeError(f"Timed out waiting for activity fragment {fragment!r}; last={last[-300:]}")


def current_activity(adb_path: str) -> str:
    out = adb(adb_path, "shell", "dumpsys", "activity", "activities").stdout
    for line in out.splitlines():
        if "mResumedActivity" in line:
            return line.strip()
    return ""


def dump_ui(adb_path: str, dest: Path) -> ET.Element:
    remote_xml = "/sdcard/__codex_t02_liuzhijiao_dump.xml"
    adb(adb_path, "shell", "uiautomator", "dump", remote_xml)
    content = adb(adb_path, "shell", "cat", remote_xml).stdout
    dest.write_text(content, encoding="utf-8")
    return ET.fromstring(content)


def tap(adb_path: str, x: int, y: int, pause_sec: float = 1.0) -> None:
    adb(adb_path, "shell", "input", "tap", str(x), str(y))
    time.sleep(pause_sec)


def key_back(adb_path: str, pause_sec: float = 1.0) -> None:
    adb(adb_path, "shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(pause_sec)


def swipe_up(adb_path: str, pause_sec: float = 1.2) -> None:
    adb(adb_path, "shell", "input", "swipe", "540", "1850", "540", "850", "250")
    time.sleep(pause_sec)


def visible_cards(root: ET.Element) -> list[dict[str, object]]:
    cards: list[dict[str, object]] = []
    for node in root.iter("node"):
        rid = node.attrib.get("resource-id", "")
        text = node.attrib.get("text", "").strip()
        bounds = node.attrib.get("bounds", "")
        if rid != "com.topgether.sixfoot:id/tvAdSubtitleLeft" or not text or not bounds:
            continue
        cards.append(
            {
                "text": text,
                "bounds": bounds,
                "center": center(bounds),
            }
        )
    cards.sort(key=lambda item: item["center"][1])  # type: ignore[index]
    return cards


def find_visible_card(adb_path: str, target: dict[str, str], work_dir: Path) -> tuple[int, int]:
    target_distance = target["distance_prefix"]
    for attempt in range(6):
        root = dump_ui(adb_path, work_dir / f"results_scan_{target['route_id']}_{attempt}.xml")
        if RESULTS_ACTIVITY not in current_activity(adb_path):
            raise RuntimeError(f"Expected results activity before opening {target['route_id']}")
        for card in visible_cards(root):
            text = str(card["text"])
            if target_distance in text:
                x, y = card["center"]  # type: ignore[assignment]
                return int(x), int(y)
        swipe_up(adb_path)
    raise RuntimeError(f"Could not find visible card for {target['route_id']} {target_distance}")


def tap_node_by_resource_id(adb_path: str, root: ET.Element, resource_id: str) -> None:
    for node in root.iter("node"):
        if node.attrib.get("resource-id") == resource_id:
            x, y = center(node.attrib["bounds"])
            tap(adb_path, x, y)
            return
    raise RuntimeError(f"Node not found: {resource_id}")


def export_current_detail(adb_path: str, work_dir: Path, target: dict[str, str]) -> str:
    wait_for_activity(adb_path, DETAIL_ACTIVITY, timeout_sec=8.0)

    tap(adb_path, 1010, 165, pause_sec=1.0)
    menu_root = dump_ui(adb_path, work_dir / f"{target['route_id']}_menu.xml")
    tap_node_by_resource_id(adb_path, menu_root, "com.topgether.sixfoot:id/llExport")

    export_root = dump_ui(adb_path, work_dir / f"{target['route_id']}_export_sheet.xml")
    tap_node_by_resource_id(adb_path, export_root, "com.topgether.sixfoot:id/itemGpx")

    wait_for_activity(adb_path, DOCS_ACTIVITY, timeout_sec=8.0)
    docs_root = dump_ui(adb_path, work_dir / f"{target['route_id']}_documentsui.xml")

    filename = ""
    for node in docs_root.iter("node"):
        if node.attrib.get("resource-id") == "android:id/title" and node.attrib.get("class") == "android.widget.EditText":
            filename = node.attrib.get("text", "").strip()
            break
    if not filename:
        raise RuntimeError(f"Could not resolve export filename for {target['route_id']}")

    tap_node_by_resource_id(adb_path, docs_root, "android:id/button1")
    time.sleep(2.0)

    file_path = f"/sdcard/Download/{filename}"
    ls = adb(adb_path, "shell", "ls", "-l", file_path, check=False)
    if filename not in ls.stdout:
        raise RuntimeError(f"Export did not land in Download: {filename}; ls={ls.stdout} err={ls.stderr}")

    if CHOOSER_ACTIVITY in current_activity(adb_path):
        key_back(adb_path, pause_sec=1.0)

    return filename


def pull_file(adb_path: str, remote_path: str, local_path: Path) -> None:
    local_path.parent.mkdir(parents=True, exist_ok=True)
    adb(adb_path, "pull", remote_path, str(local_path))


def return_to_results(adb_path: str, work_dir: Path, target: dict[str, str]) -> None:
    for attempt in range(5):
        activity = current_activity(adb_path)
        if RESULTS_ACTIVITY in activity:
            return
        if EXPORT_SHOW_ACTIVITY in activity:
            key_back(adb_path, pause_sec=1.0)
            continue
        if DETAIL_ACTIVITY in activity:
            tap(adb_path, 90, 170, pause_sec=1.5)
            continue
        key_back(adb_path, pause_sec=1.0)
        dump_ui(adb_path, work_dir / f"{target['route_id']}_backtrack_{attempt}.xml")
    raise RuntimeError(f"Could not return to results for {target['route_id']}; last={current_activity(adb_path)}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--work-dir", required=True)
    parser.add_argument("--start-index", type=int, default=0)
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    work_dir = Path(args.work_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    work_dir.mkdir(parents=True, exist_ok=True)

    if RESULTS_ACTIVITY not in current_activity(args.adb):
        raise RuntimeError("Script expects the phone to already be on 六只脚的 “越野” -> 自驾车 results page.")

    exports: list[dict[str, str]] = []
    for target in TARGETS[args.start_index :]:
        print(f"Exporting {target['route_id']} {target['distance_prefix']}", flush=True)
        x, y = find_visible_card(args.adb, target, work_dir)
        tap(args.adb, x, y, pause_sec=1.5)
        filename = export_current_detail(args.adb, work_dir, target)
        pull_file(args.adb, f"/sdcard/Download/{filename}", output_dir / filename)
        exports.append(
            {
                "route_id": target["route_id"],
                "source_identifier": target["source_identifier"],
                "distance_prefix": target["distance_prefix"],
                "filename": filename,
                "local_path": str((output_dir / filename).resolve()),
            }
        )
        return_to_results(args.adb, work_dir, target)
        print(f"Exported {filename}", flush=True)

    log_path = output_dir / "export_log.json"
    log_path.write_text(json.dumps(exports, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"exported": len(exports), "log_path": str(log_path.resolve())}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
