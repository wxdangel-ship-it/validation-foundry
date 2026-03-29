# T04_R2_STATE_MODEL

## 1. 状态分层原则

- machine 管流程真状态。
- scenario 管页面显示状态。
- local state 管临时交互态。

## 2. Machine 冻结字段

### 2.1 跨流程字段

- `mode: platform | imported | explore`
- `startPointName`
- `routeStartConfirmed`
- `safetyAnchorCount`
- `rangeConfirmed`
- `rangeLimitExceeded`
- `highlightedPointId`

### 2.2 第二阶段新增 / 强化字段

- `warningLevel: 1 | 2 | 3 | 4`
- `gpsStatus: good | limited`
- `recordingStatus: recording | paused`
- `satelliteStatus: standby | ready | linked`
- `summaryStatus: completed | aborted | retreated`

### 2.3 并行状态分支

- `navigation`
- `download`
- `mapView`
- `overlay`
- `demo`

## 3. Ready Gate

### 3.1 Route 模式

- 条件冻结为：
  - 已确认起点
  - 已完成下载

### 3.2 Free Explore 模式

- 条件冻结为：
  - 已确认起点
  - 已设置至少一个安全锚点
  - 已确认探索范围
  - 探索范围未超限
  - 已完成下载

## 4. P4 Derived 状态

- `OffroadMapScenario` 负责表达以下显示状态：
  - `headerStatuses[]`
  - `referenceLine`
  - `actualTrackLine`
  - `polygon`
  - `points`
  - `keyPoints`
  - `bottomPrimaryLabel`
  - `bottomPrimaryValue`
  - `bottomSecondaryLabel`
  - `bottomSecondaryValue`
  - `bottomHint`
  - `warning.title`
  - `warning.detail`
  - `warning.suggestion`
  - `currentBearing`

## 5. Overlay Derived 状态

- `SafetyDrawerScenario` 负责表达：
  - `currentStatusLabel`
  - `currentStatusSummary`
  - `conservativeActions[]`
  - `externalActions[]`
  - `satelliteEntryLabel`

## 6. P5 Local + Derived 状态

### 6.1 页面本地状态

- `activeSegmentId`
- `timelineIndex`
- `replayMapView`

### 6.2 Derived / Mock 字段

- `completionLabel`
- `retreatStatus`
- `portraitTags`
- `portraitSummary`
- `challengeIndex`
- `keySegments[]`
- `vehicleHighlights[]`
- `feedbackSummary`
- `feedbackActions[]`
- `footerActions`
- `highlightedSegments`
- `trackSamples`
- `timelineEvents`

## 7. 四级警示语义冻结

### 7.1 平台 Route / 导入轨迹

- Level 1：沿参考线继续
- Level 2：接近回撤点
- Level 3：偏离参考线
- Level 4：长时间停滞 / 高优先级风险

### 7.2 自由探索

- Level 1：处于范围内
- Level 2：接近边界
- Level 3：已离开范围
- Level 4：远离安全锚点

## 8. Overlay 组织约束

- Overlay 不新增独立 machine 分支。
- 继续复用：
  - `overlay.open / closed`
  - `mode`
  - `warningLevel`
- 这是第二阶段最稳定的方案，能保持状态简单且流程一致。
