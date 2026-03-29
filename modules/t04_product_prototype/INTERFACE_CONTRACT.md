# t04_product_prototype - INTERFACE_CONTRACT

## 定位

- 本文件是 `t04_product_prototype` 的稳定契约面
- 模块目标、上下文、构件关系与风险说明以 `architecture/*` 为准
- `README.md` 只承担操作者入口职责

## 1. 目标与范围

- 模块 ID：`t04_product_prototype`
- 目标：交付 Route / Trip 原型骨架的页面契约、点击原型、状态演示、自动演示和 QA 证据包
- 当前正式范围：
  - P2 越野路线详情页
  - P3 自由探索计划页
  - P4 越野地图页占位版
  - P4-overlay 安全抽屉占位版
  - P5 路线总结页占位版
  - 可选 P0 Demo Launcher
  - Flow A / Flow B / Flow C 点击闭环
  - 下载三态和自由探索 Ready Gate 演示
- 当前非范围：
  - Route 生产
  - 真实离线下载
  - 真实轨迹解析后端
  - 真实车端传感器
  - 正式地图导航逻辑
  - T03 媒体化表达增强

## 2. Inputs

### 2.1 必选输入

- 用户冻结的 T04 页面与流程需求
- `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/` 作为平台 Route / 导入轨迹共用样例事实源
- 自由探索固定 mock 区域、起点、锚点、范围

### 2.2 可选输入

- `E:/Work/T04 Spec.md` 作为背景补充
- T03 历史参考中的路线摘要、关键点和轨迹坐标

### 2.3 输入前提

- 需求冲突时以本轮用户消息为准
- T04 独立组织，不破坏 T03
- 页面级数据允许 mock，但不能伪装成真实后端结果

## 3. Outputs

- `outputs/_work/t04_prototype/`
  - 页面截图
  - 流程截图
  - 自动演示日志
  - 构建产物索引
- `outputs/_work/t04_qa/`
  - `T04_QA_BUNDLE/`
  - `tree.txt`
  - QA 报告附件
- `modules/t04_product_prototype/history/20260329_t04_launch/`
  - 首轮范围冻结、架构、IA、测试与执行总结文档

## 4. EntryPoints

- Python CLI：`未冻结，且本轮禁止新增`
- Web app：
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run dev`
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build`
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run storybook`
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook`
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run test`

## 5. Params

- 页面模式：`platform-route`、`imported-track`、`free-explore`
- 下载状态：`not-downloaded`、`downloading`、`downloaded`
- 地图视图：`map`、`3d`
- 演示流程：`flow-a`、`flow-b`、`flow-c`

## 6. Acceptance

1. P2 / P3 / P4 / P4-overlay / P5 页面壳完整
2. Flow A / Flow B / Flow C 能点击到总结页占位版
3. 下载三态可切换，自由探索 Ready Gate 可见
4. 自动演示至少有一套可运行入口
5. QA 报告和证据包目录完整
