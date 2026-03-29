# 004 - 2026-03-27 - AMap Golden-10 Success

## 概述

T01 在真实设备上通过高德备选链路完成第一阶段端到端闭环。

## 关键前提

- 真实设备：`Huawei Mate 20 Pro (Android 10)`
- 使用定制版 `com.lilstiffy.mockgps`
- 临时禁用 `com.huawei.hwid`
- 高德已登录

## 成功口径

- 高德 taxi 页稳定显示 `我的位置 上车`
- 地图气泡显示 `我的位置`
- 输出坐标与输入 `GCJ-02` 一致

## 结果

- golden set：`10/10 SUCCESS`
- 结果表：`outputs/_work/20260327_t01_amap_batch_final/results.csv`
- 摘要：`outputs/_work/20260327_t01_amap_batch_final/summary.json`

## 保留结论

- 滴滴主链路仍未解锁，不纳入当前交付路径
- 当前成功规则只适用于“高德打车页 = 我的位置 上车”的页面状态
