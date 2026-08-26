# Task：入包 00 默认编排纪律（v1.7.1）

> **状态**：`done`  
> **关联图谱**：无（`graph_change_layer=none`）  
> **关联 SPEC**：无独立 SPEC（过程纪律补丁；工作区真值已落 `Projects/docs/harness/prompts/00-orchestrator.md`）  
> **00 颗粒度**：单 patch task · 文档/prompts 入包 + 版本钉

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `00-default-behavior-kit-1-7-1` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `同会话落地`（维护者明示：新建 task + 把内容更新进 coding-kit） |
| **semi_auto** | `false` |
| **audit_profile** | `minimal` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `main` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅 prompts / README / 版本钉；不改业务图谱 |
| **wiki_delta** | `none` |
| **wiki_delta_note** | 契约落 CHANGELOG；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit 自身发版；合入由维护者 push+tag，非业务 PR 闸对象 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-26 用户：「新建 1.7.1 task，把上述内容更新进 coding-kit」 |
| HG-AUDIT-R1 | approved | 30 | 同上；docs/prompts 补丁；审查见 reviews |

---

## 背景与目标

工作区已写明 **00 默认行为**（最多起草第一步 SPEC/task；中间全派子 Agent；收口 50+CLOSE；有初版则禁亲自实现）。kit `1.7.0` 仅在 `assets/harness/prompts/README.md` 留指针。本 task 把可随包发布的 **Starter 精简真值** 写入 `assets/harness/prompts/00-orchestrator.md`，发版 **1.7.1**（人 publish）。

---

## 范围

- [x] 新增 `assets/harness/prompts/00-orchestrator.md`（默认行为表 + 例外句；Starter 精简，不依赖未入包 Extended 路径）
- [x] 更新 `assets/harness/prompts/README.md`：00 入 Starter 表；去掉「仅工作区真值」表述
- [x] `package.json` / README 钉版 / 测试中的 `1.7.0` → `1.7.1`（与既有 pin 测一致）
- [x] CHANGELOG `[1.7.1]`
- [x] `npm test` / `typecheck` / `build` 绿

## 非范围

- 不新增 Agent Skill `harness-00-*`（T1 闸评测前 00 不进默认 skills 分发）
- 不改 CLOSE 闸语义（相对 1.7.0）
- 不执行 `npm publish`（人）
- 不强制同步业务仓已落地 prompts（消费者自行 `upgrade` / sync）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 版本钉漏改导致 pin 测红 | 测失败 → 补齐 1.7.1 钉 | 是 | 是（CI） |
| 00 条文链到未入包路径 | 读者断链 → 改写为 POINTER / 内联纪律 | 是 | 是 |
| 误加 skills 导致 check drift | `skills check` 红 → 忽略 `00-*.md` | 是 | 是 |

---

## 验收标准

- [x] 包内存在 `00-orchestrator.md`，含「默认行为」表与「有初版则禁亲自实现」硬规则
- [x] sync/init 后用户仓可从 kit 资产得到该文件（随 prompts 目录复制）
- [x] `package.json` version = `1.7.1`；pin 相关单测断言同步
- [x] CHANGELOG 有 `[1.7.1]` 消费者提示
- [x] `npm test` 全绿；`typecheck`/`build` 绿

---

## 依赖与引用

- 工作区真值：`Projects/docs/harness/prompts/00-orchestrator.md`
- 前序发版：`docs/tasks/done/task_doc_health_close_binding.md`（1.7.0）

---

## 实现备忘

- 入包：`assets/harness/prompts/00-orchestrator.md`
- `src/cli-skills.ts`：`loadSkillPrompts` 忽略 `00-*.md`（避免无 frontmatter 打断 skills build/check）
- 版本钉：package / ontology / discipline-coverage / README en+zh / pin 测

---

### 自检结论（执行者）

自检已回填（2026-08-26）：`npm run typecheck` 绿；`npm test` 258 pass / 0 fail；`npm run build` 绿。版本钉 1.7.1 与 CHANGELOG 对齐。

---

### KPI（CLOSE）

Task_KPI%: 90

---

### 经验总结

- 00 入 Starter 但无 Skills frontmatter 时，必须在 `loadSkillPrompts` 过滤，否则 `skills check` 全红。
- 版本 bump 勿盲换 README 中「Since 1.7.0」历史特性叙述；只钉当前产品 banner / migrate Prompt。

---

## 执行路线与 Commit 回溯

- 同会话落地（用户授权句）；待维护者 commit + tag `v1.7.1` + `npm publish`
