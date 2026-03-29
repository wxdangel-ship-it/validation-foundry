# T01 - FAILURE_TAXONOMY

## 1. 文档目的

定义 T01 的失败分类、状态口径和最低证据要求。

## 2. 状态层级

- `SUCCESS`：具备可信坐标和完整证据
- `FAIL`：链路执行到相关阶段，但结果不可提取、不可验证或不可信
- `BLOCKED`：被环境、权限、登录限制或外部条件阻断，无法继续

## 3. 当前失败分类

| 分类 | status | 说明 | 最低证据 |
|---|---|---|---|
| `environment_not_ready` | `BLOCKED` | 设备、ADB 或运行时不可用 | 环境日志、版本信息、截图 |
| `apk_install_failed` | `BLOCKED` | 应用安装或降级失败 | 安装日志、安装器截图 |
| `login_required_or_gate` | `BLOCKED` | 未登录约束下页面不可继续 | 页面截图、UI dump |
| `location_permission_blocked` | `BLOCKED` | 系统权限阻断定位链路 | 权限截图、日志 |
| `entry_path_not_found` | `FAIL` | 无法找到目标入口或按钮 | 截图、UI dump |
| `service_entry_drift_or_redirect` | `BLOCKED` | 入口漂移到营销页、企业版或非目标业务态 | 页面截图、UI dump |
| `page_not_stable` | `FAIL` | 超时未达到稳定判据 | `stable_window.json`、截图序列 |
| `pickup_tip_not_exposed` | `FAIL` | 页面业务态已到，但显式上车点 tip 无法出现或无法稳定识别 | 截图、UI dump、ROI 说明 |
| `coordinate_extraction_unverified` | `FAIL` | 已有候选坐标，但缺少可信求解或验证链路 | `extraction.json`、对照截图 |
| `coordinate_system_unverified` | `FAIL` | 无法证明输出仍为 `GCJ-02` | 坐标校验日志、说明 |
| `provider_context_mismatch` | `FAIL` | app 已启动且请求定位，但业务态仍收敛到无关城市 / 无关 POI，上车点不可信 | 前台截图、UI dump、`dumpsys location` |
| `app_ignores_mock_location` | `BLOCKED` | 系统 mock 已成立，但 app 明确不消费 mock，且没有其他替代路线 | mock 侧证据、app 截图、日志 |
| `vendor_network_provider_override` | `BLOCKED` | 厂商位置栈覆盖或干扰 mock GPS | `dumpsys location` 前后对比 |
| `app_crash_or_hang` | `FAIL` | 应用在当前运行时内崩溃或假死 | 崩溃日志、截图 |

## 4. 当前轮次命中分类

- 滴滴当前状态：
  - `provider_context_mismatch`
- 高德当前合同缺口：
  - `pickup_tip_not_exposed`
  - `coordinate_extraction_unverified`
- 运行时与设备：
  - 当前未命中新的全局 `BLOCKED`

## 5. 最低要求

- 不允许把 `BLOCKED` 写成 `FAIL` 来掩盖环境问题
- 不允许把 `FAIL` 写成 `SUCCESS` 来掩盖坐标不可信
- 每条记录都必须命中一个分类，或补充新分类并更新本文档
