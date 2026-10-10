# Task：3.1 W5 · release 收尾（3.0.2 → 3.1.0 · W1–W4 全 CLOSE 后发版簿记）

> **状态**：`done` · **00 验收关账** 2026-10-10 · **TAG-PUSH approved**（维护者授权 merge+tag · publish 交人）  



> **wave**：release（3.1.0 **minor** · 技术图谱脚手架 epic 收口 · 同 3.0.2 / 3.0.0 release 先例 · **本版差异：tag/push/publish 三动作默认仅人**）  
> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 2026-10-10）· 波钉 [`04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) **W5** + **验收总表**  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md)（**HG-NEXT-PLAN=approved** · 同窗）· **W5 · release**  
> **结构模板**：[`docs/tasks/done/task_3_0_2_release_bump.md`](../done/task_3_0_2_release_bump.md)（release 簿记全套 · 本波 tag/push **不**代跑）  
> **上游关账**：W1 [`task_3_1_w1_graph_scaffold`](../done/task_3_1_w1_graph_scaffold.md)（`ec57eff`）· W2 [`task_3_1_w2_graph_dx`](../done/task_3_1_w2_graph_dx.md)（`ba9270b`）· W3 [`task_3_1_w3_graph_drift`](../done/task_3_1_w3_graph_drift.md)（`357b31b`）· W4 [`task_3_1_w4_graph_vocab`](../done/task_3_1_w4_graph_vocab.md)（`e979c57`）  
> **00 开拆**：[`invoke_20261010_00_3-1-w5-release.md`](../../harness/invokes/by-task/3-1-w5-release/invoke_20261010_00_3-1-w5-release.md)  
> **基线**：`spec-wave@3.0.2` published（registry `latest=3.0.2` · tag `v3.0.2`）· `package.json#version` 仍为 `3.0.2` · pins **17/17**（打 `v3.1.0` 前 bump 后 pin-10 设计红）  
> **发版纪律**：[`RELEASING.md`](../../../RELEASING.md)（本棒做 bump 簿记 + 人 checklist 预填；**tag / push / npm publish / deprecate 仅人** · Agent 永禁 publish）  
> **行号口径**：本 task `file:line` 为 **2026-10-10 10-task 起草棒实读现值**（实现前 30 须复核）  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-1-w5-release`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-1-w5-release` |
| **test_strategy** | `required` |
| **test_strategy_note** | 无新产品行为故无「红测先行改实现」义务；四门（typecheck / test / build / test:lib）+ `pins check`（pin-10 tag-gated 设计红 · **打 tag 前唯一可接受偏差** · 人打 `v3.1.0` 后须 17/17）为验收硬条款；**RELEASING.md 双重敏感**（pin-07 落点 + 九步顺序测）改后必跑**全量** `npm test`；版本断言联改沿 3.0.2/3.0.1 先例（perl 双模式字面+转义 · 历史标题与红测留证注释保留） |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-1-w5-release` |
| **graph_delta** | `none` |
| **graph_delta_note** | 版本钉 bump 机械动作 + 过程档；不改图谱资产 / scaffold·drift·vocab 语义 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 发版簿记 bump，无编码规范/流程增量；关账经验是否晋升 wiki 归 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身 3.1.0 minor 发版收口；合入 / tag / push 由维护者按当次授权；publish 仅人 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 级 · 2026-10-10 维护者签收 SPEC（继承 · 非本波代签） |
| HG-NEXT-PLAN | approved | — | epic 级 · 同窗签收 PLAN（继承） |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-10 **00 签收**（授权签收过程文档）· 依据 lint PASS + 20 审 R1 PASS |
| HG-AUDIT-R1 | approved | 30 | 2026-10-10 **00 签收** · 依据 [`task_3_1_w5_release_audit_R1_20261010.md`](../../harness/reviews/task_3_1_w5_release_audit_R1_20261010.md)（PASS · blocking 0）· **可 30 簿记** |
| HG-RELEASE-TAG-PUSH | approved | — | 2026-10-10 维护者授权「合并，打tag，交由我发版」· 00 代跑 merge main + `v3.1.0` tag + push |
| HG-RELEASE-PUBLISH | pending | — | 3.1.0 `npm publish` · **仅人** · Agent 永禁 · **交维护者发版** |

> **闸说明**：HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH 语义 = 发布动作，**不**把 `30` 写入 `blocks_hats`；30 可做 package.json/CHANGELOG/pins/ACCEPTANCE/RELEASING/手册/MIGRATION/spec 索引等簿记。本波默认 **不**执行 tag/push/publish（与 3.0.2「tag/push 00 代跑」不同 · 对齐 3.0.0「四动作仅人」口径）。

---

## 背景与目标

3.1.0 minor（PLAN / SPEC）W1（`graph scaffold` 可审草稿）· W2（入手链 DX）· W3（`graph drift` · F-2）· W4（仓级 `.spec-wave/graph-vocab.yaml` · F-1②）均 CLOSE: PASS 后，开 **W5 release**：把工作树版本真值从 `3.0.2` 簿记到 `3.1.0`，交付到「**bump 已落 · 文档/台账齐 · pins 打 tag 前仅 pin-10 设计红 · 四门绿 · tag/push/publish 待人**」为止。

**完成态**：`package.json#version`=`3.1.0`；CHANGELOG 含 `## [3.1.0]` 节归拢 W1–W4；MIGRATION「3.0.2 → 3.1.0」动作项（scaffold/drift/vocab **可选启用** · 无强制迁移）；使用手册 §10 图谱补齐 drift/vocab 与可审草稿口径；`docs/spec/README.md` epic 行 → **IMPLEMENTED**（待发版措辞 · 禁冒充 published）；ACCEPTANCE_3_1 台账落盘；`pins fix --yes` 对齐钉面；RELEASING 台账 + 人 checklist `3.1.0` 节预填（tag/push/publish **未勾 · 待人**）；四门绿 · gate-check；**未**执行 `git tag` / `git push` / `npm publish` / `npm deprecate`。

---

## 范围

严格对齐 SPEC `04` **W5** + PLAN **W5 · release** + 验收总表（不得改 W1–W4 已交付行为 · 不得触 schema · 不得扩模板业务占位）。

- [x] **① bump 真值源**：`package.json#version` `3.0.2` → `3.1.0`（**唯一手工版本改动点** · **不用** `npm version` 防顺手 tag）；`package-lock.json` 同步（根 `"version"` / `packages[""].version`）
- [x] **② CHANGELOG**（**顺序硬约束 · 先于 pins fix** · 同 3.0.2 先例 · 防 pin-13 回写历史头）
  - 新增 `## [3.1.0] - 2026-10-10`：主题行（**minor** · 技术图谱脚手架 · PLAN/SPEC 链接）+ **Added**（W1 scaffold · W2 DX 入手链 · W3 drift · W4 仓级 vocab）+ **发布状态行**：「**待发版（tag/push/publish 仅人）**（bump 已落 · registry `latest` 仍为 `3.0.2` 直至人 publish · pin-10 打 tag 前设计红）」
  - Unreleased 仅留空壳；**禁止**把待发版写成已 published
- [x] **③ `pins fix --yes`**：先 `pins check` 观察偏差 → `node bin/specgate.js pins fix --yes` 对齐钉面 → 复跑；**打 tag 前唯一可接受偏差** = pin-10 git tag `v3.1.0` 缺失（**设计红** · 人打 tag 后须 17/17 · 本棒不打 tag）
- [x] **④ 叙事漂移巡检**：机械替换造成的假叙事改回真值；pins 未钉的现行版引用与测试版本断言联改留痕（perl 双模式 · 历史标题/红测留证注释保留）；全仓 grep 无「3.1.0 已 published」假叙事；registry latest 叙事写 `3.0.2` 直至人 publish
- [x] **⑤ ACCEPTANCE 档**：新建 [`docs/roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md`](../../roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md)（结构参照 [`ACCEPTANCE_3_0_architecture_leap_3_0_0_zh.md`](../../roadmap/ACCEPTANCE_3_0_architecture_leap_3_0_0_zh.md) / [`ACCEPTANCE_3_0_2_patch_3_0_2_zh.md`](../../roadmap/ACCEPTANCE_3_0_2_patch_3_0_2_zh.md)）
  - W1–W4 台账摘要（commit 哈希 · 各波 A*）
  - SPEC `04` **验收总表**勾选对照（fixture scaffold→compile/check→清单→闸 pending · `graph yaml *` 零回归 · drift/vocab 正负向 · 无「自动权威图谱」违纪）
  - release 门禁基线 + pin-10 设计红登记（清偿路径 = **人**打 tag 后）
  - 发布边界：「bump 已落 · tag/push/publish 待人」
- [x] **⑥ spec 索引行**：`docs/spec/README.md` **既有** `3_1-tech-graph-scaffold` 行（起草棒 L27）状态格翻到 **IMPLEMENTED** + `` `3.1.0` 待发版（planned） ``（publish 仅人 · tag/push 仅人）· 链 ACCEPTANCE 档 · pin-08 语义格位合格 · **禁止**写成 published
- [x] **⑦ 使用手册 §图谱更新**（[`docs/guides/使用手册-v3.0.0-zh.md`](../../guides/使用手册-v3.0.0-zh.md) · 保留文件名）
  - 头栏「版本 / 适用包」钉 `spec-wave@3.1.0`（**待发版 · tag/push/publish 待人**）；手册基线行续写「3.1.0 minor 差异见 CHANGELOG `[3.1.0]` / MIGRATION『3.0.2 → 3.1.0』」
  - **§10 图谱与本体**：补 `graph drift` / 仓级 `graph-vocab`（及可选 `graph vocab show`）命令与「可审草稿」口径；与 README 已有 W3/W4 节对齐；禁「自动权威图谱」
  - 文内**现行钉** `npx spec-wave@3.0.2 …` 等示例改 `@3.1.0`（历史对照句可保留）
- [x] **⑧ RELEASING 台账 + 人 checklist**【**双重敏感**】
  - 「最近一次发版」表：工作树行写 `3.1.0` bump 已落 · tag/push/publish 待人（registry `latest` 真值仍 `3.0.2`）；`3.0.2` 下沉为「前一 latest（已 published）」；主题/验收行增 3.1.0
  - 新增 `### 人 checklist · 3.1.0 发版` 节：**预勾**本棒已验证项（工作树 commit 就绪 · 四门绿 · pins 打 tag 前仅 pin-10 · CHANGELOG/ACCEPTANCE/索引齐）· **tag / push / publish / 打 tag 后 pins 17/17 / ⑨ 回填** 全**未勾**（待人）
  - 改后**必跑全量** `npm test`
- [x] **⑨ MIGRATION**：新增「3.0.2 → 3.1.0（minor）· 无强制动作项」节
  - **不必做**：改 schema / 强制启用 scaffold·drift·vocab / 改既有 `graph yaml *` 缺省判定
  - **可选启用**：`graph scaffold`（可审草稿）· `graph drift`（F-2）· `.spec-wave/graph-vocab.yaml`（F-1②）· 指针 README/手册 §10
  - 头栏/包钉随 pins fix 对齐 `3.1.0`（待发版措辞 · 不暗示 breaking）
- [x] **⑩ 四门 + 关账**：波末 `gate-check`（本棒）· **`task close` 留给 00**；提交约定：簿记 `chore(release): bump to 3.1.0`（独立 · 逐文件显式 add）

## 非范围

| 项 | 理由 |
|----|------|
| `git tag` / `git push` | **默认仅人**（HG-RELEASE-TAG-PUSH=pending · 00 开拆硬禁） |
| `npm publish` / `npm deprecate` | **仅人**（HG-RELEASE-PUBLISH · Agent 永禁 · `AGENTS.md` local） |
| 3.1.0「已 published」叙事回填 | 待人 publish 后 ⑨ 回填（避免冒充已发布） |
| 改 W1–W4 已交付行为 / 返修实现 / 扩模板业务占位 | 每波一 task 已 CLOSE · release 只簿记 · PLAN 冻结 |
| 触 host-adapt schema / 改 `graph yaml *` 缺省判定松紧 | PLAN 硬约束 · 触即 STOP |
| 自动 approved 任何 HG | 闸纪律 |
| `npm version`（会顺手造 tag） | 禁 · 唯一手工改 `package.json#version` |
| `--force` / `--allow-*` / `git add -A` / force push | 禁令 |
| 代签 HG-TASK-DRAFT / HG-AUDIT-R1 | 仅人/00 按授权 |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1=pending 即 30 改簿记（F-REL-00） | 30 **拒开工**（verify 机械拦 exit 2） | 是（20 审 + 人签后） | 是 |
| 越权 npm publish / deprecate（F-REL-01） | 违禁令 · 打回 | — | 是 |
| 越权 `git tag` / `git push`（F-REL-01b · 本波默认） | 违非范围 · 打回 | — | 是 |
| `git add -A` 裹挟域外档（F-REL-02） | 打回（撤 stage 逐文件显式 add） | 是 | — |
| pins fix 先于 CHANGELOG `## [3.1.0]` 节落盘（F-REL-03） | pin-13 可能回写历史头 · 验收 FAIL | 是（还原 · 按序重做） | — |
| 叙事漂移未巡检（假「已 published」入库 · 含手册）（F-REL-04） | 验收 FAIL · 打回 | 是 | 是 |
| RELEASING 改动后未跑全量 npm test（F-REL-05 · 双重敏感） | 验收 FAIL · 补跑 | 是 | — |
| 打 tag 前 pins 偏差非「仅 pin-10」（F-REL-06） | 验收 FAIL · 修漏网钉面 | 是 | 是 |
| 断言联改漏网（转义 `3\.0\.2`）（F-REL-08） | npm test 红 · perl 双模式补齐 | 是 | — |
| 四门任一意外红（F-REL-09） | 停止 · 先修 | 是 | 是 |
| 顺手改 W1–W4 行为 / 触 schema / 扩模板（F-REL-10） | 打回或 **STOP** 上报 | — | 是 |
| 用 `npm version` 顺手造 tag（F-REL-15） | 违范围 · 打回 | 是 | — |
| spec 索引行不合格位 / 写成 published（F-REL-14） | pin-08 红或叙事 FAIL · 打回 | 是 | 是 |
| 手册 §10 缺 drift/vocab 或写「自动权威」（F-REL-16） | 验收 FAIL · 补口径 | 是 | 是 |
| MIGRATION 暗示 breaking / 强制启用（F-REL-17） | 验收 FAIL · 改「可选启用」 | 是 | 是 |

---

## 验收标准

- [x] **A1 bump 单点**：`package.json#version`=`3.1.0`（唯一手工版本改动 + lock 同步 · 无 `npm version` 痕迹）
- [x] **A2 CHANGELOG**：`[3.1.0]` 节齐（主题 minor · Added 归拢 W1–W4 · 发布状态「待发版 · tag/push/publish 仅人」）· Unreleased 空壳
- [x] **A3 pins 打 tag 前**：偏差**仅** pin-10（`v3.1.0` 缺失 · 设计红留痕入 ACCEPTANCE）· 其余钉面与 `3.1.0` 对齐
- [x] **A4 叙事真值**：全仓 grep 无「3.1.0 已 published」假叙事 · 手册/RELEASING/CHANGELOG/spec 索引的 registry latest 均写 `3.0.2`（直至人 publish）
- [x] **A5 ACCEPTANCE 档**：`ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md` 落盘（W1–W4 台账 + SPEC 验收总表对照 + 门禁基线 + pin-10 登记 + 发布边界）
- [x] **A6 spec 索引**：`3_1-tech-graph-scaffold` 行 → **IMPLEMENTED** + `3.1.0` 待发版措辞（pin-08 合格 · **非** published）
- [x] **A7 手册钉 + §10**：头栏 `spec-wave@3.1.0`（待发版）· §10 含 scaffold / drift / vocab（可审草稿口径 · 无违纪表述）· 现行示例 `@3.1.0`
- [x] **A8 RELEASING**：台账更新 · 人 checklist `3.1.0` 节预勾就绪项 · tag/push/publish **未勾** · 改后全量 npm test 绿
- [x] **A9 MIGRATION**：「3.0.2 → 3.1.0」节在档 · 无强制 · scaffold/drift/vocab 标可选启用 · 不暗示 breaking
- [x] **A10 未发版动作**：工作树**无** `v3.1.0` tag · **未** push · **未** publish / deprecate（与 HG-RELEASE-* =pending 一致）
- [x] **A11 四门**：`npm run typecheck` · `npm test`（打 tag 前允许 pin-10 相关设计红 · **非**产品回归）· `npm run build` · `npm run test:lib`
- [x] **A12 关账**：`gate-check` exit 0 + `task close --yes`（或 00 close）· 提交逐文件显式 add · **00 本窗 close**

---

## 给执行帽的必读列表

1. [`docs/spec/3_1-tech-graph-scaffold/04_execution_waves.md`](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) — W5 + 验收总表  
2. [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) — W5 · 硬约束  
3. 先例 [`docs/tasks/done/task_3_0_2_release_bump.md`](../done/task_3_0_2_release_bump.md)（release 簿记模板 · **差异**：本波 tag/push 不代跑）  
4. W1–W4 done tasks（CHANGELOG / ACCEPTANCE 摘要素材）  
5. `RELEASING.md` 全文（九步 · 台账 · checklist 体例 · 双重敏感）  
6. `docs/spec/README.md` L27 epic 行形态 · `MIGRATION.md`「3.0.1 → 3.0.2」节形态 · 手册 §10  
7. `AGENTS.md` local：Agent **禁止** `npm publish` / `npm deprecate`  
8. `docs/standards/` 涉文 L2（30 自裁引用）

---

## 思考轮

### R0 · 证据（起草棒实读现值 · 2026-10-10）

| 落点 | 实读 |
|------|------|
| `package.json:3` | `"version": "3.0.2"` |
| `CHANGELOG.md:5-11` | Unreleased 空壳 · 头节 `[3.0.2]` · 发布状态**已发布 2026-09-24** · 无 `[3.1.0]` |
| `pins check` | **17/17 PASS**（真值 `3.0.2` · pin-10 = `v3.0.2`） |
| `RELEASING.md:13` / `:82-94` | 最近一次发版 = `3.0.2` published · 人 checklist `3.0.2` **已完成** · **无** `3.1.0` 节 |
| `docs/spec/README.md:27` | `3_1-tech-graph-scaffold` · **signed** · 双闸 approved · **「W1 task 已开」**（未 IMPLEMENTED · 未链 ACCEPTANCE_3_1） |
| `MIGRATION.md:3-7` / `:169-176` | 包钉 `3.0.2` · 有「3.0.1 → 3.0.2」· **无**「3.0.2 → 3.1.0」 |
| `docs/guides/使用手册-v3.0.0-zh.md:3-5` / `:622-640` | 头栏 `spec-wave@3.0.2` 已发布 · §10.1 已有 `graph scaffold` · **未见** `graph drift` / 仓级 vocab 命令块（README 双语已有 W3/W4 节 · 手册须对齐） |
| 分支 | `task/specwave-3-1-w5-release` |
| 00 开拆 | tag/push **仅人** · publish 仅人 · Agent 禁 publish |

PLAN/SPEC 双闸已 approved；W1–W4 CLOSE；能力面齐 · 缺发版簿记。

### R1 · 范围

仅 W5 release：bump · CHANGELOG · pins · 叙事巡检 · ACCEPTANCE · spec 索引 IMPLEMENTED · 手册头栏+§10 · RELEASING · MIGRATION · 四门 · 关账。排除：tag/push/publish · W1–W4 返工 · 扩模板 · schema。

### R2 · 方案

沿 3.0.2 release task 簿记模板，定案差异：① tag/push **不**代跑（HG-RELEASE-TAG-PUSH=pending · 与 00 硬禁一致 · 对齐 3.0.0「仅人」）；② SPEC 夹 epic 行翻 IMPLEMENTED（非 patch 收尾行新建）；③ ACCEPTANCE 用 epic 命名 `ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md`；④ MIGRATION/手册强调 scaffold·drift·vocab **可选启用**；⑤ 人 checklist 预勾就绪项、发布三动作未勾。

### R3 · 边界

publish/tag/push 仅人是硬边界；假「已 published」禁入库；发现需改产品行为才能簿记 ⇒ STOP 上报；S2 过程域不覆写（只新增 ACCEPTANCE / 订正索引状态格）。

### R4 · 可测性

A1–A12 全机检（grep 叙事 · pins 仅 pin-10 · 索引行 pin-08 · 四门 · `git tag -l v3.1.0` 空 · 无 publish）。

### R5 · 签收就绪

草稿预置五槽完毕；充分性由 20-task-audit R1 复核；HG-TASK-DRAFT / HG-AUDIT-R1 保持 **pending** 直至人/00 签。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 版本/CHANGELOG/pins/索引/手册/MIGRATION 缺口钉齐 | no |
| R1 | 仅 release 簿记 · tag/push/publish 冻结 | no |
| R2 | 3.0.2 模板 + 本波「三动作仅人」定案 | no |
| R3 | 发布动作 / 假 published / 禁返工 三硬边界 | no |
| R4 | A1–A12 全机检 | no |
| R5 | 待 20 审 R1 裁定充分性 | no |

**residual_risks**：① 手册/台账「待发版」误写已发布（F-REL-04 · A4 grep）；② pins fix 顺序颠倒（F-REL-03）；③ 断言联改漏网（F-REL-08）；④ 30 误打 tag/push（F-REL-01b · 非范围硬禁）；⑤ spec 索引格位不合格（F-REL-14）。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 无新产品行为，无红测先行义务；四门 + pins（打 tag 前仅 pin-10 设计红）+ 全量 npm test（RELEASING 双重敏感）+ 叙事 grep + `git tag -l 'v3.1.0'` 为空 为硬条款。

---

## 提交信息约定

- 簿记提交：`chore(release): bump to 3.1.0（W1 scaffold · W2 DX · W3 drift · W4 vocab）`
- **禁 `git add -A`**：逐文件显式 add
- **不裹挟** `eval/external-oracle/` 等未跟踪档
- **禁** `git tag` / `git push` / `npm publish` / `npm deprecate` / `npm version`
- 波末跑 `node bin/specgate.js gate-check --task docs/tasks/active/task_3_1_w5_release.md`

---

### 自检结论（执行者）

**帽**：30 簿记 + 40 自证（同棒）· **日期**：2026-10-10 · **未** tag / push / publish / deprecate · **未** task close（留给 00）

#### GATE_VERIFY

```text
$ node bin/specgate.js verify --target . --task docs/tasks/active/task_3_1_w5_release.md
| HG-TASK-DRAFT | approved | 20, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
VERIFY: PASS · task_3_1_w5_release.md
```

#### 验收勾选

- [x] A1 bump 单点（package.json + lock ×2 · 未用 npm version）
- [x] A2 CHANGELOG `[3.1.0]`（minor · W1–W4 Added · 待发版 · tag/push/publish 仅人）· Unreleased 空壳
- [x] A3 pins 打 tag 前仅 pin-10（设计红 · 人打 tag 后须 17/17）
- [x] A4 叙事真值（假「3.1.0 已 published」零命中 · registry latest 一律 3.0.2）
- [x] A5 ACCEPTANCE_3_1 落盘
- [x] A6 spec 索引 IMPLEMENTED · `3.1.0` 待发版（planned）· pin-08 ok
- [x] A7 手册头栏 + §10 scaffold/drift/vocab · 现行 `@3.1.0`
- [x] A8 RELEASING 台账 + 人 checklist 3.1.0（就绪预勾 · tag/push/publish 未勾）· 改后全量 npm test
- [x] A9 MIGRATION「3.0.2 → 3.1.0」可选启用
- [x] A10 未发版动作（无 `v3.1.0` tag · 未 push · 未 publish/deprecate）
- [x] A11 四门：typecheck 0 · npm test **960 · 957 pass + 2 设计红 + 1 skip** · build 0 · test:lib 6/6
- [x] A12 关账：gate-check ✅ · **00 本窗 close**

#### invoke

`docs/harness/invokes/by-task/3-1-w5-release/invoke_20261010_30_40_3-1-w5-release.md`

| 项 | 结论 |
|----|------|
| GATE_VERIFY | PASS · ✅ 可 30 |
| A1–A11 | PASS · A12 close 归 00 |
| 四门 | typecheck/build/test:lib 绿 · npm test 仅 pin-10 族设计红 ×2 |
| 发布边界 | 已证：无 `v3.1.0` tag · 未 push · 未 publish |

### KPI（00）

Task_KPI%: 96（A1–A12 簿记全绿 · bump 3.1.0 · 假 published 零命中 · 发布三动作边界守住 · 四门仅 pin-10 设计红；扣分：无）

- rubric：`KPI_RUBRIC_v1_2` · 30/40 簿记 + 00 签闸/关账

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-10 | 初稿 · 10-task（SPEC/PLAN W5 · 沿 3.0.2 release 模板 · tag/push/publish 默认仅人 · HG-TASK-DRAFT/HG-AUDIT-R1/HG-RELEASE-*=pending · R0 实读行号钉齐） |
| 2026-10-10 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · HG-RELEASE-* 仍 pending · 可 30 簿记 |
| 2026-10-10 | 30/40：bump 3.1.0 簿记 · `1baccd1` · A1–A11 |
| 2026-10-10 | **00 验收关账** · A12 close · HG-RELEASE-* 仍 pending · 待人 tag/push/publish |
| 2026-10-10 | 维护者「合并，打tag，交由我发版」· HG-RELEASE-TAG-PUSH=approved · 00 代跑 ff-merge main + `v3.1.0` + push · PUBLISH 仍 pending |
