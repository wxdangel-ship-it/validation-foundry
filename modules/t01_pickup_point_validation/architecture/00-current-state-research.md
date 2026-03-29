# 00 当前状态研究

## 当前状态

- 模块 ID：`t01_pickup_point_validation`
- 当前阶段：`Phase 2 attack-ready`
- 研究目标：在不预设 `mock-only` 的前提下，找到最先可交付的上车点 `GCJ-02` 获取路径

## 当前输入证据

- 线程重启 handoff
- Phase 0 remediation 报告
- 运行时 smoke
- 滴滴 / 高德 / 坐标求解 / QA 五条子线程结论

## 当前观察

- 设备与 ADB 不再是主阻塞
- 滴滴已从“入口不可用”转为“业务态不可交付”
- 高德当前版 `mock_direct` 已被证据压低优先级
- 高德显式 tip 与局部反算资产已足以支持 `visual_tip / hybrid`

## 当前最大不确定性

- 能否在一次新的仓内短链路实验中，把：
  - 当前页面链
  - 显式 tip
  - `tip -> GCJ-02`
  - 复拍验证
  串成同一次证据包
