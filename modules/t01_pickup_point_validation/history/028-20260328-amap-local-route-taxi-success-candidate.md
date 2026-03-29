# 028 - 2026-03-28 - AMap Local Route Taxi Success Candidate

## 结论

- 已在当前仓内主线下拿到一条新的 AMap `SUCCESS` 候选，不再只是北京 `same_page` 重复样本。
- 当前链路：
  - 在 AMap 中通过 `viewMap` 把地图带到宁桥路 / 金湘路一带
  - 选中 `青岛啤酒优家健康饮品(上海)有限公司`
  - 进入路线页并将终点设为 `多美滋婴幼儿食品有限公司(东南门)`
  - 切换到 `打车` 模式
  - 在打车页检测绿色起点标记 `green_start_pickup`
  - 用公共 `appmaptile` `z17/style8` + `SIFT` 做局部配准
- 当前主簇加权结果：
  - `output_x=121.60684180348042`
  - `output_y=31.249073809351668`

## 关键证据

- 打车页取点：
  - `outputs/_work/20260328_t01_gs05_taxi_mode_from_local_route/after_pick_taxi_mode.png`
  - `outputs/_work/20260328_t01_gs05_taxi_mode_from_local_route/green_start_tip.json`
  - `outputs/_work/20260328_t01_gs05_taxi_mode_from_local_route/green_start_tip_annotated.png`
- 公共底图拼图：
  - `outputs/_work/20260328_t01_gs05_route_mosaic_style8_v2/manifest.json`
  - `outputs/_work/20260328_t01_gs05_route_mosaic_style8_v2/mosaic_z17.png`
- 正式脚本配准输出：
  - `outputs/_work/20260328_t01_gs05_route_registration/style8_search_formal.json`
  - `outputs/_work/20260328_t01_gs05_route_registration/style8_overlay_formal.png`
- 主簇与单条结果记录：
  - `outputs/_work/20260328_t01_gs05_route_registration/style8_cluster.json`
  - `outputs/_work/20260328_t01_gs05_route_registration/single_point_result.json`

## 结果口径

- `provider=amap`
- `method=hybrid`
  - UI 选点 / 路线页进入打车模式
  - `green_start_pickup` 视觉取点
  - `public appmaptile style8` 同源候选底图 + `SIFT` 配准
- `status=SUCCESS`
- `confidence=medium`

## 现阶段限制

- 这条成功样例的起点是 UI 选择的 `青岛啤酒优家健康饮品(上海)有限公司`，不是直接从 CSV 原始坐标注入。
- 当前已经有正式单条结果记录，但这条本地短程链路还没有完成同口径 `2x` 重复。
- 因此：
  - “拿到可复核 SUCCESS 样例”已经成立
  - `Phase 2` 的 gate 仍保守维持 `IN_PROGRESS`
  - 下一步应优先做：
    - 同口径重复一次本地短程打车页链路
    - 把这条链迁移到更贴近合同输入的 GS05 入口
