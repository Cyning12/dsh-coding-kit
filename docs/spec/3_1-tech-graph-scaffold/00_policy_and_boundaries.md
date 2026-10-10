# 00 · 政策与边界（3.1 技术图谱脚手架）

> **状态**：`signed`（HG-SPEC-SIGNOFF=approved · 2026-10-10 维护者签收）· 隶属 `3_1-tech-graph-scaffold` · 目标 `spec-wave@3.1.0`（minor）

---

## 1. S2 禁区（过程域 · 永不覆写）

| 目录 | 纪律 |
|------|------|
| `docs/tasks/` | 只新增不覆写 |
| `docs/harness/reviews/` | 只新增不覆写 |
| `docs/harness/invokes/by-task/` | 只新增不覆写 |

脚手架命令**禁止**把过程域当写入目标；默认输出仅 `docs/_tech_graph/`（及本 SPEC 约定的旁路审核清单路径，若有）。

## 2. P0 门禁纪律

1. 判定走进程内机械逻辑；exit 2 = 阻断档。  
2. **禁止**新增 `--force` / `--allow-*` 绕过参数。  
3. 修严型变更须配负向 fixture（修复前真红、修复后转绿）。  
4. 人工闸只有写在 task 文 `### 人工闸` 节才可机检。  
5. **草稿纪律**：脚手架产出默认标为 `draft`（草稿）；**不得**自动把 `HG-GRAPH-MODULES` 写成 approved。

## 3. 本版明确不做（非范围）

| 项 | 归属 |
|----|------|
| 扩写 `assets/graph/templates/` 业务占位节点/边（通用示例内容） | **本版冻结**（协议文件原样落入除外） |
| 宣称「一次生成 = 已签收架构真值」 | **禁止** |
| 首次脚手架画出全仓全部子流程 | **禁止**（仍守 D4-a 增量） |
| 自定义本体类 / 开放 ontology 内容编辑 | **不开放**（沿用 3.0 ONTO-OPEN） |
| 图谱可视化界面 | 非范围 |
| `docs/_tech_graph/` 随 npm 包发布 | 维持现状（不入 tarball） |
| `npm publish` / `npm deprecate` | **仅人** |
| 宿主适配表 schema 变更 | 非本版（触 schema 另开 major/闸） |

## 4. 对外文案纪律

- 脚手架能力对外只称：**生成可审草稿** / **辅助入手**；未人签前**不得**称「自动生成权威技术图谱」。  
- 未落地波次一律「规划中」；不得提前写进 README 主路径为已交付。  
- 事实卡黑名单与竞品口径纪律沿用 3.0 收口。

## 5. 版本与 semver

- 本版为 **minor**：消费者可观察新命令面（脚手架 / 漂移 / 仓级词表），**不**改既有 `graph yaml compile|export|check` 默认行为与判定松紧。  
- 与 3.0.2 PLAN 已延后项对齐：F-2 漂移闸、F-1② 仓级词表扩展，并入本 epic；**新增**内容生成轨（脚手架）为本版战略核心。

## 6. 流程边界

- 本棒（10-spec）只产出 SPEC + PLAN；**不改** `src/` / `bin/` / `assets/` / `test/`。  
- 后续：20-spec-audit（可选但推荐）→ 人签 HG-SPEC-SIGNOFF + HG-NEXT-PLAN → 00 拆 task → 每波 20-task-audit → HG-AUDIT-R1 → 30/40。  
- 行号引用为起草快照；各波 10-task 须回源码复核现值。

## 7. 人工闸

| human_gate_id | status | blocks |
|---------------|--------|--------|
| HG-SPEC-SIGNOFF | **approved**（2026-10-10 维护者 · 「签收，拆W1」） | 本夹定稿 / 开拆 task |
| HG-NEXT-PLAN | **approved**（同窗） | 开实现波 |

## 8. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
