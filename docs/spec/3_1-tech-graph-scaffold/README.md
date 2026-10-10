# SPEC：3.1 · 技术图谱脚手架与可审草稿（tech-graph scaffold）

> **状态**：`signed` · **HG-SPEC-SIGNOFF=approved**（2026-10-10 维护者本窗签收 · 原文「签收，拆W1」）  
> **track**：`epic`  
> **拟发版**：`spec-wave@3.1.0`（**minor** · 消费者可观察新能力：接入后一键出可审草稿 + 保真/覆盖配套）  
> **基线**：`spec-wave@3.0.2` published  
> **规划**：[`../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）  
> **布局公约**：[`../doc-health/03_spec_layout_convention.md`](../doc-health/03_spec_layout_convention.md)

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **spec_slug** | `3_1-tech-graph-scaffold` |
| **test_strategy** | `required` |
| **test_strategy_note** | 脚手架命令须有可失败自动化测试（空仓/已有目录/无入口探测）；漂移闸与仓级词表各波负向 fixture 先行 |
| **freeze_id** | 不扩 `assets/graph/templates/` 业务占位内容；不改既有 `graph yaml compile\|export\|check` 默认语义；不开放自定义本体类 |
| **depends_on_spec** | `self-tech-graph`（YAML-first 三层与 dogfood）· `3_0-architecture-leap`（本体边界 ONTO-OPEN）· 3.0.2 延后项 F-2 / F-1② |
| **semantic_align** | 草稿 ≠ 签收真值；`HG-GRAPH-MODULES` 人签后方可挡 30 改码 |

---

## 人闸

| human_gate_id | status | blocks | 说明 |
|---------------|--------|--------|------|
| HG-SPEC-SIGNOFF | **approved** | 10-task / 拆波 | 2026-10-10 维护者本窗签收（原文「签收，拆W1」）· 20 审 R1 conditional_pass · A1–A5 已裁决回填 |
| HG-NEXT-PLAN | **approved** | 开实现波 | 同窗签收 · 开 W1 限制已解除 |

> 本表在 SPEC 档，属人工纪律；拆 task 时须复制进 task 文 `### 人工闸` 节才可机检。

---

## 一句话目标

业务仓接入 SpecWave（规范波）后，用**自动化脚手架**直接生成一份 `docs/_tech_graph/` **可审草稿**（顶层图 + 模块表 + ≥1 条主流程）；**人与 Agent 均可审核**；机检保真；模板包**暂不扩**业务占位。草稿经人签 `HG-GRAPH-MODULES` 后才成为挡改码真值。

## 读序

1. [`00_policy_and_boundaries.md`](./00_policy_and_boundaries.md) — 政策与边界  
2. [`01_problem_and_goals.md`](./01_problem_and_goals.md) — 问题与完成态  
3. [`02_product_scheme.md`](./02_product_scheme.md) — 三轨产品方案  
4. [`03_cli_and_review.md`](./03_cli_and_review.md) — 命令面与审核协议  
5. [`04_execution_waves.md`](./04_execution_waves.md) — 执行波次  
6. [`05_thinking_rounds.md`](./05_thinking_rounds.md) — 思考轮 R0–R5  

## 目录树

```text
docs/spec/3_1-tech-graph-scaffold/
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
| 2026-10-10 | draft · 10-spec · 据维护者会话「模板暂不扩 · 自动化出可审草稿 · 人/Agent 共审 · 三轨 · 接入后直接生成一份」落盘 SPEC + PLAN |
| 2026-10-10 | 20 审 R1 conditional_pass 后维护者裁决回填 A1–A5（见 02/03 与审查文附录） |
| 2026-10-10 | signed · HG-SPEC-SIGNOFF / HG-NEXT-PLAN=approved（维护者「签收，拆W1」）· 开拆 W1 task |
