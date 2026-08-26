# Changelog

本项目所有显著变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

## [1.7.0] - 2026-08-26

> 主题：**doc-health · CLOSE 强绑定** —— dry-run/`PASS` 语义拆分；新增 `close_pr_merged` / `close_hub_index`；`check` 对 `docs/spec` 根级裸 SPEC WARN。试点消费者：ops-desk-api。
>
> **消费者提示（置顶）**：
>
> - **`task close` dry-run 不再打印 `CLOSE: PASS`**：无 `--yes` 时输出 **`CLOSE: READY`**；仅 `--yes` 归档成功后为 `CLOSE: PASS`（破坏性文案变更 · **不兼容**旧脚本若只匹配 PASS）。
> - **新闸 `close_pr_merged`**：默认要求关联 PR `MERGED`（`related_pr` → `gh pr view` 当前分支）；豁免：`--allow-no-pr-merge` 或 `close_pr_policy=exempt` + note。
> - **新闸 `close_hub_index`**：若存在 `docs/tasks/done/README.md`（或 harness 对称路径）则要求 Hub 含归档文件名；仓级 `.cyning-harness/local.json` `close_hub_gate: false` 可关（**缺省开**）；`--allow-no-hub` 豁免。
> - **`check`**：对 `docs/spec/SPEC-*.md` 根级裸文件打印 WARN（不挡 exit）。

### Added

- `close_pr_merged` / `close_hub_index`（lifecycle.yaml 登记 · `evalCloseGuard` · dry-run 同口径）
- `docs/spec/doc-health/` SPEC 包（签收）与试点 FEEDBACK 约定
- task 元信息草案字段：`related_pr` / `close_pr_policy` / `close_pr_exempt_note`
- 测试钩：`DSH_CLOSE_PR_STATE=MERGED|OPEN|…`（单测旁路 gh）

### Changed

- dry-run 完成态用词：`CLOSE: READY`（见上）
- prompts / TEMPLATE_invoke / TASK_done_README Hub checklist 与闸对齐

### Docs

- SPEC 布局公约：新长期 SPEC 须专属夹；历史裸文件 warn（索引表 + CLI）

## [1.6.1] - 2026-08-25

> 主题：**graph 面行为修正 · 判据收窄** —— DEF-030~033（ops-desk-api 1.5.2 实战反馈 D1/D2/D3/R6/K7）：export 保留全部 mark 边 label、graph_id 统一以 yaml 声明值为真值源（export 与 check 互认）、Mermaid class 段消费 nodes[].kind、check 跨产品线迁移判据收窄至旧包 2.x 词表。exit 码不变。
>
> **消费者提示（置顶）**：export 输出的 graph_id（`l0/00_main` → `00_main`，命名空间 → 声明值）与边 label（空 → 保留）属**修正性变更**；依赖旧 export 输出的消费方需重跑 `npx dsh-coding-kit graph yaml export`；exit 码与写盘路径不变。

### Fixed

- **DEF-030 · check 跨产品线判据收窄**（反馈 K7）：1.5.2 DEF-028 接线以 `from_version != null` 判跨产品线过宽——`from_version` 已是 kit 线版本（如 1.5.1）时，任何「manifest 高于包版本」场景都误走迁移文案。现仅当 `from_version` 属旧包产品线词表（2.x 系列，`@cyning/harness` 版本形态）时输出迁移文案；kit 线（1.x）`from_version` 回落原「manifest 版本高于包版本（可能为降级安装）」语义。exit 码不变（恒 0）。
- **DEF-031 · graph yaml export 保留边 label**（反馈 D1）：`edgeToGraphV2` 对 mark=`?>` / `~>` / `::…` / `[…]` 不再强制清空 label——拓扑协议标记作为边属性（mark/type）呈现，label 文本全量保留；`->` 与未知 mark 行为不变。
- **DEF-032 · export graph_id 声明值 + check 对齐**（反馈 D2/D3）：① export（`buildGraphPayload`）优先消费 yaml `data.graph_id` 声明值（如 `00_main`）写 graphs/nodes/edges，不再用路径命名空间 id（如 `l0/00_main`）；② `check --all` 的 graph.json 切片过滤口径与 export 输出对齐（同一声明值真值源），kit 自产根 json 与 check 互认；③ `validateGraphYaml` 禁 `/` 与路径 id 的自相矛盾按实现口径消解——声明值为唯一真值源（裸 slug），路径 id 仅作输入兼容定位（`allGraphIds` / `--graph-id`）。
- **DEF-033 · generateMermaid class 按 nodes[].kind**（反馈 R6）：class 段不再硬编码 id 白名单，改消费 `nodes[].kind`（`flow`/`struct`/`external` → `phase`/`doc`/`infra`，与 `generateNodeTable` 的 kind 读取同源）；无 `kind`（或未知 kind）时保留 id 推断作兜底（历史行为，仅供未标注 kind 的旧 yaml）。

### 消费者提示

- export 输出 id/label 变化属修正性变更：依赖旧输出（命名空间 graph_id / 空 label）的消费方需重跑 `graph yaml export`；exit 码与写盘路径不变。

## [1.6.0] - 2026-08-25

> 主题：**零未接线 · 制度固化** —— 消灭最后一个「明示未交付」命令面与最后一个未接线守卫：`verify --spec` 从 notDelivered（exit 1）改为 SPEC 审查文存在性真闸；`close_wiki_promotion` 接线后未接线残留清零；lifecycle dry-run `to_00` 的 `spec_reviews_retention` 守卫同步接线（PRD_DEF-003 后续棒）；RELEASING.md 把发版固化为九步硬 checklist（DEF-001 T5 制度化）。
>
> **消费者提示（置顶）**：
>
> - **`verify --spec` 从「本包未交付」变真闸**：缺审查文的 SPEC 现在 **BLOCKED exit 2**（此前调用方只会得到 notDelivered exit 1 提示）。使用中的消费者需注意新拦截面；过渡期可用 `--allow-no-spec-review`（或别名 `--allow-no-review`）豁免（真豁免留痕，不免除补审义务）。
> - **`task close` 新增 `close_wiki_promotion` 求值**：`experience_capture=required` 且 `wiki_delta=path` 的 task，经验节缺晋升指针将从 PASS 变 **BLOCKED exit 2**；与 `wiki_delta` 同享 `--allow-wiki-gap` 过渡豁免（真豁免留痕）。
> - **`invoke_retention_profile=full` 帽集合收窄**为旧包口径 `10,20,30,40,00,CLOSE`（去 22/50）：行为**放宽**，不破坏已齐套 task，此前因缺 22/50 被 BLOCKED 的 task 现在可通过。

### Added

- **`verify --spec FILE` 真闸**（SPEC→00 前查审查文存在性 · 语义映射旧包 @cyning/harness@2.24.0 `verifySpecTarget`/`findSpecReview`/`shouldSkipSpecAudit`）：仅查审查文存在性，不跑 gate-check / D5 / lint（与 --task 模式分离）；审查文扫描 `docs/harness/reviews` 与 `reviews/` 双路径（与 findReview 布局一致），命名兼容 `spec_<slug>_audit_R<n>_*`（推荐）/ `spec_<slug>_ACCEPT_R<n>_*` / `task_<slug>_spec_ACCEPT_R<n>_*`；slug 取元信息 `spec_slug`，回退文件名去 `SPEC[-_]` 前缀与 `_v<n>` 后缀。缺失 → `VERIFY: BLOCKED · missing spec R<n> review` exit 2；`--allow-no-spec-review`（canonical · lifecycle.yaml 登记）与 `--allow-no-review`（别名）真豁免留痕（文本 + JSON `waived[]`，与 T4 口径一致）；`bugfix` / `skip_spec_audit` 元信息豁免 → PASS。`--task` 与 `--spec` 互斥（exit 1）；`--spec` 文件不存在 → exit 1（用法错误）。
- **lifecycle dry-run `to_00` `spec_reviews_retention` 真求值**：--task 在该转移下携带待签收 SPEC 路径（与 verify --spec 同一实现源 src/cli-checks.ts `evalSpecReviewsRetention`）；缺审查文 → fail 挡（blocked exit 2），`--allow-no-spec-review` 转 warn 留痕；未接线残留仅 `close_wiki_promotion`（本波已接线 · 见 Changed 节首条）。
- **RELEASING.md 发版 checklist（DEF-001 T5 制度化）**：仓根新增 `RELEASING.md`，把「publish 前 commit + tag」写为九步硬 checklist —— ① 工作树干净且全部已提交（**禁止从未提交工作树 publish** · DEF-001 教训）② typecheck/test/build/test:lib 四门全绿 ③ CHANGELOG 版本节归拢（日期+版本号）④ 版本钉 pins 同步（README 双文件/测试/ontology/discipline-coverage）⑤ npm version + tag ⑥ PR 合并 + CI 绿（未绿禁合）⑦ `npm pack --dry-run` 核对（无 test/ 泄漏 · files 白名单）⑧ `npm publish`（仅人）⑨ publish 后 `npm view` 核验 + 过程档状态更新。README en/zh-CN 各加一行链接；`test/docs-releasing.test.ts` 钉死九步存在性/顺序/禁令。

### Changed（行为变更 · 升级必读）

- **task close `close_wiki_promotion` 真闸接线**（最后一个未接线守卫 · PRD_DEF-003 后续棒 · 语义映射旧包 @cyning/harness@2.24.0 `evaluateWikiPromotionPointer`）：`experience_capture=required` 且 `wiki_delta=path` 时，`### 经验总结` 节须含晋升指针（`coding_wiki` / `wiki_promoted:` / `Wiki:` / 与 `wiki_delta` 相同子串），缺 → `CLOSE: BLOCKED` 点名守卫 id（exit 2）；豁免与 `wiki_delta` 共用 `--allow-wiki-gap`（真豁免留痕 · 旧包同口径降旗面）。跳过口径与旧包逐字对齐：未声明 `experience_capture` / ≠required / 无 `wiki_delta`（缺字段由 `close_wiki_delta` 挡）/ `wiki_delta=none|n/a` → 不闸。`lifecycle dry-run` 同口径真求值（src/cli-checks.ts `evalCloseWikiPromotion` 单一实现源 · `evalCloseGuard` 登记）；lifecycle.yaml / 30-execute-code / discipline-coverage「未接线」标注同步转「已接线」，**未接线残留清零**（dry-run `unevaluated_count: 0`）。与旧包差异：经验节标题沿用本包既有约定 `### 经验总结`（同 evalCloseExperience 抽取口径；旧包额外兼容 Experience/经验/lessons 标题）。
- **`invoke_retention_profile=full` 帽集合修正（与旧包 2.24.0 口径校对）**：旧包 `INVOKE_RETENTION_PROFILES.full=['00','10','20','30','40','CLOSE']`（lib/task-meta.js · CHANGELOG v2.12 · USER_GUIDE 三处同源）；本包 1.4.0 Wave B 曾解释性定义为 `10,20,22,30,40,50,00,CLOSE`（多列 22/50），经校对**不一致**，已按旧包口径修正为 `10,20,30,40,00,CLOSE`。影响面：`profile=full` 的 task close / verify pre-30 不再要求 22/50 invoke 快照（**放宽**，此前因缺 22/50 被 BLOCKED 的 task 现在可通过；required 集合收窄不破坏已齐套 task）。22/50 仍是合法 hat token（显式 `required_invoke_hats` 与合并文件名照计）。
- `verify --spec` 不再是「本包未交付」exit 1：缺审查文的 SPEC 现在 **BLOCKED exit 2**（此前调用方只会得到未交付提示）。过渡期可用 `--allow-no-spec-review` 豁免（留痕，不免除补审义务）。
- 与旧包差异：① 目录布局与本包 findReview 同口径扫双路径（旧包仅 `docs/harness/reviews`）；② 旧包 `--workspace-root` 双仓根旗标本包不支持（DEF-011 fail-fast 清单既有钉死）。
- **「明示未接线 / 未交付」清单归零**：`close_wiki_promotion`（最后一个未接线守卫）与 `verify --spec`（最后一个 notDelivered 命令面）本波全部接线交付，发布物不再含任何「明示未接线 / 未交付」项；lifecycle dry-run `unevaluated_count: 0`。

## [1.5.2] - 2026-08-24

> 主题：**提示面改善 · 迁移语义与只读报告** —— DEF-028：`check` 对跨产品线迁移输出迁移语义与 upgrade 建议，不再误报降级；DEF-029：`refresh-ide-blocks` 对发现面内无 marker 文件做旧字面只读扫描并仅报告（`plain_mentions`）；README 补强 K2/K5。纯提示面改善，exit 码不变。

### Fixed

- **DEF-028 · `check` 跨产品线迁移提示**（反馈 K1）：`manifest.version` 高于包版本且 `manifest.from_version` 非 null（从旧 `@cyning/harness` 产品线迁来）时，输出「跨产品线迁移：`@cyning/harness X → dsh-coding-kit Y`（跨产品线版本号不可比）」并建议 `npx dsh-coding-kit upgrade --yes`，不再误报「可能为降级安装」；`from_version` 为 null 时保持原三向判定文案。exit 码不变（恒 0）。
- **DEF-029 · `refresh-ide-blocks` 无 marker 文件仅报告**（反馈 K4）：发现面（`AGENTS.md` / `CLAUDE.md` / `.cursor/rules/*.mdc`）内 0 product 块文件现用 A/B 组同一组正则做**只读扫描**（A4 防二刷同适用），命中入报告——人类表新增「无 marker 检出（仅报告，不刷写）」段，`--json` 新增 top-level `plain_mentions: [{path, rule, count}]` 与 `totals.plain_mentions`（schema 保持 `dsh-coding-kit/refresh-ide-blocks-report@1`，向后兼容增量）。**绝不改写**这些文件（写盘路径结构上不含它们），dry-run 与 `--yes` 均报告，exit 码与 preflight fail-fast 语义不变。

### Docs

- **README 双语补强**（反馈 K2/K5）：`refresh-ide-blocks` 节注明 preflight 脏树判定为 `git status --porcelain` 语义（untracked 文件计入，`--yes` 前请先 commit 或 `git stash -u`）；备份节建议消费者将 `.cyning-harness/backups/` 加入 `.gitignore`（备份为本机回滚用，不入库）。

### 消费者提示

- 无强制动作：DEF-028 / DEF-029 均为提示面改善，exit 码与写盘语义不变；`--json` 消费者可忽略新增 `plain_mentions` 字段（向后兼容增量）。

## [1.5.1] - 2026-08-24

> 主题：**文档交付入包** —— 默认 README 英文化（中文原版保留为 README.zh-CN.md）+ docs/releases/ 四版连发成效系列档（英文 6 篇）。纯文档发布，无任何代码与行为变更，消费者无需动作。

### Changed

- **默认 README 改为全英文**（PR #9）：README.md 现为英文版；原中文版完整保留为 README.zh-CN.md，两文件顶部互置语言切换链接；GitHub topics 节按仓库实际 topics 修正；两个 README 均随 npm 包发布。
- 无行为变更：CLI / 插件 / 闸语义与 1.5.0 完全一致，升级无需任何消费者动作。

### Added

- **docs/releases/ 四版连发成效系列档**（PR #10，英文 6 篇）：系列索引（README）+ 执行总览（01 executive summary）、升级前后对比（02 before/after）、缺陷与债台账（03 defects & debt ledger）、工程方法（04 engineering method）、消费者升级指南（05 upgrade guide）。

## [1.5.0] - 2026-08-24

> 主题：**存量 IDE 块刷写 + D5 硬化** —— R-07 落地 `refresh-ide-blocks` 子命令（dry-run 默认 / `--yes` 写盘 / 幂等 / 备份 5 代）；D5 测试制品探测 WARN 过渡兑现 1.3.0 承诺硬化为 FAIL（exit 2）。

### Changed（行为变更 · 升级必读）

> **消费者迁移提示（置顶）**：存量消费者仓 IDE marker 块（`<!-- cyning-harness:begin/end -->`）内若滞留旧 `npx @cyning/harness` 命令字面，可执行 `npx dsh-coding-kit refresh-ide-blocks`（默认 **dry-run 零写入**）一键查看差异，确认后加 `--yes` 刷写（A1–A4 自动映射；写盘前自动备份、保留 5 代；幂等可重跑）。

- **D5 WARN 过渡硬化为 FAIL**（DEF-014 过渡结束，兑现 1.3.0 承诺）：`test_strategy=required` 时仅命中旧启发式（pyproject.toml / setup.py / 无 test 步骤的 workflow）的仓，verify / audit 由 WARN exit 0 改为 **FAIL exit 2**；旧启发式探测代码（`hasTestArtifactsLegacy`）删除。**迁移**：补真实测试制品（`tests/` / `*_test.py` / `*.test.ts` / 含 test 步骤的 CI）即可恢复 PASS。

### Added

- **`refresh-ide-blocks` 子命令**（R-07 · SPEC: PRD_R07_ide_block_rewrite.md）：刷写存量消费者仓 IDE marker 块（`<!-- cyning-harness:begin/end -->`）内滞留的旧 `npx @cyning/harness` 命令字面。默认 dry-run 零写入，`--yes` 才写盘；支持 `--target` / `--json`（schema `dsh-coding-kit/refresh-ide-blocks-report@1`）；映射表 A1–A4 自动替换（钉版丢弃记 `dropped_pin`、裸 `harness skills build|check` 防二刷）、B1–B5 仅报告「需人工」；preflight fail-fast（git 脏树 / MIXED 新旧混杂 / MALFORMED 畸形块 / S2 断言闸）exit 2 零写入；写盘前备份至 `.cyning-harness/backups/refresh-ide-blocks/`（保留 5 代），幂等。marker 块语法规范与 A/B 映射表已入 README。
- **`upgrade` 内嵌只读提示行**：upgrade 完成后若检测到 IDE 块内旧字面，追加一行 `refresh-ide-blocks` dry-run 提示（不写 IDE 文件、不改 upgrade exit 码）。
- **`src/cli-refresh-ide-blocks.ts` 模块**：块解析器 + 映射表 + 拒写闸 + 子命令接线。
- **新增测试**：`test/cli-refresh-ide-blocks.test.ts` —— M01–M19 子命令矩阵 + U1–U12 解析器单测，含 T5 文档 grep 断言（README 子命令节 / 映射表 / adapters 声明）。

## [1.4.0] - 2026-08-24

> 主题：**闸接线 + 债闭环** —— DEF-003 阶段二落地：verify / task close / lifecycle dry-run 的「恒过 / 恒 unevaluated」守卫全部改为真求值，并配真豁免旗标（豁免留痕）；R-08 实证钉死 DSH skills 扫描事实。

### Changed（行为变更 · 升级必读）

> **消费者迁移提示（置顶）**：存量仓中缺 R<n> 审查文、pre-30 invoke 帽制品或 KPI 制品的 task，`verify` / `task close` 将从 PASS 变 **BLOCKED**（exit 2）；过渡期请用下述 `--allow-*` 豁免旗标（真豁免 · 留痕，不免除补落义务）。

- **`verify` 新增 R<n> 审查文硬闸**（DEF-003 T4）：task 缺对应 reviews 制品 → BLOCKED exit 2；`--allow-no-review` 为真豁免并留痕。
- **`verify` 新增 pre-30 invoke hats 硬闸**（DEF-003 T5）：task 声明帽与 {10, 20, 00} 有交集但无 invoke 制品 → BLOCKED；`--allow-invoke-gap` 真豁免并留痕。
- **`task close` 六守卫真求值**（DEF-003 T6）：close_invoke / close_review / close_graph_delta / close_kpi / close_experience / close_wiki_delta 全部真接线；豁免旗标 `--allow-invoke-gap` / `--allow-no-review` / `--allow-kpi-gap` / `--allow-experience-gap` / `--allow-wiki-gap`。
- **`lifecycle` dry-run 守卫真求值**（DEF-003 T3）：由恒 unevaluated 改为真实评估；未接线守卫在输出中明示，不冒充已评估。
- **`findReview` / `runTestCheck` / `lintTaskFile` 收敛** 至 `src/cli-checks.ts` 单一实现源。
- **README skills 扫描免责 → 「已验证扫描」**（R-08 实证，对照 DSH 上游 deepseek-harness@141eb6f）：project `.dsh/skills` rank 100 · user `~/.dsh/skills` rank 400。

### Added

- **`src/cli-checks.ts`**：checks 单一实现源（review / invoke / lint / KPI / D5）。
- **新增测试**：`test/cli-verify-review.test.ts`、`test/cli-verify-invoke-hats.test.ts`、`test/cli-lifecycle-guards.test.ts`、`test/cli-task-close-guards.test.ts`。
- **豁免旗标**：`--allow-no-review`、`--allow-invoke-gap`（verify）；`--allow-kpi-gap` / `--allow-experience-gap` / `--allow-wiki-gap`（task close 新增）。

### Known limitations

- `close_wiki_promotion` 与 `spec_reviews_retention`（`verify --spec`）**仍未接线**，发布物保持明示，不冒充已接线。
- KPI 四维评分为启发式解析（`Task_KPI%: N` / D1–D5 表 / 四维 1–5 文本约定）。
- D5 WARN 过渡在 1.4.0 **未硬化**（1.3.0 README 所述「下一 minor 硬化为 FAIL」顺延，仍为 WARN 不阻塞）。

## [1.3.0] - 2026-08-24

> 主题：**行为纠偏 · CLI 说真话做正事** —— 17 个 PRD/债项全面落地：help / 旗标 / --json / 幂等键 / --strict 等一律收紧为真实语义，155 项测试红线锁住，新上 CI。

### Changed（行为变更 · 升级必读）

- **子命令 `--help`**：输出子命令自身 usage（原误输出根 usage）。
- **未知旗标不再静默吞**：`verify` / `gate-check` 收到未知旗标 exit 1 报错（原静默忽略）。
- **`--json` 真生效**：`verify` / `gate-check` --json 输出五字段结构化结果（原旗标被吞、仍输出文本）。
- **`verify --spec`**：文案去版本号；校验失败 exit 2→1（exit 2 回归纯闸语义）。
- **入参校验收紧**：`init --preset` 词表校验（未知 preset 拒收）；`upgrade --force` 拒收。
- **`check` 三向版本判定**：高版本 manifest 不再误报「可升级」（DEF-013）。
- **`graph ingest` 幂等键含状态摘要**：闸/task 状态变化后重跑会补发事件（旧事件保留、不覆盖）。
- **外部手写事件过滤收紧**：改为结构化等值匹配（原宽松匹配易误吞/误放）。
- **`status`**：`event_count` 无匹配由 null 改为 0；`reviews.CLOSE` 事件接线。
- **`lifecycle` dry-run 新增 `--target`**。
- **`ingest` 扫描双路径**：harness 布局仓事件量跳变属预期。
- **D5 假阳性降级为 WARN 过渡**。
- **插件 override**：根上探 git root + 按文件边界截断。
- **`--strict` 真语义**：原先形同虚设，现真实收紧——**CI 中使用 `--strict` 的管线可能翻红**。
- **`skills install --out` 指向产品包 `assets/skills` → 拒写**（防污染源包资产）。

> 本次含 skills/prompts 资产修复（DEF-024/025/026），安装遵循 no-clobber：**升级后建议重跑 `skills install`**，否则本地仍保留旧资产。

### Fixed

- **DEF-007 · stubs 死指针**：`assets/graph/stubs/README.md` 指针钉正。
- **DEF-024 · 姊妹帽死链**：skills 资产 4 处悬空姊妹帽链接修复。
- **DEF-025 · HG-GRAPH-MODULES 残留行**：gate-stop 模板残留行清除。
- **DEF-026 · 「机械校验」未接线声明**：30-execute-code 降级标注，不再冒充已接线。

### Added

- **lib 冒烟测试 + mtime 哨兵 + `npm run test:lib`**：锁住构建产物新鲜度。
- **CI workflow**（`.github/workflows/ci.yml`，node 22/24 矩阵）。
- **新增测试**：`test/cli-hgm-parser.test.ts`、`test/cli-status-obs.test.ts`、`test/cli-help.test.ts`、`test/cli-flags.test.ts`、`test/cli-verify-spec.test.ts`、`test/cli-validation.test.ts`。
- **SPEC 新增 HGM 幂等键契约**。

## [1.2.4] - 2026-08-24

> 主题：**修谎止损 · 发布物说真话** —— 全面清查 assets/ 文档面与包真实能力的偏差，未接线声明一律降级标注，并以测试红线锁住。

### Fixed

- **DEF-002 · 旧包命令面清零**：assets/ 内历史遗留的旧包名命令引用全部钉正为 `dsh-coding-kit`，新增 D-DOC 闸（docs 测试）防回潮。
- **DEF-020 · adapters 虚标声明**：`assets/ide/adapters/README.md` 中 `graph_modules_path` 与 git-clean 等未接线能力声明降级标注，不再冒充已交付特性。
- **DEF-003（阶段一）· 未接线 gate 声明降级**：生命周期/闸口中未接线的 gate 声明标注为 legacy-only；SPEC.md 新增 **R-TRUTH-1 红线**（发布物声明必须与包真实接线一致，违者测试红）。
- **DEF-008 · QUICKREF 手工嵌入**：`assets/harness/templates/QUICKREF_v1_zh.md` 重写为手工嵌入模板，命令面全部对齐 `dsh-coding-kit` 真实 CLI。
- **DEF-009 · 悬空引用守卫 + 薄指针页**：新增 assets 链接守卫测试；`assets/docs/` 新增 4 个薄指针页（POINTER_ONBOARDING / POINTER_RUNBOOK_wiki_delta / POINTER_SDD_HAT_FLOW / POINTER_USER_GUIDE）消解悬空引用。
- **DEF-004 · ontology 对齐**：`assets/ontology.yaml` 与包现实对齐，统一 ONTO- 前缀公理。
- **DEF-005 · discipline-coverage 重盘**：`assets/harness/discipline-coverage.yaml` 按真实接线机制重评覆盖等级，`verify --spec` 标注为未接线。
- **DEF-006 · graph 模板命令面对齐**：`assets/graph/templates/` 命令面与包内编译器对齐并重新生成产物。

### Changed（消费者必读）

- **升级本包后建议重跑 `graph yaml compile`（或 `--all`）与 `skills install`**：本次修谎涉及 graph 模板与 skills/prompts 资产内容，而安装/编译遵循 no-clobber 约定，**不会自动覆盖既有生成物**；不重跑则本地仍保留旧（含虚标）版本。

## [1.2.3] - 2026-08-24

### Fixed

- **DEF-023 · graph yaml compile Mermaid emit IDE 预览断裂（P0-HOT）**：
  - 锚点注释由 `// → path#Ln` 改为 Mermaid 唯一合法行注释 `%% → path#Ln`。
  - 带标签边默认形态由 `src --"label"--> dst` 改为官方 `src -->|"label"| dst`；`label: "->"` 或无 label 输出裸边 `-->`。
  - 节点标签一律双引号包裹（`id["label"]` / 子流程 `id[["label"]]`），修复含空格、`()`、`/`、`+`、`>` 前缀等字符的标签导致预览解析失败。
  - label 内 `"` / `|` / `#` 按 Mermaid entity code 转义（`#quot;` / `#124;` / `#35;`）。
  - 语法真值：[mermaid.js.org/intro/syntax-reference.html](https://mermaid.js.org/intro/syntax-reference.html) · [mermaid.js.org/syntax/flowchart.html](https://mermaid.js.org/syntax/flowchart.html)（本地对照 `mermaid/packages/mermaid/src/docs/syntax/flowchart.md` § Links between nodes / Text on links / Comments）。

### Changed（emit 契约 · 消费者必读）

- **升级本包后须重跑 `graph yaml compile`**（或 `graph yaml compile --all`）重新生成 `docs/_tech_graph/*.md`；旧 emit（`// →` 注释、`--"…"-->` 边）在 IDE Markdown 预览中会静默失败（节点横排一行、边丢失）。`graph yaml check` 比对 graph.json 不受影响。
- `assets/graph/templates/99_mermaid_protocol.md` 新增「§7 IDE 预览兼容 · 编译器输出契约」，§1.2 / §2 示例改为官方形态。

### Chore

- **DEF-001 · 发布物与 git 历史对齐**：补建与 npm 已发布包一一对应的 `v1.2.1` / `v1.2.2` 提交与 tag（发布物源态可由 tag 复现）；本提交起「publish 前 commit + tag」为硬步骤。
