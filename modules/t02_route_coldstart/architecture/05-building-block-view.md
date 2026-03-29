# 05 构件视图

## 状态

- 当前状态：`模块级构件说明`
- 来源依据：`src/validation_foundry/modules/t02_route_coldstart/`

## 稳定阶段链

`候选采集 -> 详情复核 -> 证据整理 -> 草案打包 -> QA 汇总`

## 构件与职责

### 1. Manifest 解析层

- `pipeline.py`
- 职责：读取 run manifest、解析路线条目、校验基础字段

### 2. 证据归档层

- `pipeline.py`
- 职责：复制原始截图、轨迹文件、页面快照和文字摘录

### 3. 草案归一化层

- `pipeline.py`
- 职责：生成 `route_draft.json`、`route_summary.md`、归一化元数据和几何文件

### 4. QA 汇总层

- `pipeline.py`
- 职责：按 `PASS / WARN / FAIL` 规则生成 route index 和 QA 报告

### 5. Source Adapter 预留位

- `src/validation_foundry/modules/t02_route_coldstart/`
- 职责：以 `adapter_id` 为扩展点，后续承接 `liuzhijiao`
