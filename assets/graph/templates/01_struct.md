# 模块边界登记表（L0-b · D4-a 人签真值）

> **用途**：`docs/_tech_graph/01_struct.md` — **一级模块** 边界；**HG-GRAPH-MODULES** approved 后方可 **30 执行改码**。  
> **不是**：全仓 flow 一次画完；flow 按 task **增量** 维护。  
> **嵌入后**：删除示例行，填真实模块；维护者人签后更新 task 内 `HG-GRAPH-MODULES` → `approved`。

## 模块表（必填）

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
| `core` | 核心业务 | `src/core/**` 或 `app/**` | → `infra` | 示例 · **替换** |
| `api` | HTTP / RPC 入口 | `src/api/**` 或 `routes/**` | → `core` | 示例 · **替换** |
| `infra` | DB / 缓存 / 外部 SDK | `src/infra/**` | —（被依赖） | 示例 · **替换** |
| `_TODO_` | （待填） | `（glob）` | → | 新增行 |

### 填写规则

1. **module_id**：小写 snake_case；全仓唯一。
2. **路径 glob**：能覆盖该模块源码根； monorepo 按 **子包** 分行。
3. **依赖方向**：只写 **出边**（本模块允许 import / 调用谁）；禁止循环 unless 文档化。
4. **一级模块**：通常 3～12 行；更细粒度放 Wiki 或子 task，不膨胀本表。

## 跨模块契约（可选）

| 契约 | 提供方 module_id | 消费方 | 说明 |
|------|------------------|--------|------|
| `（例：UserDTO）` | `core` | `api` | 共享类型 / OpenAPI schema |

## 人签记录（嵌入后填写）

| human_gate_id | status | 签核人 | 日期 | 说明 |
|---------------|--------|--------|------|------|
| HG-GRAPH-MODULES | pending | | | `01_struct` 模块表覆盖一级模块 |

## 关联

- 顶层图：[`00_main.md`](./00_main.md) · [`00_main.ai.md`](./00_main.ai.md)
- 主 flow 示例：[`10_flow_MAIN.md`](./10_flow_MAIN.md)
