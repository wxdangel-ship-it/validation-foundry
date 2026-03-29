# T04_PRECHECK

## 1. 仓库规范检查

- 已读取 repo root `AGENTS.md`
- 已读取 `docs/doc-governance/README.md`、`docs/repository-metadata/README.md`
- 已读取 `docs/repository-metadata/repository-structure-metadata.md`
- 已读取 `docs/repository-metadata/code-boundaries-and-entrypoints.md`
- 已读取 `docs/project-management/phase-gates.md`

## 2. 范围确认

- T04 只做 Route / Trip 原型骨架，不做正式业务闭环
- T04 不做 T03 媒体化增强
- T04 不做 Route 生产
- P4 / P4-overlay / P5 当前是占位版

## 3. 样例确认

- 平台 Route 样例：使用 `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/` 作为事实源
- 导入轨迹样例：复用同一条轨迹，但前台语义改为“导入轨迹 / 自定义参考路线”
- 自由探索样例：固定 mock 地图区域、起点、安全锚点与探索范围
- 原型锚点说明：起终点、里程、时长、难度、轨迹几何来自六只脚目录；安全点 / 回撤点 / regroup 点允许基于轨迹位置派生并在文档中标注

## 4. 保护策略

- T03 保持历史参考状态，不直接改写
- T04 独立建模块文档面与实现面
- 当前正式业务模块仍为 `t01_pickup_point_validation`

## 5. 环境预检

- `npm` 可用
- `node` 不在 PATH，但 `'/mnt/c/Program Files/nodejs/node.exe' -v` 可用
- 本轮不新增 Python CLI
