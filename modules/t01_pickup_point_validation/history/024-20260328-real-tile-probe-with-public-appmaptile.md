# 024 - 2026-03-28 - Real Tile Probe With Public AppMapTile

## 结论先行

- 用户提供的 `appmaptile` URL 是可用的，能够返回真实高德底图瓦片。
- 但当前这一轮基于粗地理近似位置和 `z16/z17` 的真实配准信号偏弱，暂时不能直接升级为生产主线。

## 参考源

- URL 模板：
  - `http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`

## 当前做法

- 用实时 live screenshot 中的 pickup 页面作为 target
- 用外部坐标源近似定位：
  - `116.4209, 40.03836`
- 拉取真实底图瓦片并拼图：
  - `z16`
  - `z17`
- 再用 `t01_map_registration.py` 做截图到真实底图的配准

## 结果

- 证据：
  - `outputs/_work/20260328_t01_map_registration_validation/real_tile_probe_summary.json`
- 当前指标：
  - `z16`
    - `match_count=11`
    - `inlier_count=4`
    - `inlier_ratio=0.3636`
  - `z17`
    - `match_count=9`
    - `inlier_count=4`
    - `inlier_ratio=0.4444`

## 当前判断

- `service_usable`: `YES`
- `same_source_registration_ready`: `NO`
- 原因：
  - 当前近似位置精度不够
  - 当前缩放层级仍未锁准
  - 截图和真实底图之间仍存在视图/样式差

## 这意味着什么

- 这条路没有被证伪
- 但当前还不能替代：
  - 站点级锚点库
- 若继续推进，应优先补：
  - 更准的中心坐标
  - 更接近手机当前缩放的参考层级
  - 更干净的有效地图 ROI
