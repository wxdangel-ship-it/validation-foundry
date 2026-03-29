# T01 Reference Registration

本目录存放 “App 截图 <-> 参考底图” 配准相关资产。

## 目标

- 在固定视角下，把高德 App 截图中的地图区域与参考底图配准
- 将 App 里的 `pickup_tip_px` 投影到参考底图
- 后续再由参考底图侧的 `Projection` / 已知地理变换恢复 `GCJ-02`

## 当前边界

- 当前只做：
  - 固定视角 profile
  - 配准器
  - 参考底图接入协议
- 当前不做：
  - 抓取 App 内部瓦片
  - 无 key 的 SDK 在线渲染
  - 无约束全局通解

## 目录约定

- `profiles/*.json`
  - 固定视角 profile
  - 定义屏幕大小、地图 ROI、排除 ROI、参考画布约束

## 当前工作方式

1. 从 App 稳定页面抓屏
2. 依据固定视角 profile 抽取 map ROI
3. 对 App map ROI 与参考底图 ROI 做特征配准
4. 把 `pickup_tip_px` 映射到参考底图
5. 由参考底图侧恢复 `GCJ-02`

## 当前进展

- 当前已接入公共参考底图候选：
  - `http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7/8&x={x}&y={y}&z={z}`
- 当前有效配准口径：
  - 固定竖屏视角
  - `SIFT` 特征配准
  - `z17/style7` 在北京 `same_page` 样例上最先形成稳定簇
  - `z17/style8` 已在本地短程打车页样例上形成新的主簇
- 当前最佳收敛簇结果：
  - `output_x=116.42497310610331`
  - `output_y=40.040352321549335`
  - 证据：`outputs/_work/20260328_t01_map_registration_validation/real_z17_style7_sift_consensus.json`
- 当前仍需：
  - 本地短程打车页链路的第 `2` 次复拍
  - 把本地短程入口迁移到更贴近合同输入的 GS05 入口

## Live 重复实验结论

- `same_page`
  - 已完成 `3/3` 复拍收敛
  - 当前最佳簇：
    - `output_x=116.4248853377763`
    - `output_y=40.04031897919065`
- `fresh reopen`
  - 当前仍是页面分型问题，不是纯配准器问题
  - 已观察到至少三类 pickup 文案：
    - `西北侧`
    - `西北门`
    - `清友园(西4门)-链家旁`
    - `中国工商银行(北京北苑家园支行)` 这类 generic pickup
  - `清友园(西4门)-链家旁` 已可取到 blue tip，但当前配准仍弱
  - 当前最稳定的 `fresh reopen` 分型是 `school_northwest_gate`

## 本地短程打车页新结果

- 当前已新增 route-profile：
  - `profiles/amap_taxi_local_route_v1.json`
- 当前已新增公共底图拼图脚本：
  - `modules/t01_pickup_point_validation/scripts/t01_public_tile_mosaic.py`
- 当前已新增绿色起点取点口径：
  - `green_start_pickup`
- 当前本地短程打车页主簇结果：
  - `output_x=121.60684180348042`
  - `output_y=31.249073809351668`
  - `cluster_member_count=4`
  - `max_distance_to_best_m=12.43`
- 证据：
  - `outputs/_work/20260328_t01_gs05_route_registration/style8_cluster.json`
  - `outputs/_work/20260328_t01_gs05_route_registration/single_point_result.json`
