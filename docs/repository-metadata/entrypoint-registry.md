# 当前执行入口注册表

## 1. 文档目的

登记当前仓库已识别的执行入口脚本与入口文件。

## 2. 当前登记摘要

- 当前正式登记入口数：`0`
- 当前历史参考入口数：`4`

## 3. 当前正式已登记入口

当前无。

## 4. 当前历史参考入口

| 入口 | 模块 | 状态 | 说明 |
|---|---|---|---|
| `PYTHONPATH=src python3 -m validation_foundry.modules.t02_route_coldstart.pipeline --manifest <manifest.json> --output-root <run_dir>` | `t02_route_coldstart` | `historical_reference` | 保留为 T02 首轮草案打包与 QA 流水线的历史复现入口 |
| `PYTHONPATH=src python3 -m validation_foundry.modules.t03_route_trip_experience.pipeline --output-root <run_dir>` | `t03_route_trip_experience` | `historical_reference` | 保留为 T03 首轮样例装配与统一契约生成的历史复现入口 |
| `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run build` | `t03_route_trip_experience` | `historical_reference` | 保留为 T03 前端运行壳构建入口，供历史复盘与演示回查 |
| `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:route|export:trip|export:prototype` | `t03_route_trip_experience` | `historical_reference` | 保留为 T03 Route/Trip/Prototype 导出入口，供历史复盘与演示回查 |

## 5. 当前说明

- Phase 0 只建立项目骨架，不冻结任何正式 CLI
- `2026-03-29` 已将 T02/T03 的入口状态收口为 `historical_reference`，避免与“当前正式业务模块只有 T01”的治理口径冲突
- 后续当 `python -m validation_foundry` 或 T01 模块 CLI 成为正式入口时，再补录到本注册表

## 6. 新增入口脚本的准入规则

- 默认禁止新增新的执行入口脚本
- 新入口必须获得任务批准，并补录到本注册表
