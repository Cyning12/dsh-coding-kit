# 外置文档指针索引（self-tech-graph · reference）

> **状态**：`skeleton`（W0 占位 · W3 填充 approved 留外项）  
> **规则**：留外树不删工作区原文件；仓内链出用相对工作区路径或本表锚点。  
> **真值优先级**：DEF/债务 → `docs/releases/03_defects_debt_ledger.md`；产品 SPEC → 仓根 `SPEC.md`；图谱 → `docs/_tech_graph/`（W2 起）

---

## 树 A · `docs/dsh_coding_kit_optimization/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `00_inventory/` | `…/00_inventory/` | W3 原文迁 `reference/` | W1 按 1.9.0 src/ 重生 `01_struct` |
| `01_defects/` | `…/01_defects/` | 留外 | [`03_defects_debt_ledger.md`](../../../releases/03_defects_debt_ledger.md) |
| `02_compare_speckit/` ~ `04_decisions/` | `…/02_*` · `03_*` · `04_*` | 留外 + POINTER | （W3 填行） |
| `05_fix_plans/` · `06_epics/` | `…/05_*` · `06_*` | 留外 | 过程档 · done task / CHANGELOG |

## 树 B · `docs/dsh_coding_kit_init/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `spec/` | `…/spec/` | 留外 | 仓根 [`SPEC.md`](../../../../SPEC.md) |
| `tasks/` · `reviews/` · `invokes/` | `…/tasks/` 等 | 留外 | [`docs/tasks/`](../../../tasks/) · [`docs/harness/`](../../../harness/) |

## 树 C · `docs/tech_graph/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `SPEC/json_graph` · `query_graph` | `…/SPEC/json_graph` 等 | 留外 + POINTER | [`02_graph_scheme.md`](../02_graph_scheme.md) |
| 承接仓方案 | `…/tasks/` · `…/prompts/` 等 | 留外 | 非 kit 私域 |

---

## 锚点（W3 扩展）

<!-- W3: 在此追加具名锚点，如 #R07 #json_graph -->

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | W0 骨架：空表 + 占位说明（见 [`W0_inventory_diff_20260827.md`](./W0_inventory_diff_20260827.md)） |
