from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MODULE_ID = "t02_route_coldstart"
VALID_PLATFORMS = {"2bulu", "liuzhijiao"}
PASS = "PASS"
WARN = "WARN"
FAIL = "FAIL"
VALID_SOURCE_NATURE = {"likely_actual", "likely_planned", "imported", "unknown"}
VALID_GEOMETRY_MODE = {"exported_track", "screen_reconstructed", "mixed"}
VALID_GEOMETRY_CONFIDENCE = {"high", "medium", "low"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _safe_slug(value: str) -> str:
    value = value.strip()
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", value)
    return value.strip("_") or "route"


def _resolve_path(base_dir: Path, value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return (base_dir / path).resolve()


def _copy_files(
    values: list[Any],
    base_dir: Path,
    dest_dir: Path,
    issues: list[dict[str, str]],
    issue_code: str,
) -> list[str]:
    copied: list[str] = []
    for raw_value in values:
        if not raw_value:
            continue
        source = _resolve_path(base_dir, str(raw_value))
        if not source.exists():
            issues.append(
                {
                    "code": issue_code,
                    "severity": FAIL,
                    "detail": f"missing source file: {source}",
                }
            )
            continue
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / source.name
        if source.is_dir():
            if dest_path.exists():
                shutil.rmtree(dest_path)
            shutil.copytree(source, dest_path)
        else:
            shutil.copy2(source, dest_path)
        copied.append(os.path.relpath(dest_path, dest_dir.parent.parent).replace("\\", "/"))
    return copied


def _normalize_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _normalize_list_of_strings(value: Any) -> list[str]:
    return [_normalize_string(item) for item in _ensure_list(value) if _normalize_string(item)]


def _keypoint_lists(keypoints: dict[str, Any]) -> dict[str, list[str]]:
    return {
        "entry_point_candidates": _normalize_list_of_strings(keypoints.get("entry_point_candidates")),
        "exit_point_candidates": _normalize_list_of_strings(keypoints.get("exit_point_candidates")),
        "regroup_or_parking_candidates": _normalize_list_of_strings(
            keypoints.get("regroup_or_parking_candidates")
        ),
        "retreat_candidates": _normalize_list_of_strings(keypoints.get("retreat_candidates")),
        "risk_point_candidates": _normalize_list_of_strings(keypoints.get("risk_point_candidates")),
    }


def _git_head() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
        )
    except Exception:
        return ""
    return result.stdout.strip()


def _coerce_normalized_geometry(
    geometry_bundle: dict[str, Any],
    route_dir: Path,
    base_dir: Path,
    copied_raw_geometry: list[str],
    copied_geometry_screenshots: list[str],
    issues: list[dict[str, str]],
) -> str:
    normalized_dir = route_dir / "normalized"
    normalized_dir.mkdir(parents=True, exist_ok=True)
    value = geometry_bundle.get("normalized_main_geometry")
    if isinstance(value, str) and value.strip():
        source = _resolve_path(base_dir, value)
        if not source.exists():
            issues.append(
                {
                    "code": "missing_normalized_geometry",
                    "severity": FAIL,
                    "detail": f"missing normalized geometry file: {source}",
                }
            )
            return ""
        dest = normalized_dir / source.name
        shutil.copy2(source, dest)
        return "normalized/" + dest.name
    if isinstance(value, (dict, list)):
        dest = normalized_dir / "main_geometry.geojson"
        _write_json(dest, value)
        return "normalized/" + dest.name
    if copied_raw_geometry:
        first = route_dir / copied_raw_geometry[0]
        dest = normalized_dir / ("main_geometry" + first.suffix)
        shutil.copy2(first, dest)
        return "normalized/" + dest.name
    if copied_geometry_screenshots:
        dest = normalized_dir / "main_geometry_candidate.json"
        _write_json(
            dest,
            {
                "candidate_type": "screen_reconstructed_pending",
                "source_screenshots": copied_geometry_screenshots,
                "note": "No exported geometry file available; candidate remains screenshot-based.",
            },
        )
        return "normalized/" + dest.name
    return ""


def _build_qa(
    route_id: str,
    region: str,
    source_meta: dict[str, Any],
    geometry_bundle: dict[str, Any],
    semantic_draft: dict[str, Any],
    keypoints: dict[str, list[str]],
    evidence_summary: dict[str, Any],
    review_hints: dict[str, Any],
    review_gate: dict[str, Any],
    copied_raw_geometry: list[str],
    copied_geometry_screenshots: list[str],
    copied_screenshots: list[str],
    copied_page_snapshots: list[str],
    copied_evidence_screenshots: list[str],
    page_text_excerpt: str,
) -> tuple[str, list[dict[str, str]], dict[str, Any]]:
    issues: list[dict[str, str]] = []

    if _normalize_string(source_meta.get("source_platform")) not in VALID_PLATFORMS:
        issues.append({"code": "invalid_source_platform", "severity": FAIL, "detail": route_id})
    if not bool(review_gate.get("explicit_offroad_signal")):
        issues.append({"code": "missing_offroad_signal", "severity": FAIL, "detail": route_id})
    if not bool(review_gate.get("drive_offroad_confirmed")):
        issues.append({"code": "mixed_hiking_semantics", "severity": FAIL, "detail": route_id})

    traceability_fields = [
        source_meta.get("source_route_title"),
        source_meta.get("source_identifier"),
        source_meta.get("source_capture_time"),
        source_meta.get("collection_operator"),
    ]
    if not all(_normalize_string(item) for item in traceability_fields):
        issues.append({"code": "missing_traceability", "severity": FAIL, "detail": route_id})

    if not copied_raw_geometry and not copied_geometry_screenshots:
        issues.append({"code": "missing_geometry_evidence", "severity": FAIL, "detail": route_id})

    if not (copied_screenshots or copied_page_snapshots or page_text_excerpt):
        issues.append({"code": "missing_raw_evidence", "severity": FAIL, "detail": route_id})

    if not _normalize_string(geometry_bundle.get("geometry_mode")) in VALID_GEOMETRY_MODE:
        issues.append({"code": "invalid_geometry_mode", "severity": FAIL, "detail": route_id})

    if not _normalize_string(geometry_bundle.get("source_nature")) in VALID_SOURCE_NATURE:
        issues.append({"code": "invalid_source_nature", "severity": FAIL, "detail": route_id})

    if not _normalize_string(geometry_bundle.get("geometry_confidence")) in VALID_GEOMETRY_CONFIDENCE:
        issues.append({"code": "invalid_geometry_confidence", "severity": FAIL, "detail": route_id})

    has_route_keypoints = bool(
        keypoints["entry_point_candidates"]
        or keypoints["exit_point_candidates"]
        or keypoints["retreat_candidates"]
    )
    if not has_route_keypoints:
        issues.append({"code": "missing_keypoints", "severity": WARN, "detail": route_id})

    if not _normalize_string(semantic_draft.get("applicable_prerequisites_candidate")):
        issues.append({"code": "missing_prerequisites", "severity": WARN, "detail": route_id})

    if not _normalize_string(evidence_summary.get("offroad_judgement_basis")):
        issues.append({"code": "missing_offroad_basis", "severity": FAIL, "detail": route_id})

    if not _normalize_string(evidence_summary.get("geometry_judgement_basis")):
        issues.append({"code": "missing_geometry_basis", "severity": FAIL, "detail": route_id})

    if not copied_raw_geometry and copied_geometry_screenshots:
        issues.append({"code": "export_blocked", "severity": WARN, "detail": route_id})

    if _normalize_string(geometry_bundle.get("geometry_confidence")) == "low":
        issues.append({"code": "low_geometry_confidence", "severity": WARN, "detail": route_id})

    if not _normalize_string(review_hints.get("recommended_review_priority")):
        issues.append({"code": "missing_review_priority", "severity": WARN, "detail": route_id})

    if not copied_evidence_screenshots:
        issues.append({"code": "missing_evidence_summary_shots", "severity": WARN, "detail": route_id})

    fail_count = sum(1 for item in issues if item["severity"] == FAIL)
    warn_count = sum(1 for item in issues if item["severity"] == WARN)
    if fail_count:
        status = FAIL
    elif warn_count:
        status = WARN
    else:
        status = PASS

    index_row = {
        "route_id": route_id,
        "source_identifier": _normalize_string(source_meta.get("source_identifier")),
        "source_platform": _normalize_string(source_meta.get("source_platform")),
        "source_title": _normalize_string(source_meta.get("source_route_title")),
        "region": region,
        "scene_type": _normalize_string(semantic_draft.get("scene_type_candidate")),
        "geometry_mode": _normalize_string(geometry_bundle.get("geometry_mode")),
        "source_nature": _normalize_string(geometry_bundle.get("source_nature")),
        "geometry_confidence": _normalize_string(geometry_bundle.get("geometry_confidence")),
        "review_priority": _normalize_string(review_hints.get("recommended_review_priority")),
        "has_exported_geometry": bool(copied_raw_geometry),
        "has_keypoint_candidates": has_route_keypoints,
        "has_prerequisite_candidates": bool(
            _normalize_string(semantic_draft.get("applicable_prerequisites_candidate"))
        ),
        "overall_status": status,
    }
    return status, issues, index_row


def _render_route_summary(route_draft: dict[str, Any]) -> str:
    keypoints = route_draft["keypoint_candidates"]
    qa = route_draft["qa"]
    issue_lines = [
        f"- `{item['severity']}` `{item['code']}`: {item['detail']}"
        for item in qa["issues"]
    ]
    if not issue_lines:
        issue_lines = ["- none"]
    return "\n".join(
        [
            f"# {route_draft['semantic_draft']['route_name_candidate'] or route_draft['source_meta']['source_route_title']}",
            "",
            f"- route_id: `{route_draft['route_id']}`",
            f"- status: `{qa['status']}`",
            f"- region: `{route_draft['region']}`",
            f"- scene_type: `{route_draft['semantic_draft']['scene_type_candidate']}`",
            f"- geometry_mode: `{route_draft['geometry_bundle']['geometry_mode']}`",
            f"- geometry_confidence: `{route_draft['geometry_bundle']['geometry_confidence']}`",
            f"- source_platform: `{route_draft['source_meta']['source_platform']}`",
            f"- source_identifier: `{route_draft['source_meta']['source_identifier']}`",
            "",
            "## Offroad Basis",
            route_draft["evidence_summary"]["offroad_judgement_basis"] or "N/A",
            "",
            "## Geometry Basis",
            route_draft["evidence_summary"]["geometry_judgement_basis"] or "N/A",
            "",
            "## Keypoints",
            f"- entry: {', '.join(keypoints['entry_point_candidates']) or 'N/A'}",
            f"- exit: {', '.join(keypoints['exit_point_candidates']) or 'N/A'}",
            f"- regroup_or_parking: {', '.join(keypoints['regroup_or_parking_candidates']) or 'N/A'}",
            f"- retreat: {', '.join(keypoints['retreat_candidates']) or 'N/A'}",
            f"- risk: {', '.join(keypoints['risk_point_candidates']) or 'N/A'}",
            "",
            "## QA Issues",
            *issue_lines,
        ]
    )


def _process_route(route: dict[str, Any], base_dir: Path, routes_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    route_id = _safe_slug(_normalize_string(route.get("route_id")))
    source_meta = dict(route.get("source_meta") or {})
    source_platform = _normalize_string(source_meta.get("source_platform"))
    route_namespace = _safe_slug(source_platform or "unknown")
    route_dir = routes_root / route_namespace / route_id
    raw_dir = route_dir / "raw"
    normalized_dir = route_dir / "normalized"
    draft_dir = route_dir / "draft"
    evidence_dir = route_dir / "evidence"
    qa_dir = route_dir / "qa"
    for directory in (raw_dir, normalized_dir, draft_dir, evidence_dir, qa_dir):
        directory.mkdir(parents=True, exist_ok=True)

    issues: list[dict[str, str]] = []
    geometry_bundle = dict(route.get("geometry_bundle") or {})
    semantic_draft = dict(route.get("semantic_draft") or {})
    evidence_summary = dict(route.get("evidence_summary") or {})
    review_hints = dict(route.get("review_hints") or {})
    review_gate = dict(route.get("review_gate") or {})
    keypoints = _keypoint_lists(route.get("keypoint_candidates") or {})
    raw_assets = dict(route.get("raw_assets") or {})
    region = _normalize_string(route.get("region"))

    copied_raw_geometry = _copy_files(
        _ensure_list(geometry_bundle.get("raw_geometry_files")) + _ensure_list(raw_assets.get("raw_geometry_files")),
        base_dir,
        raw_dir / "geometry",
        issues,
        "missing_raw_geometry_file",
    )
    copied_geometry_screenshots = _copy_files(
        _ensure_list(geometry_bundle.get("geometry_evidence_screenshots"))
        + _ensure_list(raw_assets.get("geometry_evidence_screenshots")),
        base_dir,
        evidence_dir / "geometry",
        issues,
        "missing_geometry_screenshot",
    )
    copied_screenshots = _copy_files(
        _ensure_list(raw_assets.get("screenshots")),
        base_dir,
        raw_dir / "screenshots",
        issues,
        "missing_screenshot",
    )
    copied_page_snapshots = _copy_files(
        _ensure_list(raw_assets.get("page_snapshot_files")),
        base_dir,
        raw_dir / "page_snapshots",
        issues,
        "missing_page_snapshot",
    )
    copied_evidence_screenshots = _copy_files(
        _ensure_list(raw_assets.get("evidence_screenshots")),
        base_dir,
        evidence_dir / "screenshots",
        issues,
        "missing_evidence_screenshot",
    )

    page_text_excerpt_lines = _normalize_list_of_strings(raw_assets.get("page_text_excerpts"))
    page_text_excerpt = "\n".join(page_text_excerpt_lines)
    if page_text_excerpt:
        _write_text(raw_dir / "page_text_excerpt.txt", page_text_excerpt + "\n")

    normalized_main_geometry = _coerce_normalized_geometry(
        geometry_bundle,
        route_dir,
        base_dir,
        copied_raw_geometry,
        copied_geometry_screenshots,
        issues,
    )

    geometry_bundle["raw_geometry_files"] = copied_raw_geometry
    geometry_bundle["geometry_evidence_screenshots"] = copied_geometry_screenshots
    geometry_bundle["normalized_main_geometry"] = normalized_main_geometry

    qa_status, qa_issues, index_row = _build_qa(
        route_id=route_id,
        region=region,
        source_meta=source_meta,
        geometry_bundle=geometry_bundle,
        semantic_draft=semantic_draft,
        keypoints=keypoints,
        evidence_summary=evidence_summary,
        review_hints=review_hints,
        review_gate=review_gate,
        copied_raw_geometry=copied_raw_geometry,
        copied_geometry_screenshots=copied_geometry_screenshots,
        copied_screenshots=copied_screenshots,
        copied_page_snapshots=copied_page_snapshots,
        copied_evidence_screenshots=copied_evidence_screenshots,
        page_text_excerpt=page_text_excerpt,
    )
    qa_issues = issues + qa_issues

    normalized_metadata = {
        "route_id": route_id,
        "adapter_id": source_platform,
        "region": region,
        "source_meta": source_meta,
        "review_gate": review_gate,
    }
    _write_json(normalized_dir / "normalized_metadata.json", normalized_metadata)

    route_draft = {
        "route_id": route_id,
        "adapter_id": source_platform,
        "region": region,
        "source_meta": source_meta,
        "geometry_bundle": geometry_bundle,
        "semantic_draft": semantic_draft,
        "keypoint_candidates": keypoints,
        "evidence_summary": evidence_summary,
        "review_hints": review_hints,
        "review_gate": review_gate,
        "qa": {
            "status": qa_status,
            "issues": qa_issues,
        },
    }
    _write_json(draft_dir / "route_draft.json", route_draft)
    _write_text(draft_dir / "route_summary.md", _render_route_summary(route_draft) + "\n")
    _write_json(qa_dir / "qa_record.json", route_draft["qa"])
    return route_draft, index_row


def _per_source_status(index_rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    per_source: dict[str, dict[str, int]] = {}
    for row in index_rows:
        source = row["source_platform"] or "unknown"
        stats = per_source.setdefault(
            source,
            {"total": 0, "pass": 0, "warn": 0, "fail": 0, "qualified": 0},
        )
        stats["total"] += 1
        stats[row["overall_status"].lower()] += 1
        if row["overall_status"] in {PASS, WARN}:
            stats["qualified"] += 1
    return per_source


def _render_collection_log(manifest: dict[str, Any], route_drafts: list[dict[str, Any]]) -> str:
    context = dict(manifest.get("collection_context") or {})
    per_source: dict[str, int] = {}
    for draft in route_drafts:
        source = _normalize_string(draft["source_meta"].get("source_platform")) or "unknown"
        per_source[source] = per_source.get(source, 0) + 1
    lines = [
        "# Collection Log",
        "",
        f"- run_id: `{manifest.get('run_id', '')}`",
        f"- generated_at: `{_now_iso()}`",
        f"- source_platform: `{context.get('source_platform', 'mixed')}`",
        f"- collection_operator: `{context.get('collection_operator', '')}`",
        f"- capture_device: `{context.get('capture_device', '')}`",
        f"- selection_rule_version: `{context.get('selection_rule_version', '')}`",
        "",
        "## Source Breakdown",
    ]
    if per_source:
        for source, count in sorted(per_source.items()):
            lines.append(f"- `{source}`: `{count}` routes")
    else:
        lines.append("- no accepted routes recorded")
    lines.extend(
        [
            "",
        "## Search Log",
        ]
    )
    search_log = _ensure_list(context.get("search_log"))
    if search_log:
        for item in search_log:
            if isinstance(item, dict):
                lines.append(
                    f"- `{item.get('step', item.get('query', 'step'))}`: {item.get('note', '')}".rstrip()
                )
            else:
                lines.append(f"- {item}")
    else:
        lines.append("- no search log recorded")
    lines.extend(["", "## Accepted Routes"])
    for draft in route_drafts:
        lines.append(
            f"- `{draft['route_id']}` `{draft['qa']['status']}` {draft['source_meta'].get('source_route_title', '')}"
        )
    return "\n".join(lines)


def _render_qa_summary(index_rows: list[dict[str, Any]], qa_issues: list[dict[str, Any]]) -> str:
    total = len(index_rows)
    pass_count = sum(1 for row in index_rows if row["overall_status"] == PASS)
    warn_count = sum(1 for row in index_rows if row["overall_status"] == WARN)
    fail_count = sum(1 for row in index_rows if row["overall_status"] == FAIL)
    per_source = _per_source_status(index_rows)
    lines = [
        "# QA Summary",
        "",
        f"- total_routes: `{total}`",
        f"- pass_routes: `{pass_count}`",
        f"- warn_routes: `{warn_count}`",
        f"- fail_routes: `{fail_count}`",
        "",
        "## Source Breakdown",
    ]
    if per_source:
        for source, stats in sorted(per_source.items()):
            lines.append(
                f"- `{source}` total={stats['total']} pass={stats['pass']} warn={stats['warn']} fail={stats['fail']} qualified={stats['qualified']}"
            )
    else:
        lines.append("- none")
    lines.extend(
        [
            "",
        "## Route Status",
        ]
    )
    for row in index_rows:
        lines.append(
            f"- `{row['source_platform']}/{row['route_id']}` `{row['overall_status']}` `{row['source_title']}`"
        )
    lines.extend(["", "## Issues"])
    if qa_issues:
        for issue in qa_issues:
            lines.append(
                f"- `{issue['severity']}` `{issue['code']}` `{issue['route_id']}`: {issue['detail']}"
            )
    else:
        lines.append("- none")
    return "\n".join(lines)


def run_pipeline(manifest_path: Path, output_root: Path, overwrite: bool = False) -> dict[str, Any]:
    if output_root.exists():
        if not overwrite and any(output_root.iterdir()):
            raise FileExistsError(f"output root already exists and is not empty: {output_root}")
    output_root.mkdir(parents=True, exist_ok=True)

    manifest = _read_json(manifest_path)
    base_dir = manifest_path.parent.resolve()
    routes_root = output_root / "routes"
    routes_root.mkdir(parents=True, exist_ok=True)

    route_drafts: list[dict[str, Any]] = []
    index_rows: list[dict[str, Any]] = []
    all_issues: list[dict[str, Any]] = []
    for route in _ensure_list(manifest.get("routes")):
        if not isinstance(route, dict):
            continue
        draft, row = _process_route(route, base_dir, routes_root)
        route_drafts.append(draft)
        index_rows.append(row)
        for issue in draft["qa"]["issues"]:
            all_issues.append(
                {
                    "route_id": draft["route_id"],
                    "source_platform": draft["source_meta"].get("source_platform", ""),
                    "source_identifier": draft["source_meta"].get("source_identifier", ""),
                    **issue,
                }
            )

    fieldnames = [
        "route_id",
        "source_identifier",
        "source_platform",
        "source_title",
        "region",
        "scene_type",
        "geometry_mode",
        "source_nature",
        "geometry_confidence",
        "review_priority",
        "has_exported_geometry",
        "has_keypoint_candidates",
        "has_prerequisite_candidates",
        "overall_status",
    ]
    with (output_root / "route_index.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(index_rows)

    _write_json(output_root / "route_index.json", index_rows)
    _write_json(output_root / "qa_issues.json", all_issues)
    _write_text(output_root / "collection_log.md", _render_collection_log(manifest, route_drafts) + "\n")
    _write_text(output_root / "qa_summary.md", _render_qa_summary(index_rows, all_issues) + "\n")
    per_source = _per_source_status(index_rows)
    quota_per_source = int((manifest.get("collection_context") or {}).get("quota_per_source", 10))

    run_manifest = {
        "module_id": MODULE_ID,
        "schema_version": "20260327_v1",
        "adapter_allowlist": sorted(VALID_PLATFORMS),
        "run_id": manifest.get("run_id", output_root.name),
        "generated_at": _now_iso(),
        "git_head": _git_head(),
        "manifest_path": str(manifest_path.resolve()),
        "output_root": str(output_root.resolve()),
        "route_count": len(index_rows),
        "status_summary": {
            "pass": sum(1 for row in index_rows if row["overall_status"] == PASS),
            "warn": sum(1 for row in index_rows if row["overall_status"] == WARN),
            "fail": sum(1 for row in index_rows if row["overall_status"] == FAIL),
        },
        "per_source_status": per_source,
        "required_sources": sorted(VALID_PLATFORMS),
        "quota_per_source": quota_per_source,
        "quota_gap_by_source": {
            source: max(0, quota_per_source - per_source.get(source, {}).get("qualified", 0))
            for source in sorted(VALID_PLATFORMS)
        },
        "collection_context": manifest.get("collection_context", {}),
    }
    _write_json(output_root / "run_manifest.json", run_manifest)
    _write_json(output_root / "source_manifest.json", manifest)
    return run_manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output-root", required=True)
    parser.add_argument("--overwrite", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    run_manifest = run_pipeline(
        manifest_path=Path(args.manifest).resolve(),
        output_root=Path(args.output_root).resolve(),
        overwrite=args.overwrite,
    )
    print(json.dumps(run_manifest["status_summary"], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
