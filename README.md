# dsh-coding-kit

[简体中文](README.zh-CN.md) | English

**dsh-coding-kit@1.8.0** is a **bundle plugin** for DeepSeek Harness (DSH), shipping a **P0 gate CLI** and the **G1–G7 process commands**. The discipline assets remain ICVO (Inform · Constrain · Verify · Orchestrate).

> **Loading ≠ injecting.** Installing or loading this plugin does **not** automatically rewrite the system prompt. `apply()` only registers tools. Only after you or the model calls `apply_coding_standards` will later turns' runtime context contain `# Coding Standards`.

## Which entry to choose

| Who you are | Entry | Do NOT |
|-------------|-------|--------|
| DSH session / model calling tools | `dsh plugin add dsh-coding-kit` | Don't just `npm install` (without the bundle layer the tools won't appear) |
| Cursor / CI / daily gates on existing repos | `npx dsh-coding-kit` | Don't treat the plugin `init_coding_kit` and the CLI `init` as the same entry |

Both entries ship from the same npm package **`dsh-coding-kit@1.8.0`**. The plugin surface and the CLI surface do not replace each other.

The `@deepseek-ai/cordis` and `@deepseek-ai/dsh-tools` entries in `peerDependencies` are the **DSH host plugin contract** (needed only when the host loads this package as a plugin; not needed for CLI-only use), and are marked **optional** in `peerDependenciesMeta`.

## Entry A · DSH plugin

Prefer npm (prebuilt, no allowBuilds needed):

```bash
dsh plugin --profile web add dsh-coding-kit
```

Fallback: install from GitHub (needs a Node build; pnpm 10+ may require allowBuilds):

```bash
dsh plugin --profile web add github:Cyning12/dsh-coding-kit#main
```

### Confirmation layer

```bash
dsh --profile web --dump-config
```

After a successful install, the profile's `package.json` will show the `dsh-coding-kit` dependency, and `dsh.profile.bundles` will contain the package name. Users generally don't need to hand-edit bundles; `dsh plugin add` maintains them.

### Activation and invocation

1. Start DSH with that profile (e.g. `dsh --profile web` / `dsh --profile web web`).
2. Say in the conversation: **Please apply the coding standards** (or "write code per the coding-kit standards").
3. The model should call the `apply_coding_standards` tool.
4. On success, later turns' runtime context contains `# Coding Standards`.

Optional parameters: `profile=l1|l1+l2|full` (default `l1+l2`); `persist=false` returns the body only in the current tool result.

Profile tier semantics:

| Tier | Content |
|------|---------|
| `l1` | L1 standards + coding_wiki |
| `l1+l2` (default) | all standards + coding_wiki |
| `full` | **equivalent to `l1+l2` in the current version**; the enum value is reserved for future bundle extensions (differentiated injected content) |

**Override root lookup rule (since 1.3.0)**: `apply_coding_standards` probes upward from the current working directory for `.coding-kit` and `.dsh/coding-kit`, stopping at the nearest ancestor directory containing `.git` (the git root) — so starting DSH from a monorepo subdirectory still hits the repo-root override, and directories above the git root are never picked up by mistake. Without `.git`, lookup continues to the filesystem root. The tool output's `source=override|package` and `root=` lines make the actual hit observable.

When injected content exceeds 24k characters it is truncated at **file boundaries**: the cut only falls between files, never injecting half a file; skipped files can be derived from the full set under `root` minus the tool output's `files` list, and `truncated=true` carries the truncation marker.

### Initializing the project template (plugin surface)

Initialization goes through the **`init_coding_kit`** tool (not the CLI `init`).

Conversation: **Please initialize the coding-kit templates into this project** → the model calls `init_coding_kit`.  
Then edit `.coding-kit/` and call `apply_coding_standards` again (`source=override`). `init_coding_kit` never overwrites existing files.

Note (asymmetric read/write roots, made explicit in 1.3.0): the **read side** (`apply_coding_standards`) looks up to the git root; the **write side** (`init_coding_kit`) still writes into the current working directory. Call `init_coding_kit` from a **repo-root** conversation, to avoid initializing in a monorepo subdirectory while the read side hits the repo root.

Some IDEs / yaml-language-server treat the root `cordis.patch.yml` as an RFC6902 JSON Patch and report missing `op` / `path` / `value`. This is a false positive and can be ignored; the file must keep the `- insert` form — do not convert it to JSON Patch.

## Entry B · CLI (Cursor / CI)

P0 gates and G1–G7 (**delivered in 1.2.0**):

```bash
npx dsh-coding-kit init [--preset NAME] [--yes]   # NAME vocabulary: harness-only (the only legal value)
npx dsh-coding-kit upgrade --yes
npx dsh-coding-kit refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]
npx dsh-coding-kit check
npx dsh-coding-kit verify --task <task.md> [--with-wiki-lint]
npx dsh-coding-kit verify --spec <SPEC.md>   # SPEC-to-00 review-existence gate (mutually exclusive with --task; --with-wiki-lint applies here too)
npx dsh-coding-kit gate-check --task <task.md>
npx dsh-coding-kit audit --task <task.md>
npx dsh-coding-kit task lint --file <task.md>
npx dsh-coding-kit task close --file <task.md>
npx dsh-coding-kit status [--target] [--task] [--json] [--check]
npx dsh-coding-kit timeline --task FILE
npx dsh-coding-kit lifecycle show [--json]
npx dsh-coding-kit lifecycle dry-run --transition ID --from STATE
npx dsh-coding-kit discipline show [--json]
npx dsh-coding-kit graph yaml compile|check|export
npx dsh-coding-kit graph ingest|snapshot|axioms
npx dsh-coding-kit sync index
npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]
npx dsh-coding-kit skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
npx dsh-coding-kit skills build [--with-execute-hats]
npx dsh-coding-kit skills check
npx dsh-coding-kit wiki export --json
npx dsh-coding-kit task lint-done
npx dsh-coding-kit task lint-wiki-delta
npx dsh-coding-kit task check --file PATH
```

`init` / `upgrade` / `sync index` / `skills build` never overwrite the S2 process domain (`docs/tasks/`, `reviews/`, `invokes/by-task/`). `sync prompts` writes only the Starter whitelist under `docs/harness/prompts/` and `docs/harness/templates/TASK_TEMPLATE.md` — default dry-run; existing files with different content are listed as conflicts and are not overwritten unless you pass `--force`.

`verify --with-wiki-lint` (opt-in, non-breaking): appends the `lint-wiki-delta` check (default tier, `scope=all`) on top of the existing gates — effective in both `--task` and `--spec` modes. On a gap, verify is BLOCKED, lists the issues (which may come from sibling active/done tasks), and prints the exact same rerun command as PR CI: `npx --yes dsh-coding-kit task lint-wiki-delta --target .` (see `assets/ci/samples/lint-wiki-delta.yml.example`). `--json` gains a `wiki_lint` block (`ok` / `issues` / `scanned`). A target without `docs/tasks/` directories scans 0 files and never false-blocks. Without the flag, `verify` behaves exactly as before.

Since 1.7.0 the graph-facing behavior of `graph yaml export` / `graph yaml check` is corrected: ① export writes `graph_id` from the yaml-declared value (`data.graph_id`, e.g. `00_main`) as the single source of truth into graphs/nodes/edges, no longer the path-namespaced id (e.g. `l0/00_main`) — path ids remain input-compat only (`--graph-id` / file discovery); ② `check --all` filters graph.json slices with the same declared-value source as export output, so kit-produced root graph.json and check mutually recognize each other; ③ export preserves edge labels for every mark type (`?>` / `~>` / `::…` / `[…]`) — topology-protocol marks are carried as edge attributes instead of dropping the label text; ④ the Mermaid class block emitted by compile is driven by `nodes[].kind` (`flow`/`struct`/`external` → `phase`/`doc`/`infra`), with id-based inference kept as a fallback for nodes without `kind`. Exit codes are unchanged. **Consumer note**: consumers depending on the old export output (namespaced graph_id / dropped labels) must re-run `graph yaml export`.

`check` compares `manifest.version` against the package version three ways (up-to-date / upgradeable / higher). Since 1.5.2, when the manifest carries a non-null `from_version` (i.e. it was migrated from the old `@cyning/harness` product line), a "higher" comparison reports a cross-product-line migration (`@cyning/harness X → dsh-coding-kit Y` — version numbers are not comparable across product lines) and suggests `npx dsh-coding-kit upgrade --yes`, instead of a misleading "possible downgrade" warning; since 1.7.0 this criterion is narrowed so only a `from_version` in the old product line's vocabulary (the 2.x series) takes the migration wording — a kit-line (1.x) `from_version` and `from_version: null` both keep the original three-way wording. The exit code is unchanged (always 0).

### refresh-ide-blocks (R-07 · literal refresh of stale commands in existing IDE blocks)

IDE blocks embedded by the wizard marker merge in the old `@cyning/harness` era (`<!-- cyning-harness:begin -->` … `<!-- cyning-harness:end -->`) may still hold stale command literals. `refresh-ide-blocks` performs whitelisted literal replacement only inside such **product marker block bodies**:

- **Dry-run by default**: with no flag (or an explicit `--dry-run`) it only scans + reports — zero writes, exit 0; only `--yes` writes to disk.
- **Discovery surface (frozen whitelist)**: repo-root `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc` (single level). Files outside the discovery surface are not processed even if they contain markers.
- **Mapping table (frozen · effective only inside block bodies)**:

  | Group | Rule | Behavior |
  |-------|------|----------|
  | A1 | `npx @cyning/harness` → `npx dsh-coding-kit` | auto-replaced; subcommand and arguments preserved verbatim |
  | A2 | `npx @cyning/harness@<version>` → `npx dsh-coding-kit` | auto-replaced; the version pin is dropped entirely (report records dropped_pin) |
  | A3 | `npx --yes @cyning/harness[@<version>]` → `npx --yes dsh-coding-kit` | auto-replaced; `--yes` kept, pin dropped |
  | A4 | bare-bin forms `harness skills build` / `harness skills check` → `npx dsh-coding-kit skills build` / `npx dsh-coding-kit skills check` | auto-replaced (re-run guard when the line prefix already contains `npx dsh-coding-kit`) |
  | B1–B5 | `CYNING_HARNESS` / `--with-scripts` / `wizard/` paths / `harness:<name>` script names / other bare `@cyning/harness` references | **reported as "manual only", never replaced** |

- **Discipline**: marker lines and out-of-block content stay byte-untouched; `<!-- cyning-harness-local:begin -->` blocks are never rewritten; `docs/tasks/`, `docs/harness/reviews/`, `docs/harness/invokes/by-task/` (S2) are always write-refused.
- **preflight (--yes-only fail-fast, exit 2, zero writes)**: a dirty git tree / mixed old-and-new literals in one file (MIXED) / malformed marker pairing (MALFORMED) / any S2 assertion gate hit → refuse to write. The dirty-tree check follows `git status --porcelain` semantics — **untracked files count as dirty**, so commit or `git stash -u` before `--yes`.
- **Backup and rollback**: before `--yes` writes, the original bytes are backed up to `.cyning-harness/backups/refresh-ide-blocks/<UTCts>/` (keeping the latest 5 generations); for rollback prefer `git checkout -- <path>`, or copy back from the backup in non-git repos. Backups are for local rollback only — consumers should add `.cyning-harness/backups/` to `.gitignore` (do not commit them).
- **Marker-less files (report-only, never rewritten)**: discovery-surface files with 0 product blocks are scanned read-only with the same A/B rule set; hits appear in a "无 marker 检出（仅报告，不刷写）" human-report section and in the top-level `plain_mentions: [{path, rule, count}]` JSON field (schema stays `@1` — additive, backward-compatible). They never trigger the preflight fail-fast and never change the exit code.
- **Idempotent**: re-running on already-refreshed files yields 0 group-A hits, `files_written=0`, unchanged bytes, exit 0.
- `--json` prints a single-line machine report (schema `dsh-coding-kit/refresh-ide-blocks-report@1`; since 1.5.2 it additively includes `plain_mentions` / `totals.plain_mentions`).

### D5 test-artifact detection boundary (audit / verify · test_strategy=required)

When a task declares `test_strategy=required`, `audit` / `verify` run the D5 hard check: the target repo must contain **real test artifacts**, otherwise exit 2. D5 is artifact detection — it does not execute test commands. Detection scope (tightened in 1.3.0):

**Strong-signal probes (presence = PASS)**

- Directories: `test/` `tests/` `spec/` `specs/` `__tests__/`
- Config files: `jest.config.{js,ts}` `vitest.config.{js,ts}` `playwright.config.{js,ts}` `cypress.config.js` `pytest.ini`
- Test file names (within 3 levels of the repo root): `*.(test|spec).(js|ts|mjs|cjs)`, `*_test.py`, `test_*.py`

**CI detection**: every `*.yml|*.yaml` under `.github/workflows/` is read as text; CI counts as having tests only if it hits one of these test-step patterns: `pytest` `vitest` `jest` `npm (run )?test` `pnpm (run )?test` `yarn test` `node --test` `go test` `cargo test` `tox` `unittest`, or a step `name:` containing `test`.

**Known false positives and the escape hatch**

- `pyproject.toml` / `setup.py` are **no longer** treated as test artifacts (every modern Python repo has them, regardless of whether tests exist).
- Pure lint / pure deploy workflows (no test step) no longer pass.
- Detection depth is 3 levels from the repo root; for deeper monorepo layouts or custom test commands (e.g. `make test`) that miss the whitelist, drop any strong-signal file into the repo (e.g. a `tests/` directory, `*_test.py`).
- **WARN transition hardened (1.5.0)**: the transitional branch from 1.3.0–1.4.0 — "new detection fails but the old heuristic passes → `D5: WARN transition` exit 0, non-blocking" — has been removed; since 1.5.0 that situation is always a **FAIL** (verify BLOCKED / audit FAIL, exit 2). Before upgrading, add real test artifacts to the repo (e.g. `tests/`, `*_test.py`, `*.test.ts`, or CI with a test step).

## Migrating from @cyning/harness

After pinning **dsh-coding-kit@1.8.0** you can drop `@cyning/harness`. Minimal path, three steps (required, in order):

1. Replace the `devDependency` `@cyning/harness` with `dsh-coding-kit` (pin `1.8.0`).
2. Run `npx dsh-coding-kit upgrade --yes` at the repo root (reads the old `.cyning-harness/manifest.json`; `version` pinned at 1.8.0, `from_version` records the old number).
3. In CI / scripts, replace `npx @cyning/harness` with `npx dsh-coding-kit`.

Skill installation is **recommended, not required** (the minimal path does not depend on DSH scanning skills). Commands are always `npx dsh-coding-kit`.

### FAQ · pnpm peer

If pnpm install still fails on the peer chain (e.g. resolving to an unpublished host package): set `auto-install-peers=false` at the repo root (or one-shot `pnpm add -D dsh-coding-kit --config.auto-install-peers=false`). Even though **1.2.2** already marked cordis / dsh-tools as optional, keeping this fallback is recommended.

### Copy-paste Prompt (for agents maintaining existing repos)

Paste the whole block:

````text
You = the maintenance agent of this repository. Migrate this repo from @cyning/harness to dsh-coding-kit@1.8.0.

Minimal path (required, in order):
1. package.json devDependency: delete @cyning/harness, replace with dsh-coding-kit (pinned at 1.8.0).
2. Run at the repo root: npx dsh-coding-kit upgrade --yes
   (reads the old .cyning-harness/manifest.json; version pinned at 1.8.0, from_version records the old number; never overwrites docs/tasks, reviews, invokes/by-task.)
3. Replace every npx @cyning/harness in CI and scripts with npx dsh-coding-kit.
Commands are always npx dsh-coding-kit. Never write npx @cyning/harness skills build again.

Recommended (not required · skill installation):
- In-repo: npx dsh-coding-kit skills install
  Copies the pre-generated skills from the npm package (excluding 30/40 by default) into this repo's .dsh/skills. Existing files are not overwritten by default; add --force to overwrite.
- User-level: npx dsh-coding-kit skills install --global
  Writes to $HOME/.dsh/skills (HOME is expanded; do not treat ~ as a relative path).

Path reference (never mix them up):
- .dsh/skills or $HOME/.dsh/skills = skill installation target (this command).
- .claude/skills or ~/.claude/skills = Claude Code's skill directory (this command does not write there by default; if you use Claude, copy separately or use --out).
- .dsh/coding-kit or .coding-kit = standards override (apply_coding_standards / init_coding_kit), NOT a skill directory.

Verified (against DSH upstream source): the DSH runtime automatically scans this repo's .dsh/skills and $HOME/.dsh/skills and loads them on demand. A skill is a <name>/SKILL.md directory package or a flat <name>.md file; frontmatter must include name/description; evidence anchors are in the README "Scan verification" section.

Do NOT: GitHub Archive; npm publish / deprecate; make apply auto-inject at load time; install 30/40 by default; copy skills into .dsh/coding-kit.
````

### Path reference

| Path | Purpose | Written by |
|------|---------|------------|
| Product package `assets/skills` | source of truth for generated artifacts; the comparison root of `skills check` | maintainer `skills build` (G5 freeze) |
| `<repo>/.dsh/skills` | consumer skill **installation target** | `skills install` |
| `$HOME/.dsh/skills` | user-level installation target | `skills install --global` |
| `<repo>/.claude/skills` or `~/.claude/skills` | Claude Code skill directory | user copies separately or uses `--out`; **not written by default** |
| `<repo>/.dsh/coding-kit` or `.coding-kit` | standards override (standards / wiki) | `init_coding_kit`; **forbidden** as a skill dest |

### Scan verification (checked against DSH upstream source)

**Verified (2026-08-22 · against DSH upstream source deepseek-harness@141eb6f, i.e. dsh 0.1.0-rc.8)**: the DSH runtime **automatically scans** `<repo>/.dsh/skills` and `$HOME/.dsh/skills` and **loads them on demand** — these are exactly the two **installation targets** of this package's `skills install`. Evidence anchors:

- `packages/skill/skill-filesystem/src/index.ts:246` — scans `<projectRoot>/.dsh/skills` (source=`project-dsh`, rank 100); same file `:253` — scans `<dshHome>/skills` (`$DSH_HOME` or `~/.dsh`, source=`user-dsh`, rank 400).
- `docs/subsystems/skills.md` "Local discovery priority" table says the same (the rank 100/400 rows); loading mechanism: skill summaries are injected into the session catalog, and the model pulls the full body on demand via the `skill({ name })` tool (the "Session catalog and tool contract" section of that document).

Structure and frontmatter requirements (same source): directory package `<name>/SKILL.md` or flat `<name>.md` (index.ts:724-728); frontmatter must include `name`/`description`, and `name` must be kebab-case (index.ts:810-816); projectRoot = the nearest ancestor directory containing `.git` (index.ts:937-947).

Note: scanning/loading is a **behavioral contract of the DSH runtime** and evolves with upstream versions; the anchors above correspond to 0.1.0-rc.8. This package's responsibility ends at writing skills to the correct target and keeping frontmatter valid (`skills check`).

## Releasing (maintainers)

Release process: see [RELEASING.md](RELEASING.md) — hard pre-publish checklist (commit-before-publish · four green gates · version pins · pack dry-run · human-only publish; institutionalizes the DEF-001 lesson).

## GitHub topics

This repository's current GitHub topics: **`dsh-plugin`** (DSH's official discovery tag — see upstream deepseek-harness `README.md` and `CONTRIBUTING.md`; there is no app store), **`deepseek-harness`**, **`dsh-plugins`**, **`dsh`**. The npm keywords in `package.json` likewise include `dsh-plugin` and `deepseek-harness`.

## License

MIT
