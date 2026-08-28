# Invoke：30（含 40）· self-tech-graph-w4-closeout

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `self-tech-graph-w4-closeout` |
| task_paths | `docs/tasks/active/task_self_tech_graph_w4_closeout.md` |
| git_branch | `task/self-tech-graph-w4-closeout` |
| created_utc_or_local | 2026-08-28 |

## 指令摘要

W4 收口：templates README / POINTER_ONBOARDING / ci samples README / 双根 README 互链到 kit 源码仓 `docs/_tech_graph/`（**docs 不进 npm 包**）。改 `01_problem_and_goals.md` 完成态。CHANGELOG `[Unreleased]` `### Docs` 拟 1.9.1。禁止 bump、禁止改 templates yaml/protocol、禁止改 `.example` 脚本。跑 `cli-docs-graph-templates.test.ts` + 全量 npm test。

## 维护者授权边界

- ✅ 00 已代签挡 30 闸
- ⛔ 不得改 `package.json` version / tag / publish
- ⛔ 不得写 `## [1.9.1] - 日期`（无 bump）

## 40 自检最低命令

- `node --test --test-concurrency=1 --experimental-strip-types test/cli-docs-graph-templates.test.ts`
- `npm test` · `npm run typecheck`
- `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph`
- task lint / verify --spec / verify --task

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 签收开 30 |
