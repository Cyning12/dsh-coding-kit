# Task：3.2 W2 · graph drift `struct_rel`（可配置模块表路径）

> **状态**：`active` · **HG-AUDIT-R1=approved**（2026-10-11 **00 签收** · 可 30）  

> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md)（**HG-SPEC-SIGNOFF=approved**）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md)（**HG-NEXT-PLAN=approved**）· **W2 · struct_rel**  
> **SPEC 波钉**：[`04`](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) **W2** · [`02`](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) §3 · [`03`](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) §1.2  
> **上游关账**：W1 [`docs/tasks/done/task_3_2_w1_graph_ib_check.md`](../done/task_3_2_w1_graph_ib_check.md)  
> **过程授权**：00 可签过程闸（须 lint + 20 PASS）· 见 epic invoke + [`invoke_20261011_00_orchestrate_w2_w5.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md)  
> **行号口径**：2026-10-11 10-task 起草棒实读 · 30 须复核  
> **Open Folder**：仓根 · **工作分支**：`task/specwave-3-2-w1-ib-check`（同支串行 W2–W5 · 统一 PR）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-2-w2-struct-rel` |
| **test_strategy** | `required` |
| **test_strategy_note** | 红测：缺省=3.1；`struct_rel` 指向分层协议表绿；坏路径/不可解析 exit 2；既有 drift 测零回归；临时 fixture |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-2-w1-ib-check` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅 drift 配置键；不改自图语料 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 关账经验是否晋升 wiki 归 20/00 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | 3.2 epic 同支 · 统一 PR |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic 继承 |
| HG-NEXT-PLAN | approved | — | epic 继承 |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-11 **00 签收**（统筹 W2–W5 授权）· lint PASS + [`task_3_2_w2_struct_rel_audit_R1_20261011.md`](../../harness/reviews/task_3_2_w2_struct_rel_audit_R1_20261011.md) PASS · blocking 0 |
| HG-AUDIT-R1 | approved | **30** | 2026-10-11 **00 签收** · 同上 · **可 30** |

---

## 背景与目标

3.1/W1 后 `graph drift` 仍硬读 `--input`/`docs/_tech_graph` 下 **`01_struct.md`**。trilayer 仓模块表可在 `l1/01_modules.md` 等路径 → `struct_missing` / 对齐债。

**完成态**：`.spec-wave/graph-drift.yaml` 可选键 `struct_rel`；缺省行为与 3.1.0 **完全一致**；合法分层表可驱动模块覆盖；坏路径 fail-closed exit 2；四门绿 · 未 bump/tag/push/publish。

---

## 范围

- [x] **①** `loadWhitelist`（或并列加载）承认可选 `struct_rel`（string · 相对 `--input`）  
- [x] **②** `runGraphDrift` 用解析后的 rel 拼 struct 路径；缺键/缺文件配置 → `STRUCT_REL_DEFAULT`  
- [x] **③** 坏路径 → `struct_missing` exit 2；不可解析 → `struct_unparseable`  
- [x] **④** schema：`struct_rel` 非 string → fail-closed（白名单非法同类）  
- [x] **⑤** 测试扩 `test/graph-drift.test.ts`（或新档）；缺省零回归 + 正向分层 + 负向坏路径  
- [x] **⑥** usage/手册一行：可配模块表路径  
- [x] **⑦** 四门 · gate-check · 提交 `feat(3.2-W2): …` · **00 close**（close 留 00）

## 非范围

| 项 | 理由 |
|----|------|
| IB / indexes / AST | W1 已关 / W3 / 另 Epic |
| 改缺省 `01_struct.md` 字面 | 兼容 3.1 |
| 自动写盘修表 | 只读 |
| bump / publish | W5 / 仅人 |

---

## 失败路径

| 触发 | 行为 | 可重试 | 可见 |
|------|------|--------|------|
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 是 | 是 |
| `struct_rel` 文件缺失 | exit 2 · struct_missing | 是 | 是 |
| 不可解析 | exit 2 · struct_unparseable | 是 | 是 |
| `struct_rel` 类型非法 | exit 2 fail-closed | 是 | 是 |
| 无配置 | 行为=3.1 · exit 依其余漂移 | — | — |
| 四门红 | 停 | 是 | 是 |

---

## 验收标准

- [x] **A1**：无 `graph-drift.yaml` 或无 `struct_rel` → 仍读 `01_struct.md`（与 3.1 同）  
- [x] **A2**：`struct_rel: l1/01_modules.md`（含协议「路径 glob」）且覆盖候选目录 → 无 struct_* 漂移（就模块表路径而言可绿）  
- [x] **A3**：`struct_rel` 指向不存在文件 → exit 2 · struct_missing  
- [x] **A4**：指向存在但不可解析 → exit 2 · struct_unparseable  
- [x] **A5**：`struct_rel` 非 string → exit 2  
- [x] **A6**：既有 drift 测零回归  
- [x] **A7**：四门绿  
- [ ] **A8**：gate-check + `task close` · 提交 `feat(3.2-W2): …` · 未 bump/tag/push/publish · **00 close**

---

## 给执行帽的必读列表

1. SPEC `02` §3 · `03` §1.2 · `04` W2 · PLAN W2  
2. `src/cli-graph-drift.ts`：`STRUCT_REL_DEFAULT` · `loadWhitelist` · `runGraphDrift` structAbs  
3. `test/graph-drift.test.ts`  
4. W1 done task（过程参考）

---

## 思考轮

### R0 · 证据

| 锚点 | 实读 |
|------|------|
| 硬钉 | `cli-graph-drift.ts:13` `STRUCT_REL_DEFAULT = '01_struct.md'` |
| 拼路径 | `:255` `path.join(opts.inputRoot, STRUCT_REL_DEFAULT)` |
| 配置加载 | `:157-200` `loadWhitelist` 只读 exempt_* · **尚无** `struct_rel` |
| 配置相对 | 白名单相对 **target**；`struct_rel` SPEC 钉相对 **input**（30 须测锁） |

### R1 · 范围

仅 `struct_rel` 可配 + 测 + 文档一行。排 W3+。

### R2 · 方案

扩 drift 配置加载返回 `structRel`；`runGraphDrift` 使用之；非法类型 fail-closed。

### R3 · 边界

不改缺省；不写盘；不绑 verify。

### R4 · 可测性

A1–A6 fixture；A7–A8 四门+close。

### R5 · 签收就绪

交 20 → 00 签 → 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 硬钉 01_struct · 无 struct_rel 键 | no |
| R1 | 仅 W2 | no |
| R2 | 扩 load + runGraphDrift | no |
| R3 | 缺省兼容 fail-closed | no |
| R4 | A1–A8 | no |
| R5 | 待 20 | no |

**residual_risks**：① struct_rel 相对 input vs target 易混——测锁相对 input；② POINTER 形模块表不可解析——A4 覆盖。

---

## 测试策略（Harness）

**test_strategy**: `required`

---

## 提交信息约定

- `feat(3.2-W2): graph drift 支持 struct_rel 可配置模块表路径`  
- 禁 `git add -A` · 禁 bump/tag/push/publish  

### 自检结论（执行者）

| 项 | 结果 |
|----|------|
| verify --task | PASS（闸 approved · pre-30 invoke 齐） |
| graph-drift 测 | 17 pass（含 W2-A1–A5） |
| 全量 test | 974 pass · 1 skipped |
| 四门 | typecheck → test → build → test:lib 绿 · gate-check 无阻塞 |
| 相对 --input | W2-A2 诱饵锁（target/l1 不可解析表不被读） |
| N1 detail 点名 | struct_missing/unparseable 用实际 `structRel` |
| 禁区 | 未 bump/tag/push/publish · 未 `git add -A` |
| A8 close | **留 00** |

旧测影响面（K7/N2）：`test/graph-drift.test.ts` 既有 A1–A8/N2 + 零回归 scaffold help；W2 用例 additive。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-11 | 10-task 初稿 · 00 开拆 W2 · 过程闸 pending |
| 2026-10-11 | 20 审 R1 PASS · **00 签收** HG-TASK-DRAFT / HG-AUDIT-R1 → approved · 可 30 |
| 2026-10-11 | 30/40：实现 `struct_rel` · 测 17 · 四门绿 · A1–A7 勾 · A8 留 00 |
