# t01_pickup_point_validation - AGENTS

## 开工前先读

- 先读 `architecture/01-introduction-and-goals.md`、`architecture/02-constraints.md`、`architecture/04-solution-strategy.md`
- 再读 `INTERFACE_CONTRACT.md`，确认输入、输出、稳定判据和失败口径
- 若需要运行说明，再读 `RUNBOOK.md`
- 若需要失败分型，再读 `FAILURE_TAXONOMY.md`
- 若需要阶段摘要，再读 `history/000-bootstrap.md`

## 允许改动范围

- 文档轮次默认允许改动本目录文档与 `specs/t01-pickup-point-validation/*`
- 未获得明确任务前，不修改未来实现文件或新增执行入口

## 必做验证

- 任何口径变更都必须对照 repo root `SPEC.md` 与 `docs/project-management/phase-gates.md`
- 任何成功结论都必须能回指到证据包
- 若发现页面链路或提取规则与当前 contract 冲突，先停止并写入 history，再由主线程收敛

## 禁做事项

- 不得伪造坐标
- 不得把猜测写成 `SUCCESS`
- 不得要求用户手工长期协助
- 不得 silently skip 失败样本
