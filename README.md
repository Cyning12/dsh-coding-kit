# dsh-coding-kit

**dsh-coding-kit@1.2.4** 是 DeepSeek Harness（DSH）的 **bundle 插件**，并带 **P0 闸 CLI** 与 **G1–G7 过程命令**。纪律资产仍是 ICVO（Inform · Constrain · Verify · Orchestrate）。

> **加载 ≠ 注入。** 安装或加载本插件 **不会** 自动改写 system prompt。`apply()` 只注册工具。必须由你或模型调用 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。

## 选哪条入口

| 你是谁 | 入口 | 不要用 |
|--------|------|--------|
| DSH 会话 / 模型调工具 | `dsh plugin add dsh-coding-kit` | 不要只 `npm install`（缺 bundle 层则工具不出现） |
| Cursor / CI / 存量仓日常闸 | `npx dsh-coding-kit` | 不要把插件 `init_coding_kit` 与 CLI `init` 当成同一入口 |

两条入口同一 npm 包 **`dsh-coding-kit@1.2.4`**。插件面与 CLI 面互不替代。

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

### 初始化项目模板（插件面）

初始化走工具 **`init_coding_kit`**（不是 CLI `init`）。

对话：**请把 coding-kit 模板初始化到本项目** → 模型调用 `init_coding_kit`。  
之后修改 `.coding-kit/`，再调用 `apply_coding_standards`（`source=override`）。`init_coding_kit` 不覆盖已有文件。

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

## 从 @cyning/harness 迁移

钉 **dsh-coding-kit@1.2.4** 后可去掉 `@cyning/harness`。最小路径三步（必须，按序）：

1. 把 `devDependency` `@cyning/harness` 换成 `dsh-coding-kit`（钉 `1.2.4`）。
2. 在仓根执行 `npx dsh-coding-kit upgrade --yes`（读旧 `.cyning-harness/manifest.json`；`version` 钉 1.2.4，`from_version` 记旧号）。
3. CI / 脚本里把 `npx @cyning/harness` 换成 `npx dsh-coding-kit`。

Skill 安装为 **推荐、非必须**（最小路径不依赖 DSH 扫 skill）。命令一律 `npx dsh-coding-kit`。

### FAQ · pnpm peer

若 pnpm 安装仍因 peer 链失败（例如解析到未公开发布的宿主包）：在仓根设 `auto-install-peers=false`（或单次 `pnpm add -D dsh-coding-kit --config.auto-install-peers=false`）。即使 **1.2.2** 已将 cordis / dsh-tools 标为 optional，也建议保留此兜底。

### 可复制 Prompt（给存量仓 Agent）

整段粘贴：

````text
你 = 本仓库维护 Agent。把本仓从 @cyning/harness 迁到 dsh-coding-kit@1.2.4。

最小路径（必须，按序）：
1. package.json 的 devDependency：删除 @cyning/harness，改为 dsh-coding-kit（钉 1.2.4）。
2. 在仓根执行：npx dsh-coding-kit upgrade --yes
   （读旧 .cyning-harness/manifest.json；version 钉 1.2.4，from_version 记旧号；不覆盖 docs/tasks、reviews、invokes/by-task。）
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

安装路径不等于已验证的 DSH 自动扫描。DSH runtime 是否读取 .dsh/skills，以 DSH 上游文档为准。本包未验证、也不声称已验证按需加载。

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

### 扫描免责

`.dsh/skills` 是本包推荐的 **安装落点**，不是「本仓已验证 DSH 会自动扫描并按需加载」的声明。DSH runtime 发现 / 加载 skill 的规则 **以 DSH 上游文档为准**。本仓库 **未**对照上游源码做扫描验证，**不得**在 README、`--help`、skill README 或迁移 Prompt 中声称已验证自动按需加载。

## GitHub topic

本仓库 GitHub topic 含 **`dsh-plugin`**（DSH 官方发现机制，无应用商店）与 **`deepseek-harness`**。

## License

MIT
