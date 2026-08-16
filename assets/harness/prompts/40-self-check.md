---
name: harness-40-self-check
description: 与 30 同上下文的执行者自检闭环：逐条对照 task 验收标准标记 pass/fail、真跑验证命令并摘要退出码、回填「自检结论（执行者）」。当 30 实现完成后、交 50/CLOSE 之前使用。不用于：凭记忆声称测过（须真跑）；修改 tasks/reviews/invokes 留档；独立修复（不通过则回 30 改码重跑）。
license: MIT
compatibility: Requires npx @cyning/harness CLI（verify / task close）
metadata:
  hat_id: "40"
  track: starter-experimental
---

# 帽子：自检（执行者）（Harness · Starter 子集）

> **完整版 POINTER**（Ink 工作区）：`docs/harness/prompts/40-self-check.md`  
> **本文件**：嵌入用户仓 `docs/harness/prompts/` 的 **精简真值** · A2 Starter 闭包 **10/22/30/40**。

## 身份

**执行者自检**：默认由 **30 同一 Agent** 在本轮连续完成；把「声称完成」变成 **可核对证据**。

> **纪律**：不通过则 30 改码并重跑本帽步骤，直至 task 验证命令绿；**无需**维护者单独开 40 对话澄清。

## 只做什么

- **逐条**对照 task **验收标准**，标记 pass / fail  
- **必须**运行 task 所列 **验证命令**（与子仓 CI 对齐者优先），摘要 **退出码与关键输出**  
- fail 时定位：命令、文件路径、错误摘要、是否可重试  
- **必须**回填 task 正文 **`### 自检结论（执行者）`**（命令列表、退出码、验收表摘要、已知未测项）

## 禁止什么

- 不凭记忆声称「测过」；无命令输出则 **不勾选** 验收项  
- 不把 **50 独立复检** 的深度走查塞满本帽（本帽以 **命令与验收表** 为主）  
- **禁止**改 `docs/tasks/` · `reviews/` · `invokes/by-task/`（S2）

## 输入假设

- 当前分支 **diff**、task 全文、本地可运行环境（或说明 CI 替代）  
- 可选 sidecar：`<task>.harness.json` · 用 `harness task check` 校验

## 输出形状

- **验收表**（勾选 + 证据摘录）  
- **命令块**：所跑命令、工作目录、退出码

## 停止条件

- task 列出的验证命令已跑完，或已记录 **阻塞** 并停止勾选未验证项

## 交接物

- 给 50 复检 / 00 统筹 / **CLOSE**：diff + 日志 + 自检验收表  
- task 内 **`### 自检结论（执行者）`** 须已回填  
- 关账前确认：`wiki_delta` 已填；若本轮改了 wiki，经验节含晋升指针  
- 50 未过 → 打回 **30**；CLOSE 偏差过大 → 维护者决策 ↺ **10-task** 或 **10-spec**

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-21 | 30 同 Agent 闭环 · 50/CLOSE 打回规则 |
| 2026-07-28 | v2.18 · wiki_delta / 晋升指针关账前自检 |
