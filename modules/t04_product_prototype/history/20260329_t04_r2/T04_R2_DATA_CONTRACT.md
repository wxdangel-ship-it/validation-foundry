# T04_R2_DATA_CONTRACT

## 1. 唯一样例事实源

- 第二阶段唯一事实源继续冻结为：
  - `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/`
- 前端消费副本继续冻结为：
  - `src/validation_foundry/modules/t04_product_prototype/webapp/public/demo-data.json`

## 2. 真实事实字段

- 只允许下列字段被视为 factual：
  - `sample.routeId`
  - `sample.routeName`
  - `sample.sourceIdentifier`
  - `sample.routeDescription`
  - `sample.distanceKm`
  - `sample.durationSeconds`
  - `sample.terrainTags`
  - `sample.difficulty`
  - `sample.locationLabel`
  - `routeKeypoints` 中来自起点、中点、终点的真实定位项
  - `tripTrack.features[566]`
  - `tripTrack.features[].properties.timestamp`
  - `tripTrack.features[].properties.speed`
  - `tripTrack.features[].properties.elevation`
  - `tripTrack.features[].properties.slope_or_pitch`
  - `tripTrack.features[].properties.normalized_time`

## 3. 原型锚点与占位来源

- 以下对象继续允许存在，但必须显式标注：
  - `risk`
  - `regroup`
  - `retreat`
  - 自由探索 `manual mark`
  - 任意非源目录直接给出的安全锚点候选

## 4. Provenance 规则

- `factual`
  - 来自 `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/`
- `prototype_anchor`
  - 基于真实轨迹位置派生的原型锚点
- `derived`
  - 由真实轨迹计算出的距离、方向、速度带、坡度带、关键路段、挑战指数
- `mock`
  - 卫星通讯、发送当前位置、风险推演、打滑识别等无事实支撑能力

## 5. 页面输入契约

### 5.1 P4

- 页面只接受 `OffroadMapScenario`
- 页面不直接读取 bundle

### 5.2 Overlay

- 抽屉只接受 `SafetyDrawerScenario`
- 内容来源是 `mode + warningLevel`

### 5.3 P5

- 页面只接受 `SummaryScenario`
- 以下字段必须继续带来源语义：
  - `keySegments[].chip`
  - `keySegments[].note`
  - `vehicleHighlights[].source`
  - `challengeIndex` 中的 `(derived)`
  - `feedbackActions[].note`

## 6. 保持事实源一致的约束

- `loadDemoBundle()` 只从 `demo-data.json` 读取
- `demo-data.json` 只允许由 `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/` 生成
- `story-fixtures` 与 `App` 只消费同一 bundle
- 若未来替换事实源，必须同步改：
  - `T04_R2_PRECHECK.md`
  - `T04_R2_DATA_CONTRACT.md`
  - `demo-data.json`

## 7. 自动演示与静态构建约束

- Storybook 页面、状态、模式、流程都必须走同一 bundle
- `storybook-static` 必须包含：
  - `public/demo-data.json`
  - MSW worker
- Flow autoplay 不允许引入随机数或当前时间依赖

## 8. 当前开放风险

- 卫星通讯、发送当前位置、打滑识别等仍为 placeholder/mock，不得伪装为真实能力
- 关键路段、挑战指数、传感器摘要属于 derived 结果，只能作为原型推演表达
