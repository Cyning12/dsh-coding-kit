# invoke · 10-task · 3-1-w4-graph-vocab

> **task_slug**：`3-1-w4-graph-vocab`  
> **hat**：10-task  
> **日期**：2026-10-10  
> **触发**：00 invoke `invoke_20261010_00_3-1-w4-graph-vocab.md` · W3 关账后开拆 W4

## 动作

1. 实读 R0：`src/cli-graph-yaml.ts:56-86`（`loadTechGraphVocab` 仅内置）· `:90-106`（钩②）· `:361`/`:593`/`:624`（compile/check/export 挂载）· `assets/tech-graph-vocab.yaml:7-28` · `src/cli-pins.ts:20`/`:118-128` · `src/cli-graph-drift.ts:12`/`:157-176` · `test/f1-unify.test.ts` 钩②钉 · PLAN_3_0_2 非范围 F-1② · SPEC `02` §4.2 / `03` §1.4 / §3  
2. 新建 [`docs/tasks/done/task_3_1_w4_graph_vocab.md`](../../../../tasks/done/task_3_1_w4_graph_vocab.md)  
3. `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_3_1_w4_graph_vocab.md` → **LINT: PASS**

## 闸态（task 表）

| 闸 | status |
|----|--------|
| HG-SPEC-SIGNOFF | approved（epic · 人 · 继承） |
| HG-NEXT-PLAN | approved（epic · 人 · 继承） |
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（blocks 30） |

## 范围钉摘要

必做：`.spec-wave/graph-vocab.yaml` + 内置合并 · 冲突/坏 YAML exit 2 · 缺省无文件=3.0.2 · 登记扩展边型零 Warning · 未登记仍 Warning 不咬 exit · 加载面挂 `graph yaml compile|check` · 文档最小节 · 负向 fixture · 四门 · gate-check。  
可选：`graph vocab show`（**非硬门槛** · 不挡关账）。  
禁：改 drift/scaffold 语义 · W5/bump/tag/push/publish · `git add -A` · 代签本波两闸 · 回退「登记 ≠ 封闭」。

## 下一棒

20-task-audit 书面审本 task → 人签 HG-TASK-DRAFT + HG-AUDIT-R1 → 30 实现（**未签禁改码**）。

## 非范围本棒

未改 `src/` / `test/` / 未 bump。
