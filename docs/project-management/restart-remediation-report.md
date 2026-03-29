# T01 Repo Remediation Report

- 记录日期：`2026-03-28`
- 作用范围：`Phase 0 Repo Remediation`
- 当前唯一 source of truth：`/mnt/e/Work/validation-foundry`
- 目标：把 `C:\Users\admin` 下与 `validation-foundry/T01` 相关的高价值资产收拢到仓库侧，隔离错误工作区，并修正活跃路径引用

## 1. 结论

`Phase 0 Repo Remediation` 已完成。

当前仓库内已经形成清晰边界：

1. 活跃事实源：
   - `/mnt/e/Work/validation-foundry`
2. 历史导入：
   - `outputs/_legacy_import/20260328_repo_remediation/`
   - `outputs/_legacy_import/20260328_t01_thread_restart/`
3. 研究归档：
   - `research/archive/t01_pickup_point_validation/20260328_thread_restart/`
4. 受控 fork：
   - `third_party/mockgps_fork/`

## 2. 已迁入资产

| 来源路径 | 目标路径 | 处理 |
|---|---|---|
| `C:\Users\admin\vf_stage\20260327_t01_thread_restart_handoff.md` | `docs/project-management/history/20260327-t01-thread-restart-handoff.md` 与 `outputs/_legacy_import/20260328_repo_remediation/handoff/20260327_t01_thread_restart_handoff.md` | 迁入，作为历史事实输入 |
| `C:\Users\admin\vf_stage\vf_stage_tree_20260327.txt` | `outputs/_legacy_import/20260328_repo_remediation/inventory/vf_stage_tree_20260327.txt` | 迁入，作为错误工作区盘点索引 |
| `C:\Users\admin\vf_stage\didi_package_dump_20260327.txt` | `outputs/_legacy_import/20260328_repo_remediation/inventory/didi_package_dump_20260327.txt` | 迁入，作为滴滴包信息索引 |
| `C:\Users\admin\vf_stage\20260327_t01_logged_in_gps_only_blocked\*` 摘要文件 | `outputs/_legacy_import/20260328_repo_remediation/evidence/20260327_t01_logged_in_gps_only_blocked/` | 迁入，作为历史阻塞摘要 |
| `C:\Users\admin\vf_stage\20260327_t01_real_device_blocked\*` 摘要文件 | `outputs/_legacy_import/20260328_repo_remediation/evidence/20260327_t01_real_device_blocked/` | 迁入，作为历史阻塞摘要 |
| `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_visual_forensics\*` | `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_amap_visual_forensics/` | 迁入，作为高德显式 tip 资产 |
| `C:\Users\admin\vf_stage\outputs\20260327_t01_gate_coord_estimation_v1\*` | `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/` | 迁入，作为局部反算资产 |
| `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_golden10\*` | `outputs/_work/20260327_t01_amap_batch_golden10/` | 迁入，修复 legacy batch `evidence_dir` |
| `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_gs08_rerun\*` | `outputs/_work/20260327_t01_amap_batch_gs08_rerun/` | 迁入，修复 legacy batch `evidence_dir` |
| `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_tail2\*` | `outputs/_work/20260327_t01_amap_batch_tail2/` | 迁入，修复 legacy batch `evidence_dir` |
| `C:\Users\admin\vf_stage\20260327_t01_mockgps_foreground_keepalive_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_mockgps_foreground_keepalive_probe_v1/` | 迁入，作为 MockGps 保活资产 |
| `C:\Users\admin\vf_stage\20260327_t01_amap_with_fixed_mockgps_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_with_fixed_mockgps_probe_v1/` | 迁入，作为高德当前版不跟 mock 资产 |
| `C:\Users\admin\vf_stage\20260327_t01_didi_with_fixed_mockgps_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_didi_with_fixed_mockgps_probe_v1/` | 迁入，作为滴滴入口恢复资产 |
| `C:\Users\admin\vf_stage\20260327_t01_amap_explicit_pickup_probe\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_explicit_pickup_probe/` | 迁入，作为显式 tip 回放资产 |
| `C:\Users\admin\vf_stage\20260327_t01_amap_home_two_point_gs05_gs09_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_home_two_point_gs05_gs09_v1/` | 迁入，作为双锚点资产 |
| `C:\Users\admin\vf_stage\20260327_t01_screen_geometry_fallback\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_screen_geometry_fallback/` | 迁入，作为 fallback 研究资产 |
| `C:\Users\admin\vf_stage\apk_probe\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/apk_probe/` | 迁入，作为历史 APK 归档 |
| `C:\Users\admin\MockGps-src\*` 受控源代码快照 | `third_party/mockgps_fork/MockGps-src/` | 迁入，作为受控 fork 快照 |
| `C:\Users\admin\MockGps-src\app\build\outputs\apk\debug\app-debug.apk` | `third_party/mockgps_fork/apk/app-debug.apk` | 迁入，作为当前调试 APK |

## 3. 已修正的活跃引用

- `modules/t01_pickup_point_validation/scripts/README.md`
- `outputs/_work/20260327_t01_amap_batch_final/results.csv`
- `outputs/_work/20260327_t01_amap_batch_final/evidence_tail/results.csv`
- `outputs/_work/20260327_t01_amap_batch_final/evidence_gs08_rerun/results.csv`
- `outputs/_work/20260327_t01_amap_recheck_10/recheck_results.csv`
- `outputs/_work/20260327_t01_real_device_blocked/summary.json`

## 4. 历史归档与忽略策略

- `C:\Users\admin\vf_repo_updates\*`
  - 视为历史归档
  - 不再作为活跃输入
- `C:\Users\admin\validation-foundry-staging\*`
  - 当前无可识别有效内容
  - 不迁入
- `MockGps-src` 的 `.gradle / .idea / build cache`
  - 不迁入

## 5. 错误工作区隔离方案

1. `C:\Users\admin\vf_stage` 和 `C:\Users\admin\MockGps-src` 继续保留为历史来源，但不再写入新实验。
2. 后续新增证据、导出、总结、脚本与实现，全部落到仓库侧。
3. 若需要回看旧证据，优先看仓库侧导入或 archive，不直接把 C 盘目录当 source-of-truth。

## 6. Gate

- `Phase 0 Repo Remediation`：`PASS`
