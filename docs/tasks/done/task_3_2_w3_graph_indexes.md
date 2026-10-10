# Task：3.2 W3 · graph indexes check（IB ↔ indexes 双向 · opt-in）

> **状态**：`done` · **00 验收关账** 2026-10-11（A1–A10 · `8f2ed88`）  

> **上游 SPEC**：[`docs/spec/3_2-graph-ib-and-indexes/`](../../spec/3_2-graph-ib-and-indexes/README.md) · [`02`](../../spec/3_2-graph-ib-and-indexes/02_product_scheme.md) §4 · [`03`](../../spec/3_2-graph-ib-and-indexes/03_cli_and_review.md) §1.3 · [`04`](../../spec/3_2-graph-ib-and-indexes/04_execution_waves.md) **W3**  
> **PLAN**：[`PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](../../roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md) **W3**  
> **上游**：W1/W2 done · 同支 `task/specwave-3-2-w1-ib-check`  
> **过程授权**：00 签过程闸 · 见 [`invoke_20261011_00_orchestrate_w2_w5.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261011_00_orchestrate_w2_w5.md)  
> **行号口径**：2026-10-11 · 30 复核  

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `3-2-w3-graph-indexes` |
| **test_strategy** | `required` |
| **test_strategy_note** | 未配置行为测锁；双向漂移各一负向；绿向；不进 verify；临时 fixture |
| **code_quality_bar** | `strict` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40,00` |
| **git_branch** | `task/specwave-3-2-w1-ib-check` |
| **graph_delta** | `none` |
| **graph_delta_note** | 新 CLI/配置；不改自图 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 20/00 裁定 |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | 3.2 同支统一 PR |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | — | epic |
| HG-NEXT-PLAN | approved | — | epic |
| HG-TASK-DRAFT | approved | 20, 30 | 2026-10-11 **00 签收**（统筹 W2–W5）· lint + [`task_3_2_w3_graph_indexes_audit_R1_20261011.md`](../../harness/reviews/task_3_2_w3_graph_indexes_audit_R1_20261011.md) PASS · blocking 0 |
| HG-AUDIT-R1 | approved | **30** | 2026-10-11 **00 签收** · **可 30** |

---

## 背景与目标

trilayer 仓 IB 与倒排 indexes 双向漂移是主风险；SpecWave 尚无产品闸。本波交付 **opt-in** `graph indexes check`：配置化 glob，**禁止**硬编码七域。

**完成态**：配置合法时可双向检查；未配置行为测锁且**不**进默认 `verify`；`--json` 只增；四门绿 · 未 bump/tag/push/publish。

---

## 范围（MVP 协议钉）

配置文件（相对 **`--target`**）：`.spec-wave/graph-indexes.yaml`

```yaml
version: 1
# 相对 --input（缺省 docs/_tech_graph）的 glob，可多条
flow_globs:
  - "10_flow_*.graph.yaml"
  - "**/10_flow_*.graph.yaml"   # ** 已测锁
index_globs:
  - "indexes/**/*.yaml"
# 索引 YAML MVP 唯一形态（30 钉）：
# entries: [{ path: string, symbol?: string }]
```

语义（归一化键 `path` + 可选 `symbol`，空/TBD path 跳过）：

1. 从 flow yaml 收集 `nodes[].implementedBy` → 集合 **IB**  
2. 从 index yaml 收集条目 → 集合 **IX**  
3. 要求 **IB ⊆ IX** 且 **IX ⊆ IB**（双向相等）；单向缺失 → exit 2 · 点名  

CLI：

```text
npx spec-wave graph indexes check [--target] [--input] [--json]
```

- [x] 接线 help/分发  
- [x] 加载配置 + 双向检查 + `--json`  
- [x] 未配置：**exit 1 usage**（已钉并测）  
- [x] **不**改 `verify` 默认链  
- [x] 测试新档 · 四门 · `feat(3.2-W3): …` ·（A10 close 留 00）

## 非范围

| 项 | 理由 |
|----|------|
| `--write` 生成 indexes | SPEC 二期 |
| AST / 七域硬编码 | 禁 |
| 默认绑进 verify / CI 硬门禁样例 | SPEC |
| struct_rel / IB 返工 | W2/W1 已关 |
| bump/publish | W5 / 仅人 |

---

## 失败路径

| 触发 | 行为 | 可重试 | 可见 |
|------|------|--------|------|
| HG-AUDIT-R1 pending | 拒 30 | 是 | 是 |
| 无配置文件 | exit 1 usage（已钉） | 是 | 是 |
| 配置 schema 坏 | exit 2 fail-closed | 是 | 是 |
| IB 有、IX 无 | exit 2 | 是 | 点名 |
| IX 有、IB 无 | exit 2 | 是 | 点名 |
| 双向一致 | exit 0 | — | — |
| 进默认 verify | **禁止** | — | 测锁 |

---

## 验收标准

- [x] **A1**：help 列出 `indexes check`  
- [x] **A2**：无 `.spec-wave/graph-indexes.yaml` → exit 1 usage（已钉）  
- [x] **A3**：配置合法且 IB=IX → exit 0  
- [x] **A4**：IB 多一条 → exit 2  
- [x] **A5**：IX 多一条 → exit 2  
- [x] **A6**：坏配置 → exit 2  
- [x] **A7**：`--json` 可解析差异；既有命令零回归  
- [x] **A8**：`verify`（无 indexes 步）行为不强制跑本命令（测锁）  
- [x] **A9**：四门绿  
- [x] **A10**：gate-check + close · `feat(3.2-W3): …` · 未 bump/tag/push/publish · **00 close**

---

## 给执行帽的必读列表

1. SPEC 02§4 · 03§1.3 · 04 W3 · PLAN W3  
2. `src/cli-graph.ts` · `cli-graph-ib.ts`（IB 收集参考）· `cli-graph-yaml.ts`  
3. W1/W2 done（过程）  

---

## 思考轮

### R0 · 证据

| 锚点 | 实读 |
|------|------|
| 无 indexes 子命令 | `cli-graph.ts` help/分发（W1 后有 ib/drift · **无** indexes） |
| IB 收集 | `cli-graph-ib.ts`（复用或抽取共享 helper · 30 自裁） |
| 配置族 | `.spec-wave/` 已有 drift/vocab |

### R1 · 范围

仅 opt-in indexes 双向 MVP。排 AST/write/verify 绑入。

### R2 · 方案

新模块 `cli-graph-indexes.ts` + graph-indexes.yaml；集合相等。

### R3 · 边界

未配置不进 verify；禁七域；只读。

### R4 · 可测性

A1–A10 fixture。

### R5 · 签收就绪

交 20 → 00 签 → 30。

### 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 无 indexes 命令 | no |
| R1 | 仅 W3 MVP | no |
| R2 | 配置化双向集合 | no |
| R3 | opt-in · 禁七域 | no |
| R4 | A1–A10 | no |
| R5 | 待 20 | no |

**residual_risks**：① index YAML 方言过多——MVP 只认一种 entries 形态并文档化；② glob `**` 支持面——测锁。

---

## 测试策略（Harness）

**test_strategy**: `required`

---

## 提交信息约定

- `feat(3.2-W3): graph indexes check IB 与 indexes 双向一致闸`  
- 禁 `git add -A` · 禁 bump/tag/push/publish  

### 自检结论（执行者）

- verify --task PASS（闸 approved · pre-30 invoke 10/20/00 齐）  
- 实现：`src/cli-graph-indexes.ts` + `cli-graph.ts` 接线；配置 `.spec-wave/graph-indexes.yaml`；未配置 exit 1；双向集合；`--json`；禁七域/`--write`；不进 verify  
- 测：`test/graph-indexes-check.test.ts` **10**（A1–A8 + `**` glob + entries 形态负向）  
- 旧测影响面：additive；ib/drift/verify 零语义改；S2 过程件互链须显式 `git add` 后再跑 check-doc-links  
- 四门：typecheck / test / build / test:lib  
- 未 bump/tag/push/publish · A10 close 留 00  

---


### KPI（00）

Task_KPI%: 96（A1–A10 · indexes 10 测 · 四门绿 · opt-in · 未绑 verify；扣分：无）

- rubric：`KPI_RUBRIC_v1_2`

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-11 | 10-task 初稿 · 00 开拆 W3 |
| 2026-10-11 | 20 审 R1 PASS · **00 签收** 过程闸 → approved · 可 30 |
| 2026-10-11 | **30** 实现 indexes check · A1–A9 · A10 留 00 |
| 2026-10-11 | **00 验收关账** · A10 close · SPEC04 W3 勾选 · W4 未开 |
