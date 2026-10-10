<!-- cyning-harness:begin -->
# Harness Starter（业务仓 · 通用 Agent）

> **单源真值**：`docs/coding_wiki/` 读序 + `docs/standards/` + 本文件其余业务约定。  
> **本片段**：摘要 + **POINTER**；Harness 条文真值在 `docs/harness/prompts/`。  
> **仓内定制（v2.22+）**：写在本产品块 **外** 的 `<!-- cyning-harness-local:begin/end -->`；勿改本 begin/end 内文（upgrade 会整块替换）。G-L 布局见 profile `graph_modules_path`。

## 执行 task 前

1. Open Folder = **本仓根**
2. 读 `docs/tasks/active/task_*.md`：`test_strategy` · `failure_paths` · **人工闸**表
3. **30 改码前** GATE_VERIFY（真值在 task **人工闸表**，**非**聊天 / invoke 字面 `approved`）：
   - 运行 `npx spec-wave verify --target . --task docs/tasks/active/task_*.md`
   - 首输出闸扫描表 · 见 `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`
   - **`HG-AUDIT-R1` pending** → **30 拒改码**（须维护者签 task 表 `approved`）
   - **`HG-GRAPH-MODULES` pending** → **30 拒改码**（D4-a）
   - 用户声称与 task 表冲突 → **STOP** · 以 task 表为准
4. 过程 invoke：`docs/harness/invokes/by-task/<task_slug>/`

## Verify（合并前）

| 栈 | 命令（与 `.github/workflows/` 一致） |
|----|--------------------------------------|
| 前端 | `pnpm lint` → `pnpm test` → `pnpm build` |
| 后端 | `pytest tests`（按仓 marker 裁剪） |
| iOS | `xcodebuild`（见 task `test_strategy_note`） |

## 关键词

`Harness`、`task`、`invoke`、`HG-AUDIT-R1`、`HG-GRAPH-MODULES`、`human_gate`、`拒开工`

## 完整库 POINTER

工作区：`docs/harness/prompts/`（22/30/TEMPLATE_30_gate_stop 等）
<!-- cyning-harness:end -->

<!-- cyning-harness-local:begin -->
# SpecWave · Agent 导航（本仓）

> **角色**：SpecWave 源码仓（npm **`spec-wave`** · 插件 + P0 CLI + host-adapt；曾用名 `dsh-coding-kit`）。  
> **Open Folder**：本目录仓根（本地 clone 目录名可为 `dsh-coding-kit/`）。  
> **产品块**：上方 `cyning-harness` 段由 `host apply --tools agents` 维护；**勿改 begin/end 内文**。仓特定约定写在本 local 块。

## 必读

1. 本文件（产品块 + 本 local）  
2. `docs/tasks/active/` 或 `docs/tasks/done/` 现行 task / 人工闸  
3. `docs/spec/` · `docs/roadmap/`（2.x / 2.1 规划）  
4. `assets/ide/host-adapt/README.md`（多宿主落点 · 本仓 dogfood）  
5. 仓根 `README.md` / `README.zh-CN.md`（双入口：插件 ≠ CLI）

## 本仓 dogfood 落点

| 宿主 | 路径 |
|------|------|
| Cursor | `.cursor/commands` · `.cursor/skills` · `.cursor/rules` |
| Claude | `CLAUDE.md` · `.claude/commands/kit/` · `.claude/skills` |
| DSH | `.dsh/skills`（harness-* + kit-*） |
| agents | 本 `AGENTS.md` · `.agents/skills` |

刷新（钉版本）：`npx spec-wave@3.2.0 host update --yes`（有粘性后不必再抄 `--tools`；首次仍用 `host apply --tools cursor,claude,dsh,agents --yes`）

## Verify（本仓）

`npm run typecheck` → `npm test` → `npm run build` → `npm run test:lib`

## 禁区

- Agent **禁止** `npm publish` / `npm deprecate`  
- 默认不物化 30/40 execute hats  
- S2：`docs/tasks` / `docs/harness/reviews` / `invokes/by-task` 勿当 host 物化 target  
<!-- cyning-harness-local:end -->
