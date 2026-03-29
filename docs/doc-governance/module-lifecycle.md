# 模块生命周期

## 1. 文档目的

本文档用于定义本仓库业务模块的生命周期状态，明确哪些模块属于当前正式治理对象、哪些已经退役、哪些只保留为历史参考。

`modules/_template/` 不是业务模块，不纳入本生命周期表。

## 2. 状态定义

### Active

- 当前正式治理与迭代对象

### Retired

- 不再作为当前活跃模块治理对象
- 保留历史实现与文档

### Historical Reference

- 不再作为当前正式模块
- 保留为历史经验与证据来源

### Support Retained

- 当前保留的支撑或实验模块
- 不属于正式业务模块集合

## 3. 当前模块状态表

### Active

| 模块 ID | 路径 | 当前正式范围 | 当前状态 |
|---|---|---|---|
| `t01_pickup_point_validation` | `modules/t01_pickup_point_validation` | 虚拟手机环境下上车点坐标验证；当前按 `Phase 0-6` 持续推进，并以 `Phase 2 Single-Point Success` 为当前主线 | `phase2-single-point-in-progress` |

### Retired

当前无。

### Historical Reference

| 模块 ID | 路径 | 历史保留原因 | 当前状态 |
|---|---|---|---|
| `t02_route_coldstart` | `modules/t02_route_coldstart` | 本地冷启动、草案打包与 QA 流水线成果已完成首轮沉淀，但不属于当前正式业务模块集合；保留文档、代码与样例作为历史参考 | `historical-reference-frozen-20260329` |
| `t03_route_trip_experience` | `modules/t03_route_trip_experience` | 基于 T02 样例的媒体化与原型成果已完成首轮闭环，但不属于当前正式业务模块集合；保留文档、代码与样例作为历史参考 | `historical-reference-frozen-20260329` |

### Support Retained

当前无。

说明：

- 未在本表登记的模块目录，不自动视为当前正式治理对象。
- `t01_pickup_point_validation` 当前只完成文档与治理基线，不等于已经完成环境、链路或坐标提取闭环。
- `t02_route_coldstart` 与 `t03_route_trip_experience` 已于 `2026-03-29` 从 `Active` 收口到 `Historical Reference`，用于保留首轮成果与复盘证据，不再作为当前正式治理对象。
- 历史参考模块当前保留在原路径，避免打断既有引用、代码检索和结果复盘；若未来需要再次激活，应先更新本表与项目级源事实。

## 4. 模板目录说明

- `modules/_template/` 是模块启动模板
- 它不是 `Active`、`Retired`、`Historical Reference` 或 `Support Retained` 中的任何一种
- 不能把模板目录误当成已经存在的业务模块
