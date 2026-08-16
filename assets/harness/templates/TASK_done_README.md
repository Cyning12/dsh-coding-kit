# done/ · 已完成任务导航（Hub）

> **用途**：日常浏览 **只打开本文件**；`_views/done.md` 为薄指针。  
> **真值**：各 task 文件头部 `状态` + 本目录（或域子目录）物理位置。  
> **落盘约定**：业务仓 `docs/tasks/done/` · 工作区 Harness `docs/harness/tasks/done/`（路径替换下方 `{tasks_root}`）。

---

## 域目录（domain）

| 域 slug | 目录 | 典型前缀 / 规则 |
|---------|------|-----------------|
| `harness` | `done/harness/` | `task_harness_*`（非产品里程碑） |
| `cyning-harness` | `done/cyning-harness/` | `task_harness_cyning_harness_*` · `task_harness_m2_cyning_*` |
| `engineering` | `done/engineering/` | `task_engineering_*` |
| `governance` | `done/governance/` | `task_governance_*` · `task_gov_*` |
| `chatbi` | `done/chatbi/` | `task_chatbi_*` |
| `standards` | `done/standards/` | `task_standards_*` |
| `epics` | `done/epics/` | Epic / MANIFEST 母单 · CLOSE 卡 |

**推断**：关账时按文件名前缀落入域目录；歧义时 task 元信息填 **`domain`** 字段。

---

## harness

| 关账日 | task | freeze_id / 摘要 |
|--------|------|------------------|
| YYYY-MM-DD | [`harness/task_<slug>_v1.md`](./harness/task_<slug>_v1.md) | … |

---

## cyning-harness（产品里程碑）

| 关账日 | task | tag / 摘要 |
|--------|------|------------|
| YYYY-MM-DD | [`cyning-harness/task_<slug>_v1.md`](./cyning-harness/task_<slug>_v1.md) | … |

---

## engineering

| 关账日 | task | 摘要 |
|--------|------|------|
| YYYY-MM-DD | [`engineering/task_<slug>_v1.md`](./engineering/task_<slug>_v1.md) | … |

---

## epics（母单 · MANIFEST）

| 关账日 | Epic / CLOSE | 子 task 索引 |
|--------|--------------|--------------|
| YYYY-MM-DD | [`epics/epic_<slug>.md`](./epics/epic_<slug>.md) | 见母单 §编排主表 |

---

## 关账维护（checklist）

1. `git mv {tasks_root}/active/<file>.md {tasks_root}/done/<domain>/`  
2. 头部 `> **状态**：done（YYYY-MM-DD 验收通过）`  
3. **本 Hub** 对应域表 **追加一行**（日期 · 链接 · freeze_id 一行摘要）  
4. **禁止**向 `_views/done.md` 追加长列表（保持 ≤15 行薄指针）  
5. 可选：同步 `_views/done_by_domain.md` 分组表  

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| YYYY-MM-DD | 初版 Hub（cyning-harness 模板嵌入） |

## 给维护者

`done`、`domain`、`Hub`、`_views`、`freeze_id`、`Epic`
