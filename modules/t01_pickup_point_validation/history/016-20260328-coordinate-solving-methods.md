# 016 - 2026-03-28 - Coordinate Solving Methods

## 结论先行

- 本文只讨论 `screen tip_px -> GCJ-02` 的几何 / 视觉求解，不讨论应用启动、mock 保活、设备运行时或批量调度。
- `visual_tip` 是测量输入，不是独立求解器。
- 当前最强已知事实是：局部双锚点标定已经做成过，并在同视口条件下输出过可复核的 `GCJ-02` 估计。

## 可复用历史资产

- `modules/t01_pickup_point_validation/scripts/map_shift_probe.py`
  - 提供两张截图的局部位移估计入口
- `modules/t01_pickup_point_validation/scripts/t01_amap_explicit_probe.py`
  - 提供围绕显式 tip 的探针能力
- `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/estimation.json`
- `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/gate_results.csv`

## 方法对比

| 方法 | 前提 | 预期精度 | 可复核性 | 失败条件 |
|---|---|---|---|---|
| 局部双锚点标定 | 同一底图、同一视口、同一缩放、同一朝向；至少 2 个已知 `GCJ-02` 锚点；`tip_px` 已稳定定位 | 当前最强 | 高 | 视口变了、缩放变了、锚点错了 |
| 固定视口 / 固定缩放反算 | 先把地图状态锁死，再复用同一套局部变换 | 接近双锚点标定 | 很高 | UI 改版、地图自动 recenter、朝向变化 |
| 拖图前后像素位移与地理位移关系 | 能做受控拖图；前后截图可对齐 | 中等 | 中等 | app 自动回中、地图旋转、语义状态变化 |
| `Hybrid` 粗定位 + 精反算 | 先把视口拉近目标，再用局部标定完成精反算 | 端到端最稳 | 高 | 粗定位错位大、`tip` 不出现、阶段间视口漂移 |

## 推荐顺序

1. 局部双锚点标定
2. 固定视口 / 固定缩放反算
3. `Hybrid` 粗定位 + 精反算
4. 拖图位移

## 当前判断

- 如果目标是“最快拿到第一个可复核 SUCCESS”，主线应先走：
  - 局部双锚点标定
  - 固定视口复用
- 如果目标是“把单点成功扩成可批量化成功”，再把 `Hybrid` 提前到生产主线。
- `拖图位移` 只保留为补充修正和故障排查手段。
