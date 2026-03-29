from __future__ import annotations

import argparse
import csv
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))

from t01_amap_batch import amap_success, ensure_hwid_disabled, open_amap_taxi, start_mock  # noqa: E402


def make_compare(orig_path: Path, recheck_path: Path, out_path: Path) -> None:
    orig = Image.open(orig_path).convert("RGB")
    recheck = Image.open(recheck_path).convert("RGB")
    width = orig.width + recheck.width
    height = max(orig.height, recheck.height)
    canvas = Image.new("RGB", (width, height), (255, 255, 255))
    canvas.paste(orig, (0, 0))
    canvas.paste(recheck, (orig.width, 0))
    canvas.save(out_path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adb", required=True)
    parser.add_argument("--results-csv", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ensure_hwid_disabled(args.adb)

    rows = list(csv.DictReader(Path(args.results_csv).open("r", encoding="utf-8-sig", newline="")))
    rows = [row for row in rows if row["status"] == "SUCCESS"]
    if args.limit is not None:
        rows = rows[: args.limit]

    results = []
    for row in rows:
        sid = row["id"]
        evidence_dir = out_dir / sid
        evidence_dir.mkdir(parents=True, exist_ok=True)

        orig_dir = Path(row["evidence_dir"])
        orig_taxi = orig_dir / "amap_taxi.png"
        if orig_taxi.exists():
            shutil.copy2(orig_taxi, evidence_dir / "orig_amap_taxi.png")

        mock_ok, mock_reason = start_mock(args.adb, row["output_y"], row["output_x"], evidence_dir)
        if not mock_ok:
            results.append(
                {
                    "id": sid,
                    "status": "BLOCKED",
                    "reason": mock_reason,
                    "orig_evidence_dir": row["evidence_dir"],
                    "recheck_evidence_dir": str(evidence_dir),
                }
            )
            continue

        root = open_amap_taxi(args.adb, evidence_dir)
        success, reason = amap_success(root)
        taxi_png = evidence_dir / "amap_taxi.png"
        if taxi_png.exists():
            taxi_png.rename(evidence_dir / "recheck_amap_taxi.png")
        taxi_xml = evidence_dir / "amap_taxi.xml"
        if taxi_xml.exists():
            taxi_xml.rename(evidence_dir / "recheck_amap_taxi.xml")

        if (evidence_dir / "orig_amap_taxi.png").exists() and (evidence_dir / "recheck_amap_taxi.png").exists():
            make_compare(
                evidence_dir / "orig_amap_taxi.png",
                evidence_dir / "recheck_amap_taxi.png",
                evidence_dir / "compare_side_by_side.png",
            )

        results.append(
            {
                "id": sid,
                "status": "SUCCESS" if success else "FAIL",
                "reason": reason,
                "orig_evidence_dir": row["evidence_dir"],
                "recheck_evidence_dir": str(evidence_dir),
            }
        )

    results_path = out_dir / "recheck_results.csv"
    with results_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["id", "status", "reason", "orig_evidence_dir", "recheck_evidence_dir"],
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
