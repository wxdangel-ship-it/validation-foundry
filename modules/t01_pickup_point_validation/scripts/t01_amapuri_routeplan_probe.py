from __future__ import annotations

import argparse
import csv
import json
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path


def run(cmd: list[str], check: bool = True, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=capture_output)


def adb(adb_path: str, serial: str | None, *args: str, check: bool = True, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    cmd = [adb_path]
    if serial:
        cmd.extend(["-s", serial])
    cmd.extend(args)
    return run(cmd, check=check, capture_output=capture_output)


def screenshot(adb_path: str, serial: str | None, image_path: Path) -> None:
    with image_path.open("wb") as fh:
        proc = subprocess.run(
            [adb_path, *(["-s", serial] if serial else []), "exec-out", "screencap", "-p"],
            check=True,
            stdout=fh,
        )
        if proc.returncode != 0:
            raise RuntimeError("screencap failed")


def dump_ui(adb_path: str, serial: str | None, xml_path: Path) -> ET.Element:
    remote = "/sdcard/__codex_t01_amapuri_dump.xml"
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            adb(adb_path, serial, "shell", "uiautomator", "dump", remote)
            content = adb(adb_path, serial, "shell", "cat", remote).stdout
            xml_path.write_text(content, encoding="utf-8")
            return ET.fromstring(content)
        except Exception as exc:
            last_error = exc
            time.sleep(1.5 + attempt)
    raise RuntimeError(f"uiautomator dump failed after retries: {last_error}")


def find_first_attr(root: ET.Element, resource_id: str, attr: str = "text") -> str | None:
    for node in root.iter("node"):
        if node.attrib.get("resource-id") == resource_id:
            value = node.attrib.get(attr, "").strip()
            if value:
                return value
    return None


def build_uri(
    source_application: str,
    slat: float,
    slon: float,
    dlat: float,
    dlon: float,
    sname: str,
    dname: str,
    dev: int,
    travel_type: int,
    m: int,
) -> str:
    return (
        "amapuri://route/plan/"
        f"?sourceApplication={source_application}"
        f"&slat={slat:.9f}&slon={slon:.9f}&sname={sname}"
        f"&dlat={dlat:.9f}&dlon={dlon:.9f}&dname={dname}"
        f"&dev={dev}&t={travel_type}&m={m}"
    )


def open_routeplan(
    adb_path: str,
    serial: str | None,
    uri: str,
    sleep_s: float,
) -> None:
    adb(
        adb_path,
        serial,
        "shell",
        f"am start -a android.intent.action.VIEW -d '{uri}' -p com.autonavi.minimap",
        capture_output=True,
    )
    time.sleep(sleep_s)


def parse_offsets(raw: str) -> list[float]:
    return [float(part.strip()) for part in raw.split(",") if part.strip()]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Probe AMap route-plan URI snapping behavior.")
    parser.add_argument("--adb", required=True)
    parser.add_argument("--serial")
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--slat", type=float, required=True)
    parser.add_argument("--slon", type=float, required=True)
    parser.add_argument("--dlat", type=float, required=True)
    parser.add_argument("--dlon", type=float, required=True)
    parser.add_argument("--sname", default="A")
    parser.add_argument("--dname", default="B")
    parser.add_argument("--source-application", default="validation-foundry")
    parser.add_argument("--dev", type=int, default=0)
    parser.add_argument("--travel-type", type=int, default=0)
    parser.add_argument("--m", type=int, default=0)
    parser.add_argument("--sleep-s", type=float, default=4.0)
    parser.add_argument("--lat-offsets", default="0")
    parser.add_argument("--lon-offsets", default="0")
    parser.add_argument("--enter-taxi", action="store_true")
    parser.add_argument("--more-xy", default="996,388")
    parser.add_argument("--taxi-xy", default="927,814")
    parser.add_argument("--post-taxi-sleep-s", type=float, default=4.0)
    return parser.parse_args()


def parse_xy(raw: str) -> tuple[int, int]:
    x_str, y_str = [part.strip() for part in raw.split(",", 1)]
    return int(x_str), int(y_str)


def main() -> int:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    lat_offsets = parse_offsets(args.lat_offsets)
    lon_offsets = parse_offsets(args.lon_offsets)
    more_xy = parse_xy(args.more_xy)
    taxi_xy = parse_xy(args.taxi_xy)

    rows: list[dict[str, object]] = []

    run_index = 0
    for lat_offset in lat_offsets:
        for lon_offset in lon_offsets:
            run_index += 1
            slat = args.slat + lat_offset
            slon = args.slon + lon_offset
            run_dir = out_dir / f"run_{run_index:02d}"
            run_dir.mkdir(parents=True, exist_ok=True)

            uri = build_uri(
                source_application=args.source_application,
                slat=slat,
                slon=slon,
                dlat=args.dlat,
                dlon=args.dlon,
                sname=args.sname,
                dname=args.dname,
                dev=args.dev,
                travel_type=args.travel_type,
                m=args.m,
            )
            (run_dir / "routeplan_uri.txt").write_text(uri, encoding="utf-8")

            open_routeplan(args.adb, args.serial, uri, args.sleep_s)
            screenshot(args.adb, args.serial, run_dir / "route_screen.png")
            root = dump_ui(args.adb, args.serial, run_dir / "route_ui.xml")

            if args.enter_taxi:
                adb(args.adb, args.serial, "shell", "input", "tap", str(more_xy[0]), str(more_xy[1]))
                time.sleep(1.0)
                adb(args.adb, args.serial, "shell", "input", "tap", str(taxi_xy[0]), str(taxi_xy[1]))
                time.sleep(args.post_taxi_sleep_s)
                screenshot(args.adb, args.serial, run_dir / "taxi_screen.png")
                root = dump_ui(args.adb, args.serial, run_dir / "taxi_ui.xml")

            start_text = find_first_attr(root, "com.autonavi.minimap:id/route_edit_summary_start")
            end_text = find_first_attr(root, "com.autonavi.minimap:id/route_edit_summary_end")
            texts = [
                node.attrib.get("text", "").strip()
                for node in root.iter("node")
                if node.attrib.get("text", "").strip()
            ]

            row = {
                "run_index": run_index,
                "slat": slat,
                "slon": slon,
                "lat_offset": lat_offset,
                "lon_offset": lon_offset,
                "start_text": start_text or "",
                "end_text": end_text or "",
                "entered_taxi": args.enter_taxi,
                "has_taxi_terms": any(term in "\n".join(texts) for term in ["顺风车", "元起", "已选", "同意协议", "帮人叫车"]),
                "run_dir": str(run_dir),
            }
            rows.append(row)
            (run_dir / "summary.json").write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")

    summary_csv = out_dir / "summary.csv"
    with summary_csv.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "run_index",
                "slat",
                "slon",
                "lat_offset",
                "lon_offset",
                "start_text",
                "end_text",
                "entered_taxi",
                "has_taxi_terms",
                "run_dir",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    summary_json = out_dir / "summary.json"
    summary_json.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    print(summary_csv)
    print(summary_json)
    for row in rows:
        print(
            json.dumps(
                {
                    "run_index": row["run_index"],
                    "slat": row["slat"],
                    "slon": row["slon"],
                    "start_text": row["start_text"],
                    "end_text": row["end_text"],
                },
                ensure_ascii=False,
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
