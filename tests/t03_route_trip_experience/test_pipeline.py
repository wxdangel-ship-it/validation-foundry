from __future__ import annotations

import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "src"))

from validation_foundry.modules.t03_route_trip_experience.pipeline import (  # noqa: E402
    DEFAULT_SAMPLE_ROUTE_ID,
    build_bundle,
    validate_bundle,
)


def _find_t02_sample_route_draft() -> Path:
    candidates = []
    for path in (REPO_ROOT / "outputs" / "_work").rglob("route_draft.json"):
        if path.parent.parent.name == DEFAULT_SAMPLE_ROUTE_ID:
            candidates.append(path)
    assert candidates, "expected T02 sample route_draft.json to exist"
    return sorted(candidates, key=lambda item: item.stat().st_mtime, reverse=True)[0]


def test_build_bundle_from_real_t02_sample(tmp_path: Path) -> None:
    route_draft_path = _find_t02_sample_route_draft()
    track_gpx_path = route_draft_path.parent.parent / "normalized" / "main_geometry.gpx"

    bundle = build_bundle(
        output_root=tmp_path / "t03_out",
        route_draft_path=route_draft_path,
        track_gpx_path=track_gpx_path,
    )

    output_root = tmp_path / "t03_out"
    for filename in (
        "sample_manifest.json",
        "route_keypoints.json",
        "trip_track.geojson",
        "trip_events.json",
        "sensor_timeseries.json",
        "summary_story.json",
        "validation_report.json",
    ):
        assert (output_root / filename).exists(), filename

    sample_manifest = json.loads((output_root / "sample_manifest.json").read_text(encoding="utf-8"))
    assert sample_manifest["sample_route_id"] == DEFAULT_SAMPLE_ROUTE_ID
    assert sample_manifest["track"]["point_count"] > 100
    assert bundle["validation_report"]["status"] == "PASS"

    route_keypoints = json.loads((output_root / "route_keypoints.json").read_text(encoding="utf-8"))
    assert [item["kind"] for item in route_keypoints["keypoints"]] == [
        "entry",
        "regroup",
        "risk",
        "retreat",
        "exit",
    ]

    sensor_timeseries = json.loads((output_root / "sensor_timeseries.json").read_text(encoding="utf-8"))
    assert sensor_timeseries[0]["event_type"] == "ready"
    assert sensor_timeseries[-1]["event_type"] == "finish"


def test_validate_bundle_flags_missing_artifacts(tmp_path: Path) -> None:
    output_root = tmp_path / "empty_out"
    output_root.mkdir()

    report = validate_bundle(output_root)

    assert report["status"] == "FAIL"
    assert report["issues"]
    assert report["issues"][0]["code"] == "missing_output_file"
