# 当前阶段计划

- 计划日期：`2026-03-28`
- 当前目标阶段：`Phase 2 Single-Point Success`
- 当前状态：`in-progress`

## 当前正式目标

- 先拿到第一个真实、可复核、可审计的“上车点 `GCJ-02`”样例
- 不预设 `mock-only`
- 以最快得到合同级 `SUCCESS` 为优先，而不是以理论最优方案为优先

## 当前优先主线

### 主线 1

- `provider=amap`
- `method=hybrid`
- 路径：
  - 用高德官方 `amapuri://route/plan/` 把候选 `GCJ-02` 直接灌入原生路线页
  - 切入 `打车`
  - 先以 taxi 起点输入栏的 exact gate label 判定目标门点是否命中
  - 自动提取打车页绿色起点 `pickup_tip_px`
  - 用公共 `appmaptile style8` 参考底图做 `SIFT` 配准
  - 对多候选结果做收敛簇判断；若配准仍弱，则保留 exact gate label + repeated seed coordinate 结果
  - 输出 `GCJ-02` 并做同口径复拍

### 主线 2

- `provider=amap`
- `method=visual_tip`
- 路径：
  - 固定高德 taxi 页视角
  - 自动提取 live `pickup_tip_px`
  - 用公共 `appmaptile` 参考底图做 `SIFT` 配准
  - 在本地短程路线页不可达时作为补救链路

## 辅助与 fallback

- `drag_map`
  - 只作为视觉链路的辅助，不单独承担最终可信度
- `amap old-version + mock_direct`
  - 只保留一次低成本回退验证
  - 如需降级安装，仍需要一次人工确认
- `didi + mock_direct`
  - 保留为低成本复查支线
  - 当前不作为 Phase 2 主攻

## 当前已拿到的单点推进结果

### AMap 侧

- 已导入同视口显式 tip 反算成果：
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/gate_results.csv`
- 其中已存在单点反算样例：
  - `多美滋婴幼儿食品有限公司(东南门)`
  - `output_x=121.60976046703298`
  - `output_y=31.2478715`
- 该样例证明：
  - `tip_px -> GCJ-02` 的局部求解器是可用的
  - 但它还不是本轮合同级 SUCCESS，因为缺少一次当前仓内主线重跑把“运行时页面链 + tip + 反算 + 验证”串成同一次证据包
- 已新增仓内离线取点器验证：
  - `modules/t01_pickup_point_validation/scripts/t01_amap_tip_locator.py`
  - `taxi_my_location`：`10/10` 精确回到 `tip=(539,681)`
  - `red_pin`：`2/2` 样例达到 `<=5px` 误差
  - 说明“屏幕坐标取点”已不再是纯人工能力缺口，当前剩余缺口是把实时页面截图喂给求解链
- 已新增仓内局部同视口求解器验证：
  - `modules/t01_pickup_point_validation/scripts/t01_local_frame_solver.py`
  - 已用历史 `company + parking` 锚点复现 `dongnan` 结果
  - 说明“已有稳定锚点时的坐标反算”也已经代码化，当前缺口主要是实时锚点供给
- 已新增站点级锚点库 bootstrap：
  - `modules/t01_pickup_point_validation/anchor_library/sites/amap_momeizi_same_view_v1.json`
  - `modules/t01_pickup_point_validation/scripts/t01_anchor_site_solver.py`
  - 已用站点配置直接跑通 `dongnan` 历史样例端到端链路
  - 说明工程主线应转为“建站点锚点库”，而不是继续寻找全局无锚点通解
- 已新增一次实时固定视角投屏取点：
  - 高德 taxi 页已在固定竖屏 `1080x2340` 视角下取到 live pickup 点
  - 当前 live `pickup_tip_px=[556,637]`
  - 说明“先稳定视角，再从 live 屏幕拿上车点”已经可执行
- 已新增参考底图配准原型：
  - `modules/t01_pickup_point_validation/reference_registration/profiles/amap_taxi_portrait_v1.json`
  - `modules/t01_pickup_point_validation/scripts/t01_map_registration.py`
  - 合成回归误差 `0.0506px`
  - 说明 `S2 = App screenshot + reference basemap registration` 已具备代码基础
- 已新增公共真实瓦片探针：
  - `appmaptile` 服务可用
  - `AKAZE` 在 `z16/z17` 上只得到弱信号
  - 改用 `SIFT` 后，`z17/style7` 已达到：
    - `match_count=96`
    - `inlier_count=29`
  - `S2` 当前最佳收敛簇坐标：
    - `output_x=116.42497310610331`
    - `output_y=40.040352321549335`
  - 当前判断：
    - `S2` 已可继续冲击单点成功
    - `same_page` 已完成重复确认
    - 当前缺口已经收敛为 `fresh reopen` 页面分型
- 已新增 `S2` live 重复实验：
  - `same_page` 组 `3/3` 成功，并形成单一收敛簇
  - `reopen` 组出现页面分型：
    - 成功样本可解
    - `清友园(西4门)-链家旁` 当前已可取 tip，但配准仍弱
  - 说明：
    - `S2 same_page` 已稳定
    - `S2 fresh_reopen` 已进入 variant 管理
- 已新增 `fresh reopen` variant 画像：
  - `school_northwest_gate`：当前最稳定
  - `school_northwest_side`：可解但次稳定
  - `generic_taxi_pickup`：off-cluster 弱分型
  - `qingyouyuan_w4_lianjia`：可取 tip 但配准弱
- 已新增本地短程打车页 `SUCCESS` 候选：
  - 起点：`青岛啤酒优家健康饮品(上海)有限公司`
  - 终点：`多美滋婴幼儿食品有限公司(东南门)`
  - `green_start_pickup` 自动取点：
    - `pickup_tip_px=[189,779]`
  - 正式脚本 `style8` 最优结果：
    - `output_x=121.60684037715845`
    - `output_y=31.249020713386546`
  - 主簇 `4` 成员加权结果：
    - `output_x=121.60684180348042`
    - `output_y=31.249073809351668`
  - 已落正式结果记录：
    - `outputs/_work/20260328_t01_gs05_route_registration/single_point_result.json`
  - 当前限制：
    - 同口径 `2x` 重复尚未完成
    - 起点仍是 UI 选择的近邻 POI，不是直接由 CSV 原始坐标驱动
- 已新增 `routeplan_uri` 目标门点链路：
  - `amapuri://route/plan/` 已可在当前设备直达高德原生路线页
  - `m.amap.com` 浏览器路线页已降级，不再作为主线入口
  - taxi 页坐标扫描已确认：
    - `slon=121.60925`
    - `slat=31.2485`
    - 起点输入栏 `2x` 重复命中：
      - `多美滋婴幼儿食品有限公司(东南门)`
  - 已落单条结果记录：
    - `outputs/_work/20260328_t01_amapuri_routeplan_taxi_repeat_target_v2/single_point_result.json`
  - 当前目标 taxi 页绿色起点已自动取到：
    - `pickup_tip_px=[852,1159]`
  - 当前限制：
    - `tip -> public tile registration` 仍弱
    - 还未把 exact gate label 证据完全收口到正式 Phase 2 gate 结论

### Didi 侧

- 已在仓内固化当前前台 smoke：
  - `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/`
- 当前单点结论：
  - `provider=didi`
  - `method=mock_direct`
  - `status=FAIL`
  - 原因：入口与 mock 都在，但当前前台仍收敛到 `清友园-西4门(主路)` 这类非目标业务上下文

## 当前阶段动作

1. 把 `routeplan_uri` 目标门点链路的 exact gate label 证据正式写入单条结果记录。
2. 继续加固目标 taxi 页 `green_start_pickup -> public tile registration`。
3. 保留 `public appmaptile style8 + SIFT` 作为当前主求解器。
4. 保留本地短程路线页链路作为 fallback 对照样例。
5. 保留 `same_page / school_northwest_gate` 作为次级 fallback 视觉链路。
6. 若目标门点链路的 `tip -> GCJ-02` 也稳定，则回写 `Phase 2` gate 并转入 `Phase 3`。

## 当前不允许做的事

- 不允许继续把当前版 AMap `mock_direct` 当主线做重复探针。
- 不允许把 Didi 写成 `BLOCKED`。
- 不允许继续把 `C:\Users\admin` 下的新产物当成事实源。
- 不允许在没有显式取点证据的情况下把输入坐标直接回填成最终输出。
