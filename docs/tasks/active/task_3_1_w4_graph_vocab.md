# Task：3.1 W4 · 仓级词表扩展（轨 C · F-1②）

> **状态**：`in_progress` · **00 签收双闸** 2026-10-10（20 审 R1 PASS · blocking 0）  

> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10 · epic 级已签）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W4 · 仓级词表（F-1②）**  
> **SPEC 波钉**：[`04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W4** · 口径见 [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) **§4.2** · [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) **§1.4** / failure「仓级词表坏 YAML / 与内置冲突 exit 2」  
> **3.0.2 延后说明**：[`PLAN_3_0_2_patch_v1_zh.md`](../../roadmap/PLAN_3_0_2_patch_v1_zh.md) 非范围 **F-1②**（`.spec-wave/graph-vocab.yaml` · 与 F-2 同族 `.spec-wave/`）  
> **上游关账**：W3 [`docs/tasks/done/task_3_1_w3_graph_drift.md`](../done/task_3_1_w3_graph_drift.md)（`.spec-wave/graph-drift.yaml` 加载先例 · **勿回灌实现验收**）· W1/W2 done（结构参考）  
> **00 开拆**：[`invoke_20261010_00_3-1-w4-graph-vocab.md`](../../harness/invokes/by-task/3-1-w4-graph-vocab/invoke_20261010_00_3-1-w4-graph-vocab.md)  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-1-w4-vocab`（自 W3 关账点切出）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-1-w4-graph-vocab` |
| **test_strategy** | `required` |
| **test_strategy_note** | 红测先行：新建 `test/graph-vocab.test.ts`（或扩既有 `f1-unify` 仓级面 · 30 自裁）于临时 fixture 仓（**勿污染**本仓 `docs/_tech_graph` dogfood / 勿写本仓 `.spec-wave/graph-vocab.yaml` 当负向样）；覆盖缺省无文件=3.0.2 行为 · 登记扩展边型零 Warning · 未登记仍 Warning 不咬 exit · 坏 YAML / 与内置冲突 exit 2 · 既有 `graph yaml`/`scaffold`/`drift`/`axioms`/`ontology` 零回归；四门为波末硬条款 |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-1-w4-vocab` |
| **graph_delta** | `none` |
| **graph_delta_note** | 本波改加载链与可选诊断；**不**改 kit 自图语料语义；dogfood 仅只读对照 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 能力面新增（仓级扩展档）；关账经验是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.1.0 epic W4；合入由维护者/00 按当次授权 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 级 · 2026-10-10 维护者签收 SPEC（继承 · 非本波代签） |
| HG-NEXT-PLAN | approved | — | epic 级 · 同窗签收 PLAN（继承） |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 **00 签收**（授权签收过程文档）· 依据 lint PASS + 20 审 R1 PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-10 **00 签收** · 依据 [`task_3_1_w4_graph_vocab_audit_R1_20261010.md`](../../harness/reviews/task_3_1_w4_graph_vocab_audit_R1_20261010.md)（PASS · blocking 0）· **可 30** |

---

## 背景与目标

3.0.2 以 **F-1①** 内置补登记清零 `branches`/`triggers` 噪音，并公开延后 **F-1②** 仓级词汇扩展档（与 F-2 同族 `.spec-wave/`）。W3 已落地 `.spec-wave/graph-drift.yaml` 先例；消费仓仍无法在不改 kit 内置档的前提下登记自有边型。

**完成态**：目标仓可选 `.spec-wave/graph-vocab.yaml` 与内置 `assets/tech-graph-vocab.yaml` **合并**后供 `graph yaml compile|check`（及既有 Warning 钩）消费；冲突 / 坏 YAML **fail-loud exit 2**；缺省无仓级文件 = 行为与 **3.0.2** 一致；登记扩展边型 → 零 Warning；未登记显式 type 仍 Warning（「登记 ≠ 封闭」不回退 · 不咬 exit）；文档最小一节说明消费仓如何声明扩展；负向 fixture · 四门绿 · gate-check · **未** bump/tag/push/publish · **未**开 W5。

---

## 范围

严格对齐 SPEC `04` **W4** + PLAN **W4 · 仓级词表（F-1②）** + SPEC `02` §4.2 / `03` §1.4。验收拆 **必做 / 可选**（可选不阻塞关账，见 A-opt）。

### 必做

- [x] **① 加载合并**：在 `loadTechGraphVocab`（或等价单源加载点）于目标仓根读取 **`.spec-wave/graph-vocab.yaml`**，与包内 `assets/tech-graph-vocab.yaml` **合并**；路径常量与 drift/pins 同族（见 R0）
- [x] **② 缺省一致**：目标仓**无**该文件 → 仅内置词表 · `compile|check` Warning/exit 与 **3.0.2** 可测等价（既有 `f1-unify` / 钩②钉不回退）
- [x] **③ 冲突 / 坏档 fail-loud**：仓级 YAML 不可解析、schema 非法、或与内置 **冲突**（至少：同 `kinds[].id` 不同 `class` · 其它冲突键由 30 钉死并测锁）→ **exit 2** · 点名路径/键（对齐 SPEC `03` §3）
- [x] **④ 扩展边型零 Warning**：仓级登记额外 `edge_types` 后，fixture 显式 `type:` 该扩展 → `graph yaml compile|check` stderr **无**「未在 tech-graph 词汇登记档」Warning · exit 不因 Warning 变红
- [x] **⑤ 未登记仍 Warning**：显式未登记 type（如 `bogus_edge`）仍 Warning · **不咬 exit**（「登记 ≠ 封闭」不回退）
- [x] **⑥ 加载面**：合并结果须挂在 **`graph yaml compile|check`** 加载链（`printTechVocabWarnings` / `collectTechVocabWarnings` 消费合并后词表）；**禁止**只改文档不接线
- [x] **⑦ 文档**：README 或 [`docs/guides/使用手册-v3.0.0-zh.md`](../../guides/使用手册-v3.0.0-zh.md) 或仓根 [`MIGRATION.md`](../../../MIGRATION.md) **最小一节**「消费仓如何声明 `.spec-wave/graph-vocab.yaml` 扩展」（路径 · 合并 · 冲突 exit 2 · 登记≠封闭）；禁「自动权威图谱」违纪表述
- [x] **⑧ 测试**：负向 + 正向 fixture；红测先行再实现；**勿**改 drift/scaffold 语义测锁
- [x] **⑨ 波末**：四门绿 · HG-AUDIT-R1（人签后）· `gate-check`；禁 bump/tag/push/publish；禁 `git add -A`；禁开 W5 release（**`task close` 留 00**）

### 可选（本波可交付 · 不阻塞关账）

- [x] **O1 `graph vocab show`**：显式诊断合并后词表（`--target` / `--json` 形态 30 自裁）；**非硬门槛**（SPEC `03` §1.4）；未做不挡 A-关账

## 非范围

| 项 | 理由 |
|----|------|
| 改 `graph drift` / scaffold 探测·写盘·轻检语义 | W1/W3 已关 · 禁返工 |
| 改既有 `graph yaml compile\|export\|check` 在**无仓级文件**时的默认判定松紧 | SPEC `00` §5 · 缺省=3.0.2 |
| 回退「登记 ≠ 封闭」或把未登记 type 升为 exit 红 | SPEC `02` §4.2 |
| 改内置 `assets/tech-graph-vocab.yaml` 业务边型集合（本波非 F-1① 补登记） | 除非测夹/注释指针必要 · 默认不动六条边型钉 |
| W5 bump / CHANGELOG 全量发版收口 / tag / push / `npm publish` | 其他波 / 仅人 |
| 自动 approved 任何 HG | 闸纪律 |
| 污染本仓 dogfood `_tech_graph` 或本仓 `.spec-wave/graph-vocab.yaml` 当负向 fixture | 测用临时目录 |
| 强制 kit 自身 CI 升仓级词表为硬门禁 | 文档/可选命令即可 |
| 扩模板业务占位 / 自定义产品本体 | PLAN 非范围 · ONTO-OPEN |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改码 | 30 **拒开工**（verify 机械拦） | 是（20 审 + 人签后） | 是 |
| 仓级词表坏 YAML / 不可解析 | **exit 2** fail-closed · 点名 `.spec-wave/graph-vocab.yaml` | 是 | 是 / CI 红 |
| 仓级 schema 非法（根型/version/必填键等 · 30 钉） | **exit 2** · 点名键 | 是 | 是 |
| 与内置冲突（同 kind id 不同 class 等） | **exit 2** · 点名冲突键 | 是（改仓级档） | 是 |
| 缺省无仓级文件 | 仅内置 · 行为同 3.0.2 | — | Warning 面不变 |
| 仓级登记扩展边型且 YAML 使用该 type | 零「未登记」Warning · exit 不因钩②变红 | — | 静默通过钩② |
| 显式 type 未登记 | stderr Warning · **不咬 exit** | 是（登记或改 type） | 是 |
| 顺手改 drift/scaffold 默认语义 | 打回 | 是 | 审查 / 测红 |
| 顺手开 W5 / bump / tag / push / publish | 打回（每波一 task） | — | — |
| `git add -A` 裹挟域外档 | 打回 | 是 | — |
| 四门任一红 | 停止 · 先修再关账 | 是 | 是 |

---

## 验收标准

> **必做** A1–A9 为关账硬条款；**可选** A-opt1 本波可交付，未做不挡关账。

- [x] **A1 缺省等价**（必做）：临时 fixture **无** `.spec-wave/graph-vocab.yaml` → `graph yaml compile|check` 对已登记六条 / `bogus_edge` 行为与 3.0.2 钩②钉一致（已登记零告警 · 未登记 Warning 不咬 exit）
- [x] **A2 扩展零 Warning**（必做）：fixture 声明仓级 `edge_types` 含自定义串（如 `my_ext_edge`）且 YAML 显式 `type: my_ext_edge` → stderr **无**「未在 tech-graph 词汇登记档」· 相关命令 exit 不因钩②失败
- [x] **A3 未登记仍 Warning**（必做）：同 fixture 或对照件显式未登记 type → Warning 仍在 · exit **不**仅因该 Warning 变 2（「登记 ≠ 封闭」）
- [x] **A4 坏 YAML**（必做）：仓级文件存在但不可解析 → `compile|check`（或加载点）**exit 2** · 输出点名路径
- [x] **A5 冲突**（必做）：仓级 `kinds` 与内置同 `id` 不同 `class`（或 30 测锁的其它冲突形）→ **exit 2** · 点名键
- [x] **A6 加载面**（必做）：合并挂在 `graph yaml compile|check`（R0 钩②调用点）；**禁止**仅 `vocab show` 接线而 compile/check 仍只读内置
- [x] **A7 文档**（必做）：README / 使用手册 / `MIGRATION.md` 至少一处最小节说明仓级扩展声明与 fail-loud
- [x] **A8 零回归**（必做）：既有 `f1-unify` 内容钉/钩②/恒等 fixture · `graph-drift` · scaffold 相关测不因本波改语义红（只增仓级面测）
- [x] **A9 四门 + 关账**（必做）：`npm run typecheck` · `npm test` · `npm run build` · `npm run test:lib` 全绿；`gate-check` exit 0 + `task close --yes`；提交 `feat(3.1-W4): …` · 禁 `git add -A` · 未 tag/push/publish/bump · **00 本窗 close**（四门+gate-check+commit 已齐 · **close 留 00**）
- [x] **A-opt1 `graph vocab show`**（可选 · 未做不挡 A9）：help 列出 · 可展示合并后 edge_types/kinds（形态 30 自裁）

---

## 给执行帽的必读列表

1. [`docs/spec/3_1-tech-graph-scaffold/04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W4** · [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) §4.2 · [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) §1.4 / §3 仓级词表行  
2. [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) **W4 · 仓级词表（F-1②）**  
3. [`docs/roadmap/PLAN_3_0_2_patch_v1_zh.md`](../../roadmap/PLAN_3_0_2_patch_v1_zh.md) 非范围 F-1②（延后说明 · `.spec-wave/` 同族）  
4. `src/cli-graph-yaml.ts`（`loadTechGraphVocab` · `collectTechVocabWarnings` · `printTechVocabWarnings` 调用点）· `assets/tech-graph-vocab.yaml`  
5. `.spec-wave/` 加载先例：`src/cli-pins.ts`（`pins-consumer.yaml`）· `src/cli-graph-drift.ts`（`graph-drift.yaml` · 缺省无文件 / 坏 YAML exit 2）  
6. `test/f1-unify.test.ts`（钩② / 六条边型钉 · **勿回退**）· W3 done task（结构参考 · **非**验收复制）  
7. `docs/standards/` 涉码 L2（改 `src/` 时 · 30 自裁）

---

## 思考轮

### R0 · 证据（起草棒实读现值）

| 锚点 | 实读 |
|------|------|
| 内置词表 schema | `assets/tech-graph-vocab.yaml:7-28`：`version: "1"` · `namespace: "tech:"` · `kinds`（id+class）· `edge_types` 六条（含 branches/triggers）· 头注释「登记 ≠ 封闭」 |
| 唯一加载点 | `src/cli-graph-yaml.ts:56-86` `loadTechGraphVocab()`：**仅**读 `packageRoot()/assets/tech-graph-vocab.yaml` · 模块级 cache · **无** target / **无**仓级合并 |
| Warning 钩② | `src/cli-graph-yaml.ts:90-102` `collectTechVocabWarnings`：显式 `edges[].type` ∉ `edgeTypes` → Warning 文案含「不咬 exit」；`:104-106` `printTechVocabWarnings` |
| 钩②挂载面 | 同文件 `:361` / `:593` / `:624`（compile / check / export 路径 · 30 复核命令映射）均 `printTechVocabWarnings` |
| kind 校验 / 渲染 | `:154` kind ∉ 登记 → 校验；`:480-481` `KIND_TO_CLASS` 自 `loadTechGraphVocab().kindToClass` |
| pins 先例 | `src/cli-pins.ts:20` `CONSUMER_PINS_REL = '.spec-wave/pins-consumer.yaml'`；`:118-128` 存在且坏 → failClosed exit 2（存在且坏 ≠ 缺失） |
| drift 先例 | `src/cli-graph-drift.ts:12` `GRAPH_DRIFT_CONFIG_REL = '.spec-wave/graph-drift.yaml'`；`:157-167` 缺省无文件 = 空豁免全检；`:172-176` 坏 YAML exit 2 |
| 回归钉 | `test/f1-unify.test.ts:203-214` 六条 edge_types 内容钉；`:273` bogus_edge Warning；`:292-314` branches/triggers 零告警 |
| SPEC/PLAN | `02` §4.2 合并+冲突；`03` §1.4 加载面 compile\|check · vocab show 非硬门槛；`03` §3 坏 YAML/冲突 exit 2；`04` W4 五条；PLAN W4 三行；3.0.2 非范围 F-1② |

epic 双闸已 approved；本波 HG-TASK-DRAFT / HG-AUDIT-R1 仍 **pending**。

### R1 · 范围

仅 W4：仓级 `.spec-wave/graph-vocab.yaml` 合并加载 · 冲突/坏档 exit 2 · 缺省=3.0.2 · 扩展零 Warning / 未登记仍 Warning · 文档最小节 · 负向测 · 可选 `graph vocab show`。排除 drift/scaffold 返工、W5、bump、回退「登记 ≠ 封闭」。

### R2 · 方案

- 扩展 `loadTechGraphVocab`（或薄包装）接受 **target 根**：存在 `.spec-wave/graph-vocab.yaml` 则解析并与内置合并；无文件短路内置。  
- **合并（建议钉 · 30 测锁）**：`edge_types` 字符串**并集**（同名不计冲突）；`kinds` 按 id 合并，同 id 不同 class → 冲突 exit 2；仓级 `version` 须 `"1"`（或与 drift 同容忍 `1`/`"1"` · 与 pins/drift 对齐）。  
- **缓存**：若引入 per-target 合并，cache key 须含 target（防跨仓串味）· 30 自裁。  
- 钩② / kind 校验继续走单源加载点（保持「src 内唯一加载」纪律；单源 grep 钉若需放宽「仅 assets 字面」→ 30 与验收 #6 口径对齐，**禁止**双硬拷贝回潮）。  
- `graph vocab show` 可选，不挡关账。  
- 文档：README 或手册或 MIGRATION 三选一最小节即可。

### R3 · 边界

不改无仓级文件时的默认松紧；不把 Warning 升 exit；不改 drift/scaffold；不代签 HG；不 bump 3.1.0；不在本仓落负向 `.spec-wave/graph-vocab.yaml`。

### R4 · 可测性

A1–A8 临时 fixture + exit/stderr 断言；A9 四门+gate-check；A-opt1 命令/help 存在性。红测先行。复用 `f1-unify` 钩②文案模式。

### R5 · 签收就绪

五槽完毕；交 20-task-audit → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 后方可 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 仅内置加载 · 钩②已挂 compile/check/export · `.spec-wave/` 有 pins/drift 先例 · 尚无 graph-vocab 仓级档 | no |
| R1 | 仅 W4 合并+fail-loud+文档 · vocab show 可选 | no |
| R2 | 扩展 load 单源 · edge 并集 · kind 冲突 exit 2 · cache 含 target | no |
| R3 | 缺省=3.0.2 · 不回退开放惯例 · 不改 drift/scaffold | no |
| R4 | A1–A9 机检 · A-opt 可选 | no |
| R5 | 待 20 审 R1 | no |

**residual_risks**：① `loadTechGraphVocab` 现无参 · 多命令调用点须统一穿 target，漏穿会导致「有仓级档仍只读内置」假绿——A6 须锁；② 单源 grep 验收若仍断言「仅 assets 路径字面」可能与仓级路径常量冲突——须同步钉口径而非复制硬编码枚举；③ 合并冲突面若过宽（如禁止与内置 edge_types 同名）会误伤并集语义——默认同名字符串=幂等。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 先（或同步）落地负向/正向 fixture 测（缺省等价 · 扩展零 Warning · 未登记 Warning · 坏 YAML · 冲突 exit 2），测红后实现合并加载；既有 graph / f1-unify / drift 套件零回归；波末四门 + gate-check。

---

## 提交信息约定

- 实现提交：`feat(3.1-W4): 仓级 graph-vocab 合并加载与冲突 fail-loud`
- **禁 `git add -A`**：逐文件显式 add  
- **不裹挟** `eval/external-oracle/` 等未跟踪档 · 不裹挟 W5 草稿  
- **禁 tag / push / publish / bump 3.1.0**  
- 波末：`npx spec-wave gate-check --task docs/tasks/active/task_3_1_w4_graph_vocab.md`（或本仓 `node bin/dsh-coding-kit.js` 等价）

---

### 自检结论（执行者）

| 项 | 结论 |
|----|------|
| GATE_VERIFY | PASS · HG-AUDIT-R1 approved · ✅ 可 30（2026-10-10） |
| A1–A8 | ✅ 全过（`test/graph-vocab.test.ts` + README 节） |
| A9 | 四门绿 · gate-check exit 0 · commit 本波 · **`task close` 留 00** |
| A-opt1 | ✅ `graph vocab show [--target] [--json]` |
| 四门 | typecheck / test(959p) / build / test:lib 全绿 |
| 未 bump/tag/push/publish | ✅ |

Wiki: none

**旧测影响面（N4）**：`test/f1-unify.test.ts` · `test/graph-*.test.ts` · scaffold / drift / axioms / ontology —— 本波只增仓级词表加载面与 `graph vocab show`，**未**改其默认语义断言；冲突面钉 kinds 同 id 不同 class · edge 同名并集幂等（N1）。

invoke：[`invoke_20261010_30_40_3-1-w4-graph-vocab.md`](../../harness/invokes/by-task/3-1-w4-graph-vocab/invoke_20261010_30_40_3-1-w4-graph-vocab.md)

### KPI（00）

Task_KPI%: （占位 · 关账时由 00 填）

- rubric：`KPI_RUBRIC_v1_2` · 30/40 实现 + 00 签闸/关账

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | 10-task 初稿 · 00 开拆 W4 · HG-TASK-DRAFT / HG-AUDIT-R1 **pending** |
| 2026-10-10 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · 可 30 |
| 2026-10-10 | 30/40：仓级 graph-vocab 合并加载 · A1–A9/A-opt1 · 四门绿 · gate-check · 待 00 close |
