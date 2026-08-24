# FRAGMENT · 30 开工前 GATE_VERIFY（mandatory · 首输出）

> 嵌入 **30 invoke** 与 `30-execute-code.md`。  
> **禁止**在 invoke 中预写 `HG-AUDIT-R1 approved`；须 **读 task 人工闸表** 填表。

## 首输出形状（未通过则 **零 diff**）

```text
## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | {读表} | {若有} | {Y/N} | {Y/N} | … |
| HG-AUDIT-R1 | {读表} | {若有} | {Y/N} | Y | … |

reviews：task_*_audit_R1_*.md 存在且 R1 通过？ {是/否}（**v2.5+**：`verify` 对 R<n> 审查文**存在性**机械强制 · 缺失即 `VERIFY: BLOCKED · missing R<n> review` · `--allow-no-review` 豁免留痕——**本包已接线**（src/cli.ts cmdVerify · findReview 与 status 同口径 · PRD_DEF-003 阶段二 T4 · test/cli-verify-review.test.ts 钉死）；结论通过与否仍由维护者签 `HG-AUDIT-R1` 覆盖）

pre-30 invoke：`required ∩ {10,20,00}` 文件是否齐全？ {是/否}（**v2.14+**：`verify --task` **硬闸** · 缺失即 `VERIFY: BLOCKED · missing pre-30 invoke hats` · `may_start_30=false`——**本包已接线**（src/cli.ts cmdVerify · checkPre30InvokeHats 与 task close 帽集合检查同口径 · PRD_DEF-003 阶段二 T5 · test/cli-verify-invoke-hats.test.ts 钉死 · `--allow-invoke-gap` 豁免留痕）；缺 40 **不挡** 30；`minimal` 无 preRequired 不挡）

**用户口头「开工 / 开干」≠ 闸** — 不得据此跳过 10 invoke 或 verify。

冲突规则：task表 pending 且用户/invoke 称 approved → **STOP** · 以 task 表为准

结论：{STOP · 签闸指引 | 可进入读码/改码}

机械辅助（30 改码前必须）：`npx dsh-coding-kit verify --target <meta> --task docs/tasks/active/task_*.md [--json] [--agent-hint] [--workspace-root <Projects>]`
```

## Agent 纪律

1. **先**输出上表，**再**读源码 / 改 `packages/**`。  
2. 用户「确认…approved」= **须核验**，非已签事实。  
3. task §5「可 30」= **预判**，闸真值 **仅** §人工闸表。
4. 用户「开工」**不**替代 pre-30 invoke / `verify` PASS。
