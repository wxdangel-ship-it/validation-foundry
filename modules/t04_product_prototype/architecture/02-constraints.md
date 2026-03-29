# T04 约束

## 1. 仓库约束

- 当前正式业务模块仍为 `t01_pickup_point_validation`
- T04 必须独立组织，不破坏 T03
- 默认禁止新增执行入口脚本

## 2. 产品约束

- 页面范围固定为 P2 / P3 / P4 / P4-overlay / P5，可选 P0
- 地图和 3D 当前只做占位骨架
- mock 数据必须可识别，不能假装真实后端

## 3. 工程约束

- 不新增 Python CLI
- package scripts 使用常规命名：`dev`、`build`、`storybook`、`build-storybook`、`test`、`test:smoke`
- 输出证据优先写入 `outputs/_work/t04_prototype/` 与 `outputs/_work/t04_qa/`
