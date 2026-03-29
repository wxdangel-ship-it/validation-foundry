# t02_route_coldstart - AGENTS

## 开工前先读

- 先读 `architecture/01-introduction-and-goals.md`、`architecture/02-constraints.md`、`architecture/04-solution-strategy.md`
- 再读 `INTERFACE_CONTRACT.md`，确认 Route 草案包结构、筛选门槛、输出文件和验收标准
- 若需要运行步骤，再读 `RUNBOOK.md`
- 若需要 QA 口径，再读 `FAILURE_TAXONOMY.md`
- 若需要阶段背景，再读 `history/000-bootstrap.md`

## 允许改动范围

- 默认允许改动本模块文档、`src/validation_foundry/modules/t02_route_coldstart/`、对应测试与本模块 run 产物
- 若需要新增或变更官方入口，必须同步更新 `docs/repository-metadata/entrypoint-registry.md`
- 若需要把 T02 状态升级、退役或改名，必须同步更新 `docs/doc-governance/module-lifecycle.md` 和 `docs/doc-governance/current-module-inventory.md`

## 必做验证

- 任何筛选口径变更都必须对照 repo root `AGENTS.md`、`SPEC.md` 和本模块 `INTERFACE_CONTRACT.md`
- 任何 `PASS` 路线都必须能回查到原始截图、页面信息快照和几何证据
- 任何批量 run 都必须落 `route_index.csv`、`route_index.json`、`run_manifest.json`、`collection_log.md`、`qa_summary.md`、`qa_issues.json`

## 禁做事项

- 不得把仅有 `自驾` 标签、但没有 `越野车` 显式标签的路线计入本轮目标
- 不得把六只脚中只是搜索命中 `越野`、但详情主体不支持驾车越野的路线计入本轮目标
- 不得把混合标签徒步/登山路线伪装成驾车越野路线
- 不得只有摘要没有几何证据
- 不得遗失原始证据或只保留整理后的摘要
