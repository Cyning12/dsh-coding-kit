# ACCEPTANCE · 3.2.0 minor（图谱 IB · struct_rel · indexes · 迁移文档 epic · W1–W4）台账

> **版本**：`spec-wave@3.2.0`（**待发版** · bump 已落 · tag/push/publish **仅人** · registry `latest` 仍为 `3.1.0` 直至人 publish · task slug `3-2-w5-release`）
> **task**：[`docs/tasks/done/task_3_2_w5_release.md`](../tasks/done/task_3_2_w5_release.md)（slug `3-2-w5-release` · epic SPEC [`../spec/3_2-graph-ib-and-indexes/`](../spec/3_2-graph-ib-and-indexes/)）
> **规划**：[`PLAN_3_2_graph_ib_and_indexes_v1_zh.md`](PLAN_3_2_graph_ib_and_indexes_v1_zh.md)（HG-NEXT-PLAN=approved · 2026-10-10）
> **SPEC**：[`../spec/3_2-graph-ib-and-indexes/`](../spec/3_2-graph-ib-and-indexes/)（HG-SPEC-SIGNOFF=approved · 2026-10-10）
> **依据**：W1–W4 done tasks + 各波 R1 审查文（PASS · blocking 0）+ 20 审 R1 [`../harness/reviews/task_3_2_w5_release_audit_R1_20261011.md`](../harness/reviews/task_3_2_w5_release_audit_R1_20261011.md)

## 波次台账（W1–W4 · 全 CLOSE: PASS）

| 波 | 摘要 | task · commit |
|----|------|---------------|
| W1 | `graph ib check`（节点 `implementedBy.path` 存在性 · MVP · `--json`） | [`task_3_2_w1_graph_ib_check.md`](../tasks/done/task_3_2_w1_graph_ib_check.md)（`a78ac3c`） |
| W2 | `struct_rel` 可配置模块表路径（缺省 `01_struct.md` · fail-closed） | [`task_3_2_w2_struct_rel.md`](../tasks/done/task_3_2_w2_struct_rel.md)（`3df6518`） |
| W3 | `graph indexes check`（IB ↔ indexes 双向 · opt-in · 不进默认 verify） | [`task_3_2_w3_graph_indexes.md`](../tasks/done/task_3_2_w3_graph_indexes.md)（`8f2ed88`） |
| W4 | yaml 双栈迁移文档 + 保真分责表（drift / ib / indexes / AST 未交付） | [`task_3_2_w4_migration_docs.md`](../tasks/done/task_3_2_w4_migration_docs.md)（`cbad4a6`） |

## SPEC `04` 验收总表对照（epic 级 · 本档勾选）

| 验收项 | 对照 |
|--------|------|
| fixture：假 IB path → ib check exit 2；真 path → exit 0；无 IB → exit 0 | ✅ W1 红测 + task A* |
| fixture：`struct_rel` 指向分层模块表 → drift 可按新路径工作；缺省行为 = 3.1 | ✅ W2 fixture + task A* |
| fixture：indexes 单向漂移 → exit 2（在已配置前提下） | ✅ W3 fixture + task A* |
| 既有 drift / yaml / scaffold 基线零回归 | ✅ W1–W4 四门绿 · 未改 3.1 drift/`graph yaml *` 缺省判定 |
| 对外无「已含 AST 深闸」违纪表述 | ✅ W4 分责表 / README / 手册口径（AST = 未交付 · 另 Epic） |

## 门禁基线（release 簿记棒 · 2026-10-11）

| 门禁 | 结果 |
|------|------|
| `npm run typecheck` | exit 0 |
| `npm test` | **985** · **982 pass** + **2 tag-gated 设计红**（`release-tag-identity` / `pins-consistency` A 组 pin-10）+ 1 skip · **不是**产品回归 · 人打 `v3.2.0` 后须全绿 |
| `npm run build` / `test:lib` | exit 0 · test:lib **6/6** |
| `pins check` | **16/17** · 唯一偏差 = pin-10 git tag `v3.2.0` 缺失（**设计红** · 人打 tag 后须 **17/17**） |
| `assets verify` | **113/113** |

## pin-10 设计红登记与清偿路径

- **登记**：bump 后 `pins check` 唯一偏差 = pin-10（tag `v3.2.0` 不存在 · 打 tag 前必经态 · 同 3.1.0 先例）。
- **清偿路径**：**人**按 HG-RELEASE-TAG-PUSH（仍 pending）执行 `git tag -a v3.2.0` → 复跑 `pins check` **17/17** + 全量 `npm test` 全绿 → `git push`（原子推）→ 人 `npm publish` → ⑨ 回填「已 published」。
- **本棒未清偿**：未执行 `git tag` / `git push` / `npm publish` / `npm deprecate`。

## 已知残余

- pin-10 / `release-tag-identity` 在人打 `v3.2.0` 前为**设计红** · 不记为产品回归。
- registry `latest=3.1.0`（已 published）· 「3.2.0 已 published」叙事回填归人 publish 后 ⑨ · **本棒禁假 published**。
- SPEC `04` W5 勾选 / PLAN 修订可由 00 关账时顺手回填（非本棒硬义务除非另授）。

## 发布边界

- **bump 已落 · tag/push/publish 待人**（HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH = pending · Agent 永禁 publish）。
- RELEASING 人 checklist `3.2.0` 节：簿记就绪项可预勾 · **tag / push / publish / 打 tag 后 pins 17/17 / ⑨ 回填** 全未勾。
- spec 索引 `3_2-graph-ib-and-indexes` 行 → **IMPLEMENTED** · `` `3.2.0` 待发版（planned） ``（**非** published）。
