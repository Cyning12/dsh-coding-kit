# 薄指针 · RUNBOOK_upgrade_wiki_delta

> 原引用目标 `docs/RUNBOOK_upgrade_wiki_delta_v1_zh.md`（lint-wiki-delta 升级运维手册）。

- **用途**：无 monorepo checkout 时经 `npm pack` / GitHub raw 升级 wiki-delta 样例的运维步骤（原文 §5.1）。
- **本文档不随 dsh-coding-kit 发布**（包内无 docs/ 正文体）。
- **真值去向**：私仓 `cyning-harness/docs/RUNBOOK_upgrade_wiki_delta_v1_zh.md`（内部文档，未公开）。
- 历史先例：旧 npm 包 @cyning/harness@1.0.2 曾随包发布 docs/（旧包已弃用，现行为 dsh-coding-kit）。

## 诊断码表（lint-wiki-delta / task lint E8 · 本仓真值）

| code | 档位 | 触发 | 处置 |
|------|------|------|------|
| `wiki_delta_missing` | 默认档（exit 2） | `## Harness 元信息` 表内无任何 `wiki_delta` 行 | 在 `## Harness 元信息` 表格补 `| **wiki_delta** | \`path|none|n/a\` |` 行 |
| `wiki_delta_wrong_section` | 默认档（exit 2 · 替代 missing 不双报） | `wiki_delta` 行写在 `## Harness 元信息` 之外的节（如 `## Harness`） | detail 含所在节名 + 行号；把该行移入 `## Harness 元信息` 表格内（诊断非兼容：解析器仍只认权威节名） |
| `wiki_delta_invalid` | `--strict` 追加（exit 2） | 值非 path 形态亦非 none/n/a | 改为 path（含 `/` 或 `.`）或 none/n/a |
| `wiki_delta_path_missing` | `--strict` 追加（exit 2） | path 形态值相对仓根不存在 | 建文件或改指向 |
| task lint `E8` | `task lint --file`（error · 无 draft 豁免） | `## Harness 元信息` 节在但缺 `wiki_delta` 行（仅查存在性） | 补行即过；错节场景文案指向正确节名并带行号（与 `close_wiki_delta` 对齐） |
