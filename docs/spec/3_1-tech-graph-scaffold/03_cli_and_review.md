# 03 · 命令面与审核协议

> **状态**：`draft` · 隶属 `3_1-tech-graph-scaffold`  
> **说明**：下列命令名为产品意图钉；argv 细节以各波 task 复核 `src/cli-graph.ts` 现值为准。

---

## 1. 命令面（拟新增 / 扩展）

### 1.1 脚手架（核心 · W1）

```text
npx spec-wave graph scaffold [--target PATH] [--input DIR] [--stack auto|node|python]
                             [--mode full|struct-only] [--strict]
                             [--dry-run | --yes] [--overwrite-draft]
```

| 行为 | 约定 |
|------|------|
| 无 `--yes` 且无 `--dry-run` | 等同 dry-run：打印将写入路径与探测摘要，**零写盘** |
| 仅 `--dry-run` | 零写盘（与上同） |
| 仅 `--yes` | 写草稿集合（见 02 §2.3；范围受 `--mode` 约束） |
| `--yes` 与 `--dry-run` **同现** | **用法错误 · exit 1**（2026-10-10 裁决 · 消解 20 审 A3） |
| `--mode full`（**缺省**） | L0 + L1 + ≥1 主流程（新仓 / S0 默认） |
| `--mode struct-only` | 仅模块表 + 待补流程清单，**不**强行生成主流程 YAML（存量 S2+ · 消解 20 审 A4） |
| `--strict` | 轻检不过（非 TBD 锚点 path 不存在、或 glob 零命中等，见 §3）→ **exit 2**；无此旗标时同类问题仅 Warning 入清单（消解 20 审 A2） |
| 成功 | exit 0；stdout 给下一步：compile/check + 打开 `REVIEW_CHECKLIST.md` |
| 目标非空且无覆盖旗标 | exit 2 · 点名已有文件 |
| 非 git 仓 | 沿用既有 fail 形态 |

可选：脚手架成功后同进程调用 `compile --all`（推荐默认开；可用旗标关）。`--mode struct-only` 时若无 flow yaml，compile 范围以实现波钉死（至少不因缺 flow 误伤其它产物）。

### 1.2 既有编译链（不改默认语义）

```text
npx spec-wave graph yaml compile|export|check …
```

### 1.3 漂移（W3）

```text
npx spec-wave graph drift [--target PATH] [--input DIR] [--json]
```

### 1.4 词表（W4 · 加载面）

无独立「词表命令」亦可：在 `graph yaml compile|check` 加载链合并 `.spec-wave/graph-vocab.yaml`。若需显式诊断，可加 `graph vocab show`（实现波裁量 · 非硬门槛）。

## 2. 审核协议（人与 Agent 同一面）

### 2.1 审核清单产物

脚手架写盘时**唯一路径**（2026-10-10 维护者裁决 · 消解 20 审 A1）：

- `docs/_tech_graph/REVIEW_CHECKLIST.md`

> 曾并列候选 `.scaffold-review.md`（点文件）已弃用：共审清单须目录内默认可见，避免被忽略规则/隐藏文件漏看。

清单至少含：

| 节 | 内容 |
|----|------|
| 元信息 | 生成时间戳形态（内容戳或 ISO）· 命令版本 · stack 探测结果 |
| 模块表 | 每行 module_id / glob / 命中文件数 / 人勾选框 |
| 主流程 | 节点列表摘要 · 可疑 `TBD` 锚点列表 |
| Agent 可跑项 | 命令原文（相对路径）· 期望 exit |
| 人签提示 | `HG-GRAPH-MODULES` 仍 pending · 改签位置（task 或 `01_struct` 人签表） |

### 2.2 人审焦点

1. 一级模块是否像真架构（有无把测试夹、生成物当模块）  
2. 主路径是否像主业务（而非健康检查旁路）  
3. 明显错误锚点是否改为真实符号或标 `TBD`  

### 2.3 Agent 审焦点

1. 复跑清单中的机检命令  
2. 对照源码修正 YAML（**只改** `.graph.yaml` / `01_struct.md`）  
3. `compile` → `export` → `check`  
4. **禁止**代签 `HG-GRAPH-MODULES` / `HG-SPEC-SIGNOFF`  

### 2.4 审核结论落点

- 过程证据：invoke / reviews（S2 纪律）  
- 架构真值：仍是 YAML + 人签后的模块表  
- 生成物 Markdown：不手改；改源再编译  

## 3. 失败路径（可观测）

| 触发 | 系统行为 | 可重试 | 用户可见 |
|------|----------|--------|----------|
| `--yes` 与 `--dry-run` 同现 | exit 1 · 用法错误 | 是（去掉其一） | 点名互斥 |
| 已有非草稿图谱且无覆盖旗标 | exit 2 · 拒写 | 是（旗标或换目录） | 点名路径 |
| 探测零信号 | 仍写最小草稿 + 全 `TBD`（`--mode full` 时仍尝试 ≥1 空壳 flow） | 是（人补） | 清单「探测失败」节 |
| 锚点 path 不存在（非 TBD） | 默认 Warning 入清单；**`--strict` → exit 2** | 是 | 清单行 / stderr |
| glob 零命中 | 模块行标红 · 不自动删行；**`--strict` → exit 2** | 是 | 清单 |
| 浅扫触顶（深度/文件数/节点数） | 截断 · 清单「已截断」· exit 0（非失败） | — | 清单节 |
| 漂移（W3） | exit 2 · `--json` 列差异 | 是 | CI 红 |
| 仓级词表坏 YAML / 与内置冲突 | exit 2 fail-closed | 是 | 点名键 |
| 试图脚手架写 S2 过程域 | 机械拒写 | — | 错误信息 |

## 4. 与 init / host 的关系

| 命令 | 是否生成 `_tech_graph` |
|------|------------------------|
| `init` / `host apply` | **否**（本版不强制捆绑；可在 quickstart 文案提示下一步 `graph scaffold`） |
| `graph scaffold` | **是**（本版主入口） |

## 5. 修订

| 日期 | 摘要 |
|------|------|
| 2026-10-10 | draft · 10-spec |
| 2026-10-10 | 维护者裁决：审核清单唯一路径钉 `REVIEW_CHECKLIST.md`（弃 `.scaffold-review.md` · 消解 20 审 A1） |
| 2026-10-10 | 维护者裁决：做 `--strict` · `--yes`/`--dry-run` 同现 exit 1 · `--mode full\|struct-only` · 浅扫上限见 02（消解 20 审 A2–A5） |
