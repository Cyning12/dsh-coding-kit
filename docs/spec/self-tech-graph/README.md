# SPEC：self-tech-graph · coding-kit 自身三层技术图谱 + 外置文档迁移评估

> **状态**：`signed`（HG-SPEC-SIGNOFF=approved · 2026-08-27 · 00 代签）  
> **track**：`epic`  
> **拟发版**：**1.9.x**（建议 epic 收口钉 **1.9.1** · **禁止** 1.10+；W2/W3 不 bump，W4 CHANGELOG Docs 条）  
> **人闸**：`HG-SPEC-SIGNOFF` = **approved**（2026-08-27 · 00 代签）· `HG-GRAPH-MODULES` = **approved**（2026-08-28 · 00 代签 · 签收物 `docs/_tech_graph/01_struct.md`）  
> **关联**：仓根 `SPEC.md`（产品总 SPEC · 不动）· `docs/spec/doc-health/03_spec_layout_convention.md`（本夹依其 §1 落专属夹）  
> **外置盘点对象**：工作区 `docs/dsh_coding_kit_init/`（106 文件）· `docs/dsh_coding_kit_optimization/` · `docs/tech_graph/`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **spec_slug** | `self-tech-graph` |
| **test_strategy** | `required` |
| **test_strategy_note** | 图谱以 kit 自身 graph yaml compile/export/check 可失败执行为验收；迁移轨以死链 grep + 盘点覆盖率断言为准 |
| **freeze_id** | 不动 package.json#files 白名单（docs/ 本就不入 tarball）；不改 assets/graph/templates/ 既有模板语义 |
| **depends_on_spec** | docs/spec/doc-health/（signed · 布局公约与 observations 通道） |
| **semantic_align** | kit 自有 YAML-first 图谱工具链（v1.2.4 DEF-006 起 graph yaml compile/export/check） |

---

## 人闸

| human_gate_id | status | blocks | 说明 |
|---------------|--------|--------|------|
| HG-SPEC-SIGNOFF | approved | 10-task/30 | 2026-08-27 20-spec R1 零阻塞 · 00 依授权代签 |
| HG-GRAPH-MODULES | approved | 30（**W2 构图/改码**） | 2026-08-28 00 代签 · 签收物 [`docs/_tech_graph/01_struct.md`](../../_tech_graph/01_struct.md) · 17/17 src 实读 |

---

## 一句话目标

**kit 卖图谱能力却自身无图谱**：为 dsh-coding-kit 建 `docs/_tech_graph/` 三层技术图谱（L0 顶层流程 / L1 模块边界 / L2 关键子流程），全程用**自家工具链**编译校验（dogfood）；同时盘点工作区三棵外置文档树，给出「迁回 / 留外 + 指针 / 归档」判定并执行获批部分。

## 读序

1. `01_problem_and_goals.md` — 问题与完成态
2. `02_graph_scheme.md` — 三层图谱目标态与 dogfood 工具链
3. `03_external_docs_migration.md` — 外置文档盘点与迁移判定矩阵
4. `04_execution_waves.md` — 执行波次 W0–W4

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿（00 应维护者要求起草 · 源起：1.8.0 发版后复盘「能力外置不合理」） |
| 2026-08-27 | R1 审零阻塞 · HG-SPEC-SIGNOFF approved（reviews/spec_self_tech_graph_audit_R1_20260827.md） |
| 2026-08-28 | W1 开工：`self-tech-graph-w1-struct` · HG-GRAPH-MODULES 仍 pending（01_struct 后签） |
| 2026-08-28 | HG-GRAPH-MODULES approved（00 代签 · `docs/_tech_graph/01_struct.md` 17/17） |
| 2026-08-28 | W2 开工：`self-tech-graph-w2-yaml` · 拟发版钉 1.9.x |
| 2026-08-28 | W3 开工：`self-tech-graph-w3-ci-migrate` · 本波不 bump |
