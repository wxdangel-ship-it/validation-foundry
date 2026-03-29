# 026 - 2026-03-28 S2 Live Repeat Experiments

## 目标

- 在真实手机上继续验证 `S2 = 屏幕截图 + 公共参考底图配准`
- 不再只看单次样本，而是看重复实验下是否收敛

## 实验设计

### 组 1：`same_page`

- 做法：
  - 若当前不是 taxi 页，先自动拉起一次高德 taxi 页
  - 在不重开 App 的情况下连续复拍 `3` 次
  - 每次自动执行：
    - `blue_pickup_pin_bottom_tip`
    - `public appmaptile + z17/style7 + SIFT` 配准

### 组 2：`reopen`

- 做法：
  - 每次都强制重开高德 taxi 页
  - 每次只跑 `1` 次，避免长链路把 `uiautomator` 压死
  - 共补 `4` 个单次样本

## 结果

### `same_page`

- `3/3` 成功
- tip 取点：
  - `run01 = [558.0, 583.0]`
  - `run02 = [558.0, 578.0]`
  - `run03 = [558.0, 574.0]`
- 三次结果都落入同一收敛簇：
  - `output_x = 116.4248853377763`
  - `output_y = 40.04031897919065`
  - `member_count = 3`
  - `best_cluster_max_distance_m = 2.6`

### `reopen`

- 成功样本：
  - `reopen_page_run01`
  - `reopen_single02_run01`
  - `reopen_single04_run01`
- 失败样本：
  - `reopen_single03_run01`
  - 初始表现为 `tip NOT_FOUND`
  - 扩大 blue-tip ROI 后已可抓到 `tip=[505.5,785.0]`
  - 但补做离线配准后只有 `inlier_count=9`
  - 当前仍应按“不可稳定求解”处理
- 当前判断：
  - `reopen` 后存在明显页面分型
  - 成功样本并不总是落入同一簇
  - 因此 `fresh reopen -> 直接稳定出同一坐标` 还不能成立

## 关键证据

- 聚合汇总：
  - `outputs/_work/20260328_t01_s2_repeat_probe/all_groups_consensus.json`
- `same_page`：
  - `outputs/_work/20260328_t01_s2_repeat_probe/same_page_summary.json`
- `reopen` 成功样本：
  - `outputs/_work/20260328_t01_s2_repeat_probe/reopen_page_run01/registration.json`
  - `outputs/_work/20260328_t01_s2_repeat_probe/reopen_single02_summary.json`
  - `outputs/_work/20260328_t01_s2_repeat_probe/reopen_single04_summary.json`
- `reopen` 失败样本：
  - `outputs/_work/20260328_t01_s2_repeat_probe/reopen_single03_summary.json`
  - `outputs/_work/20260328_t01_s2_repeat_probe/reopen_single03_run01/recovery_summary.json`

## 结论

- `S2` 已经被证明不是偶然命中。
- 在固定同页条件下，`S2` 已具备重复性。
- 但在“每次重开高德”这个更强条件下，页面会出现分型：
  - 有的分型可稳定取到蓝色 tip 并配准
  - 有的分型会切到其他 pickup 文案
  - `清友园(西4门)-链家旁` 当前虽然可取 tip，但配准仍弱
- 因此当前最准确的工程判断是：
  - `S2 same_page = stable`
  - `S2 fresh_reopen = unstable / state-dependent`

## 下一步

1. 在重开链路前增加页面分型器。
2. 将 `blue_pickup_pin_bottom_tip` 扩成多分型规则，而不是只识别当前一种蓝色 pin。
3. 单独处理 `清友园(西4门)-链家旁` 分型的参考底图语义和窗口搜索参数。
4. 把已经稳定的 `same_page` 链路用于下一条合同样本。
