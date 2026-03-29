# T03_TEST_PLAN

## 1. 目标

验证 T03 首轮最小闭环是否成立：`Route 样例接入 -> Route 展示视频 POC -> Trip 总结视频/回放 POC -> 交互原型主链路 -> QA 证据包`

## 2. 测试范围

- 数据契约：`route_draft`、`route_keypoints`、`trip_track`、`trip_events`、`sensor_timeseries`、`summary_story`
- Route 展示视频
- Trip 总结视频/回放
- 交互原型
- 前后台职责说明

## 3. 测试原则

- 只验首轮固定 `1` 条 T02 样例
- 不接受只有代码，没有可播放/可回放/可点击结果
- 任何 `PASS` 都必须可回查到 `outputs/_work/t03_qa/`

## 4. 测试方法

- 静态校验：字段完整性、时间轴对齐、样例唯一性
- 运行校验：视频导出成功、页面可打开、交互路径可点通
- 证据校验：截图、日志、产物文件、目录树完整
