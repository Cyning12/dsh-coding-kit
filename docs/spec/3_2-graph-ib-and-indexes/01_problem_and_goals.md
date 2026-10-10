# 01 · 问题与目标

> **状态**：`draft` · 隶属 `3_2-graph-ib-and-indexes`

---

## 1. 问题陈述

3.1 已交付 `graph scaffold` / `graph drift`（模块表覆盖 + **`edges[].anchors[].path`** 存在性）。业务仓 trilayer dogfood（2026-10-10）证实：

| # | 痛点 | 后果 |
|---|------|------|
| P1 | **点 vs 边**：只改 `nodes[].implementedBy.path` 指向不存在文件时，`graph drift` 仍 PASS | 保真闸静默漏检；消费仓须自备 `ast_sync_check` A1 切片才能红 |
| P2 | **模块表硬钉** `docs/_tech_graph/01_struct.md` | trilayer 真值在 `l1/01_modules.md` 等路径时 → `struct_unparseable` / 对齐债 |
| P3 | **indexes ↔ IB** 无产品闸 | IB 与倒排表漂移是 trilayer 主风险；仅能靠本地 `gl2_indexes_sync` |
| P4 | **双栈重叠** | meta Python `graph yaml` 与 SpecWave TS CLI 同源意图双实现，长期分叉风险 |
| P5 | **深度 AST** 与 **关账同步** 绑业务流程 | 不宜进 SpecWave core 默认路径（见非范围） |

本 SPEC **收窄**反哺范围：采纳备忘 **P0–P3** 的通用语义；**明确不**把 P4 AST、issue-sync、业务 completeness 阈值产品化进本版。

## 2. 完成态行为（消费者可观察）

接入 SpecWave ≥3.2 的业务仓在维护者启用相应命令后：

1. **点路径**：`npx spec-wave graph ib check`（名称以实现波钉死 · 见 03）可扫描 `--input` 下 `*.graph.yaml` 的 `nodes[].implementedBy.path`；空/`TBD` 跳过；文件相对 `--target` 不存在 → **exit 2** · 差异可 `--json`。  
2. **零打扰**：YAML 无任何 IB 字段的仓跑该命令 → **exit 0**（checked=0）。  
3. **可配置模块表**：`.spec-wave/graph-drift.yaml`（或同族键）可选 `struct_rel`；缺省仍为 `01_struct.md`，与 3.1.0 **完全一致**；指向合法含「路径 glob」的模块表时 `graph drift` 按新路径解析。  
4. **indexes（opt-in）**：`graph indexes check`（名钉见 03）在配置给定 flow/index glob 协议后，检查 IB ⊆ index 且 index ⊆ 由 IB 生成的规范集；未配置则 **用法提示或不跑**（不进默认 CI 样例硬门）。  
5. **文档**：手册写清 drift / ib / indexes 分工；提供从消费仓 Python yaml 工具切到 `npx spec-wave graph yaml …` 的迁移指引（P3 · 文档波）。  
6. **既有命令**：`graph drift` / `graph yaml *` / `graph scaffold` 缺省 stdout/exit 语义不变。

## 3. 成功判据（产品级）

| 角色 | 成功长什么样 |
|------|----------------|
| trilayer 消费仓维护者 | 可不靠本地 A1 切片检出「假 IB path」；可把模块表放到分层路径 |
| 普通单层仓维护者 | 不配 IB / indexes → 无新红、无新强制步骤 |
| 审查人 / CI | 边闸与点闸可分步接线；indexes 显式 opt-in |
| kit 维护者 | 无 Python 整包进仓；无 AST peer 强迫进 core |

## 4. 非目标（再强调）

- 不做 AST symbol / call 证明。  
- 不做 issue / 产品 diff 关账。  
- 不强制所有仓写 `implementedBy`。  
- 不自动重画图谱。  
- 不修改 3.1 已签收 W3 验收叙事为「本就含 IB」。  

## 5. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
