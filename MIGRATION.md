# Migration · `@cyning/harness` / `dsh-coding-kit` → **SpecWave**（`spec-wave`）

> **⚠️ `dsh-coding-kit` 已 deprecate** —— 请**直接**安装正式包：`npm i spec-wave@3.2.0`（**minor · 待发版** · 图谱 IB / struct_rel / indexes · yaml 双栈迁移文档 · **无强制迁移**；registry `latest` 仍为 `3.1.0` 直至人 publish。`3.0.0` 为 **major · 架构跃迁**，见下方「2.4.2 → 3.0.0」节）。**勿再**把废弃中间包当作迁移终点。  
> **现行包**：**`spec-wave@3.2.0`**（**待发版** · 正式包名 / 正式 bin；曾用名 `dsh-coding-kit`）  
> **过渡 bin（同入口 · 非终点）**：`specgate` · `dsh-coding-kit`（仍可调用，**不要**再 `npm i dsh-coding-kit` 当终点）  
> **状态**：1.12 收口 **DONE** · kit **`2.0.0` published** · `@cyning/harness` **已 deprecate**（2026-09-10）· **`dsh-coding-kit` 已 deprecate**（文案指向 `spec-wave`）  
> **包钉**：请钉 `spec-wave@3.2.0`（**待发版** · 本文件不代替 `package.json`）  
> **布局真值（F4 方案 B）**：新落盘根 = **`.coding-kit/`**；**`.cyning-harness/`** = legacy **只读**（探测 / 升级源；**不删除**）  
> **人闸**：`HG-EOS-DATE` / `HG-PUBLISH` = **approved**（人实操 · 2026-09-10）· **禁止** Agent 执行 `npm deprecate` / `npm publish`  
> **F6 归档**：[`docs/roadmap/ACCEPTANCE_2x_host_adapt_2_0_0_zh.md`](docs/roadmap/ACCEPTANCE_2x_host_adapt_2_0_0_zh.md) · 规划 [`docs/roadmap/PLAN_2x_host_adapt_v1_zh.md`](docs/roadmap/PLAN_2x_host_adapt_v1_zh.md)  
> **改名规划**：[`docs/roadmap/PLAN_rename_specgate_v1_zh.md`](docs/roadmap/PLAN_rename_specgate_v1_zh.md) · 收口 [`docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md`](docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md)

---

## SpecWave 最短路径（现行）

1. **依赖**：`package.json` 将 `dsh-coding-kit`（或 `@cyning/harness`）改为 **`spec-wave`**（钉 `3.2.0`；CHANGELOG 见 `[3.2.0]` 节 · **待发版** · registry `latest` 仍 `3.1.0` 直至人 publish）。  
2. **升级**：`npx spec-wave upgrade --yes`  
3. **字面**：CI / 脚本 `npx dsh-coding-kit` / `npx @cyning/harness` → **`npx spec-wave`**  
4. **推荐**：`npx spec-wave refresh-ide-blocks --yes`（默认 dry-run；含 B-REFRESH：旧 `npx dsh-coding-kit` / `npx specgate` → `npx spec-wave`）

过渡期：正式 bin **`spec-wave`** 与过渡 bin **`specgate`** / **`dsh-coding-kit`** 同入口；**安装终点始终是 `spec-wave`**，不要再装已 deprecate 的 `dsh-coding-kit`。

---

## 一句话（历史：`@cyning/harness` → kit → SpecWave）

换依赖到 **`spec-wave`** → `upgrade --yes`（读旧写新）→ 改 CI 字面 →（推荐）刷 IDE 块与 skills。目录目标是 `.coding-kit`，不是继续把 `.cyning-harness` 当新标准。

---

## 最小路径（必做 · 顺序固定 · 历史 kit 线）

1. **依赖**：`package.json` 删除 `@cyning/harness` / `dsh-coding-kit`，加入 **`spec-wave`**（钉当前文档所述版本）。  
2. **升级**：在仓根执行 `npx spec-wave upgrade --yes`  
   - **读**：优先 `.coding-kit/manifest.json`，否则 legacy `.cyning-harness/manifest.json`  
   - **写**：一律写入 `.coding-kit/manifest.json`（`version`=包版本，`from_version`=旧号）  
   - **不删** `.cyning-harness/`；S2（`docs/tasks` / `reviews` / `invokes/by-task`）永不覆写  
3. **字面**：CI / 脚本中 `npx @cyning/harness` → `npx spec-wave`（若仍写 `npx dsh-coding-kit`，一并改为 `npx spec-wave`）

### 推荐（非最小路径硬依赖）

| 步骤 | 命令 / 动作 |
|------|-------------|
| IDE marker 块刷写 | `npx spec-wave refresh-ide-blocks`（默认 dry-run）→ 确认后 `--yes` |
| Skills 安装 | `npx spec-wave skills install`（默认不含 30/40） |
| Starter prompts | `npx spec-wave sync prompts --yes`（须已有 manifest） |

备份目录（仅本机回滚）：`.coding-kit/backups/refresh-ide-blocks/`（建议 `.gitignore`）。

---

## 布局对照（F4）

| 路径 | 角色 |
|------|------|
| `.coding-kit/manifest.json` | **现行** manifest（init / upgrade 写入） |
| `.coding-kit/events/` · `graph/snapshot.json` · `invoke_index.json` · `local.json` · `backups/` | **现行** 过程落盘 |
| `.cyning-harness/*` | **legacy 只读**：可读、可作 upgrade 源；**新命令默认不写入** |
| `.coding-kit/` / `.dsh/coding-kit`（规范覆盖） | DSH `apply_coding_standards` / `init_coding_kit` 覆盖根（≠ skill 目录） |

双目录并存时：`check` / `upgrade` 读新优先；stdout 可能提示 legacy 只读。

---

## EOS / deprecate（已公布）

> **`HG-EOS-DATE=approved`**（2026-09-10 · 人实操）· registry 已挂 deprecate 警告。  
> 核验：`npm view @cyning/harness deprecated` · `npm view dsh-coding-kit deprecated`。

| 里程碑 | 公布日 | 状态 |
|--------|--------|------|
| 公开时间表 + 本文件成文 | **2026-09-10** | **已公布** |
| 新注册截止（建议） | **2026-10-10** | **已公布** |
| EOS（End of Support） | **2026-12-31** | **已公布** |
| `npm deprecate @cyning/harness "…"` | **2026-09-10**（人） | **已执行** · 文案曾钉 `dsh-coding-kit@1.12.0`（**待人**改指 `spec-wave` · `HG-DEPRECATE-HARNESS`） |
| `npm deprecate dsh-coding-kit "…"` | **2026-09-10**（人） | **已执行** · 文案指向 `spec-wave` |

### Deprecate 文案（registry · `@cyning/harness` 现行 · 待改）

```text
DEPRECATED: use dsh-coding-kit instead. See https://github.com/Cyning12/SpecWave/blob/main/MIGRATION.md — pin dsh-coding-kit@1.12.0 and run: npx spec-wave upgrade --yes
```

> **链式风险**：上列 harness 文案仍指向已 deprecate 的 `dsh-coding-kit`。**请忽略该钉点**，直接 `npm i spec-wave@3.2.0`。registry 改文案仅人（`HG-DEPRECATE-HARNESS`）。

### 过渡窗规则

- 过渡期内：旧包仍可安装；安装时出现 deprecate 警告（以 npm 提示为准）。  
- **安装终点**：始终 **`spec-wave`**；不要再钉 / 安装 `dsh-coding-kit` 作终点。  
- 安全修复策略：仅对仍支持的 SpecWave（`spec-wave`）线发补丁；旧产品线是否补丁以 EOS（2026-12-31）决议为准。  
- 撤销预案：误 deprecate → `npm deprecate <pkg> ""`；本仓回滚文案与日历。

### 维护者检查清单（deprecate 前后）

- [x] `HG-EOS-DATE=approved` 且日历「已公布」  
- [x] `dsh-coding-kit` deprecate 文案含迁移 URL + 指向 `spec-wave`  
- [ ] `@cyning/harness` deprecate 文案改指 `spec-wave`（**仅人** · `HG-DEPRECATE-HARNESS`）  
- [x] **人**执行 `npm deprecate`（Agent 禁止）  
- [x] README「Migrating」节与本文件一致（发版后回填）  
- [x] 未误删消费者 `.cyning-harness/` 数据纪律仍成立
---

## failure_paths（消费者）

| ID | 触发 | 行为 |
|----|------|------|
| M-01 | 只换依赖不跑 upgrade | `check` 可能仍报未接入 / 旧布局；跑 `upgrade --yes` |
| M-02 | 期望 CLI 继续写入 `.cyning-harness` | 自本波起新写在 `.coding-kit`；旧目录保留只读 |
| M-03 | Agent 宣称 deprecate 状态 | 以本文件人闸表 + `npm view` 为准 |
| M-04 | 按旧文案安装 `dsh-coding-kit` 当终点 | **错误路径** · 改装 `spec-wave` |

---

## 关联

| 路径 | 说明 |
|------|------|
| `docs/spec/1x-mvp/F3_legacy_migration.md` | F3 SPEC |
| `docs/spec/1x-mvp/F4_directory_semantics.md` | F4 方案 B |
| `README.md` · Migrating | 最短三步 + Prompt |
| `RELEASING.md` | 维护者发版（含 deprecate 仅人） |

---

## 2.4.2 → 3.0.0（breaking）· 适配表 schema 跃迁（定稿 · 经真实 2.4.1 仓演练）

> **状态：定稿 · 经真实 2.4.1 仓演练（2026-09-17 · 3.0 W7）** —— 旧格式表零改动通过 validate/apply + 新能力可选启用通过 validate（演练记录 [`docs/harness/reviews/w7_migration_rehearsal_2_4_1_20260917.md`](docs/harness/reviews/w7_migration_rehearsal_2_4_1_20260917.md)）。（3.0 W1 · 评审文 [`docs/harness/reviews/w1_schema_change_review_20260916.md`](docs/harness/reviews/w1_schema_change_review_20260916.md) §4 素材落地）
> 适用范围：host-adapt 适配表（`assets/ide/host-adapt/examples/mvp-hosts.yaml` 及 `--file` 自定义表）的 schema v1 → v2 跃迁 + 闸判定泛化。

### ① 默认路径：什么都不用做

- 仅用内置 13 宿主的消费者：升级 `spec-wave` 3.0.0 后 `host validate / host apply / host update` **默认落点不变**；内置表升级为 v2 并**新增** hooks 物化（additive）（v1 表面逐字锁 = 既有 11 件宿主测试 + 2.4.2 表 planned writes 快照逐字一致断言）。
- 旧格式适配表（含 `--file` 自定义表）**零改动继续可读**：无 `schema_version` 键即按 v1 旧扁平语义解析（缺省 = v1 · 语义等价映射入新内部模型：注入内建 command_sets 目录（= 2.4.2 常量现值逐字）+ hooks 缺省 `{mechanism: none}`）。

### ② 自定义表作者：可选迁移（欲用新能力时）

1. 表首加 `schema_version: 2`（**整数** · 不复用 `version` 字符串字段 · 非整数/未知整数 fail-closed）。
2. **可选**：把多行重复的 `verify` / `skills` 等提入根级 `defaults`，或改用行级 `extends: <host_id | "defaults">` 消重复（合并语义：标量子覆盖父 · 对象逐键深合并 · **数组整体替换**；循环继承/未知目标/链深 >8 拒绝）。
3. **必做**：声明根级 `command_sets`（v2 表缺此节 fail-closed · 不回退硬编码默认；`core` / `expanded` 非空数组 · `forbidden` 可选追加自定义禁词）。
4. **可选**：声明 `surfaces.hooks`（`mechanism: shell-hook | config-hook | none` + `triggers: [pre-commit | pre-archive]` + `command`）。**注意**：W1 只做声明与校验 —— hooks/verify 的**物化与运行时归后续波次（W2）**，当前声明不产生任何钩子行为。
5. **边界（3.0.1 W6 · P3-7）**：`config-hook` 落点映射表仅 `claude` / `cursor` / `gemini`（`CONFIG_HOOK_HOSTS` · **不扩表**）。非映射宿主若声明 `mechanism: config-hook`：`host validate` → **PASS + WARN**（stderr / `--json#warnings` · exit 0）；同表 `host apply` → **fail-closed exit 2**（行为正确 · 不静默）。自定义宿主请用 `mechanism: none`（仅 L1+L2）。

### ③ 禁止事项

- 不要手写 `schema_version` > 2（fail-closed 拒 · 「未知 schema_version」点名 · 不会静默按旧格式解析）。
- 不要在 `command_sets.core` / `expanded` 中含 `kit-30` / `kit-publish`（内建禁词机检拒 · 表声明不可移除该纪律）。

### ④ 落点不变

- 13 宿主既有物化路径全部不变（本波不碰任何 `.cursor/` / `.claude/` / `.dsh/` 等落点）；`hosts` 保持数组形态且每行带 `host_id`（pin-17 提取前提）。

### ⑤ 演练结论（2026-09-17 · 3.0 W7 · 真实 v2.4.1 仓）

- 演练基线：`git worktree add <tmp> v2.4.1` → worktree commit `c89f92d`（v2.4.1 表为 v1 扁平 · 无 `schema_version`）。
- ① **旧格式零改动**：以 v2.4.1 版 `mvp-hosts.yaml` 跑当前码 `host validate --file` → **PASS**；`host apply --tools dsh,cursor --dry-run --file` → **PASS**（planned writes 正常）。
- ② **新能力可选启用**：最小 v2 表（`schema_version: 2` + 根级 `command_sets` + `defaults`/`extends` + `surfaces.hooks`）→ `host validate` **PASS**；`host apply --dry-run` **PASS**（cursor `config-hook` 物化 `.cursor/hooks.json`；dsh `mechanism: none` 显式降级 L1+L2）。
- **结论：未发现 schema 兼容洞**（F-W7-01 未触发 · 回退 W1 通道未启用）。逐步骤命令与输出见演练记录。

## 3.0.0 → 3.0.1（patch）· 无强制动作项

> **状态：无强制迁移**（2026-09-18 · release bump）—— 3.0.1 为 patch；核心改动（粘性 `table_source`）**向后兼容**（`version` 仍为 `1` · 未知字段忽略 · 缺省回落内置表）。

- **不必做**：改适配表 schema、改粘性 `version`、重跑 `host apply`、改 CI 默认 hooks 命令。
- **粘性**：`3.0.0` 写入的粘性（无 `table_source`）仍可被 3.0.1 读取；3.0.1 写入的粘性仍可被 `3.0.0` 读取。
- **可选了解**（非动作项）：W5 `--pin-hook-version` 实验性且**缺省关闭**（不带旗标时物化与 `3.0.0` 逐字节一致）；W6 对非映射宿主 `config-hook` 的 `host validate` 增加 **PASS + WARN**（`apply` 仍 fail-closed · 行为未松）。
- `3.0.0` 的 breaking 迁移仍见上一节「2.4.2 → 3.0.0」。

## 3.0.1 → 3.0.2（patch）· 无强制动作项

> **状态：无强制迁移**（2026-09-23 · release bump · **已 published** · registry `latest=3.0.2`）—— 3.0.2 为 patch（消费侧反馈收口）；全部改动为 **additive**（新旗标 / 新可选声明档），不带 `--consumer` 旗标时全部既有行为逐字不变。

- **不必做**：改适配表 schema、改粘性、改 CI 既有命令、改 `pins check`（release 模式）用法。
- **F-1（词汇登记档）**：`graph yaml check/compile` 对 `branches` / `triggers` 两类边型不再产生「未在词汇登记档」告警（LangGraph 系普适边型内置登记 · **仅减告警** · 无行为与产物变化）。
- **可选启用**（非动作项）：F-3/F-4 `pins check/fix --consumer` —— 消费仓钉版保鲜闸（真值回退链 `devDependencies→dependencies→version` + `--truth <path#jsonpath>` + 可选声明源 `.spec-wave/pins-consumer.yaml` + 缺省 CI workflow 字面钉面 · 漂移 exit 2 · fix 默认 dry-run）。用法见 [`README.zh-CN.md`](./README.zh-CN.md)「pins consumer 模式」节（英文见 [`README.md`](./README.md) 对应节）。
- `3.0.0` 的 breaking 迁移仍见「2.4.2 → 3.0.0」节。

## 3.0.2 → 3.1.0（minor）· 无强制动作项

> **状态：无强制迁移**（2026-10-10 · release bump · **待发版 · tag/push/publish 仅人**）—— 3.1.0 为 **minor**（技术图谱脚手架 epic · W1–W4）；全部能力为 **additive / 可选启用**，不启用时既有 `graph yaml *` 缺省判定与 3.0.2 一致。**不暗示 breaking**。

- **不必做**：改适配表 schema、强制启用 scaffold / drift / vocab、改既有 `graph yaml *` 缺省判定、改粘性 / CI 既有 hooks 命令。
- **可选启用**（非动作项）：
  - `graph scaffold` —— 生成 `docs/_tech_graph/` **可审草稿**（非已签收真值 · `HG-GRAPH-MODULES` 须人签）
  - `graph drift` —— F-2 漂移闸（只报告不重画 · 可选白名单 `.spec-wave/graph-drift.yaml`）
  - `.spec-wave/graph-vocab.yaml` —— F-1② 仓级词表扩展（与内置合并 · 冲突 fail-loud · 缺省文件=3.0.2 行为）· 诊断可用 `graph vocab show`
- 指针：[`README.md`](./README.md) / [`README.zh-CN.md`](./README.zh-CN.md) 图谱节 · 使用手册 §10 · CHANGELOG `[3.1.0]`。
- `3.0.0` 的 breaking 迁移仍见「2.4.2 → 3.0.0」节。
- **3.2 图谱保真闸（文档见下节）**：`graph ib check` / `graph indexes check`（opt-in）· 与 `graph yaml *` 分责；**不**宣称已含 AST 深闸。

## 消费仓 `graph:ci` / Python yaml 工具 → SpecWave `graph yaml`（双栈 · 无强制删脚本）

> **状态：可选迁移**（2026-10-11 · 3.2 W4 文档）——消费仓可继续自备 Python / `graph:ci` 脚本；本包**不**强制删除。目标是能切（或双栈并行）到 `npx spec-wave graph yaml …`，并把保真闸与编译链分清。

### ① 何时需要

- 业务仓已有 `graph:ci`（或等价）用 Python/`pyyaml` 编译 `docs/_tech_graph/**/*.graph.yaml`，希望与 SpecWave CLI 对齐产物与 `graph_id` / label 口径。  
- 或希望在 CI 中逐步用 CLI 替代自备脚本，同时保留旧脚本作对照。

### ② 推荐步骤（可双栈并行）

1. **钉包**：`package.json` 使用 `spec-wave`（版本以仓内 `package.json` / CHANGELOG 为准；`3.2.0` bump 属 W5 · 本波不发版）。  
2. **编译链对照**（与自备脚本同输入目录，常见 `docs/_tech_graph`）：

   ```bash
   npx --yes spec-wave graph yaml compile --all --input docs/_tech_graph
   npx --yes spec-wave graph yaml export --input docs/_tech_graph
   npx --yes spec-wave graph yaml check --all --input docs/_tech_graph
   ```

3. **口径注意**（与旧 Python 栈差异最常见处）：  
   - `graph_id` 以 yaml **声明值**（`data.graph_id`）为真值写入 export / check，不再用路径命名空间 id（见 README 图谱节 · 1.7.0+）。  
   - 边 label / 拓扑协议标记（`?>` / `~>` / `::…`）在 export 侧保留；勿假设旧脚本丢 label。  
   - 锚点注释 emit 为 Mermaid `%%`（非 `//`）；升级后须重跑 compile 再生 `*.md`。  
4. **保真闸另跑**（**不是** `graph yaml *` 的替代）：见使用手册 §10「保真分责」——`graph drift`（边+模块表）· `graph ib check`（点 path）· `graph indexes check`（倒排双向 · **opt-in** · 须 `.spec-wave/graph-indexes.yaml` · **不**进默认 `verify`）。  
5. **切 CI**：可将 `graph:ci` job 改为上列 `npx` 步骤，或注释保留旧脚本作对照；样例见 [`assets/ci/samples/tech-graph.yml.example`](./assets/ci/samples/tech-graph.yml.example)（可选注释步含 `graph drift` / `graph ib check`；**indexes 默认不写硬门禁**）。  
6. **删 Python 脚本**：非本包义务；确认产物与闸绿后再由消费仓自行决定。

### ③ 禁止事项

- **禁止**宣称 SpecWave「已含 AST 深闸 / 符号级实现核对」——符号层 **未交付**（另 Epic）。  
- **禁止**把 `graph indexes check` 绑进默认 `verify` 或 Starter CI 硬门禁样例。  
- **禁止**用本迁移节暗示 breaking：不切 CLI 时既有自备脚本行为不变。

### ④ 指针

- 保真分责表：[`docs/guides/使用手册-v3.0.0-zh.md`](./docs/guides/使用手册-v3.0.0-zh.md) §10  
- 双语总览：[`README.zh-CN.md`](./README.zh-CN.md) / [`README.md`](./README.md) 图谱节  
- SPEC：`docs/spec/3_2-graph-ib-and-indexes/`（`03` §2 · `04` W4）

---
## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-09-09 | W3 初版：方案 B 布局 + 最小路径 + EOS 提案占位（`HG-EOS-DATE` pending） |
| 2026-09-09 | kit **1.11.0** 已 npm 发版；本文件包钉与状态条对齐 `latest` |
| 2026-09-10 | W2：填入 EOS **提案**日历（announce 2026-09-10 · 新注册截止 2026-10-10 · EOS 2026-12-31）；`HG-EOS-DATE` 仍 pending · **未** deprecate |
| 2026-09-10 | **人**：kit `1.12.0` publish + `@cyning/harness` deprecate；`HG-EOS-DATE` / `HG-PUBLISH` approved；日历改「已公布」 |
| 2026-09-10 | **拟发 `1.12.1`**：docs patch（RELEASING 顺序 + 过程档回填入包）；publish 后消费者可钉 `1.12.1`；deprecate registry 文案仍为 `1.12.0` |
| 2026-09-10 | **`1.12.1` published**（npm `latest`）；1.x CLOSED；下一主线 2.0 F6 规划 |
| 2026-09-10 | **`2.0.0` published**（F6 宿主适配）；归档 `ACCEPTANCE_2x_host_adapt_2_0_0_zh.md`；拟发 `2.0.1` docs patch |
| 2026-09-10 | **`2.1.0` published**（多平台技能+编排）；当时消费者钉 `dsh-coding-kit@2.1.0`（史实；现已 deprecate） |
| 2026-09-10 | **W1 收口**：终点改 SpecWave；`spec-wave` 非过渡 bin；醒目声明 `dsh-coding-kit` deprecated；钉点仅推荐 `spec-wave` |
| 2026-09-16 | **3.0 W1 草案节**：增「2.4.2 → 3.0.0（breaking）」适配表 schema 跃迁迁移节（草案 · W7 定稿 + 真实 2.4.1 仓演练后转正）· 只追加不动既有行（pin-14 钉点行未触） |
| 2026-09-17 | **3.0 W7 定稿**：适配表 schema 跃迁节草案 → 定稿（经真实 v2.4.1 仓演练 · 旧格式零改动 + 新能力可选启用均 PASS · 无兼容洞）· 演练记录 [`docs/harness/reviews/w7_migration_rehearsal_2_4_1_20260917.md`](docs/harness/reviews/w7_migration_rehearsal_2_4_1_20260917.md) |
| 2026-09-18 | **3.0.1 W6**：§② 补「非映射宿主 `config-hook`：validate PASS+WARN · apply fail-closed · 自定义用 `none`」（映射键 = claude/cursor/gemini · 不扩表） |
| 2026-09-18 | **3.0.1 patch**：增「3.0.0 → 3.0.1 无强制动作项」（粘性向后兼容 · 无强制迁移 · 可选了解 W5 旗标 / W6 WARN） |
| 2026-09-23 | **3.0.2 patch**：增「3.0.1 → 3.0.2 无强制动作项」（additive 能力面 · F-1 词汇登记仅减告警 · consumer pins 可选启用 · 待发版 publish 仅人） |
| 2026-10-10 | **3.1.0 minor**：增「3.0.2 → 3.1.0 无强制动作项」（scaffold/drift/vocab 可选启用 · 待发版 tag/push/publish 仅人 · 不暗示 breaking）· 头栏包钉对齐 `3.1.0` |
| 2026-10-11 | **3.2 W4**：增「消费仓 graph:ci / Python yaml → SpecWave graph yaml」双栈可选迁移节 · 保真分责指针 · 禁 AST 已交付宣称 · indexes 不进硬门禁 |
