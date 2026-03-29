# T01 线程重启摘要（2026-03-27）

## 当前总判断

- `MockGps` 自动停止的问题已经被修复，不再是当前主阻塞。
- 现在的主问题收敛为：`高德/滴滴` 当前链路没有像 `百度地图` 那样稳定消费这条 mock 位置链。
- `百度地图` 已被用户观察到能跟随 mock，这说明：
  - 不是整机 ROM 完全不支持 mock；
  - 也不是 `MockGps` 当前实现完全失效。

## 已完成的重要工作

### 1. 修复并重装新版 MockGps

- 源码修改：
  - `C:\Users\admin\MockGps-src\app\src\main\java\com\lilstiffy\mockgps\storage\StorageManager.kt`
  - `C:\Users\admin\MockGps-src\app\src\main\java\com\lilstiffy\mockgps\service\MockLocationService.kt`
- 修复点：
  - 持久化最后 `lat/lng`
  - 持久化“应恢复 mock”状态
  - 改成真正前台服务
  - 增加通知 channel：`mockgps_location`
  - 服务重启后自动恢复 mock
- 编译产物：
  - `C:\Users\admin\MockGps-src\app\build\outputs\apk\debug\app-debug.apk`
- 已安装到手机，包名仍为 `com.lilstiffy.mockgps`

### 2. MockGps 保活验证通过

- 证据目录：
  - `C:\Users\admin\vf_stage\20260327_t01_mockgps_foreground_keepalive_probe_v1`
- 核心证据：
  - `t000_pid.txt` 到 `t090_pid.txt`：PID 持续一致
  - `t000_services.txt` 到 `t090_services.txt`：`MockLocationService` 始终 `isForeground=true`
  - `t000_location.txt` 到 `t090_location.txt`：`gps provider [mock]` 和 `last location=... mock` 持续存在
  - `t000_notif.txt` 到 `t090_notif.txt`：前台通知持续存在
- 结论：
  - “mock 开一会自动停止” 这个历史问题已经排除

### 3. 高德当前版本复测：仍不跟 mock

- 证据目录：
  - `C:\Users\admin\vf_stage\20260327_t01_amap_with_fixed_mockgps_probe_v1`
- 测试条件：
  - 使用修复后的 `MockGps`
  - 直接 mock 到上海：`31.251000,121.604000`
- 结果：
  - 系统 `last location` 仍是上海 mock
  - 高德页面仍显示北京上下文
- 结论：
  - 高德 16.12.0.2027 的问题已不是 mock 自动停，而更像高德自身业务定位/缓存/起点决策

### 4. 高德旧版回退实验：旧版 APK 已备好，但无人工确认无法完成降级安装

- 当前版高德：
  - `versionName=16.12.0.2027`
  - `versionCode=161200`
- 旧版 APK：
  - `C:\Users\admin\vf_stage\apk_probe\amap_15.21.0.2038.apk`
- 当前版 APK 备份：
  - `C:\Users\admin\vf_stage\apk_probe\amap_base.apk`
- 失败原因：
  - 华为安装器拦截降级安装，报 `INSTALL_FAILED_ABORTED: User rejected permissions`
- 补充：
  - 高德当前版已经成功恢复，不在坏状态
- 恢复证据：
  - `C:\Users\admin\vf_stage\20260327_t01_restore_amap_current_v1`

### 5. 高德显式上车点 pin/tip 识别已完成（中间成果）

- 用户已确认：
  - `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_visual_forensics\close_card_step03_zoom.png`
  - 图中的绿色十字就是其认定的“上车点”
- 对应 tip 口径：
  - `pin tip` 最下端中心点
  - 曾识别出的像素点为 `(539,681)`（针对该特定视口样例）
- 相关证据：
  - `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_pin_annotation`
  - `C:\Users\admin\vf_stage\20260327_t01_amap_close_card_probe`
  - `C:\Users\admin\vf_stage\outputs\20260327_t01_amap_visual_forensics`

### 6. 局部屏幕点 -> GCJ-02 反算能力已建立（但不是全局通用）

- 当前成果目录：
  - `C:\Users\admin\vf_stage\outputs\20260327_t01_gate_coord_estimation_v1`
- 关键文件：
  - `gate_results.csv`
  - `estimation.json`
- 当前可做：
  - 对“同一底图、同一视口、同一缩放”的高德页面，先做双锚点标定，再把屏幕点反算成 `GCJ-02`
- 当前不能做：
  - 对任意页面、任意缩放、任意朝向的截图直接全局算坐标

## 滴滴当前状态

- 旧证据表明，滴滴历史上即使系统 `last location` 为上海 mock，首页仍会停在北京上下文，如：
  - `清友园-西4门(主路)`
- 旧证据目录：
  - `C:\Users\admin\vf_stage\20260327_t01_direct_mock_taxi_probe_v1`

## 刚刚最新做到哪里

- 我开始用修复后的 `MockGps` 重跑滴滴，但发现旧入口失效：
  - `com.sdu.didi.psnger/.ui.main.MainActivity` 不存在
- 已解析到当前滴滴 launcher 入口：
  - `com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity`
- 并通过包级启动确认 launcher 可用：
  - `adb shell monkey -p com.sdu.didi.psnger -c android.intent.category.LAUNCHER 1`
- 这轮新证据目录：
  - `C:\Users\admin\vf_stage\20260327_t01_didi_with_fixed_mockgps_probe_v1`
- 当前目录里已有：
  - `adb_devices.txt`
  - `device_model.txt`
  - `mockgps_appops.txt`
  - `mockgps_start_stdout.txt`
  - `step00_location_after_mock.txt`
  - `step01_location.txt`
  - `step01_windows.txt`
  - `step02_focus.txt`
  - `step02_activity.txt`
- 但这轮在用户要求暂停前，还没收敛出新的滴滴截图结论

## 当前最可靠结论

1. `MockGps` 自动停止问题已解决。
2. 百度跟随 mock，说明系统并非完全不支持 mock。
3. 高德当前版即便在修复后，也仍不跟 mock，问题更像应用业务层而非 mock 保活。
4. 滴滴需要基于新的 launcher 入口重跑一轮完整复测。
5. 高德“显式上车点 tip 像素”的识别已经可用，可作为 fallback 方案的视觉取点基础。

## 建议的线程重启后优先动作

### 主线 A：滴滴复测（优先）

1. 用新版 `MockGps` 直接 mock 到上海固定点
2. 用 `monkey` 或 `SplashActivity` 正确拉起滴滴
3. 抓：
   - 前台 `focus`
   - `uiautomator dump`
   - `screencap`
   - `dumpsys location`
4. 判断是否仍然：
   - 顶部城市 = 北京
   - bubble = 清友园相关

### 主线 B：高德旧版回退（需要一次人工安装确认）

1. 保留当前版作为基线
2. 安装 `15.21.0.2038`
3. 用同一上海 mock 点复测
4. 只要高德旧版能回上海，就说明问题与当前高德版本强相关

### 备线 C：高德视觉取点 + 局部标定反算坐标

1. 在用户认可的“显式上车点 tip”页面取像素点
2. 用同视口双锚点标定
3. 反算 `GCJ-02`
4. 再回灌 mock 做闭环验证

## 线程重启注意事项

- 当前环境里有很多历史 unified exec 进程，系统反复提示：
  - `The maximum number of unified exec processes you can keep open is 60`
- 线程重启后应尽量：
  - 少开长会话
  - 多用一次性短命令
  - 先复用已有证据，而不是重复全量探针

