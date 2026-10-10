# 审查 · 20-task-audit R1 · 3-2-w2-struct-rel

> **日期**：2026-10-11 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_2_w2_struct_rel.md`](../../tasks/done/task_3_2_w2_struct_rel.md)  
> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W2](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) · [`02` §3](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) · [`03` §1.2](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) · [`03` §3](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) failure_paths（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W2 · struct_rel**（HG-NEXT-PLAN=approved）  
> **防回灌对照**：3.1 `STRUCT_REL_DEFAULT = '01_struct.md'` 硬钉 · 无配置须与 3.1.0 **完全一致**  
> **方式**：只读对照 SPEC/PLAN/task · 抽核 R0 行号（`STRUCT_REL_DEFAULT` / `loadWhitelist` / `structAbs`）· `task lint` → PASS · **未改** task 实质 / 闸表 / `src/` / `test/` / `bin/` · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 → **pending**（真值在 task 表 · 本棒不改）· **禁 30** |
| **缺省兼容 3.1** | **可测锁**（A1 + A6 + failure「无配置」+ residual ①） |
| **相对 --input** | **可验收**（R0 钉 · A2/A3 测锁 · residual 明示 vs 白名单相对 target） |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 机械闸

| 项 | 结果 |
|----|------|
| `node bin/specgate.js task lint --file docs/tasks/active/task_3_2_w2_struct_rel.md` | **PASS** |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W2（可选 `struct_rel` · 缺省 `01_struct.md` · 分层协议表可绿 · 坏路径 fail-closed · 正负向 fixture · 四门/闸/gate-check）+ PLAN W2 + `02` §3 + `03` §1.2；未扩 W3 indexes / W4–W5 / IB | ✅ |
| 2 | **缺省防回灌**：非范围钉「改缺省 `01_struct.md` 字面」；A1/A6 钉无配置=3.1；R1/R3 重申；验收无「改缺省路径字面」条款 | ✅ |
| 3 | **相对根钉死**：SPEC `02` §3「相对 `--input`」；task 范围① + R0「白名单相对 target / struct_rel 相对 input」+ residual ① + 30 测锁 | ✅ |
| 4 | **非范围** vs SPEC/PLAN：IB / indexes / AST · 自动写盘 · bump/publish/`git add -A` · 改缺省字面 · 绑 verify | ✅ |
| 5 | **验收 A1–A8**：缺省兼容 / 分层表正向 / missing / unparseable / 非法类型 / 旧测零回归 / 四门 / 关账（A8 close 留 00）均可机检 | ✅ |
| 6 | **failure_paths**：闸序拒开工 · struct_missing · struct_unparseable · 类型非法 exit 2 · 无配置=3.1 · 四门红；对齐 `03` §3 | ✅ |
| 7 | **行为变更（K7）旧测影响面**：扩配置键 · A6 + `test_strategy_note` 钉既有 drift 零回归 · 充分（未另立 grep 名单标题 → 见 **N2**） | ✅ |
| 8 | **test_strategy=required** · 红测：缺省 / 正向分层 / 坏路径 / 不可解析 · 临时 fixture | ✅ |
| 9 | **R0 行号抽核**（2026-10-11）：`cli-graph-drift.ts:13` `STRUCT_REL_DEFAULT = '01_struct.md'` · `:157-204` `loadWhitelist` 仅 exempt_*（task 写 157-200 · 同段至 return）· `:255` `path.join(opts.inputRoot, STRUCT_REL_DEFAULT)` · **尚无** `struct_rel` 键 | ✅ |
| 10 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 **pending**（本棒不改） | ✅ |
| 11 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · `close_pr_policy=exempt` · lint **PASS** | ✅ |
| 12 | 思考轮 R0–R5 + 控制表闭合 · residual_risks 两条具体（相对 input vs target · POINTER 形不可解析） | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（硬钉 DEFAULT · loadWhitelist 无 struct_rel · structAbs 拼 inputRoot · SPEC/PLAN 钉点；抽核一致） |
| R1 范围 | **充分**（仅 W2 struct_rel · 排除 W3+ / IB / bump） |
| R2 方案 | **充分**（扩加载返回 structRel · runGraphDrift 使用 · 非法类型 fail-closed） |
| R3 边界 | **充分**（不改缺省 · 不写盘 · 不绑 verify） |
| R4 可测 | **充分**（A1–A6 fixture · A7–A8 四门+close） |
| R5 就绪 | **充分**（待本审 + **00 按授权**签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | `struct_missing` detail 现值硬写「01_struct.md 缺失」（`:263`）；启用 `struct_rel` 后若仍硬钉字面易误导 | 30 用实际 rel 点名（对齐 `03` §3「点名」） |
| **N2** | K7 未独立「旧测 grep 名单」标题 | 30 开工前列影响面（至少 `test/graph-drift*`）写入自检 |
| **N3** | `loadWhitelist` 段 task 写 `:157-200`，实读至 `:204` return | 实现前 30 复核现值（task 已声明行号为起草快照） |
| **N4** | A2「协议列路径 glob」依赖 `parseStructModuleGlobs` 协议形 | fixture 须含可解析协议表，避免误用 POINTER/空表触发 A4 |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 · 继承 |
| HG-NEXT-PLAN | approved | epic · 继承 |
| HG-TASK-DRAFT | **approved** | 2026-10-11 **00** 签收 |
| HG-AUDIT-R1 | **approved** | 2026-10-11 **00** 签收 · **可 30** |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸（后签）**：2026-10-11 **00** 已将 task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved** · **可 30**。

---

## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（PASS · blocking 0 · N1–N4 非阻塞 · 缺省兼容与相对 input 可测锁）
- [x] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（**00** · 2026-10-11）
- [x] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（**00** · 2026-10-11）
- [x] commit task 文档或确认已签（随本波文档提交）
- [x] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-11 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_2_w2_struct_rel_audit_R1_20261011.md`
