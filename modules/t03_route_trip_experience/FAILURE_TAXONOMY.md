# t03_route_trip_experience - FAILURE_TAXONOMY

## 1. 文档目的

定义 T03 首轮中的 `PASS / FAIL / BLOCKED` 与常见降级口径。

## 2. 状态定义

- `PASS`：单样例闭环成立，Route 视频、Trip 回放/视频、交互原型和 QA 证据都可回查
- `FAIL`：输入或实现存在缺陷，导致结果不完整或不可播放/不可回放/不可点击
- `BLOCKED`：受外部环境限制无法继续，例如 Puppeteer 浏览器无法下载且无本地浏览器可用

## 3. 常见失败分型

- `missing_t02_sample`
  - 主样例不存在、路径错误或 T02 证据不完整
- `contract_mismatch`
  - 统一契约字段缺失、时间轴不对齐或坐标格式错误
- `route_video_render_failed`
  - Route 展示页可打开但动画导出失败
- `trip_summary_render_failed`
  - Trip 回放页可打开但回放/导出失败
- `prototype_flow_broken`
  - 页面可打开但主链路无法走通
- `webgl_degraded`
  - WebGL 或 3D 效果不稳定，需要退回 2D/2.5D
- `browser_runtime_blocked`
  - Puppeteer/浏览器环境异常，无法完成自动导出

## 4. 降级规则

- 优先保留 Route 展示视频成品
- 次优先保留 Trip 可回放结果
- 再次优先保留原型主链路
- 可降级项：
  - 3D 出片降级为 2D/2.5D
  - Trip 视频降级为可回放总结页
  - Penpot 降级为前端可运行原型

## 5. 明确禁止

- 不允许用静态图冒充可运行原型
- 不允许用文档描述替代视频/回放结果
- 不允许把 Route 生产问题写成 T03 的 `BLOCKED`
