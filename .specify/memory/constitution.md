# validation-foundry 宪章

## 核心原则

### I. 分层源事实

项目级源事实、模块级源事实、`AGENTS.md` 指南、repo root Skill 工作流以及变更专用 `specs/` 工件必须严格分层。
`SPEC.md` 与项目级 `docs/architecture/*` 定义全局范围与约束；模块级 `architecture/*` 与 `INTERFACE_CONTRACT.md` 定义模块长期真相；`AGENTS.md` 只承载耐久执行规则；`specs/` 只承载变更期推理与任务分解。

### II. 证据优先

涉及虚拟手机、地图应用、坐标提取与结果判定的工作，必须遵循“无证据不通过”原则：

- 禁止伪造坐标
- 禁止用“看起来合理”的结果冒充成功
- 不能确认坐标可信时，必须输出 `FAIL` 或 `BLOCKED`
- 每条输入都必须有结果记录、原因和证据目录

### III. 小而稳定的 AGENTS

`AGENTS.md` 必须保持简短、稳定、耐久。它只能记录执行姿态、边界、协作方式和指向源事实的入口，不得成为业务规则、验收标准或模块方案的唯一承载位置。

### IV. 基于 arc42 的文档面

项目级与模块级稳定真相默认采用 arc42 风格组织。项目级至少覆盖：目标、约束、上下文、方案策略、横切概念、质量要求、风险和术语表。模块级至少覆盖：当前研究、目标、约束、范围、方案策略、构件视图、质量要求、风险和术语表。

### V. 先文档、后实现、分阶段 gate

结构化推进必须遵循：

```text
constitution -> spec -> plan -> tasks -> phase gate -> implementation
```

在模块 `spec/plan/tasks` 和阶段 gate 未建立前，不进入大规模实现或批量执行。

### VI. 默认中文文档

项目内文档默认使用中文；代码、命令、路径、配置键、接口字段等技术符号可保留英文原文。

## 文档拓扑标准

- 项目级稳定文档放在 `docs/`
- 项目级架构真相放在 `docs/architecture/`
- 项目级治理入口与生命周期盘点放在 `docs/doc-governance/`
- 仓库结构、代码边界与入口治理放在 `docs/repository-metadata/`
- 当前阶段计划、状态、gate 与子线程编排放在 `docs/project-management/`
- 模块级稳定文档放在 `modules/<module_id>/`
- 模块级实现未来放在 `src/validation_foundry/modules/<module_id>/`
- 变更工件放在 `specs/<change-id>/`

## 合规策略

- 每个阶段结束后，必须更新 `current-status.md`、相关模块 history 和必要的 contract / architecture 文档
- 任何例外都必须显式记录

**版本**: 1.0.0 | **批准日期**: 2026-03-26 | **最后修订**: 2026-03-26
