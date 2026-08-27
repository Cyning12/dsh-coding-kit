# Task：verify --task 纳入 wiki lint（K3）

> **状态**：`draft`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联证据**：`ops-desk-api` 仓 `docs/harness/evidence/FEEDBACK_agent_host_plan_ci_20260827.md` §3 **K3（P2）**  
> **拟发版**：`dsh-coding-kit@1.8.0`（建议与本批同波；可独立 PR）  
> **00 颗粒度**：单 task 单旗标；preset 默认开启为独立决策点

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `verify-with-wiki-lint` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/verify-with-wiki-lint` |
| **graph_delta** | `none` |
| **graph_delta_note** | CLI 旗标；不改图谱资产 |
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

30 帽 GATE_VERIFY 跑 `verify --task`，PR CI 跑 `lint-wiki-delta`，**双轨**：#70 类「兄弟 active task 缺 `wiki_delta`」在 30 自检阶段不可见，到 CI 才红。反馈建议 `verify` 增 `--with-wiki-lint`（或 preset 默认开启），且 BLOCKED 时打印与 CI 相同命令。

**完成态行为**：`npx dsh-coding-kit verify --task <file> --with-wiki-lint` 在既有检查之上追加 `lintWikiDeltaMissing`（默认档 · `scope=all`）；失败时 verify 判 BLOCKED，输出 issue 列表 **并打印与 CI 完全一致的复跑命令**，使 30/40 本地即可对齐 PR CI。

---

## 范围

- [ ] W1：`cmdVerify`（`src/cli.ts` L460+）增 `--with-wiki-lint` 旗标：调用 `lintWikiDeltaMissing(target, { scope: 'all' })`（复用 `src/cli-task-extra.ts` 导出，**不复制**逻辑）；fail → BLOCKED + issue 列表 + 复跑命令行 `npx dsh-coding-kit task lint-wiki-delta --target .`；`--json` 增 `wiki_lint` 块（ok/issues/scanned）
- [ ] W2：usage/help（`src/cli.ts` L85）与 `README.md` / `README.zh-CN.md` verify 节补旗标说明；`assets/ci/samples/lint-wiki-delta.yml.example` 注释互链
- [ ] 决策点（R 轮 + 20 审）：是否引入 preset（如 `fullstack-node-py`）默认开启本旗标——**默认不做**，仅显式旗标（非破坏）；若做则另起 task
- [ ] 单测：旗标开/关两路径、BLOCKED 文案含 CI 同命令、`--json` 形状、与 `--task`/`--spec` 互斥规则不冲突
- [ ] CHANGELOG `[Unreleased]` 增条

## 非范围

- 不改 `verify` 默认行为（无旗标 = 现状），不破坏既有脚本
- 不改 `gate-check` / `audit` 检查面
- 不在本 task 内实现 `--scope changed` 或 preset 机制本体

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| `--with-wiki-lint` 且有缺口 | verify BLOCKED + issues + CI 同命令 | 是（补字段重跑） | 是 |
| 旗标拼写错误 | exit 1 用法错误（既有 `fail` 族） | 是 | 是 |
| 无 `--task`/`--spec` | 既有用法错误不变 | 是 | 是 |

---

## 验收标准

- [ ] 有缺口仓 fixture：`verify --task … --with-wiki-lint` BLOCKED，stdout 含 `task lint-wiki-delta --target .` 复跑命令
- [ ] 无缺口 fixture：verify 结果与不加坡一致；无旗标时行为与 1.7.1 逐字一致（回归测）
- [ ] `--json` 含 `wiki_lint.ok/issues/scanned`；`--spec` 模式下旗标行为有明文定义（建议同生效或显式拒绝，R 轮定）
- [ ] `npm test` / `typecheck` / `build` 全绿；help/README/CHANGELOG 已同步

---

## 给执行帽的必读列表

1. 反馈证据 §3 K3 · §7 归属表
2. `src/cli.ts` `cmdVerify` L460–520 · usage L85–105
3. `src/cli-task-extra.ts` `lintWikiDeltaMissing` 导出签名（复用约束）
4. `test/cli-verify-invoke-hats.test.ts` · `test/cli-verify-review.test.ts` · `test/cli-verify-spec.test.ts`

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单旗标单 task；preset 另议 | no |
| R1 | 复用 lintWikiDeltaMissing 导出，禁复制词表 | no |
| R2 | 默认档 scope=all 与 CI `lint-wiki-delta.yml.example` 对齐 | no |
| R3 | 非破坏：无旗标输出逐字不变须入回归测 | no |

**residual_risks**：`--spec` 模式下语义需明文；scope=all 会扫兄弟 active task（正是 K4 场景，文案须说明「缺口可能来自兄弟 task」）。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 旗标两路径 + BLOCKED 文案断言先红后绿；无旗标回归测钉死 1.7.1 行为。

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
| 2026-08-27 | 初稿：自 ops-desk-api FEEDBACK K3 起草（00 单窗） |
