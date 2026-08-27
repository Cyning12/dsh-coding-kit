# Task Audit R2：close-done-snapshot（K5 · task close 成功输出 done 片段快照）

> **task**：`docs/tasks/active/task_close_done_snapshot.md`（slug: `close-done-snapshot` · P2 · 拟 1.8.0）  
> **日期**：2026-08-27  
> **角色**：20-task-audit（R2 复审 · 书面审 · 未改码 · 未改 task）  
> **前轮**：`task_close_done_snapshot_audit_R1_20260827.md`（退回：B1 锚点文件错误 · B2 --json 未声明新增；非阻塞 N1/N2）  
> **闸状态**：HG-TASK-DRAFT=approved · HG-AUDIT-R1=`pending`（本 R2 签收，待维护者/00 依授权签 task 表）

---

## 结论摘要

| 维度 | 判定 |
|------|------|
| **内容** | **签收**（B1/B2/N1/N2 全部落实，无新问题；口径张力已裁决，仅 1 处措辞顺手修，不构阻塞） |
| **流程闸** | 审查侧零阻塞；HG-AUDIT-R1 由维护者（授权 00 代签）在 task 表签 `approved` 后方可 30 |
| dogfood | `task lint --file` PASS（exit=0，回填后复跑） |

---

## R1 阻塞/非阻塞逐条核验

| 项 | R1 要求 | task 落点 | 核验 |
|----|---------|-----------|------|
| B1 | 锚点改 `src/cli.ts`（cmdTaskClose L594 · READY L675 · PASS L682） | W1（L53）「`src/cli.ts` L594–682 · PASS≈L682」；必读 #2（L91）含 READY≈L675 · PASS≈L682，并把 `cli-lifecycle` 降级为 evalCloseGuard 复用说明 | ✅ 与代码真值逐字一致（实测 `cli.ts:594/675/682`）；用 ≈ 标注行号抗漂移，处理得当 |
| B2-① | 显式声明新增 `--json` 旗标 | W2（L54）「**新增** `task close --json` 旗标（现不存在，未知参数即 fail）」 | ✅ |
| B2-② | TASK_USAGE / 顶层 USAGE 同步列入范围 | L55 独立行列出 `TASK_USAGE`（L686）+ 顶层 USAGE help 块 | ✅ |
| B2-③ | dry-run/BLOCKED 下 JSON 行为 + 失败路径行 | 失败路径 L75：READY→`done_snapshot: null` 退出 0；BLOCKED→非 0、JSON 仅错误面 | ✅ 可证伪、与 `fail('', 2)` 现状兼容 |
| N1 | 验收补 `test:lib` | 验收 L84「typecheck → npm test → build → npm run test:lib（对齐 ci.yml 四步）」 | ✅ 与 `.github/workflows/ci.yml` steps 逐步对应 |
| N2 | W3 钉死唯一落点 | W3（L56）仅 `FRAGMENT_30_invoke_block_v1_zh.md`，「或 30-execute-code」已删 | ✅ 与 prompts-ci-alignment 零重叠维持 |

**新增面回归检查**：思考轮增 R3+ 行记录退回回填（闭环留痕 ✅）；修订记录 +1 行 ✅；其余既有核对项（K5 对齐、冻结语义逐字回归、思考轮 R0–R2、residual_risks、豁免旗标真实性）R1 已绿，本轮无回退。dogfood 复跑 PASS。

---

## 口径裁决（10-task 提出的张力：stdout 快照 vs JSON null）

**问题**：单测行（L57）「豁免旗标（--allow-* 族）路径下快照仍打印」（stdout）与验收行（L83）「READY（dry-run）或豁免路径为 null」（JSON）字面冲突——豁免+`--yes` 归档成功时，若 JSON 为 null 而 stdout 有快照，两通道自相矛盾。

**裁决口径（以此为真值）**：

1. `done_snapshot` 是否为 null 的唯一判据 = **是否发生归档**（`renameSync` 执行、`CLOSE: PASS`），与是否动用豁免旗标**无关**。
2. **豁免 + `--yes` → PASS**：stdout 快照照打（L57 正确），JSON `done_snapshot` **非 null**，与 stdout 同内容。
3. **READY（dry-run，含豁免 dry-run）**：未归档 → stdout 无快照、JSON `done_snapshot: null`。
4. **BLOCKED**：非 0 退出，JSON 仅错误面（L75 已钉，不变）。

**理由**：快照的语义是「归档真值摘录供 diff 对照」（K5 本意），存在性绑定归档事件；豁免只放宽闸判定，不改变归档事实。若豁免 PASS 给 null，等于 JSON 通道否认了一次真实归档，且与 L57 直接打架。

**task 微调（10-task 顺手修 · 唯一一处 · 不挡签收）**：

- **L83（验收标准第 3 条）**：「READY（dry-run）**或豁免路径**为 null」→ 改为「READY（dry-run，含豁免 dry-run）为 null；**豁免旗标 + `--yes` 的 PASS 路径字段非 null（与 stdout 快照一致）**」。
- L57（单测行）与 L75（失败路径 `--json` 行）措辞与裁决一致，**无需改**。

---

## 阻塞 / 非阻塞

- **内容阻塞**：无。
- **非阻塞**：仅上述 L83 措辞微调（可在 10-task 顺手修后与签闸同 commit；30 开工前须落入 task 文）。

---

## 签闸建议

- 20-task-audit R2 **签收**：内容零阻塞。
- **流程闸**：HG-AUDIT-R1 当前 `pending` → 请维护者（Q1A 授权 00 代签）在 task 人工闸表签 `approved`（建议与 L83 微调同 commit）；签后 30 方可开工。

```text
## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R2 审查结论（签收 · L83 措辞微调已派 10-task）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者/授权 00 代签 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | R2：B1/B2/N1/N2 逐条核验落实；裁决 stdout/JSON 口径（null 唯绑归档事件，与豁免无关），L83 一处措辞微调（非阻塞）；零内容阻塞 → 签收；dogfood lint PASS |
