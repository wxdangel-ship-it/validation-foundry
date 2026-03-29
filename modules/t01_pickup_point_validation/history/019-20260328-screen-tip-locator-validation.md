# 019 - 2026-03-28 - Screen Tip Locator Validation

## 结论先行

- “我们还没有稳定可以拿到屏幕坐标的能力”这句话，现在只对实时链路整合还成立；对离线截图取点本身已经不成立。
- 仓内已新增 `modules/t01_pickup_point_validation/scripts/t01_amap_tip_locator.py`。
- 该脚本当前覆盖两个高价值页面态：
  - `taxi_my_location`
  - `red_pin`

## 已完成验证

### 1. `taxi_my_location`

- 方法：`template_match`
- 验证样本：`10`
- 结果：`10/10 PASS`
- 口径：
  - 历史 `amap_taxi.png` 样本全部精确回到 `tip=(539,681)`
- 证据：
  - `outputs/_work/20260328_t01_tip_locator_validation/taxi_my_location_validation.csv`
  - `outputs/_work/20260328_t01_tip_locator_validation/taxi_my_location_summary.json`

### 2. `red_pin`

- 方法：`red_pin_component_merge`
- 验证样本：`2`
- 结果：`2/2 PASS (<=5px)`
- 样本：
  - `parking_annotated.png`
  - `dongnan_annotated.png`
- 证据：
  - `outputs/_work/20260328_t01_tip_locator_validation/red_pin_validation.csv`
  - `outputs/_work/20260328_t01_tip_locator_validation/red_pin_summary.json`

## 当前意义

- 当前最大不确定性不再是“能不能从截图里提 tip 像素”。
- 当前最大不确定性变成：
  - 实时高德页面能否稳定诱发显式 tip
  - 取到的 `tip_x/tip_y` 能否在同一次证据包里接上局部标定 / 固定视口反算

## 对主线的影响

- `amap + visual_tip`：优先级上升
  - 因为取点器已经可代码化
- `amap + hybrid`：仍是主线
  - 现在更像“页面收敛 + 自动取点 + 几何反算”的端到端组合
- 当前版 `amap + mock_direct`：不恢复主线地位

## 仍未解决的问题

- `blue_poi` / `blue_gate` 这类锚点还没有统一自动提取器
- 当前 `red_pin` 验证样本数偏少，只能证明这条路线有现实可行性
- 还没有完成“实时截图 -> 自动提点 -> `GCJ-02` 反算 -> 新 schema 结果记录”的单次合同级闭环
