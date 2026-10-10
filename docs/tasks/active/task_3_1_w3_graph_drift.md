# Task：3.1 W3 · graph drift 漂移闸（轨 B 完整 · F-2）

> **状态**：`in_progress` · **00 签收双闸** 2026-10-10（20 审 R1 PASS · blocking 0）  

> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10 · epic 级已签）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W3 · 漂移（F-2）**  
> **SPEC 波钉**：[`04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W3** · 口径见 [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) **§3.2** · [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) **§1.3** / failure「漂移 exit 2」  
> **3.0.2 延后说明**：[`PLAN_3_0_2_patch_v1_zh.md`](../../roadmap/PLAN_3_0_2_patch_v1_zh.md) 非范围 **F-2**（一级包目录 ∈ modules · 白名单 · 锚点消失；与 F-1② 同族 `.spec-wave/`）  
> **上游关账**：W1 [`docs/tasks/done/task_3_1_w1_graph_scaffold.md`](../done/task_3_1_w1_graph_scaffold.md) · W2 [`docs/tasks/done/task_3_1_w2_graph_dx.md`](../done/task_3_1_w2_graph_dx.md)（结构模板参考 · **勿回灌实现验收**）  
> **00 开拆**：[`invoke_20261010_00_3-1-w3-graph-drift.md`](../../harness/invokes/by-task/3-1-w3-graph-drift/invoke_20261010_00_3-1-w3-graph-drift.md)  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-1-w3-drift`（自 W2 关账点切出）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-1-w3-graph-drift` |
| **test_strategy** | `required` |
| **test_strategy_note** | 红测先行：新建 `test/graph-drift.test.ts`（或等价）于临时 fixture 仓（**勿污染**本仓 `docs/_tech_graph` dogfood）；覆盖正向绿 · 一级目录未入模块表 exit 2 · 已登记锚点 path 消失 exit 2 · 白名单豁免 · `--json` 信封 · 既有 `graph yaml`/`scaffold`/`axioms`/`ontology` 零回归；四门为波末硬条款 |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-1-w3-drift` |
| **graph_delta** | `none` |
| **graph_delta_note** | 本波新增漂移 CLI/测；**不**改 kit 自图语料语义；dogfood 仅只读对照或白名单说明 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 能力面新增；关账经验是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.1.0 epic W3；合入由维护者/00 按当次授权 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 级 · 2026-10-10 维护者签收 SPEC（继承 · 非本波代签） |
| HG-NEXT-PLAN | approved | — | epic 级 · 同窗签收 PLAN（继承） |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 **00 签收**（授权「签收过程文档」）· 依据 lint PASS + 20 审 R1 PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-10 **00 签收** · 依据 [`task_3_1_w3_graph_drift_audit_R1_20261010.md`](../../harness/reviews/task_3_1_w3_graph_drift_audit_R1_20261010.md)（PASS · blocking 0）· **可 30** |

---

## 背景与目标

3.0.2 已公开延后 **F-2**：图谱漂移缺机械闸（新命令面 + 白名单 + 锚点消失）。W1 交付生成后轻检（写盘时点），W2 接入手链；代码后续变更后仍无「模块表覆盖 / 锚点还在否」的可入 CI 闸。

**完成态**：`npx spec-wave graph drift` 可对目标仓读 `01_struct` 模块表与 `*.graph.yaml` 锚点，报告 MVP 漂移（一级包目录未覆盖 · 已登记 path 消失），漂移红 **exit 2**；`--json` 经既有 `printJson` 信封**只增不改**其它命令；负向 fixture 锁行为；可选 CI 样例步骤；**不**自动重画图谱；四门绿 · gate-check · **未** bump/tag/push/publish。

---

## 范围

严格对齐 SPEC `04` **W3** + PLAN **W3 · 漂移（F-2）** + SPEC `02` §3.2 / `03` §1.3。验收拆 **必做 / 可选**（可选不阻塞关账，见 A-opt）。

### 必做

- [x] **① CLI 接线**：`graph drift [--target PATH] [--input DIR] [--json]` 接入 `src/cli-graph.ts`（help 列出 · 未知子命令不再吞掉 `drift` 名）；实现可落新模块（如 `cli-graph-drift.ts`）· 30 自裁
- [x] **② MVP · 模块覆盖**：扫描目标仓**一级包/模块目录**（与脚手架探测候选同族或可测钉死集合 · 见 R0 `MODULE_DIR_CANDIDATES`），每个须被 `01_struct.md` 模块表某行「路径 glob / 模块根」覆盖；未覆盖 → 漂移 · **exit 2**
- [x] **③ MVP · 锚点消失**：从 `--input`（缺省 `docs/_tech_graph`）下 `*.graph.yaml` 收集已登记 `edges[].anchors[].path`（及实现若一并纳入的节点 path · 须测锁）；`path` 空/`TBD` **不计**失败；相对 `--target` 的 path **文件不存在** → 漂移 · **exit 2**
- [x] **④ 白名单**：可配置豁免一级目录（及必要时锚点 path 前缀/字面）；缺省文件 = 无豁免即全量检查；配置落点候选 **`.spec-wave/graph-drift.yaml`**（与 3.0.2 `.spec-wave/pins-consumer.yaml` / W4 `graph-vocab.yaml` 同族 · schema 由 30 钉死并测锁）
- [x] **⑤ `--json`**：经 `printJson` 输出差异信封；**禁止**改既有 `graph yaml` / `axioms` / `ontology` / `scaffold` 的默认 stdout/exit 语义
- [x] **⑥ 测试**：负向 + 正向 fixture；红测先行再实现
- [x] **⑦ 文档口径**：usage / README 或手册一小节「漂移闸 · 只报告不重画」；禁「自动权威图谱 / 自动重画」违纪表述
- [x] **⑧ 波末**：四门绿 · HG-AUDIT-R1（人签后）· `gate-check`；禁 bump/tag/push/publish；禁 `git add -A`；禁开 W4 vocab / W5 release（**`task close` 留 00**）

### 可选（本波可交付 · 不阻塞关账）

- [x] **O1 CI 样例**：在 `assets/ci/samples/` 增或扩 example workflow **可选步骤**（如注释块 `npx spec-wave graph drift` · `package-manager-cache: false` 纪律对齐既有 tech-graph/hgm 样例）；README 矩阵标注「可选」；未做不挡 A-关账

## 非范围

| 项 | 理由 |
|----|------|
| 自动重画 / 改写 `docs/_tech_graph` 语料 | SPEC 02 §3.2 · PLAN W3 |
| 改 scaffold 探测/写盘/轻检语义 | W1 已关 · 禁返工 |
| 改既有 `graph yaml compile\|export\|check` 默认判定语义 | PLAN 硬约束 3 |
| 仓级词表 `.spec-wave/graph-vocab.yaml`（W4） | 其他波（本波仅可预留同目录约定注释） |
| 路由前缀 / 表名 / SSE 事件等扩展漂移面 | 3.0.2 F-2 远期设计；本波 MVP 仅目录覆盖 + 锚点 path |
| W2 入手链返工 / 宿主薄封装 | W2 已关或可选跳过 |
| 自动 approved 任何 HG | 闸纪律 |
| bump / tag / push / `npm publish` | W5 / 仅人 |
| 污染本仓 dogfood `_tech_graph` 当负向 fixture | 测用临时目录 |
| 强制本仓 CI 把 drift 升为硬门禁 | 样例可选；kit 自身 workflow 是否接线归 00/维护者另裁 |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改码 | 30 **拒开工**（verify 机械拦） | 是（20 审 + 人签后） | 是 |
| 一级包目录未出现在模块表（且非白名单） | **exit 2** · 点名目录 | 是（补表或白名单） | 是 / CI 红 |
| 已登记锚点 path 消失（非 TBD） | **exit 2** · 点名 path | 是（修码或改 YAML） | 是 / CI 红 |
| `--json` 且有漂移 | exit 2 · JSON 列差异（经 `printJson`） | 是 | 是 |
| 无漂移 | exit 0 | — | 摘要或空差异 |
| `01_struct.md` 缺失 / 模块表不可解析 | exit 2 fail-closed（点名） | 是 | 是 |
| 白名单 YAML 坏 / schema 非法 | exit 2 fail-closed | 是 | 点名键 |
| 非 git 仓 | 沿用既有 `resolveTarget` fail 形态 | 是 | 是 |
| 试图写盘「修复」图谱 | **禁止**（本命令只读报告） | — | — |
| 改其它 graph 子命令默认语义 | 打回 | 是 | 审查 / 测红 |
| 顺手开 W4/W5/bump | 打回（每波一 task） | — | — |
| `git add -A` 裹挟域外档 | 打回 | 是 | — |
| 四门任一红 | 停止 · 先修再关账 | 是 | 是 |

---

## 验收标准

> **必做** A1–A10 为关账硬条款；**可选** A-opt1 本波可交付，未做不挡关账。

- [x] **A1 命令面**（必做）：`graph drift --help`（或父 `graph --help`）列出 drift 与旗标；`graph` 未知子命令不再把 `drift` 当未知吞掉后无用法
- [x] **A2 模块覆盖红**（必做）：fixture 仓有一级候选目录（如 `src/`）但 `01_struct` 模块表无覆盖该根 → `graph drift` **exit 2** · 输出点名该目录
- [x] **A3 模块覆盖绿**（必做）：表内 glob/根覆盖全部应检一级目录（或目录在白名单）→ 无此类漂移项 ·（若无锚点漂移）**exit 0**
- [x] **A4 锚点消失红**（必做）：YAML 登记 `anchors[].path` 指向不存在文件（非 `TBD`）→ **exit 2** · 点名 path
- [x] **A5 锚点绿 / TBD**（必做）：path 存在 → 不报消失；`TBD` 或不计失败形态 → **不**因 TBD 咬 exit 2
- [x] **A6 白名单**（必做）：配置豁免某一级目录后，A2 同类 fixture → exit 0（就该规则而言）；缺省无配置文件行为可测钉死
- [x] **A7 `--json`**（必做）：有漂移时 JSON 经 `printJson` 可解析且含差异字段；**既有**其它 `graph * --json` / 非 json 路径测零回归（只增）
- [x] **A8 只读**（必做）：成功与失败路径均**零写盘**目标 `_tech_graph`（对照 dry-run 纪律 · 可用 mtime/文件列表断言）
- [x] **A9 四门**（必做）：`npm run typecheck` · `npm test` · `npm run build` · `npm run test:lib` 全绿
- [ ] **A10 关账**（必做）：`gate-check` exit 0 + `task close --yes`；提交 `feat(3.1-W3): …` · 禁 `git add -A` · 未 tag/push/publish/bump · **30/40：gate-check + commit 已就绪 · `task close` 留 00**
- [x] **A-opt1 CI 样例**（可选 · 未做不挡 A10）：`assets/ci/samples/` 存在 drift 可选步骤（独立 example 或扩 `tech-graph.yml.example` 注释步）+ samples README 标注可选

---

## 给执行帽的必读列表

1. [`docs/spec/3_1-tech-graph-scaffold/04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W3** · [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) §3.2 · [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) §1.3 / §3 漂移行  
2. [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) **W3 · 漂移（F-2）**  
3. [`docs/roadmap/PLAN_3_0_2_patch_v1_zh.md`](../../roadmap/PLAN_3_0_2_patch_v1_zh.md) 非范围 F-2（延后说明 · `.spec-wave/` 同族）  
4. `src/cli-graph.ts`（分发/help）· `src/cli-graph-scaffold.ts`（模块候选与轻检 path 存在性）· `src/cli-graph-yaml.ts`（anchors 解析）· `src/cli-shared.ts`（`printJson`）  
5. `assets/graph/templates/01_struct.md`（模块表列形）· `assets/ci/samples/`（可选 CI）  
6. W1/W2 done task（结构参考 · **非**验收复制）  
7. `docs/standards/` 涉码 L2（改 `src/` 时 · 30 自裁）

---

## 思考轮

### R0 · 证据（起草棒实读现值）

| 锚点 | 实读 |
|------|------|
| CLI 分发 · 无 drift | `src/cli-graph.ts:30-47` usage 子命令仅 yaml/scaffold/ingest/snapshot/axioms/ontology · **无** `drift`；`:50-75` 分发同集合 · 未知 → `fail` |
| scaffold 一级目录候选 | `src/cli-graph-scaffold.ts:20-31` `MODULE_DIR_CANDIDATES`（src/app/api/lib/…/packages/services）；`:150-187` `inferModules` 写模块表行 |
| 模块表写出列形 | `src/cli-graph-scaffold.ts:307+` / 模板 `assets/graph/templates/01_struct.md`：`module_id \| 名称 \| 路径 glob \| …`；**本仓 dogfood** `docs/_tech_graph/01_struct.md` 为另一列形（`模块\|职责\|读\|写\|被谁调`）——漂移解析须以**协议表**为准，dogfood 兼容/豁免 30 钉死并测 |
| 锚点 path 校验（写盘时点） | `src/cli-graph-scaffold.ts:568-582` `runLightChecks`：`existsSync(target+path)` · TBD 跳过 |
| 锚点在 compile/check | `src/cli-graph-yaml.ts:29` / `:173-178` 校验 **有 path 字段**；`:336-342` `normalizeAnchors`；`:382` 入 payload；`checkGraph`（`:614+`）比对 yaml↔graph.json · **不**做工作区文件存在性 |
| `--json` 信封 | `src/cli-shared.ts:477-483` `printJson` 唯一出口；axioms/ontology 已用（`cli-graph.ts:44-46` 等） |
| 白名单 / `.spec-wave/` | 已有 `src/cli-pins.ts:20` `CONSUMER_PINS_REL = '.spec-wave/pins-consumer.yaml'`；W4 规划 `.spec-wave/graph-vocab.yaml`；**尚无** drift 配置档 → 候选 `.spec-wave/graph-drift.yaml` |
| CI 样例落点 | `assets/ci/samples/tech-graph.yml.example` / `hgm-ingest.yml.example`（可选 · `package-manager-cache: false`）· README 矩阵 |
| SPEC/PLAN | `04` W3 五条；PLAN W3 三行；03 failure「漂移 exit 2」；3.0.2 非范围 F-2 |

epic 双闸已 approved；本波 HG-TASK-DRAFT / HG-AUDIT-R1 仍 **pending**。

### R1 · 范围

仅 W3：`graph drift` MVP（模块覆盖 + 锚点消失 + 白名单 + `--json`）· 负向测 · 可选 CI 样例。排除自动重画、scaffold 返工、W4/W5、bump。

### R2 · 方案

- 新子命令 + 只读检查器；复用 `resolveTarget` / `--input` 缺省 `docs/_tech_graph`。  
- 模块表：解析协议列「路径 glob」→ 覆盖判定（前缀/`**` 惯例与 scaffold 一致即可测锁）。  
- 锚点：遍历 input 下 graph yaml · 收集 path · `existsSync`。  
- 白名单：`.spec-wave/graph-drift.yaml`（缺省=无文件全检）。  
- JSON：只增 `printJson` payload。  
- CI：注释可选步，不强制 kit 自身硬门禁。

### R3 · 边界

不写盘修图；不改 yaml check 语义；不把 dogfood 列形差异当成「悄悄改自图」借口（兼容策略须显式）；不实现路由/表名/SSE 漂移；不代签 HG。

### R4 · 可测性

A1–A8 临时 fixture + exit/stdout/json 断言；A9–A10 四门+gate-check；A-opt1 文件存在性。红测先行。

### R5 · 签收就绪

五槽完毕；交 20-task-audit → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 后方可 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 无 drift 命令 · 轻检有 path 存在性 · check 无 fs 锚点闸 · 无 drift 白名单档 | no |
| R1 | 仅 W3 MVP · CI 可选不挡关账 | no |
| R2 | 新子命令 + struct 解析 + anchors fs + `.spec-wave/graph-drift.yaml` | no |
| R3 | 只报告 · 不重画 · 不改 yaml 默认语义 | no |
| R4 | A1–A10 机检 · A-opt 可选 | no |
| R5 | 待 20 审 R1 | no |

**residual_risks**：① 本仓 dogfood `01_struct` 列形与模板协议不一致——须显式兼容/跳过策略，避免误伤 kit 自检；② 「一级包目录」边界（是否扫全部 top-level 或仅 `MODULE_DIR_CANDIDATES`）须 30 钉死并测锁，防过宽误报；③ 可选 CI 若写成硬门禁会牵动消费仓升级摩擦——默认注释可选步。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 先（或同步）落地负向/正向 fixture 测（模块未覆盖 · 锚点消失 · 白名单 · `--json` · 零写盘），测红后实现 `graph drift`；既有 graph 套件零回归；波末四门 + gate-check。

---

## 提交信息约定

- 实现提交：`feat(3.1-W3): graph drift 模块覆盖与锚点消失闸`
- **禁 `git add -A`**：逐文件显式 add  
- **不裹挟** `eval/external-oracle/` 等未跟踪档 · 不裹挟 W4+ 草稿  
- **禁 tag / push / publish / bump 3.1.0**  
- 波末：`npx spec-wave gate-check --task docs/tasks/active/task_3_1_w3_graph_drift.md`（或本仓 `node bin/dsh-coding-kit.js` 等价）

---

### 自检结论（执行者）

| 项 | 结论 |
|----|------|
| GATE_VERIFY | PASS · HG-AUDIT-R1 approved · ✅ 可 30（`node bin/specgate.js verify --task …`） |
| A1–A9 | PASS（`test/graph-drift.test.ts` 12 测） |
| A10 | 部分：gate-check exit 0 + 待 commit；**`task close` 留 00** |
| A-opt1 | 已做（`tech-graph.yml.example` 注释步 + samples README） |
| 四门 | PASS · typecheck / test / build / test:lib |
| 未 bump/tag/push/publish | 是 |
| N1–N6 | 空/TBD 同跳过 · dogfood 旧列形兼容测锁 · 仅 `MODULE_DIR_CANDIDATES` · 锚点豁免 schema 已支持 · 旧测零回归 · SPEC W0 勾选归 00 |

Wiki: none

**旧测影响面（N5）**：`test/graph-*.test.ts` · `cli-graph-yaml-*` · scaffold / axioms / ontology 套件未改语义；本波只增 `graph drift`。

### KPI（00）

（占位 · 00 CLOSE 时按 `KPI_RUBRIC_v1_2` 填写）

- rubric：`KPI_RUBRIC_v1_2` · 30/40 实现 + 00 签闸/关账

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | 10-task 初稿 · 00 开拆 W3 · HG-TASK-DRAFT / HG-AUDIT-R1 **pending** |
| 2026-10-10 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · 可 30 |
