# 04 · Engineering Method Retrospective

> How the five releases were run. Sources: optimization-workspace README revision records,
> `04_decisions/decision_log.md`, `05_fix_plans/PRD_*.md`, and the git history itself.

## Role chain and human-in-the-loop

- The optimization engagement ran the harness hat chain: **00** (dispatch/acceptance) → research waves
  **R1/R2/R3** (inventory, spec-kit comparison, direction proposals) → **40** fact audit
  (B1–B8 all PASS, 33/33 spot checks, `reviews/audit_20260822_40_facts_r1.md`) → human gate
  **HG-AUDIT-R1 approved** (README revision record 2026-08-22).
- Execution waves (Wave A/B/C per revision records) worked from PRDs; **00 acceptance** is recorded on
  every release row; **npm publish remained human-only** throughout ("npm publish 仅人" on every
  revision row).
- Decision authority stayed human: `decision_log.md` states "仅人填写" (humans only). Batch
  authorizations DEC-BATCH-1.2.4 and DEC-BATCH-1.3.0 are recorded there, each pointing at the PRD §7
  decision points they approve; DEC-R07-EVAL / DEC-R07-GO govern the 1.5.0 epic.

## PRD mother-order system

- Every defect cluster got a PRD under `05_fix_plans/PRD_*.md` with a §7 decision table; agents
  execute only the path the human stamped ("批量按各 PRD 推荐路径执行", decision_log).
- DEF-023 was expedited as **P0-HOT** with its own investigation, PRD, and copy-paste execution prompt
  (`prompts/PROMPT_DEF-023_mermaid_emit_P0HOT_v1.md`), jumping the queue ahead of the higher-numbered
  but older defects.

## Test-first: red-then-green double-commit chains

Behaviour changes landed as a failing-test commit followed immediately by the fix commit, e.g.:

| Change | Red (test) | Green (fix) |
|--------|-----------|-------------|
| DEF-003 T4 R<n> review gate | `d433fbc` | `b7c15ae` |
| DEF-003 T5 pre-30 invoke hats | `4c66f9d` | `0fc730f` |
| DEF-003 T6 close guards | `4ce1b32` | `5eac847` |
| R-07 refresh-ide-blocks M01–M19/U1–U12 | `0ef67be` | `b0e85f8` |
| R-07 docs grep assertions | `d6c33ac` | `b7a5fbe` |
| DEF-021 `--strict` semantics | `d2796ac` | `efcd3ad` |
| DEBT R-05 `--out` refusal | `30e6188` | `c17d70e` |

Per-release acceptance counts (revision records): 71 → 96 → 155 → 187 → 222, plus `test:lib` 4/4 from 1.3.0 on.

## Declare-first (R-TRUTH-1)

1.2.4 downgraded or annotated every asset claim that exceeded real wiring **before** any wiring was added
(DEF-003 phase 1, `2a4155c`), and SPEC.md gained the **R-TRUTH-1** red line — published claims must match
actual wiring, enforced by tests. The capability itself was deferred to 1.4.0 by explicit decision
(DEC-BATCH-1.3.0), so the repo never spent a release claiming gates it did not have.

## SPEC freeze practice (R-07)

DEC-R07-EVAL set preconditions before implementation could start: freeze the IDE marker-block syntax and
the A1–A4 / B1–B5 mapping table **in product docs first**; scope limited to marker blocks; S2/local blocks
skipped and reported; dirty tree / mixed-version → fail-fast. DEC-R07-GO then green-lit 1.5.0 with the
SPEC sign-off gate covered by the approval itself. The delivered preflight (dirty tree / MIXED /
MALFORMED / S2 assertion gate → exit 2, zero writes) matches the frozen spec (CHANGELOG [1.5.0]).

## Pipeline evolution: direct push → PR flow

- 1.2.3–1.3.0 were cut as direct commit chains on `main` (see `git log`: `d8684c0`, `8bc343e`, `1d6b690`).
- 1.3.0 introduced CI; its **first run** (`32711990567`) caught DEF-027 red on both matrix legs.
- The hotfix went through **PR #1**, and the revision record states the new mode explicitly:
  "工作模式切换：后续一律 分支→PR→CI 绿→merge→人 publish". PRs #2–#8 all followed it.

## Git concurrency incidents and recovery

1. **2026-06-25 concurrent `add -A` incident** (recorded in
   `docs/harness/fixtures/claude_settings_v2_baseline_v1.json`): a bulk stage swept unrelated work into a
   cross-concern commit. Recovery discipline, still in force: deny `git add -A/-a`, commit only the exact
   paths of the current round (`HANDOFF_AUTO_COMMIT.md`), and keep per-repo commits separate across
   git roots.
2. **DEF-001 uncommitted-release incident**: parallel session work left 1.2.1/1.2.2 published on npm but
   absent from git (13 modified + 4 untracked files found by the audit). Recovery: retroactive commit/tag
   chain (`afe8597` → `a1b88fb` → `d8684c0`, tags `v1.2.1`–`v1.2.3`) in the 1.2.3 release prep, plus the
   hard rule "commit + tag before publish" (CHANGELOG [1.2.3] Chore).

## What was deliberately not done

- `close_wiki_promotion` and `spec_reviews_retention` remain unwired — disclosed in CHANGELOG [1.4.0]
  Known limitations instead of being claimed.
- The D5 WARN→FAIL hardening slipped from 1.4.0 to 1.5.0 and the slip itself was disclosed in the
  1.4.0 Known limitations section, then honoured in 1.5.0.
