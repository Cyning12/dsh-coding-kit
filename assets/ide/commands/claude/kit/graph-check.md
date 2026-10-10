---
description: 图谱机检编排（yaml check + REVIEW_CHECKLIST Agent 可跑项指针）
kit_command_id: kit-graph-check
---

结构变更后：编排跑 `npx spec-wave graph yaml check`（按需先 `npx spec-wave graph yaml compile` / `export`）。
真值在 CLI；勿口头代过。

Agent 审核面（POINTER · 不复制脚手架探测/写盘逻辑）：
- 清单路径：`docs/_tech_graph/REVIEW_CHECKLIST.md`（节「Agent 可跑项」）
- 复跑清单中的机检命令原文（compile → export → check）
- 对照源码修正时**只改** `.graph.yaml` / `01_struct.md`；生成物 Markdown 不手改
- **禁止**代签 `HG-GRAPH-MODULES` / `HG-SPEC-SIGNOFF`（人签）

POINTER：README graph 段 · 包内 SPEC `docs/spec/3_1-tech-graph-scaffold/03_cli_and_review.md` §2.3 · 消费者仓 `docs/_tech_graph/`（若有）。
禁止无闸 `kit-30` / `kit-publish`。
