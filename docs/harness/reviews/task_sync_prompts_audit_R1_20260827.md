# Task Audit R1：sync-prompts

> **task**：`docs/tasks/active/task_sync_prompts.md`（slug: `sync-prompts` · ops-desk-api 1.8.0 复发反馈 · 唯一残余摩擦）  
> **日期**：2026-08-27  
> **角色**：20-task-audit（书面审 · 未改 src）  
> **证据基线**：ops-desk-api `docs/spec/doc-health/feedback/2026-08-27_1.8.0_upgrade-no-prompt-sync.md` · 前案 `2026-08-26_1.7.1_upgrade-no-prompt-sync.md` · `CHANGELOG.md` [1.8.0] 消费者提示「upgrade / sync prompts 后生效」  
> **帽条文**：`assets/harness/prompts/20-task-audit.md`

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容审查** | **零内容阻塞 → 签收**（R1 回填 B1–B4 已写入 task · 锚点真实） |
| **流程闸** | `HG-TASK-DRAFT=approved` · `HG-AUDIT-R1=approved`（2026-08-27 维护者授权 00 代签全过程闸 · **发布/tag 除外**） |
| **下一棒** | **30+40**（单 task · 三波执行 · 见 task §00 颗粒度） |

---

## 核对项

| # | 核对点 | 结论 |
|---|--------|------|
| 1 | 根因对准 | ✅ CHANGELOG 1.7.1/1.8.0 均承诺「sync prompts 后生效」，但 `cmdSync`（`src/cli-sync.ts:101–115`）仅 `index` 子命令；独立 `sync prompts` 正确，不改 `upgrade` 写面 |
| 2 | 无 scope 膨胀 | ✅ 非范围排除 upgrade 写面变更、IDE/skills 面、版本间 diff 提示；W3 upgrade **提示行**为只读 stdout，非写面 |
| 3 | 文件白名单可执行 | ✅ R1 钉死：`assets/harness/prompts/*.md` **除 README.md**（9 个 Starter 文件 · 与 `assets/harness/prompts/README.md` 表一致）+ `assets/harness/templates/TASK_TEMPLATE.md` → 目标仓同相对路径 |
| 4 | 三分语义 | ✅ skip=内容一致 · add=目标不存在 · conflict=目标存在且内容不同且不覆盖；与 `skills check` drift 检测（`cli-skills.ts:218–236` 逐字 equality）同族，**非**虚构 checksum 字段 |
| 5 | 前置守卫 | ✅ 无 `.cyning-harness/manifest.json` → fail exit 1（对齐 `cmdUpgrade` L198–201 语义） |
| 6 | dry-run / --yes | ✅ 默认 dry-run 零写入 · `--yes` 执行 add+mkdir · 与 `refresh-ide-blocks --dry-run/--yes` 闸风格一致 |
| 7 | `--json` 形状 | ✅ R1 钉死：`{ dry_run, skip[], add[], conflict[], written[] }`（`written` 仅 `--yes` 且非 dry-run 时填充） |
| 8 | 测试参照 | ✅ `test/cli-verify-with-wiki-lint.test.ts` fixture 仓模式可复用；验收含 `npm run test:lib`（对齐 `.github/workflows/ci.yml` 四步） |
| 9 | 失败路径表 | ✅ 四行齐备（manifest 缺失 / conflict / dry-run / 幂等） |
| 10 | 思考轮 | ✅ R0–R2 闭环；residual_risks 诚实（首跑 conflict 量 · 无版本溯源） |
| 11 | dogfood | ✅ `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_sync_prompts.md` → `LINT: PASS` |

---

## R1 裁决（task 明示「20 审裁定」项）

| 决策点 | 裁决 | 理由 |
|--------|------|------|
| **`--force` 是否入 scope** | **入 W1/W2** | 与 `skills install --force` 对称；conflict 默认不覆盖，显式 `--force` 可覆盖；非默认 · opt-in |
| **upgrade 结尾提示行** | **加** | 一行 stdout 提示「manifest 已升级 · prompts 未同步 · 运行 `sync prompts --yes`」；不改 upgrade 写面 · 对齐 CHANGELOG 消费者预期 |
| **哈希实现** | **SHA-256 内容摘要** | 用于 skip/conflict 判定；输出清单仍列相对路径，不暴露 hash 给用户（除非 `--json` 可选 `sha256` 字段供脚本） |

---

## 内容阻塞（初稿 → 已回填 task）

| ID | 问题 | 回填 |
|----|------|------|
| B1 | 白名单未枚举 | task W1 增 explicit 9+1 清单 |
| B2 | 验收缺 `test:lib` | task 验收第 4 条已补四步 |
| B3 | 「checksum」用语与实现锚点漂移 | 改为「内容摘要三分 · SHA-256 · 同 skills check equality 语义」 |
| B4 | `--json` 无 schema | 见核对项 #7 |

**回填后：零阻塞。**

---

## 非阻塞观察（30 顺手）

- **N1**：`usage` L98 须扩为 `sync index|prompts` 两行；help 子命令各自 `--help`。
- **N2**：dogfood 建议对本仓 `docs/harness/prompts/` 先 dry-run 再 `--yes`（本仓 prompts 可能与包内 1.8.0 有 drift · 预期 conflict 清单供人读）。
- **N3**：CHANGELOG `[Unreleased]` 须兑现「sync prompts 后生效」并注明 1.7.1/1.8.0 提示语滞后；**不在本 task 内 bump 版本号/tag**（维护者发布前操作）。

---

## 签闸

- **HG-AUDIT-R1 → approved**（维护者 2026-08-27 授权 00 代签 · 发布/tag 保留维护者）
- **30 可开工**（invoke：`docs/harness/invokes/by-task/sync-prompts/`）

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R1：零阻塞签收；B1–B4 回填 task；--force/upgrade 提示/JSON schema 裁决 |
