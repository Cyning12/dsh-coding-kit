# dsh-coding-kit

**dsh-coding-kit@1.1.0** 是 DeepSeek Harness（DSH）的 **bundle 插件**，并带 **P0 闸 CLI**。纪律资产仍是 ICVO（Inform · Constrain · Verify · Orchestrate）。

> **加载 ≠ 注入。** 安装或加载本插件 **不会** 自动改写 system prompt。`apply()` 只注册工具。必须由你或模型调用 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。

## 选哪条入口

| 你是谁 | 入口 | 不要用 |
|--------|------|--------|
| DSH 会话 / 模型调工具 | `dsh plugin add dsh-coding-kit` | 不要只 `npm install`（缺 bundle 层则工具不出现） |
| Cursor / CI / 存量仓日常闸 | `npx dsh-coding-kit` | 不要把 graph / skills / wiki / status 当成 1.1.0 已可用 |

两条入口同一 npm 包 **`dsh-coding-kit@1.1.0`**。插件面与 CLI 面互不替代。

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

P0 闸命令（**1.1.0 已交付**）：

```bash
npx dsh-coding-kit init [--preset NAME] [--yes]
npx dsh-coding-kit upgrade --yes
npx dsh-coding-kit check
npx dsh-coding-kit verify --task <task.md>
npx dsh-coding-kit gate-check --task <task.md>
npx dsh-coding-kit audit --task <task.md>
npx dsh-coding-kit task lint --file <task.md>
npx dsh-coding-kit task close --file <task.md>
```

`init` / `upgrade` 不覆盖 S2 过程域（`docs/tasks/`、`reviews/`、`invokes/by-task/`）。

## 1.1.0 未交付（§2.2 · 等到 1.2.0）

下列命令 **不在 1.1.0 实现成功语义**。调用会非 0 退出。请继续 `npx @cyning/harness`，或等待 **dsh-coding-kit@1.2.0**：

- `status` / `timeline` / `lifecycle` / `discipline`
- `graph yaml *` / `graph ingest|snapshot|axioms`
- `sync index` / `skills build|check` / `wiki export`
- `task lint-done` / `task lint-wiki-delta` / `task check`

使用这些命令的仓在 1.2.0 前 **允许双包并存**：P0 闸走本包，其余暂留 `@cyning/harness`。

## 从 @cyning/harness 迁移

只跑 P0 闸的存量仓，迁到 **dsh-coding-kit@1.1.0**：

1. 把 `devDependency` `@cyning/harness` 换成 `dsh-coding-kit`（钉 `1.1.0`）。
2. 在仓根执行 `npx dsh-coding-kit upgrade --yes`（读旧 `.cyning-harness/manifest.json`；`version` 钉 1.1.0，`from_version` 记旧号）。
3. CI / 脚本里把 `npx @cyning/harness` 换成 `npx dsh-coding-kit`（仅 P0 命令：init / upgrade / check / verify / gate-check / audit / task lint / task close）。

仍依赖 §2.2 命令的仓：P0 按上表切新包，graph / skills / wiki / status 等继续 `npx @cyning/harness`，直到 1.2.0。

## GitHub topic

本仓库 GitHub topic 含 **`dsh-plugin`**（DSH 官方发现机制，无应用商店）与 **`deepseek-harness`**。

## License

MIT
