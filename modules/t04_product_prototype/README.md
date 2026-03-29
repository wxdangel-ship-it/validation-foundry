# t04_product_prototype

> 本文件是 `t04_product_prototype` 的操作者总览与运行入口说明。长期源事实以 `architecture/*` 与 `INTERFACE_CONTRACT.md` 为准。

## 1. 模块定位

- T04 负责把 Route / Trip 原型骨架落为可点击、可自动演示的产品原型
- 当前重点是页面契约、状态流转、三条标准流程与占位页闭环
- 当前样例事实源固定为 `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/`
- 当前不做 Route 生产、真实下载、真实轨迹解析、真实导航

## 2. 当前阶段

- `Phase 0`：Preflight、范围冻结、模块启动
- `Phase 1`：页面契约、线框、状态模型冻结
- `Phase 2`：静态点击原型
- `Phase 3`：自动演示与 QA

## 3. 官方入口

- 前端开发入口：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run dev`
- 前端构建入口：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build`
- Storybook 入口：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run storybook`
- Storybook 构建入口：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook`
- 前端测试入口：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run test`

## 4. 文档阅读顺序

1. `architecture/01-introduction-and-goals.md`
2. `architecture/04-solution-strategy.md`
3. `INTERFACE_CONTRACT.md`
4. `RUNBOOK.md`
5. `INTRANET_MIGRATION.md`
6. `history/20260329_t04_launch/T04_PRECHECK.md`
