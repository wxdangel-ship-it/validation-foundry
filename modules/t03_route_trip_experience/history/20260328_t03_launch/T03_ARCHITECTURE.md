# T03_ARCHITECTURE

## 1. 模块目标

T03 的职责不是生成 Route，而是把已稳定的 Route 草案与 T02 样例轨迹，压缩成可展示、可回放、可点击的最小闭环。所有能力先围绕单条样例跑通，再谈多样例和平台化。

## 2. 技术栈分工

- Route 展示视频主线：`MapLibre GL JS + deck.gl TripsLayer`
- Trip 总结回放主线：`CesiumJS`
- 交互原型主线：`MapLibre GL JS + shadcn/ui`
- 验证工具：`kepler.gl`
- 截图与视频导出：`Puppeteer + FFmpeg`

## 3. 前后台分层

- 前台强展示：路线预览、地图回放、总结叙事、状态切换
- 后台主导：样例装配、契约校验、事件与传感器对齐、导出与 QA

## 4. 最小运行架构

`T02 样例输入 -> T03 统一契约 -> Web App 渲染 -> Puppeteer 捕获 -> FFmpeg 导出 -> outputs/_work/t03_*`

## 5. 后续扩展点

- 多样例
- 真实车端传感器
- 更强 3D 表达
- Penpot 设计协作
