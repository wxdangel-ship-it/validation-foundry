# T04_DATA_CONTRACT

## 1. 样例数据集合

- `platformRouteSample`
  - 使用 `outputs/_work/20260328_t02_liuzhijiao_route_catalog_roadbook/1989358/`
  - `1989358_metadata.json`、`1989358_geometry_summary.json`、`1989358_geometry.geojson`、`1989358_description.md` 为事实源
  - 文案语义为平台整理路线
- `importedTrackSample`
  - 复用同一条几何
  - 文案语义为导入轨迹后的自定义参考路线
- `freeExploreSample`
  - 起点基于同一样例起点
  - 安全锚点与探索范围基于样例轨迹包络派生
  - 派生字段必须标注为原型锚点，不得伪装成源数据事实

## 2. 页面数据字段

- 路线概览：
  - `title`
  - `modeLabel`
  - `distanceKm`
  - `eta`
  - `difficulty`
- 地图标记：
  - `id`
  - `kind`
  - `label`
  - `lng`
  - `lat`
- 总结页：
  - `completionStatus`
  - `totalDistance`
  - `totalDuration`
  - `retreatStatus`
  - `highlightLine`

## 3. Mock 行为

- 下载：从 `not-downloaded` 进入 `downloading`，延迟后进入 `downloaded`
- 导入轨迹：直接返回 `parse-success`
- Storybook 演示：使用固定样例和固定延迟
