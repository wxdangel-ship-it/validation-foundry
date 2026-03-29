# T01 重启计划

> 本文件描述 T01 在线程重启后的执行计划，不再沿用 bootstrap 轮次的“文档先行”口径。

## 1. 当前阶段

- 当前阶段：`Phase 2 in-progress`
- 工作方式：`先治理纠偏，再并行子线程收敛方法，随后主线程推进单点成功`
- 本轮目标：尽快拿到第一个合同级、可复核的 `SUCCESS`

## 2. 执行原则

1. 不把 `mock-only` 当成成功标准
2. 先拿到最早可交付的真实 `SUCCESS`
3. 优先复用 handoff 和已有证据，不重复全量探针
4. 用主线程 + 子线程的软件工程方式推进，不单线程蛮干
5. 所有阶段都要落盘到仓库

## 3. 阶段计划

### Phase 0

- 盘点 `C:\Users\admin` 错误工作区
- 迁移高价值资产到仓库
- 修正文档与结果表里的活跃路径
- 立住 E 盘仓库的 source-of-truth 边界

### Phase 1

- 形成候选方法组合表
- 至少覆盖：
  - `mock_direct`
  - `visual_tip`
  - `drag_map`
  - `hybrid`
- 选出两条优先主线

### Phase 2

- 在至少一条 `provider × method` 主线上拿到一个真实可复核的单点 `SUCCESS`
- 证据必须能解释：
  - provider
  - method
  - confidence
  - `tip -> GCJ-02` 或等价提取路径

### Phase 3

- 在滴滴 / 高德、视觉 / 几何 / hybrid 方法之间确定正式主线
- 其他路线降级为 fallback

### Phase 4

- 跑完 `10` 个浦东 golden set
- 统一导出新 schema 的 `results.csv`

### Phase 5

- 输出 T01 第一阶段结论
- 说明当前最优 provider + method
- 说明扩批前提和剩余问题

## 4. 当前选线

1. `amap + hybrid`
2. `amap + visual_tip`

当前工程落地口径：

1. 优先走高德官方 `amapuri://route/plan/` 入口，把候选 `GCJ-02` 直接灌入 AMap 原生路线页
2. 在 taxi 页先读 exact gate label，再做 `green_start_pickup` / `blue_pickup_pin` 取点
3. 用公共 `appmaptile style8` 同源候选底图做 `SIFT` 配准
4. 用最优结果 + 收敛簇共同输出 `GCJ-02`
5. 若 routeplan 目标门点链路失败，则退回本地短程路线页 / `same_page` / 站点级锚点库 fallback

降级保留：

1. `amap old-version + mock_direct`
2. `didi + mock_direct`

## 5. 当前新增事实

- 已新增一条本地短程打车页 `SUCCESS` 候选：
  - `outputs/_work/20260328_t01_gs05_route_registration/single_point_result.json`
- 当前仍未完成的关键动作：
  - 把 routeplan 目标门点链路的 `tip -> GCJ-02` 加固到合同级稳定
  - 回写 Phase 2 gate 结论

## 6. 当前边界

- 不进入协议逆向
- 不进入绕过安全控制
- 不进入无证据猜坐标
- 若需要旧版高德降级安装，只把它作为 fallback，不阻塞当前主线
