# invoke · 00 签收 · 3-1-w5-release

> **task_slug**：`3-1-w5-release`  
> **hat**：00  
> **日期**：2026-10-10  
> **触发**：维护者「继续 W5」· 沿用签收过程文档授权 · 20 审 R1 PASS · blocking 0

## 动作

1. 采信 [`task_3_1_w5_release_audit_R1_20261010.md`](../../../../harness/reviews/task_3_1_w5_release_audit_R1_20261010.md)  
2. task 表 **仅** HG-TASK-DRAFT / HG-AUDIT-R1 → **approved**  
3. **HG-RELEASE-TAG-PUSH / HG-RELEASE-PUBLISH 保持 pending**（未授权代签）  
4. `verify --task` 须 ✅ 可 30  
5. 派发 **30-execute**（簿记 bump · 仍禁 tag/push/publish）

## 约束（给 30）

- 分支：`task/specwave-3-1-w5-release`
- bump `3.1.0` · CHANGELOG / MIGRATION / 手册 / ACCEPTANCE / spec 索引 / pins / RELEASING
- **禁止**：`git tag` · `git push` · `npm publish` / `npm deprecate`
- 禁 `git add -A` · 勿裹挟 `eval/external-oracle/`
- 对外禁假「已 published」

## 本窗

未改实现码 · 已签过程双闸 · 未签 RELEASE · 已派 30。
