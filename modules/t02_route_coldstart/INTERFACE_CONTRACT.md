# T02 - INTERFACE_CONTRACT

## 定位

- 本文件是 `t02_route_coldstart` 的稳定契约面。
- 模块目标、上下文、构件关系与风险说明以 `architecture/*` 为准。
- `README.md` 只承担操作者入口职责，不替代长期源事实。

## 1. 目标与范围

- 模块 ID：`t02_route_coldstart`
- 长期目标：
  - 基于两步路与六只脚真实路线素材，生成可复跑、可审计、可追溯的越野 Route 草案包
- 当前正式范围：
  - 冻结 Route 草案包最小结构
  - 冻结采集筛选门槛
  - 冻结运行产物、Route 索引与 QA 产物
  - 冻结 `PASS / WARN / FAIL` 口径
  - 建立双源 `adapter_id` 结构
- 当前不在正式范围：
  - 正式上线 Route 定稿
  - 未经授权的抓包、协议逆向或绕过导出限制

## 2. Inputs

### 2.1 必选运行输入

- `manifest.json`
  - 单次采集 run 的输入清单
  - 至少包含 `run_id`、`collection_context`、`routes`
- `routes[*]`
  - 每条路线的来源信息、原始证据路径、草案字段和筛选结论

### 2.2 路线入池门槛

每条路线只有同时满足以下条件，才允许进入本轮 `routes[*]` 正式清单：

1. 来源平台属于：
   - `2bulu`
   - `liuzhijiao`
2. 命中平台级显式越野信号：
   - `2bulu`：类型标签明确包含 `越野车`
   - `liuzhijiao`：由搜索 `越野` 进入候选，且详情页存在越野/车辆相关显式信号
3. 详情页语义明确支持“驾车越野 / 机动越野 / 林道 / 沙地 / 河滩 / 戈壁 / 穿越”等驾车越野判断
4. 不属于“混合标签误入”的徒步 / 登山 / 步道类路线
5. 有可保存的路线几何证据：
   - 优先 `GPX / KML / KMZ`
   - 若官方导出不可得，则至少保留可回查的轨迹截图，并显式标注 `screen_reconstructed`

### 2.3 详情语义判断规则

- 正向语义示例：
  - `越野`
  - `越野车`
  - `穿越`
  - `林道`
  - `沙漠`
  - `沙地`
  - `河滩`
  - `戈壁`
  - `四驱`
  - `车队`
  - `机车`
  - `营地`
  - `路书`
- 负向语义示例：
  - `步道`
  - `徒步`
  - `登山`
  - `健身步道`
  - `平缓步道`
  - `适合新手徒步`
  - 以累计爬升、徒步难度、登山景观为主体说明
- 若同一条路线同时出现越野信号和明显徒步主语义，必须判为 `FAIL`，不得计入本轮目标

### 2.4 Route 草案包最小结构

每个 `route_draft.json` 至少包含：

- `route_id`
- `region`
- `adapter_id`
- `source_meta`
  - `source_platform`
  - `source_route_title`
  - `source_route_url`
  - `source_identifier`
  - `source_author`
  - `source_capture_time`
  - `collection_operator`
  - `acquisition_mode`
- `geometry_bundle`
  - `raw_geometry_files`
  - `geometry_evidence_screenshots`
  - `normalized_main_geometry`
  - `geometry_mode`
  - `source_nature`
  - `geometry_confidence`
  - `length_km_candidate`
  - `start_end_candidate`
- `semantic_draft`
  - `route_name_candidate`
  - `short_description_candidate`
  - `scene_type_candidate`
  - `terrain_tags`
  - `difficulty_candidate`
  - `duration_candidate`
  - `applicable_prerequisites_candidate`
- `keypoint_candidates`
  - `entry_point_candidates`
  - `exit_point_candidates`
  - `regroup_or_parking_candidates`
  - `retreat_candidates`
  - `risk_point_candidates`
- `evidence_summary`
  - `offroad_judgement_basis`
  - `geometry_judgement_basis`
  - `route_variants_note`
  - `entry_exit_clarity_note`
  - `planning_line_risk_note`
- `review_hints`
  - `open_questions`
  - `missing_items`
  - `conflict_notes`
  - `recommended_review_priority`
- `review_gate`
  - `explicit_offroad_signal`
  - `drive_offroad_confirmed`
  - `detail_assessment_notes`
- `qa`
  - `status`
  - `issues`

## 3. Outputs

### 3.1 Run 级输出

每次 run 至少输出：

- `route_index.csv`
- `route_index.json`
- `run_manifest.json`
- `collection_log.md`
- `qa_summary.md`
- `qa_issues.json`
- `routes/<route_id>/...`

### 3.2 路线目录结构

每条 `routes/<route_id>/` 至少包含：

- `raw/`
  - 原始轨迹文件
  - 原始截图
  - 原始页面信息快照
  - 页面文字摘录
- `normalized/`
  - 归一化几何文件
  - 归一化元数据
- `draft/`
  - `route_draft.json`
  - `route_summary.md`
- `evidence/`
  - 关键证据截图
  - 关键文字摘录
- `qa/`
  - `qa_record.json`

### 3.3 `route_index.csv` 最少字段

- `route_id`
- `source_platform`
- `source_title`
- `region`
- `scene_type`
- `geometry_mode`
- `source_nature`
- `geometry_confidence`
- `review_priority`
- `has_exported_geometry`
- `has_keypoint_candidates`
- `has_prerequisite_candidates`
- `overall_status`

## 4. EntryPoints

- 正式入口：`PYTHONPATH=src python3 -m validation_foundry.modules.t02_route_coldstart.pipeline --manifest <manifest.json> --output-root <run_dir>`
- 当前不新增 repo root 级脚本

## 5. Params

### 5.1 关键参数类别

- 路径参数：
  - `manifest`
  - `output_root`
- 运行模式参数：
  - `strict`
  - `overwrite`
- 采集口径参数：
  - `selection_rule_version`
  - `platform_allowlist`

### 5.2 参数原则

- `strict=true` 时，任何不满足入池门槛的路线都直接 `FAIL`
- 默认不静默覆盖既有 run 目录
- 平台白名单当前只能是 `["2bulu", "liuzhijiao"]`

## 6. PASS / WARN / FAIL 语义

- `PASS`
  - 满足双重筛选门槛
  - 有几何证据
  - 有来源追溯
  - 有关键点候选
  - 有适用前提候选
  - 有 QA 记录
- `WARN`
  - 可进入人工审核池
  - 但缺少导出几何、关键点不足或置信度偏低
- `FAIL`
  - 不满足入池门槛
  - 或几何 / 证据 / 追溯缺失
  - 或被判断为混合标签徒步/登山路线

## 7. Acceptance

1. 每次 run 都必须产出完整的 run 级文件和逐路线目录
2. 只有 `PASS` / `WARN` 样本允许分别计入两步路和六只脚的 `10` 条目标
3. `FAIL` 必须可归因，且保留原始证据
4. 所有路线都必须能从草案追溯回原始证据
5. 产物结构必须为后续接入 `liuzhijiao` 预留 `adapter_id` 扩展位
