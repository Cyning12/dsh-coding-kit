# dsh-coding-kit

简体中文 | [English](README.md)

**dsh-coding-kit@1.9.2** 是 DeepSeek Harness（DSH）的 **bundle 插件**，并带 **P0 闸 CLI** 与 **G1–G7 过程命令**。纪律资产仍是 ICVO（Inform · Constrain · Verify · Orchestrate）。

> **加载 ≠ 注入。** 安装或加载本插件 **不会** 自动改写 system prompt。`apply()` 只注册工具。必须由你或模型调用 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。

## 选哪条入口

| 你是谁 | 入口 | 不要用 |
|--------|------|--------|
| DSH 会话 / 模型调工具 | `dsh plugin add dsh-coding-kit` | 不要只 `npm install`（缺 bundle 层则工具不出现） |
| Cursor / CI / 存量仓日常闸 | `npx dsh-coding-kit` | 不要把插件 `init_coding_kit` 与 CLI `init` 当成同一入口 |

两条入口同一 npm 包 **`dsh-coding-kit@1.9.2`**。插件面与 CLI 面互不替代。

`peerDependencies` 中的 `@deepseek-ai/cordis` 与 `@deepseek-ai/dsh-tools` 是 **DSH 宿主插件契约**（仅宿主加载本包为插件时需要；CLI-only 不需要），已在 `peerDependenciesMeta` 标为 **optional**。

## 入口 A · DSH 插件

优先 npm（预构建，无需 allowBuilds）：

```bash
dsh plugin --profile web add dsh-coding-kit
```

备选：从 GitHub 安装（需 Node 构建；pnpm 10+ 可能要 allowBuilds）：

```bash
dsh plugin --profile web add github:Cyning12/dsh-coding-kit#main
```

### 确认层

```bash
dsh --profile web --dump-config
```

安装成功后，profile 的 `package.json` 会出现依赖 `dsh-coding-kit`，且 `dsh.profile.bundles` 含该包名。用户一般不必手写 bundles；`dsh plugin add` 会维护。

### 激活与调用

1. 用该 profile 启动 DSH（例如 `dsh --profile web` / `dsh --profile web web`）。
2. 在对话中说：**请应用 coding standards**（或「按 coding-kit 规范写代码」）。
3. 模型应调用工具 `apply_coding_standards`。
4. 成功后后续回合的 runtime context 含 `# Coding Standards`。

可选参数：`profile=l1|l1+l2|full`（默认 `l1+l2`）；`persist=false` 表示只在当轮工具结果里给出正文。

profile 档语义：

| 档 | 内容 |
|----|------|
| `l1` | L1 规范 + coding_wiki |
| `l1+l2`（默认） | 全部 standards + coding_wiki |
| `full` | **当前版本等价于 `l1+l2`**；保留枚举值，为后续扩展 bundle（差异化注入内容）预留 |

**override 根查找规则（自 1.3.0）**：`apply_coding_standards` 从当前工作目录逐级向上探测 `.coding-kit` 与 `.dsh/coding-kit`，在最近的含 `.git` 的祖先目录（git root）处截止——monorepo 子目录启动 DSH 也能命中仓根 override；git root 之外的更上层目录不会被误吸。无 `.git` 时向上查找到文件系统根。工具输出的 `source=override|package` 与 `root=` 行可观测实际命中。

注入内容超 24k 字符时按**文件边界**截断：截断点只落在文件之间，不会注入半份文件；被略文件可由 `root` 下全集减去工具输出的 `files` 列表推出，且 `truncated=true` 附截断标记。

### 初始化项目模板（插件面）

初始化走工具 **`init_coding_kit`**（不是 CLI `init`）。

对话：**请把 coding-kit 模板初始化到本项目** → 模型调用 `init_coding_kit`。  
之后修改 `.coding-kit/`，再调用 `apply_coding_standards`（`source=override`）。`init_coding_kit` 不覆盖已有文件。

注意（读写根口径不对称，自 1.3.0 明示）：**读取面**（`apply_coding_standards`）向上查找到 git root；**写入面**（`init_coding_kit`）仍写入当前工作目录。请在**仓根**对话中调用 `init_coding_kit`，避免在 monorepo 子目录里初始化后读取面却命中仓根。

部分 IDE / yaml-language-server 会把根目录 `cordis.patch.yml` 当成 RFC6902 JSON Patch，报缺 `op` / `path` / `value`。这是误报，可忽略；该文件必须保持 `- insert`，不要改成 JSON Patch。

## 入口 B · CLI（Cursor / CI）

P0 闸与 G1–G7（**1.2.0 已交付**）：

```bash
npx dsh-coding-kit init [--preset NAME] [--yes]   # NAME 词表: harness-only（唯一合法值）
npx dsh-coding-kit upgrade --yes
npx dsh-coding-kit refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]
npx dsh-coding-kit check
npx dsh-coding-kit verify --task <task.md> [--with-wiki-lint]
npx dsh-coding-kit verify --spec <SPEC.md>   # SPEC→00 前审查文存在性闸（与 --task 互斥 · --with-wiki-lint 同生效）
npx dsh-coding-kit gate-check --task <task.md>
npx dsh-coding-kit audit --task <task.md>
npx dsh-coding-kit task lint --file <task.md>
npx dsh-coding-kit task close --file <task.md>
npx dsh-coding-kit status [--target] [--task] [--json] [--check]
npx dsh-coding-kit timeline --task FILE
npx dsh-coding-kit lifecycle show [--json]
npx dsh-coding-kit lifecycle dry-run --transition ID --from STATE
npx dsh-coding-kit discipline show [--json]
npx dsh-coding-kit graph yaml compile|check|export
npx dsh-coding-kit graph ingest|snapshot|axioms
npx dsh-coding-kit sync index
npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]
npx dsh-coding-kit skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
npx dsh-coding-kit skills build [--with-execute-hats]
npx dsh-coding-kit skills check
npx dsh-coding-kit wiki export --json
npx dsh-coding-kit task lint-done
npx dsh-coding-kit task lint-wiki-delta
npx dsh-coding-kit task check --file PATH
```

kit **源码仓**以 `docs/_tech_graph/` 做 `graph yaml compile|check|export` 的 dogfood（**不随 npm 包发布**；https://github.com/Cyning12/dsh-coding-kit/tree/main/docs/_tech_graph）。

`init` / `upgrade` / `sync index` / `skills build` 不覆盖 S2 过程域（`docs/tasks/`、`reviews/`、`invokes/by-task/`）。`sync prompts` 仅写入 Starter 白名单（`docs/harness/prompts/` **11** 文件 + `docs/harness/templates/TASK_TEMPLATE.md`）——默认 dry-run；本地内容与包内不同则列为 conflict 且不覆盖（`--force` 显式覆盖）。

`verify --with-wiki-lint`（显式旗标 · 非破坏）：在既有检查之上追加 `lint-wiki-delta`（默认档 · `scope=all`），`--task` 与 `--spec` 模式同生效。有缺口时 verify 判 BLOCKED，列出 issue（缺口可能来自兄弟 active/done task），并打印与 PR CI 逐字一致的复跑命令 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`（见 `assets/ci/samples/lint-wiki-delta.yml.example`）；`--json` 增 `wiki_lint` 块（`ok` / `issues` / `scanned`）。target 无 `docs/tasks/` 目录时 scanned:0，不会误 BLOCKED。无旗标时 `verify` 行为与之前逐字一致。

`graph yaml export` / `graph yaml check` 的 graph 面行为自 1.7.0 起修正：① export 的 `graph_id` 以 yaml 声明值（`data.graph_id`，如 `00_main`）为唯一真值源写入 graphs/nodes/edges，不再用路径命名空间 id（如 `l0/00_main`）——路径 id 仅作输入兼容定位（`--graph-id` / 文件发现）；② `check --all` 的 graph.json 切片过滤口径与 export 输出对齐（同一声明值真值源），kit 自产根 json 与 check 互认；③ export 保留全部 mark 类型（`?>` / `~>` / `::…` / `[…]`）的边 label（拓扑协议标记作为边属性呈现，不再丢弃 label 文本）；④ compile 生成的 Mermaid class 段按 `nodes[].kind`（`flow`/`struct`/`external` → `phase`/`doc`/`infra`）生成，无 `kind` 时保留 id 推断作兜底。exit 码不变。**消费者注意**：依赖旧 export 输出（命名空间 graph_id / 空 label）的消费方需重跑 `graph yaml export`。

`check` 对 `manifest.version` 与包版本做三向比较（已是最新 / 可升级 / 高于）。自 1.5.2 起，当 manifest 带非 null `from_version`（即从旧 `@cyning/harness` 产品线迁来）时，「高于」分支输出跨产品线迁移语义（`@cyning/harness X → dsh-coding-kit Y`——跨产品线版本号不可比）并建议 `npx dsh-coding-kit upgrade --yes`，不再误报「可能为降级安装」；自 1.7.0 起该判据收窄为 `from_version` 属旧包产品线词表（2.x 系列）才走迁移文案，kit 线（1.x）`from_version` 与 `from_version: null` 均保留原三向文案。exit 码不变（恒 0）。

### refresh-ide-blocks（R-07 · 存量 IDE 块旧命令字面刷写）

旧包 `@cyning/harness` 时代 wizard marker merge 嵌入的 IDE 块（`<!-- cyning-harness:begin -->` … `<!-- cyning-harness:end -->`）内可能滞留旧命令字面。`refresh-ide-blocks` 仅在这类 **product marker 块体内** 做白名单字面替换：

- **默认 dry-run**：无旗标（或显式 `--dry-run`）只扫描 + 报告，零写入，exit 0；`--yes` 才写盘。
- **发现面（冻结白名单）**：仓根 `AGENTS.md`、`CLAUDE.md`、`.cursor/rules/*.mdc`（单层）。发现面之外的文件即使含 marker 也不处理。
- **映射表（冻结 · 仅块体内生效）**：

  | 组 | 规则 | 行为 |
  |----|------|------|
  | A1 | `npx @cyning/harness` → `npx dsh-coding-kit` | 自动替换，子命令与参数原样保留 |
  | A2 | `npx @cyning/harness@<version>` → `npx dsh-coding-kit` | 自动替换，钉版整体丢弃（报告记 dropped_pin） |
  | A3 | `npx --yes @cyning/harness[@<version>]` → `npx --yes dsh-coding-kit` | 自动替换，`--yes` 保留、钉版丢弃 |
  | A4 | 裸 bin 形态 `harness skills build` / `harness skills check` → `npx dsh-coding-kit skills build` / `npx dsh-coding-kit skills check` | 自动替换（行前缀已含 `npx dsh-coding-kit` 时防二刷） |
  | B1–B5 | `CYNING_HARNESS` / `--with-scripts` / `wizard/` 路径 / `harness:<name>` script 名 / 其他裸 `@cyning/harness` 引用 | **仅报告「需人工」，不替换** |

- **纪律**：marker 行与块外内容字节不动；`<!-- cyning-harness-local:begin -->` 块永不改写；`docs/tasks/`、`docs/harness/reviews/`、`docs/harness/invokes/by-task/`（S2）一律拒写。
- **preflight（--yes 专用 fail-fast，exit 2 零写入）**：git 脏树 / 单文件新旧字面混杂（MIXED）/ marker 配对畸形（MALFORMED）/ S2 断言闸任一命中即拒写。脏树判定采用 `git status --porcelain` 语义——**untracked 文件也计入脏树**，`--yes` 前请先 commit 或 `git stash -u`。
- **备份与回滚**：--yes 写盘前原字节备份到 `.cyning-harness/backups/refresh-ide-blocks/<UTCts>/`（保留最近 5 代）；回滚首选 `git checkout -- <path>`，非 git 仓用备份 cp 回。备份仅供本机回滚——建议消费者将 `.cyning-harness/backups/` 加入 `.gitignore`（不入库）。
- **无 marker 文件（仅报告，绝不改写）**：发现面内 0 product 块文件用 A/B 组同一组正则做只读扫描，命中入人类报告「无 marker 检出（仅报告，不刷写）」段与 --json top-level `plain_mentions: [{path, rule, count}]` 字段（schema 保持 `@1`，向后兼容增量）；不触发 preflight fail-fast，不改 exit 码。
- **幂等**：已刷写文件再次运行 A 组命中 0，`files_written=0`、字节不变、exit 0。
- `--json` 输出单行机器报告（schema `dsh-coding-kit/refresh-ide-blocks-report@1`；自 1.5.2 起向后兼容增量含 `plain_mentions` / `totals.plain_mentions`）。

### D5 测试制品探测边界（audit / verify · test_strategy=required）

`audit` / `verify` 在 task 声明 `test_strategy=required` 时执行 D5 强检查：目标仓须存在**真实测试制品**，否则 exit 2。D5 是制品探测，不执行测试命令。探测口径（自 1.3.0 收紧）：

**强信号探针（存在即 PASS）**

- 目录：`test/` `tests/` `spec/` `specs/` `__tests__/`
- 配置文件：`jest.config.{js,ts}` `vitest.config.{js,ts}` `playwright.config.{js,ts}` `cypress.config.js` `pytest.ini`
- 测试文件名（仓根起 3 层内）：`*.(test|spec).(js|ts|mjs|cjs)`、`*_test.py`、`test_*.py`

**CI 探测**：`.github/workflows/` 下 `*.yml|*.yaml` 逐一读文本，命中以下任一 test 步骤模式才算有 CI 测试：`pytest` `vitest` `jest` `npm (run )?test` `pnpm (run )?test` `yarn test` `node --test` `go test` `cargo test` `tox` `unittest`，或 step `name:` 含 `test`。

**已知误判面与逃生口**

- `pyproject.toml` / `setup.py` 存在**不再**视为测试制品（任意现代 Python 仓都有，与有无测试无关）。
- 纯 lint / 纯部署 workflow（无 test 步骤）不再放行。
- 探测深度为仓根起 3 层；monorepo 更深层或自定义测试命令（如 `make test`）不命中白名单时，在仓内放任一强信号文件（如 `tests/` 目录、`*_test.py`）即可。
- **WARN 过渡已硬化（1.5.0）**：1.3.0–1.4.0 期间「新探测失败但旧启发式通过 → `D5: WARN 过渡` exit 0 不阻塞」的过渡分支已删除；自 1.5.0 起上述情形一律 **FAIL**（verify BLOCKED / audit FAIL，exit 2）。升级前请在仓内补真实测试制品（如 `tests/`、`*_test.py`、`*.test.ts` 或含 test 步骤的 CI）。

## 从 @cyning/harness 迁移

钉 **dsh-coding-kit@1.9.2** 后可去掉 `@cyning/harness`。最小路径三步（必须，按序）：

1. 把 `devDependency` `@cyning/harness` 换成 `dsh-coding-kit`（钉 `1.9.2`）。
2. 在仓根执行 `npx dsh-coding-kit upgrade --yes`（读旧 `.cyning-harness/manifest.json`；`version` 钉 1.9.2，`from_version` 记旧号）。
3. CI / 脚本里把 `npx @cyning/harness` 换成 `npx dsh-coding-kit`。

Skill 安装为 **推荐、非必须**（最小路径不依赖 DSH 扫 skill）。命令一律 `npx dsh-coding-kit`。

### FAQ · pnpm peer

若 pnpm 安装仍因 peer 链失败（例如解析到未公开发布的宿主包）：在仓根设 `auto-install-peers=false`（或单次 `pnpm add -D dsh-coding-kit --config.auto-install-peers=false`）。即使 **1.2.2** 已将 cordis / dsh-tools 标为 optional，也建议保留此兜底。

### 可复制 Prompt（给存量仓 Agent）

整段粘贴：

````text
你 = 本仓库维护 Agent。把本仓从 @cyning/harness 迁到 dsh-coding-kit@1.9.2。

最小路径（必须，按序）：
1. package.json 的 devDependency：删除 @cyning/harness，改为 dsh-coding-kit（钉 1.9.2）。
2. 在仓根执行：npx dsh-coding-kit upgrade --yes
   （读旧 .cyning-harness/manifest.json；version 钉 1.9.2，from_version 记旧号；不覆盖 docs/tasks、reviews、invokes/by-task。）
3. CI 与脚本里所有 npx @cyning/harness 换成 npx dsh-coding-kit。
命令一律 npx dsh-coding-kit。禁止再写 npx @cyning/harness skills build。

推荐（非必须 · Skill 安装）：
- 仓内：npx dsh-coding-kit skills install
  复制 npm 包内已生成 skills（默认不含 30/40）到本仓 .dsh/skills。已有文件默认不覆盖；要覆盖才加 --force。
- 用户级：npx dsh-coding-kit skills install --global
  写到 $HOME/.dsh/skills（展开 HOME；不要把 ~ 当成相对路径）。

路径对照（禁止混用）：
- .dsh/skills 或 $HOME/.dsh/skills = Skill 安装落点（本命令）。
- .claude/skills 或 ~/.claude/skills = Claude Code 的 skill 目录（本命令默认不写；若你用 Claude 可另拷或 --out）。
- .dsh/coding-kit 或 .coding-kit = 规范覆盖（apply_coding_standards / init_coding_kit），不是 skill 目录。

已验证（对照 DSH 上游源码）：DSH runtime 自动扫描本仓 .dsh/skills 与 $HOME/.dsh/skills 并按需加载。skill 形态为 <name>/SKILL.md 目录包或 <name>.md 平铺文件，frontmatter 必填 name/description；证据锚点见 README「扫描验证」节。

不要做：GitHub Archive；npm publish / deprecate；让 apply 在加载时自动注入；默认安装 30/40；把 skills 拷进 .dsh/coding-kit。
````

### 路径对照

| 路径 | 用途 | 谁写入 |
|------|------|--------|
| 产品包 `assets/skills` | 生成物真值；`skills check` 对照根 | 维护者 `skills build`（G5 freeze） |
| `<repo>/.dsh/skills` | 消费者 Skill **安装落点** | `skills install` |
| `$HOME/.dsh/skills` | 用户级安装落点 | `skills install --global` |
| `<repo>/.claude/skills` 或 `~/.claude/skills` | Claude Code skill 目录 | 用户另拷或 `--out`；**默认不写** |
| `<repo>/.dsh/coding-kit` 或 `.coding-kit` | 规范覆盖（standards / wiki） | `init_coding_kit`；**禁止**当作 skill dest |

### 扫描验证（已对照 DSH 上游源码）

**已验证（2026-08-22 · 对照 DSH 上游源码 deepseek-harness@141eb6f，即 dsh 0.1.0-rc.8）**：DSH runtime **会自动扫描** `<repo>/.dsh/skills` 与 `$HOME/.dsh/skills` 并 **按需加载**，二者正是本包 `skills install` 的两个 **安装落点**。证据锚点：

- `packages/skill/skill-filesystem/src/index.ts:246` —— 扫描 `<projectRoot>/.dsh/skills`（source=`project-dsh`，rank 100）；同文件 `:253` —— 扫描 `<dshHome>/skills`（`$DSH_HOME` 或 `~/.dsh`，source=`user-dsh`，rank 400）。
- `docs/subsystems/skills.md`「Local discovery priority」表同口径（rank 100/400 两行）；加载机制：skill 摘要注入会话 catalog，模型经 `skill({ name })` 工具按需拉取正文（该文档「Session catalog and tool contract」节）。

结构与 frontmatter 要求（同源码）：目录包 `<name>/SKILL.md` 或平铺 `<name>.md`（index.ts:724-728）；frontmatter 必填 `name`/`description`，`name` 须 kebab-case（index.ts:810-816）；projectRoot = 最近含 `.git` 的祖先目录（index.ts:937-947）。

注意：扫描/加载是 **DSH runtime 的行为契约**，随上游版本演进；以上锚点对应 0.1.0-rc.8。本包职责止于把 skill 写入正确落点并保持 frontmatter 合法（`skills check`）。

## Host 使用 coding-kit（沟通 Agent / 产品 Chat）

Skills **不能**覆盖全部过程能力。Host 要嵌套 Harness 过程，须同时具备：Process Kernel 对象 + CLI Capability + PromptAssembly 槽，而不是只拷 Skills。

推荐 Capability 白名单（**须走 Policy / H2**：默认关 · Host env 显式授权 · 禁止任意 shell）：

- `npx --yes dsh-coding-kit@<pin> verify …`
- `npx --yes dsh-coding-kit@<pin> task …`

| 能力 | Skills 能否覆盖 |
|------|----------------|
| 10/20 审过程指引 | 能（默认分发） |
| 00 委派纪律 | 弱：全文不进默认；delegate-only 短 Skill 可默认装 |
| 30/40 执行 | 弱：不进默认（T1 前）；且执行仍须 `verify` |
| 闸 / pre-30 / may_start_30 | **否**：须 CLI `verify`（或 Host 封装同一 CLI） |
| 帽身份常驻 system | **否**：Skills 为 on-demand，非 system |
| Host 业务答题 | **否**：属产品 Prompt Pack |

三分：**System/Re-anchor** = 短身份；**prompts 全文** = 换帽加载；**verify** = 机械。不可互替。

## 发版（维护者）

发布流程见 [RELEASING.md](RELEASING.md) —— publish 前硬步骤 checklist（先 commit 后 publish · 四门全绿 · 版本钉同步 · pack 干跑核对 · 仅人 publish；DEF-001 教训制度化）。

## GitHub topic

本仓库当前 GitHub topics：**`dsh-plugin`**（DSH 官方发现机制 tag，见上游 deepseek-harness `README.md` 与 `CONTRIBUTING.md`；无应用商店）、**`deepseek-harness`**、**`dsh-plugins`**、**`dsh`**。`package.json` 的 npm keywords 同样含 `dsh-plugin` 与 `deepseek-harness`。

## License

MIT
