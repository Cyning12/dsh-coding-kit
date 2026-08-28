# 01 · 问题与目标（self-tech-graph）

> **状态**：`draft` · 隶属 `self-tech-graph`

---

## 1. 问题陈述

**W0–W4 前**：dsh-coding-kit 向消费仓提供完整图谱能力（`assets/graph/templates/` 复制到 `docs/_tech_graph/` · YAML-first 编译/export/check · HG-GRAPH-MODULES 人签协议），但 **当时 kit 仓没有 `docs/_tech_graph/`**——其架构真值外置在工作区：

| 外置树 | 内容 | 锚定版本 | 问题（当时） |
|--------|------|----------|------|
| `docs/dsh_coding_kit_optimization/00_inventory/` | architecture.md / cli_surface.md / plugin_surface.md / assets_catalog.md —— **实质是 kit 的架构文档** | 1.2.2 | 已滞后 6 个版本（当前 1.9.0）；仓外不可被仓内 CI 校验；进仓 Agent 不可见 |
| `docs/dsh_coding_kit_init/`（106 文件） | 1.0–1.2.2 的 tasks/spec/invokes/reviews 过程树 | 历史 | 过程档价值真实但与仓内 `docs/tasks/` `docs/harness/` 双轨割裂 |
| `docs/tech_graph/` | graph 专题 SPEC（json_graph/query_graph）+ 承接仓方案 + tasks/prompts/invokes | 跨仓 | 多为跨仓方法论，非 kit 私有；json_graph 等规约与 kit graph 面直接相关 |

**当时不合理点**：能力提供方自身不 dogfood → ① 模板与工具链的真实使用体验无自证；② 仓内无单一架构事实源，00/30 进仓须跨工作区考古；③ 外置文档随版本漂移无校验闸。

**当前事实**：仓内已有 [`docs/_tech_graph/`](../../_tech_graph/)（W1–W3 落地）；下文完成态 1–3 已兑现。

## 2. 完成态行为

1. ✅ **已落地**：kit 仓 [`docs/_tech_graph/`](../../_tech_graph/) 三层齐备：[`00_main`](../../_tech_graph/00_main.md)（L0）· [`01_struct`](../../_tech_graph/01_struct.md)（L1 · 人签）· L2 四条 [`10_flow_task_close`](../../_tech_graph/10_flow_task_close.md) / [`10_flow_verify`](../../_tech_graph/10_flow_verify.md) / [`10_flow_upgrade`](../../_tech_graph/10_flow_upgrade.md) / [`10_flow_graph_yaml_pipeline`](../../_tech_graph/10_flow_graph_yaml_pipeline.md) · [`02_version`](../../_tech_graph/02_version.md)。
2. ✅ **已落地**：唯一编辑源为 `.graph.yaml`，`.md` 由 **kit 自身** `graph yaml compile` 生成；`export` + `check` 仓内可跑；CI [`.github/workflows/tech-graph.yml`](../../../.github/workflows/tech-graph.yml)。
3. ✅ **已落地**：外置三树盘点与判定见 [`reference/POINTERS.md`](./reference/POINTERS.md)（迁回 [`reference/`](./reference/) · 留外 + POINTER · 归档），获批项已执行。
4. 全程不扩 `package.json#files`；不改 `assets/graph/templates/` 语义。

## 3. 非目标

- 不为图谱新增 CLI 能力（本 SPEC **消费**现有 graph 面；发现的工具缺陷另开 task）
- 不重构工作区其它业务仓的图谱
- 不搬迁 `docs/tech_graph/` 中面向承接仓的方案档（跨仓 · 默认留外）

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿 |
| 2026-08-28 | W4：问题陈述改为过去时；完成态 1–3 标已落地并链 `_tech_graph/` · `tech-graph.yml` · POINTERS |
