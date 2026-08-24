# Changelog

本项目所有显著变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

## [1.3.0] - 2026-08-24

> 主题：**行为纠偏 · CLI 说真话做正事** —— 17 个 PRD/债项全面落地：help / 旗标 / --json / 幂等键 / --strict 等一律收紧为真实语义，155 项测试红线锁住，新上 CI。

### Changed（行为变更 · 升级必读）

- **子命令 `--help`**：输出子命令自身 usage（原误输出根 usage）。
- **未知旗标不再静默吞**：`verify` / `gate-check` 收到未知旗标 exit 1 报错（原静默忽略）。
- **`--json` 真生效**：`verify` / `gate-check` --json 输出五字段结构化结果（原旗标被吞、仍输出文本）。
- **`verify --spec`**：文案去版本号；校验失败 exit 2→1（exit 2 回归纯闸语义）。
- **入参校验收紧**：`init --preset` 词表校验（未知 preset 拒收）；`upgrade --force` 拒收。
- **`check` 三向版本判定**：高版本 manifest 不再误报「可升级」（DEF-013）。
- **`graph ingest` 幂等键含状态摘要**：闸/task 状态变化后重跑会补发事件（旧事件保留、不覆盖）。
- **外部手写事件过滤收紧**：改为结构化等值匹配（原宽松匹配易误吞/误放）。
- **`status`**：`event_count` 无匹配由 null 改为 0；`reviews.CLOSE` 事件接线。
- **`lifecycle` dry-run 新增 `--target`**。
- **`ingest` 扫描双路径**：harness 布局仓事件量跳变属预期。
- **D5 假阳性降级为 WARN 过渡**。
- **插件 override**：根上探 git root + 按文件边界截断。
- **`--strict` 真语义**：原先形同虚设，现真实收紧——**CI 中使用 `--strict` 的管线可能翻红**。
- **`skills install --out` 指向产品包 `assets/skills` → 拒写**（防污染源包资产）。

> 本次含 skills/prompts 资产修复（DEF-024/025/026），安装遵循 no-clobber：**升级后建议重跑 `skills install`**，否则本地仍保留旧资产。

### Fixed

- **DEF-007 · stubs 死指针**：`assets/graph/stubs/README.md` 指针钉正。
- **DEF-024 · 姊妹帽死链**：skills 资产 4 处悬空姊妹帽链接修复。
- **DEF-025 · HG-GRAPH-MODULES 残留行**：gate-stop 模板残留行清除。
- **DEF-026 · 「机械校验」未接线声明**：30-execute-code 降级标注，不再冒充已接线。

### Added

- **lib 冒烟测试 + mtime 哨兵 + `npm run test:lib`**：锁住构建产物新鲜度。
- **CI workflow**（`.github/workflows/ci.yml`，node 22/24 矩阵）。
- **新增测试**：`test/cli-hgm-parser.test.ts`、`test/cli-status-obs.test.ts`、`test/cli-help.test.ts`、`test/cli-flags.test.ts`、`test/cli-verify-spec.test.ts`、`test/cli-validation.test.ts`。
- **SPEC 新增 HGM 幂等键契约**。

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
