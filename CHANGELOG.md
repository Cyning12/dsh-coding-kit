# Changelog

本项目所有显著变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

## [3.1.0] - 2026-10-10

> 主题：**minor** —— 技术图谱脚手架 epic（W1–W4 · PLAN [`docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md`](docs/roadmap/PLAN_3_1_tech_graph_scaffold_v1_zh.md) · SPEC [`docs/spec/3_1-tech-graph-scaffold/`](docs/spec/3_1-tech-graph-scaffold/) · 兑现 3.0.2 延后的 F-2 漂移闸 / F-1② 仓级词表）。
> **发布状态**：**待发版（tag/push/publish 仅人）**（bump 已落 · registry `latest` 仍为 `3.0.2` 直至人 publish · pin-10 打 tag 前设计红）。

### Added

- **W1（`graph scaffold`）**：生成 `docs/_tech_graph/` **可审草稿**（`00_main` · `01_struct` · full 模式 ≥1×`10_flow_*` · 协议文件 · `REVIEW_CHECKLIST.md`）· 默认 dry-run · `--yes` 写盘 · `--mode full|struct-only` · `--strict` 轻检 · 非空目录拒写 · **不是**已签收架构真值（`HG-GRAPH-MODULES` 须人签 · 禁称「自动权威图谱」）。
- **W2（入手链 DX）**：`init` quickstart 第 4 步真实命令指向 scaffold · 手册/README 对齐「可审草稿」口径 · `TASK_graph_bootstrap` 优先 scaffold、模板仅协议回退 · 包内 skill/commands 指针对齐审核清单。
- **W3（`graph drift` · F-2）**：模块表覆盖一级包目录 + 锚点 path 消失检测 + 可选白名单 `.spec-wave/graph-drift.yaml` · 漂移 exit 2 · **只报告不重画** · `--json` 信封只增不改。
- **W4（仓级 `graph-vocab` · F-1②）**：加载 `.spec-wave/graph-vocab.yaml` 与内置合并 · 冲突 fail-loud · 缺省文件 = 行为与 3.0.2 一致 · 可选 `graph vocab show` · 登记扩展边型零 Warning。

## [3.0.2] - 2026-09-23

> 主题：**patch** —— 消费侧（ops-desk-api）3.0.1 反馈收口（W1–W2 · PLAN [`docs/roadmap/PLAN_3_0_2_patch_v1_zh.md`](docs/roadmap/PLAN_3_0_2_patch_v1_zh.md) · 无独立 SPEC 夹 · F-2 图谱漂移闸 / F-1② 仓级词汇扩展档延 3.1.0）。
> **发布状态**：**已发布 2026-09-24**（人 publish · tag `v3.0.2` ↔ tip `3d71b90` · tag object `06a9320` · registry `latest=3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · 30 代核回填 2026-09-24 · task `3-0-2-postpublish-dx`）。

### Fixed

- **W1（tech-graph 词汇登记档）**：`assets/tech-graph-vocab.yaml` `edge_types` 补登记 `branches` / `triggers`（LangGraph 系普适边型 · ops-desk 反馈 F-1① · `version: "1"` 不变 · 「登记 ≠ 封闭」开放惯例不回退）——消费仓 37+16 处永不可行动 warning 清零（本仓 `docs/_tech_graph/00_main` 同款 4 处 dogfood 噪音同步清零）。纯数据波 · `src/` 零改动 · 渲染零漂移（恒等 fixture 机械证明）。

### Added

- **W2（pins consumer 模式 · F-3/F-4）**：`pins check --consumer [--json] [--truth <path#jsonpath>]` / `pins fix --consumer [--yes]` —— 消费仓钉版保鲜闸。真值源回退链 `devDependencies["spec-wave"]` → `dependencies["spec-wave"]` → `package.json#version`（`--truth` 显式指定跳过链条 · 包名可经声明源 `package_name` 覆盖）；`^/~` 前缀归一 + 可见 WARN（`--json#warnings`）· 非精确版本 exit 2；可选声明源 `.spec-wave/pins-consumer.yaml`（显式 > 缺省 · 存在且坏 failClosed 不回落）；缺省内置默认钉面 = `.github/workflows/*.{yml,yaml}` 全部 `<pkg>@X.Y.Z` 字面（数字锚内容预筛 · 无字面 workflow 合法跳过）；`^` 归一/零落点/坏声明源全部可见不静默；fix 共享 release 修复体（默认 dry-run · S2 机械拒写 · 备份两级避让）。**release 模式（无 `--consumer`）行为与输出逐字不变**（pins-consistency 64/64 机械钉死）。

## [3.0.1] - 2026-09-18

> 主题：**patch** —— 3.0.0 验收后信号质量收口（W1–W6 · PLAN [`docs/roadmap/PLAN_3_0_1_patch_v1_zh.md`](docs/roadmap/PLAN_3_0_1_patch_v1_zh.md) · 无独立 SPEC 夹）。
> **发布状态**：**已发布 2026-09-18**（人执行 tag/push/publish · tag `v3.0.1` ↔ `0e6d861` · registry `latest=3.0.1` · `time.3.0.1`=2026-09-18T07:42:30Z · 00 代核回填 2026-09-23 · 打 tag 后 pins 17/17）。

### Fixed

- **W1（粘性表源）**：`.coding-kit/host-tools.json` 可选 `table_source`；默认 `host verify` 取表与 `apply` 同源（`--file` 仍最高优先）；非内置表源不可用 **fail-closed**（点名路径 · **不**静默退回内置表）。粘性 `version` 保持 `1`（双向兼容）。
- **W2（闸表契约）**：README 双语最小骨架补第 4 列 `说明`；`parseHumanGates` 对「`### 人工闸` 存在但 0 行」输出空解析告警（含 id 内嵌粗体子形态提示）；**不**放宽 `GATE_ROW_RE` · 退出码语义不变。
- **W3（pins IO）**：`readTruthVersion` 坏 `package.json`（截断 / 不可读 / 冲突标记）→ **exit 2** + `PINS: BLOCKED`（与 `loadPins` 同形态）。
- **W4（口径）**：`MIGRATION.md` §① 改为「默认落点不变；内置表升级为 v2 并**新增** hooks 物化（additive）」；CHANGELOG `[3.0.0]` Tests 回填 **864（863 pass + 1 skip）**；`package.json#files` 列 `README.zh-CN.md`；研究文作者数区间化（`as_of 2026-09`）；`check-doc-links` 注释改为「除 9 件显式 tracked 外均忽略」。

### Added

- **W5（实验性 · 缺省关闭）**：`host apply` / `host update` 可选旗标 `--pin-hook-version[=SEMVER]`，使物化 hooks 命令写为 `npx spec-wave@<semver> hook-guard …`（裸旗标缺省 = 当前 `package.json#version`）。**不带旗标时物化输出与 3.0.0 逐字节一致**。`RELEASING.md` 与《使用手册》§7.3 补确定性 CI 建议。
- **W6（可见性 / 覆盖面）**：`check-terminology` 判红面追加 `CHANGELOG.md`（全量扫）；`host validate` 对「非 `CONFIG_HOOK_HOSTS` + `mechanism: config-hook`」输出 **PASS + WARN**（stderr / `--json#warnings` · exit 0 不变），`host apply` 仍 fail-closed。**未**扩落点映射 · **未**改 apply 松紧 · **未**将 CHANGELOG 纳入 `check-claims`。

## [3.0.0] - 2026-09-17

> 主题：**major** —— **架构跃迁（architecture leap）**：**首次 schema breaking**（host-adapt 适配表 v1 → v2 **可选**跃迁 · 旧表零改动兼容）· 门禁随包内置 + 可多宿主物化 + 本体/图谱/可观测/审计全接线 · W7 收尾与对外口径统一。
> **发布状态**：**已发布 2026-09-18**（人执行 publish · tag **`v3.0.0`** ↔ `895b975` · registry `latest=3.0.0` · `time.3.0.0`=2026-09-18T00:17:55Z · 发布前探针 6 项见 [`docs/harness/reviews/w7_release_probe_3_0_0_20260917.md`](docs/harness/reviews/w7_release_probe_3_0_0_20260917.md) · 打 tag 后 `pins` 复跑 **17/17**）。

### Breaking

- **host-adapt 适配表 schema v1 → v2（可选跃迁 · 旧表零改动）**：无 `schema_version` 键的旧表按 v1 旧扁平语义解析（缺省 = v1 · 语义等价映射入新内部模型：内建 `command_sets` 目录桥接 + hooks 缺省 `{mechanism: none}`）；欲用新能力（`defaults` / `extends` / `command_sets` / `surfaces.hooks`）时表首加 `schema_version: 2`。迁移指引见 [`MIGRATION.md`](MIGRATION.md)「2.4.2 → 3.0.0（breaking）」节（**经真实 v2.4.1 仓演练** · 旧格式零改动 + 新能力可选启用均 PASS）。

### Added / Changed（W0–W7 八波）

- **W0 重构预备**：god-file 拆分 barrel 化 + 六重锁（barrel/导出面/pins/assets/…）+ 独立验收文（**不迁 2.5.0**）· spawn 首轮下沉。
- **W1 适配表 schema 跃迁 + 闸判定泛化（核心）**：schema v2（`defaults`/`extends`/`command_sets`/`surfaces.hooks`）+ v1 兼容桥（旧表零改动）+ blocks-30 全闸泛化（声明式全闸扫描）。
- **W2 门禁入宿主 + B5 接入面**：hooks 物化（config-hook 3 宿主 / shell-hook = git 层宿主中立 / 无机制宿主显式降级 L1+L2）+ `host verify`（篡改报红 exit 2）+ `hook-guard` + host catalog。
- **W3 本体图谱统一**：本体/图谱接线 + OWL 引入评估（**否决** · 3.x 复议触发条件）+ 研究文/探针入库（硬约束 14）。
- **W4 防伪判据语义化**：结论级闸 + 自评类豁免（A1 三元判）+ 表行语义判（词锚 ∧ 表行双命中）。
- **W5 机械清扫**：快照标注 / 口径对齐（R-1/R-2/R-3）/ basename 无关文件类型卫生。
- **W6 可观测与审计**：审计事件轨 + G2/G4/G7 闸（failClosed）+ discipline check 收窄（逃逸率 100%→0%）。
- **W7 收尾与对外**：F3 wiki 能力补全（`backlinks` 双向 / `--incremental` 增量等价 / `--check-conflicts` 冲突检测）· E3 spawn 下沉 **671 → 270**（同口径 · `scripts/e3-spawn-count.mjs`）· 术语机检（`assets/harness/terminology.yaml` + `check-terminology`）· A3 对外口径边界（`assets/harness/claims-boundary.yaml` + `check-claims`）· K-1~K-4 竞品口径「区间 + as_of」修订 · MIGRATION 定稿 + 真实 2.4.1 仓演练 · 链接两级机检（`check-doc-links` · 非 S2 坏链 0）+ 证据入库清偿（≥4 件镜像 `docs/harness/reviews/`）· 2.4.2 口径补正搭车 · 3.0.0 bump。

### Tests

- 测试基线 **841 → 864**（863 pass + 1 skip · 打 tag 后全绿）；TTY 色彩 hotfix（`0e1f165`）其后 +5。发布过程中曾出现 **tag-gated 设计红 ×2**（`release-tag-identity` / `pins-consistency` 真实仓 pin-10 = git tag `v3.0.0`）作为过程留痕。
- 新增机械锁：`check-terminology` / `check-claims` / `check-doc-links`（各含正负 fixture）· F3 wiki fixture 三能力 · E3 计数脚本。

## [2.4.2] - 2026-09-15

> 主题：**patch** —— 2.4.1 验收报告 **PASS-with-issues（无 P1）** 三条 P2 修复（§6.1「建议纳入 2.4.2」：R-1/R-2/R-3 · task `2-4-2-patch` · 覆盖面对齐收尾）。
> **发布状态**：**已 published** · tag **`v2.4.2`** ↔ `spec-wave@2.4.2`（人执行 publish · 2026-09-15 · registry `latest=2.4.2` · `time.2.4.2`=2026-09-15T08:28:17Z · bump commit `2557119` · tag+push 00 原子推代跑（维护者本窗授权）· 探针全过）。

### Fixed

- **R-1 [P2] · `host validate` 缺省基改取 `--file` 所在仓根**（验收报告 §3.2 第 5/7 行）：2.4.1 补的 `--target` 为 additive，但缺省基仍为 cwd——跨目录缺省调用 `--json` 的 `file` 打印绝对路径。缺省基改 `findGitRoot(path.dirname(abs))` 上溯（与 task lint/close 2.4.1 修法同口径 · `src/cli-host.ts` cmdHostValidate 三面 + 人类输出同口径）；`--target` 显式传入仍以 target 为准（2.4.1 接口面不动）；**仓外文件**（上溯为 null）不再打印绝对路径——JSON 标 `outside_repo: true` + `file` 取 basename 占位（键集只增合规 · 值级修复定性同 D-23-JSON-TARGET-REL 先例），人类输出同口径占位；校验行为本身不回退。`printJson(process.cwd()` grep 维持 0 命中。
- **R-2 [P2] · 否定词表补 `not\s*pass` + 同句共现窗口**（验收报告 §3.1 行 G/I/J + §4 R-4 · §6.1 口径）：`REVIEW_NEG_RE`（`src/cli-checks.ts`）补 `not\s*pass`（封堵 `NOT PASS`）；`不.{0,3}通过` / `未.{0,3}通过` 窗口放宽为同句共现 `不[^。；\n]{0,12}通过` / `未[^。；\n]{0,12}通过`（封堵插 4 字形态「不最终予以通过」「未能够予以通过」· 排除 `。；` 限同句防跨句误中）；**窗口显式排除 `\n` → R-5 换行形态维持已登记残余不动（归 3.0 · K 断言钉死防顺手修）**。**存量误伤实测（R-2-c 硬条款）**：`evalReviewConclusion` 直评 A 面 done task 全量最新审查文（67 份 · 5 份无审查文）+ B 面 `docs/harness/reviews/` 全件（77 份）修复前/后双跑 —— 判定名单逐字一致，**措辞巧合误伤 0 · 真实否定语义翻转 0**（远低于 >3 回退阈值 · 无需回退保守档）。
- **R-3 [P2] · pin-16 HTML 锚点无引号属性值**（验收报告 §3.3 末行）：`htmlARe` 属性值改三选一 `"([^"]+)"|'([^']+)'|([^\s>]+)`（合法 HTML5 无引号形态入扫描面）；消费点联改 `m[1] ?? m[2] ?? m[3]`（捕获组 1/2/3 按形态互斥 · E5 收窄注释同步）；`assets/release-pins.yaml` pin-16 `semantics` 声明同步（数据声明与实现一致）。

### Tests

- 新增：R-1 双负向（跨目录缺省调用 / realpath 同型）+ 仓外文件 outside_repo 占位 + 零回退对照（`test/cli-json-no-abs-path.test.ts` · 修复前 3 条真红复现 §3.2 绝对泄漏）· R-2 三负向（NOT PASS / 不最终予以通过 / 未能够予以通过 + close 同口径）+ 对照零回退（A/B/D/E/L/F/M）+ **K 形态「不\n通过」维持 PASS 漏网断言**（防顺手修 R-5）（`test/cli-w4-gate-wiring.test.ts` · 修复前 3 条真红复现 §3.1 行 G/I/J）· R-3 无引号负向 + 四形态零回退 + 三捕获组取值测（F-P3-07）（`test/pins-consistency.test.ts` · 修复前 2 条真红复现 §3.3 末行）；测试基线 596 → 607（604 pass + 2 tag-gated 设计红（release-tag-identity / pins pin-10）+ 1 门控 skip · tag `v2.4.2` 落位后复跑须全绿）；版本断言联改 8 测试文件（perl 双模式字面+转义 · 沿袭 2.3.1/2.4.1 先例 · 历史标题与「2.4.1 码」红测留证注释保留）· README 双语未钉现行版引用联改 ×8（:289/:290/:309/:311 · :375「currently published=2.4.1」真值指针保留）。

## [2.4.1] - 2026-09-14

> 主题：**patch** —— 2.4.0 验收报告 **PASS-with-issues** 四项修复（§6.1「建议纳入 2.4.1」：NEW-1/NEW-2/NEW-3/NEW-9+N9 · task `2-4-1-patch` · 同族系统性弱点「判据用裸子串/字面连续而非语义边界」收口）。
> **发布状态**：**已 published** · tag **`v2.4.1`** ↔ `spec-wave@2.4.1`（人 · 2026-09-14 · registry `latest=2.4.1` · `time.2.4.1`=2026-09-14T12:47:48Z · bump commit `c89f92d` · 探针全过）。

### Fixed

- **NEW-1 [P1] · 结论门禁否定守卫语义判据放宽**（验收报告 §3 · B「不予通过」/ D「不 通过」/ E「NO PASS」三形态插字断链绕过封堵）：`REVIEW_NEG_RE`（`src/cli-checks.ts`）由字面连续（`不通过`/`未通过` · 仅中文）放宽为 `不.{0,3}通过` / `未.{0,3}通过` / `no\s*pass` / `reject`（i 旗标）——否定先于通过的判定顺序不动（病根在正则覆盖面）；退回（前置 无需/不/未 除外）与内容阻塞（前置 零 除外）判据不回退。存量波及抽验：现行 76 份审查文 `evalReviewConclusion` 直评修复前后 pass/fail 名单逐字一致（57/19 · 误伤 0 · 无需豁免）。已知残余（R1 §3-1 裁决留痕）：`.` 不跨行，「不\n通过」换行形态仍漏网（与 NEW-11 广义词表面同属 3.0 语义化议题）。
- **NEW-2 [P1] · `--json` 基参统一取命令 target + realpath 双侧归一**（验收报告 §3 · cwd≠target 与 symlink/realpath 两子类泄漏封堵）：`src/cli.ts`（task lint / task close READY·BLOCKED·PASS 三面 + exit-1 错误信封 :1299 增量纳入）与 `src/cli-host.ts`（host validate 三面 + emitHostFail/emitU01Degraded 透传）的 `printJson(process.cwd(), …)` 全部改取命令 target（task lint/close = task 文件所在仓根 findGitRoot 上溯 · 无 .git 回落 cwd 保持旧行为；exit-1 信封 = argv `--target` 或 cwd）；`relativizeOutputValue`（`src/cli-shared.ts` 统一出口）对基参做 realpath 双侧归一（词法形 + realpath 形各试一次 · 悬空 base 回落最近现存祖先 · 与 resolveTaskPath real() 同口径），堵 macOS `/tmp → /private/tmp` / symlink 入参形态错配子类。**接口面（additive · 契约只增不改）**：`host validate` 补 `--target PATH`（缺省 cwd · 既有无参调用零回退 · 与 verify/pins 等命令面一致）。掩盖源根治：`test/cli-json-no-abs-path.test.ts` 21 测全 cwd==target 恰好对齐 → 补 cwd≠target + symlink/realpath 对偶测试 ×6（修复前全真红复现报告代理实验）。
- **NEW-3 [P2] · pin-16 扫描面纳入 HTML 锚点**（验收报告 §3 · 维护者定稿修）：`files-whitelist-link` 提取补 `<a href="…">`（单/双引号同口径），与 inline / reference-definition 走同一归一/判定管线（剥 #锚点 · scheme/纯锚点跳过 · 仓根级且存在的 .md ∈ 白名单）；`assets/release-pins.yaml` pin-16 `semantics` 声明同步扩为三形态（数据声明与实现一致 · D-23-W2-CHECK-FORM）。
- **NEW-9 / N9 [P2] · pin-08 状态格精确版本锁定**（验收报告 §3 + §2 N9 未闭环项 · 2.3.0 遗留唯一未闭环）：`hitA` 由裸子串 `statusCell.includes(dotted)` 改边界正则 `(?<![0-9A-Za-z._-])X\.Y\.Z(?![0-9A-Za-z._-])`（R1 §3-2 定稿口径）——左/右边界排除数字/字母/点/下划线/连字符：拦 `` `vX.Y.Z` `` v 前缀 / `` `X.Y.Z-beta` `` 修饰 / `X.Y.Z.N` 加长顶包与同格 ``tag `vX.Y.Z` `` 子串顶包（N9 原构造）；放行反引号/星号/@ 包裹形态（现行 `docs/spec/README.md` 全量索引行回归零误伤）；hitB（slug 列行身份辅助判）不动；yaml pin-08 `semantics` 声明同步写清边界口径。

### Tests

- 新增/联改：NEW-1 负向 fixture ×3 + close 同口径 + A/C/F 对照零回退（`test/cli-w4-gate-wiring.test.ts` · 修复前全真红复现报告探针 B/D/E 行）· NEW-2 对偶测试 ×6（cwd≠target / symlink 入参 / realpath 双侧归一 / host validate --target / task lint / exit-1 信封 · `test/cli-json-no-abs-path.test.ts` · 修复前全真红）· NEW-3 `<a href>` 负向 + 基线回归（`test/pins-consistency.test.ts` · 修复前真红复现报告构造）· NEW-9 负向 ×3（9.9.9 同格 v-tag / v 前缀 / -beta 修饰）+ 正向零回退 + 加长版本号拦（同文件 · 修复前真红）；测试基线 582 → 596（593 pass + 2 tag-gated 设计红（release-tag-identity / pins pin-10）+ 1 门控 skip · tag `v2.4.1` 落位后复跑须全绿）；版本断言联改 8 测试文件（perl 双模式字面+转义 · 沿袭 2.3.1 先例 · 历史标题与「2.4.0 码」红测留证注释保留）· README 双语未钉现行版引用联改 ×8（:289/:290/:309/:311 · :375「currently published=2.4.0」真值指针保留）。

## [2.4.0] - 2026-09-14

> 主题：**minor** —— **门禁强度补全（gate strength）**：W1 pins 提取三修正（N7/N8/N9 · 本次核心）+ W2 结论级闸强度增强（S1·N=20 · 评审先行）+ W3 输出层统一相对化（N12）+ W4 资产门禁可观测（N2/N5）+ W5 物料与对外口径对齐（N3/口径三调/N6）+ W6 P3 清扫（N10/N14/N4）；**不动 host-adapt schema、不扩大范围、S2 永不覆写**。  
> 规划：[`docs/roadmap/PLAN_2_4_gate_strength_v1_zh.md`](docs/roadmap/PLAN_2_4_gate_strength_v1_zh.md) · SPEC：[`docs/spec/2_4-gate-strength/`](docs/spec/2_4-gate-strength/)  
>
> **发布状态**：**已 published** · tag **`v2.4.0`** ↔ `spec-wave@2.4.0`（人 · 2026-09-14 · registry `latest=2.4.0` · `time.2.4.0`=2026-09-14T10:07:41Z · bump commit `343025d` · 探针全过）。

### Changed（行为变更 · 明示）

- **2.4-W2（A2 残余强度权衡 · D-24-W2-REVIEW-FIRST / D-24-W2-NO-RETRO）结论级闸强度增强（S1·N=20 定档）**：评审先行——强度方案评审文 `w2_conclusion_gate_strength_review_20260914` 落盘 `docs/harness/reviews/`（S1/S2/S3 对比 + 存量 48 份现行 PASS 审查文实测：S1·N=20 误伤 0 · S1·N=50 误伤 4 · S2 全灭 48/48 否决）→ 定档 S1·N=20 经 20-task-audit R1。`evalReviewConclusion`（`src/cli-checks.ts`）增节内容量判据：结论/签收节合并文本剥除全部通过词命中（gi 全局 strip 防残留凑数）后残余非空白字符 < `REVIEW_MIN_SUBSTANCE=20` → **判未通过**（failClosed exit 2 · detail 点名 S1·N=20）——封堵 A2 收窄形态「结论节内只写通过二字」空判；否定守卫 / 通过词落节内 / 无节判红既有判据不动，exit code 与豁免机制零改动；**不追溯存量**（66 份 done 全量复测波及=0 · 零新增豁免）。
- **2.4-W3（N12 · D-24-OUTPUT-REL-EXIT）契约值变更 · 输出层统一相对化**：CLI 输出相对化从逐字段打补丁收敛为**输出层统一出口**——所有 `--json` 信封经 `printJson`（`src/cli-shared.ts` · 深遍历字符串值 · 仓根绝对前缀词法判据 · 路径边界 lookaround 防 `../../var/...` 相对形误改）打印，26 处 stdout JSON 出口收敛（写盘 JSON 不在出口面不动）；修复 V2 实测四处泄漏：`task lint --json#file`、`task close --json#dest`/`done_snapshot.path`（含 READY dry-run）、`verify`/`gate-check --json#task`（绝对入参形态）、`task close` 人类输出 `moved:`/`dest:`/`done_snapshot · path:`；另覆盖 `host validate --json#file` 同型泄漏。`--json` 信封**键集只增不改**（键名/类型/顺序不变 · 测试钉死），本条为**值**变更，循 D-23-JSON-TARGET-REL 按安全泄漏修复定性；既有 JSON 消费者若依赖绝对路径值须适配。exit code 语义不变；`CLOSE: PASS` 等冻结文案不变。
- **2.4-W6（N14 · D-24-W6-N14）`task lint-done` slug 口径统一**：slug 级存在性判集合键由文件名 slug 改为 `meta.task_slug ?? 文件名 slug`（meta 优先 · 文件名兜底 · normalizeSlug 归一沿用），与帽级/豁免判同一真值源——修复「文件名 slug ≠ meta slug 时豁免永不命中」（验收报告 §3.O）；生产数据（命名合规）零行为变化。

### Fixed

- **2.4-W1（N7/N8/N9 · 本次核心）pins 提取三修正 + 三负向 fixture**（验收报告 §3.H/§3.I/§3.J · V1 三组对照构造机械化固化 · 修复前逐一真红留证）：
  - **N7 · pin-16 refstyle 绕过封堵**（D-24-PIN16-REFSTYLE）：链接提取补 reference-definition 分支（`^\s*\[[^\]]+\]:\s*(\S+)`），refstyle 定义 `[id]: FOO.md` 入扫描面，与 inline 走同一归一/判定管线（剥尖括号 · 去锚 · scheme/纯锚点跳过 · 仓根级且存在 ∈ 白名单 ∪ npm 自动入包）。
  - **N8 · pin-17 词锚∧表行双命中**（D-24-PIN17-TABLEROW）：词锚须命中 `^\s*\|` 宽松起首的表格行才算，tagline/prose 裸词顶包不再计入；miss 点名缺表行侧。
  - **N9 · pin-08 语义格位锁定**（D-24-PIN08-SEMCELL）：spec 索引行合格 ⟺ 状态列（cells[2]）含点式 `X.Y.Z` ∧ slug 列行身份辅助判；`X_Y`/`X_Y_Z` 前缀式一律不计入版本串（归档链接/slug 顶包杀伤）；「改坏状态格版本串 → exit 2」回归锁（真仓对照实验 exit 0→2→0 留痕 · 对现行合规文件零误伤）。
- **2.4-W6（N10 · D-24-W6-N10）pin-16 大小写口径统一（治假阳）**：链接目标与 `files[]` 成员大小写不敏感比较，命中后再以磁盘存在性二次确认（仓根条目快照 · 同为大小写不敏感）为最终判据——修复「链接 `foo.md` vs 盘上 `FOO.md`」假阳（验收报告 §3.K · macOS 易触发）；双平台语义一致：白名单命中但盘上无任何大小写变体 → 不放行仍 exit 2（F-W6-01 负向对照不误放）。

### Added

- **2.4-W4（N2/N5 · D-24-W4-WARN-ONLY）资产门禁可观测补全（行为增补 · exit code 语义不变）**：① `assets verify` 对 `assets/` 内被排除项（`*.bak` / `*~` / `.DS_Store` · D-23-W5-EXCLUDE 单一常量双侧消费保持）输出显式 `WARN: 排除项 N 个（不参与哈希校验）: <相对路径清单>`（超 5 条截断 + `… 共 M 个` 汇总），`--json` 信封新增 `excluded: string[]` 字段（键集只增不改）——排除项由「静默排除」升级为「排除但可见」，warning 级不升 exit 2、不干扰 failClosed（真实篡改仍 exit 2）与 CI 判读；② `assets manifest rebuild` dry-run 与 `--yes` 两路强制输出追认警示「本操作将当前资产状态追认为真值——若资产曾被篡改，篡改将随本次 rebuild 被合法化；防投毒依赖 provenance（未启用）」（口径同 `docs/guides/provenance_oidc_trusted_publishing_guide_v1_zh.md` 自述）。

### Docs

- **2.4-W5（N3/口径三调/N6）物料与对外口径对齐（纯文档波 · 零代码改动）**：① N3 —— `delivery/promotion/` 4 份物料逐份处置（03 发布博客天然快照 · 01/02/04 文首标注「历史版本快照（2.1.3 时点）」），黑名单词机检（`四宿主` / `406 用例` / `2.1.3` 现行表述位命中为零或快照标注存在）逐份留证；② 口径调一 —— 事实卡/README 的 T-03 表述从「可机检」降调为「防意外漂移」；③ 口径调二 —— 《安全设计》§5.3.1 A-1 行完整性依赖列收窄（「防漂移口径 · 防投毒依赖 provenance · 未启用」）· `:77`「篡改发现」→「意外漂移发现」（只收窄不重构 · 真实控制不动）；④ 口径调三 —— 「关账必经审查通过」对外声称以 W2 落地为界（落地前禁称核查留档）；⑤ N6 —— README 双语 aider 行补 `.aider.conf.yml` 写 `conventions-file: AGENTS.md` 等价配置路径（表行内保留 host 词锚 · pin-17 表行命中不破）。
- **2.4-W6（N4 · D-24-N4-REGISTER）安全拒绝 exit 1 档位仅登记留痕**（不改行为 · 验收报告 §3.E 判定符合 SPEC 00 §2.4 契约）：登记落盘 `assets/harness/discipline-coverage.yaml` gaps `N4-EXIT1-REGISTER`（随 2.4.0 ACCEPTANCE 档收口）；exit 1 用例回归锁 `test/cli-security-closure.test.ts` 不变。

### Tests

- 新增机械断言：W1 三负向 fixture（24W1-N7/N8/N9 · V1 构造固化）· W2 六用例（A2 收窄形态 / 单通行词双变体 / 存量最低容量代表样本回归 / 19–20 阈值边界探针 / 否定守卫回归 / done 降级不回退锁）· W3 `test/cli-json-no-abs-path.test.ts` 21 测（19 个 `--json` 命令面绝对入参 · 负向自证 4 例真红 · 键集钉死 6 组）· W4 4 用例（N2 构造正负 / 截断 / warning 不掩负向 / N5 快照两路）· W6 `test/pins-consistency.test.ts` 24W6-N10 组 3 用例 + `test/cli-w4-gate-wiring.test.ts` N14 组 3 用例 + `test/cli-discipline-coverage.test.ts` N4 留痕存在性核查；测试基线 541 → 582 总（+41 · 579 pass · tag-gated 设计红 ×2 随 tag `v2.4.0` 落位转绿 · 复跑须全绿 · 1 门控 skip）。
## [2.3.1] - 2026-09-14

> 主题：**patch** —— 2.3.0 验收报告 **PASS-with-issues** 三项修复（§6「建议 2.3.1」：N1/N11/N13 · task `2-3-1-patch`）。
> **发布状态**：**已 published** · tag **`v2.3.1`** ↔ `spec-wave@2.3.1`（人 · 2026-09-14 · registry `latest=2.3.1` · bump commit `268ca21`）。

### Fixed

- **N1 [P1] · `.bak` 发布卫生**（验收报告 §3.B · 已发布 2.3.0 tarball 含 5 个 `.bak`）：① `.gitignore` 加 `*.bak`；② `package.json#files` 加否定项 `"!assets/**/*.bak"`；③ `prepublishOnly` 链尾接机械断言 `scripts/check-pack-hygiene.mjs`（`npm pack --dry-run` 清单不得含 `*.bak` / `*~` / `.DS_Store` · failClosed exit 2 · 覆盖 npm readme 自动入包规则这一 files 否定项管不到的面）；④ `pins fix` 写前备份改为**写盘成功后自动清理**（只清本次自写 `.bak` · 聚合写盘/S2 拒写/dry-run/unfixable 语义不变）——根因教训：「未入库 ≠ 不发布」，npm publish 读工作树而非 git 索引。
- **N11 [P1] · 结论级闸强制结论节**（验收报告 §3.L · A2 形态「审查文只写通过二字无结论节 → PASS exit 0」绕过封堵）：`evalReviewConclusion` 无结论/签收节 → **直接判未通过**（exit 2 · 禁止回退全文）；通过词须落结论节内；否定守卫不变。**存量波及处置**：裸 verify 实测 8 份 2.3.0 前历史关账审查文（无结论节 · 旧回退全文口径下合法）受影响，循 W4 先例入 `docs/harness/legacy-gate-exempt.yaml` 豁免（四字段齐 · 留痕点名 · 非静默放过）。
- **N13 [P2] · 豁免四字段 falsy 陷阱**（验收报告 §3.N）：`loadLegacyGateExempt` 改显式类型判（`typeof x === 'string' && x.length > 0`）——未加引号的 `authorized_by: 00`（YAML 整型 0）判无效并留痕（不再静默漂移），`"00"`（加引号）正常命中；同时拒收非字符串标量（旧 falsy 判会把 `123`/`true` 静默收编为有效授权人）；`legacy-gate-exempt.yaml` 头注释补 YAML 引号规范。

### Tests

- 新增/联改：N11 A2 负向 fixture ×2（verify --task / task close · 修复前真红复现验收报告 A2 组）· N13 fixture ×3（`00` 无引号 / `"00"` / `123` 真红锁）· `test/pack-hygiene.test.ts`（正/负向 · trap=README.trap.bak readme 自动入包面）· pins B4/B11 联改为「备份成功后自动清理」语义；测试基线 534 → 540（tag-gated 设计红随 tag `v2.3.1` 落位转绿 · 复跑须全绿）。

## [2.3.0] - 2026-09-14

> 主题：**minor** —— **接线补全（wiring completion）**：W1 pins 机制补强（核心）+ W2 钉面维度扩展 + W3 安全可观测 + W4 闸语义接线 + W5 资产完整性 + W6 六宿主补齐（7→13）+ W7 DX/工程健康；**不动 schema、不扩大范围、S2 永不覆写**。  
> 规划：[`docs/roadmap/PLAN_2_3_wiring_completion_v1_zh.md`](docs/roadmap/PLAN_2_3_wiring_completion_v1_zh.md) · SPEC：[`docs/spec/2_3-wiring-completion/`](docs/spec/2_3-wiring-completion/)  
>
> **发布状态**：**已 published** · tag **`v2.3.0`** ↔ `spec-wave@2.3.0`（人 · 2026-09-14 核验 `latest=2.3.0` · bump commit `87dfa6f`）。

### Changed（行为变更 · 明示）

- **2.3-W3（[A]#5 · C3 补漏 · D-23-JSON-TARGET-REL）契约值变更**：`verify --json` / `verify --spec --json` / `gate-check --json` 的 `target` 字段由**绝对路径**改为**相对路径**（`toRel` 口径 · 与 2.2.0 人类输出 `目标:` 行一致）。2.2.0 `--json` 契约「键集只增不改」保持（键名/类型/顺序不变），本条为**值**变更，按安全泄漏修复定性；既有 JSON 消费者若依赖 `target` 为绝对路径须适配。
- **2.3-W4（A5+A6 闸语义接线 · SPEC 04）行为变更明示**：
  - **裸 `verify` 不再是用法错**：不带 `--task/--spec` 时由「须指定参数 exit 1」改为**仓级 reviews 全量扫描**（双路径 `docs/harness/reviews` + `reviews/`）：done task 审查文存在 + 最高 R 轮结论可机读通过（failClosed exit 2），active task 仅信息报告；存量过渡豁免走数据文件 `docs/harness/legacy-gate-exempt.yaml`（四字段 slug/reason/date/authorized_by 留痕）。
  - **`verify --task` / `task close` 的 reviews 闸升级为结论级**：R<n> 审查文除存在外，其结论/签收节须含可机读通过词（PASS/ACCEPT/签收/通过/零阻塞 且无未否定「退回/未通过/内容阻塞」）；`--task` 对 done 目录文件降级为 warn（不追溯存量）；`--allow-no-review` 沿用同豁（无新旗标）。
  - **`task lint-done` 升级为帽集合校验**：done task 按其元信息 required 帽集合（`required_invoke_hats` / profile · 缺省 default=10,30,40）判缺 → exit 2；存量豁免同数据文件；slug 级存在性闸保留。
  - **`status` 的 `reviews.CLOSE` 由「已归档」代理口径升级为强证据口径**（归档 ∧ 最高 R 轮审查结论可机读通过）；JSON `reviews` 增 `close_evidence` 字段（键集只增不改）。
  - **`task lint` 新增思考轮结构 warn（W5 槽位 / W6 控制表 / W7 early_stop reason）**：warn-only 过渡（不挡 LINT: PASS · exit 码不变），升 failClosed 须后续 SPEC 明文裁决。

### Added

- **2.3-W7（SPEC 07 · DX 与工程健康收官）**：① 根 README 双语宿主表 4 → 13 行（tagline 扩为 13 宿主概括表述 · 既有四行行首锚形态不变、新增九行逐字命中 pin-17 词锚 · aider 行「注入层支持」口径写明须 `--read`/`.aider.conf.yml`、不暗示自动加载 · roo 行注明官方仓 merged PR 证据 · `spec-wave@2.2.1` 钉点串不动）；② GLOSSARY 两处措辞与实现一致化（「four gates」按 task 文件级 / SPEC 级 / 发版级三层表述 · 「每帽一 prompt 文件」修正为「sync prompts 物化 7 具名帽 · `50-independent-reinspect` 暂无物化 prompt 文件」）；③ E2 `cli-peer-optional` 去网络绑定（默认离线 fixture 伪造已安装布局 + 运行时依赖闭包直拷 · 原真实 pnpm 链路保留为 `SPEC_WAVE_E2E_NETWORK=1` 门禁手动测试 · 默认 skip）；④ E5 tsconfig 开 `noUncheckedIndexedAccess`（62 存量类型错逐一机械收窄 · 运行时语义零变更 · 熔断阈值内）；pin-17 九条过渡豁免全摘关账（`13 宿主校验 · 13 双语命中` 零豁免 · 失陈债机检中间态 exit 2 留痕）。
- **2.3-W6（B4 · SPEC 06）host-adapt 六宿主补齐**：适配表新增 `gemini` / `opencode` / `roo` / `zed` / `cline` / `aider`（7 → 13）· 落点逐宿主官方文档取证（2026-09-13）：gemini=GEMINI.md+`.gemini/skills` · opencode/zed=AGENTS.md+`.agents/skills` · cline=AGENTS.md+`.cline/skills` · roo=AGENTS.md（官方仓 merged PR #10446 · skills 无官方约定不物化）· aider=**降级** AGENTS.md 注入层（官方约定为 CONVENTIONS.md 显式 `--read`，无自动加载 · 如实标注）；全量复用 agents 资产面（**零新资产 · 零 src 改动**）· `commands: []` 不暗示 P0 门禁在新宿主内生效；pin-17 host_hits/known_gaps 数据面同步（六新豁免 until_wave: W7 · W7① 统一关账）。注：根 README 双语宿主表更新归 W7①，对外宣称口径归维护者（事实卡 §11）。
- **2.3-W5（A2 · SPEC 05）assets 资产完整性校验**：新增 `assets/sha256.manifest`（构建声明：assets/ 全量文件 sha256 · posix 路径确定性排序 · sha256sum 行格式）+ 新子命令 `spec-wave assets verify [--target PATH] [--json]`（逐文件比对：ok/mismatch/missing/extra 四态 · 任一偏差 failClosed **exit 2** · 与 pins 同门禁语义）与 `spec-wave assets manifest rebuild [--target PATH] [--yes]`（默认 dry-run · `--yes` 重生成 manifest · 幂等 · **修复对象=manifest 声明，资产为真值永不反向改**）；CI test job 与 `prepublishOnly` 链尾与 pins 同点位接线（改 assets 未重生成即红）。注：根 README 等对外文档口径更新归维护者（事实卡 §11 解禁不属本波）。
- **2.3-W3（[A]W3-P2）exit 1 JSON 信封**：用法错误档（exit 1）且传 `--json` 时，stdout 输出结构化信封 `{ command, exitCode: 1, error: { message } }`（message 已相对化）；不传 `--json` 时人类错误输出不变；exit 码语义不变。
- **2.3-W3（[A]#9）quickstart git 前提**：`init` 的 3 步 quickstart 第 3 步前补前提提示（项目须为 git 仓 · `git init`）；README 双语「核心对象」quickstart 引用句同步。
- **2.3-W3（C4）CI 安全基线**：`ci.yml` / `tech-graph.yml` 顶层 `permissions: contents: read` 最小权限；新增 `audit` job（`npm audit --audit-level=high` fail-closed）与 `secrets-scan` job（gitleaks 官方二进制钉版 + `--no-git` 工作树档）。
- **2.3-W3（C5）发布 provenance/OIDC 配置指引**：`docs/guides/provenance_oidc_trusted_publishing_guide_v1_zh.md`（**未启用 · 配置仅人 · 规划中**口径 · 含 `--provenance` 前提 / trusted publishing 步骤 / 回退路径 / GitHub 原生 secret scanning 开启指引）。

### Fixed

- **2.3-W3（C3 补漏）错误文案绝对路径泄漏**：`--target 不在任何 git 仓内` · `未找到 --task/--spec 文件` · `--spec 收到目录` · `拒绝 target 之外的路径` 等错误消息统一 `toRel` 相对化（cwd 外路径维持 `../` 相对形既定口径）。
- **依赖漏洞**：`npm audit fix` 修平 js-yaml 4.2.0 → 4.3.2（high ×1 · GHSA-52cp-r559-cp3m 等 · lockfile-only bump）· 修复后 `npm audit` 0 漏洞。

## [2.2.1] - 2026-09-12

> 主题：**patch** —— 2.2.0 验收报告 **PASS-with-issues** 四项修复（§4 #1/#2/#3/#6 · task `2-2-1-patch`）。  
> **发布状态**：**已 published** · tag **`v2.2.1`** ↔ `spec-wave@2.2.1`（人 · 2026-09-12 核验 `latest=2.2.1`）。

### Fixed

- **P0 · C1 symlink 穿透封堵**：`resolveTaskPath`（`src/cli-shared.ts` · 单点收口覆盖 verify / gate-check / audit / `--spec` 四调用点）在词法归卡之上叠加 **realpath 归卡**——`--task`/`--spec` 经仓内符号链接指向 target 之外文件一律拒止（exit 1 · 含迁移指引 · 不留读痕）；**双侧 realpath**（target 自身也归一）避免 macOS `/tmp`→`/private/tmp` 靶场误拒仓内合法路径；悬空 symlink 保持「未找到」语义（existsSync 跟随兜底）；仓内 symlink 指仓内文件、target 内绝对路径存量 CI 用法放行不破。
- **P1 · `pins fix` 静默部分修复**：`src/cli-pins.ts` 写盘前**按文件聚合 plan**——同文件多钉面（pin-11/12 场景）基于累计内容依序替换、一次写盘、只备份一次；单次 `pins fix --yes` 即收敛，杜绝「exit 0 自称全修却留坏值」；S2 硬拒写 / dry-run / `.bak` 备份 / unfixable 语义全部保持。
- **P2 · `.gitignore` 加 `.workbuddy/`**：公开仓防 `git add -A` 误推未跟踪内部资料（验收报告 §5）。
- **P2 · `package.json#files` 加 `GLOSSARY.md`**：修安装后 README 双语 4 处相对链接死链（验收报告 §2 W5）。

### Tests

- 新增 symlink 负向（四调用点穿透拒止 + 悬空「未找到」+ 仓内放行回归）与同文件双钉面一次收敛（`test/cli-security-closure.test.ts` · `test/pins-consistency.test.ts` B11）；测试基线 459 → 464（tag-gated 设计红随 tag `v2.2.1` 落位转绿 · 复跑 464/464 全绿）。

## [2.2.0] - 2026-09-11

> 主题：**minor** —— **闭环起步（closed-loop start）**：W1 版本/身份钉自动化（核心）+ W2–W7 安全封堵 / 可观测字段 / 上手断档 / 术语表 / 三宿主 / 小清理；**不动 schema、不动架构、不加 hooks**。  
> 规划：[`docs/roadmap/PLAN_2_2_closed_loop_start_v1_zh.md`](docs/roadmap/PLAN_2_2_closed_loop_start_v1_zh.md) · SPEC：[`docs/spec/2_2-closed-loop-start/`](docs/spec/2_2-closed-loop-start/)  
>
> **发布状态**：**已 published** · tag **`v2.2.0`** ↔ `spec-wave@2.2.0`（人 · 2026-09-11 核验 `latest=2.2.0`）。

### Added

- **2.2-W1（A1 · 本次核心）版本/身份钉自动化**：单一声明源 `assets/release-pins.yaml`（12 钉面 · `extract` 表达式本身也是数据 · `fixable` 矩阵 · S2 目录机械拒写无豁免参数）；新子命令 `spec-wave pins check [--json]`（干净 exit 0 · 任一偏差 **exit 2**（D-PINS-EXIT）· `--json` 输出每落点 path/expected/actual/status）与 `spec-wave pins fix [--yes]`（默认 dry-run · 写前备份 `.bak` · 只修 `fixable` 落点 · 真值源 pin-01 与 git pin-10 永不反向改 · 幂等）；门禁接线 `prepublishOnly` 链尾 + CI test job（D-PINS-EXIT）。测试：`test/pins-consistency.test.ts`（钉面失配**真失败** · S2 拒写反向验证）。
- **2.2-W3（C2）**：`verify --json` 输出**只增不改**补四字段（安全设计 §7.2 · SPEC 02 §W3）：`traceId`（单次运行标识 · 进程内生成 · 不接外部遥测）、`exitCode`（与进程退出码同源）、`source`（注入判定来源 package/override）、`injectedFiles`（注入文件清单 · 复用 M1 注入收集单一实现，新模块 `src/inject-collect.ts` 收口，插件面 `loadMarkdownBundle` 契约不变）。既有字段名与语义不变；task/spec 两模式同口径。测试：`test/cli-verify-observability.test.ts`（四字段存在 + exitCode 一致性 + 旧字段回归 + 键集 diff 级钉死）。
- **2.2-W4（D1+D3）上手断档消除**：`init` 成功完成（含 `--yes` 非交互）打印 **3 步 quickstart**（① `sync prompts --yes` ② 按模板建首个 task ③ `verify --task` 首验）；README 双语新增「核心对象」节（`task.md` / `spec.md`：是什么 / 从哪来 / 放哪 / 最小示例）；quickstart ↔ 核心对象 ↔ GLOSSARY 三处互链。
- **2.2-W5（D2）**：仓根新增双语 `GLOSSARY.md`（`task.md`/`spec.md` · `Harness` · `hat` · `kit-*` 四组概念 + 门禁 / 过程轨 / 帽制 / 人闸 / 真值源 等既定中文术语）；README 双语首屏链接。
- **2.2-W6（B1）三宿主扩展**：适配表新增 `copilot` / `codex` / `windsurf`（落点复用 AGENTS.md 片段 + 各宿主原生 skills/commands 目录）；`host validate` 通过 · `host apply`/`host update` 粘性可用；新宿主版本文案落点纳入钉面（`release-pins.yaml` pin-11/12 **数据**新增，不改 pins 代码）。

### Fixed

- **2.2-W2（C1+C3）安全封堵**：`resolveTaskPath` 层**一处收口**——拒 target 外绝对路径 + 相对路径解析后归卡 target 内（含 `..` 逃逸拒止）+ `resolveTarget` git-root 归属校验；拒止报错含迁移指引（相对路径写法）· exit 1（D-W2-ABS-PATH-UX）；stdout/stderr 目标路径打印改**相对输出**（复用 `toRel`）。负向测试：/etc/hosts 类绝对路径 · `..` 逃逸 · 非 git 仓 target · stdout 无绝对目标路径断言。

### Changed

- **2.2-W7（E1+C7）工程健康小清理（零行为变更）**：`HARNESS_META_HEADING` 单一常量替换 4 文件 18 处字面量（模板插值保输出字节等价）；dest 白名单（`.coding-kit` · `.dsh/coding-kit`）显式化为常量集统一消费（init / host apply / 写盘拒判同源），`.cyning-harness` 显式排除并注释「legacy 只读探测」。

### Docs

- W1–W7 七 task 全 CLOSE（`docs/tasks/done/` · 459/459 测试绿）；`docs/spec/README.md` `2_2-closed-loop-start` 行转 IMPLEMENTED（2.2.0 已 published）。
- pins 首次实战（本 bump）：7 钉面偏差一键 `pins fix --yes` 对齐；发现同文件双钉面（pin-11/12）单次运行串行写互相覆盖缺陷，二跑幂等收敛（候选债项 · 留痕 `task_2_2_closed_loop_w8_release_prep`）。

## [2.1.3] - 2026-09-10

> 主题：**patch** —— 2.1.2 改名收口 **残余修复**（README 对齐 · 负向断言防恒真 · **发布溯源自动化**）。  
> 说明：用户口称「2.1.2.1」；npm/semver 仅三段 → 正式版号 **`2.1.3`**。  
>
> **发布状态**：**已 published** · tag **`v2.1.3`** ↔ `spec-wave@2.1.3`（人 · 2026-09-11 核验 `latest=2.1.3`）。

### Fixed

- **改名收尾**：README 双语 `check` 迁移示例改为 `@cyning/harness X → spec-wave Y`（对齐 CLI）。
- **测钉**：`skills --help` 负向断言改钉 `SpecWave CLI`（防改名后恒真）；根 `--help` 正向断言现名头。
- **发布溯源测**：`test/release-tag-identity.test.ts` 校验 `git tag v<version>` 的 `package.json#name/#version`；CI checkout `fetch-tags`。

## [2.1.2] - 2026-09-10

> 主题：**patch** —— SpecWave **改名收口**（身份面 · 迁移链切断 · 对外文案 · `init --yes` · **tag↔npm 可溯源**）。  
> 规划：[`docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md`](docs/roadmap/PLAN_2_1_2_rename_closeout_v1_zh.md) · SPEC：[`docs/spec/2_1_2-rename-closeout/`](docs/spec/2_1_2-rename-closeout/)  
>
> **发布状态**：**已 published** · `HG-PUBLISH` / `HG-DEPRECATE-HARNESS=approved` · tag **`v2.1.2`** ↔ `spec-wave@2.1.2`。

### Changed

- **W1 身份面**：CLI help 首行 / directory·status 自报名 **SpecWave** · `spec-wave`；`MIGRATION.md` 终点直达 `spec-wave@2.1.2`；切断以废弃中间包为终点的链式叙事。
- **W2 对外文案**：assets / README 双语 / AGENTS dogfood 钉点与审查必清清单对齐 `spec-wave`。
- **W3 init `--yes`**：`--yes` 且无 `--tools` → **exit 1**（禁止读 stdin，即使 PTY/`isTTY`）；无 `--yes` 的 TTY 询问与真非 TTY exit 1 行为不变。
- **W4 溯源钉点**：`package.json` / ontology / discipline / README 钉 **`2.1.2`**；建立 `v2.1.2` ↔ `spec-wave@2.1.2` **同 commit** 发版目标（人 tag + publish）。

### Docs

- **2.1.1 双身份史实**（保留不动）：git tag `v2.1.1` → 改名前 `dsh-coding-kit` 身份；npm `spec-wave@2.1.1` → 改名后身份。**消费者请以 `2.1.2+` 为可溯源钉点**（勿 force-retag `v2.1.1`）。
- ACCEPTANCE 草稿：[`docs/roadmap/ACCEPTANCE_2_1_2_rename_closeout_2_1_2_zh.md`](docs/roadmap/ACCEPTANCE_2_1_2_rename_closeout_2_1_2_zh.md)（publish 相关 **pending**）。
- 人 checklist：`RELEASING.md` / 上列 ACCEPTANCE（`git tag v2.1.2` · `npm publish` · `@cyning/harness` deprecate 文案改指 `spec-wave`）。

### SpecWave · `spec-wave@2.1.1` published · GitHub `SpecWave`（史实 · 前一发）

> **发布状态**：**已** npm 发版 `spec-wave@2.1.1`；旧包 `dsh-coding-kit` **已 deprecate**（文案指向 `spec-wave`）。  
> GitHub：**`Cyning12/SpecWave`**（`dsh-coding-kit` / `SpecGate` → 301）。  
> 规划：[`docs/roadmap/PLAN_rename_specgate_v1_zh.md`](docs/roadmap/PLAN_rename_specgate_v1_zh.md)  
> **注**：见上节 —— tag `v2.1.1` 与 npm `spec-wave@2.1.1` **包身份不完全同 commit**；以 **2.1.2** 重建可溯源绑定。

#### Changed

- **W1 包身份**：`package.json` name=`spec-wave`；三 bin `spec-wave` + `specgate` + `dsh-coding-kit`。
- **npm 改签**：裸 `specgate` E403 → **`spec-wave`**。
- **产品/仓**：文案 **SpecWave**；GitHub `SpecGate` → **`SpecWave`**（About / README / package repository 字段已同步）。

#### Docs

- **W2–W4**：叙事 → SpecWave / `npx spec-wave`；refresh A5–A8；publish + deprecate 完成。

## [2.1.1] - 2026-09-10

> 主题：**patch** —— host tools **安装/更新 UX**；`init` 询问 IDE/宿主（**对齐** OpenSpec）；粘性选型；`host update` 缺省方案 A。  
> 规划：[`docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md`](docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md) · SPEC：[`docs/spec/2_1_1-host-tools-ux/`](docs/spec/2_1_1-host-tools-ux/)  
>
> **发布状态**：**已 npm 发版**（`latest=2.1.1` · 2026-09-10 人执行 publish · tag `v2.1.1` · `HG-PUBLISH=approved`）。

### Added

- **W1 sticky / `--tools all`**：`host apply|update --yes` 成功写盘后写入 `.coding-kit/host-tools.json`（`host_ids` + `profile`）；`--tools all` = 适配表全部 host_id；dry-run 不写粘性
- **W3 init `--tools` / 交互选宿主**：`init [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt]`；非 TTY 无 `--tools` → exit 1（对齐 OpenSpec）；TTY 无 `--tools` → 询问（多选 / all / none）；`tools≠none` 且未 `--no-host-adapt` → 同进程 `host apply` + 写粘性；`--tools none` 只做过程根；`--no-host-adapt` **不** apply **亦不**写粘性（freeze：避免「记住了却未物化」）

### Changed

- **BREAKING（小）· `host update` 缺省（W2 · 方案 A）**：相对 **2.1.0**「省略 `--tools` = 适配表全量」→ 解析序 **CLI `--tools`（含 `all`）→ 粘性 `host_ids` → 否则 exit 1**（提示先 `apply`/`init` 或传 `--tools`/`all`）。有粘性时 `host update --yes`（无 `--tools`）**只**刷粘性列表。`host apply` 仍须显式 `--tools`。
- **BREAKING（小）· `init` 非交互须 `--tools`（W3）**：相对此前 `init --yes` 即可写 manifest → CI/非 TTY 须显式 `--tools all|none|LIST`（推荐过程根-only：`--tools none`）

### Docs

- **完整改写** [`assets/ide/host-adapt/README.md`](assets/ide/host-adapt/README.md)（CLI · 粘性 · 解析序 A · `init --tools` · dogfood；删除 2.1.0「无参=全表」与预告脚注）
- 仓根 README 双文件 / 录屏清单 / Demo：升包后 `host update --yes` · `init --tools` 选型一句；F5 钉点 `2.1.1`
- （publish 后）过程档确认 registry `latest=2.1.1`；验收 [`docs/roadmap/ACCEPTANCE_2_1_1_host_tools_ux_2_1_1_zh.md`](docs/roadmap/ACCEPTANCE_2_1_1_host_tools_ux_2_1_1_zh.md)；根 README「一包多宿主」补全 2.1.1 UX 表

## [2.1.0] - 2026-09-10

> 主题：**minor** —— 多平台 **技能（Skills）+ 编排（Commands）** parity（Cursor / Claude Code / DSH）；在 2.0 F6 管道之上补发现性与 UX。
>
> **发布状态**：**已 npm 发版**（`latest=2.1.0` · 2026-09-10 人执行 publish · tag `v2.1.0`）。

### Added

- **W1 Skills parity**：`host apply --tools cursor,claude,dsh --profile core` 三方 skills 六条 harness 断言；录屏 `/h` 口径；默认仍跳过 30/40
- **W2 Commands UX**：Claude `kit/<verb>.md` → `/kit:verb`；Cursor frontmatter `name`/`description`；旧扁平 Claude 文件迁移策略
- **W3 DSH 编排（B-DSH-ORCH=B）**：core 编排意图写入 `.dsh/skills/kit-*`（`/` 可发现）；**不**创建 `.dsh/commands/`
- **W4 expanded**：`--profile expanded` 物化 `kit-hat-*` 等薄壳；默认 `core` 不变；`host update` conflict / `--force` 与 2.0 一致

### Docs

- README 双文件「一包多宿主」补 2.1（Claude `/kit:` · DSH kit skills · `--profile expanded`）
- 录屏清单 / `05` Demo 包钉对齐 `2.1.0`
- 规划 / SPEC：`docs/roadmap/PLAN_2_1_skills_orchestration_v1_zh.md` · `docs/spec/2_1-skills-orchestration/`
- F5=B 钉点随包升至 `2.1.0`
- （publish 后）过程档确认 registry `latest=2.1.0`；验收 [`docs/roadmap/ACCEPTANCE_2_1_skills_orch_2_1_0_zh.md`](docs/roadmap/ACCEPTANCE_2_1_skills_orch_2_1_0_zh.md)

## [2.0.2] - 2026-09-10

> 主题：**patch** —— README 首屏补「一包多宿主」（Cursor + Claude Code + DSH）+ 录屏对照清单；**无产品行为变更**。
>
> **发布状态**：**已 npm 发版**（`latest=2.0.2` · 2026-09-10 人执行 publish · tag `v2.0.2`）。

### Docs

- README 双文件：入口表含 Claude Code；新增 **Multi-host / 一包多宿主** 节（落点表 + `host apply` 最短路径）
- 录屏清单：`docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md`
- `assets/ide/host-adapt/README.md` 扩为完整表面矩阵（always_on / commands / skills）
- F5=B 钉点随包升至 `2.0.2`

## [2.0.1] - 2026-09-10

> 主题：**patch** —— `2.0.0` 人 publish 后过程档归档回填 + F5 钉点随包；**无产品行为变更**。
>
> **发布状态**：**已 npm 发版**（`latest=2.0.1` · 2026-09-10 人执行 publish · tag `v2.0.1`）。

### Docs

- 发版后回填：`2.0.0` 已 npm 发版（`HG-PUBLISH=approved`）；W0–W5 / `04` §W5 人 publish 勾选；PLAN / SPEC README 归档
- 验收归档：`docs/roadmap/ACCEPTANCE_2x_host_adapt_2_0_0_zh.md`
- MIGRATION / RELEASING：「最近一次发版」钉 `2.0.0` published；preparing `2.0.1`
- F5=B 钉点随包升至 `2.0.1`（ontology / discipline / README）
- （publish 后）过程档确认 registry `latest=2.0.1`

## [2.0.0] - 2026-09-10

> 主题：**F6 宿主适配** —— `host validate` / `host apply` / `host update` · U-01 契约嗅探；Cursor + Claude + DSH 三角物化。
>
> **发布状态**：**已 npm 发版**（`latest=2.0.0` · 2026-09-10 人执行 publish · tag `v2.0.0`）。

### Added

- **`host validate`**：校验 `assets/ide/host-adapt/` 声明式宿主适配表（schema + MVP 示例；S2 `target`/`target_dir` → exit 2）
- **`host apply`**：`--tools cursor,claude --profile core` 物化 always_on + core commands（默认 dry-run；`--yes` 写盘；S2 拒；local 块不覆写；覆写先备份）
- **`host update`**：刷新产品 commands/skills（默认 dry-run；conflict 不覆盖；`--force` 显式覆盖并备份；跳过 30/40）；`host apply` W3 起同步物化 skills
- **U-01**：`host apply`/`host update` 嗅探适配表 version 与可选 `@deepseek-ai/dsh-tools` peer；不匹配 → exit 2 零写入（`--json` 含 `contract.status`）；`--tools dsh` 允许 commands=[] 且不写 kit-* slash

### Docs

- **2.x F6 规划签收**：`HG-NEXT-2X` / `HG-SPEC-SIGNOFF` approved；`docs/spec/2x-host-adapt/` signed；拆 W1–W5 tasks（实现仍须各波 `HG-AUDIT-R1`）
- F5=B 钉点随包升至 `2.0.0`（ontology / discipline / README）
- （publish 后）过程档确认 registry `latest=2.0.0`；系列闸 `HG-PUBLISH=approved`

## [1.12.1] - 2026-09-10

> 主题：**patch** —— RELEASING checklist 顺序修正（`npm view` 仅在 ⑨）+ 发版后过程档回填入 npm 包；**无产品行为变更**。
>
> **发布状态**：**已 npm 发版**（`latest=1.12.1` · 2026-09-10 人执行 publish · tag `v1.12.1`）。

### Docs

- 发版后回填：`1.12.0` 已 npm 发版；`@cyning/harness` 已 deprecate（`MIGRATION.md` · RELEASING · 系列闸）
- RELEASING：禁止在 ⑨ 之前提前 `npm view`；「最近一次发版」钉 `1.12.1`
- F5=B 钉点随包升至 `1.12.1`（ontology / discipline / README）
- （publish 后）过程档确认 registry `latest=1.12.1`；1.x **CLOSED** → 2.x 规划见 `docs/roadmap/PLAN_2x_host_adapt_v1_zh.md`

## [1.12.0] - 2026-09-10

> 主题：**1.x 收口** —— EOS 提案日历 · 全量测稳/dogfood · 本体论浅落地 · F6 宿主落点预备清单；发版职责仍为 **Agent 可 bump / 人仅 publish**。
>
> **发布状态**：**已 npm 发版**（`latest=1.12.0` · 2026-09-10 人执行 publish · tag `v1.12.0`）。  
> **旧包**：同日 **人**执行 `npm deprecate @cyning/harness`（`HG-EOS-DATE=approved`）。
>
> **消费者提示（置顶）**：
>
> - 过程落盘根仍为 **`.coding-kit/`**；legacy `.cyning-harness/` 只读不删（同 1.11）。
> - 安装 `@cyning/harness` 会收到 deprecate 警告；请钉 `dsh-coding-kit@1.12.0` 并 `npx dsh-coding-kit upgrade --yes`（见 `MIGRATION.md`）。
> - 本体论：浅测 + `docs/ontology/` 投影；**无**新 `ontology-check` CLI。

### Added

- `test/ontology-shallow.test.ts`：ontology 结构 / ONTO- / `product_semver` 浅校验（O1）
- `docs/ontology/CURRENT_CAPABILITY.md` · `DISCIPLINE_ALIGNMENT.md`（O2/O3）
- `docs/spec/1x-closeout/` 系列 + W1–W4 tasks/audits/invokes
- `docs/spec/1x-closeout/host_landing_inventory_v1.md`（P6-prep）
- `docs/releases/06_1_11_to_1_12.md`（D1）

### Changed

- `MIGRATION.md`：EOS **提案**日历（announce 2026-09-10 · 新注册截止 2026-10-10 · EOS 2026-12-31）；deprecate **仅人**
- `delivery/promotion/`：标 1.x MVP DONE + 链 `PLAN_post_1.11`；1.12 收口 DONE（待人 publish）
- F5=B 钉点随包升至 `1.12.0`（ontology / discipline / README）

### Docs

- [`docs/roadmap/PLAN_post_1.11_zh.md`](docs/roadmap/PLAN_post_1.11_zh.md)（已签「先 1.12」）
- RELEASING「最近一次发版」：`latest=1.12.0` · `@cyning/harness` deprecated

## [1.11.0] - 2026-09-09

> 主题：**1.x MVP 内部一致性收敛（F1–F5）** —— S2 真值源 · P0 门禁语义 · `.coding-kit` 落盘 · 迁移文档面 · F5 方案 B 版本钉；发版职责改为 **Agent 可 bump / 人仅 publish**。
>
> **发布状态**：**已 npm 发版**（`latest=1.11.0` · 2026-09-09 人执行 publish · PR [#30](https://github.com/Cyning12/SpecWave/pull/30) · tag `v1.11.0`）。
>
> **消费者提示（置顶）**：
>
> - **过程落盘根改为 `.coding-kit/`**：`upgrade --yes` 读旧 `.cyning-harness/manifest.json` 时写入新路径；旧目录只读保留、不删除。详见 `MIGRATION.md`。
> - **仓根 `SPEC.md` 为历史 epic（archived）**：不再表示现行包版本；现行钉点见 ontology / discipline / README。
> - **未**执行 `@cyning/harness` 的 `npm deprecate`（待 `HG-EOS-DATE`）。

### Changed

- **F1 / X7**：S2 过程域前缀收敛为 `cli-shared` 唯一真值源 `S2_TRUTH_PREFIXES` + `isS2RelPath` / `isS2AbsPath`；`index` / `refresh-ide-blocks` / `graph-hgm` / `skills` 删除本地硬编码列表（保护面取四锚点并集，含 legacy 裸前缀）
- **F2 / R3**：P0 门禁语义成文 —— README 中英 + `--help` Exit codes：`0` 放行 / `1` 用法 / `2` 门禁阻断（failClosed）；分层强制为文档级（1.x 无云策略引擎）
- **F4 / X11（方案 B）**：过程落盘新写根统一为 `.coding-kit/`（manifest / events / snapshot / invoke_index / local.json / refresh 备份）；`.cyning-harness/` 只读探测与 upgrade 源，**不删除**；`upgrade`/`init` 写新路径
- **F3 文档面**：新增根 `MIGRATION.md`（最小路径 · 布局 · EOS 提案占位 · deprecate 草稿仅人）；README 双文件迁移/备份路径对齐；**未**执行 `npm deprecate`（`HG-EOS-DATE` pending）
- **F5 / X6（方案 B）**：废除仓根 `SPEC.md` 版本钉检查（标 **ARCHIVED EPIC**）；现行钉点 = `ontology#product_semver` + `discipline-coverage#as_of_package_version` + README `dsh-coding-kit@x.y.z`；`test/version-pins-f5.test.ts` + RELEASING ④ 对齐；随 `npm test` / `prepublishOnly`
- **RELEASING 职责**：维护 Agent **默认可**执行 ①–⑦ 与 `npm version`/tag；**⑧ `npm publish` 仍仅人**；deprecate 仍仅人

### Tests

- 新增 `test/s2-truth-source.test.ts`（矩阵 + 源码唯一性扫描）
- 新增 `test/gate-semantics.test.ts`（exit 矩阵 + README 契约关键字）
- 新增 `test/layout-scheme-b.test.ts`；CLI 相关测写路径期望对齐 `.coding-kit`
- 新增 `test/version-pins-f5.test.ts`（F5=B 钉点集合）

## [1.10.0] - 2026-08-31

> 主题：**帽 System / Re-anchor + 00 delegate-only Skill**——帽级短身份碎片、默认可分发 Skill、Host×npx Capability 文档。
>
> **消费者提示（置顶）**：
>
> - **新 prompts 须 `sync prompts --yes`**：`FRAGMENT_hat_reanchor_v1_zh.md`、`FRAGMENT_00_delegate_only_v1_zh.md` 纳入 Starter 白名单。`upgrade` **不**自动拷 prompts（成功提示行已点名这两文件）。
> - **新默认 Skills**：`harness-hat-reanchor`、`harness-00-delegate-only`（短片段）；**00 全文仍不进默认**。消费仓 `skills install` 后可用。30/40 仍不进默认（T1 前）。
> - **三分不可互替**：System/Re-anchor = 短身份；prompts 全文 = 换帽加载；`verify` = 机械闸。
> - **偶发亲自落地 = 违规**：自称 00 且已有 SPEC/task 时不得改 `app/` / `src/`；须用户例外句。本波 **不**把「00 窗 app/ diff」做成硬 BLOCK。
> - **Host**：Skills ≠ 全覆盖；`verify`/`task` 须 Capability 白名单 + Policy 默认关。

### Added

- `FRAGMENT_hat_reanchor_v1_zh.md` / `FRAGMENT_00_delegate_only_v1_zh.md`（帽级 System / Re-anchor 短碎片 · 随 `sync prompts` 同步）
- 默认可分发 Skill：`harness-hat-reanchor` / `harness-00-delegate-only`（`skills build` 从 FRAGMENT frontmatter 生成）
- `eval/hat_identity_00_delegate/`：00 + 已有 task → 须含委派句的**文档 fixture**（仓内无 T1 评测运行器；机械评分 follow-up）

### Changed

- `SYNC_PROMPT_FILES`：Starter prompts 9 → **11** 文件（+ 上述两 FRAGMENT）+ `TASK_TEMPLATE` 共 12 项
- `loadSkillPrompts`：`FRAGMENT_*` 仅当带合法 skill `name` 才入默认分发；00 全文 / 无 frontmatter 的 GATE_VERIFY 仍排除
- `00-orchestrator.md`：加「长对话须 re-anchor」一句并链到两 FRAGMENT（不改默认行为表语义）
- `upgrade` 成功提示行点名新 FRAGMENT

### Docs

- `assets/harness/prompts/README.md`：钉死 System/Re-anchor · prompts 全文 · verify 三分不可互替；偶发亲自落地 = 违规
- README 双文件：新增 **Host 使用 coding-kit** 节（Capability 白名单 · Policy 默认关 · Skills ≠ 全覆盖）

## [1.9.2] - 2026-08-28

> 主题：**compile / export `generated_at` 幂等**——yaml 源内容戳，tech-graph CI 去掉 `-I`。
>
> **消费者提示（置顶）**：
>
> - **无新子命令**。`upgrade` 后 CLI 用法与 1.9.1 相同。
> - **`generated_at` 不再是 ISO 时间**：`graph yaml compile` / `export` 写 `sha256-<16hex>`（yaml 源 UTF-8 的 SHA-256 前 16 hex）。同字节重编译 / export 幂等。若脚本把该字段当日期解析，须改。升级后请重跑 `graph yaml compile --all`（md frontmatter 会从旧 ISO 变成内容戳）。
> - HGM snapshot / `sync index` 的时钟 `generated_at` **未改**。

### Changed

- `graph yaml compile` / `export`：`generated_at` 改为 yaml 源 UTF-8 的 SHA-256 前 16 hex（形态 `sha256-<hex>`），同输入字节幂等；不再写 wall-clock ISO。
- `.github/workflows/tech-graph.yml`：裸 `git diff --exit-code -- docs/_tech_graph/*.md`（去掉 `-I '^generated_at:'`）。仍不对 `shared/graph.json` 做 git diff（`check` 比对切片、不比 stamp）。

### Docs

- `99_mermaid_protocol` §0 补 `generated_at` 幂等契约；`02_version` 记 1.9.2。

## [1.9.1] - 2026-08-28

> 主题：**self-tech-graph 收口**——kit 源码仓自图谱 dogfood、tech-graph CI、inventory 迁回 reference。
>
> **消费者提示（置顶）**：
>
> - **本版无新 CLI 行为**（docs / CI / 仓内图谱）。消费仓 `upgrade` 后命令面不变。
> - **`docs/` 不随 npm 包发布**：kit 自图只在源码仓 `docs/_tech_graph/`（https://github.com/Cyning12/SpecWave/tree/main/docs/_tech_graph），不在 tarball 内。

### Docs

- kit 源码仓 `docs/_tech_graph/` dogfood 互链（`assets/graph/templates/README.md` · `POINTER_ONBOARDING` · 根 README en/zh-CN）；**`docs/` 不随 npm 包发布**
- `.github/workflows/tech-graph.yml` 入仓（本仓 bin `graph yaml compile` / `check`）
- `00_inventory` 四文件迁回 `docs/spec/self-tech-graph/reference/`（历史锚 1.2.2）+ `POINTERS.md`

## [1.9.0] - 2026-08-27

> 主题：**sync prompts 命令补齐**（ops-desk-api 1.8.0 复发反馈 · 唯一残余摩擦）——`sync prompts` 子命令（SHA-256 三分 · dry-run 默认 · `--yes`/`--force`/`--json`）· `upgrade` 只读提示行 · 测试 297 → 310。
>
> **消费者提示（置顶）**：
>
> - **新命令 `sync prompts`（兑现 1.7.1/1.8.0 CHANGELOG 滞后承诺）**：`npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]` 将包内 Starter prompts（9 文件）与 `TASK_TEMPLATE.md` 同步到目标仓 `docs/harness/prompts/` 与 `docs/harness/templates/`。默认 dry-run（三分清单：skip/add/conflict · 零写入）；`--yes` 写入 add 项；本地已改文件列为 conflict 且**默认不覆盖**（`--force` 显式覆盖）。前置须已有 `.cyning-harness/manifest.json`。1.7.1 与 1.8.0 消费者提示中的「sync prompts 后生效」此前无对应命令——本版补齐。
> - **`upgrade` 新增只读提示行**：manifest 写入成功后提示运行 `sync prompts --yes`（不改 upgrade 写面）。

### Added

- `sync prompts` 子命令：Starter 白名单同步（SHA-256 三分 · dry-run 默认 · `--yes`/`--force`/`--json`）；`src/cli-sync-prompts.ts`

### Changed

- `upgrade`：stdout 追加 prompts 未自动同步提示行
- CLI usage / README（en/zh-CN）：`sync prompts` 说明

## [1.8.0] - 2026-08-27

> 主题：**wiki_delta 链路缝隙收口**（ops-desk-api FEEDBACK K1–K7 · agent-host-plan CI 复盘）——`lint-wiki-delta` 错节诊断码（K1）· `task lint` E8 早拦（K2）· `verify --with-wiki-lint` 双轨对齐（K3）· `task close` done 快照 + `--json`（K5）· Starter prompts/TASK_TEMPLATE 与 CI 对齐（K4/K6/K7）。四 task 串行交付 · 20 审 R1×4/R2×2 · 50 复检全 PASS · 测试 269 → 297。
>
> **消费者提示（置顶）**：
>
> - **`task lint --file` 新增 E8（存量仓注意）**：`## Harness 元信息` 节在但缺 `wiki_delta` 行 → **error，无 draft 豁免**（与 close 闸 `close_wiki_delta` 对齐 · 仅查存在性）。存量仓 draft task 将新增拦截——在元信息表补 `| **wiki_delta** | \`path|none|n/a\` |` 行即过。
> - **`task lint-wiki-delta` 新诊断码 `wiki_delta_wrong_section`**：`wiki_delta` 行写在 `## Harness 元信息` 之外的节（如 `## Harness`）时**替代** `wiki_delta_missing`（不双报），detail 含节名/行号并提示「须在 `## Harness 元信息` 表格内」。诊断非兼容：`parseHarnessMeta` 权威节名不变。
> - **`verify` 新旗标 `--with-wiki-lint`（可选 · 非破坏）**：在既有检查之上追加 `lint-wiki-delta`（默认档 · `scope=all` · `--task`/`--spec` 同生效）；有缺口时 BLOCKED 并打印与 PR CI 逐字一致的复跑命令 `npx --yes dsh-coding-kit task lint-wiki-delta --target .`。无旗标行为与 1.7.1 逐字一致。
> - **`task close --yes` PASS 后 stdout 新增 done 片段快照块**：归档成功后追加 `done_snapshot` 块（归档路径 + 归档文件 `## Harness 元信息` 节摘录 + 「禁止手写 done · 以此快照为格式真值」提示行）；`CLOSE: PASS` 文案不变、dry-run（`CLOSE: READY`）输出与 1.7.1 逐字一致。依赖「PASS 后无追加输出」精确匹配的脚本（极不可能但存在）需适配。
> - **Starter prompts / TASK_TEMPLATE 与 CI 对齐（K4/K6/K7）**：00 默认行为表增 bulk-split 后 `lint-wiki-delta` 早检行；TASK_TEMPLATE 验收节增默认两行（仓 CI 全量命令 + `lint-wiki-delta`）；40-self-check 补 CI 全量兜底；20-task-audit 增行为变更旧测 grep 提醒。条文随包发布，消费仓 **`upgrade` / sync prompts 后生效**；未 sync 的仓仍用旧条文（预期，非缺陷）。

### Added

- `lint-wiki-delta`：错节诊断码 `wiki_delta_wrong_section`（默认档与 `--json` 同码同文案 · `--strict` 既有检查语义不变）
- `task lint`：E8 规则（`wiki_delta` 存在性早拦 · 错节场景文案指向正确节名）
- `src/cli-shared.ts`：`findWikiDeltaOutsideMetaSection` helper（两 lint 同源）
- `verify`：`--with-wiki-lint` 旗标（复用 `lintWikiDeltaMissing` 导出 · 默认档 `scope=all` 与 CI sample 对齐 · `--task`/`--spec` 同生效）；`--json` 增 `wiki_lint{ok,issues,scanned}`；target 无 `docs/tasks/` 时 scanned:0 不误 BLOCKED
- `task close`：PASS 分支 stdout 追加 done 片段快照块（归档路径 + `## Harness 元信息` 节归档真值摘录（`extractSection`）+ 禁手写提示；缺节异常态打 canonical 模板占位 + WARN 行）；新增 `--json` 旗标（PASS → `done_snapshot:{path,harness_meta_section}` · READY（dry-run 含豁免）→ `done_snapshot:null` exit 0 · BLOCKED → 非 0 仅错误面）；`src/cli-shared.ts` 新增 `buildDoneSnapshot` / `canonicalHarnessMetaSection`；快照存在性唯绑归档事件，与豁免旗标无关

### Docs

- `assets/docs/POINTER_RUNBOOK_wiki_delta.md`：新增诊断码表（含 `wiki_delta_wrong_section` 与 E8）
- CLI usage / `lint-wiki-delta --help`：诊断码说明同步
- CLI usage / `verify --help` / README（en/zh-CN）verify 节：`--with-wiki-lint` 说明；`assets/ci/samples/lint-wiki-delta.yml.example` 注释互链本地预检
- CLI usage / `TASK_USAGE`：`task close` 增 `[--json]`；`assets/harness/prompts/FRAGMENT_30_invoke_block_v1_zh.md` 补「归档仅走 `task close --yes`；格式真值 = close 成功快照」
- Starter prompts / `TASK_TEMPLATE.md` 与 CI 对齐（K4/K6/K7）：`00-orchestrator.md` 默认行为表增 bulk-split 后 `lint-wiki-delta` 早检行；`10-task-requirements.md` 补批量拆 task 预填 `## Harness 元信息` + `wiki_delta` 与 `--scope all|active|done` 取舍；`TASK_TEMPLATE.md` 验收节增默认两行；`40-self-check.md` 补 `.github/workflows/` 全量兜底；`20-task-audit.md` checklist 增行为变更「旧测 grep 影响面」提醒；新增 `test/assets-prompts-ci-alignment.test.ts` grep 断言

## [1.7.1] - 2026-08-26

> 主题：**00 默认编排纪律入 Starter** —— 随包发布 `assets/harness/prompts/00-orchestrator.md`（最多起草第一步；中间全派子 Agent；收口 50+CLOSE；有初版则禁亲自实现）。
>
> **消费者提示（置顶）**：
>
> - **`upgrade` / sync prompts** 后用户仓 `docs/harness/prompts/` 可获得 `00-orchestrator.md`。
> - **00 仍不进默认 Agent Skills 分发**（仅 prompts 资产；skills build 忽略 `00-*.md`）。
> - CLI / CLOSE 闸行为与 **1.7.0** 相同（本版无破坏性命令变更）。

### Added

- Starter：`00-orchestrator.md`（默认行为表 + 例外句）
- `skills` 加载：忽略 `00-*.md`，避免无 frontmatter 打断 build/check

### Changed

- `assets/harness/prompts/README.md`：00 入 Starter 表

## [1.7.0] - 2026-08-26

> 主题：**doc-health · CLOSE 强绑定** —— dry-run/`PASS` 语义拆分；新增 `close_pr_merged` / `close_hub_index`；`check` 对 `docs/spec` 根级裸 SPEC WARN。试点消费者：ops-desk-api。
>
> **消费者提示（置顶）**：
>
> - **`task close` dry-run 不再打印 `CLOSE: PASS`**：无 `--yes` 时输出 **`CLOSE: READY`**；仅 `--yes` 归档成功后为 `CLOSE: PASS`（破坏性文案变更 · **不兼容**旧脚本若只匹配 PASS）。
> - **新闸 `close_pr_merged`**：默认要求关联 PR `MERGED`（`related_pr` → `gh pr view` 当前分支）；豁免：`--allow-no-pr-merge` 或 `close_pr_policy=exempt` + note。
> - **新闸 `close_hub_index`**：若存在 `docs/tasks/done/README.md`（或 harness 对称路径）则要求 Hub 含归档文件名；仓级 `.cyning-harness/local.json` `close_hub_gate: false` 可关（**缺省开**）；`--allow-no-hub` 豁免。
> - **`check`**：对 `docs/spec/SPEC-*.md` 根级裸文件打印 WARN（不挡 exit）。

### Added

- `close_pr_merged` / `close_hub_index`（lifecycle.yaml 登记 · `evalCloseGuard` · dry-run 同口径）
- `docs/spec/doc-health/` SPEC 包（签收）与试点 FEEDBACK 约定
- task 元信息草案字段：`related_pr` / `close_pr_policy` / `close_pr_exempt_note`
- 测试钩：`DSH_CLOSE_PR_STATE=MERGED|OPEN|…`（单测旁路 gh）

### Changed

- dry-run 完成态用词：`CLOSE: READY`（见上）
- prompts / TEMPLATE_invoke / TASK_done_README Hub checklist 与闸对齐

### Docs

- SPEC 布局公约：新长期 SPEC 须专属夹；历史裸文件 warn（索引表 + CLI）

## [1.6.1] - 2026-08-25

> 主题：**graph 面行为修正 · 判据收窄** —— DEF-030~033（ops-desk-api 1.5.2 实战反馈 D1/D2/D3/R6/K7）：export 保留全部 mark 边 label、graph_id 统一以 yaml 声明值为真值源（export 与 check 互认）、Mermaid class 段消费 nodes[].kind、check 跨产品线迁移判据收窄至旧包 2.x 词表。exit 码不变。
>
> **消费者提示（置顶）**：export 输出的 graph_id（`l0/00_main` → `00_main`，命名空间 → 声明值）与边 label（空 → 保留）属**修正性变更**；依赖旧 export 输出的消费方需重跑 `npx dsh-coding-kit graph yaml export`；exit 码与写盘路径不变。

### Fixed

- **DEF-030 · check 跨产品线判据收窄**（反馈 K7）：1.5.2 DEF-028 接线以 `from_version != null` 判跨产品线过宽——`from_version` 已是 kit 线版本（如 1.5.1）时，任何「manifest 高于包版本」场景都误走迁移文案。现仅当 `from_version` 属旧包产品线词表（2.x 系列，`@cyning/harness` 版本形态）时输出迁移文案；kit 线（1.x）`from_version` 回落原「manifest 版本高于包版本（可能为降级安装）」语义。exit 码不变（恒 0）。
- **DEF-031 · graph yaml export 保留边 label**（反馈 D1）：`edgeToGraphV2` 对 mark=`?>` / `~>` / `::…` / `[…]` 不再强制清空 label——拓扑协议标记作为边属性（mark/type）呈现，label 文本全量保留；`->` 与未知 mark 行为不变。
- **DEF-032 · export graph_id 声明值 + check 对齐**（反馈 D2/D3）：① export（`buildGraphPayload`）优先消费 yaml `data.graph_id` 声明值（如 `00_main`）写 graphs/nodes/edges，不再用路径命名空间 id（如 `l0/00_main`）；② `check --all` 的 graph.json 切片过滤口径与 export 输出对齐（同一声明值真值源），kit 自产根 json 与 check 互认；③ `validateGraphYaml` 禁 `/` 与路径 id 的自相矛盾按实现口径消解——声明值为唯一真值源（裸 slug），路径 id 仅作输入兼容定位（`allGraphIds` / `--graph-id`）。
- **DEF-033 · generateMermaid class 按 nodes[].kind**（反馈 R6）：class 段不再硬编码 id 白名单，改消费 `nodes[].kind`（`flow`/`struct`/`external` → `phase`/`doc`/`infra`，与 `generateNodeTable` 的 kind 读取同源）；无 `kind`（或未知 kind）时保留 id 推断作兜底（历史行为，仅供未标注 kind 的旧 yaml）。

### 消费者提示

- export 输出 id/label 变化属修正性变更：依赖旧输出（命名空间 graph_id / 空 label）的消费方需重跑 `graph yaml export`；exit 码与写盘路径不变。

## [1.6.0] - 2026-08-25

> 主题：**零未接线 · 制度固化** —— 消灭最后一个「明示未交付」命令面与最后一个未接线守卫：`verify --spec` 从 notDelivered（exit 1）改为 SPEC 审查文存在性真闸；`close_wiki_promotion` 接线后未接线残留清零；lifecycle dry-run `to_00` 的 `spec_reviews_retention` 守卫同步接线（PRD_DEF-003 后续棒）；RELEASING.md 把发版固化为九步硬 checklist（DEF-001 T5 制度化）。
>
> **消费者提示（置顶）**：
>
> - **`verify --spec` 从「本包未交付」变真闸**：缺审查文的 SPEC 现在 **BLOCKED exit 2**（此前调用方只会得到 notDelivered exit 1 提示）。使用中的消费者需注意新拦截面；过渡期可用 `--allow-no-spec-review`（或别名 `--allow-no-review`）豁免（真豁免留痕，不免除补审义务）。
> - **`task close` 新增 `close_wiki_promotion` 求值**：`experience_capture=required` 且 `wiki_delta=path` 的 task，经验节缺晋升指针将从 PASS 变 **BLOCKED exit 2**；与 `wiki_delta` 同享 `--allow-wiki-gap` 过渡豁免（真豁免留痕）。
> - **`invoke_retention_profile=full` 帽集合收窄**为旧包口径 `10,20,30,40,00,CLOSE`（去 22/50）：行为**放宽**，不破坏已齐套 task，此前因缺 22/50 被 BLOCKED 的 task 现在可通过。

### Added

- **`verify --spec FILE` 真闸**（SPEC→00 前查审查文存在性 · 语义映射旧包 @cyning/harness@2.24.0 `verifySpecTarget`/`findSpecReview`/`shouldSkipSpecAudit`）：仅查审查文存在性，不跑 gate-check / D5 / lint（与 --task 模式分离）；审查文扫描 `docs/harness/reviews` 与 `reviews/` 双路径（与 findReview 布局一致），命名兼容 `spec_<slug>_audit_R<n>_*`（推荐）/ `spec_<slug>_ACCEPT_R<n>_*` / `task_<slug>_spec_ACCEPT_R<n>_*`；slug 取元信息 `spec_slug`，回退文件名去 `SPEC[-_]` 前缀与 `_v<n>` 后缀。缺失 → `VERIFY: BLOCKED · missing spec R<n> review` exit 2；`--allow-no-spec-review`（canonical · lifecycle.yaml 登记）与 `--allow-no-review`（别名）真豁免留痕（文本 + JSON `waived[]`，与 T4 口径一致）；`bugfix` / `skip_spec_audit` 元信息豁免 → PASS。`--task` 与 `--spec` 互斥（exit 1）；`--spec` 文件不存在 → exit 1（用法错误）。
- **lifecycle dry-run `to_00` `spec_reviews_retention` 真求值**：--task 在该转移下携带待签收 SPEC 路径（与 verify --spec 同一实现源 src/cli-checks.ts `evalSpecReviewsRetention`）；缺审查文 → fail 挡（blocked exit 2），`--allow-no-spec-review` 转 warn 留痕；未接线残留仅 `close_wiki_promotion`（本波已接线 · 见 Changed 节首条）。
- **RELEASING.md 发版 checklist（DEF-001 T5 制度化）**：仓根新增 `RELEASING.md`，把「publish 前 commit + tag」写为九步硬 checklist —— ① 工作树干净且全部已提交（**禁止从未提交工作树 publish** · DEF-001 教训）② typecheck/test/build/test:lib 四门全绿 ③ CHANGELOG 版本节归拢（日期+版本号）④ 版本钉 pins 同步（README 双文件/测试/ontology/discipline-coverage）⑤ npm version + tag ⑥ PR 合并 + CI 绿（未绿禁合）⑦ `npm pack --dry-run` 核对（无 test/ 泄漏 · files 白名单）⑧ `npm publish`（仅人）⑨ publish 后 `npm view` 核验 + 过程档状态更新。README en/zh-CN 各加一行链接；`test/docs-releasing.test.ts` 钉死九步存在性/顺序/禁令。

### Changed（行为变更 · 升级必读）

- **task close `close_wiki_promotion` 真闸接线**（最后一个未接线守卫 · PRD_DEF-003 后续棒 · 语义映射旧包 @cyning/harness@2.24.0 `evaluateWikiPromotionPointer`）：`experience_capture=required` 且 `wiki_delta=path` 时，`### 经验总结` 节须含晋升指针（`coding_wiki` / `wiki_promoted:` / `Wiki:` / 与 `wiki_delta` 相同子串），缺 → `CLOSE: BLOCKED` 点名守卫 id（exit 2）；豁免与 `wiki_delta` 共用 `--allow-wiki-gap`（真豁免留痕 · 旧包同口径降旗面）。跳过口径与旧包逐字对齐：未声明 `experience_capture` / ≠required / 无 `wiki_delta`（缺字段由 `close_wiki_delta` 挡）/ `wiki_delta=none|n/a` → 不闸。`lifecycle dry-run` 同口径真求值（src/cli-checks.ts `evalCloseWikiPromotion` 单一实现源 · `evalCloseGuard` 登记）；lifecycle.yaml / 30-execute-code / discipline-coverage「未接线」标注同步转「已接线」，**未接线残留清零**（dry-run `unevaluated_count: 0`）。与旧包差异：经验节标题沿用本包既有约定 `### 经验总结`（同 evalCloseExperience 抽取口径；旧包额外兼容 Experience/经验/lessons 标题）。
- **`invoke_retention_profile=full` 帽集合修正（与旧包 2.24.0 口径校对）**：旧包 `INVOKE_RETENTION_PROFILES.full=['00','10','20','30','40','CLOSE']`（lib/task-meta.js · CHANGELOG v2.12 · USER_GUIDE 三处同源）；本包 1.4.0 Wave B 曾解释性定义为 `10,20,22,30,40,50,00,CLOSE`（多列 22/50），经校对**不一致**，已按旧包口径修正为 `10,20,30,40,00,CLOSE`。影响面：`profile=full` 的 task close / verify pre-30 不再要求 22/50 invoke 快照（**放宽**，此前因缺 22/50 被 BLOCKED 的 task 现在可通过；required 集合收窄不破坏已齐套 task）。22/50 仍是合法 hat token（显式 `required_invoke_hats` 与合并文件名照计）。
- `verify --spec` 不再是「本包未交付」exit 1：缺审查文的 SPEC 现在 **BLOCKED exit 2**（此前调用方只会得到未交付提示）。过渡期可用 `--allow-no-spec-review` 豁免（留痕，不免除补审义务）。
- 与旧包差异：① 目录布局与本包 findReview 同口径扫双路径（旧包仅 `docs/harness/reviews`）；② 旧包 `--workspace-root` 双仓根旗标本包不支持（DEF-011 fail-fast 清单既有钉死）。
- **「明示未接线 / 未交付」清单归零**：`close_wiki_promotion`（最后一个未接线守卫）与 `verify --spec`（最后一个 notDelivered 命令面）本波全部接线交付，发布物不再含任何「明示未接线 / 未交付」项；lifecycle dry-run `unevaluated_count: 0`。

## [1.5.2] - 2026-08-24

> 主题：**提示面改善 · 迁移语义与只读报告** —— DEF-028：`check` 对跨产品线迁移输出迁移语义与 upgrade 建议，不再误报降级；DEF-029：`refresh-ide-blocks` 对发现面内无 marker 文件做旧字面只读扫描并仅报告（`plain_mentions`）；README 补强 K2/K5。纯提示面改善，exit 码不变。

### Fixed

- **DEF-028 · `check` 跨产品线迁移提示**（反馈 K1）：`manifest.version` 高于包版本且 `manifest.from_version` 非 null（从旧 `@cyning/harness` 产品线迁来）时，输出「跨产品线迁移：`@cyning/harness X → dsh-coding-kit Y`（跨产品线版本号不可比）」并建议 `npx dsh-coding-kit upgrade --yes`，不再误报「可能为降级安装」；`from_version` 为 null 时保持原三向判定文案。exit 码不变（恒 0）。
- **DEF-029 · `refresh-ide-blocks` 无 marker 文件仅报告**（反馈 K4）：发现面（`AGENTS.md` / `CLAUDE.md` / `.cursor/rules/*.mdc`）内 0 product 块文件现用 A/B 组同一组正则做**只读扫描**（A4 防二刷同适用），命中入报告——人类表新增「无 marker 检出（仅报告，不刷写）」段，`--json` 新增 top-level `plain_mentions: [{path, rule, count}]` 与 `totals.plain_mentions`（schema 保持 `dsh-coding-kit/refresh-ide-blocks-report@1`，向后兼容增量）。**绝不改写**这些文件（写盘路径结构上不含它们），dry-run 与 `--yes` 均报告，exit 码与 preflight fail-fast 语义不变。

### Docs

- **README 双语补强**（反馈 K2/K5）：`refresh-ide-blocks` 节注明 preflight 脏树判定为 `git status --porcelain` 语义（untracked 文件计入，`--yes` 前请先 commit 或 `git stash -u`）；备份节建议消费者将 `.cyning-harness/backups/` 加入 `.gitignore`（备份为本机回滚用，不入库）。

### 消费者提示

- 无强制动作：DEF-028 / DEF-029 均为提示面改善，exit 码与写盘语义不变；`--json` 消费者可忽略新增 `plain_mentions` 字段（向后兼容增量）。

## [1.5.1] - 2026-08-24

> 主题：**文档交付入包** —— 默认 README 英文化（中文原版保留为 README.zh-CN.md）+ docs/releases/ 四版连发成效系列档（英文 6 篇）。纯文档发布，无任何代码与行为变更，消费者无需动作。

### Changed

- **默认 README 改为全英文**（PR #9）：README.md 现为英文版；原中文版完整保留为 README.zh-CN.md，两文件顶部互置语言切换链接；GitHub topics 节按仓库实际 topics 修正；两个 README 均随 npm 包发布。
- 无行为变更：CLI / 插件 / 闸语义与 1.5.0 完全一致，升级无需任何消费者动作。

### Added

- **docs/releases/ 四版连发成效系列档**（PR #10，英文 6 篇）：系列索引（README）+ 执行总览（01 executive summary）、升级前后对比（02 before/after）、缺陷与债台账（03 defects & debt ledger）、工程方法（04 engineering method）、消费者升级指南（05 upgrade guide）。

## [1.5.0] - 2026-08-24

> 主题：**存量 IDE 块刷写 + D5 硬化** —— R-07 落地 `refresh-ide-blocks` 子命令（dry-run 默认 / `--yes` 写盘 / 幂等 / 备份 5 代）；D5 测试制品探测 WARN 过渡兑现 1.3.0 承诺硬化为 FAIL（exit 2）。

### Changed（行为变更 · 升级必读）

> **消费者迁移提示（置顶）**：存量消费者仓 IDE marker 块（`<!-- cyning-harness:begin/end -->`）内若滞留旧 `npx @cyning/harness` 命令字面，可执行 `npx dsh-coding-kit refresh-ide-blocks`（默认 **dry-run 零写入**）一键查看差异，确认后加 `--yes` 刷写（A1–A4 自动映射；写盘前自动备份、保留 5 代；幂等可重跑）。

- **D5 WARN 过渡硬化为 FAIL**（DEF-014 过渡结束，兑现 1.3.0 承诺）：`test_strategy=required` 时仅命中旧启发式（pyproject.toml / setup.py / 无 test 步骤的 workflow）的仓，verify / audit 由 WARN exit 0 改为 **FAIL exit 2**；旧启发式探测代码（`hasTestArtifactsLegacy`）删除。**迁移**：补真实测试制品（`tests/` / `*_test.py` / `*.test.ts` / 含 test 步骤的 CI）即可恢复 PASS。

### Added

- **`refresh-ide-blocks` 子命令**（R-07 · SPEC: PRD_R07_ide_block_rewrite.md）：刷写存量消费者仓 IDE marker 块（`<!-- cyning-harness:begin/end -->`）内滞留的旧 `npx @cyning/harness` 命令字面。默认 dry-run 零写入，`--yes` 才写盘；支持 `--target` / `--json`（schema `dsh-coding-kit/refresh-ide-blocks-report@1`）；映射表 A1–A4 自动替换（钉版丢弃记 `dropped_pin`、裸 `harness skills build|check` 防二刷）、B1–B5 仅报告「需人工」；preflight fail-fast（git 脏树 / MIXED 新旧混杂 / MALFORMED 畸形块 / S2 断言闸）exit 2 零写入；写盘前备份至 `.cyning-harness/backups/refresh-ide-blocks/`（保留 5 代），幂等。marker 块语法规范与 A/B 映射表已入 README。
- **`upgrade` 内嵌只读提示行**：upgrade 完成后若检测到 IDE 块内旧字面，追加一行 `refresh-ide-blocks` dry-run 提示（不写 IDE 文件、不改 upgrade exit 码）。
- **`src/cli-refresh-ide-blocks.ts` 模块**：块解析器 + 映射表 + 拒写闸 + 子命令接线。
- **新增测试**：`test/cli-refresh-ide-blocks.test.ts` —— M01–M19 子命令矩阵 + U1–U12 解析器单测，含 T5 文档 grep 断言（README 子命令节 / 映射表 / adapters 声明）。

## [1.4.0] - 2026-08-24

> 主题：**闸接线 + 债闭环** —— DEF-003 阶段二落地：verify / task close / lifecycle dry-run 的「恒过 / 恒 unevaluated」守卫全部改为真求值，并配真豁免旗标（豁免留痕）；R-08 实证钉死 DSH skills 扫描事实。

### Changed（行为变更 · 升级必读）

> **消费者迁移提示（置顶）**：存量仓中缺 R<n> 审查文、pre-30 invoke 帽制品或 KPI 制品的 task，`verify` / `task close` 将从 PASS 变 **BLOCKED**（exit 2）；过渡期请用下述 `--allow-*` 豁免旗标（真豁免 · 留痕，不免除补落义务）。

- **`verify` 新增 R<n> 审查文硬闸**（DEF-003 T4）：task 缺对应 reviews 制品 → BLOCKED exit 2；`--allow-no-review` 为真豁免并留痕。
- **`verify` 新增 pre-30 invoke hats 硬闸**（DEF-003 T5）：task 声明帽与 {10, 20, 00} 有交集但无 invoke 制品 → BLOCKED；`--allow-invoke-gap` 真豁免并留痕。
- **`task close` 六守卫真求值**（DEF-003 T6）：close_invoke / close_review / close_graph_delta / close_kpi / close_experience / close_wiki_delta 全部真接线；豁免旗标 `--allow-invoke-gap` / `--allow-no-review` / `--allow-kpi-gap` / `--allow-experience-gap` / `--allow-wiki-gap`。
- **`lifecycle` dry-run 守卫真求值**（DEF-003 T3）：由恒 unevaluated 改为真实评估；未接线守卫在输出中明示，不冒充已评估。
- **`findReview` / `runTestCheck` / `lintTaskFile` 收敛** 至 `src/cli-checks.ts` 单一实现源。
- **README skills 扫描免责 → 「已验证扫描」**（R-08 实证，对照 DSH 上游 deepseek-harness@141eb6f）：project `.dsh/skills` rank 100 · user `~/.dsh/skills` rank 400。

### Added

- **`src/cli-checks.ts`**：checks 单一实现源（review / invoke / lint / KPI / D5）。
- **新增测试**：`test/cli-verify-review.test.ts`、`test/cli-verify-invoke-hats.test.ts`、`test/cli-lifecycle-guards.test.ts`、`test/cli-task-close-guards.test.ts`。
- **豁免旗标**：`--allow-no-review`、`--allow-invoke-gap`（verify）；`--allow-kpi-gap` / `--allow-experience-gap` / `--allow-wiki-gap`（task close 新增）。

### Known limitations

- `close_wiki_promotion` 与 `spec_reviews_retention`（`verify --spec`）**仍未接线**，发布物保持明示，不冒充已接线。
- KPI 四维评分为启发式解析（`Task_KPI%: N` / D1–D5 表 / 四维 1–5 文本约定）。
- D5 WARN 过渡在 1.4.0 **未硬化**（1.3.0 README 所述「下一 minor 硬化为 FAIL」顺延，仍为 WARN 不阻塞）。

## [1.3.0] - 2026-08-24

> 主题：**行为纠偏 · CLI 说真话做正事** —— 17 个 PRD/债项全面落地：help / 旗标 / --json / 幂等键 / --strict 等一律收紧为真实语义，155 项测试红线锁住，新上 CI。

### Changed（行为变更 · 升级必读）

- **子命令 `--help`**：输出子命令自身 usage（原误输出根 usage）。
- **未知旗标不再静默吞**：`verify` / `gate-check` 收到未知旗标 exit 1 报错（原静默忽略）。
- **`--json` 真生效**：`verify` / `gate-check` --json 输出五字段结构化结果（原旗标被吞、仍输出文本）。
- **`verify --spec`**：文案去版本号；校验失败 exit 2→1（exit 2 回归纯闸语义）。
- **入参校验收紧**：`init --preset` 词表校验（未知 preset 拒收）；`upgrade --force` 拒收。
- **`check` 三向版本判定**：高版本 manifest 不再误报「可升级」（DEF-013）。
- **`graph ingest` 幂等键含状态摘要**：闸/task 状态变化后重跑会补发事件（旧事件保留、不覆盖）。
- **外部手写事件过滤收紧**：改为结构化等值匹配（原宽松匹配易误吞/误放）。
- **`status`**：`event_count` 无匹配由 null 改为 0；`reviews.CLOSE` 事件接线。
- **`lifecycle` dry-run 新增 `--target`**。
- **`ingest` 扫描双路径**：harness 布局仓事件量跳变属预期。
- **D5 假阳性降级为 WARN 过渡**。
- **插件 override**：根上探 git root + 按文件边界截断。
- **`--strict` 真语义**：原先形同虚设，现真实收紧——**CI 中使用 `--strict` 的管线可能翻红**。
- **`skills install --out` 指向产品包 `assets/skills` → 拒写**（防污染源包资产）。

> 本次含 skills/prompts 资产修复（DEF-024/025/026），安装遵循 no-clobber：**升级后建议重跑 `skills install`**，否则本地仍保留旧资产。

### Fixed

- **DEF-007 · stubs 死指针**：`assets/graph/stubs/README.md` 指针钉正。
- **DEF-024 · 姊妹帽死链**：skills 资产 4 处悬空姊妹帽链接修复。
- **DEF-025 · HG-GRAPH-MODULES 残留行**：gate-stop 模板残留行清除。
- **DEF-026 · 「机械校验」未接线声明**：30-execute-code 降级标注，不再冒充已接线。

### Added

- **lib 冒烟测试 + mtime 哨兵 + `npm run test:lib`**：锁住构建产物新鲜度。
- **CI workflow**（`.github/workflows/ci.yml`，node 22/24 矩阵）。
- **新增测试**：`test/cli-hgm-parser.test.ts`、`test/cli-status-obs.test.ts`、`test/cli-help.test.ts`、`test/cli-flags.test.ts`、`test/cli-verify-spec.test.ts`、`test/cli-validation.test.ts`。
- **SPEC 新增 HGM 幂等键契约**。

## [1.2.4] - 2026-08-24

> 主题：**修谎止损 · 发布物说真话** —— 全面清查 assets/ 文档面与包真实能力的偏差，未接线声明一律降级标注，并以测试红线锁住。

### Fixed

- **DEF-002 · 旧包命令面清零**：assets/ 内历史遗留的旧包名命令引用全部钉正为 `dsh-coding-kit`，新增 D-DOC 闸（docs 测试）防回潮。
- **DEF-020 · adapters 虚标声明**：`assets/ide/adapters/README.md` 中 `graph_modules_path` 与 git-clean 等未接线能力声明降级标注，不再冒充已交付特性。
- **DEF-003（阶段一）· 未接线 gate 声明降级**：生命周期/闸口中未接线的 gate 声明标注为 legacy-only；SPEC.md 新增 **R-TRUTH-1 红线**（发布物声明必须与包真实接线一致，违者测试红）。
- **DEF-008 · QUICKREF 手工嵌入**：`assets/harness/templates/QUICKREF_v1_zh.md` 重写为手工嵌入模板，命令面全部对齐 `dsh-coding-kit` 真实 CLI。
- **DEF-009 · 悬空引用守卫 + 薄指针页**：新增 assets 链接守卫测试；`assets/docs/` 新增 4 个薄指针页（POINTER_ONBOARDING / POINTER_RUNBOOK_wiki_delta / POINTER_SDD_HAT_FLOW / POINTER_USER_GUIDE）消解悬空引用。
- **DEF-004 · ontology 对齐**：`assets/ontology.yaml` 与包现实对齐，统一 ONTO- 前缀公理。
- **DEF-005 · discipline-coverage 重盘**：`assets/harness/discipline-coverage.yaml` 按真实接线机制重评覆盖等级，`verify --spec` 标注为未接线。
- **DEF-006 · graph 模板命令面对齐**：`assets/graph/templates/` 命令面与包内编译器对齐并重新生成产物。

### Changed（消费者必读）

- **升级本包后建议重跑 `graph yaml compile`（或 `--all`）与 `skills install`**：本次修谎涉及 graph 模板与 skills/prompts 资产内容，而安装/编译遵循 no-clobber 约定，**不会自动覆盖既有生成物**；不重跑则本地仍保留旧（含虚标）版本。

## [1.2.3] - 2026-08-24

### Fixed

- **DEF-023 · graph yaml compile Mermaid emit IDE 预览断裂（P0-HOT）**：
  - 锚点注释由 `// → path#Ln` 改为 Mermaid 唯一合法行注释 `%% → path#Ln`。
  - 带标签边默认形态由 `src --"label"--> dst` 改为官方 `src -->|"label"| dst`；`label: "->"` 或无 label 输出裸边 `-->`。
  - 节点标签一律双引号包裹（`id["label"]` / 子流程 `id[["label"]]`），修复含空格、`()`、`/`、`+`、`>` 前缀等字符的标签导致预览解析失败。
  - label 内 `"` / `|` / `#` 按 Mermaid entity code 转义（`#quot;` / `#124;` / `#35;`）。
  - 语法真值：[mermaid.js.org/intro/syntax-reference.html](https://mermaid.js.org/intro/syntax-reference.html) · [mermaid.js.org/syntax/flowchart.html](https://mermaid.js.org/syntax/flowchart.html)（本地对照 `mermaid/packages/mermaid/src/docs/syntax/flowchart.md` § Links between nodes / Text on links / Comments）。

### Changed（emit 契约 · 消费者必读）

- **升级本包后须重跑 `graph yaml compile`**（或 `graph yaml compile --all`）重新生成 `docs/_tech_graph/*.md`；旧 emit（`// →` 注释、`--"…"-->` 边）在 IDE Markdown 预览中会静默失败（节点横排一行、边丢失）。`graph yaml check` 比对 graph.json 不受影响。
- `assets/graph/templates/99_mermaid_protocol.md` 新增「§7 IDE 预览兼容 · 编译器输出契约」，§1.2 / §2 示例改为官方形态。

### Chore

- **DEF-001 · 发布物与 git 历史对齐**：补建与 npm 已发布包一一对应的 `v1.2.1` / `v1.2.2` 提交与 tag（发布物源态可由 tag 复现）；本提交起「publish 前 commit + tag」为硬步骤。
