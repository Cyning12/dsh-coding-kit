# dsh-coding-kit · 业务仓速查

> 本文件为**手工嵌入**模板：复制本模板到业务仓即可，可手动删除。
> 现行 CLI `init`/`upgrade` 只写 `.cyning-harness/manifest.json`，不会生成本文件。

---

## 常用命令

```bash
# 30 前聚合验证（gate-check + audit D5 + S5 warn）
npx dsh-coding-kit verify [--target PATH] [--task docs/tasks/active/task_xxx.md]

# 仅人工闸
npx dsh-coding-kit gate-check [--target PATH] [--task docs/tasks/active/task_xxx.md]

# ICVO 审计（指定 task）
npx dsh-coding-kit audit [--target PATH] [--task docs/tasks/active/task_xxx.md]

# 生成 invoke 索引
npx dsh-coding-kit sync index [--target PATH]

# 升级 Harness 过程轨（仅写 manifest）
npx dsh-coding-kit upgrade [--target PATH] [--yes]

# 接入检查
npx dsh-coding-kit check [--target PATH]
```

---

## 备注

- 以上命令与 `npx dsh-coding-kit --help` usage 块逐条对齐；详细参数以 `--help` 为准。
- 本模板随包分发（`assets/harness/templates/`），经插件工具 `init_coding_kit` 整树复制到业务仓 `.coding-kit/`，此后由业务仓手工维护。
