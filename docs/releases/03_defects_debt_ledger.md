# 03 · Defect & Debt Ledger

> Sources: `01_defects/defect_register.md` (27 items: 26 + DEF-027), `01_defects/known_debts.md`
> (18 items: M-1…M-4 + R-01…R-14), CHANGELOG per-version sections, `git log v1.2.1..main`.

## Defects (27/27 closed)

| ID | One-liner | Fixed in | Commit / PR |
|----|-----------|----------|-------------|
| DEF-001 | npm 1.2.1/1.2.2 published with no git history | 1.2.3 | `afe8597`/`a1b88fb`/`d8684c0` + tags |
| DEF-002 | Assets still used deprecated `@cyning/harness` command surface | 1.2.4 | `d3b609d` |
| DEF-003 | Claimed gates not wired (verify/close/lifecycle) | declared 1.2.4; wired 1.4.0 | `2a4155c`; PR #2 (`09c0ddf`), PR #3 (`9415623`) |
| DEF-004 | ontology.yaml: dead schema refs, stale axioms/version | 1.2.4 | `3ce5f2e` |
| DEF-005 | discipline-coverage pinned old package version/mechanisms | 1.2.4 | `35ed5bb` |
| DEF-006 | graph templates drifted from package compiler | 1.2.4 | `bf8cbbc` |
| DEF-007 | stubs README pointed at unshipped examples/oss-fork | 1.3.0 | `697c0ac` |
| DEF-008 | QUICKREF claimed auto-generation, old commands | 1.2.4 | `37c5b68` |
| DEF-009 | Dangling-reference cluster across assets | 1.2.4 | `278ce8c` + link-guard test |
| DEF-010 | Subcommand `--help` unreachable (root usage) | 1.3.0 | `989c17b` |
| DEF-011 | verify/gate-check silently swallowed flags | 1.3.0 | `b20dd2c` |
| DEF-012 | `verify --spec` stale narrative, exit 2 misuse | 1.3.0 | `dc20f8b` |
| DEF-013 | init/upgrade/check input & version-compare gaps | 1.3.0 | `9d148f2` |
| DEF-014 | D5 test-artifact heuristic false positives | WARN 1.3.0 → FAIL 1.5.0 | `a79e8c0`; `e197ad2` (PR #6) |
| DEF-015 | Dual gate parsers drifted; ingest lost state transitions | 1.3.0 | `2ffdc3d` |
| DEF-016 | status reviews.CLOSE hardcoded; event_count 0/null split | 1.3.0 | `ec63bef` |
| DEF-017 | Plugin override root cwd-only; truncation split files | 1.3.0 | `a5b95e0` |
| DEF-018 | Tests lacked isolation; no lib freshness guard; no CI | 1.3.0 | `8ddb436` / `c01600b` / `f1691e5` |
| DEF-019 | lifecycle dry-run had no `--target` | 1.3.0 | `43b5f82` |
| DEF-020 | adapters README claimed unwired capabilities | 1.2.4 | `ac09f10` |
| DEF-021 | lint-wiki-delta `--strict` had no real semantics | 1.3.0 | `efcd3ad` |
| DEF-022 | ingest scanned one task dir vs status's two | 1.3.0 | `5ceb119` |
| DEF-023 | Mermaid emit broke IDE preview (P0-HOT) | 1.2.3 | `7a7145d` |
| DEF-024 | 4 dangling sibling-hat links in skills artifacts | 1.3.0 | `60a0b1b` |
| DEF-025 | Leftover HG-GRAPH-MODULES row in gate-stop template | 1.3.0 | `2c8b4be` |
| DEF-026 | "Mechanical verification" claim unwired in 30-execute-code | 1.3.0 | `d229ac8` |
| DEF-027 | package-lock js-yaml integrity corrupted (latent) | 1.3.0 cycle | `cc6ec81` via PR #1 (merge `012d258`) |

Debt **R-05** also received a code fix in 1.3.0: `skills install --out` into the package's own
`assets/skills` is refused (`c17d70e`, red test `30e6188`).

## Debts (18) by disposition

**Closed (10):**

| ID | Disposition | Evidence |
|----|-------------|----------|
| M-1…M-4 | Workspace-side migration debts handled 2026-08-24 (banner/annotations; M-4 closed with commit `97c2538`) | known_debts §1 |
| R-01 (deprecate part) | Old package deprecated 2026-08-17 (HG-DEPRECATE-OLD-PKG approved) | known_debts §2 |
| R-03 | from_version singled out; exit-code table delivered; pack-contains-patch pinned | known_debts §2 |
| R-04 | lifecycle dry-run success path / timeline --ingest / freeze items landed | known_debts §2 |
| R-05 | `--out` into package `assets/skills` now refused in code | `c17d70e` (1.3.0) |
| R-06 | IDE-block residual converted to the R-07 epic (below); adapters .example files cleaned | known_debts §2 |
| R-13 | G4 single-path freeze + D4/I-BUILD tests pinned | known_debts §2 |

**Converted to evaluation → delivered (2):**

| ID | Path | Evidence |
|----|------|----------|
| R-07 | DEC-R07-EVAL (independent epic, freeze preconditions) → DEC-R07-GO → `refresh-ide-blocks` in 1.5.0 | decision_log; PR #7 (merge `438dc68`) |
| R-08 | Disclaimer → upstream verification (`deepseek-harness@141eb6f`, ranks 100/400) | PR #4 (merge `4260797`) |

**Standing residual (open, documented, non-blocking):**

| ID | What remains |
|----|--------------|
| R-01 (Archive part) | Old-repo Archive is a human-only action |
| R-02 | DSH peer range may break short-term (developer preview); unscoped name squatting risk |
| R-09 / R-14 | Real-DSH dump-config / Web-session checks remain manual residuals |
| R-10 | invoke pre-write approved grep check deferred; E1 still prompt-only |
| R-11 | Exotic/old package managers vs optional peers — FAQ fallback text only |
| R-12 | Dual npx mixing in pre-migration repos — documented, not enforced |

## DEF-027 hotfix — full story

1. **Latent since `9042a73`** (1.2.0-era): the first committed package-lock wrote a single-character-wrong
   integrity for js-yaml@4.2.0 (`git log -S` forensics per defect register).
2. **Masked locally**: developer machines hit the npm cache, so `npm install` never noticed.
3. **Exposed by the first CI run** (`32711990567`): clean `npm ci` → EINTEGRITY, both node 22 and 24 legs red.
4. **Fix**: single-line integrity correction (`cc6ec81`), merged as **PR #1** (`012d258`); CI double matrix green.
5. **Companion finding**: npm ≥ 11 does not install *optional* peer dependency trees — a latent TS2307 risk
   on the node 24 leg — so `@deepseek-ai/cordis` / `@deepseek-ai/dsh-tools` were promoted to devDependencies.
6. **Process consequence**: this hotfix was the first PR of the repo and triggered the recorded work-mode
   switch to "branch → PR → green CI → merge → human publishes" (see 04).
