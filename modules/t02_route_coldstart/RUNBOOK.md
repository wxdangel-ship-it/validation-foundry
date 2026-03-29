# T02 - RUNBOOK

## 1. 文档目的

说明 T02 当前的单条采集闭环、批量打包命令、输出位置与 QA 复现方式。

## 2. 当前运行状态

- 当前正式源：
  - `2bulu`
  - `liuzhijiao`
- 当前设备路径：真实 Android 手机 + `adb.exe`
- 当前筛选口径：
  - `2bulu`：`越野车` 显式标签 + 详情语义确认为驾车越野
  - `liuzhijiao`：搜索 `越野` 命中 + 详情语义确认为驾车越野
- 当前排除口径：混合标签的徒步 / 登山 / 步道类路线

## 3. 单条采集步骤

1. 在源 App 中进入路线候选页。
2. 按平台收窄候选：
   - `2bulu`：`类型 -> 越野车`
   - `liuzhijiao`：搜索 `越野`
3. 打开路线详情，先保留：
   - 列表页截图
   - 详情页截图
   - 轨迹页截图
   - 页面 UI dump / 文字摘录
4. 复核详情语义：
   - 若主体是步道 / 徒步 / 登山，则直接标记 `FAIL`
   - 若主体支持驾车越野，再尝试导出或继续保留几何证据
   - `liuzhijiao` 已验证导出路径：详情页右上角 `...` -> `导出轨迹文件` -> `GPX格式（轨迹）`
   - `liuzhijiao` 额外保留搜索词、搜索结果页命中截图或文字摘录
   - `2bulu` 额外保留 `类型 -> 越野车` 命中截图或等价标签证据
5. 将单条采集结果录入 `manifest.json`

## 4. 批量打包步骤

1. 准备 `manifest.json`
2. 执行：

```bash
PYTHONPATH=src python3 -m validation_foundry.modules.t02_route_coldstart.pipeline \
  --manifest <manifest.json> \
  --output-root outputs/_work/<run_id>
```

3. 检查输出：
   - `route_index.csv`
   - `route_index.json`
   - `run_manifest.json`
   - `collection_log.md`
   - `qa_summary.md`
   - `qa_issues.json`

4. 若六只脚样本需要从结果页回补 GPX，可在手机已经停留于 `搜索 越野 -> 自驾车` 结果页时执行：

```bash
python3 tools/t02_liuzhijiao_export_gpx.py \
  --adb /mnt/c/Users/admin/AppData/Local/Android/Sdk/platform-tools/adb.exe \
  --output-dir outputs/_tmp/t02_liuzhijiao_exports_from_device \
  --work-dir outputs/_tmp/t02_liuzhijiao_export_work
```

## 5. 输出位置

- 推荐 run 根：`outputs/_work/<run_id>/`
- 每条路线根：`outputs/_work/<run_id>/routes/<source_platform>/<route_id>/`

## 6. 证据要求

- 成功与失败都必须保留原始截图和页面信息快照
- `WARN` 样本也必须有几何证据，不能只有文字摘要
- `FAIL` 样本不得静默丢弃；若不计入本轮 `10` 条目标，也要留在 `qa_issues.json`
- 双源汇总时必须能按 `source_platform` 分开统计
- 双源 `PASS + WARN` 才计入“可进入人工审核池”的样本数；`FAIL` 只保留证据，不计入配额
