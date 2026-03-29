# T01 上车点坐标验证规格

> 本文件是 T01 线程重启后的当前业务合同基线。项目级运行状态以 `docs/project-management/*` 为准，模块级长期契约以 `modules/t01_pickup_point_validation/*` 为准。

## 1. 文档定位

- 文档类型：需求基线规格
- 模块 ID：`t01_pickup_point_validation`
- 当前状态：`active`
- 本文件作用：冻结 T01 在重启后的业务目标、输入输出合同、方法枚举、阶段 gate 与禁止事项

## 2. 模块业务目标

- 输入：`GCJ-02` 坐标 CSV
- 输出：目标应用中“上车点”的最终 `GCJ-02`
- 允许多种黑盒技术路径并行竞争：
  - `mock_direct`
  - `visual_tip`
  - `drag_map`
  - `hybrid`
- 成功标准不是“证明 mock 成立”，而是“拿到可复核、可审计、可批量化的最终上车点坐标”

## 3. 已冻结业务合同

### 3.1 输入合同

- 输入文件格式：`CSV`
- 输入字段：
  - `id`
  - `name`
  - `x`
  - `y`
- 输入坐标系：`GCJ-02`

### 3.2 输出合同

统一结果表至少包含：

- `id`
- `name`
- `input_x`
- `input_y`
- `output_x`
- `output_y`
- `provider`
- `method`
- `status`
- `confidence`
- `reason`
- `evidence_dir`

说明：

- `provider`：`didi / amap / other-approved-provider`
- `method`：`mock_direct / visual_tip / drag_map / hybrid / blocked`
- `status`：`SUCCESS / FAIL / BLOCKED`
- `confidence`：`high / medium / low`
- `output_x / output_y` 必须是 `GCJ-02`
- `evidence_dir` 必须指向可复核证据目录

### 3.3 provider 优先级

- 优先：`didi`
- 次选：`amap`
- 若滴滴无法形成稳定链路，而高德可以形成稳定、可复核结果，则允许先交付高德
- 结果中必须明确写出 `provider` 与 `method`

### 3.4 目标点定义

- 默认目标点是上车点 marker 的实际落点 / 尖端位置
- 不是图标视觉中心
- 若页面不是尖端型 marker，必须定义可复核的等价取点规则并附带证据

## 4. 允许方法

### 4.1 `mock_direct`

- 用系统允许的 mock 把应用驱到目标区域
- 只有在应用直接暴露可审计的上车点坐标或等价取点规则时才可作为最终成功

### 4.2 `visual_tip`

- 从屏幕上显式上车点 tip 取像素点
- 再用站点级锚点库和几何/标定方法恢复 `GCJ-02`
- 允许使用公开同源候选参考底图配准恢复当前帧绝对坐标

### 4.3 `drag_map`

- 用受控拖图 / 视口控制制造几何约束
- 只允许黑盒 UI 自动化

### 4.4 `hybrid`

- 用 `mock_direct` 或其他粗定位手段把视口拉近
- 再用 `visual_tip` / 站点级锚点库 / 局部标定 / 固定视口完成精反算
- 允许使用高德官方 `amapuri://route/plan/` 等原生 URI 入口，把候选 `GCJ-02` 直接驱入目标 App 的路线 / 打车页，再用 exact gate label 与视觉 tip 完成验证

## 5. 禁止事项

- 禁止逆向应用内部协议
- 禁止破解或绕过安全控制
- 禁止注入应用内部逻辑
- 禁止无证据编造坐标
- 只允许黑盒 UI 自动化、系统允许的 mock、屏幕解析、受控拖图、可审计的几何/视觉推断

## 6. 阶段定义

1. `Phase 0`：Repo Remediation
2. `Phase 1`：方法组合重建
3. `Phase 2`：一条 `provider × method` 的单点成功
4. `Phase 3`：主线方法定版
5. `Phase 4`：`10` 个浦东 golden set
6. `Phase 5`：T01 第一阶段收口

## 7. 当前轮次完成标准

- `Phase 0` 完成，E 盘仓库成为唯一事实源
- `Phase 1` 完成，方法组合表形成并选出两条优先主线
- 至少拿到一条主线的单点推进结果
- 明确判断当前是否可以冲击 `Phase 2`

## 8. 当前正式执行口径补充

- 当前主攻 provider：`amap`
- 当前主攻方法：`hybrid`
  - 路线页 / 打车页黑盒 UI 进入
  - 高德官方 `routeplan_uri` 入口已加入当前主线
  - 视觉取点：
    - `blue_pickup_pin`
    - `green_start_pickup`
  - 公共 `appmaptile` 同源候选底图 + `SIFT` 配准
  - 必要时用站点级锚点库作为 fallback
- 当前已新增一条可复核 `SUCCESS` 候选：
  - `outputs/_work/20260328_t01_gs05_route_registration/single_point_result.json`
  - 该样例证明：
    - 高德本地短程打车页可生成可审计的上车点 marker
    - `visual_tip/hybrid -> GCJ-02` 在当前仓内已具备实跑能力
