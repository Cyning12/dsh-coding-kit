# SpecWave

[![npm 版本](https://img.shields.io/npm/v/spec-wave.svg)](https://www.npmjs.com/package/spec-wave)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**编写一次 AI 编码规则，SpecWave 将其原生安装到 Cursor、Claude Code、Copilot 等 10 多个工具中。**

简体中文 | [English](README.md)

---

## 问题所在

手工维护每个 AI 编码工具的单独配置文件：

```
.cursorrules              ← Cursor 规则（复制粘贴）
CLAUDE.md                 ← Claude Code 约定（重复）
.github/copilot-instructions.md  ← Copilot 设置（也是重复）
.windsurf/rules.md        ← Windsurf 规则（你懂的...）
```

每次更新一个文件，就要手动同步其他文件。规则漂移，团队浪费时间。

## SpecWave 解决方案

**单一真值源。** 一条命令。原生安装到所有工具。

```bash
npx spec-wave host apply --tools cursor,claude,copilot,windsurf --yes
```

SpecWave 读取你的声明式适配表，生成每个工具期望的原生配置文件：

| 使用 SpecWave 之前 | 使用 SpecWave 之后 |
|-----------------|----------------|
| 手动维护 5+ 个配置文件 | 维护 **一个适配表** |
| 在工具间复制粘贴规则 | 运行 **一条命令** 同步所有工具 |
| 规则在工具间漂移 | **单一真值源** |
| 无强制执行 | **闭环门禁**（exit 2） |

---

## 快速开始

```bash
# 1. 安装并初始化
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude --yes

# 2. 验证所有设置
npx spec-wave@3.0.2 check

# 3. 应用编码标准到你的 IDE
# Cursor 用户：重启 Cursor 加载新规则
# Claude Code 用户：重启 Claude Code 加载新命令
```

**就这样。** 你的编码规则现在在两个工具中都激活了。

---

## 支持的宿主（13 个工具）

SpecWave 为每个宿主生成原生文件。一个适配表，13 个目标：

| 宿主 | 生成的文件 | 备注 |
|------|----------------|-------|
| **Cursor** | `.cursor/rules/*.mdc`<br>`.cursor/commands/kit-*.md`<br>`.cursor/skills/` | 原生 Cursor 规则和命令 |
| **Claude Code** | `CLAUDE.md`<br>`.claude/commands/kit/*.md` → `/kit:*`<br>`.claude/skills/` | 产品 marker 块 + 命令 |
| **GitHub Copilot** | `AGENTS.md`<br>`.github/skills/` | 原生 GitHub skills 目录 |
| **Codex** | `AGENTS.md`<br>`.agents/skills/` | 仓库级扫描目录 |
| **Windsurf** | `AGENTS.md`<br>`.windsurf/skills/` | 原生 Windsurf skills |
| **Gemini CLI** | `GEMINI.md`<br>`.gemini/skills/` | 原生 Gemini 上下文文件 |
| **OpenCode** | `AGENTS.md`<br>`.agents/skills/` | Agent 兼容路径 |
| **Roo Code** | `AGENTS.md` | 通过 merged PR 加载 AGENTS.md |
| **Zed** | `AGENTS.md`<br>`.agents/skills/` | 项目本地目录 |
| **Cline** | `AGENTS.md`<br>`.cline/skills/` | 工作区 skills |
| **aider** | `AGENTS.md` | 注入层（需要 `aider --read AGENTS.md`） |
| **DSH** | `.dsh/skills/` | 帽子技能 + 编排 |
| **agents** | `AGENTS.md`<br>`.agents/skills/` | 通用 agents 标准 |

> **13 个宿主。一条命令。** 无需手动编辑文件。

---

## 为什么要闭环门禁？

SpecWave 包含强制执行过程纪律的 **P0 门禁**：

```bash
# 更改代码前，验证任务批准
npx spec-wave verify --task docs/tasks/active/task_login-limit.md
# 退出码 2（阻塞）= 不要继续
# 退出码 0（通过）= 已批准，继续
```

**闭环**意味着：如果门禁失败，命令以退出码 `2`（不是 `0` 或 `1`）退出。CI 和 agent **必须**将退出码 `2` 视为硬停止。

- **退出 0**：通过
- **退出 1**：用法错误（非阻塞）
- **退出 2**：门禁阻塞 — **不要继续**

这确保了：
- 代码更改前的人工批准
- 需要时测试制品存在
- 实现前审查文件存在
- 没有静默失败

---

## 终端演示

<!-- TODO: 真实终端演示 GIF/SVG 占位符
     构建环境中没有录制工具（vhs/asciinema）。
     添加真实录制：npx spec-wave host apply --tools cursor,claude --yes
     显示原生文件生成 + 验证流程。
-->

**演示占位符：** 待添加真实终端录制。  
显示：`host apply` → 生成原生文件 → `verify` 门禁检查。

---

## 特性

### 🎯 单一真值源
一个声明式 `mvp-hosts.yaml` 生成所有工具特定的配置。无需手动同步。

### 🔒 闭环门禁
机械门禁（`verify`、`gate-check`、`audit`）在阻塞时以退出码 2 退出。没有静默绕过。

### 📋 Harness 过程
任务驱动的工作流程：
- `task.md`：带批准门禁的可执行工作单元
- `spec.md`：带审查门禁的需求规格
- `HG-AUDIT-R1`：在更改代码前必须 `approved` 的人工门禁

### 🔄 随处更新
升级 SpecWave 后，用一条命令刷新所有宿主：

```bash
npx spec-wave@3.0.2 host update --yes
```

读取 `.coding-kit/host-tools.json`（粘性选择）并只重新生成你正在使用的工具。

### 🧪 测试策略强制
当任务中 `test_strategy: required` 时，`verify` 门禁检查真实测试制品：
- 测试目录（`tests/`、`__tests__/`）
- 测试配置文件（`jest.config.js`、`vitest.config.ts` 等）
- 测试文件（`*.test.ts`、`*_test.py`）
- 带测试步骤的 CI

缺少测试制品 → 退出码 2（阻塞）。

---

## 真实世界示例

一个团队为 Cursor、Claude Code 和 Copilot 维护编码标准：

```bash
# 使用 SpecWave 前：手动编辑 3 个文件
vim .cursorrules
vim CLAUDE.md
vim .github/copilot-instructions.md

# 使用 SpecWave 后：编辑一个适配表
vim .coding-kit/mvp-hosts.yaml
npx spec-wave host update --yes
# 所有 3 个工具重新生成 ✅
```

**节省的时间：** 每次更新从几小时 → 几秒钟。  
**一致性：** 有保证（单一真值源）。  
**强制执行：** 闭环门禁防止人为错误。

---

## 安装与设置

### 前置要求

- **Node.js**：`^22.19.0` 或 `>=24.0.0`
- **不支持**：Node 20 及更早版本

检查你的版本：

```bash
node -v  # 期望 v22.19+ 或 v24+
```

### 使用 SpecWave 的三种方式

#### 1️⃣ CLI 用于 Cursor / Claude Code / CI（最常见）

```bash
# 用选定的工具初始化
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude --yes

# 或应用到现有仓库
npx spec-wave@3.0.2 host apply --tools cursor,claude,copilot --profile core --yes
```

#### 2️⃣ DSH 插件（可选）

```bash
# 作为 DSH 插件安装
dsh plugin --profile web add spec-wave

# 在对话中："请应用编码标准"
# 模型调用：apply_coding_standards 工具
```

#### 3️⃣ CI 集成

添加到 `.github/workflows/verify.yml`：

```yaml
- name: 验证任务门禁
  run: npx --yes spec-wave@3.0.2 verify --task docs/tasks/active/task_*.md
```

退出码 2 = 构建失败（门禁阻塞）。

---

## CLI 命令

### 核心命令

```bash
# 过程初始化
npx spec-wave init --preset harness-only --tools cursor,claude --yes

# 宿主管理
npx spec-wave host validate           # 验证适配表
npx spec-wave host apply --tools LIST --yes  # 生成原生文件
npx spec-wave host update --yes       # 升级后刷新

# 门禁（闭环：阻塞时 exit 2）
npx spec-wave verify --task FILE      # 实现前门禁
npx spec-wave verify --spec FILE      # 审查存在性门禁
npx spec-wave gate-check --task FILE  # 检查人工门禁
npx spec-wave audit --task FILE       # 审计追踪检查

# 任务管理
npx spec-wave task lint --file FILE   # Lint 任务文件
npx spec-wave task close --file FILE  # 归档到 docs/tasks/done/

# 工具
npx spec-wave check                   # 版本检查（始终 exit 0）
npx spec-wave sync prompts --yes      # 物化模板
```

### 退出码（闭环）

| 代码 | 含义 | 命令 |
|------|---------|----------|
| **0** | 通过或信息性 | `check`（始终 0） |
| **1** | 用法错误 | 缺少必需标志 |
| **2** | **门禁阻塞**（闭环） | `verify`、`gate-check`、`audit` |

**不要将退出码 2 重映射为 0。** 将其视为硬停止。

---

## 文档

- **[GLOSSARY.md](GLOSSARY.md)**：术语双语词汇表（task.md、Harness、帽子等）
- **[MIGRATION.md](MIGRATION.md)**：从 `@cyning/harness` 或 `dsh-coding-kit` 迁移
- **[RELEASING.md](RELEASING.md)**：维护者发布流程
- **[assets/ide/host-adapt/README.md](assets/ide/host-adapt/README.md)**：完整宿主矩阵与 CLI 详情

---

## 从 @cyning/harness 迁移

如果你正在使用旧的 `@cyning/harness` 包：

```bash
# 1. 替换依赖
# 在 package.json 中：@cyning/harness → spec-wave（钉 3.0.2）

# 2. 运行升级
npx spec-wave@3.0.2 upgrade --yes

# 3. 更新脚本
# 替换：npx @cyning/harness → npx spec-wave
```

完整清单见 [MIGRATION.md](MIGRATION.md)。

---

## 为什么选择 SpecWave？

✅ **一致性**：一个适配表，13 个工具。无漂移。  
✅ **速度**：更新一次，随处重新生成。  
✅ **强制执行**：闭环门禁防止绕过。  
✅ **透明度**：退出码 + 审计追踪。  
✅ **灵活性**：选择要针对的工具（`--tools LIST`）。  

**如果这节省了你的时间，一个 ⭐ 可以帮助其他人找到它。**

---

## 核心概念（深入）

> **初见？** 首小时术语在 [GLOSSARY.md](GLOSSARY.md) 中定义（双语）。

### task.md — 可执行工作单元

一个 `task.md` 文件描述一个工作单元：

- **背景与目标**：是什么和为什么
- **范围 / 非范围**：包含什么，不包含什么
- **失败路径**：已知风险
- **验收标准**：可运行的验证命令
- **Harness 元信息**：`test_strategy`、`wiki_delta`
- **人工门禁表**：必须 4 列；`HG-AUDIT-R1` 必须为 `approved`，帽 30 才可改码

**位置**：在途时 `docs/tasks/active/task_<slug>.md`。  
**归档**：`npx spec-wave task close --file FILE --yes` → 移到 `docs/tasks/done/`。

最小骨架：

```markdown
# Task：加登录限流

> **状态**：`draft`

## Harness 元信息
| 字段 | 值 |
|------|-----|
| **task_slug** | `login-rate-limit` |
| **test_strategy** | `required` |

### 人工闸
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | pending | 30 | R1 审查后人签 |

## 范围
为登录端点添加速率限制：每 IP 每 15 分钟最多 5 次尝试。

## 验收标准
- `pytest tests/test_rate_limit.py` 通过
- 手动测试：15 分钟内第 6 次尝试返回 429
```

### spec.md — 需求规格

一个 `spec.md` 文件是任务引用的已签署需求规格：

- **背景 / 范围 / 非范围**
- **验收标准**
- **失败路径**

**位置**：`docs/spec/<topic>/`（例如，`docs/spec/2_2-closed-loop-start/`）  
**门禁**：`npx spec-wave verify --spec FILE` 检查实现前是否存在书面审查。

### 人工门禁

人工门禁是 `task.md` 表中的批准检查点：

```markdown
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | approved | 30 | R1 审查后人签 |
```

- **`HG-AUDIT-R1`**：R1 审计门禁；必须为 `approved`，帽 30（实现）才可改码
- **`HG-GRAPH-MODULES`**：D4-a 门禁；必须为 `approved` 才能进行模块图更改

`npx spec-wave verify --task FILE` 将此表读取为真值源（聊天声称不算数）。

### 帽子系统

"帽子"是过程角色：

- **帽 00**：仅委派（无直接实现）
- **帽 10**：Spec/task 起草
- **帽 20**：Spec/task 审计
- **帽 30**：实现（需要 `HG-AUDIT-R1=approved`）
- **帽 40**：自检

帽 10/20 的 Skills 在 `.cursor/skills/`、`.claude/skills/` 等中（默认安装）。  
帽 30/40 的 Skills **不**默认安装（需要显式 `--with-execute-hats`）。

---

## 多宿主矩阵（详细）

一个声明式适配表 → 多个宿主的原生落点。验证真值保留在 CLI（`failClosed` exit 2）；IDE 命令只编排。

**注意**：安装 npm 包**不会**物化 IDE 文件（无 postinstall）。显式运行 `init --tools` 或 `host apply`。

| 宿主 | Always-On 规则 | 命令（profile `core`） | Skills |
|------|----------------|---------------------------|--------|
| **Cursor** | `.cursor/rules/*.mdc` | `.cursor/commands/kit-*.md` | `.cursor/skills/` |
| **Claude Code** | `CLAUDE.md`（marker 块） | `.claude/commands/kit/<verb>.md` → `/kit:verb` | `.claude/skills/` |
| **DSH** | （空） | `[]`（无 `.dsh/commands/`） | `.dsh/skills/`（帽子 + 编排） |
| **agents** | `AGENTS.md` 片段 | `[]` | `.agents/skills/` |
| **Copilot** | `AGENTS.md` 片段 | `[]` | `.github/skills/` |
| **Codex** | `AGENTS.md` 片段 | `[]` | `.agents/skills/` |
| **Windsurf** | `AGENTS.md` 片段 | `[]` | `.windsurf/skills/` |
| **Gemini CLI** | `GEMINI.md` | `[]` | `.gemini/skills/` |
| **opencode** | `AGENTS.md` 片段 | `[]` | `.agents/skills/` |
| **Roo Code** | `AGENTS.md` 片段 | `[]` | （无 skills 目录） |
| **Zed** | `AGENTS.md` 片段 | `[]` | `.agents/skills/` |
| **Cline** | `AGENTS.md` 片段 | `[]` | `.cline/skills/` |
| **aider** | `AGENTS.md` 片段（需要 `--read`） | `[]` | （无 skills 目录） |

**2.2 W6 新增**（同一包）：九个宿主复用 `agents` 资产面（零新资产）。每个落点遵循宿主的官方文档。

**2.1 新增**（同一包）：Claude `/kit:` 命名空间 UX，DSH 编排 skills，可选 `--profile expanded` 用于帽子薄壳。

---

## 高级：D5 测试制品检测

当任务中 `test_strategy=required` 时，`audit`/`verify` 运行 D5 检查：目标仓库必须包含**真实测试制品**，否则 exit 2。

**强信号探针**（存在 = 通过）：

- 目录：`test/`、`tests/`、`spec/`、`specs/`、`__tests__/`
- 配置文件：`jest.config.{js,ts}`、`vitest.config.{js,ts}`、`playwright.config.{js,ts}`、`cypress.config.js`、`pytest.ini`
- 测试文件名（3 层内）：`*.(test|spec).(js|ts|mjs|cjs)`、`*_test.py`、`test_*.py`

**CI 检测**：`.github/workflows/` 下的每个 `*.yml|*.yaml` 被扫描测试步骤模式：`pytest`、`vitest`、`jest`、`npm test` 等。

**已知误报**：单独的 `pyproject.toml`/`setup.py` **不是**测试制品。对于不在白名单中的自定义测试命令（例如，`make test`），添加强信号文件（例如，`tests/` 目录）。

---

## 图与本体（高级）

SpecWave 包含用于技术依赖建模的图能力：

```bash
npx spec-wave graph yaml compile     # 编译 YAML 图 → Mermaid
npx spec-wave graph yaml check       # 验证图结构
npx spec-wave graph yaml export      # 导出到 graph.json
npx spec-wave graph ontology check   # 验证本体
```

**本体边界**（3.0 ONTO-OPEN 裁决）：
- 图面是**开放的**：消费者可以创作自己的图。
- 捆绑本体（`assets/ontology.yaml`）**不开放**：无消费者定义的类/关系。
- 验证器开放 ≠ 本体内容开放。

本仓对 `docs/_tech_graph/` 进行 `graph yaml compile|check|export` 的 dogfood（npm 包中不提供）。

---

## 发版（维护者）

**当前包**：`spec-wave@3.0.2` — 已发布（registry `latest=3.0.2`，tag `v3.0.2` ↔ tip `3d71b90`，2026-09-24 验证）。

发布流程：见 [RELEASING.md](RELEASING.md) — 发布前硬步骤清单（commit-before-publish、四门全绿、版本钉、**仅人 `npm publish`**）。

---

## GitHub Topics

本仓库的 topics：`dsh-plugin`、`deepseek-harness`、`dsh-plugins`、`dsh`。

`package.json` 中的 npm keywords 包括 `dsh-plugin` 和 `deepseek-harness`。

---

## 许可证

MIT

---

## 链接

- **npm**：[npmjs.com/package/spec-wave](https://www.npmjs.com/package/spec-wave)
- **仓库**：[github.com/Cyning12/SpecWave](https://github.com/Cyning12/SpecWave)
- **Issues**：[github.com/Cyning12/SpecWave/issues](https://github.com/Cyning12/SpecWave/issues)

---

<sub>曾用名 SpecGate / `dsh-coding-kit` — 改名史：[MIGRATION.md](MIGRATION.md)。</sub>
