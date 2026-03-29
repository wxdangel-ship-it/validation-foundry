# T04_R2_STORYBOOK_MATRIX

## 1. 站点目标

- Storybook 从“页面散点”提升为“完整原型站”
- 侧栏至少分为：
  - Pages
  - States
  - Docs
  - Flows

## 2. 页面级 stories

- `P2.RouteDetail.PlatformRoute`
- `P2.RouteDetail.ImportedTrack`
- `P3.FreeExplorePlan`
- `P4.OffroadMap.PlatformRoute`
- `P4.OffroadMap.ImportedTrack`
- `P4.OffroadMap.FreeExplore`
- `P4-overlay.SafetyDrawer.PlatformRoute`
- `P4-overlay.SafetyDrawer.FreeExplore`
- `P5.Summary.PlatformRoute`
- `P5.Summary.ImportedTrack`
- `P5.Summary.FreeExplore`

## 3. 状态级 stories

### 3.1 下载状态

- `Download.NotDownloaded`
- `Download.Downloading`
- `Download.Downloaded`

### 3.2 地图状态

- `Map.2D`
- `Map.3D`

### 3.3 警示状态

- `Alert.Level1`
- `Alert.Level2`
- `Alert.Level3`
- `Alert.Level4`

### 3.4 安全抽屉

- `SafetyDrawer.Closed`
- `SafetyDrawer.Open`

### 3.5 总结状态

- `Summary.Completed`
- `Summary.Aborted`
- `Summary.RetreatCompleted`

## 4. docs 页

- `Docs.Overview`
- `Docs.PageRoles`
- `Docs.ModeDifferences`
- `Docs.FrontVsBackAndPlaceholders`

## 5. flows

- `Flow A Platform Route`
- `Flow B Imported Track`
- `Flow C Free Explore`

## 6. 静态构建交付

- `build-storybook` 必须通过
- 构建产物可直接作为静态站点分享
- docs、pages、states、flows 都必须在侧栏成体系，不再是散点 story

## 7. TODO

- TODO：若 `P4-overlay` 导入轨迹 story 被评审要求单独展示，可在平台结构基础上追加
