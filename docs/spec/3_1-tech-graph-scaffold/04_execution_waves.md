# 04 · 执行波次

> **状态**：`draft` · 隶属 `3_1-tech-graph-scaffold`  
> 每波独立 task · 独立提交（`feat(3.1-W<n>): …`）· 禁 `git add -A` · 波末 `gate-check`

---

## W0 · 签收（文档波 · 零实现码）

- [x] 20-spec-audit 书面审落盘 [`spec_3_1_tech_graph_scaffold_audit_R1_20261010.md`](../../harness/reviews/spec_3_1_tech_graph_scaffold_audit_R1_20261010.md)（conditional_pass · A1–A5 已裁决）  
- [x] **HG-SPEC-SIGNOFF=approved**（2026-10-10 维护者 · 「签收，拆W1」）  
- [x] **HG-NEXT-PLAN=approved**（同窗）  
- [x] 00 拆 **W1** task（本棒）；W2–W5 后续按波拆  
- [ ] W4–W5 task（**W3 已关** · W4–W5 未开）  

## W1 · 脚手架 + 生成后轻检 + 审核清单（核心 · 轨 A + 轨 B 轻量）

> **00 验收**：2026-10-10 · task `3-1-w1-graph-scaffold` · A1–A13 · 未 bump/tag/push/publish

- [x] CLI：`graph scaffold`（无 `--yes` = dry-run 零写盘；仅 `--yes` 写盘；与 `--dry-run` 同现 → exit 1）  
- [x] `--mode full|struct-only`（缺省 full）；`--strict` 轻检咬 exit 2  
- [x] 探测：目录模块 + 入口候选 + 主流程浅扫（深度 4 · 文件 200 · 节点 16）  
- [x] 输出钉死：`00_main` · `01_struct` ·（full）≥1×`10_flow_*` · 协议文件 · **`REVIEW_CHECKLIST.md`**  
- [x] 草稿标记；**不**自动人签  
- [x] 非空目录拒写；`--overwrite-draft` 语义测锁  
- [x] 生成后：glob/锚点轻检 + 推荐同进程 `compile`  
- [x] 红测：空仓成功 / 非空拒写 / TBD / dry-run 零写盘 / 互斥 exit 1 / `--strict` 负向 / 触顶截断  
- [x] usage + 手册/README 一小节（「可审草稿」口径）  
- [x] 四门绿 · HG-AUDIT-R1 · gate-check  

## W2 · 入手链与 Agent 审核面（DX）

> **00 验收**：2026-10-10 · task `3-1-w2-graph-dx` · A1–A8 · A-opt1 本波跳过 · `ba9270b`

- [x] init / 手册 quickstart 增加「下一步：graph scaffold」真实命令  
- [ ] 可选：宿主命令或 skill 薄封装（只调 CLI · 不复制业务逻辑）· **本波未做 · 不挡关账**  
- [x] 审核清单机检项与 Agent 提示词对齐（包内 skill 或 commands 指针）  
- [x] 更新 `TASK_graph_bootstrap`：从「只拷模板」改为「优先 scaffold · 模板仅协议回退」  
- [x] 四门绿 · HG-AUDIT-R1 · gate-check  

## W3 · 漂移闸（轨 B 完整 · 承接 F-2）

> **00 验收**：2026-10-10 · task `3-1-w3-graph-drift` · A1–A10 · A-opt1 · `357b31b`

- [x] CLI：`graph drift`  
- [x] MVP：模块表覆盖一级包目录 + 锚点 path 消失检测 + 白名单  
- [x] `--json` 信封只增不改既有其它命令  
- [x] CI 样例（example workflow）可选步骤  
- [x] 负向 fixture · 四门绿 · HG-AUDIT-R1 · gate-check  

## W4 · 仓级词表（轨 C · 承接 F-1②）

- [ ] 加载 `.spec-wave/graph-vocab.yaml` 与内置合并  
- [ ] 冲突 fail-loud；缺省文件 = 行为与 3.0.2 一致  
- [ ] 登记扩展边型零 Warning；未登记仍 Warning  
- [ ] 文档：消费仓如何声明扩展  
- [ ] 四门绿 · HG-AUDIT-R1 · gate-check  

## W5 · 收尾对外 + release 簿记

- [ ] CHANGELOG / MIGRATION / 使用手册 §图谱 更新  
- [ ] `docs/spec/README.md` 本行状态翻到 IMPLEMENTED（随发版）  
- [ ] ACCEPTANCE 台账  
- [ ] bump `3.1.0` · pins 对齐 · **tag/push/publish 按当次授权**（publish 默认仅人）  

## 编排理由

1. **W1 先行**：无草稿则无入手价值；模板不扩的前提下，脚手架是唯一「从无到有」。  
2. **W2 紧随**：命令在、文案链不上则仍难用；薄封装不阻塞 W3。  
3. **W3/W4**：兑现 3.0.2 已公开延后项，与 `.spec-wave/` 配置目录同波族设计。  
4. **W5**：发版收口与对外口径，避免能力已合并但文档仍写「只有模板」。  

## 验收总表（epic 级）

- [ ] 业务仓模拟 fixture：scaffold → compile/check → 清单存在 → 人签前闸仍 pending  
- [ ] 既有 `graph yaml *` 基线零回归  
- [ ] 漂移与仓级词表至少各一正向 + 一负向  
- [ ] 对外无「自动权威图谱」违纪表述  

## 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
| 2026-10-10 | W1 清单对齐维护者裁决（A1–A5 消解） |
| 2026-10-10 | W1 勾选完成（00 验收）· 开拆 W2 task |
