# FEEDBACK · dsh-coding-kit · 帽身份丢失 / 缺 System Prompt 面 · 00 偶现亲自落地

> **试点仓**：`ops-desk-api`  
> **日期**：2026-08-31  
> **kit 版本**：`1.9.1`（`package.json` 钉版 · `npx dsh-coding-kit --version`）  
> **操作者**：人 + 本仓 00/对话（IDE Agent · Cursor / Claude Code）  
> **关联**：`docs/harness/prompts/00-orchestrator.md` · `docs/harness/prompts/README.md`（Skills 分发说明）· Host 规划 [`02_agent_host_plan_v0.md`](../../spec/agent-infra/02_agent_host_plan_v0.md)  
> **主题**：过程帽条文存在，但 **无稳定 System Prompt / re-anchor 面** → 长对话丢帽；00 默认「只委派」条文已钉，仍 **偶现亲自落地**

---

## 1. 场景

1. **长对话身份丢失**：业务仓 Agent 会话中途（多轮读码 / 大 diff / 跨帽口头切换）后，模型不再稳定执行当前帽纪律（如自称 30 却跳 GATE_VERIFY；自称 00 却开始改 `app/`）。  
2. **00 偶现亲自落地**：`00-orchestrator.md` 已明确「已有初版 SPEC/task → 禁止亲自实现 · 中间全链交子 Agent」，无「本窗亲自 30」例外句时，仍偶发：00 窗直接写实现 / 代做 10–30 过程全文，而不是只产出下一棒 Prompt + 派发。  
3. **与 Host 交叉**：`agent-infra` Host（沟通 Agent / 产品 Chat）若要复用 kit 过程，同样缺「按帽注入的稳定 system/slot」；仅靠粘贴 prompts 或 Skills on-demand，覆盖不全。

**非场景**：本反馈 **不**要求业务仓手抄整本 `AGENTS.md` 当 system prompt；问题在 **kit 未提供可注入的帽级 System / Re-anchor 资产与分发策略**。

---

## 2. 现状摘要（事实）

| 项 | 现状 |
|---|---|
| 帽条文真值 | `assets/harness/prompts/` → 业务仓 `docs/harness/prompts/` |
| Skills | `skills build`：10/20×2 等进默认分发；**执行帽 30/40 不进默认**（T1 闸评测前）；**00 不进默认 Skills 分发**（仅 prompts 同步） |
| System Prompt | **无** kit 级「按 hat_id 的 system / always 片段」产物；IDE 依赖 AGENTS 摘要 + 人工粘贴 invoke |
| 00 默认行为 | 条文已强制：编排与收口 · 不亲自实现（须显式例外句） |
| 机械闸 | `verify` / pre-30 invoke / HG-* 挡 **30 改码**；**不**挡「00 自称却写了实现」 |
| Host | H2 Policy 可授权高危 CLI；**尚未**标准 Capability「跑 `npx dsh-coding-kit verify`」；Skills ≠ Host 全覆盖 |

---

## 3. 期望 vs 实际

| 期望 | 实际 |
|------|------|
| 帽身份在长对话中可 **re-anchor**（短 system / FRAGMENT），不必重贴全文 | 仅依赖首轮粘贴 + AGENTS 薄摘要；上下文脏后身份漂移 |
| 声明「你是 00」且已有 task/SPEC 时，**默认只委派** | 多数轮次正确；**偶现** 00 亲自 10/20/30 或改实现码 |
| Skills 能覆盖「常用帽开工」 | 00 / 默认 30·40 **不在**默认 Skills 分发 → 触发词找不到或 Agent 不加载 |
| Host 要用 kit 校验过程 | 无官方「Host 授权 npx verify」契约说明；Skills 无法替代 `verify` 机械结果 |

---

## 4. 影响

- [x] 其他：IDE / 未来沟通 Agent **过程纪律不可靠**（非单次 CLI 文案问题）  
- [ ] 仅文案困惑  
- [ ] 误 BLOCK 关账  
- [ ] Hub / PR 闸误伤  

具体：

- 长对话 → 跳闸 / 跳 invoke / 混帽。  
- 00 亲自落地 → 破坏「编排与实现分离」、review 面混乱、子 Agent 链路空转。  
- Host 若只挂 Skills：仍盖不住 00/30 默认策略与机械 `verify`。

---

## 5. 建议（给 kit）

### P0 · 帽级 System / Re-anchor 资产（Prompt 工程面）

1. 新增可发布碎片（建议路径 `assets/harness/prompts/system/` 或 `FRAGMENT_*`）：  
   - `FRAGMENT_hat_reanchor_v1_zh.md`：≤20 行 · 字段 `hat_id` / `task_slug` / 本帽禁区 / 「上下文脏则先读本片段」。  
   - `FRAGMENT_00_delegate_only_v1_zh.md`：专钉「已有初稿 → 禁止亲自实现 · 须例外句」。  
   - 可选：`system/00.md` · `system/30.md` 极短 system 正文（与全文 prompts 分离，避免 always 塞全书）。  
2. 文档钉死：**System 面 = 短身份**；**prompts 全文 = 换帽时加载**；**verify = 机械**。三者不可互相替代。  
3. `skills build`：为 re-anchor / 00-delegate 生成 **可默认分发** 的 Skill（或 always-on hint 指针）；与「00 全文不进默认」可并存（短片段进、长文仍可选）。

### P1 · 降低 00 亲自落地偶发

| 手段 | 说明 |
|---|---|
| 条文 | 已有；保持；在 README / upgrade 说明强调「偶发亲自落地 = 违规」 |
| Eval | 增用例：给定「你是 00 + 已有 task」+ 诱导实现 → 期望输出含「已派 / 待派子 Agent」且 **无** `app/` 大 diff（人工或脚本 diff 策略） |
| 可选机械 | `invoke_*_00_*.md` 关账扫描：若同窗 git diff 含 `app/**` 且 invoke notes **无**例外句关键字 → WARN/FEEDBACK（先 WARN 勿硬 BLOCK） |
| 分发 | 00 至少提供 **delegate-only Skill** 默认可装；全文 00 仍可不进默认 |

### P2 · Host / 沟通 Agent 官方衔接（非 IDE-only）

1. 文档专节：**Host 使用 coding-kit**  
   - 推荐 Capability：`harness.verify` / `harness.task_lint` → 白名单 `npx --yes dsh-coding-kit@<pin> verify|task …`  
   - **须**走 Policy（H2）：默认关 · Host env 显式授权 · 禁止任意 shell。  
2. 明确：**Skills 不能覆盖全部使用**（见 §6）；Host 要嵌套过程 = Process Kernel 对象 + CLI Capability + PromptAssembly 槽，而非只拷 Skills。

### P3 · upgrade 同步

- 若新增 `FRAGMENT_*` / `system/*`：upgrade 或独立 `prompts sync` 须落地业务仓（延续 upgrade-no-prompt-sync 类 FEEDBACK）。

---

## 6. Skills 覆盖边界（本反馈钉死结论）

| 能力 | Skills 能否覆盖 |
|---|---|
| 10/20 审过程指引 | 能（默认分发） |
| 00 委派纪律 | **弱**：00 不进默认分发；仅靠 prompts 同步 → 长对话易丢 |
| 30/40 执行 | **弱**：不进默认（T1 前）；且执行仍须 `verify` |
| 闸 / pre-30 / may_start_30 | **否**：须 CLI `verify`（或 Host 封装同一 CLI） |
| 帽身份常驻 system | **否**：Skills 为 on-demand，非 system |
| Host 业务答题 | **否**：属产品 Prompt Pack，非 harness Skill |

→ **Skills ≠ 全覆盖**；System/Re-anchor + CLI + Skills 三者互补。

---

## 7. 本仓临时对策

| 对策 | 说明 |
|---|---|
| 换帽新开窗 / `Task` 子代理 | 不跨帽同窗长跑 |
| 显式粘贴 `00-orchestrator` 默认行为表或 GATE_VERIFY FRAGMENT | 中段 re-anchor |
| 00 窗发现自己在改 `app/` | STOP · 写例外授权或改派 30 |
| Host 侧 | 暂不默认开放任意 `npx`；若试点，Capability + Policy 白名单钉版 |

---

## 8. 建议 kit issue 标题（可复制）

```text
feat(prompts): hat system/re-anchor fragments + 00 delegate-only default skill
fix(00): reduce occasional self-implementation despite delegate-only rules
docs(host): authorize npx dsh-coding-kit verify via Capability Policy (Skills ≠ full cover)
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-31 | 初记：帽身份丢失 / 缺 System 面 · 00 偶现亲自落地 · Skills/Host/npx 边界 |
