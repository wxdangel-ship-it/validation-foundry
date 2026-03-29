# 20260329_t04_liuzhijiao_route_1989358

## 1. 目的

本目录是 `t04_product_prototype` 当前唯一 Git 跟踪样例事实源的冻结基线。

## 2. 基线来源

- 冻结日期：`2026-03-29`
- 模块：`t04_product_prototype`
- 上游导入来源：
  - `outputs/_work/20260328_t02_liuzhijiao_route_catalog_roadbook/1989358/`

## 3. 冻结内容

- `1989358_metadata.json`
- `1989358_geometry_summary.json`
- `1989358_geometry.geojson`
- `1989358_geometry.gpx`
- `1989358_description.md`

## 4. 使用约束

- 平台 Route 模式与导入轨迹模式必须共用本基线
- 当前只允许以下字段被视为真实事实：
  - 里程
  - 时长
  - 难度
  - 起终点
  - 566 个轨迹点
- `risk / regroup / retreat` 仍是“原型锚点”，不得伪装为源事实
- 前端消费副本为：
  - `src/validation_foundry/modules/t04_product_prototype/webapp/public/demo-data.json`

## 5. 变更规则

- 若未来替换样例，必须同步更新：
  - `modules/t04_product_prototype/INTERFACE_CONTRACT.md`
  - `modules/t04_product_prototype/INTRANET_MIGRATION.md`
  - `modules/t04_product_prototype/history/20260329_t04_r2/T04_R2_DATA_CONTRACT.md`
  - `src/validation_foundry/modules/t04_product_prototype/webapp/public/demo-data.json`
