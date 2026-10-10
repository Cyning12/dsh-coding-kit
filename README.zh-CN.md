# SpecWave

简体中文 | [English](README.md)

**SpecWave**（`spec-wave@3.0.2`）是 **多宿主编码 CLI**——单一声明式适配表原生落点 Cursor · Claude Code · 可选 DSH · agents 等——带 **P0 闸 / Harness 过程命令** 与 IDE 物化。纪律资产仍是 ICVO（Inform · Constrain · Verify · Orchestrate）。

> **加载 ≠ 注入。** 安装或加载可选 DSH 插件 **不会** 自动改写 system prompt。`apply()` 只注册工具。必须由你或模型调用 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。
>
> **初见？** 首小时必懂术语——`task.md` / Harness / 帽制 / `kit-*`——见 [GLOSSARY.md](GLOSSARY.md)（双语术语表）。
>
> <sub>曾用名 SpecGate / `dsh-coding-kit`——改名史与迁移见 [MIGRATION.md](MIGRATION.md)。</sub>

## Prerequisites（前置）

| 要求 | 说明 |
|------|------|
| **Node.js** | **`^22.19.0` 或 `>=24.0.0`**（对齐 `package.json#engines`） |
| **不支持** | **Node 20**（及更早）会踩坑——engines 拒跑；装包 / `npx` 前请先升级 |

```bash
node -v   # 期望 v22.19+ 或 v24+
```

## 最小上手（5 步）

主入口是 npm 包 **`spec-wave@3.0.2`** 的 **`npx spec-wave`**。插件面与 CLI 面互不替代。

```bash
# 1）确认包版本（推荐钉版）
npx spec-wave@3.0.2 --version

# 2）校验适配表（dry）
npx spec-wave@3.0.2 host validate

# 3）物化宿主（先 dry-run，再写盘）
npx spec-wave@3.0.2 host apply --tools cursor,claude,dsh --profile core
npx spec-wave@3.0.2 host apply --tools cursor,claude,dsh --profile core --yes

# 4）或首次 init（过程根 + 宿主选型）
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude,dsh --yes

# 5）有 task.md 后跑机械闸（exit 2 = 硬停）
npx spec-wave@3.0.2 verify --task docs/tasks/active/task_<slug>.md
```

`--yes` 后：Cursor 可见 `kit-verify` 等；Claude Code `/kit:verify`；DSH `.dsh/skills/kit-*`。完整宿主矩阵与入口百科见 [一包多宿主矩阵](#一包多宿主矩阵) · [入口 A · DSH 插件](#入口-a--dsh-插件) · [入口 B · CLI](#入口-b--clicursor--claude-code--ci)。概念：[核心对象](#核心对象) · [GLOSSARY.md](GLOSSARY.md)。

### 空仓：`test_strategy=required` 时如何最小可绿

CLI **永不**向你的 `docs/tasks/` 写入示例 task（S2）。模板须你自己复制：

1. `npx spec-wave@3.0.2 sync prompts --yes`（物化含 `docs/harness/templates/TASK_TEMPLATE.md`）。
2. 复制模板 → `docs/tasks/active/task_<slug>.md`（你的显式动作）。
3. 若元信息 **`test_strategy=required`**：帽 30 改实现**前**须先有关键路径的**可失败**自动化测试，再改实现至绿。
4. 人工闸表须 **4 列**；`HG-AUDIT-R1` → `approved` 后帽 30 才可改码。
5. `npx spec-wave@3.0.2 task lint --file docs/tasks/active/task_<slug>.md`，再 `verify --task …`。

详见模板路径 · [核心对象](#核心对象) · [GLOSSARY.md](GLOSSARY.md)。

## 选哪条入口

| 你是谁 | 入口 | 不要用 |
|--------|------|--------|
| Cursor / Claude Code / CI · 存量仓 | `npx spec-wave`（可选 `host apply`） | 不要把插件 `init_coding_kit` 与 CLI `init` 当成同一入口 |
| DSH 会话 / 模型调工具（可选） | `dsh plugin add spec-wave`（旧包 `dsh-coding-kit` **已 deprecate**，勿再 add 旧名） | 不要只 `npm install`（缺 bundle 层则工具不出现） |

过渡 bin `specgate` / `dsh-coding-kit` 仍可用；新脚本请一律 `npx spec-wave`。

### 一包多宿主矩阵

单一声明式适配表 → 多个宿主原生落点（always_on + skills + **commands**）。Verify 真值仍在 CLI（`failClosed` exit **2**）；IDE slash/command 只编排。**装 npm 包不会自动物化 IDE 文件**（无 postinstall）；须显式跑 `init --tools` / `host apply`。

| 宿主 | `host apply`（profile `core`）写入 |
|------|-------------------------------------|
| **Cursor** | `.cursor/rules/*.mdc` · `.cursor/commands/kit-*.md` · `.cursor/skills/` |
| **Claude Code** | `CLAUDE.md` 产品 marker 块 · `.claude/commands/kit/<verb>.md` → **`/kit:verb`** · `.claude/skills/` |
| **DSH** | `.dsh/skills/` — 帽子技能 **+** 编排 `kit-*`（`/` 可发现；**不**建 `.dsh/commands/`） |
| **agents**（可选） | `AGENTS.md` 片段 · `.agents/skills/` |
| **Copilot** | `AGENTS.md` 片段（共享 marker 块）· `.github/skills/` |
| **Codex** | `AGENTS.md` 片段（共享 marker 块）· `.agents/skills/` |
| **Windsurf** | `AGENTS.md` 片段（共享 marker 块）· `.windsurf/skills/` |
| **Gemini CLI** | `GEMINI.md`（同一份宿主中立片段）· `.gemini/skills/` |
| **opencode** | `AGENTS.md` 片段（共享 marker 块）· `.agents/skills/` |
| **Roo Code** | `AGENTS.md` 片段（共享 marker 块 · 官方仓 merged PR 加载）· 不物化 skills（无官方目录约定） |
| **Zed** | `AGENTS.md` 片段（共享 marker 块）· `.agents/skills/` |
| **Cline** | `AGENTS.md` 片段（共享 marker 块）· `.cline/skills/` |
| **aider**（注入层） | `AGENTS.md` 片段（注入层支持：aider **不会**自动加载 AGENTS.md——须 `aider --read AGENTS.md` 或在 `.aider.conf.yml` 写 `conventions-file: AGENTS.md`）· 不物化 skills（无官方约定） |

**2.2 W6 / 2.3 W6 宿主增量**（同一包）：上述九宿主复用 **agents** 资产面（零新资产）；落点逐宿主官方文档取证，无官方 skills 目录约定的宿主不物化 skills（永不强造目录）。aider 为如实标注的降级——仅注入层。

**2.1 增量**（同一包）：Claude `/kit:` 命名空间 · DSH `.dsh/skills/kit-*` 编排 · 可选 `--profile expanded` 物化 `kit-hat-*` 薄壳（默认仍 `core`）。

**2.1.1 · 安装/升级 UX**（对齐 OpenSpec `init --tools`）：

| 主题 | 行为 |
|------|------|
| 粘性 | `host apply` / `host update` / `init`（含物化）在 `--yes` 成功写盘后更新 `.coding-kit/host-tools.json`（`host_ids` + `profile`）。dry-run **不**写粘性。 |
| `--tools` | `LIST`（如 `cursor,claude,dsh`）· `all`（适配表全部 host_id）· `none`（**仅 init**：只过程根、不物化）。`host apply` **必须**带 `--tools`。 |
| `host update`（方案 **A**） | 解析序：CLI `--tools` → 粘性 → 否则 **exit 1**。有粘性时 `host update --yes` **只**刷已选宿主。相对 2.1.0「省略 `--tools` = 全表」为 **BREAKING（小）**。 |
| `init` | TTY 无 `--tools` → **询问**（多选 / all / none）。非 TTY / CI 无 `--tools` → **exit 1**。`tools≠none` 且未 `--no-host-adapt` → 同进程 `host apply` + 写粘性。`--no-host-adapt` → 不 apply **亦不**写粘性。 |

```bash
# 升包后：刷粘性已选宿主（不必再抄 --tools）
npx spec-wave@3.0.2 host update --yes
```

完整矩阵见 [`assets/ide/host-adapt/README.md`](assets/ide/host-adapt/README.md)；录屏清单见 [`docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md`](docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md)；规划见 [`docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md`](docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md)。

`peerDependencies` 中的 `@deepseek-ai/cordis` 与 `@deepseek-ai/dsh-tools` 是 **DSH 宿主插件契约**（仅宿主加载本包为插件时需要；CLI-only 不需要），已在 `peerDependenciesMeta` 标为 **optional**。

## 核心对象

Harness 过程围绕两个文件级对象运转。`verify --task <task.md>` / `gate-check --task <task.md>` / `task close` 都作用于第一个——在你于命令清单里遇到它们之前，本节先给出定义。

### task.md —— 一个可执行、可验收的工作单元

- **是什么**：一个 Markdown 文件描述一个工作单元：背景与目标、范围、非范围、失败路径、验收标准、Harness 元信息（`test_strategy`、`wiki_delta` 等）与人工闸表。闸表中 `HG-AUDIT-R1` 必须为 `approved`，帽 30 才可改码；`npx spec-wave verify --task <task.md>` 以闸表为真值（聊天声称不算数）。
- **从哪来**：复制 `docs/harness/templates/TASK_TEMPLATE.md`——由 `npx spec-wave sync prompts --yes` 物化。CLI 永不向你的 `docs/tasks/` 写入示例 task；是否落文件永远由你显式执行。
- **放哪**：在途放 `docs/tasks/active/task_<slug>.md`；`npx spec-wave task close --file <task> --yes` 验收归档至 `docs/tasks/done/`。

最小骨架（完整字段见模板）：

```markdown
# Task：加登录限流

> **状态**：`draft`

## Harness 元信息
| 字段 | 值 |
|------|-----|
| **task_slug** | `login-rate-limit` |
| **test_strategy** | `required` |
| **wiki_delta** | `none` |

### 人工闸
<!-- 闸表须 4 列（末列「说明」）；3 列会被静默忽略。id 单元格内勿内嵌粗体 **（整格包裹 **HG-…** 仍可解析）。 -->
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | pending | 30 | R1 审查后人签 |

## 范围 / ## 非范围 / ## 失败路径 / ## 验收标准
（逐节照模板填写；验收须含可跑命令）
```

> **闸表**：须 **4 列**（末列为 `说明`）；**3 列会被静默忽略**。**id 单元格内不要用粗体**（内嵌 `**` 会导致整行解析失败；外层整格包裹 `**HG-…**` 仍可解析）。

### spec.md —— task 回溯的需求规格

- **是什么**：已签的需求规格（背景 / 范围 / 非范围 / 验收 / 失败路径），task 通过 `关联 SPEC` 引用它。`npx spec-wave verify --spec <SPEC.md>` 闸「实现前须已有书面审查」。
- **从哪来**：由你或你的 Agent 撰写（帽 10 流程）——CLI 不物化 spec 文件。
- **放哪**：`docs/spec/`（本仓按主题分目录，如 `docs/spec/2_2-closed-loop-start/`）。

同一条 quickstart 链由 `npx spec-wave init` 打印——第 3 步前提：项目须为 git 仓（先 `git init`；`verify` 有 git-root 归属校验）。第 4 步（可选）指向 `npx spec-wave graph scaffold`，生成 `docs/_tech_graph/` **可审草稿**（非已签收架构真值；见下文图谱节）。术语（Harness / 帽制 / 门禁 / S2）汇总于 [GLOSSARY.md](GLOSSARY.md)（双语术语表 · 回链本节）。
---
## 入口 A · DSH 插件

优先 npm（预构建，无需 allowBuilds）：

```bash
dsh plugin --profile web add spec-wave
```

> **`dsh-coding-kit` 已 deprecate。** DSH 插件请装正式包名 **`spec-wave`**（同一产品）。

备选：从 GitHub 安装（需 Node 构建；pnpm 10+ 可能要 allowBuilds）：

```bash
dsh plugin --profile web add github:Cyning12/SpecWave#main
```

### 确认层

```bash
dsh --profile web --dump-config
```

安装成功后，profile 的 `package.json` 会出现依赖 `spec-wave`，且 `dsh.profile.bundles` 含该包名。用户一般不必手写 bundles；`dsh plugin add` 会维护。

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

## 入口 B · CLI（Cursor / Claude Code / CI）

P0 闸与 G1–G7（**1.2.0 已交付**）：

```bash
npx spec-wave init [--preset NAME] [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt] [--yes]   # NAME 词表: harness-only（唯一合法值）
npx spec-wave upgrade --yes
npx spec-wave refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]
npx spec-wave check
npx spec-wave verify --task <task.md> [--with-wiki-lint]   # 30 前闸；2.3 起审查文还须含可机读通过结论（G2 结论级）
npx spec-wave verify --spec <SPEC.md>   # SPEC→00 前审查文存在性闸（与 --task 互斥 · --with-wiki-lint 同生效）
npx spec-wave verify   # 裸模式（2.3 起）：仓级 reviews 双路径全量扫描 —— done failClosed · active 仅信息报告；存量豁免走 docs/harness/legacy-gate-exempt.yaml
npx spec-wave gate-check --task <task.md>
npx spec-wave audit --task <task.md>
npx spec-wave task lint --file <task.md>
npx spec-wave task close --file <task.md>
npx spec-wave status [--target] [--task] [--json] [--check]
npx spec-wave timeline --task FILE
npx spec-wave lifecycle show [--target PATH] [--json]
npx spec-wave lifecycle dry-run --transition ID --from STATE
npx spec-wave discipline show [--target PATH] [--json]
npx spec-wave graph yaml compile|check|export
npx spec-wave graph scaffold [--target PATH] [--yes] …   # 生成 docs/_tech_graph 可审草稿（非已签收真值）
npx spec-wave graph drift [--target PATH] [--input DIR] [--json]   # 漂移闸：模块覆盖 + 锚点消失（只报告 · 不重画）
npx spec-wave graph ingest|snapshot|axioms
npx spec-wave graph ontology check [--file PATH] [--json]   # 另支持 --hgm：事件轨图谱实例 ⊆ 随包本体词汇校验
npx spec-wave sync index
npx spec-wave sync prompts [--target PATH] [--yes] [--force] [--json]
npx spec-wave skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
npx spec-wave skills build [--with-execute-hats]
npx spec-wave skills check
npx spec-wave host validate [--file PATH] [--json]
npx spec-wave host apply --tools cursor,claude --profile core [--target PATH] [--file PATH] [--json] [--dry-run|--yes]
npx spec-wave host update [--tools LIST|all] [--profile core] [--target PATH] [--file PATH] [--json] [--dry-run|--yes] [--force]
npx spec-wave wiki export --json
npx spec-wave task lint-done
npx spec-wave task lint-wiki-delta
npx spec-wave task check --file PATH
```

`host apply` / `host update` 嗅探适配表 version 与可选 `@deepseek-ai/dsh-tools` peer（**U-01**）：不匹配 → exit 2、零写入（`--json` 含 `contract.status`）。`--tools dsh` 仍 commands=[]（不建 `.dsh/commands/`），编排落在 `.dsh/skills/kit-*`。**`host update` 省略 `--tools`** 时读粘性 `.coding-kit/host-tools.json`（否则 exit 1）。落点见上方 **一包多宿主**。

kit **源码仓**以 `docs/_tech_graph/` 做 `graph yaml compile|check|export` 的 dogfood（**不随 npm 包发布**；https://github.com/Cyning12/SpecWave/tree/main/docs/_tech_graph）。

**技术图谱脚手架（`graph scaffold` · 规划 3.1）**：在业务仓根执行可生成 `docs/_tech_graph/` **可审草稿**（顶层图 · 模块表 · 主流程 · `REVIEW_CHECKLIST.md`）。默认 dry-run；`--yes` 写盘。产物带草稿标记，**不是**已签收架构真值——`HG-GRAPH-MODULES` 须维护者人签。勿称「自动生成权威技术图谱」。

**漂移闸（`graph drift` · 3.1 W3）**：对照 `01_struct` 模块表与 `*.graph.yaml` 锚点，报告一级包目录未覆盖 / 已登记 path 消失（`TBD`/空 path 跳过）；漂移 **exit 2**。可选白名单 `.spec-wave/graph-drift.yaml`（缺省无文件=全检；坏 YAML fail-closed）。**只报告，不自动重画**图谱。

**图能力与本体的边界（3.0 ONTO-OPEN 裁决）**：图能力已开放 —— `graph yaml compile|check|export` 与消费者自建图今天可用，`graph ontology check [--file PATH]` 可校验随包本体或你指定的漂移副本；但随包本体（`assets/ontology.yaml`）是 SpecWave 自用元模型，**不提供自定义本体能力**（本体层不开放 · 消费者不可自定义类/关系 · 校验器开放 ≠ 本体内容开放）。复议触发（研究文 §7.3）：真实消费者请求 · ontology-check 面稳定一个 minor 后重估 · B5 后生态拉取 —— 走 HG-SCHEMA-CHANGE 式人闸。

`init` / `upgrade` / `sync index` / `skills build` 不覆盖 S2 过程域（`docs/tasks/`、`docs/harness/reviews/`、`docs/harness/invokes/by-task/`，以及 legacy 裸 `reviews/` / `invokes/by-task/`）。**S2 前缀真值源唯一**（`cli-shared` 的 `S2_TRUTH_PREFIXES`；F1 / 1.x MVP）。`sync prompts` 仅写入 Starter 白名单（`docs/harness/prompts/` **11** 文件 + `docs/harness/templates/TASK_TEMPLATE.md`）——默认 dry-run；本地内容与包内不同则列为 conflict 且不覆盖（`--force` 显式覆盖）。

`verify --with-wiki-lint`（显式旗标 · 非破坏）：在既有检查之上追加 `lint-wiki-delta`（默认档 · `scope=all`），`--task` 与 `--spec` 模式同生效。有缺口时 verify 判 BLOCKED，列出 issue（缺口可能来自兄弟 active/done task），并打印与 PR CI 逐字一致的复跑命令 `npx --yes spec-wave task lint-wiki-delta --target .`（见 `assets/ci/samples/lint-wiki-delta.yml.example`）；`--json` 增 `wiki_lint` 块（`ok` / `issues` / `scanned`）。target 无 `docs/tasks/` 目录时 scanned:0，不会误 BLOCKED。无旗标时 `verify` 行为与之前逐字一致。

`graph yaml export` / `graph yaml check` 的 graph 面行为自 1.7.0 起修正：① export 的 `graph_id` 以 yaml 声明值（`data.graph_id`，如 `00_main`）为唯一真值源写入 graphs/nodes/edges，不再用路径命名空间 id（如 `l0/00_main`）——路径 id 仅作输入兼容定位（`--graph-id` / 文件发现）；② `check --all` 的 graph.json 切片过滤口径与 export 输出对齐（同一声明值真值源），kit 自产根 json 与 check 互认；③ export 保留全部 mark 类型（`?>` / `~>` / `::…` / `[…]`）的边 label（拓扑协议标记作为边属性呈现，不再丢弃 label 文本）；④ compile 生成的 Mermaid class 段按 `nodes[].kind`（`flow`/`struct`/`external` → `phase`/`doc`/`infra`）生成，无 `kind` 时保留 id 推断作兜底。exit 码不变。**消费者注意**：依赖旧 export 输出（命名空间 graph_id / 空 label）的消费方需重跑 `graph yaml export`。

`check` 对 `manifest.version` 与包版本做三向比较（已是最新 / 可升级 / 高于）。自 1.5.2 起，当 manifest 带非 null `from_version`（即从旧 `@cyning/harness` 产品线迁来）时，「高于」分支输出跨产品线迁移语义（`@cyning/harness X → spec-wave Y`——跨产品线版本号不可比）并建议 `npx spec-wave upgrade --yes`，不再误报「可能为降级安装」；自 1.7.0 起该判据收窄为 `from_version` 属旧包产品线词表（2.x 系列）才走迁移文案，kit 线（1.x）`from_version` 与 `from_version: null` 均保留原三向文案。exit 码不变（恒 0）。

### refresh-ide-blocks（R-07 · 存量 IDE 块旧命令字面刷写）

旧包 `@cyning/harness` 时代 wizard marker merge 嵌入的 IDE 块（`<!-- cyning-harness:begin -->` … `<!-- cyning-harness:end -->`）内可能滞留旧命令字面。`refresh-ide-blocks` 仅在这类 **product marker 块体内** 做白名单字面替换：

- **默认 dry-run**：无旗标（或显式 `--dry-run`）只扫描 + 报告，零写入，exit 0；`--yes` 才写盘。
- **发现面（冻结白名单）**：仓根 `AGENTS.md`、`CLAUDE.md`、`.cursor/rules/*.mdc`（单层）。发现面之外的文件即使含 marker 也不处理。
- **映射表（冻结 · 仅块体内生效）**：

  | 组 | 规则 | 行为 |
  |----|------|------|
  | A1 | `npx @cyning/harness` → `npx spec-wave` | 自动替换，子命令与参数原样保留 |
  | A2 | `npx @cyning/harness@<version>` → `npx spec-wave` | 自动替换，钉版整体丢弃（报告记 dropped_pin） |
  | A3 | `npx --yes @cyning/harness[@<version>]` → `npx --yes spec-wave` | 自动替换，`--yes` 保留、钉版丢弃 |
  | A4 | 裸 bin 形态 `harness skills build` / `harness skills check` → `npx spec-wave skills build` / `npx spec-wave skills check` | 自动替换（行前缀已含 `npx spec-wave` 时防二刷） |
  | A5 | `npx dsh-coding-kit` → `npx spec-wave` | 自动替换（B-REFRESH · SpecGate 改名） |
  | A6 | `npx dsh-coding-kit@<version>` → `npx spec-wave` | 自动替换，钉版丢弃（dropped_pin） |
  | A7 | `npx --yes dsh-coding-kit[@<version>]` → `npx --yes spec-wave` | 自动替换，`--yes` 保留、钉版丢弃 |
  | B1–B5 | `CYNING_HARNESS` / `--with-scripts` / `wizard/` 路径 / `harness:<name>` script 名 / 其他裸 `@cyning/harness` 引用 | **仅报告「需人工」，不替换** |

- **纪律**：marker 行与块外内容字节不动；`<!-- cyning-harness-local:begin -->` 块永不改写；`docs/tasks/`、`docs/harness/reviews/`、`docs/harness/invokes/by-task/`（S2）一律拒写。
- **preflight（--yes 专用 fail-fast，exit 2 零写入）**：git 脏树 / 单文件新旧字面混杂（MIXED）/ marker 配对畸形（MALFORMED）/ S2 断言闸任一命中即拒写。脏树判定采用 `git status --porcelain` 语义——**untracked 文件也计入脏树**，`--yes` 前请先 commit 或 `git stash -u`。
- **备份与回滚**：--yes 写盘前原字节备份到 `.coding-kit/backups/refresh-ide-blocks/<UTCts>/`（保留最近 5 代）；回滚首选 `git checkout -- <path>`，非 git 仓用备份 cp 回。备份仅供本机回滚——建议消费者将 `.coding-kit/backups/` 加入 `.gitignore`（不入库）。存量树可能仍有 legacy `.cyning-harness/backups/`；新写不再以此为目标。
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


### P0 门禁退出码（failClosed · F2 / 1.x MVP）

| 退出码 | 含义 | 典型命令 |
|--------|------|----------|
| **0** | 通过 / 仅信息 | `check` **恒为** 0（只给版本建议） |
| **1** | 用法错误或非阻断失败 | 缺必填旗标、未知参数 |
| **2** | **门禁阻断** — failClosed，不得放行 | `verify` / `gate-check` / `audit` 的 P0 失败；`test_strategy=required` 时 D5 无测试制品 |

**failClosed**：P0 门禁失败一律 **exit 2**。CI / Agent 须把 2 当硬停（与 Claude Code hook「退出码 2 阻断」同族）。禁止在本地把 2 改映射成 0 以求「继续跑」。

**分层强制（文档级 · 1.x 不引入云/远程策略引擎）**：

1. 消费者仓库内的机械门禁结论（`verify` / `gate-check` / `audit` 的 exit 2）优先于「本地习惯跳过门禁」。  
2. task 表 `HG-AUDIT-R1=approved` 之后，hat 30 才可改码。  
3. kit P0 **不依赖**宿主 hooks——判定在进程内 CLI 完成。


### pins consumer 模式（消费仓钉版保鲜 · 3.0.2+）

面向**消费** spec-wave 的仓。以往每次升级要手工对齐多个面（`package.json` 精确钉版、CI workflow 里的 `spec-wave@<x.y.z>` 字面、测试 mock 版本字面），任一面漏改即静默漂移。`pins check --consumer` 把它收成一条 CI 机械门禁（漂移 → exit 2）：

- **真值源（回退链）**：`package.json#devDependencies.spec-wave` → `#dependencies.spec-wave` → `#version`，首个字符串胜；三处皆缺 → exit 2 点名完整链。可用 `--truth <path#jsonpath>` 显式指定（如 `--truth package.json#devDependencies.spec-wave`；绝对路径与 `../` 拒绝）。
- **精确版本**：`X.Y.Z` 直接采用；`^`/`~` 前缀归一并给出可见 WARN（`--json` 下入 `warnings`）；其余形态（`*`、`workspace:*`、范围表达式）→ exit 2 并建议改精确钉版。
- **默认钉面**（零配置）：`.github/workflows/*.{yml,yaml}` 中凡字面含 `<pkg>@X.Y.Z` 的文件逐文件合成钉；不含该字面的 workflow 跳过（不误 BLOCKED 无关文件）。
- **可选声明源** `.spec-wave/pins-consumer.yaml`——存在即替代默认钉面；文件损坏 → exit 2 failClosed（坏的声明源绝不静默当作不存在）：

```yaml
version: "1"
package_name: spec-wave   # 可选，缺省 spec-wave
pins:
  - id: consumer-test-mocks
    path: tests/test_capability_harness_cli.py
    extract: { kind: regex-all, pattern: 'spec-wave@(\d+\.\d+\.\d+)', flags: g }
    expected: { kind: package-version }   # = consumer 真值版本
    required: true
    fixable: true
```

- `pins fix --consumer` 默认 dry-run；`--yes` 才写盘（S2 过程目录机械拒写不变）。
- **分工**：release 模式（无旗标）面向 spec-wave 发布仓自身（`assets/release-pins.yaml`）；`--consumer` 面向消费仓。


## 从 @cyning/harness 迁移

完整清单、F4 方案 B 布局与 **已公布** EOS / deprecate 日历：见 [`MIGRATION.md`](./MIGRATION.md)。

钉 **spec-wave@3.0.2** 后可去掉 `@cyning/harness`。最小路径三步（必须，按序）：

1. 把 `devDependency` `@cyning/harness` 换成 `spec-wave`（钉 `3.0.2`；曾用名 `dsh-coding-kit`）。
2. 在仓根执行 `npx spec-wave upgrade --yes`（读优先 `.coding-kit/manifest.json`，否则 legacy `.cyning-harness/manifest.json`；**写入** `.coding-kit/manifest.json`，`version` 钉 3.0.2，`from_version` 记旧号；**不删除** `.cyning-harness/`）。
3. CI / 脚本里把 `npx @cyning/harness` / `npx dsh-coding-kit` 换成 `npx spec-wave`。

**布局**：过程落盘现行根为 **`.coding-kit/`**；`.cyning-harness/` 为 **legacy 只读**。勿再把 `.cyning-harness` 当新标准目录。

Skill 安装为 **推荐、非必须**（最小路径不依赖 DSH 扫 skill）。命令一律 `npx spec-wave`。旧包 **`@cyning/harness` 已在 npm deprecate**（2026-09-10 · 仅维护者可操作）；请钉 **`spec-wave@3.0.2`** 并按 `MIGRATION.md` 迁移。

### FAQ · pnpm peer

若 pnpm 安装仍因 peer 链失败（例如解析到未公开发布的宿主包）：在仓根设 `auto-install-peers=false`（或单次 `pnpm add -D spec-wave --config.auto-install-peers=false`）。即使 **1.2.2** 已将 cordis / dsh-tools 标为 optional，也建议保留此兜底。

### 可复制 Prompt（给存量仓 Agent）

整段粘贴：

````text
你 = 本仓库维护 Agent。把本仓从 @cyning/harness 迁到 spec-wave@3.0.2。

最小路径（必须，按序）：
1. package.json 的 devDependency：删除 @cyning/harness，改为 spec-wave（钉 3.0.2；曾用名 dsh-coding-kit）。
2. 在仓根执行：npx spec-wave upgrade --yes
   （读 .coding-kit/manifest.json 或 legacy .cyning-harness/manifest.json；写入 .coding-kit/manifest.json；version 钉 3.0.2，from_version 记旧号；不删除 .cyning-harness/；不覆盖 docs/tasks、reviews、invokes/by-task。）
3. CI 与脚本里所有 npx @cyning/harness 与 npx dsh-coding-kit 换成 npx spec-wave。
命令一律 npx spec-wave。禁止再写 npx @cyning/harness skills build。
布局与 EOS 日历见 MIGRATION.md（人闸未批前不得宣称已 deprecate）。

推荐（非必须 · Skill 安装）：
- 仓内：npx spec-wave skills install
  复制 npm 包内已生成 skills（默认不含 30/40）到本仓 .dsh/skills。已有文件默认不覆盖；要覆盖才加 --force。
- 用户级：npx spec-wave skills install --global
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

- `npx --yes spec-wave@<pin> verify …`
- `npx --yes spec-wave@<pin> task …`

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

**现行包**：**`spec-wave@3.0.2`** — **已发布**（registry `latest=3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · tag `v3.0.2` ↔ tip `3d71b90` · 2026-09-24 实测）。前一已发：**`3.0.1`**（信号质量 patch）· **`3.0.0`**（架构跃迁）· **`2.4.2`**（验收修复 patch）· **`2.4.1`**（验收修复 patch）· **`2.4.0`**（门禁强度补全）· **`2.3.1`**（验收修复 patch）· **`2.3.0`**（接线补全）· **`2.2.1`**（验收修复 patch）· **`2.2.0`**（闭环起步）。

发布流程见 [RELEASING.md](RELEASING.md) —— publish 前硬步骤 checklist（先 commit 后 publish · 四门全绿 · 版本钉同步 · **Agent 可 bump/tag** · **`npm publish` 仅人**；DEF-001 教训制度化）。

## GitHub topic

本仓库当前 GitHub topics：**`dsh-plugin`**（DSH 官方发现机制 tag，见上游 deepseek-harness `README.md` 与 `CONTRIBUTING.md`；无应用商店）、**`deepseek-harness`**、**`dsh-plugins`**、**`dsh`**。`package.json` 的 npm keywords 同样含 `dsh-plugin` 与 `deepseek-harness`。

## License

MIT
