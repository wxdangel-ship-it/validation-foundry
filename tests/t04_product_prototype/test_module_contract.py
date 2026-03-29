from __future__ import annotations

import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "src"))


def test_t04_module_doc_surface_exists() -> None:
    module_root = REPO_ROOT / "modules" / "t04_product_prototype"
    for relative_path in (
        "README.md",
        "AGENTS.md",
        "INTERFACE_CONTRACT.md",
        "RUNBOOK.md",
        "FAILURE_TAXONOMY.md",
        "architecture/01-introduction-and-goals.md",
        "history/20260329_t04_launch/T04_PRECHECK.md",
        "history/20260329_t04_launch/T04_PLAN.md",
        "history/20260329_t04_r2/T04_R2_PRECHECK.md",
        "history/20260329_t04_r2/T04_R2_PLAN.md",
        "history/20260329_t04_r2/T04_R2_PRODUCT_SCOPE.md",
        "history/20260329_t04_r2/T04_R2_PAGE_MATRIX.md",
        "history/20260329_t04_r2/T04_R2_STORYBOOK_MATRIX.md",
        "history/20260329_t04_r2/T04_R2_IA.md",
        "history/20260329_t04_r2/T04_R2_WIREFRAME.md",
        "history/20260329_t04_r2/T04_R2_ARCHITECTURE.md",
        "history/20260329_t04_r2/T04_R2_STATE_MODEL.md",
        "history/20260329_t04_r2/T04_R2_DATA_CONTRACT.md",
        "history/20260329_t04_r2/T04_R2_TEST_PLAN.md",
        "history/20260329_t04_r2/T04_R2_ACCEPTANCE_CHECKLIST.md",
        "history/20260329_t04_r2/T04_R2_QA_REPORT.md",
        "history/20260329_t04_r2/T04_R2_EXEC_SUMMARY.md",
    ):
        assert (module_root / relative_path).exists(), relative_path


def test_t04_webapp_scripts_and_story_exist() -> None:
    webapp_root = REPO_ROOT / "src" / "validation_foundry" / "modules" / "t04_product_prototype" / "webapp"
    package_json = json.loads((webapp_root / "package.json").read_text(encoding="utf-8"))
    assert package_json["scripts"]["dev"] == "vite"
    assert package_json["scripts"]["build"] == "vite build"
    assert package_json["scripts"]["storybook"].startswith("storybook dev")
    assert package_json["scripts"]["build-storybook"] == "storybook build"
    assert (webapp_root / "src" / "stories" / "t04-flows.stories.tsx").exists()


def test_t04_webapp_sample_and_entry_exist() -> None:
    webapp_root = REPO_ROOT / "src" / "validation_foundry" / "modules" / "t04_product_prototype" / "webapp"
    assert (webapp_root / "src" / "App.tsx").exists()
    assert (webapp_root / "src" / "state" / "prototype-machine.ts").exists()
    assert (webapp_root / "src" / "mocks" / "sample-data.ts").exists()
    assert (webapp_root / "public" / "demo-data.json").exists()
