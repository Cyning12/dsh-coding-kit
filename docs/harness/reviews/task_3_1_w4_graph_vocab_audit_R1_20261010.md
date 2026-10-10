# 审查 · 20-task-audit R1 · 3-1-w4-graph-vocab

> **日期**：2026-10-10 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_1_w4_graph_vocab.md`](../../tasks/done/task_3_1_w4_graph_vocab.md)  
> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md) · [`04` W4](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) · [`02` §4.2](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) · [`03` §1.4 / failure 词表冲突 exit 2](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md)（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) **W4 · 仓级词表（F-1②）**（HG-NEXT-PLAN=approved）  
> **3.0.2 延后**：[`PLAN_3_0_2_patch_v1_zh.md`](../../roadmap/PLAN_3_0_2_patch_v1_zh.md) 非范围 F-1②  
> **W3 关账对照**：[`task_3_1_w3_graph_drift`](../../tasks/done/task_3_1_w3_graph_drift.md)（`.spec-wave/` 加载先例 · **防回灌** drift 语义）  
> **10 invoke**：[`invoke_20261010_10_3-1-w4-graph-vocab.md`](../invokes/by-task/3-1-w4-graph-vocab/invoke_20261010_10_3-1-w4-graph-vocab.md)  
> **方式**：只读对照 SPEC/PLAN/W3 done/task · 抽核 R0 行号 · `task lint` → PASS · **未改 task 实质 / 闸表** · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 仍为 **pending** · **禁止 30 改码**（真值在 task 表） |
| **合并 / 冲突 / 登记≠封闭** | **可验收**（见下「语义可验收」） |
| **审查结论** | **通过** · PASS · blocking 0 |

### 语义可验收（合并 · 冲突 · 登记≠封闭）

| 语义 | 裁定 | 依据（task） |
|------|------|----------------|
| **合并** | **可验收** | ①/A6：仓级 `.spec-wave/graph-vocab.yaml` + 内置合并挂 `compile\|check`；R2 钉 edge 并集 · kinds 按 id；A2 扩展边型零 Warning |
| **冲突 / 坏档** | **可验收** | ③/A4/A5 + failure_paths：坏 YAML / schema 非法 / 同 kind id 不同 class → **exit 2** · 点名路径/键；对齐 SPEC `03` §3 |
| **登记 ≠ 封闭** | **可验收** | ⑤/A3 + 非范围：未登记显式 type 仍 Warning · **不咬 exit**；禁回退开放惯例；对齐 SPEC `02` §4.2 |
| **缺省=3.0.2** | **可验收** | ②/A1：无仓级文件仅内置 · 钩②钉不回退 |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W4 五条（加载合并 · 冲突 fail-loud+缺省=3.0.2 · 扩展零 Warning/未登记仍 Warning · 文档 · 四门/闸/gate-check）+ PLAN W4 三行 + `02` §4.2 + `03` §1.4；未扩 W5 bump/release | ✅ |
| 2 | **防 W3 回灌**：非范围明示不改 `graph drift` / scaffold 探测·写盘·轻检；不改无仓级文件时 `graph yaml *` 默认松紧；上游关账仅加载先例 · **勿回灌实现验收** | ✅ |
| 3 | **必做/可选拆分**：O1/A-opt1 `graph vocab show` 不阻塞 A9；与 SPEC「非硬门槛」一致 | ✅ |
| 4 | **非范围**：回退「登记≠封闭」· 改内置六条边型钉 · W5/bump/tag/push/publish · 代签 HG · 污染 dogfood · 强制 kit CI 硬门禁 · ONTO-OPEN | ✅ |
| 5 | **验收 A1–A9 + A-opt1**：缺省等价 / 扩展零 Warning / 未登记 Warning / 坏 YAML exit 2 / 冲突 exit 2 / 加载面 / 文档 / 零回归 / 四门关账均可机检；禁「自动权威图谱」 | ✅ |
| 6 | **failure_paths**：闸序拒开工 · 坏 YAML/schema/冲突 exit 2 · 缺省=3.0.2 · 扩展静默钩② · 未登记 Warning 不咬 · 禁改 drift/scaffold · 禁 W5/bump · 裹挟 · 四门红；对齐 `03`「仓级词表坏 YAML / 与内置冲突 exit 2」 | ✅ |
| 7 | **行为变更（K7）旧测影响面**：`test_strategy_note` + 「旧测影响面」钉 `f1-unify` / `graph-*` / scaffold / drift / axioms / ontology 零回归 · 充分（未另立 grep 名单标题 → 见 **N4**） | ✅ |
| 8 | **test_strategy=required** · 红测先行 · 临时 fixture · 勿污染本仓 dogfood / 本仓 `.spec-wave/graph-vocab.yaml` 负向样 | ✅ |
| 9 | **R0 行号抽核**（2026-10-10）：`cli-graph-yaml.ts:56-86` 仅内置加载 · `:90-106` 钩② · `:361`/`:593`/`:624` printTechVocabWarnings · `:154`/`:480-481` kind；`assets/tech-graph-vocab.yaml` version/kinds/六条 edge +「登记≠封闭」；`cli-pins.ts:20`/`:118-128` · `cli-graph-drift.ts:12`/`:157-176`；`f1-unify` 六条钉 / bogus_edge / branches·triggers | ✅ |
| 10 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 pending | ✅ |
| 11 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · lint **PASS** | ✅ |
| 12 | 思考轮 R0–R5 + 控制表闭合 · residual_risks 三条具体 | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（仅内置 load · 钩②挂 compile/check/export · pins/drift 同族先例 · SPEC/PLAN 钉点；抽核一致） |
| R1 范围 | **充分**（仅 W4 合并+fail-loud+文档 · vocab show 可选 · 排除 drift/scaffold 返工 / W5 / bump / 回退开放惯例） |
| R2 方案 | **充分**（扩展 load 接受 target · edge 并集 · kind 冲突 exit 2 · cache 含 target · 单源纪律） |
| R3 边界 | **充分**（缺省=3.0.2 · 不把 Warning 升 exit · 不改 drift/scaffold · 不代签 · 不污染本仓负向档） |
| R4 可测 | **充分**（A1–A9 机检 · A-opt 可选 · 红测先行） |
| R5 就绪 | **充分**（待本审 + 人签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | 冲突面最低钉「同 kind id 不同 class」；其它冲突键交 30 | 30 测锁冲突集合并写清；勿把 edge 同名并集误判为冲突 |
| **N2** | `loadTechGraphVocab` 现无参 · 多调用点须统一穿 target（residual ①） | A6 锁 compile\|check；export `:624` 同钩②建议一并穿参，防假绿 |
| **N3** | 单源 grep 若仍断言「仅 assets 字面」会与仓级路径常量冲突（residual ②） | 同步钉口径 · 禁止双硬拷贝枚举回潮 |
| **N4** | K7 未独立「旧测 grep 名单」标题 | 30 开工前列影响面写入自检（至少 `f1-unify` · `graph-*` · drift/scaffold） |
| **N5** | SPEC `04` W0 仍写「W4–W5 task 未开」与本波开拆略漂移 | 非本 task 内容阻塞；由 00/10-spec 后续勾选（本棒不改 SPEC） |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表 · 本棒不改）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 2026-10-10 · 继承 |
| HG-NEXT-PLAN | approved | epic · 同窗 · 继承 |
| HG-TASK-DRAFT | **pending** | 本波草稿 · 仅人签 · blocks 20/30（流程；本审内容已 PASS） |
| HG-AUDIT-R1 | **pending** | blocks **30** · **未签则 30 拒改码** |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸（后签）**：2026-10-10 **00** 已将 task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved** · **可 30**。  
合并 / 冲突 fail-loud / 「登记 ≠ 封闭」三项语义 **均可验收**。

---

## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（PASS · blocking 0 · N1–N5 非阻塞 · 合并/冲突/登记≠封闭可验收）
- [x] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（**00** · 2026-10-10 · 授权签收过程文档）
- [x] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（**00** · 同窗）
- [x] commit task 文档或确认已签（随 W4 文档提交）
- [x] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-10 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_1_w4_graph_vocab_audit_R1_20261010.md`
