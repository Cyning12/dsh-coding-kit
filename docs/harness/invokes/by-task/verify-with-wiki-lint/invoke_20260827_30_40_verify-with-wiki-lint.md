# Invoke：30（含 40）· verify-with-wiki-lint

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `verify-with-wiki-lint` |
| task_paths | `docs/tasks/active/task_verify_with_wiki_lint.md` |
| created_utc_or_local | 2026-08-27 |

## 指令摘要

cmdVerify/verifySpecMode 增 `--with-wiki-lint`（复用 lintWikiDeltaMissing · --task/--spec 同生效 · --json wiki_lint 块）；BLOCKED 全串复跑命令与 CI sample 锁步；无旗标行为与 1.7.1 逐字一致；先红后绿；四步验证；回填自检。

## 执行记录（00 收口补记）

| 棒 | 执行体 | 结果 |
|----|--------|------|
| 20 审 R1 | 子 Agent 12213b45 | 退回（B1 --yes 字面量 · B2 缺 test:lib） |
| 10-task 回填 | 子 Agent d0f2d7e1 | B1/B2 + 非阻塞全落实 |
| 20 审 R2 | 子 Agent 12213b45 | 零阻塞签收（reviews/…_audit_R2_20260827.md） |
| 30+40 | 子 Agent c21f0768 | main 3 commits：8b4d316→3ac9a9a→1418cef · 279/279 · 50 PASS（706b5aaa） |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 开 30；CLOSE 前 00 补记执行链 |
