# Invoke：30（含 40）· prompts-ci-alignment

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `prompts-ci-alignment` |
| task_paths | `docs/tasks/active/task_prompts_ci_alignment.md` |
| created_utc_or_local | 2026-08-27 |

## 指令摘要

K4：00-orchestrator bulk-split 早检行 + 10-task 预填义务（命令串与 CI sample 逐字一致 · 禁虚构 --scope changed）；K6：TASK_TEMPLATE 默认验收两行 + 40-self-check CI 补齐规则；K7：20-task-audit 旧测 grep 提醒条（非机械闸）；W4 修订记录/README/CHANGELOG 同步；grep 断言测先红后绿；四步验证；回填自检。

## 执行记录（00 收口补记）

| 棒 | 执行体 | 结果 |
|----|--------|------|
| 20 审 R1 | 子 Agent 31e72adc | 零阻塞签收（reviews/task_prompts_ci_alignment_audit_R1_20260827.md · N1–N4 非阻塞） |
| 30+40 | 子 Agent 83fc12de | main 5 commits：ce895ca→d6847bc→27ce61f→97c4c8e→b110725 · 297/297 · 50 PASS（8f7f8c13） |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 开 30；CLOSE 前 00 补记执行链 |
