# 04 · 文档可读性 / 健康度维度（C3）

> **状态**：`draft` · 隶属 `doc-health`  
> **定位**：文档资产健康（可读、可导航、可关账、少腐烂）——**不是**业务功能 SPEC，也**不是**技术债主轴清单  
> **度量脚本**：本波不强制；可列后期 wave

---

## 1. 读者路径（先定读者，再定健康）

| 读者 | 应能在 N 次点击内找到 | 腐烂信号 |
|------|------------------------|----------|
| **维护者** | 仓内 docs 总入口 → 真值表 / SPEC 索引 / Hub | 入口失效、多份「唯一真值」互殴 |
| **00 统筹** | active task · 人闸 · SPEC 读序 · invoke 纪律 | active 堆 completed；CLOSE 与归档拆棒 |
| **30 执行** | 当前 task · verify 命令 · 非范围 · 图谱指针 | task 死链；图谱备注当设计全文 |

---

## 2. 健康度维度草案（可修订）

| 维度 | 定义（短） | 初检信号（人工或日后脚本） | 本包动作 |
|------|------------|------------------------------|----------|
| **新鲜度** | 状态与物理位置一致；完成态有关账日 | `状态: done/completed` 仍在 `active/` | C1 CLOSE 绑定 |
| **可发现性** | 从 README/Hub/专属夹能导航到 | 根级裸 SPEC 过多；Hub 无行 | C2 + Hub 闸 |
| **单源真值** | 同主题不双写互相漂移 | wiki / guides / discussions / SPEC 职责不清 | 观察 + `00_policy` 边界 |
| **关账闭环** | CLOSE DoD 一次做完 | invoke PASS 但未 mv / 未合入 | C1 |
| **死链 / 孤儿** | 链接与文件双向可解析 | Hub 有链无文件；done 有文件无 Hub；invoke 有 done 无 | failure_paths · 可选 lint |
| **读者路径** | 维护者/00/30 各有入口 | 长备注替代 flow；无读序 | 观察；不重开 graph SPEC |

---

## 3. 待观察清单（非冻结）

以下来自对照仓与通用经验，**写入 observations 后方可升格为契约**：

1. `active/` 堆积已 completed / 已写 CLOSE 文案的 task  
2. CLOSE invoke 与 `task close --yes` + Hub 拆成第二次请示  
3. Hub / `_views` 与物理 `done/` 不同步  
4. `docs/spec/` 根级裸文件 vs 专属夹  
5. `coding_wiki` / `guides` / `discussions` 职责是否清晰  
6. 图谱模块「长备注」vs 独立 flow（**仅可读性**；不在本包改 yaml）

---

## 4. 观察日志模板（复制用 · 无嵌套围栏）

建议路径：`observations/YYYY-MM-DD_<repo>_<topic>.md`

必填标题行：

- 文首标明：`观察 · 非冻结契约`
- 仓 / Open Folder / 日期 / 观察者角色（00/维护者）
- 现象（可复现路径）
- 影响的健康度维度（上表 ID）
- 建议升格？→ 否 / 是（指向拟修订的 SPEC 节）
- 非建议：不要在观察里直接改 app/

---

## 5. 后期 wave（可选 · 不强求本波）

| 项 | 说明 |
|----|------|
| `task lint-stale-active` | 扫描 active 中 status=done/completed 超龄 |
| Hub↔done 对账 | 扩展 `task lint-done` 思路 |
| docs/spec 根级裸文件 warn | 仅 warn，迁移另 task |
| 健康度记分板 | 禁止过早产品化；有 3+ 稳定观察再议 |

---

## 6. 验收（C3 · 本波）

- [ ] 维度表已立并可修订  
- [ ] `observations/README.md` + ≥1 篇观察  
- [ ] 明确「非技术债主轴 / 不重开 graph SPEC」  
- [ ] 不强制本波交付度量脚本  

---

## 7. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-08-26 | C3 初稿 |
