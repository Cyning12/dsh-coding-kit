# SPEC：self-tech-graph · coding-kit 自身三层技术图谱 + 外置文档迁移评估

> **状态**：`draft`（待 20-spec-audit R1 + 人签）  
> **track**：`epic`  
> **拟发版**：不定版（图谱/docs 轨 · 若带 CLI 变更再钉）  
> **人闸**：`HG-SPEC-SIGNOFF` = **pending**（仅人）· `HG-GRAPH-MODULES` = pending（01_struct 模块表 · 30 前必签）  
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
| HG-SPEC-SIGNOFF | pending | 10-task/30 | 本 SPEC 人签（仅人） |
| HG-GRAPH-MODULES | pending | 30 | 01_struct 模块边界表落盘后签（模板协议既定） |

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
