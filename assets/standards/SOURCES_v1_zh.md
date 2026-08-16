# 编码规范 — 外部参考模板（v1）

> **用途**：复制为 `docs/standards/SOURCES_编码规范外部参考_v1_zh.md`。  
> **纪律**：**引用不搬运** — 正文不进仓，只保留采纳条款与本仓落地路径。

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **关联 L1** | `CODING_BASELINE_L1_v1_zh.md` |

---

## 1. 引用纪律

1. **引用不搬运**：下表「来源 URL」为真值入口；修订时更新 **版本锚点**。
2. **采纳须可执行**：「本仓落地」须指向 **文件路径、CI job 或命令**。
3. **冲突**：与 task、`_tech_graph`、`PROJECT_CONFIG` 冲突时，以本仓真值为准。

---

## 2. 映射表（嵌入时填写）

| ID | 来源 | 版本锚点 | 采纳条款（摘要） | 本仓落地 |
| --- | --- | --- | --- | --- |
| REF-GOOG-CL | [Google Eng Practices — CLs](https://google.github.io/eng-practices/review/developer/) | YYYY-MM | 小步 CL、附测试说明 | PR Test plan；L1 §4 |
| REF-GOOG-CR | [Google Code Review](https://google.github.io/eng-practices/review/) | YYYY-MM | 可读性、非风格吹毛求疵 | 22 审查关注 B-01/B-02 |
| REF-PEP8 | [PEP 8](https://peps.python.org/pep-0008/) | Py x.y | 格式、命名 | _后端：ruff.toml_ |
| REF-GOOG-TS | [Google TS Style](https://google.github.io/styleguide/tsguide.html) | YYYY-MM | strict、禁 any | _前端：tsconfig + ESLint_ |
| REF-OWASP-API | [OWASP API Top 10](https://owasp.org/www-project-api-security/) | 2023 | 注入、鉴权 | B-11 |
| _REF-…_ | _待增_ | | | |

---

## 3. 按 L1 条文回查

| L1 条文 | 主要 REF |
| --- | --- |
| B-01～B-07 | REF-GOOG-CL, REF-GOOG-CR |
| B-08 | REF-GOOG-TS, REF-PEP8 |
| B-10 | REF-GOOG-CL |
| B-11 | REF-OWASP-API |

---

## 4. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | YYYY-MM-DD | 从 cyning-harness SOURCES 模板嵌入 |
