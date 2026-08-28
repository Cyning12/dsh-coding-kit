# graph/templates

复制到用户仓 **`docs/_tech_graph/`**。

## v0.2 已交付模板（T2 · YAML-first）

| 文件 | 状态 | 说明 |
|------|------|------|
| [`00_main.graph.yaml`](./00_main.graph.yaml) | ✅ | 顶层流程（唯一编辑源） |
| [`00_main.md`](./00_main.md) | ✅ | 顶层流程（编译生成物） |
| [`01_struct.md`](./01_struct.md) | ✅ | **模块边界表**（D4-a · **HG-GRAPH-MODULES** 人签真值） |
| [`10_flow_MAIN.graph.yaml`](./10_flow_MAIN.graph.yaml) | ✅ | 主路径 flow 示例（唯一编辑源） |
| [`10_flow_MAIN.md`](./10_flow_MAIN.md) | ✅ | 主路径 flow 示例（编译生成物） |
| [`99_mermaid_protocol.md`](./99_mermaid_protocol.md) | ✅ | Mermaid 拓扑协议（YAML-first） |

## 仍可选补（非 T1 硬门槛）

| 文件 | 说明 |
|------|------|
| `02_version.md` | 版本时间线；新仓建议嵌入后首周补 |

## 编辑与复制流程

1. **改图**：只改 `.graph.yaml`，不要手写 `.md`。
2. **编译**（业务仓根，本包作为依赖安装后）：
   ```bash
   npx dsh-coding-kit graph yaml compile --all --input docs/_tech_graph
   ```
3. **校验**（两步：先 `export` 生成 `shared/graph.json`，再 `check` 做 YAML ↔ graph.json 切片比对）：
   ```bash
   npx dsh-coding-kit graph yaml export --input docs/_tech_graph
   npx dsh-coding-kit graph yaml check --all --input docs/_tech_graph
   ```
4. **复制到业务仓**（模板源在本包 assets 内）：
   ```bash
   mkdir -p docs/_tech_graph
   cp -R node_modules/dsh-coding-kit/assets/graph/templates/* docs/_tech_graph/
   # 按需删除 README 或本说明段
   ```

## 业务仓专属产物

以下文件是业务仓运行时 artifact，**不在模板包中生成空壳**：

- `_manifest.json`
- `_contract_manifest.json`
- `_test_manifest.json`

业务仓应基于真实 endpoint / RPC / 表 / 事件契约，通过自身 CI（如 `tech-graph.yml`、`tech-graph-contract.yml`）生成并校验这些 manifest。模板包仅提供 `.graph.yaml` → `.md` 的简化编译流。

## 嵌入后

- **新仓**：骨架 + 模块表人签 + 至少 1 主 flow（见薄指针页 [`POINTER_ONBOARDING.md`](../../docs/POINTER_ONBOARDING.md) · 原文 §3）
- **存量**：按 ONBOARDING 档位 S0～S3；**禁止**首次全 flow 构图
- **人签**：`01_struct` 模块表 → **HG-GRAPH-MODULES** approved → 允许 30 改码

## 本包 dogfood

kit **源码仓**自图在 `docs/_tech_graph/`（L0 `00_main` · L1 `01_struct` · L2 四条 `10_flow_*`）；CI 为 `.github/workflows/tech-graph.yml`（本仓 bin compile/check）。
**`docs/` 不随 npm 包发布**；请到源码仓查看：https://github.com/Cyning12/dsh-coding-kit/tree/main/docs/_tech_graph

## 历史说明

- v0.1 使用 `.md` + `.ai.md` 双轨；v0.2 起改为 YAML-first，`.ai.md` 已弃用。
- 复杂业务仓应采用 `.graph.yaml` 源 + manifest/contract CI；本模板包（dsh-coding-kit）维持简化编译流。
- v1.2.4（DEF-006）：编译/校验命令面迁移至本包 `npx dsh-coding-kit graph yaml compile|export|check`；`00_main.md`/`10_flow_MAIN.md` 以本包编译器重生成（输出契约见 `99_mermaid_protocol.md` §7）。
