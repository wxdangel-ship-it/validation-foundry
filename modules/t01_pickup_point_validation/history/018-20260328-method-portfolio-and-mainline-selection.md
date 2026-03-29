# 018 - 2026-03-28 - Method Portfolio and Mainline Selection

## 目的

把线程重启后的候选技术路径、主线选择、已证伪方向和当前单点推进结果统一收口。

## 候选技术路径表

| provider × method | 前提 | 当前证据 | 当前判断 |
|---|---|---|---|
| `amap + hybrid` | 高德业务页可达；显式 tip 可见；局部反算可复用 | 已有高德稳定页、显式 tip、局部标定三类资产 | 主线 1 |
| `amap + visual_tip` | 显式 tip 可稳定定位；同视口反算成立 | 已有人工确认 tip 与历史反算样例 | 主线 2 |
| `amap + drag_map` | 允许受控拖图且页面不失稳 | 仓内已有位移估计脚本和拖图思路 | 辅助方法 |
| `amap + mock_direct` | app 直接跟 mock 且可暴露可信上车点 | 当前版高德已被多轮证据压低优先级 | 降级 |
| `amap old-version + mock_direct` | 一次人工确认允许降级安装 | 旧 APK 已有归档，但无新证据证明其优于当前版 | fallback |
| `didi + mock_direct` | launcher 可达；业务态能收敛到目标上下文 | 入口与 mock 都在，但当前前台仍为无关上下文 | exploratory |

## 选出的两条优先主线

### 主线 1：`amap + hybrid`

理由：

- 当前最接近“最早拿到合同级 SUCCESS”
- 能复用已有稳定高德页面链
- 能把 `mock` 只作为粗定位手段，而不是唯一成功标准
- 能接上已有 `tip_px -> GCJ-02` 反算资产

### 主线 2：`amap + visual_tip`

理由：

- 路径最短
- 已有人为确认的显式 tip 口径
- 已有同视口局部标定成功样例
- 若能再次稳定诱发显式 tip，就能快速验证是否可升到合同级 SUCCESS

## 已降级或已证伪方向

- 当前版 `amap + mock_direct`
  - 已降级
  - 不再做重复探针
- `didi + mock_direct`
  - 当前不再写成 `BLOCKED`
  - 当前写成 `FAIL`
  - 保留为低成本复查支线
- `drag_map` 单独主线
  - 当前不成立
  - 只保留为视口控制与几何辅助

## 当前单点推进结果

### 1. AMap 侧单点推进结果

仓内已导入一个对主线 1 / 主线 2 都有价值的单点成果：

- 证据目录：
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/`
- 关键样例：
  - `多美滋婴幼儿食品有限公司(东南门)`
  - `method=screen_calibrated_from_company_parking_same_view`
  - `output_x=121.60976046703298`
  - `output_y=31.2478715`

这说明：

- 在“同一底图、同一视口、同一缩放”的前提下，`visual_tip -> GCJ-02` 已经不是空白假设
- 高德主线缺的不是求解器是否存在，而是一次新的、仓内完整证据链重跑

当前限制：

- 该成果属于历史导入单点，不是本轮新跑出来的合同级 SUCCESS
- 还需要一次新的仓内短链路实验，把页面链、tip、反算、验证串到同一证据包

### 2. Didi 侧单点推进结果

本轮主线程已在仓内新增最小 smoke 证据：

- 证据目录：
  - `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/`

当前单点结论：

- `provider=didi`
- `method=mock_direct`
- `status=FAIL`
- `confidence=medium`
- 原因：
  - launcher 与前台都可达
  - `dumpsys location` 显示 mock provider 仍然成立
  - `front.xml` 直接出现 `清友园-西4门(主路)`，表明业务态仍收敛到非目标上下文

## 当前正式判断

- 现在可以冲击 `Phase 2`：
  - `YES`
- 原因：
  - 运行时不阻塞
  - 两条高德主线都已有仓内可复用资产
  - 需要的是一次短链路新实验，不是重新打环境

## 下一步最小动作

1. 用 `adb.exe` 重新拉起高德当前主线。
2. 只围绕显式 tip / 视口稳定 / 局部标定取证。
3. 产出一条带 `provider + method + confidence` 的新 schema 单条结果。
4. 对同一主线重复至少 `2` 次，判断是否升级为 `Phase 2 PASS`。
