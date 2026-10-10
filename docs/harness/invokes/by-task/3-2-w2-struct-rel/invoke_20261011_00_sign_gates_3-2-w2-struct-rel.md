# invoke · 00 签过程闸 · 3-2-w2-struct-rel

| 项 | 内容 |
|----|------|
| **hat_id** | `00`（delegate-only） |
| **日期** | 2026-10-11 |
| **触发** | 维护者授权 00 统筹 W2–W5 · 20 审 R1 PASS |
| **审查文** | [`task_3_2_w2_struct_rel_audit_R1_20261011.md`](../../../reviews/task_3_2_w2_struct_rel_audit_R1_20261011.md) |

## 已办

1. GATE_VERIFY：曾 BLOCKED（两过程闸 pending / 缺 pre-30 invoke）  
2. 20-task-audit → **PASS · blocking 0**  
3. 回填 task 表 **HG-TASK-DRAFT** / **HG-AUDIT-R1** → **approved**  
4. 本窗**未**改 `src/` / `test/`（签闸棒）  

## 派发

- **下一棒**：30-execute（+40 自检）  
- **分支**：`task/specwave-3-2-w1-ib-check`  
- **约束**：吸收 20 审 N1–N4；`struct_rel` 相对 `--input`；禁改缺省字面；禁 bump/tag/push/publish；临时目录 fixture  
