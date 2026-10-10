# invoke · 00 签收 · 3-1-w4-graph-vocab

> **task_slug**：`3-1-w4-graph-vocab`  
> **hat**：00  
> **日期**：2026-10-10  
> **触发**：维护者「继续 W4」· 沿用签收过程文档授权 · 20 审 R1 PASS · blocking 0

## 动作

1. 采信 [`task_3_1_w4_graph_vocab_audit_R1_20261010.md`](../../../../harness/reviews/task_3_1_w4_graph_vocab_audit_R1_20261010.md)  
2. task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved**  
3. `verify --task` 须 ✅ 可 30  
4. 派发 **30-execute**（仓级词表合并 · 吸收 N1–N5）

## 约束（给 30）

- 分支：`task/specwave-3-1-w4-vocab`
- 挂 `graph yaml compile|check` 加载链；缺省无文件=3.0.2；冲突 fail-loud；登记≠封闭不回退
- 禁改 scaffold/drift 语义；禁 W5/bump/tag/push/publish
- A-opt1 `graph vocab show` 可选不挡关账
- 禁 `git add -A` · 勿裹挟 `eval/external-oracle/`

## 本窗

未改实现码 · 已签闸 · 已派 30。
