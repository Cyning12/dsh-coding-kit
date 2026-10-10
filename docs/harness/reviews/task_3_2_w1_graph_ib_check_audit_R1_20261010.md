# 审查 · 20-task-audit R1 · 3-2-w1-graph-ib-check

> **日期**：2026-10-10 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_2_w1_graph_ib_check.md`](../../tasks/done/task_3_2_w1_graph_ib_check.md)  
> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W1](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) · [`02` §2](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) · [`03` §1.1](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) · [`00` 非范围](../../spec/3_2-graph-ib-and-indexes/00_policy_and_boundaries.md)（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W1 · IB + ib check**（HG-NEXT-PLAN=approved）  
> **防回灌对照**：3.1 W3 `graph drift` 缺省（边锚点 + 模块表 · **不含** IB）· 本波**禁止**把 IB 并入 drift 缺省  
> **10 invoke**：[`invoke_20261010_10_3-2-w1-graph-ib-check.md`](../invokes/by-task/3-2-w1-graph-ib-check/invoke_20261010_10_3-2-w1-graph-ib-check.md)  
> **方式**：只读对照 SPEC/PLAN/task · 抽核 R0 行号（`YamlNode` / `collectAnchorPaths` / `cli-graph` help·分发 / `printJson`）· `task lint` → PASS · **未改** task 实质 / 闸表 / `src/` / `test/` / `bin/` · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 → **approved**（2026-10-10 **00** 按授权后签 · 见 §签收）· **可 30** |
| **无 IB 零打扰** | **可测锁**（A4 + failure_paths + `test_strategy_note`） |
| **3.1 drift 缺省防回灌** | **可验收**（非范围钉死 · A5/A8 · residual 明示） |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 机械闸

| 项 | 结果 |
|----|------|
| `node bin/specgate.js task lint --file docs/tasks/active/task_3_2_w1_graph_ib_check.md` | **PASS** |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W1（可选 IB 契约 · `graph ib check` / 备选旗标 · MVP path 存在性 · `--json` 只增 · 红测三态 · 点/边文档 · 四门/闸/gate-check · 禁 bump）+ PLAN W1 + `02` §2 + `03` §1.1；未扩 W2 `struct_rel` / W3 indexes / W4–W5 | ✅ |
| 2 | **防 3.1 drift 回灌**：非范围明示「把 IB 并入 `graph drift` **缺省**」禁止；必做⑤钉不改 `drift`/`yaml`/`scaffold`/`axioms`/`ontology` 默认 stdout/exit；R2/R3 重申；验收无「缺省 drift 含 IB」条款 | ✅ |
| 3 | **必做/可选拆分**：O1/`A-opt1` 旗标方案不挡关账；与 SPEC `02` §2.2 / `03` §1.1 备选一致；独立子命令已满足时 A-opt1=N/A | ✅ |
| 4 | **非范围** vs SPEC `00` §3：AST · issue-sync/completeness · indexes · struct_rel · 自动重画 · 代签 HG · bump/publish/`git add -A` · 污染 dogfood · SCHEMA 破坏性 bump（STOP） | ✅ |
| 5 | **验收 A1–A10 + A-opt1**：命令面可发现 / 假 path exit 2 / 真 path 绿 / **无 IB 零打扰** / TBD·空跳过 / `printJson` / 只读 / 契约兼容+旧测零回归 / 四门 / 关账；均可机检 | ✅ |
| 6 | **failure_paths**：闸序拒开工 · `missing_ib_path` exit 2 · 无 IB/全 TBD exit 0 · `--json`+红 · IB 形状非法 fail-closed · 非 git · 禁写盘 · 禁改 drift 缺省 · 禁 W2+/bump · 裹挟 · 四门红；对齐 `03` §3 | ✅ |
| 7 | **无 IB 零打扰可测锁**：A4 硬条款 + failure「无 IB / 全 TBD → exit 0」+ `test_strategy_note` 覆盖；与 SPEC `00` §5 / `02` §2.1「缺 IB 合法」一致 | ✅ |
| 8 | **行为变更（K7）旧测影响面**：本波 **additive** 新子命令/可选字段；A5/A8/`test_strategy_note` 钉既有 drift/yaml/scaffold 零回归 · 充分（未另立 grep 名单标题 → 见 **N3**） | ✅ |
| 9 | **test_strategy=required** · 红测先行 · 临时 fixture · 勿污染本仓 dogfood | ✅ |
| 10 | **R0 行号抽核**（2026-10-10）：`cli-graph-yaml.ts:28` `YamlNode` 无 IB · `:262-277` 节点校验 id/label/kind（task 写 264-276 · 同段）；`cli-graph-drift.ts:12` `GRAPH_DRIFT_CONFIG_REL` · `:217`/`239-244` `collectAnchorPaths` 仅边锚点；`cli-graph.ts:51` help 有 drift · `:67` 分发 drift · **无** `ib`；`cli-shared.ts:481` `printJson` | ✅ |
| 11 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 **pending**（本棒不改） | ✅ |
| 12 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · lint **PASS** | ✅ |
| 13 | 思考轮 R0–R5 + 控制表闭合 · residual_risks 三条具体（误强制写 IB · 子命令 vs 旗标 · compile 透传） | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（YamlNode 无 IB · drift 只扫边 · 无 ib 命令 · printJson · SPEC/PLAN 钉点；抽核一致） |
| R1 范围 | **充分**（仅 W1 点闸 · 排除 struct_rel / indexes / AST / bump / 改 drift 缺省） |
| R2 方案 | **充分**（契约扩展 + 独立子命令推荐 · 旗标 O1 备选 · 缺省不改 drift） |
| R3 边界 | **充分**（只读 · 零打扰 · 无 AST · 不代签 · 不进默认 verify） |
| R4 可测 | **充分**（A1–A10 机检 · A-opt 可选 · 红测先行 · 含无 IB 零打扰） |
| R5 就绪 | **充分**（待本审 + **00 按授权**签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | SPEC `02` §2.1：`TBD` **大小写不敏感**；task A5 字面写 `TBD` | 30 测锁大小写变体（如 `tbd`）与 SPEC 同态跳过 |
| **N2** | residual_risks ③：compile/export 是否透传 IB 进 graph.json | 30 钉一种策略并测；禁止静默丢字段或无说明严拒 |
| **N3** | K7 未独立「旧测 grep 名单」标题 | 30 开工前列影响面（至少 `test/*graph*` · drift/yaml/scaffold 相关）写入自检 |
| **N4** | R0 节点校验行号 task 写 `264-276`，实读 forEach 段为 `262-277` | 实现前 30 复核现值（task 已声明行号为起草快照） |
| **N5** | O1 旗标 vs 独立子命令 | 优先独立 `graph ib check`；若采旗标须 A1/`A-opt1` 文档专节齐备 |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表 · 本棒不改）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 2026-10-10 · 继承 |
| HG-NEXT-PLAN | approved | epic · 同窗 · 继承 |
| HG-TASK-DRAFT | **approved** | 2026-10-10 **00** 按授权签（维护者「签收，授权00签收后续文档」） |
| HG-AUDIT-R1 | **approved** | 同窗 · **可 30** |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸（后签）**：2026-10-10 **00** 已将 task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved** · **可 30**。

---

## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（PASS · blocking 0 · N1–N5 非阻塞 · 无 IB 零打扰可测锁 · 3.1 drift 缺省防回灌可验收）
- [x] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（**00** · 2026-10-10 · 授权签收过程文档）
- [x] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（**00** · 同窗）
- [x] commit task 文档或确认已签（随本波文档提交）
- [x] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-10 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_2_w1_graph_ib_check_audit_R1_20261010.md`
