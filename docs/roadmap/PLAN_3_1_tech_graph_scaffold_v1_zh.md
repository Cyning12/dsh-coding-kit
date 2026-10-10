# 规划 · 3.1.0 · 技术图谱脚手架与可审草稿

> **状态**：`approved` · **HG-NEXT-PLAN=approved**（2026-10-10 维护者本窗签收 · 原文「签收，拆W1」）  
> **目标发版**：`spec-wave@3.1.0`（**minor** · 消费者可观察新能力）  
> **基线**：`spec-wave@3.0.2` published  
> **配套 SPEC**：[`../spec/3_1-tech-graph-scaffold/`](../spec/3_1-tech-graph-scaffold/README.md)（**HG-SPEC-SIGNOFF=approved** · 同窗）  
> **格式模板**：[`PLAN_3_0_2_patch_v1_zh.md`](./PLAN_3_0_2_patch_v1_zh.md)（结构骨架沿用）  
> **起草日期**：2026-10-10

---

## 一句话

业务仓接入后不再「只有模板」：用 `graph scaffold` **自动生成** `docs/_tech_graph/` **可审草稿**（顶层 + 模块表 + ≥1 主流程）；人与 Agent 共审；再补齐漂移闸（F-2）与仓级词表（F-1②）。模板业务占位**暂不扩**；草稿默认不得自动人签。

---

## 范围来源校核

| # | 项 | 级别 | 出处 | 入 3.1 结论 |
|---|----|------|------|-------------|
| 1 | 模板暂不扩，但要自动化内容生成 | 战略 | 维护者 2026-10-10 会话 | ✅ **W1** |
| 2 | 人与 Agent 均可审核 | DX | 同上 | ✅ **W1 清单 + W2** |
| 3 | 三轨并存时接入后直接生成一份（可审草稿） | 产品钉 | 同上 · SPEC 01/02 | ✅ **W1** |
| 4 | F-2 图谱漂移机械闸 | 中频债 | 3.0.2 PLAN 非范围 · ACCEPTANCE 延 3.1.0 | ✅ **W3** |
| 5 | F-1② 仓级词汇扩展档 | 中频债 | 同上 · `.spec-wave/graph-vocab.yaml` | ✅ **W4** |
| 6 | 扩 `assets/graph/templates/` 业务占位 | — | 维护者明确暂不 | ❌ 冻结 |
| 7 | 自动 approved `HG-GRAPH-MODULES` | — | 闸纪律 | ❌ 禁止 |
| 8 | 全仓子流程一次生成 | — | D4-a | ❌ 禁止 |
| 9 | 自定义本体类开放 | — | 3.0 ONTO-OPEN | ❌ 不开放 |
| 10 | 宿主适配表 schema 变更 | — | 触 schema | ❌ 非本版 |

---

## 波次总表

| Wave | 主题 | 内容 | 级别 |
|------|------|------|------|
| **W0** | 签收 | SPEC/PLAN 审签 · 拆 task | 文档 |
| **W1** | **graph scaffold** | 探测 → 写草稿集合 → 轻检 → 审核清单 · dry-run/`--yes` | 核心 |
| **W2** | 入手链 + Agent 面 | quickstart / bootstrap 任务模板改口径 / 可选宿主薄封装 | DX |
| **W3** | **graph drift** | 模块覆盖 + 锚点消失 · CI 样例可选 | 保真 |
| **W4** | 仓级词表 | `.spec-wave/graph-vocab.yaml` 合并加载 | 覆盖 |
| **W5** | 收尾发版 | CHANGELOG · MIGRATION · ACCEPTANCE · bump 3.1.0 | release |

**编排理由**：先有草稿（W1）再接文档链（W2），再兑现已承诺债（W3/W4），最后发版（W5）。每波独立 task、独立提交、四门绿、禁 `git add -A`。

---

## W1 · 脚手架（细节钉）

- **命令**：`graph scaffold [--target] [--input] [--stack auto|node|python] [--mode full|struct-only] [--strict] [--dry-run|--yes] [--overwrite-draft]`  
- **互斥**：`--yes` 与 `--dry-run` 同现 → **exit 1**  
- **模式**：缺省 `--mode full`；存量精简用显式 `--mode struct-only`（不自动猜档位）  
- **严格**：`--strict` 时轻检不过 → exit 2；默认仅 Warning 入清单  
- **输出钉死**：`00_main.graph.yaml` · `01_struct.md` ·（full 时）≥1×`10_flow_*.graph.yaml` · `99_mermaid_protocol.md` · **`REVIEW_CHECKLIST.md`**；`02_version.md` 可选  
- **浅扫上限**：深度 **4** · 文件数 **200** · 主流程节点 **16**（触顶截断 · 清单标明 · 非失败）  
- **纪律**：草稿标记；人签表 pending；非空拒写；不写 S2  
- **验收**：dry-run 零写盘；同现互斥 exit 1；`--yes` 后 compile/check 可跑；`--strict` 负向咬 exit 2；触顶 fixture 截断可见；既有 yaml 测试零回归  
- **20 审 A1–A5**：已由维护者 2026-10-10 裁决消解（见 SPEC 02/03 修订记录）

## W2 · 入手链

- init/手册增加真实下一步命令  
- `TASK_graph_bootstrap`：优先 scaffold；模板仅协议回退  
- 可选 kit 命令/skill 调 CLI  

## W3 · 漂移（F-2）

- `graph drift [--json]`  
- MVP：一级包目录 ∈ 模块表；已登记 path 消失即红；白名单  
- **不**自动重画图谱  

## W4 · 仓级词表（F-1②）

- `.spec-wave/graph-vocab.yaml` + 内置合并；冲突 fail-loud  
- 缺省文件 = 与 3.0.2 行为一致  
- 「登记 ≠ 封闭」不回退  

## W5 · release

- bump `3.1.0` · pins · CHANGELOG · ACCEPTANCE · 索引行状态  
- tag/push/publish 按当次授权（publish 默认仅人）  

---

## 非范围（明确不做）

| 项 | 说明 |
|----|------|
| 扩模板业务占位 | 维护者冻结 |
| 自动人签任何 HG | 闸纪律 |
| 全仓 flow 一次生成 | D4-a |
| 图谱 UI / ontology 内容开放 | 沿用既有边界 |
| 锁档 pins、多包 consumer 钉 | 仍属「3.1 评估」另项，不绑本 epic 硬门槛 |
| schema breaking | 另开 major |

---

## 硬约束

1. S2 过程域永不覆写。  
2. 禁止新增 `--force` / `--allow-*` 绕过。  
3. 不改既有 `graph yaml compile|export|check` 默认判定语义。  
4. 对外只称「可审草稿」，禁称自动权威真值。  
5. 修严/新闸配负向 fixture。  
6. 闸须落 task `### 人工闸` 才可机检。  
7. 本 PLAN 行号/探测列表为意图钉；实现前 10-task 回源复核。  

---

## 人工闸

| human_gate_id | status | blocks |
|---------------|--------|--------|
| HG-NEXT-PLAN | **approved**（2026-10-10 维护者 · 「签收，拆W1」） | 开 W1 实现 |
| HG-SPEC-SIGNOFF | **approved**（同窗 · 见 SPEC README） | 拆波 task |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 与 SPEC `3_1-tech-graph-scaffold` 同棒落盘 |
| 2026-10-10 | 维护者裁决回填 W1：清单路径 / `--strict` / 互斥 exit 1 / `--mode` / 浅扫 4·200·16（消解 20 审 A1–A5） |
| 2026-10-10 | HG-NEXT-PLAN=approved（维护者「签收，拆W1」）· 开拆 W1 task |
| 2026-10-10 | **W1 00 验收关账** · 开拆 W2（入手链 DX）· W3–W5 未开 |
| 2026-10-10 | **W2 00 验收关账** · A-opt1 跳过 · W3–W5 未开 |
| 2026-10-10 | **W3 00 验收关账** · graph drift · W4–W5 未开 |
