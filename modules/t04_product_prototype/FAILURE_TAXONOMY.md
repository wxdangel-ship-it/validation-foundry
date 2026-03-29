# t04_product_prototype - FAILURE_TAXONOMY

## 1. 文档目的

定义 `t04_product_prototype` 的失败分类、状态口径和最小证据要求。

## 2. 状态层级

- `PASS`
- `FAIL`
- `BLOCKED`

## 3. 失败分类

| 分类 | status | 说明 | 最小证据 |
|---|---|---|---|
| `page_contract_mismatch` | `FAIL` | 页面结构、按钮位置、卡片数量与冻结需求不一致 | 截图、对照说明 |
| `flow_dead_end` | `FAIL` | 标准流程存在死链，无法进入下一页或总结页 | 录屏或步骤截图 |
| `state_transition_broken` | `FAIL` | 下载三态或 Ready Gate 无法按约定切换 | 状态截图、日志 |
| `demo_automation_unavailable` | `FAIL` | 无法运行 Storybook play function 或等效自动演示 | 执行日志 |
| `toolchain_blocked` | `BLOCKED` | 本地 Node/浏览器/依赖环境缺失，导致无法构建或截图 | 环境日志、命令输出 |
