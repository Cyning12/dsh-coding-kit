# coding_wiki · LLM 读序与目录约定

复制本目录到用户仓 **`docs/coding_wiki/`**（含 `topics/`）。

> **纪律级别**：`recommended`（人读 / Agent 读序建议）。**不是** `task close` / `wiki_delta` 硬闸——漏目录仍可关账（字段闸见 USER_GUIDE §6.0 / §6.0b）。

---

## 默认两层（起步）

业务仓目标形态：

```text
docs/coding_wiki/
  README.md           # 读序 + 本约定 + 加深指引
  _index.md           # 可选主题索引
  stable.md           # 稳定度三件套留根（仅此类 + 读序）
  context.md
  volatile.md
  topics/             # 第 2 层：一主题一薄页，指针 docs/** 真值
    *.md
```

| 路径 | 层 | 说明 |
|------|-----|------|
| [`README.md`](README.md) | 读序 | 本文件 · 目录约定真值 |
| [`_index.md`](_index.md) | 索引 | 可选 · 主题→页指针 |
| [`stable.md`](stable.md) | stable | 短摘要 · 规范十二条 · IDE 规则指针 |
| [`context.md`](context.md) | context | L2、PROJECT_CONFIG 类指针 |
| [`volatile.md`](volatile.md) | volatile | 本 task 必读（由 task 引用） |
| [`topics/`](topics/) | 主题 | **一主题一薄页** · 勿在根堆长文 |

invoke §3 应 **pointer** 到本目录，勿重复贴长文。

---

## 原则

1. **根禁止堆主题长文**；主题进 `topics/`（根只留读序 + 稳定度三件套 + 可选 `_index`）。
2. **勿按日期 / PR / task_slug 建目录**（人扫会炸；时间线放 task/invoke，不放 wiki 树）。
3. **`wiki export` 不依赖目录深度**；关系图仍靠双括号 wikilink / 相对 `.md` 链（见下「目录 vs 图」）。
4. 本约定为 **recommended**：整理目录可写在 `wiki_delta=path`，但 **缺两层 / 未加深 ≠ close BLOCK**。

---

## 目录 vs 关系图

| | 文件夹树 | `wiki export` 图 |
|--|----------|------------------|
| 服务对象 | **人**扫目录、控爆炸 | Agent / Web / Obsidian **边** |
| 靠什么 | 两层起步 + 加深阈值 | 双括号 wikilink + md 相对链 |
| 加深后 | `git mv` 到 `topics/<子域>/` | **边不断**（修好链即可） |

详述与关账字段：[`docs/USER_GUIDE_v1.0_zh.md`](../../docs/USER_GUIDE_v1.0_zh.md)「Wiki 目录 vs 关系图」· `wiki_delta` 决策树见同文 **§6.0b**（本文不重复）。

> **防踩坑（v2.19+）**：叙述里勿写裸双括号字面当作「格式说明」（会被 `wiki export` 当边解析）；请写「双括号 wikilink」，互链只指向真实页。

---

## 加深阈值（第 3 层）

出现任一信号 → 考虑在 `topics/` 下加**子域**（例：`topics/obs/`、`topics/harness/`），仍保持薄页：

| 信号 | 动作 |
|------|------|
| 某目录（含 `topics/`）`.md` **≥ 15**，或人已难扫 | 按子域拆第 3 层 |
| 单页过长（**>~80 行**）或多主题混写 | **先拆页**，再考虑子域 |
| **连续 3 个 task** 打同一主题前缀 | 可**提前**建子域，不必等满 15 |

未达阈值时：**不要**为「好看」提前深套目录。

---

## 加深操作清单

1. `git mv` 页到 `topics/<子域>/`（或拆新薄页）
2. 修双括号 wikilink / 相对 md 链（含 README、`_index`、stable/context）
3. 更新 [`_index.md`](_index.md) / 本 README 指针
4. `npx dsh-coding-kit wiki export --json --target <仓根>` 校验边仍在（旧包 `--root` 旗标本包未接线，以 `--target` 指定目标根）
5. 本 task 元信息 **`wiki_delta`** = 改动 path（字段闸不变；目录形状本身不闸）

---

## 样例互链（v2.18.1+）与 topics 演示（v2.18.2+）

根三件套含样例互链；`topics/` 下示例薄页演示**两层**（非业务真值）：

- [[topics/wiki_layout]] · [[topics/wikilinks_export]]

拷贝到业务仓后：

```bash
npx dsh-coding-kit wiki export --json --target .
# 业务仓：--target <仓根>（旧包 `--root coding_wiki/templates` 旗标本包未接线）
```

---

## 关账与晋升（v2.18+）

1. task 元信息填 **`wiki_delta`**：改了哪份 wiki / `none`+理由 / `n/a`（未启用 WikiTrack）。  
2. **`experience_capture=required` 且 `wiki_delta=path`**：经验节须含晋升指针（`Wiki:` / `wiki_promoted:` / `coding_wiki` 路径）。  
3. volatile：关账后归档要点或清空，避免 stale；可复用条目上移 **context** / **stable**。  
4. 导出关系图（供 Web/Obsidian 对照，本包不渲染）：见上命令。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-28 | 关账晋升 + wiki export 指针 |
| 2026-07-28 | v2.18.1 · stable/context/volatile 样例互链 |
| 2026-07-28 | v2.18.2 · 两层目录约定 · 加深阈值/清单 · topics 示例 |
| 2026-07-28 | v2.19.0 · 叙述防踩坑（勿裸双括号字面） |
