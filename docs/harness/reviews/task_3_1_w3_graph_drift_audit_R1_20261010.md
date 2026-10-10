# 审查 · 20-task-audit R1 · 3-1-w3-graph-drift

> **日期**：2026-10-10 · **hat**：20-task-audit  
> **task**：[`docs/tasks/active/task_3_1_w3_graph_drift.md`](../../tasks/active/task_3_1_w3_graph_drift.md)  
> **上游 SPEC**：[`docs/spec/3_1-tech-graph-scaffold/`](../../spec/3_1-tech-graph-scaffold/README.md) · [`04` W3](../../spec/3_1-tech-graph-scaffold/04_execution_waves.md) · [`02` §3.2](../../spec/3_1-tech-graph-scaffold/02_product_scheme.md) · [`03` §1.3 / failure 漂移 exit 2](../../spec/3_1-tech-graph-scaffold/03_cli_and_review.md)（HG-SPEC-SIGNOFF=approved）  
> **上游 PLAN**：[`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](../../roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) **W3 · 漂移（F-2）**（HG-NEXT-PLAN=approved）  
> **W1/W2 关账对照**：[`task_3_1_w1_graph_scaffold`](../../tasks/done/task_3_1_w1_graph_scaffold.md) · [`task_3_1_w2_graph_dx`](../../tasks/done/task_3_1_w2_graph_dx.md)（结构参考 · **防回灌** scaffold/DX）  
> **10 invoke**：[`invoke_20261010_10_3-1-w3-graph-drift.md`](../invokes/by-task/3-1-w3-graph-drift/invoke_20261010_10_3-1-w3-graph-drift.md)  
> **方式**：只读对照 SPEC/PLAN/W1·W2 done/task · 抽核 R0 行号 · `task lint` → PASS · **未改 task 实质 / 闸表** · **不代签**人闸  

---

## 结论

| 维度 | 结果 |
|------|------|
| **内容** | **PASS** · **blocking 0** · 不退回 10-task |
| **流程闸** | HG-TASK-DRAFT / HG-AUDIT-R1 仍为 **pending** · **禁止 30 改码**（真值在 task 表） |
| **白名单语义** | **可验收**（缺省全检 · 目录豁免 A6 · 坏 YAML fail-closed · 锚点白名单「必要时」交 30 钉死并测） |
| **审查结论** | **通过** · PASS · blocking 0 |

---

## 核对项（内容）

| # | 核对 | 结果 |
|---|------|------|
| 1 | **范围对齐** SPEC `04` W3 五条（`graph drift` · MVP 模块覆盖+锚点消失+白名单 · `--json` 只增 · CI 样例可选 · 负向测/四门/闸/gate-check）+ PLAN W3 三行（含**不**自动重画）+ `02` §3.2 + `03` §1.3；未扩 W4 vocab / W5 bump | ✅ |
| 2 | **防 W1/W2 回灌**：非范围明示不改 scaffold 探测/写盘/轻检、不改 `graph yaml *` 默认语义、不返工 W2 入手链/薄封装；验收无 scaffold/DX 实现条款；上游关账仅结构参考 | ✅ |
| 3 | **必做/可选拆分**：O1/A-opt1 CI 样例不阻塞 A10；与 SPEC「CI 样例可选步骤」一致 | ✅ |
| 4 | **非范围**：自动重画 · 路由/表名/SSE 扩展面 · 强制 kit CI 硬门禁 · 污染 dogfood · 代签 HG · bump/publish/`git add -A` | ✅ |
| 5 | **验收 A1–A10 + A-opt1**：命令面/exit 2 红绿/TBD/白名单/`printJson`/零写盘/四门/关账均可机检；口径禁「自动权威/自动重画」 | ✅ |
| 6 | **failure_paths**：闸序拒开工 · 模块未覆盖 exit 2 · 锚点消失 exit 2 · `--json`+漂移 · 无漂移 exit 0 · struct 缺失/坏白名单 fail-closed · 禁写盘修复 · 禁改其它 graph 语义 · 禁 W4/W5/bump · 裹挟 · 四门红；对齐 03「漂移 exit 2」 | ✅ |
| 7 | **白名单语义（SPEC 05 residual #3）**：缺省无配置=全量检查（A6）；豁免一级目录可测（A6）；配置候选 `.spec-wave/graph-drift.yaml` 同族；坏 YAML exit 2 fail-closed；锚点 path 前缀/字面为「必要时」扩展 · schema 由 30 钉死并测锁 → **MVP 可验收**（见 N4） | ✅ |
| 8 | **行为变更（K7）旧测影响面**：本波 **additive** 新子命令；A5/A7/`test_strategy_note` 钉既有 `graph yaml`/`scaffold`/`axioms`/`ontology` 零回归 · 充分（未另立 grep 名单标题 → 见 **N5**） | ✅ |
| 9 | **test_strategy=required** · 红测先行 · 临时 fixture · 勿污染本仓 dogfood | ✅ |
| 10 | **R0 行号抽核**（2026-10-10）：`cli-graph.ts:30-47` usage 无 drift · `:50-75` 分发同集合；`cli-graph-scaffold.ts:20-31` `MODULE_DIR_CANDIDATES` · `:568-582` `runLightChecks` path/`TBD`；`cli-shared.ts:477-483` `printJson`；`cli-pins.ts:20` `.spec-wave/` 同族 | ✅ |
| 11 | 闸表 4 列 · `HG-AUDIT-R1` blocks **30** · epic 双闸继承 approved · 本波两闸 pending | ✅ |
| 12 | 元信息：`required_invoke_hats` 含 20 · `graph_delta/wiki_delta=none` · lint **PASS** | ✅ |
| 13 | 思考轮 R0–R5 + 控制表闭合 · residual_risks 三条具体 | ✅（见下节） |

---

## 思考轮审查（阶段 C）

| 轮 | 裁定 |
|----|------|
| R0 证据 | **充分**（无 drift · 轻检有 fs · check 无 fs · pins 同族 · SPEC/PLAN 钉点；抽核一致） |
| R1 范围 | **充分**（仅 W3 MVP · 排除自动重画 / scaffold·DX 返工 / W4/W5 / bump） |
| R2 方案 | **充分**（新子命令 + struct 覆盖 + anchors existsSync + `.spec-wave/graph-drift.yaml` + `printJson` 只增） |
| R3 边界 | **充分**（只报告不重画 · 不改 yaml 默认 · dogfood 列形须显式策略 · 不代签） |
| R4 可测 | **充分**（A1–A10 机检 · A-opt 可选 · 红测先行） |
| R5 就绪 | **充分**（待本审 + 人签 HG-TASK-DRAFT / HG-AUDIT-R1） |

**思考审查结论**：充分，无退回 10-task 项。

---

## Blocking（内容阻塞）

无。**blocking 0**。

---

## Advisory（非阻塞观察）

| ID | 说明 | 建议 |
|----|------|------|
| **N1** | 范围写 path **空**/`TBD` 不计失败；A5 字面偏 TBD，「或不计失败形态」概括空 path | 30 测锁：空 path 与 TBD 同态不咬 exit 2 |
| **N2** | dogfood `01_struct` 列形 ≠ 模板协议（residual_risks ①） | 显式兼容/跳过策略 + fixture；**禁止**悄悄改本仓自图语料凑绿 |
| **N3** | 「一级包目录」= 仅 `MODULE_DIR_CANDIDATES` 或扫全部 top-level（residual_risks ②） | 30 钉死集合并测锁，防过宽误报 |
| **N4** | 白名单「锚点 path 前缀/字面」为必要时扩展；A6 仅钉目录豁免 | 若实现锚点豁免：增独立负向/正向测；否则文档写明本波仅目录豁免 |
| **N5** | K7 未独立「旧测 grep 名单」标题 | 30 开工前列影响面（至少 `test/*graph*` · scaffold/yaml/axioms/ontology 相关）写入自检 |
| **N6** | SPEC `04` W0 仍写「W3–W5 task 未开」与本波开拆略漂移 | 非本 task 内容阻塞；由 00/10-spec 后续勾选更新（本棒不改 SPEC） |

**无 FAIL / 无退回 10-task 项。**

---

## 流程闸（真值在 task 表 · 本棒不改）

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-SPEC-SIGNOFF | approved | epic · 维护者 2026-10-10 · 继承 |
| HG-NEXT-PLAN | approved | epic · 同窗 · 继承 |
| HG-TASK-DRAFT | **pending** | 本波草稿 · 仅人签 · blocks 20/30（流程；本审内容已 PASS） |
| HG-AUDIT-R1 | **pending** | blocks **30** · **未签则 30 拒改码** |

---

## 签收

本审查 R1 为终轮（内容）：**PASS · blocking 0 · 通过 · 签收（内容可执行）**。  
**流程闸（后签）**：2026-10-10 **00** 已将 task 表 HG-TASK-DRAFT / HG-AUDIT-R1 → **approved** · **可 30**。

---

## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（PASS · blocking 0 · N1–N6 非阻塞 · 白名单语义可验收）
- [x] 在 task 人工闸表将 **HG-TASK-DRAFT** 改为 approved（**00** · 2026-10-10 · 授权签收过程文档）
- [x] 在 task 人工闸表将 **HG-AUDIT-R1** 改为 approved（**00** · 同窗）
- [x] commit task 文档或确认已签（随 W3 文档提交）
- [x] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

**签名**：20-task-audit · R1 · 2026-10-10 · 仅书面审查  
**落盘**：`docs/harness/reviews/task_3_1_w3_graph_drift_audit_R1_20261010.md`
