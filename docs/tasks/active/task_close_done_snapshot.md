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
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-27 维护者批准（Q1A）· 授权 00 代签过程闸 |
| HG-AUDIT-R1 | approved | 30 | 2026-08-27 20 审 R2 零阻塞签收（reviews/task_close_done_snapshot_audit_R2_20260827.md · R1 退回已回填 · done_snapshot 口径裁定唯绑 PASS）· 00 依维护者 Q1A 授权代签 |

---

## 背景与目标

#72 根因之一：Agent **手写** `docs/tasks/done/` 文件绕过 `task close` 的机械校验（节名/字段/invoke hats 全无保障），且写错节名后没有权威样板可对照。反馈建议：`task close` 成功 stdout 打印 **done 片段快照**（含 `## Harness 元信息` 模板），供 diff 对照，从 UX 上消灭「手写 done」的动机。

**完成态行为**：`task close --file … --yes` 归档成功（`CLOSE: PASS`）后，stdout 追加快照块：归档后路径 + 归档文件内 `## Harness 元信息` 表全文 + 一行「禁止手写 done · 以此快照为格式真值」提示。

---

## 范围

- [x] W1：`cmdTaskClose`（`src/cli.ts` L594–682 · PASS≈L682）PASS 分支打印快照块：`done_path` + 归档文件 `## Harness 元信息` 节原文摘录（用 `extractSection` 取，取不到则打印 canonical 模板占位）；dry-run（`CLOSE: READY`）**不打印**快照
- [x] W2：**新增** `task close --json` 旗标（现不存在，未知参数即 fail）；JSON 输出增 `done_snapshot: { path, harness_meta_section }` 字段（无快照场景为 null）
- [x] 同步 `TASK_USAGE`（src/cli.ts L686）与顶层 USAGE help 文案（src/cli.ts usage 块），纳入 `--json`
- [x] W3：`assets/harness/prompts/FRAGMENT_30_invoke_block_v1_zh.md` 补一句：「归档仅走 `task close --yes`；格式真值 = close 成功快照」
- [x] 单测：PASS 后 stdout 含快照与归档路径；READY 不含；`--json` 形状；豁免旗标（--allow-* 族）路径下快照仍打印
- [x] CHANGELOG `[Unreleased]` 增条

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
| `--json` 模式 | dry-run（READY）：JSON 输出 `done_snapshot: null`，退出 0；BLOCKED：非 0 退出，JSON 仅错误面（无快照字段） | 是 | 是 |

---

## 验收标准

- [x] `task close --yes` 成功：stdout 含 done 路径 + `## Harness 元信息` 表摘录 + 禁手写提示行
- [x] dry-run 输出与 1.7.1 逐字一致（回归测）
- [x] `--json` 两路径断言：PASS 有快照字段（`path` + `harness_meta_section`）；READY（dry-run，含豁免 dry-run）为 null；豁免 + --yes 的 PASS 路径 done_snapshot 字段非 null（与 stdout 快照一致）；既有 close 闸测（PR/Hub/wiki/kpi/experience）全绿
- [x] `typecheck` → `npm test` → `build` → `npm run test:lib` 全绿（对齐 .github/workflows/ci.yml 四步）；CHANGELOG 已增条

---

## 给执行帽的必读列表

1. 反馈证据 §2 #72 · §3 K5 · §5 正确 done 格式真值
2. `src/cli.ts` L594–682 `cmdTaskClose`（PASS/READY 分支 · READY≈L675 · PASS≈L682）· `src/cli-checks.ts` `evalCloseGuard`（close 守卫复用）
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
| R3+ | R1 退回回填：B1 锚点改 src/cli.ts L594–682（cmdTaskClose 不在 cli-lifecycle.ts）· B2 --json 显式声明新增 + TASK_USAGE/顶层 USAGE 同步 + dry-run/BLOCKED JSON 行为钉死 · N1 补 test:lib · N2 W3 唯一落点 | no |

**residual_risks**：stdout 变长，依赖精确匹配 PASS 后无输出的脚本极不可能但存在 → CHANGELOG 写明「PASS 后新增快照块」。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 快照 stdout/json 断言先红后绿；READY 与 1.7.1 逐字回归测必须仍绿。

---

### 自检结论（执行者）

30/40 同上下文连续两帽（2026-08-27）：

- **四步全绿**：`typecheck` ✓ · `npm test` **288/288**（基线 279 + 新 9）✓ · `npm run build` ✓ · `npm run test:lib` **4/4** ✓（`~/.npm` EPERM 为预存问题 · 全程 `npm_config_cache=$(mktemp -d)` 规避）
- **先红后绿**：新测先红（`buildDoneSnapshot` 未导出 · close 无 `--json` 未知参数即 fail · PASS 无快照）→ 实现后 9/9 绿
- **dogfood**：真实剩余 task（`task_prompts_ci_alignment.md` · draft）dry-run → BLOCKED 无快照（失败路径表「BLOCKED 无快照」现状不变 · 未动该 task）；临时 fixture（`/tmp/dsh-k5-dogfood` · 用后已清理）全路径手测：READY dry-run stdout 与 1.7.1 逐字一致无快照 · `--json` READY `done_snapshot:null` exit 0 · `--yes` PASS stdout 快照块（归档路径 + 元信息节摘录 + 禁手写行）· `--json --yes` PASS `done_snapshot:{path,harness_meta_section}` · `--json` BLOCKED exit 2 仅错误面无 `done_snapshot` 字段
- **口径落实**：`done_snapshot` null 唯绑归档事件（`renameSync` / `CLOSE: PASS`），与豁免旗标无关；豁免 + `--yes` → 非 null（20 审 R2 裁决）

#### 实现备忘（30）

- `src/cli-shared.ts`：`DoneSnapshot` 类型 + `buildDoneSnapshot(dest)`（`extractSection` 取归档文件 `## Harness 元信息` 节原文 · 与 `parseHarnessMeta` 同口径）+ `canonicalHarnessMetaSection()`（读 `assets/harness/templates/TASK_TEMPLATE.md` 摘录 · 兜底常量）
- `src/cli.ts` `cmdTaskClose`：`--json` 解析/过滤；traces 仅非 json 模式逐行打印（非 json 输出逐字不变）；BLOCKED/READY/PASS 三分支 json 通道；PASS 后 stdout 快照块（不改 `CLOSE: PASS` 冻结文案 · 仅追加）；`TASK_USAGE` 与顶层 USAGE 增 `[--json]`
- `assets/harness/prompts/FRAGMENT_30_invoke_block_v1_zh.md`：【禁止】补「归档仅走 `task close --yes`；格式真值 = close 成功快照」
- `test/cli-task-close-done-snapshot.test.ts`：9 例（PASS 快照 · READY 逐字回归 · `--json` PASS/READY/BLOCKED · 豁免 dry-run null · 豁免+`--yes` 非 null · helper 缺节异常态×2）
- CHANGELOG `[Unreleased]`：置顶消费者提示（「PASS 后新增快照块」）+ Added + Docs
- 不可达说明：「归档文件缺 `## Harness 元信息`」异常态经 close 正常路径不可达（`close_slug` 缺 `task_slug` 硬 fail 且无豁免旗标），防御分支由 `buildDoneSnapshot` helper 单测钉死
- 里程碑 commit：`431e1b7`（feat(task-close) · 5 files · 测 288/288）

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
| 2026-08-27 | R1 回填：B1 锚点修正（cmdTaskClose 真值 src/cli.ts L594–682 · READY≈L675 · PASS≈L682）· B2 显式新增 --json 旗标 + USAGE 同步 + 失败路径补 JSON 行 + 验收 --json 两路径断言 · N1 验收补 npm run test:lib · N2 W3 钉死 FRAGMENT_30_invoke_block_v1_zh.md |
