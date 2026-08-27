# Invoke：30（含 40）· close-done-snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `close-done-snapshot` |
| task_paths | `docs/tasks/active/task_close_done_snapshot.md` |
| created_utc_or_local | 2026-08-27 |

## 指令摘要

cmdTaskClose PASS 分支输出 done 片段快照（归档路径 + Harness 元信息节摘录 + 禁手写提示 · READY 不打印且与 1.7.1 逐字一致）；新增 `task close --json`（done_snapshot 唯绑归档事件 · READY null · BLOCKED 仅错误面）；TASK_USAGE/顶层 USAGE 同步；FRAGMENT_30 补归档真值句；先红后绿；四步验证；回填自检。

## 执行记录（00 收口补记）

| 棒 | 执行体 | 结果 |
|----|--------|------|
| 20 审 R1 | 子 Agent 2aa80cb0 | 退回（B1 锚点误指 cli-lifecycle · B2 --json 未声明新增） |
| 10-task 回填 | 子 Agent 3474f34a | B1/B2/N1/N2 落实 + R2 顺手修一行 |
| 20 审 R2 | 子 Agent 2aa80cb0 | 零阻塞签收 + done_snapshot 唯绑归档裁决（reviews/…_audit_R2_20260827.md） |
| 30+40 | 子 Agent 601989c7 | main 3 commits：431e1b7→35eb788→ed84e81 · 288/288 · 50 PASS（99012ea9） |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 开 30；CLOSE 前 00 补记执行链 |
