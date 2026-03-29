# 029 - 2026-03-28 - AMap URI Routeplan Target-Gate Breakthrough

## 结论

- 已确认高德官方 Android `amapuri://route/plan/` 入口可直接把指定 `GCJ-02` 坐标灌入高德 App 原生路线页，再切入 `打车` 页。
- 对 `多美滋婴幼儿食品有限公司(东南门)`，通过 routeplan 坐标扫描已找到一组可重复坐标：
  - `output_x=121.60925`
  - `output_y=31.2485`
- 该坐标至少 `2x` 在 taxi 页被高德吸附成：
  - `多美滋婴幼儿食品有限公司(东南门)`
- 因而当前仓内已新增一条更贴近合同输入的 AMap `SUCCESS` 候选主线：
  - `routeplan_uri -> taxi -> exact_gate_label`

## 方法

1. 使用高德官方 Android 路径规划 URI：
   - `amapuri://route/plan/?sourceApplication=...&slat=...&slon=...&dlat=...&dlon=...&dev=0&t=0&m=0`
2. 进入路线页后展开 `更多`
3. 点击 `打车`
4. 在 taxi 页读取起点输入栏文本，判断高德对 `slat/slon` 的门点吸附结果

## 关键结果

### 1. routeplan URI 已打通

- 证据目录：
  - `outputs/_work/20260328_t01_amapuri_routeplan_probe/`
- 当前结论：
  - `m.amap.com` HTTP 入口会落浏览器，不作为主线
  - `amapuri://route/plan/` 会落高德 App 原生路线页，可作为当前主线入口

### 2. 目标门点坐标扫描

- 初始历史估计 `121.609760467033,31.2478715` 在 taxi 页稳定吸附为：
  - `上海天赐福生物工程有限公司(东南门)`
- 证据目录：
  - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_sweep_v2/`

- 把扫描中心向西北移动后，出现目标园区门点：
  - `run_07` / `run_08`：
    - `多美滋婴幼儿食品有限公司(东南1门)`
  - `run_09`：
    - `多美滋婴幼儿食品有限公司(东南门)`
- 证据目录：
  - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_sweep_v3/summary.csv`
  - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_sweep_v3/run_09/`

### 3. 单点重复

- 对同一坐标：
  - `slon=121.60925`
  - `slat=31.2485`
- 再做一次单点复拍，仍在 taxi 页起点输入栏得到：
  - `多美滋婴幼儿食品有限公司(东南门)`
- 证据目录：
  - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_repeat_target_v2/`

## 新增资产

- 新脚本：
  - `modules/t01_pickup_point_validation/scripts/t01_amapuri_routeplan_probe.py`
- 新取点分型：
  - `routeplan_pickup_right`
- 新 ROI profile：
  - `modules/t01_pickup_point_validation/reference_registration/profiles/amap_taxi_routeplan_target_v1.json`

## 取点与配准状态

- 当前已在目标门点 taxi 页取到绿色起点底部像素：
  - `tip_x=852`
  - `tip_y=1159`
- 证据目录：
  - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_repeat_target_v2/run_01/green_start_tip.json`

- 但基于公共 `appmaptile style8` 的当前配准仍弱：
  - `inlier_count=6`
  - 投影坐标未回到目标门点附近
- 因此：
  - routeplan exact-gate 匹配已经成立
  - `tip -> public tile registration` 这一段仍需单独加固

## 当前判断

- 当前最强新主线不是继续手工选本地 POI，而是：
  - `amapuri_routeplan + taxi exact gate label + green_start_pickup`
- 这条主线的优势：
  - 不依赖不稳定的终点候选列表点击
  - 直接以 `GCJ-02` 驱动高德 App
  - 已能重复把指定坐标吸附到目标门点
- 当前剩余缺口：
  - 把目标门点 taxi 页的绿色起点稳定投回公共底图坐标
