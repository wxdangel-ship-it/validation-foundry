# T03_DATA_CONTRACT

## 1. 契约原则

- 时间字段统一为 `ISO 8601 UTC`
- 坐标统一为 `WGS84 (EPSG:4326)`
- 首轮只保证 `1` 条样例跑通

## 2. route_draft.json

- 承接 T02 `route_draft.json`
- 首轮必须保留来源追溯、几何引用、语义摘要、关键点候选与审阅结果

## 3. route_keypoints.json

每条记录至少包含：

- `keypoint_id`
- `kind`
- `name`
- `lat`
- `lng`
- `confidence`
- `note`

## 4. trip_track.geojson

- 首轮统一使用 `GeoJSON FeatureCollection`
- 轨迹点至少保留：
  - `timestamp`
  - `speed`
  - `elevation`
  - `index`

## 5. trip_events.json

每条事件至少保留：

- `event_id`
- `timestamp`
- `event_type`
- `severity`
- `message`
- `track_index`

## 6. sensor_timeseries.json

每条记录至少保留：

- `timestamp`
- `speed`
- `elevation`
- `slope_or_pitch`
- `event_type`

## 7. summary_story.json

- `trip_id`
- `quick_summary`
- `deep_summary`
- `key_metrics`
- `chapters`
- `asset_refs`

## 8. 约束

1. `route_draft` 不允许缺来源追溯
2. `trip_track` 不允许和 `sensor_timeseries` 脱轴
3. `summary_story` 不允许只有文案没有回放或媒体引用
