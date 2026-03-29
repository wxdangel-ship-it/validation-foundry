from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from uia_find import center, matches


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def dump_ui(adb: str, local_xml: Path) -> None:
    remote_xml = "/sdcard/__codex_uia_dump.xml"
    run([adb, "shell", "uiautomator", "dump", remote_xml])
    content = run([adb, "shell", "cat", remote_xml]).stdout
    local_xml.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--text")
    parser.add_argument("--text-contains")
    parser.add_argument("--desc")
    parser.add_argument("--desc-contains")
    parser.add_argument("--resource-id")
    parser.add_argument("--package")
    parser.add_argument("--index", type=int, default=0)
    parser.add_argument("--tap", action="store_true")
    parser.add_argument("--save-xml")
    args = parser.parse_args()

    with tempfile.TemporaryDirectory() as tmpdir:
        xml_path = Path(tmpdir) / "dump.xml"
        dump_ui(args.adb, xml_path)
        if args.save_xml:
            Path(args.save_xml).write_bytes(xml_path.read_bytes())

        root = ET.parse(xml_path).getroot()
        found: list[dict[str, object]] = []
        for node in root.iter("node"):
            if not matches(node, args):
                continue
            bounds = node.attrib.get("bounds", "")
            item: dict[str, object] = {
                "text": node.attrib.get("text", ""),
                "content_desc": node.attrib.get("content-desc", ""),
                "resource_id": node.attrib.get("resource-id", ""),
                "class": node.attrib.get("class", ""),
                "package": node.attrib.get("package", ""),
                "bounds": bounds,
            }
            if bounds:
                item["center"] = center(bounds)
            found.append(item)

        payload: dict[str, object] = {"found": len(found), "matches": found}
        if args.index < len(found):
            payload["match"] = found[args.index]
            if args.tap and "center" in found[args.index]:
                x, y = found[args.index]["center"]  # type: ignore[index]
                run([args.adb, "shell", "input", "tap", str(x), str(y)])
                payload["tapped"] = [x, y]
        else:
            payload["error"] = "index_out_of_range"

        print(json.dumps(payload, ensure_ascii=False))
        return 0 if "match" in payload else 1


if __name__ == "__main__":
    raise SystemExit(main())
