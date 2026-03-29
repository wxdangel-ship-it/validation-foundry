# t04_product_prototype - AGENTS

## 开工前先读

- 先读 `architecture/01-introduction-and-goals.md`、`architecture/04-solution-strategy.md`、`architecture/10-quality-requirements.md`
- 再读 `INTERFACE_CONTRACT.md`，确认页面集合、状态流转、输出目录和验收边界
- 若需要运行说明，再读 `RUNBOOK.md`
- 若需要查看首轮冻结结论，再读 `history/20260329_t04_launch/`

## 允许改动范围

- 默认允许改动本模块文档面与实现面：`architecture/*`、`INTERFACE_CONTRACT.md`、`README.md`、`RUNBOOK.md`、`FAILURE_TAXONOMY.md`、`history/*`、`src/validation_foundry/modules/t04_product_prototype/*`、`tests/t04_product_prototype/*`
- 未经明确任务，不修改 `modules/t03_route_trip_experience/*`
- 未经明确任务，不修改项目级 `docs/project-management/current-status.md`、`current-phase-plan.md`

## 必做验证

- 改动前后对照 repo root `AGENTS.md`、`SPEC.md`、`docs/doc-governance/README.md`
- 保持 T04 为独立模块，不把 T03 当成本轮实现承载面
- 若新增 npm 开发/构建入口，必须同步检查 `docs/repository-metadata/entrypoint-registry.md`

## 禁做事项

- 不把 T04 写成当前正式业务主线，当前正式业务模块仍是 `t01_pickup_point_validation`
- 不新增 Python CLI
- 不在模块根目录新增 `SKILL.md`
- 不把占位页包装成已实现真实业务能力
