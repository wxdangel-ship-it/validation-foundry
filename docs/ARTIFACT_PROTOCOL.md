# T01 证据包协议

## 1. 文档目的

本文档定义 T01 在单点验证、golden set 和批量执行中的最小证据包要求。

## 2. 运行输出根

- 工作输出根：`outputs/_work/<run_id>/`
- 历史导入根：`outputs/_legacy_import/<import_id>/`
- 冻结基线根：`outputs/_freeze/<baseline_id>/`
- 临时实验根：`outputs/_tmp/<experiment_id>/`

## 3. 批量结果文件

每次正式批量执行至少输出：

- `results.csv`
- `run_manifest.json`
- `summary.json`

`results.csv` 最低字段：

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

补充规则：

- `provider` 必须是 `didi / amap / other-approved-provider`
- `method` 必须是 `mock_direct / visual_tip / drag_map / hybrid / blocked`
- `status` 必须是 `SUCCESS / FAIL / BLOCKED`
- `confidence` 必须是 `high / medium / low`
- `output_x/output_y` 填写时必须是 `GCJ-02`

## 4. 单样本证据目录

每条记录的 `evidence_dir` 至少应包含：

- `input_record.json`
- `status.json`
- `timeline.log`
- `stable_window.json`
- `extraction.json`
- `screenshots/`

按需补充：

- `uiautomator/`
- `adb/`
- `screenrecord/`
- `ocr/`
- `geometry/`
- `deeplink/`

## 5. 成功记录最低证据

若 `status=SUCCESS`，至少应能回查：

- 输入坐标
- provider 与 method
- 页面链路
- 满足稳定判据的证据
- `tip` 或等价取点规则
- `tip -> GCJ-02` 的求解过程
- 输出坐标与坐标系说明

## 6. 失败记录最低证据

若 `status=FAIL` 或 `status=BLOCKED`，至少应能回查：

- 失败阶段
- 失败原因
- 对应截图或日志
- 当前是否允许自动重试或切换备选链路

## 7. 历史证据规则

- 历史 C 盘证据只允许作为导入来源
- 导入后应放到仓库下的 `outputs/_legacy_import/`
- 活跃结果表中的 `evidence_dir` 不得再引用 `C:\Users\admin` 或 `/mnt/c/Users/admin`
- 若引用历史导入证据，必须明确标注为 `legacy` 或 `historical`

## 8. 明确禁止

- 不允许只给结果不给证据
- 不允许省略失败样本
- 不允许把临时观察写成正式结果
- 不允许把输入坐标直接回填成 `SUCCESS`，除非页面状态与取点规则已被合同允许且证据完整
