# invoke · 10-task · 3-1-w1-graph-scaffold

> **task_slug**：`3-1-w1-graph-scaffold`  
> **hat**：10-task  
> **日期**：2026-10-10  
> **触发**：维护者本窗「签收，拆W1」· HG-SPEC-SIGNOFF / HG-NEXT-PLAN 已落 approved  

## 动作

1. 回填 SPEC / PLAN / 索引 / `04` W0 签收勾选  
2. 新建 [`docs/tasks/active/task_3_1_w1_graph_scaffold.md`](../../../../tasks/active/task_3_1_w1_graph_scaffold.md)  
3. `node bin/specgate.js task lint --file docs/tasks/active/task_3_1_w1_graph_scaffold.md` → **LINT: PASS**  

## 闸态（task 表）

| 闸 | status |
|----|--------|
| HG-SPEC-SIGNOFF | approved（人） |
| HG-NEXT-PLAN | approved（人） |
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（blocks 30） |

## 下一棒

20-task-audit 书面审本 task → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 → 30 实现（**未签禁改码**）。

## 非范围本棒

未改 `src/` / `test/` / 未 bump。
