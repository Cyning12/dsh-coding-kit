# Release Retrospective Series — dsh-coding-kit 1.2.3 → 1.5.0

> Scope: the five consecutive releases cut on 2026-08-24 (all dates per `CHANGELOG.md` headings).
> Rule of this series: every factual claim cites `CHANGELOG.md`, a commit hash, a tag, a PR, or the
> optimization-workspace records (`docs/dsh_coding_kit_optimization/` in the workspace repository).
> No marketing language; known limitations are listed, not hidden.

## Files

| File | One-line purpose |
|------|------------------|
| [01_executive_summary.md](01_executive_summary.md) | One page of outcomes: five-version theme arc, key numbers, current state |
| [02_before_after.md](02_before_after.md) | **Core deliverable** — upgrade before/after comparison by theme, with evidence |
| [03_defects_debt_ledger.md](03_defects_debt_ledger.md) | Full ledger: 27 defects line by line, 18 debts by disposition, DEF-027 hotfix story |
| [04_engineering_method.md](04_engineering_method.md) | Method retrospective: role chain, PRD orders, test-first, declare-first, pipeline evolution |
| [05_upgrade_guide.md](05_upgrade_guide.md) | Consumer upgrade guide by installed version, incl. `refresh-ide-blocks` walkthrough |

## Version timeline

| Version | Date | Theme | PR(s) | Release commit | Tag |
|---------|------|-------|-------|----------------|-----|
| 1.2.3 | 2026-08-24 | History alignment + P0-HOT Mermaid emit hotfix | — (pre-PR flow, direct commits) | `d8684c0` | `v1.2.3` |
| 1.2.4 | 2026-08-24 | Truth-telling release assets | — (pre-PR flow) | `8bc343e` | `v1.2.4` |
| 1.3.0 | 2026-08-24 | Behavioral correctness + CI bootstrap | [#1](https://github.com/Cyning12/dsh-coding-kit/pull/1) (DEF-027 hotfix) | `1d6b690` | `v1.3.0` |
| 1.4.0 | 2026-08-24 | Gates wired for real + debt closure | [#2](https://github.com/Cyning12/dsh-coding-kit/pull/2) [#3](https://github.com/Cyning12/dsh-coding-kit/pull/3) [#4](https://github.com/Cyning12/dsh-coding-kit/pull/4) [#5](https://github.com/Cyning12/dsh-coding-kit/pull/5) | `cef758b` | `v1.4.0` |
| 1.5.0 | 2026-08-24 | `refresh-ide-blocks` + D5 WARN→FAIL hardening | [#6](https://github.com/Cyning12/dsh-coding-kit/pull/6) [#7](https://github.com/Cyning12/dsh-coding-kit/pull/7) [#8](https://github.com/Cyning12/dsh-coding-kit/pull/8) | `aebf172` | `v1.5.0` |

Notes:

- `v1.2.1` (`afe8597`) and `v1.2.2` (`a1b88fb`) tags were rebuilt retroactively in the 1.2.3 release prep so every npm-published artifact is reproducible from git (DEF-001, CHANGELOG [1.2.3] Chore).
- The PR-based flow starts at PR #1: 1.2.3–1.3.0 were cut as direct commits on `main`; the recorded work-mode switch ("branch → PR → green CI → merge → human publishes") is in the optimization-workspace README revision record dated 2026-08-24 ("1.3.0 已发布 + CI hotfix").
- Predecessor baseline: 1.2.2 was the version under audit in the optimization workspace (`docs/dsh_coding_kit_optimization/README.md`).

## Fact sources

- `CHANGELOG.md` — per-version sections [1.2.3] … [1.5.0].
- `git log --oneline v1.2.1..main` — commit hashes cited throughout this series.
- Optimization workspace: `01_defects/defect_register.md`, `01_defects/known_debts.md`, `04_decisions/decision_log.md`, README revision records.
