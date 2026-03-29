# 方案 B：Apple Silicon Mac 迁移方案

## 1. 方案结论

- 方案 B 不再泛指“任意 ARM64 宿主”。
- 按 2026-03 官方 Android Studio 文档，当前可作为正式迁移目标的是 `Apple Silicon Mac`。
- `Windows ARM` 与 `Linux ARM` 目前不应作为本项目的正式迁移目标。

## 2. 选择依据

- Android Studio 安装页当前写明：
  - Windows：`Windows machines with ARM-based CPUs aren't currently supported.`
  - Linux：`Linux machines with ARM-based CPUs aren't currently supported.`
  - Mac：最低 `Apple M1 chip`，推荐 `Latest Apple Silicon`
- Android Emulator 加速文档当前写明：
  - `ARM64` 宿主对应 `arm64-v8a` system image
  - `ARM- or MIPS-based system images on Intel or AMD CPUs` 不能使用该页描述的 VM acceleration
- 这与当前仓库已证实的 x86_64 宿主阻塞一致。

## 3. 最小外部条件

需要一台满足以下条件的 Mac：

- 芯片：`Apple Silicon`，建议 `M1 / M2 / M3` 及以上
- 系统：`macOS 12+`
- 内存：至少 `16 GB`，建议 `32 GB`
- 磁盘：至少 `32 GB` 可用空间
- 权限：允许安装 Android Studio / Android SDK，并允许 ADB 连接与 APK 安装

## 4. 到位后执行顺序

1. 在 Apple Silicon Mac 上安装 Android Studio
2. 通过 SDK Manager 安装：
   - `emulator`
   - `platform-tools`
   - `platforms;android-30`
   - `system-images;android-30;google_apis;arm64-v8a`
3. 创建 AVD：`vf_api30_arm64`
4. 启动 AVD，验证 `adb devices`
5. 复用当前仓库 Phase 1 的虚拟定位 smoke
6. 重新安装官方滴滴与高德 APK
7. 先复跑滴滴未登录链路；失败再复跑高德备选链路
8. 若至少一条链路可用，再进入坐标提取规则定版与 10 点 golden set

## 5. 当前我方可继续做的仓库内工作

- 保持当前 `BLOCKED` 证据包为事实基线
- 将恢复计划固定为 `Option B / Apple Silicon Mac`
- 在获得 Apple Silicon Mac 访问权后，从 `Phase 1 replay` 直接恢复，不需要重新做项目初始化

## 6. 当前不能在本机完成的部分

- 当前主机是 `Windows x86_64`，无法把自己变成 Apple Silicon Mac
- 因此方案 B 的下一跳不是仓库编码问题，而是宿主条件尚未提供

## 7. 恢复入口

- 当前状态文档：`docs/project-management/current-status.md`
- 当前阶段计划：`docs/project-management/current-phase-plan.md`
- 当前阻塞证据包：`outputs/_work/20260326_t01_blocked_android_runtime/`
- 恢复后运行说明：`modules/t01_pickup_point_validation/RUNBOOK.md`
