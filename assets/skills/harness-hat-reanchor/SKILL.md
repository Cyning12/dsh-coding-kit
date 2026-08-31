---
name: harness-hat-reanchor
description: 长对话帽身份丢失时先读本片段 re-anchor（hat_id / task_slug / 禁区）。当上下文脏、多轮读码后纪律漂移、或换帽后仍自称旧帽时使用。不用于：替代 prompts 全文；替代 npx dsh-coding-kit verify。
license: MIT
compatibility: Requires docs/harness/prompts/ 已 sync；机械闸仍走 CLI verify
metadata:
  hat_id: reanchor
  track: starter
---

# FRAGMENT · 帽身份 Re-anchor

上下文脏（多轮读码 / 大 diff / 口头换帽）则**先读本片段**，再继续。本片段 ≠ prompts 全文 ≠ `verify`。

- **hat_id**：{00 / 10-task / 10-spec / 20-task-audit / 20-spec-audit / 30 / 40}
- **task_slug**：{active task 文件名或「无」}
- **本帽禁区**：{从当前帽 prompts「禁止什么」抄一行}

只做本 `hat_id` 允许的事。换帽须加载该帽 prompts **全文**。机械闸：`npx dsh-coding-kit verify`。
