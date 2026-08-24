# Changelog

本项目所有显著变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

### Fixed

- **DEF-023 · graph yaml compile Mermaid emit IDE 预览断裂（P0-HOT）**：
  - 锚点注释由 `// → path#Ln` 改为 Mermaid 唯一合法行注释 `%% → path#Ln`。
  - 带标签边默认形态由 `src --"label"--> dst` 改为官方 `src -->|"label"| dst`；`label: "->"` 或无 label 输出裸边 `-->`。
  - 节点标签一律双引号包裹（`id["label"]` / 子流程 `id[["label"]]`），修复含空格、`()`、`/`、`+`、`>` 前缀等字符的标签导致预览解析失败。
  - label 内 `"` / `|` / `#` 按 Mermaid entity code 转义（`#quot;` / `#124;` / `#35;`）。
  - 语法真值：[mermaid.js.org/intro/syntax-reference.html](https://mermaid.js.org/intro/syntax-reference.html) · [mermaid.js.org/syntax/flowchart.html](https://mermaid.js.org/syntax/flowchart.html)（本地对照 `mermaid/packages/mermaid/src/docs/syntax/flowchart.md` § Links between nodes / Text on links / Comments）。

### Changed（emit 契约 · 消费者必读）

- **升级本包后须重跑 `graph yaml compile`**（或 `graph yaml compile --all`）重新生成 `docs/_tech_graph/*.md`；旧 emit（`// →` 注释、`--"…"-->` 边）在 IDE Markdown 预览中会静默失败（节点横排一行、边丢失）。`graph yaml check` 比对 graph.json 不受影响。
- `assets/graph/templates/99_mermaid_protocol.md` 新增「§7 IDE 预览兼容 · 编译器输出契约」，§1.2 / §2 示例改为官方形态。
