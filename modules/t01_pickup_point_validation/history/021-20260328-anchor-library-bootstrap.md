# 021 - 2026-03-28 - Anchor Library Bootstrap

## 结论先行

- 当前要工程稳定，不应继续寻找“无锚点全局解”。
- 当前应把主线收口为：
  - 站点级锚点库
  - 自动 tip 定位
  - 局部同视口求解
- 仓内已完成第一版锚点库 bootstrap，并跑通一条端到端历史样例。

## 新增资产

- 锚点库目录：
  - `modules/t01_pickup_point_validation/anchor_library/`
- 站点样例：
  - `modules/t01_pickup_point_validation/anchor_library/sites/amap_momeizi_same_view_v1.json`
- `golden-10` 锚点建设状态：
  - `modules/t01_pickup_point_validation/anchor_library/golden10_anchor_status.csv`
- 端到端 runner：
  - `modules/t01_pickup_point_validation/scripts/t01_anchor_site_solver.py`

## Bootstrap 站点

- `site_id`：`amap_momeizi_same_view_v1`
- 锚点：
  - `company`
  - `parking`
- 目标：
  - `dongnan`

## 验证结果

- 输出证据：
  - `outputs/_work/20260328_t01_anchor_site_bootstrap/dongnan_solution.json`
  - `outputs/_work/20260328_t01_anchor_site_bootstrap/dongnan_solution.png`
- 结果：
  - `output_x=121.60975312109662`
  - `output_y=31.247871499999967`
- 对比历史导入值：
  - `expected_output_x=121.60976046703298`
  - `expected_output_y=31.2478715`
- 误差：
  - `delta_x=-7.345936367642025e-06`
  - `delta_y=-3.197442310920451e-14`

## 解释

- 当前误差主要来自 `red_pin` 自动 tip 定位相对历史人工标注仍有小幅像素差。
- 但这已经足以证明：
  - 锚点库配置
  - 自动 tip 定位
  - 局部同视口求解
  - 可以被串成一条稳定代码链

## 对后续的直接要求

- `Phase 2` 下一步不再抽象讨论“有没有通解”。
- 直接做：
  - 优先补 `GS05`
  - 再补其邻近样点
  - 每补出一个站点锚点库，就立刻接入当前 runner 做单点验证
