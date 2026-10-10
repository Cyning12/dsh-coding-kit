# Task：3.1 W2 · 入手链与 Agent 审核面（DX）

> **状态**：`done` · **00 验收关账** 2026-10-10（A1–A8 · `ba9270b` · A-opt1 跳过）  


> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10 · epic 级已签）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W2 · 入手链**  
> **SPEC 波钉**：[`04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W2** · 口径见 [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) / [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) §2 / §4  
> **上游关账**：W1 [`docs/tasks/done/task_3_1_w1_graph_scaffold.md`](../done/task_3_1_w1_graph_scaffold.md)（CLOSE PASS · 结构模板参考 · **勿复制 W1 实现验收**）  
> **00 开拆**：[`invoke_20261010_00_3-1-w2-graph-dx.md`](../../harness/invokes/by-task/3-1-w2-graph-dx/invoke_20261010_00_3-1-w2-graph-dx.md)  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-1-w2-dx`（自 `main` 或 W1 合入点切出）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-1-w2-graph-dx` |
| **test_strategy** | `required` |
| **test_strategy_note** | 改 `INIT_QUICKSTART` 必联改 `test/init.test.ts`（现值钉死命令集合仅 `sync prompts`/`verify` · 见 R0）；测锁：quickstart 含真实 `graph scaffold` 字面 + F-W4-01 usage 存在性 + 可审草稿禁称；模板/手册/指针以文件存在与关键句 grep/断言为主；可选宿主薄封装若做则另加指针存在性断言 |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-1-w2-dx` |
| **graph_delta** | `none` |
| **graph_delta_note** | 本波改入手文案 / bootstrap 模板 / Agent 指针；不改 kit 自图语料语义 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | DX 入手链；是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.1.0 epic W2；合入由维护者/00 按当次授权 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 级 · 2026-10-10 维护者签收 SPEC（继承 · 非本波代签） |
| HG-NEXT-PLAN | approved | — | epic 级 · 同窗签收 PLAN（继承） |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 **00 签收**（授权「签收后续文档」）· 依据 lint PASS + 20 审 R1 PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-10 **00 签收** · 依据 [`task_3_1_w2_graph_dx_audit_R1_20261010.md`](../../harness/reviews/task_3_1_w2_graph_dx_audit_R1_20261010.md)（PASS · blocking 0）· **可 30** |

---

## 背景与目标

W1 已交付 `graph scaffold`（可审草稿 CLI），但入手链仍停在「init 三步 → verify」：`INIT_QUICKSTART` **无** scaffold 真实命令；消费仓 bootstrap 任务模板仍写「从模板复制骨架 / 不做全仓扫描自动生图」，与「优先 scaffold · 模板仅协议回退」产品口径冲突；Agent 审核面缺与 `REVIEW_CHECKLIST.md` 机检项对齐的包内指针（现有 `kit-graph-check` 仅 yaml check）。

**完成态**：init / 手册上手路径可见真实下一步 `npx spec-wave graph scaffold`（可审草稿口径 · 禁称自动权威）；`TASK_graph_bootstrap` 改为优先 scaffold；审核清单机检项有 skill/commands **指针**对齐；可选宿主薄封装只调 CLI；四门绿 · gate-check · **未** bump/tag/push/publish。

---

## 范围

严格对齐 SPEC `04` **W2** + PLAN **W2 · 入手链**。验收拆 **必做 / 可选**（可选不阻塞关账，见 A-opt）。

### 必做

- [x] **① init quickstart**：`INIT_QUICKSTART` 增加「下一步：`npx spec-wave graph scaffold`」**真实命令**（可审草稿口径；禁「自动权威图谱」等违纪表述）；联改 `test/init.test.ts`（含命令集合断言放宽/重钉）
- [x] **② 手册 quickstart**：`docs/guides/使用手册-v3.0.0-zh.md` 五分钟上手 / init 相关节补同一真实命令与口径（与 §10 scaffold 小节互链或并列，勿矛盾）
- [x] **③ bootstrap 模板**：更新 `assets/harness/templates/TASK_graph_bootstrap.md`——从「只拷模板 / 复制骨架」→「**优先** `graph scaffold` · 模板仅协议回退」；同步修正「不做全仓扫描自动生图」与脚手架草稿划界（对照 SPEC 02 §2.4）
- [x] **④ Agent 审核面对齐**：包内 skill 或 commands **指针**对齐 `REVIEW_CHECKLIST.md`「Agent 可跑项」（compile/check + 清单路径 + 禁代签 HG）；**不**复制脚手架业务逻辑；可扩既有 `kit-graph-check` 或新增薄 POINTER（30 自裁落点，须可机检存在）
- [x] **⑤ 波末**：四门绿 · HG-AUDIT-R1（人签后）· `gate-check`；禁 bump/tag/push/publish；禁 `git add -A`；禁开 W3 drift / W4 vocab

### 可选（本波可交付 · 不阻塞关账）

- [ ] **O1 宿主薄封装**：Cursor/Claude（及既有 host 面）命令或 skill **只调** `npx spec-wave graph scaffold`（dry-run 提示 / `--yes` 纪律 · POINTER）；不复制探测/写盘逻辑（**本波未做** · 不挡 A8；避免牵动 host-adapt planned-writes / expanded 词表锁）

## 非范围

| 项 | 理由 |
|----|------|
| 改 scaffold 探测/写盘/轻检实现语义 | W1 已关；本波 DX |
| 扩 `assets/graph/templates/` 业务占位 | SPEC 冻结 |
| `graph drift`（W3）/ 仓级词表（W4） | 其他波 |
| 自动 approved 任何 HG（含 `HG-GRAPH-MODULES`） | 闸纪律 |
| bump / tag / push / `npm publish` | W5 / 仅人 |
| 改本仓 dogfood `docs/_tech_graph` 业务语义 | 非本波 |
| 强制 `init` 捆绑生成 `_tech_graph` | SPEC 03 §4：仅文案提示下一步 |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改码 | 30 **拒开工**（verify 机械拦） | 是（20 审 + 人签后） | 是 |
| quickstart 提到不存在的命令（F-W4-01） | 验收 FAIL | 是 | — |
| 文案称「自动权威图谱」/暗示已人签 | 打回（口径违纪） | 是 | 审查 |
| 改 `INIT_QUICKSTART` 未联改 `init.test.ts` 命令集合钉 | 测红 | 是 | CI |
| bootstrap 仍仅「复制骨架」无 scaffold 优先句 | 验收 FAIL | 是 | — |
| Agent 指针复制脚手架业务逻辑（非 POINTER） | 打回 | 是 | 审查 |
| 可选薄封装改 CLI 语义或复制探测写盘 | 打回 | 是 | — |
| 顺手开 W3/W4/bump | 打回（每波一 task） | — | — |
| `git add -A` 裹挟域外档 | 打回 | 是 | — |
| 四门任一红 | 停止 · 先修再关账 | 是 | 是 |

---

## 验收标准

> **必做** A1–A8 为关账硬条款；**可选** A-opt1 本波可交付，未做不挡 A8。

- [x] **A1 init 命令字面**（必做）：`INIT_QUICKSTART`（`src/cli/init.ts`）含 `npx spec-wave graph scaffold`；可审草稿 / 非权威真值口径可见；**无**「自动权威」类违纪表述
- [x] **A2 init 双路径打印**（必做）：`--yes` 与 dry-run 成功路径 stdout 均含 scaffold 下一步（沿用既有 init 测夹具）
- [x] **A3 测锁联改**（必做）：`test/init.test.ts` 更新——含 scaffold 断言；原「命令集合仅 sync/verify」钉改为含 `graph scaffold`（或等价解析）；F-W4-01 usage 存在性仍绿
- [x] **A4 手册**（必做）：使用手册五分钟上手或 §5 init 附近出现真实 `graph scaffold` 下一步；与 §10 可审草稿口径一致
- [x] **A5 bootstrap 模板**（必做）：`TASK_graph_bootstrap.md` 范围首步为优先 scaffold（真实命令）；模板拷贝降级为协议/回退路径；删除或改写「只拷模板 / 仅复制骨架」为主路径的表述；「自动生图」禁令与「可审草稿」划界清晰
- [x] **A6 Agent 指针**（必做）：包内至少一处 skill 或 command 指针指向清单机检面（`REVIEW_CHECKLIST.md` + compile/check 类命令原文指针 + 禁代签 HG）；可用 `rg`/测断言文件存在与关键句
- [x] **A7 四门**（必做）：`npm run typecheck` · `npm test` · `npm run build` · `npm run test:lib` 全绿
- [x] **A8 关账**（必做）：`gate-check` exit 0 + `task close --yes`；提交 `feat(3.1-W2): …` · 禁 `git add -A` · 未 tag/push/publish/bump（**00 本窗 close**）
- [ ] **A-opt1 宿主薄封装**（可选 · 未做不挡 A8）：宿主命令/skill 薄封装存在且正文只调 CLI（对照 `kit-graph-check` 薄度）；多宿主落点与既有 host-adapt 惯例一致（30 自裁最小宿主集，至少 Cursor **或** Claude 一面）

---

## 给执行帽的必读列表

1. [`docs/spec/3_1-tech-graph-scaffold/04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W2** · [`02`](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) §2.4 · [`03`](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md) §2 / §4  
2. [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) **W2 · 入手链**  
3. `src/cli/init.ts`（`INIT_QUICKSTART` · 打印点）· `test/init.test.ts`（命令集合钉）  
4. `assets/harness/templates/TASK_graph_bootstrap.md`  
5. `assets/ide/commands/cursor/kit-graph-check.md`（薄封装对照）· 手册 §3 / §5 / §10  
6. W1 done task（结构参考 · 非验收复制）  
7. `docs/standards/` 涉码 L2（若改 `src/cli/init.ts` · 30 自裁）

---

## 思考轮

### R0 · 证据（起草棒实读现值）

| 锚点 | 实读 |
|------|------|
| init quickstart 定义 | `src/cli/init.ts:64-73` · `INIT_QUICKSTART` 三步（sync → 建 task → verify）· **无** `graph scaffold` |
| init 打印点 | `src/cli/init.ts:268` · `console.log(INIT_QUICKSTART)` |
| init 测钉 | `test/init.test.ts:235-247` · 步骤 1/2/3 结构；`:246` 命令集合深等 `['sync prompts','verify']`（加 scaffold **必**联改） |
| bootstrap「只拷」主路径 | `assets/harness/templates/TASK_graph_bootstrap.md:54`「从 `cyning-harness/graph/templates/` 复制骨架」；`:48`「全仓代码扫描自动生图」列在不做 |
| 手册上手 | `docs/guides/使用手册-v3.0.0-zh.md:121` §3 五分钟上手 · `:286` §5.1 init · W1 已在约 `:619` 有 scaffold 命令面（入手链仍缺「下一步」钉） |
| 既有薄封装 | `assets/ide/commands/cursor/kit-graph-check.md` · `assets/ide/commands/claude/kit/graph-check.md`（仅 `graph yaml check` · **无** scaffold） |
| SPEC/PLAN | `04` W2 四条清单 · PLAN「W2 · 入手链」三行；03 §4 init **不**捆绑生图、可文案提示 |

epic 双闸已 approved；本波 HG-TASK-DRAFT / HG-AUDIT-R1 仍 pending。

### R1 · 范围

仅 W2 DX：init/手册下一步命令 · bootstrap 口径翻转 · Agent 指针对齐 · 可选薄封装。排除 scaffold 实现返工、W3/W4、bump。

### R2 · 方案

文案常量扩一行/一步（保持既有 0–3 步可读性；scaffold 可为第 4 步或「图谱下一步」附注——30 自裁，验收以字面+测锁为准）；模板改范围首条；指针文件对齐 SPEC 03 §2.3 Agent 审焦点；可选命令仿 `kit-graph-check` 薄度。

### R3 · 边界

不捆绑 init 写盘图谱；不代签 HG；不复制业务探测逻辑；不扩模板业务占位；可选封装失败不得拖垮必做关账。

### R4 · 可测性

A1–A3 命令/测机检；A4–A6 文件存在+关键句；A7–A8 四门+gate-check；A-opt1 指针存在性（可选）。

### R5 · 签收就绪

五槽完毕；交 20-task-audit → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 后方可 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | init 无 scaffold · bootstrap 仍拷模板 · 仅 yaml-check 薄命令 | no |
| R1 | 仅 W2 DX · 可选不挡关账 | no |
| R2 | 文案+模板+指针 · 可选仿 kit-graph-check | no |
| R3 | 不捆绑生图 / 不代签 / 不复制逻辑 | no |
| R4 | A1–A8 机检 · A-opt 可选 | no |
| R5 | 待 20 审 R1 | no |

**residual_risks**：① 扩 quickstart 命令集会触发历史「不膨胀」测钉——须显式联改而非绕过；② 手册多入口（§3/§5/§10）易口径漂移；③ 可选薄封装宿主面过多导致 scope creep——默认最小一面即可。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 先（或同步）更新/新增 `init.test.ts` 对 `graph scaffold` 字面与 usage 存在性的断言，再改 `INIT_QUICKSTART`；模板与指针以验收 grep/存在性断言锁定；波末四门 + gate-check。

---

## 提交信息约定

- 实现提交：`feat(3.1-W2): graph scaffold 入手链与 Agent 审核面`
- **禁 `git add -A`**：逐文件显式 add  
- **不裹挟** `eval/external-oracle/` 等未跟踪档 · 不裹挟 W3+ 草稿  
- **禁 tag / push / publish / bump 3.1.0**  
- 波末：`npx spec-wave gate-check --task docs/tasks/active/task_3_1_w2_graph_dx.md`（或本仓 `node bin/specgate.js` / `node bin/dsh-coding-kit.js` 等价）

---

### 自检结论（执行者）

**30/40 · 2026-10-10 · PASS（必做 A1–A7；A8 待 00 close；A-opt1 未做）**

| 项 | 结论 |
|----|------|
| GATE_VERIFY | HG-AUDIT-R1 approved · ✅ 可 30 |
| A1–A3 | `INIT_QUICKSTART` 第 4 步 `graph scaffold` + 可审草稿口径；`--yes`/dry-run stdout 测锁；命令集 `graph scaffold`/`sync prompts`/`verify`；F-W4-01 绿 |
| A4 | 手册 §3.3 / §5.1 下一步 + 互链 §10；README 双语 quickstart 同步 |
| A5 | `TASK_graph_bootstrap` 优先 scaffold · 模板仅协议回退 |
| A6 | **唯一落点**：扩 `kit-graph-check`（Cursor+Claude）POINTER→`REVIEW_CHECKLIST` Agent 可跑项 + compile/check + 禁代签 HG（N2） |
| A7 | 四门绿；联改 `assets/sha256.manifest` + `planned-writes-2_4_2.json`（graph-check 内容 hash） |
| A8 | gate-check exit 0；commit `ba9270b`；**00 close** · 未 bump / tag / push / publish |
| A-opt1 | **跳过**（不挡关账；免 expanded 词表/快照连锁） |
| N1–N4 | N1 测锁面已列；N2 唯扩 kit-graph-check；N3 §3/§5/§10 口径扫过；N4 可选未做 |

Wiki: none

### KPI（00）

Task_KPI%: 95（A1–A8 必做全绿 · 四门绿 · 口径可审草稿 · A-opt1 明示跳过不挡；扣分：无独立宿主薄封装 · 属可选）

- rubric：`KPI_RUBRIC_v1_2` · 30/40 实现 + 00 签闸/关账

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | 10-task 初稿 · 00 开拆 W2 · 闸 pending |
| 2026-10-10 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · 可 30 |
| 2026-10-10 | 30/40：入手链 DX 落地 · A1–A7 ✅ · A-opt1 跳过 · 待 00 close |
| 2026-10-10 | **00 验收关账** · A8 close · SPEC04 W2 勾选 · 下一波 W3 未开 |
