# T01 - INTERFACE_CONTRACT

## 定位

- 本文件是 `t01_pickup_point_validation` 的稳定契约面。
- 项目级阶段状态以 `docs/project-management/*` 为准。
- 模块内方法、运行和历史证据分别由 `architecture/*`、`RUNBOOK.md`、`history/*` 承担。

## 1. 目标与范围

- 模块 ID：`t01_pickup_point_validation`
- 长期目标：
  - 输入 `GCJ-02`
  - 在目标应用中拿到最终“上车点”的 `GCJ-02`
  - 输出可复核、可审计、可批量化的结果
- 当前正式范围：
  - 冻结输入输出合同
  - 冻结 `provider / method / status / confidence`
  - 冻结目标点定义与取点规则
  - 冻结 Phase 0-5 阶段推进口径
- 当前不在正式范围：
  - 协议逆向
  - 安全绕过
  - 无证据的视觉猜测坐标

## 2. Inputs

### 2.1 必选业务输入

- 批量输入格式：`CSV`
- 必选字段：
  - `id`
  - `name`
  - `x`
  - `y`
- 输入坐标系：`GCJ-02`

### 2.2 运行输入

- provider 选择：`didi / amap / auto`
- method 选择：`mock_direct / visual_tip / drag_map / hybrid / auto`
- 站点级锚点库 / 站点配置
- 证据输出根目录
- 运行设备与 app 版本

### 2.3 输入前提

- 只允许黑盒 UI 自动化与系统允许的 mock
- 不依赖用户长期手工协助
- 每条输入记录必须独立产出结果记录

## 3. Outputs

### 3.1 结果表字段

统一结果至少包含：

- `id`
- `name`
- `input_x`
- `input_y`
- `output_x`
- `output_y`
- `provider`
- `method`
- `status`
- `confidence`
- `reason`
- `evidence_dir`

### 3.2 字段口径

- `provider`：`didi / amap / other-approved-provider`
- `method`：`mock_direct / visual_tip / drag_map / hybrid / blocked`
- `status`：`SUCCESS / FAIL / BLOCKED`
- `confidence`：`high / medium / low`
- `output_x/output_y`：填写时必须是 `GCJ-02`
- `evidence_dir`：必须指向仓库内可复核证据目录

## 4. 目标点定义

- 正式目标点为上车点 marker 的实际落点 / 尖端位置
- 若页面没有尖端型 marker，必须定义可复核的等价取点规则
- `visual_tip` 只负责测量 `tip_px`
- `tip_px -> GCJ-02` 必须由几何 / 标定 / hybrid 求解负责

## 5. Method 语义

### 5.1 `mock_direct`

- 系统允许的 mock 直接驱动业务页
- 只有应用直接暴露可审计取点依据时才可独立成为成功路径

### 5.2 `visual_tip`

- 通过截图、UI、OCR 或等价可审计方式定位显式上车点 tip

### 5.3 `drag_map`

- 通过拖图 / 控制视口制造几何约束
- 默认只作为辅助，不单独承担最终可信度

### 5.4 `hybrid`

- 用 `mock_direct` 或其他粗定位缩小范围
- 再用 `visual_tip` / 局部标定 / 固定视口完成精反算

## 6. Success / Failure 语义

- `SUCCESS`：
  - provider 和 method 明确
  - 页面链路与取点规则明确
  - 输出坐标可解释且为 `GCJ-02`
  - `evidence_dir` 可独立复核
- `FAIL`：
  - 链路能跑到相关阶段
  - 但业务态、tip、几何或坐标可信度不满足合同
- `BLOCKED`：
  - 被运行时、权限、登录、安装或外部约束阻断，无法推进

## 7. Acceptance

1. 每条输入都必须有一条结果记录
2. 结果必须显式包含 `provider + method + confidence`
3. `SUCCESS` 必须能回查 `tip` 或等价规则与 `GCJ-02` 求解过程
4. 不允许伪造坐标或 silent failure
