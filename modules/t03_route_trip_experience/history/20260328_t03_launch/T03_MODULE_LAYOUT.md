# T03_MODULE_LAYOUT

## 1. 模块目录

```text
modules/t03_route_trip_experience/
src/validation_foundry/modules/t03_route_trip_experience/
tests/t03_route_trip_experience/
outputs/_work/t03_route_video/
outputs/_work/t03_trip_summary/
outputs/_work/t03_prototype/
outputs/_work/t03_qa/
```

## 2. 结构策略

- 遵守当前仓库 `modules/ + src/validation_foundry/modules/ + tests/ + outputs/_work/` 的现有结构
- 首轮不新增顶层 `apps/` 目录，前端运行壳内聚在 `src/validation_foundry/modules/t03_route_trip_experience/webapp/`
- 样例、契约校验、渲染、导出四层拆分，服务单样例闭环
