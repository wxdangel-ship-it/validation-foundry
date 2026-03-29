# 020 - 2026-03-28 - Local Frame Solver Validation

## 结论先行

- “没有绝对坐标源就很难反算”是对的。
- 但在“已有稳定锚点坐标”的前提下，反算链路已经可以工程化。
- 仓内已新增 `modules/t01_pickup_point_validation/scripts/t01_local_frame_solver.py`。

## 方法

- 求解口径：`axis_aligned_same_view`
- 前提：
  - 同一底图
  - 同一视口
  - 同一缩放
  - 同一朝向
- 输入：
  - 至少 `2` 个锚点
  - 每个锚点包含：
    - `GCJ-02`
    - `tip_x/tip_y`
- 输出：
  - 目标 `tip_x/tip_y` 对应的 `output_x/output_y`

## 验证

- 锚点来源：
  - `company`
  - `parking`
- 目标点：
  - `dongnan`
- 输入资产：
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/estimation.json`
- 输出证据：
  - `outputs/_work/20260328_t01_frame_solver_validation/dongnan_validation.json`

## 结果

- 复现结果：
  - `output_x=121.60976046703287`
  - `output_y=31.247871499999967`
- 与历史导入值一致到浮点误差级

## 当前意义

- 当前工程缺口已经不再是：
  - “能不能写出局部反算器”
- 当前真正缺口变成：
  - 实时高德页面里，如何稳定拿到足够的绝对坐标锚点

## 对后续方案的影响

- 不建议继续押注：
  - `mock_direct`
  - app 运行时抓瓦片
  - OCR 地图路牌作为主依赖
- 建议主线改成：
  - 稳定页面态
  - 自动 tip 定位
  - 公开/可审计锚点坐标供给
  - 局部同视口求解
