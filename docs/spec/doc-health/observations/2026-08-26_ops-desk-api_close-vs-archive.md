# 观察 · 非冻结契约

> **标题**：ops-desk-api · CLOSE 文案与归档 / Hub 拆棒  
> **日期**：2026-08-26  
> **对照仓**：`ops-desk-api/`（只读观察）  
> **Open Folder（本 SPEC）**：`dsh-coding-kit/`  
> **观察者角色**：10-spec（旁路引用 invoke / tasks）  
> **效力**：观察 · **非**冻结契约；升格见 `02_close_binding.md` / `01_problem_and_goals.md`

---

## 1. 现象（可复现路径）

1. **invoke 自称 CLOSE: PASS，task 仍在 active**  
   - 例：`docs/harness/invokes/by-task/structured-output-gateway-p0/invoke_20260826_CLOSE_structured-output-gateway-p0.md`  
   - 元信息 `task_paths` 指向 `docs/tasks/active/…`；notes 写「暂留 active 待全波次 PR」  
   - 正文结论：**CLOSE: PASS**（语义 = 复检/验收绿，而非 `task close --yes`）

2. **lifecycle 意图 vs 口语**  
   - kit `lifecycle.yaml`：`close` 为 `done → archived`，描述为 task close · active→done  
   - 业务口语常把「CLOSE」当成 50/00 验收标签，归档 / Hub 另开第二次请示

3. **Hub 非机械步骤**  
   - kit 模板 `TASK_done_README.md` 要求 `git mv` + Hub 追加行  
   - 当前 `task close --yes` 只做 `renameSync` 到 `done/`（默认无 domain 子目录、**不**改 Hub）

4. **CLI dry-run 用词**  
   - 无 `--yes` 时仍打印 `CLOSE: PASS`，仅多一行 `mode: dry-run（未执行 mv…）`  
   - 与 invoke 文案叠加后，更容易「以为关账完成」

5. **SPEC 根级裸文件（旁证）**  
   - `ops-desk-api/docs/spec/` 存在多份根级 `SPEC-*.md`；同时已有 `inform-graph-backfill/`、`agent-infra/` 专属夹正例  
   - 本波**不搬迁**；作可发现性观察

---

## 2. 影响维度（对照 C3）

| 维度 | 影响 |
|------|------|
| 关账闭环 | 高：CLOSE 与归档/合入/Hub 分裂 |
| 新鲜度 | 高：completed 语义文件留在 active |
| 可发现性 | 中：Hub / 裸 SPEC |
| 单源真值 | 中：invoke「PASS」与 CLI「PASS」不同义 |

---

## 3. 建议升格？

| 建议 | 目标节 |
|------|--------|
| **是** | `02_close_binding.md` DoD · 词表 · Hub/PR 闸 |
| **是** | `process/agent_close_discipline.md` W0 先行 |
| **是（公约）** | `03_spec_layout_convention.md`（禁新增裸 SPEC） |
| **否（本波）** | 立即 mv 历史裸 SPEC；立即改 ops-desk-api app/ |

---

## 4. 非建议

- 不在本观察驱动下直接改 `ops-desk-api/app/**`  
- 不把「待全波次 PR」当作永久豁免而不留痕  
- 不把本观察当作已签 `HG-SPEC-SIGNOFF`

---

## 5. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | 初记 |
