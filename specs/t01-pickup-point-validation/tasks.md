# T01 任务清单

> 本文件反映线程重启后的正式任务状态。旧 bootstrap 任务视为历史背景，不再作为当前 gate 依据。

## 1. Phase 0：Repo Remediation

- [x] 读取 thread restart handoff
- [x] 盘点 `C:\Users\admin` 错误工作区
- [x] 把高价值历史资产迁入仓库
- [x] 修正活跃文档中的旧路径引用
- [x] 修正现有结果表中的旧 `evidence_dir`
- [x] 输出 remediation report
- 结论：`PASS`

## 2. Phase 1：方法组合重建

- [x] 重新确认 T01 目标不是 `mock-only`
- [x] 覆盖 `mock_direct / visual_tip / drag_map / hybrid`
- [x] 完成运行时 smoke，确认当前不是 ADB / 设备阻塞
- [x] 完成滴滴方法判断
- [x] 完成高德方法判断
- [x] 完成坐标求解方法比较
- [x] 完成 QA schema 与方法比较
- [x] 选出两条优先主线
- 结论：`PASS`

## 3. Phase 2：一条 provider × method 的单点成功

- [x] 拿到至少一条主线的单点推进结果
- [x] 在仓内做出可复用的高德屏幕 tip 自动定位器
- [x] 在仓内做出可复用的局部同视口求解器
- [x] 建立第一版站点级锚点库 bootstrap
- [x] 做出第一版参考底图配准原型
- [x] 用 `public appmaptile + SIFT` 拿到一条中置信度 `S2` 单点候选
- [x] 在 `same_page` 条件下完成 `S2` 三次 live 复拍并形成单簇
- [x] 给 `fresh reopen` 接入页面分型器
- [x] 把 `blue_pickup_pin_bottom_tip` 扩展为多分型取点
- [x] 在 AMap 本地短程打车页拿到一条新的 `SUCCESS` 样例
- [x] 打通高德官方 `amapuri://route/plan/` 原生路线页入口
- [x] 用 `routeplan_uri + taxi` 坐标扫描找到 `多美滋婴幼儿食品有限公司(东南门)` 的重复命中坐标
- [x] 对目标门点 taxi 页新增 `routeplan_pickup_right` 绿色起点分型
- [ ] 用当前仓内主线重跑一次高德显式 tip 单点
- [x] 产出新 schema 的单条结果记录
- [x] 对同一条主线重复至少 `2` 次
- [ ] 回写 Phase 2 gate 结论
- 当前状态：`IN_PROGRESS`

## 4. Phase 3：主线方法定版

- [ ] 形成 `provider + method` 正式比较结论
- [ ] 明确主线与 fallback
- [ ] 更新运行文档与失败分类

## 5. Phase 4：浦东 10 点 golden set

- [ ] 建立 `golden-10` 站点级锚点库
- [ ] 按新 schema 跑完 `10` 条结果
- [ ] 每条都落 `evidence_dir`
- [ ] 对 `FAIL/BLOCKED` 做明确分型
- [ ] 回写 Phase 4 gate 结论

## 6. Phase 5：T01 第一阶段收口

- [ ] 输出当前最优 provider + method
- [ ] 输出扩批前提
- [ ] 输出未解决问题

## 7. 已证伪 / 已降级方向

- [x] 当前版 `amap + mock_direct` 重复探针不再作为主线
- [x] `didi + mock_direct` 当前不再按 `BLOCKED` 处理，而按 `FAIL` 管理
- [x] 继续在 `C:\Users\admin` 下开发已被禁止

## 8. 当前主线

- [x] 主线 1：`amap + visual_tip(reference_registration)`
- [x] 主线 2：`amap + hybrid(anchor_library fallback)`
- [ ] fallback：`amap old-version + mock_direct`
- [ ] exploratory：`didi + mock_direct`
