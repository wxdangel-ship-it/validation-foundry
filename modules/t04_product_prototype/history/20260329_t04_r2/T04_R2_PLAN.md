# T04_R2_PLAN

## 1. 本轮目标

- 完善 `P4 越野地图页`
- 完善 `P4-overlay 安全抽屉`
- 完善 `P5 越野总结页`
- 将 Storybook 提升为完整原型站，并保留 Flow A / B / C 自动演示

## 2. 执行顺序

### 阶段 0：继续前 Preflight

- 对齐第一阶段基线与 `1989358` 事实源
- 固定第二阶段边界和写入目录

### 阶段 1：页面契约冻结

- 冻结 `P4 / P4-overlay / P5` 结构与模式差异
- 冻结 Storybook 页面矩阵、状态矩阵、docs 矩阵
- 明确 mock / placeholder 边界

### 阶段 2：原型实现

- 实现 `P4` 三模式页面
- 实现 `P4-overlay` 两类模式页面
- 实现 `P5` 三模式页面
- 让关键路段卡与地图高亮联动可演示

### 阶段 3：Storybook 完整站与 QA

- 补齐页面级、状态级、docs、flows stories
- 跑通 Flow A / B / C 自动演示
- 生成 `build-storybook` 产物
- 刷新截图、日志、QA bundle

## 3. 交付物

- 主 Agent：
  - `T04_R2_PRECHECK.md`
  - `T04_R2_PLAN.md`
  - `T04_R2_EXEC_SUMMARY.md`
- 子 Agent A：
  - `T04_R2_PRODUCT_SCOPE.md`
  - `T04_R2_PAGE_MATRIX.md`
  - `T04_R2_STORYBOOK_MATRIX.md`
- 子 Agent B：
  - `T04_R2_IA.md`
  - `T04_R2_WIREFRAME.md`
- 子 Agent C：
  - `T04_R2_ARCHITECTURE.md`
  - `T04_R2_STATE_MODEL.md`
  - `T04_R2_DATA_CONTRACT.md`
- 子 Agent E：
  - `T04_R2_TEST_PLAN.md`
  - `T04_R2_ACCEPTANCE_CHECKLIST.md`
  - `T04_R2_QA_REPORT.md`

## 4. 验收门槛

1. `P4 / P4-overlay / P5` 均已落地
2. 三模式差异成立
3. Storybook 页面级、状态级、docs、flows 完整
4. Flow A / Flow B / Flow C 可点击且可自动演示
5. QA 证据完整

