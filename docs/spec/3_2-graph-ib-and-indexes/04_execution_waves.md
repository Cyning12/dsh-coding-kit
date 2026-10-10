# 04 · 执行波次

> **状态**：`draft` · 隶属 `3_2-graph-ib-and-indexes`  
> 每波独立 task · 独立提交（`feat(3.2-W<n>): …`）· 禁 `git add -A` · 波末 `gate-check`

---

## W0 · 签收（文档波 · 零实现码）

- [x] 20-spec-audit：**豁免**（2026-10-10 维护者直签双闸 · 原文「签收，授权00签收后续文档」；过程记 [`invoke_20261010_00_epic_signoff.md`](../../harness/invokes/by-task/3-2-graph-ib-and-indexes/invoke_20261010_00_epic_signoff.md)）  
- [x] **HG-SPEC-SIGNOFF=approved**（2026-10-10 维护者）  
- [x] **HG-NEXT-PLAN=approved**（同窗）  
- [x] 00 拆 **W1** task（本棒）；W2–W5 后续按波拆  
- [x] 过程授权：本 epic 各波 **00 可签** `HG-TASK-DRAFT` / `HG-AUDIT-R1`（须 lint PASS + 20-task-audit R1 PASS）；**不**代签 release/publish  

## W1 · IB 契约 + 点路径闸（核心 · 反哺 P0）

> **00 验收**：2026-10-10 · task `3-2-w1-graph-ib-check` · A1–A10 · `a78ac3c`

- [x] 扩展 YAML 加载/校验：可选 `nodes[].implementedBy.{path,symbol?}`（透传 + 形状；无 IB 零回归）  
- [x] CLI：`graph ib check`（独立子命令 · 见 03）  
- [x] MVP：path 存在性；空/TBD 跳过；缺文件 exit 2 · `missing_ib_path`  
- [x] `--json` 信封只增不改其它命令  
- [x] 红测：IB 指向不存在 → exit 2；全存在 → exit 0；无 IB 图 → exit 0  
- [x] usage / 手册一小节「点 vs 边」  
- [x] 四门绿 · HG-AUDIT-R1 · gate-check；禁 bump/tag/push/publish  

## W2 · `struct_rel` 可配置（反哺 P1）

- [ ] `.spec-wave/graph-drift.yaml` 增可选 `struct_rel`  
- [ ] 缺省 = `01_struct.md`（与 3.1.0 一致）  
- [ ] 指向含协议列「路径 glob」的分层模块表 → drift 可绿；坏路径 fail-closed  
- [ ] 负向 + 正向 fixture · 四门绿 · HG-AUDIT-R1 · gate-check  

## W3 · indexes 双向闸（反哺 P2 · opt-in）

- [ ] CLI：`graph indexes check`  
- [ ] 配置化 glob / 域列表（禁抄七域硬编码）  
- [ ] 双向一致语义 + `--json`  
- [ ] 未配置行为测锁 · **不**进默认 verify  
- [ ] 四门绿 · HG-AUDIT-R1 · gate-check  

## W4 · yaml 双栈迁移文档（反哺 P3）

- [ ] MIGRATION / 手册：消费仓 `graph:ci` 可切 `npx spec-wave graph yaml …`  
- [ ] 保真分责表（drift / ib / indexes）写入对外路径  
- [ ] 可选：CI 样例注释步骤加 `graph ib check`  
- [ ] 无强制删消费仓 Python · 四门绿（若本波无码则文档+gate-check 裁量）  

## W5 · 收尾对外 + release 簿记

- [ ] CHANGELOG / ACCEPTANCE / `docs/spec/README.md` 本行状态  
- [ ] bump `3.2.0` · pins 对齐 · **tag/push/publish 按当次授权**（publish 默认仅人）  

## 编排理由

1. **W1 先行**：dogfood 最高价值缺口是「点静默 PASS」。  
2. **W2 紧随**：同属 drift 配置族，解锁 trilayer 模块表路径。  
3. **W3**：价值高但 opt-in，不阻塞普通仓。  
4. **W4**：文档收敛可与实现并行精神上靠后，避免未交付命令写进主路径。  
5. **W5**：发版收口。  

**明确延后（本 epic 外）**：AST 插件（反哺 P4）· issue-sync · 业务 completeness 阈值。

## 验收总表（epic 级）

- [ ] fixture：假 IB path → ib check exit 2；真 path → exit 0；无 IB → exit 0  
- [ ] fixture：`struct_rel` 指向分层模块表 → drift 可按新路径工作；缺省行为 = 3.1  
- [ ] fixture：indexes 单向漂移 → exit 2（在已配置前提下）  
- [ ] 既有 drift / yaml / scaffold 基线零回归  
- [ ] 对外无「已含 AST 深闸」违纪表述  

## 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
