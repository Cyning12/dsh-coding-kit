# invoke · 30-execute + 40-self-check · 3-1-w4-graph-vocab

> **task_slug**：`3-1-w4-graph-vocab`  
> **hat**：30-execute · 40-self-check  
> **日期**：2026-10-10  
> **分支**：`task/specwave-3-1-w4-vocab`  
> **触发**：00 签收双闸 · GATE_VERIFY PASS · HG-AUDIT-R1 approved

## GATE_VERIFY

```text
node bin/specgate.js verify --target . --task docs/tasks/active/task_3_1_w4_graph_vocab.md
→ VERIFY: PASS · HG-AUDIT-R1 approved · ✅ 可 30
```

## 实现摘要

| 面 | 落点 |
|----|------|
| 加载合并 | `src/cli-graph-yaml.ts` · `GRAPH_VOCAB_CONFIG_REL` · `loadTechGraphVocab(targetRoot?)` 合并内置 + `.spec-wave/graph-vocab.yaml` · per-target cache |
| 钩②挂载 | `compileGraph` / `checkGraph` / `buildGraphPayload`（export）穿 `targetRoot` · CLI `cmdGraphYaml` 传 `--target` cwd |
| fail-loud | 坏 YAML / schema / kinds 同 id 不同 class → `GraphYamlError.exitCode=2` · CLI `fail('', err.exitCode)` |
| 可选诊断 | `graph vocab show [--target] [--json]`（A-opt1） |
| 测 | `test/graph-vocab.test.ts`（A1–A6 · N1 并集 · A-opt1） |
| 文档 | `README.md`「Repo vocab extension」节 |

## 验收对照

| ID | 结论 |
|----|------|
| A1 缺省等价 | ✅ |
| A2 扩展零 Warning | ✅ |
| A3 未登记仍 Warning | ✅ |
| A4 坏 YAML exit 2 | ✅ |
| A5 kinds 冲突 exit 2 | ✅ |
| A6 加载面 compile\|check | ✅ |
| A7 文档 | ✅ README |
| A8 零回归 | ✅ 四门绿 · 未改 drift/scaffold 语义 |
| A9 四门 + gate-check | ✅（`task close` 留 00） |
| A-opt1 vocab show | ✅ 已交付 |

## N1–N5 吸收

- N1：冲突仅 kinds 同 id 不同 class；edge 同名并集幂等（测锁）
- N2：compile / check / export 均穿 targetRoot
- N3：单源仍为 `loadTechGraphVocab`；仓级路径常量 `GRAPH_VOCAB_CONFIG_REL`（非第二硬拷贝枚举）
- N4：旧测影响面写入本 invoke + task 自检
- N5：SPEC W0 勾选非本棒

## 四门 + gate-check

- `npm run typecheck` → PASS  
- `npm test` → 959 pass / 0 fail / 1 skip  
- `npm run build` → PASS  
- `npm run test:lib` → 6 pass  
- `gate-check --task …` → 未发现阻塞  

## 禁区核对

- 未改 scaffold / drift 语义 · 未开 W5 · 未 bump/tag/push/publish  
- 未 `git add -A` · 未裹挟 `eval/external-oracle/`  
- 未污染本仓 `.spec-wave/graph-vocab.yaml`  

## 待 00

- `task close --yes`（本棒不关账）  
- 合入裁定  

Wiki: none
