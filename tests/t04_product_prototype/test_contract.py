from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_t04_module_surface_exists() -> None:
    module_root = REPO_ROOT / "modules" / "t04_product_prototype"
    assert (module_root / "README.md").exists()
    assert (module_root / "INTERFACE_CONTRACT.md").exists()
    assert (module_root / "history" / "20260329_t04_launch" / "T04_PRECHECK.md").exists()
    assert (module_root / "history" / "20260329_t04_r2" / "T04_R2_PRECHECK.md").exists()
    assert (module_root / "history" / "20260329_t04_r2" / "T04_R2_PLAN.md").exists()
    assert (module_root / "history" / "20260329_t04_r2" / "T04_R2_EXEC_SUMMARY.md").exists()


def test_t04_webapp_scripts_follow_standard_names() -> None:
    package_json = REPO_ROOT / "src" / "validation_foundry" / "modules" / "t04_product_prototype" / "webapp" / "package.json"
    package = json.loads(package_json.read_text(encoding="utf-8"))
    scripts = package["scripts"]
    for name in ("dev", "build", "storybook", "build-storybook", "test", "test:smoke"):
        assert name in scripts
