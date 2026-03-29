# T02 - FAILURE_TAXONOMY

## 1. 文档目的

定义 T02 的 QA 状态、失败分类和不入池原因。

## 2. 状态层级

- `PASS`
- `WARN`
- `FAIL`

## 3. 失败分类

| 分类 | status | 说明 | 最小证据 |
|---|---|---|---|
| `missing_offroad_signal` | `FAIL` | 未命中平台级显式越野信号；两步路缺 `越野车` 标签，或六只脚虽由 `越野` 搜索进入但详情无越野车辆信号 | 列表页或详情页截图 |
| `mixed_hiking_semantics` | `FAIL` | 虽然有 `越野车` 标签，但详情主体是徒步 / 登山 / 步道 | 详情页截图、文字摘录 |
| `missing_geometry_evidence` | `FAIL` | 没有导出轨迹，也没有可回查的轨迹截图 | 详情页截图、说明记录 |
| `missing_traceability` | `FAIL` | 缺失路线编号、抓取时间、来源截图等追溯信息 | 原始证据目录 |
| `missing_keypoints` | `WARN` | 关键点候选不足，但仍有基本几何和语义草案 | route draft + 证据截图 |
| `low_geometry_confidence` | `WARN` | 只有屏幕重建几何或规划线嫌疑偏高 | 轨迹截图、风险说明 |
| `missing_prerequisites` | `WARN` | 适用前提候选不足 | route draft |
| `export_blocked` | `WARN` | 官方导出不可得，但轨迹截图和追溯证据完整 | 截图、操作记录 |

## 4. 当前明确不入池条件

以下任一命中，直接 `FAIL`，不得计入本轮 `10` 条目标：

1. 详情页主体是 `步道 / 徒步 / 登山`
2. 没有几何证据
3. 没有来源编号或来源截图
4. 无法解释为什么它是驾车越野路线
