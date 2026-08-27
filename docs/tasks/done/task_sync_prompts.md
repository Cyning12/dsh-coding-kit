# Task：新增 sync prompts 子命令（upgrade 不同步 prompts 复发根治）

> **状态**：`done`  
> **关联图谱**：无（`graph_change_layer=none`；self-tech-graph SPEC 签收后可补挂 `10_flow_sync`）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（同波起草 · 无阻塞依赖）  
> **关联证据**：`ops-desk-api` 仓 `docs/spec/doc-health/feedback/2026-08-27_1.8.0_upgrade-no-prompt-sync.md` + `docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_8_0_from_ops_desk_api_20260827.md` §1（K1–K7 已全修 · 唯一残余摩擦）· 前案 `2026-08-26_1.7.1_upgrade-no-prompt-sync.md`  
> **拟发版**：`dsh-coding-kit@1.9.0`（建议 · **本 task 不执行 tag/publish**）  
> **00 颗粒度**：**单 task 单命令** · 三波 P1→P2→P3（见下 §00 执行波次）· `--force` 与 upgrade 提示已 R1 裁定入 scope

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `sync-prompts` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **entry_invoke_30** | `docs/harness/invokes/by-task/sync-prompts/invoke_20260827_30_40_sync-prompts.md` |
| **git_branch** | `task/sync-prompts` |
| **graph_delta** | `none` |
| **graph_delta_note** | CLI 新子命令；self-tech-graph 图谱若先落地则补挂，否则 none |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约落 CHANGELOG；kit 自身不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag |
| **maintainer_release_hold** | `true` — CLOSE/merge 后 **停于发布前**；`npm publish` / `v1.9.0` tag 仅维护者 |
| **related_pr** | `#20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-27 维护者授权 00 签收 · 代签过程闸 |
| HG-AUDIT-R1 | approved | 30 | 2026-08-27 20 审 R1 零阻塞（`reviews/task_sync_prompts_audit_R1_20260827.md`）· 00 依授权代签 |

### 00 维护者授权（2026-08-27）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| task 签收 / R1 审 / 颗粒度拆分 | ✅ | — |
| 调度 30→40→50→CLOSE | ✅ | — |
| PR 创建 / merge | ✅ | — |
| `npm publish` / git tag / 正式版 CHANGELOG 节 | ⛔ | ✅ 发布前由维护者操作 |

---

## 背景与目标

**复发事实**：1.7.1 与 1.8.0 两版 CHANGELOG 消费者提示均写「upgrade / sync prompts 后生效」，但 `upgrade` 只写 manifest，`sync` 仅有 `sync index`（`src/cli-sync.ts` L101–115）——**承诺的机制不存在**，消费仓连续两波靠人工 `cp` 6 个 prompt + TASK_TEMPLATE 补齐。

**完成态行为**：`npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]` 将包内 Starter 白名单同步到用户仓 `docs/harness/prompts/`（+ `docs/harness/templates/TASK_TEMPLATE.md`）；dry-run 为默认（打印 skip/add/conflict 清单），`--yes` 执行写入（仅 add + 目标目录 mkdir）；已存在文件按 SHA-256 内容摘要三分：一致 skip · 不存在 add · 本地已改 → conflict **不覆盖**（`--force` 显式覆盖）。

---

## 范围

### W1 · 核心 CLI

- [x] `cmdSync` 增 `prompts` 子命令（`src/cli-sync-prompts.ts` + `cli-sync.ts` 路由）
- [ ] **白名单（R1 钉死）**：
  - 源 `assets/harness/prompts/`：`00-orchestrator.md` · `10-task-requirements.md` · `10-spec-requirements.md` · `20-task-audit.md` · `20-spec-audit.md` · `30-execute-code.md` · `40-self-check.md` · `FRAGMENT_30_gate_verify_v1_zh.md` · `TEMPLATE_30_gate_stop.md`（**不含** `README.md`）
  - 源 `assets/harness/templates/`：`TASK_TEMPLATE.md`
  - 目标：同文件名 → `docs/harness/prompts/` · `docs/harness/templates/`
- [x] 前置：目标仓须存在 `.cyning-harness/manifest.json`（否则 fail exit 1 · 提示先 `init`）
- [x] SHA-256 三分 · dry-run 默认 · `--yes` 写入 · `--json` 输出 `{ dry_run, skip[], add[], conflict[], written[] }`

### W2 · 冲突 UX + `--force`

- [x] conflict 文件打印「本地已改 · 未覆盖 · 对照包内 `<rel>`」
- [x] `--force`：conflict 文件覆盖写入（显式 opt-in · **R1 已裁定入 scope**）

### W3 · 文档 + upgrade 提示

- [x] CHANGELOG `[Unreleased]` 增条（兑现「sync prompts 后生效」· 注明 1.7.1/1.8.0 提示语滞后）
- [x] usage/help（`src/cli.ts` L98+）+ README（en/zh-CN）同步
- [x] `upgrade` 结尾加只读提示行（**R1 已裁定加** · 不改 upgrade 写面）

### W4 · 测试 + dogfood

- [x] 单测：`test/cli-sync-prompts.test.ts`（13 测 · 三分/幂等/dry-run/json/force/upgrade 提示）
- [x] 40 四步：`npm run typecheck && npm test && npm run build && npm run test:lib` 全绿（310/310 · lib 4/4）
- [x] dogfood：临时 consumer fixture init → dry-run 10 add → `--yes --json` 写入成功

## 非范围

- 不改 `upgrade` 既有写面（仅允许加提示行 · R1 已批准）
- 不同步 IDE 块（`refresh-ide-blocks` 既有面）· 不同步 skills（`skills install` 既有面）· 不动 assets 源文件
- 不做版本间 diff 式「增量条文提示」（超 scope · 可另案）
- **不执行** `npm publish` · git tag · `[Unreleased]` → `[1.9.0]` 正式节（维护者发布前操作）

---

## 00 执行波次（颗粒度）

| 波 | 交付 | 30 退出条件 | 估时 |
|----|------|-------------|------|
| **P1** | W1 核心 + 单测骨架（add/skip/conflict/dry-run/json） | P1 单测绿 | 1 棒 |
| **P2** | W2 `--force` UX + W3 文档/upgrade 提示 | help/README/CHANGELOG 互链 | 同棒或 +0.5 |
| **P3** | W4 幂等/dogfood + 40 四步回填 | 297+ 测全绿 · 自检表满 | 同棒 |

> **不拆子 task 理由**：单 CLI 子命令 · 单 exit 面 · 单 CHANGELOG 条目 · 与 verify-with-wiki-lint / prompts-ci-alignment 同颗粒度。

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 目标仓无 `.cyning-harness/manifest.json` | fail（用法/前置错误 · exit 1 · 提示先 init） | 是 | 是 |
| 本地文件内容与包内基线不同 | conflict 列出 · 不覆盖（`--force` 除外） | 是 | 是 |
| dry-run | 仅打印三分清单 · 零写入 | — | 是 |
| 二跑 `--yes` | 全 skip（幂等） | — | 是 |

---

## 验收标准

- [x] 三分路径（skip/add/conflict）各有单测与 dogfood 实证；conflict 默认绝不覆盖
- [x] dry-run 默认零写入；`--yes` 后目标仓获得 Starter 9 文件 + TASK_TEMPLATE（对照包内 assets）
- [x] 幂等：连跑两次第二次全 skip；`--json` 形状 `{ dry_run, skip, add, conflict, written }` 有断言
- [x] `npm run typecheck && npm test && npm run build && npm run test:lib` 全绿
- [x] CHANGELOG + usage + README 同步；「sync prompts 后生效」承诺变为真实命令
- [x] **未** bump 版本号 / tag / publish（维护者保留）

---

## 给执行帽的必读列表

1. 反馈两文（ops-desk-api · 路径见文首关联证据）· 前案 1.7.1 同题反馈
2. `src/cli-sync.ts` cmdSync（L101–115 · 现仅 index 子命令）· `src/cli.ts` 命令路由与 usage L98
3. `assets/harness/prompts/README.md` Starter 表（白名单真值）· `skills check` drift 先例（`src/cli-skills.ts` L218–236 · 逐字 equality · 本 task 用 SHA-256 摘要）
4. 测试参照：`test/cli-verify-with-wiki-lint.test.ts`（fixture 仓模式）
5. R1 审：`docs/harness/reviews/task_sync_prompts_audit_R1_20260827.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 独立 sync prompts 子命令 > 塞 upgrade（不改 upgrade 写面 · 反馈建议原文即允许二选一） | no |
| R1 | SHA-256 三分（skip/add/conflict 不覆盖）· `--force` **入 scope（20 审 R1 已定）** | no |
| R2 | dry-run 默认 + --yes 执行 · 与 kit 既有闸风格一致 | no |
| R3 | upgrade 提示行 **加（20 审 R1 已定）** · JSON schema 钉死 | no |

**residual_risks**：本地手补版与包内 1.8.0 版的首次 conflict 量可能大（ops-desk-api 即此态）——首跑清单需人读；基线摘要无从知「本地版出自哪个包版本」，仅能做内容比对。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 三分路径/幂等/dry-run/json/`--force` 均先红后绿；CI 四步全绿。

---

### 自检结论（执行者）

**四步（40 · 2026-08-27 · 本机 macOS）**：

| 步 | 命令 | 退出码 | 结果 |
|----|------|--------|------|
| 1 | `npm run typecheck` | 0 | ✅ |
| 2 | `npm_config_cache=$(mktemp -d) npm test` | 0 | ✅ **310/310**（基线 297 + 新增 13） |
| 3 | `npm run build` | 0 | ✅ |
| 4 | `npm_config_cache=$(mktemp -d) npm run test:lib` | 0 | ✅ 4/4 |

**dogfood**：临时 consumer 仓 `init --yes` → `sync prompts` dry-run 列出 10 add · `--yes --json` 全写入。

**实现备忘（30）**：

- `src/cli-sync-prompts.ts`：白名单 · SHA-256 三分 · `applySyncPrompts` · human/json 输出
- `src/cli-sync.ts`：子命令路由 · 双层 `--help`
- `src/cli.ts`：usage + upgrade 提示行
- `test/cli-sync-prompts.test.ts`：13 测
- 文档：CHANGELOG `[Unreleased]` · README en/zh-CN · `test/cli-help.test.ts`

---

### KPI（00）

Task_KPI%: 95

- 验收全勾 · 四步全绿 · verify PASS · 单棒 P1–P3 同窗交付
- 根因（CHANGELOG 承诺无命令）直接闭环 · 未 bump 版本/tag（维护者保留）

---

### 经验总结

- 「upgrade / sync prompts 后生效」类消费者文案须与 **真实子命令** 同 PR 交付，否则每波 upgrade 仍靠人工 cp
- SHA-256 三分 + `--force` opt-in 与 skills install 心智一致；首跑 conflict 清单应默认 dry-run 让人读

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 初稿：自 ops-desk-api 1.8.0 复发反馈起草（00）· 维护者明示：起草但不开始 |
| 2026-08-27 | 30+40：实现 sync prompts · 310 测 · CLOSE 待 merge |
