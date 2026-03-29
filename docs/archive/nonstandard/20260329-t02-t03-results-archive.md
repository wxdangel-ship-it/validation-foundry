# 2026-03-29 T02/T03 本地成果归档说明

## 背景

- 项目级源事实 `SPEC.md` 与 `docs/PROJECT_BRIEF.md` 都明确：当前正式业务模块只有 `t01_pickup_point_validation`
- 本地仓库在后续探索中沉淀了 `t02_route_coldstart` 与 `t03_route_trip_experience` 的首轮文档、代码、测试和样例成果
- 为了把本地成果合并回主干，同时保持治理口径一致，需要将 T02/T03 从 `Active` 收口为历史参考资产

## 本次归档决策

- 归档日期：`2026-03-29`
- 归档对象：
  - `modules/t02_route_coldstart/`
  - `modules/t03_route_trip_experience/`
  - `src/validation_foundry/modules/t02_route_coldstart/`
  - `src/validation_foundry/modules/t03_route_trip_experience/`
  - `tests/t02_route_coldstart/`
  - `tests/t03_route_trip_experience/`
- 归档方式：
  - 保留原始目录与代码，不做物理迁移
  - 在治理文档、盘点文档和入口登记中统一改标为 `Historical Reference`
  - 不再把这些模块视为当前正式业务模块或正式执行入口

## 保留理由

- T02 已沉淀首轮 Route 草案打包与 QA 流水线，可作为后续重启时的经验资产
- T03 已沉淀首轮 Route/Trip 媒体化与交互原型，可作为演示、复盘和后续再启动的参考资产
- 保留原路径可避免打断既有文档链接、测试导入路径和历史复核路径

## 后续约束

- 若未来要重新激活 T02 或 T03，必须先更新：
  - `docs/doc-governance/module-lifecycle.md`
  - `docs/doc-governance/current-module-inventory.md`
  - `docs/doc-governance/current-doc-inventory.md`
  - `docs/repository-metadata/entrypoint-registry.md`
- 在重新激活前，所有正式推进仍只围绕 `t01_pickup_point_validation`
