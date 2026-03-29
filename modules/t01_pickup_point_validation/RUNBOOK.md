# T01 - RUNBOOK

## 1. 文档目的

说明 T01 当前可复现实验路径、最小运行命令、当前主线和关键证据目录。

## 2. 当前运行状态

- 当前正式状态：`Phase 2 attack-ready`
- 当前宿主环境：`Windows x86_64 + Huawei Mate 20 Pro (LYA-AL00, Android 10)`
- 当前优先主线：
  - `amap + hybrid`
  - `amap + visual_tip`
- 当前滴滴状态：`FAIL`，保留为低成本复查支线

## 3. ADB 与设备

- 当前 shell 中没有 `adb` 在 `PATH`
- 统一使用：
  - `/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe`
- 设备：
  - 序列号：`S2DGL19C12000860`
  - 型号：`LYA-AL00`
  - Android：`10`

## 4. 最小运行时 smoke

### 滴滴

```bash
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell am force-stop com.sdu.didi.psnger
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell am start -W -n com.sdu.didi.psnger/com.didi.sdk.app.launch.splash.SplashActivity
```

### 高德

```bash
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell am start -W -n com.autonavi.minimap/com.autonavi.map.activity.SplashActivity
```

### 抓取状态

```bash
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell dumpsys window
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell uiautomator dump /sdcard/t01.xml
/mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe shell screencap -p /sdcard/t01.png
```

## 5. 当前主攻方向

### AMap

- 不再把当前版 `mock_direct` 当成主线
- 优先围绕显式上车点 tip 和局部反算推进
- 当前工程口径：
  - 先建设站点级锚点库
  - 再用自动 tip 定位 + 局部同视口求解出 `GCJ-02`
- 关键导入资产：
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_amap_visual_forensics/`
  - `outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/`
  - `research/archive/t01_pickup_point_validation/20260328_thread_restart/20260327_t01_amap_explicit_pickup_probe/`
  - `modules/t01_pickup_point_validation/anchor_library/`

### Didi

- launcher 可达
- 当前前台 smoke 可在仓内复核：
  - `outputs/_work/20260328_t01_runtime_smoke/didi_current_front/`
- 当前问题不是启动失败，而是业务态仍不能稳定收敛为可交付上车点态

## 6. 当前关键结论

- `Repo Remediation` 已完成，E 盘仓库是唯一事实源
- 运行时 smoke 已通过
- Didi 当前是 `FAIL`，不是 `BLOCKED`
- AMap 的最快成功路线是 `hybrid / visual_tip`
- “屏幕 tip 定位”已经代码化，不再是主要缺口
- “已有锚点时的局部反算”已经代码化，不再是主要缺口
- 当前主要缺口是为目标样点建立稳定锚点库

## 7. 当前证据位置

- Repo remediation：
  - `docs/project-management/restart-remediation-report.md`
- 运行时 smoke：
  - `modules/t01_pickup_point_validation/history/013-20260328-runtime-smoke-notes.md`
- Didi 方法判断：
  - `modules/t01_pickup_point_validation/history/014-20260328-didi-method-probe.md`
- AMap 方法判断：
  - `modules/t01_pickup_point_validation/history/015-20260328-amap-method-probe.md`
- 坐标求解：
  - `modules/t01_pickup_point_validation/history/016-20260328-coordinate-solving-methods.md`
- 主线选择：
  - `modules/t01_pickup_point_validation/history/018-20260328-method-portfolio-and-mainline-selection.md`
- tip 定位器验证：
  - `modules/t01_pickup_point_validation/history/019-20260328-screen-tip-locator-validation.md`
- 局部求解器验证：
  - `modules/t01_pickup_point_validation/history/020-20260328-local-frame-solver-validation.md`
- 站点级锚点库 bootstrap：
  - `modules/t01_pickup_point_validation/history/021-20260328-anchor-library-bootstrap.md`
- 实时固定视角取点：
  - `modules/t01_pickup_point_validation/history/022-20260328-live-projection-pickup-acquisition.md`
- 参考底图配准验证：
  - `modules/t01_pickup_point_validation/history/023-20260328-reference-registration-validation.md`

## 8. 当前可复用命令

### tip 定位

```bash
python3 modules/t01_pickup_point_validation/scripts/t01_amap_tip_locator.py \
  outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_amap_batch_golden10/GS03/amap_taxi.png \
  --profile taxi_my_location
```

### 局部同视口求解

```bash
python3 modules/t01_pickup_point_validation/scripts/t01_local_frame_solver.py \
  --anchors-json outputs/_legacy_import/20260328_t01_thread_restart/20260327_t01_gate_coord_estimation_v1/estimation.json \
  --tip-xy 673.7692307692307,665
```

### 站点级锚点库端到端求解

```bash
python3 modules/t01_pickup_point_validation/scripts/t01_anchor_site_solver.py \
  --site-json modules/t01_pickup_point_validation/anchor_library/sites/amap_momeizi_same_view_v1.json \
  --target-id dongnan \
  --out-json outputs/_work/20260328_t01_anchor_site_bootstrap/dongnan_solution.json
```

### 参考底图配准

```bash
python3 modules/t01_pickup_point_validation/scripts/t01_map_registration.py \
  --target-image outputs/_work/20260328_t01_live_projection_pickup/step06_after_back_close.png \
  --reference-image outputs/_work/20260328_t01_map_registration_validation/reference_synthetic_warped.png \
  --profile-json modules/t01_pickup_point_validation/reference_registration/profiles/amap_taxi_portrait_v1.json \
  --target-tip-xy 556,637 \
  --out-json outputs/_work/20260328_t01_map_registration_validation/registration_result.json
```
