# SPEC：validation-foundry 需求说明

- 文档类型：需求规格说明（Specification）
- 项目名称：`validation-foundry`
- 版本：`v0.1`
- 状态：`Draft`
- 当前阶段：`Phase 0 bootstrap completed / Phase 1 ready`
- 当前正式模块：`t01_pickup_point_validation`

---

## 1. 项目概述

`validation-foundry` 的目标是在可复现的安卓虚拟手机环境中，对“虚拟定位 -> 地图应用自动回到附近上车点 -> 提取上车点坐标”建立证据优先、可批量执行、可审计的工程底座。

当前项目只定义一个正式业务模块：

- `T01`：虚拟手机上车点坐标验证

当前原则是复用 `RCSD_Topo_Poc` 中已经验证有效的仓库骨架、治理方式、文档分层和模块化方法，但不照抄其业务内容。

---

## 2. 当前阶段目标

### 2.1 当前阶段必须完成

- 建立项目级治理骨架与 source-of-truth 分层
- 固化项目级 `AGENTS.md`、`SPEC.md`、`docs/PROJECT_BRIEF.md`
- 建立项目级 `docs/architecture/*`、`docs/doc-governance/*`、`docs/repository-metadata/*`
- 建立 `docs/project-management/*`，用于承载当前阶段计划、状态、gate 和子线程编排
- 建立 `modules/_template/`
- 建立正式模块 `modules/t01_pickup_point_validation/`
- 建立 `specs/t01-pickup-point-validation/spec.md`、`plan.md`、`tasks.md`

### 2.2 当前阶段明确不做

- 不并行开启其它业务模块
- 不跳过 `Phase 1-4` 直接进入大批量执行
- 不在无证据前提下输出坐标成功结果
- 不要求用户持续在线协助调试

---

## 3. 范围与非目标

### 3.1 当前范围（包含）

- 项目骨架初始化
- 项目级与模块级治理规则
- T01 业务合同冻结
- T01 阶段拆解与 gate 设计
- 安卓虚拟环境、虚拟定位、应用链路、坐标提取、golden set、批量执行的分阶段计划

### 3.2 当前非目标（不包含）

- 其它未登记模块
- 登录态依赖方案
- 无证据的人工猜测坐标
- 未验证前的大规模 CSV 全量跑批

---

## 4. 关键约束与假设

### 4.1 输入输出合同约束

- 输入批量文件格式：`CSV`
- 输入字段：`id`、`name`、`x`、`y`
- 输入坐标系：`GCJ-02`
- 输出结果至少包含：
  - `id`
  - `name`
  - `input_x`
  - `input_y`
  - `output_x`
  - `output_y`
  - `status`
  - `app`
  - `reason`
  - `evidence_dir`
- 输出坐标系必须与输入一致，仍为 `GCJ-02`

### 4.2 业务执行约束

- 优先链路：滴滴首页定位按钮链路
- 备选链路：高德地图打车服务定位按钮链路
- 不登录账号
- 点击定位按钮后，至少等待 `3` 秒，并在页面状态稳定后取点
- 目标点默认解释为 marker 实际落点 / 尖端位置；如应用不是尖端型 marker，必须在模块文档中定义等价取点规则并给出可复核样例

### 4.3 失败口径约束

- 不可信即失败
- 每条输入都必须有一条结果记录
- `status` 至少支持：`SUCCESS` / `FAIL` / `BLOCKED`
- `reason` 必须可归因
- `evidence_dir` 必须指向该条样本的证据目录

### 4.4 工程与协作约束

- 项目内文档默认中文
- 长期记忆不依赖聊天历史，必须写入仓库文档
- 子线程只处理一个清晰子问题，并写回指定文档
- 默认不新增执行入口，除非通过任务和登记批准

---

## 5. 协作与治理方式

- 项目采用 spec-driven 工作流
- 项目级真相写入 `SPEC.md`、`docs/PROJECT_BRIEF.md`、`docs/architecture/*`
- 模块级真相写入 `modules/<module>/architecture/*` 与 `INTERFACE_CONTRACT.md`
- `specs/<change-id>/` 只承载变更工件，不替代长期模块真相
- `AGENTS.md` 只承载 durable guidance
- 阶段 gate、状态与子线程编排统一记录在 `docs/project-management/*`

---

## 6. 当前仓库交付基线

当前仓库初始化后，至少包含：

- 项目级治理文档与架构文档
- 模块启动模板
- T01 正式模块文档面
- `specs/t01-pickup-point-validation/*`
- `src/validation_foundry/` 基础包骨架
- `tests/`、`tools/`、`configs/`、`outputs/` 目录骨架

---

## 7. 模块启动标准

任何正式模块启动时，至少应创建：

- `AGENTS.md`
- `INTERFACE_CONTRACT.md`
- `architecture/00-current-state-research.md`
- `architecture/01-introduction-and-goals.md`
- `architecture/02-constraints.md`
- `architecture/03-context-and-scope.md`
- `architecture/04-solution-strategy.md`
- `architecture/05-building-block-view.md`
- `architecture/10-quality-requirements.md`
- `architecture/11-risks-and-technical-debt.md`
- `architecture/12-glossary.md`

按成熟度补充：

- `README.md`
- `review-summary.md`
- `RUNBOOK.md`
- `FAILURE_TAXONOMY.md`
- `history/`
- `scripts/`

---

## 8. 测试与可复现要求

- 每个阶段结束后都要更新阶段状态与证据位置
- 所有成功与失败都需要可追溯证据
- `Phase 5` 前不得宣称 golden set 已闭环
- `Phase 6` 前不得宣称已具备正式批量执行能力

---

## 9. 当前结论

- `validation-foundry` 当前已按参考仓方法建立项目级治理骨架
- `T01` 已形成 `spec / plan / tasks` 初稿
- 当前允许进入 `Phase 1`：安卓虚拟环境与虚拟定位单点打通
- 当前不允许跳过 `Phase 1-4` 直接进入大规模批量执行
