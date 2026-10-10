# 02 · 产品方案（契约 · 分责 · 配置）

> **状态**：`draft` · 隶属 `3_2-graph-ib-and-indexes`

---

## 1. 总览

| 轨 | 中文名 | 本版职责 | 对应波（见 04） |
|----|--------|----------|----------------|
| **A 点契约** | IB 字段 + 存在性闸 | 可选 `nodes[].implementedBy`；`graph ib check` | W1 |
| **B 配置** | 模块表路径可配 | `struct_rel` · 缺省兼容 3.1 | W2 |
| **C indexes** | 双向一致（opt-in） | `graph indexes check` · 域/glob 配置化 | W3 |
| **D 收敛文档** | yaml 双栈迁移指引 | 手册 + MIGRATION；不强制删消费仓脚本 | W4 |
| **E 发版** | 3.2.0 收口 | CHANGELOG · ACCEPTANCE · bump | W5 |

## 2. 轨 A · 节点 IB 契约

### 2.1 字段形态（意图钉 · 实现波复核）

```text
nodes:
  - id: N_entry
    label: Entry
    kind: phase
    implementedBy:
      path: "src/cli.ts"          # 相对 --target；空或 TBD 跳过存在性
      symbol: "cmdVerify"         # 本版 **不**校验 symbol（留给未来 AST epic）
```

| 规则 | 约定 |
|------|------|
| 缺省 | 节点无 `implementedBy` → 合法；IB 闸不计该节点 |
| path | 字符串；`""` / `TBD`（大小写不敏感）→ 跳过 |
| symbol | 允许存在并透传；**本版不**做 AST/符号证明 |
| 校验松紧 | W1 推荐：**透传 + 形状校验**（若存在则须为 object 且 path 为 string）；**不**因「多了 IB」让无 IB 的旧图变红 |
| 与边锚点 | **并存不互斥**；边继续由 `graph drift` 管；点由 `graph ib check` 管 |

### 2.2 为何独立命令（而非塞进 drift）

| 方案 | 结论 |
|------|------|
| A. 扩展 `graph drift` 默检 IB | 弃作**缺省**：改变 3.1 语义面，易误伤「只用边锚点」的仓的预期文档 |
| B. `graph drift --check-ib` 旗标 | 可作 W1 **实现备选**；若采用须文档标明「非 3.1 缺省」 |
| C. 独立 `graph ib check` | **推荐默认产品名**：与备忘 §9 分工一致；CI 可分步接线 |

实现波可二选一落地，但 **对外文档主路径**须有清晰「点闸」入口；若只做旗标，help/手册仍须用「IB 点路径」专节。

### 2.3 与现行 schema 的关系

3.1 源码 `YamlNode` 仅 `{ id, label, kind }`。W1 须扩展加载/校验以**承认可选 IB**，且：

- 不得破坏既有无 IB fixture；  
- 若触碰 `SCHEMA_VERSION` 字符串 → 在 task 中显式冻结升级说明（prefer 不 bump 大版本字符串，除非校验语义强制）。

## 3. 轨 B · `struct_rel`

| 项 | 约定 |
|----|------|
| 配置落点 | `.spec-wave/graph-drift.yaml`（与 3.1 白名单同族） |
| 键名 | `struct_rel`（意图钉） |
| 缺省 | 缺键 / 缺文件 → `01_struct.md`（相对 `--input`） |
| 解析 | 相对 `--input`（缺省 `docs/_tech_graph`）；坏路径 / 不可解析 → `graph drift` **exit 2** fail-closed |
| 兼容 | 无配置行为 = 3.1.0 |

## 4. 轨 C · indexes 双向（裁剪）

| 项 | 约定 |
|----|------|
| 动机 | IB 与倒排 indexes 漂移 |
| 语义 | 给定 flow yaml glob + index yaml glob：IB ⊆ index **且** index ⊆ 由 IB 生成的规范集（双向） |
| 配置 | **禁止**硬编码消费仓七域名；域列表 / glob 须可配（文件形态由 W3 task 钉，候选 `.spec-wave/graph-indexes.yaml`） |
| 未配置 | 不进默认 `verify`；调用子命令时 exit 1 usage 或明确「跳过/未配置」（实现波钉一种并测锁） |
| 非范围 | `--write` 生成器可二期；AST 不进本轨 |

## 5. 轨 D · yaml 双栈（文档）

- 产品真值长期：`npx spec-wave graph yaml compile|export|check`。  
- 本版只交付迁移指南与等价性注意点（graph_id / label 保留等）；**不**强制删除消费仓 Python 脚本。  
- 消费仓可继续薄包装 `pnpm graph:*` → CLI。

## 6. 方案对比（摘要 · 详 R2）

| 方案 | 结论 |
|------|------|
| 整包 cp meta `tools/tech_graph` | **弃**：语言栈分裂、业务硬编码 |
| 仅文档告诉人「请自检 IB」 | **弃**：dogfood 已证明静默 PASS |
| IB 闸 + struct_rel + opt-in indexes + 迁移文档 | **推荐**（本 SPEC） |

## 7. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
