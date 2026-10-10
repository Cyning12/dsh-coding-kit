# invoke · 30/40 · 3-2-w3-graph-indexes

| 项 | 内容 |
|----|------|
| **hat_id** | `30` + `40` |
| **日期** | 2026-10-11 |
| **分支** | `task/specwave-3-2-w1-ib-check` |
| **verify** | PASS（HG-AUDIT-R1 approved · pre-30 invoke 齐） |

## 已办

1. 新模块 `src/cli-graph-indexes.ts`：`graph indexes check` · 配置 `flow_globs`/`index_globs` · IB↔IX 双向 · 未配置 **exit 1 usage** · `--json` · 不进 verify  
2. 索引 MVP 形态钉死：`entries: [{path, symbol?}]`；glob 支持 `*`/`**`  
3. 测：`test/graph-indexes-check.test.ts` 10 例  
4. 四门绿 · 未 bump/tag/push/publish  

## 下一棒

**00** `task close` / A10（本棒不 close）。
