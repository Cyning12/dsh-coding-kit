# 04 · 执行波次（self-tech-graph）

> **状态**：`draft` · 每波 = 一个 task（10-task 起草 · 20 审 · 人闸 · 30/40 · 50 · CLOSE）

| 波 | 内容 | 依赖 | 人闸 |
|----|------|------|------|
| **W0** | 盘点复核：三树 diff（重点 ledger vs 01_defects 去重清单）· 迁/留判定定稿 · **定稿见** [`reference/W0_inventory_diff_20260827.md`](./reference/W0_inventory_diff_20260827.md) | SPEC 签收 | HG-SPEC-SIGNOFF |
| **W1** | L1：`01_struct.md` 模块边界表（按 1.9.0 src/ 实读重核 · 参考 00_inventory 不照抄） | W0 | **HG-GRAPH-MODULES** |
| **W2** | L0+L2：`00_main` + 4 条 `10_flow_*` 的 `.graph.yaml` 构图 · compile/export/check 绿 | W1 | — |
| **W3** | CI `tech-graph.yml` 入仓 · `02_version.md` 首版 · 获批迁移项执行（reference/ + POINTERS + 死链 grep） | W2 | — |
| **W4** | 收口：assets 模板/ONBOARDING 以 kit 自身 dogfood 案例互链（若自然）· CHANGELOG 记 Docs 条 | W3 | — |

**串行理由**：W1 模块表是 W2 构图节点真值；W3 CI 依赖 W2 产物。

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-27 | 初稿 |
