# t03_route_trip_experience

> 本文件是 `t03_route_trip_experience` 的操作者总览与运行入口说明。长期源事实以 `architecture/*` 与 `INTERFACE_CONTRACT.md` 为准。

## 1. 模块定位

- T03 负责把已稳定的 Route 草案与 T02 样例轨迹，转成 Route 展示视频、Trip 总结回放/视频和可运行交互原型
- 当前不做 Route 生产，不做自动越野寻路，不做大而全平台

## 2. 当前阶段

- `Phase 0`：模块启动、范围冻结、单样例闭环，进行中
- 当前首轮主样例：`liuzhijiao_1989358`

## 3. 官方入口

- Python 数据装配入口：`PYTHONPATH=src python3 -m validation_foundry.modules.t03_route_trip_experience.pipeline --output-root <run_dir>`
- 前端开发入口：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run dev`
- 前端构建入口：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run build`
- 媒体导出入口：
  - `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:route`
  - `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:trip`
  - Prototype 当前建议按 RUNBOOK 中的 Puppeteer 流程执行

## 4. 文档阅读顺序

1. `architecture/01-introduction-and-goals.md`
2. `architecture/04-solution-strategy.md`
3. `INTERFACE_CONTRACT.md`
4. `RUNBOOK.md`
5. `history/20260328_t03_launch/T03_PRECHECK.md`
