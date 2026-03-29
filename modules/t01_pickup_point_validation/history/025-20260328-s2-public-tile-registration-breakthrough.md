# 025 - 2026-03-28 S2 公共底图配准突破

## 背景

- 目标：继续推进 `S2 = 屏幕截图 + 参考底图配准`
- 约束：
  - 不抓 App 内部渲染瓦片
  - 只使用公开可获取的高德底图候选
  - 固定高德 taxi 页竖屏视角

## 输入

- live 高德 taxi 页截图：
  - `outputs/_work/20260328_t01_live_projection_pickup/step06_after_back_close.png`
- live pickup 点：
  - `pickup_tip_px=[556,637]`
- 参考底图候选：
  - `http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7/8&x={x}&y={y}&z={z}`

## 过程

1. 先验证 `AKAZE` 路线。
2. `AKAZE` 在真实 `z16/z17` 公共瓦片上只得到弱信号，不能用于稳定求解。
3. 将配准器扩展为可切换 `SIFT`：
   - `modules/t01_pickup_point_validation/scripts/t01_map_registration.py`
   - `modules/t01_pickup_point_validation/scripts/t01_reference_window_search.py`
4. 在 `z17/style7` 参考拼图上重跑窗口搜索。
5. 对多组候选结果做坐标聚类，形成收敛簇。

## 结果

- `SIFT + z17/style7` 明显优于 `AKAZE`
- 单次窗口搜索最佳结果：
  - `match_count=96`
  - `inlier_count=29`
  - `projected_tip_lonlat=[116.42488553527681,40.04037416753541]`
- 结合两轮 `SIFT` 结果形成的最佳收敛簇：
  - 成员数：`5`
  - 总内点权重：`142`
  - 加权坐标：
    - `output_x=116.42497310610331`
    - `output_y=40.040352321549335`

## 证据

- `outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_window_search_sift_v1.json`
- `outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_window_search_sift_refine_v2.json`
- `outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_sift_consensus.json`
- `outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_window_overlay_sift_v1.png`
- `outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_window_overlay_sift_refine_v2.png`

## 判断

- `S2` 不再只是“公共瓦片弱探针”
- `S2` 已拿到一条中置信度单点候选
- 当前还不能直接宣告合同级 `SUCCESS`
  - 原因：缺少第二次同口径 live 复拍复算

## 下一步

1. 在同一固定视角下复拍一次 live 高德 taxi 页。
2. 复用同一 `SIFT + z17/style7` 流程复算。
3. 若结果仍收敛到同一坐标簇，则升级为合同级单点 `SUCCESS` 候选。
4. 若结果发散，再切回 `anchor_library` fallback 做对照。
