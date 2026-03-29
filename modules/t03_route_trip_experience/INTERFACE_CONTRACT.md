# t03_route_trip_experience - INTERFACE_CONTRACT

## 定位

- 本文件是 `t03_route_trip_experience` 的稳定契约面
- 模块目标、上下文、构件关系与风险说明以 `architecture/*` 为准
- `README.md` 只承担操作者入口职责

## 1. 目标与范围

- 模块 ID：`t03_route_trip_experience`
- 目标：基于已稳定的 Route 草案与单条 T02 六只脚样例，交付可运行的 Route 展示视频、Trip 总结回放/视频和交互原型闭环
- 当前正式范围：
  - 固定 `1` 条主样例装配为 T03 统一输入
  - 生成 `sample_manifest.json`、`route_keypoints.json`、`trip_track.geojson`、`trip_events.json`、`sensor_timeseries.json`、`summary_story.json`
  - 产出至少 `1` 个 Route 展示视频成品
  - 产出至少 `1` 个 Trip 总结回放页或视频成品
  - 产出覆盖 Route 展示入口到结束总结页的可运行原型
  - 产出 QA 报告、验收清单与证据包
- 当前非范围：
  - Route 生产
  - 自动越野寻路
  - 多样例并行铺开
  - 复杂用户/权限/组织平台
  - Google 专有依赖主链路

## 2. Inputs

### 2.1 必选输入

- T02 `route_draft.json`
- T02 `normalized/main_geometry.gpx`
- T02 详情截图与文字摘录

### 2.2 可选输入

- T02 额外证据截图
- 人工补充的关键点命名
- 真实车端传感器数据

### 2.3 输入前提

- 首轮主样例固定为 `liuzhijiao_1989358`
- 时间字段统一为 `ISO 8601 UTC`
- 地理坐标统一为 `WGS84 (EPSG:4326)`
- 若缺少真实车端传感器，允许使用 mock 最小集合：`timestamp`、`speed`、`elevation`、`slope_or_pitch`、`event_type`

## 3. Outputs

- `outputs/_work/t03_route_video/`
  - `sample_manifest.json`
  - `route_keypoints.json`
  - `route_teaser.mp4`
  - `route_teaser_poster.png`
  - `render_log.txt`
- `outputs/_work/t03_trip_summary/`
  - `trip_track.geojson`
  - `trip_events.json`
  - `sensor_timeseries.json`
  - `summary_story.json`
  - `trip_summary.mp4` 或 `trip_replay.html`
  - `trip_summary_poster.png`
  - `render_log.txt`
- `outputs/_work/t03_prototype/`
  - 页面截图
  - 原型导出日志
- `outputs/_work/t03_qa/`
  - `manifest/`
  - `data_contract/`
  - `route_video/`
  - `trip_summary/`
  - `prototype/`
  - `logs/`
  - `reports/`
  - `tree.txt`

## 4. EntryPoints

- `PYTHONPATH=src python3 -m validation_foundry.modules.t03_route_trip_experience.pipeline --output-root <run_dir>`
- `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run dev`
- `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run build`
- `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:route`
- `npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:trip`

## 5. Params

- 路径与运行模式：
  - `output_root`
  - `sample_route_id`
  - `force`
- 渲染与导出：
  - `viewport`
  - `fps`
  - `duration_ms`
  - `headless`
- 数据装配：
  - `event_strategy`
  - `sensor_strategy`

## 6. Acceptance

1. 至少 `1` 条 T02 六只脚样例被成功装配并可追溯
2. 至少 `1` 个 Route 展示视频成品可播放
3. 至少 `1` 个 Trip 总结结果可回放或可播放，且轨迹与 mock 传感器联动
4. 交互原型主链路可点通
5. 文档明确前台强展示、前台轻承载后台主导、纯后台支撑
6. `PASS` 结果必须带 QA 报告和证据包
