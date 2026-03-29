# 023 - 2026-03-28 - Reference Registration Validation

## 结论先行

- “App 截图 map ROI <-> 参考底图 ROI 配准”这条 `S2` 线路已经有代码化原型。
- 当前已新增：
  - 固定视角 profile
  - 配准脚本
  - 合成回归验证

## 新增资产

- 配准说明：
  - `modules/t01_pickup_point_validation/reference_registration/README.md`
- 固定视角 profile：
  - `modules/t01_pickup_point_validation/reference_registration/profiles/amap_taxi_portrait_v1.json`
- 配准脚本：
  - `modules/t01_pickup_point_validation/scripts/t01_map_registration.py`

## 方法

- 算法：`AKAZE + BFMatcher + Lowe ratio + RANSAC homography`
- 输入：
  - App 截图
  - 参考底图
  - 固定视角 profile
  - `pickup_tip_px`
- 输出：
  - 配准矩阵
  - `projected_tip_roi_xy`
  - overlay 诊断图

## 当前验证

- 验证方式：
  - 对 live screenshot 的 map ROI 施加已知透视变换，生成人工参考底图
  - 再用配准器反推出 `pickup_tip` 在参考图上的位置
- 证据目录：
  - `outputs/_work/20260328_t01_map_registration_validation/`

## 结果

- `expected_projected_tip_xy=[557.4662475585938,630.8707275390625]`
- `observed_projected_tip_xy=[557.5166625976562,630.875]`
- `euclidean_error_px=0.050595751660943475`
- `inlier_count=775`
- `inlier_ratio=0.9359903381642513`

## 当前意义

- 当前已经可以确认：
  - 只要能拿到参考底图，`pickup_tip_px` 映射到参考画布这一步是可做的
- 当前还不能确认：
  - 参考底图和高德 App 底图在真实场景下是否足够同源

## 下一步

- 继续保留：
  - `S1 = 站点级锚点库`
- 并行推进：
  - `S2 = App 截图 + 参考底图配准`
- `S2` 真正的下一步不是继续优化算法，而是接入第一张真实参考底图
