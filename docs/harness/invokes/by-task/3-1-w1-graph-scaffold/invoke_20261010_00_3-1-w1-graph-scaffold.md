# invoke · 00 统筹 · 3-1-w1-graph-scaffold

> **task_slug**：`3-1-w1-graph-scaffold`  
> **hat**：00  
> **日期**：2026-10-10  
> **触发**：维护者本窗「签收」· HG-TASK-DRAFT / HG-AUDIT-R1 → approved  

## 动作

1. 确认 20 审 R1 PASS · blocking 0（[`task_3_1_w1_graph_scaffold_audit_R1_20261010.md`](../../../../harness/reviews/task_3_1_w1_graph_scaffold_audit_R1_20261010.md)）  
2. 回填 task 人工闸表双闸 approved（维护者原文「签收」）  
3. 审查文「结论」「签收」节可机读通过词齐备  
4. `verify --task` 闸扫描：HG-AUDIT-R1 ✅ 可 30  

## 派发

- **下一棒**：30-execute（实现 `graph scaffold`）  
- **分支**：`task/specwave-3-1-w1-scaffold`  
- **约束**：吸收 20 审 N1–N5；禁 bump/tag/push/publish；禁污染本仓 `docs/_tech_graph` dogfood；临时目录 fixture  

## 非范围本棒

未改 `src/` / `test/`（留给 30）。
