# T03 - Solution Strategy

## 1. 技术主线

- P0 数据装配：Python 读取 T02 样例，生成 T03 统一契约
- P1 Route 展示视频：`MapLibre GL JS + deck.gl TripsLayer`
- P2 Trip 总结回放/视频：`CesiumJS`
- P3 交互原型：`MapLibre GL JS + shadcn/ui`
- 导出：`Puppeteer + FFmpeg`

## 2. 最小运行架构

`T02 route_draft + GPX -> T03 sample manifest + contract files -> webapp render routes -> Puppeteer capture -> FFmpeg assemble -> outputs/_work/t03_*`

## 3. 设计策略

- 单样例先跑通，再考虑多样例
- 先保证 2D/2.5D 路线演示稳定，3D 作为增强项
- Trip 回放以轨迹、事件、传感器三线联动为主，不追求复杂分析引擎
- 原型优先表达主链路和状态切换，不做高保真设计系统
