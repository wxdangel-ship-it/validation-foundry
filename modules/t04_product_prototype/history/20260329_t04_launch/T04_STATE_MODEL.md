# T04_STATE_MODEL

## 1. 共享状态

- `mode`：`platform-route`、`imported-track`、`free-explore`
- `downloadStatus`：`not-downloaded`、`downloading`、`downloaded`
- `mapView`：`map`、`3d`
- `currentPage`：`demo-launcher`、`route-detail`、`free-explore-plan`、`offroad-map`、`trip-summary`

## 2. P2/P3 关键状态

- P2：
  - `startPointConfirmed`
  - `highlightedWaypointId`
- P3：
  - `startPointConfirmed`
  - `safetyAnchorCount`
  - `explorationRangeConfirmed`
  - `rangeWithinLimit`

## 3. Ready Gate

- 平台 Route / 导入轨迹：
  - 起点已确认
  - 下载完成
- 自由探索：
  - 起点已确认
  - 至少一个安全锚点
  - 探索范围已确认
  - 范围未超限
  - 下载完成

## 4. 流程事件

- `chooseMode`
- `confirmStartPoint`
- `changeStartPoint`
- `startDownload`
- `finishDownload`
- `addSafetyAnchor`
- `setExplorationRange`
- `openSafetyDrawer`
- `closeSafetyDrawer`
- `finishTrip`
