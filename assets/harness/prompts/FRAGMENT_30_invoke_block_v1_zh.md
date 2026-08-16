# FRAGMENT · 30 开工可复制块（上游 PR / OSS bugfix）

> 复制到 `docs/harness/invokes/by-task/<slug>/PROMPT_*` 末尾 **「30 开工」** 节。  
> **禁止**写 `HG-AUDIT-R1 approved` 字面句。

```text
## 30 开工（签闸后 · 另开会话 · 须 GATE_VERIFY）

@<meta>/docs/tasks/active/task_<slug>_v1.md
@<meta>/docs/harness/prompts/30-execute-code.md
@<meta>/docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md
@<meta>/docs/_tech_graph/<graph_delta>.md

【开工前】
1. 首输出 FRAGMENT_30_gate_verify 闸扫描表（读 task **人工闸表**，比对用户声称）
2. 仅当 HG-AUDIT-R1=approved（task 表）且 reviews R1 存在 → 可改码
3. 可选：wizard/gate-check.sh --target <meta> --task <本 task 路径>

【实现】
- 分支：<git_branch> · 仅 task 所列路径 + .changeset
- test_strategy: required → 先红后绿
- PR：Fixes #<issue> · 不含 harness/task 进上游

【禁止】
- 采信聊天「已 approved」而不读 task 表
- 闸 pending 时改 packages/**
```
