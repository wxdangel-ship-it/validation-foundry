# 04 方案策略

## 状态

- 当前状态：`重启后主线策略`
- 来源依据：
  - `INTERFACE_CONTRACT.md`
  - `docs/project-management/current-status.md`
  - `docs/project-management/current-phase-plan.md`

## 总体策略

1. 先把仓库边界和历史资产纠偏到 E 盘仓库
2. 不预设 `mock-only`
3. 先选出最早可交付的两条主线
4. 先拿一个真实单点 `SUCCESS`
5. 再决定正式主线与 fallback

## 方法组合表

| provider × method | 当前判断 | 角色 |
|---|---|---|
| `amap + hybrid` | 当前最强主线 | 主线 1 |
| `amap + visual_tip` | 当前第二主线 | 主线 2 |
| `amap + drag_map` | 只做几何辅助 | 支撑手段 |
| `amap + mock_direct` | 当前版已降级 | 不再主攻 |
| `amap old-version + mock_direct` | 可做一次低成本回退验证 | fallback |
| `didi + mock_direct` | 入口可用但业务态失败 | exploratory |

## 为什么这样排序

- `amap + hybrid`
  - 已有稳定业务页资产
  - 已有显式 tip 语义
  - 已有局部反算能力
- `amap + visual_tip`
  - 路径更短
  - 适合快速验证合同级取点闭环
- `drag_map`
  - 更适合作为视口控制与几何约束，不适合单独承担最终可信度
- `didi + mock_direct`
  - 当前前台和 mock 都可达
  - 但业务态仍反复收敛到非目标上下文

## 降级与失败策略

- 当前版 AMap 的重复 `mock_direct` 不再追加投入
- Didi 当前按 `FAIL` 管理，不再按 `BLOCKED`
- 若高德主线仍无法产出当前合同级 SUCCESS，再考虑旧版 AMap 一次性回退验证
