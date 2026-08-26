# 02 · CLOSE 强绑定（kit 契约 · C1）

> **状态**：`draft` · 隶属 `doc-health`  
> **真值仓**：`dsh-coding-kit`（本文件写契约；实现须签收后开 task）  
> **test_strategy**（下游）：`required`  
> **非目标**：强制 `gh pr merge`；绑架业务 HTTP freeze

---

## 1. CLOSE 完成态（Definition of Done）

执行 CLOSE（含 `npx dsh-coding-kit task close`、lifecycle transition `close`、以及 invoke 帽 `CLOSE`）时，**完成态**最小清单如下。优先 **机械可检**。

| # | 条件 | 机械性 | 现状（v 调研口径 · 2026-08-26） | 本 SPEC 目标 |
|---|------|--------|----------------------------------|--------------|
| D1 | 既有 `close_*` 十一闸通过（或对应 `--allow-*` 留痕） | 高 | **已接线**（`evalCloseGuard`） | **保持叠加** |
| D2 | 物理归档：`*/active/*.md` → `*/done/`（或 `--target`） | 高 | 仅 `--yes` 执行 `renameSync`；dry-run 也打印 `CLOSE: PASS` | dry-run 打印 **`CLOSE: READY`**（**不**兼容旧 PASS）；仅 `--yes` 成功后 `CLOSE: PASS` |
| D3 | 实现已合入：关联 PR **MERGED**（或等价 merge commit），或显式豁免 | 中高 | **无** | 新增闸 `close_pr_merged`；允许 `gh` 自动关联当前分支 |
| D4 | Hub 索引行已更新（仓启用 Hub / done_by_domain 时） | 中 | 仅模板 checklist，**非闸** | W3：`close_hub_index`；**A + manifest 可关 · 默认开**（§6.3） |
| D5 | invoke/模板文案禁止「CLOSE: PASS = 仅验收、归档另议」 | 低（文档）+ 抽检 | 文案易歧义 | W1 改 prompts / TEMPLATE / help |

**完成态一句话**：`CLOSE 完成` ⟺ D1 ∧ D2 ∧ (D3∨豁免) ∧ (D4∨不适用∨豁免)。

---

## 2. 词表（须写入 CLI / prompts）

| 用语 | 含义 | 禁止用法 |
|------|------|----------|
| `CLOSE: READY` | 守卫过、**未**归档（dry-run / 无 `--yes`） | 当作已关账；dry-run **禁止**再打印 PASS |
| `CLOSE: PASS` | **已**执行归档（`--yes`）且 D1–D4 满足 | dry-run 输出；仅验收绿 |
| `CLOSE: BLOCKED` | 守卫失败 | — |
| lifecycle `archived` | 逻辑态；物理目录名仍为 `done/` | 要求再建 `archived/` 目录（非本包目标） |

> **已拍板（2026-08-26）**：无需兼容旧版 dry-run `CLOSE: PASS`；CHANGELOG 写破坏性说明即可。

---

## 3. 与既有 `close_*` 叠加（勿重复造轮）

既有登记（`assets/harness/lifecycle.yaml` · `CLOSE_GUARD_ORDER`）：

`close_invoke` · `close_self_check` · `close_acceptance` · `close_slug` · `close_status` · `close_review` · `close_graph_delta` · `close_kpi` · `close_experience` · `close_wiki_delta` · `close_wiki_promotion`

| 新关注点 | 新闸 / 机制 | 不重复的理由 |
|----------|-------------|--------------|
| PR 合入 | **`close_pr_merged`**（新） | 既有闸不看 git/gh |
| Hub 行 | **`close_hub_index`**（新 · 条件启用）或 close 后 lint | 异于 wiki_delta / invoke |
| 文案语义 | 改输出字符串 + prompts（非新闸） | 不新增同义验收闸 |
| active 堆积 | 健康度 / 可选 `task lint-stale-active`（后期） | 异于单次 close |

**求值顺序建议**：既有十一项保持；其后插入 `close_pr_merged`；再 `close_hub_index`（若实现）。

---

## 4. 豁免旗与何时允许

| 旗 | 豁免对象 | 允许场景 | 留痕 |
|----|----------|----------|------|
| `--allow-no-pr-merge` | `close_pr_merged` | docs-only / 无代码变更；紧急 hotfix 且维护者明示；本地实验仓无 remote | CLI trace + 建议 task 元信息 `close_pr_policy: exempt` + note |
| `--allow-no-hub`（名可微调） | `close_hub_index` | 仓未启用 Hub；或 Hub 文件不存在（闸应 **skip** 而非 fail）；迁移中 | trace |
| 既有 `--allow-*` | 对应旧闸 | 不变 | 不变 |

**元信息草案**（task 表，可选）：

| 字段 | 值例 |
|------|------|
| `related_pr` | `https://github.com/org/repo/pull/N` 或 `#N` |
| `close_pr_policy` | `required`（默认）/ `exempt` |
| `close_pr_exempt_note` | 一行理由（exempt 时必填） |

---

## 5. PR MERGED 探测（契约级）

**已拍板**：允许自动关联当前分支。

**输入优先级**（实现须按序）：

1. task 元信息 `related_pr`（若有）  
2. **当前分支**关联 PR：`gh pr view --json state,url`（无 `related_pr` 时）  
3. 显式 `--pr <url|number>`（覆盖/补全）

**通过**：`state == MERGED`（或 git 等价 merge/squash 口径 · 须单测钉死）。

**失败**：OPEN / CLOSED(unmerged) / 无法解析且非豁免 → `CLOSE: BLOCKED · close_pr_merged`。

**非目标**：kit 调用 `gh pr merge`。

---

## 6. Hub 是什么 · Hub 闸做什么 · 两种启用方案

### 6.1 Hub 本身（文档导航，不是业务功能）

Hub = `docs/tasks/done/README.md`（或域分包后的总索引）：**人只打开这一页**就能按域找到已关账 task。  
模板 checklist（`TASK_done_README.md`）要求关账时：

1. 文件从 `active/` 挪到 `done/<domain>/`  
2. 在 Hub **对应域表追加一行**（日期 · 链接 · 摘要）  
3. 可选同步 `_views/done_by_domain.md`

**今天的缺口**：`task close --yes` 只做文件 mv，**不会**改 Hub → 常出现「done/ 里有文件，但 Hub 没有索引行」→ 可发现性腐烂。

### 6.2 Hub 闸（`close_hub_index`）功能（拟）

在 CLOSE 时机械检查：

| 检查 | 通过条件 | 失败时 |
|------|----------|--------|
| 目标路径可解析 | 归档后相对路径可知（如 `docs/tasks/done/harness/task_foo.md`） | BLOCKED |
| Hub 文件存在且启用策略命中 | 见 §6.3（已拍板） | skip / BLOCKED / 仓级关闭 |
| 索引行存在 | Hub（或约定视图）正文中出现指向该 task 文件的 markdown 链接（或稳定 slug 锚） | `CLOSE: BLOCKED · close_hub_index` |
| 豁免 | `--allow-no-hub` 或元信息 exempt + note | 留痕后放行 |

**闸做什么 / 不做什么**：

- **做**：挡「文件已进 done/ 但导航页没登记」；逼 CLOSE 棒补 Hub 行（人或 Agent 先改 Hub 再 close，或 close 前同 diff）。  
- **不做**：不自动替你改写 Hub（首版建议只检不写，避免误改大表）；不替代 `close_wiki_*`；不要求每个仓都建 Hub。

### 6.3 启用策略（已拍板 · 2026-08-26）

**决议**：**方案 A（检测即启用）为行为默认** + **仓级 manifest/local 可关**；**仓级默认开启**。

#### 求值逻辑（实现须钉死）

```text
1. 读仓级开关 close_hub_gate（见下键名草案）
   - 缺省 / true  → 闸逻辑开启（进入 2）
   - false       → 整仓 skip close_hub_index（stdout 可留痕 hub_gate=off）
2. 探测约定 Hub 文件是否存在
   - 不存在 → skip（未启用 Hub，不适用）
   - 存在   → 要求索引行；缺行 → BLOCKED（除非 --allow-no-hub）
```

#### 仓级键名草案（实现 task 钉一处，勿多源）

| 位置（优先级高→低） | 键 | 值 |
|---------------------|-----|-----|
| `.cyning-harness/local.json` | `close_hub_gate` | `true` \| `false` |
| 或未来 `profile.json` / manifest 扩展 | 同上 | 同上 |

- **缺省 = `true`（默认开）**  
- 试点仓 **ops-desk-api** 已有 Hub → 保持默认开，无需先写键；若验证期要临时关闭：local.json 设 `close_hub_gate: false` 并记 FEEDBACK。

#### 与方案 B 的关系

方案 B（每 task `hub_required`）**本包不采用**为默认；若日后需要更细粒度，另开修订，不阻塞 W3。

#### 对照表（归档用）

| | A + manifest 可关（**采用**） | 纯 B opt-in（弃为默认） |
|--|------------------------------|-------------------------|
| 有 Hub、无行 | BLOCKED（仓级未关时） | 仅 hub_required 的 task |
| 仓级默认 | **开** | 关（靠填字段） |
| 误伤逃生 | `--allow-no-hub` 或 `close_hub_gate: false` | 不填字段 |

---

## 7. 实现落点文件清单（kit 路径草案）

| 路径 | 变更意图 |
|------|----------|
| `assets/harness/lifecycle.yaml` | 登记 `close_pr_merged` / `close_hub_index` + allow_flag + 注释澄清 done→archived vs 物理 done/ |
| `src/cli-checks.ts` | `evalClosePrMerged` · `evalCloseHubIndex`；接入 `evalCloseGuard` |
| `src/cli.ts` | `CLOSE_GUARD_ORDER`；dry-run 文案；`--allow-no-pr-merge` / `--allow-no-hub`；help 文 |
| `src/cli-lifecycle.ts` | dry-run 透传新 allow 旗 |
| `assets/harness/prompts/30-execute-code.md` | 归档与 CLOSE 同棒；禁止拆「验收 CLOSE / 归档另议」 |
| `assets/harness/prompts/40-self-check.md` | 交 CLOSE 前自检含合入/归档预期 |
| `assets/harness/prompts/README.md` | DAG 注释：CLOSE = 完成态 DoD |
| `assets/harness/invokes/TEMPLATE_invoke.md` | close 纪律一行 |
| `assets/harness/templates/TASK_done_README.md` | checklist 与闸对齐说明 |
| `assets/harness/templates/TASK_TEMPLATE.md` | 可选 `related_pr` / `close_pr_policy` 字段 |
| `CHANGELOG.md` / `README.zh-CN.md` | 发版说明 · dry-run 用词迁移 |
| `test/cli-task-close-guards.test.ts`（或新文件） | 新闸钉死 |

---

## 8. 验收 · 单测 / dry-run 用例名草案

| 用例名（草案） | 断言要点 |
|----------------|----------|
| `close_pr_merged blocks when pr open` | OPEN → BLOCKED；无豁免 |
| `close_pr_merged passes when merged` | MERGED fixture → 过 |
| `close_pr_merged allow-no-pr-merge leaves trace` | 豁免留痕且可 `--yes` mv |
| `close_pr_merged docs-only exempt via meta` | `close_pr_policy=exempt` + note |
| `close_dry_run prints READY not PASS` | 无 `--yes` 时输出不含完成态 PASS（或明确 DRY-RUN） |
| `close_yes prints PASS and moves file` | `--yes` 后源不在 active、目标在 done |
| `close_hub_index skips when no hub` | 无 Hub 文件 → skip |
| `close_hub_index blocks when hub missing row` | 有 Hub 无行 → BLOCKED |
| `close_hub_index allow-no-hub` | 豁免留痕 |
| `lifecycle dry-run close includes new guards` | 与 task close 同口径 |

---

## 9. failure_paths（C1）

| ID | 触发 | 行为 | 可重试 |
|----|------|------|--------|
| F-C1-01 | PR 未合入且无豁免 | `CLOSE: BLOCKED · close_pr_merged` | 是 |
| F-C1-02 | dry-run 被当成已归档 | W1 文案修复；过程上须再跑 `--yes` | 是 |
| F-C1-03 | Hub 漏行 | BLOCKED 或健康度 lint 报 orphan | 是 |
| F-C1-04 | 无网络 / 无 `gh` | 显式失败信息 + 允许 `--allow-no-pr-merge` 或离线 fixture 策略（实现 task 钉） | 是 |
| F-C1-05 | 二次 close 已在 done/ | 保持现有拒绝行为 | 否（除非 `--target` 合法场景） |

---

## 10. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | C1 初稿 · DoD / 叠加 / 豁免 / 落点 / 测名 |
| 2026-08-26 | 拍板：dry-run=`READY` 无旧兼容；PR 允许 `gh` 关联当前分支；Hub §6 扩写 A/B |
| 2026-08-26 | Hub 拍板：A + manifest 可关 · 默认开；试点 ops-desk-api |
