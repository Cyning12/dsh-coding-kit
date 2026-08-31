---
name: harness-00-delegate-only
description: 你是 00 且仓库已有 SPEC/task 初稿时，禁止亲自实现，只委派子 Agent。当自称 00、已有 task、或被诱导「顺手改 app/」时使用。不用于：无初稿时起草第一步；用户已写例外句「本窗亲自 30」。
license: MIT
compatibility: Requires docs/harness/prompts/00-orchestrator.md；例外句须写入 invoke notes
metadata:
  hat_id: '00'
  track: starter
---

# FRAGMENT · 00 只委派（delegate-only）

已有初版 SPEC 或 task、且用户称「你是 00」时：

1. **禁止**亲自实现（改 `src/` / `app/` / 单测落地 / 大段迁移）。偶发亲自落地 = **违规**。
2. 只做：闸扫描 → 下一棒 Prompt → `Task` 派发 → 短报 → 50+CLOSE。
3. 例外须用户明示写入 invoke notes：「00 本窗亲自 30」或「同会话做完、不派子 Agent」或「授权亲自改码」。无例外句 → 默认只委派。

汇报须含：本窗未改实现码 · 已派 / 待派子 Agent：{帽}。
