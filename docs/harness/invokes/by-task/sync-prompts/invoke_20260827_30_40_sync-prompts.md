# Invoke：30（含 40）· sync-prompts

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `sync-prompts` |
| task_paths | `docs/tasks/active/task_sync_prompts.md` |
| git_branch | `task/sync-prompts` |
| created_utc_or_local | 2026-08-27 |

## 指令摘要

实现 `npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]`：包内 Starter 白名单（prompts 9 文件 + TASK_TEMPLATE）→ 目标仓 `docs/harness/` 映射；SHA-256 三分（skip/add/conflict · conflict 默认不覆盖 · `--force` opt-in）；dry-run 默认；manifest 前置守卫；upgrade 结尾加只读提示行；单测先红后绿；四步 CI + dogfood；CHANGELOG/README/usage 同步。**禁止** bump 版本/tag/发布（维护者保留）。

## 00 执行波次

| 波 | 范围 | 退出条件 |
|----|------|----------|
| P1 | W1 核心 CLI + manifest 守卫 + 白名单遍历 + 三分 + dry-run/--yes/--json | 单测覆盖 add/skip/conflict/dry-run 先绿 |
| P2 | W2 conflict UX + `--force` + W3 upgrade 提示 + CHANGELOG/README/usage | help 与文档互链 |
| P3 | 幂等二跑 · 目标目录不存在时 mkdir · dogfood 本仓 | 四步全绿 · 自检表回填 |

## 维护者授权边界

- ✅ 00 代签 HG-TASK-DRAFT / HG-AUDIT-R1
- ✅ 00 可调度 30→40→50→CLOSE→PR→merge
- ⛔ **停于发布前**：不得 `npm publish` · 不得打 `v1.9.0` tag · 不得改 `[Unreleased]` 为正式版号（维护者操作）

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 00 签收开 30 |
