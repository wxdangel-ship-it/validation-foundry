# 20260329_t04_static_preview

## 1. 目的

本目录冻结 `t04_product_prototype` 当前可分享静态成果，供内网通过 GitHub 直接下拉后启动，不依赖重新 `npm install` 或重新构建。

## 2. 冻结内容

- `artifacts/dist/`
  - T04 原型本体静态站
- `artifacts/storybook-static/`
  - T04 Storybook 静态站

## 3. 生成来源

- Webapp：`src/validation_foundry/modules/t04_product_prototype/webapp`
- 构建命令：
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build`
  - `npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook`

## 4. 内网启动方式

### 4.1 原型本体

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/dist
python3 -m http.server 4173 --bind 127.0.0.1
```

### 4.2 Storybook

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/storybook-static
python3 -m http.server 6006 --bind 127.0.0.1
```

## 5. 使用约束

- 该目录只作为静态预览冻结成果，不替代源码、测试和契约文档。
- 若页面或 Storybook 有新变更，必须重新构建并整体刷新本目录。
- 当前 2D 地图仍依赖在线卫星瓦片；内网若无法访问外网，地图底图可能不可见，但页面骨架与流程仍可查看。
