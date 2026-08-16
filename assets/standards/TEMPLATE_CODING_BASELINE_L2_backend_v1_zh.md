# 编码规范 L2 模板 — 后端（Python / API · v1）

> **用途**：复制为 `docs/standards/CODING_BACKEND_L2_v1_zh.md`。  
> **L1**：须链本仓 [`CODING_BASELINE_L1_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L1_v1_zh.md)（嵌入后去 `TEMPLATE_` 前缀）。

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **栈** | _例：Python 3.11+ · FastAPI · pytest · Ruff_ |
| **配置真值** | _待填：`docs/meta/PROJECT_CONFIG_*.md`_ |
| **图谱** | _待填：`docs/_tech_graph/`_ |

---

## 1. 适用范围

| 路径 | 职责 |
| --- | --- |
| `api/` 或 `src/` | HTTP 路由与领域模块 |
| `tests/` | pytest |
| _（待填）_ | _按仓裁剪_ |

---

## 2. 条文（P-01～P-15 · 填写真值）

每条须含：**遵循 B-xx** + **工具规则 ID**（Ruff / mypy 等）。

| ID | 主题 | 遵循 | 本仓落地（文件 / 规则 ID） |
| --- | --- | --- | --- |
| **P-01** | 模块边界；路由薄 | B-01 | _待填_ |
| **P-02** | 早返回与异常 | B-02 | _待填_ |
| **P-03** | 环境变量单一真值模块 | B-03 | _待填：`api/rag_env.py` 或 settings_ |
| **P-04** | 命名与 import 顺序 | B-04 | _待填_ |
| **P-05** | 结构化错误 / HTTPException | B-05 | _待填：error registry_ |
| **P-06** | 分支与策略 | B-06 | _待填_ |
| **P-07** | 最小 diff | B-07 | _待填_ |
| **P-08** | 类型注解 / Pydantic | B-08 | _待填：Ruff ANN / mypy_ |
| **P-09** | 重复抽取 | B-09 | _待填_ |
| **P-10** | pytest 与 marker | B-10 | _待填_ |
| **P-11** | 安全与密钥 | B-11 | _待填_ |
| **P-12** | 日志与 trace 字段 | B-12 | _待填_ |
| **P-13** | _栈特有_ | — | _待填_ |
| **P-14** | _栈特有_ | — | _待填_ |
| **P-15** | _栈特有_ | — | _待填_ |

### 扩展示例

```markdown
### P-05 结构化错误（遵循 B-05）

| 场景 | 形状 |
| --- | --- |
| HTTP | HTTPException + error_code |
| 内部 | 窄捕获；禁止 traceback 外泄 |
```

---

## 3. CI 对齐

| 检查 | 命令 | workflow |
| --- | --- | --- |
| Test | _例：`pytest tests -m "not slow"`_ | _待填_ |
| Lint | _例：`ruff check`_ | _待填（可选 P4）_ |

复制 [`ci/samples/pytest.yml.example`](../ci/samples/README.md) 并按上表改。

---

## 4. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | YYYY-MM-DD | 从 cyning-harness L2 后端模板嵌入 |
