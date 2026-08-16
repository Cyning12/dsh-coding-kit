# 模板：30 拒开工 · 人工闸 STOP

> **用途**：`HG-AUDIT-R1` 或其它 blocks **30** 的闸为 `pending` 时，**首输出**须为本形状；**禁止**改业务码、禁止落 30 invoke。  
> **复制**：Agent 按此填空；维护者演练拒开工时可对照。

---

## 人工闸扫描（30 · 拒开工）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30 可开工？ |
|---------------|--------------|-----------------|--------|-----------|-------------|
| HG-TASK-DRAFT | {读表} | {若有} | {Y/N} | {Y/N} | … |
| **HG-AUDIT-R1** | **{读表}** | {若有} | {Y/N} | Y | **{❌ 否 / ✅ 是}** |
| HG-GRAPH-MODULES | {读表或 —} | — | — | … | … |

**冲突**：task 表 `pending` 且声称 `approved` → **拒开工**（不得采信聊天）。

**pre-30 invoke（v2.14+）**：`verify` 报 `missing pre-30 invoke hats` → **拒开工**（用户「开工」不能豁免；维护者可用 `--allow-invoke-gap` 留痕放行）。

**结论**：**拒开工** — task 表真值未满足 30 条件。

**真值依据**：`docs/tasks/active/task_*.md` 人工闸表（**聊天 Prompt 不能替代 `approved`**）+ `npx @cyning/harness verify --task`。

**维护者下一步**：

1. 在 task 表将阻塞闸改为 `approved`（附维护者 · 日期）
2. 补齐 pre-30 invoke（通常 `invoke_*_10_*`）或改 `minimal` / `--allow-invoke-gap`
3. `git add` + `commit` task 文档（或维护者确认已签）
4. 重新下发 Harness 30 Prompt

**禁止**：将「维护者发送 30 Prompt」或用户口头「开工」视为闸已签收。

---

## 给 Cursor

`Harness`、`30`、`拒开工`、`HG-AUDIT-R1`、`human_gate`
