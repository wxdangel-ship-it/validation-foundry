# 0001 - Bootstrap Governance

## 状态

- 日期：`2026-03-26`
- 状态：`accepted`

## 决策

本项目采用 `RCSD_Topo_Poc` 的治理方法，但不复用其业务正文：

- 保留 source-of-truth 分层
- 保留 `spec / plan / tasks` 变更工件模式
- 保留模块生命周期显式登记
- 保留模块模板启动方式

同时增加两类项目特有文档：

- `docs/project-management/*`：承载阶段计划、当前状态、gate、子线程编排和参考仓映射
- 模块级 `RUNBOOK.md` / `FAILURE_TAXONOMY.md`：满足虚拟手机验证的复现实验说明和失败分型要求

## 原因

- 用户明确要求“仓库文件承载长期记忆”
- 项目需要强制记录阶段 gate 与子线程 writeback
- T01 强依赖证据包与失败分型，模板需要预留对应槽位

## 影响

- 后续线程可基于仓库文档继续推进，而不依赖长对话上下文
- `modules/_template/` 成为后续模块启动的统一起点
