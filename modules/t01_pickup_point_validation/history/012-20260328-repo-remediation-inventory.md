# 20260328 Repo Remediation Inventory

## 目的

记录 T01 线程重启时从 `C:\Users\admin` 侧识别出的高价值历史资产，以及它们在仓库侧的落点。

## 迁入清单

| 类别 | 来源路径 | 目标路径 | 决策 | 说明 |
|---|---|---|---|---|
| 历史 handoff | `C:\Users\admin\vf_stage\20260327_t01_thread_restart_handoff.md` | `docs/project-management/history/20260327-t01-thread-restart-handoff.md` | 迁入 | 历史事实输入 |
| 工作区树 | `C:\Users\admin\vf_stage\vf_stage_tree_20260327.txt` | `outputs/_legacy_import/20260328_repo_remediation/inventory/vf_stage_tree_20260327.txt` | 迁入 | 错误工作区索引 |
| 滴滴包信息 | `C:\Users\admin\vf_stage\didi_package_dump_20260327.txt` | `outputs/_legacy_import/20260328_repo_remediation/inventory/didi_package_dump_20260327.txt` | 迁入 | launcher / 包信息索引 |
| 历史阻塞摘要 | `C:\Users\admin\vf_stage\20260327_t01_logged_in_gps_only_blocked\*` 摘要文件 | `outputs/_legacy_import/20260328_repo_remediation/evidence/20260327_t01_logged_in_gps_only_blocked/` | 迁入 | 阻塞摘要 |
| 历史阻塞摘要 | `C:\Users\admin\vf_stage\20260327_t01_real_device_blocked\*` 摘要文件 | `outputs/_legacy_import/20260328_repo_remediation/evidence/20260327_t01_real_device_blocked/` | 迁入 | 阻塞摘要 |
| 高德显式 tip | `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_visual_forensics\*` | `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_amap_visual_forensics/` | 迁入 | 显式 tip 历史资产 |
| 高德局部反算 | `C:\Users\admin\vf_stage\outputs\20260327_t01_gate_coord_estimation_v1\*` | `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/` | 迁入 | 局部双锚点资产 |
| legacy batch 证据 | `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_golden10\*` | `outputs/_work/20260327_t01_amap_batch_golden10/` | 迁入 | 修复旧结果表证据路径 |
| legacy batch 证据 | `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_gs08_rerun\*` | `outputs/_work/20260327_t01_amap_batch_gs08_rerun/` | 迁入 | 修复旧结果表证据路径 |
| legacy batch 证据 | `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_batch_tail2\*` | `outputs/_work/20260327_t01_amap_batch_tail2/` | 迁入 | 修复旧结果表证据路径 |
| MockGps 保活 probe | `C:\Users\admin\vf_stage\20260327_t01_mockgps_foreground_keepalive_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_mockgps_foreground_keepalive_probe_v1/` | 迁入 | 回放资产 |
| 高德不跟 mock probe | `C:\Users\admin\vf_stage\20260327_t01_amap_with_fixed_mockgps_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_with_fixed_mockgps_probe_v1/` | 迁入 | 回放资产 |
| 滴滴入口恢复 probe | `C:\Users\admin\vf_stage\20260327_t01_didi_with_fixed_mockgps_probe_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_didi_with_fixed_mockgps_probe_v1/` | 迁入 | 回放资产 |
| 高德显式 tip probe | `C:\Users\admin\vf_stage\20260327_t01_amap_explicit_pickup_probe\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_explicit_pickup_probe/` | 迁入 | 回放资产 |
| 高德双锚点 probe | `C:\Users\admin\vf_stage\20260327_t01_amap_home_two_point_gs05_gs09_v1\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_home_two_point_gs05_gs09_v1/` | 迁入 | 回放资产 |
| fallback 研究资产 | `C:\Users\admin\vf_stage\20260327_t01_screen_geometry_fallback\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_screen_geometry_fallback/` | 迁入 | 回放资产 |
| 历史 APK 归档 | `C:\Users\admin\vf_stage\apk_probe\*` | `research/archive/t01_pickup_point_validation/20260328_thread_restart/apk_probe/` | 迁入 | 仅作归档 |
| MockGps 受控 fork | `C:\Users\admin\MockGps-src\*` 的受控快照 | `third_party/mockgps_fork/MockGps-src/` | 迁入 | 受控 fork |
| MockGps 调试 APK | `C:\Users\admin\MockGps-src\app\build\outputs\apk\debug\app-debug.apk` | `third_party/mockgps_fork/apk/app-debug.apk` | 迁入 | 当前调试 APK |

## 忽略或不迁入

| 来源路径 | 决策 | 原因 |
|---|---|---|
| `C:\Users\admin\vf_repo_updates\*` | 不迁入 | 活跃片段已由仓库文档接管 |
| `C:\Users\admin\validation-foundry-staging\*` | 不迁入 | 当前无可识别有效内容 |
| `C:\Users\admin\MockGps-src\.gradle\*` | 不迁入 | 构建缓存 |
| `C:\Users\admin\MockGps-src\.idea\*` | 不迁入 | IDE 私有状态 |
| `C:\Users\admin\MockGps-src\build cache` | 不迁入 | 可重建且噪声高 |

## 迁移原则

- 只迁入能解释当前决策、能支撑当前主线、或能修复现有证据路径的材料
- 大体积历史 probe 允许进入 `research/archive/`，但它们不是活跃事实源
- 历史工作区继续保留在 C 盘，但不再允许追加写入
