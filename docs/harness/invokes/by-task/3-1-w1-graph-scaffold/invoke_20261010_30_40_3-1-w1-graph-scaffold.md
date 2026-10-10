# invoke · 30-execute + 40-self-check · 3-1-w1-graph-scaffold

> **task_slug**：`3-1-w1-graph-scaffold`  
> **hat**：30 + 40  
> **日期**：2026-10-10  

## GATE_VERIFY（首输出）

```text
$ node bin/specgate.js verify --target . --task docs/tasks/active/task_3_1_w1_graph_scaffold.md
| HG-TASK-DRAFT | approved | 20, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
VERIFY: PASS
```

## 实现摘要

| 项 | 路径 |
|----|------|
| 脚手架实现 | `src/cli-graph-scaffold.ts` |
| 分发 | `src/cli-graph.ts`（`scaffold` 子命令） |
| usage | `src/cli/usage.ts` |
| 测 | `test/graph-scaffold.test.ts`（10/10） |
| 文档 | README.md / README.zh-CN.md / `docs/guides/使用手册-v3.0.0-zh.md` §10 |

## 20 审 N1–N5 吸收

- N1 旧测影响面：本套件 additive；注释钉在测试档头  
- N2 `--no-compile` 已落地  
- N3 `--overwrite-draft` 正向测（A6）  
- N4 struct-only 仍写 `REVIEW_CHECKLIST.md`（A5）  
- N5 非法 `--stack` → exit 1  

## 四门

- typecheck / test / build / test:lib · 绿（doc-links 须本波文件已 `git add` 入库态）  
- gate-check：未发现阻塞  

## 待 00

- 显式 commit（禁 `git add -A` · 勿裹挟 `eval/external-oracle/`）  
- `task close --yes`（A13）  
- 未 bump / tag / push / publish  
