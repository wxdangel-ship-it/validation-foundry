# 当前模块盘点

## 范围

- 盘点日期：`2026-03-29`
- 目的：说明当前仓库正式业务模块现状、模块文档面状态与模板资产状态

## 当前正式生命周期结论

- `Active`：
  - `t01_pickup_point_validation`
- `Historical Reference`：
  - `t02_route_coldstart`
  - `t03_route_trip_experience`
- `Retired`：无
- `Support Retained`：无

## 当前 Active 模块

| 模块 ID | 路径 | 当前正式范围 | 当前文档面状态 | 当前实现状态 | 备注 |
|---|---|---|---|---|---|
| `t01_pickup_point_validation` | `modules/t01_pickup_point_validation` | 虚拟定位、应用定位按钮链路、上车点坐标提取、golden set、批量执行的分阶段治理与实现 | 已补齐 `architecture/*`、`INTERFACE_CONTRACT.md`、`AGENTS.md`、`README.md`、`RUNBOOK.md`、`FAILURE_TAXONOMY.md`，并已积累 Phase 1-2 过程证据 | 当前处于 `Phase 2 Single-Point Success / in-progress` | 当前唯一正式业务模块 |

## 当前 Historical Reference 模块

| 模块 ID | 路径 | 历史保留范围 | 当前文档面状态 | 当前实现状态 | 备注 |
|---|---|---|---|---|---|
| `t02_route_coldstart` | `modules/t02_route_coldstart` | 保留两步路 Route 草案冷启动、打包与 QA 首轮成果，用于复盘与后续按需复用 | 标准模块文档面保留完整 | 首版打包与 QA 流水线已沉淀；当前不继续作为正式模块推进 | 已于 `2026-03-29` 归档为历史参考 |
| `t03_route_trip_experience` | `modules/t03_route_trip_experience` | 保留基于 T02 样例的 Route/Trip 媒体化与交互原型首轮成果，用于复盘与演示素材回查 | 标准模块文档面保留完整，`history/20260328_t03_launch/` 为首轮冻结包 | 首轮闭环已完成；当前不继续作为正式模块推进 | 已于 `2026-03-29` 归档为历史参考 |

## 特殊模板资产

| 名称 | 路径 | 当前状态 | 当前定位 | 当前文档面状态 | 推荐动作 | 备注 |
|---|---|---|---|---|---|---|
| `_template` | `modules/_template` | `template-artifact` | 新模块启动模板 | 已提供标准文档契约骨架 | 后续新模块启动时复制并具体化 | 不属于业务模块生命周期 |

## 当前结论

1. 当前仓库唯一正式业务模块是 `t01_pickup_point_validation`。
2. `t02_route_coldstart` 与 `t03_route_trip_experience` 已归档为 `Historical Reference`，保留首轮成果但不再视为当前正式模块。
3. `_template` 继续承担后续模块启动模板职责。
