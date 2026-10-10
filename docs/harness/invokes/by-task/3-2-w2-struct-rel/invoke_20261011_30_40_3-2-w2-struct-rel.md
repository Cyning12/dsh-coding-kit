# invoke · 30/40 · 3-2-w2-struct-rel

| 项 | 内容 |
|----|------|
| **hat_id** | `30` + `40` |
| **日期** | 2026-10-11 |
| **分支** | `task/specwave-3-2-w1-ib-check` |
| **verify** | PASS（HG-AUDIT-R1 approved · pre-30 invoke 齐） |

## 已办

1. `loadWhitelist` / `resolveStructRel`：可选 `struct_rel`（string · 相对 `--input`；缺省 `01_struct.md`；非 string / 绝对路径 → exit 2）  
2. `runGraphDrift` 用 `structRel` 拼路径；`struct_missing` / `struct_unparseable` 点名实际 rel  
3. 测：`test/graph-drift.test.ts` W2-A1–A5 + 既有零回归（共 17）  
4. 文档：README / README.zh-CN / 使用手册一行  
5. 附带：修 W1 close invoke UUID 伪链（S2 基线 36→34）  
6. 四门绿 · 未 bump/tag/push/publish  

## 下一棒

**00** `task close` / A8（本棒不 close）。
