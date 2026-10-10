# 03 · 命令面与失败路径

> **状态**：`draft` · 隶属 `3_2-graph-ib-and-indexes`  
> **说明**：下列命令名为产品意图钉；argv 细节以各波 task 复核 `src/cli-graph.ts` 现值为准。

---

## 1. 命令面（拟新增 / 扩展）

### 1.1 点路径闸（W1 · 核心）

```text
npx spec-wave graph ib check [--target PATH] [--input DIR] [--json]
```

| 行为 | 约定 |
|------|------|
| 扫描 | `--input`（缺省 `docs/_tech_graph`）下 `*.graph.yaml`（递归策略对齐 drift） |
| 对象 | `nodes[].implementedBy.path` |
| 跳过 | path 空 / `TBD`；节点无 `implementedBy` |
| 红 | 相对 `--target` 文件不存在 → **exit 2** · kind 建议 `missing_ib_path` |
| 绿 | 无缺失 → **exit 0**（含 checked=0） |
| `--json` | 经既有 `printJson` 信封；**只增不改**其它命令默认 stdout/exit |
| 备选 | 若实现波改用 `graph drift --check-ib`，须同等语义与测锁；help 仍列出点闸入口 |

### 1.2 漂移配置扩展（W2）

```text
npx spec-wave graph drift [--target PATH] [--input DIR] [--json]
```

| 变更 | 约定 |
|------|------|
| 缺省 | **不变**（仍读 `01_struct.md` + 边锚点） |
| 新增 | 读 `.spec-wave/graph-drift.yaml` 可选 `struct_rel` |
| 白名单 | 既有 exempt 键保持；新键非法 → exit 2 fail-closed |

### 1.3 indexes 闸（W3 · opt-in）

```text
npx spec-wave graph indexes check [--target PATH] [--input DIR] [--json]
```

| 行为 | 约定 |
|------|------|
| 前置 | 配置文件存在且 schema 合法；否则 usage / 明确错误（测锁一种） |
| 语义 | 双向一致（见 02 §4） |
| 红 | 单向或双向漂移 → **exit 2** |
| 默认 verify | **不**自动调用 |

### 1.4 既有编译链（不改默认语义）

```text
npx spec-wave graph yaml compile|export|check …
npx spec-wave graph scaffold …
```

## 2. 审核 / 手册协议

手册（W4）须含一节「保真分责」：

| 层 | 命令 | 查什么 |
|----|------|--------|
| 边 + 模块表 | `graph drift` | 一级目录覆盖 · `edges[].anchors[].path` |
| 点 | `graph ib check` | `nodes[].implementedBy.path` |
| 倒排 | `graph indexes check` | IB ↔ indexes 双向（opt-in） |
| 符号（未来） | （未交付） | AST · 另 Epic |

CI 样例：可为 `ib check` 增加**可选**注释步骤（对齐 3.1 drift 样例纪律）；indexes **默认不**写入硬门禁样例。

## 3. 失败路径（可观测）

| 触发 | 系统行为 | 可重试 | 用户可见 |
|------|----------|--------|----------|
| IB path 不存在（非 TBD） | exit 2 · 点名 path / 源 yaml | 是（修码或改 YAML） | 是 / CI 红 |
| 全无 IB / 全 TBD | exit 0 · checked=0 或仅跳过 | — | 摘要 |
| `struct_rel` 指向缺失文件 | `graph drift` exit 2 · `struct_missing` 同类 | 是 | 点名 |
| `struct_rel` 文件不可解析 | exit 2 · `struct_unparseable` | 是 | 点名 |
| graph-drift.yaml 新键类型非法 | exit 2 fail-closed | 是 | 点名键 |
| indexes 未配置却要求严格跑通 | exit 1 usage 或 exit 2「未配置」（波钉） | 是 | 是 |
| indexes 单向漂移 | exit 2 · 列差异 | 是 | 是 |
| `--json` 且有红项 | exit 2 · JSON 列差异 | 是 | 是 |
| 非 git 仓 | 沿用 `resolveTarget` fail 形态 | 是 | 是 |
| 试图写盘「修复」图谱 | **禁止** | — | — |
| 改 3.1 drift / yaml 缺省语义 | 打回 | 是 | 审查 / 测红 |
| 把 AST / issue-sync 塞进本版 | 打回（非范围） | — | — |

## 4. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
