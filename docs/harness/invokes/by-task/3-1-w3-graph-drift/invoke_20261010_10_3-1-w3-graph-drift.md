# invoke · 10-task · 3-1-w3-graph-drift

> **task_slug**：`3-1-w3-graph-drift`  
> **hat**：10-task  
> **日期**：2026-10-10  
> **触发**：00 invoke `invoke_20261010_00_3-1-w3-graph-drift.md` · W2 关账后开拆 W3

## 动作

1. 实读 R0：`src/cli-graph.ts:30-47`/`:50-75`（无 drift）· `src/cli-graph-scaffold.ts:20-31`/`150-187`/`568-582` · `src/cli-graph-yaml.ts:29`/`:173-178`/`:336-342`/`:614+` · `src/cli-shared.ts:477-483` · `src/cli-pins.ts:20` · `assets/ci/samples/` · PLAN_3_0_2 非范围 F-2  
2. 新建 [`docs/tasks/done/task_3_1_w3_graph_drift.md`](../../../../tasks/done/task_3_1_w3_graph_drift.md)  
3. `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_3_1_w3_graph_drift.md` → **LINT: PASS**

## 闸态（task 表）

| 闸 | status |
|----|--------|
| HG-SPEC-SIGNOFF | approved（epic · 人 · 继承） |
| HG-NEXT-PLAN | approved（epic · 人 · 继承） |
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（blocks 30） |

## 范围钉摘要

必做：`graph drift [--target][--input][--json]` · 一级包目录 ∈ `01_struct` · 锚点 path 消失 exit 2 · 白名单（`.spec-wave/graph-drift.yaml` 候选）· `--json` 只增 · 负向 fixture · 四门 · gate-check。  
可选：CI example 可选步骤（不阻塞关账）。  
禁：自动重画图谱 · 改 scaffold 语义 · W4/W5 · bump/tag/push/publish · `git add -A` · 代签本波两闸。

## 下一棒

20-task-audit 书面审本 task → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 → 30 实现（**未签禁改码**）。

## 非范围本棒

未改 `src/` / `test/` / 未 bump。
