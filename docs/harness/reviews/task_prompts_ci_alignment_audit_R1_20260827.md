# Task Audit R1：prompts-ci-alignment

> **task**：`docs/tasks/active/task_prompts_ci_alignment.md`（slug: `prompts-ci-alignment`）  
> **日期**：2026-08-27  
> **角色**：20-task-audit（书面审 · 未改码 · 未改 task）  
> **证据基线**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §1–§3 · §5（K4/K6/K7 需求真值）  
> **帽条文**：`assets/harness/prompts/20-task-audit.md`

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容审查** | **零内容阻塞 → 签收**（可执行、锚点真实、无虚构旗标） |
| **流程闸** | `HG-TASK-DRAFT=approved`（维护者 Q1A · 授权 00 代签）· `HG-AUDIT-R1=pending` → **待维护者签闸，30 不得开工** |

---

## 核对项（K 项对照）

| # | 核对点 | 结论 |
|---|--------|------|
| 1 | K4（P2）范围对准 | ✅ W1 落 00-orchestrator 默认行为表 + 10-task 预填义务，正对症结（#70 兄弟 task 连带红）。FEEDBACK K4 原文建议「`--scope changed` 文档说明」本身有误——**该旗标不存在**（`src/cli-task-extra.ts:92-93` 仅 `all\|active\|done`，实跑 `--scope changed` 报错确认）；task R1 主动纠偏并明文禁虚构，**不是 scope 缩减而是纠错**。 |
| 2 | K6（P2）范围对准 | ✅ W2 落 TASK_TEMPLATE 验收节（`TASK_TEMPLATE.md:73`）+ 40-self-check「与子仓 CI 对齐者优先」（`40-self-check.md:25`）后补兜底。写「原则+示例（pytest/pnpm）而非硬编码 pytest」对全栈消费仓成立；R2 已记录该取舍。 |
| 3 | K7（P3）范围对准 | ✅ W3 落 20-task-audit「只做什么」checklist（`20-task-audit.md:23-31`）。仅 checklist 提醒、不进 `task lint` 机械闸：与 FEEDBACK §7（K7=P3 非阻塞）一致，residual_risks 已如实披露「靠 20 自律」。**可接受**。 |
| 4 | 无 scope 膨胀 | ✅ W4（README 同步 + 条件互链）/W5（资产单测）/W6（CHANGELOG）均为 prompts 改动标配伴生项；非范围正确排除 CLI 行为（K1/K2/K3/K5），且仓内确有三件姊妹 task 承接（`task_wiki_delta_section_diagnostics` / `task_verify_with_wiki_lint` / `task_close_done_snapshot`）。 |
| 5 | 与 close_done_snapshot W3 边界 | ✅ 彼改 `FRAGMENT_30_invoke_block_v1_zh.md`（30 片段一句指针），本 task 不触该文件；文件面零重叠。仅 CHANGELOG 共改（见非阻塞 N4）。 |
| 6 | 验收标准可执行/可证伪 | ✅ 全部可机器核对：锚点文件含指定行（grep 断言）、修订记录 +1、`npm test`/`typecheck`/`build` 与 `package.json` scripts 及 `.github/workflows/ci.yml` 一致、CHANGELOG 增条。**已钉死「命令串与 CI sample 逐字一致」**（验收第 1 条），CI sample 真值为 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`（`lint-wiki-delta.yml.example:33`）。 |
| 7 | 失败路径表 | ✅ 3 行均含 触发/系统行为/可重试/用户可见 四列；纯文案 task 的失败面（虚构旗标退回、README 未同步红 CI、消费仓未 sync 非缺陷）覆盖合理。 |
| 8 | 思考轮闭环 | ✅ R0–R3 均有结论 + early_stop=no + residual_risks 非空且诚实（sync 时机依赖 · K7 无机械校验）。 |
| 9 | 代码锚点真实性 | ✅ 抽查全过：00-orchestrator 默认行为表（:14-19）· 10-task-requirements · 40-self-check 只做什么（:22-27）· 20-task-audit checklist · TASK_TEMPLATE 验收节（:73）· `lint-wiki-delta.yml.example` · `assets/harness/prompts/README.md` · `test/assets.test.ts` / `test/assets-ontology.test.ts` 均存在且角色相符。 |
| 10 | 无虚构 CLI 旗标/字段 | ✅ task 内引用命令（`task lint-wiki-delta --target .`、`--scope all\|active`、`task lint --file`）均与 `--help` 及 src 实现一致；元信息字段均在 TASK_TEMPLATE 字段表内。 |
| 11 | dogfood | ✅ `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_prompts_ci_alignment.md` → `LINT: PASS`。 |
| 12 | test_strategy=required 适配性 | ✅ 纯文案 task 以 `test/assets*.test.ts` 资产校验 + 新文案 grep 断言为先红后绿载体，测试策略节已说明兜底（20 书面审 + 40 文档演练），不属滥用。 |

---

## 内容阻塞

**无。**

## 非阻塞观察（不阻 30，建议执行期顺手处理）

- **N1**：W1 内联示例写 `npx dsh-coding-kit task lint-wiki-delta --target .`，比 CI sample 少 `--yes`；验收第 1 条已钉「与 CI sample 逐字一致」，30 以验收条+sample 为准即可，建议 10 后续统一两处处串。
- **N2**：验收未列 `npm run test:lib`（仓 CI 有该 step）；不阻塞，30 可一并跑绿。
- **N3**：W4「POINTER_RUNBOOK_wiki_delta 若列 lint 时机则互链」——该文件为 8 行薄指针、无 lint 时机内容，条件不成立即 no-op，执行时如实记录即可。
- **N4**：本批四 task 均改 CHANGELOG `[Unreleased]`，建议串行合入防冲突。

---

## 签闸建议

**内容面签收**。流程面 `HG-AUDIT-R1` 仍 `pending`，按帽条文此处只给维护者签闸清单，**不附 30 Prompt**：

```text
## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（docs/harness/reviews/task_prompts_ci_alignment_audit_R1_20260827.md）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R1：内容零阻塞签收；列非阻塞 N1–N4；待维护者签 HG-AUDIT-R1 |
