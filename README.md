# dsh-coding-kit

**dsh-coding-kit@1.0.0** 是 DeepSeek Harness（DSH）的 **bundle 插件**：把 ICVO 纪律资产（规范、wiki、图谱模板、过程模板、CI/IDE 片段）带进 DSH 会话。

> **加载 ≠ 注入。** 安装或加载本插件 **不会** 自动改写 system prompt。必须由你或模型调用工具 `apply_coding_standards` 之后，后续回合的 runtime context 才会含 `# Coding Standards`。

## 1.0.0 不含 CLI

本包 **dsh-coding-kit@1.0.0** **不含** `verify` / `gate-check`。CLI 计划在 **dsh-coding-kit@1.1.0** 迁入同一 npm 包；此前请继续用 `npx @cyning/harness`。

## 安装

优先 npm（预构建，无需 allowBuilds）：

```bash
dsh plugin --profile web add dsh-coding-kit
```

备选：从 GitHub 安装（需 Node 构建；pnpm 10+ 可能要 allowBuilds）：

```bash
dsh plugin --profile web add github:Cyning12/dsh-coding-kit#main
```

本地开发同样走 `dsh plugin add`（不要只 `npm install dsh-coding-kit`：缺少 bundle 层则工具不会出现）。

### 确认层

```bash
dsh --profile web --dump-config
```

安装成功后，profile 的 `package.json` 会出现依赖 `dsh-coding-kit`，且 `dsh.profile.bundles` 含该包名。用户一般不必手写 bundles；`dsh plugin add` 会维护。

## 激活与调用

1. 用该 profile 启动 DSH（例如 `dsh --profile web` / `dsh --profile web web`）。
2. 在对话中说：**请应用 coding standards**（或「按 coding-kit 规范写代码」）。
3. 模型应调用工具 `apply_coding_standards`。
4. 成功后后续回合的 runtime context 含 `# Coding Standards`。

可选参数：`profile=l1|l1+l2|full`（默认 `l1+l2`）；`persist=false` 表示只在当轮工具结果里给出正文。

## 初始化项目模板

初始化走工具 **`init_coding_kit`**。

对话：**请把 coding-kit 模板初始化到本项目** → 模型调用 `init_coding_kit`。  
之后修改 `.coding-kit/`，再调用 `apply_coding_standards`（`source=override`）。`init_coding_kit` 不覆盖已有文件。

## GitHub topic

本仓库 GitHub topic 含 **`dsh-plugin`**（DSH 官方发现机制，无应用商店）与 **`deepseek-harness`**。

## License

MIT
