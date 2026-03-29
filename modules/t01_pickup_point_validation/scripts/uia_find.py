from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


BOUNDS_RE = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")


def parse_bounds(bounds: str) -> tuple[int, int, int, int]:
    match = BOUNDS_RE.fullmatch(bounds)
    if not match:
        raise ValueError(f"invalid bounds: {bounds!r}")
    x1, y1, x2, y2 = map(int, match.groups())
    return x1, y1, x2, y2


def center(bounds: str) -> tuple[int, int]:
    x1, y1, x2, y2 = parse_bounds(bounds)
    return ((x1 + x2) // 2, (y1 + y2) // 2)


def matches(node: ET.Element, args: argparse.Namespace) -> bool:
    if args.text is not None and node.attrib.get("text") != args.text:
        return False
    if args.text_contains is not None and args.text_contains not in (node.attrib.get("text") or ""):
        return False
    if args.desc is not None and node.attrib.get("content-desc") != args.desc:
        return False
    if args.desc_contains is not None and args.desc_contains not in (node.attrib.get("content-desc") or ""):
        return False
    if args.resource_id is not None and node.attrib.get("resource-id") != args.resource_id:
        return False
    if args.package is not None and node.attrib.get("package") != args.package:
        return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("xml_path")
    parser.add_argument("--text")
    parser.add_argument("--text-contains")
    parser.add_argument("--desc")
    parser.add_argument("--desc-contains")
    parser.add_argument("--resource-id")
    parser.add_argument("--package")
    parser.add_argument("--index", type=int, default=0)
    args = parser.parse_args()

    root = ET.parse(Path(args.xml_path)).getroot()
    found: list[dict[str, object]] = []
    for node in root.iter("node"):
        if not matches(node, args):
            continue
        bounds = node.attrib.get("bounds", "")
        item = {
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

    if args.index < 0 or args.index >= len(found):
        print(json.dumps({"found": len(found), "matches": found}, ensure_ascii=False, indent=2))
        return 1

    print(json.dumps({"found": len(found), "match": found[args.index]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
