# invoke · 10-task · 3-1-w5-release

> **task_slug**：`3-1-w5-release`  
> **hat**：10-task  
> **日期**：2026-10-10  
> **触发**：00 invoke `invoke_20261010_00_3-1-w5-release.md` · W1–W4 关账后开拆 W5 release

## 动作

1. 实读 R0：`package.json:3`（version=`3.0.2`）· `CHANGELOG.md:5-11`（无 `[3.1.0]`）· `pins check` 17/17 · `RELEASING.md:13`/`:82` · `docs/spec/README.md:27`（epic 未 IMPLEMENTED）· `MIGRATION.md` 无「3.0.2 → 3.1.0」· 手册头栏+§10.1（缺 drift/vocab）· 分支 `task/specwave-3-1-w5-release`  
2. 新建 [`docs/tasks/active/task_3_1_w5_release.md`](../../../../tasks/active/task_3_1_w5_release.md)（沿 `task_3_0_2_release_bump` · **差异**：tag/push/publish 默认仅人）  
3. `node bin/specgate.js task lint --file docs/tasks/active/task_3_1_w5_release.md` → 目标 **LINT: PASS**

## 闸态（task 表）

| 闸 | status |
|----|--------|
| HG-SPEC-SIGNOFF | approved（epic · 人 · 继承） |
| HG-NEXT-PLAN | approved（epic · 人 · 继承） |
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（blocks 30） |
| HG-RELEASE-TAG-PUSH | **pending**（tag/push 仅人 · 不拦 30 簿记） |
| HG-RELEASE-PUBLISH | **pending**（publish 仅人 · Agent 永禁） |

## 范围钉摘要

必做：bump `3.1.0` · CHANGELOG 归拢 W1–W4 · pins（打 tag 前仅 pin-10）· 叙事巡检 · ACCEPTANCE_3_1 台账 · spec 索引 → IMPLEMENTED（待发版）· 手册头栏+§10（scaffold/drift/vocab）· RELEASING 人 checklist 预勾就绪项 · MIGRATION「3.0.2 → 3.1.0」可选启用 · 四门 · gate-check。  
禁：`git tag` · `git push` · `npm publish` / `deprecate` · 改 W1–W4 语义 · 扩模板 · `git add -A` · 代签本波闸。

## 下一棒

20-task-audit 书面审本 task → 人/00 签 HG-TASK-DRAFT + HG-AUDIT-R1 → 30 簿记（**未签禁改** · **仍禁** tag/push/publish）。

## 非范围本棒

未改 `src/` / `test/` / 未 bump / 未 tag / 未 push / 未 publish。
