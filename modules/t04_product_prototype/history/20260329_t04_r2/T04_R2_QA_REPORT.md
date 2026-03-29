# T04_R2_QA_REPORT

## 1. 报告状态

- 状态：`PASS_WITH_OPEN_RISKS`
- 判定日期：`2026-03-29`
- 结论摘要：
  - `P4 / P4-overlay / P5` 第二阶段页面契约已落地
  - Storybook 已形成完整原型站
  - Flow A / B / C 既可点击，也可自动演示
  - QA 证据包已归档

## 2. 测试环境与命令

- 仓库：`/mnt/e/Work/validation-foundry`
- Webapp：`/mnt/e/Work/validation-foundry/src/validation_foundry/modules/t04_product_prototype/webapp`
- 样例事实源：`outputs/_freeze/20260329_t04_liuzhijiao_route_1989358`

执行命令：

- `PYTHONPATH=src python3 -m pytest tests/t04_product_prototype -q -s`
- `npm run test`
- `npm run build`
- `npm run build-storybook`
- `npx storybook dev -p 6006 --host 127.0.0.1 --smoke-test --ci`
- `t04_r2_storybook_verify.cjs`
- `t04_r2_playwright_verify.cjs`
- `t04_r2_capture_screenshots.cjs`

## 3. 页面契约检查结论

### 3.1 P4 Offroad Map

- 结果：`PASS`
- 结论：
  - 三模式地图页均已落成
  - 顶部轻状态栏、地图主画布、右侧 5 个浮动入口、底部轻信息条、四级警示和安全抽屉入口均可见
  - 地图默认使用卫星底图，并支持普通态 / 3D 态
- 证据：
  - `screenshots/p4_offroad_map_platform.png`
  - `screenshots/p4_offroad_map_imported.png`
  - `screenshots/p4_offroad_map_free_explore.png`
  - `states/map_2d.png`
  - `states/map_3d.png`
  - `states/warning_level_1.png`
  - `states/warning_level_2.png`
  - `states/warning_level_3.png`
  - `states/warning_level_4.png`

### 3.2 P4-overlay Safety Drawer

- 结果：`PASS`
- 结论：
  - 抽屉仍保持地图覆盖态
  - 当前风险状态区、保守动作区、外部联络与标记区三块结构完整
  - 平台 / 导入模式与自由探索模式的保守动作文案已经区分
- 证据：
  - `screenshots/p4_overlay_safety_drawer_platform.png`
  - `screenshots/p4_overlay_safety_drawer_free_explore.png`
  - `states/safety_drawer_closed.png`
  - `states/safety_drawer_open.png`
  - `flows/flow_c_free_explore_safety_drawer.png`

### 3.3 P5 Trip Summary

- 结果：`PASS`
- 结论：
  - 三模式总结页均已落成
  - 左侧 5 张卡、右侧地图回放区、时间轴 / 传感器摘要条和底部 3 个动作成立
  - 关键路段点击可联动地图高亮
  - 页面表达以结论为主，传感器只作为 derived/mock 证据
- 证据：
  - `screenshots/p5_summary_platform.png`
  - `screenshots/p5_summary_imported.png`
  - `screenshots/p5_summary_free_explore.png`
  - `states/summary_completed.png`
  - `states/summary_aborted.png`
  - `states/summary_retreated.png`

## 4. 三模式一致性结论

- 结果：`PASS`
- 结论：
  - 三模式共用统一平板画布与统一页面骨架
  - 差异只体现在模式标签、地图对象、底部指标、风险语义与反馈动作
  - 平台 Route 与导入轨迹未混用文案
  - 自由探索未出现“偏离路线”字样
  - derived/mock 字段均以文案或标签显式标注

## 5. Storybook 完整性结论

- 结果：`PASS`
- 结论：
  - 侧栏已形成 `Docs / Pages / States / Modes / Flows`
  - 页面级、状态级、模式级、流程级 stories 均可浏览
  - docs 入口可浏览，不依赖源码自动文档
  - 默认展示已隐藏底部 panel，减少原型站视觉干扰
  - `build-storybook` 通过，静态站可分享
- 证据：
  - `logs/build-storybook.log`
  - `logs/storybook_smoke.log`
  - `artifacts/storybook-static/`

## 6. Flow A / B / C 自动演示结论

### 6.1 Storybook Play

- 结果：`PASS`
- 结论：
  - Flow A / B / C 在 `storybook-static` 中均能自动推进到总结页
  - 复测后 `P4` 不再保留左上说明卡，`P5` 不再出现 `返回 Demo Launcher`
- 证据：
  - `logs/storybook_play_verification.txt`

### 6.2 Dist Playwright

- 结果：`PASS`
- 结论：
  - Flow A / B / C 在原型本体静态站中均能自动推进到总结页
  - Flow C 可演示安全抽屉开合
- 证据：
  - `logs/playwright_verification.txt`
  - `flows/flow_a_platform_route.png`
  - `flows/flow_b_imported_track.png`
  - `flows/flow_c_free_explore_map.png`
  - `flows/flow_c_free_explore_safety_drawer.png`
  - `flows/flow_c_free_explore_summary.png`

## 7. 证据索引

- 页面截图：`screenshots/` 共 12 张
- 状态截图：`states/` 共 14 张
- 流程截图：`flows/` 共 5 张
- 日志：`logs/`
- 截图采集说明：当前页面与状态截图已改为从 `storybook-static/iframe.html` 直接采集，避免将 Storybook 控制区带入 QA 证据
- 静态构建产物：
  - `artifacts/dist/`
  - `artifacts/storybook-static/`

## 8. 开放风险 / TODO

- `P4 / P4-overlay / P5` 仍是高可信原型，不代表真实导航、安全和通讯能力
- 卫星通讯、发送当前位置、打滑识别等仍为 placeholder/mock
- `vite build` 与 `build-storybook` 仍有 chunk warning
- Storybook smoke 日志存在 addon 与 core 小版本偏差 warning，但当前不阻塞 build / smoke / autoplay

## 9. 最终判定

- 最终判定：`PASS_WITH_OPEN_RISKS`
- 建议：
  - 可以作为第二阶段 handoff 原型继续交接与讨论
  - 下一轮优先处理 `P4` 警示落点收敛、`P5` 深度总结去向，以及构建拆包与 Storybook 版本统一
