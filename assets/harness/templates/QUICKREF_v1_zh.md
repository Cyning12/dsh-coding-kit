# cyning-harness · 业务仓速查

> 本文件由 `npx @cyning/harness init/upgrade` 自动生成，可手动删除。

---

## 常用命令

```bash
# 30 前聚合验证（gate-check + audit D5 + S5 warn + 可选 --graph）
npx @cyning/harness verify [--target .] [--task docs/tasks/active/task_xxx.md] [--graph] [--json] [--agent-hint] [--workspace-root PATH]

# 仅人工闸	npx @cyning/harness gate-check [--target .] [--task ...] [--graph] [--json]

# 生成 invoke 索引
npx @cyning/harness sync index [--target .]

# 升级 Harness 过程轨
npx @cyning/harness upgrade --target . --yes

# ICVO 审计（指定 task）
npx @cyning/harness audit --target . --task docs/tasks/active/task_xxx.md
```

## Node 仓可选路径

若 init/upgrade 时使用了 `--with-scripts`：

```bash
pnpm install
pnpm harness:verify --task docs/tasks/active/task_xxx.md
pnpm harness:gate
pnpm harness:audit --task docs/tasks/active/task_xxx.md
```

---

## 本地产品包覆盖

维护者开发时：

```bash
export CYNING_HARNESS=/path/to/cyning-harness
npx @cyning/harness verify --target .
```

业务仓无需 clone 产品包即可使用 CLI。
