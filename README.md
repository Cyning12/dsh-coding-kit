# SpecWave

[简体中文](README.zh-CN.md) | English

**SpecWave** (`spec-wave@3.0.2`) is a **multi-host coding CLI** — one declarative adapt table lands natively on Cursor, Claude Code, optional DSH, agents, and more — with **P0 gate / Harness process commands** and IDE landing. Discipline assets remain ICVO (Inform · Constrain · Verify · Orchestrate).

> **Loading ≠ injecting.** Installing or loading the optional DSH plugin does **not** automatically rewrite the system prompt. `apply()` only registers tools. Only after you or the model calls `apply_coding_standards` will later turns' runtime context contain `# Coding Standards`.
>
> **New here?** First-hour terms — `task.md` / Harness / hats / `kit-*` — are defined in [GLOSSARY.md](GLOSSARY.md) (bilingual).
>
> <sub>Formerly SpecGate / `dsh-coding-kit` — rename history and migration: [MIGRATION.md](MIGRATION.md).</sub>

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Node.js** | **`^22.19.0` or `>=24.0.0`** (see `package.json#engines`) |
| **Not supported** | **Node 20** (and earlier) — engines will fail; upgrade before `npx` / install |

```bash
node -v   # expect v22.19+ or v24+
```

## Quick start (5 steps)

Primary entry is **`npx spec-wave`** from npm **`spec-wave@3.0.2`**. Plugin surface and CLI surface do not replace each other.

```bash
# 1) Confirm package (pin recommended)
npx spec-wave@3.0.2 --version

# 2) Validate adapt table (dry)
npx spec-wave@3.0.2 host validate

# 3) Materialize hosts (dry-run, then write)
npx spec-wave@3.0.2 host apply --tools cursor,claude,dsh --profile core
npx spec-wave@3.0.2 host apply --tools cursor,claude,dsh --profile core --yes

# 4) Or first-time init (process root + host select)
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude,dsh --yes

# 5) After you have a task.md — mechanical gate (exit 2 = hard stop)
npx spec-wave@3.0.2 verify --task docs/tasks/active/task_<slug>.md
```

After `--yes`, Cursor should see `kit-verify` / …; Claude Code `/kit:verify`; DSH `.dsh/skills/kit-*`. Full host matrix and Entry A/B encyclopedia: [Multi-host matrix](#multi-host-matrix) · [Entry A · DSH plugin](#entry-a--dsh-plugin) · [Entry B · CLI](#entry-b--cli-cursor--claude-code--ci). Concepts: [Core objects](#core-objects) · [GLOSSARY.md](GLOSSARY.md).

### Empty repo: minimal green when `test_strategy=required`

CLI **never** writes example tasks into your `docs/tasks/` (S2). You copy the template yourself:

1. `npx spec-wave@3.0.2 sync prompts --yes` (materializes `docs/harness/templates/TASK_TEMPLATE.md` among prompts).
2. Copy the template → `docs/tasks/active/task_<slug>.md` (your action).
3. If meta sets **`test_strategy=required`**: add a **failing** automated test for the critical path **before** hat 30 changes implementation; then implement until green.
4. Human-gate table must be **4 columns**; `HG-AUDIT-R1` → `approved` before hat 30 may change code.
5. `npx spec-wave@3.0.2 task lint --file docs/tasks/active/task_<slug>.md` then `verify --task …`.

Details: template path above · [Core objects](#core-objects) · [GLOSSARY.md](GLOSSARY.md).

## Which entry to choose

| Who you are | Entry | Do NOT |
|-------------|-------|--------|
| Cursor / Claude Code / CI on existing repos | `npx spec-wave` (+ optional `host apply`) | Don't treat the plugin `init_coding_kit` and the CLI `init` as the same entry |
| DSH session / model calling tools (optional) | `dsh plugin add spec-wave` (`dsh-coding-kit` **deprecated** — do not add the old name) | Don't just `npm install` (without the bundle layer the tools won't appear) |

Transition bins `specgate` and `dsh-coding-kit` still work; new scripts should use `npx spec-wave`.

### Multi-host matrix

One declarative table → native landing on several hosts (always_on + skills + **commands**). Verify truth stays in the CLI (`failClosed` exit **2**); IDE slash/commands only orchestrate. **Installing the npm package does not materialize IDE files** (no postinstall); run `init --tools` / `host apply` explicitly.

| Host | What `host apply` writes (profile `core`) |
|------|-------------------------------------------|
| **Cursor** | `.cursor/rules/*.mdc` · `.cursor/commands/kit-*.md` · `.cursor/skills/` |
| **Claude Code** | `CLAUDE.md` product marker block · `.claude/commands/kit/<verb>.md` → **`/kit:verb`** · `.claude/skills/` |
| **DSH** | `.dsh/skills/` — hat skills **+** orchestration `kit-*` (discoverable via `/`; **no** `.dsh/commands/`) |
| **agents** (optional) | `AGENTS.md` fragment · `.agents/skills/` |
| **Copilot** | `AGENTS.md` fragment (shared marker block) · `.github/skills/` |
| **Codex** | `AGENTS.md` fragment (shared marker block) · `.agents/skills/` |
| **Windsurf** | `AGENTS.md` fragment (shared marker block) · `.windsurf/skills/` |
| **Gemini CLI** | `GEMINI.md` (same host-neutral fragment) · `.gemini/skills/` |
| **opencode** | `AGENTS.md` fragment (shared marker block) · `.agents/skills/` |
| **Roo Code** | `AGENTS.md` fragment (shared marker block; loaded per official-repo merged PR) · no skills dir (no official convention) |
| **Zed** | `AGENTS.md` fragment (shared marker block) · `.agents/skills/` |
| **Cline** | `AGENTS.md` fragment (shared marker block) · `.cline/skills/` |
| **aider** (injection layer) | `AGENTS.md` fragment (injection-layer support: aider does **not** auto-load AGENTS.md — use `aider --read AGENTS.md` or `.aider.conf.yml` with `conventions-file: AGENTS.md`) · no skills dir (no official convention) |

**2.2 W6 / 2.3 W6 host additions** (same package): the nine hosts above reuse the **agents** asset face (zero new assets); each landing follows the host's official docs, and hosts without an official skills convention get no skills directory (never fabricated). aider is a documented downgrade — injection layer only.

**2.1 additions** (same package): Claude `/kit:` namespace UX · DSH `.dsh/skills/kit-*` orchestration · optional `--profile expanded` for `kit-hat-*` thin shells (default remains `core`).

**2.1.1 · install / upgrade UX** (aligned with OpenSpec `init --tools`):

| Topic | Behavior |
|-------|----------|
| Sticky | Successful `--yes` write of `host apply` / `host update` / `init` (when materializing) updates `.coding-kit/host-tools.json` (`host_ids` + `profile`). Dry-run does **not** write sticky. |
| `--tools` | `LIST` (e.g. `cursor,claude,dsh`) · `all` (every host_id in the adapt table) · `none` (**init only**: process root, no host materialize). `host apply` **always** requires `--tools`. |
| `host update` (scheme **A**) | Resolve order: CLI `--tools` → sticky → else **exit 1**. With sticky, `host update --yes` refreshes **only** selected hosts. **BREAKING (small)** vs 2.1.0 “omit `--tools` = full table”. |
| `init` | TTY without `--tools` → **asks** (multi-select / all / none). Non-TTY / CI without `--tools` → **exit 1**. `tools≠none` and not `--no-host-adapt` → in-process `host apply` + sticky. `--no-host-adapt` → no apply and **no** sticky. |

```bash
# After upgrading the package: refresh sticky hosts (no need to re-list --tools)
npx spec-wave@3.0.2 host update --yes
```

Full matrix: [`assets/ide/host-adapt/README.md`](assets/ide/host-adapt/README.md) · dogfood/recording: [`docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md`](docs/guides/DOGFOOD_host_adapt_cursor_claude_录屏清单_v1_zh.md) · plan: [`docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md`](docs/roadmap/PLAN_2_1_1_host_tools_ux_v1_zh.md).

The `@deepseek-ai/cordis` and `@deepseek-ai/dsh-tools` entries in `peerDependencies` are the **DSH host plugin contract** (needed only when the host loads this package as a plugin; not needed for CLI-only use), and are marked **optional** in `peerDependenciesMeta`.

## Core objects

The Harness process revolves around two file-level objects. `verify --task <task.md>` / `gate-check --task <task.md>` / `task close` all operate on the first one — this section defines both before you meet them in the command list.

### task.md — one executable, verifiable unit of work

- **What it is**: a single Markdown file for one unit of work: background/goal, scope, non-goals, failure paths, acceptance criteria, Harness metadata (`test_strategy`, `wiki_delta`, …) and the human-gate table. `HG-AUDIT-R1` must be `approved` in that table before hat 30 may change code; `npx spec-wave verify --task <task.md>` reads the table as truth (chat claims do not count).
- **Where it comes from**: copy `docs/harness/templates/TASK_TEMPLATE.md`, materialized by `npx spec-wave sync prompts --yes`. The CLI never writes example tasks into your `docs/tasks/` — creating the file is always your explicit action.
- **Where it lives**: `docs/tasks/active/task_<slug>.md` while in flight; `npx spec-wave task close --file <task> --yes` archives it to `docs/tasks/done/`.

Minimal skeleton (full field list in the template):

```markdown
# Task: add login rate limiting

> **状态**：`draft`

## Harness 元信息
| 字段 | 值 |
|------|-----|
| **task_slug** | `login-rate-limit` |
| **test_strategy** | `required` |
| **wiki_delta** | `none` |

### 人工闸
<!-- Gate table must be 4 columns (last = 说明). A 3-column table is silently ignored. Do not embed bold ** inside the id cell (wrapping the whole id as **HG-…** is OK). -->
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | pending | 30 | R1 审查后人签 |

## 范围 / ## 非范围 / ## 失败路径 / ## 验收标准
（逐节照模板填写；验收须含可跑命令）
```

> **Gate table**: must be **4 columns** (last column `说明`). A 3-column table is **silently ignored** by the parser. Do **not** put bold `**` *inside* the id cell (that makes the whole row fail to parse); wrapping the whole id as `**HG-…**` is OK.

### spec.md — the requirement a task traces back to

- **What it is**: the signed-off requirement spec (background / scope / non-scope / acceptance / failure paths) that a task references via `关联 SPEC`. `npx spec-wave verify --spec <SPEC.md>` gates that a written review exists before implementation.
- **Where it comes from**: written by you or your agent (hat 10 flow) — the CLI does not materialize spec files.
- **Where it lives**: `docs/spec/` (this repo keeps specs under `docs/spec/<topic>/`, e.g. `docs/spec/2_2-closed-loop-start/`).

The same quickstart chain is printed by `npx spec-wave init` — step 3 requires your project to be a git repository (run `git init` first if needed; `verify` checks git-root ownership). Step 4 (optional) points to `npx spec-wave graph scaffold` for a **reviewable draft** under `docs/_tech_graph/` (not signed architecture truth; see graph section below). Terminology (Harness / hats / gates / S2) is collected in [GLOSSARY.md](GLOSSARY.md) (bilingual glossary — links back to this section).

---
## Entry A · DSH plugin

Prefer npm (prebuilt, no allowBuilds needed):

```bash
dsh plugin --profile web add spec-wave
```

> **`dsh-coding-kit` is deprecated.** Use **`spec-wave`** as the DSH plugin package name (same product).

Fallback: install from GitHub (needs a Node build; pnpm 10+ may require allowBuilds):

```bash
dsh plugin --profile web add github:Cyning12/SpecWave#main
```

### Confirmation layer

```bash
dsh --profile web --dump-config
```

After a successful install, the profile's `package.json` will show the `spec-wave` dependency, and `dsh.profile.bundles` will contain the package name. Users generally don't need to hand-edit bundles; `dsh plugin add` maintains them.

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

## Entry B · CLI (Cursor / Claude Code / CI)

P0 gates and G1–G7 (**delivered in 1.2.0**):

```bash
npx spec-wave init [--preset NAME] [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt] [--yes]   # NAME vocabulary: harness-only (the only legal value)
npx spec-wave upgrade --yes
npx spec-wave refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]
npx spec-wave check
npx spec-wave verify --task <task.md> [--with-wiki-lint]   # pre-30 gate; since 2.3: review file must also carry a machine-readable passing conclusion (G2)
npx spec-wave verify --spec <SPEC.md>   # SPEC-to-00 review-existence gate (mutually exclusive with --task; --with-wiki-lint applies here too)
npx spec-wave verify   # bare mode (2.3+): repo-wide reviews scan over both review dirs — done tasks fail-closed, active tasks info-only; legacy exemptions via docs/harness/legacy-gate-exempt.yaml
npx spec-wave gate-check --task <task.md>
npx spec-wave audit --task <task.md>
npx spec-wave task lint --file <task.md>
npx spec-wave task close --file <task.md>
npx spec-wave status [--target] [--task] [--json] [--check]
npx spec-wave timeline --task FILE
npx spec-wave lifecycle show [--target PATH] [--json]
npx spec-wave lifecycle dry-run --transition ID --from STATE
npx spec-wave discipline show [--target PATH] [--json]
npx spec-wave graph yaml compile|check|export
npx spec-wave graph scaffold [--target PATH] [--yes] …   # draft tech-graph under docs/_tech_graph (reviewable, not signed truth)
npx spec-wave graph drift [--target PATH] [--input DIR] [--json]   # drift gate: module coverage + missing anchors (report only · no redraw)
npx spec-wave graph ingest|snapshot|axioms
npx spec-wave graph ontology check [--file PATH] [--json]   # + --hgm: instance check of the event-sourced graph against the bundled ontology
npx spec-wave sync index
npx spec-wave sync prompts [--target PATH] [--yes] [--force] [--json]
npx spec-wave skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
npx spec-wave skills build [--with-execute-hats]
npx spec-wave skills check
npx spec-wave host validate [--file PATH] [--json]
npx spec-wave host apply --tools cursor,claude --profile core [--target PATH] [--file PATH] [--json] [--dry-run|--yes]
npx spec-wave host update [--tools LIST|all] [--profile core] [--target PATH] [--file PATH] [--json] [--dry-run|--yes] [--force]
npx spec-wave wiki export --json
npx spec-wave task lint-done
npx spec-wave task lint-wiki-delta
npx spec-wave task check --file PATH
```

`host apply` / `host update` sniff the host-adapt table version and optional `@deepseek-ai/dsh-tools` peer (**U-01**): mismatch → exit 2 and no writes (`--json` includes `contract.status`). `--tools dsh` keeps commands=[] (no `.dsh/commands/`) and lands orchestration as `.dsh/skills/kit-*`. **`host update` without `--tools`** uses sticky `.coding-kit/host-tools.json` (else exit 1). See **Multi-host in one package** above.

This **source repo** dogfoods `graph yaml compile|check|export` against `docs/_tech_graph/` (**not** shipped in the npm package; https://github.com/Cyning12/SpecWave/tree/main/docs/_tech_graph).

**Tech-graph scaffold (`graph scaffold`, planned 3.1)**: from a business-repo root, generates a **reviewable draft** under `docs/_tech_graph/` (main graph · module table · primary flow · `REVIEW_CHECKLIST.md`). Default is dry-run; `--yes` writes. Output is draft-marked — **not** signed architecture truth (`HG-GRAPH-MODULES` remains for humans). Do not call it an “authoritative auto graph”.

**Drift gate (`graph drift`, 3.1 W3)**: checks `01_struct` module coverage and registered `*.graph.yaml` anchor paths (skip `TBD` / empty); drift → **exit 2**. Optional whitelist `.spec-wave/graph-drift.yaml` (missing file = full check; bad YAML fail-closed). **Report only — does not redraw** graphs.

**Graph capability vs. ontology layer (3.0 ONTO-OPEN ruling)**: the graph surface is open — `graph yaml compile|check|export` works on consumer-authored graphs today, and `graph ontology check [--file PATH]` validates the bundled ontology file or a drifted copy you point it at. The bundled ontology (`assets/ontology.yaml`) is SpecWave's self-use meta-model, however — **不提供自定义本体能力**（the ontology layer is **not** open: no consumer-defined classes/relations; validator open ≠ ontology content open）. Re-examination triggers (research doc §7.3): a real consumer request · re-evaluation after the ontology-check surface stays stable for one minor · post-B5 ecosystem pull — via an HG-SCHEMA-CHANGE-style human gate.

`init` / `upgrade` / `sync index` / `skills build` never overwrite the S2 process domain (`docs/tasks/`, `docs/harness/reviews/`, `docs/harness/invokes/by-task/`, plus legacy bare `reviews/` / `invokes/by-task/`). **S2 prefix truth is a single shared constant** (`S2_TRUTH_PREFIXES` in `cli-shared`; F1 / 1.x MVP). `sync prompts` writes only the Starter whitelist under `docs/harness/prompts/` (**11** files) and `docs/harness/templates/TASK_TEMPLATE.md` — default dry-run; existing files with different content are listed as conflicts and are not overwritten unless you pass `--force`.

`verify --with-wiki-lint` (opt-in, non-breaking): appends the `lint-wiki-delta` check (default tier, `scope=all`) on top of the existing gates — effective in both `--task` and `--spec` modes. On a gap, verify is BLOCKED, lists the issues (which may come from sibling active/done tasks), and prints the exact same rerun command as PR CI: `npx --yes spec-wave task lint-wiki-delta --target .` (see `assets/ci/samples/lint-wiki-delta.yml.example`). `--json` gains a `wiki_lint` block (`ok` / `issues` / `scanned`). A target without `docs/tasks/` directories scans 0 files and never false-blocks. Without the flag, `verify` behaves exactly as before.

Since 1.7.0 the graph-facing behavior of `graph yaml export` / `graph yaml check` is corrected: ① export writes `graph_id` from the yaml-declared value (`data.graph_id`, e.g. `00_main`) as the single source of truth into graphs/nodes/edges, no longer the path-namespaced id (e.g. `l0/00_main`) — path ids remain input-compat only (`--graph-id` / file discovery); ② `check --all` filters graph.json slices with the same declared-value source as export output, so kit-produced root graph.json and check mutually recognize each other; ③ export preserves edge labels for every mark type (`?>` / `~>` / `::…` / `[…]`) — topology-protocol marks are carried as edge attributes instead of dropping the label text; ④ the Mermaid class block emitted by compile is driven by `nodes[].kind` (`flow`/`struct`/`external` → `phase`/`doc`/`infra`), with id-based inference kept as a fallback for nodes without `kind`. Exit codes are unchanged. **Consumer note**: consumers depending on the old export output (namespaced graph_id / dropped labels) must re-run `graph yaml export`.

`check` compares `manifest.version` against the package version three ways (up-to-date / upgradeable / higher). Since 1.5.2, when the manifest carries a non-null `from_version` (i.e. it was migrated from the old `@cyning/harness` product line), a "higher" comparison reports a cross-product-line migration (`@cyning/harness X → spec-wave Y` — version numbers are not comparable across product lines) and suggests `npx spec-wave upgrade --yes`, instead of a misleading "possible downgrade" warning; since 1.7.0 this criterion is narrowed so only a `from_version` in the old product line's vocabulary (the 2.x series) takes the migration wording — a kit-line (1.x) `from_version` and `from_version: null` both keep the original three-way wording. The exit code is unchanged (always 0).

### refresh-ide-blocks (R-07 · literal refresh of stale commands in existing IDE blocks)

IDE blocks embedded by the wizard marker merge in the old `@cyning/harness` era (`<!-- cyning-harness:begin -->` … `<!-- cyning-harness:end -->`) may still hold stale command literals. `refresh-ide-blocks` performs whitelisted literal replacement only inside such **product marker block bodies**:

- **Dry-run by default**: with no flag (or an explicit `--dry-run`) it only scans + reports — zero writes, exit 0; only `--yes` writes to disk.
- **Discovery surface (frozen whitelist)**: repo-root `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc` (single level). Files outside the discovery surface are not processed even if they contain markers.
- **Mapping table (frozen · effective only inside block bodies)**:

  | Group | Rule | Behavior |
  |-------|------|----------|
  | A1 | `npx @cyning/harness` → `npx spec-wave` | auto-replaced; subcommand and arguments preserved verbatim |
  | A2 | `npx @cyning/harness@<version>` → `npx spec-wave` | auto-replaced; the version pin is dropped entirely (report records dropped_pin) |
  | A3 | `npx --yes @cyning/harness[@<version>]` → `npx --yes spec-wave` | auto-replaced; `--yes` kept, pin dropped |
  | A4 | bare-bin forms `harness skills build` / `harness skills check` → `npx spec-wave skills build` / `npx spec-wave skills check` | auto-replaced (re-run guard when the line prefix already contains `npx spec-wave`) |
  | A5 | `npx dsh-coding-kit` → `npx spec-wave` | auto-replaced (B-REFRESH · SpecWave rename) |
  | A6 | `npx dsh-coding-kit@<version>` → `npx spec-wave` | auto-replaced; pin dropped (dropped_pin) |
  | A7 | `npx --yes dsh-coding-kit[@<version>]` → `npx --yes spec-wave` | auto-replaced; `--yes` kept, pin dropped |
  | B1–B5 | `CYNING_HARNESS` / `--with-scripts` / `wizard/` paths / `harness:<name>` script names / other bare `@cyning/harness` references | **reported as "manual only", never replaced** |

- **Discipline**: marker lines and out-of-block content stay byte-untouched; `<!-- cyning-harness-local:begin -->` blocks are never rewritten; `docs/tasks/`, `docs/harness/reviews/`, `docs/harness/invokes/by-task/` (S2) are always write-refused.
- **preflight (--yes-only fail-fast, exit 2, zero writes)**: a dirty git tree / mixed old-and-new literals in one file (MIXED) / malformed marker pairing (MALFORMED) / any S2 assertion gate hit → refuse to write. The dirty-tree check follows `git status --porcelain` semantics — **untracked files count as dirty**, so commit or `git stash -u` before `--yes`.
- **Backup and rollback**: before `--yes` writes, the original bytes are backed up to `.coding-kit/backups/refresh-ide-blocks/<UTCts>/` (keeping the latest 5 generations); for rollback prefer `git checkout -- <path>`, or copy back from the backup in non-git repos. Backups are for local rollback only — consumers should add `.coding-kit/backups/` to `.gitignore` (do not commit them). Legacy `.cyning-harness/backups/` may still exist on older trees; new writes do not target it.
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


### P0 gate exit codes (failClosed · F2 / 1.x MVP)

| Code | Meaning | Typical commands |
|------|---------|------------------|
| **0** | Pass / informational | `check` **always** exits 0 (version advice only) |
| **1** | Usage error or non-blocking failure | Missing required flags, unknown args |
| **2** | **Gate BLOCKED** — failClosed; do not proceed | `verify` / `gate-check` / `audit` P0 failure; D5 missing artifacts when `test_strategy=required` |

**failClosed**: a P0 gate failure exits **2**. CI and agents must treat 2 as hard stop (same family as Claude Code hook exit 2). Do not remap 2→0 locally to “keep going”.

**Layered enforcement (document-level · 1.x — no cloud policy engine)**:

1. Mechanical gate result in the consumer repo (`verify` / `gate-check` / `audit` exit 2) outranks local habit of skipping gates.  
2. Task `HG-AUDIT-R1=approved` is required before hat 30 may change code.  
3. Host hooks are **not** required for kit P0 — judgment is in-process CLI logic.


### pins consumer mode (consumer-repo version-pin freshness · 3.0.2+)

For repos that **consume** spec-wave. Upgrading used to mean hand-aligning several surfaces (exact pin in `package.json`, `spec-wave@<x.y.z>` literals in CI workflows, version literals in test mocks); any missed surface drifts silently. `pins check --consumer` turns that into one mechanical CI gate (drift → exit 2):

- **Truth source (fallback chain)**: `package.json#devDependencies.spec-wave` → `#dependencies.spec-wave` → `#version`; first string wins. All three missing → exit 2 naming the full chain. Override explicitly with `--truth <path#jsonpath>` (e.g. `--truth package.json#devDependencies.spec-wave`; absolute paths and `../` are refused).
- **Exact versions**: `X.Y.Z` accepted as-is; `^`/`~` prefixes are normalized with a visible WARN (also in `--json` `warnings`); anything else (`*`, `workspace:*`, ranges) → exit 2 recommending an exact pin.
- **Default pin surface** (zero config): every `.github/workflows/*.{yml,yaml}` file that literally contains `<pkg>@X.Y.Z` gets a synthesized pin; files without the literal are skipped (no false BLOCKED on unrelated workflows).
- **Optional declaration** `.spec-wave/pins-consumer.yaml` — replaces the default surface when present; malformed file → exit 2 failClosed (a broken declaration is never silently treated as absent):

```yaml
version: "1"
package_name: spec-wave   # optional, default spec-wave
pins:
  - id: consumer-test-mocks
    path: tests/test_capability_harness_cli.py
    extract: { kind: regex-all, pattern: 'spec-wave@(\d+\.\d+\.\d+)', flags: g }
    expected: { kind: package-version }   # = consumer truth version
    required: true
    fixable: true
```

- `pins fix --consumer` is dry-run by default; `--yes` writes (S2 process dirs stay mechanically write-refused).
- **Division of labor**: release mode (no flag) serves the spec-wave release repo itself (`assets/release-pins.yaml`); `--consumer` serves consumer repos.


## Migrating from @cyning/harness

Full checklist, layout rules (F4 scheme B), and **published** EOS / deprecate calendar: see [`MIGRATION.md`](./MIGRATION.md).

After pinning **spec-wave@3.0.2** you can drop `@cyning/harness`. Minimal path, three steps (required, in order):

1. Replace the `devDependency` `@cyning/harness` with `spec-wave` (pin `3.0.2`; formerly `dsh-coding-kit`).
2. Run `npx spec-wave upgrade --yes` at the repo root (reads `.coding-kit/manifest.json` if present, else legacy `.cyning-harness/manifest.json`; **writes** `.coding-kit/manifest.json` with `version` pinned at 3.0.2 and `from_version` recording the old number; **does not delete** `.cyning-harness/`).
3. In CI / scripts, replace `npx @cyning/harness` / `npx dsh-coding-kit` with `npx spec-wave`.

**Layout**: new kit process files land under **`.coding-kit/`**. `.cyning-harness/` remains **legacy read-only**. Do not treat `.cyning-harness` as the new standard root.

Skill installation is **recommended, not required** (the minimal path does not depend on DSH scanning skills). Commands are always `npx spec-wave`. **`@cyning/harness` is deprecated** on npm (2026-09-10 · maintainer-only); pin **`spec-wave@3.0.2`** and migrate via `MIGRATION.md`.

### FAQ · pnpm peer

If pnpm install still fails on the peer chain (e.g. resolving to an unpublished host package): set `auto-install-peers=false` at the repo root (or one-shot `pnpm add -D spec-wave --config.auto-install-peers=false`). Even though **1.2.2** already marked cordis / dsh-tools as optional, keeping this fallback is recommended.

### Copy-paste Prompt (for agents maintaining existing repos)

Paste the whole block:

````text
You = the maintenance agent of this repository. Migrate this repo from @cyning/harness to spec-wave@3.0.2.

Minimal path (required, in order):
1. package.json devDependency: delete @cyning/harness, replace with spec-wave (pinned at 3.0.2; formerly dsh-coding-kit).
2. Run at the repo root: npx spec-wave upgrade --yes
   (reads .coding-kit/manifest.json or legacy .cyning-harness/manifest.json; writes .coding-kit/manifest.json; version pinned at 3.0.2, from_version records the old number; never deletes .cyning-harness/; never overwrites docs/tasks, reviews, invokes/by-task.)
3. Replace every npx @cyning/harness and npx dsh-coding-kit in CI and scripts with npx spec-wave.
Commands are always npx spec-wave. Never write npx @cyning/harness skills build again.
See MIGRATION.md for layout (.coding-kit vs legacy) and EOS calendar (pending human gates).

Recommended (not required · skill installation):
- In-repo: npx spec-wave skills install
  Copies the pre-generated skills from the npm package (excluding 30/40 by default) into this repo's .dsh/skills. Existing files are not overwritten by default; add --force to overwrite.
- User-level: npx spec-wave skills install --global
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

## Host usage (product Chat / communication agent)

Skills **do not** cover the full process surface. A Host that nests Harness process needs a Process Kernel object + CLI Capability + PromptAssembly slots — not a Skills copy alone.

Recommended Capability allowlist (**Policy / H2 required**: default off · explicit Host-env grant · no arbitrary shell):

- `npx --yes spec-wave@<pin> verify …`
- `npx --yes spec-wave@<pin> task …`

| Capability | Covered by Skills? |
|------------|-------------------|
| 10/20 audit guidance | Yes (default install) |
| 00 delegate-only | Weak: full 00 is not default; short delegate-only Skill is |
| 30/40 execute | Weak: not default (pre-T1); still needs `verify` |
| Gates / pre-30 / may_start_30 | **No**: CLI `verify` (or Host wrapping the same CLI) |
| Always-on hat system prompt | **No**: Skills are on-demand, not system |
| Host product Q&A | **No**: product Prompt Pack, not a harness Skill |

Three surfaces, not interchangeable: **System/Re-anchor** = short identity; **full prompts** = load on hat switch; **verify** = mechanical.

## Releasing (maintainers)

**Current package**: **`spec-wave@3.0.2`** — **published** (registry `latest=3.0.2` · `time.3.0.2`=2026-09-24T00:55:45.386Z · tag `v3.0.2` ↔ tip `3d71b90` · verified 2026-09-24). Prior published: **`3.0.1`** (signal-quality patch) · **`3.0.0`** (architecture leap) · **`2.4.2`** (acceptance-fixes patch) · **`2.4.1`** (acceptance-fixes patch) · **`2.4.0`** (gate strength) · **`2.3.1`** (acceptance-fixes patch) · **`2.3.0`** (wiring completion) · **`2.2.1`** (acceptance-fixes patch) · **`2.2.0`** (closed-loop start).

Release process: see [RELEASING.md](RELEASING.md) — hard pre-publish checklist (commit-before-publish · four green gates · version pins · Agent may bump/tag · **human-only `npm publish`**; institutionalizes the DEF-001 lesson).

## GitHub topics

This repository's current GitHub topics: **`dsh-plugin`** (DSH's official discovery tag — see upstream deepseek-harness `README.md` and `CONTRIBUTING.md`; there is no app store), **`deepseek-harness`**, **`dsh-plugins`**, **`dsh`**. The npm keywords in `package.json` likewise include `dsh-plugin` and `deepseek-harness`.

## License

MIT
