# T01 Android 运行时阻塞记录

## 1. 背景

- 本轮目标是在 Phase 0 文档基线之后，继续推进环境、应用链路和样例执行，不再停留在文档检查点。
- 停止条件是：要么完成至少一条应用链路与浦东 `10` 点样例执行，要么遇到无法通过仓库内工作自行消解的真实外部阻塞。

## 2. 本轮实际完成范围

- 安装 Android SDK、平台工具、`x86_64` 与 `arm64-v8a` system image
- 创建 `vf_api30` 和 `vf_api30_arm64` 两个 AVD
- 完成 ADB 连通和 `adb emu geo fix` 虚拟定位 smoke
- 下载并安装官方滴滴 `7.2.9` 与官方高德 `16.12.0.2027`
- 完成滴滴主链路与高德备选链路的未登录 smoke
- 生成浦东 `10` 点 golden set 与统一 `BLOCKED` 结果闭环

## 3. 关键事实

- `x86_64` AVD 可正常启动，但官方滴滴和高德 APK 都需要通过 `libndk_translation.so` 运行。
- 滴滴在启动后快速触发 `SIGSEGV`，无法进入可操作首页。
- 高德可进入协议页，但主进程和 `locationservice` 均触发 `SIGILL`，无法保持可操作状态。
- ARM64 AVD 已创建，但官方模拟器明确提示当前 `x86_64` 宿主不支持直接运行 ARM64 AVD。
- 因此当前主机上不存在可继续推进的官方 Android 运行时。

## 4. 证据索引

- 总览：`outputs/_work/20260326_t01_blocked_android_runtime/README.md`
- 滴滴：`outputs/_work/20260326_t01_blocked_android_runtime/didi_x86/`
- 高德：`outputs/_work/20260326_t01_blocked_android_runtime/amap_x86/`
- ARM64 AVD：`outputs/_work/20260326_t01_blocked_android_runtime/common/arm64_avd_stdout.txt`
- 统一结果：`outputs/_work/20260326_t01_blocked_android_runtime/results.csv`

## 5. 本轮结论

- `Phase 1` 完成并通过
- `Phase 2` 因滴滴运行时崩溃而阻塞
- `Phase 3` 因高德运行时崩溃且 ARM64 AVD 不可用而阻塞
- 当前达到真实外部阻塞，后续需要外部 ARM Android 设备或可运行官方 ARM APK 的宿主环境
- 本轮未输出任何坐标，所有样例均保留 `BLOCKED` 结果与证据目录
