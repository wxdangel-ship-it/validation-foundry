# T04_R2_PAGE_MATRIX

## 1. 页面清单

- `P0 Demo Launcher`
- `P2 Route Detail`
- `P3 Free Explore Plan`
- `P4 Offroad Map`
- `P4-overlay Safety Drawer`
- `P5 Trip Summary`

## 2. 模式矩阵

| 页面 | 平台 Route | 导入轨迹 | 自由探索 |
| --- | --- | --- | --- |
| `P0 Demo Launcher` | Yes | Yes | Yes |
| `P2 Route Detail` | Yes | Yes | No |
| `P3 Free Explore Plan` | No | No | Yes |
| `P4 Offroad Map` | Yes | Yes | Yes |
| `P4-overlay Safety Drawer` | Yes | Yes（复用平台结构） | Yes |
| `P5 Trip Summary` | Yes | Yes | Yes |

## 3. 共用结构

- `P2`：左侧信息 + 右侧地图 + 底部双 CTA
- `P3`：左侧信息 + 右侧地图 + 底部双 CTA
- `P4`：顶部轻状态栏 + 中央地图 + 右侧 5 个入口 + 底部轻信息条 + 安全抽屉覆盖态
- `P5`：左侧总结信息 + 右侧地图回放区 + 左侧底部固定操作区

## 4. 模式差异

### 4.1 P4 Offroad Map

- 平台 Route：
  - 平台参考线
  - 起点 / 终点
  - 接驳点 / 回撤点
  - 关键锚点
- 导入轨迹：
  - 导入轨迹参考线
  - 起点 / 终点
  - 回撤点
  - 关键锚点
  - 顶部状态明确为“导入轨迹 / 自定义参考路线”
- 自由探索：
  - 起点
  - 探索范围
  - 安全锚点
  - 已走轨迹
  - 顶部状态明确为“自由探索”

### 4.2 P4-overlay Safety Drawer

- 平台 / 导入：
  - 寻迹返航
  - 回接驳点
  - 回终点 / 回撤点
- 自由探索：
  - 沿已走轨迹返回
  - 回起点
  - 回最近安全锚点

### 4.3 P5 Trip Summary

- 平台 Route：
  - 是否与平台 Route 一致
  - 是否提交路线反馈
- 导入轨迹：
  - 是否保存为自定义路线
  - 是否提交为候选 Route
- 自由探索：
  - 是否保存为私有探索
  - 是否提炼为候选 Route

## 5. TODO

- TODO：导入轨迹模式如评审要求单独抽出 `P4-overlay` story，可在本轮后补

