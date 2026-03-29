# 027 - 2026-03-28 S2 Page Variant Findings

## 目标

- 对 `fresh reopen` 下的高德 taxi 页面做分型
- 不再笼统地把所有 `fresh reopen` 结果混在一起评估

## 已实现能力

- 在 `t01_amap_tip_locator.py` 中加入：
  - `classify_taxi_page_variant(texts)`
  - `blue_pickup_pin` 的分型提示参数
- 在 `t01_s2_live_repeat_probe.py` 中接入：
  - 页面分型
  - 分型驱动的 blue-tip 取点

## 当前观测到的分型

1. `school_northwest_gate`
   - 文案示例：
     - `北京市和平街第一中学小学部清友园校区(西北门)`
2. `school_northwest_side`
   - 文案示例：
     - `北京市和平街第一中学小学部清友园校区(西北门)西北侧`
3. `qingyouyuan_w4_lianjia`
   - 文案示例：
     - `清友园(西4门)-链家旁`
4. `generic_taxi_pickup`
   - 当前已见示例：
     - `中国工商银行(北京北苑家园支行)`

## 分型结果

证据汇总：

- `outputs/_work/20260328_t01_s2_repeat_probe/variant_summary.json`

### `school_northwest_gate`

- `total = 6`
- `registration_success = 6`
- `near_main_cluster = 5`
- 结论：
  - 当前最稳定
  - 已经接近可作为 `fresh reopen` 主线分型

### `school_northwest_side`

- `total = 2`
- `registration_success = 2`
- `near_main_cluster = 1`
- 结论：
  - 可解，但稳定性弱于 `school_northwest_gate`

### `qingyouyuan_w4_lianjia`

- 初始表现：`tip NOT_FOUND`
- 扩展 blue-tip ROI 后：
  - 可取到 `tip=[505.5,785.0]`
  - 但离线恢复配准只有 `inlier_count=9`
- 结论：
  - 当前属于“可取点、不可稳定求解”

### `generic_taxi_pickup`

- 当前示例：
  - `中国工商银行(北京北苑家园支行)`
- 表现：
  - 可取点
  - 但距离 `same_page` 主簇约 `149m`
  - `inlier_count=13`
- 结论：
  - 当前属于 off-cluster 弱分型

## 工程结论

- `fresh reopen` 不是整体失败。
- 真正稳定的是特定页面分型，而不是“所有重开页”。
- 当前优先级应调整为：
  1. 主攻 `school_northwest_gate`
  2. 次级处理 `school_northwest_side`
  3. 暂不继续投入 `generic_taxi_pickup`
  4. `qingyouyuan_w4_lianjia` 单独建参数，不混进主线
