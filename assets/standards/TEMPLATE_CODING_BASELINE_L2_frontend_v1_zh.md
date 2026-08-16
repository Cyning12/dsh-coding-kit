# 编码规范 L2 模板 — 前端（TypeScript / React · v1）

> **用途**：复制为 `docs/standards/CODING_FRONTEND_L2_v1_zh.md`。  
> **L1**：须链本仓 [`CODING_BASELINE_L1_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L1_v1_zh.md)（嵌入后去 `TEMPLATE_` 前缀）。

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **栈** | _例：Next App Router · React · TypeScript strict · pnpm · Vitest_ |
| **配置真值** | _待填：`docs/meta/PROJECT_CONFIG_*.md`_ |
| **图谱** | _待填：`docs/_tech_graph/`_ |

---

## 1. 适用范围

| 路径 | 职责 |
| --- | --- |
| `app/` | 页面、布局、Route Handlers（BFF） |
| `components/` | UI 组件 |
| `lib/` | 领域逻辑、工具 |
| _（待填）_ | _按仓裁剪_ |

---

## 2. 条文（F-01～F-14 · 填写真值）

每条须含：**遵循 B-xx** + **工具规则 ID**（ESLint / tsconfig 等）。

| ID | 主题 | 遵循 | 本仓落地（文件 / 规则 ID） |
| --- | --- | --- | --- |
| **F-01** | 模块边界；Route Handler 薄 | B-01 | _待填_ |
| **F-02** | 早返回与条件渲染 | B-02 | _待填_ |
| **F-03** | 环境变量；`NEXT_PUBLIC_*` 纪律 | B-03 | _待填_ |
| **F-04** | 命名与 `@/` 导入 | B-04 | _待填_ |
| **F-05** | BFF 错误与日志 | B-05, B-12 | _待填_ |
| **F-06** | 分支与策略表 | B-06 | _待填_ |
| **F-07** | 最小 diff | B-07 | _待填_ |
| **F-08** | TypeScript strict | B-08 | _待填：`eslint/@typescript-eslint/no-explicit-any`_ |
| **F-09** | 重复抽取 | B-09 | _待填_ |
| **F-10** | 测试（Vitest / RTL） | B-10 | _待填_ |
| **F-11** | 安全（XSS、密钥） | B-11 | _待填_ |
| **F-12** | 可观测 | B-12 | _待填_ |
| **F-13** | _栈特有_ | — | _待填_ |
| **F-14** | _栈特有_ | — | _待填_ |

### 扩展示例

```markdown
### F-03 环境变量（遵循 B-03）

| 类型 | 规则 |
| --- | --- |
| 服务端密钥 | 仅服务端模块；禁止 NEXT_PUBLIC_* |
| API 基址 | 单一真值 env + proxy 模块 |
```

---

## 3. CI 对齐

| 检查 | 命令 | workflow |
| --- | --- | --- |
| Lint | _例：`pnpm lint`_ | _待填_ |
| Test | _例：`pnpm test`_ | _待填_ |
| Build | _例：`pnpm build`_ | _待填_ |

复制 [`ci/samples/quality.yml.example`](../ci/samples/README.md) 并按上表改 job 名。

---

## 4. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | YYYY-MM-DD | 从 cyning-harness L2 前端模板嵌入 |
