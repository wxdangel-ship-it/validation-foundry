# t02_route_coldstart

> 本文件是 `t02_route_coldstart` 的操作者总览与阅读入口。长期源事实以 `architecture/*` 与 `INTERFACE_CONTRACT.md` 为准。

## 1. 模块定位

- T02 负责把两步路和六只脚中的真实越野驾车路线素材整理成内部 `Route draft package`
- 当前正式源：
  - `2bulu`
  - `liuzhijiao`
- 本轮只交付“可进入人工审核池”的草案包，不把外部路线直接等同于正式 Route

## 2. 当前阶段

- `Phase 0`：规范发现与口径冻结，已完成
- `Phase 1`：模块骨架、打包流水线与 QA 基线，进行中
- `Phase 2`：单条真实路线采集闭环，进行中
- `Phase 3`：两步路至少 `10` 条、六只脚至少 `10` 条 Route 草案包采集与 QA，待完成

## 3. 官方入口

- 官方打包入口：`PYTHONPATH=src python3 -m validation_foundry.modules.t02_route_coldstart.pipeline --manifest <manifest.json> --output-root <run_dir>`
- 当前运行说明：`RUNBOOK.md`
- 当前失败与不入池口径：`FAILURE_TAXONOMY.md`

## 4. 文档阅读顺序

1. `architecture/01-introduction-and-goals.md`
2. `architecture/04-solution-strategy.md`
3. `INTERFACE_CONTRACT.md`
4. `RUNBOOK.md`
5. `FAILURE_TAXONOMY.md`
