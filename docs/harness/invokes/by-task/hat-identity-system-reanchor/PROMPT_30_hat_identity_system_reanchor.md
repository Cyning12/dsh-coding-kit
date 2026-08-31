# 可复制 Prompt · kit 下一版 · 帽 System/Re-anchor + 00 delegate-only

> **Open Folder**：`/Users/cyning/Desktop/Projects/dsh-coding-kit`  
> **分支**：`feat/hat-identity-system-reanchor`（已建）  
> **上游 FEEDBACK**：[`docs/feedback/FEEDBACK_ops_desk_api_hat_identity_system_prompt_20260831.md`](../../feedback/FEEDBACK_ops_desk_api_hat_identity_system_prompt_20260831.md)  
> **基线**：`package.json` 现为 **1.9.2** · Unreleased → 目标建议 **1.10.0**（minor：新 prompts/Skills 面；**禁止**本 Agent `npm version` / `npm publish`）  
> **试点回写仓**：`/Users/cyning/Desktop/Ops-desk/ops-desk-api`（升级后校验）

---

## 角色

你是 **dsh-coding-kit 维护 Agent（实现棒）**。先读 FEEDBACK 全文，再按下方范围改源码与资产；完成后自检四门；**不要 publish**。

## 必读

1. `docs/feedback/FEEDBACK_ops_desk_api_hat_identity_system_prompt_20260831.md`（P0–P3）  
2. `assets/harness/prompts/00-orchestrator.md`（默认只委派）  
3. `assets/harness/prompts/README.md`（Skills 分发边界）  
4. `src/cli-sync-prompts.ts` → `SYNC_PROMPT_FILES`  
5. `RELEASING.md`（Agent 禁 `npm version` / `publish`）  
6. `CHANGELOG.md` · `[Unreleased]`

## 本波范围（P0 必做 · P1 尽量 · P2 文档即可）

### P0 · 帽级 System / Re-anchor 资产

1. 新增（简体中文 · 短）：  
   - `assets/harness/prompts/FRAGMENT_hat_reanchor_v1_zh.md`（≤20 行：`hat_id` / `task_slug` / 禁区 / 上下文脏先读本片段）  
   - `assets/harness/prompts/FRAGMENT_00_delegate_only_v1_zh.md`（已有初稿 → 禁止亲自实现 · 须例外句）  
   - 可选目录 `assets/harness/prompts/system/00.md` · `system/30.md`（极短 system；若加，须文档说明 **不**默认 always 塞全文帽）  
2. 更新 `assets/harness/prompts/README.md`：钉死 **System/Re-anchor = 短身份** · **prompts 全文 = 换帽加载** · **verify = 机械**；三者不可互替。  
3. 将新 FRAGMENT 纳入 `SYNC_PROMPT_FILES`（及对应测试断言白名单）。  
4. `skills build`：为 **delegate-only / re-anchor** 提供 **默认可分发** Skill（短片段）；**00 全文仍可不进默认**（与现政策兼容）。更新 `assets/skills/README.md`。  
5. 强化 `00-orchestrator.md` 指向新 FRAGMENT（不改默认表语义，只加「长对话须 re-anchor」一句 + 链到 FRAGMENT）。

### P1 · 降低 00 亲自落地偶发

- README / CHANGELOG 消费者提示：偶发亲自落地 = 违规。  
- 若仓内已有 `eval/` 帽评测骨架：加一条「00 + 已有 task → 须含委派句、禁暗示亲自改 app」的 **文档或 fixture**（能落地则落地；不能则 CHANGELOG 记 follow-up）。  
- **不要**本波把「00 窗 app/ diff」做成硬 BLOCK（FEEDBACK 只要 WARN 级可选；可先文档）。

### P2 · Host 衔接文档（kit 侧）

- 在 README.zh-CN（或 `assets/docs/` 薄指针）加短节：**Host 使用 coding-kit**  
  - Capability 白名单：`npx --yes dsh-coding-kit@<pin> verify|task …`  
  - 须 Policy 默认关  
  - **Skills ≠ 全覆盖**（摘 FEEDBACK §6 表）

### P3 · sync / upgrade

- 新 FRAGMENT 必须能被 `sync prompts` 同步。  
- `upgrade` 成功提示行若需点名新文件，可顺手改文案。

## 非范围

- `npm version` / `npm publish` / 强制改消费仓  
- 默认安装 30/40 Skills（仍受 T1 约束）  
- 把 00 全文强塞 always system  

## 验收

```bash
npm run typecheck && npm test && npm run build && npm run test:lib
npx dsh-coding-kit skills check   # 若改了 skills 生成物
# 本地 dogfood（可选）：对临时目录 sync prompts --yes 见新 FRAGMENT
```

- `CHANGELOG.md` → `[Unreleased]` 写清 Added/Changed/Docs + **消费者提示**  
- 过程 invoke 落盘本目录：`invoke_*_30_40_hat-identity-system-reanchor.md`（含命令退出码）  
- **禁止**执行 `npm version`（留给人按 RELEASING 发 **1.10.0**）

## 完成后交给人

1. 人审 PR → merge → `npm version minor` → publish **1.10.0**  
2. 回 **ops-desk-api**：

```bash
cd /Users/cyning/Desktop/Ops-desk/ops-desk-api
npx dsh-coding-kit upgrade --yes
npx dsh-coding-kit sync prompts --yes
# 核对 docs/harness/prompts/ 含新 FRAGMENT
npx dsh-coding-kit check
# 抽样：verify --task <active task> ；skills install（含新 delegate skill）
```

3. 在 ops-desk-api FEEDBACK 文末追加「1.10.0 校验」节（PASS/缺口）。

## 输出形状（对人类）

```text
阶段：30/40 · {pass|blocked}
交付：FRAGMENT 路径 · SYNC_PROMPT_FILES · skills · CHANGELOG Unreleased
下一棒：人 · RELEASING ①–⑧ · 发 1.10.0 → api upgrade 再校验
```
