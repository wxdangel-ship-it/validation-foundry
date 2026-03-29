# T04_TEST_PLAN

## 1. 测试范围

- 页面集合完整性
- 页面契约一致性
- 平板画布统一性
- P2 / P3 / P4 的 UI 减法和 CTA 模型
- 卫星底图可见性
- 三条标准流程点击闭环
- 下载三态切换
- 自由探索 Ready Gate
- Storybook 自动演示可运行性

## 2. 测试层级

- 文档对照检查
- 页面手动点击验证
- 平板截图一致性检查
- Storybook play function 自动演示
- Storybook 打开即自动演示的执行级检查
- 构建与 smoke 测试
- Playwright 端到端流程验证

## 3. 关键用例

- Flow A 从 P2 到 P5，且 CTA 为导航至起点 / 进入越野地图页
- Flow B 从导入轨迹成功到 P5，且 CTA 与 P2 同构
- Flow C 从 P3 到 P5，且 CTA 为开始探索 / 进入越野地图页
- P4 与 P4-overlay 双向切换
- 自由探索未满足 Ready Gate 时禁止进入下一步
- Storybook 三条 flow 打开后可自动完成到终态
