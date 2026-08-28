---
graph_id: 10_flow_verify
version: 2026-08-28
generated_at: sha256-4670dca386684290
source: 10_flow_verify.graph.yaml
---

# verify：--task / --spec / --with-wiki-lint

cmdVerify Happy Path：--task 与 --spec 互斥；--task 走闸/测试/R<n> 审/pre-30 hats；--spec 走 findSpecReview（可 skip_spec_audit）；--with-wiki-lint 追加 lintWikiDeltaMissing。异常侧链 BLOCKED。

## Mermaid

```mermaid
flowchart TD
    IN["verify"]
    PARSE["解析 --task/--spec/--with-wiki-lint"]
    MODE["--task 或 --spec?"]
    TASK["读 task 文件"]
    GATES["formatGateCheck 人工闸"]
    TEST["runTestCheck"]
    REVIEW["findReview R<n>"]
    HATS["checkPre30InvokeHats"]
    SPEC["verifySpecMode"]
    SPEC_REVIEW["findSpecReview"]
    WIKI_Q["--with-wiki-lint?"]
    WIKI["lintWikiDeltaMissing"]
    PASS["VERIFY PASS"]
    ERR_MUTEX["--task 与 --spec 互斥"]
    ERR_NOFILE["文件不存在"]
    ERR_GATE["闸 BLOCKED"]
    ERR_TEST["测试制品缺口"]
    ERR_REVIEW["缺 R<n> 审查文"]
    ERR_WIKI["wiki_delta 缺口"]

    IN --> PARSE
    %% → src/cli.ts#L512
    PARSE --> MODE
    %% → src/cli.ts#L542
    PARSE -->|"[err]"| ERR_MUTEX
    %% → src/cli.ts#L542
    MODE -->|"?>"| TASK
    %% → src/cli.ts#L547
    MODE -->|"?>"| SPEC
    %% → src/cli.ts#L543
    TASK -->|"[ok]"| GATES
    %% → src/cli.ts#L276
    TASK -->|"[err]"| ERR_NOFILE
    %% → src/cli.ts#L567
    GATES -->|"[ok]"| TEST
    %% → src/cli-checks.ts#L737
    GATES -->|"[err]"| ERR_GATE
    %% → src/cli.ts#L575
    TEST -->|"[ok]"| REVIEW
    %% → src/cli-checks.ts#L634
    TEST -->|"[err]"| ERR_TEST
    %% → src/cli.ts#L586
    REVIEW -->|"[ok]"| HATS
    %% → src/cli-checks.ts#L100
    REVIEW -->|"[err]"| ERR_REVIEW
    %% → src/cli.ts#L594
    HATS -->|"[ok]"| WIKI_Q
    %% → src/cli.ts#L608
    SPEC -->|"[ok]"| SPEC_REVIEW
    %% → src/cli-checks.ts#L588
    SPEC -->|"[err]"| ERR_NOFILE
    %% → src/cli.ts#L459
    SPEC_REVIEW -->|"[ok]"| WIKI_Q
    %% → src/cli.ts#L482
    SPEC_REVIEW -->|"[err]"| ERR_REVIEW
    %% → src/cli.ts#L483
    WIKI_Q -->|"?>"| PASS
    %% → src/cli.ts#L641
    WIKI_Q -->|"?>"| WIKI
    %% → src/cli.ts#L624
    WIKI -->|"[ok]"| PASS
    %% → src/cli-task-extra.ts#L80
    WIKI -->|"[err]"| ERR_WIKI
    %% → src/cli.ts#L626

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class IN,GATES,SPEC phase
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| IN | verify | flow |
| PARSE | 解析 --task/--spec/--with-wiki-lint |  |
| MODE | --task 或 --spec? |  |
| TASK | 读 task 文件 |  |
| GATES | formatGateCheck 人工闸 | flow |
| TEST | runTestCheck |  |
| REVIEW | findReview R<n> |  |
| HATS | checkPre30InvokeHats |  |
| SPEC | verifySpecMode | flow |
| SPEC_REVIEW | findSpecReview |  |
| WIKI_Q | --with-wiki-lint? |  |
| WIKI | lintWikiDeltaMissing |  |
| PASS | VERIFY PASS |  |
| ERR_MUTEX | --task 与 --spec 互斥 |  |
| ERR_NOFILE | 文件不存在 |  |
| ERR_GATE | 闸 BLOCKED |  |
| ERR_TEST | 测试制品缺口 |  |
| ERR_REVIEW | 缺 R<n> 审查文 |  |
| ERR_WIKI | wiki_delta 缺口 |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| IN | PARSE | -> | depends_on | -> | 1 anchor(s) |
| PARSE | MODE | -> | depends_on | -> | 1 anchor(s) |
| PARSE | ERR_MUTEX | -> | depends_on | [err] | 1 anchor(s) |
| MODE | TASK | ?> | condition | ?> | 1 anchor(s) |
| MODE | SPEC | ?> | condition | ?> | 1 anchor(s) |
| TASK | GATES | ::gates | gates | [ok] | 1 anchor(s) |
| TASK | ERR_NOFILE | -> | depends_on | [err] | 1 anchor(s) |
| GATES | TEST | -> | depends_on | [ok] | 1 anchor(s) |
| GATES | ERR_GATE | -> | depends_on | [err] | 1 anchor(s) |
| TEST | REVIEW | -> | depends_on | [ok] | 1 anchor(s) |
| TEST | ERR_TEST | -> | depends_on | [err] | 1 anchor(s) |
| REVIEW | HATS | -> | depends_on | [ok] | 1 anchor(s) |
| REVIEW | ERR_REVIEW | -> | depends_on | [err] | 1 anchor(s) |
| HATS | WIKI_Q | -> | depends_on | [ok] | 1 anchor(s) |
| SPEC | SPEC_REVIEW | -> | depends_on | [ok] | 1 anchor(s) |
| SPEC | ERR_NOFILE | -> | depends_on | [err] | 1 anchor(s) |
| SPEC_REVIEW | WIKI_Q | -> | depends_on | [ok] | 1 anchor(s) |
| SPEC_REVIEW | ERR_REVIEW | -> | depends_on | [err] | 1 anchor(s) |
| WIKI_Q | PASS | ?> | condition | ?> | 1 anchor(s) |
| WIKI_Q | WIKI | ?> | condition | ?> | 1 anchor(s) |
| WIKI | PASS | -> | depends_on | [ok] | 1 anchor(s) |
| WIKI | ERR_WIKI | -> | depends_on | [err] | 1 anchor(s) |
