# 参考仓规范继承方案

## 1. 继承原则

当前项目继承 `RCSD_Topo_Poc` 的不是业务内容，而是：

- 文档治理方式
- 模块化方法
- source-of-truth 分层
- `spec / plan / tasks` 变更工件组织
- 生命周期显式登记
- 模板启动方式

## 2. 映射关系

| 参考仓做法 | validation-foundry 落位 | 继承说明 |
|---|---|---|
| repo root `AGENTS.md` 只放 durable guidance | `AGENTS.md` | 继承 |
| repo root `SPEC.md` 作为项目级顶层规格 | `SPEC.md` | 继承 |
| `docs/architecture/*` 作为项目级长期真相 | `docs/architecture/*` | 继承 |
| `docs/doc-governance/*` 作为治理入口和生命周期盘点 | `docs/doc-governance/*` | 继承 |
| `docs/repository-metadata/*` 作为目录职责和入口治理 | `docs/repository-metadata/*` | 继承 |
| `modules/_template/` 作为模块启动模板 | `modules/_template/` | 继承，并补入 `RUNBOOK.md` / `FAILURE_TAXONOMY.md` |
| `modules/<module>/architecture/* + INTERFACE_CONTRACT.md` 作为模块长期真相 | `modules/t01_pickup_point_validation/*` | 继承 |
| `specs/<change-id>/spec.md + plan.md + tasks.md` | `specs/t01-pickup-point-validation/*` | 继承 |
| `specs/archive/` 归档历史变更工件 | `specs/archive/` | 继承 |
| 模块生命周期显式登记 | `docs/doc-governance/module-lifecycle.md` | 继承 |

## 3. 项目特有扩展

相较参考仓，本项目新增：

- `docs/project-management/`
  - 用于承载当前阶段计划、状态、gate 和子线程编排
- 模块级 `RUNBOOK.md`
  - 用于运行说明和复现实验说明
- 模块级 `FAILURE_TAXONOMY.md`
  - 用于失败分型、`FAIL/BLOCKED` 分类和证据要求

这些扩展不改变参考仓的治理方法，只是为 T01 的移动端验证场景补齐长期记忆槽位。

## 4. 命名规则

- repo 级规范文档：沿用全大写或大写下划线风格
- 模块目录：`tNN_snake_case`
- 变更目录：`tNN-kebab-case`
- 架构文档：两位编号 + kebab-case

## 5. 当前结论

- `validation-foundry` 已完成参考仓治理方法的第一轮移植
- 当前唯一正式模块已登记为 `t01_pickup_point_validation`
- 后续线程应以仓库文档为事实基线，而不是依赖聊天历史
