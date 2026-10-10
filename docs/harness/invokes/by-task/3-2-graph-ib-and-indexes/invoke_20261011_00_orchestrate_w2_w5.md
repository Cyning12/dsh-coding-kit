# invoke · 00 统筹 · 3.2 W2–W5

| 项 | 内容 |
|----|------|
| **hat_id** | `00`（delegate-only） |
| **日期** | 2026-10-11 |
| **授权** | 维护者：「授权00统筹W2~w5的所有需求，在合适时机commit，最后一起PR」 |
| **分支** | `task/specwave-3-2-w1-ib-check`（续用；或按波切 `task/specwave-3-2-w*` 后合回同一 PR 基线 · 本棒默认**同支串行**） |
| **过程闸** | 沿用 epic 授权：00 可签各波 `HG-TASK-DRAFT` / `HG-AUDIT-R1`（须 lint + 20 PASS） |
| **禁区** | 本窗不亲自 30 改码；不 tag/push/publish 除非 PR 步需 push；`npm publish` 仅人 |

## 编排

| Wave | 主题 | commit 时机 |
|------|------|-------------|
| W2 | `struct_rel` | 实现关账后 `feat(3.2-W2): …` |
| W3 | `graph indexes check` | 关账后 `feat(3.2-W3): …` |
| W4 | 迁移 + 分责文档 | 关账后 `docs(3.2-W4): …` |
| W5 | release 簿记 bump 3.2.0 | 关账后 `chore(3.2-W5): …` · **禁** tag/publish |
| 收口 | 统一 PR | `git push -u` + `gh pr create`（含 W1–W5） |

## 本窗未改实现码

仅统筹 · 拆派 · 签过程闸 · 关账文档 · 适时 commit · 最终 PR。
