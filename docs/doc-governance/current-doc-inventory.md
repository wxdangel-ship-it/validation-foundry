# 当前文档盘点

## 范围

- 盘点日期：`2026-03-29`
- 目的：说明当前主阅读路径、标准文档位置、正式模块文档面与模板入口

## 当前主入口文档

| 路径 | 当前角色 | 主要属性 | 说明 |
|---|---|---|---|
| `AGENTS.md` | repo 级 durable guidance 入口 | `durable_guidance` | 只保留仓库级稳定规则 |
| `SPEC.md` | 项目级总规格入口 | `source_of_truth` | 项目级最高优先级规格 |
| `.specify/memory/constitution.md` | 宪章 | `constitution` | 约束长期文档与流程原则 |
| `docs/PROJECT_BRIEF.md` | 项目摘要入口 | `source_of_truth` / `digest` | 提供稳定摘要 |
| `docs/ARTIFACT_PROTOCOL.md` | 证据包协议 | `source_of_truth` | 约束运行证据形态 |
| `docs/architecture/*.md` | 项目级长期架构说明 | `source_of_truth` | 项目级长期真相主表面 |
| `docs/doc-governance/*.md` | 治理入口与盘点 | `source_of_truth` / `durable_guidance` | 定义生命周期、盘点与阅读顺序 |
| `docs/repository-metadata/*.md` | 仓库结构与入口治理 | `durable_guidance` | 约束目录职责与入口边界 |
| `docs/project-management/*.md` | 阶段推进与状态记忆 | `source_of_truth` / `active_delivery_control` | 承载 phase plan、status、gate 与子线程计划 |

## 当前正式模块文档面

| 路径 | 当前角色 | 主要属性 | 说明 |
|---|---|---|---|
| `modules/t01_pickup_point_validation/architecture/*` | T01 长期架构真相 | `source_of_truth` | T01 正式模块长期文档主表面 |
| `modules/t01_pickup_point_validation/INTERFACE_CONTRACT.md` | T01 稳定契约面 | `source_of_truth` | 固化输入、输出、失败口径、稳定判据与验收边界 |
| `modules/t01_pickup_point_validation/README.md` | T01 操作者入口 | `operator_guide` | 说明模块定位、当前阶段和阅读顺序 |
| `modules/t01_pickup_point_validation/RUNBOOK.md` | T01 复现实验说明 | `operator_guide` | 说明阶段性运行与复现路径 |
| `modules/t01_pickup_point_validation/FAILURE_TAXONOMY.md` | T01 失败分型 | `source_of_truth` | 定义 `FAIL/BLOCKED` 的分类口径 |
| `modules/t01_pickup_point_validation/AGENTS.md` | T01 durable guidance | `durable_guidance` | 只保留模块级执行边界与协作规则 |
| `modules/t01_pickup_point_validation/history/*` | T01 历史材料 | `history` | 记录 bootstrap 与后续演进轨迹 |
| `specs/t01-pickup-point-validation/*` | T01 变更工件 | `active_change_artifact` | 当前 bootstrap 变更的规格、计划与任务 |

## 当前历史参考模块文档面

| 路径 | 当前角色 | 主要属性 | 说明 |
|---|---|---|---|
| `modules/t02_route_coldstart/architecture/*` | T02 长期架构真相 | `historical_reference` | 保留 T02 越野 Route 草案冷启动模块的首轮长期文档主表面 |
| `modules/t02_route_coldstart/INTERFACE_CONTRACT.md` | T02 稳定契约面 | `historical_reference` | 保留草案包结构、筛选门槛、运行输入输出与验收边界 |
| `modules/t02_route_coldstart/README.md` | T02 操作者入口 | `historical_reference` | 供后续复盘与按需复用 |
| `modules/t02_route_coldstart/RUNBOOK.md` | T02 复现实验说明 | `historical_reference` | 供后续回查首轮复现路径 |
| `modules/t02_route_coldstart/FAILURE_TAXONOMY.md` | T02 失败分型 | `historical_reference` | 保留 `PASS/WARN/FAIL` 与不入池原因 |
| `modules/t02_route_coldstart/AGENTS.md` | T02 durable guidance | `historical_reference` | 保留模块级执行边界与协作规则 |
| `modules/t02_route_coldstart/history/*` | T02 历史材料 | `history` | 记录模块启动、口径冻结与 run 结果回写 |
| `modules/t03_route_trip_experience/architecture/*` | T03 长期架构真相 | `historical_reference` | 保留 T03 Route / Trip 媒体化与交互原型模块的首轮长期文档主表面 |
| `modules/t03_route_trip_experience/INTERFACE_CONTRACT.md` | T03 稳定契约面 | `historical_reference` | 保留样例装配、媒体导出、原型主链路、输出目录与验收边界 |
| `modules/t03_route_trip_experience/README.md` | T03 操作者入口 | `historical_reference` | 供后续复盘与演示素材回查 |
| `modules/t03_route_trip_experience/RUNBOOK.md` | T03 运行说明 | `historical_reference` | 保留 P0-P3 复现顺序、输出与证据要求 |
| `modules/t03_route_trip_experience/FAILURE_TAXONOMY.md` | T03 失败分型 | `historical_reference` | 保留 `PASS/FAIL/BLOCKED` 与降级规则 |
| `modules/t03_route_trip_experience/AGENTS.md` | T03 durable guidance | `historical_reference` | 保留模块级执行边界与协作规则 |
| `modules/t03_route_trip_experience/history/*` | T03 启动与执行包 | `history` | 记录首轮启动冻结文档、QA 报告和执行总结 |

## 当前模块模板文档面

| 路径 | 当前角色 | 主要属性 | 说明 |
|---|---|---|---|
| `modules/_template/architecture/*` | 模板级长期结构骨架 | `template` | 新模块启动时复制并补实 |
| `modules/_template/INTERFACE_CONTRACT.md` | 模板级稳定契约骨架 | `template` | 给出统一章节顺序 |
| `modules/_template/AGENTS.md` | 模板级 durable guidance 骨架 | `template` | 只给出工作边界 |
| `modules/_template/README.md` | 模板级操作者总览骨架 | `template` | 按需启用 |
| `modules/_template/RUNBOOK.md` | 模板级运行说明骨架 | `template` | 承载复现实验说明 |
| `modules/_template/FAILURE_TAXONOMY.md` | 模板级失败分型骨架 | `template` | 承载失败分类与证据要求 |

## 当前历史 / 归档位置

| 路径 | 当前角色 | 主要属性 | 说明 |
|---|---|---|---|
| `docs/doc-governance/history/` | 历史治理过程文档 | `legacy_candidate` | 当前为预留目录 |
| `docs/archive/nonstandard/` | 项目级非标准归档 | `legacy_candidate` | 已新增 `20260329-t02-t03-results-archive.md` 记录本次历史归档决策 |
| `specs/archive/` | 历史变更工件 | `legacy_candidate` | 当前为预留目录 |

## 当前结论

1. 主阅读路径已经收口到项目级源事实、治理入口、结构元数据、项目执行面和 T01 正式模块文档面。
2. `modules/t02_route_coldstart/*` 与 `modules/t03_route_trip_experience/*` 当前作为历史参考文档面保留，不属于当前正式模块集合。
3. `_template` 继续承担新模块启动模板职责。
