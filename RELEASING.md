# RELEASING · dsh-coding-kit 发版硬步骤 Checklist

> **制度化来源**：DEF-001 教训 —— 曾从未提交工作树 publish，导致发布物与仓库真值漂移、无法溯源。
> 本清单把「publish 前 commit + tag」固化为**硬步骤**：任何一步未完成即停止，不得跳步。
> `npm publish` **仅人执行**（Agent 禁止 publish / version bump）；①–⑦ 与 ⑨ 可由维护 Agent 准备与核验。

## 硬步骤（按序执行 · 全部满足后方可 publish）

- [ ] **① 工作树干净且所有改动已提交**：`git status --porcelain` 为空；拟发布内容全部进入 git 历史。**禁止从未提交工作树 publish**（DEF-001 教训：工作树残留 = 发布物不可溯源）。
- [ ] **② 质量闸门全绿**：`npm run typecheck && npm test && npm run build && npm run test:lib` 依次全绿（与 `prepublishOnly` 同一四门；任一红即停止，先修再发）。
- [ ] **③ CHANGELOG 版本节已归拢**：`CHANGELOG.md` 的 `## [Unreleased]` 内容已归入 `## [X.Y.Z] - YYYY-MM-DD` 版本节（日期 + 版本号齐全），无残留 Unreleased 条目遗漏。
- [ ] **④ 版本钉（pins）已同步**：新版本号已同步全部钉点 —— README 双文件（`README.md` / `README.zh-CN.md` 的版本提及）、含版本断言的测试、`assets/ontology.yaml`、`assets/harness/discipline-coverage.yaml`（`as_of_package_version`，由 `test/cli-discipline-coverage.test.ts` 钉死与 `package.json` 一致）。
- [ ] **⑤ npm version + tag**：`npm version <patch|minor|major>`（仅人执行 · 自动落 version commit + `vX.Y.Z` tag）；确认 tag 与 CHANGELOG 版本节一致。
- [ ] **⑥ PR 合并 + CI 绿**：发版 PR 已 merge 进 `main` 且 CI 全绿（**CI 未绿禁合**）；`git push` 含 `--follow-tags`（或单独 push tag），远端 main 与 tag 指向发布真值。
- [ ] **⑦ npm pack --dry-run 检查**：`npm pack --dry-run` 逐行核对 tarball 清单 —— 无 `test/` 泄漏、无工作区/私仓文件；仅 `package.json#files` 白名单（`bin` / `lib` / `assets` / `cordis.patch.yml` / `README.md` / `LICENSE`）内的内容入包。
- [ ] **⑧ npm publish（仅人）**：`npm publish`（`prepublishOnly` 会自动重跑②四门；⑦已人工核对清单）。Agent 不得执行本步。
- [ ] **⑨ publish 后核验 + 过程档状态更新**：`npm view dsh-coding-kit version`（及 `dist-tags`）确认新版本已生效；抽样 `npm pack dsh-coding-kit@latest` 或新装验证；随后更新过程档（release 记录 / 任务单 / 看板）状态为已发布。

## 禁令速查

- **禁止从未提交工作树 publish**（① · DEF-001）。
- **CI 未绿禁合**（⑥ · 合并前 CI 必须全绿）。
- Agent 禁止 `npm publish` / `npm version`（⑤⑧ 仅人）。
- `npm pack --dry-run` 清单异常（`test/` 泄漏、白名单外文件）→ 停止发版，先修 `files` 白名单或 .npmignore 口径（⑦）。
