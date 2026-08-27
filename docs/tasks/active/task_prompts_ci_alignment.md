# Task：prompts/模板与 CI 对齐（K4 bulk-split 早检 · K6 默认验收 · K7 行为变更旧测提醒）

> **状态**：`draft`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联证据**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §3 **K4（P2）/ K6（P2）/ K7（P3）** · §4 L1–L4（消费仓侧对照）  
> **拟发版**：`dsh-coding-kit@1.8.0`（建议与本批同波；可独立 PR）  
> **00 颗粒度**：单 task 覆盖三处 prompts/模板资产；同为「起草→自检与 CI 对齐」主题、同一发版单元

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `prompts-ci-alignment` |
| **test_strategy** | `required` |
| **test_strategy_note** | 资产校验/清单单测（`test/assets*.test.ts`）须同步更新并先红后绿；prompts 文案变动附 grep 断言 |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/prompts-ci-alignment` |
| **graph_delta** | `none` |
| **graph_delta_note** | prompts/模板资产文案；不改图谱 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | prompts 资产即交付物本体；契约落 CHANGELOG |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-27 维护者批准（Q1A）· 授权 00 代签过程闸 |
| HG-AUDIT-R1 | approved | 30 | 2026-08-27 20 审 R1 零阻塞签收（reviews/task_prompts_ci_alignment_audit_R1_20260827.md）· 00 依维护者 Q1A 授权代签 |

---

## 背景与目标

#70 根因之二：00 自 SPEC 签收**一次拆 4 个 active task** 未批量预填 `## Harness 元信息` + `wiki_delta`，第一棒 PR 被兄弟 task 连带打红（K4）。#70/#71 根因：task 验收只列 pytest 子集，`40-self-check` 虽写「与子仓 CI 对齐者优先」但无默认命令兜底（K6）；行为变更类 task（Policy 门 / supervisor 校验）无「grep 旧测默认 ok 假设」提醒（K7）。

**完成态行为**：Starter prompts 与 TASK_TEMPLATE 把「bulk-split 后必跑 `lint-wiki-delta`」「默认验收 = 仓 CI 全量命令 + `lint-wiki-delta`」「行为变更 task 须含旧测 grep 影响面」固化为条文，消费仓 upgrade/sync 后即得。

---

## 范围

- [ ] W1（K4）：`assets/harness/prompts/00-orchestrator.md` 默认行为表增行——「bulk-split（一次拆 ≥2 个 active task）后、派第一棒 30 前，必跑 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`」；`assets/harness/prompts/10-task-requirements.md` 补「批量拆 task 时每个文件必须预填 `## Harness 元信息` + `wiki_delta`」；附 `--scope all|active` trade-off 两行说明（`--scope changed` 不存在，文案禁止虚构旗标）
- [ ] W2（K6）：`assets/harness/templates/TASK_TEMPLATE.md` 验收标准占位增默认两行——「全量测试命令（与本仓 CI workflow 一致，如 `pytest tests -q` / `pnpm test`）」+「`task lint-wiki-delta --target .`」；`assets/harness/prompts/40-self-check.md`「与子仓 CI 对齐者优先」后补：task 未列全量命令时按 `.github/workflows/` 真值补齐再自检
- [ ] W3（K7）：`assets/harness/prompts/20-task-audit.md`「只做什么」checklist 增一条——行为变更类 task（改默认值 / 校验 / 策略门 / fallback 语义）验收须含「旧测 grep 影响面」项，缺则退回 10-task
- [ ] W4：`assets/harness/prompts/README.md` 与各文件修订记录同步；`assets/docs/POINTER_RUNBOOK_wiki_delta.md` 若列 lint 时机则互链
- [ ] 资产单测同步：`test/assets.test.ts` / `test/assets-ontology.test.ts` / skills 校验测全绿；新增文案附 grep 断言
- [ ] CHANGELOG `[Unreleased]` 增条（主题：prompts 与 CI 对齐）

## 非范围

- 不改 CLI 行为（K1/K2/K3/K5 属本批另三件 task）
- 不改工作区 Extended 版 prompts（Ink 工作区 `docs/harness/prompts/` 由消费侧 sync 获得）
- 不替消费仓执行 §4 L1–L4（属 ops-desk-api 本仓纪律，非 kit 交付物）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 文案虚构不存在的 CLI 旗标 | 20 审退回 10-task | 是 | 审查文 |
| prompts README 清单未同步 | 资产单测红 | 是 | CI |
| 消费仓未 upgrade/sync | 新条文不生效（预期，非缺陷） | — | CHANGELOG 消费者提示 |

---

## 验收标准

- [ ] 00-orchestrator.md 含 bulk-split 早检行，命令串与 CI sample 逐字一致
- [ ] TASK_TEMPLATE.md / 40-self-check.md 含默认验收两行；20-task-audit.md 含行为变更旧测提醒条
- [ ] 全部改动文件修订记录 +1 行；prompts README 清单一致
- [ ] `npm test`（含资产/清单/skills 校验）/ `typecheck` / `build` 全绿
- [ ] CHANGELOG 增条且含消费者提示（upgrade/sync 后生效）

---

## 给执行帽的必读列表

1. 反馈证据 §2 #70/#71 · §3 K4/K6/K7 · §8 PR 前推荐命令块
2. `assets/harness/prompts/00-orchestrator.md` 默认行为表 · `10-task-requirements.md`
3. `assets/harness/templates/TASK_TEMPLATE.md` 验收标准节 · `assets/harness/prompts/40-self-check.md`「只做什么」
4. `assets/harness/prompts/20-task-audit.md` checklist · `assets/ci/samples/lint-wiki-delta.yml.example`
5. `test/assets.test.ts` · `test/assets-ontology.test.ts`（资产校验模式）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | K4/K6/K7 同属 prompts/模板文案 → 单 task 同发版 | no |
| R1 | 只写现存 CLI 旗标；`--scope changed` 禁止入文案 | no |
| R2 | 默认验收写「与仓 CI 一致」原则 + 示例，不硬编码 pytest | no |
| R3 | K7 为 checklist 提醒非机械闸；不进 `task lint` 规则 | no |

**residual_risks**：条文强度依赖消费仓 sync 时机；K7 提醒靠 20 自律，无机械校验（P3 可接受）。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 资产清单/文案 grep 断言随改动同步，先红后绿；纯文案段落以 20 书面审 + 40 文档演练兜底。

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
| 2026-08-27 | 初稿：自 ops-desk-api FEEDBACK K4/K6/K7 起草（00 单窗） |
