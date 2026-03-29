# T04 方案策略

## 1. 总体策略

- 独立建 `t04_product_prototype` 模块
- 文档面先冻结，再实现前端原型
- 以 Storybook 和状态机承载演示流程

## 2. 页面策略

- P2 / P3 做相对完整结构
- P4 / P4-overlay / P5 做占位壳，但页面跳转和入口必须真实可点
- P0 仅作演示辅助，不纳入正式产品页统计

## 3. 技术策略

- React + Vite 承载主页面
- shadcn 风格轻组件承载卡片、按钮、抽屉、标签
- XState 管理三种模式、下载状态和流程状态
- MSW 提供 mock 上传、下载和延迟
- MapLibre 和 Cesium 只承载占位地图/3D 区
