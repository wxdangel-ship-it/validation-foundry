# T03_PRECHECK

## 1. 仓库规范检查

- 已读取 repo root `AGENTS.md`
- 已读取 `docs/doc-governance/README.md`、`docs/repository-metadata/repository-structure-metadata.md`
- 已读取 `docs/repository-metadata/entrypoint-registry.md`
- 已读取 `modules/t02_route_coldstart/AGENTS.md`、`README.md`、`INTERFACE_CONTRACT.md`

## 2. 范围确认

- T03 只做 Route / Trip 的深加工、媒体化表达与交互原型
- T03 不做 Route 生产
- T03 不做自动越野寻路
- T03 不引入 Google 专有依赖为主链路

## 3. 样例确认

- 已确认 T02 六只脚样例存在于 `outputs/_work/20260328_t02_route_coldstart_dualsource_partial_r02/routes/liuzhijiao/`
- 建议首轮主样例固定为 `liuzhijiao_1989358`
- 样例理由：
  - `PASS`
  - `main_geometry.gpx` 可用
  - 关键点候选完整
  - 路径点数 `566`
  - 时长约 `29` 分钟，适合首轮演示与导出

## 4. 环境检查

- `node` / `npm` 可用
- `ffmpeg` 可用
- 本地系统浏览器未发现，需要使用 Puppeteer 下载浏览器
- `pytest` 当前未安装，需要使用 `python3 -m pytest` 并补充依赖

## 5. 执行口径

- 首轮固定单样例
- 先跑通 Route 展示视频，再补 Trip 回放与原型
- 所有结果必须落 `outputs/_work/t03_*`
