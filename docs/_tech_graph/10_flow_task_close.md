---
graph_id: 10_flow_task_close
version: 2026-08-28
generated_at: 2026-08-28T01:14:27Z
source: 10_flow_task_close.graph.yaml
---

# task close：闸链 + --yes rename + done 快照

cmdTaskClose Happy Path：解析 --file → evalCloseGuard 闸链 → 解析 done 目标 → 无 --yes 则 dry-run READY；--yes 则 renameSync 后 buildDoneSnapshot。异常侧链 BLOCKED。

## Mermaid

```mermaid
flowchart TD
    IN["task close --file"]
    PARSE["解析 --yes/--json/--allow-*"]
    FILE["源文件存在?"]
    GUARDS["evalCloseGuard 闸链"]
    DEST["解析 done 目标"]
    YES["--yes?"]
    DRY["dry-run READY"]
    MV["renameSync active to done"]
    SNAP["buildDoneSnapshot"]
    PASS["CLOSE PASS"]
    ERR_NOFILE["task 文件不存在"]
    ERR_BLOCKED["CLOSE BLOCKED 闸失败"]
    ERR_DEST["目标冲突或不在 active"]

    IN --> PARSE
    %% → src/cli.ts#L669
    PARSE --> FILE
    %% → src/cli.ts#L701
    FILE -->|"[ok]"| GUARDS
    %% → src/cli-checks.ts#L498
    FILE -->|"[err]"| ERR_NOFILE
    %% → src/cli.ts#L703
    GUARDS -->|"[ok]"| DEST
    %% → src/cli.ts#L721
    GUARDS -->|"[err]"| ERR_BLOCKED
    %% → src/cli.ts#L748
    DEST -->|"[ok]"| YES
    %% → src/cli.ts#L734
    DEST -->|"[err]"| ERR_DEST
    %% → src/cli.ts#L740
    YES -->|"?>"| DRY
    %% → src/cli.ts#L758
    YES -->|"[ok]"| MV
    %% → src/cli.ts#L773
    MV -->|"::archives"| SNAP
    %% → src/cli-shared.ts#L232
    SNAP --> PASS
    %% → src/cli.ts#L799

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class IN,GUARDS phase
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| IN | task close --file | flow |
| PARSE | 解析 --yes/--json/--allow-* |  |
| FILE | 源文件存在? |  |
| GUARDS | evalCloseGuard 闸链 | flow |
| DEST | 解析 done 目标 |  |
| YES | --yes? |  |
| DRY | dry-run READY |  |
| MV | renameSync active to done |  |
| SNAP | buildDoneSnapshot |  |
| PASS | CLOSE PASS |  |
| ERR_NOFILE | task 文件不存在 |  |
| ERR_BLOCKED | CLOSE BLOCKED 闸失败 |  |
| ERR_DEST | 目标冲突或不在 active |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| IN | PARSE | -> | depends_on | -> | 1 anchor(s) |
| PARSE | FILE | -> | depends_on | -> | 1 anchor(s) |
| FILE | GUARDS | ::gates | gates | [ok] | 1 anchor(s) |
| FILE | ERR_NOFILE | -> | depends_on | [err] | 1 anchor(s) |
| GUARDS | DEST | -> | depends_on | [ok] | 1 anchor(s) |
| GUARDS | ERR_BLOCKED | -> | depends_on | [err] | 1 anchor(s) |
| DEST | YES | -> | depends_on | [ok] | 1 anchor(s) |
| DEST | ERR_DEST | -> | depends_on | [err] | 1 anchor(s) |
| YES | DRY | ?> | condition | ?> | 1 anchor(s) |
| YES | MV | -> | depends_on | [ok] | 1 anchor(s) |
| MV | SNAP | ::archives | archives |  | 1 anchor(s) |
| SNAP | PASS | -> | depends_on | -> | 1 anchor(s) |
