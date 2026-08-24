# harness/templates

复制到用户仓 **`docs/tasks/`** 或 **`docs/harness/tasks/active/`**（按仓约定）。

## v0.1 已交付（T3 · M2）

| 模板 | 状态 | 说明 |
|------|------|------|
| [`TASK_TEMPLATE.md`](./TASK_TEMPLATE.md) | ✅ | 单 task · Harness 元信息 · human_gate |
| [`TASK_epic.md`](./TASK_epic.md) | ✅ | Epic 总纲 + §3.1 编排主表 + 00 入口 |
| [`TASK_graph_bootstrap.md`](./TASK_graph_bootstrap.md) | ✅ | D4-a · **`HG-GRAPH-MODULES`** blocks **30** |
| [`ONTOLOGY_consumer_slice_v1.md`](./ONTOLOGY_consumer_slice_v1.md) | ✅ | 绿野 consumer ontology 切片（v2.17+ · 非 ontology-check） |
| [`QUICKREF_v1_zh.md`](./QUICKREF_v1_zh.md) | ✅ | 业务仓命令速查 · **手工嵌入**（复制到业务仓，非 CLI 生成；命令面钉 `npx dsh-coding-kit`） |

## v0.2.1 · done 分层索引

| 模板 | 状态 | 说明 |
|------|------|------|
| [`TASK_done_README.md`](./TASK_done_README.md) | ✅ | `done/README.md` Hub（按域分组表） |
| [`VIEW_done_by_domain.md`](./VIEW_done_by_domain.md) | ✅ | `_views/done_by_domain.md` |
| [`VIEW_done_thin_pointer.md`](./VIEW_done_thin_pointer.md) | ✅ | `_views/done.md` 薄指针（≤15 行） |
| [`FRAGMENT_task_domain_infer_v1_zh.md`](./FRAGMENT_task_domain_infer_v1_zh.md) | ✅ | 关账 `git mv` 域推断规则 |

现行**无自动安装器**；首次按下方「嵌入步骤」**手工**创建 `done/<domain>/` 子目录并复制 Hub / views（仅当目标文件不存在）。（旧包曾有 wizard 安装脚本，已废弃，未随包交付。）

## 嵌入步骤

```bash
mkdir -p docs/tasks/active docs/tasks/_views
mkdir -p docs/tasks/done/{harness,cyning-harness,engineering,governance,chatbi,standards,epics}
cp harness/templates/TASK_done_README.md docs/tasks/done/README.md
cp harness/templates/VIEW_done_thin_pointer.md docs/tasks/_views/done.md
cp harness/templates/VIEW_done_by_domain.md docs/tasks/_views/done_by_domain.md
mkdir -p docs/harness/reviews docs/harness/invokes/by-task
cp harness/templates/TASK_TEMPLATE.md docs/tasks/active/task_<slug>.md
# 存量首次：优先 TASK_graph_bootstrap.md
```

工作区 Harness 将 `{tasks_root}` 换为 `docs/harness/tasks`。

## 关账纪律

1. `git mv` → `done/<domain>/`（见 [`FRAGMENT_task_domain_infer_v1_zh.md`](./FRAGMENT_task_domain_infer_v1_zh.md)）  
2. 更新 `done/README.md` 域表 **一行**  
3. **勿**向 `_views/done.md` 追加百行长列表  

## 关联

- 图谱模板：[`graph/templates/`](../../graph/templates/README.md)
- ONBOARDING：见薄指针页 [`POINTER_ONBOARDING.md`](../../docs/POINTER_ONBOARDING.md)（原文不随包发布）§3 · §7
