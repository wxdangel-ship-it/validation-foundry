# T01 Anchor Library

本目录存放 T01 的站点级锚点库资产。

## 目标

- 为 `visual_tip / hybrid` 主线提供可审计的绝对坐标锚点
- 把“站点配置”和“求解代码”分开，避免每次重写规则
- 让同一站点的重复实验直接复用同一套锚点定义

## 目录约定

- `sites/*.json`
  - 站点级锚点配置
- `golden10_anchor_status.csv`
  - 当前浦东 `golden-10` 的锚点建设状态

## 站点级 JSON 最小字段

- `site_id`
- `provider`
- `site_name`
- `solve_method`
- `tip_profile`
- `device`
- `viewport_contract`
- `anchors`
- `targets`

其中：

- `anchors`
  - 每个锚点至少包含：
    - `anchor_id`
    - `name`
    - `lon`
    - `lat`
    - `tip_px`
    - `source_type`
    - `source_ref`
- `targets`
  - 可选历史样例或回归目标
  - 用于验证该站点配置是否还能复现已知结果

## 当前策略

- 不追求“一套全局通解”
- 先做“固定设备 + 固定页面态 + 固定站点”的局部稳定解
- 当站点数足够多时，再评估是否能抽象成更大范围模板
