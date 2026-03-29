# T03_QA_REPORT

## 1. Run 概览

- `run_id`: `20260328_t03_launch_poc`
- `date`: `2026-03-28`
- `sample_route_id`: `liuzhijiao_1989358`
- `sample_source`: `liuzhijiao / #1989358`
- `operator`: `codex`
- `status`: `PASS`

## 2. 结果摘要

- 数据契约：`PASS`
  - `sample_manifest.json`、`route_keypoints.json`、`trip_track.geojson`、`trip_events.json`、`sensor_timeseries.json`、`summary_story.json` 已生成
  - `validation_report.json` 为 `PASS`
- Route 展示视频：`PASS`
  - `route_teaser.mp4`
  - `1600x900`
  - `3.0s`
  - `145287 bytes`
- Trip 总结视频/回放：`PASS`
  - `trip_summary.mp4`
  - `1600x900`
  - `3.5s`
  - `199261 bytes`
- 交互原型：`PASS`
  - 已捕获 `route_entry / route_detail / trip_ready / map_mainline / safety_drawer / abnormal_state / summary_page`
- 前后台职责说明：`PASS`
  - 已冻结在 `T03_FRONT_BACK_SPLIT.md`

## 3. 风险与问题

- `WARN`: `export_all_orchestration_unstable`
  - 现象：`npm run export:all` 在 preview 生命周期控制上存在不稳定，Trip 与 prototype 采用分步导出补齐
  - 结论：不阻塞首轮闭环，后续需要把总控脚本稳定化

## 4. 证据目录

- QA bundle：`outputs/_work/t03_qa/`
- Route 视频：`outputs/_work/t03_route_video/`
- Trip 视频：`outputs/_work/t03_trip_summary/`
- Prototype：`outputs/_work/t03_prototype/`

## 5. 验收结论

- 是否满足最小闭环：`YES`
- 是否满足证据要求：`YES`
- 是否允许进入下一轮：`YES`
