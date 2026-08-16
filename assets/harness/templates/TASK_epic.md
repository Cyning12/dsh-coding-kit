# Epic：<主题 · 总纲>

> **状态**：`draft` / `in_progress` / `done`  
> **freeze_id**：`freeze_<epic_slug>`  
> **落盘**：`docs/tasks/active/epic_<slug>.md` 或 `docs/harness/tasks/active/`（按仓约定）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `epic-<slug>` |
| **test_strategy** | `not_applicable` |
| **test_strategy_note** | Epic 跟踪单；可执行验收在 **子 task** |
| **orchestration** | `Cursor Task 链` + **人工 00**（首棒） |
| **chain_prompt** | `docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md` |
| **semi_auto** | `false` |
| **audit_profile** | `full` / `post_close` |
| **git_branch** | `task/<epic-branch>` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | Epic 跟踪单；wiki 增量在子 task |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸（Epic 级）

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-EPIC-SIGNOFF | pending | CLOSE | 全部子 task 验收 + invoke 齐全后人签 |

---

## 背景与目标

<Epic 完成态：子 task 列表与 freeze_id>

**不做（Epic 范围外）**：

- …

---

## 任务编排（Epic 主表 · 必填）

| 棒 / slug | parallel_group | depends_on | 开工闸门 | worktree_root（可选） |
|-----------|----------------|------------|----------|------------------------|
| task-a | — | — | 22 R1 ✅ | `<repo-root>` |
| task-b | — | task-a | 22 R1 ✅ | `<repo-root>` |
| CLOSE | — | task-b | 40/50 | — |

- 子 task 正文只写一行：`epic: epic_<slug> · depends_on: task-a`
- **并行**：同 `parallel_group` 须 **独立 worktree** + 不同 `git_branch`

### 编排入口（00）

| 项 | 路径 |
|----|------|
| entry_invoke | `docs/harness/invokes/by-task/<epic_slug>/invoke_*_00_orchestrator.md` |
| orchestrator | `docs/harness/prompts/00-orchestrator.md`（完整库 POINTER） |
| 过程 invoke 索引 | `docs/harness/invokes/by-task/<epic_slug>/README.md` |

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 子 task 未 22 即派发 30 | 00 **拒派发** | 是 | 缺审查 / 人签 |
| 并行共分支改同一目录 | 执行 **拒开工** | 是 | 须 worktree |

---

## 验收标准

- [ ] 编排主表 + 00 invoke 落盘
- [ ] 各 sub-task `done` + 40 自检 + CI 绿（涉码）
- [ ] invoke 目录证据齐全
- [ ] `HG-EPIC-SIGNOFF` approved
- [ ] `freeze_id` 写入 CHANGELOG / 关账 invoke

---

## 给执行帽的必读列表

- 各子 task 全文
- Epic 编排主表（本文件 §任务编排）
- `docs/harness/invokes/by-task/<epic_slug>/`

---

### 自检结论（执行者）

（40 汇总或各子 task 分别回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| YYYY-MM-DD | 从 cyning-harness `TASK_epic.md` 嵌入 |
