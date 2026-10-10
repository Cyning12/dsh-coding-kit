# 00 · 政策与边界（3.2 · IB / struct_rel / indexes）

> **状态**：`signed`（HG-SPEC-SIGNOFF=approved · 2026-10-10 维护者签收）· 隶属 `3_2-graph-ib-and-indexes` · 目标 `spec-wave@3.2.0`（minor）

---

## 1. S2 禁区（过程域 · 永不覆写）

| 目录 | 纪律 |
|------|------|
| `docs/tasks/` | 只新增不覆写 |
| `docs/harness/reviews/` | 只新增不覆写 |
| `docs/harness/invokes/by-task/` | 只新增不覆写 |

本版命令**只读报告**图谱语料（除文档/配置示例外）；**禁止**自动「修复写回」`docs/_tech_graph` 真值。

## 2. P0 门禁纪律

1. 判定走进程内机械逻辑；漂移/缺失类红档 **exit 2**。  
2. **禁止**新增 `--force` / `--allow-*` 绕过参数。  
3. 修严型变更须配负向 fixture（修复前真红、修复后转绿）。  
4. 人工闸只有写在 task 文 `### 人工闸` 节才可机检。  
5. **禁止**把本版任一新闸默认绑进 `npx spec-wave verify`（除非后续独立 epic 人签另开）。

## 3. 本版明确不做（非范围）

| 项 | 归属 |
|----|------|
| 整包移植消费仓 `tools/tech_graph/*.py` | **禁止**；只抽最小通用语义 |
| TS / 多语言 **AST** symbol / 有界 call 硬闸 | **另 Epic**（反哺备忘 P4 · 本版不实现） |
| `graph_issue_sync` / 产品 diff 关账 / task `graph_delta` 方言 | **留消费仓** |
| completeness 硬编码 P0 模块集 / 边数阈值 | **留消费仓**；通用侧继续用 drift 模块覆盖 |
| 七域 `DOMAIN_ORDER`、trilayer 政策目录布局抄入产品 | **禁止**；indexes 域列表必须配置化 |
| 回灌改写 3.1 W3 已关验收口径为「含 IB」 | **禁止**；3.1 缺省行为保持 |
| 自动重画 / 改写图谱语料 | **禁止**（只报告） |
| 自动 approved 任何 `HG-*` | **禁止** |
| 自定义本体类开放 / 图谱 UI | 沿用 3.0 / 3.1 边界 |
| `npm publish` / `npm deprecate` | **仅人** |
| 宿主适配表 schema 变更 | 非本版 |

## 4. 对外文案纪律

- 新能力称：**点路径存在性闸** / **可配置模块表路径** / **可选 indexes 一致闸**。  
- **禁止**宣称「替代业务仓 AST 深闸」或「一次接入即 trilayer 完备」。  
- 手册必须区分：`graph drift`（边 + 模块表）· `graph ib check`（点）· `graph indexes check`（倒排 · opt-in）。  
- 未落地波次一律「规划中」。

## 5. 版本与 semver

- 本版为 **minor**：新增命令面 / 配置键；**不**改 3.1 `graph drift` 与 `graph yaml compile|export|check` **缺省**判定松紧。  
- `nodes[].implementedBy` 为**可选**字段：缺省仓无该键 → IB 闸对点路径检查计数为 0 · **exit 0**（零打扰）。  
- 若实现波发现必须 bump `SCHEMA_VERSION` / 破坏既有 YAML 校验 → **STOP** · 另开 major 或人裁「仅透传不入严校验」。

## 6. 流程边界

- 本棒（10-spec）只产出 SPEC + PLAN；**不改** `src/` / `bin/` / `assets/` / `test/`。  
- 后续：20-spec-audit（推荐）→ 人签 HG-SPEC-SIGNOFF + HG-NEXT-PLAN → 00 拆 task → 每波 20-task-audit → HG-AUDIT-R1 → 30/40。  
- 行号引用为起草快照；各波 10-task 须回源码复核现值。

## 7. 人工闸

| human_gate_id | status | blocks |
|---------------|--------|--------|
| HG-SPEC-SIGNOFF | **approved**（2026-10-10 维护者 · 「签收，授权00签收后续文档」） | 本夹定稿 / 开拆 task |
| HG-NEXT-PLAN | **approved**（同窗） | 开实现波 |

## 8. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
