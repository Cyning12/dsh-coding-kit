# Task：lint-wiki-delta 错节诊断码 + task lint 对齐 close 口径（K1/K2）

> **状态**：`draft`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联证据**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §3 **K1（P1）/ K2（P1）** · §5 CI 失败日志  
> **拟发版**：`dsh-coding-kit@1.8.0`（建议与本批 K3/K5/K4+K6+K7 同波；可独立 PR）  
> **00 颗粒度**：单 task 覆盖 W1（lint 诊断码）+ W2（task lint 早拦）；同一 lint 家族、同一发版单元

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `wiki-delta-section-diagnostics` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/wiki-delta-section-diagnostics` |
| **graph_delta** | `none` |
| **graph_delta_note** | CLI 诊断与 lint 规则；不改图谱资产 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约落 CHANGELOG；kit 自身不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag，非业务 PR 闸对象 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | pending | 22-R1, 30 | 初稿人扫 |
| HG-AUDIT-R1 | pending | 30 | 20 R1 落盘后人签 |

---

## 背景与目标

ops-desk-api PR #72（run 33037752469）：执行 Agent 手写出 `docs/tasks/done/` 文件，已写 `## Harness` 节 + `wiki_delta` 行，但 `parseHarnessMeta`（`src/cli-shared.ts` L72）硬编码只认 `## Harness 元信息` → `lint-wiki-delta` **误报 `wiki_delta_missing`**，fix commit 仍红，误导修复方向（K1）。同时 `task lint --file`（`src/cli-checks.ts` `lintTaskFile` L758）起草期 **不检查 `wiki_delta`**，缺口直到 CI `scope: all` 才爆（K2，#70 连带 ×4）。

**完成态行为**：

1. `task lint-wiki-delta` 能区分「字段完全缺失」与「字段写错节名」：后者报新诊断码 `wiki_delta_wrong_section`，detail 指明所在节名与行号，并提示「须在 `## Harness 元信息` 表格内」。
2. `task lint --file` 在起草期即拦 `wiki_delta` 缺失 / 错节（与 close guard `close_wiki_delta` 对齐），不再等 CI。

---

## 范围

- [ ] W1（K1）：`lintWikiDeltaMissing`（`src/cli-task-extra.ts` L79）增错节检测——文件在 `## Harness 元信息` 之外存在 `wiki_delta` 行（任意 `##`/`###` 节或表格行）时，报 `wiki_delta_wrong_section`（**替代** `wiki_delta_missing`，不双报）；完全无该行 → 仍 `wiki_delta_missing`；`--json` 与人读 summary 同码同文案；`--strict` 追加检查（invalid / path_missing）语义不变
- [ ] W2（K2）：`lintTaskFile` 新增规则 **E8**：`## Harness 元信息` 节存在但缺 `wiki_delta` 行 → error（仅查存在性，词表与路径存在性仍归 close/strict）；错节场景 E8 文案指向正确节名；`task lint` 人读输出与 `--strict` 不冲突
- [ ] 单测钉死：错节 fixture（`## Harness` / `## harness 元信息` 大小写变体 / 字段在正文表格）、缺失 fixture、正常 fixture；`lint-wiki-delta` exit 码族不变（0/1/2）
- [ ] CHANGELOG `[Unreleased]` 增条；CLI help（`src/cli.ts` L103 附近）与 `assets/docs/POINTER_RUNBOOK_wiki_delta.md` 诊断码表补 `wiki_delta_wrong_section`

## 非范围

- 不改 `parseHarnessMeta` 的权威节名（仍只认 `## Harness 元信息`）；不做容错解析（错节是**诊断**不是**兼容**）
- 不做 `--fix` 自动改写 task 文件；`--fix-hint` 独立旗标与否由 R 轮决策（默认 detail 自带 hint）
- 不改 `close_wiki_delta` 闸语义与 `--allow-wiki-gap` 豁免面
- 不新增 `lint-wiki-delta --scope changed`（K4 提及的 trade-off 仅作文档说明，见 task `prompts-ci-alignment`）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 字段写在 `## Harness` 等错节 | `wiki_delta_wrong_section` + 节名/行号 + fix hint | 是（改节名重跑） | 是 |
| 字段完全缺失 | `wiki_delta_missing`（现状不变） | 是 | 是 |
| `task lint` 遇 draft task 缺行 | E8 error（与 close 对齐 · 无 draft 豁免） | 是（补行重跑） | 是 |
| E8 误判存量仓 | R 轮评估是否先 W 级灰度一档再升 E | — | CHANGELOG 写明 |

---

## 验收标准

- [ ] 错节 fixture 下 `lint-wiki-delta` 输出含 `wiki_delta_wrong_section` 且 **不含** `wiki_delta_missing`；exit≠0
- [ ] `--json` issues 元素含 `code: wiki_delta_wrong_section`、detail 含「须在 `## Harness 元信息` 表格内」
- [ ] `task lint --file` 对缺 `wiki_delta` 的 fixture 报 E8 error；补齐后 pass；错节 fixture E8 文案含正确节名
- [ ] `--strict` 既有断言全绿（invalid/path_missing 不回退）；既有 lint/close 测全绿
- [ ] `npm test` / `npm run typecheck` / `npm run build` 全绿；CHANGELOG + RUNBOOK 诊断码表已补

---

## 给执行帽的必读列表

1. 反馈证据：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §2 #72 · §3 K1/K2 · §5
2. `src/cli-shared.ts` `parseHarnessMeta` L72–91 · `extractSection`
3. `src/cli-task-extra.ts` `lintWikiDeltaMissing` L79–155（含 DEF-021 strict 档注释）
4. `src/cli-checks.ts` `lintTaskFile` L758–839 · `evalCloseWikiDelta` L283–309（词表同源约束）
5. `test/cli-lifecycle-guards.test.ts` · `test/cli-task-close-guards.test.ts`（fixture 模式参照）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | K1/K2 同属 wiki_delta lint 家族 → 单 task | no |
| R1 | 错节=诊断非兼容；不扩容错节名解析 | no |
| R2 | E8 直接 error vs 先 W 灰度 → 待 20 审裁定（建议 error，close 已同级） | no |
| R3 | 双报禁止：wrong_section 替代 missing | no |

**residual_risks**：错节启发式（全文找 `wiki_delta` 行）可能命中正文示例代码块 → detail 须带行号便于人判；存量仓 draft task 将新增 E8 拦截，CHANGELOG 须置顶提示。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 新诊断码与新 E 规则均须先有可失败 fixture 测试再改实现；既有 strict 档与 close 闸回归必须仍绿。

---

### 自检结论（执行者）

（30/40 回填）

---

### KPI（00）

（`kpi_aggregator: CLOSE` · 关账回溯填写）

---

### 经验总结

（关账回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 初稿：自 ops-desk-api FEEDBACK K1/K2 起草（00 单窗） |
