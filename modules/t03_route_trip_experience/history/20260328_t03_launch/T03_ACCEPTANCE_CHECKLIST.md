# T03_ACCEPTANCE_CHECKLIST

## 1. 数据契约

- [ ] `sample_manifest.json` 只固定 `1` 条 T02 主样例
- [ ] `route_draft.json` 可读取
- [ ] `route_keypoints.json` 可读取
- [ ] `trip_track.geojson` 可回放
- [ ] `trip_events.json` 可对齐时间轴
- [ ] `sensor_timeseries.json` 可对齐时间轴
- [ ] `summary_story.json` 可生成总结结构

## 2. Route 展示视频

- [ ] 至少 `1` 个视频成品成功导出
- [ ] 路线几何可见
- [ ] 关键点可见
- [ ] 输出文件可播放
- [ ] 有静帧截图和导出日志

## 3. Trip 总结视频/回放

- [ ] 至少 `1` 个成品成功导出或可回放
- [ ] 轨迹、事件、传感器至少两类信息联动
- [ ] 快速总结可见
- [ ] 深度总结可见

## 4. 交互原型

- [ ] Route 展示入口可进入
- [ ] Route 详情页可发起 Trip
- [ ] Trip 准备态可切到 Ready
- [ ] 越野地图页可进入异常态
- [ ] 异常态可触发返航/撤离
- [ ] 结束总结页可展示快速总结与深度总结入口

## 5. 证据包

- [ ] 所有产物落到 `outputs/_work/t03_qa/`
- [ ] 有目录树
- [ ] 有运行日志
- [ ] 有截图
- [ ] 有视频/回放成品
- [ ] 有 QA 结论文件
