# harness/prompts

从本目录向用户仓 **`docs/harness/prompts/`** 复制 **Starter 子集**。

## 标准流程（V2.1）

```text
人 + 00 chat 大纲
  → 路径 A/B/C/D 选型（见 SDD_HAT_FLOW §2 · §5）
  → （A）10-spec → 20-spec-audit + HG-SPEC-SIGNOFF
  → 00 起草 task（编排壳或阶段子 task）
  → 10-task → 20-task-audit R1 → HG-AUDIT-R1
  → 30 → 40（同 Agent · 自修重跑直至通过）
  → 50（↺ 30 · 可选）→ CLOSE
```

**Inform / 图谱分期（路径 D）**：SPEC 签收后 **每阶段一子 task**（P1 空树 → P2 G-L0 → P3 modules → P4 flow 增量…）；禁止单次 30 画满全部 flow。详述：SDD_HAT_FLOW_v2_zh.md（不随包发布 · 薄指针页 `assets/docs/POINTER_SDD_HAT_FLOW.md`）。

| 10 | 20 | 人闸 |
|----|-----|------|
| 10-spec | 20-spec-audit | HG-SPEC-SIGNOFF（或等价闸） |
| 10-task | 20-task-audit | HG-AUDIT-R1 |

## Starter（本目录）

| 文件 | hat_id | 说明 |
|------|--------|------|
| [`10-task-requirements.md`](./10-task-requirements.md) | 10-task | task 思考 · 验收/failure_paths |
| [`10-spec-requirements.md`](./10-spec-requirements.md) | 10-spec | SPEC 思考 · R0–R5 |
| [`20-task-audit.md`](./20-task-audit.md) | 20-task-audit | reviews/ · HG-AUDIT-R1 |
| [`20-spec-audit.md`](./20-spec-audit.md) | 20-spec-audit | SPEC 书面审 · HG-SPEC-SIGNOFF |
| [`30-execute-code.md`](./30-execute-code.md) | 30 | 实现 · **含 40 自检闭环** |
| [`40-self-check.md`](./40-self-check.md) | 40 | 与 30 同 Agent · 规则分文件 |
| [`FRAGMENT_30_gate_verify_v1_zh.md`](./FRAGMENT_30_gate_verify_v1_zh.md) | — | GATE_VERIFY · pre-30 / graph 字段 |
| [`TEMPLATE_30_gate_stop.md`](./TEMPLATE_30_gate_stop.md) | — | 30 拒开工 |

Extended（00 / 50 / handoff / 链式 PROMPT）：工作区 `docs/harness/prompts/` · 见 SDD_HAT_FLOW_v2_zh.md §6（不随包发布 · 薄指针页 `assets/docs/POINTER_SDD_HAT_FLOW.md`）。

## Agent Skills 封装（v2.23+）

本目录 6 个条文的头部 frontmatter（`name`/`description`/`metadata.hat_id` 等）是 **Agent Skills 标准元数据单源**；包根 [`skills/`](../../skills/) 为其标准封装（`npx dsh-coding-kit skills build` 生成物 · **勿手改** · `npx dsh-coding-kit skills check` 拦 drift）。改条文正文后须重跑 build。执行帽（30/40）frontmatter 已备，但**不进默认分发**（T1 闸评测通过前 · 见 `eval/t1_gate_bypass/`）。

> **V2 改名（v2.4.0）**：`10-requirements.md` → `10-task-requirements.md`（+新增 `10-spec-requirements.md`）；`22-task-audit.md` → `20-task-audit.md`（+新增 `20-spec-audit.md`）。旧文件已删除；业务仓升级时 sync 会对残留旧帽 warn 提示人工删除。

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-21 | V2 标准流程 · 30→40 同 Agent · 50/CLOSE 打回 |
| 2026-07-24 | V2 拆分收编：10→10-task/10-spec · 22→20-task-audit/20-spec-audit · 旧文件删除 |
| 2026-07-29 | **v2.1**：路径 D Inform/meta · 链 SDD_HAT_FLOW §5 · GATE_VERIFY fragment 入表 |
