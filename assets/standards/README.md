# standards · 编码规范模板

按语言栈从本目录复制到用户仓 **`docs/standards/`**。

## v0.1 已交付（T2 · M2）

| 模板 | 状态 | 嵌入后文件名 |
|------|------|--------------|
| [`TEMPLATE_CODING_BASELINE_L1_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L1_v1_zh.md) | ✅ | `CODING_BASELINE_L1_v1_zh.md` |
| [`TEMPLATE_CODING_BASELINE_L2_frontend_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L2_frontend_v1_zh.md) | ✅ | `CODING_FRONTEND_L2_v1_zh.md` |
| [`TEMPLATE_CODING_BASELINE_L2_backend_v1_zh.md`](./TEMPLATE_CODING_BASELINE_L2_backend_v1_zh.md) | ✅ | `CODING_BACKEND_L2_v1_zh.md` |
| [`SOURCES_v1_zh.md`](./SOURCES_v1_zh.md) | ✅ | `SOURCES_编码规范外部参考_v1_zh.md` |
| [`POINTER_workspace_truth_v1_zh.md`](./POINTER_workspace_truth_v1_zh.md) | ✅ | 可选保留 POINTER（不复制 Ink 全文） |

## 嵌入步骤

```bash
mkdir -p docs/standards
cp standards/TEMPLATE_CODING_BASELINE_L1_v1_zh.md docs/standards/CODING_BASELINE_L1_v1_zh.md
# 按栈复制 L2 模板并重命名；填写「本仓落地」列
cp standards/SOURCES_v1_zh.md docs/standards/SOURCES_编码规范外部参考_v1_zh.md
```

## task 字段

`code_quality_bar: strict | recommended | not_applicable`

- **strict**：22/30 须对照 L2 条文 ID
- **recommended**：M2 文档演练默认
- **not_applicable**：纯文档 task 须附一行理由

## 关联

- Onboarding：[`docs/ONBOARDING.md`](../docs/ONBOARDING.md) §4
- Harness 衔接：工作区 `GUIDANCE_standards_in_harness_starter_m2_v1_zh.md` §3（POINTER，非复制）
