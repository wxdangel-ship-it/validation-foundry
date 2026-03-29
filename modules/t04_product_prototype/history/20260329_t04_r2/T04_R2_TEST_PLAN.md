# T04_R2_TEST_PLAN

## 1. 测试目标

- 验证 `P4 / P4-overlay / P5` 已从占位页提升为结构完整、状态清楚、可演示的高可信原型。
- 验证三模式在同一页面骨架下差异明确，不互相污染语义。
- 验证 Storybook 已从页面散点提升为完整原型站。
- 验证 Flow A / B / C 存在可重复执行的自动演示链路。
- 验证所有 derived/mock 内容均显式标注，不伪装成真实车端或后端事实。

## 2. 测试范围

- 页面层：
  - `P4 Offroad Map`
  - `P4-overlay Safety Drawer`
  - `P5 Trip Summary`
- 继承回归：
  - `P0`
  - `P2`
  - `P3`
- Storybook：
  - `Docs`
  - `Pages`
  - `States`
  - `Modes`
  - `Flows`
- 构建层：
  - `build`
  - `build-storybook`
  - `storybook smoke`
- 证据层：
  - 截图
  - 流程截图
  - 构建日志
  - 自动演示日志
  - 静态构建产物

## 3. 非范围

- 真实后端、真实下载、真实轨迹解析、真实卫星通讯
- 正式导航算法、偏航算法、真实车端传感器接入
- Route 生产与 T03 媒体链路

## 4. 页面契约检查矩阵

### 4.1 P4 Offroad Map

- 顶部轻状态栏存在：
  - 返回
  - 模式
  - 离线
  - GPS
  - 记录
  - 卫星通讯
- 地图默认可见卫星图
- 地图只支持：
  - 普通态
  - 3D 态
- 共通地图对象存在：
  - 当前定位
  - 当前朝向
  - 已走轨迹
  - 安全锚点
- 模式差异存在：
  - 平台 Route：参考线、起终点、接驳点/回撤点、关键锚点
  - 导入轨迹：导入参考线、起终点、回撤点、关键锚点，顶部语义正确
  - 自由探索：起点、探索范围、安全锚点、手动标点
- 右侧浮动操作区固定 5 个入口
- 底部轻信息条与模式匹配
- Level 1 / 2 / 3 / 4 警示均可展示

### 4.2 P4-overlay Safety Drawer

- 抽屉为地图覆盖态
- 打开后地图背景仍可见
- 三个区块齐全：
  - 当前风险状态区
  - 保守动作区
  - 外部联络与标记区
- 平台/导入动作文案正确
- 自由探索动作文案正确
- 卫星通讯入口在顶部状态栏与抽屉中都可见

### 4.3 P5 Trip Summary

- 左右结构正确
- 左侧固定 5 张卡完整
- 关键路段至少 3 段
- 关键路段点击可与地图联动高亮
- 地图回放区存在：
  - 实际轨迹
  - 起终点
  - 回撤点
  - 关键事件锚点
  - 关键路段高亮
- 时间轴 / 传感器摘要条存在：
  - 拖动回看
  - 关键事件打点
  - 2~3 条结论化摘要
- 页面体现“传感器提供证据，页面输出结论”
- 底部固定操作区保留 3 个动作

## 5. 三模式一致性检查矩阵

- 三模式共用同一页面骨架
- 平板画布尺寸一致
- 顶部返回入口一致
- 地图右侧操作区结构一致
- 底部信息条位置一致
- 安全抽屉结构一致
- 总结页 5 卡结构一致
- 平台 Route 与导入轨迹不混用文案
- 自由探索禁止出现“偏离路线”
- 所有 derived/mock 内容均显式标注

## 6. Storybook 完整性检查矩阵

### 6.1 页面级 stories

- `P2 RouteDetail.PlatformRoute`
- `P2 RouteDetail.ImportedTrack`
- `P3 FreeExplorePlan`
- `P4 OffroadMap.PlatformRoute`
- `P4 OffroadMap.ImportedTrack`
- `P4 OffroadMap.FreeExplore`
- `P4-overlay SafetyDrawer.PlatformRoute`
- `P4-overlay SafetyDrawer.FreeExplore`
- `P5 Summary.PlatformRoute`
- `P5 Summary.ImportedTrack`
- `P5 Summary.FreeExplore`

### 6.2 状态级 stories

- 下载状态：未下载 / 下载中 / 下载完成
- 地图状态：普通态 / 3D态
- 警示状态：Level 1 / 2 / 3 / 4
- 安全抽屉：关闭 / 打开
- 总结页：完成 / 中止 / 回撤完成

### 6.3 文档级 stories

- 页面角色
- 模式差异
- 前台强展示 vs 后台主导
- 正式需求 vs 原型占位

### 6.4 组织性检查

- 侧栏具备 `Docs / Pages / States / Modes / Flows`
- story 名称与页面契约一致
- docs 可浏览
- `build-storybook` 产物可静态分享

## 7. 自动演示检查矩阵

### 7.1 Flow A

- `Launcher -> P2(platform) -> 下载完成 -> 导航至起点 -> P4 -> 结束 Trip -> P5`

### 7.2 Flow B

- `Launcher -> P2(imported) -> 下载完成 -> 导航至起点 -> P4 -> 结束 Trip -> P5`

### 7.3 Flow C

- `Launcher -> P3 -> 设起点 -> 添加安全锚点 -> 确认探索范围 -> 下载完成 -> 导航至起点 -> P4 -> 安全抽屉 -> P5`

### 7.4 自动演示稳定性要求

- 至少一套自动机制稳定通过：
  - Storybook `play function`
  - Playwright 流程验证
- 自动脚本优先使用稳定页面标识：
  - `data-page-id`
  - `data-overlay-id`

## 8. 证据要求

- 页面截图
- 状态截图
- 流程截图
- `pytest.log`
- `test.log`
- `build.log`
- `build-storybook.log`
- `storybook_smoke.log`
- `storybook_play_verification.txt`
- `playwright_verification.txt`
- `qa_capture.log`
- `dist/`
- `storybook-static/`
- `tree.txt`

## 9. 判定规则

- `PASS`：所有门槛满足，证据齐全
- `PASS_WITH_OPEN_RISKS`：主目标满足，但存在明确开放风险
- `BLOCKED`：关键 story、构建、自动演示或证据链中断
- `FAIL`：页面契约、模式差异或流程闭环不成立

## 10. 风险与注意事项

- 自动演示若仍依赖按钮长文案，必须记为脆弱性风险
- 构建 chunk warning 需记录为开放风险
- 所有截图必须统一平板尺寸
