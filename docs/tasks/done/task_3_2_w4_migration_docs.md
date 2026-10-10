# Task：3.2 W4 · yaml 双栈迁移文档 + 保真分责（反哺 P3）

> **状态**：`done` · **00 验收关账** 2026-10-11（A1–A6 · `cbad4a6`）  

> **上游 SPEC**：[`04`](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) **W4** · [`03`](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) §2  
> **PLAN**：W4 · 统筹 [`invoke_20261011_00_orchestrate_w2_w5.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md)  
> **上游**：W1–W3 done · 同支  
> **行号口径**：2026-10-11  

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-2-w4-migration-docs` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 文档波：四门/gate-check 裁量；若改 CI sample 则测或文件存在性断言 |
| **code_quality_bar** | `standard` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-2-w1-ib-check` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅文档/样例 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 20/00 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | 统一 PR |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic |
| HG-NEXT-PLAN | approved | — | epic |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-11 **00 签收** · lint + [`task_3_2_w4_migration_docs_audit_R1_20261011.md`](../../harness/reviews/task_3_2_w4_migration_docs_audit_R1_20261011.md) PASS |
| HG-AUDIT-R1 | approved | **30** | 2026-10-11 **00 签收** · **可 30** |

---

## 背景与目标

W1–W3 命令已齐；对外须写清 **drift / ib / indexes** 分责，并给出消费仓 Python yaml 工具 → `npx spec-wave graph yaml …` 的迁移指引。不强制删消费仓脚本。

---

## 范围

- [x] **①** MIGRATION（或等价）：消费仓 `graph:ci` 可切 SpecWave CLI 的步骤与注意点（graph_id/label 等）  
- [x] **②** 手册「保真分责」表：drift（边+模块表）· ib（点）· indexes（倒排 opt-in）· AST（未交付）  
- [x] **③** README 双语（若主路径已有小节则补链）  
- [x] **④** 可选：`assets/ci/samples/` 注释步骤加 `graph ib check`（indexes **不**写硬门禁）  
- [x] **⑤** 四门绿（文档波）· `docs(3.2-W4): …` · 00 close（close 留 00）  

## 非范围

| 项 | 理由 |
|----|------|
| 删消费仓 Python | SPEC |
| 改 CLI 语义 / 新命令 | W1–W3 |
| bump/publish | W5 |
| 宣称已含 AST | 禁 |

---

## 失败路径

| 触发 | 行为 | 可重试 | 可见 |
|------|------|--------|------|
| HG-AUDIT-R1 pending | 拒 30 | 是 | 是 |
| 违纪「已含 AST」 | 打回 | 是 | 审查 |
| 四门红 | 停 | 是 | 是 |

---

## 验收标准

- [x] **A1**：MIGRATION（或明确路径）含 yaml 双栈迁移指引  
- [x] **A2**：手册含保真分责表（四行意图）  
- [x] **A3**：无「已含 AST 深闸」违纪表述（grep 自检）  
- [x] **A4**：可选 CI 样例注释含 `graph ib check` 或明示跳过不挡关账  
- [x] **A5**：四门绿  
- [x] **A6**：gate-check + close · `docs(3.2-W4): …` · 未 bump/tag/push/publish · **00 close**

---

## 给执行帽的必读列表

1. SPEC 03§2 · 04 W4 · PLAN W4  
2. 现行 `docs/MIGRATION*` / 使用手册 / README 落点（30 实读）  
3. `assets/ci/samples/`  

---

## 思考轮

### R0 · 证据

W1–W3 命令已交付；手册/MIGRATION 路径 30 实读补全。

### R1 · 范围

仅文档 + 可选 CI 注释。

### R2 · 方案

改 MIGRATION + 手册专节 + README 链；CI 可选。

### R3 · 边界

不改 CLI；不宣称 AST。

### R4 · 可测性

A1–A3 文件/grep；A4 可选；A5–A6 四门+close。

### R5 · 签收就绪

交 20 → 00 签 → 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 命令已齐待文档 | no |
| R1 | 仅 W4 文档 | no |
| R2 | MIGRATION+手册+可选 CI | no |
| R3 | 无 AST 宣称 | no |
| R4 | A1–A6 | no |
| R5 | 待 20 | no |

**residual_risks**：none（文档波）

---

## 测试策略（Harness）

**test_strategy**: `recommended`

---

## 提交信息约定

- `docs(3.2-W4): 图谱保真分责与 yaml 双栈迁移指引`  

### 自检结论（执行者）

- verify --task PASS（闸 approved · pre-30 invoke 10/20/00 已补）  
- A1：仓根 `MIGRATION.md` 增「消费仓 graph:ci / Python yaml → SpecWave graph yaml」双栈节  
- A2：手册 §10 保真分责四行（drift / ib / indexes / AST 未交付）  
- A3：grep 无违纪「已含 AST」宣称（仅禁令/未交付表述）  
- A4：`assets/ci/samples/tech-graph.yml.example` 注释可选 `graph ib check` · indexes 明示不写硬门禁  
- A5/A6：四门后 commit · **close 留 00** · 未 bump/tag/push/publish  
- 附带：`assets manifest rebuild`（samples 2 文件）· `test/graph-indexes-check` A8 路径改 `done/`（W3 关账后路径漂移）  


---

### KPI（00）

Task_KPI%: 95（A1–A6 · 文档波 · 四门绿 · 保真分责+迁移；扣分：无）

- rubric：`KPI_RUBRIC_v1_2`

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-11 | 10-task 初稿 · 00 开拆 W4 |
| 2026-10-11 | 20 审 R1 PASS · **00 签收** 过程闸 · 可 30 |
| 2026-10-11 | 30：MIGRATION 双栈 + 手册四行 + README 链 + CI 可选 ib · A1–A4 勾 · A6 留 00 |
| 2026-10-11 | **00 验收关账** · A6 close · SPEC04 W4 勾选 · W5 未开 |
