# 003 - Logged-In + GPS-Only Blocked

## 日期

- `2026-03-27`

## 背景

- 在 `002-20260327-real-device-app-blocked.md` 中，真实设备已经证明 mock GPS 成立，但滴滴忽略 mock，高德在未登录约束下进入登录墙。
- 本轮新增两个消解条件：
  - 用户已人工完成滴滴与高德登录
  - 通过 ADB 将系统 `location_providers_allowed` 改为 `gps`

## 本轮动作

1. 编译并安装定制版 `MockGps`
2. 修复 `Provider "gps" already exists` 崩溃
3. 验证 `gps provider [mock]` 正常发布上海坐标
4. 复跑滴滴首页定位链路
5. 显式启动高德并复跑 `打车` 入口
6. 进一步将系统切到 `gps only`
7. 在 `gps only` 下再次复跑滴滴与高德

## 结果

- 滴滴：
  - 在 `gps only` 下首页出现 `重新定位`
  - 点击后仍停在 `北京市`
  - 页面要求 `请输入上车点`
  - `dumpsys location` 已显示系统 `last location` 为 mock 上海点
- 高德：
  - 显式启动成功
  - 首页可见 `打车` 入口
  - 一条路径可进入 taxi pickup 页面，但 pickup 仍在北京 `清友园`
  - 另一条路径漂移到 `高德打车企业版`

## 结论

- 登录态不足以解阻
- `gps only` 也不足以解阻
- 当前设备与当前 app 版本组合下，普通 ADB 自动化无法形成可信上车点提取链路

## 证据

- `outputs/_work/20260327_t01_logged_in_gps_only_blocked/`
