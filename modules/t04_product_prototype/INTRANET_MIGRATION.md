# T04 Intranet Migration

## 1. 适用范围

用于把 `validation-foundry` 中的 `t04_product_prototype` 模块迁移到内网 GitHub，并在内网环境重新构建可点击原型与 Storybook 原型站。

当前迁移基线：

- 仓库：`validation-foundry`
- 模块：`modules/t04_product_prototype`
- 前端：`src/validation_foundry/modules/t04_product_prototype/webapp`
- 样例事实源：`outputs/_freeze/20260329_t04_liuzhijiao_route_1989358`
- 静态预览冻结：`outputs/_freeze/20260329_t04_static_preview`

## 2. 内网 GitHub 建仓与首次推送脚本

### 2.1 Bash 版本

前提：

- 内网已创建空仓库，或已拿到可写入的仓库 URL
- 示例 URL：`https://git.example.intra/product/validation-foundry.git`

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/data/repos/validation-foundry"
INTERNAL_REMOTE_URL="https://git.example.intra/product/validation-foundry.git"
BRANCH_NAME="main"

cd "${REPO_ROOT}"

git remote remove origin-internal 2>/dev/null || true
git remote add origin-internal "${INTERNAL_REMOTE_URL}"
git fetch origin-internal || true
git push -u origin-internal "${BRANCH_NAME}"
```

### 2.2 PowerShell 版本

```powershell
$RepoRoot = "E:\Work\validation-foundry"
$InternalRemoteUrl = "https://git.example.intra/product/validation-foundry.git"
$BranchName = "main"

Set-Location $RepoRoot

git remote remove origin-internal 2>$null
git remote add origin-internal $InternalRemoteUrl
git fetch origin-internal
git push -u origin-internal $BranchName
```

## 3. 若内网尚无空仓库

如果内网 GitHub 不能通过 CLI 自动建仓，先在内网 GitHub UI 创建一个空仓库，再执行上面的推送脚本。

如果内网支持 `gh` 并已完成登录，可用：

```bash
gh repo create product/validation-foundry --private --source . --remote origin-internal --push
```

## 4. 完整移植清单

### 4.1 必须带入的仓库内容

- `modules/t04_product_prototype/`
- `src/validation_foundry/modules/t04_product_prototype/`
- `tests/t04_product_prototype/`
- `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358/`
- `outputs/_freeze/20260329_t04_static_preview/`
- 仓库根的 `.gitignore`

### 4.2 事实源与运行依赖

- `outputs/_freeze/20260329_t04_liuzhijiao_route_1989358`
- Node.js 20.x
- npm 10.x 或兼容版本
- Python 3.11+ 用于仓库测试

### 4.3 不建议直接提交到内网 Git 的内容

- `src/validation_foundry/modules/t04_product_prototype/webapp/node_modules/`
- `src/validation_foundry/modules/t04_product_prototype/webapp/dist/`
- `src/validation_foundry/modules/t04_product_prototype/webapp/storybook-static/`
- `outputs/_work/`
- `outputs/_tmp/`

### 4.4 直接预览方案

若目标只是“通过 GitHub 下拉后立即查看成果”，不需要先安装前端依赖，直接启动冻结静态产物即可：

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/dist
python3 -m http.server 4173 --bind 127.0.0.1
```

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/storybook-static
python3 -m http.server 6006 --bind 127.0.0.1
```

### 4.5 内网落地后的首次校验

1. 核对冻结样例事实源目录存在，且 5 个基线文件完整。
2. 若只看成果，优先验证 `outputs/_freeze/20260329_t04_static_preview/` 下的 `dist` 与 `storybook-static` 可启动。
3. 若需继续开发，再进入 `webapp` 安装依赖。
4. 运行 `npm run test`。
5. 运行 `npm run build` 与 `npm run build-storybook`。
6. 启动原型与 Storybook，人工确认 `P2 / P3 / P4 / P5` 和 `Flow A / B / Flow C`。

## 5. 启动命令

### 5.1 直接启动冻结成果

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/dist
python3 -m http.server 4173 --bind 127.0.0.1
```

```bash
cd outputs/_freeze/20260329_t04_static_preview/artifacts/storybook-static
python3 -m http.server 6006 --bind 127.0.0.1
```

### 5.2 安装依赖

```bash
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp install
```

### 5.3 启动原型本体

```bash
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run dev -- --host 0.0.0.0 --port 4173
```

### 5.4 启动 Storybook

```bash
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run storybook -- --host 0.0.0.0 --port 6006
```

### 5.5 构建原型与 Storybook

```bash
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run build-storybook
```

### 5.6 运行测试

```bash
PYTHONPATH=src python3 -m pytest tests/t04_product_prototype -q -s
npm --prefix src/validation_foundry/modules/t04_product_prototype/webapp run test
```

## 6. 风险提示

- 当前 2D 地图依赖在线卫星瓦片；若内网不能访问外网，需要替换为内网可达的瓦片源。
- 当前 `P4 / P4-overlay / P5` 仍是高可信原型，不是最终业务能力。
- `vite build` 与 `build-storybook` 仍有 chunk warning，但不阻塞原型移植与演示。
- 当前不再需要单独外带 `1989358` 样例事实源压缩包；Git 仓库已包含冻结副本。
- 当前也不再需要单独外带静态预览压缩包；Git 仓库已包含冻结后的 `dist` 与 `storybook-static`。
