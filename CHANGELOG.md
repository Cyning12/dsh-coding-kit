# Changelog

本项目所有显著变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

## [1.2.4] - 2026-08-24

> 主题：**修谎止损 · 发布物说真话** —— 全面清查 assets/ 文档面与包真实能力的偏差，未接线声明一律降级标注，并以测试红线锁住。

### Fixed

- **DEF-002 · 旧包命令面清零**：assets/ 内历史遗留的旧包名命令引用全部钉正为 `dsh-coding-kit`，新增 D-DOC 闸（docs 测试）防回潮。
- **DEF-020 · adapters 虚标声明**：`assets/ide/adapters/README.md` 中 `graph_modules_path` 与 git-clean 等未接线能力声明降级标注，不再冒充已交付特性。
- **DEF-003（阶段一）· 未接线 gate 声明降级**：生命周期/闸口中未接线的 gate 声明标注为 legacy-only；SPEC.md 新增 **R-TRUTH-1 红线**（发布物声明必须与包真实接线一致，违者测试红）。
- **DEF-008 · QUICKREF 手工嵌入**：`assets/harness/templates/QUICKREF_v1_zh.md` 重写为手工嵌入模板，命令面全部对齐 `dsh-coding-kit` 真实 CLI。
- **DEF-009 · 悬空引用守卫 + 薄指针页**：新增 assets 链接守卫测试；`assets/docs/` 新增 4 个薄指针页（POINTER_ONBOARDING / POINTER_RUNBOOK_wiki_delta / POINTER_SDD_HAT_FLOW / POINTER_USER_GUIDE）消解悬空引用。
- **DEF-004 · ontology 对齐**：`assets/ontology.yaml` 与包现实对齐，统一 ONTO- 前缀公理。
- **DEF-005 · discipline-coverage 重盘**：`assets/harness/discipline-coverage.yaml` 按真实接线机制重评覆盖等级，`verify --spec` 标注为未接线。
- **DEF-006 · graph 模板命令面对齐**：`assets/graph/templates/` 命令面与包内编译器对齐并重新生成产物。

### Changed（消费者必读）

- **升级本包后建议重跑 `graph yaml compile`（或 `--all`）与 `skills install`**：本次修谎涉及 graph 模板与 skills/prompts 资产内容，而安装/编译遵循 no-clobber 约定，**不会自动覆盖既有生成物**；不重跑则本地仍保留旧（含虚标）版本。

## [1.2.3] - 2026-08-24

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

### Chore

- **DEF-001 · 发布物与 git 历史对齐**：补建与 npm 已发布包一一对应的 `v1.2.1` / `v1.2.2` 提交与 tag（发布物源态可由 tag 复现）；本提交起「publish 前 commit + tag」为硬步骤。
