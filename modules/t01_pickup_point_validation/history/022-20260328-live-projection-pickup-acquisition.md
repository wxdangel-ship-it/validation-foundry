# 022 - 2026-03-28 - Live Projection Pickup Acquisition

## 结论先行

- 已在真实设备上完成一次“固定视角下直接获取高德 live 上车点屏幕坐标”。
- 这次不是历史导入，而是本轮实时取证。
- 当前 live pickup 点已落盘：
  - `pickup_tip_px=[556,637]`

## 取证条件

- 设备：`LYA-AL00`
- 屏幕覆盖尺寸：`1080x2340`
- 方向：`portrait`
- app：`com.autonavi.minimap`
- 页面态：
  - 高德 taxi 页
  - `你要去哪儿` 可见
  - `上车` 可见

## 取点规则

- 规则：`blue_pickup_pin_bottom_tip`
- 口径：
  - 在固定视角 taxi 页中，取蓝色上车 pin 的尖端底点
- 当前结果：
  - `pickup_tip_px=[556,637]`

## 关键证据

- 干净页面：
  - `outputs/_work/20260328_t01_live_projection_pickup/step06_after_back_close.png`
- UI dump：
  - `outputs/_work/20260328_t01_live_projection_pickup/step06_after_back_close.xml`
- 蓝色组件掩膜：
  - `outputs/_work/20260328_t01_live_projection_pickup/step06_blue_mask.png`
- 取点标注：
  - `outputs/_work/20260328_t01_live_projection_pickup/step06_pickup_tip_annotated.png`
- 摘要：
  - `outputs/_work/20260328_t01_live_projection_pickup/pickup_projection_summary.json`

## 当前意义

- “先稳定视角，再从 live 屏幕拿上车点”已经被证明可执行。
- 当前下一步不再是争论是否能拿到 live pickup 点，而是：
  - 把这个 live `tip_px` 接到锚点库求解链
  - 或接到参考底图配准链
