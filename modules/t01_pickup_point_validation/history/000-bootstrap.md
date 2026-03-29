# T01 初始需求基线落仓记录

## 1. 背景

- 本轮任务目标是把 T01 的项目化治理基线写入仓库
- 当前任务性质是“项目初始化 + 文档落仓”，不是环境实现或批量执行任务

## 2. 本轮落仓范围

- 建立项目级治理骨架
- 建立 `specs/t01-pickup-point-validation/`
- 建立 `modules/t01_pickup_point_validation/` 正式文档面
- 建立阶段 gate、子线程计划和参考仓继承映射

## 3. 本轮读取到的上游事实

- 参考仓 `RCSD_Topo_Poc` 采用 source-of-truth 分层、显式生命周期登记和 `spec / plan / tasks` 变更工件模式
- 模块模板与模块正式文档面职责分工清晰：`architecture/*` 为长期真相，`INTERFACE_CONTRACT.md` 为稳定契约，`AGENTS.md` 为 durable guidance

## 4. 本轮冻结的 T01 基线

- 输入 CSV 字段：`id / name / x / y`
- 输入输出坐标系：`GCJ-02`
- 输出字段：`id / name / input_x / input_y / output_x / output_y / status / app / reason / evidence_dir`
- 应用优先级：滴滴优先，高德备选
- 登录约束：不登录账号
- 取点时机：至少 `3` 秒并达到稳定判据
- 目标点定义：marker 尖端或可复核等价落点
- 失败口径：不可信即 `FAIL/BLOCKED`

## 5. 本轮明确未做

- 未建立正式 CLI
- 未验证模拟器方案
- 未验证 APK 安装方案
- 未验证滴滴或高德链路
- 未定版坐标提取实现

## 6. 本轮结论

- T01 已完成 Phase 0 文档基线
- 当前允许进入 Phase 1 环境打通
- 当前不允许跳过中间阶段直接批量执行
