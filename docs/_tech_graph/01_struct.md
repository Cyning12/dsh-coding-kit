# 01 · L1 模块边界表

> **锚版本**：`dsh-coding-kit@1.9.0`（`package.json`）  
> **实读日**：2026-08-28  
> **真值源**：本仓 `src/*.ts`（17 文件 · 按下表基名全覆盖）  
> **人闸**：`HG-GRAPH-MODULES` 待 00 签（本表为签收物 · 不挡本波文档 30）  
> **外置 inventory**：工作区 `docs/dsh_coding_kit_optimization/00_inventory/architecture.md`（锚 1.2.2 · mtime 2026-08-22）**仅 R0 参考，非真值** —— 禁止照抄其分层句；列值均来自 1.9.0 import/export/调用实读。  
> **非本波**：不写 `.graph.yaml`（W2 起）；本目录可仅此一文。

---

## 1. 模块边界表

口径：**读 / 写** 只列本文件直接 `fs` / `spawn` 触及的路径（或明确委托的写入口）；不编造不存在的写盘。**被谁调** 以 `src/` 静态 `import` 为准；动态 `import()` 另行标注。

| 模块 | 职责 | 读 | 写 | 被谁调 |
|------|------|----|----|--------|
| `cli.ts` | CLI 入口 `runCli`：分发全部子命令；本文件实现 P0：`init` / `upgrade` / `check`（含 DEF-028/030 跨产品线文案）/ `verify`（`--task`/`--spec`/`--with-wiki-lint`）/ `gate-check` / `audit` / `task lint`（含 E8）/ `task close`（守卫链 + `--json` + done 快照） | 包根 `package.json`（版本）；目标仓 `.cyning-harness/manifest.json`；task md；经 `cli-checks` 读 reviews / invokes / 测试制品 / `docs/spec/SPEC-*.md` | `init`/`upgrade` → `.cyning-harness/manifest.json`；`task close --yes` → `docs/tasks/*/active/*.md` `renameSync` 至同层 `done/` | `bin/dsh-coding-kit.js` → `lib/cli.js` `runCli`（无其他 `src/` 静态 import） |
| `index.ts` | DSH 插件面：`apply(ctx)` 注册 `apply_coding_standards` / `init_coding_kit`（与 CLI 零耦合） | 包内 `assets/standards` + `assets/coding_wiki`；cwd 向上探测 `.coding-kit` / `.dsh/coding-kit` override；legacy hint 探测 `.cyning-harness` 与 `docs/harness` | `init_coding_kit`：`copyFile` 到 cwd `.coding-kit` 或 `.dsh/coding-kit`（no-clobber；跳过 S2 前缀 `docs/tasks` / `reviews` / `invokes/by-task`）。`apply_coding_standards` persist 只注册 `systemPrompt.context`，**不写盘** | DSH 宿主（cordis bundle patch）；`src/` 内无调用 |
| `cli-shared.ts` | 共享原语：`CliError`/`fail`/`takeOption`/`resolveTarget`/`packageRoot`；Harness 元信息与人工闸解析；slug；`buildDoneSnapshot` / `canonicalHarnessMetaSection`；`findWikiDeltaOutsideMetaSection` | 调用方传入的 md 文本；`readTextIfExists` 可读任意路径；`packageRoot()` 定位包根 | **无 fs 写**（快照只读归档文件后拼 stdout） | `cli.ts` 及除 `index.ts` / `yaml.ts` / `cli-graph-yaml.ts` 外的全部 `cli-*.ts` |
| `cli-checks.ts` | verify / close / lifecycle 共用守卫实现源（1.4.0 从 `cli.ts` 拆出）：pre-30 invoke hats、`findReview`/`findSpecReview`、`lintTaskFile`、`runTestCheck`、`evalCloseGuard` 全家、`listBareSpecFiles`、`evalSpecReviewsRetention` | task md；`docs/harness/reviews` + `reviews/`；`docs/harness/invokes/by-task` + `invokes/by-task`；测试/CI 制品（D5）；`docs/spec/SPEC-*.md`；done Hub README；`.cyning-harness/local.json`（`close_hub_gate`）；`spawnSync('gh', ['pr','view',…])` | **无 fs 写** | `cli.ts`、`cli-lifecycle.ts`、`cli-status.ts`（自身 import `cli-task-extra` 的 wiki_delta 词表） |
| `cli-task-extra.ts` | `task lint-done` / `lint-wiki-delta`（含 `wiki_delta_wrong_section`）/ `task check`（`.harness.json` sidecar schema + `depends_on` 环检测） | 四路径 task 树：`docs/tasks/{active,done}` + `docs/harness/tasks/{active,done}`；invoke 目录；`*.harness.json` sidecar；wiki_delta 指向的仓内路径（`--strict`） | **无 fs 写** | `cli.ts`（`cmdTask*`）；`cli-checks.ts`（`WIKI_DELTA_LITERALS` / `WIKI_DELTA_PATHISH_RE`）；`cli.ts` `verify --with-wiki-lint` 复用导出的 `lintWikiDeltaMissing` |
| `cli-lifecycle.ts` | `lifecycle show` / `lifecycle dry-run`；`discipline show`。dry-run 守卫 adapter 复用 `cli-checks`（与 verify / close 同口径） | 包内 `assets/harness/lifecycle.yaml`、`assets/harness/discipline-coverage.yaml`；dry-run `--task` 时读 task md（经 checks） | **无 fs 写** | `cli.ts`（`cmd === 'lifecycle' \| 'discipline'`） |
| `cli-graph.ts` | `graph` 子命令路由：`yaml compile\|check\|export` 委托 `cli-graph-yaml`；`ingest` / `snapshot` / `axioms` 委托 `cli-graph-hgm` | 无直接 fs（路径解析后交给下游） | 无直接 fs（写发生在被调模块） | `cli.ts` |
| `cli-graph-yaml.ts` | Inform Graph YAML：校验、`compile`（yaml→md+Mermaid）、`export`（`graph.json`）、`check`（yaml 切片 vs json）。DEF-023 emit；DEF-031/032/033 export/check/class | `--input` 或默认 `docs/_tech_graph/**/*.graph.yaml`；`shared/graph.json`（check） | `compile` → 同 id 的 `.md`（或 `--output`）；`export` → `docs/_tech_graph/shared/graph.json`（或 `--out`） | `cli-graph.ts` |
| `cli-graph-hgm.ts` | HGM：事件 JSONL 追加、ingest 幂等、snapshot 重放、axioms。active task 扫描双路径（DEF-022 已与 status 对齐） | `.cyning-harness/manifest.json`；`.cyning-harness/events/*.jsonl`；`docs/tasks/active` + `docs/harness/tasks/active` | `appendEvent` → `.cyning-harness/events/YYYY-MM.jsonl`；`writeSnapshot` → `.cyning-harness/graph/snapshot.json` | `cli-graph.ts`、`cli-status.ts`、`cli-timeline.ts` |
| `cli-skills.ts` | `skills build` / `check` / `install`：prompt frontmatter 校验、生成物 drift 闸、no-clobber 复制；R-05 拒写包内 `assets/skills` | 包内 `assets/harness/prompts`、`assets/skills`（`DSH_CK_SKILLS_SRC` 测试钩可改源） | `build`：清空并重写包内 `assets/skills/**`；`install`：复制到 `.dsh/skills` 或 `--out`/`--global`（拒写 `.coding-kit` / S2 / 包内 `assets/skills`） | `cli.ts` |
| `cli-sync.ts` | `sync` 路由：`sync index` 生 invoke 索引；`sync prompts` 转交 `cli-sync-prompts` | `docs/harness/invokes/by-task/**`；`docs/tasks/{active,done}/task_*.md`（entry_invoke_*） | `sync index` → `.cyning-harness/invoke_index.json` | `cli.ts` |
| `cli-sync-prompts.ts` | `sync prompts`：Starter 9 prompts + `TASK_TEMPLATE.md` SHA-256 三分（skip/add/conflict）；默认 dry-run | 包内 `assets/harness/prompts/*`、`assets/harness/templates/TASK_TEMPLATE.md`；目标仓对应 `docs/harness/prompts/` 与 `templates/`；前置读 `.cyning-harness/manifest.json`（须已 init） | `--yes`：写入 add 项；`--force` 覆盖 conflict → 目标仓 `docs/harness/prompts/`、`docs/harness/templates/` | `cli-sync.ts`（`cmdSyncPrompts`） |
| `cli-wiki.ts` | `wiki export --json`：扫描 coding_wiki，wikilink + 相对 md 链 → `harness.wiki_graph.v1` | 默认 `docs/coding_wiki/**/*.md` | 默认 stdout；`--out FILE` 时写该路径 | `cli.ts` |
| `cli-status.ts` | `status`：active task 列表或单 task 闸/审查/HGM 投影（`--check` ≠ 正式 verify）；`cmdTimeline` 为 CLI 壳 | `docs/tasks/active` + `docs/harness/tasks/active`；task md；invokes；经 `findReview` / `summarizeTaskHgm` | **无 fs 写** | `cli.ts` |
| `cli-timeline.ts` | `buildTaskTimeline` / `formatTimelineHuman`：按 slug 滤 HGM 事件（升序） | task md；`.cyning-harness/events/*.jsonl`（`loadEvents`） | 本文件无直接 fs 写；`--ingest` 时调用 `ingestRepoIdempotent` → 写 events JSONL（见 `cli-graph-hgm`） | **动态** `import('./cli-timeline.ts')` 自 `cli-status.ts` `cmdTimeline`（无静态 import） |
| `cli-refresh-ide-blocks.ts` | `refresh-ide-blocks`：刷写 IDE marker 块内旧 `@cyning/harness` 字面（A 组改写 / B 组仅报告）；DEF-029 `plain_mentions`；`countStaleIdeLiterals` 供 upgrade 只读提示 | 发现面：`AGENTS.md`、`CLAUDE.md`、`.cursor/rules/*.mdc`；`git status --porcelain` | `--yes`：原子写发现面内**有 product marker** 的文件；备份 `.cyning-harness/backups/refresh-ide-blocks/<UTC>/`（保留 5 代）。无 marker 文件**只报告不写** | `cli.ts`（命令 + `upgrade` 调 `countStaleIdeLiterals`） |
| `yaml.ts` | `createRequire` 包一层 `js-yaml`：`yamlLoad` / `yamlDump`（唯一运行时 YAML 依赖） | 无直接 fs（调用方读文件后传入字符串） | **无 fs 写** | `cli-graph-yaml.ts`、`cli-lifecycle.ts`、`cli-skills.ts` |

---

## 2. 相对 1.2.2 inventory 的增量 / 拆分

外置 `architecture.md` 锚 **1.2.2**，称 `src/` **13** 个 CLI 侧 `.ts`（`cli.ts` + 12 个委托模块，含 `yaml.ts`），插件面 `index.ts` 另列。当时 **没有** 下列三文件（本波 1.9.0 实勘 **17** = 原 13 CLI + `index.ts` + 下列 3 个新增/拆分）。

| 模块 | 相对 1.2.2 | 引入版本（CHANGELOG） | 说明 |
|------|------------|----------------------|------|
| `cli-checks.ts` | **拆分新增** | 1.4.0 | `findReview` / `runTestCheck` / `lintTaskFile` 及后续 close/spec 守卫从 `cli.ts` 收敛为单一实现源；非新命令面 |
| `cli-refresh-ide-blocks.ts` | **新增命令模块** | 1.5.0 | R-07 epic：`refresh-ide-blocks`；1.5.2 DEF-029 增 `plain_mentions` |
| `cli-sync-prompts.ts` | **新增命令模块** | 1.9.0 | `sync prompts`（1.7.1/1.8.0 文档承诺补齐）；由 `cli-sync.ts` 路由，不由 `runCli` 直调 |

既有模块在 1.2.2→1.9.0 的行为增量（**不**另起文件，列于此以免照抄旧 inventory 职责句）：

- `cli.ts`：`verify --spec` 真闸（1.6.0）；`--with-wiki-lint` / close `--json`+done 快照 / lint E8（1.8.0）；check 跨产品线文案 DEF-028（1.5.2）→ DEF-030 收窄（1.6.1）；upgrade 提示 `sync prompts`（1.9.0）。
- `cli-shared.ts`：`findWikiDeltaOutsideMetaSection`、`buildDoneSnapshot`（1.8.0）。
- `cli-graph-yaml.ts`：Mermaid emit DEF-023（1.2.3）；export label/graph_id/class DEF-031~033（1.6.1）。
- `cli-graph-hgm.ts`：ingest 双路径 DEF-022（1.4.0 周期后）。
- `cli-task-extra.ts`：`wiki_delta_wrong_section`（1.8.0）。
- `cli-sync.ts`：1.2.2 仅 `sync index`；1.9.0 增加 `prompts` 分支。
- `cli-status.ts`：`cmdTimeline` 仍为入口，实现对 `cli-timeline.ts` 改为 **动态 import**（1.2.2 inventory 写「委托」——静态关系以本表为准）。

---

## 3. 调用向（1.9.0 实读）

入口两面互不 import：

- **CLI**：`bin/dsh-coding-kit.js` → `cli.ts` `runCli` → 上表各 `cmd*`。
- **插件**：宿主 → `index.ts` `apply`。

`cli-shared.ts` 为 CLI 共享底；`yaml.ts` 仅被 yaml/lifecycle/skills 三处加载。`cli-timeline.ts` 仅被 `cli-status.ts` 动态加载。`cli-graph-yaml.ts` 不依赖 `cli-shared`（自管路径与错误类型）。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-28 | W1 初稿：按 1.9.0 `src/*.ts` 17 文件实读成表；相对 1.2.2 inventory 点名三增量模块 |
