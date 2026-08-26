# process · Agent CLOSE 纪律（仓内可先行）

> **状态**：`draft` · 隶属 `doc-health`  
> **用途**：给 **00 / 30 / CLOSE** Prompt 与 invoke 快照写清关账同棒要点  
> **效力**：过程纪律；**先于** npm 发版可在业务仓执行（W0）  
> **真值升级**：kit 闸落地后以 CLI 机械结果为准，本文不逆闸

---

## 1. 一句话纪律

验收绿了只叫 **复检通过**；只有做完「合入证据（或豁免）+ `task close --yes` + Hub（若启用）」才准在交付摘要写 **CLOSE 完成 / CLOSE: PASS**。

---

## 2. 00 / CLOSE 棒应写清的清单

开 CLOSE 或关账棒时，Prompt / invoke 应显式要求（可勾选）：

1. 确认 task 状态为 done/completed，验收勾选与自检已回填（对应既有 close_*）。  
2. 若有代码变更：关联 PR 已 **MERGED**（或写明 `--allow-no-pr-merge` / `close_pr_policy: exempt` 理由）。  
3. 真跑：`npx dsh-coding-kit task close --file <task> --yes`（先无 `--yes` 仅作预检时，摘要须写 **dry-run / READY**，禁止写完成态 PASS）。  
4. 确认文件已离开 `active/`，进入 `done/`（或域子目录）。  
5. 若仓启用 Hub：在 Hub 对应域表 **追加一行**；可选同步 `_views/done_by_domain`。  
6. invoke 元信息 `task_paths` 更新为 **归档后路径**（不要仍指向 active）。  
7. 禁止 notes 写「CLOSE: PASS 但暂留 active」而不开豁免/后续清理 task。

---

## 3. 30 棒应预埋什么

- 不要承诺「本棒只验收、归档交给别人」除非 task 非范围写明且 00 已建清理 task。  
- 合并策略：代码 PR 与文档归档可分 commit，但 **CLOSE 棒必须看到 MERGED（或豁免）** 再宣称关账完成。  
- 不在 30 输出里滥用「CLOSE: PASS」字样（留给真正关账）。

---

## 4. 与 kit 现状对齐（避免幻觉）

| 能力 | 现状 | W0 怎么做 |
|------|------|-----------|
| `task close` 十一闸 | 已有 | 继续先过闸 |
| dry-run 打印 `CLOSE: PASS` | 易误导 | 人工摘要改称 READY；等 W1 改 CLI |
| PR MERGED 闸 | 无 | 人工查 `gh pr view`；等 W2 |
| Hub 自动更新 | 无 | 人工改 Hub；等 W3 |

---

## 5. 可复制片段（给 invoke · 外层长围栏）

维护者粘贴到 CLOSE invoke「交付摘要」上方时可用：

`````text
关账清单（W0）
- [ ] 复检绿（verify / 测试）——此条 alone ≠ CLOSE 完成
- [ ] PR MERGED 或豁免理由已写
- [ ] 已执行：npx dsh-coding-kit task close --file <path> --yes
- [ ] active 已无该文件；done 可打开
- [ ] Hub（若启用）已追加行
- [ ] 本 invoke 禁止在未完成上列时写 CLOSE: PASS
`````

---

## 6. failure_paths（过程）

| ID | 触发 | 处理 |
|----|------|------|
| F-P-01 | Agent 只写 PASS 不 mv | 00 打回；补 W0 清单 |
| F-P-02 | 留 active 等「全波次 PR」 | 要么豁免+清理 task，要么等合入再 CLOSE |
| F-P-03 | Hub 漏更新 | 补行后再宣称关账完成 |

---

## 7. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | W0 纪律初稿 |
