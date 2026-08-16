# 编码基线 L1 模板（语言无关 · v1）

> **用途**：复制到用户仓 `docs/standards/CODING_BASELINE_L1_v1_zh.md` 并按栈裁剪。  
> **纪律**：本文件为 **脚手架模板**；Ink 工作区真值见 [`POINTER_workspace_truth_v1_zh.md`](./POINTER_workspace_truth_v1_zh.md) — **禁止** 将真值全文复制进产品仓分发包。

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` — 嵌入后改 `active` 并人签 |
| **版本** | v1.0 |
| **日期** | YYYY-MM-DD |
| **维护** | 本仓 `docs/standards/` |

---

## 1. 适用范围

| 适用 | 不适用 |
| --- | --- |
| 本仓 **业务代码** 新增/修改 | 纯文档 task（`test_strategy: not_applicable` 且无代码） |
| Agent 与人类 PR | 第三方 vendored（除非 task 明示） |

**优先级**：**task + `_tech_graph` + PROJECT_CONFIG** > 本 L1 > 外部参考（[`SOURCES_v1_zh.md`](./SOURCES_v1_zh.md)）> 个人习惯。

---

## 2. 条文（B-01～B-12 · 填写真值）

> 每条保留 **ID**；L2 须标注 `遵循 B-xx`。下方「本仓落地」列嵌入时必填。

| ID | 原则（摘要） | 本仓落地（路径 / CI / 命令） |
| --- | --- | --- |
| **B-01** | 单一职责；函数/模块只做一件事 | _待填_ |
| **B-02** | 早返回；嵌套 ≤2 | _待填_ |
| **B-03** | 配置外置；禁止硬编码 URL/密钥 | _待填：`PROJECT_CONFIG` / `.env.example`_ |
| **B-04** | 命名即文档；与图谱/API 术语一致 | _待填_ |
| **B-05** | 错误可结构化；对齐 registry/SPEC | _待填_ |
| **B-06** | 扩展点显式；表驱动优于 if-else 链 | _待填_ |
| **B-07** | 最小 diff；禁止范围外重构 | _待填_ |
| **B-08** | 类型与契约优先；禁止滥用 `any`/裸 dict | _待填_ |
| **B-09** | 重复 ≥3 处须抽取 | _待填_ |
| **B-10** | 测试与行为绑定；`test_strategy: required` 先测后码 | _待填：pytest / vitest / …_ |
| **B-11** | 安全与密钥；输入校验 | _待填_ |
| **B-12** | 可观测钩子；禁止静默失败 | _待填_ |

### 扩展示例（可选）

若需展开单条说明，用三级标题 `### B-0N …`，**勿** 超过 L1 原则层（栈细节放 L2）。

---

## 3. 反模式速查（节选）

| ID | 反模式 | 改法 | 条文 |
| --- | --- | --- | --- |
| AP-01 | 魔法字符串 API 路径 | 常量 / env / 生成类型 | B-03, B-08 |
| AP-02 | 路由层堆业务+SQL | 下沉 service | B-01 |
| AP-03 | 深层嵌套 JSX / try | 抽 hook / 早 return | B-02 |
| AP-04 | `except Exception: pass` | 窄捕获 + 结构化错误 | B-05 |

_嵌入后按栈增补 AP-xx_

---

## 4. PR / 审查自检

- [ ] 无新增硬编码 URL/魔法数（B-03）
- [ ] 无密钥进仓库（B-11）
- [ ] 无范围外文件改动（B-07）
- [ ] `test_strategy: required` 时测试已绿（B-10）

---

## 5. 与 L2 的关系

| 层级 | 路径 | 职责 |
| --- | --- | --- |
| **L1** | 本文件 | 原则与条文 ID |
| **L2 前端** | `docs/standards/CODING_FRONTEND_L2_v1_zh.md` | 由 [`TEMPLATE_CODING_BASELINE_L2_frontend_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L2_frontend_v1_zh.md) 生成 |
| **L2 后端** | `docs/standards/CODING_BACKEND_L2_v1_zh.md` | 由 [`TEMPLATE_CODING_BASELINE_L2_backend_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L2_backend_v1_zh.md) 生成 |
| **L3** | `.cursor/rules` · `AGENTS.md` | ≤15 行摘要 + 链至 L1/L2 |

---

## 6. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | YYYY-MM-DD | 从 cyning-harness 模板嵌入 |
