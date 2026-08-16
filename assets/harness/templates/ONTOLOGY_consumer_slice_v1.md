# Consumer Ontology Slice（业务仓 · v1）

> **用途**：绿野 / 新业务仓的 **Inform 语义设定**最小切片。  
> **非用途**：不替代产品包 `DESIGN_ONTOLOGY` / `ontology.yaml`；**不**纳入 `harness ontology-check`。  
> **建议落盘**：`docs/meta/ONTOLOGY_<domain>_v1.md`（或团队约定路径）

---

## 1. 术语表（3–12 条）

| 术语 | 定义（一句话） | 反例 / 易混 |
| --- | --- | --- |
| （例）落盘真值 | 已写入仓库且可被闸引用的文件/状态 | 聊天里的「口头完成」 |
| （例）飞行中 | Agent 会话内存态 · 不可作签收 | 把对话摘要当 CLOSE 证据 |
| | | |

---

## 2. 核心类 / 关系（3–7）

| 类或关系 | 说明 | 与 `_tech_graph` 指针 |
| --- | --- | --- |
| （例）Task | 可归档工作单元 | `docs/_tech_graph/01_struct.md` |
| （例）InvokeSnapshot | 帽执行落盘 | `docs/harness/invokes/by-task/` |
| | | |

---

## 3. 边界声明

- **本仓业务语义** 以本文件 + `_tech_graph` 为准。  
- **纪律包产品本体**（帽子 / 闸 / HGM）见依赖的 `@cyning/harness` 文档，勿在此复制全文。  
- 改路由 / API / 数据边界时：更新相关 flow，并在 task 填 `graph_delta`。

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| YYYY-MM-DD | 自 `harness/templates/ONTOLOGY_consumer_slice_v1.md` 复制 |
