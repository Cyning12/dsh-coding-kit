# Task：self-tech-graph W1 L1 模块边界表 + W0 人裁执行

> **状态**：`done`  
> **关联图谱**：`docs/_tech_graph/01_struct.md`（本波新建 · 表而非 yaml flow）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（`04_execution_waves.md` **W1** · `02_graph_scheme.md` §1 L1）  
> **00 颗粒度**：**单 task = SPEC W1 整波** + W0 三项人裁执行 · 纯文档 · 无 `src/` 变更

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `self-tech-graph-w1-struct` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | W1 纯文档：`01_struct.md` 模块表 + ledger 补录；验收以结构 grep + src 文件名覆盖 + `task lint`/`verify --spec` 为主；无 src 变更时不强制新增单测 |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/self-tech-graph-w1-struct` |
| **worktree_root** | （建议 Open Folder = 工作区 `Projects/` · 须读外置 `00_inventory/` 作 R0 参考；kit 单仓 Open 时 `@` 外置路径） |
| **graph_delta** | `docs/_tech_graph/01_struct.md` |
| **graph_delta_note** | W1 只落 L1 模块表；`.graph.yaml` 从 W2 起 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 交付物在 `docs/_tech_graph/` 与 `docs/releases/`；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit docs 轨；合入由 00 push |
| **entry_invoke_30** | `docs/harness/invokes/by-task/self-tech-graph-w1-struct/invoke_20260828_30_40_self-tech-graph-w1-struct.md` |
| **maintainer_release_hold** | `true` — merge 后停于发版前 · 无 bump/tag/publish |

### 00 维护者授权（2026-08-27 延续 · 2026-08-28 W1 签收）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| SPEC/task 签收 · R1 · 调度 30→40→CLOSE | ✅ | — |
| PR / merge | ✅ | — |
| bump / tag / publish | ⛔ | ✅ |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | 10-task, 30 | SPEC R1 零阻塞 · 00 代签 |
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-28 00 代签 |
| HG-AUDIT-R1 | approved | 30 | R1 零阻塞（reviews/task_self_tech_graph_w1_struct_audit_R1_20260828.md）· 00 代签 |

**HG-GRAPH-MODULES** 在 SPEC 表（非本 task 挡 30）：本波 **写** `01_struct.md`；40 绿后由 00 代签。30 禁止把 SPEC 上该闸 pending 解释为拒开工（本波不改 `src/`）。

---

## 背景与目标

**问题**：kit 无仓内 L1 模块边界真值；外置 `00_inventory/architecture.md` 锚 1.2.2（13 个 `src/*.ts`），当前包 **1.9.0** 已增 `cli-checks` / `cli-refresh-ide-blocks` / `cli-sync-prompts` 等。W0 三项人裁已裁定，须在本波执行，避免拖到 W4。

**W1 完成态**（不改码 · 不写 `.graph.yaml`）：

1. 存在 `docs/_tech_graph/01_struct.md`：对 **1.9.0 每一个** `src/*.ts` 一行（职责 · 读 · 写 · 被谁调），并列出相对 1.2.2 inventory 的增量模块。
2. ledger 补录 DEF-028~033（closed · 带 Fixed in / commit-or-PR）。
3. W0 人裁三行全部 **ruled** 且执行留痕（R-05 关 pending 无外置回写；M-3 遗留按「无用 stamp / 有用剔除」处理）。

---

## 范围

### W1-1 · `01_struct.md`（主交付）

- [x] 新建 `docs/_tech_graph/01_struct.md`（可仅此一文；**不**建 `*.graph.yaml`）
- [x] 模块表覆盖 `src/` 全部 `.ts`（2026-08-28 实勘 17 文件：`cli.ts` · `index.ts` · `cli-shared.ts` · `cli-checks.ts` · `cli-task-extra.ts` · `cli-lifecycle.ts` · `cli-graph.ts` · `cli-graph-yaml.ts` · `cli-graph-hgm.ts` · `cli-skills.ts` · `cli-sync.ts` · `cli-sync-prompts.ts` · `cli-wiki.ts` · `cli-status.ts` · `cli-timeline.ts` · `cli-refresh-ide-blocks.ts` · `yaml.ts`）
- [x] 每行四列：**职责 · 读 · 写 · 被谁调**（按 `src/*.ts` 实读 import/export · 禁止照抄 `architecture.md` 1.2.2 句）
- [x] 增量节：相对 1.2.2 inventory 新增/拆分的模块（至少点名 `cli-checks` · `cli-refresh-ide-blocks` · `cli-sync-prompts`）
- [x] 文首注明：锚版本 1.9.0 · HG-GRAPH-MODULES 待 00 签 · 参考外置 inventory 路径但不作真值

### W1-2 · W0 人裁执行（2026-08-28 维护者裁定）

- [x] **补录**：`docs/releases/03_defects_debt_ledger.md` 增 DEF-028~033 行；标题计数 27→33；Sources 行同步；one-liner / Fixed in / Commit-PR 以外置 `defect_register.md` + CHANGELOG + git 为准（已闭环，勿改状态为 open）
- [x] **R-05**：不回写外置 `known_debts.md`；W0 文已 ruled「外置无内容可关闭」；ledger R-05 保持 closed
- [x] **M-3 遗留**：扫描工作区 `docs/harness/tasks/active/` 中 `d_article_series` 与 `self_glayer*`。**有用**（仍服务公众稿/其它活跃轨）→ 从 kit M-3 债剔除、不 stamp、不迁 kit。**无用**（与已 stale 的 a5/g1/y1 同类旧 Epic）→ 加与既有 M-3 同款 stale 横幅，不删文件。00 初判：`self_glayer` 已 stale；`d_article_series` 有用。30 核扫后在 W0 文或本 task 自检留一行结论

### W1-3 · SPEC / 索引伴生

- [x] `02_graph_scheme.md` 修订记录 +1（链 `docs/_tech_graph/01_struct.md`）
- [x] W0 盘点文三项人裁保持 **ruled**（00 已预填裁定表；30 回填执行勾）
- [x] `docs/spec/README.md` 索引行可注 W1 in progress（若未写）

### W1-4 · 审查与闸

- [x] 20-task-audit R1 落盘（00 签收时完成）
- [x] `verify --spec docs/spec/self-tech-graph/README.md` → PASS
- [x] `verify --task` 本文件 → PASS

## 非范围

- 不写任何 `.graph.yaml` · 不跑「构图」意义上的 compile 验收（目录可仅有 `01_struct.md`）
- 不写 `00_main` / `10_flow_*` / `02_version.md`（→ **W2/W3**）
- 不加 `.github/workflows/tech-graph.yml`（→ **W3**）
- 不物理迁回 `00_inventory/` 原文（→ **W3**）
- 不改 `src/` · `assets/graph/templates/` 语义 · `package.json#files`
- 不 `npm publish` / 不定版号 / 不 tag
- 不删工作区外置树

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1 pending 即 30 | 拒开工（`TEMPLATE_30_gate_stop`） | 是 | gate_id + task 路径 |
| 把 SPEC `HG-GRAPH-MODULES` pending 当本波拒开工 | **禁止**；本波任务就是写模块表 | — | invoke 边界 |
| `01_struct` 照抄 1.2.2 inventory 未实读 src | 20/40 退回 | 是 | 缺增量模块或列与 import 不符 |
| 模块表漏任一 `src/*.ts` | 验收不通过 | 是 | 文件名差集 |
| DEF-028~033 补录改成 open 或编造 commit | 退回 | 是 | ledger vs register/CHANGELOG |
| 对有用的 `d_article_series` 误 stamp stale | 退回 | 是 | 公众稿轨被误归档 |

---

## 验收标准

- [x] 存在 `docs/_tech_graph/01_struct.md`，含模块表 + 相对 1.2.2 增量节
- [x] `ls src/*.ts` 的每个基名均出现在模块表（可用差集脚本/手工核对）
- [x] ledger 含 DEF-028~033 且均为 closed；缺陷表头计数与行数一致
- [x] W0 人裁三行均为 ruled（非 pending）
- [x] `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w1_struct.md` → PASS
- [x] `node bin/dsh-coding-kit.js verify --spec docs/spec/self-tech-graph/README.md` → PASS
- [x] `node bin/dsh-coding-kit.js verify --task docs/tasks/active/task_self_tech_graph_w1_struct.md` → PASS
- [x] 无 `src/` 变更时：`npm test` / `typecheck` 回归仍绿

---

## 给执行帽的必读列表

1. `docs/spec/self-tech-graph/README.md` · `02_graph_scheme.md` §1 L1 · `04_execution_waves.md` W1
2. `docs/spec/self-tech-graph/reference/W0_inventory_diff_20260827.md`（人裁 ruled 表）
3. `src/*.ts`（1.9.0 实读真值）
4. 外置只读参考：工作区 `docs/dsh_coding_kit_optimization/00_inventory/architecture.md`（禁止照抄）
5. 外置 `docs/dsh_coding_kit_optimization/01_defects/defect_register.md` DEF-028~033 行 + 仓内 `docs/releases/03_defects_debt_ledger.md` + `CHANGELOG.md`
6. M-3 扫描：工作区 `docs/harness/tasks/active/` 下 `d_article_series` 与 `self_glayer*` 单
7. `assets/harness/templates/TASK_TEMPLATE.md` · `20-task-audit.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单 task = SPEC W1 + W0 人裁执行；不拆第二 task | no |
| R1 | 主交付 `docs/_tech_graph/01_struct.md`；yaml 留给 W2 | no |
| R2 | HG-GRAPH-MODULES 本波后签 · 不挡 30 | no |
| R3 | M-3：有用不 stamp；无用才 stale；不迁 kit | no |

**residual_risks**：1.9.0 src 仍可能在 W1 执行窗口增文件 → 以开工日 `ls src/*.ts` 为准并在 01_struct 文首注日期；ledger 补录不触发发版。

---

## 测试策略（Harness）

**test_strategy**: `recommended` —— 模块表 vs `src/*.ts` 差集 + ledger 行 grep + task lint / verify；docs-only 不新增 CLI 单测。

---

### 自检结论（执行者）

**GATE_VERIFY**：HG-TASK-DRAFT=approved · HG-AUDIT-R1=approved · 可 30。SPEC `HG-GRAPH-MODULES` pending 不挡本波。

**src 覆盖**：17/17（`ls src/*.ts` 基名均在 `docs/_tech_graph/01_struct.md`；无 `.graph.yaml`）。

**M-3 核扫**：`d_article_series` = `in_progress` 公众稿 → 有用，未 stamp、未迁 kit。`self_glayer_meta` 已有 stale；`self_glayer_p1`–`p6` 补同款 stale 横幅（工作区 `docs/harness/tasks/active/`，不入本仓 commit）。

**命令**：

- `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w1_struct.md` → `LINT: PASS`
- `node bin/dsh-coding-kit.js verify --spec docs/spec/self-tech-graph/README.md` → `VERIFY: PASS`
- `node bin/dsh-coding-kit.js verify --task docs/tasks/active/task_self_tech_graph_w1_struct.md` → `VERIFY: PASS`
- `npm run typecheck` → PASS（`tsc --noEmit`）
- `npm test` → PASS（310/310）

未 `task close` · 未建 PR · 未 bump。KPI/经验总结留 00 CLOSE。

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
| 2026-08-28 | 00 起草并签收：self-tech-graph SPEC W1 · 含 W0 三项人裁执行 |
| 2026-08-28 | 30/40：`01_struct.md` 落盘 · ledger DEF-028~033 · M-3 核扫 · 状态 done（关账仍走 00 `task close`） |
