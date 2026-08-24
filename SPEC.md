# SPEC：dsh-coding-kit@1.2.0 · 迁入 SPEC B §2.2 延期 CLI（v1）

> **状态**：`signed`（20-spec-audit R1 pass · 人签）  
> **track**：`epic`  
> **拟发版**：`dsh-coding-kit@1.2.0`  
> **人闸**：`HG-SPEC-SIGNOFF` = **approved**（2026-08-16 维护者对话「签收」）· `HG-PUBLISH-1.2.0` = **approved**（2026-08-16 人确认「已发版」+ `npm view=1.2.0`）  
> **过程根**（工作区 · 禁止写入本仓）：`docs/dsh_coding_kit_init/`  
> **过程指针**：`docs/dsh_coding_kit_init/spec/POINTER_dsh-coding-kit-SPEC-1.2.0.md`  
> **Open Folder（实现）**：`dsh-coding-kit/`  
> **本文件**：产品仓根公开规格；**git 保留**；**不进** `package.json` `files` / npm tarball

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **spec_slug** | `dsh-coding-kit-cli-1.2.0` |
| **test_strategy** | `required` |
| **test_strategy_note** | §2.2 每组须先有可失败自动化再改实现。1.1.0 P0（C1–C7）与 1.0.0 插件 T1–T6 **必须仍绿**。1.1.0 的 C8（延期命令非 0）在 1.2.0 **反转**为成功语义。`cordis.patch.yml` 保持 `- insert`。 |
| **entry_invoke_10_spec** | `docs/dsh_coding_kit_init/invokes/invoke_20260816_10_spec_1.2.0_product.md` |
| **entry_invoke_00_draft** | 工作区 `docs/harness/prompts/PROMPT_00_draft_spec_or_task_v1_zh.md` |
| **拟发版窗口** | **`dsh-coding-kit@1.2.0`** |
| **freeze_id** | 包名 `dsh-coding-kit`；CLI bin **仅** `dsh-coding-kit`；upgrade 钉 `version=1.2.0`；命令面 = 1.1.0 P0 **加** §2 全表；`apply()` 不自动注入；`cordis.patch.yml` 锁定 SPEC A §9.1；本 `SPEC.md` **不进 npm files** |
| **depends_on_spec** | SPEC A `migrate-cyning-harness-to-dsh-coding-kit`（1.0.0 插件 · signed · published）；SPEC B `dsh-coding-kit-cli-1.1.0`（1.1.0 P0 · signed · published；本 SPEC 消费其 **§2.2**） |
| **semantic_align** | `@cyning/harness@2.24.0` 的 §2 命令成功语义；前缀改为 `dsh-coding-kit` |

---

## 1. 背景与目标

`dsh-coding-kit@1.1.0` 已 npm publish：DSH 插件 + P0 闸 CLI（`init` / `upgrade` / `check` / `verify` / `gate-check` / `audit` / `task lint` / `task close`）。SPEC B **§2.2** 把其余命令面延期到 1.2.0；调用时非 0，文案指向旧包或等本版。使用 graph / skills / wiki / status 的存量仓因此仍须 **双包**。

**一句话目标**：把 SPEC B §2.2 延期 CLI **迁入同一 npm 包**，使存量仓在 upgrade 钉 1.2.0 后可去掉 `@cyning/harness`。

**完成态行为（1.2.0）**

1. `npx dsh-coding-kit` 对 §2 全表实现 **2.24.0 成功语义**（命令前缀换名；路径/包名按本包映射）。
2. `upgrade --yes` 把 manifest `version` 钉 **1.2.0**，`from_version` 记旧号；**不覆盖** S2。
3. 1.1.0 P0 闸与 1.0.0 插件回归 **仍绿**：`apply()` 仍不自动注入；`cordis.patch.yml` 仍为 `- insert`。
4. README 不再把 §2.2 标成未交付；迁移节写清：1.2.0 后可去掉旧包。
5. **1.2.0 发布前** 仍允许双包；publish / deprecate / Archive **仅人**。

本机锚点（2026-08-16 · 10-spec 只读）：

| 项 | 值 |
|----|-----|
| 产品仓 `package.json` | `version=1.1.0`；`bin` **仅** `dsh-coding-kit`（无 `cyning-harness` / `harness` 别名） |
| `files` | `bin` / `lib` / `assets` / `cordis.patch.yml` / `README.md` / `LICENSE`（**无** `SPEC.md`） |
| `cordis.patch.yml` | `- insert` · `id: coding-kit` · `name: dsh-coding-kit` |
| 旧仓对照 | `cyning-harness/lib/cli.js` · `@cyning/harness@2.24.0`（**禁止改旧仓**） |

---

## 2. 范围（1.2.0）

### 2.0 freeze 决定（2026-08-16 · 10-spec）

| 问 | 答 |
|----|-----|
| 1.2.0 交付什么？ | SPEC B **§2.2 全表**成功语义 + upgrade 钉 1.2.0 + 1.1.0 P0 / 1.0.0 插件回归仍绿 |
| 为何现在迁？ | 1.1.0 已让只跑 P0 的仓切新库；本版关掉双包缺口，产品终点「存量仓可去掉旧包」才成立 |
| 语义对齐哪一版？ | `@cyning/harness@2.24.0` 的 §2 命令；前缀 `dsh-coding-kit` |
| 别名 bin？ | 1.1.0 **未做**。1.2.0 **禁止新增**；若某 1.1.x 补丁误加 `cyning-harness` / `harness`，本版 **删除** |
| `lifecycle dry-run`？ | SPEC B 表写「只读展示 yaml」，但 2.24.0 同命令族含 `dry-run`。为去掉旧包，**纳入 lifecycle 组**（见 R2） |
| 本 `SPEC.md`？ | 产品仓根公开规格；git 保留；**禁止**写入 `package.json` `files` |

语义对齐 2.24.0 成功路径与退出码族（0 成功 / 1 用法 / 2 闸失败，与旧 CLI 同族）。实现可移植或等价重写，**禁止**改 `cyning-harness/`。

### 2.1 回归 · 必须仍绿（非新功能，但是 1.2.0 范围）

| 面 | 必须 |
|----|------|
| 1.1.0 P0 | `init` / `upgrade` / `check` / `verify` / `gate-check` / `audit` / `task lint` / `task close` 行为不回退 |
| upgrade | 钉 **1.2.0**（不再钉 1.1.0）；S2 不覆盖 |
| 1.0.0 插件 | `apply()` 只 register；T1–T6 仍绿 |
| patch | `cordis.patch.yml` 保持 `- insert` / `id` / `name` |
| pack | `npm pack --dry-run` **不含** `SPEC.md`、过程树、`src/` 作为唯一入口 |

### 2.2 新交付 · SPEC B §2.2 全表（可分组 · 无 early_stop · 不得漏项）

下列命令在 1.1.0 为「未交付 → 非 0」。1.2.0 须实现成功语义。旗标与 2.24.0 `lib/cli.js` usage **语义等价**（包名/路径按本包映射）。

#### G1 · 过程可观测 · `status` / `timeline`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `status [--target] [--task] [--json] [--check]` | 过程一屏投影；不替代 `verify` | 无 `--task`：列出 active task 摘要；有 `--task`：单 task 详表。`--json` 机读。`--check` 须配合 `--task`，缺 R1 或 `may_start_30=false` → exit 2 |
| `timeline --task FILE [--target] [--json] [--limit N] [--ingest]` | HGM 事件时间线 | `--task` 必填。默认不 ingest；`--ingest` 才写盘。`--limit` 非负整数 |

#### G2 · 只读 yaml · `lifecycle` / `discipline`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `lifecycle show [--json]` | 只读展示 lifecycle.yaml | 打印状态/类型/守卫；缺资产 → 非 0 + 可读原因 |
| `lifecycle dry-run --transition ID --from STATE [--task PATH] [--target PATH] …` | 转移资格判定（非 G7） | 同命令族；缺 `--transition`/`--from` → exit 1；`--task` 相对 `--target`（缺省=cwd）解析。**纳入**以免旧包残留 |
| `discipline show [--json]` | 只读展示 discipline-coverage.yaml | 机械化率资产；非 audit UI |

#### G3 · Inform 图谱 / HGM · `graph yaml *` 与 `graph ingest\|snapshot\|axioms`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `graph yaml compile --graph-id ID \| --all` | YAML → MD | 默认输入 `docs/_tech_graph`；`--all` 扫 `*.graph.yaml` |
| `graph yaml check --graph-id ID \| --all` | 与 graph.json 切片比对 | 有 diff → 非 0 |
| `graph yaml export [--input] [--out] [--no-recursive]` | 导出 graph.json | 不用 `--all` / `--graph-id` |
| `graph ingest [--target] [--actor] [--dry-run]` | 扫描仓 → HGM 事件 | `--dry-run` 不写盘；幂等跳过已存在；扫描 `docs/tasks/active` + `docs/harness/tasks/active` 双路径（同 slug 先扫目录优先） |
| `graph snapshot [--target]` | 事件重放 → snapshot.json | 写出节点/边计数 |
| `graph axioms check [--target] [--json]` | HGM 公理 | 违规 → exit 2 |

`graph yaml *` = compile / check / export 及其 `--graph-id` / `--all` / `--no-recursive` 变体，**不得只做其中一种**。

#### HGM 事件幂等键契约（DEF-015）

- 幂等键格式：`type:subject[:状态摘要]`——`GateStatusChanged` 摘要取 `data.new_status`，`TaskCreated` 取 `data.status`；无状态事件（如 `RepositoryAdopted`）保持两段键 `type:subject`。
- 迁移口径：存量 `.cyning-harness/events/*.jsonl` 旧两段键事件**保留不重写**，新键自变更点生效；闸 / task 状态变化后重跑 `graph ingest`（或 `timeline --ingest`）会**补发**新事件（行为修正，非契约破坏）。
- `GateStatusChanged.old_status` 由既有事件轨中同 subject 最新 `new_status` 推导，无历史回退 `pending`。
- `eventMatchesTaskSlug`：`data.task_slug` 等值优先；subject 侧仅对结构化形态（`task:<slug>` / `gate:<slug>:<hgid>`）做规范化等值匹配，无子串兜底——无 `data.task_slug` 且非结构化 subject 的外部手写事件不参与 task 过滤。

#### G4 · `sync index`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `sync index [--target]` | 生成 invoke_index.json | 写入 manifest 旁路（默认 `.cyning-harness/invoke_index.json` 或本包等价路径）。**禁止**写入 S2 三域 |

#### G5 · `skills build \| check`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `skills build [--with-execute-hats]` | 从 prompts frontmatter 全量重写 `skills/` | 默认目标 = **产品包树**（prompts → skills），不是消费者 S2。`--with-execute-hats` 仅评测 |
| `skills check` | 只读 drift 闸 | drift / frontmatter 非法 → exit 2 |

路径从旧仓 `harness/prompts` + `skills/` 映射到本包等价目录，由 10-task / 30 落盘，不得改消费者 `docs/tasks/` 等。

`skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]`（1.2.1 起）：复制产品包 `assets/skills` 到 dest（默认 `<target>/.dsh/skills`）。拒写规则：dest 命中 `.coding-kit` / `.dsh/coding-kit`、S2 三域（`docs/tasks` / `reviews` / `invokes/by-task`）、产品包自身 `assets/skills`（含子目录，安装源 ≠ 安装落点，DEBT R-05）、或已存在为文件时非 0 退出。环境变量 `DSH_CK_SKILLS_SRC` 为**内部测试钩子（非公开契约）**：仅测试用于把 skills 源指向临时副本（避免改动包内资产），消费者与脚本勿依赖（DEF-018）。

#### G6 · `wiki export`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `wiki export --json [--target] [--root] [--out FILE\|-]` | coding_wiki 关系图 JSON | **须** `--json`。无 wiki 根 → exit 2。`--out -` 或默认 stdout；文件则写盘并 stderr 报路径 |

#### G7 · `task lint-done` / `task lint-wiki-delta` / `task check`

| 命令 | 2.24.0 用途 | 1.2.0 成功口径 |
|------|-------------|----------------|
| `task lint-done [--target]` | done slug vs `invokes/by-task` 目录名 | done 有而 invoke 无 → exit 2；invoke 多出仅 warn |
| `task lint-wiki-delta [--target] [--scope all\|active\|done] [--strict] [--json]` | wiki_delta 缺口 | 默认缺字段（`wiki_delta_missing`）；`--strict` 追加值域校验（`path\|none\|n/a`）与 path 存在性检查（`wiki_delta_invalid` / `wiki_delta_path_missing`，note/path 口径）。有缺口 → exit 2 |
| `task check --file PATH [--no-circular] [--registry DIR]…` | sidecar `task.harness.v1.json` | schema 失败或环 → 非 0 |

`task lint` / `task close` 属 1.1.0 P0，本版只回归、不改成功口径。

### 2.3 文档与包面（1.2.0 必须）

- `--help` 列出 1.1.0 P0 **与** §2.2 全表，**禁止**再标「未交付（1.2.0）」。
- README：删/改「1.1.0 未交付」节；迁移节改为钉 1.2.0 后可去掉 `@cyning/harness`。
- `package.json` `version=1.2.0`；`bin` 仅 `dsh-coding-kit`。
- 本 `SPEC.md` 留在仓根；`files` 不列入。

### 2.4 有时限 bin 别名 · 删除计划

| 事实（1.1.0 已发布） | 1.2.0 计划 |
|----------------------|------------|
| `package.json` `bin` 只有 `dsh-coding-kit` | **保持**；禁止新增 `cyning-harness` / `harness` |
| SPEC B 曾允许 1.1.0 有时限别名、1.2+ 再删 | 别名 **未落地** → 删除动作 = 确认 `bin` 无旧名。若 1.1.x 补丁误加，本版删除并 README 只写 `npx dsh-coding-kit` |

---

## 3. 非范围

- **不**削弱 `apply()`：禁止加载时自动 `systemPrompt.section/context`。
- **不**把 `cordis.patch.yml` 改成 RFC6902 `op` / `path` / `value`。
- **不**改 DSH 上游、`dsh-toolkit`、Ink 业务仓、`cyning-harness/`。
- **不**由 Agent 执行 `npm publish` / `npm deprecate` / GitHub Archive。
- **不**在 **1.2.0 发布前**强制存量仓去掉旧包（发布前仍允许双包）。
- **不**把 CLI 注册为 DSH `ctx.tools`。
- **不**削弱 S2：`upgrade` / `sync index` / `init` **不覆盖** `docs/tasks/`、`reviews/`、`invokes/by-task/`。
- **不**把工作区 Extended `docs/harness/prompts/` 用 Starter `cp` 覆盖。
- **不**在 `HG-SPEC-SIGNOFF` pending 时改产品代码；**不**在 `HG-AUDIT-R1` pending 时开 30。
- **不**把 task / invoke / reviews 写入本仓；过程轨只在 `docs/dsh_coding_kit_init/`。
- **不**把本 `SPEC.md` 打进 npm。
- **不**新增 bin 别名。
- **不**把 2.24.0 的 `eval/`、旧仓 `test/` 整树拷进本包（测例在本仓 `test/` 用 fixture 重写）。

---

## 4. 验收标准

### 4.0 包与回归

- [ ] `package.json` `version` 为 `1.2.0`；`bin.dsh-coding-kit` 存在；**无** `bin.cyning-harness` / `bin.harness`。
- [ ] `npx dsh-coding-kit --help` 列出 §2.1 P0 与 §2.2 全表，不以「未交付」口吻列出后者。
- [ ] 对已有 manifest 的 fixture：`upgrade --yes` 钉 **1.2.0**，S2 文件内容不变。
- [ ] 1.1.0 P0 清单 C1–C7 **仍绿**（C1/C2 的钉版断言改为 1.2.0）。
- [ ] **T1–T6 仍绿**；`apply()` 仍不调用 `systemPrompt.context`。
- [ ] `cordis.patch.yml` 仍为 `- insert` / `id: coding-kit` / `name: dsh-coding-kit`。
- [ ] `npm pack --dry-run` **不含** `SPEC.md`；仍含 `bin` / `lib` / `assets` / `cordis.patch.yml`。
- [ ] README：§2.2 已交付；迁移节写「钉 1.2.0 后可去掉 `@cyning/harness`」；双入口（plugin vs CLI）保留。

### 4.1 §2.2 分组验收（每组至少一条成功 + 一条失败）

- [ ] **G1** `status --task <fixture>` 打印闸/invoke 投影（或 `--json` 含 schema）；`status --check` 无 `--task` → 非 0。`timeline` 无 `--task` → 非 0；有 `--task` 打印时间线。
- [ ] **G2** `lifecycle show` / `discipline show` 打印 yaml 投影或 `--json`；未知子命令 → 非 0。`lifecycle dry-run` 缺 `--transition`/`--from` → exit 1。
- [ ] **G3** fixture 上 `graph yaml compile` 写出 MD；`graph yaml check` 无 diff → 0、有 diff → 非 0；`graph yaml export` 写出 JSON。`graph ingest --dry-run` 不写盘；`graph snapshot` 写出 snapshot；`graph axioms check` 可 PASS/FAIL。
- [ ] **G4** `sync index` 生成 index 文件；S2 三域内容不变。
- [ ] **G5** `skills check`：无 drift → 0；人为 drift → exit 2。`skills build` 只写产品包 `skills/` 等价目录，不写消费者 S2。
- [ ] **G6** `wiki export --json` 对有 wiki 根的 fixture 输出 JSON；无 wiki 根 → exit 2；缺 `--json` → exit 1。
- [ ] **G7** `task lint-done`：done 缺 invoke → exit 2；齐则 PASS。`task lint-wiki-delta`：缺字段 → exit 2。`task check --file`：合法 sidecar → 0；坏 schema → 非 0。

### 4.2 测试清单（`test_strategy=required`）

| ID | 断言 |
|----|------|
| R-P0 | C1–C7 仍绿；钉版字段改为 1.2.0 |
| R-T | T1–T6 仍绿 |
| R-C8 | 原 C8 **反转**：`graph yaml compile` 或 `skills check` 在合法 fixture 上 **exit 0**（不再要求文案含「未交付」） |
| R-HELP | `--help` 含 G1–G7 命令名；无「未交付（1.2.0）」 |
| D1 | `status` / `timeline`：缺必填旗标非 0；合法 fixture 成功 |
| D2 | `lifecycle show` / `discipline show` 成功；`lifecycle dry-run` 缺参 exit 1 |
| D3 | `graph yaml` compile/check/export 各至少一条；ingest dry-run 不写盘；snapshot 写盘；axioms 可失败 |
| D4 | `sync index` 写出 index；S2 哈希不变 |
| D5 | `skills check` PASS/FAIL；`skills build` 不碰 S2 |
| D6 | `wiki export --json` 成功 / 无根 exit 2 |
| D7 | `task lint-done` / `lint-wiki-delta` / `task check` 各一条 FAIL + 一条 PASS |
| D8 | `package.json` `bin` 无旧别名；`npm pack --dry-run` 无 `SPEC.md` |

不测：真实模型是否调 DSH 工具；不测 IDE 对 `cordis.patch.yml` 的 JSON Patch 诊断消失；不测 Agent publish。

---

## 5. failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| `HG-SPEC-SIGNOFF` 或 `HG-AUDIT-R1` 仍 pending 就改 1.2.0 产品码 | 00 / 30 **停** | 是 | 只报闸 id + 路径 |
| 无 manifest 就 upgrade | 提示先 init | 是 | CLI 文案 |
| S2 路径将被 `upgrade` / `sync index` / `skills build` 写入 | skip / 拒写 | 否（对该路径） | skipped 或 S5 |
| `status --check` 无 `--task`；`timeline` 无 `--task` | exit 1 | 是 | 用法 |
| `wiki export` 无 `--json` | exit 1 | 是 | 用法 |
| `wiki export` 无 wiki 根 | exit 2 | 是（补 `--root` 或建目录） | stderr |
| `graph yaml check` 与 graph.json 不一致 | 非 0 | 是（先 compile 或修 YAML） | ERROR + diff |
| `graph axioms check` 违规 | exit 2 | 是 | FAIL + violations |
| `skills check` drift | exit 2 | 是（`skills build` 或修源） | SKILLS CHECK: FAIL |
| `task lint-done` 缺 invoke | exit 2 | 是 | LINT-DONE: FAIL |
| `task lint-wiki-delta` 有缺口 | exit 2 | 是 | LINT-WIKI-DELTA: FAIL |
| `task check` schema/环 | 非 0 | 是 | schema: FAIL / CYCLE |
| 未知命令 / 未知子命令 | exit 1 | 是 | 未知命令 + usage |
| 1.2.0 改 CLI 导致 T1–T6 或 P0 红 | **拒发版** | 是 | CI / 单测失败 |
| IDE 报 `cordis.patch.yml` 缺 `op`/`path`/`value` | **不改结构** | — | 诊断可忽略 |
| 1.2.0 尚未 publish，仓已删旧包且仍调未迁命令 | 文档：发布前允许双包 | 是 | README |

---

## 6. 依赖与引用

- SPEC A（插件 freeze · 已签收 · 已 publish）：工作区 `docs/dsh_coding_kit_init/spec/SPEC-migrate-cyning-harness-to-dsh-coding-kit_v1.md` · §4.1 T1–T6 · §9.1
- SPEC B（P0 · 已签收 · 已 publish；§2.2 为本 SPEC 范围真值）：`docs/dsh_coding_kit_init/spec/SPEC-dsh-coding-kit-cli-1.1.0_v1.md` §2.0–§2.2
- 旧仓只读：`cyning-harness/lib/cli.js`（2.24.0 usage 与 G1–G7 入口）
- 本仓现状：`package.json` 1.1.0 · `README.md` · `cordis.patch.yml`
- S2：`docs/tasks/` · `reviews/` · `invokes/by-task/`
- 过程 invoke：`docs/dsh_coding_kit_init/invokes/invoke_20260816_10_spec_1.2.0_product.md`
- DSH 发插件教程：bundle patch = `- insert` / id / name

---

## 7. 思考轮（10-spec 回填 · R0–R5）

### R0 · 读入与约束

维护者指令：另开产品仓 `SPEC.md`；主题 1.2.0 = 迁入 SPEC B §2.2，使存量仓可去掉 `@cyning/harness`。

已满足：1.0.0 插件与 1.1.0 P0 **均已签收且已 npm publish**。§2.2 在 1.1.0 为延期失败口。本机 1.1.0 **未做** bin 别名；`files` 已不含 `SPEC.md`。

约束：不削弱 apply 不注入；不改 patch 为 RFC6902；不改 DSH / 旧仓；不 Agent publish；发布前允许双包；过程轨不进本仓；本帽不实现、不代签、不 commit。

### R1 · 范围 / 非范围 / 场景

| 角色 | 场景 |
|------|------|
| 只用 P0 的仓 | 已在 1.1.0 可去旧包；本版 `upgrade` 钉 1.2.0，命令面变宽但不强迫使用 G1–G7 |
| 使用 graph/skills/wiki/status 的仓 | 1.2.0 publish 后改 devDependency → `upgrade --yes` → CI 全部 `npx dsh-coding-kit`，去掉 `@cyning/harness` |
| DSH 用户 | 插件行为不变；加载仍不自动注入 |
| 维护者 | 人签 SPEC → task → 实现 → 人 publish；发布前不强制全仓去旧包 |
| 双包仓（发布前） | P0 + §2.2 都可用新包后，仍可暂留旧包直到维护者 deprecate |

非范围见 §3。§2.2 七组 **全部进入范围**；`early_stop=no`。

### R2 · 方案对比

**命令面**

| 方案 | 结论 |
|------|------|
| A. 1.2.0 只迁「看起来常用」的 graph/status，其余再 1.3 | **弃选**。SPEC B 已 freeze §2.2 为 1.2.0；再裁须 `early_stop` + 残留双包，违背「可去掉旧包」 |
| B. 1.2.0 = §2.2 全表（推荐） | 与已签收延期表一致；分组 G1–G7 便于 task 拆分 |
| C. 1.2.0 再开第二 npm 包专放延期 CLI | **弃选**。维护者要同一 `dsh-coding-kit` |

**`lifecycle dry-run`**

| 方案 | 结论 |
|------|------|
| 只做 `show`（字面「只读展示」） | 弃选作唯一交付：2.24.0 同命令族有 dry-run，漏则旧包仍被依赖 |
| 纳入 G2（推荐） | 与「去掉旧包」一致；表项 lifecycle 不漏 |

**别名 bin**

| 方案 | 结论 |
|------|------|
| 1.2.0 补做再标 deprecated | **弃选**。1.1.0 未做；补做增加卸载面 |
| 确认无别名且禁止新增（推荐） | 与已发布 1.1.0 `bin` 一致 |

**实现策略**（本帽不写代码）

| 方案 | 结论 |
|------|------|
| 从旧仓 `cp` `lib/*.js` 进本仓 | 10-task 可选用；须换包名/路径，且 **不改旧仓** |
| 等价 TypeScript 重写 | 可；验收以 CLI 行为为准，不锁文件树 |

### R3 · 边界 / 失败语义 / 安全

- S2 三域对 upgrade / sync / skills build **只读**。
- `skills build` 默认写 **产品包** `skills/`，不写消费者过程树。
- `timeline --ingest` / `graph ingest` 写 HGM 事件，不是 S2。
- CLI 不注册 DSH tools；`apply()` 禁止 `context()` / `section()`。
- 用法错误 exit 1；闸/drift/公理失败 exit 2；禁止静默 no-op 当成功。
- patch IDE 误报不构成改 insert 的理由。
- 1.2.0 改码闸：`HG-SPEC-SIGNOFF` → 00 task → `HG-AUDIT-R1` → 30。
- publish / deprecate / Archive 仅人；发布前双包合法。

### R4 · 验收 / 可测性 / `test_strategy`

`test_strategy=required`。§4.2：R-P0 / R-T 锁回归；R-C8 反转 1.1.0 延期失败；D1–D7 覆盖 G1–G7；D8 锁 bin 与 pack。

每组「先红后绿」：先写可失败 fixture，再迁实现。不测 IDE 红线、不测真 DSH 会话、不测人 publish。

### R5 · SPEC 签收就绪 · 是否可交 00 出 task

R0–R5 已满；§2.2 七组无漏项；`lifecycle dry-run` 已写入 G2；别名删除计划已按 1.1.0 实况写成「确认无别名」；`SPEC.md` 不进 npm 已进 freeze / 验收；插件与 P0 回归已进范围 / 非范围 / failure_paths。

**阻塞缺口：无。** 建议交 **20-spec-audit**（本帽不 spawn）→ 人签 `HG-SPEC-SIGNOFF` → 00 按 G1–G7 + 回归拆 task。未签发本 SPEC 人闸。禁止签收前改产品代码。

### 思考轮控制

| 字段 | 值 |
|------|-----|
| `actual_last_round` | R5 |
| `early_stop` | `no` |
| `early_stop_reason` | — |
| `residual_risks` | `skills` 路径映射（旧 `harness/prompts` → 本包资产）易偏到消费者树；`sync index` 若误写 `invokes/by-task/` 会破 S2；`timeline --ingest` 与 `graph ingest` 写盘范围须在 task 钉死；1.2.0 发布前双包仓的 CI 可能混用两套 npx；旧仓 2.24.0 与本包并行时 fixture 漂移 |
| `round_extension_note` | — |
| `updated` | 2026-08-16（10-spec：产品仓 SPEC.md · 1.2.0 = §2.2 全表） |

---

## 8. 下一棒

`HG-SPEC-SIGNOFF` **approved**（2026-08-16 人签）。00 按 G1–G7 + 回归拆 task → 20-task-audit → `HG-AUDIT-R1` 人签后 30。`HG-PUBLISH-1.2.0` 仍仅人。**禁止**在 `HG-AUDIT-R1` pending 时改产品代码。

条文：`docs/harness/prompts/10-task-requirements.md`  
SPEC：`dsh-coding-kit/SPEC.md`  
过程根：`docs/dsh_coding_kit_init/`

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-16 | 10-spec：产品仓根 `SPEC.md` draft；1.2.0 = SPEC B §2.2 全表（G1–G7）；upgrade 钉 1.2.0；别名未落地故只禁新增；`SPEC.md` 不进 npm；`HG-SPEC-SIGNOFF` pending |
| 2026-08-16 | 00 落盘：维护者对话「签收」→ `HG-SPEC-SIGNOFF` **approved** · 状态 `signed` |
| 2026-08-16 | 00 落盘：人确认「已发版」+ `npm view=1.2.0` → `HG-PUBLISH-1.2.0` **approved** |

---

## 9. 设计红线（v1.2.4 增补 · DEF-003）

- **R-TRUTH-1 · 声称的能力必须接线或明示未接线**：资产（`assets/` 下 prompts / FRAGMENT / TEMPLATE / yaml / 示例与生成物）中任何能力声称——尤其是「机械闸 / 硬闸 / 机械强制 / 已接线」句式——**必须接线或明示未接线**：要么在本包 `src/` 有真实实现并以可失败自动化测试钉死，要么在文本同行/邻近行标注「未接线（旧包 v2.x 史实）」并附接线计划指针。**禁止第三态**（声称存在、实现缺失、且无标注）。
- **违反即缺陷**：发现的「声称 vs 实现」漂移按缺陷登记，修复路径对齐 PROP-03「先声明止血、再按需求补实现」；回归闸 `test/cli-docs-def003.test.ts` 对词表命中行强制「未接线标注或 allowlist 实现锚点」。
