# 01 · 问题陈述与目标

> **状态**：`draft` · 隶属 `doc-health`  
> **track**：`harness` / `docs-ops`  
> **观察锚点**：见 [`observations/2026-08-26_ops-desk-api_close-vs-archive.md`](./observations/2026-08-26_ops-desk-api_close-vs-archive.md)（观察 · 非冻结契约）

---

## 1. 问题陈述

### 1.1 CLOSE 语义分裂（主因）

| 层 | 当前常见含义 | 后果 |
|----|--------------|------|
| **invoke / 对话文案** | 「验收绿了 → 写 CLOSE: PASS」 | 任务仍停在 `active/`，状态已 `done`/`completed` |
| **CLI `task close` dry-run** | 守卫过 → 打印 `CLOSE: PASS`（**未** mv） | Agent/人误以为关账完成 |
| **CLI `task close --yes`** | 守卫过 → `active/` → `done/` 物理归档 | 真正接近 lifecycle 意图 |
| **lifecycle.yaml `close`** | 登记：`from: done` → `to: archived`；注释：active→done | 词表「archived」与目录名 `done/` 易混 |
| **Hub / done_by_domain** | 模板 checklist 要求追加索引行 | **非** `task close` 机械步骤 → 常漏、常拆二次请示 |

近期对照（ops-desk-api · structured-output / capability）：invoke 结论写「CLOSE: PASS」，同时 notes 写「暂留 active 待全波次 PR」——验收与归档/合入解耦，文档健康度下降。

### 1.2 文档可读性 / 健康度（长期）

非「技术债清单」主轴，而是文档资产是否：

- **可读**：读者路径清晰（维护者 / 00 / 30）
- **可导航**：Hub、索引、专属 SPEC 夹，少裸文件
- **可关账**：completed 不长期堆积在 `active/`
- **少腐烂**：死链、孤儿 task、Hub 与物理树不同步

### 1.3 SPEC 落盘形态漂移

- **正例**：`inform-graph-backfill/`、`agent-infra/`（专属夹）
- **反例趋势**：`docs/spec/SPEC-*.md` 裸挂根下 → 难读序、难分波、易与一次性功能 SPEC 混堆

---

## 2. 目标（完成态行为）

1. **CLOSE 完成态（DoD）** 对 Agent 与 CLI 同义：合入证据（或显式豁免）+ 物理归档 +（若启用）Hub 索引；禁止「仅验收文案叫 CLOSE」。  
2. **文案与机械闸一致**：dry-run / PASS / READY 用词不误导；模板（30/40/invoke/lifecycle 注释/help）同口径。  
3. **新长期 SPEC** 默认专属夹；本包自身示范。  
4. **健康度** 有可修订维度表 + 观察日志轨；脚本度量可后期 wave，不阻塞 C1。

---

## 3. 成功判据（产品语言）

- 一次 CLOSE 棒结束后：`active/` 无该 task；`done/`（或域子目录）有文件；Hub（若存在）有一行；关联 PR（若有代码）为 MERGED 或豁免留痕。  
- 新人打开 `docs/spec/` 能靠专属夹 README 读序进入，而不是扫一排裸 `SPEC-*.md`。  
- 维护者能从 `observations/` 看见腐烂信号，而不必重开业务 graph SPEC。

---

## 4. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | 初稿 |
