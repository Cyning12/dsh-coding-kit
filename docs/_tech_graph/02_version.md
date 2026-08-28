# 02 · 版本时间线（kit 图谱 / 包里程碑）

> **性质**：手写时间线 · **不是** yaml compile 产物。  
> **上限**：**1.9.x**（现行发布包 **1.9.1** · 禁止叙述 1.10+）。  
> **真值**：仓根 `CHANGELOG.md` · `package.json`。不把 `assets/graph/templates/02_version.md` 的 YYYY-MM-DD 占位当 kit 史实。

| 日期 | 版本 | 事件 |
|------|------|------|
| 2026-08-24 | 1.2.3 | **DEF-023**：`graph yaml compile` Mermaid emit 对齐官方语法（锚点 `%%`、`\|"label"\|` 边、节点标签引号与实体转义），修复 IDE 预览断裂 |
| 2026-08-24 | 1.2.4 | **DEF-006**：graph 模板命令面对齐本包 `graph yaml compile\|export\|check` |
| 2026-08-25 | 1.6.1 | **DEF-031~033**：export 保留边 label；`graph_id` 以 yaml 声明值为真值；Mermaid class 段消费 `nodes[].kind` |
| 2026-08-27 | 1.9.0 | sync prompts 子命令（当时现行包） |
| 2026-08-28 | 1.9.x | **W2 自仓 dogfood**：`docs/_tech_graph/` 五图 yaml compile / export / check（当时不 bump） |
| 2026-08-28 | 1.9.x | **W3 CI 入仓**：`.github/workflows/tech-graph.yml`（本仓 bin compile/check · 当时不 bump） |
| 2026-08-28 | 1.9.1 | **现行发布包**：self-tech-graph 收口（仓内三层图谱 · tech-graph CI · dogfood 互链 · inventory→reference） |

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-28 | W3 首版：图谱/包里程碑从简 · 上限 1.9.x |
| 2026-08-28 | W4：补 W3 CI 入仓、W4 Unreleased Docs 行（仍上限 1.9.x） |
| 2026-08-28 | 1.9.1 发版准备：现行包改为 1.9.1 |
