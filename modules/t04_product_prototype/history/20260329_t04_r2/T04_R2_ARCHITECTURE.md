# T04_R2_ARCHITECTURE

## 1. 架构目标

- 第二阶段继续沿用“一套事实源 + 一套 scenario builder + 一套 XState + 一套 Storybook fixture”的组织，不复制页面逻辑。
- `P4 / P4-overlay / P5` 的页面输入边界冻结为场景对象，不让页面直接拼装 `bundle`。
- `storybook-static` 与 `dist` 并行交付：
  - `dist` 负责原型本体演示。
  - `storybook-static` 负责页面、状态、模式、流程与文档站分享。

## 2. 分层冻结

### 2.1 XState 层

- 只承载跨页面、跨模式、跨流程的真实原型状态：
  - `navigation`
  - `download`
  - `mapView`
  - `overlay`
  - `demo`
- 只保留必要上下文字段：
  - `mode`
  - `startPointName`
  - `routeStartConfirmed`
  - `safetyAnchorCount`
  - `rangeConfirmed`
  - `rangeLimitExceeded`
  - `highlightedPointId`
  - `warningLevel`
  - `summaryStatus`
  - `gpsStatus`
  - `recordingStatus`
  - `satelliteStatus`

### 2.2 Scenario Builder 层

- `src/validation_foundry/modules/t04_product_prototype/webapp/src/mocks/sample-data.ts` 负责把 `1989358` 样例事实和原型规则转成页面场景对象。
- 当前冻结输出类型：
  - `RouteScenario`
  - `ExploreScenario`
  - `OffroadMapScenario`
  - `SafetyDrawerScenario`
  - `SummaryScenario`
- 原则：
  - 页面只消费 scenario。
  - Storybook fixtures 只消费 scenario。
  - `App` 只负责把 machine context 和 scenario 组装到页面。

### 2.3 页面本地状态层

- 只保留纯 UI 态，不回写 machine：
  - `P4.keyPointsVisible`
  - `P4.focusMode`
  - `P5.activeSegmentId`
  - `P5.timelineIndex`
  - `P5.replayMapView`
- 不把展示字段塞回 machine。原因是这些字段主要是“事实 + derived/mock + 当前页面组合规则”的展示模型，不是流程真状态。

## 3. 页面输入边界

### 3.1 P4 Offroad Map

- 输入边界固定为：
  - `scenario: OffroadMapScenario`
  - `safetyDrawer: SafetyDrawerScenario`
  - `mapView`
  - `overlayOpen`
  - 右侧操作区动作回调
- 页面不直接读取 bundle，不直接推导警示逻辑。

### 3.2 P4-overlay Safety Drawer

- 输入边界固定为：
  - `scenario: SafetyDrawerScenario`
  - `onClose`
- 抽屉内容来源只允许是 `mode + warningLevel` 派生结果，不从页面 DOM 推断。

### 3.3 P5 Trip Summary

- 输入边界固定为：
  - `scenario: SummaryScenario`
  - `onBackToMap`
  - `onBackToLauncher`
- 页面内部只控制：
  - 当前高亮关键路段
  - 当前时间轴索引
  - 右侧地图普通态 / 3D 态

## 4. Storybook 组织冻结

- Storybook 五层 title 冻结为：
  - `T04/Docs`
  - `T04/Pages`
  - `T04/States`
  - `T04/Modes`
  - `T04/Flows`
- 组织原则：
  - `Docs`：用 CSF story 渲染文档页，不额外引入 MDX 维护面。
  - `Pages`：直接渲染页面组件或 `App` 入口，验证页面壳与模式差异。
  - `States`：只验证单一状态变量，不混入完整流程。
  - `Modes`：只做横向对比，统一以 `P4` 为对比面。
  - `Flows`：统一从 `App(initialEntry="launcher")` 起跑，并自动推进。

## 5. 自动演示架构

- `preview.ts` 只负责：
  - 全局样式
  - 一次性 `enableMocking()`
  - 侧栏排序与 docs 参数
- 每个 story meta 用 loader 调 `loadDemoBundle()`，避免重复请求。
- Flow story 采用：
  - `AutoplayStory`
  - `data-autoplay-status`
  - `play function` 只等待 `done`
- QA 层再用 Playwright 校验：
  - `dist`
  - `storybook-static`
- Playwright 是验证器，不是第二套业务实现。

## 6. 静态构建与交付

- `build-storybook` 产物作为静态原型站主交付物。
- `vite build` 产物作为原型本体独立演示入口。
- 两类交付物都归档到：
  - `outputs/_work/t04_prototype/`
  - `outputs/_work/t04_qa/T04_R2_QA_BUNDLE/artifacts/`

## 7. 开放风险

- Storybook addon 与 core 小版本仍有轻微偏差 warning，当前不阻塞 build/smoke。
- 构建仍存在 chunk warning，后续可以再做拆包，但不阻塞第二阶段原型验收。
