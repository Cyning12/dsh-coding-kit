# Task：task close 成功输出 done 片段快照（K5）

> **状态**：`draft`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联证据**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §3 **K5（P2）** · §2 #72（手写 done 绕过 close）  
> **拟发版**：`dsh-coding-kit@1.8.0`（建议与本批同波；可独立 PR）  
> **00 颗粒度**：单 task：CLI 快照输出 + 30 片段一句指针

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `close-done-snapshot` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/close-done-snapshot` |
| **graph_delta** | `none` |
| **graph_delta_note** | CLI 输出 UX；不改图谱资产 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约落 CHANGELOG；kit 自身不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | pending | 22-R1, 30 | 初稿人扫 |
| HG-AUDIT-R1 | pending | 30 | 20 R1 落盘后人签 |

---

## 背景与目标

#72 根因之一：Agent **手写** `docs/tasks/done/` 文件绕过 `task close` 的机械校验（节名/字段/invoke hats 全无保障），且写错节名后没有权威样板可对照。反馈建议：`task close` 成功 stdout 打印 **done 片段快照**（含 `## Harness 元信息` 模板），供 diff 对照，从 UX 上消灭「手写 done」的动机。

**完成态行为**：`task close --file … --yes` 归档成功（`CLOSE: PASS`）后，stdout 追加快照块：归档后路径 + 归档文件内 `## Harness 元信息` 表全文 + 一行「禁止手写 done · 以此快照为格式真值」提示。

---

## 范围

- [ ] W1：`cmdTaskClose`（`src/cli-lifecycle.ts`）PASS 分支打印快照块：`done_path` + 归档文件 `## Harness 元信息` 节原文摘录（用 `extractSection` 取，取不到则打印 canonical 模板占位）；dry-run（`CLOSE: READY`）**不打印**快照
- [ ] W2：`--json` 输出增 `done_snapshot: { path, harness_meta_section }` 字段（无快照场景为 null）
- [ ] W3：`assets/harness/prompts/FRAGMENT_30_invoke_block_v1_zh.md`（或 30-execute-code 关账节）补一句：「归档仅走 `task close --yes`；格式真值 = close 成功快照」
- [ ] 单测：PASS 后 stdout 含快照与归档路径；READY 不含；`--json` 形状；豁免旗标（--allow-* 族）路径下快照仍打印
- [ ] CHANGELOG `[Unreleased]` 增条

## 非范围

- 不检测 / 不拦截「手写 done」存量文件（属 lint-done 或另案；本 task 只做正向快照）
- 不改归档文件内容本身与 `CLOSE: READY/PASS` 文案（1.7.0 已冻结语义）
- 不改 close 闸集合与豁免面

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| close BLOCKED | 无快照（现状不变） | 是 | 是 |
| 归档文件缺 `## Harness 元信息`（异常态） | 快照位打印 canonical 模板 + WARN 行 | 是 | 是 |
| dry-run | `CLOSE: READY`，无快照 | — | 是 |

---

## 验收标准

- [ ] `task close --yes` 成功：stdout 含 done 路径 + `## Harness 元信息` 表摘录 + 禁手写提示行
- [ ] dry-run 输出与 1.7.1 逐字一致（回归测）
- [ ] `--json` 含 `done_snapshot`；既有 close 闸测（PR/Hub/wiki/kpi/experience）全绿
- [ ] `npm test` / `typecheck` / `build` 全绿；CHANGELOG 已增条

---

## 给执行帽的必读列表

1. 反馈证据 §2 #72 · §3 K5 · §5 正确 done 格式真值
2. `src/cli-lifecycle.ts` `cmdTaskClose`（PASS/READY 分支）· `src/cli-checks.ts` `evalCloseGuard`
3. `src/cli-shared.ts` `extractSection`（快照摘录复用）
4. `test/cli-task-close-guards.test.ts`
5. `assets/harness/prompts/FRAGMENT_30_invoke_block_v1_zh.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 快照是 UX 正向引导，不做手写检测负向闸 | no |
| R1 | READY 不打印，避免快照被当成已归档证据 | no |
| R2 | 摘录归档文件真值 > 打印静态模板（防模板漂移） | no |

**residual_risks**：stdout 变长，依赖精确匹配 PASS 后无输出的脚本极不可能但存在 → CHANGELOG 写明「PASS 后新增快照块」。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 快照 stdout/json 断言先红后绿；READY 与 1.7.1 逐字回归测必须仍绿。

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
| 2026-08-27 | 初稿：自 ops-desk-api FEEDBACK K5 起草（00 单窗） |
