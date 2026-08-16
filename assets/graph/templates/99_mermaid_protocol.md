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
| `[ok]` | 成功路径 | `validate() --"[ok]"--> save()` |
| `[err]` | 失败 / 异常 | `parse() --"[err]"--> fallback()` |
| `[retry=N]` | 重试 | `call_api() --"[retry=3]"--> call_api()` |
| `[timeout]` | 超时降级 | `fetch() --"[timeout]"--> cache_get()` |

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
| `[[...]]` | 阶段 / 流程块 | `[[Query Phase]]` |
| `[...]` | 函数 / 操作 | `[process_request]` |
| `[(...)]` | 数据 / 模型 | `[(UserRecord)]` |
| `{...}` | 判断 / 路由 | `{authorized?}` |
| `>...]` | 里程碑 / 文档指针 | `>10_flow_MAIN.md]` |
| `((...))` | 循环 / 归档 | `((write_log))` |

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
| `edges[].anchors` | 不渲染，写入 table | 代码追溯 |

---

## 7. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-30 | v3：YAML-first，删除 `.ai.md` 双轨，新增 YAML → Mermaid 映射 |
| YYYY-MM-DD | 嵌入用户仓时填写首次版本 |
