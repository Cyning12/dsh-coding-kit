# Task：self-tech-graph W4 收口 · dogfood 互链 + CHANGELOG Docs

> **状态**：`in_progress`  
> **关联图谱**：`docs/_tech_graph/`（W2/W3 已齐 · 本波不改 yaml 拓扑）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（`04_execution_waves.md` **W4** · `01_problem_and_goals.md` 完成态）  
> **拟发版**：**1.9.1**（CHANGELOG `[Unreleased]` Docs）· **本波不 bump / 不 tag / 不 publish**  
> **00 颗粒度**：**单 task = SPEC W4 整波** · epic 末棒

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `self-tech-graph-w4-closeout` |
| **test_strategy** | `required` |
| **test_strategy_note** | 改 `assets/graph/templates/README.md` 须跑 `test/cli-docs-graph-templates.test.ts`（DEF-006 命令面钉死）；全量 `npm test` 回归。无新 CLI 行为 |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/self-tech-graph-w4-closeout` |
| **worktree_root** | （Open Folder = kit 仓根即可） |
| **graph_delta** | `none` |
| **graph_delta_note** | W4 不改 yaml 拓扑；仅文档互链 + Unreleased Docs |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit docs 轨；合入由 00 push |
| **entry_invoke_30** | `docs/harness/invokes/by-task/self-tech-graph-w4-closeout/invoke_20260828_30_40_self-tech-graph-w4-closeout.md` |
| **planned_release** | `1.9.1` |
| **maintainer_release_hold** | `true` — merge 后停于发版前 · 无 bump/tag/publish |

### 00 维护者授权（2026-08-27 延续 · 2026-08-28 W4 签收）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| SPEC/task 签收 · R1 · 调度 30→40→CLOSE | ✅ | — |
| PR / merge | ✅ | — |
| bump / tag / publish | ⛔ | ✅ 只允许 **1.9.x**（建议切 `[Unreleased]` → `[1.9.1]` 时由人 bump） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | 10-task, 30 | SPEC R1 零阻塞 · 00 代签 |
| HG-GRAPH-MODULES | approved | 30（构图/改码） | 已签；本波不改 yaml |
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-28 00 代签 |
| HG-AUDIT-R1 | approved | 30 | R1 零阻塞（reviews/task_self_tech_graph_w4_closeout_audit_R1_20260828.md）· 00 代签 |

---

## 背景与目标

W0–W3 已交付盘点、L1 表、L0/L2 yaml、CI 与迁回。W4 收口两件事：① 模板/ONBOARDING/**若自然**链到 kit 自身 dogfood（`docs/_tech_graph/` **不进 npm tarball**，须明示源码仓路径）；② CHANGELOG `[Unreleased]` 记 Docs 条，供维护者发 **1.9.1**。

**完成态**：读者从 templates README / 薄 ONBOARDING / 根 README 能找到 kit 自图；`01_problem_and_goals.md` 不再声称「自身无图谱」；Unreleased 有 Docs 条；`package.json` 仍为 1.9.0。

---

## 范围

### W4-1 · 互链（若自然 · 不改模板语义）

- [ ] `assets/graph/templates/README.md`：增一小节 **本包 dogfood**（≤10 行）：源码仓 `docs/_tech_graph/`（L0 `00_main` · L1 `01_struct` · L2 四条 `10_flow_*` · CI `.github/workflows/tech-graph.yml` 用本仓 bin）。**须写明 docs/ 不随 npm 包发布**。保留既有 `npx dsh-coding-kit graph yaml compile|check|export` 命令面（`test/cli-docs-graph-templates.test.ts` ③ 钉死）
- [ ] **禁止**改 `00_main.graph.yaml` / `10_flow_MAIN.graph.yaml` / `99_mermaid_protocol.md` 正文语义；禁止把 kit 业务节点抄进 templates
- [ ] `assets/docs/POINTER_ONBOARDING.md`：一行指针 —— kit 自仓 dogfood 见源码 `docs/_tech_graph/`（原文 ONBOARDING 仍在私仓）
- [ ] `assets/ci/samples/README.md`：`tech-graph.yml.example` 行旁注 —— kit **自身** workflow 是 `.github/workflows/tech-graph.yml`（本仓 bin compile/check），样例仍面向自备 `graph-compile.sh` 的业务仓。**不改** `.example` 文件
- [ ] 根 `README.md` 与 `README.zh-CN.md`：在 `graph yaml compile|check|export` 命令段后各加 **一句** dogfood 指针（源码仓 `docs/_tech_graph/` · 不进包）

### W4-2 · SPEC 完成态对齐

- [ ] `docs/spec/self-tech-graph/01_problem_and_goals.md`：问题陈述改为「W0–W4 前」过去时，完成态 1–3 标为已落地（链 `_tech_graph/` · `tech-graph.yml` · POINTERS）；非目标不变
- [ ] `02_graph_scheme.md` §2 CI 句：「新增」→ 已落地路径 `.github/workflows/tech-graph.yml`
- [ ] `docs/_tech_graph/02_version.md`：补 W3 CI 入仓、W4 Unreleased Docs（仍上限 1.9.x）
- [ ] SPEC README / `docs/spec/README.md` 索引：W4 收口（00 已预填开工行，30 可改为 CLOSE 后态或留给 00）

### W4-3 · CHANGELOG Docs（拟 1.9.1）

- [ ] 仅改 `CHANGELOG.md` 的 `## [Unreleased]`：加短主题行 + `### Docs`（kit 自图谱 dogfood · `tech-graph.yml` · inventory 迁回 reference）。**不要**新建 `## [1.9.1] - 日期` 节（无 bump 则无日期版）
- [ ] **禁止**改 `package.json` `version`、禁止 tag、禁止把 Unreleased 写成已发布 1.9.1

### W4-4 · 回归

- [ ] `npm test`（含 `cli-docs-graph-templates.test.ts`）绿
- [ ] `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph` 仍绿
- [ ] `task lint` / `verify --spec` / `verify --task`

## 非范围

- 不 bump · 不 tag · 不 `npm publish`
- 不改 `package.json#files`（docs/ 仍不进包）
- 不改 templates 的 yaml / protocol 语义 · 不改 `tech-graph.yml.example` 脚本面
- 不改 W2 五份业务 yaml 拓扑
- 不把 `docs/_tech_graph` 打进 tarball

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 是 | gate_id |
| 改 templates yaml/protocol 语义 | freeze 违例 · 退回 | 是 | DEF-006 测 |
| README 删掉 npx graph yaml 命令面 | `cli-docs-graph-templates` ③ 红 | 是 | 测 |
| bump package.json | 退回（发版仅人） | 是 | diff |
| 写成 `[1.9.1] - 日期` 却不 bump | 版本谎言 · 退回 | 是 | CHANGELOG |

---

## 验收标准

- [ ] templates README 含 dogfood 小节且仍含三条 `npx dsh-coding-kit graph yaml` 命令
- [ ] POINTER_ONBOARDING 与双 README 各有源码仓 `_tech_graph` 指针
- [ ] `01_problem_and_goals.md` 不再写「kit 仓自身没有 `docs/_tech_graph/`」为当前事实
- [ ] `CHANGELOG.md` `[Unreleased]` 有 `### Docs` 且无 `package.json` version 变更
- [ ] `node --test --test-concurrency=1 --experimental-strip-types test/cli-docs-graph-templates.test.ts` PASS
- [ ] `npm test` / `typecheck` 绿
- [ ] `graph yaml check --all --input docs/_tech_graph` exit 0
- [ ] `task lint` 本文件 PASS · `verify --spec` / `--task` PASS

---

## 给执行帽的必读列表

1. `docs/spec/self-tech-graph/04_execution_waves.md` W4 · `01_problem_and_goals.md` · freeze_id（SPEC README）
2. `assets/graph/templates/README.md` · `test/cli-docs-graph-templates.test.ts`
3. `assets/docs/POINTER_ONBOARDING.md` · `assets/ci/samples/README.md`
4. `README.md` / `README.zh-CN.md` graph 命令段（约 L94）
5. `CHANGELOG.md` `[Unreleased]` · `package.json` version（只读，保持 1.9.0）
6. `.github/workflows/tech-graph.yml`（互链目标）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单 task = 互链 + Unreleased Docs；不 bump | no |
| R1 | docs 不进包 → 链源码仓路径/GitHub，禁止假装 npm 内有 docs/_tech_graph | no |
| R2 | 保留 DEF-006 命令面字符串 | no |
| R3 | Unreleased 而非谎称已发 1.9.1 | no |

**residual_risks**：维护者发 1.9.1 时须自行 bump + 把 Unreleased 改成带日期的 `[1.9.1]` 节。

---

## 测试策略（Harness）

**test_strategy**: `required` —— templates README 有命令面钉死测；先跑该文件再改其余文案。

---

### 自检结论（执行者）

（30/40 回填）

---

### KPI（00）

（关账回溯填写）

---

### 经验总结

（关账回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 起草并签收：W4 收口 · Unreleased Docs 拟 1.9.1 · 不 bump |
