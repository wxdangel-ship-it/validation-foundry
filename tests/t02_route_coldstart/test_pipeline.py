from __future__ import annotations

import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "src"))

from validation_foundry.modules.t02_route_coldstart.pipeline import main  # noqa: E402


def test_pipeline_builds_route_bundle(tmp_path: Path) -> None:
    source_dir = tmp_path / "source"
    source_dir.mkdir()
    (source_dir / "route.gpx").write_text("<gpx></gpx>\n", encoding="utf-8")
    (source_dir / "list.png").write_text("png\n", encoding="utf-8")
    (source_dir / "detail.png").write_text("png\n", encoding="utf-8")
    (source_dir / "track.png").write_text("png\n", encoding="utf-8")
    (source_dir / "detail.xml").write_text("<xml />\n", encoding="utf-8")

    manifest = {
        "run_id": "20260327_t02_smoke",
        "collection_context": {
            "source_platform": "2bulu",
            "collection_operator": "codex",
            "capture_device": "test-device",
            "selection_rule_version": "20260327_v1",
            "search_log": ["类型 -> 越野车"],
        },
        "routes": [
            {
                "route_id": "route_001",
                "region": "新疆",
                "source_meta": {
                    "source_platform": "2bulu",
                    "source_route_title": "沙漠穿越示例线",
                    "source_route_url": "",
                    "source_identifier": "NO.1001",
                    "source_author": "tester",
                    "source_capture_time": "2026-03-27T10:00:00+08:00",
                    "collection_operator": "codex",
                    "acquisition_mode": "mixed",
                },
                "geometry_bundle": {
                    "raw_geometry_files": ["source/route.gpx"],
                    "geometry_evidence_screenshots": ["source/track.png"],
                    "geometry_mode": "exported_track",
                    "source_nature": "likely_actual",
                    "geometry_confidence": "high",
                    "length_km_candidate": "36.5",
                    "start_end_candidate": "营地A -> 营地B",
                },
                "semantic_draft": {
                    "route_name_candidate": "沙漠穿越示例线",
                    "short_description_candidate": "四驱车辆穿越沙漠和营地补给点，属于典型驾车越野路线。",
                    "scene_type_candidate": "穿越",
                    "terrain_tags": ["越野车", "沙漠", "营地"],
                    "difficulty_candidate": "中等",
                    "duration_candidate": "1天",
                    "applicable_prerequisites_candidate": "四驱车辆、两车以上结伴、备胎与补水",
                },
                "keypoint_candidates": {
                    "entry_point_candidates": ["营地A停车区"],
                    "exit_point_candidates": ["营地B出口"],
                    "regroup_or_parking_candidates": ["中段营地补给点"],
                    "retreat_candidates": ["沙丘回撤岔口"],
                    "risk_point_candidates": ["流沙区", "软沙坡顶"],
                },
                "evidence_summary": {
                    "offroad_judgement_basis": "详情页强调四驱穿越、营地补给和沙地路况，主体明确是驾车越野。",
                    "geometry_judgement_basis": "已导出 GPX，并保留轨迹截图作为几何回查证据。",
                    "route_variants_note": "存在一处分叉绕行线，需人工复核主线。",
                    "entry_exit_clarity_note": "起终点在详情页和轨迹页均可回查。",
                    "planning_line_risk_note": "暂未见明显规划线嫌疑。",
                },
                "review_hints": {
                    "open_questions": ["分叉线是否季节性封闭"],
                    "missing_items": [],
                    "conflict_notes": [],
                    "recommended_review_priority": "high",
                },
                "review_gate": {
                    "explicit_offroad_signal": True,
                    "drive_offroad_confirmed": True,
                    "detail_assessment_notes": "标题、标签和描述都支持驾车越野。",
                },
                "raw_assets": {
                    "screenshots": ["source/list.png", "source/detail.png", "source/track.png"],
                    "page_snapshot_files": ["source/detail.xml"],
                    "page_text_excerpts": ["越野车", "四驱穿越", "营地补给"],
                    "evidence_screenshots": ["source/detail.png", "source/track.png"],
                },
            }
        ],
    }
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    output_root = tmp_path / "out"
    exit_code = main(["--manifest", str(manifest_path), "--output-root", str(output_root)])
    assert exit_code == 0

    route_draft = json.loads(
        (output_root / "routes" / "2bulu" / "route_001" / "draft" / "route_draft.json").read_text(
            encoding="utf-8"
        )
    )
    assert route_draft["qa"]["status"] == "PASS"
    assert (output_root / "route_index.csv").exists()
    assert (output_root / "run_manifest.json").exists()
    assert (output_root / "qa_summary.md").exists()
    run_manifest = json.loads((output_root / "run_manifest.json").read_text(encoding="utf-8"))
    assert run_manifest["per_source_status"]["2bulu"]["qualified"] == 1
