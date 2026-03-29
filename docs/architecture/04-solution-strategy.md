# 04 方案策略

## 状态

- 当前状态：项目级方案策略说明
- 来源依据：
  - `SPEC.md`
  - `docs/project-management/phase-gates.md`
  - `docs/project-management/reference-inheritance-map.md`

## 策略摘要

当前采用“先治理、再环境、再链路、再提取、再批量”的推进策略：

1. 先复用参考仓的治理方法与文档分层
2. 先建立 T01 正式文档面，再进入实现
3. 先打通安卓虚拟环境和虚拟定位单点，再验证应用链路
4. 先定义稳定判据与提取规则，再跑 golden set
5. 先证明单点和小样本可信，再进入批量执行

## 分层策略

- `SPEC.md` 作为顶层项目规格
- `docs/architecture/` 作为项目级长期架构文档面
- `docs/project-management/` 作为阶段推进与状态记忆面
- `modules/<module>/architecture/` 作为模块级长期架构文档面
- `specs/<change-id>/` 作为变更工件

## 交付策略

- `Phase 0`：完成仓库初始化与 T01 文档基线
- `Phase 1`：完成安卓虚拟环境和虚拟定位单点冒烟
- `Phase 2`：验证滴滴主链路
- `Phase 3`：验证高德备选链路
- `Phase 4`：冻结坐标提取规则与 GCJ-02 一致性口径
- `Phase 5`：跑通浦东 `10` 点 golden set
- `Phase 6`：形成批量执行与结果导出能力
