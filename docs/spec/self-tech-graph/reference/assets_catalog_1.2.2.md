> **历史锚**：dsh-coding-kit **1.2.2**
> **原工作区路径**：`docs/dsh_coding_kit_optimization/00_inventory/assets_catalog.md`
> **非现行真值** · 现行 L1 见 `docs/_tech_graph/01_struct.md`

# assets/ 资产编目 · dsh-coding-kit@1.2.2（R1 起草）

> **真值**：`dsh-coding-kit/assets/` 全目录通读（2026-08-22）。资产地图总纲见 assets/README.md（自承：从旧仓 cyning-harness 按白名单复制的 P0 模板资产；目录名 harness/ 仅历史保留）。
> **消费关系总览**：apply_coding_standards 只读 standards/ + coding_wiki/（src/index.ts#89-96）；init_coding_kit 整树复制 assets/（S2 skip）；lifecycle/discipline 命令读 harness/*.yaml；skills build/check 以 harness/prompts/ 为源、assets/skills/ 为生成物；skills install 读 assets/skills/；graph 命令与 assets/graph/ 无直接 IO（模板仅供人工复制）。

## 1. standards/（Constrain · L1/L2 编码规范模板）

| 文件 | 行数 | 用途 | 消费 |
|------|------|------|------|
| README.md | 35 | 嵌入指引（复制到用户仓 docs/standards/） | 人 |
| TEMPLATE_CODING_BASELINE_L1_v1_zh.md | 88 | 语言无关基线 B-01～B-12 + 反模式 + PR 自检 | apply（注入）；人复制 |
| TEMPLATE_CODING_BASELINE_L2_frontend_v1_zh.md | 76 | 前端 L2 F-01～F-14 | 同上 |
| TEMPLATE_CODING_BASELINE_L2_backend_v1_zh.md | 75 | 后端 L2 P-01～P-15 | 同上 |
| SOURCES_v1_zh.md | 49 | 外部参考映射（Google/PEP8/OWASP） | apply；人 |
| POINTER_workspace_truth_v1_zh.md | 42 | 「引用不搬运」纪律 | apply（l1 profile 含） |

- 缺陷挂点：README.md#34 链 `../docs/ONBOARDING.md` —— 悬空（包内无 docs/），见 DEF-009。

## 2. coding_wiki/templates/（Inform · LLM 读序模板）

| 文件 | 行数 | 用途 |
|------|------|------|
| README.md | 115 | 目录约定：两层起步、加深阈值、wikilink 纪律、关账 wiki_delta |
| _index.md | 19 | 主题索引样例 |
| stable.md / context.md / volatile.md | 26/18/25 | 稳定度三件套（样例互链 [[…]]） |
| topics/wiki_layout.md / topics/wikilinks_export.md | 13/13 | topics 第 2 层演示页 |

- 消费：apply_coding_standards 全量注入（两 profile 都含 coding_wiki/）；wiki export 命令面向**消费者仓** docs/coding_wiki，不读本目录。
- 缺陷挂点：README.md#54 链 `../../docs/USER_GUIDE_v1.0_zh.md` 悬空；README.md#79,#93 的命令仍是 `npx @cyning/harness wiki export`（旧包名），见 DEF-002。

## 3. graph/（Inform · 图谱模板）

| 文件 | 行数 | 用途 |
|------|------|------|
| templates/README.md | 59 | YAML-first 工作流说明 |
| templates/00_main.graph.yaml / 00_main.md | 72/65 | 顶层流程模板（YAML=编辑源，md=编译产物） |
| templates/01_struct.md | 38 | 模块边界登记表（HG-GRAPH-MODULES 人签真值） |
| templates/02_version.md | 6 | 版本时间线骨架 |
| templates/10_flow_MAIN.graph.yaml / 10_flow_MAIN.md | 105/89 | 主路径 flow 示例 |
| templates/99_mermaid_protocol.md | 119 | Mermaid 拓扑协议 v3（边标记/形状/锚点/禁止项） |
| stubs/README.md | 6 | 声明不内置预填图谱 |

- 消费：纯人工复制模板；CLI graph yaml compile 的产物可替代其中 md，但**格式不一致**（见下）。
- 缺陷挂点（DEF-006/007）：
  - templates/README.md#25-32 指引 `node scripts/graph_yaml_compile.js` / `scripts/verify-template-compile.sh` —— 本包无 scripts/ 目录；
  - 00_main.md#6-7 frontmatter 为 `generated_from / generator: scripts/graph_yaml_compile.js`，与本包 compileGraph 输出（source/generated_at + ## Mermaid/## Structured Data，src/cli-graph-yaml.ts#432-465）不同构；
  - 99_mermaid_protocol.md#9 称 --check 校验 .md 与 .graph.yaml 同步，实际 graph yaml check 比对的是 graph.json 切片；
  - 99_mermaid_protocol.md#10,#93 声明 .ai.md 双轨「已弃用」，与工作区 AGENTS.md §7.1 双轨强制存在张力（规范级分歧，非代码缺陷）；
  - stubs/README.md#6 引 `../../examples/oss-fork/` 与 `--stub-dir` —— examples/ 未随包、CLI 无此旗标。

## 4. harness/（Orchestrate · 过程轨资产）

### 4.1 prompts/（帽条文 · skills build 唯一真值源）

| 文件 | 行数 | hat_id | track |
|------|------|--------|-------|
| 10-spec-requirements.md | 63 | 10-spec | starter |
| 10-task-requirements.md | 66 | 10-task | starter |
| 20-spec-audit.md | 50 | 20-spec-audit | starter |
| 20-task-audit.md | 88 | 20-task-audit | starter |
| 30-execute-code.md | 64 | 30 | **starter-experimental** |
| 40-self-check.md | 63 | 40 | **starter-experimental** |
| FRAGMENT_30_gate_verify_v1_zh.md | 35 | —（被 30 引用） | — |
| FRAGMENT_30_invoke_block_v1_zh.md | 27 | — | — |
| TEMPLATE_30_gate_stop.md | 37 | —（被 20-task-audit 引用） | — |
| README.md | 51 | 标准流程 + V2 改名记录 | — |

- 消费：skills build 读 frontmatter（name/description/compatibility/metadata.hat_id/track）→ 生成 assets/skills/；FRAGMENT_/TEMPLATE_ 文件不入 skill 清单（loadSkillPrompts 排除，src/cli-skills.ts#76），但正文引用时复制进 references/。
- 缺陷挂点（DEF-002）：10-task#5,#46 · 20-task-audit#5 · 20-spec-audit#30 · 30-execute-code#3,#5,#35 · 40-self-check#5 · FRAGMENT_30_gate_verify#27 · TEMPLATE_30_gate_stop#22 均仍以 `npx @cyning/harness …` 为现行命令；prompts/README.md#41 仍写 `harness skills build` / `harness skills check`；prompts/README.md#17,#37 链 `../../docs/methodology/product/SDD_HAT_FLOW_v2_zh.md` 悬空。
- FRAGMENT_30_gate_verify_v1_zh.md#15 含占位符 `__HARNESS_GRAPH_MODULES_PATH__` —— 本包无任何代码替换它（旧包由 sync 按 profile graph_modules_path 写入）。

### 4.2 templates/（task/视图模板）

| 文件 | 行数 | 用途 |
|------|------|------|
| README.md | 49 | 嵌入步骤 + done 分层说明 |
| TASK_TEMPLATE.md | 127 | 单 task 模板（元信息全字段 + 人工闸表 + 自检结论 + KPI + 经验总结） |
| TASK_epic.md | 103 | Epic 总纲 + 编排主表 + HG-EPIC-SIGNOFF |
| TASK_graph_bootstrap.md | 115 | D4-a 图谱 bootstrap + HG-GRAPH-MODULES |
| TASK_done_README.md | 75 | done/ Hub（域分组） |
| VIEW_done_thin_pointer.md / VIEW_done_by_domain.md | 16/66 | _views 薄指针与按域分组 |
| FRAGMENT_task_domain_infer_v1_zh.md | 16 | 关账 git mv 域推断 |
| QUICKREF_v1_zh.md | 47 | 自称「由 npx @cyning/harness init/upgrade 自动生成」的旧命令速查 |
| ONTOLOGY_consumer_slice_v1.md | 41 | 消费仓 ontology 切片模板 |

- 缺陷挂点：QUICKREF 全文旧包名 + `CYNING_HARNESS` env，且新 CLI init/upgrade 并不生成它（DEF-008）；templates/README.md#23 引 `wizard/install.sh`（assets/README.md#26 明示 wizard 不随包）与 #49 `../../docs/ONBOARDING.md` 悬空（DEF-009）；TASK_graph_bootstrap.md#54 写 `cyning-harness/graph/templates/` 旧路径。

### 4.3 invokes/

- README.md（22 行）：by-task 落盘约定 `invoke_YYYYMMDD_<hat>_<slug>.md`。
- TEMPLATE_invoke.md（61 行）：元信息表 + Prompt 快照 + 交付摘要骨架。#47 声称 task close 按 required_invoke_hats/invoke_retention_profile 校验帽集合（v2.12+）——**本包 task close 不实现**（DEF-003）。

### 4.4 机制真值 yaml

- lifecycle.yaml（112 行）：5 states + 3 transitions（to_00 / to_30 / close）+ 15 guards。头部注释声称 v2.11+ to_30 已接线 reviews_retention/audit_D5/task_lint、v2.17/2.18 close 增补——**本包 dry-run 只接线 HG-AUDIT-R1/HG-TASK-DRAFT**（src/cli-lifecycle.ts#214），注释为旧包史实（DEF-003）。#10-11 注释引 `npx @cyning/harness lifecycle show` 与 `schema/lifecycle.v1.schema.json`（不存在）。
- discipline-coverage.yaml（315 行）：as_of_package_version=`2.23.0`；13 gaps（G6/G7/N2-C deferred）+ 27 statements，mechanism 字段引用旧包机制与 `test/skills.test.js`（本包无此文件，现行为 test/cli-skills-install.test.ts 等）——DEF-005。

## 5. ci/samples/（Verify · GitHub Actions 样例）

| 文件 | 行数 | 用途 | 现行命令面 |
|------|------|------|-----------|
| README.md | 75 | 样例矩阵 + setup-node 缓存坑 | 含旧 cp 路径 |
| quality.yml.example | 56 | pnpm lint→test→build 三门禁 | ✅ 与包无关 |
| pytest.yml.example | 49 | Python pytest | ✅ 与包无关 |
| tech-graph.yml.example | 55 | 业务仓自备 graph-compile.sh | 注释含 `npx --yes @cyning/harness graph --help` |
| hgm-ingest.yml.example | 42 | graph ingest（continue-on-error） | `npx --yes @cyning/harness graph ingest` 旧包名 |
| lint-wiki-delta.yml.example | 47 | task lint-wiki-delta | `@cyning/harness@2.21` 钉旧包 |
| lint-wiki-delta.pin.yml.example | 45 | 读 harness.pin.json 版本 | 同上；pin 机制本包无支持 |
| skills-validate.yml.example | 38 | skills check + skills-ref | `@cyning/harness@2.23.0 skills check` 旧包名 |

- 缺陷挂点（DEF-002/009）：5 个样例的 npx 行仍指已 deprecate 的 `@cyning/harness`；README#31 链 `../docs/RUNBOOK_upgrade_wiki_delta_v1_zh.md` 悬空；harness.pin.json 是旧包概念，本包 CLI 不读。

## 6. ide/adapters/（IDE 入口片段）

| 文件 | 行数 | 用途 |
|------|------|------|
| README.md | 57 | 现行入口（已改 npx dsh-coding-kit）+ marker merge 纪律 |
| cursor-harness-starter.mdc.example | 39 | Cursor 规则片段 |
| CLAUDE.md.fragment.example | 32 | Claude Code 片段 |
| AGENTS.md.fragment.example | 33 | 通用 Agent 片段 |

- 1.2.2 已把三 .example 的现行 npx 改为 dsh-coding-kit（test/cli-docs-122.test.ts P2-1 钉死）。
- 残留挂点（DEF-020）：adapters/README.md#34 描述的 `.cyning-harness/profile.json graph_modules_path`「由 sync 写入 FRAGMENT 占位」在本包无实现（src/ 无任何 profile.json 引用）；#35 的 S5 git-clean 前置同样无实现；marker `cyning-harness:begin/end` 字符串可保留（P2 测试明示允许）。

## 7. skills/（Agent Skills 生成物 · 勿手改）

- README.md（31 行）：生成物声明 + 安装路径对照 + 扫描免责（未验证 DSH 自动扫描，与根 README 同口径）。
- 4 个 skill 目录：harness-10-spec · harness-10-task · harness-20-spec-audit · harness-20-task-audit，各一个 SKILL.md；harness-20-task-audit/references/TEMPLATE_30_gate_stop.md 为引用资源复制。
- 30/40 执行帽（track=starter-experimental）**不在默认分发**（src/cli-skills.ts#16, #158-160；skills/README.md#28-31 自述）。
- 缺陷挂点（DEF-002）：SKILL.md 由 prompts 生成，compatibility 字段带旧命令（如 harness-20-task-audit/SKILL.md#5 `Requires npx @cyning/harness CLI`）；references/TEMPLATE_30_gate_stop.md#22 同。

## 8. ontology.yaml（113 行）

- ICVO 产品设计本体的机器可读抽取（version `1.3` · product_semver `2.0.4`）：14 classes、4 relations、6 axioms（P1/S2/S5/D1/D2/D7）、starter/extended 帽表、human_gates、schemas 指针。
- 缺陷挂点（DEF-004）：#112-113 引 `./schema/manifest.v1.schema.json` 与 `./schema/task.harness.v1.schema.json` —— 包内无 schema/ 目录；product_semver 为旧包号；公理 D2 文本与 cli-graph-hgm.ts 的 D2 公理不同义；头部注释「供未来 harness ontology-check 使用」的命令不存在。

## 9. 明确不随包（assets/README.md#21-28）

- 旧仓 bin/ lib/（CLI 运行时）、wizard/*.sh（安装器）、eval/ examples/ golden/（评测夹具）、node_modules/。过程轨在工作区 docs/dsh_coding_kit_init/，不进产品仓。
