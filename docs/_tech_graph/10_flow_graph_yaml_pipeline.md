---
graph_id: 10_flow_graph_yaml_pipeline
version: 2026-08-28
generated_at: 2026-08-28T01:14:27Z
source: 10_flow_graph_yaml_pipeline.graph.yaml
---

# graph yaml pipeline：compile → export → check 自指

自指 dogfood：本图描绘的正是 graph yaml compile → export → check 三条命令。Happy Path 按推荐顺序串联；单条命令失败走侧链。

## Mermaid

```mermaid
flowchart TD
    IN["graph yaml"]
    COMPILE["compile yaml to md"]
    EXPORT["export graph.json"]
    CHECK["check yaml vs json"]
    OK["三命令绿"]
    ERR_VALIDATE["validateGraphYaml 失败"]
    ERR_NO_YAML["YAML 源不存在"]
    ERR_NO_JSON["graph.json 不存在"]
    ERR_DIFF["check 切片不一致"]

    IN --> COMPILE
    %% → src/cli-graph.ts#L54
    %% → src/cli-graph-yaml.ts#L499
    COMPILE -->|"[ok]"| EXPORT
    %% → src/cli-graph-yaml.ts#L324
    COMPILE -->|"[err]"| ERR_VALIDATE
    %% → src/cli-graph-yaml.ts#L52
    COMPILE -->|"[err]"| ERR_NO_YAML
    %% → src/cli-graph-yaml.ts#L501
    EXPORT -->|"[ok]"| CHECK
    %% → src/cli-graph-yaml.ts#L524
    EXPORT -->|"[err]"| ERR_VALIDATE
    %% → src/cli-graph-yaml.ts#L278
    CHECK -->|"[ok]"| OK
    %% → src/cli-graph.ts#L125
    CHECK -->|"[err]"| ERR_NO_JSON
    %% → src/cli-graph-yaml.ts#L534
    CHECK -->|"[err]"| ERR_DIFF
    %% → src/cli-graph-yaml.ts#L567

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class IN,COMPILE,EXPORT,CHECK phase
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| IN | graph yaml | flow |
| COMPILE | compile yaml to md | flow |
| EXPORT | export graph.json | flow |
| CHECK | check yaml vs json | flow |
| OK | 三命令绿 |  |
| ERR_VALIDATE | validateGraphYaml 失败 |  |
| ERR_NO_YAML | YAML 源不存在 |  |
| ERR_NO_JSON | graph.json 不存在 |  |
| ERR_DIFF | check 切片不一致 |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| IN | COMPILE | -> | depends_on | -> | 2 anchor(s) |
| COMPILE | EXPORT | -> | depends_on | [ok] | 1 anchor(s) |
| COMPILE | ERR_VALIDATE | -> | depends_on | [err] | 1 anchor(s) |
| COMPILE | ERR_NO_YAML | -> | depends_on | [err] | 1 anchor(s) |
| EXPORT | CHECK | -> | depends_on | [ok] | 1 anchor(s) |
| EXPORT | ERR_VALIDATE | -> | depends_on | [err] | 1 anchor(s) |
| CHECK | OK | -> | depends_on | [ok] | 1 anchor(s) |
| CHECK | ERR_NO_JSON | -> | depends_on | [err] | 1 anchor(s) |
| CHECK | ERR_DIFF | -> | depends_on | [err] | 1 anchor(s) |
