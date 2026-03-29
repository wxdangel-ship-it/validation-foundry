# validation-foundry - Project Brief

## 1. 项目目标

`validation-foundry` 当前阶段的目标是先建立一个证据优先、分阶段 gate、可由多线程协作推进的工程底座，用来承载 T01 虚拟手机上车点坐标验证。

重点包括：

- 仓库骨架
- 文档治理与 source-of-truth 分层
- 项目状态、阶段 gate 与子线程 writeback 机制
- 模块启动模板
- T01 正式模块文档面
- 后续安卓虚拟环境、应用链路、坐标提取和批量执行的阶段推进基线

## 2. 当前范围

- 初始化 `docs/`、`modules/`、`src/`、`tests/`、`tools/`、`configs/`、`outputs/`
- 建立项目级架构文档与仓库结构元数据
- 建立 `modules/_template/`
- 建立 `modules/t01_pickup_point_validation/`
- 固化 T01 的输入输出合同、失败口径与阶段计划

## 3. 当前非目标

- 不并行扩展其他业务模块
- 不提前冻结尚未验证的执行入口和算法实现
- 不在无证据前提下输出成功坐标

## 4. 当前结构性结论

- 当前已登记正式业务模块：`t01_pickup_point_validation`
- `modules/_template/` 仅作为模板，不属于模块生命周期对象
- `specs/t01-pickup-point-validation/*` 当前是 T01 bootstrap 变更工件
- 项目已建立独立的阶段计划、状态与子线程编排文档面
