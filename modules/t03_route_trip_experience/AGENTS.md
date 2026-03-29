# t03_route_trip_experience - AGENTS

## 开工前先读

- 先读 `architecture/01-introduction-and-goals.md`、`architecture/04-solution-strategy.md`、`architecture/10-quality-requirements.md`
- 再读 `INTERFACE_CONTRACT.md`，确认样例装配、媒体导出、原型主链路与验收边界
- 若需要运行说明，再读 `RUNBOOK.md`
- 若需要失败与降级口径，再读 `FAILURE_TAXONOMY.md`
- 若需要本轮启动冻结包，再读 `history/20260328_t03_launch/*.md`

## 允许改动范围

- 默认允许改动本模块文档、`src/validation_foundry/modules/t03_route_trip_experience/`、`tests/t03_route_trip_experience/` 与本模块 `outputs/_work/t03_*`
- 若需要新增或变更官方入口，必须同步更新 `docs/repository-metadata/entrypoint-registry.md`
- 若需要变更模块生命周期状态，必须同步更新 `docs/doc-governance/module-lifecycle.md`、`docs/doc-governance/current-module-inventory.md` 与 `docs/doc-governance/module-doc-status.csv`

## 必做验证

- 任何范围冻结都必须对照 repo root `AGENTS.md`、`SPEC.md` 与用户本轮 T03 任务书
- 任何 `PASS` 结论都必须能回查到 `outputs/_work/t03_route_video/`、`outputs/_work/t03_trip_summary/`、`outputs/_work/t03_prototype/`、`outputs/_work/t03_qa/`
- 任何降级都必须写明原因、保留的主链路与未完成项

## 禁做事项

- 不讨论 Route 生产，不修改 T02 既有采集与 QA 逻辑
- 不把 Google 专有底图、专有 3D 服务或专有视频服务引入为主链路
- 不把自动越野寻路、大而全后台平台或多样例铺开混入首轮范围
- 不允许只有页面或只有代码而没有可运行结果与证据包
