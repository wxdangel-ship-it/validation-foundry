# 仓库级执行规则

- 主入口：先读 `docs/doc-governance/README.md`；需要理解结构时，再读 `docs/repository-metadata/README.md`。
- 源事实优先级：项目级以 `SPEC.md`、`docs/PROJECT_BRIEF.md`、`docs/architecture/*`、`docs/project-management/phase-gates.md` 为准；模块级以 `modules/<module>/architecture/*` 与 `INTERFACE_CONTRACT.md` 为准。
- `AGENTS.md` 只放 durable guidance；标准可复用流程统一放 repo root `.agents/skills/<skill-name>/SKILL.md`；模块根目录不放 `SKILL.md`。
- 路径约定：若输入是 Windows 路径，先转换为 WSL 路径后再执行；当前工作仓默认 `E:\Work\validation-foundry -> /mnt/e/Work/validation-foundry`，参考仓默认 `E:\Work\RCSD_Topo_Poc -> /mnt/e/Work/RCSD_Topo_Poc`。
- 当前正式业务模块只有 `t01_pickup_point_validation`；不得并行扩写其他业务模块。
- Phase 顺序固定：`Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6`。未过 gate 不进入下一阶段。
- 结果约束：禁止伪造坐标；禁止 silent failure；坐标不可信时必须输出 `FAIL` 或 `BLOCKED`，并附 `reason` 与 `evidence_dir`。
- 登录约束：不要求用户手工登录，不依赖长期驻场协助；滴滴不可行时可切到高德备选链路。
- 协作约束：长期记忆必须写回仓库文档；子线程完成后必须更新指定 writeback 文件；不允许多个线程同时无约束改同一批关键文件。
- 输出约定：运行产物写入 `outputs/_work/`；冻结基线写入 `outputs/_freeze/`；临时实验写入 `outputs/_tmp/`。
- 入口治理：默认禁止新增新的执行入口脚本；新增入口前必须在 `docs/repository-metadata/entrypoint-registry.md` 登记。
- 文件体量：单个源码或脚本文件超过 `100 KB` 视为结构债；如必须修改，先写拆分说明。
- 当前轮次边界：本轮先完成项目初始化、治理骨架、T01 文档面、阶段 gate 与子线程拆解，不直接进入批量执行。
