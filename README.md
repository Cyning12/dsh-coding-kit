# SpecWave

[![npm version](https://img.shields.io/npm/v/spec-wave.svg)](https://www.npmjs.com/package/spec-wave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write your AI coding rules once. SpecWave installs them natively into Cursor, Claude Code, Copilot, and 10 more tools.**

[简体中文](README.zh-CN.md) | English

---

## The Problem

Maintaining separate config files for each AI coding tool by hand:

```
.cursorrules              ← Cursor rules (copy-paste)
CLAUDE.md                 ← Claude Code conventions (duplicate)
.github/copilot-instructions.md  ← Copilot settings (also duplicate)
.windsurf/rules.md        ← Windsurf rules (you get the idea...)
```

Every time you update one, you manually sync the others. Rules drift. Teams waste time.

## The SpecWave Solution

**One source of truth.** One command. Native installations everywhere.

```bash
npx spec-wave host apply --tools cursor,claude,copilot,windsurf --yes
```

SpecWave reads your declarative adapt table and generates the native config files each tool expects:

| Before SpecWave | After SpecWave |
|-----------------|----------------|
| Manually maintain 5+ config files | Maintain **one adapt table** |
| Copy-paste rules between tools | Run **one command** to sync all |
| Rules drift across tools | **Single source of truth** |
| No enforcement | **Fail-closed gates** (exit 2) |

---

## Quick Start

```bash
# 1. Install and initialize
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude --yes

# 2. Verify everything is set up
npx spec-wave@3.0.2 check

# 3. Apply coding standards to your IDE
# Cursor users: restart Cursor to load new rules
# Claude Code users: restart Claude Code to load new commands
```

**That's it.** Your coding rules are now active in both tools.

---

## Supported Hosts (13 Tools)

SpecWave generates native files for each host. One adapt table, 13 destinations:

| Host | Generated Files | Notes |
|------|----------------|-------|
| **Cursor** | `.cursor/rules/*.mdc`<br>`.cursor/commands/kit-*.md`<br>`.cursor/skills/` | Native Cursor rules & commands |
| **Claude Code** | `CLAUDE.md`<br>`.claude/commands/kit/*.md` → `/kit:*`<br>`.claude/skills/` | Product marker block + commands |
| **GitHub Copilot** | `AGENTS.md`<br>`.github/skills/` | Native GitHub skills directory |
| **Codex** | `AGENTS.md`<br>`.agents/skills/` | Repo-level scan directory |
| **Windsurf** | `AGENTS.md`<br>`.windsurf/skills/` | Native Windsurf skills |
| **Gemini CLI** | `GEMINI.md`<br>`.gemini/skills/` | Native Gemini context file |
| **OpenCode** | `AGENTS.md`<br>`.agents/skills/` | Agent-compatible path |
| **Roo Code** | `AGENTS.md` | AGENTS.md loaded via merged PR |
| **Zed** | `AGENTS.md`<br>`.agents/skills/` | Project-local directory |
| **Cline** | `AGENTS.md`<br>`.cline/skills/` | Workspace skills |
| **aider** | `AGENTS.md` | Injection layer (requires `aider --read AGENTS.md`) |
| **DSH** | `.dsh/skills/` | Hat skills + orchestration |
| **agents** | `AGENTS.md`<br>`.agents/skills/` | Generic agents standard |

> **13 hosts. One command.** No manual file editing.

---

## Why Fail-Closed Gates?

SpecWave includes **P0 gates** that enforce process discipline:

```bash
# Before making changes, verify task approval
npx spec-wave verify --task docs/tasks/active/task_login-limit.md
# Exit code 2 (BLOCKED) = do not proceed
# Exit code 0 (PASS) = approved, proceed
```

**Fail-closed** means: if a gate fails, the command exits with code `2` (not `0` or `1`). CI and agents **must** treat exit code `2` as a hard stop.

- **Exit 0**: Pass
- **Exit 1**: Usage error (non-blocking)
- **Exit 2**: Gate BLOCKED — **do not proceed**

This ensures:
- Human approval before code changes
- Test artifacts exist when required
- Review files exist before implementation
- No silent failures

---

## Terminal Demo

<!-- TODO: Real terminal demo GIF/SVG placeholder
     Recording tools (vhs/asciinema) not available in build environment.
     Add genuine recording of: npx spec-wave host apply --tools cursor,claude --yes
     showing native file generation + verification flow.
-->

**Demo placeholder:** Real terminal recording to be added.  
Show: `host apply` → native files generated → `verify` gate check.

---

## Features

### 🎯 Single Source of Truth
One declarative `mvp-hosts.yaml` generates all tool-specific configs. No more manual syncing.

### 🔒 Fail-Closed Gates
Mechanical gates (`verify`, `gate-check`, `audit`) exit with code 2 when blocked. No silent bypasses.

### 📋 Harness Process
Task-driven workflow with:
- `task.md`: executable work units with approval gates
- `spec.md`: requirement specs with review gates
- `HG-AUDIT-R1`: human gate that must be `approved` before code changes

### 🔄 Update Anywhere
After upgrading SpecWave, refresh all hosts with one command:

```bash
npx spec-wave@3.0.2 host update --yes
```

Reads `.coding-kit/host-tools.json` (sticky selection) and regenerates only the tools you're using.

### 🧪 Test-Strategy Enforcement
When `test_strategy: required` in a task, the `verify` gate checks for real test artifacts:
- Test directories (`tests/`, `__tests__/`)
- Test config files (`jest.config.js`, `vitest.config.ts`, etc.)
- Test files (`*.test.ts`, `*_test.py`)
- CI with test steps

Missing test artifacts → exit code 2 (BLOCKED).

---

## Real-World Example

A team maintaining coding standards for Cursor, Claude Code, and Copilot:

```bash
# Before SpecWave: manually edit 3 files
vim .cursorrules
vim CLAUDE.md
vim .github/copilot-instructions.md

# After SpecWave: edit one adapt table
vim .coding-kit/mvp-hosts.yaml
npx spec-wave host update --yes
# All 3 tools regenerated ✅
```

**Time saved:** hours per update → seconds per update.  
**Consistency:** guaranteed (single source of truth).  
**Enforcement:** fail-closed gates prevent human error.

---

## Installation & Setup

### Prerequisites

- **Node.js**: `^22.19.0` or `>=24.0.0`
- **Not supported**: Node 20 and earlier

Check your version:

```bash
node -v  # expect v22.19+ or v24+
```

### Three Ways to Use SpecWave

#### 1️⃣ CLI for Cursor / Claude Code / CI (Most Common)

```bash
# Initialize with selected tools
npx spec-wave@3.0.2 init --preset harness-only --tools cursor,claude --yes

# Or apply to existing repo
npx spec-wave@3.0.2 host apply --tools cursor,claude,copilot --profile core --yes
```

#### 2️⃣ DSH Plugin (Optional)

```bash
# Install as DSH plugin
dsh plugin --profile web add spec-wave

# In conversation: "Please apply the coding standards"
# Model calls: apply_coding_standards tool
```

#### 3️⃣ CI Integration

Add to `.github/workflows/verify.yml`:

```yaml
- name: Verify task gates
  run: npx --yes spec-wave@3.0.2 verify --task docs/tasks/active/task_*.md
```

Exit code 2 = fail the build (gate blocked).

---

## CLI Commands

### Core Commands

```bash
# Process initialization
npx spec-wave init --preset harness-only --tools cursor,claude --yes

# Host management
npx spec-wave host validate           # Validate adapt table
npx spec-wave host apply --tools LIST --yes  # Generate native files
npx spec-wave host update --yes       # Refresh after upgrade

# Gates (fail-closed: exit 2 on block)
npx spec-wave verify --task FILE      # Pre-implementation gate
npx spec-wave verify --spec FILE      # Review-existence gate
npx spec-wave gate-check --task FILE  # Check human gates
npx spec-wave audit --task FILE       # Audit trail check

# Task management
npx spec-wave task lint --file FILE   # Lint task file
npx spec-wave task close --file FILE  # Archive to docs/tasks/done/

# Utilities
npx spec-wave check                   # Version check (always exit 0)
npx spec-wave sync prompts --yes      # Materialize templates
```

### Exit Codes (Fail-Closed)

| Code | Meaning | Commands |
|------|---------|----------|
| **0** | Pass or informational | `check` (always 0) |
| **1** | Usage error | Missing required flags |
| **2** | **Gate BLOCKED** (fail-closed) | `verify`, `gate-check`, `audit` |

**Do not remap exit code 2 to 0.** Treat it as a hard stop.

---

## Documentation

- **[GLOSSARY.md](GLOSSARY.md)**: Bilingual glossary of terms (task.md, Harness, hats, etc.)
- **[MIGRATION.md](MIGRATION.md)**: Migrate from `@cyning/harness` or `dsh-coding-kit`
- **[RELEASING.md](RELEASING.md)**: Release process for maintainers
- **[assets/ide/host-adapt/README.md](assets/ide/host-adapt/README.md)**: Full host matrix & CLI details

---

## Migrating from @cyning/harness

If you're using the old `@cyning/harness` package:

```bash
# 1. Replace dependency
# In package.json: @cyning/harness → spec-wave (pin 3.0.2)

# 2. Run upgrade
npx spec-wave@3.0.2 upgrade --yes

# 3. Update scripts
# Replace: npx @cyning/harness → npx spec-wave
```

See [MIGRATION.md](MIGRATION.md) for the complete checklist.

---

## Why SpecWave?

✅ **Consistency**: One adapt table, 13 tools. No drift.  
✅ **Speed**: Update once, regenerate everywhere.  
✅ **Enforcement**: Fail-closed gates prevent bypasses.  
✅ **Transparency**: Exit codes + audit trails.  
✅ **Flexibility**: Choose which tools to target (`--tools LIST`).  

**If this saves you time, a ⭐ helps others find it.**

---

## Core Concepts (Deep Dive)

> **New here?** First-hour terms are defined in [GLOSSARY.md](GLOSSARY.md) (bilingual).

### task.md — Executable Work Unit

A `task.md` file describes one unit of work:

- **Background & Goal**: What and why
- **Scope / Non-scope**: What's included, what's not
- **Failure Paths**: Known risks
- **Acceptance Criteria**: Runnable verification commands
- **Harness Metadata**: `test_strategy`, `wiki_delta`
- **Human Gate Table**: Must be 4 columns; `HG-AUDIT-R1` must be `approved` before hat 30 may change code

**Location**: `docs/tasks/active/task_<slug>.md` while in flight.  
**Archive**: `npx spec-wave task close --file FILE --yes` → moves to `docs/tasks/done/`.

Minimal skeleton:

```markdown
# Task: add login rate limiting

> **状态**: `draft`

## Harness 元信息
| 字段 | 值 |
|------|-----|
| **task_slug** | `login-rate-limit` |
| **test_strategy** | `required` |

### 人工闸
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | pending | 30 | R1 审查后人签 |

## 范围
Add rate limiting to login endpoint: max 5 attempts per 15 minutes per IP.

## 验收标准
- `pytest tests/test_rate_limit.py` passes
- Manual test: 6th attempt within 15min returns 429
```

### spec.md — Requirement Spec

A `spec.md` file is the signed-off requirement spec that a task references:

- **Background / Scope / Non-scope**
- **Acceptance Criteria**
- **Failure Paths**

**Location**: `docs/spec/<topic>/` (e.g., `docs/spec/2_2-closed-loop-start/`)  
**Gate**: `npx spec-wave verify --spec FILE` checks that a written review exists before implementation.

### Human Gates

Human gates are approval checkpoints in the `task.md` table:

```markdown
| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-AUDIT-R1 | approved | 30 | R1 审查后人签 |
```

- **`HG-AUDIT-R1`**: R1 audit gate; must be `approved` before hat 30 (implementation) may change code
- **`HG-GRAPH-MODULES`**: D4-a gate; must be `approved` for module-graph changes

`npx spec-wave verify --task FILE` reads this table as the source of truth (chat claims don't count).

### Hat System

"Hats" are process roles:

- **Hat 00**: Delegate-only (no direct implementation)
- **Hat 10**: Spec/task drafting
- **Hat 20**: Spec/task audit
- **Hat 30**: Implementation (requires `HG-AUDIT-R1=approved`)
- **Hat 40**: Self-check

Skills for hats 10/20 are in `.cursor/skills/`, `.claude/skills/`, etc. (default install).  
Skills for hats 30/40 are **not** installed by default (explicit `--with-execute-hats` required).

---

## Multi-Host Matrix (Detailed)

One declarative adapt table → native landing on multiple hosts. Verify truth stays in the CLI (`failClosed` exit 2); IDE commands only orchestrate.

**Note**: Installing the npm package does **not** materialize IDE files (no postinstall). Run `init --tools` or `host apply` explicitly.

| Host | Always-On Rules | Commands (profile `core`) | Skills |
|------|----------------|---------------------------|--------|
| **Cursor** | `.cursor/rules/*.mdc` | `.cursor/commands/kit-*.md` | `.cursor/skills/` |
| **Claude Code** | `CLAUDE.md` (marker block) | `.claude/commands/kit/<verb>.md` → `/kit:verb` | `.claude/skills/` |
| **DSH** | (empty) | `[]` (no `.dsh/commands/`) | `.dsh/skills/` (hats + orchestration) |
| **agents** | `AGENTS.md` fragment | `[]` | `.agents/skills/` |
| **Copilot** | `AGENTS.md` fragment | `[]` | `.github/skills/` |
| **Codex** | `AGENTS.md` fragment | `[]` | `.agents/skills/` |
| **Windsurf** | `AGENTS.md` fragment | `[]` | `.windsurf/skills/` |
| **Gemini CLI** | `GEMINI.md` | `[]` | `.gemini/skills/` |
| **opencode** | `AGENTS.md` fragment | `[]` | `.agents/skills/` |
| **Roo Code** | `AGENTS.md` fragment | `[]` | (no skills dir) |
| **Zed** | `AGENTS.md` fragment | `[]` | `.agents/skills/` |
| **Cline** | `AGENTS.md` fragment | `[]` | `.cline/skills/` |
| **aider** | `AGENTS.md` fragment (requires `--read`) | `[]` | (no skills dir) |

**2.2 W6 additions** (same package): Nine hosts reuse the `agents` asset face (zero new assets). Each landing follows the host's official docs.

**2.1 additions** (same package): Claude `/kit:` namespace UX, DSH orchestration skills, optional `--profile expanded` for hat thin shells.

---

## Advanced: D5 Test-Artifact Detection

When `test_strategy=required` in a task, `audit`/`verify` run the D5 check: the target repo must contain **real test artifacts**, else exit 2.

**Strong-signal probes** (presence = PASS):

- Directories: `test/`, `tests/`, `spec/`, `specs/`, `__tests__/`
- Config files: `jest.config.{js,ts}`, `vitest.config.{js,ts}`, `playwright.config.{js,ts}`, `cypress.config.js`, `pytest.ini`
- Test file names (within 3 levels): `*.(test|spec).(js|ts|mjs|cjs)`, `*_test.py`, `test_*.py`

**CI detection**: Every `*.yml|*.yaml` under `.github/workflows/` is scanned for test-step patterns: `pytest`, `vitest`, `jest`, `npm test`, etc.

**Known false positives**: `pyproject.toml`/`setup.py` alone are **not** test artifacts. For custom test commands (e.g., `make test`) not in the whitelist, add a strong-signal file (e.g., `tests/` directory).

---

## Graph & Ontology (Advanced)

SpecWave includes graph capabilities for technical dependency modeling:

```bash
npx spec-wave graph yaml compile     # Compile YAML graph → Mermaid
npx spec-wave graph yaml check       # Validate graph structure
npx spec-wave graph yaml export      # Export to graph.json
npx spec-wave graph ontology check   # Validate ontology
```

**Ontology boundary** (3.0 ONTO-OPEN ruling):
- Graph surface is **open**: consumers can author their own graphs.
- Bundled ontology (`assets/ontology.yaml`) is **not open**: no consumer-defined classes/relations.
- Validator is open ≠ ontology content is open.

This repo dogfoods `graph yaml compile|check|export` against `docs/_tech_graph/` (not shipped in npm package).

---

## Releasing (Maintainers)

**Current package**: `spec-wave@3.0.2` — published (registry `latest=3.0.2`, tag `v3.0.2` ↔ tip `3d71b90`, verified 2026-09-24).

Release process: see [RELEASING.md](RELEASING.md) — hard pre-publish checklist (commit-before-publish, four green gates, version pins, **human-only `npm publish`**).

---

## GitHub Topics

This repository's topics: `dsh-plugin`, `deepseek-harness`, `dsh-plugins`, `dsh`.

The npm keywords in `package.json` include `dsh-plugin` and `deepseek-harness`.

---

## License

MIT

---

## Links

- **npm**: [npmjs.com/package/spec-wave](https://www.npmjs.com/package/spec-wave)
- **Repository**: [github.com/Cyning12/SpecWave](https://github.com/Cyning12/SpecWave)
- **Issues**: [github.com/Cyning12/SpecWave/issues](https://github.com/Cyning12/SpecWave/issues)

---

<sub>Formerly SpecGate / `dsh-coding-kit` — rename history: [MIGRATION.md](MIGRATION.md).</sub>
