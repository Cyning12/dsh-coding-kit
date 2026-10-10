# 05 · 思考轮（R0–R5）

> **状态**：`draft` · 隶属 `3_2-graph-ib-and-indexes` · 10-spec 回填

---

## 思考轮控制

| 轮 | 主题 | 结论摘要 | early_stop |
|----|------|----------|------------|
| R0 | 读反哺 + 维护者授权 | meta BACKPORT draft；采纳 P0–P3；开 3.x Inform/SPEC；不整包 cp | no |
| R1 | 范围 / 非范围 / 角色 | 范围=IB 契约+ib check+struct_rel+indexes opt-in+迁移文档；非范围=AST/issue-sync/业务阈值/改 3.1 缺省 | no |
| R2 | 方案对比 | 弃整包 Python、弃仅文档；推荐独立点闸 + 配置扩展 + opt-in indexes | no |
| R3 | 边界 / 失败 / 依赖 | 无 IB 零打扰；struct_rel fail-closed；indexes 未配置不进 verify；依赖 3.1 drift 配置族 | no |
| R4 | 验收 / 可测性 | test_strategy=required；各波正负向 fixture；禁污染 dogfood | no |
| R5 | 签收就绪 | SPEC+PLAN 已落盘；交 20-spec-audit 或维护者审后双闸人签 → 00 拆 W1 | no |

**residual_risks（残余风险）**：

1. **契约面**：承认 `implementedBy` 可能被理解为「必须写 IB」→ 文案与 checked=0 绿测锁定零打扰。  
2. **命令面分叉**：实现波若选 `drift --check-ib` 而非独立子命令，文档易混 → 03 已允备选但要求主路径专节。  
3. **indexes 配置爆炸**：裁剪不当会变成第二套 trilayer 政策引擎 → W3 只做双向相等 + 配置化 glob，禁七域硬编码。  
4. **3.1 未 publish**：基线写 3.1.0 planned；实现前确认包版本/分支策略，避免消费者版本叙述漂移。  

---

## R0 · 业务目标

维护者授权：业务仓反哺备忘合理，开 3.x Inform/SPEC。目标产品补齐「点路径」与可配置模块表，indexes 可选；不移植 meta 整包工具。

## R1 · 范围与角色

| 角色 | 诉求 |
|------|------|
| trilayer 消费仓 | IB 假路径能红；模块表可放分层路径；indexes 可机检 |
| 单层消费仓 | 无新义务、无新默认红 |
| kit 维护者 | 单实现方向（TS CLI）；minor 兼容；AST/关账留外 |

## R2 · 方案对比

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| A 整包 cp Python 工具 | 最快复用 meta | 双栈、业务硬编码、不可维护 | 弃 |
| B 只改文档「请自检」 | 零码 | dogfood 已证静默漏检 | 弃 |
| C IB 闸 + struct_rel + opt-in indexes + 迁移文档 | 对准缺口、可测、可分档启用 | 须扩节点契约 | **推荐** |
| D 把 IB 默并进 drift | CI 一条命令 | 改 3.1 缺省预期 | 不作缺省；可作旗标备选 |

## R3 · 边界

见 `00_policy` 与 `03` 失败路径。关键依赖：3.1 `graph drift`、`.spec-wave/graph-drift.yaml`、既有 `printJson` / `resolveTarget`。

## R4 · 验收与测试策略

- `test_strategy=required`  
- 临时目录 fixture；正/负向锁 exit  
- 回归：既有 drift/yaml/scaffold 测试全绿  

## R5 · 签收与下一棒

SPEC 夹与 PLAN 已齐 → **推荐 20-spec-audit** → 人签双闸 → 00 按 `04` 拆 W1（未签前禁改 `src/`）。

---

## 下一棒可复制 Prompt

`````text
你是 20-spec-audit（或维护者本人审）。
必读：
1. docs/spec/3_2-graph-ib-and-indexes/README.md 及读序全文
2. docs/roadmap/PLAN_3_2_graph_ib_and_indexes_v1_zh.md
3. （背景）业务仓反哺备忘 BACKPORT_tech_graph_tools_to_specwave_v1_zh.md · 本窗已裁定采纳 P0–P3、拒 P4/issue-sync 整包
核对：范围/非范围/验收/failure_paths/思考轮控制是否可签收；blocking 项列清单。
重点质疑：
- 无 IB 仓是否真零打扰
- 是否回灌破坏 3.1 drift 缺省
- indexes 是否够「配置化」且未偷运七域
结论落盘 docs/harness/reviews/spec_3_2_graph_ib_and_indexes_audit_R1_<YYYYMMDD>.md
禁止：改 src/；代签 HG-SPEC-SIGNOFF / HG-NEXT-PLAN（仅人）。
若 PASS 且人已签双闸：交 00 按 04_execution_waves 拆 W1 task。
`````

## 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec · R0–R5 回填 |
