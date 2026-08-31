# Invoke：30（含 40）· hat-identity-system-reanchor

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `hat-identity-system-reanchor` |
| git_branch | `feat/hat-identity-system-reanchor` |
| created_utc_or_local | 2026-08-31 |
| source | `PROMPT_30_hat_identity_system_reanchor.md` · FEEDBACK 20260831 |

## 指令摘要

P0：帽级 System/Re-anchor FRAGMENT + 默认可分发 Skill（00 全文仍不进默认）；P1 文档/eval fixture；P2 Host×npx Capability 文档。CHANGELOG 写入 `[Unreleased]`。**禁止** `npm version` / `npm publish`。

## 自检命令与退出码

| 命令 | exit |
|------|------|
| `npm run typecheck` | 0 |
| `npm test` | 0（317 pass / 0 fail） |
| `npm run build` | 0 |
| `npm run test:lib` | 0（4 pass） |
| `npx dsh-coding-kit skills check` | 0 · `SKILLS CHECK: PASS` |
| 临时目录 `sync prompts --yes` | 0 · written 12（含两新 FRAGMENT） |

## 交付

- FRAGMENT：`assets/harness/prompts/FRAGMENT_hat_reanchor_v1_zh.md` · `FRAGMENT_00_delegate_only_v1_zh.md`
- `SYNC_PROMPT_FILES`：11 prompts + `TASK_TEMPLATE` = 12
- Skills：`assets/skills/harness-hat-reanchor/` · `harness-00-delegate-only/`（默认分发）
- CHANGELOG：`[Unreleased]`
- P1 fixture：`eval/hat_identity_00_delegate/README.md`（机械 eval 运行器 follow-up）
- P2：README 双文件 Host 节

## 非范围（已遵守）

- 未执行 `npm version` / `npm publish`
- 未默认安装 30/40 Skills
- 未把 00 全文塞 always system

## 下一棒

人 · `RELEASING.md` ①–⑧ · 发 **1.10.0** → `ops-desk-api` `upgrade --yes` + `sync prompts --yes` 校验新 FRAGMENT。
