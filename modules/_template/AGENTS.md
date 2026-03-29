# <module_id> - AGENTS

## 开工前先读

- 先读 `architecture/01-introduction-and-goals.md`、`architecture/04-solution-strategy.md`、`architecture/10-quality-requirements.md`
- 再读 `INTERFACE_CONTRACT.md`，确认稳定输入、输出、参数类别和验收标准
- 若需要运行说明，再读 `RUNBOOK.md`
- 若需要失败分型，再读 `FAILURE_TAXONOMY.md`
- 若需要操作者入口，再读 `README.md`

## 允许改动范围

- 默认只改本目录下文档：`architecture/*`、`INTERFACE_CONTRACT.md`、`AGENTS.md`、`README.md`、`RUNBOOK.md`、`FAILURE_TAXONOMY.md`、`review-summary.md`
- 若无明确任务，不修改 `src/`、`tests/`、`scripts/`、`outputs/`

## 必做验证

- 改文档前后对照 repo root `AGENTS.md`、`SPEC.md` 与项目级 `docs/architecture/*`
- 修改 contract 时，必须检查当前实现入口和证据协议是否与文档冲突

## 禁做事项

- 不把 `AGENTS.md` 写成模块真相主表面
- 不在模块根目录新增 `SKILL.md`
- 不在没有任务的情况下扩写为未经验证的实现细节
