# t03_route_trip_experience - RUNBOOK

## 1. 文档目的

说明 `t03_route_trip_experience` 的官方运行方式、复现步骤和阶段性验证顺序。

## 2. 当前运行状态

- 已冻结单样例主线：`liuzhijiao_1989358`
- Python 样例装配负责生成统一契约与 QA 输入
- Web app 负责 Route 展示视频、Trip 总结回放/视频和交互原型

## 3. 复现步骤

1. 安装前端依赖：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp install`
2. 生成 T03 样例输入：`PYTHONPATH=src python3 -m validation_foundry.modules.t03_route_trip_experience.pipeline --output-root outputs/_work`
3. 构建前端：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run build`
4. 导出 Route 成片：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:route`
5. 导出 Trip 成片：`npm --prefix src/validation_foundry/modules/t03_route_trip_experience/webapp run export:trip`
6. 导出 prototype 截图：使用 `src/validation_foundry/modules/t03_route_trip_experience/webapp` 下 Puppeteer 流程按主链路逐页截图
7. 运行测试：`PYTHONPATH=src python3 -m pytest tests/t03_route_trip_experience -q`

## 4. 输出位置

- Route 视频：`outputs/_work/t03_route_video/`
- Trip 总结：`outputs/_work/t03_trip_summary/`
- 交互原型：`outputs/_work/t03_prototype/`
- QA 证据包：`outputs/_work/t03_qa/`

## 5. 证据要求

- 成功时必须保留样例清单、统一契约文件、视频/截图成品、浏览器导出日志、QA 报告与目录树
- 失败或降级时必须明确失败阶段、原因、保留的产物与下一步建议
