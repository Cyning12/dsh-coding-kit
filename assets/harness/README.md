# harness · 过程轨

| 子目录 | 内容 | T3 状态 |
|--------|------|---------|
| [`templates/`](templates/) | task、Epic、graph_bootstrap | ✅ v0.1 |
| [`prompts/`](prompts/) | 10/22/30 Starter 子集 | ✅ v0.1 |
| [`invokes/`](invokes/) | invoke 落盘约定 + TEMPLATE | ✅ v0.1 |

用户仓对应路径建议：`docs/tasks/`、`docs/harness/prompts/`、`docs/harness/invokes/`。

## 嵌入一键清单

```bash
mkdir -p docs/tasks/active docs/harness/prompts docs/harness/invokes/by-task docs/harness/reviews
cp -R harness/templates/* docs/tasks/   # 或按需单文件复制并重命名
cp harness/prompts/*.md docs/harness/prompts/
cp harness/invokes/TEMPLATE_invoke.md docs/harness/invokes/
```
