# 00 · 政策与边界

> **状态**：`draft` · 隶属 `doc-health` SPEC 包  
> **受众**：00/10 规划 · 20-spec-audit · 30 执行前必读  
> **Open Folder**：`dsh-coding-kit/`  
> **不直接授权**：30 改码 / npm 发版

---

## 1. 本包定位

| 是 | 不是 |
|----|------|
| Harness / docs-ops **长期契约** SPEC | 单次业务功能 SPEC |
| CLOSE 完成态 + 文档资产健康 | 业务 HTTP / RAG / Agent 运行时设计 |
| kit 下游实现的 **需求真值** | 已发布 npm 行为说明书（发版后以 CHANGELOG 为准） |
| 消费者仓可先行的过程纪律 | 强制本波搬迁历史裸 SPEC 文件 |

---

## 2. 与既有资产边界

| 资产 | 本包关系 | 禁止 |
|------|----------|------|
| **coding_wiki** | CLOSE 后可选晋升；沿用既有 `close_wiki_*` | 不把健康度维度写进 wiki 当契约真值 |
| **guides / discussions** | 观察可引用；讨论可触发本包修订 | 不把讨论稿当已签 SPEC |
| **docs/_tech_graph/** | `graph_change_layer=none` | 不重开 Inform / graph 补齐；备注过长仅作可读性观察 |
| **docs/tasks/** | CLOSE 的物理对象；Hub 索引对象 | 不在本包直接 mv 业务仓 task |
| **既有 `close_*` 十一闸** | **叠加**，不替换 | 禁止平行再实现 invoke/验收/wiki 等同义闸 |
| **inform-graph-backfill** | **落盘形态参照**（专属夹） | 不合并进本包内容 |

---

## 3. 双仓职责

| 仓 | 职责 |
|----|------|
| **dsh-coding-kit** | CLOSE / lifecycle / prompts / CLI 闸与单测的 **实现真值**；本 SPEC 包物理落点 |
| **ops-desk-api 等业务仓** | 痛点观察源；W0 过程纪律可先行；SPEC 布局公约的消费者；**勿假装已改 npm** |

---

## 4. 非目标（强制）

1. 不在 kit 内强制自动 `gh pr merge`（只检查 MERGED / 等价合入证据）。  
2. 不绑架业务 `freeze_id` / HTTP 契约冻结。  
3. 不实现完整「文档健康度评分系统」脚本（可列后期 wave；本波以维度 + 观察日志为主）。  
4. 不删除或批量迁移业务仓根级历史 `docs/spec/SPEC-*.md`（仅观察 + 建议；迁移另开 task）。  
5. 不签发 `HG-SPEC-SIGNOFF` / `HG-AUDIT-R1`（人签）。

---

## 5. 授权阶梯

```text
本 SPEC draft
  → 人签 HG-SPEC-SIGNOFF
    → 00 起草 kit / 仓内 task（可分 wave）
      → 20-task-audit + HG-AUDIT-R1
        → 30 改码（仅授权路径内文件）
```

**本文件被打开 ≠ 已授权改 `src/`。**

---

## 6. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | 初稿 |
