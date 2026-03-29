# 08 横切概念

## 1. Source-of-Truth 分层

- 项目级：`SPEC.md`、`docs/PROJECT_BRIEF.md`、`docs/architecture/*`
- 项目执行面：`docs/project-management/*`
- 模块级：`modules/<module>/architecture/*`、`INTERFACE_CONTRACT.md`
- durable guidance：`AGENTS.md`
- workflow：repo root `.agents/skills/<skill-name>/SKILL.md`

## 2. 阶段 gate

- 每个阶段都必须记录目标、完成情况、是否通过 gate、证据位置、下一阶段是否允许继续、遗留问题与风险
- gate 结论统一写回 `docs/project-management/current-status.md`

## 3. 证据优先

- 结果 CSV 只是索引，不是证据本体
- `evidence_dir` 必须能定位到截图、日志、稳定判据和提取过程
- 成功与失败都要保留证据

## 4. 子线程 writeback

- 每个子线程有指定职责、依赖和 writeback 文件
- 主线程负责汇总、守门和冲突消解

## 5. 坐标与稳定概念

- 输入输出坐标系统一使用 `GCJ-02`
- “稳定”不是固定 `3` 秒整，而是达到“至少 `3` 秒 + 工程判据稳定”的组合条件
