# POINTER · 工作区编码规范真值（示例 · 不复制全文）

| 项 | 内容 |
| --- | --- |
| **状态** | `active` |
| **日期** | 2026-06-15（A3 脱敏） |
| **性质** | **只读指针**；Starter 交付 TEMPLATE，各业务仓维护 L1/L2 **active** 条文 |

---

## 纪律（D-M2-04）

| 规则 | 说明 |
| --- | --- |
| **禁止双维护** | 不得将某业务仓 `docs/standards/` L1/L2 **全文**复制进 `cyning-harness` 产品仓 |
| **嵌入用户仓** | 从本目录 **TEMPLATE_*** 复制生成用户仓 `docs/standards/`；按需 **POINTER** 回链源仓 |
| **冲突** | task + 图谱 + PROJECT_CONFIG > 用户仓已嵌入 L1/L2 > 本 POINTER |

---

## 使用方式

1. **默认**：仅用本目录 [`TEMPLATE_CODING_BASELINE_L1_v1_zh.md`](TEMPLATE_CODING_BASELINE_L1_v1_zh.md) 等模板  
2. **有上游规范仓时**：在用户仓 README 追加 POINTER 链（GitHub 路径 · 非本地绝对路径）  
3. **禁止** 将私有工作区 invoke / task 正文 bulk 复制进产品包

---

## 治理仓（可选 · 公开）

| 仓 | 用途 |
| --- | --- |
| [`cyning-ai-coding-governance`](https://github.com/Cyning12/cyning-ai-coding-governance) | 方法论 · L3/L2/L1 整合导读 · 对比研究 |

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-06-09 | M2 T2：TEMPLATE + POINTER 首版 |
| 2026-06-15 | A3 public push：移除私有工作区路径与 Ink 内部 task 枚举 |
