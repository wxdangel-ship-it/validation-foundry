# 005 - 2026-03-27 - AMap Output Recheck Success

## 概述

使用最终 `results.csv` 中的 `output_x/output_y` 重新注入 `MockGps`，再次进入高德 taxi 页并复拍，验证输出坐标的回灌一致性。

## 结果

- 样例数：`10`
- 结果：`10/10 SUCCESS`
- 结果表：`outputs/_work/20260327_t01_amap_recheck_10/recheck_results.csv`
- 摘要：`outputs/_work/20260327_t01_amap_recheck_10/summary.json`

## 证据结构

- 每个样例目录包含：
  - `orig_amap_taxi.png`
  - `recheck_amap_taxi.png`
  - `compare_side_by_side.png`

## 结论

当前高德备选链路的最终输出坐标，经过回灌后能稳定回到相同业务页状态，满足当前阶段的内部验证要求。
