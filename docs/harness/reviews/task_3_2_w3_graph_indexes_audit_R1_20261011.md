# 审查 · 20-task-audit R1 · 3-2-w3-graph-indexes

> **日期**：2026-10-11 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_2_w3_graph_indexes.md`](../../tasks/done/task_3_2_w3_graph_indexes.md)  
> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W3](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) · [`02` §4](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) · [`03` §1.3](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) · [`03` §3](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) failure_paths（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W3 · indexes**（HG-NEXT-PLAN=approved）  
> **防回灌对照**：3.1 / 3.2 W1–W2 · **不**把 indexes 绑进默认 `verify` · **不**硬编码消费仓七域 · **不**改 IB / `struct_rel` / drift 缺省  
> **方式**：只读对照 SPEC/PLAN/task · 抽核 R0（`cli-graph.ts` help/分发无 `indexes` · 已有 `ib`/`drift`/`vocab`）· `task lint` → PASS · **未改** task 实质 / 闸表 / `src/` / `test/` / `bin/` · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 → **pending**（真值在 task 表 · 本棒不改）· **禁 30** |
| **opt-in / 不进 verify** | **可测锁**（A2 + A8 + failure「进默认 verify」禁止 + 非范围） |
| **配置化 · 禁七域** | **可验收**（范围钉 `.spec-wave/graph-indexes.yaml` + globs · 非范围钉 AST/七域硬编码） |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 机械闸

| 项 | 结果 |
|----|------|
| `node bin/specgate.js task lint --file docs/tasks/active/task_3_2_w3_graph_indexes.md` | **PASS** |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W3（`graph indexes check` · 配置化 glob/域 · 双向一致 + `--json` · 未配置测锁 · **不**进默认 verify · 四门/闸/gate-check）+ PLAN W3 + `02` §4 + `03` §1.3；未扩 W4 文档 / W5 bump / IB 返工 / `struct_rel` | ✅ |
| 2 | **双向语义**：`02` §4「IB ⊆ index **且** index ⊆ IB 规范集」↔ task「IB ⊆ IX 且 IX ⊆ IB」（归一化键 `path`+可选 `symbol`）· A3–A5 正负向 | ✅ |
| 3 | **配置落点**：候选 `.spec-wave/graph-indexes.yaml` 已由本波钉死；`flow_globs` / `index_globs`；禁七域硬编码（非范围 + residual） | ✅ |
| 4 | **未配置行为**：SPEC 允许 exit 1 usage **或** exit 2「未配置」；task 推荐 exit 1 +「钉一种并测」· A2/failure 覆盖（见 **N1**） | ✅ |
| 5 | **非范围** vs SPEC/PLAN：`--write` · AST · 七域硬编码 · 默认绑 verify/CI 硬门禁 · struct_rel/IB 返工 · bump/publish | ✅ |
| 6 | **验收 A1–A10**：help / 未配置 / 双向绿 / IB 多 / IX 多 / 坏配置 / `--json`+零回归 / verify 不强制 / 四门 / 关账（A10 close 留 00）均可机检 | ✅ |
| 7 | **failure_paths**：闸序拒开工 · 无配置 · schema 坏 exit 2 · 单向漂移点名 · 双向绿 · 禁进默认 verify；对齐 `03` §1.3 / §3 | ✅ |
| 8 | **行为变更（K7）旧测影响面**：additive 新子命令 · A7「既有命令零回归」+ A8 verify 不绑 · 充分（未另立 grep 名单标题 → 见 **N5**） | ✅ |
| 9 | **test_strategy=required** · 未配置行为锁 · 双向各一负向 · 绿向 · 临时 fixture · 不进 verify | ✅ |
| 10 | **R0 抽核**（2026-10-11）：`cli-graph.ts` help 含 `ib`/`drift`/`vocab` · **无** `indexes`；分发无 `indexes` 分支；`cli-graph-ib.ts` 可作 IB 收集参考；`.spec-wave/` 已有 drift/vocab 族 | ✅ |
| 11 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 **pending**（本棒不改） | ✅ |
| 12 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · `close_pr_policy=exempt` · lint **PASS** | ✅ |
| 13 | 思考轮 R0–R5 + 控制表闭合 · residual_risks 两条具体（index YAML 方言 · glob `**`） | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（无 indexes 命令 · IB 收集参考 · `.spec-wave/` 配置族；抽核一致） |
| R1 范围 | **充分**（仅 W3 indexes 双向 MVP · 排除 AST/write/verify 绑入 / W4–W5 / bump） |
| R2 方案 | **充分**（新模块 `cli-graph-indexes.ts` + graph-indexes.yaml · 集合相等） |
| R3 边界 | **充分**（未配置不进 verify · 禁七域 · 只读） |
| R4 可测 | **充分**（A1–A10 fixture · 四门+close） |
| R5 就绪 | **充分**（待本审 + **00 按授权**签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | 未配置 exit 仍双选项（推荐 exit 1）；SPEC/`03` 允许波钉一种 | 30 **必须**钉死一种并测锁（推荐 exit 1 usage），勿两态并存 |
| **N2** | index YAML 条目形态 MVP 未钉死（task 写「30 钉一种」） | 与 residual ① 一致；文档化唯一形态（如 `entries: [{path,symbol?}]`）并负向拒其它方言 |
| **N3** | `flow_globs` 示意含 `**/…` · 是否支持 `**` 待测 | residual ②；fixture 正负向各锁一层 |
| **N4** | SPEC「域列表 / glob」· task 仅 globs | 可接受：域由 glob 表达即可；勿另开硬编码域名表 |
| **N5** | K7 未独立「旧测 grep 名单」标题 | 30 开工前列影响面（至少 `test/graph-ib*` / `test/graph-drift*` / verify 相关）写入自检 |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 · 继承 |
| HG-NEXT-PLAN | approved | epic · 继承 |
| HG-TASK-DRAFT | **pending** | 待 00 签（本棒不改） |
| HG-AUDIT-R1 | **pending** | 待 00 签 · **禁 30**（本棒不改） |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸仍 pending**：维护者 / **00 按 epic 授权**签 task 表后才可下发 30；**本审不附 30 可复制 Prompt**。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（PASS · blocking 0 · N1–N5 非阻塞 · opt-in / 禁七域 / 双向语义可测锁）
- [ ] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-11 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_2_w3_graph_indexes_audit_R1_20261011.md`
