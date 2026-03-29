# T04_QA_REPORT

## 1. 报告状态

- 当前状态：`PASS_WITH_OPEN_RISKS`
- 结论口径：
  - 页面契约与当前平板原型实现一致
  - Flow A / Flow B / Flow C 均已自动化跑到 `P5`
  - 构建、Storybook 静态构建与 smoke-test 均通过
  - 平板画布、CTA 减法、卫星底图与 Storybook 自动演示链均已完成回归

## 2. 环境与命令

- `npm`：`11.6.2`
- `node`：通过 `C:/Program Files/nodejs/node.exe` 使用 `v24.13.0`
- `pytest`：`9.0.2`

已实跑命令：

1. `PYTHONPATH=src python3 -m pytest tests/t04_product_prototype -q -s`
2. `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp install`
3. `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run test`
4. `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build`
5. `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook`
6. `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run storybook -- --smoke-test --ci`
7. 浏览器自动截图脚本：`outputs/_tmp/t04_capture_screenshots.js`
8. Playwright 三流验证脚本：`outputs/_tmp/t04_playwright_verify.js`

## 3. 页面契约检查

- `P2`：左栏 `5` 张卡、右侧地图、底部固定操作区、左下角弱入口均存在
- `P3`：左栏 `3` 张卡、右侧地图、底部固定操作区、自由探索 `Ready Gate` 均存在
- `P4`：安全入口、结束 `Trip` 入口、`2D/3D` 切换占位存在
- `P4-overlay`：底部抽屉形式存在，地图背景保持可见
- `P5`：完成状态、总里程、总时长、回撤情况、一句话亮点与占位资产入口存在
- `P0`：Demo Launcher 已实现，明确标注为演示辅助页

## 4. 流程验证

### Flow A：平台 Route

- 结果：`PASS`
- 路径：`P0 -> P2(platform) -> P4 -> P5`
- 证据：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/flows/flow_a_platform_route.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/playwright_verification.txt`

### Flow B：导入轨迹

- 结果：`PASS`
- 路径：`P0 -> P2(imported) -> P4 -> P5`
- 证据：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/flows/flow_b_imported_track.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/playwright_verification.txt`

### Flow C：自由探索

- 结果：`PASS`
- 路径：`P0 -> P3 -> P4 -> P5`
- 证据：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/flows/flow_c_free_explore.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/playwright_verification.txt`

## 5. 状态验证

- 下载三态：
  - `未下载`：`PASS`
  - `下载中`：`PASS`
  - `下载完成`：`PASS`
- 状态截图：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/state-transitions/download_not_downloaded.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/state-transitions/download_downloading.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/state-transitions/download_downloaded.png`

## 6. 自动演示验证

- 结果：`PASS`
- 当前有效路径：
  - Playwright 对构建产物实跑三条流程
  - Storybook Flow stories 打开后自动演示到总结页终态
- 证据：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/playwright_verification.txt`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/storybook_play_verification.txt`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/storybook_play_verification_latest.txt`

## 7. 截图索引

- 页面截图：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/launcher.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/route_detail_platform.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/free_explore_plan.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/offroad_map_platform.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/safety_drawer.png`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/screenshots/trip_summary_platform.png`
- 流程截图：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/flows/*.png`
- 日志：
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/test.log`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/pytest.log`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/build.log`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/build-storybook.log`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/qa_capture.log`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/playwright_verification.txt`
  - `outputs/_work/t04_qa/T04_QA_BUNDLE/logs/storybook_play_verification.txt`

## 8. 风险与遗留

1. `build` 与 `build-storybook` 均有 chunk size warning，后续需要拆包。
2. `P4 / P4-overlay / P5` 当前仍是占位版，不应误解为正式导航、安全或总结能力。
3. 当前地图卫星底图依赖外部瓦片服务；离线占位体验成立，但不代表正式离线底图能力已实现。
4. Flow story 现已稳定自动演示，但采用的是 story 级自动驾驶包装层；下一轮如需更严格的官方链路，可继续补 Storybook test-runner / interaction 报告。

## 9. 新冻结 UI Gate

- 平板画布统一：所有页面、Storybook 和 QA 截图必须使用同一横屏平板画布
- P2 / P3 减法：页面主标题、模式标签、路线名、卡片标题、说明文案要分层，不能重复堆叠
- CTA 重构：P2 底部改为 `导航至起点 / 进入越野地图页`，P3 底部改为 `开始探索 / 进入越野地图页`
- 地图要求：P2 / P3 / P4 必须能看到卫星底图，地图顶部只保留最少必要控制
- Storybook 要求：三条 flow stories 打开后必须自动演示到预期终态，不能依赖人工点击
