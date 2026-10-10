# 规划 · 3.2.0 · 图谱点路径（IB）· struct_rel · indexes

> **状态**：`approved` · **HG-NEXT-PLAN=approved**（2026-10-10 维护者本窗签收 · 原文「签收，授权00签收后续文档」）  
> **目标发版**：`spec-wave@3.2.0`（**minor** · 消费者可观察新能力）  
> **基线**：`spec-wave@3.1.0`（epic IMPLEMENTED · publish 待人；本 PLAN **不**回灌 3.1 W3 验收）  
> **配套 SPEC**：[`../spec/3_2-graph-ib-and-indexes/`](../spec/3_2-graph-ib-and-indexes/README.md)（**HG-SPEC-SIGNOFF=approved** · 同窗）  
> **格式模板**：[`PLAN_3_1_tech_graph_scaffold_v1_zh.md`](./PLAN_3_1_tech_graph_scaffold_v1_zh.md)（结构骨架沿用）  
> **反哺来源**：kimi-code-meta · `BACKPORT_tech_graph_tools_to_specwave_v1_zh.md`（2026-10-10）  
> **起草日期**：2026-10-10

---

## 一句话

在 3.1「模块表 + **边**锚点漂移」之上，补 **点** `implementedBy.path` 存在性闸、允许模块表 `struct_rel` 可配，并提供 **opt-in** indexes 双向闸与 yaml 双栈迁移文档；不整包移植消费仓 `tools/tech_graph`，不做 AST / issue-sync。

---

## 范围来源校核

| # | 项 | 级别 | 出处 | 入 3.2 结论 |
|---|----|------|------|-------------|
| 1 | IB path 存在性（点闸） | 高 | 反哺 P0 · dogfood 假 path drift 仍 PASS | ✅ **W1** |
| 2 | 可选 `nodes[].implementedBy` 契约 | 高 | 现行 YamlNode 无 IB · 为 P0 前置 | ✅ **W1** |
| 3 | `struct_rel` 可配置模块表路径 | 高 | 反哺 P1 · trilayer 硬钉痛 | ✅ **W2** |
| 4 | indexes 双向一致（配置化） | 中 | 反哺 P2 | ✅ **W3** opt-in |
| 5 | yaml 双栈迁移文档 | 中 | 反哺 P3 | ✅ **W4** 文档 |
| 6 | AST symbol / 有界 call | — | 反哺 P4 | ❌ **另 Epic** |
| 7 | issue-sync / 产品 diff 关账 | — | 反哺 §6 | ❌ 留消费仓 |
| 8 | completeness 业务阈值 / 七域硬编码 | — | 反哺 §6 | ❌ 禁止进产品 |
| 9 | 整包 cp `tools/tech_graph` | — | 反哺原则 | ❌ 禁止 |
| 10 | 改 3.1 `graph drift` 缺省语义为含 IB | — | 兼容纪律 | ❌ 禁止（旗标备选除外且非缺省） |
| 11 | 自动重画图谱 / 自动人签 | — | 闸纪律 | ❌ 禁止 |

---

## 波次总表

| Wave | 主题 | 内容 | 级别 |
|------|------|------|------|
| **W0** | 签收 | SPEC/PLAN 审签 · 拆 task | 文档 |
| **W1** | **IB + ib check** | 可选节点契约 · 点路径存在性 · `--json` | 核心 |
| **W2** | **struct_rel** | `graph-drift.yaml` 可配模块表相对路径 | 配置 |
| **W3** | **indexes check** | 双向一致 · 配置化 glob · 不进默认 verify | opt-in |
| **W4** | 迁移 + 分责文档 | MIGRATION / 手册 · 可选 CI 样例注释 | DX |
| **W5** | 收尾发版 | CHANGELOG · ACCEPTANCE · bump 3.2.0 | release |

**编排理由**：先堵最高杠杆漏检（点）→ 解锁分层模块表 → 再上 trilayer indexes → 文档收敛 → 发版。每波独立 task、独立提交、四门绿、禁 `git add -A`。

---

## W1 · IB 契约 + 点闸（细节钉）

- **命令（推荐）**：`graph ib check [--target] [--input] [--json]`  
- **备选**：`graph drift --check-ib`（非缺省；若采用须专节文档）  
- **字段**：`nodes[].implementedBy.path`（必检存在性）· `symbol` 透传不检  
- **跳过**：无 IB · path 空 · `TBD`  
- **红**：缺文件 · exit 2 · `missing_ib_path`  
- **绿**：含 checked=0  
- **验收**：正负向 fixture + 无 IB 零打扰 + 既有测试零回归  

## W2 · struct_rel

- 键：`.spec-wave/graph-drift.yaml` → `struct_rel`  
- 缺省：`01_struct.md`（= 3.1.0）  
- 坏路径 / 不可解析：fail-closed exit 2  

## W3 · indexes

- `graph indexes check`  
- 配置化；禁七域硬编码  
- 双向 ⊆；未配置不进 verify  

## W4 · 文档

- 保真分责表；Python → SpecWave yaml 迁移指引  
- 可选 sample workflow 注释 `graph ib check`  

## W5 · release

- bump `3.2.0` · pins · CHANGELOG · ACCEPTANCE · 索引行状态  
- tag/push/publish 按当次授权（publish 默认仅人）  

---

## 非范围（明确不做）

| 项 | 说明 |
|----|------|
| AST 深闸 | 另 Epic |
| issue-sync / task 关账链 | 消费仓方言 |
| 业务 completeness 阈值 | 消费仓 |
| 整包 Python 工具 | 反哺原则 |
| 改 3.1 drift 缺省含 IB | 兼容 |
| schema breaking（若不可避免） | STOP · 另裁 major |
| 图谱 UI / 自定义本体开放 | 沿用既有边界 |

---

## 硬约束

1. S2 过程域永不覆写。  
2. 禁止新增 `--force` / `--allow-*` 绕过。  
3. 不改 3.1 `graph drift` / `graph yaml *` **缺省**判定语义。  
4. 新闸默认**不**绑进 `verify`。  
5. 修严/新闸配负向 fixture。  
6. 闸须落 task `### 人工闸` 才可机检。  
7. 本 PLAN 为意图钉；实现前 10-task 回源复核。  

---

## 人工闸

| human_gate_id | status | blocks |
|---------------|--------|--------|
| HG-NEXT-PLAN | **approved**（2026-10-10 维护者 · 「签收，授权00签收后续文档」） | 开 W1 实现 |
| HG-SPEC-SIGNOFF | **approved**（同窗 · 见 SPEC README） | 拆波 task |

**过程授权**：维护者授权本 epic 由 **00 签收后续过程文档**（各波 `HG-TASK-DRAFT` / `HG-AUDIT-R1` · 依据 lint + 20-task-audit R1）；release/publish 仍仅人。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 与 SPEC `3_2-graph-ib-and-indexes` 同棒落盘 |
| 2026-10-10 | HG-NEXT-PLAN / HG-SPEC-SIGNOFF=approved · 开拆 W1 · 授权 00 签过程文档 |
| 2026-10-10 | **W1 task 落盘** `task_3_2_w1_graph_ib_check` · HG-TASK-DRAFT/HG-AUDIT-R1 pending · 待 20 审 |
| 2026-10-10 | **W1 00 验收关账** · `a78ac3c` · graph ib check · W2–W5 未开 |
| 2026-10-11 | 维护者授权 00 统筹 W2–W5 · 适时 commit · 最后一起 PR |
| 2026-10-11 | **W2 00 验收关账** · `3df6518` · struct_rel · W3–W5 未开 |
