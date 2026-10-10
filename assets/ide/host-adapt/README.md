# Host-adapt · 落点矩阵与 CLI（3.1.0）

> 适配表示例：[`examples/mvp-hosts.yaml`](./examples/mvp-hosts.yaml)  
> Schema：[`host-adapt.schema.json`](./host-adapt.schema.json)  
> 仓根叙事：README「一包多宿主」· 录屏清单：[`../../../docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md`](../../../docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md)  
> 规划：[`../../../docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md`](../../../docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md)

## CLI

```bash
npx spec-wave host validate [--file PATH] [--json]
npx spec-wave host apply --tools cursor,claude[,dsh,agents,copilot,codex,windsurf,gemini,opencode,roo,zed,cline,aider|all] --profile core|expanded [--dry-run|--yes]
npx spec-wave host update [--tools LIST|all] [--profile core|expanded] [--yes] [--force]
npx spec-wave init --preset harness-only [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt] [--yes]
```

- 默认 **dry-run**；`--yes` 才写盘（`host apply` / `host update`）。  
- **U-01**：表 version / 可选 `dsh-tools` peer 不匹配 → exit **2**、零写入。  
- 默认**跳过** `harness-30-execute` / `harness-40-self-check`（与 `skills install` 同口径）。  
- **`expanded`**：在 core 之上物化 `kit-hat-*`（及 `kit-graph-check` / `kit-sync-prompts-guide`）；禁 `kit-30` / `kit-publish`。  
- **无 postinstall** 静默写盘；装包 ≠ 物化。

### `--tools` 词表

| 值 | 含义 |
|----|------|
| `cursor,claude,dsh` | 逗号列表（`host apply` **须**显式传） |
| `all` | 适配表全部 `host_id` |
| `none` | **仅 `init`**：跳过 host 物化（只做过程根） |

## 粘性 · `.coding-kit/host-tools.json`

`host apply` / `host update` / `init`（含物化）在 **`--yes` 成功写盘** 后写入或更新：

```json
{
  "version": 1,
  "host_ids": ["cursor", "claude", "dsh", "agents"],
  "profile": "core",
  "updated_at": "2026-09-10T00:00:00.000Z",
  "kit_semver": "2.3.0"
}
```

- 属过程根 `.coding-kit/`；**可入库**，便于团队同选型。  
- dry-run **不**写粘性。  
- `init --no-host-adapt`：**不** apply **亦**不写粘性（避免「记住了却未物化」）。  
- `init --tools none`：只做过程根，不写粘性。

## `host update` 解析序（方案 A · 相对 2.1.0 BREAKING 小）

1. CLI 给了 `--tools`（含 `all`）→ 用 CLI  
2. 否则若粘性存在且 `host_ids.length ≥ 1` → 用粘性  
3. 否则 → **exit 1**（提示先 `apply` / `init`，或传 `--tools LIST` / `--tools all`）

相对 **2.1.0**「省略 `--tools` = 适配表全量」：有粘性时 `host update --yes` **只**刷已选宿主；无粘性且无 `--tools` **不再**默默全表。

升包后推荐：

```bash
npx spec-wave@3.1.0 host update --yes
```

## `init` 选型（对齐 OpenSpec）

| 环境 | 无 `--tools` |
|------|----------------|
| TTY | **默认询问**（多选 cursor / claude / dsh / agents / copilot / codex / windsurf / gemini / opencode / roo / zed / cline / aider / all / none） |
| 非 TTY / CI | **exit 1** · 须显式 `--tools all\|none\|LIST` |

```bash
# 非交互：过程根 + 物化
npx spec-wave init --preset harness-only --tools cursor,claude,dsh --yes

# 非交互：仅过程根
npx spec-wave init --preset harness-only --tools none --yes
```

`tools≠none` 且未 `--no-host-adapt` → 同进程 `host apply` + 写粘性。

## 宿主 × 表面（MVP）

| host_id | always_on | commands (core) | skills |
|---------|-----------|-----------------|--------|
| `cursor` | `.cursor/rules/*.mdc` | `.cursor/commands/kit-*.md` | `.cursor/skills` |
| `claude` | `CLAUDE.md`（marker merge） | `.claude/commands/kit/<verb>.md`（`/kit:verb`） | `.claude/skills` |
| `dsh` | （可空） | **`[]`（禁止 `.dsh/commands`）** | `.dsh/skills`：帽子 `assets/skills/*` **+** 编排 `assets/ide/skills-orch/*`（`/kit-*`） |
| `agents` | `AGENTS.md`（产品 marker + **local** 定制） | 可空 | `.agents/skills` |
| `copilot`（2.2 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.github/skills` |
| `codex`（2.2 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.agents/skills`（官方 repo 级扫描目录） |
| `windsurf`（2.2 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.windsurf/skills` |
| `gemini`（2.3 W6） | **`GEMINI.md`**（复用同一 Harness Starter 片段 · 内容宿主中立） | `[]` | `.gemini/skills`（官方自动发现目录） |
| `opencode`（2.3 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.agents/skills`（官方 agent-compatible 路径） |
| `roo`（2.3 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | 不物化（无官方 skills 目录约定） |
| `zed`（2.3 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.agents/skills`（官方 project-local 目录） |
| `cline`（2.3 W6） | `AGENTS.md`（复用 agents 片段） | `[]` | `.cline/skills`（官方推荐 workspace 目录） |
| `aider`（2.3 W6 · **降级**） | `AGENTS.md`（复用 agents 片段 · 注入层支持） | `[]` | 不物化（无官方 skills 约定） |

> 2.2 W6 三宿主（copilot / codex / windsurf）原生读 `AGENTS.md`，always_on 与 skills 资产**全量复用** `agents` 行（近零新资产）；无宿主专属 commands 资产故为 `[]`。多宿主同选时 `AGENTS.md` 走 marker merge（幂等）。
>
> 2.3 W6 六宿主（gemini / opencode / roo / zed / cline / aider）同制复用（**零新资产**），落点逐宿主官方文档取证（2026-09-13 · 取证卡见 W6 task）：
> - **gemini**：官方上下文文件为 **`GEMINI.md`**（AGENTS.md 不在默认 `context.fileName` 列表）→ always_on 落 GEMINI.md；skills 官方目录 `.gemini/skills`；commands 官方为 `.gemini/commands/*.toml` 专属格式，本波 `[]`。
> - **opencode / zed**：官方支持项目根 `AGENTS.md`；skills 官方目录 `.agents/skills`（与 agents/codex 行同构同源）。
> - **roo**：官方仓已合并 AGENTS.md 加载（PR #10446）；原生约定 `.roo/rules/` 目录需专属资产，本波不建；无官方 skills 目录约定 → 不物化。
> - **cline**：官方支持 `AGENTS.md`（跨工具标准格式）；skills 官方推荐 `.cline/skills`；原生 `.clinerules/` 为替代约定（不建）。
> - **aider（降级 · 如实标注）**：官方约定为 `CONVENTIONS.md` 显式 `--read` 或 `.aider.conf.yml` 配置 `read:`，**无 AGENTS.md 自动加载**；落 AGENTS.md 为跨工具注入层价值（同仓 AGENTS.md 系宿主共享），aider 侧须用户自行 `aider --read AGENTS.md` 或配置。
> - skills 目录无官方约定者（roo / aider）**不强造目录**；`commands: []` 不暗示 P0 门禁在新宿主内生效（verify 真值在 CLI）。

Core 五命令：`kit-apply-standards` · `kit-verify` · `kit-gate-status` · `kit-init-guide` · `kit-hat-reanchor`（前缀 **`kit-`**；禁止冒充 `opsx-*`）。  
Expanded（`--profile expanded`）：`kit-hat-00-delegate` · `kit-hat-10-spec` · `kit-hat-10-task` · `kit-hat-20-spec-audit` · `kit-hat-20-task-audit` · `kit-graph-check` · `kit-sync-prompts-guide`。

## 纪律

- **S2**（`docs/tasks` / reviews / invokes）永不作为物化 target。  
- **local** 块（`cyning-harness-local`）永不覆写。  
- **update**：conflict 默认 skip；`--force` 显式覆盖并备份 `.coding-kit/backups/host-update/`。

## 本仓 dogfood（最短路径）

`spec-wave` **源码仓也是消费者**。发版后或改 assets 后在仓根：

```bash
# 首次 / 改选型
node ./lib/cli.js host apply --tools cursor,claude,dsh,agents --profile core --yes
# 或：npx spec-wave@3.1.0 host apply --tools cursor,claude,dsh,agents --profile core --yes

# 升包后只刷已选（读粘性；不必再抄 LIST）
npx spec-wave@3.1.0 host update --yes
```

落点（`.cursor/` · `.claude/` · `.dsh/` · `.agents/` · `CLAUDE.md` · `AGENTS.md`）**应入库**。  
**`AGENTS.md`**：上方 harness 产品块 = 通用 Agent 入口；仓特定导航写在 `cyning-harness-local` 块（upgrade 不覆写）。真值源仍是 `assets/`。
