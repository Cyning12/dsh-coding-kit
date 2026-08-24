# Task：图谱 Bootstrap · 模块表人签（D4-a）

> **状态**：`draft` / `in_progress` / `done`  
> **类型**：存量 **首次** 接入 / 新仓图谱初始化  
> **关联**：[`docs/_tech_graph/01_struct.md`](../../graph/templates/01_struct.md) · ONBOARDING 档位 S0～S3

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
- 全仓代码扫描自动生图

---

## 范围

- [ ] 从 `cyning-harness/graph/templates/` 复制骨架至 `docs/_tech_graph/`
- [ ] 填写 `01_struct.md` 模块表（删除模板示例行）
- [ ] 新仓/S0：完成 `10_flow_MAIN` 或等价主路径（替换占位锚点）
- [ ] 在 `01_struct.md` 或本 task 记录 **人签表**（签核人 · 日期）

## 非范围

- 业务功能代码改动（除非同 Epic 明示）
- L0-e `graph.json` 全量 export（随 `.ai.md` 增量即可）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| `HG-GRAPH-MODULES` pending 即开 30 改码 task | 执行 **拒开工** | 是 | 须先完成本 bootstrap + 人签 |
| 模块表空表或仅模板示例行 | 22 **打回** | 是 | 一级模块未覆盖 |
| 试图一次画完所有 flow | 审查 **打回** | 是 | 违反 D4-a |

---

## 验收标准

- [ ] `docs/_tech_graph/00_main.md` + `.ai.md` 存在且语义一致
- [ ] `01_struct.md` ≥3 行真实模块（按仓规模；通常 3～12）
- [ ] `HG-GRAPH-MODULES` → **approved**（本 task 或 `01_struct` 人签表）
- [ ] 新仓/S0：≥1 主 flow；S2：模块表 + 待补清单即可
- [ ] invoke 落盘 `docs/harness/invokes/by-task/<task_slug>/`

---

## 给执行帽的必读列表

1. 薄指针页 [`POINTER_ONBOARDING.md`](../../docs/POINTER_ONBOARDING.md)（原文不随包发布）§3 存量档位
2. `docs/_tech_graph/01_struct.md` · `99_mermaid_protocol.md`
3. 本 task 验收表

---

## 实现备忘

| 项 | 状态 | 备注 |
|----|------|------|
| 骨架复制 | ⏳ | |
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
