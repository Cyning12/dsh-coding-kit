# skills/ · Agent Skills 标准封装（生成物 · 勿手改）

> **本目录由 `npx dsh-coding-kit skills build` 生成**；真值 = `harness/prompts/` 条文（frontmatter + 正文）。
> 改动请改条文后重跑 build；`npx dsh-coding-kit skills check` 会拦截任何手改 drift。
> 规范：https://agentskills.io/specification

## 安装（各 client 路径不同 · 复制或软链均可）

| 路径 | 用途 | 谁写入 |
|------|------|--------|
| DSH `<repo>/.dsh/skills/` | 消费者 Skill 安装落点 | `npx dsh-coding-kit skills install` |
| DSH `$HOME/.dsh/skills/` | 用户级安装落点 | `npx dsh-coding-kit skills install --global` |
| Claude Code `<repo>/.claude/skills/` 或 `~/.claude/skills/` | Claude skill 目录 | 用户另拷或 `--out`；**默认不写** |

`.dsh/coding-kit` / `.coding-kit` 是规范覆盖（`apply_coding_standards` / `init_coding_kit`），**不是** skill 目录，禁止当作 install dest。

已验证（2026-08-22 · 对照 DSH 上游源码 deepseek-harness@141eb6f，dsh 0.1.0-rc.8）：DSH runtime **会自动扫描** `.dsh/skills` 与 `$HOME/.dsh/skills` 两个 **安装落点** 并 **按需加载**。证据锚点：`packages/skill/skill-filesystem/src/index.ts:246`（`<projectRoot>/.dsh/skills`，rank 100）与 `:253`（`$DSH_HOME` 或 `~/.dsh` 下 `skills/`，rank 400）；目录级文档 `docs/subsystems/skills.md`「Local discovery priority」表同口径。结构要求：目录包 `<name>/SKILL.md` 或平铺 `<name>.md`（index.ts:724-728）；frontmatter 必填 `name`/`description`，`name` 须 kebab-case（index.ts:810-816）。扫描/加载属 DSH runtime 行为契约，随上游版本演进，锚点对应 0.1.0-rc.8。

## 技能清单

| skill | hat_id | 用途 |
|-------|--------|------|
| [`harness-10-spec/`](./harness-10-spec/SKILL.md) | 10-spec | 起草/修订 SPEC（SDD 需求规格：背景/范围/非范围/验收/failure_paths + R0–R5 思考轮回填）。 |
| [`harness-10-task/`](./harness-10-task/SKILL.md) | 10-task | 起草/修订 Harness task 文件（验收标准、failure_paths、非范围、依赖、思考轮控制表 R0–R5）。 |
| [`harness-20-spec-audit/`](./harness-20-spec-audit/SKILL.md) | 20-spec-audit | 书面审查 SPEC：核对范围/非范围/验收/failure_paths 与 R0–R5 思考轮控制，结论落盘 docs/harness/reviews/ 审查文。 |
| [`harness-20-task-audit/`](./harness-20-task-audit/SKILL.md) | 20-task-audit | 书面审查 Harness task 文件（R 轮）：对照 SPEC 核对范围/非范围/验收/failure_paths/思考轮，结论落盘 docs/harness/reviews/ 审查文。 |

## 执行帽缺席说明

`harness-30-execute` / `harness-40-self-check`（执行帽）**不在本分发**：其 skill 化须先通过 T1 闸绕开评测（`eval/t1_gate_bypass/` S1–S3）。
评测/维护者可用 `npx dsh-coding-kit skills build --with-execute-hats` 本地生成（仅供评测环境，勿装入生产 client）。
