# 014 - 2026-03-28 Didi Method Probe

## 目的

本轮只聚焦滴滴链路，判断在当前设备、当前版本、当前 MockGps 能力下，滴滴是否还能作为可推进主线，以及是否存在可稳定复核的视觉上车点 tip。

## 复用的已知事实

- `MockGps` 自动停止问题已修复。
- 旧入口 `com.sdu.didi.psnger/.ui.main.MainActivity` 已失效。
- 当前可用 launcher 为 `com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity`。
- 旧证据已经显示：即使系统 `last location` 是上海 mock 点，滴滴仍可能停留在北京上下文。

## 本轮最小复核

本轮不做长会话重跑，只复查现有 probe 与新的仓内 smoke 证据：

- `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_didi_with_fixed_mockgps_probe_v1/`
- `outputs/_legacy_import/20260328_repo_remediation/inventory/didi_package_dump_20260327.txt`
- `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/focus.txt`
- `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/location.txt`
- `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/front.xml`

## 当前可用入口

- launcher：`com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity`
- 当前最终前台：`com.sdu.didi.psnger/com.didi.sdk.app.MainActivity`

这说明滴滴不是卡在“起不来”，而是卡在“起来以后拿不到可交付的上车点态”。

## `mock_direct` 是否还有希望

结论：入口层面有希望，但不适合作为当前主线。

- 旧 probe 与当前 smoke 都显示滴滴确实发出了 `gps` 与 `network` 请求。
- `dumpsys location` 仍显示 mock provider 活跃。
- 但当前仓内 `front.xml` 已直接抓到 `清友园-西4门(主路)`，说明业务态仍没有跟到目标区域。

因此：

- `mock_direct` 可以保留为控制变量。
- 但它不是当前最值得继续投入的主线。

## 是否存在稳定可识别的视觉 tip / 页面状态

结论：当前没有。

- 现有滴滴证据没有形成可重复识别、可标注、可反算的独立上车点 tip。
- 当前更稳定的是“滴滴首页 / 业务主态 + 无关上下文气泡”，不是合同所需的目标取点态。

## 成功 / 失败 分型

### `SUCCESS`

- launcher 可达
- 页面进入可操作目标态
- 能稳定看到独立上车点 marker 或等价可复核 tip
- marker tip 可被重复采样并映射到 `GCJ-02`

### `FAIL`

- launcher 可达
- 页面也可达
- 但业务态仍收敛到无关城市 / 无关 POI，或没有可稳定识别的 tip

### `BLOCKED`

- launcher 不可达
- app 崩溃
- 运行时无法启动或无法拿到前台焦点

## 当前判断

当前滴滴属于 `FAIL`，不是 `BLOCKED`。

原因：

- 入口已恢复
- 运行时已恢复
- mock 请求已发出
- 但业务态没有稳定收敛到可复核的上车点

## 建议

- 不要把滴滴 `mock_direct` 当成当前主线继续硬跑
- 不要继续围绕旧 `MainActivity` 入口做探针
- 如果未来出现新的显式 pickup 选择页，再重启滴滴视觉 / 几何路线

## 证据路径

- `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_didi_with_fixed_mockgps_probe_v1/`
- `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/`
- `outputs/_work/20260327_t01_logged_in_gps_only_blocked/`
- `outputs/_work/20260327_t01_real_device_blocked/`
