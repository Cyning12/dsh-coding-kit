# dsh-coding-kit

**dsh-coding-kit@1.4.0** 是 DeepSeek Harness（DSH）的 **bundle 插件**，并带 **P0 闸 CLI** 与 **G1–G7 过程命令**。纪律资产仍是 ICVO（Inform · Constrain · Verify · Orchestrate）。

> **加载 ≠ 注入。** 安装或加载本插件 **不会** 自动改写 system prompt。`apply()` 只注册工具。必须由你或模型调用 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。

## 选哪条入口

| 你是谁 | 入口 | 不要用 |
|--------|------|--------|
| DSH 会话 / 模型调工具 | `dsh plugin add dsh-coding-kit` | 不要只 `npm install`（缺 bundle 层则工具不出现） |
| Cursor / CI / 存量仓日常闸 | `npx dsh-coding-kit` | 不要把插件 `init_coding_kit` 与 CLI `init` 当成同一入口 |

两条入口同一 npm 包 **`dsh-coding-kit@1.4.0`**。插件面与 CLI 面互不替代。

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
npx dsh-coding-kit check
npx dsh-coding-kit verify --task <task.md>
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
npx dsh-coding-kit skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
npx dsh-coding-kit skills build [--with-execute-hats]
npx dsh-coding-kit skills check
npx dsh-coding-kit wiki export --json
npx dsh-coding-kit task lint-done
npx dsh-coding-kit task lint-wiki-delta
npx dsh-coding-kit task check --file PATH
```

`init` / `upgrade` / `sync index` / `skills build` 不覆盖 S2 过程域（`docs/tasks/`、`reviews/`、`invokes/by-task/`）。

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
- **WARN 过渡（1.3.0）**：新探测失败但旧启发式（pyproject.toml / setup.py / 任意 workflow 存在）通过时，输出 `D5: WARN 过渡` 且 exit 0 不阻塞；原计划下一 minor 硬化为 FAIL，**1.4.0 未硬化、仍为 WARN 过渡**（硬化另列计划）。

## 从 @cyning/harness 迁移

钉 **dsh-coding-kit@1.4.0** 后可去掉 `@cyning/harness`。最小路径三步（必须，按序）：

1. 把 `devDependency` `@cyning/harness` 换成 `dsh-coding-kit`（钉 `1.4.0`）。
2. 在仓根执行 `npx dsh-coding-kit upgrade --yes`（读旧 `.cyning-harness/manifest.json`；`version` 钉 1.4.0，`from_version` 记旧号）。
3. CI / 脚本里把 `npx @cyning/harness` 换成 `npx dsh-coding-kit`。

Skill 安装为 **推荐、非必须**（最小路径不依赖 DSH 扫 skill）。命令一律 `npx dsh-coding-kit`。

### FAQ · pnpm peer

若 pnpm 安装仍因 peer 链失败（例如解析到未公开发布的宿主包）：在仓根设 `auto-install-peers=false`（或单次 `pnpm add -D dsh-coding-kit --config.auto-install-peers=false`）。即使 **1.2.2** 已将 cordis / dsh-tools 标为 optional，也建议保留此兜底。

### 可复制 Prompt（给存量仓 Agent）

整段粘贴：

````text
你 = 本仓库维护 Agent。把本仓从 @cyning/harness 迁到 dsh-coding-kit@1.4.0。

最小路径（必须，按序）：
1. package.json 的 devDependency：删除 @cyning/harness，改为 dsh-coding-kit（钉 1.4.0）。
2. 在仓根执行：npx dsh-coding-kit upgrade --yes
   （读旧 .cyning-harness/manifest.json；version 钉 1.4.0，from_version 记旧号；不覆盖 docs/tasks、reviews、invokes/by-task。）
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

## GitHub topic

本仓库 GitHub topic 含 **`dsh-plugin`**（DSH 官方发现机制，无应用商店）与 **`deepseek-harness`**。

## License

MIT
