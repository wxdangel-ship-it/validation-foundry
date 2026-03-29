# T01 脚本目录

本目录存放 T01 模块的真机探针、UI 抓取、批处理与复核脚本。

当前已同步脚本：

- `adb_uia_tap.py`
  - 按 UI bounds/中心点发起 ADB 点击
- `dump_uia_nodes.ps1`
  - Windows PowerShell 入口，抓取当前 UIAutomator 节点树
- `dump_uia_nodes.py`
  - Python 入口，抓取当前 UIAutomator 节点树
- `map_shift_probe.py`
  - 对两张截图做局部位移估计，用于判断地图是否随定位或平移变化
- `t01_amap_tip_locator.py`
  - 对高德截图做 tip 像素定位，当前支持 `taxi_my_location / red_pin / blue_pickup_pin / green_start_pickup`
- `t01_local_frame_solver.py`
  - 在同视口前提下，用锚点像素与锚点 `GCJ-02` 求解目标 `GCJ-02`
- `t01_anchor_site_solver.py`
  - 把站点级锚点配置、tip 定位和局部求解串成一条可复用链路
- `t01_map_registration.py`
  - 对 App 截图 map ROI 与参考底图 ROI 做特征配准，并投影 `pickup_tip_px`
- `t01_s2_live_repeat_probe.py`
  - 在真实手机上批量复拍 `S2`，自动完成 `live screenshot -> blue tip -> public appmaptile + SIFT`
- `t01_public_tile_mosaic.py`
  - 按给定中心点或 tile origin 拉取公共 `appmaptile` 并生成本地拼图
- `t01_amapuri_routeplan_probe.py`
  - 用高德官方 `amapuri://route/plan/` 入口把指定 `GCJ-02` 灌入高德 App，并抓取 route / taxi 页的起终点吸附结果
- `t01_amap_batch.py`
  - 高德链路批处理入口
- `t01_amap_explicit_probe.py`
  - 高德显式上车点/中心 pin 探针
- `t01_amap_locate_wait_probe.py`
  - “点击定位后等待稳定”专项探针
- `t01_amap_recheck.py`
  - 结果回灌复拍与一致性复核
- `t01_amap_shanghai_followups_probe.py`
  - 上海场景补充探针
- `uia_find.py`
  - 按文本、resource-id、bounds 在 UI 树中检索节点

当前说明：

- 高频试错证据优先落在 `outputs/_work/`
- 历史 C 盘证据仅作为 `outputs/_legacy_import/20260328_repo_remediation/` 的归档来源
- 已确认有价值的脚本必须同步到仓库
- 若后续新增稳定入口，应继续在本目录维护，并同步更新模块运行文档
