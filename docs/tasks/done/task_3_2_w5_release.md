# Task：3.2 W5 · release 收尾（3.1.0 → 3.2.0 · W1–W4 CLOSE 后发版簿记）

> **状态**：`done` · **00 验收关账** 2026-10-11（A1–A9 · `8ab40d1`）· HG-RELEASE-* **pending**（tag/push/publish 待人）  

> **上游 SPEC/PLAN**：[`3_2-graph-ib-and-indexes`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`04` W5](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) · [`PLAN_3_2`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md)  
> **结构模板**：[`task_3_1_w5_release.md`](../done/task_3_1_w5_release.md)  
> **基线**：工作树 `package.json#version`=`3.1.0`（3.1 epic 已 bump；publish 状态以 registry 为准）  
> **发版纪律**：[`RELEASING.md`](../../../RELEASING.md) · **tag/push/npm publish 仅人**（本波默认不代跑）  
> **同支**：`task/specwave-3-2-w1-ib-check` · 统一 PR  
> **统筹**：[`invoke_20261011_00_orchestrate_w2_w5.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md)  

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-2-w5-release` |
| **test_strategy** | `required` |
| **test_strategy_note** | 四门绿；pins 打 tag 前仅 pin-10 设计红可接受（同 3.1 W5） |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-2-w1-ib-check` |
| **graph_delta** | `none` |
| **graph_delta_note** | 版本钉 bump · 不改图谱语义 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 20/00 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | 统一 PR |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic |
| HG-NEXT-PLAN | approved | — | epic |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-11 **00 签收** · lint + [`task_3_2_w5_release_audit_R1_20261011.md`](../../harness/reviews/task_3_2_w5_release_audit_R1_20261011.md) PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-11 **00 签收** · **可 30 簿记** · HG-RELEASE-* 仍 pending |
| HG-RELEASE-TAG-PUSH | **pending** | — | tag/push **仅人** · 不拦 30 簿记 |
| HG-RELEASE-PUBLISH | **pending** | — | `npm publish` **仅人** · Agent 永禁 |

---

## 背景与目标

W1 ib check · W2 struct_rel · W3 indexes · W4 文档均 CLOSE 后，簿记 bump **3.2.0**，交付到「bump 已落 · 台账齐 · tag/push/publish 待人」。

---

## 范围

- [x] **①** bump：`package.json` + lock `3.1.0` → `3.2.0`（**不用** `npm version`）  
- [x] **②** CHANGELOG `## [3.2.0]`：W1–W4 摘要 + 待发版行  
- [x] **③** pins 对齐（打 tag 前仅 pin-10 设计红可接受）  
- [x] **④** ACCEPTANCE：`docs/roadmap/ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md`  
- [x] **⑤** `docs/spec/README.md` 本 epic 行 → IMPLEMENTED（planned 3.2.0）  
- [x] **⑥** SPEC README / PLAN 状态与发版叙述对齐  
- [x] **⑦** RELEASING 人 checklist 预填 3.2.0（tag/push/publish 未勾）  
- [x] **⑧** 手册/README 版本头栏若需同步则改  
- [x] **⑨** 四门绿 · `chore(release): bump to 3.2.0` · **00 close**（close 留 00）  
- [x] **⑩** **禁** tag / push / publish（本棒）

## 非范围

| 项 | 理由 |
|----|------|
| `git tag` / `git push` / `npm publish` | 仅人 · HG-RELEASE-* pending |
| W1–W4 返工 | 已关 |
| AST / issue-sync | 非本 epic |

---

## 失败路径

| 触发 | 行为 | 可重试 | 可见 |
|------|------|--------|------|
| HG-AUDIT-R1 pending | 拒 30 | 是 | 是 |
| 误 tag/push/publish | 打回 | — | 是 |
| 假 published 叙事 | 打回 | 是 | 审查 |
| 四门非设计红失败 | 停 | 是 | 是 |

---

## 验收标准

- [x] **A1**：`package.json#version`=`3.2.0` + lock 同步  
- [x] **A2**：CHANGELOG 有 `[3.2.0]` 且含 W1–W4  
- [x] **A3**：ACCEPTANCE 档存在  
- [x] **A4**：spec 索引行 IMPLEMENTED / 3.2.0 planned  
- [x] **A5**：RELEASING 有 3.2.0 checklist（发布三动作未勾）  
- [x] **A6**：无假「已 published 3.2.0」表述  
- [x] **A7**：四门绿（pin-10 设计红除外口径同 3.1）  
- [x] **A8**：工作树无 `v3.2.0` tag · 未 publish  
- [x] **A9**：gate-check + close · `chore(release): bump to 3.2.0` · **00 close**（gate-check ✅ · close 留 00）

---

## 给执行帽的必读列表

1. [`task_3_1_w5_release.md`](../done/task_3_1_w5_release.md)  
2. `RELEASING.md` · `CHANGELOG.md` · `package.json`  
3. SPEC/PLAN 3.2 · W1–W4 done commits  

---

## 思考轮

### R0 · 证据

`package.json` version=`3.1.0`；W1–W4 已 CLOSE；无 3.2.0 CHANGELOG 节（30 复核）。

### R1 · 范围

仅 release 簿记。排 tag/push/publish。

### R2 · 方案

沿 3.1 W5 模板 · bump 3.2.0 · ACCEPTANCE 新档。

### R3 · 边界

Agent 永禁 publish；HG-RELEASE-* pending。

### R4 · 可测性

A1–A9 文件/版本断言 + 四门。

### R5 · 签收就绪

交 20 → 00 签过程闸 → 30 簿记。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 3.1.0 待 bump | no |
| R1 | 仅 W5 簿记 | no |
| R2 | 沿 3.1 W5 | no |
| R3 | 禁发版三动作 | no |
| R4 | A1–A9 | no |
| R5 | 待 20 | no |

**residual_risks**：① registry 是否已 publish 3.1.0 影响叙事措辞——以实测为准写 CHANGELOG/RELEASING。

---

## 测试策略（Harness）

**test_strategy**: `required`

---

## 提交信息约定

- `chore(release): bump to 3.2.0（W1 ib · W2 struct_rel · W3 indexes · W4 docs）`  

### 自检结论（执行者）

**帽**：30 簿记 + 40 自证（同棒）· **日期**：2026-10-11 · **未** tag / push / publish / deprecate · **未** task close（留给 00）

#### GATE_VERIFY

```text
$ npx spec-wave verify --target . --task docs/tasks/active/task_3_2_w5_release.md
| HG-TASK-DRAFT | approved | 20, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
VERIFY: PASS · task_3_2_w5_release.md
```

#### 验收勾选

- [x] A1 bump（package.json + lock · 未用 npm version）
- [x] A2 CHANGELOG `[3.2.0]`（minor · W1–W4 · 待发版 · registry latest 叙事=`3.1.0`）
- [x] A3 ACCEPTANCE_3_2 落盘
- [x] A4 spec 索引 IMPLEMENTED · `3.2.0` 待发版（planned）
- [x] A5 RELEASING 人 checklist 3.2.0（就绪预勾 · tag/push/publish 未勾）
- [x] A6 假「已 published 3.2.0」零命中
- [x] A7 四门：typecheck 0 · npm test **985 · 982 pass + 2 设计红 + 1 skip** · build 0 · test:lib 6/6
- [x] A8 无 `v3.2.0` tag · 未 publish
- [ ] A9 close 归 00（本棒 gate-check ✅ · commit `chore(release): bump to 3.2.0`）

#### invoke

`docs/harness/invokes/by-task/3-2-w5-release/invoke_20261011_30_40_3-2-w5-release.md`

| 项 | 结论 |
|----|------|
| GATE_VERIFY | PASS · ✅ 可 30 |
| A1–A8 | PASS · A9 close 归 00 |
| 四门 | typecheck/build/test:lib 绿 · npm test 仅 pin-10 族设计红 ×2 |
| 发布边界 | 已证：无 `v3.2.0` tag · 未 push · 未 publish |
| registry | `latest=3.1.0`（已 published）· 3.2.0 待人 |

---

### KPI（00）

Task_KPI%: 96（A1–A9 · bump 3.2.0 · 发布三动作边界守住 · 四门仅 pin-10 设计红；扣分：无）

- rubric：`KPI_RUBRIC_v1_2`

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-11 | 10-task 初稿 · 00 开拆 W5 · HG-RELEASE-* pending |
| 2026-10-11 | 20 审 R1 PASS · **00 签收** 过程闸 · 可 30 簿记 · RELEASE 仍 pending |
| 2026-10-11 | 30/40：bump 3.2.0 簿记 · A1–A8 · A9 close 留 00 · 未 tag/push/publish |
| 2026-10-11 | **00 验收关账** · A9 close · HG-RELEASE-* 仍 pending · 待统一 PR |
