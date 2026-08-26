# Task：落地 doc-health CLOSE 强绑定（W1–W4）

> **状态**：`done`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联 SPEC**：`docs/spec/doc-health/`（HG-SPEC-SIGNOFF=approved）  
> **00 颗粒度**：单 task 覆盖 W1 文案 + W2 PR 闸 + W3 Hub 闸 + W4 布局 warn；W0/试点已在 ops-desk-api

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `doc-health-close-binding` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `main` |
| **graph_delta** | `none` |
| **graph_delta_note** | docs-ops / CLI 闸；不改业务图谱 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 契约落 CHANGELOG + SPEC；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag，非业务 PR 闸对象 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-26 维护者授权 00 签收过程文档 |
| HG-AUDIT-R1 | approved | 30 | 同上；审查文见 reviews |

---

## 背景与目标

签收后的 `doc-health` SPEC：使 `task close` 完成态与文案一致（dry-run=`READY`；`--yes`=`PASS`），并叠加 `close_pr_merged` / `close_hub_index`（Hub：A + `close_hub_gate` 默开可关）；`check` 对根级裸 SPEC 打 WARN。发版目标 **1.7.0**（人 publish）。

---

## 范围

- [x] W1：dry-run `CLOSE: READY`；prompts/TEMPLATE/lifecycle/help 对齐
- [x] W2：`close_pr_merged` + `--allow-no-pr-merge` + 元信息 exempt
- [x] W3：`close_hub_index` + `close_hub_gate`（local.json）+ `--allow-no-hub`
- [x] W4：`check` 扫描 `docs/spec/SPEC-*.md` 根级裸文件 WARN；SPEC/README 已有索引
- [x] 单测钉死；CHANGELOG + 版本钉 1.7.0

## 非范围

- 不自动 `gh pr merge`；不改业务仓 `app/`
- 不搬迁历史裸 SPEC 文件；不实现健康度评分脚本（W5）
- 不执行 `npm publish`（人）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| PR 未 MERGED 且无豁免 | `CLOSE: BLOCKED · close_pr_merged` | 是 | 是 |
| 有 Hub 无索引行且闸开 | `CLOSE: BLOCKED · close_hub_index` | 是 | 是 |
| dry-run 被当成已归档 | 输出 `CLOSE: READY` 非 PASS | — | 是 |
| `close_hub_gate: false` | skip Hub 闸并留痕 | — | 是 |

---

## 验收标准

- [x] dry-run 匹配 `CLOSE: READY`；`--yes` 匹配 `CLOSE: PASS` 且文件进入 done/
- [x] `close_pr_merged`：OPEN→BLOCKED；MERGED/exempt/allow→过
- [x] `close_hub_index`：skip/block/allow/`close_hub_gate:false` 四路径
- [x] `npm test` 含新测全绿；`typecheck`/`build` 绿
- [x] CHANGELOG `[1.7.0]` + pins 与 package.json 一致

---

## 给执行帽的必读列表

1. `docs/spec/doc-health/README.md` · `02_close_binding.md` · `05_execution_waves.md`
2. `src/cli.ts` `cmdTaskClose` · `src/cli-checks.ts` `evalCloseGuard`
3. `test/cli-task-close-guards.test.ts`
4. `RELEASING.md`（人 publish；本 task 可 push+tag）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | SPEC 已签；单 task 落地 W1–W4 | no |
| R1 | 范围=kit CLOSE 闸；非范围=publish/app | no |
| R2 | 单 task vs 三 task → **单 task**（同发版单元） | no |
| R3 | 既有 close 测须 fixture exempt PR；Hub 无文件 skip | no |
| R4 | test_strategy=required；测名见 SPEC §8 | no |
| R5 | 闸已签；交 30 | no |

**residual_risks**：`gh` 无网络 CI 依赖 exempt/allow；Hub 链接匹配启发式（basename）可能过宽/过严 → FEEDBACK。

---

### 自检结论（执行者）

自检已回填（2026-08-26）：`npm run typecheck` 绿；`npm test` 258 pass / 0 fail；`npm run build` 绿。dry-run/READY、PR/Hub 新测与既有 close 闸回归均过。版本钉 1.7.0 与 CHANGELOG 对齐。

---

### KPI（00）

Task_KPI%: 92

---

### 经验总结

- CLOSE 文案拆分（READY vs PASS）必须先改单测期望，再改 CLI，否则全仓 dry-run 断言连环红。
- 新增 close 闸后，legacy fixture（cli-p0 C7）必须同步 `--allow-no-pr-merge`；Hub 文件一旦写入 done/ 会立刻触发索引闸。
- DEF-003 资产锚点 allowlist 与 prompts 声称句式强耦合；改 30/TEMPLATE 文案时须保留「本包已接线」锚点子串。
- 版本 bump 勿对测试里「高于包版本」fixture 做盲目全局替换（D30-2 须保持 fixture > package）。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | 00 建单 · 过程闸 approved |
| 2026-08-26 | 30 落地 W1–W4 · 测绿 · 待 close |