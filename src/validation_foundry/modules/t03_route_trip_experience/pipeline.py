from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MODULE_ID = "t03_route_trip_experience"
DEFAULT_SAMPLE_ROUTE_ID = "liuzhijiao_1989358"
DEFAULT_SAMPLE_ID = f"{MODULE_ID}_{DEFAULT_SAMPLE_ROUTE_ID}"
REPO_ROOT = Path(__file__).resolve().parents[4]
GPX_NS = {"g": "http://www.topografix.com/GPX/1/1"}
REQUIRED_OUTPUT_FILES = (
    "sample_manifest.json",
    "route_keypoints.json",
    "trip_track.geojson",
    "trip_events.json",
    "sensor_timeseries.json",
    "summary_story.json",
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _normalize_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _relpath_for_manifest(path: Path) -> str:
    try:
        return path.resolve().relative_to(REPO_ROOT).as_posix()
    except Exception:
        return path.resolve().as_posix()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _parse_iso_timestamp(value: str) -> datetime | None:
    value = _normalize_string(value)
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _format_timestamp(value: datetime | None) -> str:
    if value is None:
        return ""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_m = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2.0) ** 2
    return 2.0 * radius_m * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _load_route_draft(path: Path) -> dict[str, Any]:
    data = _read_json(path)
    required_keys = ("route_id", "source_meta", "geometry_bundle", "semantic_draft", "keypoint_candidates")
    missing = [key for key in required_keys if key not in data]
    if missing:
        raise ValueError(f"route_draft missing required keys: {', '.join(missing)}")
    return data


def _parse_gpx_track(path: Path) -> list[dict[str, Any]]:
    root = ET.fromstring(path.read_text(encoding="utf-8"))
    samples: list[dict[str, Any]] = []
    prev: dict[str, Any] | None = None
    cumulative_distance_m = 0.0

    for index, elem in enumerate(root.findall(".//g:trkpt", GPX_NS)):
        lat = float(elem.attrib["lat"])
        lon = float(elem.attrib["lon"])
        ele_elem = elem.find("g:ele", GPX_NS)
        time_elem = elem.find("g:time", GPX_NS)
        ext_elem = elem.find("g:extensions", GPX_NS)
        speed_elem = ext_elem.find("speed") if ext_elem is not None else None
        elevation_m = _safe_float(ele_elem.text) if ele_elem is not None else None
        timestamp = _normalize_string(time_elem.text) if time_elem is not None else ""
        speed_kmh = _safe_float(speed_elem.text) if speed_elem is not None else None

        segment_distance_m = 0.0
        derived_speed_kmh = speed_kmh
        slope_or_pitch_pct = 0.0
        if prev is not None:
            segment_distance_m = _haversine_m(prev["latitude"], prev["longitude"], lat, lon)
            cumulative_distance_m += segment_distance_m
            prev_elevation = prev.get("elevation_m")
            prev_ts = _parse_iso_timestamp(prev["timestamp"])
            curr_ts = _parse_iso_timestamp(timestamp)
            if prev_elevation is not None and elevation_m is not None and segment_distance_m > 0:
                slope_or_pitch_pct = ((elevation_m - prev_elevation) / segment_distance_m) * 100.0
            if derived_speed_kmh is None and prev_ts is not None and curr_ts is not None:
                delta_seconds = (curr_ts - prev_ts).total_seconds()
                if delta_seconds > 0:
                    derived_speed_kmh = (segment_distance_m / delta_seconds) * 3.6
        sample = {
            "index": index,
            "latitude": lat,
            "longitude": lon,
            "elevation_m": elevation_m,
            "timestamp": timestamp,
            "speed_kmh": derived_speed_kmh,
            "segment_distance_m": segment_distance_m,
            "cumulative_distance_m": cumulative_distance_m,
            "slope_or_pitch_pct": slope_or_pitch_pct,
        }
        samples.append(sample)
        prev = sample

    if len(samples) < 2:
        raise ValueError(f"GPX track requires at least 2 points: {path}")
    return samples


def _altitude_gain(samples: list[dict[str, Any]]) -> float | None:
    valid = [sample.get("elevation_m") for sample in samples if isinstance(sample.get("elevation_m"), (int, float))]
    if len(valid) < 2:
        return None
    gain = 0.0
    for prev, curr in zip(valid, valid[1:]):
        if curr > prev:
            gain += curr - prev
    return gain


def _altitude_loss(samples: list[dict[str, Any]]) -> float | None:
    valid = [sample.get("elevation_m") for sample in samples if isinstance(sample.get("elevation_m"), (int, float))]
    if len(valid) < 2:
        return None
    loss = 0.0
    for prev, curr in zip(valid, valid[1:]):
        if curr < prev:
            loss += prev - curr
    return loss


def _track_stats(samples: list[dict[str, Any]]) -> dict[str, Any]:
    timestamps = [_parse_iso_timestamp(sample["timestamp"]) for sample in samples]
    valid_timestamps = [ts for ts in timestamps if ts is not None]
    total_distance_m = samples[-1]["cumulative_distance_m"]
    duration_s = 0.0
    if len(valid_timestamps) >= 2:
        duration_s = (valid_timestamps[-1] - valid_timestamps[0]).total_seconds()
    speeds = [sample["speed_kmh"] for sample in samples if isinstance(sample.get("speed_kmh"), (int, float))]
    elevations = [sample["elevation_m"] for sample in samples if isinstance(sample.get("elevation_m"), (int, float))]
    return {
        "point_count": len(samples),
        "start_timestamp": _format_timestamp(valid_timestamps[0] if valid_timestamps else None),
        "end_timestamp": _format_timestamp(valid_timestamps[-1] if valid_timestamps else None),
        "duration_seconds": duration_s,
        "total_distance_m": total_distance_m,
        "total_distance_km": total_distance_m / 1000.0,
        "average_speed_kmh": (total_distance_m / duration_s) * 3.6 if duration_s > 0 else None,
        "max_speed_kmh": max(speeds) if speeds else None,
        "min_elevation_m": min(elevations) if elevations else None,
        "max_elevation_m": max(elevations) if elevations else None,
        "altitude_gain_m": _altitude_gain(samples),
        "altitude_loss_m": _altitude_loss(samples),
    }


def _candidate_label(candidate_text: dict[str, Any], key: str) -> str:
    values = candidate_text.get(key) or []
    if not isinstance(values, list) or not values:
        return ""
    return _normalize_string(values[0])


def _derive_keypoints(route_draft: dict[str, Any], samples: list[dict[str, Any]]) -> dict[str, Any]:
    first = samples[0]
    last = samples[-1]
    middle = samples[len(samples) // 2]
    risk_sample = max(samples, key=lambda sample: abs(_safe_float(sample.get("slope_or_pitch_pct")) or 0.0))
    candidate_text = dict(route_draft.get("keypoint_candidates") or {})
    return {
        "module_id": MODULE_ID,
        "sample_id": DEFAULT_SAMPLE_ID,
        "route_id": route_draft["route_id"],
        "route_name": _normalize_string(route_draft.get("semantic_draft", {}).get("route_name_candidate"))
        or _normalize_string(route_draft.get("source_meta", {}).get("source_route_title")),
        "candidate_text": candidate_text,
        "keypoints": [
            {
                "keypoint_id": "kp_entry",
                "kind": "entry",
                "name": "route entry",
                "candidate_label": _candidate_label(candidate_text, "entry_point_candidates"),
                "index": first["index"],
                "timestamp": first["timestamp"],
                "latitude": first["latitude"],
                "longitude": first["longitude"],
                "elevation_m": first["elevation_m"],
                "confidence": "medium",
                "source": "gpx_first_point",
            },
            {
                "keypoint_id": "kp_regroup",
                "kind": "regroup",
                "name": "mid-route regroup",
                "candidate_label": _candidate_label(candidate_text, "regroup_or_parking_candidates"),
                "index": middle["index"],
                "timestamp": middle["timestamp"],
                "latitude": middle["latitude"],
                "longitude": middle["longitude"],
                "elevation_m": middle["elevation_m"],
                "confidence": "medium",
                "source": "gpx_mid_point",
            },
            {
                "keypoint_id": "kp_risk",
                "kind": "risk",
                "name": "risk pivot",
                "candidate_label": _candidate_label(candidate_text, "risk_point_candidates"),
                "index": risk_sample["index"],
                "timestamp": risk_sample["timestamp"],
                "latitude": risk_sample["latitude"],
                "longitude": risk_sample["longitude"],
                "elevation_m": risk_sample["elevation_m"],
                "confidence": "medium",
                "source": "max_abs_slope_sample",
            },
            {
                "keypoint_id": "kp_retreat",
                "kind": "retreat",
                "name": "retreat anchor",
                "candidate_label": _candidate_label(candidate_text, "retreat_candidates"),
                "index": first["index"],
                "timestamp": first["timestamp"],
                "latitude": first["latitude"],
                "longitude": first["longitude"],
                "elevation_m": first["elevation_m"],
                "confidence": "medium",
                "source": "gpx_first_point",
            },
            {
                "keypoint_id": "kp_exit",
                "kind": "exit",
                "name": "route exit",
                "candidate_label": _candidate_label(candidate_text, "exit_point_candidates"),
                "index": last["index"],
                "timestamp": last["timestamp"],
                "latitude": last["latitude"],
                "longitude": last["longitude"],
                "elevation_m": last["elevation_m"],
                "confidence": "medium",
                "source": "gpx_last_point",
            },
        ],
    }


def _build_trip_events(
    route_draft: dict[str, Any],
    samples: list[dict[str, Any]],
    keypoints: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[int, str]]:
    first = samples[0]
    last = samples[-1]
    risk = next(item for item in keypoints["keypoints"] if item["kind"] == "risk")
    midpoint = next(item for item in keypoints["keypoints"] if item["kind"] == "regroup")
    events = [
        {
            "event_id": "evt_ready",
            "event_type": "ready",
            "timestamp": first["timestamp"],
            "severity": "info",
            "message": f"Route {route_draft['route_id']} ready for offline trip prep.",
            "track_sample_index": first["index"],
            "latitude": first["latitude"],
            "longitude": first["longitude"],
            "elevation_m": first["elevation_m"],
            "keypoint_id": "kp_entry",
        },
        {
            "event_id": "evt_midpoint",
            "event_type": "waypoint",
            "timestamp": midpoint["timestamp"],
            "severity": "info",
            "message": "Mid-route regroup / parking checkpoint reached.",
            "track_sample_index": midpoint["index"],
            "latitude": midpoint["latitude"],
            "longitude": midpoint["longitude"],
            "elevation_m": midpoint["elevation_m"],
            "keypoint_id": "kp_regroup",
        },
        {
            "event_id": "evt_risk",
            "event_type": "deviation",
            "timestamp": risk["timestamp"],
            "severity": "warning",
            "message": "Mock deviation / risk pivot identified for conservative retreat.",
            "track_sample_index": risk["index"],
            "latitude": risk["latitude"],
            "longitude": risk["longitude"],
            "elevation_m": risk["elevation_m"],
            "keypoint_id": "kp_risk",
        },
        {
            "event_id": "evt_retreat",
            "event_type": "retreat",
            "timestamp": risk["timestamp"],
            "severity": "critical",
            "message": "Switch to retreat / return-to-track mode.",
            "track_sample_index": risk["index"],
            "latitude": risk["latitude"],
            "longitude": risk["longitude"],
            "elevation_m": risk["elevation_m"],
            "keypoint_id": "kp_retreat",
        },
        {
            "event_id": "evt_finish",
            "event_type": "finish",
            "timestamp": last["timestamp"],
            "severity": "info",
            "message": "Trip summary closed.",
            "track_sample_index": last["index"],
            "latitude": last["latitude"],
            "longitude": last["longitude"],
            "elevation_m": last["elevation_m"],
            "keypoint_id": "kp_exit",
        },
    ]
    event_lookup = {}
    for event in events:
        event_lookup.setdefault(event["track_sample_index"], event["event_type"])
    return events, event_lookup


def _build_sensor_timeseries(samples: list[dict[str, Any]], event_lookup: dict[int, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for sample in samples:
        rows.append(
            {
                "timestamp": sample["timestamp"],
                "speed": sample.get("speed_kmh"),
                "elevation": sample.get("elevation_m"),
                "slope_or_pitch": sample.get("slope_or_pitch_pct"),
                "event_type": event_lookup.get(sample["index"], ""),
                "sample_index": sample["index"],
                "cumulative_distance_m": sample["cumulative_distance_m"],
                "segment_distance_m": sample["segment_distance_m"],
            }
        )
    return rows


def _build_trip_track_geojson(
    route_draft: dict[str, Any],
    samples: list[dict[str, Any]],
    keypoints: dict[str, Any],
    stats: dict[str, Any],
) -> dict[str, Any]:
    line_feature = {
        "type": "Feature",
        "properties": {
            "feature_type": "track_line",
            "route_id": route_draft["route_id"],
            "sample_id": DEFAULT_SAMPLE_ID,
            "point_count": stats["point_count"],
            "duration_seconds": stats["duration_seconds"],
            "total_distance_m": stats["total_distance_m"],
            "route_name": keypoints["route_name"],
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [sample["longitude"], sample["latitude"], sample["elevation_m"]]
                for sample in samples
            ],
        },
    }
    point_features = [
        {
            "type": "Feature",
            "properties": {
                "feature_type": "track_point",
                "route_id": route_draft["route_id"],
                "sample_id": DEFAULT_SAMPLE_ID,
                "sample_index": sample["index"],
                "timestamp": sample["timestamp"],
                "speed": sample.get("speed_kmh"),
                "elevation_m": sample.get("elevation_m"),
                "slope_or_pitch": sample.get("slope_or_pitch_pct"),
                "cumulative_distance_m": sample["cumulative_distance_m"],
            },
            "geometry": {
                "type": "Point",
                "coordinates": [sample["longitude"], sample["latitude"], sample["elevation_m"]],
            },
        }
        for sample in samples
    ]
    keypoint_features = [
        {
            "type": "Feature",
            "properties": {
                "feature_type": "keypoint",
                "keypoint_id": item["keypoint_id"],
                "kind": item["kind"],
                "name": item["name"],
                "timestamp": item["timestamp"],
                "candidate_label": item["candidate_label"],
                "confidence": item["confidence"],
            },
            "geometry": {
                "type": "Point",
                "coordinates": [item["longitude"], item["latitude"], item["elevation_m"]],
            },
        }
        for item in keypoints["keypoints"]
    ]
    return {"type": "FeatureCollection", "features": [line_feature, *keypoint_features, *point_features]}


def _build_summary_story(
    route_draft: dict[str, Any],
    keypoints: dict[str, Any],
    stats: dict[str, Any],
    events: list[dict[str, Any]],
    output_root: Path,
) -> dict[str, Any]:
    route_name = keypoints["route_name"]
    quick_summary = [
        f"Route {route_draft['route_id']} is a single-sample T02 off-road POC input with {stats['point_count']} GPX points.",
        f"Track duration is about {stats['duration_seconds']:.0f} seconds and total distance is {stats['total_distance_km']:.2f} km.",
        "The trip narrative is intentionally conservative: offline reference, continuous record, risk pivot, retreat, and summary.",
    ]
    deep_summary = [
        {
            "chapter_id": "chapter_ready",
            "title": "Prepare",
            "event_refs": ["evt_ready"],
            "start_timestamp": events[0]["timestamp"],
            "end_timestamp": events[1]["timestamp"],
            "synopsis": "Load route draft, confirm the path, and stage offline trip assets.",
        },
        {
            "chapter_id": "chapter_mainline",
            "title": "Offline Mainline",
            "event_refs": ["evt_midpoint"],
            "start_timestamp": events[1]["timestamp"],
            "end_timestamp": events[2]["timestamp"],
            "synopsis": "Rebuild the trip as a continuous off-road reference playback.",
        },
        {
            "chapter_id": "chapter_risk",
            "title": "Risk and Retreat",
            "event_refs": ["evt_risk", "evt_retreat"],
            "start_timestamp": events[2]["timestamp"],
            "end_timestamp": events[3]["timestamp"],
            "synopsis": "Mock deviation triggers the conservative retreat storyline.",
        },
        {
            "chapter_id": "chapter_finish",
            "title": "Finish",
            "event_refs": ["evt_finish"],
            "start_timestamp": events[3]["timestamp"],
            "end_timestamp": events[4]["timestamp"],
            "synopsis": "Close the trip with a recap that can flow back into Route presentation assets.",
        },
    ]
    return {
        "module_id": MODULE_ID,
        "sample_id": DEFAULT_SAMPLE_ID,
        "route_id": route_draft["route_id"],
        "route_name": route_name,
        "generated_at": _now_iso(),
        "quick_summary": quick_summary,
        "deep_summary": deep_summary,
        "key_metrics": {
            "point_count": stats["point_count"],
            "total_distance_m": stats["total_distance_m"],
            "total_distance_km": stats["total_distance_km"],
            "duration_seconds": stats["duration_seconds"],
            "average_speed_kmh": stats["average_speed_kmh"],
            "max_speed_kmh": stats["max_speed_kmh"],
            "min_elevation_m": stats["min_elevation_m"],
            "max_elevation_m": stats["max_elevation_m"],
            "altitude_gain_m": stats["altitude_gain_m"],
            "altitude_loss_m": stats["altitude_loss_m"],
        },
        "asset_refs": {
            "sample_manifest": "sample_manifest.json",
            "route_keypoints": "route_keypoints.json",
            "trip_track": "trip_track.geojson",
            "trip_events": "trip_events.json",
            "sensor_timeseries": "sensor_timeseries.json",
            "summary_story": "summary_story.json",
            "output_root": _relpath_for_manifest(output_root),
        },
    }


def _find_latest_route_draft(route_id: str) -> Path:
    candidates = []
    for path in (REPO_ROOT / "outputs" / "_work").rglob("route_draft.json"):
        if path.parent.parent.name == route_id:
            candidates.append(path)
    if not candidates:
        raise FileNotFoundError(f"unable to locate T02 route_draft for {route_id}")
    return sorted(candidates, key=lambda item: item.stat().st_mtime, reverse=True)[0]


def _resolve_sample_sources(route_draft_path: Path | None, track_gpx_path: Path | None, route_id: str) -> tuple[Path, Path]:
    if route_draft_path is None:
        route_draft_path = _find_latest_route_draft(route_id)
    if track_gpx_path is None:
        track_gpx_path = route_draft_path.parent.parent / "normalized" / "main_geometry.gpx"
    if not route_draft_path.exists():
        raise FileNotFoundError(f"route_draft not found: {route_draft_path}")
    if not track_gpx_path.exists():
        raise FileNotFoundError(f"track_gpx not found: {track_gpx_path}")
    return route_draft_path.resolve(), track_gpx_path.resolve()


def _build_sample_manifest(
    route_draft_path: Path,
    track_gpx_path: Path,
    route_draft: dict[str, Any],
    stats: dict[str, Any],
    output_root: Path,
) -> dict[str, Any]:
    return {
        "module_id": MODULE_ID,
        "sample_id": DEFAULT_SAMPLE_ID,
        "sample_route_id": route_draft["route_id"],
        "sample_label": "T02 six-foot off-road sample",
        "generated_at": _now_iso(),
        "source": {
            "route_draft_path": _relpath_for_manifest(route_draft_path),
            "track_gpx_path": _relpath_for_manifest(track_gpx_path),
            "route_draft_sha256": _sha256(route_draft_path),
            "track_gpx_sha256": _sha256(track_gpx_path),
            "source_platform": _normalize_string(route_draft.get("source_meta", {}).get("source_platform")),
            "source_identifier": _normalize_string(route_draft.get("source_meta", {}).get("source_identifier")),
            "route_name_candidate": _normalize_string(
                route_draft.get("semantic_draft", {}).get("route_name_candidate")
            ),
        },
        "track": stats,
        "outputs": {
            "route_keypoints": "route_keypoints.json",
            "trip_track": "trip_track.geojson",
            "trip_events": "trip_events.json",
            "sensor_timeseries": "sensor_timeseries.json",
            "summary_story": "summary_story.json",
        },
        "output_root": _relpath_for_manifest(output_root),
        "contract_version": "t03_p0_v1",
    }


def validate_bundle(output_root: Path) -> dict[str, Any]:
    issues: list[dict[str, str]] = []
    for filename in REQUIRED_OUTPUT_FILES:
        path = output_root / filename
        if not path.exists():
            issues.append({"code": "missing_output_file", "severity": "FAIL", "detail": filename})
    if not issues:
        try:
            sample_manifest = _read_json(output_root / "sample_manifest.json")
            if not _normalize_string(sample_manifest.get("sample_route_id")):
                issues.append(
                    {"code": "missing_sample_route_id", "severity": "FAIL", "detail": "sample_manifest"}
                )
            route_keypoints = _read_json(output_root / "route_keypoints.json")
            if len(route_keypoints.get("keypoints", [])) < 5:
                issues.append({"code": "insufficient_keypoints", "severity": "FAIL", "detail": "keypoints"})
            sensor_timeseries = _read_json(output_root / "sensor_timeseries.json")
            trip_events = _read_json(output_root / "trip_events.json")
            summary_story = _read_json(output_root / "summary_story.json")
            if not sensor_timeseries or not trip_events or not summary_story:
                issues.append({"code": "empty_artifact", "severity": "FAIL", "detail": "one or more outputs"})
        except Exception as exc:  # pragma: no cover - defensive
            issues.append({"code": "validation_error", "severity": "FAIL", "detail": str(exc)})
    status = "PASS" if not issues else "FAIL"
    return {
        "status": status,
        "issues": issues,
        "output_root": _relpath_for_manifest(output_root),
        "validated_at": _now_iso(),
    }


def build_bundle(
    output_root: Path,
    route_draft_path: Path | None = None,
    track_gpx_path: Path | None = None,
    route_id: str = DEFAULT_SAMPLE_ROUTE_ID,
) -> dict[str, Any]:
    route_draft_path, track_gpx_path = _resolve_sample_sources(route_draft_path, track_gpx_path, route_id)
    route_draft = _load_route_draft(route_draft_path)
    samples = _parse_gpx_track(track_gpx_path)
    stats = _track_stats(samples)
    keypoints = _derive_keypoints(route_draft, samples)
    events, event_lookup = _build_trip_events(route_draft, samples, keypoints)
    sensor_timeseries = _build_sensor_timeseries(samples, event_lookup)
    trip_track_geojson = _build_trip_track_geojson(route_draft, samples, keypoints, stats)
    summary_story = _build_summary_story(route_draft, keypoints, stats, events, output_root)
    sample_manifest = _build_sample_manifest(route_draft_path, track_gpx_path, route_draft, stats, output_root)

    output_root.mkdir(parents=True, exist_ok=True)
    _write_json(output_root / "sample_manifest.json", sample_manifest)
    _write_json(output_root / "route_keypoints.json", keypoints)
    _write_json(output_root / "trip_track.geojson", trip_track_geojson)
    _write_json(output_root / "trip_events.json", events)
    _write_json(output_root / "sensor_timeseries.json", sensor_timeseries)
    _write_json(output_root / "summary_story.json", summary_story)

    validation = validate_bundle(output_root)
    _write_json(output_root / "validation_report.json", validation)

    return {
        "sample_manifest": sample_manifest,
        "route_keypoints": keypoints,
        "trip_track": trip_track_geojson,
        "trip_events": events,
        "sensor_timeseries": sensor_timeseries,
        "summary_story": summary_story,
        "validation_report": validation,
        "source": {
            "route_draft_path": route_draft_path,
            "track_gpx_path": track_gpx_path,
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="T03 route / trip data assembly pipeline")
    parser.add_argument("--output-root", required=True, help="Directory where T03 outputs are written")
    parser.add_argument("--route-draft", help="Explicit T02 route_draft.json path")
    parser.add_argument("--track-gpx", help="Explicit T02 normalized/main_geometry.gpx path")
    parser.add_argument(
        "--route-id",
        default=DEFAULT_SAMPLE_ROUTE_ID,
        help="Sample route ID used for auto-discovery when explicit paths are omitted",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    output_root = Path(args.output_root).expanduser().resolve()
    route_draft_path = Path(args.route_draft).expanduser() if args.route_draft else None
    track_gpx_path = Path(args.track_gpx).expanduser() if args.track_gpx else None
    build_bundle(
        output_root=output_root,
        route_draft_path=route_draft_path,
        track_gpx_path=track_gpx_path,
        route_id=args.route_id,
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main(sys.argv[1:]))
