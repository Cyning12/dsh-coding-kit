# Task Audit R1：wiki-delta-section-diagnostics

> **task**：`docs/tasks/active/task_wiki_delta_section_diagnostics.md`（slug: `wiki-delta-section-diagnostics` · P1 · 对应 FEEDBACK K1/K2）  
> **日期**：2026-08-27  
> **角色**：20-task-audit（书面审 · 未改代码 / task / src）  
> **需求真值**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §1–§3 · §5（#72 run 33037752469 误报 · #70 missing ×4）

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容** | **零内容阻塞 → 签收**（可执行、锚点真实、无虚构旗标） |
| **流程闸** | HG-TASK-DRAFT=approved（维护者 Q1A · 授权 00 代签）；**HG-AUDIT-R1 仍 pending**，30 授权以 task 表 approved 为真值 |
| **dogfood** | `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_wiki_delta_section_diagnostics.md` → **LINT: PASS**（exit 0） |

---

## 核对项

### 1. 范围 / 非范围 对准 FEEDBACK K1/K2

- **K1 根因对准**：误报根因是 `parseHarnessMeta` 硬编码只认 `## Harness 元信息`（`src/cli-shared.ts` L74 实证）。task 选择「错节=诊断非兼容」——新增 `wiki_delta_wrong_section` 替代 missing，**不改**解析权威节名。与 FEEDBACK §3 K1 建议（新增 issue code + summary 提示 + 可选 `--fix-hint`）一致；`--fix-hint` 被显式列入非范围并留 R 轮决策，无 scope 膨胀。
- **K2 根因对准**：`lintTaskFile`（L758–839 实证：仅 E1–E7 / W1–W4，无 `wiki_delta` 检查）起草期确不拦；task 新增 **E8** 编号为下一空位，与 close guard `close_wiki_delta` 同级对齐。
- **非范围无禁区遗漏**：不改 `parseHarnessMeta` 权威节名、不做 `--fix` 自动改写、不改 `close_wiki_delta` 闸语义与 `--allow-wiki-gap` 豁免面、不新增 `--scope changed`（指向已存在 task `docs/tasks/active/task_prompts_ci_alignment.md` 实证）——关键禁区全覆盖。

### 2. 验收标准可执行性

- 5 条验收全部可证伪：fixture 驱动（错节/缺失/正常）+ exit 码 + `--json` 字段断言 + `--strict` 回归 + `npm test`/`npm run typecheck`/`npm run build`。
- 与仓内 CI（`.github/workflows/ci.yml`：`npm run typecheck` → `npm test` → `npm run build` → `npm run test:lib`）和 package.json scripts 一致（非阻塞观察①：CI 第 4 步 `test:lib` 未列入验收，建议 30/40 顺带跑）。
- 无不可证伪项。

### 3. 失败路径表

4 行全覆盖（错节 → wrong_section+行号+hint · 可重试 · 用户可见 / 完全缺失 → missing 现状不变 / draft 缺行 → E8 无豁免 / E8 误判存量仓 → R 轮灰度评估 + CHANGELOG 写明）。触发 / 系统行为 / 可重试 / 用户可见四列齐。

### 4. 思考轮控制表 与 residual_risks

- R0–R3 闭环（颗粒度 → 诊断非兼容 → E8 级别决策点 → 双报禁止），early_stop 列齐。
- **R2 决策点已显式留给 20 审**（「E8 直接 error vs 先 W 灰度 → 待 20 审裁定」）。**本审裁定：E8 直接 error，无需 W 灰度档**——`evalCloseWikiDelta`（L285–309）对缺字段同级 fail，draft 期早拦正是 K2 意图；存量仓影响已入 residual_risks 且 CHANGELOG 置顶提示已被验收第 5 条钉死。
- residual_risks 合理且诚实：错节启发式（全文找 `wiki_delta` 行）命中正文代码块的误判风险已登记，并以「detail 须带行号便于人判」缓解；存量 E8 拦截风险已登记。

### 5. 代码锚点真实性（抽查全中）

| task 引用 | 实证 | 判定 |
|-----------|------|------|
| `src/cli-shared.ts` `parseHarnessMeta` L72–91 · `extractSection` | 函数精确位于 L72–91；硬编码节名在 L74；`extractSection` 同文件 L50 附近 | ✅ |
| `src/cli-task-extra.ts` `lintWikiDeltaMissing` L79–155（含 DEF-021 strict 注释） | 函数精确位于 L79–155；DEF-021 注释 L73 / L121–123 在 | ✅ |
| `src/cli-checks.ts` `lintTaskFile` L758–839 | 精确命中；现行规则 E1–E7 / W1–W4，E8 为合法下一编号 | ✅ |
| `src/cli-checks.ts` `evalCloseWikiDelta` L283–309 | 注释 L283 起、函数 L285–310，引用区间覆盖函数体；词表同源（`WIKI_DELTA_LITERALS`/`WIKI_DELTA_PATHISH_RE`）实证 | ✅ |
| `src/cli.ts` L103 help 附近 | L103 恰为 `task lint-wiki-delta` 条目 | ✅ |
| `test/cli-lifecycle-guards.test.ts` · `test/cli-task-close-guards.test.ts` · `assets/docs/POINTER_RUNBOOK_wiki_delta.md` | 三者均存在 | ✅ |

### 6. 旗标 / 字段真伪

- `--json` / `--strict`：`cmdTaskLintWikiDelta`（`src/cli-task-extra.ts` L344–346）实证存在；exit 码族 0/1/2 与实现（`fail('', 2)` / 默认 1）一致。
- `--fix-hint`：src 内**不存在**，task 未声称其存在，仅作为非范围决策点（「独立旗标与否由 R 轮决策」）——无虚构。
- `node bin/dsh-coding-kit.js --help` 与 `src/cli.ts` usage 对照一致。

### 7. 设计自洽性（重点项）

- **wrong_section 替代 missing（不双报）**：可落地——`meta.wiki_delta == null` 分支内先全文搜 `wiki_delta` 行，命中则报 wrong_section 入 missing/issues，否则维持 missing；`--json` 与人读 summary 同码同文案已被验收第 2 条钉死。
- **E8 与 close_wiki_delta 词表一致性**：E8 仅查存在性，词表（path|none|n/a）与路径存在性仍归 close/strict——与 `evalCloseWikiDelta` 分层一致，无双轨词表风险。
- **`--strict` 语义不变**：W1 范围条 + 验收第 4 条（「invalid/path_missing 不回退」）双重钉死；DEF-021「新缺口只入 issues 不入 missing」的既有约束未被触碰。
- **错节启发式误判风险**：已入 residual_risks（见 §4）。

---

## 阻塞清单

**无内容阻塞。**

## 非阻塞观察（30/40 参考，不构成退回）

1. 验收未列 `npm run test:lib`（CI 第 4 步）；建议 40 自检顺带执行，与 CI 完全对齐。
2. W2 表述「`task lint` 人读输出与 `--strict` 不冲突」有歧义：`task lint` 本身无 `--strict` 旗标（仅 `--file`，`src/cli.ts` L577–578 实证）；应理解为「E8 属 task lint 默认档 error，与 lint-wiki-delta `--strict` 追加检查互不干扰」。实现时按此理解即可，无需改 task。
3. strict 档下错节场景无值可校，只报 wrong_section、不再触发 invalid/path_missing——「替代不双报」已足够约束，细节留 30。

---

## 签闸建议

- **内容面：签收**（R1 通过 · 零内容阻塞 · 不退回 10-task）。
- **流程面：HG-AUDIT-R1 仍 pending**。依维护者 Q1A 授权（00 代签过程闸），建议 00 在 task 人工闸表将 HG-AUDIT-R1 改为 `approved` 并注明代签依据；此后方可下发 30 Prompt。本审查文不附 30 Prompt。

```text
## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（本文 · 零内容阻塞）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（00 依 Q1A 授权代签 · 2026-08-27）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R1 通过：零内容阻塞签收；锚点 6/6 命中；dogfood PASS；R2 决策点裁定 E8=error 不灰度 |
