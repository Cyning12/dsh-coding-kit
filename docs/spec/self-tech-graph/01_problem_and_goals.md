# 01 · 问题与目标（self-tech-graph）

> **状态**：`draft` · 隶属 `self-tech-graph`

---

## 1. 问题陈述

dsh-coding-kit 向消费仓提供完整图谱能力（`assets/graph/templates/` 复制到 `docs/_tech_graph/` · YAML-first 编译/export/check · HG-GRAPH-MODULES 人签协议），但 **kit 仓自身没有 `docs/_tech_graph/`**——其架构真值外置在工作区：

| 外置树 | 内容 | 锚定版本 | 问题 |
|--------|------|----------|------|
| `docs/dsh_coding_kit_optimization/00_inventory/` | architecture.md / cli_surface.md / plugin_surface.md / assets_catalog.md —— **实质是 kit 的架构文档** | 1.2.2 | 已滞后 6 个版本（当前 1.8.0）；仓外不可被仓内 CI 校验；进仓 Agent 不可见 |
| `docs/dsh_coding_kit_init/`（106 文件） | 1.0–1.2.2 的 tasks/spec/invokes/reviews 过程树 | 历史 | 过程档价值真实但与仓内 `docs/tasks/` `docs/harness/` 双轨割裂 |
| `docs/tech_graph/` | graph 专题 SPEC（json_graph/query_graph）+ 承接仓方案 + tasks/prompts/invokes | 跨仓 | 多为跨仓方法论，非 kit 私有；json_graph 等规约与 kit graph 面直接相关 |

**不合理点**：能力提供方自身不 dogfood → ① 模板与工具链的真实使用体验无自证；② 仓内无单一架构事实源，00/30 进仓须跨工作区考古；③ 外置文档随版本漂移无校验闸。

## 2. 完成态行为

1. kit 仓 `docs/_tech_graph/` 存在且三层齐备：`00_main`（L0 顶层）· `01_struct`（L1 模块边界 · 人签）· `10_flow_*`（L2 关键子流程）· `02_version`（版本时间线 · 可后补）。
2. 图谱唯一编辑源为 `.graph.yaml`，`.md` 由 **kit 自身** `graph yaml compile` 生成；`export` + `check` 仓内可跑、入 CI。
3. 外置三树完成盘点与判定（迁回 / 留外+POINTER / 归档），获批项执行完毕且无死链。
4. 全程不扩 `package.json#files`；不改 `assets/graph/templates/` 语义。

## 3. 非目标

- 不为图谱新增 CLI 能力（本 SPEC **消费**现有 graph 面；发现的工具缺陷另开 task）
- 不重构工作区其它业务仓的图谱
- 不搬迁 `docs/tech_graph/` 中面向承接仓的方案档（跨仓 · 默认留外）

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿 |
