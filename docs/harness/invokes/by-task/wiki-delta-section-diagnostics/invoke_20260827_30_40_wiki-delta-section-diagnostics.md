# Invoke：30（含 40）· wiki-delta-section-diagnostics

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `wiki-delta-section-diagnostics` |
| task_paths | `docs/tasks/active/task_wiki_delta_section_diagnostics.md` |
| created_utc_or_local | 2026-08-27 |

## 指令摘要

按 task W1/W2 实现：lint-wiki-delta 增 `wiki_delta_wrong_section`（替代 missing 不双报 · detail 含节名/行号/hint）+ lintTaskFile 增 E8（直接 error 不灰度 · 20 审 R1 裁定）；test_strategy=required 先红后绿；四步验证（typecheck/test/build/test:lib）全绿；回填自检。

## 执行记录（00 收口补记）

| 棒 | 执行体 | 结果 |
|----|--------|------|
| 20 审 R1 | 子 Agent 72f58b33 | 零阻塞签收（reviews/task_wiki_delta_section_diagnostics_audit_R1_20260827.md） |
| 30+40 | 子 Agent ac12bc8b（里程碑 M2–M5） | 分支 4 commits：55ef53f→ef9acd4→cfa64a7→fe36f1a · 269/269 · 50 复检 PASS（e6976340） |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 开 30；CLOSE 前 00 补记执行链 |
