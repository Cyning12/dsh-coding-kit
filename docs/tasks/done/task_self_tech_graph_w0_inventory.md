# Task：self-tech-graph W0 外置三树盘点与迁留定稿

> **状态**：`done`（30+40 交付 · verify/lint 绿 · 2026-08-27）  
> **关联图谱**：`none`（W0 不建 `docs/_tech_graph/` · 为 W1–W4 铺路）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（`04_execution_waves.md` **W0** · `03_external_docs_migration.md` 判定矩阵）  
> **00 颗粒度**：**单 task = SPEC W0 整波** · 纯文档/盘点 · 无 `src/` 变更

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `self-tech-graph-w0-inventory` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | W0 纯文档交付；验收以盘点文结构 grep + 引用扫描清单 + `task lint`/`verify --spec` 为主；无 src 变更时不强制新增单测文件 |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/self-tech-graph-w0-inventory` |
| **worktree_root** | （建议 Open Folder = 工作区 `Projects/` · 须同时读外置三树；kit 单仓 Open 时 task 内 `@` 外置路径） |
| **graph_delta** | `none` |
| **graph_delta_note** | W0 仅盘点/定稿；YAML 图谱落盘从 W2 起 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 交付物在 `docs/spec/self-tech-graph/reference/`；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit docs 轨；合入由 00 push |
| **entry_invoke_30** | `docs/harness/invokes/by-task/self-tech-graph-w0-inventory/invoke_20260827_30_40_self-tech-graph-w0-inventory.md` |
| **maintainer_release_hold** | `true` — merge 后停于发版前 · 无 bump/tag/publish |
| **related_pr** | `#21` |

### 00 维护者授权（2026-08-27）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| SPEC/task 签收 · R1 · 调度 30→40→CLOSE | ✅ | — |
| PR / merge | ✅ | — |
| bump / tag / publish | ⛔ | ✅ |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | 10-task, 30 | SPEC R1 零阻塞 · 00 代签 |
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-27 00 代签 |
| HG-AUDIT-R1 | approved | 30 | R1 零阻塞（reviews/task_self_tech_graph_w0_inventory_audit_R1_20260827.md）· 00 代签 |

---

## 背景与目标

**问题**：kit 具备 graph yaml 工具链与 `assets/graph/templates/`，但仓内无 `docs/_tech_graph/`；架构/缺陷/过程真值分散在工作区三棵外置树（`dsh_coding_kit_optimization/` · `dsh_coding_kit_init/` · `docs/tech_graph/`），与仓内 `docs/releases/` · `docs/tasks/` 双轨且版本滞后（inventory 锚 1.2.2 · 当前包 **1.9.0**）。

**W0 完成态**（不改码 · 不迁文件）：

1. 产出 **W0 盘点定稿文**（DEF 去重 diff + 三树迁留矩阵 approved + 仓内引用扫描清单）。
2. 将 `03_external_docs_migration.md` 的「判定建议」升级为 **人可执行的定稿表**（每项：动作 · 目标路径 · 执行波次 W1/W3/W4 · 备注）。
3. 为 **W1**（`01_struct` 模块表 · HG-GRAPH-MODULES）提供输入：明确 `00_inventory/` 迁回 reference 后 W1 以 **1.9.0 `src/` 实读** 为准、禁止照抄旧 inventory。

---

## 范围

### W0-1 · 三树实勘与 SPEC §03 对照

- [x] 树 A `docs/dsh_coding_kit_optimization/`：逐子目录核对 `03` 表（`00_inventory` / `01_defects` / `02–06`）
- [x] 树 B `docs/dsh_coding_kit_init/`（106 文件）：确认留外/索引策略仍成立
- [x] 树 C 工作区 `docs/tech_graph/`：跨仓 vs kit 私域边界复核
- [x] 实勘快照：执行日 · 各树根路径 · 关键子树文件数（可 mtime 注记）

### W0-2 · DEF / 债务去重（核心 diff）

- [x] **外置** `optimization/01_defects/defect_register.md` ↔ **仓内** `docs/releases/03_defects_debt_ledger.md`（DEF 表）
- [x] **外置** `known_debts.md` ↔ ledger 债务段
- [x] 输出三类清单：`仅外置有` · `仅仓内有` · `已对齐` · `冲突须人裁`（附条目 ID + 一行说明）

### W0-3 · 迁留矩阵定稿

- [x] 在盘点文中固化矩阵（可增列：approved 动作 · 执行波 · 阻塞依赖）
- [x] 至少覆盖 `03` §1 全部行；对 `00_inventory/` 定稿为「内容 W1 重生 + 原文 W3 迁 `reference/`」
- [x] 冲突项不得 silent 丢弃——写入「人裁 pending」小节

### W0-4 · 仓内引用扫描（轻量 · W3 硬验收预演）

- [x] grep kit 仓：链向 `dsh_coding_kit_init` / `dsh_coding_kit_optimization` / `docs/tech_graph` 的路径
- [x] 分类：`已 POINTER` · `需 W3 改链` · `需新增 POINTER` · `误链/死链`
- [x] **不在 W0 物理迁回**；`reference/POINTERS.md` 可写骨架（空表 + 占位说明）

### W0-5 · SPEC / 索引伴生更新

- [x] `docs/spec/self-tech-graph/03_external_docs_migration.md` 修订记录 +1 行（链 W0 定稿文）
- [x] `docs/spec/self-tech-graph/04_execution_waves.md` W0 行注记「定稿见 reference/W0_*」
- [x] `docs/spec/README.md`：self-tech-graph 索引行状态/读序更新（若需）
- [x] `01_problem_and_goals.md` 中「当前 1.8.0」→ **1.9.0**（顺手 · 非主交付）

### W0-6 · 审查与闸

- [x] 20-task-audit R1 审查文落盘 `docs/harness/reviews/task_self_tech_graph_w0_inventory_audit_R1_20260827.md`（00 签收时完成）
- [x] `verify --spec docs/spec/self-tech-graph/README.md` → PASS（30 交付后）

## 非范围

- 不创建 `docs/_tech_graph/` · 不写任何 `.graph.yaml`（→ **W2**）
- 不写 `01_struct.md` 模块表（→ **W1** · HG-GRAPH-MODULES）
- 不物理迁回/删除工作区外置树（→ **W3** · 且 SPEC 禁止删工作区原树）
- 不加 `.github/workflows/tech-graph.yml`（→ **W3**）
- 不改 `src/` · `assets/graph/templates/` 语义 · `package.json#files`
- 不 `npm publish` / 不定版号

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-SPEC-SIGNOFF pending 即 30 | 拒开工（`TEMPLATE_30_gate_stop`） | 是 | gate_id + SPEC 路径 |
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 是 | 是 |
| DEF 外置 vs ledger 条目冲突 | W0 文列「人裁 pending」· 不 silent 合并 | 是 | 盘点文 |
| Open Folder 仅 kit 仓、外置树不可读 | 30 须在 task 内 `@` 外置路径或改 Open `Projects/` | 是 | 执行备忘 |
| 判定矩阵缺行（未覆盖 §03 任一行） | 20 审退回 10-task | 是 | R1 阻塞清单 |

---

## 验收标准

- [x] 存在 `docs/spec/self-tech-graph/reference/W0_inventory_diff_20260827.md`（或同日修订记录指向的实际文件名），且含固定节：**实勘快照 · DEF 去重表 · 迁留定稿矩阵 · 引用扫描 · 人裁 pending（可为空）**
- [x] DEF 去重表覆盖 ledger 全部 DEF-ID 与外置 register 条目（无 silent 遗漏）
- [x] 迁留矩阵每一行含 `approved 动作` + `执行波次（W1/W3/W4/none）`
- [x] `03_external_docs_migration.md` 修订记录链到 W0 定稿文
- [x] `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w0_inventory.md` → PASS
- [x] HG-SPEC-SIGNOFF + HG-AUDIT-R1 approved 后：`verify --spec docs/spec/self-tech-graph/README.md` → PASS
- [x] 无 `src/` 变更时：`npm test` / `typecheck` 回归仍绿（docs-only PR）

---

## 给执行帽的必读列表

1. `docs/spec/self-tech-graph/README.md` · `01`–`04` 全文
2. `docs/spec/self-tech-graph/03_external_docs_migration.md` §1–§2（判定矩阵 · 迁移规则）
3. `docs/releases/03_defects_debt_ledger.md`（仓内 DEF/债务真值）
4. 工作区外置树（只读）：`docs/dsh_coding_kit_optimization/` · `docs/dsh_coding_kit_init/` · `docs/tech_graph/`
5. `assets/harness/templates/TASK_TEMPLATE.md` · `20-task-audit.md`（R1 审口径）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单 task = SPEC W0 整波；与 W1 拆分（W0 无 HG-GRAPH-MODULES） | no |
| R1 | 主交付落 `reference/W0_*` · 不扩 `docs/_tech_graph/` | no |
| R2 | Open Folder 纪律：外置三树须可读；否则 `@` 路径 | no |
| R3 | DEF diff 冲突 → 人裁小节 · 禁止 30 擅自合并条目 | no |

**residual_risks**：外置树维护者并行改动 → 以 W0 执行日快照为准并在 POINTER 注记 mtime；inventory 1.2.2 与 1.9.0 src 差距大 → W1 必须实读重核，W0 只定「迁回 reference + W1 重生」策略。

---

## 测试策略（Harness）

**test_strategy**: `recommended` —— 结构 grep + 引用扫描清单 + task lint / verify --spec；docs-only 不新增 CLI 单测除非 20 审要求锚点测。

---

### 自检结论（执行者）

| 命令 | 结果 |
|------|------|
| `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w0_inventory.md` | PASS（exit 0） |
| `node bin/dsh-coding-kit.js verify --spec docs/spec/self-tech-graph/README.md` | PASS（exit 0 · HG-SPEC-SIGNOFF=approved） |
| `npm run typecheck` | PASS |
| `npm test` | PASS（npm_config_cache 隔离） |

**DEF diff 摘要**：已对齐 27 · 仅外置有 6（DEF-028~033）· 仅仓内有 0 · DEF 冲突 0 · 人裁 pending 3 项（ledger 补录 / R-05 stale / M-3 子集）

---

### KPI（00）

Task_KPI%: 92

- W0-1~W0-6 全勾 · verify/lint 绿 · 310/310 · PR #21 squash merge
- DEF 去重 27 对齐 · 6 项仅外置 · 3 项人裁 pending 已落文 · 无 silent 合并
- docs-only · 无 bump/tag（maintainer_release_hold）

---

### 经验总结

- W0 盘点须以执行日快照为准（mtime/文件数），inventory 1.2.2 与 1.9.0 src 差距大 → W1 必须实读重核，禁止照抄旧 inventory
- DEF 外置 vs ledger 冲突一律进「人裁 pending」，30 不得擅自补录或合并条目
- 外置三树 Open Folder 纪律：仅 kit 仓时须 task 内 `@` 外置路径或 Open `Projects/`

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 00 起草：self-tech-graph SPEC W0 · 外置三树盘点与迁留定稿 |
| 2026-08-27 | 00 签收：SPEC/task 三闸 approved · R1×2 · 开 30 invoke |
