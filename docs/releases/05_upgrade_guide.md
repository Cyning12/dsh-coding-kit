# 05 · Consumer Upgrade Guide

> Pick your starting point. All commands use the current package name `dsh-coding-kit`; installs and
> compiles are **no-clobber** — existing generated files are not overwritten unless stated.
> Sources: CHANGELOG "Changed（消费者必读）" sections per version.

## A. Not yet onboarded

```
npx dsh-coding-kit init
npx dsh-coding-kit skills install
npx dsh-coding-kit graph yaml compile --all   # if you use the tech-graph assets
```

You land directly on 1.5.0 behaviour; nothing below applies.

## B. On 1.2.x (≤1.2.2) — read all four deltas

### → 1.2.3 (Mermaid emit contract change)

- **Must**: rerun `npx dsh-coding-kit graph yaml compile --all`. Old emit (`//` anchor comments,
  `--"label"-->` edges) silently fails in IDE Markdown preview. `graph yaml check` is unaffected.

### → 1.2.4 (asset truth pass)

- Rerun `graph yaml compile --all` **and** `skills install`: both are no-clobber, so without a rerun you
  keep the old (partly over-claiming) assets locally.
- Expect doc-only changes: adapters/gate/lifecycle claims now say "unwired / legacy-only" where the
  package does not implement them (R-TRUTH-1).

### → 1.3.0 (behaviour tightening — CI may turn red)

- Unknown flags on `verify` / `gate-check` now fail (exit 1) instead of being ignored — audit your
  pipelines for previously swallowed flags (e.g. `--allow-invoke-gap` before it became real).
- `--strict` now has real semantics; pipelines using it may newly fail.
- `--json` now actually changes output (five-field structure).
- `init --preset` validates against a vocabulary; `upgrade --force` is rejected.
- `verify --spec` failures exit 1 (was 2).
- Rerun `skills install` to pick up the DEF-024/025/026 asset fixes.
- ingest idempotency keys changed: rerunning ingest after gate/task state changes now appends
  transition events (old events kept). Dual task-dir scanning may raise event counts on harness-layout
  repos — expected.

### → 1.4.0 and 1.5.0

Continue with sections C and D below.

## C. On 1.3.0 — the 1.4.0 gate migration

Previously-passing tasks can now go **BLOCKED (exit 2)**:

- `verify` requires the R<n> review artifact for the task.
- `verify` requires pre-30 invoke artifacts when the task's declared hats intersect {10, 20, 00}.
- `task close` evaluates six guards (invoke / review / graph delta / KPI / experience / wiki delta).

**Transition waivers** (real, logged in output — they unblock the run but do not remove the obligation
to produce the missing artifacts):

```
npx dsh-coding-kit verify --task <slug> --allow-no-review --allow-invoke-gap
npx dsh-coding-kit task close <slug> --allow-invoke-gap --allow-no-review \
  --allow-kpi-gap --allow-experience-gap --allow-wiki-gap
```

Exit codes: 0 PASS (waivers logged) / 2 BLOCKED / 1 usage errors. With `--json`, BLOCKED runs report
`blocked=true`, `verdict=BLOCKED`.

## D. On 1.4.0 — the 1.5.0 delta

### D5 hardening (WARN → FAIL)

- If `test_strategy=required` and your repo only matched the legacy heuristics (pyproject.toml /
  setup.py / a workflow without a test step), `verify` / `audit` now **FAIL with exit 2**.
- Remedy: add real test artifacts — `tests/`, `*_test.py`, `*.test.ts`, or a CI workflow containing a
  test step.

### Stale IDE marker blocks → `refresh-ide-blocks`

If your repo's IDE marker blocks (`<!-- cyning-harness:begin/end -->`) still contain
`npx @cyning/harness` literals:

```
npx dsh-coding-kit refresh-ide-blocks            # dry-run, zero writes — inspect the diff
npx dsh-coding-kit refresh-ide-blocks --yes      # write the rewrite
```

Behaviour contract (SPEC `PRD_R07_ide_block_rewrite.md`):

- **A1–A4 auto-mapped** command literals are rewritten; pinned-version literals are dropped and recorded
  as `dropped_pin`; bare `harness skills build|check` is protected against double-rewriting.
- **B1–B5** patterns are report-only ("needs human").
- **Preflight fail-fast** (exit 2, zero writes): dirty git tree, MIXED old/new blocks, MALFORMED blocks,
  or an S2 assertion hit.
- Before writing, files are backed up under `.cyning-harness/backups/refresh-ide-blocks/` (5 generations
  kept). The command is idempotent — safe to rerun.
- Options: `--target`, `--json` (schema `dsh-coding-kit/refresh-ide-blocks-report@1`).
- After `upgrade`, a read-only hint line tells you if stale literals were detected (does not change the
  upgrade exit code).

## Known limitations you may still hit (1.5.0)

- `close_wiki_promotion` and `spec_reviews_retention` (`verify --spec`) remain unwired — disclosed, not
  gated.
- KPI four-dimension scoring is heuristic parsing (`Task_KPI%: N`, D1–D5 table, 1–5 text convention).
