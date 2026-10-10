# invoke · 10-task · 3-1-w2-graph-dx

> **task_slug**：`3-1-w2-graph-dx`  
> **hat**：10-task  
> **日期**：2026-10-10  
> **触发**：00 invoke `invoke_20261010_00_3-1-w2-graph-dx.md` · W1 关账后开拆 W2

## 动作

1. 实读 R0：`src/cli/init.ts:64-73`/`268` · `test/init.test.ts:235-247` · `assets/harness/templates/TASK_graph_bootstrap.md:48/:54` · 手册 §3/§5 · `kit-graph-check` 薄命令  
2. 新建 [`docs/tasks/active/task_3_1_w2_graph_dx.md`](../../../../tasks/active/task_3_1_w2_graph_dx.md)  
3. `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_3_1_w2_graph_dx.md` → **LINT: PASS**

## 闸态（task 表）

| 闸 | status |
|----|--------|
| HG-SPEC-SIGNOFF | approved（epic · 人 · 继承） |
| HG-NEXT-PLAN | approved（epic · 人 · 继承） |
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（blocks 30） |

## 范围钉摘要

必做：init/手册真实 `graph scaffold` 下一步 · bootstrap 优先 scaffold · Agent 指针对齐清单。  
可选：宿主薄封装（不阻塞关账 / 不阻塞 W3）。  
禁：改 scaffold 实现语义 · W3/W4 · bump/tag/push/publish · `git add -A`。

## 下一棒

20-task-audit 书面审本 task → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 → 30 实现（**未签禁改码**）。

## 非范围本棒

未改 `src/` / `test/` / 未 bump。
