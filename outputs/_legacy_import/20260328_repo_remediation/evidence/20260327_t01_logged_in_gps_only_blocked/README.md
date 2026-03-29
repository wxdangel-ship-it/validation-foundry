# 2026-03-27 Logged-In + GPS-Only Blocked

## 结论

- 真实设备、已登录、定制版 `MockGps`、`gps only` 四个条件同时满足后，T01 仍未形成可信链路。
- 滴滴：首页存在明确的 `重新定位` 控件，但点击并等待后，页面仍停留在 `北京市`，没有回到 mock 的上海坐标。
- 高德：显式启动和进入打车入口已可执行，但一条路径会停在北京上车点，另一条路径会漂移到 `高德打车企业版` 页面，未形成稳定、可复用的普通用户链路。
- 当前结论仍为 `BLOCKED`，且阻塞已经从“未登录门槛”升级为“已登录 + gps only 仍无法拿到可信上车点”。

## 本轮消解动作

1. 在真实设备上完成滴滴和高德登录。
2. 编译并安装定制版 `MockGps`，支持 `intent lat/lng/autostart`。
3. 修复 `Provider "gps" already exists` 导致的 `MockLocationService` 崩溃。
4. 强制把系统 `location_providers_allowed` 从 `network` 切换到 `gps`。
5. 在 `gps only` 基线下复跑滴滴和高德。

## 核心事实

- `MockGps` 自动注入可用，且系统 `gps provider [mock]` 已稳定发布上海坐标。
- `location_providers_allowed` 已被改到 `gps`，见 [location_provider_force_gps.txt](location_provider_force_gps.txt)。
- `dumpsys location` 的 `last location` 已是 mock GPS，而非 network，北京网络位置只剩历史记录，见 [location_after_force_gps_dumpsys.txt](location_after_force_gps_dumpsys.txt)。
- 滴滴在这种基线下依然显示 `北京市`，并要求 `请输入上车点`，见 [didi_red_relocate.png](didi_red_relocate.png) 与 [didi_red_relocate.txt](didi_red_relocate.txt)。
- 高德登录后能显式启动首页，见 [amap_home_logged_in.png](amap_home_logged_in.png)。
- 高德曾成功进入打车页，但上车点仍是北京 `清友园` 一带，见 [amap_taxi_pickup_beijing.png](amap_taxi_pickup_beijing.png) 与 [amap_enter_taxi.txt](amap_enter_taxi.txt)。
- 在 `gps only` 下，高德首页仍能显示 `打车` 入口，但进入后会漂移到 `高德打车企业版` 页面，而不是稳定 taxi pickup 页面，见 [amap_home_gps_only.png](amap_home_gps_only.png)、[amap_taxi_redirect_enterprise.png](amap_taxi_redirect_enterprise.png) 与 [amap_final_gpsonly_clean.txt](amap_final_gpsonly_clean.txt)。

## 文件索引

- `mockgps_autostart_after_fix.txt`
  定制版 `MockGps` 已修复 provider 重入问题，系统 mock 注入成立。
- `location_provider_force_gps.txt`
  系统安全设置从 `network` 改为 `gps` 的证据。
- `location_after_force_gps_dumpsys.txt`
  改成 `gps only` 后的 provider 摘要。
- `didi_logged_in_locate_before_gps_only.png`
  已登录滴滴，点击定位后仍停在北京。
- `didi_red_relocate.png`
  `gps only` 下滴滴仍显示 `北京市 + 重新定位`。
- `amap_home_logged_in.png`
  已登录高德首页。
- `amap_taxi_pickup_beijing.png`
  高德打车页上车点仍是北京。
- `amap_home_gps_only.png`
  `gps only` 下高德首页。
- `amap_taxi_redirect_enterprise.png`
  `gps only` 下点击打车入口漂移到企业版页面。

## 当前建议

- 当前设备和当前 app 版本组合下，仓库内常规消解手段已经用尽。
- 若要继续，只剩三种有效外部变化：
  - 更换干净 Android 测试机或系统镜像。
  - 更换目标 app 版本或目标应用范围。
  - 允许使用更强的设备级控制能力，例如 root / 系统级定位源接管。
