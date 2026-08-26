# 05 · 执行波次（kit vs 仓内）

> **状态**：`draft` · 隶属 `doc-health`  
> **原则**：仓内过程可先行；kit 改码须 `HG-SPEC-SIGNOFF` + task；**不要假装 npm 已改**

---

## 1. Wave 详表

### W0 · 仓内 CLOSE 纪律先行（可不改 kit）

| 项 | 内容 |
|----|------|
| **目标** | 00/CLOSE Prompt 与 invoke 写清：验收绿 ≠ 关账完；同棒 `task close --yes` + Hub |
| **落点** | 业务仓 invoke/_prompts；本包 [`process/agent_close_discipline.md`](./process/agent_close_discipline.md) |
| **建议 PR 仓** | ops-desk-api（或其他消费者） |
| **验收** | 新 CLOSE 棒 checklist 可勾选；旧债可另开清理 task |
| **依赖** | 无 |
| **为何 api 尚未有指针** | ~~初包仅落 kit~~ → **已补**：ops-desk-api `docs/spec/doc-health/` 为试点镜像（POINTER + process + FEEDBACK） |

### W1 · P0 · 语义与文案（kit）

| 项 | 内容 |
|----|------|
| **目标** | dry-run / PASS 用词与 DoD 一致；prompts/TEMPLATE/help/lifecycle 注释对齐 |
| **落点** | 见 `02_close_binding.md` §7 文案相关行 |
| **建议 PR 仓** | **dsh-coding-kit** |
| **验收** | 单测 `close_dry_run prints READY not PASS`；文档段落无「归档另议」鼓励语 |
| **依赖** | SPEC 签收 |

### W2 · P0 · `close_pr_merged`（kit）

| 项 | 内容 |
|----|------|
| **目标** | 默认要求合入证据；`--allow-no-pr-merge` + 元信息豁免 |
| **落点** | `cli-checks` · `lifecycle.yaml` · `cli.ts` · 单测 |
| **建议 PR 仓** | **dsh-coding-kit** |
| **验收** | §8 测名中 PR 相关用例绿 |
| **依赖** | W1 词表稳定 |

### W3 · P1 · Hub 索引闸（kit）

| 项 | 内容 |
|----|------|
| **目标** | 启用 Hub 的仓：CLOSE 完成态含索引行 |
| **落点** | `close_hub_index` 或等价；Hub 模板说明 |
| **建议 PR 仓** | **dsh-coding-kit** |
| **验收** | skip/block/allow 三路径单测 |
| **依赖** | W1 |

### W4 · P1 · SPEC 布局公约传播

| 项 | 内容 |
|----|------|
| **目标** | kit 文档 + 消费者 `docs/spec` 索引写明专属夹规则 |
| **落点** | 本包 C2；消费者 README 一句；**不**搬历史裸文件 |
| **建议 PR 仓** | kit + 业务仓（可分 PR） |
| **依赖** | C2 签收口径 |

### W5 · P2 · 健康度观察轨

| 项 | 内容 |
|----|------|
| **目标** | 持续 observations；可选 lint 另开 task |
| **落点** | `04` + `observations/` |
| **建议 PR 仓** | 业务仓为主 |
| **依赖** | 无强依赖；与 W0 并行可 |

---

## 2. 下游实现清单（kit · 签收后）

> 以下 **尚未实现**；供 00 拆 task 复制。

1. W1：CLI dry-run 文案 + prompts/TEMPLATE/lifecycle 注释 + CHANGELOG  
2. W2：`close_pr_merged` + allow 旗 + fixture 单测  
3. W3：`close_hub_index`（条件）+ allow 旗 + 单测  
4. 帮助文：`task close --help` / USAGE 串更新  
5. （可选）TASK_TEMPLATE 增 `related_pr` / `close_pr_policy`  

**建议 PR 仓**：`dsh-coding-kit`  
**不在本 draft 会话改 `src/`** —— ~~已由 task `doc-health-close-binding` 落地（1.7.0）~~。

---

## 3. 并行与禁止

| 允许并行 | 禁止 |
|----------|------|
| W0 ∥ W5 观察 | 未签收改 kit 闸逻辑冒充已交付 |
| W4 消费者文档 ∥ W2 实现 PR | 跳过 W1 直接上 W2 导致 PASS 词表混乱 |
| 多业务仓各自 W0 | 在业务仓「vendor 改 node_modules 里的 kit」 |

---

## 4. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | 波次初稿 |
