# ide/adapters

**单源 POINTER**：真值在 `docs/coding_wiki/` + `docs/standards/` + `AGENTS.md`；本目录仅 **IDE 入口片段**。

## v0.2 已交付（D3 · M2 补完）

| 文件 | 状态 | 勾选 IDE | 嵌入路径 |
|------|------|----------|----------|
| [`cursor-harness-starter.mdc.example`](./cursor-harness-starter.mdc.example) | ✅ | **Cursor**（默认推荐） | `.cursor/rules/05-harness-starter.mdc` |
| [`CLAUDE.md.fragment.example`](./CLAUDE.md.fragment.example) | ✅ | **Claude Code** | 仓根 `CLAUDE.md`（marker merge） |
| [`AGENTS.md.fragment.example`](./AGENTS.md.fragment.example) | ✅ | **通用 Agent** | 仓根 `AGENTS.md`（marker merge） |

## 现行安装入口

CLI 闸与模板以 **`npx dsh-coding-kit`** 为准（包内本目录 = npm `assets/ide/adapters/`）：

```bash
# 仓根：初始化 Harness 闸（不覆盖 S2 过程域）
npx dsh-coding-kit init --preset harness-only --yes

# 嵌入前建议先 verify（task 路径按仓调整）
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_*.md
```

IDE 片段默认需手工嵌入（见下）；`init` / `upgrade` 不写消费者仓 IDE 文件（`upgrade` 仅改写 `.cyning-harness/manifest.json`）。存量仓已嵌入 begin/end 块内的旧 `npx @cyning/harness` 命令字面，用 **`npx dsh-coding-kit refresh-ide-blocks`** 刷写（默认 dry-run 只读，`--yes` 才写盘；local 块、块外内容与 S2 路径永不动——映射表与纪律见仓根 README「refresh-ide-blocks」节）。

profile 字段（历史）：`tracks.ide_cursor` · `tracks.ide_claude` · `tracks.ide_agents`（缺省：cursor=true，其余 false）。旧包 `cyning-harness` 的 `wizard/install.sh` 勾选路径已废弃，勿再当作现行入口。

## marker merge 纪律（D3）

- 块标记：`<!-- cyning-harness:begin -->` … `<!-- cyning-harness:end -->`（**marker 字符串**，不是 npx 包名；可保留）
- **不覆盖**用户仓已有 `CLAUDE.md` / `AGENTS.md` 全文；**产品块外**手写保持不变
- **仓内定制（v2.22+）**：使用 `<!-- cyning-harness-local:begin -->` … `<!-- cyning-harness-local:end -->`，且须在产品 begin/end **之外**。sync **永不**改写 local 块；若误写在产品块内，apply 会尝试 **salvage** 到产品块外。
- G-L / 图谱模块页路径：`.cyning-harness/profile.json` 的可选 `"graph_modules_path"` 字段（旧包默认 `01_struct`）与 FRAGMENT 占位替换链 **当前不支持**（旧包 cyning-harness 史实机制，本包未接线；sync 仅生成 `invoke_index.json`，不读 profile.json、不写任何 FRAGMENT）。
- **首次迁入操作序（推荐）**：先迁 profile/local 并 **git commit**，再 `npx dsh-coding-kit upgrade --yes`。`upgrade` 当前仅改写 `.cyning-harness/manifest.json`（src/cli.ts#155-178），**无 git-clean 前置检查**（脏树拦截本包未接线）；git commit 为推荐操作纪律，非本包强制。

## 手工嵌入（备查）

从已安装的 npm 包复制（路径相对消费者仓根）：

```bash
mkdir -p .cursor/rules
cp node_modules/dsh-coding-kit/assets/ide/adapters/cursor-harness-starter.mdc.example \
  .cursor/rules/05-harness-starter.mdc
```

或从本仓库源树：

```bash
cp assets/ide/adapters/cursor-harness-starter.mdc.example .cursor/rules/05-harness-starter.mdc
```

## 纪律（D3）

- **多入口仅 POINTER** — 不在各 IDE 文件重复 L1/L2 全文
- 过程轨（task、invoke、CI）**与 IDE 无关**
- 向导 **默认不全选** IDE；按实际编辑器勾选
