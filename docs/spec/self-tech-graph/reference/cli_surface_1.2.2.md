> **历史锚**：dsh-coding-kit **1.2.2**
> **原工作区路径**：`docs/dsh_coding_kit_optimization/00_inventory/cli_surface.md`
> **非现行真值** · 现行 L1 见 `docs/_tech_graph/01_struct.md`

# CLI 全命令面 · dsh-coding-kit@1.2.2（R1 起草）

> **真值**：`dsh-coding-kit/src/cli.ts` 与各 `src/cli-*.ts` 实现（`lib/*.js` 为其 tsc 编译产物，同源），辅以 2026-08-22 本机实跑 `node bin/dsh-coding-kit.js --help`（Node v24.14.1，输出与 src/cli.ts#72-102 的 usage() 一致）。
> **入口**：`dsh-coding-kit/bin/dsh-coding-kit.js`（7 行壳，调 lib/cli.js 的 runCli，按 CliError.exitCode 退出；bin/dsh-coding-kit.js#1-7）。
> **退出码族**：0 成功 · 1 用法/参数错误（fail(msg) 默认）· 2 闸/校验失败（fail(msg, 2)）。未知命令 → stderr「未知命令」exit 1（src/cli.ts#707）。

## 0. 全局行为

- runCli(argv)：无参数或 argv 含 -h / --help → 打印根 usage 并 exit 0（src/cli.ts#638-641）。**注意**：该判断是全局 argv.includes，故 `graph --help`、`skills --help` 等一律命中根 usage，各子命令内置的 help 分支不可达（见 01_defects/defect_register.md DEF-010；已实测确认）。
- --version / -V → 打印包版本（src/cli.ts#642-645）。版本源：HARNESS_VERSION 环境变量优先，否则读包根 package.json（src/cli.ts#65-70）。
- 包版本同时是 init / upgrade 的钉版值（写入 .cyning-harness/manifest.json 的 version）。

## 1. P0 闸命令（1.1.0 交付 · SPEC B §2.1）

### init — src/cli.ts#122-153
- **用途**：在目标仓写 .cyning-harness/manifest.json（{version, preset, ide, from_version, upgraded_at}）。已有 manifest 则跳过（不覆盖）。
- **参数**：--preset NAME（默认 harness-only，**不校验取值**）· --target PATH（默认 cwd）· --yes（仅抑制提示文案）。
- **写**：仅 manifest；**不**复制 assets、**不**生成 QUICKREF、**不**写 S2。
- **退出码**：0；未知参数 exit 1。
- **测试**：test/cli-p0.test.ts#235-247（C1：写 1.2.2 且 S2 三域不存在）。

### upgrade — src/cli.ts#155-178
- **用途**：读旧 manifest → 钉当前包版本；from_version 跨版记旧号、同版再跑保留旧号；无 manifest → 非 0 并建议 init。
- **参数**：--target · --yes；**--force 被静默吞掉不生效**（src/cli.ts#157）。
- **写**：仅 manifest；S2 只读（测试以 sha256 钉死）。
- **退出码**：0；无 manifest exit 1。
- **测试**：test/cli-upgrade-compat.test.ts#99-159（C2 三条）· #175-181（F1 无 manifest）· #161-173（check 联动）。

### check — src/cli.ts#180-202
- **用途**：只读。打印 manifest 版本/preset，与包版本比较：相等→「已是最新」，不等→「可升级」（**不做大小比较**，manifest 高于包版本也报可升级）。
- **退出码**：恒 0（含未接入）；未知参数 exit 1。
- **测试**：test/cli-upgrade-compat.test.ts#161-173。

### verify — src/cli.ts#381-428
- **用途**：30 开工前聚合闸。--task 必填。链：task 存在性 → formatGateCheck（HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 三闸投影 + evaluateMayStart30）→ D5 测试制品探测（test_strategy=required 时 hasTestArtifacts）。
- **参数**：--target · --task FILE · --spec FILE（**未交付**，固定报「未交付」exit 2，src/cli.ts#61-63,399）。--graph / --json / --agent-hint / --allow-no-review / --allow-lint-fail / --allow-invoke-gap **被静默吞掉不生效**；--workspace-root 取值后丢弃（src/cli.ts#382-398）。
- **读**：task 文件 + 目标仓文件树（测试探测 walkFiles 深度 3）。
- **退出码**：PASS exit 0；task 不存在/闸 blocked/D5 FAIL → exit 2；缺 --task → exit 1。
- **对照旧包**：不查 reviews R<n> 存在性、不查 pre-30 invoke hats、不跑 task lint——旧包 @cyning/harness v2.5+/v2.12+/v2.14+ 的对应机制未迁入（见 DEF-003）。
- **测试**：test/cli-p0.test.ts#249-277（C3 BLOCKED / C4 PASS）· #292-312（C5b D5）。

### gate-check — src/cli.ts#325-350
- **用途**：仅人工闸投影 + may_start_30 判定；--task 必填；--graph / --json 同样被吞。
- **退出码**：blocked → exit 2；通过 → exit 0；缺 --task / task 不存在 → exit 1。
- **测试**：test/cli-p0.test.ts#279-290（C5）。

### audit — src/cli.ts#352-379
- **用途**：薄封装 = gate-check（可选 --task）+ runTestCheck（D5）。无 --task 时只做 D5 探测且恒过。
- **退出码**：任一 FAIL → exit 2（「ICVO audit 未通过」）。
- **测试**：test/cli-p0.test.ts#279-312（C5 / C5b）。

### task lint — src/cli.ts#430-533
- **用途**：task md 结构闸。E1 缺 Harness 元信息/task_slug · E2 缺状态行 · E3 缺验收标准/无勾选项 · E4 缺失败路径节 · E5 缺自检结论节 · E6 绝对本机路径 · E7 文件名 slug ≠ task_slug；W1 未知状态 token · W2 缺人工闸节 · W3 自检占位符 · W4 无思考轮节。E 级 FAIL → exit 2；仅 W → PASS。--json 机读。
- **对照旧包**：旧版 E8–E10（思考轮结构）/ W5–W6 未实现；而 assets/harness/discipline-coverage.yaml#34-38 仍声称 G4 已 closed_in 2.6.0（见 DEF-005）。
- **测试**：test/cli-p0.test.ts#314-344（C6）。

### task close — src/cli.ts#535-608
- **用途**：受闸归档 active→done。校验：task_slug 存在且与文件名一致 · 自检结论非占位 · 验收全勾（或 --allow-unchecked）· 状态 ∈ {done, completed} · 源在 */active/ 或 --target 指向 .md · 目标不存在（不覆盖）。全过后 --yes 才 renameSync，否则 dry-run。
- **退出码**：BLOCKED / task 不存在 → exit 2；用法错误 exit 1。
- **不查**：invoke hats 集合、reviews、graph_delta、KPI、experience、wiki_delta（旧包 v2.12–v2.18 close 守卫未迁入，见 DEF-003）。
- **测试**：test/cli-p0.test.ts#346-383（C7）。

## 2. G1 · 过程可观测（1.2.0 交付）

### status — src/cli-status.ts#163-216
- **无 --task**：列 docs/tasks/active 与 docs/harness/tasks/active 下 task_*.md 摘要（slug/status/阻塞闸/may_start_30）；--json 输出 obs_status_list.v1。
- **有 --task**：单 task 详表（obs_status.v1）：gates、blockers、last_invoke（by-task 目录最新文件 + hat token）、reviews.R1（文件名模式 task_*_audit_R<n>_* 匹配；**reviews.CLOSE 恒 false 占位**，src/cli-status.ts#113）、verify_preview（明示不替代 verify）、hgm 事件计数、kpi_section 存在性、next_hint。
- **--check**：须配 --task；缺 R1 review 或 may_start_30=false → exit 2（src/cli-status.ts#124-136,215）。
- **测试**：test/cli-g1g7.test.ts#152-162（D1）。

### timeline — src/cli-status.ts#218-255 + src/cli-timeline.ts
- **用途**：按 task_slug 从 HGM 事件轨（.cyning-harness/events/*.jsonl）过滤、升序打印。--task 必填（缺 → exit 1）；--limit N 非负整数；默认**不写盘**，--ingest 才先跑幂等 ingest（actor=system, source=timeline-cli）。
- **匹配**：eventMatchesTaskSlug = data.task_slug 等值 + subject **子串**匹配（src/cli-graph-hgm.ts#406-415，有误配风险，见 DEF-015）。
- **测试**：test/cli-g1g7.test.ts#164-187（D1 / D1b 无 --ingest 不写盘）。

## 3. G2 · 只读 yaml

### lifecycle show — src/cli-lifecycle.ts#301-309
- 读**包内** assets/harness/lifecycle.yaml（非消费者仓资产），打印 states/transitions/guards 或 --json 原文。资产缺失/解析失败 → exit 1。
- **测试**：test/cli-g1g7.test.ts#189-200（D2）。

### lifecycle dry-run — src/cli-lifecycle.ts#310-356
- **用途**：转移资格旁路判定（不改状态）。--transition ID 与 --from STATE 必填（缺 → exit 1）；未知 transition 或 from ∉ from[] → exit 2。
- **守卫求值**：仅 HG-AUDIT-R1 / HG-TASK-DRAFT 在给出 --task 时真读闸表求值；**其余守卫恒 unevaluated**（「本波未接线 adapter」，src/cli-lifecycle.ts#214-223），输出明示 unevaluated ≠ pass。任一 severity=block 且 fail → exit 2。8 个 --allow-* 旗标可把对应守卫 fail 降为 warn。
- **测试**：test/cli-g1g7.test.ts#202-214（D2b 合法参数 exit 0）。

### discipline show — src/cli-lifecycle.ts#360-378
- 读**包内** assets/harness/discipline-coverage.yaml，按 status 聚合 statements/gaps + 最多 12 条样例。资产标注 as_of_package_version=`2.23.0`（旧包号，见 DEF-005）。
- **测试**：test/cli-g1g7.test.ts#193-195（D2）。

## 4. G3 · Inform 图谱 / HGM

### graph yaml compile — src/cli-graph.ts#54-147 + src/cli-graph-yaml.ts#467-479
- --graph-id ID 或 --all 必填；默认输入 <target>/docs/_tech_graph（--input 可覆盖，相对 cwd）；--no-recursive；--output FILE。校验 inform_graph.v3 结构（graph_id/title/nodes/edges 必填、节点 id 合法、边端点须引用已知节点、anchors 须 object 含 path），YAML → 写同名 .md（frontmatter graph_id/version/generated_at/source + ## Mermaid + ## Structured Data 节点/边表）。
- **写**：<input>/<graph-id>.md；校验失败 → exit 1（GraphYamlError）。
- **注意**：生成格式与包内 assets/graph/templates/00_main.md 的旧生成器格式不一致（见 DEF-006）。
- **测试**：test/cli-g1g7.test.ts#216-254（D3）· test/cli-p0.test.ts#385-414（R-C8）。

### graph yaml check — src/cli-graph-yaml.ts#492-543
- 将该 graph 的 YAML 与 graph.json（默认 <input>/shared/graph.json，回退 <input>/graph.json，--graph-json 可指定）的**同 graph_id 切片**比对节点集与边集（from,to,mark,type）。有 diff → 打印 diff + exit 1。**比对对象是 graph.json，不是已编译 .md**。
- **测试**：test/cli-g1g7.test.ts#234-253（无 diff=0 / 有 diff 非 0）。

### graph yaml export — src/cli-graph-yaml.ts#318-327
- 全量 YAML → graph_v2 JSON（freeze_id 常量 TECH_GRAPH_S2_FREEZE_20260519_V2_3，src/cli-graph-yaml.ts#6）。**禁** --all / --graph-id（混用 → exit 1）；默认写 <input>/shared/graph.json。
- **测试**：test/cli-g1g7.test.ts#227-232。

### graph ingest — src/cli-graph.ts#149-164 + src/cli-graph-hgm.ts#392-404
- 扫目标仓 .cyning-harness/manifest.json + **docs/tasks/active/*.md**（注意：不扫 docs/harness/tasks/active），产出 RepositoryAdopted / TaskCreated / GateStatusChanged 事件，按 type:subject 幂等去重，追加写 .cyning-harness/events/YYYY-MM.jsonl。--dry-run 不写盘。
- **测试**：test/cli-g1g7.test.ts#256-286（D3：dry-run 不写盘；ingest 后 axioms 可 FAIL）。

### graph snapshot — src/cli-graph.ts#166-179 + src/cli-graph-hgm.ts#227-286
- 重放全部事件 → 节点/边/投影（task_status、gate_status、rejected_events）→ 写 .cyning-harness/graph/snapshot.json。
- **测试**：test/cli-g1g7.test.ts#268-270。

### graph axioms check — src/cli-graph.ts#181-203 + src/cli-graph-hgm.ts#288-383
- 公理：D2（HumanGate 节点 pending 且有 BLOCKS→hat 30 边 → error）· D3（task in_progress 无 CHECKED exit_code=0 边 → warn）· rejected→draft（闸 rejected 后缺 TaskStatusChanged(draft) → error）· S2（SYNCED 事件 files_touched 触 S2 前缀 → error）。有 error → exit 2；--json 机读。
- **注意**：公理 id 与 assets/ontology.yaml 的公理文本**不同义**（ontology D2 = 20 帽不得附 30 Prompt），见 DEF-004。
- **测试**：test/cli-g1g7.test.ts#272-285。

## 5. G4 · sync

### sync index — src/cli-sync.ts#101-115
- 扫 docs/harness/invokes/by-task/<slug>/invoke_*.md，并从 docs/tasks/{active,done} 的 Harness 元信息提取 entry_invoke_10_task/20/30 作为 entry_points，写 .cyning-harness/invoke_index.json（schema_version `1`）。freeze：唯一默认路径（test/cli-upgrade-compat.test.ts#183-209 钉死无第二默认路径）。不写 S2。
- **测试**：test/cli-g1g7.test.ts#288-312（D4：S2 哈希不变）。

## 6. G5 · skills

### skills build — src/cli-skills.ts#394-415（维护者向）
- 从包内 assets/harness/prompts/*.md（排除 README/FRAGMENT_/TEMPLATE_ 前缀）读 frontmatter 并校验（name 1–64 kebab-case、description ≤1024、compatibility ≤500），重写正文链接 ./（FRAGMENT|TEMPLATE)_*.md → references/，复制被引用资源，rmSync 后整树重写**包内** assets/skills/。默认跳过 metadata.track=starter-experimental（30/40 执行帽）；--with-execute-hats 仅供评测通道。
- **测试**：test/cli-g1g7.test.ts#328-343（build 不碰消费者 S2）· test/cli-skills-install.test.ts#327-341（I-BUILD 不 rm 消费者 .dsh/skills）。

### skills check — src/cli-skills.ts#416-425
- 只读 drift 闸：按 prompts 重新生成期望树，与包内 assets/skills/ 实际树逐字节比对（缺失 / drift / 多余三类）。drift → SKILLS CHECK: FAIL exit 2；--json 机读。
- **测试**：test/cli-g1g7.test.ts#314-326（PASS / 人为 drift exit 2）· test/cli-docs-121.test.ts#103-113（生成 README 与盘上一致）。

### skills install — src/cli-skills.ts#331-392（1.2.1 新增 · 消费者向）
- 把包内 assets/skills 复制到消费者：默认 <target>/.dsh/skills；--out DIR 自定义；--global 写 $HOME/.dsh/skills（与 --out/--target 互斥；--out 与 --target 同用也 exit 1）。no-clobber 默认 skip 已有文件，--force 覆盖。拒写：--out 以 ~ 开头（exit 1）· dest 命中 .coding-kit / .dsh/coding-kit · dest 命中 S2（docs/tasks、reviews、invokes/by-task）· dest 已存在且为文件。默认跳过 30/40（目录名 + metadata.track 双判定）。
- **测试**：test/cli-skills-install.test.ts I1–I12 / I5b / I-BUILD 全量。

## 7. G6 · wiki

### wiki export — src/cli-wiki.ts#144-190
- **必须 --json**（缺 → exit 1）。wiki 根默认 docs/coding_wiki（--root 可改）；根不存在 → exit 2。产出 harness.wiki_graph.v1 JSON：nodes（全部 .md，id=仓相对路径）+ edges（[[wikilink]] 与 ./ ../ 相对 md 链；示例性 wikilink 名跳过计数；未解析链进 warnings）。--out FILE 写盘（默认 stdout；写盘时路径报 stderr）。
- **限制**：只识别 ./ 与 ../ 开头的 md 相对链（src/cli-wiki.ts#106-112）；根相对或裸文件名 md 链不成边。
- **测试**：test/cli-g1g7.test.ts#346-360（D6：成功 / 无 --json exit 1 / 无根 exit 2）。

## 8. G7 · task-extra

### task lint-done — src/cli-task-extra.ts#282-303
- done 目录（docs/tasks/done 与 docs/harness/tasks/done，递归）slug 集合 vs docs/harness/invokes/by-task 子目录集合（normalizeSlug 后 _↔- 等价）。done 有而 invoke 无 → exit 2；invoke 多出仅 warn。
- **测试**：test/cli-g1g7.test.ts#362-377（D7）。

### task lint-wiki-delta — src/cli-task-extra.ts#305-343
- 扫 docs/tasks/{active,done} 与 docs/harness/tasks/{active,done} 全部 md（跳过 _/. 前缀目录与 README），Harness 元信息缺 wiki_delta 字段即缺口 → exit 2。--scope all|active|done · --strict · --json。（当前实现 strict 与非 strict 缺口集合相同，strict 仅是语义位——lintWikiDeltaMissing 的 issues 与 missing 同源，src/cli-task-extra.ts#117-126。）
- **测试**：test/cli-g1g7.test.ts#379-394（D7）。

### task check — src/cli-task-extra.ts#345-383
- 校验 sidecar *.harness.json：白名单字段（schema_version/task_slug/test_strategy/test_strategy_note/depends_on/parallel_group/git_branch/worktree_root/epic_slug/status/task_markdown）、schema_version=`1`、slug 合法、test_strategy 三值、not_applicable 须 note、depends_on 无自引用/重复。--no-circular 时收集同目录 + --registry DIR 的 sidecar 做依赖存在性 + DFS 环检测。schema FAIL → exit 1；CYCLE → exit 1。
- **测试**：test/cli-g1g7.test.ts#396-420（D7）。

## 9. 测试面索引（test/ 文件名 = 行为契约）

| 文件 | 覆盖 |
|------|------|
| test/cli-p0.test.ts | C-bin / R-HELP / D8（bin/patch/pack）/ C1 init / C3–C5 verify·gate-check·audit / C5b D5 / C6 lint / C7 close / R-C8 / 「CLI 不注册 ctx.tools」 |
| test/cli-upgrade-compat.test.ts | C2 三条（跨版/旧包/同版保留）+ check 联动 + F1 + sync index freeze 单路径 |
| test/cli-g1g7.test.ts | D1–D7 全组（G1–G7 各至少一成功一失败） |
| test/cli-skills-install.test.ts | I1–I12 / I5b / I-BUILD / dest 为文件 / 未知子命令与旗标 |
| test/cli-docs-121.test.ts | D-DOC：README / renderReadme / skills README 无旧命令 + 生成物一致 |
| test/cli-docs-122.test.ts | P2-1 三 adapters 无旧 npx / P2 adapters README / P3-1 README 钉版+FAQ / D8 pack |
| test/cli-peer-optional.test.ts | P1-1 peer optional×2 / P1-2 干净 pnpm 默认安装（依赖本机 pnpm） |
| test/init.test.ts | T5 copyDirNoClobber（skip 已存在 + S2 skip） |
| test/apply.test.ts | T1 apply 只注册两工具不注入 / 禁 ctx.tool() / T6 重复调用不抛 |
| test/assets.test.ts | T2 拼接 / T3 24k 截断 / T4 override 根 |

> 测试以 `node --experimental-strip-types src/cli.ts` 直接跑**源码**（test/cli-p0.test.ts#21-35），而 npm 包实际运行的是 lib/ 编译产物（package.json#33 的 test script 同）；lib 为 gitignore 构建产物，src→lib 漂移无测试拦截（见 DEF-018）。
