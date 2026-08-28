# 外置文档指针索引（self-tech-graph · reference）

> **状态**：`filled`（W3 填充 approved 留外项）  
> **规则**：留外树不删工作区原文件；仓内链出用相对工作区路径或本表锚点。  
> **真值优先级**：DEF/债务 → `docs/releases/03_defects_debt_ledger.md`；产品 SPEC → 仓根 `SPEC.md`；图谱 → `docs/_tech_graph/`（W2 起）

---

## 树 A · `docs/dsh_coding_kit_optimization/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `00_inventory/` | `docs/dsh_coding_kit_optimization/00_inventory/` | W3 原文已迁 `reference/` | [`architecture_1.2.2.md`](./architecture_1.2.2.md) · [`cli_surface_1.2.2.md`](./cli_surface_1.2.2.md) · [`plugin_surface_1.2.2.md`](./plugin_surface_1.2.2.md) · [`assets_catalog_1.2.2.md`](./assets_catalog_1.2.2.md)；现行 L1 [`01_struct.md`](../../_tech_graph/01_struct.md) |
| `01_defects/` | `docs/dsh_coding_kit_optimization/01_defects/` | 留外 | [`03_defects_debt_ledger.md`](../../../releases/03_defects_debt_ledger.md) |
| `02_compare_speckit/` | `docs/dsh_coding_kit_optimization/02_compare_speckit/` | 留外 + POINTER | 治理叙事 · 非仓事实源 |
| `03_directions/` | `docs/dsh_coding_kit_optimization/03_directions/` | 留外 + POINTER | 治理叙事 · 非仓事实源 |
| `04_decisions/` | `docs/dsh_coding_kit_optimization/04_decisions/` | 留外 + POINTER | 治理叙事 · 非仓事实源 |
| `05_fix_plans/` · `06_epics/` | `docs/dsh_coding_kit_optimization/05_fix_plans/` · `docs/dsh_coding_kit_optimization/06_epics/` | 留外 | 过程档 · done task / CHANGELOG；PRD 见 [R07](#R07) |

## 树 B · `docs/dsh_coding_kit_init/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `spec/` | `docs/dsh_coding_kit_init/spec/` | 留外（**历史债**：SPEC 1.0→1.2.2 过程档） | 仓根 [`SPEC.md`](../../../../SPEC.md) 为现行；不迁 106 份 init 过程档 |
| `tasks/` · `reviews/` · `invokes/` | `docs/dsh_coding_kit_init/tasks/` 等 | 留外 | [`docs/tasks/`](../../../tasks/) · [`docs/harness/`](../../../harness/) |

## 树 C · `docs/tech_graph/`

| 子树 | 工作区路径 | 动作 | 仓内替代/指针 |
|------|------------|------|---------------|
| `SPEC/json_graph` | `docs/tech_graph/SPEC/json_graph/` | 留外 + POINTER | 跨仓方法论；kit 图谱方案见 [`02_graph_scheme.md`](../02_graph_scheme.md) |
| `SPEC/query_graph` | `docs/tech_graph/SPEC/query_graph/` | 留外 + POINTER | 跨仓方法论；kit 图谱方案见 [`02_graph_scheme.md`](../02_graph_scheme.md) |
| 承接仓方案 | `docs/tech_graph/spec/` · `docs/tech_graph/tasks/` · `docs/tech_graph/prompts/` 等 | 留外 | 非 kit 私域 |

---

## 锚点

<a id="R07"></a>

## R07

消费者仓 IDE marker 块旧命令字面自动刷写（已交付 1.5.0 `refresh-ide-blocks`）。

- **PRD 留外**：工作区 `docs/dsh_coding_kit_optimization/06_epics/PRD_R07_ide_block_rewrite.md`
- **仓内实现**：`src/cli-refresh-ide-blocks.ts` · `test/cli-refresh-ide-blocks.test.ts`（头注释链本锚）

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | W0 骨架：空表 + 占位说明（见 [`W0_inventory_diff_20260827.md`](./W0_inventory_diff_20260827.md)） |
| 2026-08-28 | W3 filled：02/03/04 路径 · 树 B spec 历史债 · 树 C json_graph/query_graph · #R07 |
