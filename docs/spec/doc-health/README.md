# 文档健康度 + CLOSE 强绑定 · 长期 SPEC 包

> **状态**：`signed`（**HG-SPEC-SIGNOFF=approved** · 2026-08-26 · 维护者授权 00 签收）  
> **spec_slug**：`doc-health`  
> **版本**：`v0` · `2026-08-26`  
> **track**：`harness` / `docs-ops`  
> **graph_change_layer**：`none`（本包不改业务图；日后 lint 脚本另开 task）  
> **freeze_id**：无  
> **test_strategy**（下游 kit task）：`required`（close 闸单测 / dry-run）  
> **上游痛点**：ops-desk-api 上 structured-output / capability 波次 — invoke 写「CLOSE: PASS」与 `git mv → done/` + Hub 常拆成第二次请示；lifecycle `close` 本意 done→archived（物理 active→done）  
> **Open Folder（真值）**：`dsh-coding-kit/`（CLOSE / lifecycle / task close / prompts）  
> **试点仓（FEEDBACK）**：`ops-desk-api/` → `docs/spec/doc-health/`（POINTER · process · feedback）  
> **对照仓（观察）**：同试点；落盘形态参照 `docs/spec/inform-graph-backfill/`  
> **下游**：① kit 实现 PR（本仓）· ② 试点仓 dogfood + FEEDBACK  
> **HG-SPEC-SIGNOFF**：`approved`（2026-08-26 · 00 统筹落地 · 维护者明示授权）

---

## 一句话

把「文档可读 / 可导航 / 可关账」与 kit **CLOSE 完成态**绑死：验收过 ≠ 关账完；`CLOSE: PASS` 必须同时覆盖 **合入证据 + 归档 + Hub（若启用）**，并立 SPEC 专属夹公约与长期健康度观察轨。

---

## 读序（维护者 / 20-spec-audit / 00）

1. 本文件（总纲 · wave · 人闸 · 思考轮控制）
2. [`00_policy_and_boundaries.md`](./00_policy_and_boundaries.md) — 非目标 · 与 wiki / graph / task 边界
3. [`01_problem_and_goals.md`](./01_problem_and_goals.md) — 问题陈述 · 语义分裂
4. [`02_close_binding.md`](./02_close_binding.md) — **C1** CLOSE 强绑定契约（kit）
5. [`03_spec_layout_convention.md`](./03_spec_layout_convention.md) — **C2** SPEC 专属夹公约
6. [`04_doc_health_dimensions.md`](./04_doc_health_dimensions.md) — **C3** 健康度维度（非技术债主轴）
7. [`05_execution_waves.md`](./05_execution_waves.md) — kit 波次 vs 仓内先行波次
8. 过程纪律：[`process/agent_close_discipline.md`](./process/agent_close_discipline.md)（仓内可先于 npm 发版执行）
9. 观察日志：[`observations/`](./observations/)（标「观察 · 非冻结契约」）

---

## 目录结构（本包示范专属夹）

```text
docs/spec/doc-health/
├── README.md
├── 00_policy_and_boundaries.md
├── 01_problem_and_goals.md
├── 02_close_binding.md
├── 03_spec_layout_convention.md
├── 04_doc_health_dimensions.md
├── 05_execution_waves.md
├── observations/
│   ├── README.md
│   └── 2026-08-26_ops-desk-api_close-vs-archive.md
└── process/
    └── agent_close_discipline.md
```

---

## Wave 总表

| Wave | 目标 | 主落点 | 建议 PR 仓 |
|------|------|--------|------------|
| **W0** | 仓内 CLOSE 纪律先行（Prompt / invoke 文案） | `process/agent_close_discipline.md` | 业务仓（如 ops-desk-api） |
| **W1 · P0** | CLOSE 语义统一 + dry-run 文案去歧义 | `02_close_binding.md` · prompts / CLI 输出 | **dsh-coding-kit** |
| **W2 · P0** | 新闸：`close_pr_merged`（+ 豁免旗） | `src/cli-checks.ts` · `lifecycle.yaml` · 单测 | **dsh-coding-kit** |
| **W3 · P1** | 新闸或 checklist：Hub / domain 索引行 | `task close` · Hub 模板 · 可选 lint | **dsh-coding-kit** |
| **W4 · P1** | SPEC 布局公约写入 kit 文档 + 消费者 README 指针 | `03_spec_layout_convention.md` | kit + 业务仓 |
| **W5 · P2** | 健康度观察轨固化（可选 lint 脚本另开 task） | `04_doc_health_dimensions.md` · `observations/` | 业务仓为主 |

**禁止跳波**：W2 依赖 W1 文案与 DoD 词表稳定；W3 依赖 W1「归档完成态」定义。

---

## 范围 / 非范围（整包摘要）

**范围**

- kit：CLOSE / `task close` / lifecycle `close` 的完成态契约、模板文案、机械闸叠加、单测草案
- 文档：SPEC 专属夹公约；健康度维度与观察日志模板
- 过程：00/30/CLOSE Prompt 应写清的关账清单（仓内可先行）

**非范围**

- 不改业务仓 `app/` 生产代码
- 不在 kit 内强制 `gh pr merge`
- 不绑架业务 HTTP `freeze_id`
- 不重开 graph / Inform 补齐 SPEC（仅可读性观察）
- 本 draft **不**自动改 npm 已发布包行为（须签收后开 task）

---

## 验收标准（整包 · 可勾选）

- [ ] 本目录为专属夹；根下无裸挂 `SPEC-doc-health_*.md`
- [ ] README 含读序、目录树、wave 表、`HG-SPEC-SIGNOFF=pending`
- [ ] C1/C2/C3 三块各有专文；C1 含 DoD、豁免旗、与既有 `close_*` 叠加表、kit 落点与测名草案
- [ ] `observations/` 至少 1 篇标「观察 · 非冻结契约」
- [ ] `process/agent_close_discipline.md` 给出 00/30 可复制关账要点（无同长度嵌套围栏）
- [ ] 思考轮控制表 R0–R5 已填；未签收前不宣称可开 30 改码
- [ ] 产出下一棒 20-spec-audit 可复制 Prompt

---

## failure_paths（整包）

| ID | 触发 | 系统/过程行为 | 可重试 | 可见类型 |
|----|------|---------------|--------|----------|
| F-SPEC-01 | 人把本 draft 当已签收开 30 改 kit | 00 拒开工；指出 `HG-SPEC-SIGNOFF=pending` | 是（签后再开） | 闸 |
| F-SPEC-02 | Agent 只写「CLOSE: PASS」不跑 `task close --yes` / 不更新 Hub | 文档腐烂 · active 堆积；见 W0 纪律 + W1/W3 闸 | 是 | 过程债 |
| F-SPEC-03 | 新闸与既有 `close_*` 重复判定同一事实 | SPEC 要求叠加表显式「不重复」；实现审时打回 | 是 | 设计 |
| F-SPEC-04 | dry-run 仍打印易误解的 `CLOSE: PASS` | W1 须改文案（如 `CLOSE: READY` / 标明 dry-run） | 是 | UX/契约 |
| F-SPEC-05 | 无 PR 的 docs-only 被新闸误杀 | `--allow-no-pr-merge` + 元信息豁免路径 | 是（豁免留痕） | 闸 |
| F-HEALTH-01 | Hub 有行、物理文件不在 done/（或相反） | orphan / 死链；列为健康度 failure · 可选后续 lint | 是 | 资产 |

---

## 人工闸

| human_gate_id | status | blocks | 说明 |
|---------------|--------|--------|------|
| **HG-SPEC-SIGNOFF** | **approved** | 00 出 kit 实现 task · 30 改码 | 2026-08-26 维护者授权 00 签收 |

---

## 思考轮控制表

| 轮 | 主题 | 结论摘要 | early_stop |
|----|------|----------|------------|
| **R0** | 读痛点 / 双仓边界 | 痛点在「验收文案 vs 归档动作」分裂；真值在 kit；观察在 ops-desk-api；本包落 kit `docs/spec/doc-health/` | no |
| **R1** | 范围 / 非范围 / 角色 | 三角色：kit 维护者、业务仓 00、30/CLOSE Agent；三块 C1–C3；不碰 app/、不自动 merge | no |
| **R2** | 方案对比 | 见下「R2 方案」；推荐 **契约先 SPEC + 闸增量叠加**，弃选「只改 Prompt」与「大一统替换全部 close_*」 | no |
| **R3** | 边界 / 失败 / 依赖 | 依赖既有 11× `close_*`；新增 PR/Hub 闸须 allow_flag；Hub 非所有仓启用 → 条件闸 | no |
| **R4** | 验收 / 可测性 | kit：`test_strategy=required`；测名草案见 `02`；仓内 W0 以 checklist 验收 | no |
| **R5** | 签收就绪 | SPEC 包可交 **20-spec-audit**；**不可**宣称已签；开放问题 ≤5 留给维护者 | no |

**residual_risks**（未 early_stop，仍记录）：

1. `gh`/远程 MERGED 探测在无网络 CI 或 fork 场景 fragile → 须本地/fixture 与豁免路径。  
2. ~~Hub 启用策略~~ → **已拍板**：方案 A + 仓级 manifest 可关（**默认开**）。  
3. ~~dry-run 兼容旧 PASS~~ → **已拍板：无需兼容旧版**；W1 直接改 `CLOSE: READY`。

### 维护者拍板（2026-08-26 对话确认 · 已齐）

| # | 问题 | 决议 |
|---|------|------|
| 1 | dry-run 用词是否兼容旧 `CLOSE: PASS` | **无需兼容** → dry-run=`CLOSE: READY`；`--yes` 成功=`CLOSE: PASS` |
| 2 | PR 探测是否允许自动关联当前分支 | **允许** → `related_pr` → `gh pr view`（当前分支）→ `--pr` |
| 3 | Hub 闸启用策略 | **A 默认 + 仓级 manifest 可关**；**仓级默认开启**（见 `02` §6.3） |
| 4 | 根级裸 SPEC warn 如何感知 | **索引表（立刻）+ CLI/verify warn（随发版）**；CI 可选；不挡 close/merge |
| 5 | 与 ops-desk-api 关联 | **立为试点仓**：api 落 `docs/spec/doc-health/` POINTER + process + FEEDBACK 轨 |

### 试点仓（FEEDBACK）

| 项 | 值 |
|----|-----|
| **试点仓** | `ops-desk-api`（本机常见：`Desktop/Ops-desk/ops-desk-api`） |
| **契约真值** | 本包（kit）`docs/spec/doc-health/` |
| **试点镜像** | api：`docs/spec/doc-health/`（POINTER · process · feedback） |
| **FEEDBACK 落点** | api `docs/spec/doc-health/feedback/`（验新版本 kit 时写回；可再开 kit issue/PR） |
| **Hub 现状** | api 已启用 `docs/tasks/done/README.md` → 适用方案 A 默认开 |

### R2 方案（摘要）

| 方案 | 要点 | 结论 |
|------|------|------|
| A. 仅改 Prompt / 仓内纪律 | 零 kit 发版；依赖 Agent 自觉 | **W0 可先行**，不足以防腐烂 |
| B. 契约 SPEC + 增量新闸（PR · Hub）叠加既有 `close_*` | 保留十一闸；补合入与索引 | **推荐** |
| C. 重写 close 状态机 / 合并全部闸 | 成本高、回归面大 | **弃选**（本包不做） |

---

## 关联路径

| 路径 | 说明 |
|------|------|
| `assets/harness/lifecycle.yaml` | `close`：done→archived · 既有 close_* |
| `src/cli.ts` `cmdTaskClose` | dry-run 亦打印 `CLOSE: PASS`；`--yes` 才 `renameSync` |
| `src/cli-checks.ts` | `evalCloseGuard` 单一实现源 |
| `test/cli-task-close-guards.test.ts` | 既有 close 闸钉死 |
| `assets/harness/templates/TASK_done_README.md` | Hub 关账 checklist（**当前非机械闸**） |
| 对照：`ops-desk-api/docs/spec/inform-graph-backfill/` | 专属夹形态参照 |
| 对照：`ops-desk-api/docs/spec/agent-infra/` | 已符合专属夹（正例） |
| **试点**：`ops-desk-api/docs/spec/doc-health/` | POINTER · process · FEEDBACK（验新版本 kit） |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | v0 draft 初包落盘（10-spec · HG-SPEC-SIGNOFF=pending） |
| 2026-08-26 | 拍板齐：Hub A+manifest 默开；warn=索引+CLI；试点关联 ops-desk-api |
| 2026-08-26 | **HG-SPEC-SIGNOFF=approved**；00 合并 W1–W4 为单 task 落地 |

---

## 给 Cursor / 下一棒

`doc-health`、`CLOSE`、`task close`、`HG-SPEC-SIGNOFF`、`close_pr_merged`、专属夹、`20-spec-audit`
