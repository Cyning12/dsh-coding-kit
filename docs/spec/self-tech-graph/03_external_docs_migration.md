# 03 · 外置文档盘点与迁移判定（self-tech-graph）

> **状态**：`draft` · 判定矩阵为建议稿 · **逐组须经 HG-SPEC-SIGNOFF 批准后执行**

---

## 1. 盘点（2026-08-27 实勘）

### 树 A · 工作区 `docs/dsh_coding_kit_optimization/`

| 子树 | 内容 | 判定建议 |
|------|------|----------|
| `00_inventory/`（architecture / cli_surface / plugin_surface / assets_catalog） | kit 架构真值 · 锚 1.2.2 已滞后 | **内容重生 + 原文迁回**：作为 01_struct/L0 构图输入重核图谱化；原文迁 kit `docs/spec/self-tech-graph/reference/`（标历史锚 1.2.2）——仓级架构事实应有仓内成文 |
| `01_defects/`（defect_register · known_debts · investigations） | DEF 台账 | **先去重**：W0 diff kit `docs/releases/03_defects_debt_ledger.md`，缺条目补入 ledger；原树留外 |
| `02_compare_speckit/ · 03_directions/ · 04_decisions/` | 方法论对比与决策 | **留外 + POINTER**（治理叙事属性 · 非仓事实源） |
| `05_fix_plans/ · 06_epics/` | DEF/EPIC PRD（均已交付） | **留外**（过程档）；仓内终态已有 done task/CHANGELOG |

### 树 B · 工作区 `docs/dsh_coding_kit_init/`（106 文件 · 1.0–1.2.2 过程树）

| 子树 | 判定建议 |
|------|----------|
| `spec/`（SPEC 1.0→1.2.2 系列） | **留外**（历史 SPEC · 仓根 SPEC.md 为现行）；kit `docs/spec/README.md` 历史债索引加指针行 |
| `tasks/ · reviews/ · invokes/` | **留外**（过程档已闭环 · 无活跃引用）；不迁、不双轨 |

### 树 C · 工作区 `docs/tech_graph/`（跨仓专题）

| 子树 | 判定建议 |
|------|----------|
| `SPEC/json_graph · query_graph`（已定稿规约） | **留外**（跨仓方法论）；本夹 02 文档以 POINTER 引用 |
| `spec/ · tasks/ · prompts/ · invokes/`（承接仓方案） | **留外**（非 kit 私域） |

## 2. 迁移执行规则（获批后）

1. 迁回文件一律落 `docs/spec/self-tech-graph/reference/`，文首标注「历史锚版本 + 原路径」；**禁止**改写历史正文
2. 留外项指针集中两处：本夹 `reference/POINTERS.md` + kit `docs/spec/README.md` 索引行
3. 执行后死链 grep：仓内对 `dsh_coding_kit_init` / `dsh_coding_kit_optimization` / `docs/tech_graph` 的引用全部可解析或为明示外部指针
4. 工作区侧**不删原树**（本 SPEC 未获删工作区文档授权）

## 3. 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| ledger 与 01_defects 条目冲突 | W0 输出 diff 清单交人裁 | 是 | 清单 |
| 迁回文件命名冲突 | `reference/` 前缀隔离 | 是 | — |
| 工作区树并发变更 | 以执行日快照为准 · 记 mtime | 是 | POINTER 注记 |

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿（实勘三树） |
| 2026-08-27 | W0 定稿：迁留矩阵 approved 见 [`reference/W0_inventory_diff_20260827.md`](./reference/W0_inventory_diff_20260827.md) §迁留定稿矩阵 |
