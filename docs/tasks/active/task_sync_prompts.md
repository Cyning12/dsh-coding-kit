# Task：新增 sync prompts 子命令（upgrade 不同步 prompts 复发根治）

> **状态**：`draft`  
> **关联图谱**：无（`graph_change_layer=none`；self-tech-graph SPEC 签收后可补挂 `10_flow_sync`）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（同波起草 · 无阻塞依赖）  
> **关联证据**：`ops-desk-api` 仓 `docs/spec/doc-health/feedback/2026-08-27_1.8.0_upgrade-no-prompt-sync.md` + `docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_8_0_from_ops_desk_api_20260827.md` §1（K1–K7 已全修 · 唯一残余摩擦）· 前案 `2026-08-26_1.7.1_upgrade-no-prompt-sync.md`  
> **拟发版**：`dsh-coding-kit@1.9.0`（建议）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `sync-prompts` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/sync-prompts` |
| **graph_delta** | `none` |
| **graph_delta_note** | CLI 新子命令；self-tech-graph 图谱若先落地则补挂，否则 none |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约落 CHANGELOG；kit 自身不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | pending | 22-R1, 30 | 初稿人扫（**维护者明示：起草但不开始**） |
| HG-AUDIT-R1 | pending | 30 | 20 R1 落盘后人签 |

---

## 背景与目标

**复发事实**：1.7.1 与 1.8.0 两版 CHANGELOG 消费者提示均写「upgrade / sync prompts 后生效」，但 `upgrade` 只写 manifest，`sync` 仅有 `sync index`（`src/cli-sync.ts` L101–111）——**承诺的机制不存在**，消费仓连续两波靠人工 `cp` 6 个 prompt + TASK_TEMPLATE 补齐。

**完成态行为**：`npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--json]` 将包内 `assets/harness/prompts/`（+ `assets/harness/templates/TASK_TEMPLATE.md`）同步到用户仓 `docs/harness/prompts/`（+ `docs/harness/templates/`）；dry-run 为默认（打印新增/变更/冲突清单），`--yes` 执行写入；已存在文件按 checksum 三分：一致跳过 · 新增写入 · 本地已改 → 冲突提示**不覆盖**。

---

## 范围

- [ ] W1：`cmdSync` 增 `prompts` 子命令——遍历包内 prompts/templates 白名单 → 目标仓映射；checksum 三分（skip/add/conflict）；dry-run 默认 + `--yes` 写入；`--json` 输出三分清单；usage/help + README（en/zh-CN）同步
- [ ] W2：冲突处置 UX——conflict 文件打印「本地已改 · 未覆盖 · 对照包内版本路径」；可选 `--force` 覆盖（显式 · 单独决策点由 20 审裁定必要性）
- [ ] W3：CHANGELOG 增条（兑现「sync prompts 后生效」承诺 · 注明 1.7.1/1.8.0 两版提示语滞后）；`upgrade` 结尾提示行可加「prompts 未同步 · 跑 sync prompts」（**是否加由 20 审裁定**，默认加提示不改 upgrade 行为）
- [ ] 单测：三分路径 · dry-run 零写入 · --yes 幂等（二跑全 skip）· 目标目录不存在时创建 · --json 形状；先红后绿
- [ ] 40 四步（typecheck/test/build/test:lib · 与 ci.yml 对齐）+ dogfood：本仓自跑 sync prompts

## 非范围

- 不改 `upgrade` 既有写面（仅允许加提示行 · 且须 20 审批准）
- 不同步 IDE 块（`refresh-ide-blocks` 既有面）· 不同步 skills（`skills install` 既有面）· 不动 assets 源文件
- 不做版本间 diff 式「增量条文提示」（超 scope · 可另案）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 目标仓无 .cyning-harness/manifest.json | fail（用法/前置错误 · exit 1 · 提示先 init） | 是 | 是 |
| 本地文件 checksum 与包内基线不同 | conflict 列出 · 不覆盖 | 是（人裁决或 --force） | 是 |
| dry-run | 仅打印三分清单 · 零写入 | — | 是 |
| 二跑 | 全 skip（幂等） | — | 是 |

---

## 验收标准

- [ ] 三分路径（skip/add/conflict）各有单测与 dogfood 实证；conflict 绝不覆盖
- [ ] dry-run 默认零写入；`--yes` 后目标仓获得 K4–K7 条文文件（对照 1.8.0 包内 assets）
- [ ] 幂等：连跑两次第二次全 skip；`--json` 形状有断言
- [ ] `npm run typecheck && npm test && npm run build && npm run test:lib` 全绿
- [ ] CHANGELOG + usage + README 同步；「sync prompts 后生效」承诺变为真实命令

---

## 给执行帽的必读列表

1. 反馈两文（ops-desk-api · 路径见文首关联证据）· 前案 1.7.1 同题反馈
2. `src/cli-sync.ts` cmdSync（L101–111 · 现仅 index 子命令）· `src/cli.ts` 命令路由与 usage
3. `assets/harness/prompts/` 与 `assets/harness/templates/` 白名单清单 · `skills build` 的 drift/checksum 先例（`src/cli-skills.ts`）
4. 测试参照：`test/cli-verify-with-wiki-lint.test.ts`（fixture 仓模式）

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 独立 sync prompts 子命令 > 塞 upgrade（不改 upgrade 写面 · 反馈建议原文即允许二选一） | no |
| R1 | checksum 三分（skip/add/conflict 不覆盖）· --force 必要性留 20 审 | no |
| R2 | dry-run 默认 + --yes 执行 · 与 kit 既有闸风格一致 | no |

**residual_risks**：本地手补版与包内 1.8.0 版的首次冲突量可能大（ops-desk-api 即此态）——首跑清单需人读；基线 checksum 无从知「本地版出自哪个包版本」，仅能做内容比对。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 三分路径/幂等/dry-run/json 均先红后绿；CI 四步全绿。

---

### 自检结论（执行者）

（30/40 回填）

---

### KPI（00）

（`kpi_aggregator: CLOSE` · 关账回溯填写）

---

### 经验总结

（关账回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-27 | 初稿：自 ops-desk-api 1.8.0 复发反馈起草（00）· **维护者明示：起草但不开始** |
