# Invoke：30（含 40）· self-tech-graph-w1-struct

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `self-tech-graph-w1-struct` |
| task_paths | `docs/tasks/active/task_self_tech_graph_w1_struct.md` |
| git_branch | `task/self-tech-graph-w1-struct` |
| created_utc_or_local | 2026-08-28 |

## 指令摘要

W1 纯文档：按 **1.9.0 `src/*.ts` 实读** 写 `docs/_tech_graph/01_struct.md`（职责·读·写·被谁调 · 覆盖全部 17 文件 · 相对 1.2.2 增量节）。伴生：ledger 补录 DEF-028~033；R-05 不回写外置；M-3 遗留有用剔除 / 无用 stale。禁止 yaml 构图、改 src、物理迁移、发版。

**闸**：task 表 HG-AUDIT-R1=approved。SPEC `HG-GRAPH-MODULES` 仍 pending **不挡本波**（本波就是写该闸的签收物）。

## 外置树路径（只读参考）

- `/Users/cyning/Desktop/Projects/docs/dsh_coding_kit_optimization/00_inventory/architecture.md`（禁止照抄）
- `/Users/cyning/Desktop/Projects/docs/dsh_coding_kit_optimization/01_defects/defect_register.md`（DEF-028~033）
- `/Users/cyning/Desktop/Projects/docs/harness/tasks/active/`（M-3 扫描）

## 维护者授权边界

- ✅ 00 已代签 HG-SPEC-SIGNOFF / HG-TASK-DRAFT / HG-AUDIT-R1
- ⛔ 不得 bump 版本 / tag / publish
- ⛔ 不得改 `src/`

## 40 自检最低命令

- `node bin/dsh-coding-kit.js task lint --file docs/tasks/active/task_self_tech_graph_w1_struct.md`
- `node bin/dsh-coding-kit.js verify --spec docs/spec/self-tech-graph/README.md`
- `node bin/dsh-coding-kit.js verify --task docs/tasks/active/task_self_tech_graph_w1_struct.md`
- `npm run typecheck` · `npm test`（无 src 变更仍须绿）
- 差集：`ls src/*.ts` vs `01_struct.md` 模块表

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 签收开 30 |
