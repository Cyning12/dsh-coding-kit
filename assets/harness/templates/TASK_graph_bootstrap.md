# Task：图谱 Bootstrap · 模块表人签（D4-a）

> **状态**：`draft` / `in_progress` / `done`  
> **类型**：存量 **首次** 接入 / 新仓图谱初始化  
> **关联**：[`docs/_tech_graph/01_struct.md`](../../graph/templates/01_struct.md) · ONBOARDING 档位 S0～S3  
> **产品口径**：优先 `graph scaffold` 生成**可审草稿**；包内模板仅作协议/回退（见 SPEC 02 §2.4）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `graph-bootstrap` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 文档 + 文件存在性；无业务单测 |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task 或 Epic 首棒 |
| **git_branch** | `task/graph-bootstrap` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 图谱 bootstrap；无 wiki 增量 |
| **experience_capture** | `recommended` |

### 人工闸（本 task 核心）

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| **HG-GRAPH-MODULES** | pending → **approved** | **30** | `01_struct` **一级模块表** 人签；**非**「全部 flow 画完」 |
| HG-TASK-DRAFT | pending | 22-R1 | 可选 · 小 task 可合并 |
| HG-AUDIT-R1 | pending | 30 | 22 R1 后允许改码 task 派发 |

> **D4-a**：「全量」= **模块登记表覆盖一级模块**；flow 按后续 task **增量**。

---

## 背景与目标

**完成态**：

- [ ] `docs/_tech_graph/` 骨架就位（`00_main` 双轨、`99_mermaid_protocol`、`02_version` 可选）
- [ ] `01_struct.md` 模块表填完 **一级模块**（module_id · glob · 依赖方向）
- [ ] **至少 1** 条主 flow（新仓 / **S0**）；S2+ 可在 `00_main` 列「待补 flow 清单」
- [ ] **`HG-GRAPH-MODULES` approved** — 维护者签核后，**30 执行改码** task 方可开工
- [ ] 本 task 关账 invoke + `### 自检结论` 回填

**不做**：

- 首次 onboarding **全仓 flow 一次画完**
- 声称脚手架产物为**权威架构真值** / 自动代签任何 HG（含 `HG-GRAPH-MODULES`）
- 无上限全仓 AST「自动生图」冒充已覆盖全业务语义（与「可审草稿」划界见 SPEC 02 §2.4）

---

## 范围

- [ ] **优先**：在仓根跑 `npx spec-wave graph scaffold`（先 dry-run；确认后 `--yes`）生成 `docs/_tech_graph/` **可审草稿**（含 `REVIEW_CHECKLIST.md`）· **非**已签收真值
- [ ] 按清单机检项复跑 `graph yaml compile` / `check`；人工修订模块表与主路径（只改 `.graph.yaml` / `01_struct.md`）
- [ ] **回退（仅当 scaffold 不可用或探测零信号需协议底稿）**：从包内 `assets/graph/templates/`（或历史 `cyning-harness/graph/templates/`）复制**协议类**文件（如 `99_mermaid_protocol.md`）；**不以「只拷业务骨架」为主路径**
- [ ] 填写/审定 `01_struct.md` 模块表（删除示例行）
- [ ] 新仓/S0：完成 `10_flow_MAIN` 或等价主路径（替换占位锚点）
- [ ] 在 `01_struct.md` 或本 task 记录 **人签表**（签核人 · 日期）→ `HG-GRAPH-MODULES` → approved

## 非范围

- 业务功能代码改动（除非同 Epic 明示）
- L0-e `graph.json` 全量 export（随 `.ai.md` 增量即可）
- 代签人工闸 / 把草稿当已签收真值对外宣称

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| `HG-GRAPH-MODULES` pending 即开 30 改码 task | 执行 **拒开工** | 是 | 须先完成本 bootstrap + 人签 |
| 模块表空表或仅模板示例行 | 22 **打回** | 是 | 一级模块未覆盖 |
| 试图一次画完所有 flow | 审查 **打回** | 是 | 违反 D4-a |
| 仍以「只拷模板骨架」为主路径且无 scaffold 优先步骤 | 审查 **打回** | 是 | 违反 W2 入手口径 |

---

## 验收标准

- [ ] 范围首步为优先 `graph scaffold`（真实命令）或有书面回退理由
- [ ] `docs/_tech_graph/00_main.md` + `.ai.md`（或等价 YAML 编译产物）存在且语义一致
- [ ] `01_struct.md` ≥3 行真实模块（按仓规模；通常 3～12）
- [ ] `HG-GRAPH-MODULES` → **approved**（本 task 或 `01_struct` 人签表）
- [ ] 新仓/S0：≥1 主 flow；S2：模块表 + 待补清单即可
- [ ] invoke 落盘 `docs/harness/invokes/by-task/<task_slug>/`

---

## 给执行帽的必读列表

1. 薄指针页 [`POINTER_ONBOARDING.md`](../../docs/POINTER_ONBOARDING.md)（原文不随包发布）§3 存量档位
2. `docs/_tech_graph/01_struct.md` · `99_mermaid_protocol.md` · `REVIEW_CHECKLIST.md`（若 scaffold 已写）
3. 本 task 验收表 · SPEC `02` §2.4 划界

---

## 实现备忘

| 项 | 状态 | 备注 |
|----|------|------|
| graph scaffold（优先） | ⏳ | dry-run → `--yes` |
| 协议回退拷贝 | ⏳ | 仅必要时 |
| 模块表 | ⏳ | |
| HG-GRAPH-MODULES | ⏳ | pending → approved |
| 主 flow | ⏳ | 按档位 |

---

### 自检结论（执行者）

（30/40 回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| YYYY-MM-DD | 从 cyning-harness `TASK_graph_bootstrap.md` 嵌入 |
| 2026-10-10 | 3.1 W2：优先 scaffold · 模板仅协议回退 |
