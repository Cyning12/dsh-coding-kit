# Mermaid 拓扑协议（通用 · v3）

> **用途**：`docs/_tech_graph/99_mermaid_protocol.md` — flowchart 边标记、节点形状与 YAML-first 生成真值。

## 0. YAML-first 工作流

- **唯一人工编辑源**：`*.graph.yaml`（本目录下如 `00_main.graph.yaml`、`10_flow_MAIN.graph.yaml`）。
- **生成物**：同名 `*.md` 由 `scripts/graph_yaml_compile.js` 自动生成，包含 YAML frontmatter、Mermaid flowchart、Nodes/Edges 表。
- **禁止手写 `.md`**：如需改图，改 YAML 源后重新运行编译脚本；`--check` 模式可检测 `.md` 与 `.graph.yaml` 是否同步。
- **历史 `.ai.md` 双轨已弃用**：Post-G0 后不再维护 `.md` + `.ai.md` 两份文件；所有结构化信息（锚点、边类型）集中在 YAML 源中。

---

## 1. 边标记

### 1.1 执行流

| 标记 | 语义 | 何时用 |
|------|------|--------|
| `->` | 同步顺序执行 | 普通调用 |
| `~>` | 异步 / await | 非阻塞 I/O |
| `=>` | 赋值 / 映射 | 数据转换 |
| `?>` | 条件分支 | if / switch / 路由 |

### 1.2 状态与可靠性

| 标记 | 语义 | 示例 |
|------|------|------|
| `[ok]` | 成功路径 | `validate() -->|"[ok]"| save()` |
| `[err]` | 失败 / 异常 | `parse() -->|"[err]"| fallback()` |
| `[retry=N]` | 重试 | `call_api() -->|"[retry=3]"| call_api()` |
| `[timeout]` | 超时降级 | `fetch() -->|"[timeout]"| cache_get()` |

> 示例采用官方边上文字形态 `A-->|text|B`（见 §7 输出契约）；旧形态 `--"[ok]"-->` 已弃用，IDE 预览不保证可渲染。

### 1.3 元关系（`::` 命名空间）

| 标记 | 语义 |
|------|------|
| `::yields` | 流式 / 生成器产出 |
| `::triggers` | 触发子流程或后台任务 |
| `::gates` | 门禁 / 鉴权 / 依赖注入 |
| `::branches` | 并行分支 |
| `::merges` | 多路归并 |
| `::signoff` | 持久化确认 / 事务提交 |
| `::archives` | 日志 / 审计归档 |

---

## 2. 节点形状（flowchart）

| 形状 | 含义 | 示例 |
|------|------|------|
| `[["..."]]` | 阶段 / 流程块 | `Q[["Query Phase"]]` |
| `["..."]` | 函数 / 操作（编译器默认，文本一律加引号） | `step["process_request"]` |
| `[">..."]` | 文档指针（`>` 前缀保留在引号文本内） | `FLOW_DOC[">10_flow_MAIN.md"]` |
| `[(...)]` | 数据 / 模型（手写图可用） | `db[(UserRecord)]` |
| `{...}` | 判断 / 路由（手写图可用） | `gw{authorized?}` |
| `((...))` | 循环 / 归档（手写图可用） | `log((write_log))` |

---

## 3. 锚点规则（YAML 源强制）

每条 **硬边** 须可追溯到代码或文档，写在 YAML `edges[].anchors` 中：

```yaml
edges:
  - from: "Q"
    to: "E"
    anchors:
      - path: "src/main.py"
        line: 1
      - path: "app/router/index.ts"
        symbol: "Router"
```

- 跨模块调用：使用 `::triggers` 或虚线，**不**展开对方内部。
- 未知锚点：保留 `path: TBD` 并开 task 补全。

---

## 4. 分层与折叠

| 条件 | 操作 |
|------|------|
| 子图节点 ≤ 7 | 可在主图展开 |
| 子图节点 > 7 | 折叠为 `[[Phase]]`，链独立 `10_flow_*.md` |
| 异常分支 | 挂侧链；Happy Path 走主干 |

---

## 5. 禁止项

- **禁止**维护 `.ai.md` 双轨文件。
- **禁止**在生成的 `.md` 中直接手写 flowchart（会被下次编译覆盖）。
- 禁止虚构文件路径；未知处用 `path: TBD` 并开 task 补锚点。
- **禁止** onboarding 默认「全仓扫描生图」。

---

## 6. YAML 字段到 Mermaid 映射

| YAML 字段 | Mermaid 输出 | 说明 |
|-----------|--------------|------|
| `nodes[].id` | 节点 ID | 必须唯一 |
| `nodes[].label` | 节点显示文本 | 决定节点形状 |
| `edges[].from` / `to` | 边两端 | 必须引用存在的节点 |
| `edges[].label` | 边标签 | `"->"` 表示裸执行边 |
| `edges[].mark` | 元关系标记 | 如 `::triggers`、`::branches` |
| `edges[].type` | 边类型 | 与 `mark` 命名空间对应 |
| `edges[].anchors` | `%% → path[#Ln|::symbol]` 注释 + 写入 table | 代码追溯 |

---

## 7. IDE 预览兼容 · 编译器输出契约

> 语法真值（改编译器 emit 前必读，禁止凭记忆）：
> 官网 [Diagram Syntax](https://mermaid.js.org/intro/syntax-reference.html)（注释只认 `%%`）·
> [Flowchart](https://mermaid.js.org/syntax/flowchart.html)；
> 本地对照 `mermaid/packages/mermaid/src/docs/syntax/flowchart.md`
>（§ Links between nodes · § Text on links · § A link with arrow head and text · § Special characters that break syntax · § Comments）。

`graph yaml compile` 生成物 **默认 emit 形态**（Cursor / IDE Markdown 预览与 mermaid-cli 均可渲染）：

| 元素 | 默认输出 | 依据 |
|------|----------|------|
| 锚点注释 | `%% → path#Ln`（独立行） | flowchart.md § Comments：注释仅 `%%` 前缀 |
| 带标签边 | `src -->|"label"| dst` | flowchart.md § A link with arrow head and text：`A-->|text|B` |
| 裸边 | `src --> dst`（yaml `label: "->"` 或无 label） | flowchart.md § A link with arrow head |
| 节点 | `id["label"]`（文本一律双引号包裹） | flowchart.md § Special characters that break syntax |
| 子流程节点 | `id[["label"]]`（文本同样加引号） | 同上 |
| label 转义 | `"` → `#quot;` · `|` → `#124;` · `#` → `#35;` | flowchart.md § Entity codes to escape characters |

**禁止作为编译器默认输出**（IDE 预览会静默解析失败：节点横排一行、边丢失）：

- `--"label"-->`（旧边形态，非官方推荐）
- `//` 行注释（非 Mermaid 语法）
- 含空格 / `()` / `/` / `+` / `>` 等字符却未加引号的节点标签

**消费者升级指引**：升级 dsh-coding-kit 后须重跑 `graph yaml compile`（或 `graph yaml compile --all`）重新生成 `*.md`；手改生成物会被下次编译覆盖。

---

## 8. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-30 | v3：YAML-first，删除 `.ai.md` 双轨，新增 YAML → Mermaid 映射 |
| 2026-08-24 | DEF-023：新增 §7 IDE 预览兼容输出契约；§1.2/§2 示例改官方 `-->|"…"|` 与引号节点形态；锚点注释改 `%%` |
| YYYY-MM-DD | 嵌入用户仓时填写首次版本 |
