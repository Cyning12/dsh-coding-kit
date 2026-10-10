# 审查 · 20-task-audit R1 · 3-2-w5-release

> **日期**：2026-10-11 · **hat**：20-task-audit  
> **task**：[`docs/tasks/done/task_3_2_w5_release.md`](../../tasks/done/task_3_2_w5_release.md)（slug `3-2-w5-release` · `active` 初稿）  
> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W5](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md)（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W5 · release**（HG-NEXT-PLAN=approved）  
> **结构模板**：[`docs/tasks/done/task_3_1_w5_release.md`](../../tasks/done/task_3_1_w5_release.md)  
> **上游统筹**：[`invoke_20261011_00_orchestrate_w2_w5.md`](../invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md) **W5 · release 簿记**  
> **上游**：W1–W4 done · 同支 `task/specwave-3-2-w1-ib-check`  
> **方式**：只读对照 SPEC `04` W5 + PLAN W5 + `task_3_1_w5_release` 模板 · R0 工作树抽验 · `npx spec-wave task lint --file …` → **PASS** · **未改** task 实质 / 闸表 / `src/` · **不代签**人闸 · **不附 30 Prompt**

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 → **pending**（真值在 task 表 · 本棒不改）· **禁 30** |
| **RELEASE 闸** | HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH → **pending** · `blocks_hats=—` · **不拦** 30 簿记 · **建议保持** pending |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 机械闸

| 项 | 结果 |
|----|------|
| `npx spec-wave task lint --file docs/tasks/active/task_3_2_w5_release.md` | **PASS** |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W5 两条（CHANGELOG / ACCEPTANCE / `docs/spec/README.md` 本行状态 · bump `3.2.0` + pins · tag/push/publish 按当次授权）+ PLAN W5 | ✅ 范围①–⑩ / A1–A9 覆盖；本波默认三动作仅人 ⊆「按当次授权」 |
| 2 | **对照模板** `task_3_1_w5_release`：簿记骨架同构（bump · CHANGELOG · pins · ACCEPTANCE · 索引 IMPLEMENTED · RELEASING checklist · 四门 · 禁三动作 · 双 RELEASE 闸不拦 30） | ✅ 结构齐；相对 3.1 篇幅更短 → 见 **Advisory**（不挡签收） |
| 3 | **W1–W4 可归拢**：`docs/tasks/done/task_3_2_w{1..4}_*.md` 均在 · PLAN 修订已记 W1–W4 00 关账 · CHANGELOG/ACCEPTANCE 归拢义务写在范围②④ | ✅ |
| 4 | **非范围**：`git tag` / `git push` / `npm publish` · W1–W4 返工 · AST / issue-sync · 与 SPEC/epic 延后一致 | ✅ |
| 5 | **验收 A1–A9**：bump+lock · CHANGELOG `[3.2.0]`+W1–W4 · ACCEPTANCE 档 · 索引 IMPLEMENTED/planned · RELEASING checklist（发布三动作未勾）· 禁假 published · 四门（pin-10 设计红除外）· 无 `v3.2.0` tag/未 publish · gate-check+close/`chore(release): bump to 3.2.0` | ✅ 可机检或裁量 |
| 6 | **failure_paths**：闸拒 30 · 误 tag/push/publish · 假 published · 四门非设计红失败 | ✅ 覆盖发布硬边界；相对 3.1 细项见 **N2** |
| 7 | **行为变更（K7）旧测影响面** | **N/A**（发版簿记 · 无新产品判定/默认值变更）· 不退回 |
| 8 | **test_strategy=required** · note：四门绿；打 tag 前仅 pin-10 设计红可接受（同 3.1 W5） | ✅ |
| 9 | **R0 抽核**（2026-10-11）：`package.json#version`=`3.1.0` · CHANGELOG 头为 Unreleased + `[3.1.0]`、**无** `[3.2.0]` · **无** `ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md` · `docs/spec/README.md` `3_2-…` 行仍「开拆 W1」（非 IMPLEMENTED）· RELEASING 有 `3.1.0` checklist、**无** `3.2.0` 节 · **无** `v3.2.0` tag · 分支 `task/specwave-3-2-w1-ib-check` | ✅ 与 task R0 一致 |
| 10 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · RELEASE 双闸 pending 且不拦 30 · 本波两过程闸 **pending**（本棒不改） | ✅ |
| 11 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · `close_pr_policy=exempt`（统一 PR）· lint **PASS** | ✅ |
| 12 | 思考轮 R0–R5 + 控制表闭合 · early_stop 全 no · residual_risks（registry 3.1.0 publish 叙事措辞）有对应 A6 / 范围②⑦ | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（本棒抽验与声明一致：待 bump · 无 3.2.0 CHANGELOG/ACCEPTANCE · 索引未翻 · 无 tag） |
| R1 范围 | **充分**（仅 W5 release 簿记 · 排 tag/push/publish） |
| R2 方案 | **充分**（沿 3.1 W5 · bump 3.2.0 · ACCEPTANCE 新档） |
| R3 边界 | **充分**（Agent 永禁 publish · HG-RELEASE-* pending） |
| R4 可测 | **充分**（A1–A9） |
| R5 就绪 | **充分**（待本审 + **00 按授权**签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | A3 仅写「ACCEPTANCE 档存在」；SPEC `04` 有 **验收总表**（IB / struct_rel / indexes / 零回归 / 禁 AST 违纪） | 30 写 ACCEPTANCE 时对照总表 + W1–W4 台账（commit 哈希）+ pin-10 设计红 +「bump 已落 · tag/push/publish 待人」边界（同 3.1 A5） |
| **N2** | failure_paths 相对 3.1 模板缺：CHANGELOG 先于 pins fix、`git add -A`、RELEASING 双重敏感全量测、`npm version`、断言联改漏网等细项 | 不挡签收；30 执行仍按 3.1 W5 / RELEASING 纪律：先 CHANGELOG 再 `pins fix` · 禁 `npm version` / `git add -A` · 改 RELEASING 后全量 `npm test` |
| **N3** | SPEC/PLAN W5 **未**强制 MIGRATION「3.1.0 → 3.2.0」节（W4 已做 yaml 双栈迁移文档） | 可选：头栏/包钉随 pins 对齐即可；勿暗示 breaking / 强制启用 |
| **N4** | 范围⑧「手册/README 若需同步则改」偏裁量 | pins fix / 头栏钉面若红则改；禁假「已 published 3.2.0」 |
| **N5** | residual_risks：registry 是否已 publish `3.1.0` 影响措辞 | 30 写 CHANGELOG/RELEASING 前实测 `npm view` / 台账；勿写假 published |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表 · 本棒不改）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 · 继承 |
| HG-NEXT-PLAN | approved | epic · 继承 |
| HG-TASK-DRAFT | **pending** | 待 00 签（本棒不改） |
| HG-AUDIT-R1 | **pending** | 待 00 签 · **禁 30**（本棒不改） |
| HG-RELEASE-TAG-PUSH | **pending** | 仅人 · **建议保持** · 不拦 30 |
| HG-RELEASE-PUBLISH | **pending** | 仅人 · Agent 永禁 · **建议保持** · 不拦 30 |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸仍 pending**：维护者 / **00 按 epic 授权**签 task 表后才可下发 30；**本审不附 30 可复制 Prompt**。  
**RELEASE 闸保持 pending**（tag/push/publish 仅人 · 不拦 30 簿记）。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（PASS · blocking 0 · N1–N5 非阻塞 · 发布三动作硬边界）
- [ ] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（维护者或 **00 按授权** · 日期）
- [ ] **勿**代签 HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH（仅人 · 发布动作）· **保持 pending**
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt（簿记 bump · **仍禁** tag/push/publish）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。HG-RELEASE-*=pending **不**构成 30 拒开工理由（`blocks_hats=—`）。

---

**签名**：20-task-audit · R1 · 2026-10-11 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_2_w5_release_audit_R1_20261011.md`  
**未改**被审 task / `src/` · **未附 30 Prompt** · **未** tag/push/publish · **未代签**人闸
