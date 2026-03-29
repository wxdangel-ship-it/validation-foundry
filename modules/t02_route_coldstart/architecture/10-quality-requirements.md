# 10 质量要求

## 1. 可理解

- 路线为什么入池、为什么被拒绝，应可直接从 route draft 和 QA 记录读出

## 2. 可复现

- 相同 manifest 应能重复生成相同目录结构和索引结果

## 3. 可审计

- 每条路线都必须能回查到原始截图、文字摘录和几何证据

## 4. 可诊断

- `FAIL` 必须能区分：
  - 标签不符
  - 语义不符
  - 几何缺失
  - 追溯缺失

## 5. 可扩展

- 当前产物结构必须预留 `adapter_id`、`source_platform`、`source_identifier` 和 `source_snapshot` 扩展位
