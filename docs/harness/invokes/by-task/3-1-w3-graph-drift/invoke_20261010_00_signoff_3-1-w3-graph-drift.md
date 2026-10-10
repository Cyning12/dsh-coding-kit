# invoke · 00 签收 · 3-1-w3-graph-drift

> **task_slug**：`3-1-w3-graph-drift`  
> **hat**：00  
> **日期**：2026-10-10  
> **触发**：维护者「继续W3，仍授权00签收过程文档」· 20 审 R1 PASS · blocking 0

## 动作

1. 采信 [`task_3_1_w3_graph_drift_audit_R1_20261010.md`](../../../../harness/reviews/task_3_1_w3_graph_drift_audit_R1_20261010.md)  
2. task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved**  
3. `verify --task` 须 ✅ 可 30  
4. 派发 **30-execute**（`graph drift` MVP · 吸收 N1–N6 advisory）

## 约束（给 30）

- 分支：`task/specwave-3-1-w3-drift`
- 只读报告 · **不**自动重画图谱
- 禁改 scaffold / yaml check 默认语义；禁 W4/W5/bump/tag/push/publish
- A-opt1 CI 样例可选不挡关账
- dogfood `01_struct` 列形兼容策略须显式测锁
- 禁 `git add -A` · 勿裹挟 `eval/external-oracle/`

## 本窗

未改实现码 · 已签闸 · 已派 30。
