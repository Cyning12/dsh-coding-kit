# ci/samples · Verify 轨

复制并改写为用户仓 **`.github/workflows/`** workflow。

## v0.1 已交付（T4 · M2）

| 样例 | 状态 | 适用栈 | 三门禁 / 说明 |
|------|------|--------|----------------|
| [`quality.yml.example`](./quality.yml.example) | ✅ | Node/TS · Next 等 | install → lint → test → build |
| [`pytest.yml.example`](./pytest.yml.example) | ✅ | Python · FastAPI 等 | install → pytest |
| [`tech-graph.yml.example`](./tech-graph.yml.example) | ✅ · **可选** | 已接入 `docs/_tech_graph` + `scripts/graph-compile.sh` | graph compile（业务仓自备脚本）。kit **自身**用源码仓 `.github/workflows/tech-graph.yml` + 本仓 bin compile/check，不走本样例脚本 |
| [`hgm-ingest.yml.example`](./hgm-ingest.yml.example) | ✅ · **可选** | 任意已接入 Harness 的仓 | `graph ingest`（默认 continue-on-error） |
| [`lint-wiki-delta.yml.example`](./lint-wiki-delta.yml.example) | ✅ · **可选** | ≥2.18 须有 `wiki_delta` 的仓 | 默认硬失败；注释含 `--strict` / 读 pin |
| [`lint-wiki-delta.pin.yml.example`](./lint-wiki-delta.pin.yml.example) | ✅ · **可选** | 有 `harness.pin.json` 的仓 | 从 pin 解析版本再 `npx`（F-220-02） |

## 嵌入步骤

    mkdir -p .github/workflows
    cp cyning-harness/ci/samples/quality.yml.example .github/workflows/quality.yml
    # 或
    cp cyning-harness/ci/samples/pytest.yml.example .github/workflows/pytest.yml
    # 图谱编译（可选 · 须自备 graph-compile.sh）
    cp cyning-harness/ci/samples/tech-graph.yml.example .github/workflows/tech-graph.yml
    # 过程可观测（可选 · 非三门禁必绿）
    cp cyning-harness/ci/samples/hgm-ingest.yml.example .github/workflows/hgm-ingest.yml
    # wiki_delta（可选）
    cp cyning-harness/ci/samples/lint-wiki-delta.yml.example .github/workflows/lint-wiki-delta.yml
    # 有 pin：
    # cp cyning-harness/ci/samples/lint-wiki-delta.pin.yml.example .github/workflows/lint-wiki-delta.yml

无 monorepo checkout 时：见薄指针页 [`POINTER_RUNBOOK_wiki_delta.md`](../../docs/POINTER_RUNBOOK_wiki_delta.md)（原文不随包发布 · §5.1 `npm pack` / GitHub raw）。

按 `package.json` / `requirements.txt` / Node 版本 / env 变量 **裁剪注释块**。

## 摩擦 / 坑 · setup-node × packageManager(pnpm) × npx-only

`actions/setup-node@v5` 默认会按 `package.json` 的 `packageManager` 开 **package-manager-cache**。若字段为 `pnpm@…`，但本 job **只装 Node、用 npx / 不跑 pnpm install**（未先 `pnpm/action-setup`），则会红：

    Unable to locate executable file: pnpm

| Job 类型 | 正确做法 |
|----------|----------|
| **npx-only**（`tech-graph` / `hgm-ingest` / `lint-wiki-delta` 等） | `setup-node` 显式 `package-manager-cache: false` |
| **Python / 无 package.json**（FastAPI 等） | **同样**必须 `package-manager-cache: false`（防日后加 `packageManager` 踩坑；ops dogfood） |
| **质量三门禁**（`quality.yml.example`） | 先 `pnpm/action-setup`，再 `setup-node` 且 `cache: pnpm` |

不要把 npx-only 样例抄成「开了 cache 却没装 pnpm」。

## 金样 POINTER（Ink · 只读对照）

| 栈 | 路径（工作区） |
|----|----------------|
| 前端 | `ai-ink-brain/.github/workflows/quality.yml` |
| 后端 | `ai-ink-brain-api-python/.github/workflows/pytest.yml` |
| 图谱 | `ai-ink-brain-api-python/.github/workflows/tech-graph.yml`（业务专有；Starter 为最小 compile 样例） |

Ink workflow 含图谱 export、跨仓 checkout 等 **业务专有** 步骤；Starter 样例为 **最小三门禁 / 最小 compile**，按需从金样增量合并。

## 与 Harness 关系

- task `test_strategy: required` → 本地/CI 须与 workflow 命令一致
- L2 模板 CI 对齐节：[`standards/TEMPLATE_CODING_BASELINE_L2_*.md`](../../standards/)
- ONBOARDING §5：五轨检查清单含 CI 样例已适配
- **不**把 tech-graph / pre-commit hook 绑进 `init` 默认拷贝；按需从本目录 `cp`

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-28 | `tech-graph.yml.example` 行旁注：kit 自身 workflow 为源码仓 `.github/workflows/tech-graph.yml`（本仓 bin）；样例仍给自备 `graph-compile.sh` 的业务仓 |
| 2026-07-28 | `lint-wiki-delta.pin.yml.example` · 样例矩阵 / Python 交叉链（v2.21 · web+ops FEEDBACK） |
| 2026-07-28 | `lint-wiki-delta` 样例注明：迁完再硬失败；可选 `--strict`（v2.20） |
| 2026-07-28 | 增 `lint-wiki-delta.yml.example`（升级扫迁 · v2.19.1） |
| 2026-07-27 | 增 `tech-graph.yml.example`；`hgm-ingest` 补 `package-manager-cache: false`；专节摩擦说明 |
| 2026-07-27 | 增 `hgm-ingest.yml.example`（过程可观测 P2 · 可选） |
| 2026-06-09 | T4 M2 首版样例 |
