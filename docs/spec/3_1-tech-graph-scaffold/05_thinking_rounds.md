# 05 · 思考轮（R0–R5）

> **状态**：`draft` · 隶属 `3_1-tech-graph-scaffold` · 10-spec 回填

---

## 思考轮控制

| 轮 | 主题 | 结论摘要 | early_stop |
|----|------|----------|------------|
| R0 | 读会话目标 | 模板暂不扩；要自动化出可审草稿；人与 Agent 共审；三轨并存时接入后直接生成一份 | no |
| R1 | 范围 / 非范围 / 角色 | 范围=脚手架+轻检+审核清单+漂移+仓级词表+DX；非范围=扩模板业务占位/自动人签/全仓一次画完/可视化/自定义本体 | no |
| R2 | 方案对比 | 弃「只扩模板」「只写文档」；推荐「脚手架草稿 + 共审 + 保真/词表」 | no |
| R3 | 边界 / 失败 / 依赖 | 非空拒写、草稿标记、S2 禁写、探测失败仍出 TBD 草稿；依赖既有 yaml 编译链与 git-root 纪律 | no |
| R4 | 验收 / 可测性 | test_strategy=required；W1 红测钉 dry-run/拒写/最小输出；W3/W4 负向 fixture | no |
| R5 | 签收就绪 | SPEC+PLAN 已落盘；交 20-spec-audit 或维护者直签后由 00 拆 task | no |

**residual_risks（残余风险）**：

1. 探测启发式在 monorepo / 非常规布局上易出噪声模块行 → 靠清单人审 + 行数上限缓解。  
2. 「直接生成一份」若被营销成权威真值 → 文案纪律与默认 pending 人签硬挡。  
3. W3 漂移白名单设计不足会误红 → W3 task 须单独评审白名单语义。  

---

## R0 · 业务目标

维护者要求：下一版升级业务仓技术图谱入手与内容生成；模板暂不扩；自动化生成后人和 Agent 都能审；在内容生成 / 保真 / 覆盖三轨都在的前提下，引入本仓后应能直接生成一份（定义为可审草稿，非已签收真值）。

## R1 · 范围与角色

| 角色 | 诉求 |
|------|------|
| 业务仓维护者 | 一条命令出草稿，少踩「先抄模板再改假路径」 |
| 审查人 | 清单勾选，不必懂编译器细节 |
| Agent | 同一清单机跑 + 改 YAML |
| kit 维护者 | 不扩模板维护面；兑现 3.0.2 延后 F-2/F-1② |

## R2 · 方案对比

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| A 扩模板 | 实现便宜 | 假锚点、不准 | 弃 |
| B 纯文档引导 | 零代码 | 仍只有模板 | 弃 |
| C 脚手架+共审+保真+词表 | 入手快、可证伪、可扩展边型 | 探测有噪声、实现量中等 | **推荐** |

## R3 · 边界

见 `00_policy` 与 `03` 失败路径表。关键依赖：既有 `graph yaml` 管线、消费仓 git 根、`.spec-wave/` 配置目录族（与 pins consumer 同族）。

## R4 · 验收与测试策略

- `test_strategy=required`  
- 优先临时目录 fixture，避免污染本仓 `docs/_tech_graph` dogfood  
- 基线：compile/check 既有测试零回归  

## R5 · 签收与下一棒

SPEC 夹与 PLAN 已齐 → 推荐 20-spec-audit → 人签双闸 → 00 拆 W1 task（勿在未签前改 `src/`）。

---

## 下一棒可复制 Prompt

````text
你是 20-spec-audit（或维护者本人审）。
必读：
1. docs/spec/3_1-tech-graph-scaffold/README.md 及读序全文
2. docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md
核对：范围/非范围/验收/failure_paths/思考轮控制是否可签收；blocking 项列清单。
结论落盘 docs/harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_<YYYYMMDD>.md
禁止：改 src/；代签 HG-SPEC-SIGNOFF / HG-NEXT-PLAN（仅人）。
若 PASS 且人已签双闸：交 00 按 04_execution_waves 拆 W1 task。
````

## 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec · R0–R5 回填 |
