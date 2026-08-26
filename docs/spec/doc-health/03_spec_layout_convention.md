# 03 · SPEC 落盘布局公约（C2）

> **状态**：`draft` · 隶属 `doc-health`  
> **参照**：业务仓 `docs/spec/inform-graph-backfill/`（README + 00_policy + waves + 子目录）  
> **正例**：`docs/spec/agent-infra/`（已是专属夹 · 可接受）  
> **本包**：`docs/spec/doc-health/` 自身示范

---

## 1. 一般规则

| 规则 | 说明 |
|------|------|
| **新长期 SPEC** | 必须落在 `docs/spec/<slug>/` **专属文件夹** |
| **包内必有** | `README.md`（状态 · 读序 · 目录树 · wave/索引 · 人闸） |
| **根目录允许** | `docs/spec/README.md` 总索引（可选）；**历史**单文件迁移说明 |
| **禁止** | 新增「单文件直接躺在 `docs/spec/SPEC-*.md`」而不建专属夹 |
| **短期 / 一次性** | 仍鼓励专属夹；若极短可先夹后文，但 **不要**继续扩大根级裸文件集合 |

`<slug>` 建议：短横线小写英文（如 `doc-health`、`inform-graph-backfill`、`agent-infra`）。

---

## 2. 推荐最小树

```text
docs/spec/<slug>/
├── README.md                 # 总纲 · 读序 · 人闸
├── 00_policy_and_boundaries.md
├── 01_….md                   # 按域拆分
└── （可选）process/ · observations/ · modules/ · layers/ · ci/
```

波次多、模块多时：学习 `inform-graph-backfill` 的 `layers/` + `modules/`；基础设施族谱：学习 `agent-infra/` 多 SPEC 同夹索引。

---

## 3. 对 ops-desk-api 的说明（观察级）

| 路径 | 判定 | 建议 |
|------|------|------|
| `docs/spec/inform-graph-backfill/` | ✅ 专属夹范本 | 新包对齐 |
| `docs/spec/agent-infra/` | ✅ 已符合专属夹 | 保持；子 SPEC 用夹内文件 |
| `docs/spec/SPEC-*.md`（根级裸文件） | ⚠️ 历史可接受 | **不强制搬迁**；**warn**；新包禁止再增加；迁移另开 task |

迁移建议（**不**在本波执行）：

1. 建 `docs/spec/<slug>/`，将裸文件移入（或改名为夹内 `SPEC-…_vN.md` + README 读序）。  
2. 根目录留一行 POINTER：`已迁至 docs/spec/<slug>/`。  
3. 更新 task / wiki 死链。

### 历史裸 SPEC · warn 如何让人感知（已拍板 · 2026-08-26）

**决议**：采用推荐组合 —— **`docs/spec/README` 历史债索引表（立刻）** + **CLI / `verify` warn（随 kit 发版）**；CI annotations 可选。Warn **不**挡 close / **不**挡 merge。

| 通道 | 状态 |
|------|------|
| 索引表 | **立刻**：试点仓 ops-desk-api 已建 `docs/spec/README.md` 历史债分区；kit 侧见本仓 `docs/spec/README.md` |
| CLI / verify warn | **W4/W5** 实现；stdout `WARN: docs/spec 根级裸 SPEC-*.md（N）` |
| CI | 可选，试点可后加 |
| 仅 observations | **不足**单独作感知 |

「warn」若只写在本公约文、无上表通道 → 视为未交付感知。

---

## 4. kit 仓侧

本包落在 **dsh-coding-kit** `docs/spec/doc-health/`：

- 建立 kit 内 `docs/spec/` 公约示范（此前以 `docs/releases/` + 根 `SPEC.md` 为主）。  
- kit 根 `SPEC.md` 仍为产品总 SPEC，**不**要求拆进本夹；本夹专管 **docs-ops / CLOSE 健康度** 长期轨。  
- 发版说明可在 `docs/releases/` 链到本包 README。

---

## 5. 验收（C2）

- [x] 本包路径为专属夹 `docs/spec/doc-health/`（非根级裸文件）  
- [ ] README 含目录树与读序（见包根 README）  
- [ ] 公约文指出 agent-infra 正例与根级裸 SPEC 迁移建议（观察、本波不搬）  
- [ ] 下游：消费者仓 CONTRIBUTING / docs/spec README（若有）增加「新 SPEC 专属夹」一句（W4）

---

## 6. failure_paths（C2）

| ID | 触发 | 行为 |
|----|------|------|
| F-C2-01 | 00/10 又在 `docs/spec/` 根下新建裸 `SPEC-foo_v0.md` | 20-spec-audit / 维护者打回；要求改专属夹 |
| F-C2-02 | 误把本公约当成「立即迁移全部历史文件」 | 指出非范围；另开迁移 task |

---

## 7. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | C2 初稿 |
| 2026-08-26 | warn 感知拍板：索引表+CLI；试点 api 已建历史债表 |
