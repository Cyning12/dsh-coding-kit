# Task Audit R1：close-done-snapshot（K5 · task close 成功输出 done 片段快照）

> **task**：`docs/tasks/active/task_close_done_snapshot.md`（slug: `close-done-snapshot` · P2 · 拟 1.8.0）  
> **日期**：2026-08-27  
> **角色**：20-task-audit（书面审 · 未改码 · 未改 task）  
> **证据基线**：ops-desk-api `FEEDBACK_agent_host_plan_ci_20260827.md` §2 #72 · §3 K5 · §5 正确 done 格式真值  
> **闸状态**：HG-TASK-DRAFT=approved（维护者 Q1A · 授权 00 代签）· HG-AUDIT-R1=**pending**

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容** | **退回 10-task**（2 项内容阻塞，见下） |
| **流程闸** | HG-AUDIT-R1 维持 `pending`，**不签发**，无 30 Prompt |
| K5 对齐 | 范围/非范围对准根因（#72 手写 done → close 正向快照 UX），无 scope 膨胀；非范围（不检测存量手写 done、不改冻结文案、不改闸集合）无关键禁区遗漏 |
| dogfood | `task lint --file` PASS（exit=0） |

---

## 核对项

| # | 核对项 | 结果 |
|---|--------|------|
| 1 | 范围/非范围 vs FEEDBACK K5 | ✅ 对准（K5 建议原文即「close 成功 stdout 打印 done 片段快照供 diff 对照」） |
| 2 | 验收可执行 · 与仓内 CI 一致 | ⚠️ 主体可执行（READY 逐字回归可测、既有闸测可复跑）；验收第 4 条仅 `npm test / typecheck / build`，`.github/workflows/ci.yml` 另跑 `npm run test:lib`（非阻塞 N1） |
| 3 | 失败路径表（触发/系统行为/可重试/用户可见） | ⚠️ 四列齐全；BLOCKED / 归档缺 `## Harness 元信息` 异常态（canonical 模板 + WARN）/ dry-run 均覆盖；**缺 `--json` 模式行**（并入阻塞 B2） |
| 4 | 思考轮控制表闭环 · residual_risks | ✅ R0–R2 结论清晰（正向 UX 非负向闸 · READY 不打印 · 归档真值摘录 > 静态模板防漂移）；residual（stdout 变长）合理且已指定 CHANGELOG 缓解 |
| 5 | 代码锚点真实性 | ❌ **B1**：W1 与必读 #2 写 `src/cli-lifecycle.ts` `cmdTaskClose`；实际 `cmdTaskClose` 在 `src/cli.ts:594`，`CLOSE: READY`=`cli.ts:675`、`CLOSE: PASS`=`cli.ts:682`、dry-run/PASS 分支=672–682；`cli-lifecycle.ts` 仅经 `evalCloseGuard` 复用守卫，无 `cmdTaskClose`。其余锚点属实：`extractSection`=`cli-shared.ts:55`（`## Harness 元信息`+`###` endMarker 用法见 :74，可直接复用）、`evalCloseGuard`=`cli-checks.ts:497`、`test/cli-task-close-guards.test.ts` 存在且含 READY/PASS 断言 |
| 6 | 无虚构 CLI 旗标/字段 | ❌ **B2**：W2 与验收第 3 条引用 `task close --json`，但 `cmdTaskClose` 参数解析（`cli.ts:594–621`）无 `--json`，未知参数即 `fail`；`TASK_USAGE`（`cli.ts:686`）与顶层 USAGE（`cli.ts` help 实测）亦无。旗标本身可作为本 task 新增，但 task 未声明「新增 `--json` 旗标」、未把 `TASK_USAGE`/顶层 USAGE 同步列入范围、未定义 dry-run/BLOCKED 下 JSON 行为（形状 `{ path, harness_meta_section }` 与「无快照场景为 null」已定义，形状本身合格） |
| 7 | 1.7.0 冻结语义钉死 | ✅ 非范围明示不改 `CLOSE: READY/PASS` 文案；验收第 2 条钉死「dry-run 输出与 1.7.1 逐字一致（回归测）」；快照仅 PASS 后追加，语义自洽 |
| 8 | 快照取归档文件真值 vs 静态模板 | ✅ 取舍合理（防模板漂移，思考轮 R2 有论证）；归档缺元信息节异常态有失败路径（WARN + canonical 模板占位） |
| 9 | `--json` done_snapshot 形状完整性 | ⚠️ 形状字段与 null 场景已定义；null 触发面（dry-run? BLOCKED? 豁免路径?）未钉（并入 B2） |
| 10 | W3 与 task_prompts_ci_alignment 重叠 | ✅ 无实质冲突：alignment 范围 = 00-orchestrator / 10-task-requirements / TASK_TEMPLATE / 40-self-check / 20-task-audit / prompts README，均不含 `FRAGMENT_30_invoke_block_v1_zh.md` 与 `30-execute-code.md`；仅 CHANGELOG `[Unreleased]` 同批共存（正常）。非阻塞 N2：W3「（或 30-execute-code 关账节）」二选一写法使验收落点不唯一 |
| 11 | dogfood `task lint --file` | ✅ `LINT: PASS · task_close_done_snapshot.md`（exit=0） |
| 12 | 豁免旗标真实性 | ✅ 单测项引用的 `--allow-*` 族与 `TASK_USAGE` 逐字一致，无虚构 |

---

## 内容阻塞（退回 10-task · 指向 task 小节）

- **B1 ·「范围」W1 及「给执行帽的必读列表」#2**：锚点文件错误。`cmdTaskClose`（PASS/READY 分支）在 **`src/cli.ts`**（L594 / READY L675 / PASS L682），非 `src/cli-lifecycle.ts`。30 按现文会开错文件。改为：`src/cli.ts` `cmdTaskClose`（PASS/READY 分支）· `src/cli-lifecycle.ts` 仅作 `evalCloseGuard` 复用关系说明（或删去）。
- **B2 ·「范围」W2 /「失败路径」/「验收标准」第 3 条**：`task close --json` 当前不存在（`cli.ts:594–621` 未解析、未知参数即 fail）。须补：①范围明示「`task close` 新增 `--json` 旗标」并把 `TASK_USAGE`（`cli.ts:686`）与顶层 USAGE help 文案同步列入改动面；②定义 dry-run（READY）与 BLOCKED（`fail` 出口）下是否输出 JSON、`done_snapshot` 何时为 null；③失败路径表增 `--json` 行。

## 非阻塞（10-task 可顺手，不挡 R2）

- **N1 · 验收标准第 4 条**：建议补 `npm run test:lib`（与 `ci.yml` steps 对齐）或注明豁免理由。
- **N2 · 范围 W3**：删去「（或 30-execute-code 关账节）」，钉死唯一落点 `FRAGMENT_30_invoke_block_v1_zh.md`，消除验收歧义。

---

## 签闸建议

- **HG-AUDIT-R1：维持 `pending`，本 R1 不签收。** 下一棒 = **10-task**（修 B1/B2，顺改 N1/N2），之后 20 走 R2 复审。
- 流程闸与内容阻塞已分列；本审查未附、亦不授权任何 30 Prompt。

```text
## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（本件：退回 10-task，待 R2）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）——须待 R2 零阻塞后
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R1：2 项内容阻塞（B1 锚点文件错误 · B2 --json 未声明新增），退回 10-task；dogfood lint PASS；HG-AUDIT-R1 维持 pending |
