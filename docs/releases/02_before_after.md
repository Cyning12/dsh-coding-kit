# 02 · Before / After — Upgrade Comparison (1.2.2 and earlier → 1.5.0)

> Core deliverable of this series. Each row: dimension × Before (≤1.2.2) × After (1.5.0) × evidence
> (version / command / exit code / commit). Defect IDs refer to the optimization-workspace defect register.

## CLI behaviour

| Dimension | Before (≤1.2.2) | After (1.5.0) | Evidence |
|-----------|------------------|----------------|----------|
| Unknown flags | `verify` / `gate-check` silently swallowed `--graph`/`--json`/`--allow-*` — users believed a waiver was active when it was not | Unknown flag → error, exit 1 (fail-fast) | DEF-011; CHANGELOG [1.3.0]; commit `b20dd2c` |
| Subcommand `--help` | `skills --help` etc. printed the root usage (help branches were dead code) | Each subcommand prints its own usage | DEF-010; CHANGELOG [1.3.0]; commit `989c17b` |
| `--json` output | Flag swallowed; text output regardless | `verify` / `gate-check` emit a five-field structured result | DEF-011; CHANGELOG [1.3.0]; commit `b20dd2c` |
| `--strict` | No semantic difference from default | Real tightening semantics — CI pipelines using `--strict` may turn red | DEF-021; CHANGELOG [1.3.0]; commit `efcd3ad` |
| Input validation | `init --preset` accepted any string; `upgrade --force` swallowed; `check` called newer manifests "upgradable" | Preset vocabulary check; `--force` rejected; three-way version compare | DEF-013; CHANGELOG [1.3.0]; commit `9d148f2` |
| `verify --spec` | Stale version narrative; misuse of exit 2 for "unsupported" | De-versioned message; exit 1; exit 2 restored to pure gate semantics | DEF-012; CHANGELOG [1.3.0]; commit `dc20f8b` |

## Gates: claimed interception vs real interception

| Dimension | Before (≤1.2.2) | After (1.5.0) | Evidence |
|-----------|------------------|----------------|----------|
| R<n> review gate | Assets claimed a hard gate; `verify` never checked | Missing review artifact → BLOCKED, exit 2; `--allow-no-review` is a real, logged waiver | DEF-003 T4; CHANGELOG [1.4.0]; PR #2, commits `d433fbc`→`b7c15ae` |
| pre-30 invoke hats gate | Claimed in templates; `--allow-invoke-gap` swallowed | Task hats ∩ {10,20,00} without invoke artifact → BLOCKED; real logged waiver | DEF-003 T5; CHANGELOG [1.4.0]; PR #3, commits `4c66f9d`→`0fc730f` |
| `task close` six guards | close_invoke / close_review / close_graph_delta / close_kpi / close_experience / close_wiki_delta registered in lifecycle.yaml but never evaluated | All six really evaluated; waivers `--allow-invoke-gap` / `--allow-no-review` / `--allow-kpi-gap` / `--allow-experience-gap` / `--allow-wiki-gap` | DEF-003 T6; CHANGELOG [1.4.0]; PR #3, commits `4ce1b32`→`5eac847` |
| lifecycle dry-run guards | All guards except HG-AUDIT-R1 / HG-TASK-DRAFT permanently "unevaluated" | Real evaluation; still-unwired guards are labelled, not impersonated | DEF-003 T3; CHANGELOG [1.4.0]; commits `a3c5f6d`→`a6f006b` |
| D5 test-artifact probe | Weak heuristic (pyproject.toml / setup.py / any workflow = "has tests"), false-positive PASS | Tightened detection; WARN transition (1.3.0) hardened to FAIL exit 2 (1.5.0); legacy heuristic code deleted | DEF-014; CHANGELOG [1.3.0] & [1.5.0]; commits `a79e8c0`, `e197ad2` (PR #6) |

## Event track & status

| Dimension | Before (≤1.2.2) | After (1.5.0) | Evidence |
|-----------|------------------|----------------|----------|
| Event track | ingest idempotency key `type:subject` carried no state — timeline showed only the first state of a gate/task | Idempotency key includes a status digest; reruns append transition events without overwriting old ones | DEF-015; CHANGELOG [1.3.0]; commit `2ffdc3d` |
| Task discovery | `graph ingest` scanned only `docs/tasks/active`; status scanned two dirs | ingest scans both active-task dirs, first-dir-wins dedupe | DEF-022; CHANGELOG [1.3.0]; commit `5ceb119` |
| status payload | `reviews.CLOSE` hardcoded false; `event_count` mixed 0/null | CLOSE review wired; `event_count` = 0 when no match | DEF-016; CHANGELOG [1.3.0]; commit `ec63bef` |

## Assets, docs, and skills

| Dimension | Before (≤1.2.2) | After (1.5.0) | Evidence |
|-----------|------------------|----------------|----------|
| Old package name in assets | Prompts/templates/CI samples still told consumers to run `npx @cyning/harness` | All references pinned to `dsh-coding-kit`; D-DOC test gate prevents regression | DEF-002; CHANGELOG [1.2.4]; commit `d3b609d` |
| Docs claims vs implementation | Adapters README, gate fragments, lifecycle comments claimed unwired capabilities as delivered | Claims downgraded to "legacy-only / unwired"; SPEC red line **R-TRUTH-1** test-enforced | DEF-020, DEF-003 phase 1; CHANGELOG [1.2.4]; commits `ac09f10`, `2a4155c` |
| skills scan claim | README disclaimer: "DSH runtime scanning of .dsh/skills not verified against upstream" | Verified against `deepseek-harness@141eb6f`: project `.dsh/skills` rank 100, user `~/.dsh/skills` rank 400 | R-08; CHANGELOG [1.4.0]; PR #4, commit `115ea2b` |
| Mermaid IDE preview | `graph yaml compile` emitted `//` comments, `--"label"-->` edges, unquoted node labels → IDE preview silently broke (nodes in one row, edges lost) | Official syntax: `%%` comments, `-->|"label"|` edges, quoted labels, entity escaping; protocol §7 output contract | DEF-023 (P0-HOT); CHANGELOG [1.2.3]; commit `7a7145d`; syntax refs: mermaid.js.org syntax-reference / flowchart |
| Stale IDE blocks in consumer repos | Upgrade could not touch old `npx @cyning/harness` literals inside `<!-- cyning-harness:begin/end -->` blocks (R-06/R-07 residual) | `refresh-ide-blocks`: dry-run default, `--yes` writes, A1–A4 auto-mapping, B1–B5 manual-report, preflight fail-fast exit 2, 5-generation backups, idempotent | R-07; CHANGELOG [1.5.0]; PR #7, commits `0ef67be`→`b0e85f8`, `b7a5fbe` |

## Build & CI

| Dimension | Before (≤1.2.2) | After (1.5.0) | Evidence |
|-----------|------------------|----------------|----------|
| CI | None | `.github/workflows/ci.yml` node 22/24 matrix + lib smoke test with mtime sentinel (`npm run test:lib`) | DEF-018; CHANGELOG [1.3.0]; commit `f1691e5` |
| package-lock | js-yaml@4.2.0 integrity corrupted since `9042a73`; clean `npm ci` → EINTEGRITY, masked locally by npm cache | Single-line integrity fix; cordis/dsh-tools promoted to devDependencies (npm≥11 skips optional peer trees) | DEF-027; PR #1, commit `cc6ec81` (merge `012d258`); CI run `32711990567` |
| npm ↔ git history | 1.2.1/1.2.2 published with no git commits | Every published version reproducible from a tag; "commit + tag before publish" is a hard step | DEF-001; CHANGELOG [1.2.3]; tags `v1.2.1`…`v1.5.0` |
