# 02 · 三层图谱目标态与 dogfood 工具链（self-tech-graph）

> **状态**：`draft` · 唯一编辑源 = `.graph.yaml`（`.md` 一律编译生成 · 协议见 `assets/graph/templates/99_mermaid_protocol.md`）

---

## 1. 三层定义（对齐仓模板 v0.2）

| 层 | 文件 | 内容 | 真值源 |
|----|------|------|--------|
| **L0 顶层流程** | `00_main.graph.yaml` → `00_main.md` | bin 壳 → runCli 分发 → P0/延展命令族 → 插件面（apply_coding_standards / init_coding_kit）→ assets 消费关系 | `src/cli.ts` · `src/index.ts` |
| **L1 模块边界** | `01_struct.md`（模块边界表 · **HG-GRAPH-MODULES 人签**） | src/ 模块职责与依赖向（cli-shared / cli-checks / cli-task-extra / cli-lifecycle / cli-graph* / cli-skills / cli-sync / cli-wiki / cli-status / cli-timeline / yaml 等）；每模块一行：职责 · 读 · 写 · 被谁调 | `src/*.ts` 实读 |
| **L2 关键子流程** | `10_flow_<slug>.graph.yaml` → `.md` ×4 | 首批：`task_close`（闸链+done 快照）· `verify`（--task/--spec/--with-wiki-lint）· `upgrade`（manifest 钉版 · 幂等）· `graph_yaml_pipeline`（compile→export→check 自指 dogfood） | 各 cmd 实现 |
| 辅 | `02_version.md` | 版本时间线（1.0.0→1.8.0 · 允许首版从简） | CHANGELOG.md |

**模块表起点**：工作区 `docs/dsh_coding_kit_optimization/00_inventory/architecture.md`（1.2.2 锚）仅作 R0 参考输入，**必须按 1.8.0 src/ 实读重核**（新增 cli-refresh-ide-blocks · E8/wrong_section · close 快照/--json · --with-wiki-lint 等）——禁止照抄旧档。

## 2. dogfood 工具链（自证闭环）

```bash
npx dsh-coding-kit graph yaml compile --all --input docs/_tech_graph
npx dsh-coding-kit graph yaml export --input docs/_tech_graph
npx dsh-coding-kit graph yaml check --all --input docs/_tech_graph
```

- **CI**：`.github/workflows/tech-graph.yml` 新增（参照 `assets/ci/samples/tech-graph.yml.example`）；compile/check 红即 fail
- **自指验证**：`graph_yaml_pipeline` flow 描绘的正是上述三条命令——图谱描述工具、工具校验图谱
- 模板包定位不变：本仓走**简化编译流**（非 manifest/contract CI · 那是复杂业务仓档位）

## 3. 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| yaml 与 src 漂移（构图幻觉） | check 不一致或 20 审退回 | 是（重读 src 修订） | 审查文/CI |
| HG-GRAPH-MODULES 未签即改码 | 30 拒开工 | 是 | 人签 |
| compile 器缺陷被发现 | 记录 DEF · 另开 task（本 SPEC 不内修） | — | 观测记录 |
| 02_version 首版从简 | 允许仅里程碑行 | — | 修订记录 |

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿 |
