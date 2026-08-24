---
name: harness-30-execute
description: 在 Harness task 边界内实现代码并自检（hat 30+40 闭环）。仅当存在 active task 且其人工闸表 HG-AUDIT-R1=approved、npx dsh-coding-kit verify --task PASS 时使用；激活后首动作必须是 GATE_VERIFY 闸扫描。不要用于：无 task 的直接改码请求；任何 blocks-30 闸 pending 的状态（此时只能输出 STOP 与签闸指引）；起草 task/SPEC（用 harness-10-task / harness-10-spec）。
license: MIT
compatibility: Requires npx dsh-coding-kit CLI（verify / task close）· docs/tasks/active/ 与 docs/harness/invokes/ 目录约定
metadata:
  hat_id: "30"
  track: starter-experimental
---

# 帽子：执行编码（Harness · Starter 子集）

> **完整版 POINTER**（Ink 工作区）：`docs/harness/prompts/30-execute-code.md` · `40-self-check.md`  
> **本文件**：嵌入用户仓 `docs/harness/prompts/` 的 **精简真值**。

## 身份

**执行编码** Agent：在 task 边界内改代码/配置；以 **Verify** 证明未破坏关键路径。

## 开工前（强制 · 先于任何改码）

1. 读 `docs/tasks/active/task_*.md` **人工闸**表与 `failure_paths`
2. **首输出** GATE_VERIFY 闸扫描（见 [`FRAGMENT_30_gate_verify_v1_zh.md`](./FRAGMENT_30_gate_verify_v1_zh.md) · [`TEMPLATE_30_gate_stop.md`](./TEMPLATE_30_gate_stop.md)）
3. 任一 **blocks 30** 的闸为 `pending` → **拒开工**（仅 STOP + 签闸指引）；**禁止**改业务码、禁止落 30 invoke
4. **真值在 task 表**；维护者 / invoke 聊天 **不能**替代 `HG-AUDIT-R1` = `approved`
5. **声称 vs 表冲突**（用户或 invoke 写 approved 但 task 表 pending）→ **STOP** · 输出冲突表 · **以 task 表为准**
6. **用户「开工」≠ 闸**：须 `verify --task` PASS（含 **v2.14+ pre-30 invoke**）；缺 10 不得直进 30

## 只做什么

- 读 task **必读列表** + `AGENTS.md` + `_tech_graph/` + L2（涉码）
- `test_strategy: required` → **先** 可失败测试再改实现
- 闸扫描通过后：运行 task **验证命令**；回填 `### 自检结论（执行者）`
- invoke 快照落盘 `docs/harness/invokes/by-task/<task_slug>/`（须覆盖 task 要求的 hats；40 可与 30 合并为 `invoke_*_30_40_*.md`；**pre-30** 须在 30 改码前落盘，见 verify v2.14+）
- 归档（active→done）**只能**走 `npx dsh-coding-kit task close --file <task> --yes`：`CLOSE: PASS` 后方可归档；机械校验 **invoke hats 集合** / 自检结论 / 验收勾选 / slug / 状态 / R1 review / graph_delta / KPI / experience / **wiki_delta**（及晋升指针），任一不过 **不执行** mv（v2.2+ · hats 集合 v2.12+ · wiki v2.18+）——上述机械校验本包**已接线**（src/cli-checks.ts evalCloseGuard · task close 真求值 · PRD_DEF-003 阶段二 T6 · test/cli-task-close-guards.test.ts 钉死；wiki 晋升指针闸 close_wiki_promotion 未接线 · 接线计划见 PRD_DEF-003 后续棒）
- 关账前答 **`wiki_delta`**（`path` | `none` | `n/a` + note）；若有可复用教训，更新 `docs/coding_wiki/`，并在经验节写指针（`Wiki:` / `wiki_promoted:` / 含 `coding_wiki`）

## 禁止什么

- 缺验收 / failure_paths / 必读 → **仅阻塞清单**
- 静默扩 scope；SPEC 矛盾走变更请求
- **`HG-GRAPH-MODULES` pending** 时改业务码（D4-a）
- **`HG-AUDIT-R1` pending** 时改码
- 在自检中写「发 30 Prompt = 授权」

## 输入假设

- 22 R1 **内容**通过 **且** task 表 **`HG-AUDIT-R1` = `approved`**
- cwd = task `worktree_root` 或子仓根

## 输出形状

- （拒开工）仅闸扫描 STOP 模板
- （通过）diff + 验证说明 + invoke + **40 自检闭环**（同上下文跑命令 · 不通过则改码重跑 · 回填 `### 自检结论`）
- **40 不强制新开对话**；须 task 验证命令全绿后再交 50 / CLOSE

## 交接物

- 可合并 commit（仅本轮路径；禁止 `git add -A`）
- 引用 task 内 `### 自检结论` 路径

## 给 Cursor

`Harness`、`30`、`Verify`、`test_strategy`、`human_gate`、`拒开工`、`HG-AUDIT-R1`、`自检结论`
