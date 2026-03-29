# T04_ARCHITECTURE

## 1. 技术栈冻结

- React + Vite：承载页面原型
- shadcn 风格轻组件：承载卡片、按钮、抽屉、标签
- Storybook：页面原型和流程自动演示
- XState：模式、下载和流程状态
- MSW：mock 上传、下载、状态流转
- MapLibre：普通地图态
- Cesium：3D 态占位

## 2. 组织方式

- 一个独立 webapp 承载页面与状态
- Storybook 直接复用主页面组件和状态机，不复制一套逻辑
- mock 数据统一从 `mocks/` 输出给页面和 stories
- 实际代码落位采用 Vite 常规结构：`webapp/src/*`

## 3. 入口策略

- 不新增 Python CLI
- 仅冻结 npm 的 `dev`、`build`、`storybook`、`build-storybook`、`test`、`test:smoke`
- 当前通过 `npm` 驱动 Node；当 shell 缺少 `node` PATH 时，可显式使用 `'/mnt/c/Program Files/nodejs/node.exe'`
