# 015 - 2026-03-28 - AMap Method Probe

## 结论先行

当前最有机会产出最终 `GCJ-02` 上车点坐标的路线，不是继续做当前版 `mock_direct`，而是：

1. `视觉 fallback + 局部标定反算`
2. `拖图 / 视口操控` 作为上述路线的辅助手段
3. `旧版 AMap` 仅作为一次性低成本回退验证

## 已知资产

- 高德当前版在真实设备上已经证明可以稳定进入 `我的位置 上车` 状态，并完成 `10/10` legacy batch
- 回灌复拍同样 `10/10 SUCCESS`
- 用户已人工确认过一个显式上车点 tip 样例
- 局部屏幕点反算能力已存在
- 上述历史资产现已进入仓库：
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_amap_visual_forensics/`
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/`
- 仓库内已有位移估计脚本：
  - `modules/t01_pickup_point_validation/scripts/map_shift_probe.py`
- 仓库内已有显式上车点探针：
  - `modules/t01_pickup_point_validation/scripts/t01_amap_explicit_probe.py`

## 方法比较

| 路线 | 现状判断 | 产出最终坐标机会 | 角色 |
|---|---|---:|---|
| 当前版 `mock_direct` | 已被现有证据压低优先级 | 低 | 不再主攻 |
| 旧版 `mock_direct` | 仍有理论价值，但缺少新证据 | 中低 | fallback |
| `visual_tip` | 已有显式 tip 与局部反算资产 | 高 | 主线 |
| `drag_map` | 更像视觉路线的辅助工具 | 中 | 辅助 |
| `hybrid` | 能把稳定页面链与反算能力串起来 | 高 | 主线 |

## 推荐顺序

### 1. `visual_tip + 局部标定`

- 当前最短
- 当前证据最完整
- 最容易形成可审计结果

### 2. `hybrid`

- 最稳
- 适合把现有高德稳定业务页与反算能力串成统一证据链

### 3. `drag_map`

- 只作为辅助
- 用于诱发 tip、稳定视口或补充几何约束

### 4. `旧版 AMap`

- 只做一次低成本验证
- 不应排在视觉 / hybrid 之前

## 不值得继续浪费时间的方向

- 当前版 `mock_direct` 的重复探针
- 仅凭 `我的位置` 气泡或蓝点就直接宣称拿到了上车点
- 没有 tip、没有标定、没有回灌验证的看图猜坐标

## 当前判断

### 可以继续推进的两条主线

1. `amap + hybrid`
2. `amap + visual_tip`

### 需要降级为备选的一条路线

1. `amap old-version + mock_direct`

### 应停止追加投入的一条路线

1. 当前版 `amap + mock_direct`
