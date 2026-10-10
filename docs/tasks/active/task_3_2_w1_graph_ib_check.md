# Task：3.2 W1 · graph ib check（节点 IB 点路径闸 · 核心）

> **状态**：`active` · **HG-AUDIT-R1=approved**（2026-10-10 **00 签收** · 可 30）  

> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10 维护者签收）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W1 · IB + ib check**  
> **SPEC 波钉**：[`04_execution_waves.md`](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) **W1** · 口径见 [`02`](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) §2 · [`03`](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) §1.1  
> **过程授权**：维护者授权本 epic **00 签收过程文档**（`HG-TASK-DRAFT` / `HG-AUDIT-R1` · 须 lint + 20-task-audit R1 PASS）· 见 [`invoke_20261010_00_epic_signoff.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261010_00_epic_signoff.md)  
> **反哺**：meta `BACKPORT_tech_graph_tools_to_specwave_v1_zh.md` **P0**（点路径存在性切片 · **不含** AST）  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-2-w1-ib-check`（自当前主干/3.1 关账点切出）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-2-w1-graph-ib-check` |
| **test_strategy** | `required` |
| **test_strategy_note** | 红测先行：临时 fixture（勿污染本仓 `docs/_tech_graph`）；覆盖假 IB path exit 2 · 真 path exit 0 · 无 IB / TBD 零打扰 · `--json` · 既有 drift/yaml/scaffold 零回归；四门为波末硬条款 |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-2-w1-ib-check` |
| **graph_delta** | `none` |
| **graph_delta_note** | 本波新增 CLI/测；**不**改 kit 自图语料语义；dogfood 只读对照 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 能力面新增；关账经验是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.2.0 epic W1；合入由维护者/00 按当次授权 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 级 · 2026-10-10 维护者签收 SPEC（继承 · 非本波代签） |
| HG-NEXT-PLAN | approved | — | epic 级 · 同窗签收 PLAN（继承） |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 **00 签收**（维护者授权签收过程文档 · 原文「签收，授权00签收后续文档」）· 依据 lint PASS + [`task_3_2_w1_graph_ib_check_audit_R1_20261010.md`](../../harness/reviews/task_3_2_w1_graph_ib_check_audit_R1_20261010.md) PASS · blocking 0 |
| HG-AUDIT-R1 | approved | **30** | 2026-10-10 **00 签收**（同授权）· 依据同上 20 审 R1 PASS · **可 30** |

---

## 背景与目标

3.1 `graph drift` 已闸 **边** `edges[].anchors[].path` 与模块表覆盖；dogfood 证实只改 **`nodes[].implementedBy.path`** 指向不存在文件时 drift 仍 PASS。现行 `YamlNode` 仅 `{ id, label, kind }`，产品面不承认 IB。

**完成态**：可选节点契约 `implementedBy`；`npx spec-wave graph ib check`（推荐名）扫描 path 存在性，假 path **exit 2** · `missing_ib_path`；无 IB / TBD **exit 0**；`--json` 只增；**不**改 3.1 drift 缺省语义；四门绿 · gate-check · **未** bump/tag/push/publish。

---

## 范围

严格对齐 SPEC `04` **W1** + PLAN **W1** + SPEC `02` §2 / `03` §1.1。

### 必做

- [x] **① 节点契约**：扩展 `src/cli-graph-yaml.ts`（及必要导出）承认可选 `nodes[].implementedBy.{path,symbol?}`——形状校验（若存在则须为 object · path 为 string）；**无 IB 的旧图零回归**；`symbol` 透传**不**做 AST  
- [x] **② CLI 接线**：`graph ib check [--target PATH] [--input DIR] [--json]` 接入 `src/cli-graph.ts`（help 列出 · 未知子命令不再吞掉 `ib`）；实现可落新模块（如 `cli-graph-ib.ts`）· 30 自裁  
- [x] **③ MVP 行为**：递归收集 input 下 graph yaml 的 IB path；空/`TBD` 跳过；相对 target 文件不存在 → exit 2 · kind `missing_ib_path`；全绿含 checked=0 → exit 0  
- [x] **④ 只读**：成功与失败路径均**零写盘** `_tech_graph`  
- [x] **⑤ `--json`**：经 `printJson`；**禁止**改既有 `graph yaml` / `drift` / `scaffold` / `axioms` / `ontology` 默认 stdout/exit  
- [x] **⑥ 测试**：新建 `test/graph-ib-check.test.ts`（或等价）；红测先行  
- [x] **⑦ 文档**：usage + README/手册一小节「点 vs 边」（drift=边 · ib=点）；禁宣称含 AST  
- [x] **⑧ 波末**：四门绿 · HG-AUDIT-R1（00 签后）· `gate-check` 待 00；禁 bump/tag/push/publish；禁 `git add -A`；禁开 W2+（`task close` 留 00）· **A10 close 留 00**

### 可选（不阻塞关账）

- [x] **O1**：N/A（已采独立 `graph ib check` · 非旗标）· A-opt1=N/A

## 非范围

| 项 | 理由 |
|----|------|
| `struct_rel` / 改 drift 模块表路径 | W2 |
| `graph indexes check` | W3 |
| AST symbol / call | 另 Epic · SPEC 非范围 |
| issue-sync / completeness 业务阈值 | 留消费仓 |
| 把 IB 并入 `graph drift` **缺省**行为 | SPEC 禁止改 3.1 缺省 |
| 自动重画图谱 / 写盘修复 | 只报告 |
| 自动 approved 任何 HG | 闸纪律 |
| bump / tag / push / `npm publish` | W5 / 仅人 |
| 污染本仓 dogfood `_tech_graph` 当负向 fixture | 测用临时目录 |
| SCHEMA_VERSION 大版本破坏性 bump（除非 task 显式人裁） | prefer 透传不严；若必须 STOP 报 00 |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改码 | 30 **拒开工**（verify 机械拦） | 是（20 审 + 00 签后） | 是 |
| IB path 不存在（非 TBD） | **exit 2** · `missing_ib_path` · 点名 | 是 | 是 / CI 红 |
| 无 IB / 全 TBD | **exit 0** | — | 摘要 checked=0 |
| `--json` 且有红项 | exit 2 · JSON 列差异 | 是 | 是 |
| IB 形状非法（非 object / path 非 string） | compile/check 或 ib check fail-closed（30 钉一种并测） | 是 | 点名 |
| 非 git 仓 | 沿用 `resolveTarget` fail 形态 | 是 | 是 |
| 试图写盘「修复」图谱 | **禁止** | — | — |
| 改 drift 缺省语义含 IB | 打回 | 是 | 审查 / 测红 |
| 顺手开 W2+/bump | 打回 | — | — |
| `git add -A` 裹挟域外档 | 打回 | 是 | — |
| 四门任一红 | 停止 · 先修再关账 | 是 | 是 |

---

## 验收标准

> **必做** A1–A10 为关账硬条款；**可选** A-opt1 不挡关账。

- [x] **A1 命令面**（必做）：`graph ib check --help`（或父 `graph --help`）可发现点闸入口与旗标；未知子命令不再把 `ib` 吞掉后无用法（若采 O1 旗标方案：help 仍须可发现 `--check-ib` 或等价）  
- [x] **A2 假 path 红**（必做）：fixture 节点 `implementedBy.path` 指向不存在文件（非 TBD）→ **exit 2** · 输出含该 path（或 `missing_ib_path`）  
- [x] **A3 真 path 绿**（必做）：IB path 均存在 → **exit 0**  
- [x] **A4 零打扰**（必做）：无任何 `implementedBy` 的图 → **exit 0**（不因「缺 IB」变红）  
- [x] **A5 TBD/空跳过**（必做）：path 为 `TBD` 或空 → **不**咬 exit 2  
- [x] **A6 `--json`**（必做）：有红项时 JSON 经 `printJson` 可解析且含差异；既有其它 graph `--json` 零回归  
- [x] **A7 只读**（必做）：成功/失败均零写盘目标 `_tech_graph`  
- [x] **A8 契约兼容**（必做）：含合法 IB 的 yaml 可被既有 `graph yaml check`（或 compile）接受（形状合法）；无 IB 旧测零回归  
- [x] **A9 四门**（必做）：`npm run typecheck` · `npm test` · `npm run build` · `npm run test:lib` 全绿  
- [ ] **A10 关账**（必做）：`gate-check` exit 0 + `task close --yes`；提交 `feat(3.2-W1): …` · 禁 `git add -A` · 未 tag/push/publish/bump · **00 本窗 close**  
- [x] **A-opt1**（可选）：N/A（独立子命令已满足）

---

## 给执行帽的必读列表

1. [`docs/spec/3_2-graph-ib-and-indexes/04_execution_waves.md`](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) **W1** · [`02`](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) §2 · [`03`](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) §1.1 / §3  
2. [`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W1**  
3. `src/cli-graph.ts`（分发/help）· `src/cli-graph-yaml.ts`（`YamlNode` / `validateGraphYaml`）· `src/cli-graph-drift.ts`（只读扫描 / `printJson` 模式参考 · **勿**改缺省语义）· `src/cli-shared.ts`（`printJson`）  
4. 3.1 W3 done task（结构参考 · **非**验收复制）  
5. `docs/standards/` 涉码 L2（改 `src/` 时 · 30 自裁）

---

## 思考轮

### R0 · 证据（起草棒实读现值）

| 锚点 | 实读 |
|------|------|
| YamlNode 无 IB | `src/cli-graph-yaml.ts:28` `type YamlNode = { id?: string; label?: string; kind?: string }` |
| 节点校验 | `src/cli-graph-yaml.ts:264-276` 查 id/label/kind · **不**拒未知键（但仍须类型扩展以透传 IB） |
| drift 只扫边锚点 | `src/cli-graph-drift.ts:239-244` 仅 `edges[].anchors[].path` |
| drift 配置族 | `src/cli-graph-drift.ts:12` `GRAPH_DRIFT_CONFIG_REL = '.spec-wave/graph-drift.yaml'`（本波**不**扩 `struct_rel`） |
| CLI 分发含 drift | `src/cli-graph.ts:51` / `:67` · **无** `ib` 子命令 |
| `--json` | `src/cli-shared.ts:481` `printJson` |
| SPEC/PLAN | `04` W1；PLAN W1；03 §1.1；epic 双闸 approved |

epic 双闸已 approved；本波 HG-TASK-DRAFT / HG-AUDIT-R1 仍 **pending**。

### R1 · 范围

仅 W1：IB 可选契约 + `graph ib check` MVP + 测 + 点/边文档。排除 struct_rel、indexes、AST、bump。

### R2 · 方案

- 扩 `YamlNode` + 形状校验；独立子命令（推荐）复用 drift 的 yaml 遍历/resolveTarget/`printJson` 模式。  
- 缺省不改 `graph drift`。  
- O1 旗标为备选，须文档主路径清晰。

### R3 · 边界

只报告不写盘；无 IB 零打扰；不做 symbol AST；不代签 HG；不进默认 `verify`。

### R4 · 可测性

A1–A8 临时 fixture + exit/stdout/json；A9–A10 四门+gate-check。红测先行。

### R5 · 签收就绪

五槽完毕；交 20-task-audit → **00 按维护者授权**签 HG-TASK-DRAFT + HG-AUDIT-R1 后方可 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | YamlNode 无 IB · drift 只扫边 · 无 ib 命令 | no |
| R1 | 仅 W1 点闸 · 排 W2+ | no |
| R2 | 契约扩展 + 独立子命令（旗标备选） | no |
| R3 | 只读 · 零打扰 · 无 AST | no |
| R4 | A1–A10 机检 | no |
| R5 | 待 20 审 R1 · 00 签过程闸 | no |

**residual_risks**：① 消费者误以为必须写 IB——靠 A4 与文案锁定；② 独立子命令 vs `--check-ib` 实现分歧——A1/O1 钉可发现性；③ compile 路径是否保留 IB 进 graph.json——30 须钉透传策略并测，避免静默丢字段。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 先（或同步）落地负向/正向 fixture（假 path · 真 path · 无 IB · TBD · `--json` · 零写盘），测红后实现；既有 graph 套件零回归；波末四门 + gate-check。

---

## 提交信息约定

- 实现提交：`feat(3.2-W1): graph ib check 节点 implementedBy 路径存在性闸`  
- **禁 `git add -A`**：逐文件显式 add  
- **不裹挟** `eval/external-oracle/` 等未跟踪档 · 不裹挟 W2+ 草稿  
- **禁 tag / push / publish / bump 3.2.0**  
- 波末：`npx spec-wave gate-check --task docs/tasks/active/task_3_2_w1_graph_ib_check.md`（或本仓 `node bin/` 等价）

---

### 自检结论（执行者）

- **hat**：30-execute（兼 40 自检）· 分支 `task/specwave-3-2-w1-ib-check`
- **GATE**：`node bin/specgate.js verify` → HG-AUDIT-R1=approved · VERIFY PASS · 可 30
- **实现**：`YamlNode` 可选 IB + 形状校验；`src/cli-graph-ib.ts` 独立子命令；compile/export **透传** IB 进 graph.json（N2）；TBD 大小写不敏感跳过（N1）；未改 drift 缺省
- **旧测影响面（N3）**：additive · 锁 `test/graph-ib-check.test.ts`（含 drift 缺省不含 IB 零回归）；未改 drift/scaffold/yaml 缺省语义
- **测**：`test/graph-ib-check.test.ts` **10** 例全绿
- **四门 / A9**：typecheck · test（969 pass / 0 fail · 含 ib×10）· build · test:lib（6 pass）**全绿**
- **A10**：`task close` **留 00**；本棒不 bump/tag/push/publish
- **advisory**：N1–N5 已吸收；O1/A-opt1=N/A

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | 10-task 初稿 · 00 开拆 W1 · HG-TASK-DRAFT / HG-AUDIT-R1 **pending** · 过程授权已记 |
| 2026-10-10 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · 可 30 |
| 2026-10-10 | 30/40：W1 实现 · A1–A8 勾选 · 自检回填 · A10 close 留 00 |
