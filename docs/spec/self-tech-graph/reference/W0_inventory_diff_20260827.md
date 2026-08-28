# W0 · 外置三树盘点定稿（2026-08-27）

> **执行日**：2026-08-27  
> **执行帽**：30+40 · task `self-tech-graph-w0-inventory`  
> **包版本锚**：1.9.0（`package.json`）  
> **inventory 历史锚**：1.2.2（外置 `00_inventory/` · mtime 2026-08-22）  
> **用途**：W1 `01_struct` 与 W3 迁移的执行输入；**W0 不物理迁文件**

---

## 实勘快照

| 树 | 根路径（工作区） | 文件数 | 关键子树 | mtime 注记 |
|----|------------------|--------|----------|------------|
| **A · optimization** | `/Users/cyning/Desktop/Projects/docs/dsh_coding_kit_optimization/` | 53 | `00_inventory/`（4）· `01_defects/`（5+3 investigations）· `02_compare_speckit/`（4）· `03_directions/`（2）· `04_decisions/`（1）· `05_fix_plans/`（24）· `06_epics/`（1）· `invokes/`（4）· `prompts/`（1）· `reviews/`（2） | `00_inventory/architecture.md` 2026-08-22；`01_defects/defect_register.md` 2026-08-25 |
| **B · init** | `/Users/cyning/Desktop/Projects/docs/dsh_coding_kit_init/` | 106 | `spec/` · `tasks/` · `reviews/` · `invokes/` · `README.md` | `README.md` 2026-08-22 16:31 |
| **C · tech_graph** | `/Users/cyning/Desktop/Projects/docs/tech_graph/` | 15 | `SPEC/json_graph` · `SPEC/query_graph` · `SPEC/ai-ink-brain{,-api-python}/` · `SPEC/neo4j/`（§03 初稿未列 · 空占位）· `tasks/` · `prompts/` · `invokes/` | 与 §03 初稿一致；`neo4j/` 为 W0 实勘增补 |

**仓内对照真值**：

| 路径 | mtime | 说明 |
|------|-------|------|
| `docs/releases/03_defects_debt_ledger.md` | 2026-08-24 | DEF-001~027 + 债务 18 条 disposition |
| `docs/spec/self-tech-graph/03_external_docs_migration.md` | 2026-08-27 | 判定矩阵建议稿（本 W0 升级为定稿表） |

**§03 对照结论**：树 A/B/C 子目录与 `03_external_docs_migration.md` §1 行一一对应；无缺失子树。树 C `SPEC/neo4j/` 为实勘增补（空目录 · 留外 · 无 kit 私域动作）。

---

## DEF 去重表

> **口径**：外置 `optimization/01_defects/defect_register.md`（33 DEF · 2026-08-25）↔ 仓内 `docs/releases/03_defects_debt_ledger.md`（27 DEF · 2026-08-24）；债务段 ↔ `known_debts.md`（18 条 · 2026-08-22 快照）。

### 缺陷（DEF-ID）

| 类别 | 条目 | 一行说明 |
|------|------|----------|
| **已对齐** | DEF-001 ~ DEF-027（27） | 外置 register 与 ledger 均登记且状态为 closed；ledger 为精简 one-liner + 版本/commit，register 为 R1 证据锚点详表 |
| **仅外置有** | DEF-028 | check 跨产品线版本比较输出误导 → 已发布 1.5.2（PR #13） |
| **仅外置有** | DEF-029 | refresh-ide-blocks 对无 marker .mdc 无发现/报告 → 已发布 1.5.2（plain_mentions 仅报告） |
| **仅外置有** | DEF-030 | DEF-028 判据过宽（from_version 已是 kit 线仍输出跨产品线文案）→ 已发布 1.6.1（PR #18） |
| **仅外置有** | DEF-031 | graph yaml export 丢边 label（`?>`/`::`/`~>`/`[…]` mark）→ 已发布 1.6.1 |
| **仅外置有** | DEF-032 | export graph_id 路径命名空间 vs yaml 声明值不一致 · check 过滤口径漂移 → 已发布 1.6.1 |
| **仅外置有** | DEF-033 | generateMermaid class 硬编码 id 白名单不消费 nodes[].kind → 已发布 1.6.1 |
| **仅仓内有** | （无） | ledger 27 条均为外置 register 子集 |
| **冲突须人裁** | （无 DEF 状态冲突） | DEF-001~027 关闭状态一致；DEF-028~033 为 ledger 遗漏而非状态分歧 |

**DEF 计数**：已对齐 **27** · 仅外置有 **6** · 仅仓内有 **0** · 冲突 **0**

### 债务（M-* / R-*）

| 类别 | 条目 | 一行说明 |
|------|------|----------|
| **已对齐** | M-1 ~ M-4 | 迁移 CLOSE §9 四条 · 均已 closed（ledger §Debts closed + known_debts §1） |
| **已对齐** | R-03, R-04, R-07, R-08, R-13 | 已关闭/已交付 · ledger 与 known_debts 一致 |
| **已对齐** | R-01（Archive 部分）, R-02, R-09, R-10, R-11, R-12, R-14 | standing residual / 开放 · 两边均文档化非阻塞 |
| **已对齐** | R-06 | adapters .example 已清；存量 IDE 块残留 → R-07 epic 承接 · 1.5.0 交付 |
| **冲突须人裁** | R-05 | 外置 known_debts §2 仍写「--out 指产品包 assets/skills **仍只靠文档未拒写**」（2026-08-22 快照）；ledger 记 **1.3.0 代码拒写**（`c17d70e`）已 closed → **外置文档 stale，非事实冲突**；W3 不迁 known_debts 正文，ledger 为仓内真值 |

**债务计数**：已对齐 **17** · 仅外置 stale 表述 **1**（R-05 · **已 ruled**：不回写外置；ledger 1.3.0 closed 为仓内真值） · 仅仓内有 **0** · 事实冲突 **0**

---

## 迁留定稿矩阵

> 来源：`03_external_docs_migration.md` §1 全部行 · **approved 动作**经 W0 定稿（HG-SPEC-SIGNOFF 已 approved）。

| 子树/路径 | approved 动作 | 执行波次 | 备注 |
|-----------|---------------|----------|------|
| 树 A · `00_inventory/`（architecture / cli_surface / plugin_surface / assets_catalog） | **内容 W1 按 1.9.0 src/ 实读重生** → 输入 `01_struct` + L0；**原文 W3 迁** `reference/`（标历史锚 1.2.2 + 原路径） | W1（内容）· W3（原文） | 禁止照抄旧 inventory；HG-GRAPH-MODULES 人签在 W1 |
| 树 A · `01_defects/`（defect_register · known_debts · investigations） | **ledger 为仓内 DEF/债务真值**；外置 register 作 R1 证据库 **留外**；DEF-028~033 **W1 补入 ledger**（2026-08-28 裁定补录） | W0（diff 完成）· **W1**（ledger 补录） | investigations 留外 · POINTER 可选 |
| 树 A · `02_compare_speckit/` · `03_directions/` · `04_decisions/` | **留外 + POINTER**（治理叙事 · 非仓事实源） | W3 | 目标：`reference/POINTERS.md` + `docs/spec/README.md` |
| 树 A · `05_fix_plans/` · `06_epics/` | **留外**（过程档 · PRD 均已交付） | none | 仓内终态：`docs/tasks/done/` · CHANGELOG · releases 系列 |
| 树 B · `dsh_coding_kit_init/spec/` | **留外**（历史 SPEC 1.0→1.2.2）；仓根 `SPEC.md` 为现行 | W3 | `docs/spec/README.md` 加历史债索引指针行 |
| 树 B · `dsh_coding_kit_init/tasks/` · `reviews/` · `invokes/` | **留外**（过程档已闭环 · 无活跃引用） | none | 不迁、不双轨 |
| 树 C · `docs/tech_graph/SPEC/json_graph` · `query_graph` | **留外**（跨仓方法论）；kit `02_graph_scheme.md` 以 POINTER 引用 | W3 | json_graph/query_graph 与 kit graph 面相关 |
| 树 C · `docs/tech_graph/spec/` · `tasks/` · `prompts/` · `invokes/` · `SPEC/ai-ink-brain{,-api-python}/` · `SPEC/neo4j/` | **留外**（承接仓方案 · 非 kit 私域） | none | W0 实勘：`neo4j/` 空占位 · 与 Ink 承接仓相关 |

---

## 引用扫描

> 扫描范围：kit 仓全量 grep · 模式 `dsh_coding_kit_init` \| `dsh_coding_kit_optimization` \| `docs/tech_graph` · 2026-08-27。

| 文件 | 命中模式 | 分类 | W0/W3 动作 |
|------|----------|------|------------|
| `SPEC.md` | `dsh_coding_kit_init`（过程根 · 多指针） | **已 POINTER** | 维持；过程轨明示留外 |
| `assets/README.md` | `dsh_coding_kit_init` | **已 POINTER** | 维持 |
| `docs/releases/README.md` | `dsh_coding_kit_optimization` | **已 POINTER** | 维持（workspace 相对叙述） |
| `docs/spec/self-tech-graph/README.md` | 三树 | **已 POINTER** | SPEC 元信息 · 预期 |
| `docs/spec/self-tech-graph/01_problem_and_goals.md` | 三树 | **已 POINTER** | SPEC 元信息 · 预期 |
| `docs/spec/self-tech-graph/02_graph_scheme.md` | `dsh_coding_kit_optimization/00_inventory` | **需新增 POINTER** | W3：`reference/POINTERS.md` 或内链 `reference/architecture_1.2.2.md` |
| `docs/spec/self-tech-graph/03_external_docs_migration.md` | 三树 | **已 POINTER** | SPEC 元信息 · 预期 |
| `docs/tasks/active/task_self_tech_graph_w0_inventory.md` | 三树 | **已 POINTER** | task 元信息 · 预期 |
| `docs/harness/invokes/by-task/self-tech-graph-w0-inventory/invoke_*.md` | 三树（绝对路径） | **已 POINTER** | invoke 元信息 · 预期 |
| `src/cli-refresh-ide-blocks.ts` | `dsh_coding_kit_optimization/06_epics/PRD_R07` | **需 W3 改链** | 注释改指向 `reference/POINTERS.md#R07` 或仓内 done task |
| `test/cli-refresh-ide-blocks.test.ts` | 同上 PRD 路径 | **需 W3 改链** | 与 src 注释同步 |
| `test/cli-p0.test.ts` | `docs/dsh_coding_kit_init`（否定断言） | **已 POINTER** | 测试验证 init 路径**不**出现在 sync 输出 · 非死链 |

**汇总**：已 POINTER **8** · 需 W3 改链 **2** · 需新增 POINTER **1** · 误链/死链 **0**

---

## 人裁 pending

**已关（2026-08-28 · 维护者裁定 · 00 代录）** — 执行见 W1 task `self-tech-graph-w1-struct`。

| ID | 主题 | 裁定 | 执行波 | 30 执行（2026-08-28） |
|----|------|------|--------|----------------------|
| **PENDING-DEF-028-033** | ledger 是否补录 DEF-028~033 | **补录** · 按外置 register 已闭环 6 条写入仓内 ledger（33/33 closed） | **W1**（原矩阵写 W4 可选 · 本裁定提前） | **已执行**：`docs/releases/03_defects_debt_ledger.md` 增 6 行 closed（1.5.2 PR #13/#14 · 1.6.1 PR #18/#19） |
| **PENDING-R05-STALE** | 外置 `known_debts.md` R-05 开放表述 | **关闭** · 外置无增量内容可改；ledger 1.3.0 已 closed 为仓内真值；不回写外置树 | none（关 pending 即可） | **已执行**：未改外置 `known_debts.md`；ledger R-05 保持 closed |
| **PENDING-M3-SUBSET** | init/工作区 M-3 遗留子集 | **自行处理**：无用则与 M-3 同款 stale 处置；有用则从 kit 债剔除。00 初判：`self_glayer` 系列已 stale 横幅 → 无增量；`d_article_series` 仍 `in_progress` 公众稿轨 → **有用、不 stamp、不迁 kit**。30 扫描确认后关本 pending | **W1**（工作区侧仅 stamp 无用项 · 不迁 kit） | **已执行**：见下方核扫结论 |

**M-3 核扫结论（2026-08-28 · 30）**：扫描工作区 `docs/harness/tasks/active/`。`task_cyning_harness_d_article_series_v1.md` 状态 `in_progress`（公众稿 D 轨）→ **有用，不 stamp、不迁 kit**。`task_cyning_harness_self_glayer_meta_v1.md` 与 `graph_yaml_glayer` / a5 / g1 / y1 **已有**同款 stale 横幅。`task_self_glayer_p1`–`p6` 为同类旧 Epic 子单、此前无横幅 → **已加**与兄弟单相同 stale 横幅（不删文件）。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | W0 30+40 交付：实勘 · DEF diff · 迁留定稿 · 引用扫描 |
| 2026-08-28 | 人裁三项 ruled：DEF-028~033 补录 · R-05 关闭 · M-3 遗留自行处理（见上表） |
| 2026-08-28 | 30 已执行：ledger 补录 6 行 · 未回写外置 R-05 · M-3 核扫（d_article_series 有用不 stamp；self_glayer p1–p6 补 stale 横幅） |
