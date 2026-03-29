# t04_product_prototype - RUNBOOK

## 1. 文档目的

说明 `t04_product_prototype` 的官方运行方式、复现步骤和阶段性验证顺序。

## 2. 当前运行状态

- T04 为独立原型模块
- 当前只冻结前端开发/构建/Storybook 入口
- 不提供 Python CLI

## 3. 复现步骤

1. 安装前端依赖：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp install`
2. 启动原型开发环境：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run dev`
3. 启动 Storybook：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run storybook`
4. 构建原型：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build`
5. 构建 Storybook：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook`
6. 运行测试：`npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run test`

## 4. 输出位置

- 原型截图与流程证据：`outputs/_work/t04_prototype/`
- QA 证据包：`outputs/_work/t04_qa/`

## 5. 证据要求

- 成功时保留页面截图、流程截图、自动演示日志、构建日志和 QA 报告
- 失败时必须保留失败步骤、报错日志、受影响页面和下一步建议
