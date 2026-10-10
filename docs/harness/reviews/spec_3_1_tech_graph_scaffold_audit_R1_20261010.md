# 审查文 · 3.1 技术图谱脚手架 SPEC · R1

> **hat**：20-spec-audit（书面审查 · R1）  
> **日期**：2026-10-10  
> **被审对象**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md) 全夹 7 份（README + 00～05）  
> **对照**：[`PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) · 会话产品钉（模板暂不扩 · 可审草稿 · 人/Agent 共审 · 三轨 · 接入后直接生成一份）· 3.0.2 延后项 F-2 / F-1②  
> **方式**：只读通读 SPEC 夹 + PLAN；对照现行 `src/cli-graph.ts` 子命令面（确认尚无 `scaffold`/`drift`，属本版新增意图）；**未改被审文件任何字节** · **不代签**人闸  

---

## 1. 核对项

| # | 项 | 结果 |
|---|----|------|
| 1 | 范围与维护者诉求对齐 | **通过** |
| 2 | 非范围成表且与 PLAN 一致 | **通过** |
| 3 | 完成态 / 验收可机判或可观察 | **通过**（W1 红测与 epic 总表在位） |
| 4 | failure_paths 可观测 | **通过**（03 §3） |
| 5 | R0–R5 思考轮控制闭合 | **通过**（05） |
| 6 | 草稿 ≠ 签收真值 / 禁自动人签 | **通过**（贯穿 00/01/02/03） |
| 7 | 模板不扩纪律 | **通过** |
| 8 | 与既有 `graph yaml *` 零破坏声明 | **通过** |
| 9 | 承接 F-2 / F-1② 入波 | **通过**（W3/W4） |
| 10 | 布局公约（专属夹 + 索引行） | **通过**（`docs/spec/README.md` 已登记） |

---

## 2. 逐份结论

| 文件 | 结论 | 说明 |
|------|------|------|
| `README.md` | **通过** | slug / 拟发版 3.1.0 minor / 双闸 pending / 一句话目标与读序完整 |
| `00_policy_and_boundaries.md` | **通过** | S2 / P0 / 非范围 / 文案 / semver / 流程边界齐；草稿不得自动人签明文 |
| `01_problem_and_goals.md` | **通过** | P1–P5 痛点清楚；收窄「禁止自动生图」与允许受约束脚手架划界正确；完成态 6 条可观察 |
| `02_product_scheme.md` | **通过** | 三轨 A/B/C 与波次映射清楚；输出钉死集合可验收；写盘拒写/草稿覆盖策略在位 |
| `03_cli_and_review.md` | **有条件通过** | 命令面与人/Agent 共审协议齐；失败路径表可用。见 §4 advisory A1–A3 |
| `04_execution_waves.md` | **通过** | W0–W5 编排合理；W1 核心、W3/W4 债项、W5 发版分工清楚 |
| `05_thinking_rounds.md` | **通过** | 控制表 early_stop 全 no；R0–R5 非空壳；残余风险与 monorepo/文案/白名单对应 |
| PLAN（对照） | **通过** | 范围校核表与 SPEC 非范围一致；波次同构；硬约束与 00 对齐 |

---

## 3. 与现状代码抽查（意图面 · 非实现验收）

| # | 抽查 | 结果 |
|---|------|------|
| 1 | `src/cli-graph.ts` 现行子命令 | 仅有 `yaml` / `ingest` / `snapshot` / `axioms` / `ontology` · **无** `scaffold` / `drift` → 与「拟新增」一致，非文档撒谎 |
| 2 | 缺省图谱目录惯例 | 既有 yaml 面缺省 `docs/_tech_graph` → 与脚手架缺省输出一致 |
| 3 | 索引行 | `docs/spec/README.md` 含 `3_1-tech-graph-scaffold` draft 行 |

---

## 4. 问题清单（分级）

### 阻塞（blocking）

**无。** 不退回 10-spec。

### 有条件（advisory · 须在 W1/对应波 task 定稿消解 · 不挡 SPEC 人签）

| ID | 位置 | 问题 | 建议处置 |
|----|------|------|----------|
| **A1** | 03 §2.1 | 审核清单路径「二选一」未钉死 | W1 task 验收钉唯一路径（推荐 `docs/_tech_graph/REVIEW_CHECKLIST.md`，避免点文件被忽略） |
| **A2** | 03 §3 vs §1.1 | 失败路径出现 `--strict`，命令面未列 | W1 要么纳入 argv 表，要么删失败路径中的 `--strict`，避免半特性 |
| **A3** | 03 §1.1 | `--yes` 与 `--dry-run` 同现时优先级未写 | W1 钉：同现 → 用法错误 exit 1，或 dry-run 胜出且零写盘 |
| **A4** | 02 §4.1 | 存量 S2+「旗标或探测」触发方式未命名 | W2 或 W1 钉旗标名（如 `--mode minimal`）或写死「仅探测启发式、无旗标」 |
| **A5** | 02 §2.2 | 浅扫「深度与文件数上限」无数值 | W1 task 钉具体上限（并进测试），SPEC 层可不改 |

### 提示（hint）

| ID | 说明 |
|----|------|
| H1 | 00 禁 `--force`/`--allow-*`；本版 `--overwrite-draft` 属窄语义覆盖旗标，**不**判违规，但 W1 文档须强调「仅草稿标记文件」 |
| H2 | W3「一级包目录」与 W1「顶层目录」用语略异；W3 task 开波前对齐探测/漂移同一词表 |
| H3 | 历史 `TASK_graph_bootstrap` 仍写「不做全仓扫描自动生图」；W2 已排改口径，签收后勿漏 |

---

## 5. R0–R5 闭合核对

- 控制表 6 轮均有结论摘要 · `early_stop=no` · 合理。  
- R1 范围/非范围与 00/01/PLAN 非范围表一致。  
- R2 三方案弃选有理由，非单方案硬塞。  
- R3 失败路径在 03 成表，与 residual_risks 呼应。  
- R4 `test_strategy=required` 与 W1/W3/W4 红测要求对应。  
- R5 指向本审与人签后拆 task · 本棒兑现。  

---

## 6. 结论

| 项 | 值 |
|----|-----|
| **判定** | **conditional_pass**（PASS-with-issues · **无 FAIL**） |
| **HG-SPEC-SIGNOFF 建议** | **建议人签 approved**（仅人；本棒不代签） |
| **HG-NEXT-PLAN 建议** | **建议人签 approved**（与 SPEC 同签或先后；仅人） |
| **是否退回 10-spec** | **否** |
| **blocking** | **0** |
| **advisory** | A1–A5（进 W1/W2/W3 task 定稿，不挡本闸） |

**签收后下一棒**：00 按 `04_execution_waves` 拆 **W1** task（验收须吸收 A1–A3、A5）；**勿**在双闸 pending 时改 `src/`。  
**禁止**：本审查代签任何人闸；附 30 实现 Prompt。

---

## 7. 给维护者的签收提示（可选原文）

若同意本审结论，请在 SPEC README / PLAN 头栏将：

- `HG-SPEC-SIGNOFF` → `approved`（注明日期与签收人）  
- `HG-NEXT-PLAN` → `approved`  

并令 00 开 W1 task；A1–A5 写入该 task「实现备忘 / 验收」以免丢失。

---

**签名**：20-spec-audit · R1 · 2026-10-10 · 仅书面审查 · 未改被审对象  
**落盘**：`docs/harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md`

---

## 附录 · 维护者裁决回填（A1–A5 · 2026-10-10）

> 非复审翻盘；记录 advisory 消解，便于拆 W1 时不再重开二选一。

| ID | 裁决 |
|----|------|
| A1 | 唯一路径 `docs/_tech_graph/REVIEW_CHECKLIST.md` |
| A2 | **做** `--strict`（默认 Warning；加旗标轻检不过 → exit 2） |
| A3 | `--yes` 与 `--dry-run` 同现 → **exit 1** |
| A4 | 显式 `--mode full`（缺省）/ `--mode struct-only` |
| A5 | 浅扫：深度 **4** · 文件 **200** · 主流程节点 **16** |

真值已回填 SPEC `02`/`03`/`04` 与 PLAN W1 节。
