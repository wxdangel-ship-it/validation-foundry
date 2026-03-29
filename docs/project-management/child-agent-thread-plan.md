# 子线程拆解方案

## 1. 总体原则

- 主线程负责：规格、计划、调度、gate、冲突消解、最终合并
- 子线程负责：单一子问题闭环
- 每个子线程只改自己拥有的文件
- 项目级状态文件由主线程统一回写

## 2. 本轮线程分工

| 子 Agent | 职责 | 产物 | 当前状态 |
|---|---|---|---|
| A | Repo Remediation、迁移、路径纠偏 | `docs/project-management/restart-remediation-report.md`、`modules/t01_pickup_point_validation/history/012-20260328-repo-remediation-inventory.md` | 已完成 |
| B | ADB、设备、launcher、focus、UI dump、screencap smoke | `modules/t01_pickup_point_validation/history/013-20260328-runtime-smoke-notes.md` | 已完成 |
| C | 滴滴链路重新定性与方法判断 | `modules/t01_pickup_point_validation/history/014-20260328-didi-method-probe.md` | 已完成 |
| D | 高德方法排序与主线建议 | `modules/t01_pickup_point_validation/history/015-20260328-amap-method-probe.md` | 已完成 |
| E | `tip_px -> GCJ-02` 求解方法比较 | `modules/t01_pickup_point_validation/history/016-20260328-coordinate-solving-methods.md` | 已完成 |
| F | QA schema、evidence_dir、方法比较 | `modules/t01_pickup_point_validation/history/017-20260328-qa-results-schema-and-method-comparison.md` | 已完成 |

## 3. 主线程当前责任

- 复核 Phase 0 纠偏是否自洽
- 把 `current-status / current-phase-plan / spec / plan / tasks` 改到本轮合同
- 把 `provider + method + confidence` 写进正式契约面
- 统一方法组合表与主线选择
- 给出“是否能冲击 Phase 2”的正式判断

## 4. 并发限制

- 子线程不得同时改 `current-status.md`
- 子线程不得同时改 `current-phase-plan.md`
- 子线程不得同时改 `specs/t01-pickup-point-validation/*`
- 子线程不得覆盖其他子线程已落定的结论
- 业务实验类子线程只写自己的 history 文件

## 5. 当前结论

- Phase 0 迁移与治理线程已经把 source-of-truth 边界立住
- 运行时线程已经确认当前不是设备或 ADB 阻塞
- 滴滴线程已把当前状态从 `BLOCKED` 改判为 `FAIL`
- 高德、坐标求解、QA 三条线程对主线排序已达成一致：
  - 第一主线：`amap + hybrid`
  - 第二主线：`amap + visual_tip`
