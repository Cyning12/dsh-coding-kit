# Task Audit R1：verify-with-wiki-lint

> **task**：`docs/tasks/active/task_verify_with_wiki_lint.md`（slug: `verify-with-wiki-lint` · FEEDBACK K3 · P2）
> **日期**：2026-08-27
> **角色**：20-task-audit（书面审 · 未改 task / src / docs/tasks/）
> **对照真值**：`ops-desk-api/docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §3 K3、§5 · `assets/ci/samples/lint-wiki-delta.yml.example` · `src/cli.ts` · `src/cli-task-extra.ts` · `.github/workflows/ci.yml` · `package.json`

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容** | **退回 10-task**（2 项内容阻塞，见下） |
| **流程闸** | HG-TASK-DRAFT = approved（维护者 Q1A 授权 00 代签）；HG-AUDIT-R1 = **pending**（内容阻塞未清，本论不签） |
| **下一棒** | **10-task**（回填阻塞清单后 R2 复审；本审查文**不**附 30 Prompt） |

---

## 核对项（已通过）

| # | 核对项 | 结果 |
|---|--------|------|
| 1 | K3 范围对准根因（verify 双轨 → 单旗标复用 lintWikiDeltaMissing） | ✅ 无 scope 膨胀；单 task 单旗标颗粒度合理 |
| 2 | 非范围无遗漏禁区：不改 verify 默认行为、不动 gate-check/audit、preset 机制本体与 `--scope changed` 排除 | ✅ preset 默认开启被两处钉死在 task 外（范围 W1 决策点「默认不做…若做则另起 task」+ 非范围第 3 条） |
| 3 | 代码锚点：`cmdVerify` 于 src/cli.ts **L460** 精确命中；usage verify 行 = **L85**，usage 块迄 L105（必读 L85–105 ✓）；`lintWikiDeltaMissing` 导出 = cli-task-extra.ts **L79**，签名 `(target, { scope?, strict? })` 返回 `{ ok, missing, issues, scanned, scope, strict }` —— 与 task 引用 `lintWikiDeltaMissing(target, { scope: 'all' })` 及 `--json` 的 `wiki_lint.ok/issues/scanned` 字段**逐一吻合** | ✅ |
| 4 | 无虚构 CLI 旗标/字段：task 引用的既有旗标（--task/--spec/--json/--target/--allow-*）与 `node bin/dsh-coding-kit.js --help`、cmdVerify 解析逐一相符；`--with-wiki-lint` 为本 task 新增交付物，非虚构既有物；「fail 族」用法错误 = cli.ts L484 `fail('verify 未知参数…')`、--task/--spec 互斥 = L487 | ✅ |
| 5 | 必读测试锚点 `test/cli-verify-invoke-hats.test.ts` / `cli-verify-review.test.ts` / `cli-verify-spec.test.ts` 均存在 | ✅ |
| 6 | 非破坏承诺钉死：验收「无旗标时行为与 1.7.1 逐字一致（回归测）」+ 思考轮 R3，可测（对拍 1.7.1 stdout/exit code） | ✅ 可证伪 |
| 7 | 失败路径表：触发/系统行为/可重试/用户可见四列齐备，3 行覆盖缺口 BLOCKED / 旗标拼错 / 缺 --task·--spec | ✅ 完整 |
| 8 | 思考轮控制 R0–R3 闭环，early_stop 全 no；residual_risks 两条（--spec 语义、scope=all 兄弟 task 噪音）合理且均有去处 | ✅ |
| 9 | dogfood：`node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_verify_with_wiki_lint.md` → **LINT: PASS**（exit 0） | ✅ |
| 10 | `--spec` 模式旗标语义决策点：task 已写明「同生效或显式拒绝，R 轮定」 | ✅ 决策点存在；R1 裁决见下 |

---

## 内容阻塞（退回 10-task · 指向 task 小节）

### B1 · 「与 CI 完全相同命令」与 sample 实际命令不一致（task §范围 W1 / §背景与目标·完成态行为 / §验收标准 第 1 条）

- task 完成态行为承诺「打印与 CI **完全一致**的复跑命令」，W1 钉的字面量为 `npx dsh-coding-kit task lint-wiki-delta --target .`；
- 但 `assets/ci/samples/lint-wiki-delta.yml.example` L33 实际命令为 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`（**含 `--yes`**）；
- 缺 `--yes` 在 npx 无缓存环境会交互式提示「Ok to proceed?」，CI-like 非 TTY 下挂起——「完全相同」承诺被 task 自己钉的字面量证伪；
- 且验收第 1 条仅断言 stdout **含子串** `task lint-wiki-delta --target .`，即使实现印错字面量也会绿——验收未钉死 task 自己的核心承诺（K3 的根因诉求）。
- **回填要求**：W1 复跑命令字面量改为 sample 原文 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`（或全文统一后同步 sample 注释互链），验收第 1 条改为**全串断言**。

### B2 · 验收标准与仓内 CI 不一致：缺 `npm run test:lib`（task §验收标准 第 3 条）

- `.github/workflows/ci.yml` L21–24 顺序为 `typecheck → npm test → build → test:lib`（文件头注释明示用途即拦 src→lib 漂移）；`package.json` scripts 亦含 `test:lib`（lib-smoke）；
- 本 task 改的正是 `src/cli.ts` CLI 面，src→lib 漂移恰是 test:lib 的拦截面；验收只写「npm test / typecheck / build 全绿」，30/40 本地全绿仍可能在 CI test:lib 翻红——与本 task 自身要消灭的「本地≠CI」双轨同构。
- **回填要求**：验收第 3 条补 `npm run test:lib`（与 ci.yml 四步全对齐）。

---

## 非阻塞建议（不挡 30，可随手带走）

- 失败路径表可补一行边缘：target 无 `docs/tasks/` 目录时 `lintWikiDeltaMissing` 返回 `ok:true, scanned:0`（cli-task-extra.ts L102 `continue`）→ verify 不应误 BLOCKED，建议单测覆盖。
- 验收第 2 条「verify 结果与不加坡一致」疑为「不加**旗标**」笔误，R2 顺手修。

---

## R 轮裁决（task 明示「R 轮定」项）

**`--spec` 模式下 `--with-wiki-lint` 语义：同生效。** 理由：① 旗标语义跨模式一致，避免新增「此处拒绝彼处生效」的特例错误面；② `lintWikiDeltaMissing` 以 target 为作用域，与 task/spec 内容正交，复用零成本；③ scope=all 的兄弟 task 噪音风险已在 residual_risks 明示，文案照写「缺口可能来自兄弟 task」即可。10-task 回填时把验收第 3 条「（建议同生效或显式拒绝，R 轮定）」改为「**同生效（R1 已定）**」。

---

## 签闸建议

- **HG-AUDIT-R1 维持 pending**：内容阻塞 B1/B2 未清，不进入维护者签闸流程；
- 10-task 回填后走 **R2 复审**（20-task-audit），零阻塞后再请维护者签 HG-AUDIT-R1 → approved；
- 本审查文不附 30 Prompt（闸 pending + 有内容阻塞，双重禁止）。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R1：退回 10-task（B1 复跑命令与 CI sample 不一致且验收未钉死；B2 验收缺 test:lib）；--spec 同生效裁决；dogfood PASS |
