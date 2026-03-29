# T04_R2_PRECHECK

## 1. 继续前基线确认

- 已读取 repo root `AGENTS.md`
- 已复核 `docs/doc-governance/README.md`
- 已复核 `docs/repository-metadata/README.md`
- 已复核第一阶段 `T04_PRECHECK.md`、`T04_DATA_CONTRACT.md`
- 已复核模块稳定契约 `INTERFACE_CONTRACT.md`
- 已复核当前实现面的 `P4 / P4-overlay / P5 / Storybook`

## 2. 样例事实源确认

- 第二阶段继续沿用 `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/`
- 前端继续直接使用真实：
  - 里程
  - 时长
  - 难度
  - 起终点
  - 566 个轨迹点
- `risk / regroup / retreat` 继续保留为“原型锚点”
- 所有 derived/mock 传感器、警示、路线画像、关键路段都必须显式标明为原型推演，不得伪装为真实车端事实

## 3. 第一阶段结果继承

- `P2 越野路线详情页` 保持现有契约，不推翻
- `P3 自由探索计划页` 保持现有契约，不推翻
- Flow A / Flow B / Flow C 点击闭环继续保留
- 第二阶段重点只补：
  - `P4 越野地图页`
  - `P4-overlay 安全抽屉`
  - `P5 越野总结页`
  - Storybook 完整原型站

## 4. 当前差距判断

- `P4` 当前仍是单层占位页面，未体现顶部轻状态栏、右侧 5 个主入口、底部轻信息条和四级警示体系
- `P4-overlay` 当前只有通用占位块，未形成按模式区分的 3 区块结构
- `P5` 当前仍是基础统计 + 占位资产入口，未形成 5 张固定卡片、地图回放区和时间轴 / 传感器摘要条
- Storybook 当前仍偏散点，缺少完整 docs 入口、模式矩阵和状态矩阵

## 5. 保护策略

- 不改写 T03
- 不回到 Route 生产问题
- 不引入真实后端、真实下载、真实轨迹解析、真实车端传感器
- 不新增仓库级执行入口

## 6. 本轮输出面

- `modules/t04_product_prototype/history/20260329_t04_r2/`
- `outputs/_work/t04_prototype/`
- `outputs/_work/t04_qa/T04_R2_QA_BUNDLE/`
