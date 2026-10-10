# 审查 · 20-task-audit R1 · 3-2-w4-migration-docs

> **日期**：2026-10-11 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_2_w4_migration_docs.md`](../../tasks/done/task_3_2_w4_migration_docs.md)  
> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W4](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) · [`03` §2](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) 审核/手册协议（HG-SPEC-SIGNOFF=approved）  
> **上游统筹**：[`invoke_20261011_00_orchestrate_w2_w5.md`](../invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md) **W4 · 迁移 + 分责文档**（HG-NEXT-PLAN=approved）  
> **上游**：W1–W3 done · 同支 `task/specwave-3-2-w1-ib-check`  
> **方式**：只读对照 SPEC `04` W4 / `03` §2 + task · 抽核手册「点 vs 边」现值 · `npx spec-wave task lint --file …` → PASS · **未改** task 实质 / 闸表 / `src/` · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 → **pending**（真值在 task 表 · 本棒不改）· **禁 30** |
| **yaml 双栈迁移** | **可验收**（①/A1 · 消费仓 `graph:ci` → `npx spec-wave graph yaml …`） |
| **保真分责（03§2）** | **可验收**（②/A2 · 四行意图 · 含 AST「未交付」） |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 机械闸

| 项 | 结果 |
|----|------|
| `npx spec-wave task lint --file docs/tasks/active/task_3_2_w4_migration_docs.md` | **PASS** |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W4 四条（MIGRATION/手册可切 CLI · 保真分责表对外 · 可选 CI 注释加 `graph ib check` · 无强制删 Python + 四门/gate-check 裁量）+ `03` §2；未扩 W5 bump/tag/push/publish · 未改 CLI 语义 | ✅ |
| 2 | **03§2 保真分责四行**：边+模块表 `graph drift` · 点 `graph ib check` · 倒排 `graph indexes check`（opt-in）· 符号（未来）未交付 AST · 另 Epic ↔ task ②「四行意图」+ A2 + A3 禁「已含 AST」 | ✅ |
| 3 | **CI 样例纪律**：可选注释步骤加 `ib check`；indexes **不**写硬门禁 ↔ 范围④ / A4 | ✅ |
| 4 | **非范围**：删消费仓 Python · 改 CLI/新命令 · W5 bump/publish · 宣称已含 AST · 对齐 SPEC/epic 延后 | ✅ |
| 5 | **验收 A1–A6**：迁移指引 · 分责表 · AST 违纪 grep · 可选 CI · 四门 · gate-check+close/`docs(3.2-W4): …`/禁 bump·tag·push·publish · 均可机检或裁量 | ✅ |
| 6 | **failure_paths**：闸拒 30 · AST 违纪打回 · 四门红停；文档波充分（实现失败路径属 W1–W3 · 本波不重抄） | ✅ |
| 7 | **行为变更（K7）旧测影响面** | **N/A**（文档 + 可选 CI 注释 · 非判定/默认值变更）· 不退回 |
| 8 | **test_strategy=recommended** · note：文档波四门/gate-check 裁量；若改 CI sample 则测或文件存在性断言 · 与 `04` W4「无码则文档+gate-check 裁量」一致 | ✅ |
| 9 | **R0 抽核**（2026-10-11）：仓根 [`MIGRATION.md`](../../../MIGRATION.md) 存在；手册 [`使用手册-v3.0.0-zh.md`](../../guides/使用手册-v3.0.0-zh.md) 已有「点 vs 边（保真分责）」**两行**（drift / ib · **缺** indexes / AST 行）→ 本波须扩为 `03` §2 四行；README 双语已链 `MIGRATION.md`；`assets/ci/samples/` 可作可选挂点 | ✅ |
| 10 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 **pending**（本棒不改） | ✅ |
| 11 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · `close_pr_policy=exempt` · lint **PASS** | ✅ |
| 12 | 思考轮 R0–R5 + 控制表闭合 · early_stop 全 no · residual_risks=none（文档波可接受 · 见 **N3**） | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（W1–W3 命令已齐 · 手册/MIGRATION 路径交 30 实读；本棒抽核与声明一致） |
| R1 范围 | **充分**（仅文档 + 可选 CI 注释 · 排除 CLI/W5/AST 宣称） |
| R2 方案 | **充分**（MIGRATION + 手册专节 + README 链 · CI 可选） |
| R3 边界 | **充分**（不改 CLI · 不宣称 AST） |
| R4 可测 | **充分**（A1–A3 文件/grep · A4 可选 · A5–A6 四门+close） |
| R5 就绪 | **充分**（待本审 + **00 按授权**签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | task 写 `docs/MIGRATION*`；现值落点为仓根 **`MIGRATION.md`**（README 已链） | 30 以仓根 `MIGRATION.md`（或明确等价路径）落 yaml 双栈节；勿新建第二份真值 |
| **N2** | 手册「点 vs 边」现仅 drift/ib 两行 · **未**含 indexes / AST「未交付」 | A2 须扩成 `03` §2 四行表；勿只补链不补行 |
| **N3** | `residual_risks: none` 偏空 | 30 自检可记：漏写 indexes 行 / 误写「已含 AST」/ CI 样例误把 indexes 写成硬门禁 |
| **N4** | 范围③ README 双语无独立 A# | 不阻塞；建议 30 在 A1/A6 自检中勾「双语补链或已有链」 |
| **N5** | A4 可选 · 与 SPEC「可为 ib 加可选注释」一致 | 跳过时须在关账写明「明示跳过不挡」· 满足 A4 后半句 |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表 · 本棒不改）

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

- [ ] 已读 R1 审查结论（PASS · blocking 0 · N1–N5 非阻塞 · 迁移/分责/CI 可选可验收）
- [ ] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-11 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_2_w4_migration_docs_audit_R1_20261011.md`
