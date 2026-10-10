# RELEASING · SpecWave（`spec-wave`）发版硬步骤 Checklist

> **制度化来源**：DEF-001 教训 —— 曾从未提交工作树 publish，导致发布物与仓库真值漂移、无法溯源。  
> 本清单把「publish 前 commit + tag」固化为**硬步骤**：任何一步未完成即停止，不得跳步。  
> **职责分工（2026-09-09 起）**：**维护 Agent 可执行 ①–⑦ 与 bump/tag**；**⑧ `npm publish` 仅人**；⑨ 可由 Agent 在人 publish 后核验（或人自核）。  
> **仍仅人**：`npm publish` · `npm deprecate`（另须 `HG-EOS-DATE` / `HG-DEPRECATE-HARNESS`）· 云/账号 2FA 操作。  
> **包名**：现行 **`spec-wave`**（产品名 **SpecWave**；曾用名 `dsh-coding-kit`；曾拟裸 `specgate` 遭 E403 相似拒）。

## 最近一次发版

| 项 | 值 |
|----|-----|
| **工作树 / registry `latest`** | **`spec-wave@3.2.0`**（**bump 已落 · 待发版** · tag/push/publish 仅人 · registry `latest` 真值仍为 `3.1.0` 直至人 publish · pin-10 打 tag 前设计红） |
| **前一 latest（已 published）** | **`spec-wave@3.1.0`**（技术图谱脚手架 epic · **已 published** · 人 publish · registry `latest=3.1.0` · `time.3.1.0`=2026-10-10T09:39:57.549Z · tag `v3.1.0` ↔ `7d96c9e` · 3.2 W5 簿记棒实测） |
| **再前 latest（已 published）** | **`spec-wave@3.0.2`**（消费侧反馈收口 patch · **已 published** · 人 publish · registry `latest` 当时 `3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · tag `v3.0.2` ↔ tip `3d71b90` · tag object `06a9320` · 30 代核回填 2026-09-24） |
| **旧包名** | **`dsh-coding-kit`** · **已 deprecate**（文案 → `spec-wave`） |
| **git（史实 · 2.1.1）** | tag **`v2.1.1`** · 改名前身份；**`v2.1.2` / `v2.1.3` / `v2.2.0` / `v2.2.1` / `v2.3.0`** 为 SpecWave 身份可溯源点（**禁止** `git tag -f`） |
| **主题（待发 · 3.2.0）** | 图谱 IB / struct_rel / indexes / yaml 双栈迁移 epic（minor）：W1 `graph ib check` · W2 `struct_rel` · W3 `graph indexes check`（opt-in）· W4 迁移与保真分责文档 · **tag/push/publish 仅人** |
| **主题（已发 · 3.1.0）** | 技术图谱脚手架 epic（minor）：W1 `graph scaffold` 可审草稿 · W2 入手链 DX · W3 `graph drift`（F-2）· W4 仓级 `.spec-wave/graph-vocab.yaml`（F-1②） |
| **主题（已发 · 3.0.2）** | 消费侧（ops-desk-api）3.0.1 反馈收口：W1 tech-graph 词汇登记档补 `branches`/`triggers`（F-1① · 不可行动告警清零 · 纯数据 · src 零改动）· W2 `pins check/fix --consumer`（F-3/F-4 · 真值回退链 + `--truth` + `.spec-wave/pins-consumer.yaml` 声明源 + 内置 CI workflow 字面钉面 · release 模式逐字不变） |
| **主题（已发 · 3.0.1）** | 3.0.0 验收后信号质量收口：W1 粘性可选 `table_source`（默认 verify 与 apply 同源 · 非内置不可用 fail-closed）· W2 闸表 4 列 + 空解析告警 · W3 坏 `package.json` exit 2 + `PINS: BLOCKED` · W4 文档口径精确化 · W5 可选 `--pin-hook-version`（缺省关闭）· W6 terminology 扫 CHANGELOG + validate config-hook WARN |
| **主题（已发 · 2.4.2）** | 2.4.1 验收报告三条 P2 修复：R-1 `host validate` 缺省基改取 `--file` 所在仓根（findGitRoot 上溯 · 仓外文件 `outside_repo` 占位不打绝对路径）+ R-2 否定词表补 `not\s*pass` + 同句共现窗口（G/I/J 封堵 · K 换行漏网维持登记 · 存量 67+77 份误伤实测 0 翻转）+ R-3 钉面 pin-16 HTML 锚点无引号属性值（三选一捕获组） |
| **主题（已发 · 2.4.1）** | 2.4.0 验收报告四项修复：NEW-1 结论门禁否定守卫语义放宽（B/D/E 断链封堵 · 存量 76 份零误伤）+ NEW-2 printJson 基参统一命令 target + realpath 双侧归一（host validate 补 `--target`）+ NEW-3 钉面 pin-16 HTML 锚点入扫描面 + NEW-9/N9 钉面 pin-08 状态格边界正则精确锁定（同族弱点「裸子串判定」收口） |
| **主题（已发 · 2.4.0）** | 门禁强度补全（gate strength）：W1 钉面提取三修正（N7 refstyle / N8 表行锚定 / N9 语义格位 + 三负向 fixture）+ W2 结论级闸强度增强（S1·N=20 · 评审先行 · 不追溯存量）+ W3 输出层统一相对化（26 处 JSON 出口收敛 + 无绝对路径断言）+ W4 资产门禁可观测（排除项 warning / rebuild 追认警示）+ W5 物料与对外口径对齐（快照标注 / 口径三调 / aider conventions-file）+ W6 P3 清扫（N10 大小写 / N14 slug / N4 留痕） |
| **主题（已发 · 2.3.1）** | 2.3.0 验收三项修复：N1 .bak 发布卫生（gitignore/files 否定项/prepublishOnly 包内容断言/钉面备份自动清理）+ N11 结论级闸强制结论节（禁回退全文 · 存量 8 份豁免留痕）+ N13 豁免四字段显式类型判 |
| **主题（已发 · 2.3.0）** | 接线补全（wiring completion）：W1 版本/身份钉机制补强（核心 · pin-08 严化 + 三面入钉 12→15 + fixture 补全 + 目录型 slug 修复）+ W2 钉面维度扩展（pin-16/17）+ W3 安全可观测（toRel / JSON 信封 / C4 / C5 指引）+ W4 闸语义接线（G2 结论级 / 裸 verify / lint-done 帽级 / reviews.CLOSE 强证据）+ W5 资产完整性（sha256.manifest + assets verify）+ W6 六宿主（7→13）+ W7 DX/工程健康（README 13 宿主表 / GLOSSARY / E2 / E5） |
| **主题（已发 · 2.2.1）** | 2.2.0 验收报告四项修复：symlink realpath 归卡（P0 · C1 穿透封堵）· 钉面修复按文件聚合（P1 · 同文件多钉面一次收敛）· `.gitignore` 加 `.workbuddy/` / `GLOSSARY.md` 进包（P2 ×2） |
| **主题（已发 · 2.2.0）** | 闭环起步：W1 版本/身份钉自动化（核心）+ W2–W7 安全封堵 / 可观测字段 / 上手断档 / 术语表 / 三宿主 / 小清理 |
| **主题（已发 · 2.1.3）** | README/断言收尾 · 发布溯源测（tag↔package.json） |
| **主题（已发 · 2.1.2）** | SpecWave 改名收口 |
| **前一发版** | **`2.4.2`** · **`2.4.1`** · **`2.4.0`** · **`2.3.1`** · **`2.3.0`** · **`2.2.1`** · **`2.2.0`** · **`2.1.3`** · **`2.1.2`** · **`2.1.1`** · **`2.1.0`** |
| **更早旧包** | `@cyning/harness` **已 deprecate**（文案指 **`spec-wave`**） |
| **1.x** | **CLOSED** |
| **下一主线** | **3.0 评估**（2.4.2 **已 published** · 2026-09-15 · 门禁强度补全 W1–W6 + 两轮验收修复全 CLOSE）；候选 = 机制债残余（叙事行语义盲区 等）+ workspaces / onboard 观察项 + D5 roadmap 改名评估（归 3.0）+ 路线研究 §5 3.0 候选集（A3 hooks surface 等）+ 2.4.x 验收 §6.2 归 3.0 清单（NEW-4..12 · N5 · R-5/R-6 · pin-08 版本↔发布态绑定）· PLAN_3_0 已启动 · 另闸 |
| **验收（3.2.0）** | [`docs/roadmap/ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md`](docs/roadmap/ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md) · **bump 已落 · 待发版**（tag/push/publish 仅人 · registry `latest` 仍 `3.1.0`） |
| **验收（3.1.0）** | [`docs/roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md`](docs/roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md) · **CLOSED**（**已 published** · registry `latest=3.1.0` · `time.3.1.0`=2026-10-10T09:39:57.549Z · tag `v3.1.0` ↔ `7d96c9e`） |
| **验收（3.0.2）** | [`docs/roadmap/ACCEPTANCE_3_0_2_patch_3_0_2_zh.md`](docs/roadmap/ACCEPTANCE_3_0_2_patch_3_0_2_zh.md) · **CLOSED**（**已 published** · 人 publish · registry `latest` 当时 `3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · tag `v3.0.2` ↔ `3d71b90` · 30 代核回填 2026-09-24） |
| **验收（3.0.1）** | [`docs/roadmap/ACCEPTANCE_3_0_1_patch_3_0_1_zh.md`](docs/roadmap/ACCEPTANCE_3_0_1_patch_3_0_1_zh.md) · **CLOSED**（**已 published** · 2026-09-18 · 人执行 tag/push/publish · tag `v3.0.1` ↔ `0e6d861` · 00 代核回填 2026-09-23） |
| **验收（2.4.2）** | [`docs/roadmap/ACCEPTANCE_2_4_2_patch_2_4_2_zh.md`](docs/roadmap/ACCEPTANCE_2_4_2_patch_2_4_2_zh.md) · **CLOSED**（**已 published** · 2026-09-15 · 人 publish · tag `v2.4.2` ↔ `2557119`（00 原子推代跑 · 维护者本窗授权）· ⑨ 探针全过） |
| **验收（2.4.1）** | [`docs/roadmap/ACCEPTANCE_2_4_1_patch_2_4_1_zh.md`](docs/roadmap/ACCEPTANCE_2_4_1_patch_2_4_1_zh.md) · **CLOSED**（**已 published** · 2026-09-14 · 人 publish · tag `v2.4.1` ↔ `c89f92d` · ⑨ 探针全过） |
| **验收（2.4.0）** | [`docs/roadmap/ACCEPTANCE_2_4_gate_strength_2_4_0_zh.md`](docs/roadmap/ACCEPTANCE_2_4_gate_strength_2_4_0_zh.md) · **CLOSED**（**已 published** · 2026-09-14 · 人 · tag `v2.4.0` ↔ `343025d` · ⑨ 探针全过） |
| **验收（2.3.1）** | [`docs/roadmap/ACCEPTANCE_2_3_1_patch_2_3_1_zh.md`](docs/roadmap/ACCEPTANCE_2_3_1_patch_2_3_1_zh.md) · **CLOSED**（**已 published** · 2026-09-14 · 人 · tag `v2.3.1` ↔ `268ca21`） |
| **验收（2.3.0）** | [`docs/roadmap/ACCEPTANCE_2_3_wiring_completion_2_3_0_zh.md`](docs/roadmap/ACCEPTANCE_2_3_wiring_completion_2_3_0_zh.md) · **CLOSED**（**已 published** · 2026-09-14 · 人 · ⑨ 00 代核探针全过） |
| **验收（2.2.1）** | [`docs/roadmap/ACCEPTANCE_2_2_1_patch_2_2_1_zh.md`](docs/roadmap/ACCEPTANCE_2_2_1_patch_2_2_1_zh.md) · **CLOSED** |
| **验收（2.2.0）** | [`docs/roadmap/ACCEPTANCE_2_2_closed_loop_start_2_2_0_zh.md`](docs/roadmap/ACCEPTANCE_2_2_closed_loop_start_2_2_0_zh.md) · **CLOSED** |
| **验收（2.1.2）** | [`docs/roadmap/ACCEPTANCE_2_1_2_rename_closeout_2_1_2_zh.md`](docs/roadmap/ACCEPTANCE_2_1_2_rename_closeout_2_1_2_zh.md) · **CLOSED** |
| **验收（2.1.1 UX）** | [`docs/roadmap/ACCEPTANCE_2_1_1_host_tools_ux_2_1_1_zh.md`](docs/roadmap/ACCEPTANCE_2_1_1_host_tools_ux_2_1_1_zh.md) |
| **task（2.4.2）** | [`docs/tasks/done/task_2_4_2_patch.md`](docs/tasks/done/task_2_4_2_patch.md) · **CLOSED**（无独立 SPEC 夹 · 属 2.4.1 验收后 patch · R-1/R-2/R-3 + bump · **已 published**） |
| **task（2.4.1）** | [`docs/tasks/done/task_2_4_1_patch.md`](docs/tasks/done/task_2_4_1_patch.md) · **CLOSED**（无独立 SPEC 夹 · 属 2.4.0 验收后 patch · NEW-1/2/3/9 + N9 闭环 + bump · **已 published**） |
| **task（2.4.0）** | [`docs/tasks/done/`](docs/tasks/done/) `task_2_4_gate_strength_w1..w6_*` · **CLOSED**（W1–W6 全关账 · release 波走本 checklist） |
| **task（2.3.0）** | [`docs/tasks/done/task_2_3_wiring_release.md`](docs/tasks/done/task_2_3_wiring_release.md) · **CLOSED**（2.3.0 接线补全收尾 bump） |
| **task（2.3.1）** | [`docs/tasks/done/task_2_3_1_patch.md`](docs/tasks/done/task_2_3_1_patch.md) · **CLOSED**（无独立 SPEC 夹 · 属 2.3.0 验收后 patch） |
| **task（2.2.1）** | [`docs/tasks/done/task_2_2_1_patch.md`](docs/tasks/done/task_2_2_1_patch.md) · **CLOSED**（无独立 SPEC 夹 · 属 2.2.0 验收后 patch） |
| **规划 / SPEC（2.4.0）** | [`docs/roadmap/PLAN_2_4_gate_strength_v1_zh.md`](docs/roadmap/PLAN_2_4_gate_strength_v1_zh.md) · [`docs/spec/2_4-gate-strength/`](docs/spec/2_4-gate-strength/) |
| **规划 / SPEC（2.3.0）** | [`docs/roadmap/PLAN_2_3_wiring_completion_v1_zh.md`](docs/roadmap/PLAN_2_3_wiring_completion_v1_zh.md) · [`docs/spec/2_3-wiring-completion/`](docs/spec/2_3-wiring-completion/) |
| **规划 / SPEC（2.2.0）** | [`docs/roadmap/PLAN_2_2_closed_loop_start_v1_zh.md`](docs/roadmap/PLAN_2_2_closed_loop_start_v1_zh.md) · [`docs/spec/2_2-closed-loop-start/`](docs/spec/2_2-closed-loop-start/) |
| **规划 / SPEC（2.1.2）** | [`docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md`](docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md) · [`docs/spec/2_1_2-rename-closeout/`](docs/spec/2_1_2-rename-closeout/) |

### 前一发版（2.0.x–2.1.1）

1. `2.0.0` / `2.0.1` / `2.0.2` 已 npm 发版（人 · 2026-09-10）  
2. `2.1.0` 多平台技能+编排（registry 曾为 `latest=2.1.0`）  
3. `2.1.1` host tools UX（checklist ⑨ 已核 · registry **仍** `latest=2.1.1` 直至 `2.1.2` publish）

> 下方通用硬步骤供勾选；下一发版另开版本号。

## 确定性 CI · hooks / hook-guard（3.0.1 W5）

物化 hooks 默认命令为 `npx spec-wave hook-guard …`（**不带** `@semver` · 与 3.0.0 一致）。离线 / 沙箱 CI 若取包失败，hook-guard **fail-closed exit 2**（语义不松）。确定性 CI 任选其一：

1. **预热 npm 缓存**（流水线先安装/缓存 `~/.npm`，保证 `npx` 可命中本地包）；或
2. **物化钉版旗标**（**实验性 · 缺省关闭** · 不改无旗标默认物化）：`npx spec-wave host apply --tools … --yes --pin-hook-version`（或 `--pin-hook-version=<SEMVER>`）；或
3. **`hook-guard --command`** 自带钉版门禁命令：`npx spec-wave hook-guard --trigger pre-commit --command 'npx spec-wave@<SEMVER> verify …'`。

## 硬步骤（按序执行 · 全部满足后方可 publish）

- [ ] **① 工作树干净且所有改动已提交**：`git status --porcelain` 为空；拟发布内容全部进入 git 历史。**禁止从未提交工作树 publish**（DEF-001 教训：工作树残留 = 发布物不可溯源）。（Agent 可做）
- [ ] **② 质量闸门全绿**：`npm run typecheck && npm test && npm run build && npm run test:lib` 依次全绿（与 `prepublishOnly` 同一四门；任一红即停止，先修再发）。（Agent 可做）
- [ ] **③ CHANGELOG 版本节已归拢**：`CHANGELOG.md` 的 `## [Unreleased]` 内容已归入 `## [X.Y.Z] - YYYY-MM-DD` 版本节（日期 + 版本号齐全），无残留 Unreleased 条目遗漏。（Agent 可做）
- [ ] **④ 版本钉（pins）已同步（F5 方案 B）**：新版本号已同步全部**现行钉点** —— `assets/ontology.yaml#product_semver`、`assets/harness/discipline-coverage.yaml#as_of_package_version`、README 双文件中的 `spec-wave@x.y.z`、以及含版本断言的测试。闸测：`test/version-pins-f5.test.ts`（及既有 ontology / discipline 分面测）。**仓根 `SPEC.md` 为 archived epic，不要求与包版本对齐，禁止再把其标题当作现行契约。**（Agent 可做）
- [ ] **⑤ npm version + tag（Agent 默认可做）**：`npm version <patch|minor|major>`（或等价：改 `package.json` + 钉点同步后落 version commit + `vX.Y.Z` tag）；确认 tag 与 CHANGELOG 版本节一致。**禁止**在钉点未同步时 bump。**本仓另有** `test/release-tag-identity.test.ts`：须先有 `vX.Y.Z` tag 再期望测绿。
- [ ] **⑥ PR 合并 + CI 绿**：发版 PR 已 merge 进 `main` 且 CI 全绿（**CI 未绿禁合**）；**push 须原子或 tag 先行**：`git push origin main vX.Y.Z` 单条原子推（或先推 tag 再推 main），**禁「先 main 后 tag」分推**——main 分支 CI 的 checkout 拉全量 tag，含 tag 存在性闸项，分推存在「CI checkout 时 tag 未达」竞态（2026-09-14 v2.4.1 实测：main CI 24.x job checkout 比 tag 到远端早 ~1s，tag 闸项红 · tag 落远端后重跑转绿）；远端 main 与 tag 指向发布真值。（Agent 可推送，须用户/环境授权）
- [ ] **⑦ npm pack --dry-run 检查**：`npm pack --dry-run` 逐行核对 tarball 清单 —— 无 `test/` 泄漏、无工作区/私仓文件；仅 `package.json#files` 白名单（`bin` / `lib` / `assets` / `cordis.patch.yml` / `README.md` / `LICENSE`）内的内容入包。（Agent 可做）
- [ ] **⑧ npm publish（仅人）**：`npm publish`（`prepublishOnly` 会自动重跑②四门；⑦已核对清单）。**Agent 不得执行本步。**
- [ ] **⑨ publish 后核验 + 过程档状态更新**：`npm view spec-wave version`（及 `dist-tags`）确认新版本已生效；抽样验证；更新过程档状态为已发布。（人 publish 后 · Agent 可代核）

### 人 checklist · `3.2.0` 发版（**簿记就绪 · tag/push/publish 待人** · 2026-10-11 · task `3-2-w5-release`）

> 内容：**minor** —— 图谱 IB / struct_rel / indexes / yaml 双栈迁移 epic（W1 ib · W2 struct_rel · W3 indexes · W4 docs）。task `3-2-w5-release`。
> **验收素材**：[`docs/roadmap/ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md`](docs/roadmap/ACCEPTANCE_3_2_graph_ib_and_indexes_3_2_0_zh.md)。
> **发布边界**：本棒 Agent **未**执行 `git tag` / `git push` / `npm publish` / `npm deprecate`（HG-RELEASE-* = pending · Agent 永禁 publish）。

1. [x] 确认工作树已 commit（含 bump `3.2.0` · CHANGELOG `## [3.2.0] - 2026-10-11` · ACCEPTANCE / spec 索引 IMPLEMENTED · 钉面同步 · **pins 打 tag 前仅 pin-10**（tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿）
2. [ ] `git tag v3.2.0`（annotated · **仅人**）+ push（**原子推** `git push origin main v3.2.0` 单条 · 禁「先 main 后 tag」竞态）
3. [ ] `npm publish`（包名 `spec-wave` · 版本 `3.2.0` · **仅人**；`prepublishOnly` 自动重跑四门 + 包内容卫生断言）
4. [ ] 探针（人 publish 后）：registry `version=3.2.0` · `dist-tags.latest=3.2.0` · `time.3.2.0` · `git show v3.2.0:package.json` → `version=3.2.0`
5. [ ] 打 tag 后复跑：`pins check` **17/17 PASS**（设计红全转绿）· `npm test` 全绿（`release-tag-identity` / `pins-consistency` A 组转绿）
6. [ ] 回填 ACCEPTANCE / 过程档为已 published（本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行 · spec 索引行状态 → published · ⑨）

> **⚠️ 本波 tag/push/publish/deprecate 四动作全仅人**（HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH = pending · 无代跑授权）。

### 人 checklist · `3.1.0` 发版（**已完成** · 2026-10-10 bump/tag · 人 publish · dist-tags `latest=3.1.0` · `time.3.1.0`=2026-10-10T09:39:57.549Z · tag ↔ `7d96c9e` · 3.2 W5 簿记棒实测回填 · task `3-1-w5-release`）

> 内容：**minor** —— 技术图谱脚手架 epic（W1 scaffold · W2 DX · W3 drift · W4 vocab）。task `3-1-w5-release`。
> **验收素材**：[`docs/roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md`](docs/roadmap/ACCEPTANCE_3_1_tech_graph_scaffold_3_1_0_zh.md)。

1. [x] 确认工作树已 commit（含 bump `3.1.0` · CHANGELOG `## [3.1.0] - 2026-10-10` · ACCEPTANCE / spec 索引 IMPLEMENTED · MIGRATION「3.0.2 → 3.1.0」· 手册头栏+§10 · 钉面同步 · **pins 打 tag 前仅 pin-10**（tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿）
2. [x] `git tag v3.1.0`（annotated）+ push · tag ↔ **`7d96c9e`**
3. [x] `npm publish`（包名 `spec-wave` · 版本 `3.1.0` · **仅人**）
4. [x] 探针（3.2 W5 实测）：registry `version=3.1.0` · `dist-tags.latest=3.1.0` · `time.3.1.0`=2026-10-10T09:39:57.549Z · `git rev-parse v3.1.0^{commit}` → `7d96c9e…`
5. [x] 打 tag 后：本地存在 `v3.1.0` · registry latest=3.1.0（pins/全量测以 3.2.0 bump 后 pin-10 设计红为准）
6. [x] 回填：CHANGELOG `[3.1.0]` 发布状态 → 已发布 · RELEASING / spec 索引 `3_1` 行 → published（本棒）

> **⚠️ 史实**：3.1.0 已 published；本表由 3.2 W5 簿记棒据 registry/tag 实测勾齐（非再 publish）。

### 人 checklist · `3.0.2` 发版（**已完成** · 2026-09-23 bump/tag · 人 publish · dist-tags `latest=3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · tag ↔ `3d71b90` · 探针/⑨ 回填由 30 代核 2026-09-24 · task `3-0-2-postpublish-dx`）

> 内容：**patch** —— 消费侧（ops-desk-api）3.0.1 反馈收口（W1 tech-graph 词汇登记档补 `branches`/`triggers` · W2 `pins check/fix --consumer` 消费侧钉版保鲜闸）。task `3-0-2-release-bump`（发版）· `3-0-2-postpublish-dx`（⑨ 回填）。
> **验收素材**：[`docs/roadmap/ACCEPTANCE_3_0_2_patch_3_0_2_zh.md`](docs/roadmap/ACCEPTANCE_3_0_2_patch_3_0_2_zh.md)。

1. [x] 确认工作树已 commit（W1 `3358eaa` · W2 `297f881` · release 簿记 **`3d71b90`** · CHANGELOG `## [3.0.2] - 2026-09-23` + `[3.0.1]` 回填已发布 · 钉面同步 · **pins 打 tag 前 16/17**（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿）
2. [x] `git tag v3.0.2`（annotated · **00 按维护者 2026-09-23 授权代打**）+ push（**原子推** `git push origin main v3.0.2` 单条 · 禁「先 main 后 tag」竞态）· tag ↔ **`3d71b90`**（tag object `06a9320` · `ls-remote` 一致 · 2026-09-23）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `3.0.2` · **仅人**；`prepublishOnly` 自动重跑四门 + 包内容卫生断言 · ⚠️ 本机 `~/.npm-local` 缓存含 root-owned 文件：须先 `sudo chown -R 501:20 ~/.npm-local` 或设 `npm_config_cache=/tmp/...` 否则 `npm pack` EPERM）
4. [x] 探针（30 代核 2026-09-24）：registry `version=3.0.2` · `dist-tags.latest=3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · `git rev-parse v3.0.2^{commit}` → `3d71b90d3c6e6070fcdb7eceeea8d506043f9934` · `git show v3.0.2:package.json` → `version=3.0.2`
5. [x] 打 tag 后复跑（00 代打后执行并入 ACCEPTANCE）：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` 全绿（`release-tag-identity` / `pins-consistency` A 组转绿）
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行 · spec 索引行状态 → published · 30 代核 2026-09-24 · post-publish DX 波）

> **⚠️ 史实**：tag/push = 00 代跑（维护者 2026-09-23 授权）· **npm publish 仅人** · ⑨ 回填 = 30（task `3-0-2-postpublish-dx` · HG-RELEASE-PUBLISH=N/A · **禁再 publish**）。

### 人 checklist · `3.0.1` 发版（**已完成** · 2026-09-18 · 人执行 tag/push/publish · dist-tags `latest=3.0.1` · `time.3.0.1`=2026-09-18T07:42:30Z · tag ↔ `0e6d861` · 探针/回填由 00 代核 2026-09-23）

> 内容：**patch** —— 3.0.0 验收后 W1–W6 信号质量收口（粘性表源 · 闸表契约 · pins IO fail-closed · 文档精确化 · 可选 hooks 钉版 · 机检覆盖面）。task `3-0-1-release-bump`。
> **验收素材**：[`docs/roadmap/ACCEPTANCE_3_0_1_patch_3_0_1_zh.md`](docs/roadmap/ACCEPTANCE_3_0_1_patch_3_0_1_zh.md)。

1. [x] 确认工作树已 commit（含 bump `3.0.1` · CHANGELOG `## [3.0.1] - 2026-09-18` · 钉面同步 · pins 打 tag 前 16/17 · 四门绿）
2. [x] `git tag v3.0.1`（annotated · 人）+ push（原子推 `git push origin main v3.0.1`）· tag ↔ `0e6d861`
3. [x] `npm publish`（包名 `spec-wave` · 版本 `3.0.1` · 人 · 2026-09-18 · dist-tags `latest=3.0.1`）
4. [x] 探针（00 代核 2026-09-23 · `npm view --cache /tmp` 实测）：registry `version=3.0.1` · `dist-tags.latest=3.0.1` · `time.3.0.1`=2026-09-18T07:42:30Z · `git show v3.0.1:package.json` → `version=3.0.1`
5. [x] 打 tag 后复跑：`pins check` 17/17 PASS（设计红全转绿 · 00 代核）
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本节标题与勾选 · RELEASING 表 · README 双语现行包行 · spec 索引行状态 → published · 00 代核回填 2026-09-23）

> **⚠️ 本波 tag/push/publish/deprecate 四动作全为人执行**（2026-09-18 · 当时 HG-RELEASE 无代跑授权）· 勾选为 00 代核回填（2026-09-23 · registry/git 实测）。

### 人 checklist · `3.0.0` 发版（**已完成** · 2026-09-18 · 人执行 tag/push/publish · dist-tags `latest=3.0.0` · `time.3.0.0`=2026-09-18T00:17:55Z · 探针/回填由 00+回填棒代核）

> 内容：**架构跃迁（major · 首次 schema breaking）** —— W0 重构预备 → W1 适配表 schema v1→v2 可选跃迁（旧表零改动）+ 闸判定泛化 → W2 门禁入宿主 → W3 本体图谱统一 → W4 防伪判据语义化 → W5 机械清扫 → W6 可观测审计 → W7 收尾对外（F3/E3/术语/A3/K 台账/链接/证据/迁移）+ 3.0.0 bump。task `3-0-w7-closeout-external`。
> **探针**：[`docs/harness/reviews/w7_release_probe_3_0_0_20260917.md`](docs/harness/reviews/w7_release_probe_3_0_0_20260917.md)（6 项 · ① compat 首项 PASS）。
> **验收素材**：[`docs/roadmap/ACCEPTANCE_3_0_architecture_leap_3_0_0_zh.md`](docs/roadmap/ACCEPTANCE_3_0_architecture_leap_3_0_0_zh.md)。

1. [x] 确认工作树已 commit（含 bump `3.0.0` · CHANGELOG `## [3.0.0] - 2026-09-17` · 17 钉面同步 · **pins 打 tag 前 16/17**（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿 · 探针 6 项）
2. [x] `git tag v3.0.0`（annotated · **仅人** · 人执行）+ push（**原子推** `git push origin main v3.0.0` 单条 · 或 tag 先行 · 禁「先 main 后 tag」竞态）· tag `v3.0.0` ↔ `895b975` 已上 origin
3. [x] `npm publish`（包名 `spec-wave` · 版本 `3.0.0` · **仅人** · 人执行；dist-tags `latest=3.0.0` · `time.3.0.0`=2026-09-18T00:17:55Z · `prepublishOnly` 自动重跑四门 + 包内容卫生断言过）
4. [x] 探针（00+回填棒实测 · 全过）：registry API 直查 `dist-tags` → `latest=3.0.0`（绕缓存）；`git show v3.0.0:package.json` → `version=3.0.0`；真 tarball `spec-wave@3.0.0`（curl registry 直取）清单 **275 文件**（与本地 `npm pack --dry-run` 275 一致）· 无 `.bak` / `*~` / `.DS_Store` · 无 `test/` 泄漏 · 含 `GLOSSARY.md` / `MIGRATION.md`（`CHANGELOG.md` 不在 `package.json#files` 白名单 · 设计不入包）
5. [x] 打 tag 后复跑（00+回填棒实测）：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` **864 tests / 165 suites · 863 pass / 0 fail / 1 门控 skip**（`release-tag-identity` / `pins-consistency` A 组转绿）· `FORCE_COLOR=1 npm test` 同值全绿（TTY 态回归确认）
6. [x] 回填 ACCEPTANCE / 过程档为已 published（回填棒 · 00 代核 ⑨：本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行 · spec 索引行状态 `待发版 → published` · ACCEPTANCE 头部 published + 已知残余转绿注记 · CHANGELOG 头「已发布 2026-09-18」）

> **⚠️ 本波 tag/push/publish/deprecate 四动作全仅人**（HG-RELEASE=pending · 无代跑授权；与 2.4.2 的 00 原子推代跑不同）。

### 人 checklist · `2.4.2` 发版（**已完成** · 2026-09-15 · 人执行 publish · tag/push 00 原子推代跑（维护者本窗授权「授权git+push」）· 探针/回填 00+release 棒代核）

> 内容：2.4.1 验收报告 PASS-with-issues（无 P1）§6.1「建议纳入 2.4.2」三条 P2 修复 —— R-1 `host validate` 缺省基改取 `--file` 所在仓根（findGitRoot 上溯 · 仓外文件标 `outside_repo: true` 不打印绝对路径）· R-2 否定词表补 `not\s*pass` + 同句共现窗口 `不/未[^。；\n]{0,12}通过`（G/I/J 封堵 · K 换行漏网维持登记 · 存量 67+77 份误伤实测 0 翻转）· R-3 pin-16 HTML 锚点无引号属性值（三选一捕获组）。task `2-4-2-patch`。
>
> **发布边界（报告 §6.3 · 实际执行口径）**：checklist 起草时按「本版 tag / push / publish / deprecate 全仅人」预备（2.4.1 代跑授权一次性不延续）；**2026-09-15 维护者本窗另授「授权git+push」** → tag+push 由 00 原子推代跑，publish/deprecate 仍仅人。**原子推规则实战验证**：`git push origin main v2.4.2` 单条原子推，main CI 与 tag CI 双 success 零竞态（对照 2.4.1 分推竞态红 run 34843339145 · 硬步骤 ⑥ 规则生效）。

1. [x] 确认工作树已 commit（含 bump `2.4.2` · CHANGELOG `## [2.4.2] - 2026-09-15` · 钉点 16/17（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿 · bump commit `2557119`）
2. [x] `git tag v2.4.2`（annotated · 00 代跑 · 维护者本窗授权「授权git+push」）+ push（**原子推** `git push origin main v2.4.2` 单条 · tag `v2.4.2` ↔ `2557119` 已上 origin · main/tag CI 双 success 零竞态）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.4.2` · **仅人** · 人执行；dist-tags `latest=2.4.2` · `time.2.4.2`=2026-09-15T08:28:17Z · `prepublishOnly` 末段包内容卫生断言过）
4. [x] 探针（00 实测 · 全过）：registry API 直查 dist-tags `latest=2.4.2`（绕缓存 · 2.4.1 教训）；`git show v2.4.2:package.json` → `version=2.4.2`；真 tarball `spec-wave@2.4.2`（curl registry 直取）清单 188 文件（对照 2.4.0/2.4.1 一致）· 无 `.bak` / `*~` / `.DS_Store`
5. [x] 打 tag 后复跑（00 实测）：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` **606 pass / 0 fail / 1 门控 skip**
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本棒 · 00+release 棒代核 ⑨：本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行（bump 时已联改 2.4.2 · 钉面受控）· spec 索引行状态 `待发版 → published` · ACCEPTANCE 头部与已知残余转绿注记 · 「全仅人」预备口径修真值为本窗授权代跑）

### 人 checklist · `2.4.1` 发版（**已完成** · 2026-09-14 · 人执行 publish · tag/push 00 代跑（维护者授权）· 探针/回填 00+release 棒代核）

> 内容：2.4.0 验收报告 PASS-with-issues §6.1「建议纳入 2.4.1」四项修复 —— NEW-1 [P1] 结论门禁否定守卫语义放宽（`不.{0,3}通过`/`未.{0,3}通过`/`no\s*pass`/`reject` · B/D/E 断链封堵 · 存量 76 份零误伤）· NEW-2 [P1] `printJson` 基参统一命令 target + realpath 双侧归一（cli.ts×5 含 :1299 信封增量 + cli-host.ts×4 · `host validate` 补 `--target` additive · cwd≠target/symlink 对偶测试 ×6）· NEW-3 [P2] pin-16 HTML `<a href>` 入扫描面（yaml semantics 三形态同步）· NEW-9/N9 [P2] pin-08 状态格边界正则精确锁定（`(?<![0-9A-Za-z._-])X\.Y\.Z(?![0-9A-Za-z._-])` · 三负向 + 存量索引行零误伤）。task `2-4-1-patch`。
>
> **授权注记（2026-09-14 维护者）**：**tag + push 已授权 00 代跑**（`git tag v2.4.1` + `git push origin main v2.4.1`）；**publish 仅人**（Agent 禁令不变）。

1. [x] 确认工作树已 commit（含 bump `2.4.1` · CHANGELOG `## [2.4.1] - 2026-09-14` · 钉点 16/17（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿）
2. [x] `git tag v2.4.1`（annotated · 00 代跑 · 维护者已授权）+ push（tag `v2.4.1` ↔ `c89f92d` 已上 origin）。**教训留痕**：首次按「先 main 后 tag」分推触发竞态——main CI `test (24.x)` checkout 比 tag 到远端早 ~1s，tag 存在性闸项红（run 34843339145）；tag 落远端后 `gh run rerun --failed` 转绿。流程修正已入硬步骤 ⑥（原子推或 tag 先行）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.4.1` · **仅人** · 人执行；dist-tags `latest=2.4.1` · `time.2.4.1`=2026-09-14T12:47:48Z · `prepublishOnly` 末段包内容卫生断言过）
4. [x] 探针（00 实测 · 全过）：registry API 直查 dist-tags `latest=2.4.1`（npm CLI 缓存滞后曾显示 2.4.0 · 已绕缓存实核）；`git show v2.4.1:package.json` → `version=2.4.1`；真 tarball `spec-wave@2.4.1` 清单 188 文件（对照 2.4.0 一致）· 无 `.bak` / `*~` / `.DS_Store`
5. [x] 打 tag 后复跑（00 实测）：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` **595 pass / 0 fail / 1 门控 skip**
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本棒 · 00+release 棒代核 ⑨：本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行（bump 时已联改 2.4.1 · 钉面受控）· spec 索引行状态 `待发版 → published` · ACCEPTANCE 头部与已知残余转绿注记）

### 人 checklist · `2.4.0` 发版（**已完成** · 2026-09-14 · 人执行 tag/push/publish · 探针/回填 00+release 棒代核）

> 内容：2.3.0 验收报告 §6「建议 2.4」八组门禁强度补全 + 对外口径三条 + 2.3.1 残余登记三条 —— W1 pins 提取三修正（N7 refstyle / N8 表行锚定 / N9 语义格位 + 三负向 fixture）· W2 结论级闸强度增强（S1·N=20 · 评审先行 · 不追溯存量）· W3 输出层统一相对化（26 处 `--json` 出口收敛 + 无绝对路径断言）· W4 assets verify 排除项 warning + rebuild 追认警示 · W5 物料快照标注 + 口径三调 + aider conventions-file · W6 N10 大小写口径 / N14 slug 口径 / N4 留痕。tasks `2-4-gate-strength-w1..w6`（`docs/tasks/done/`）。

1. [x] 确认工作树已 commit（含 bump `2.4.0` · CHANGELOG `## [2.4.0] - 2026-09-14` · 钉点 16/17（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿 · bump commit `343025d`）
2. [x] `git tag v2.4.0`（annotated · 人执行）+ `git push origin main && git push origin v2.4.0`（tag `v2.4.0` ↔ bump commit `343025d` 实核存在 · 已 push）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.4.0` · 人执行；dist-tags `latest=2.4.0` · `time.2.4.0`=2026-09-14T10:07:41Z · `prepublishOnly` 末段包内容卫生断言过）
4. [x] 探针（00 实测 · 全过）：`npm view spec-wave version` → `2.4.0`；`git show v2.4.0:package.json` → `version=2.4.0`；真 tarball `spec-wave@2.4.0` 清单 188 文件（对照 2.3.1 一致）· 无 `.bak` / `*~` / `.DS_Store`
5. [x] 打 tag 后复跑（00 实测）：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` **581 pass / 0 fail / 1 门控 skip**
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本棒 · 00+release 棒代核 ⑨：本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行（bump 时已联改 2.4.0 · 钉面受控）· spec 索引行状态 · ACCEPTANCE 头部与已知残余转绿注记）

### 人 checklist · `2.3.1` 发版（**已完成** · 2026-09-14 · 人执行 tag/push/publish · 2.4.0 release 棒代核回填）

> 内容：2.3.0 验收报告 PASS-with-issues §6「建议 2.3.1」三项修复 —— N1 [P1] .bak 发布卫生（.gitignore `*.bak` · files `"!assets/**/*.bak"` · prepublishOnly 包内容机械断言 `scripts/check-pack-hygiene.mjs` failClosed · pins fix 备份成功后自动清理）· N11 [P1] 结论级闸强制结论节（禁回退全文 · 存量 8 份循 W4 先例豁免留痕）· N13 [P2] 豁免四字段显式类型判。task `2-3-1-patch`。

1. [x] 确认工作树已 commit（含 bump `2.3.1` · CHANGELOG `## [2.3.1] - 2026-09-14` · 钉点 16/17（pin-10 tag-gated 设计红 · 打 tag 后须 17/17）· 四门绿）
2. [x] `git tag v2.3.1`（annotated · 人执行）+ `git push origin main && git push origin v2.3.1`（tag `v2.3.1` ↔ bump commit `268ca21` 本棒实核存在）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.3.1` · 人执行；`prepublishOnly` 末段含包内容卫生断言 —— 若红即停止：包内含 `*.bak`/`*~`/`.DS_Store`）
4. [x] 探针：`npm view spec-wave version` → `2.3.1`（本棒实核 registry `latest=2.3.1`）；`git show v2.3.1:package.json` → `version=2.3.1`；`npm pack spec-wave@2.3.1 --dry-run` 清单无 `.bak`（对照 2.3.0 的 5 个）
5. [x] 打 tag 后复跑：`pins check` 17/17（本棒 bump 前实测 exit 0）· `npm test` 全绿（tag-gated 设计红转绿）
6. [x] 回填 ACCEPTANCE / 过程档为已 published（含本表勾选 · RELEASING「最近一次发版」表 · README 双语现行包行 · spec 索引行状态）

### 人 checklist · `2.3.0` 发版（**已完成** · 2026-09-14 · 人执行 tag/push/publish · 00 代跑 push · ⑨ 00 代核）

1. [x] 确认工作树已 commit（含 bump `2.3.0` · CHANGELOG · 钉点 17/17（pin-10 随 tag 落位转绿）· 四门绿 · tag `v2.3.0` ↔ bump commit `87dfa6f`）
2. [x] `git tag v2.3.0`（annotated · 人执行）+ `git push origin main && git push origin v2.3.0`（00 代跑 push · 人授权）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.3.0` · 人执行）
4. [x] 探针（00 代核）：`npm view spec-wave version` → `2.3.0` · `dist-tags.latest` → `2.3.0` · `time.2.3.0` = 2026-09-14T01:15:25Z · `git show v2.3.0:package.json` → `name=spec-wave` · `version=2.3.0` · `npm pack spec-wave@2.3.0 --dry-run` 193 文件
5. [x] 打 tag 后复跑：`pins check` **17/17 PASS · exit 0**（设计红全转绿）· `npm test` **534 pass / 0 fail / 1 skip**（与 release 棒移交清单一一对应）
6. [x] 回填 ACCEPTANCE / 过程档为已 published（本棒 · 00 代核 ⑨）

### 人 checklist · `2.2.1` 发版（**已完成** · 2026-09-12）

1. [x] 确认工作树已 commit（含 bump `2.2.1` · CHANGELOG · 钉点 12/12 · 四门绿 · tag `v2.2.1` ↔ `c828e5e`）
2. [x] `git push origin main && git push origin v2.2.1`（origin/main = `6bdf3ad`）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.2.1`）
4. [x] 探针：`npm view spec-wave version` → `2.2.1`；`git show v2.2.1:package.json` → `name=spec-wave` · `version=2.2.1`
5. [x] 回填 ACCEPTANCE / 过程档为已 published（Agent 代核 ⑨）

### 人 checklist · `2.2.0` 发版（**已完成** · 2026-09-11）

1. [x] 确认工作树已 commit（含 bump `2.2.0` · CHANGELOG · 钉点 12/12 · 四门绿 · tag `v2.2.0` ↔ `60b8640`）
2. [x] `git push origin main && git push origin v2.2.0`（origin/main = `3a2b407`）
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.2.0`）
4. [x] 探针：`npm view spec-wave version` → `2.2.0`；`git show v2.2.0:package.json` → `name=spec-wave` · `version=2.2.0`
5. [x] 回填 ACCEPTANCE / 过程档为已 published（Agent 代核 ⑨）

### 人 checklist · `2.1.3` 发版（**已完成** · 2026-09-11）

1. [x] 确认工作树已 commit（含 bump `2.1.3` · CHANGELOG · 钉点 · 四门绿 · tag `v2.1.3`）  
2. [x] `git push origin main && git push origin v2.1.3`（或等价）  
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.1.3`）  
4. [x] 探针：`npm view spec-wave version` → `2.1.3`；`git show v2.1.3:package.json` → `name=spec-wave` · `version=2.1.3`  
5. [x] （可选）deprecate 文案钉点 — 人以执行时为准  

### 人 checklist · `2.1.2` 发版（**已完成** · 史实）

> 真值闸：`HG-PUBLISH` / `HG-DEPRECATE-HARNESS` = **approved**（人 · 2026-09-10）。

1. [x] 确认工作树已 commit（含 bump `2.1.2` · CHANGELOG · 钉点 · 四门绿证据）  
2. [x] `git tag v2.1.2 <publish-commit>`（**禁止** `git tag -f`）  
3. [x] `npm publish`（包名 `spec-wave` · 版本 `2.1.2`）  
4. [x] 探针：`git show v2.1.2:package.json` → `name=spec-wave` · `version=2.1.2`；`npm view spec-wave version` → `2.1.2`  
5. [x] `npm deprecate @cyning/harness "…"` 文案改指 **`spec-wave`**（勿再把 `dsh-coding-kit` 当终点）  
6. [x] 签 task 表 **`HG-PUBLISH=approved`** · **`HG-DEPRECATE-HARNESS=approved`**  
7. [x] 回填 ACCEPTANCE / 过程档为已 published（00 代核 ⑨）


## 禁令速查

- **禁止从未提交工作树 publish**（① · DEF-001）。
- **CI 未绿禁合**（⑥ · 合并前 CI 必须全绿）。
- **Agent 禁止 `npm publish`**（⑧ 仅人）。**Agent 允许 `npm version` / tag / 钉点同步**（⑤ · 须先过 ①–④）。
- **Agent 禁止 `npm deprecate`**（另闸 `HG-EOS-DATE`）。
- `npm pack --dry-run` 清单异常（`test/` 泄漏、白名单外文件）→ 停止发版，先修 `files` 白名单或 .npmignore 口径（⑦）。
- **CI 不得自动 `npm publish`**（与 Agent 同禁；registry 凭证仅人侧）。
