# t01_pickup_point_validation

> 本文件是 `t01_pickup_point_validation` 的操作者总览与阅读入口。长期源事实以 `architecture/*` 与 `INTERFACE_CONTRACT.md` 为准。

## 1. 模块定位

- T01 是当前仓库唯一正式业务模块
- 目标是在虚拟手机环境中验证地图应用自动定位出的上车点坐标
- 当前已完成 Phase 0 和 Phase 1，实际推进到 `Phase 3` 时因 Android 运行时不兼容而阻塞

## 2. 当前阶段

- `Phase 0`：已完成
- `Phase 1`：已完成
- `Phase 2`：已验证并阻塞
- `Phase 3`：已验证并阻塞
- `Phase 4-6`：等待外部解阻

## 3. 官方入口

- 当前阻塞闭环证据包：`outputs/_work/20260326_t01_blocked_android_runtime/README.md`
- 当前运行说明：`RUNBOOK.md`
- 当前失败分型：`FAILURE_TAXONOMY.md`

## 4. 文档阅读顺序

1. `architecture/overview.md`
2. `INTERFACE_CONTRACT.md`
3. `RUNBOOK.md`
4. `FAILURE_TAXONOMY.md`
5. `history/001-20260326-android-runtime-blocked.md`
