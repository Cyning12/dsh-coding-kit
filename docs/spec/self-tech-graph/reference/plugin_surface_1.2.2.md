> **历史锚**：dsh-coding-kit **1.2.2**
> **原工作区路径**：`docs/dsh_coding_kit_optimization/00_inventory/plugin_surface.md`
> **非现行真值** · 现行 L1 见 `docs/_tech_graph/01_struct.md`

# DSH 插件面 · dsh-coding-kit@1.2.2（R1 起草）

> **真值**：`dsh-coding-kit/src/index.ts`（编译产物 lib/index.js）+ `package.json` 的 `dsh.bundle` 与 `cordis.patch.yml`。
> **核心语义**：**加载 ≠ 注入**。dsh plugin add 装包、宿主加载插件后，`apply()` 只注册两个工具，不改写 system prompt；必须由用户/模型显式调用 `apply_coding_standards` 才注入（README.md#5；src/index.ts#177-246）。

## 1. bundle 机制（dsh.bundle + cordis.patch.yml）

- package.json#71-75：`"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` —— 向 DSH 声明本包是 bundle 插件，patch 文件为挂层指令。
- cordis.patch.yml#1-5：内容为 3 行 `- insert: { id: coding-kit, name: dsh-coding-kit }`。**不是** RFC6902 JSON Patch（无 op/path/value）；部分 IDE / yaml-language-server 会误报缺字段，属预期（README.md#56；SPEC.md#162 明文禁止改成 RFC6902）。
- 安装后确认：`dsh --profile web --dump-config` 应见 profile 的 package.json 依赖与 `dsh.profile.bundles` 含本包名（README.md#32-38）。
- 测试钉死：test/cli-p0.test.ts#188-194（patch 保持 - insert / id / name，且无 op/path/value）；npm pack 必须含 cordis.patch.yml（test/cli-docs-122.test.ts#67-87）。

## 2. 模块契约（src/index.ts 顶层导出）

| 导出 | 值 | 锚点 |
|------|-----|------|
| name | `coding-kit` | src/index.ts#8 |
| inject | `['tools', 'systemPrompt']` | src/index.ts#9 |
| apply(ctx) | 注册两个工具 | src/index.ts#177-285 |
| loadMarkdownBundle(profile) | 供测试复用的打包函数 | src/index.ts#80-124 |
| copyDirNoClobber(src, dest) | 供测试复用的复制函数（S2 skip） | src/index.ts#131-164 |

- peer 依赖：`@deepseek-ai/cordis ^4.0.1` 与 `@deepseek-ai/dsh-tools >=0.0.1-rc.1 <0.2.0`，均经 peerDependenciesMeta 标 **optional**（package.json#56-63）——仅宿主按插件加载时需要；CLI-only 消费者不需要（README.md#16）。回归：test/cli-peer-optional.test.ts（P1-1 字段断言；P1-2 干净 pnpm 默认安装 exit 0 且无 dsh-type-meta 字样）。
- 类型导入 `Context` 来自 cordis、`defineTool` 来自 dsh-tools（src/index.ts#5-6）；测试强制源码禁 `ctx.tool(`、须 `ctx.tools.register(defineTool(...))`（test/apply.test.ts#60-66）。

## 3. 注册工具

### apply_coding_standards — src/index.ts#181-246
- **作用**：把 ICVO 编码规范 + coding_wiki 打包成 `# Coding Standards` Markdown，默认经 `systemPrompt.context({ name: 'coding-kit.standards', order: 50 })` 注册为后续回合的 runtime context（重复调用先 dispose 再注册，不抛重名错——T6，test/apply.test.ts#68-78）。
- **参数**：
  - `profile: 'l1' | 'l1+l2' | 'full'`（默认 l1+l2）。l1 = 仅 standards/ 下含 L1 的文件 + README + SOURCES + 全 coding_wiki；l1+l2 与 full 在 v0.1 语义相同 = standards/ 全部 + coding_wiki/ 全部（src/index.ts#69-78, #192）。
  - `persist: boolean`（默认 true）。false = 只在当轮工具结果返回正文，不写 systemPrompt。
- **读取根解析**（src/index.ts#35-47）：cwd 下存在 `.coding-kit/` 或 `.dsh/coding-kit/` → source=override；否则读包内 assets/（source=package）。**只看 process.cwd()**，monorepo 子目录启动时 override 不生效。
- **截断**：bundle 超 `MAX_INJECT_CHARS = 24_000` 字符即硬截断并加注释标记（src/index.ts#12, #111-116；T3，test/assets.test.ts#43-51）。
- **降级**：persist=true 但宿主无 systemPrompt 服务时，退化为一次性预览（前 4000 字符）+ 说明文案（src/index.ts#213-222）。
- **遗留提示**：检测到 cwd 有 `.cyning-harness/` 或 `docs/harness/` 时附 hint「本插件不跑 verify/gate-check」（src/index.ts#166-175）。
- **测试**：T1（apply 只注册不注入，test/apply.test.ts#50-58）· T2（拼接含 # Coding Standards 与文件二级标题，test/assets.test.ts#30-41）· T4（override 根）。

### init_coding_kit — src/index.ts#248-284
- **作用**：把包内 assets/ **整树**复制到消费者项目，**不覆盖已有文件**（no-clobber），且跳过 S2 过程域（docs/tasks、reviews、invokes/by-task 前缀，src/index.ts#13, #126-129）。
- **参数**：`dest: '.coding-kit' | '.dsh/coding-kit'`（默认 .coding-kit；其余值直接拒绝）。
- **与 CLI init 的分工**：插件面 init_coding_kit 复制**规范/模板资产**；CLI `init` 只写 manifest.json。二者不是同一入口（README.md#12）。
- **测试**：T5（test/init.test.ts：skip 已存在 + S2 三域 skip + 新文件 copied）。

## 4. 加载≠注入 · 相关 freeze（回归闸）

- apply() 体内**没有**任何 systemPrompt 调用（T1 断言 contextCalls=0）；调用工具后 persist 路径才注册 context。
- CLI 侧源码禁止出现 `ctx.tools.register`（test/cli-p0.test.ts#416-425）——闸命令不注册为 DSH 工具，CLI 与插件面互不替代。
- SPEC 非范围锚点：dsh-coding-kit/SPEC.md#161-166（不削弱 apply、不改 patch、CLI 不注册 ctx.tools）。

## 5. profile / persist 语义小结

| 维度 | 语义 | 锚点 |
|------|------|------|
| profile=l1 | standards 仅 L1 文件 + README + SOURCES；wiki 全量 | src/index.ts#74-76 |
| profile=l1+l2（默认） | standards 全量 + wiki 全量 | src/index.ts#77 |
| profile=full | v0.1 与 l1+l2 相同（参数字符串自述 `same as l1+l2 in v0.1`） | src/index.ts#192 |
| persist=true（默认） | systemPrompt.context 注册 coding-kit.standards（order=50），影响后续回合 | src/index.ts#224-229 |
| persist=false | 仅当轮工具结果返回正文 | src/index.ts#241-243 |

## 6. 已知边界（详见 01_defects/defect_register.md）

- override 根只看 cwd（DEF-017）。
- 24k 截断可能截断半截文件（DEF-017）。
- 插件面不跑 verify/gate-check（设计如此，hint 文案明示）。
