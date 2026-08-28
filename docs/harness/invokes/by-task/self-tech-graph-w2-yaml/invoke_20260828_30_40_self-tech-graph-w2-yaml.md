# Invoke：30（含 40）· self-tech-graph-w2-yaml

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `self-tech-graph-w2-yaml` |
| task_paths | `docs/tasks/active/task_self_tech_graph_w2_yaml.md` |
| git_branch | `task/self-tech-graph-w2-yaml` |
| created_utc_or_local | 2026-08-28 |

## 指令摘要

W2：按 `01_struct.md` + `src/` 实读写 5 份 `docs/_tech_graph/*.graph.yaml`（`00_main` + 四条 `10_flow_*`），复制 protocol，compile/export/check 绿。禁止抄 templates 的 Python/HTTP 节点。禁止改 src、禁止 bump（拟发版只允许 1.9.x 叙述）、禁止加 CI、禁止手写 flowchart md。

**闸**：HG-GRAPH-MODULES=approved → **可以写 yaml**。

## 40 自检最低命令

- 三命令：`graph yaml compile --all --input docs/_tech_graph` · `export --input docs/_tech_graph` · `check --all --input docs/_tech_graph`
- `rg -n "src/main.py|handlers/resource.py" docs/_tech_graph/*.graph.yaml` 应无命中
- `task lint` / `verify --spec` / `verify --task`
- `npm run typecheck` · `npm test`

## 维护者授权边界

- ✅ 00 已代签全部挡 30 闸
- ⛔ 不得 bump / tag / publish；版本叙述仅 **1.9.x**

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | 00 签收开 30 |
