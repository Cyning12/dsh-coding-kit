# assets · 资产地图

本目录是从旧仓 `cyning-harness` 按白名单复制的 **P0 模板资产**。目录名 `assets/harness/` 仅保留历史路径，对外产品名是 **coding-kit / ICVO / SDD**，不是 “harness”。

`apply_coding_standards`（T2）默认只读 `standards/` 与 `coding_wiki/`。其余目录供 `init_coding_kit` 整树复制，给人与 IDE `@` 使用，不全部灌进 prompt。

## 旧路径对照

| 旧路径（相对 `cyning-harness/`） | 本仓路径 | 用途 |
|----------------------------------|----------|------|
| `coding_wiki/` | `assets/coding_wiki/` | Inform：LLM 读序模板 |
| `standards/` | `assets/standards/` | Constrain：L1/L2 编码规范模板 |
| `graph/` | `assets/graph/` | Inform：图谱模板 |
| `harness/` | `assets/harness/` | Orchestrate：过程/帽模板（历史目录名） |
| `ci/` | `assets/ci/` | Verify：CI 样例 |
| `ide/` | `assets/ide/` | IDE 入口片段 |
| `skills/` | `assets/skills/` | Agent Skills 封装 |
| `ontology.yaml` | `assets/ontology.yaml` | ICVO 机器可读抽取 |
| `LICENSE` | 仓根 `LICENSE` | MIT · Copyright (c) 2026 Cyning |

## 明确不在本目录

| 旧路径 | 原因 |
|--------|------|
| `bin/` `lib/` | CLI 运行时，不属 1.0.0 |
| `wizard/*.sh` | CLI 安装器 |
| `eval/` `examples/` `golden/` | 评测夹具，P1 |
| `node_modules/` | 依赖，禁止拷入 |

过程轨（SPEC / task / invoke / reviews）在工作区 `docs/dsh_coding_kit_init/`，不进本仓。
