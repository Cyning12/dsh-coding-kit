# ACCEPTANCE · 3.1.0 minor（技术图谱脚手架 epic · W1–W4）台账

> **版本**：`spec-wave@3.1.0`（**待发版** · bump 已落 · tag/push/publish **仅人** · registry `latest` 仍为 `3.0.2` 直至人 publish · task slug `3-1-w5-release`）
> **task**：[`docs/tasks/active/task_3_1_w5_release.md`](../tasks/active/task_3_1_w5_release.md)（slug `3-1-w5-release` · epic SPEC [`../spec/3_1-tech-graph-scaffold/`](../spec/3_1-tech-graph-scaffold/)）
> **规划**：[`PLAN_3_1_tech_graph_scaffold_v1_zh.md`](PLAN_3_1_tech_graph_scaffold_v1_zh.md)（HG-NEXT-PLAN=approved · 2026-10-10）
> **SPEC**：[`../spec/3_1-tech-graph-scaffold/`](../spec/3_1-tech-graph-scaffold/)（HG-SPEC-SIGNOFF=approved · 2026-10-10）
> **依据**：W1–W4 done tasks + 各波 R1 审查文（PASS · blocking 0）+ 20 审 R1 [`../harness/reviews/task_3_1_w5_release_audit_R1_20261010.md`](../harness/reviews/task_3_1_w5_release_audit_R1_20261010.md)

## 波次台账（W1–W4 · 全 CLOSE: PASS）

| 波 | 摘要 | task · commit |
|----|------|---------------|
| W1 | `graph scaffold` 可审草稿（dry-run / `--yes` · full\|struct-only · `--strict` · REVIEW_CHECKLIST · 非已签收真值） | [`task_3_1_w1_graph_scaffold.md`](../tasks/done/task_3_1_w1_graph_scaffold.md)（`ec57eff`） |
| W2 | 入手链 DX（init quickstart · 手册/README · TASK_graph_bootstrap 优先 scaffold · skill/commands 指针） | [`task_3_1_w2_graph_dx.md`](../tasks/done/task_3_1_w2_graph_dx.md)（`ba9270b`） |
| W3 | `graph drift`（F-2 · 模块覆盖 + 锚点消失 + 白名单 · 只报告不重画） | [`task_3_1_w3_graph_drift.md`](../tasks/done/task_3_1_w3_graph_drift.md)（`357b31b`） |
| W4 | 仓级 `.spec-wave/graph-vocab.yaml`（F-1② · 与内置合并 · 冲突 fail-loud · 缺省=3.0.2 行为） | [`task_3_1_w4_graph_vocab.md`](../tasks/done/task_3_1_w4_graph_vocab.md)（`e979c57`） |

## SPEC `04` 验收总表对照（epic 级 · 本档勾选）

| 验收项 | 对照 |
|--------|------|
| 业务仓模拟 fixture：scaffold → compile/check → 清单存在 → 人签前闸仍 pending | ✅ W1 红测 + dogfood 路径覆盖；产物带草稿标记 · `HG-GRAPH-MODULES` 不自动 approved |
| 既有 `graph yaml *` 基线零回归 | ✅ W1–W4 四门绿 · 无改 `graph yaml *` 缺省判定松紧 |
| 漂移与仓级词表至少各一正向 + 一负向 | ✅ W3 / W4 fixture 与 task A* |
| 对外无「自动权威图谱」违纪表述 | ✅ README / 手册 / CHANGELOG 统一「可审草稿」口径 |

## 门禁基线（release 簿记棒 · 2026-10-10）

| 门禁 | 结果 |
|------|------|
| `npm run typecheck` | exit 0 |
| `npm test` | **960** · 957 pass + **2 tag-gated 设计红**（`release-tag-identity` / `pins-consistency` A 组 pin-10）+ 1 skip · **不是**产品回归 · 人打 `v3.1.0` 后须全绿 |
| `npm run build` / `test:lib` | exit 0 · test:lib **6/6** |
| `pins check` | **16/17** · 唯一偏差 = pin-10 git tag `v3.1.0` 缺失（**设计红** · 人打 tag 后须 **17/17**） |
| `assets verify` | **113/113**（pins fix 后 manifest rebuild ~3） |

## pin-10 设计红登记与清偿路径

- **登记**：bump 后 `pins check` 唯一偏差 = pin-10（tag `v3.1.0` 不存在 · 打 tag 前必经态 · 同 3.0.x 先例）。
- **清偿路径**：**人**按 HG-RELEASE-TAG-PUSH（仍 pending）执行 `git tag -a v3.1.0` → 复跑 `pins check` **17/17** + 全量 `npm test` 全绿 → `git push`（原子推）→ 人 `npm publish` → ⑨ 回填「已 published」。
- **本棒未清偿**：未执行 `git tag` / `git push` / `npm publish` / `npm deprecate`。

## 已知残余

- pin-10 / `release-tag-identity` 在人打 `v3.1.0` 前为**设计红** · 不记为产品回归。
- registry `latest` 与「3.1.0 已 published」叙事回填归人 publish 后 ⑨ · **本棒禁假 published**。
- SPEC `04` W0「W5 未开」勾选滞后 · 可由 00 关账时顺手勾选（非本棒硬义务）。

## 发布边界

- **bump 已落 · tag/push/publish 待人**（HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH = pending · Agent 永禁 publish）。
- RELEASING 人 checklist `3.1.0` 节：簿记就绪项可预勾 · **tag / push / publish / 打 tag 后 pins 17/17 / ⑨ 回填** 全未勾。
- 使用手册保留文件名 `docs/guides/使用手册-v3.0.0-zh.md`；头栏钉 `spec-wave@3.1.0`（**待发版**）。
- MIGRATION「3.0.2 → 3.1.0」节：无强制 · scaffold/drift/vocab **可选启用**。
- spec 索引 `3_1-tech-graph-scaffold` 行 → **IMPLEMENTED** · `` `3.1.0` 待发版（planned） ``（**非** published）。
