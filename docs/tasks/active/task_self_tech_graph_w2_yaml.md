# Task：self-tech-graph W2 L0+L2 graph yaml 构图与 dogfood 校验

> **状态**：`in_progress`  
> **关联图谱**：`docs/_tech_graph/00_main.md` + `10_flow_*.md`（本波由 yaml compile 生成）  
> **关联 SPEC**：`docs/spec/self-tech-graph/`（`04_execution_waves.md` **W2** · `02_graph_scheme.md` §1–§2）  
> **拟发版**：**1.9.x**（建议收口 **1.9.1** · 禁止 1.10+）· **本波不 bump**  
> **00 颗粒度**：**单 task = SPEC W2 整波** · 只写 `docs/_tech_graph/*.graph.yaml` + 编译产物 · 无 `src/` 变更

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `self-tech-graph-w2-yaml` |
| **test_strategy** | `required` |
| **test_strategy_note** | 可失败执行真值 = 本仓 CLI `graph yaml compile --all` / `export` / `check --all` 对 `docs/_tech_graph`；先写 yaml 再跑，check 红则改 yaml。不强制新增 jest（W3 才入 CI） |
| **code_quality_bar** | `recommended` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30,40` |
| **git_branch** | `task/self-tech-graph-w2-yaml` |
| **worktree_root** | （Open Folder = kit 仓根即可；构图真值 = `01_struct.md` + `src/*.ts`） |
| **graph_delta** | `docs/_tech_graph/00_main.md` |
| **graph_delta_note** | L0 主交付；另含 4 条 `10_flow_*.md` 与 `shared/graph.json` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 交付物在 `docs/_tech_graph/`；不晋升 coding_wiki |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | kit docs 轨；合入由 00 push |
| **entry_invoke_30** | `docs/harness/invokes/by-task/self-tech-graph-w2-yaml/invoke_20260828_30_40_self-tech-graph-w2-yaml.md` |
| **planned_release** | `1.9.x`（建议 1.9.1） |
| **maintainer_release_hold** | `true` — merge 后停于发版前 · 无 bump/tag/publish |

### 00 维护者授权（2026-08-27 延续 · 2026-08-28 W2 签收）

| 权限 | 00 | 维护者保留 |
|------|-----|------------|
| SPEC/task 签收 · R1 · 调度 30→40→CLOSE | ✅ | — |
| PR / merge | ✅ | — |
| bump / tag / publish | ⛔ | ✅ 后续版本号只允许 **1.9.x** |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-SPEC-SIGNOFF | approved | 10-task, 30 | SPEC R1 零阻塞 · 00 代签 |
| HG-GRAPH-MODULES | approved | 30（构图） | 2026-08-28 签收物 `01_struct.md` · **本波可写 yaml** |
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-08-28 00 代签 |
| HG-AUDIT-R1 | approved | 30 | R1 零阻塞（reviews/task_self_tech_graph_w2_yaml_audit_R1_20260828.md）· 00 代签 |

---

## 背景与目标

**问题**：L1 模块表已签，但仓内仍无 L0/L2 YAML 图，无法用自家 `graph yaml compile/export/check` dogfood。

**W2 完成态**（不改 `src/` · 不加 CI · 不 bump）：

1. `docs/_tech_graph/` 有 **5** 份 `.graph.yaml`：`00_main` + `10_flow_task_close` + `10_flow_verify` + `10_flow_upgrade` + `10_flow_graph_yaml_pipeline`。
2. 同名 `.md` **仅由** `graph yaml compile` 生成（禁止手写 flowchart）。
3. `export` 产出 `docs/_tech_graph/shared/graph.json`；`check --all` 绿。
4. 节点/边锚点落真实 `src/` 路径；L0 节点与 `01_struct.md` 模块名可对照，禁止照抄 `assets/graph/templates/` 业务示例（Python/HTTP）。

---

## 范围

### W2-0 · 协议副本（不改语义）

- [ ] 复制 `assets/graph/templates/99_mermaid_protocol.md` → `docs/_tech_graph/99_mermaid_protocol.md`（可改文首「嵌入用户仓」为 kit 自用一句；**禁止**改 §1–§7 协议正文）

### W2-1 · L0 `00_main.graph.yaml`

- [ ] `graph_id: 00_main` · `schema_version: inform_graph.v3` · 必填 `title` / `nodes` / `edges`
- [ ] 主干：bin 壳 → `runCli` 分发 → P0 命令族 / 延展命令族 → 插件面（`apply_coding_standards` / `init_coding_kit`）
- [ ] 文档指针节点：`>01_struct.md`；四条 L2 用 `::triggers`（或 doc 指针 `>10_flow_*.md`），子图内部不在 L0 展开
- [ ] 硬边 `anchors.path` 指向真实 `src/` 或 `bin/`（禁止模板里的 `src/main.py`）
- [ ] `nodes[].id` 须匹配 `^[A-Za-z_][A-Za-z0-9_]*$`（**不能**以数字开头）

### W2-2 · L2 四条 flow（`02_graph_scheme.md` 钉死 slug）

| graph_id | 内容（须实读对应 cmd） |
|----------|------------------------|
| `10_flow_task_close` | 闸链 + `--yes` rename + done 快照 |
| `10_flow_verify` | `--task` / `--spec` / `--with-wiki-lint` |
| `10_flow_upgrade` | manifest 钉版 · 幂等 · 提示 `sync prompts` |
| `10_flow_graph_yaml_pipeline` | compile → export → check **自指** dogfood |

- [ ] 四文件均 `schema_version: inform_graph.v3`；Happy Path 主干、异常侧链
- [ ] 硬边有 `anchors`（`path` 必填）；未知处才 `path: TBD` 并在 task 自检列出（尽量零 TBD）
- [ ] 异常分支外挂，勿让 Happy Path 走错边标记（`->` / `[ok]` / `[err]` / `?>` / `::gates` 等按协议）

### W2-3 · compile / export / check

- [ ] `node bin/dsh-coding-kit.js graph yaml compile --all --input docs/_tech_graph` 生成 5 份 `.md`
- [ ] `node bin/dsh-coding-kit.js graph yaml export --input docs/_tech_graph` → `shared/graph.json` **入库**
- [ ] `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph` 绿
- [ ] **禁止**手改生成的 `.md`；改图只改 yaml 后重跑三命令
- [ ] **禁止**覆盖手写 `01_struct.md`（compile 只处理 `.graph.yaml`）

### W2-4 · SPEC / 索引伴生

- [ ] `02_graph_scheme.md` 修订记录 +1（链本波 yaml）
- [ ] `01_struct.md` 文首「非本波：不写 yaml」改为「yaml 见 W2」
- [ ] `docs/spec/README.md` 索引可注 W2（若 00 未写）

## 非范围

- 不写 `02_version.md`（→ **W3**）
- 不加 `.github/workflows/tech-graph.yml`（→ **W3**）
- 不物理迁 `00_inventory/` 原文（→ **W3**）
- 不改 `src/` · 不改 `assets/graph/templates/` 语义（只复制 protocol）
- 不改 `package.json` 版本 · 不 tag · 不 publish
- 版本号若出现在文内，只允许 **1.9.x** 叙述（禁止写成即将 1.10.0）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 是 | gate_id |
| HG-GRAPH-MODULES pending | 拒写 yaml（本波已 approved） | 是 | SPEC 表 |
| `graph_id` 含 `/` 或非法字符 | validate 失败 | 是 | CLI 错 |
| 节点 id 以数字开头 | validate 失败 | 是 | CLI 错 |
| 照抄 templates 的 Python/HTTP 示例 | 20/40 退回 | 是 | 锚点假路径 |
| 手写 `.md` flowchart | 下次 compile 覆盖 · 验收不通过 | 是 | diff |
| compile 器缺陷 | 记 DEF · **另开 task** · 本 SPEC 不内修 | — | 观测 |
| check 与 export 不一致 | 先 export 再 check | 是 | CLI diff |

---

## 验收标准

- [ ] 存在且仅由 yaml 编译出：`00_main.md` · `10_flow_task_close.md` · `10_flow_verify.md` · `10_flow_upgrade.md` · `10_flow_graph_yaml_pipeline.md`
- [ ] 存在 `docs/_tech_graph/shared/graph.json`
- [ ] 下列三条命令 **exit 0**（cwd = 仓根）：
  - `node bin/dsh-coding-kit.js graph yaml compile --all --input docs/_tech_graph`
  - `node bin/dsh-coding-kit.js graph yaml export --input docs/_tech_graph`
  - `node bin/dsh-coding-kit.js graph yaml check --all --input docs/_tech_graph`
- [ ] `rg -n "src/main.py|handlers/resource.py" docs/_tech_graph/*.graph.yaml` 无命中
- [ ] `01_struct.md` 仍在且未被 compile 覆盖（仍含模块边界表）
- [ ] `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w2_yaml.md` → PASS
- [ ] `verify --spec` / `verify --task` 本文件 → PASS
- [ ] `npm test` / `typecheck` 仍绿（无 src 变更）

---

## 给执行帽的必读列表

1. `docs/spec/self-tech-graph/02_graph_scheme.md` §1–§2 · `04_execution_waves.md` W2
2. `docs/_tech_graph/01_struct.md`（节点真值）
3. `assets/graph/templates/99_mermaid_protocol.md` + `00_main.graph.yaml`（**只学字段，不抄业务节点**）
4. `src/cli.ts` · `src/index.ts` · close/verify/upgrade/`cli-graph-yaml.ts` 对应实现
5. `src/cli-graph-yaml.ts` `validateGraphYaml`（必填字段 · graph_id/node id 正则）
6. 本 task 失败路径与非范围

---

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|------------|
| R0 | 单 task = 5 yaml + 三命令绿；CI 留给 W3 | no |
| R1 | 禁止抄 templates 示例路径 | no |
| R2 | 手写 md 禁止；01_struct 保留 | no |
| R3 | 拟发版 1.9.x · 本波不 bump | no |

**residual_risks**：compile 器若在 kit 自图上暴露 DEF → 只记观测不开修；`shared/graph.json` 含 `generated_at` 每次 export 会变，关账前跑一次并提交。

---

## 测试策略（Harness）

**test_strategy**: `required` —— 三命令即自动化验收；先让 check 能红（空目录/坏 yaml）再写齐 5 图至绿。

---

### 自检结论（执行者）

（30/40 回填）

---

### KPI（00）

（关账回溯填写）

---

### 经验总结

（关账回填）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 起草并签收：W2 yaml 构图 · 拟发版 1.9.x |
