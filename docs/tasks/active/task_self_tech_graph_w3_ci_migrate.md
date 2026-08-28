# Task：self-tech-graph W3 CI + 02_version + 获批迁移

> **状态**：`in_progress`  
> **关联图谱**：`docs/_tech_graph/02_version.md`（本波新建 · 时间线 · 非 yaml）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（`04_execution_waves.md` **W3** · `03_external_docs_migration.md` §2 · W0 迁留矩阵）  
> **拟发版**：**1.9.x**（建议收口 **1.9.1** · 禁止 1.10+）· **本波不 bump**  
> **00 颗粒度**：**单 task = SPEC W3 整波**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `self-tech-graph-w3-ci-migrate` |
| **test_strategy** | `required` |
| **test_strategy_note** | CI 闸 = workflow 内 compile + check 可失败执行；迁回以文件存在 + 死链 grep 为准。src/test 仅允许 W0 已列的注释改链（PRD_R07），行为不变则不强制新测 |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/self-tech-graph-w3-ci-migrate` |
| **worktree_root** | （建议 Open Folder = 工作区 `Projects/` 以便复制 `00_inventory/`；kit 单仓时 `@` 外置路径） |
| **graph_delta** | `docs/_tech_graph/02_version.md` |
| **graph_delta_note** | W3 辅层时间线；不改 W2 yaml 语义 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 交付在 `_tech_graph` / `reference/` / CI；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit docs/CI 轨；合入由 00 push |
| **entry_invoke_30** | `docs/harness/invokes/by-task/self-tech-graph-w3-ci-migrate/invoke_20260828_30_40_self-tech-graph-w3-ci-migrate.md` |
| **planned_release** | `1.9.x`（建议 1.9.1） |
| **maintainer_release_hold** | `true` — merge 后停于发版前 · 无 bump/tag/publish |

### 00 维护者授权（2026-08-27 延续 · 2026-08-28 W3 签收）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| SPEC/task 签收 · R1 · 调度 30→40→CLOSE | ✅ | — |
| PR / merge | ✅ | — |
| bump / tag / publish | ⛔ | ✅ 后续版本号只允许 **1.9.x** |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | 10-task, 30 | SPEC R1 零阻塞 · 00 代签 |
| HG-GRAPH-MODULES | approved | 30（构图/改码） | 已签；本波不改 yaml 拓扑，仅加 `02_version.md` |
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-28 00 代签 |
| HG-AUDIT-R1 | approved | 30 | R1 零阻塞（reviews/task_self_tech_graph_w3_ci_migrate_audit_R1_20260828.md）· 00 代签 |

---

## 背景与目标

W2 已 dogfood 五图；缺仓内 CI 锁步、缺 `02_version`、W0 矩阵中 **W3 行**尚未执行（inventory 原文迁回 · POINTERS 填实 · PRD_R07 注释改链）。

**W3 完成态**（不 bump · 不删工作区原树 · 不改 templates 语义）：

1. `.github/workflows/tech-graph.yml`：对本仓 `docs/_tech_graph` 跑 compile + check，红即 fail。
2. `docs/_tech_graph/02_version.md` 首版（1.0.0→1.9.x 里程碑从简）。
3. `00_inventory/` 四份原文迁入 `docs/spec/self-tech-graph/reference/`（历史锚 1.2.2 · **不改写正文**）；POINTERS 填实 W3 行；W0「需 W3 改链」2+1 项落地。

---

## 范围

### W3-1 · CI `tech-graph.yml`

- [x] 新建 `.github/workflows/tech-graph.yml`
- [x] **参照** `assets/ci/samples/tech-graph.yml.example` 的触发面（PR + push main）与「compile/check 红即 fail」
- [x] **禁止**照抄样例的 Python `pyyaml` + `./scripts/graph-compile.sh`（kit 无该脚本 · 简化编译流）
- [x] 与现有 `.github/workflows/ci.yml` 对齐：`actions/checkout` / `setup-node` 主版本、`npm ci`（prepare 会 build）
- [x] job 步骤（cwd 仓根 · 用 **本仓 bin** 非 npx 远包）：
  1. `node bin/dsh-coding-kit.js graph yaml compile --all --input docs/_tech_graph`
  2. `git diff --exit-code -- docs/_tech_graph/*.md`（捕获未提交的 compile 漂移；**不要**对 `shared/graph.json` 做 diff —— export 会改 `generated_at`）
  3. `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph`（对照**已入库** `shared/graph.json`，CI **不**重跑 export）
- [x] 单 Node 即可（建议 24.x，与 engines 上限一致）；无需双矩阵

### W3-2 · `02_version.md` 首版

- [x] 新建 `docs/_tech_graph/02_version.md`（手写时间线 · **不是** yaml compile 产物）
- [x] 里程碑从简：至少含 graph 能力关键点（1.2.4 DEF-006 命令面 · 1.2.3 DEF-023 emit · 1.6.1 DEF-031~033 · 1.9.0 现行包 · 2026-08-28 W2 自仓 dogfood）
- [x] 上限叙述 **1.9.x**（禁止写成即将 1.10.0）；勿把 templates 的 YYYY-MM-DD 占位当 kit 史实

### W3-3 · 获批迁移（W0 矩阵 W3 行）

- [x] **迁回副本**（工作区 `docs/dsh_coding_kit_optimization/00_inventory/` → kit `docs/spec/self-tech-graph/reference/`）：
  - `architecture.md` → `architecture_1.2.2.md`
  - `cli_surface.md` → `cli_surface_1.2.2.md`
  - `plugin_surface.md` → `plugin_surface_1.2.2.md`
  - `assets_catalog.md` → `assets_catalog_1.2.2.md`
- [x] 每份文首加历史锚块（版本 1.2.2 · 原工作区路径 · 「非现行真值 · 现行 L1 见 `docs/_tech_graph/01_struct.md`」）然后 **原样正文**；禁止改写历史
- [x] **不删**工作区原树
- [x] `reference/POINTERS.md`：状态从 skeleton → filled；填实 `02_compare_speckit` / `03_directions` / `04_decisions` 工作区相对路径；树 B `spec/` 历史债；树 C `json_graph` / `query_graph`；锚点 **#R07**（PRD 留外 · 链工作区 `06_epics/PRD_R07_ide_block_rewrite.md`）
- [x] `docs/spec/README.md`：加一行历史过程 SPEC 指针（树 B `dsh_coding_kit_init/spec/` 留外 · 现行仓根 `SPEC.md`）
- [x] `02_graph_scheme.md` 模块表起点句：外置 architecture 旁链 `reference/architecture_1.2.2.md`

### W3-4 · 死链 / 改链（W0 引用扫描）

- [x] `src/cli-refresh-ide-blocks.ts` 文件头 SPEC 注释：`dsh_coding_kit_optimization/06_epics/PRD_R07_...` → `docs/spec/self-tech-graph/reference/POINTERS.md#R07`（**只改注释** · 不改行为）
- [x] `test/cli-refresh-ide-blocks.test.ts` 同步改同一注释
- [x] 全仓再扫：`dsh_coding_kit_optimization` / `dsh_coding_kit_init` / 单独的假仓内路径；分类维持「已 POINTER / 明示外部指针 / 本波已改链」；**SPEC.md / assets/README / releases/README / 否定断言 test** 保持为明示外部指针，不必改成仓内假路径
- [x] 禁止把 106 份 init 过程档迁入本仓

### W3-5 · 回归

- [x] 本地跑与 CI 相同的 compile + md diff + check
- [x] `task lint` / `verify --spec` / `verify --task`
- [x] `npm test` / `typecheck` 绿（注释改链不得红）

## 非范围

- 不 bump `package.json` · 不 tag · 不 publish · 不写 CHANGELOG 正式版节（→ **W4**）
- 不改 `assets/graph/templates/` 语义 · 不加 `scripts/graph-compile.sh`
- 不改 W2 五份 yaml 拓扑（除非 check 暴露必须的锚点笔误 · 须在自检说明）
- 不迁 `01_defects` / `05_fix_plans` / `06_epics` 正文（留外）
- 不删工作区三树
- 版本叙述只允许 **1.9.x**

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 是 | gate_id |
| CI 照抄 Python graph-compile.sh | 20/40 退回 | 是 | workflow |
| 迁回时改写 inventory 正文 | 退回 | 是 | diff |
| CI 对 graph.json 做 git diff | export 时间戳恒红 | 是 | 本 task 已禁 |
| 删工作区原树 | 禁止 | 否 | SPEC §2.4 |
| 注释改链改到行为 | 退回 | 是 | 测红 |

---

## 验收标准

- [x] 存在 `.github/workflows/tech-graph.yml`，含 compile --all 与 check --all（本仓 bin），无 `graph-compile.sh` / `pip install pyyaml`
- [x] 存在 `docs/_tech_graph/02_version.md` 且含 1.9.x 上限
- [x] `reference/` 下四份 `*_1.2.2.md` 存在且文首有历史锚
- [x] `POINTERS.md` 含 #R07 且 02–04 / json_graph 行已填路径
- [x] `src/cli-refresh-ide-blocks.ts` 与对应 test 头注释不再含 `06_epics/PRD_R07`
- [x] `node bin/dsh-coding-kit.js graph yaml compile --all --input docs/_tech_graph` 后 `git diff --exit-code -- docs/_tech_graph/*.md`
- [x] `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph` exit 0
- [x] `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w3_ci_migrate.md` → PASS
- [x] `verify --spec` / `verify --task` 本文件 → PASS
- [x] `npm test` 绿

---

## 给执行帽的必读列表

1. `docs/spec/self-tech-graph/04_execution_waves.md` W3 · `03_external_docs_migration.md` §2
2. `docs/spec/self-tech-graph/reference/W0_inventory_diff_20260827.md` §迁留定稿矩阵 · §引用扫描
3. `docs/spec/self-tech-graph/reference/POINTERS.md`
4. `.github/workflows/ci.yml` + `assets/ci/samples/tech-graph.yml.example`（对照勿照抄脚本）
5. 工作区 `docs/dsh_coding_kit_optimization/00_inventory/` 四文件（只读复制）
6. `CHANGELOG.md`（02_version 里程碑）
7. `src/cli-refresh-ide-blocks.ts` L1–3 · `test/cli-refresh-ide-blocks.test.ts` L10–11

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单 task = CI + 02_version + 矩阵 W3 行 | no |
| R1 | CI 用本仓 bin，禁 Python compile 脚本 | no |
| R2 | graph.json 不做 CI git diff | no |
| R3 | 迁回不改写 · 不删原树 · 1.9.x 不 bump | no |

**residual_risks**：CI 首次跑若 lib 未生成须依赖 `npm ci` 的 prepare；外置 inventory 与 1.9.0 漂移已由 W1 声明，迁回件仅历史。

---

## 测试策略（Harness）

**test_strategy**: `required` —— workflow 三步可失败执行；注释改链以全量 `npm test` 回归。

---

### 自检结论（执行者）

- GATE_VERIFY：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 均为 **approved**；`verify --task` PASS（开工前 + 交付后）。
- W3-1：`.github/workflows/tech-graph.yml` 用本仓 `node bin/dsh-coding-kit.js`；`actions/checkout@v4` + `setup-node@v4`；单 Node `24.x`；`npm ci`；无 export、无 graph.json diff、无 Python 样例脚本。
- **CI 偏差（须 00 知悉）**：`graph yaml compile` 每次重写 md frontmatter `generated_at`（wall-clock）。裸 `git diff --exit-code -- docs/_tech_graph/*.md` **恒红**。workflow 改为 `git diff -I '^generated_at:' --exit-code`（与禁 graph.json diff 同源）。**未改编译器**（src 仅注释改链）。
- W3-2：`docs/_tech_graph/02_version.md` 含 1.2.3 DEF-023 · 1.2.4 DEF-006 · 1.6.1 DEF-031~033 · 1.9.0 现行 · 2026-08-28 W2 dogfood；上限 1.9.x；未抄模板 YYYY-MM-DD 占位。
- W3-3：四份 `reference/*_1.2.2.md` 文首历史锚 + 正文与工作区 `00_inventory/` 字节一致；原树未删；POINTERS `filled`（02/03/04 路径 · 树 B spec 历史债 · 树 C json_graph/query_graph · `#R07`）。
- W3-4：`src/cli-refresh-ide-blocks.ts` 与对应 test 头注释改为 `docs/spec/self-tech-graph/reference/POINTERS.md#R07`。再扫：SPEC.md / assets/README / releases/README / `test/cli-p0.test.ts` 否定断言维持明示外部指针。
- 验证：compile 5 图 OK · `git diff -I` PASS · check 5/5 OK · task lint PASS · `verify --spec` / `--task` PASS · typecheck PASS · `npm test` 310/310。
- 未 bump / 未 tag / 未 publish；未改 yaml 拓扑；未关账 / 未开 PR。

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
| 2026-08-28 | 00 起草并签收：W3 CI + 迁回 + POINTERS · 拟发版 1.9.x |
