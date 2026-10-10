# Task：3.1 W1 · graph scaffold 可审草稿脚手架（核心）

> **状态**：`ready_to_close` · **00 验收** 2026-10-10（verify/gate-check PASS · A1–A12）  

> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10 维护者签收）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W1 节**  
> **20-spec 审**：[`docs/harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md`](../../harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md)（conditional_pass · A1–A5 维护者已裁决回填）  
> **基线**：`spec-wave@3.0.2` published  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-1-w1-scaffold`（自 `main` 切出）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-1-w1-graph-scaffold` |
| **test_strategy** | `required` |
| **test_strategy_note** | 红测先行：临时目录 fixture（勿污染本仓 `docs/_tech_graph` dogfood）；覆盖 dry-run 零写盘 · `--yes`/`--dry-run` 同现 exit 1 · 非空拒写 · `--strict` 负向 exit 2 · 触顶截断 · full/struct-only · 清单路径钉死；四门为波末硬条款 |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-1-w1-scaffold` |
| **graph_delta** | `none` |
| **graph_delta_note** | 本波改 CLI/测；不改 kit 自图语料语义（dogfood 仅作回归对照时只读） |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 能力面新增；关账经验是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.1.0 epic W1；合入由维护者/00 按当次授权 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | 2026-10-10 维护者签收 SPEC（原文「签收，拆W1」） |
| HG-NEXT-PLAN | approved | — | 同窗签收 PLAN · 开 W 波限制已解除 |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 维护者本窗签收（原文「签收」）· 依据 lint PASS + 20 审 R1 PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-10 维护者本窗签收（原文「签收」）· 依据 [`task_3_1_w1_graph_scaffold_audit_R1_20261010.md`](../../harness/reviews/task_3_1_w1_graph_scaffold_audit_R1_20261010.md)（PASS · blocking 0）· **可 30** |

---

## 背景与目标

业务仓接入后「只有模板、无自动化内容」：须手工拷贝 `assets/graph/templates/` 再改假锚点。3.1 epic 以 **脚手架生成可审草稿** 为核心；模板业务占位**不扩**。W1 交付命令面 `graph scaffold` + 生成后轻检 + 唯一审核清单，使人与 Agent 有同一审核面；**不**自动人签 `HG-GRAPH-MODULES`。

**已核实关键事实**（2026-10-10 实读）：

- `src/cli-graph.ts:28-66`：子命令仅 `yaml` / `ingest` / `snapshot` / `axioms` / `ontology` · **无** `scaffold`  
- 缺省图谱目录惯例：`cli-graph.ts` yaml 面 → `docs/_tech_graph`  
- 维护者裁决（消解 20 审 A1–A5）已回填 SPEC 02/03：清单路径 · `--strict` · 互斥 exit 1 · `--mode` · 浅扫 4/200/16  

**完成态**：`npx spec-wave graph scaffold` 可在 fixture 仓写出草稿集合与 `REVIEW_CHECKLIST.md`；dry-run 默认零写盘；裁决旗标行为测锁；既有 `graph yaml *` 零回归；usage/手册一小节「可审草稿」口径；四门绿。

---

## 范围

严格对齐 PLAN **W1 节** + SPEC `04` W1 清单 + 维护者 A1–A5 裁决。

- [x] **① CLI 接线**（已落地）
- [x] **② 探测与写盘（`--mode full` 缺省）**（已落地）
- [x] **③ `--mode struct-only`**（已落地）
- [x] **④ 轻检 + `--strict` + `--no-compile`**（已落地）
- [x] **⑤ 写盘安全**（已落地）
- [x] **⑥ 测试** `test/graph-scaffold.test.ts` 10/10
- [x] **⑦ 文档口径** usage + README 双语 + 手册 §10
- [x] **⑧ 波末** 四门绿 · gate-check · **未** bump；A13 由 00 本窗 commit + `task close`

## 非范围

| 项 | 理由 |
|----|------|
| 扩 `assets/graph/templates/` 业务占位内容 | SPEC 冻结 · 仅协议原样落入 |
| `graph drift`（W3）/ 仓级词表（W4） | 其他波 |
| W2 入手链 / bootstrap 任务模板大改 / 宿主 skill 薄封装 | W2 |
| 自动 approved 任何 HG | 闸纪律 |
| 全仓子流程一次生成 / 无上限 AST | D4-a / SPEC 禁止 |
| 自定义本体 / 宿主 schema 变更 | 非本版 |
| bump / tag / push / `npm publish` | W5 / 仅人 |
| 改本仓 dogfood `docs/_tech_graph` 业务语义当「演示脚手架」 | 测用临时目录；勿污染自图 |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改码 | 30 **拒开工**（verify 机械拦） | 是（20 审 + 人签后） | 是 |
| `--yes` 与 `--dry-run` 同现 | exit 1 | 是 | 点名互斥 |
| 目标非空无覆盖旗标 | exit 2 · 拒写 | 是 | 点名路径 |
| `--strict` 且轻检不过 | exit 2 | 是（修锚点/glob） | 清单 + stderr |
| 浅扫触顶 | 截断 · 清单标明 · exit 0 | — | 清单「已截断」 |
| 探测零信号 | 最小草稿 + TBD · 清单「探测失败」 | 是（人补） | 是 |
| 写 S2 过程域 | 机械拒写 | — | 错误信息 |
| 污染本仓 `_tech_graph` dogfood 当 fixture | 打回 | 是 | 审查 |
| 顺手开 W2/W3/bump | 打回（每波一 task） | — | — |
| `git add -A` 裹挟域外档 | 打回 | 是 | — |
| 四门任一红 | 停止 · 先修再关账 | 是 | 是 |

---

## 验收标准

- [x] **A1 命令面**：`graph scaffold --help`（或父 `graph --help`）列出 scaffold；未知子命令不再吞掉 `scaffold` 名
- [x] **A2 dry-run 零写盘**：无 `--yes`（或仅 `--dry-run`）于空 fixture 仓 → exit 0 · 目标目录无新文件
- [x] **A3 互斥**：`--yes --dry-run` 同现 → **exit 1**
- [x] **A4 full 写盘**：`--yes --mode full` → 存在 `00_main.graph.yaml` · `01_struct.md` · ≥1×`10_flow_*.graph.yaml` · `99_mermaid_protocol.md` · **`REVIEW_CHECKLIST.md`**；人签表 pending；带草稿标记
- [x] **A5 struct-only**：`--yes --mode struct-only` → 有模块表与待补清单；**无**强制要求 `10_flow_*.graph.yaml`
- [x] **A6 非空拒写**：已有非草稿文件且无 `--overwrite-draft` → exit 2
- [x] **A7 strict**：构造轻检失败 fixture → 无 `--strict` exit 0（或 Warning）· 有 `--strict` → **exit 2**
- [x] **A8 触顶**：构造超深度/文件/节点 fixture → exit 0 · 清单含截断说明 · 主流程节点 ≤16
- [x] **A9 compile**：`--yes` 成功路径可 `graph yaml compile --all`（同进程或链式）对产出绿（struct-only 时 compile 范围按实现钉死且测锁）
- [x] **A10 回归**：既有 `graph yaml` / 相关测试零回归；本仓 `docs/_tech_graph` 非本波改语义
- [x] **A11 口径**：usage + README/手册小节无「自动权威图谱」违纪表述
- [x] **A12 四门**：`npm run typecheck` · `npm test` · `npm run build` · `npm run test:lib` 全绿
- [x] **A13 关账**：`gate-check` exit 0 + `task close --yes`；提交 `feat(3.1-W1): …` · 禁 `git add -A` · 未 tag/push/publish/bump（**00 本窗关账** · 授权「验收W1」）

---

## 给执行帽的必读列表

1. [`docs/spec/3_1-tech-graph-scaffold/02_product_scheme.md`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) · [`03_cli_and_review.md`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) · [`04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) W1  
2. [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) W1 节 + 硬约束  
3. [`docs/harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md`](../../harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md) 附录 A1–A5  
4. `src/cli-graph.ts`（分发入口 · 现值 `:28-66`）· `src/cli-graph-yaml.ts`（compile 复用）  
5. `assets/graph/templates/99_mermaid_protocol.md`（协议原样源）  
6. `docs/standards/` 涉码 L2（30 自裁）

---

## 思考轮

### R0 · 证据

双闸已签；20 审 conditional_pass；A1–A5 已回填 SPEC。`cli-graph.ts` 无 scaffold。浅扫上限与模式/严格/互斥已成产品钉，勿在 30 重开二选一。

### R1 · 范围

仅 W1：scaffold CLI + 探测写盘 + 轻检/strict + 清单 + 测 + 最小文档口径。排除 drift/词表/W2 DX 大改/bump。

### R2 · 方案

新建 `cli-graph-scaffold.ts`（或等价模块）由 `cmdGraph` 分发；探测启发式可测、上限常量导出供测断言；临时目录 fixture；复用 `compileGraph` 而非重写渲染。

### R3 · 边界

S2 禁写；非空拒写；草稿覆盖窄语义；fixture 禁碰本仓 dogfood；对外口径「可审草稿」。

### R4 · 可测性

A1–A13 均可命令/文件存在性/exit code 机检；触顶与 strict 须负向 fixture。

### R5 · 签收就绪

草稿五槽完毕；交 20-task-audit → 人签 HG-AUDIT-R1 后方可 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 双闸签收 · A1–A5 钉齐 · 无 scaffold 现状 | no |
| R1 | 仅 W1 脚手架面 | no |
| R2 | 新模块 + 复用 compile + 临时 fixture | no |
| R3 | 写盘/S2/口径边界 | no |
| R4 | A1–A13 机检 | no |
| R5 | 待 20 审 R1 | no |

**residual_risks**：① monorepo 探测噪声靠清单人审（已知）；② struct-only 与 compile 同进程交互边界须测锁；③ 30 误改本仓 `_tech_graph` dogfood。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 先写失败用例（互斥 / 拒写 / strict / 触顶）再实现；全用 `os.tmpdir` 或测试沙箱仓根；波末四门 + gate-check。

---

## 提交信息约定

- 实现提交：`feat(3.1-W1): graph scaffold 可审草稿脚手架`
- **禁 `git add -A`**：逐文件显式 add  
- **不裹挟** `eval/external-oracle/` 等未跟踪档 · 不裹挟 W2+ 草稿  
- **禁 tag / push / publish / bump 3.1.0**  
- 波末：`npx spec-wave gate-check --task docs/tasks/active/task_3_1_w1_graph_scaffold.md`（或本仓 `node bin/specgate.js` 等价）

---

### 自检结论（执行者）

**帽**：30-execute + 40-self-check · **日期**：2026-10-10 · **未 bump / 未 tag / 未 publish**（commit 待维护者或 00）

#### GATE_VERIFY

```text
$ node bin/specgate.js verify --target . --task docs/tasks/active/task_3_1_w1_graph_scaffold.md
| HG-TASK-DRAFT | approved | 20, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
VERIFY: PASS
```

#### 实现要点

- 新增 `src/cli-graph-scaffold.ts`；`cli-graph.ts` 分发 `scaffold`；usage / README 双语 / 手册 §10
- 旗标：`--mode` · `--strict` · `--yes`/`--dry-run` 互斥 exit 1 · `--overwrite-draft` · `--no-compile`（N2）
- 浅扫上限导出常量 4/200/16；清单唯一 `REVIEW_CHECKLIST.md`
- 测：`test/graph-scaffold.test.ts` 10/10；临时目录 fixture · 未改本仓 dogfood 语料
- 20 审 N1–N5：旧测影响面注明本套件；`--no-compile`；overwrite 正向；struct-only 出清单；非法 stack exit 1

#### 验收勾选

- [x] A1–A12（见上）
- [x] A13 关账 / commit（00 本窗）

#### 四门

- typecheck 0 · `npm test` 全绿（含 graph-scaffold 10）· build 0 · test:lib 6/6
- `gate-check`：未发现阻塞

#### invoke

`docs/harness/invokes/by-task/3-1-w1-graph-scaffold/invoke_20261010_30_40_3-1-w1-graph-scaffold.md`

Wiki: none

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | 10-task 初稿 · 维护者签收双闸后拆 W1 |
| 2026-10-10 | HG-TASK-DRAFT / HG-AUDIT-R1=approved（维护者「签收」· 20 审 R1 PASS） |
| 2026-10-10 | 30/40 实现闭环 · A1–A12 · 待 A13 commit/close |
| 2026-10-10 | **00 验收签收** · A13 commit + close · 开拆 W2（入手链 DX） |
