# FRAGMENT · task 关账域推断（v1）

关账 `git mv` 目标子目录：

| 规则 | `done/<domain>/` |
|------|------------------|
| `task_harness_cyning_harness_*` · `task_harness_m2_cyning_*` | `cyning-harness/` |
| `task_harness_*` | `harness/` |
| `task_engineering_*` | `engineering/` |
| `task_governance_*` · `task_gov_*` | `governance/` |
| `task_chatbi_*` | `chatbi/` |
| `task_standards_*` | `standards/` |
| `epic_*` · `*MANIFEST*` · `*_loop_*` 母单 | `epics/` |
| task 元信息 `domain` 字段 | 以字段为准 |

歧义时：**人**在关账 commit 说明中写明域。
