# SPEC：3.2 · 图谱点路径（IB）· 可配置模块表 · indexes 闸

> **状态**：`signed` · **HG-SPEC-SIGNOFF=approved**（2026-10-10 维护者本窗签收 · 原文「签收，授权00签收后续文档」）· **HG-NEXT-PLAN=approved**（同窗）  
> **track**：`epic`  
> **拟发版**：`spec-wave@3.2.0`（**minor** · 消费者可观察新能力：节点 IB 存在性闸 + 模块表路径可配 + 可选 indexes 双向闸）  
> **基线**：`spec-wave@3.1.0`（3.1 epic IMPLEMENTED · publish 待人；本夹**不**回灌改写 3.1 W3 验收）  
> **规划**：[`../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）  
> **布局公约**：[`../doc-health/03_spec_layout_convention.md`](../doc-health/03_spec_layout_convention.md)  
> **反哺来源**：业务仓（kimi-code-meta）Inform 备忘 `BACKPORT_tech_graph_tools_to_specwave_v1_zh.md`（2026-10-10 · dogfood 缺口 · **勿**整包 `cp tools/tech_graph`）  
> **过程授权**：维护者授权 **00 签收后续过程文档**（本 epic 各波 `HG-TASK-DRAFT` / `HG-AUDIT-R1` · 须依据 lint PASS + 20-task-audit R1 PASS · **不**代签 `HG-RELEASE-*` / publish）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **spec_slug** | `3_2-graph-ib-and-indexes` |
| **test_strategy** | `required` |
| **test_strategy_note** | IB 存在性 / `struct_rel` / indexes 各波须有正负向 fixture；临时目录测，勿污染本仓 `docs/_tech_graph` dogfood；既有 `graph drift` / `graph yaml` / scaffold 零回归 |
| **freeze_id** | 不改 3.1 `graph drift` 缺省语义（仅边锚点 + 硬钉 `01_struct.md`）；不把 AST / issue-sync / 业务 completeness 阈值塞进 core 默认 `verify` |
| **depends_on_spec** | `3_1-tech-graph-scaffold`（drift MVP · `.spec-wave/graph-drift.yaml`）· `self-tech-graph`（YAML-first） |
| **semantic_align** | **边**（anchors）与 **点**（IB）分闸；无 IB 的仓零打扰；trilayer/indexes **opt-in** |

---

## 人闸

| human_gate_id | status | blocks | 说明 |
|---------------|--------|--------|------|
| HG-SPEC-SIGNOFF | **approved** | 10-task / 拆波 | 2026-10-10 维护者本窗签收（原文「签收，授权00签收后续文档」）· 维护者直签（免正式 20-spec-audit） |
| HG-NEXT-PLAN | **approved** | 开实现波 | 同窗签收 · 开 W1 限制已解除 |

> 本表在 SPEC 档，属人工纪律；拆 task 时须复制进 task 文 `### 人工闸` 节才可机检。

---

## 一句话目标

在 3.1「模块表 + **边**锚点漂移」之上，补齐消费仓 dogfood 已证实的保真缺口：扫描 **`nodes[].implementedBy.path` 存在性**、允许 **模块表相对路径可配**，并以 **opt-in** 提供 indexes ↔ IB 双向一致闸；手册钉死 drift / ib / indexes /（未来）ast 分工。不移植业务仓 Python 整包工具链。

## 读序

1. [`00_policy_and_boundaries.md`](./00_policy_and_boundaries.md) — 政策与边界  
2. [`01_problem_and_goals.md`](./01_problem_and_goals.md) — 问题与完成态  
3. [`02_product_scheme.md`](./02_product_scheme.md) — 产品方案（契约 · 命令面分责）  
4. [`03_cli_and_review.md`](./03_cli_and_review.md) — 命令面与失败路径  
5. [`04_execution_waves.md`](./04_execution_waves.md) — 执行波次  
6. [`05_thinking_rounds.md`](./05_thinking_rounds.md) — 思考轮 R0–R5  

## 目录树

```text
docs/spec/3_2-graph-ib-and-indexes/
├── README.md
├── 00_policy_and_boundaries.md
├── 01_problem_and_goals.md
├── 02_product_scheme.md
├── 03_cli_and_review.md
├── 04_execution_waves.md
└── 05_thinking_rounds.md
```

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec · 据 meta 反哺备忘 P0–P3 + 维护者「开 3.x Inform/SPEC」落盘 SPEC + PLAN |
| 2026-10-10 | signed · HG-SPEC-SIGNOFF / HG-NEXT-PLAN=approved（维护者「签收，授权00签收后续文档」）· 开拆 W1 task |
