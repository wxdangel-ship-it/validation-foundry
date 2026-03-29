from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: dump_uia_nodes.py <xml_path>", file=sys.stderr)
        return 2

    xml_path = Path(sys.argv[1])
    root = ET.parse(xml_path).getroot()
    count = 0
    for node in root.iter("node"):
        text = (node.attrib.get("text") or "").strip()
        desc = (node.attrib.get("content-desc") or "").strip()
        if not text and not desc:
            continue
        rid = node.attrib.get("resource-id") or ""
        bounds = node.attrib.get("bounds") or ""
        cls = node.attrib.get("class") or ""
        print(
            f"TXT=[{text}] DESC=[{desc}] RID=[{rid}] "
            f"BOUNDS=[{bounds}] CLASS=[{cls}]"
        )
        count += 1
    print(f"TOTAL={count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
