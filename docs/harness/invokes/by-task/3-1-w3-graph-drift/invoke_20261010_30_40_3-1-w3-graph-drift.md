# invoke · 30-execute + 40-self-check · 3-1-w3-graph-drift

> **task_slug**：`3-1-w3-graph-drift`  
> **hat**：30 + 40  
> **日期**：2026-10-10  
> **分支**：`task/specwave-3-1-w3-drift`

## GATE_VERIFY（首输出）

```text
$ node bin/specgate.js verify --target . --task docs/tasks/active/task_3_1_w3_graph_drift.md
| HG-TASK-DRAFT | approved | 20, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
VERIFY: PASS · task_3_1_w3_graph_drift.md
```

## 实现摘要

| 项 | 路径 |
|----|------|
| 新模块 | `src/cli-graph-drift.ts`（覆盖 · 锚点 · 白名单 · `--json` · 零写盘） |
| 分发 / help | `src/cli-graph.ts`（`drift` 子命令） |
| 候选目录同族导出 | `src/cli-graph-scaffold.ts` → `MODULE_DIR_CANDIDATES` |
| 红测 | `test/graph-drift.test.ts`（临时 fixture · 12 测） |
| README 双语 | `README.md` / `README.zh-CN.md`（只报告不重画） |
| A-opt1 CI | `assets/ci/samples/tech-graph.yml.example` 注释步 + samples README |
| 资产锁 | `assets/sha256.manifest`（samples 2 文件变更追认） |

## 20 审 N1–N6 吸收

- N1：空 path 与 TBD 同跳过（A5 测锁）
- N2：dogfood 旧列形 `模块|职责|读|写` → 推断覆盖 `src/**`（显式 layout · **未改**自图语料）
- N3：一级目录集合钉死 = `MODULE_DIR_CANDIDATES`（与 scaffold 同导出）
- N4：白名单 schema 含 `exempt_dirs` + 可选 `exempt_anchor_paths` / `exempt_anchor_prefixes`；A6 测目录豁免；文档口径本波目录豁免为主
- N5：旧测影响面写入 task 自检（graph yaml/scaffold/axioms/ontology 零回归）
- N6：SPEC `04` W0 勾选归 00/10-spec（本棒未改 SPEC）

## 禁区核对

- 未自动重画 / 未改 scaffold 写盘·轻检默认语义 / 未改 `graph yaml check` 判定
- 未开 W4/W5 · 未 bump/tag/push/publish
- 未 `git add -A` · 未裹挟 `eval/external-oracle/` · 未污染 dogfood `_tech_graph`

## 四门 + gate-check

- `npm run typecheck` → `npm test` → `npm run build` → `npm run test:lib` · 绿
- `node bin/specgate.js gate-check --task docs/tasks/active/task_3_1_w3_graph_drift.md` · exit 0

## 待 00

- 采信本 invoke + task 自检 · `task close --yes`（A10 余项）
- 未 bump / tag / push / publish
