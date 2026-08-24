# 01 · Executive Summary

> One page. Everything below is expanded, with evidence, in 02–05.

## Five-version theme arc (2026-08-24, all dates per CHANGELOG)

1. **1.2.3 — align history.** npm had 1.2.1/1.2.2 published with no corresponding git history (DEF-001);
   the release rebuilt the commit/tag chain (`afe8597`/`a1b88fb`/`d8684c0`) and made "commit + tag before
   publish" a hard step. Same release shipped the P0-HOT Mermaid emit fix (DEF-023, `7a7145d`).
2. **1.2.4 — tell the truth.** Every asset/doc claim that exceeded real wiring was downgraded or pinned to
   `dsh-coding-kit` reality (DEF-002/004/005/006/008/009/020 + DEF-003 phase 1); SPEC gained the
   **R-TRUTH-1** red line: published claims must match actual wiring, enforced by tests.
3. **1.3.0 — behave correctly.** 17 PRD/debt items: subcommand `--help`, fail-fast on unknown flags, real
   `--json`/`--strict`, input validation, status-aware ingest idempotency keys, dual-dir ingest, plugin
   override hardening; CI workflow bootstrapped (node 22/24 matrix) with a lib smoke test.
4. **1.4.0 — gates actually gate.** DEF-003 phase 2 wired the lifecycle/verify/close guards for real
   (R<n> review existence, pre-30 invoke hats, six `task close` guards, lifecycle dry-run evaluation),
   with logged waiver flags. R-08 turned the skills-scan disclaimer into verified fact against
   `deepseek-harness@141eb6f`.
5. **1.5.0 — rewrite the installed base.** `refresh-ide-blocks` rewrites stale `npx @cyning/harness` command
   literals inside consumer IDE marker blocks (dry-run default, `--yes` to write, idempotent, 5-generation
   backups); the D5 WARN transition ended and hardened to FAIL (exit 2), honouring the 1.3.0 promise.

## Key numbers

- **27 defects** (DEF-001…DEF-027) — all closed; per-item fix versions/commits in
  [03_defects_debt_ledger.md](03_defects_debt_ledger.md). Source: defect register statistics ("26+1 缺陷全部闭环").
- **18 known debts** (M-1…M-4, R-01…R-14) — closed, converted-and-delivered, or documented as standing
  residual; disposition table in [03_defects_debt_ledger.md](03_defects_debt_ledger.md).
- **DEF-027 hotfix** — package-lock integrity corrupted since `9042a73`; latent until the first CI run
  (`32711990567`, both matrix legs red with EINTEGRITY); fixed via PR #1 (`cc6ec81`, merge `012d258`).
- **Tests 71 → 222** — per-version acceptance counts recorded in the optimization-workspace README revision
  records: 71 (1.2.3) → 96 (1.2.4) → 155 (1.3.0) → 187 (1.4.0) → 222 (1.5.0). Re-verified locally on
  `main`: `npm test` → `# pass 222 / # fail 0` (node --test).
- **PRs #1–#8** — all merged with green CI; the PR flow itself was adopted mid-series (see
  [04_engineering_method.md](04_engineering_method.md)).

## Current state (as of `main` = `9ee800b`)

- Defect register: zero open defects.
- Standing residual debts (documented, not blocking): R-02 (peer range / package-name risk), R-09, R-10,
  R-11, R-14, plus the manual-only part of R-01 (old-repo Archive) and the partial R-12.
- Disclosed known limitations (CHANGELOG [1.4.0]): `close_wiki_promotion` and `spec_reviews_retention`
  (`verify --spec`) remain unwired — stated in the release, not claimed as delivered.
