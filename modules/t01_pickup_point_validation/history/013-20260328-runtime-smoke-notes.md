# 013 - 2026-03-28 - Runtime Smoke Notes

## 目的

只验证 T01 运行时链路是否可用：

- ADB 是否可用
- 目标 app 是否仍安装
- 启动入口是否仍可解析
- 前台 focus 是否可稳定落到目标 app
- `uiautomator dump` 和 `screencap` 是否可用

本记录不涉及坐标算法、批量执行或结果表。

## 设备与 ADB

当前设备在线：

- `adb devices -l`
- 设备：`S2DGL19C12000860`
- 状态：`device`
- 型号：`LYA_AL00`
- 产品：`LYA-AL00L`

系统属性：

- `ro.product.model=LYA-AL00`
- `ro.build.version.release=10`
- `ro.product.cpu.abi=arm64-v8a`

运行时风险点：

- 当前 shell 的 `PATH` 里没有 `adb`
- 需要使用 Windows SDK 里的完整路径：
  - `/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe`

## 包与启动入口

已确认安装的包：

- `com.sdu.didi.psnger`
- `com.autonavi.minimap`
- `com.lilstiffy.mockgps`

launcher 解析结果：

- 滴滴：`com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity`
- 高德：`com.autonavi.minimap/com.autonavi.map.activity.SplashActivity`

## 最小冷启动 smoke

### 滴滴

命令：

```bash
adb.exe shell am force-stop com.sdu.didi.psnger
adb.exe shell am start -W -n com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity
```

结果：

- `Status: ok`
- `LaunchState: COLD`
- `Activity: com.sdu.didi.psnger/com.didi.sdk.app.MainActivity`
- `TotalTime: 2492`
- `WaitTime: 2495`

前台状态：

- `mCurrentFocus=Window{6393b59 u0 com.sdu.didi.psnger/com.didi.sdk.app.MainActivity}`
- `mResumedActivity=ActivityRecord{61b01c2 u0 com.sdu.didi.psnger/com.didi.sdk.app.MainActivity t326}`

### 高德

命令：

```bash
adb.exe shell am start -W -n com.autonavi.minimap/com.autonavi.map.activity.SplashActivity
```

结果：

- `Status: ok`
- `LaunchState: COLD`
- `Activity: com.autonavi.minimap/com.autonavi.map.activity.SplashActivity`
- `TotalTime: 710`
- `WaitTime: 719`

前台状态：

- `mCurrentFocus=Window{6360959 u0 com.autonavi.minimap/com.autonavi.map.activity.SplashActivity}`
- `mResumedActivity=ActivityRecord{6304009 u0 com.autonavi.minimap/com.autonavi.map.activity.SplashActivity t325}`

## 页面状态抓取方式

当前可用的最小抓取链路：

1. `dumpsys window`
2. `dumpsys activity activities`
3. `uiautomator dump /sdcard/<name>.xml`
4. `screencap -p /sdcard/<name>.png`

本轮验证中，以上链路都可用：

- 滴滴 `uiautomator dump` 成功，生成 `/sdcard/t01_runtime_smoke_didi_cold.xml`
- 滴滴 `screencap` 成功，生成 `/sdcard/t01_runtime_smoke_didi_cold.png`
- 高德 `uiautomator dump` 成功，生成 `/sdcard/t01_runtime_smoke_amap.xml`
- 高德 `screencap` 成功，生成 `/sdcard/t01_runtime_smoke.png`

补充现象：

- 在一次非稳定时点的 `uiautomator dump` 里，曾出现 `ERROR: null root node returned by UiTestAutomationBridge`
- 这说明 UI dump 对前台稳定性敏感，应该放在 `am start -W` 之后再抓

## 风险与限制

- `monkey` 可用于唤起 app，但对滴滴这次不如 `am start -W` 稳定
- 滴滴在冷启动后会落到 `MainActivity`，不要只把 `SplashActivity` 当成最终前台页
- 高德冷启动先到 `SplashActivity`，后续是否进入业务页需要额外步骤，这里不做展开
- 当前运行时 smoke 只证明“能启动、能前台、能抓树、能截图”，不证明业务链路已经满足上车点合同

## 推荐的最小可复现启动链路

### 滴滴

```bash
adb.exe shell am force-stop com.sdu.didi.psnger
adb.exe shell am start -W -n com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity
adb.exe shell dumpsys window | rg -m 1 'mCurrentFocus|mFocusedApp'
adb.exe shell dumpsys activity activities | rg -m 1 'mResumedActivity'
adb.exe shell uiautomator dump /sdcard/t01_runtime_smoke_didi_cold.xml
adb.exe shell screencap -p /sdcard/t01_runtime_smoke_didi_cold.png
```

### 高德

```bash
adb.exe shell am start -W -n com.autonavi.minimap/com.autonavi.map.activity.SplashActivity
adb.exe shell dumpsys window | rg -m 1 'mCurrentFocus|mFocusedApp'
adb.exe shell dumpsys activity activities | rg -m 1 'mResumedActivity'
adb.exe shell uiautomator dump /sdcard/t01_runtime_smoke_amap.xml
adb.exe shell screencap -p /sdcard/t01_runtime_smoke.png
```

## 结论

运行时 smoke 结论为 `PASS`。

当前设备、ADB、滴滴、高德、UI dump、截图抓取链路都可用。

后续子任务可以直接基于这套最小链路继续做页面状态与业务验证。
