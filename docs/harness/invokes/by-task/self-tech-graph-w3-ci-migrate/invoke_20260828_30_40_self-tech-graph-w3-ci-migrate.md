# Invoke：30（含 40）· self-tech-graph-w3-ci-migrate

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `self-tech-graph-w3-ci-migrate` |
| task_paths | `docs/tasks/active/task_self_tech_graph_w3_ci_migrate.md` |
| git_branch | `task/self-tech-graph-w3-ci-migrate` |
| created_utc_or_local | 2026-08-28 |

## 指令摘要

W3：新增 kit 自用 `tech-graph.yml`（npm ci 后本仓 bin compile + md git diff + check；禁 Python graph-compile.sh；禁对 graph.json git diff）。写 `02_version.md` 里程碑（1.9.x）。复制外置 `00_inventory/` 四份为 `reference/*_1.2.2.md`（只加文首锚、不改正文、不删原树）。填 POINTERS（含 #R07）。src/test 头注释 PRD_R07 改链。不 bump。

## 外置源（只读复制）

- 工作区 `docs/dsh_coding_kit_optimization/00_inventory/`（architecture / cli_surface / plugin_surface / assets_catalog）
- PRD 留外：`docs/dsh_coding_kit_optimization/06_epics/PRD_R07_ide_block_rewrite.md` → POINTERS #R07

## 维护者授权边界

- ✅ 00 已代签挡 30 闸
- ⛔ 不得 bump / tag / publish；版本叙述仅 **1.9.x**
- ⛔ 不得改 yaml 拓扑（除非 check 证明必须 · 须自检说明）

## 40 自检最低命令

- compile --all + `git diff --exit-code -- docs/_tech_graph/*.md`
- check --all
- task lint / verify --spec / verify --task
- npm test / typecheck

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 签收开 30 |
