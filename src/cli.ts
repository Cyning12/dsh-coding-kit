import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
} from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cmdGraph } from './cli-graph.ts'
import { cmdDiscipline, cmdLifecycle } from './cli-lifecycle.ts'
import { cmdSkills } from './cli-skills.ts'
import {
  CliError,
  evaluateMayStart30,
  extractSection,
  extractTaskSlug,
  fail,
  findGate,
  normalizeSlug,
  packageRoot,
  parseHarnessMeta,
  parseHumanGates,
  resolveTarget,
  resolveTaskPath,
  STATUS_RE,
  takeOption,
} from './cli-shared.ts'
import { cmdStatus, cmdTimeline } from './cli-status.ts'
import { cmdSync } from './cli-sync.ts'
import { cmdTaskCheck, cmdTaskLintDone, cmdTaskLintWikiDelta } from './cli-task-extra.ts'
import { cmdWiki } from './cli-wiki.ts'

type Manifest = {
  version: string
  preset: string
  ide: string[]
  from_version: string | null
  upgraded_at: string
}

type LintIssue = { rule: string; message: string; line?: number }

const CHECKBOX_RE = /^\s*- \[[ xX]\]/m
const UNCHECKED_RE = /^\s*- \[ \]/
const PLACEHOLDER_RE = /^（[^）]*(回填|待填)[^）]*）$/
const ABS_PATH_RE = /(\/(?:Users|home|root)\/[^\s/`\\]|[A-Za-z]:\\Users\\[^\s`\\])/
const KNOWN_STATUS_TOKENS = new Set([
  'draft',
  'pending',
  'in_progress',
  'active',
  'deferred',
  'done',
  'completed',
])
const CLOSE_STATUSES = new Set(['done', 'completed'])

function notDelivered(cmd: string): never {
  fail(`${cmd} 本包未交付（不支持）。`)
}

async function readPkgVersion(): Promise<string> {
  if (process.env.HARNESS_VERSION) return process.env.HARNESS_VERSION
  const raw = await readFile(path.join(packageRoot(), 'package.json'), 'utf8')
  const pkg = JSON.parse(raw) as { version?: string }
  return pkg.version ?? 'unknown'
}

function usage(version: string): void {
  console.log(`dsh-coding-kit CLI (v${version})

用法:
  npx dsh-coding-kit --version | -V
  npx dsh-coding-kit --help | -h
  npx dsh-coding-kit init [--preset NAME] [--target PATH] [--yes]
  npx dsh-coding-kit upgrade [--target PATH] [--yes]
  npx dsh-coding-kit check [--target PATH]
  npx dsh-coding-kit verify [--target PATH] [--task FILE] [--json]
  npx dsh-coding-kit gate-check [--target PATH] [--task FILE] [--json]
  npx dsh-coding-kit audit [--target PATH] [--task FILE]
  npx dsh-coding-kit task lint --file PATH
  npx dsh-coding-kit task close --file PATH [--yes]
  npx dsh-coding-kit status [--target PATH] [--task FILE] [--json] [--check]
  npx dsh-coding-kit timeline --task FILE [--target PATH] [--json] [--limit N] [--ingest]
  npx dsh-coding-kit lifecycle show [--json]
  npx dsh-coding-kit lifecycle dry-run --transition ID --from STATE [--task PATH]
  npx dsh-coding-kit discipline show [--json]
  npx dsh-coding-kit graph yaml compile|check|export …
  npx dsh-coding-kit graph ingest|snapshot|axioms …
  npx dsh-coding-kit sync index [--target PATH]
  npx dsh-coding-kit skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
  npx dsh-coding-kit skills build [--with-execute-hats]
  npx dsh-coding-kit skills check
  npx dsh-coding-kit wiki export --json [--target PATH]
  npx dsh-coding-kit task lint-done [--target PATH]
  npx dsh-coding-kit task lint-wiki-delta [--target PATH]
  npx dsh-coding-kit task check --file PATH
`)
}

function manifestPath(target: string): string {
  return path.join(target, '.cyning-harness', 'manifest.json')
}

async function readManifest(target: string): Promise<Manifest | null> {
  const file = manifestPath(target)
  if (!existsSync(file)) return null
  return JSON.parse(await readFile(file, 'utf8')) as Manifest
}

function nowUtc(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function isPinnedVersion(current: string, pkgVersion: string): boolean {
  return current === pkgVersion
}

async function cmdInit(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit init [--preset NAME] [--target PATH] [--yes]')
    return
  }
  const yes = args.includes('--yes')
  let rest = args.filter((a) => a !== '--yes')
  const { value: preset, rest: r1 } = takeOption(rest, '--preset')
  rest = r1
  const { value: targetArg, rest: r2 } = takeOption(rest, '--target')
  rest = r2
  if (rest.length > 0) fail(`init 未知参数: ${rest.join(' ')}`)

  const target = resolveTarget(process.cwd(), targetArg)
  const chosenPreset = preset || 'harness-only'
  const existing = await readManifest(target)
  if (existing) {
    console.log(`manifest 已存在，跳过写入: ${manifestPath(target)}`)
    if (!yes) console.log('init 完成。')
    return
  }

  const mf: Manifest = {
    version: pkgVersion,
    preset: chosenPreset,
    ide: [],
    from_version: null,
    upgraded_at: nowUtc(),
  }
  const dest = manifestPath(target)
  mkdirSync(path.dirname(dest), { recursive: true })
  await writeFile(dest, `${JSON.stringify(mf, null, 2)}\n`, 'utf8')
  console.log(`已写入 manifest: ${dest}`)
  console.log(`manifest: ${dest}`)
  if (!yes) console.log('init 完成。')
}

async function cmdUpgrade(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit upgrade [--target PATH] [--yes]')
    return
  }
  const yes = args.includes('--yes')
  let rest = args.filter((a) => a !== '--yes' && a !== '--force')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`upgrade 未知参数: ${rest.join(' ')}`)

  const target = resolveTarget(process.cwd(), targetArg)
  const current = await readManifest(target)
  if (!current) {
    fail(`未接入（无 .cyning-harness/manifest.json）。建议: npx dsh-coding-kit init --preset harness-only --yes`)
  }
  const next: Manifest = {
    version: pkgVersion,
    preset: current.preset || 'harness-only',
    ide: Array.isArray(current.ide) ? current.ide : [],
    from_version: current.version === pkgVersion ? current.from_version : current.version,
    upgraded_at: nowUtc(),
  }
  await writeFile(manifestPath(target), `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`upgrade: ${current.version} → ${pkgVersion}`)
  console.log(`manifest: ${manifestPath(target)}`)
  if (!yes) console.log('upgrade 完成（S2 路径未写入）。')
}

async function cmdCheck(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit check [--target PATH]')
    return
  }
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`check 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const manifest = await readManifest(target)
  console.log(`目标: ${target}`)
  console.log(`包版本: ${pkgVersion}`)
  if (!manifest) {
    console.log('状态: 未接入（无 .cyning-harness/manifest.json）')
    console.log('建议: npx dsh-coding-kit init --preset harness-only --yes')
    return
  }
  console.log(`manifest.version: ${manifest.version}`)
  console.log(`manifest.preset: ${manifest.preset}`)
  if (isPinnedVersion(manifest.version, pkgVersion)) {
    console.log('状态: 已是最新')
  } else {
    console.log('状态: 可升级')
    console.log('建议: npx dsh-coding-kit upgrade --yes')
  }
}

function formatGateCheck(taskFile: string, content: string): { text: string; blocked: boolean } {
  const gates = parseHumanGates(content)
  const draft = findGate(gates, 'HG-TASK-DRAFT')
  const audit = findGate(gates, 'HG-AUDIT-R1')
  const graph = findGate(gates, 'HG-GRAPH-MODULES')
  const lines: string[] = []
  lines.push(`task: ${path.basename(taskFile)}`)
  lines.push('| gate | status | blocks_30 | 30 影响 |')
  lines.push('|------|--------|-----------|--------|')
  const draftStatus = draft?.status ?? '?'
  const draftBlocks = draft?.blocksHats ?? '?'
  const draftImpact =
    draftStatus === 'approved' ? '—' : draftBlocks.includes('30') ? '❌ 拒 30' : '—'
  lines.push(`| HG-TASK-DRAFT | ${draftStatus} | ${draftBlocks} | ${draftImpact} |`)
  const auditStatus = audit?.status ?? '?'
  lines.push(
    `| HG-AUDIT-R1 | ${auditStatus} | 30 | ${auditStatus === 'approved' ? '✅ 可 30' : '❌ 拒 30'} |`,
  )
  if (graph && graph.status !== '—' && graph.status !== '?') {
    lines.push(
      `| HG-GRAPH-MODULES | ${graph.status} | — | ${graph.status === 'approved' ? '✅' : '❌ 若 pending 拒 30'} |`,
    )
  }
  lines.push('')
  const may = evaluateMayStart30(gates)
  let blocked = false
  if (auditStatus !== 'approved') {
    blocked = true
    lines.push('→ 30 不可开工: HG-AUDIT-R1 非 approved（须维护者签 task 表）')
  }
  if (draft && draft.status !== 'approved' && draft.blocksHats.includes('30')) {
    blocked = true
    lines.push('→ 30 不可开工: HG-TASK-DRAFT pending 且 blocks 30')
  }
  if (graph?.status === 'pending') {
    blocked = true
    lines.push('→ 30 不可开工: HG-GRAPH-MODULES pending')
  }
  if (!blocked && !may.ok) {
    blocked = true
    lines.push(`→ 30 不可开工: ${may.reason}`)
  }
  lines.push('')
  return { text: lines.join('\n'), blocked }
}

function walkFiles(dir: string, depth: number, acc: string[]): void {
  if (depth < 0 || !existsSync(dir)) return
  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return
  }
  for (const name of names) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = path.join(dir, name)
    acc.push(full)
    try {
      if (statSync(full).isDirectory()) walkFiles(full, depth - 1, acc)
    } catch {
      // 忽略瞬时文件
    }
  }
}

function hasTestArtifacts(target: string): boolean {
  const probes = [
    'test',
    'tests',
    'spec',
    'specs',
    '__tests__',
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.js',
    'vitest.config.ts',
    'playwright.config.js',
    'playwright.config.ts',
    'cypress.config.js',
    'pytest.ini',
    'pyproject.toml',
    'setup.py',
  ]
  for (const p of probes) {
    if (existsSync(path.join(target, p))) return true
  }
  const found: string[] = []
  walkFiles(target, 3, found)
  const testName = /\.(test|spec)\.(js|ts|mjs|cjs)$|_test\.py$|^test_.*\.py$/
  if (found.some((f) => testName.test(path.basename(f)))) return true
  const ciDir = path.join(target, '.github', 'workflows')
  if (existsSync(ciDir)) {
    try {
      if (readdirSync(ciDir).some((f) => f.endsWith('.yml') || f.endsWith('.yaml'))) return true
    } catch {
      return false
    }
  }
  return false
}

function runTestCheck(target: string, taskFile: string | undefined): { ok: boolean; reason: string } {
  if (!taskFile) return { ok: true, reason: '未指定 --task，跳过 D5' }
  const abs = resolveTaskPath(target, taskFile)
  if (!existsSync(abs)) return { ok: true, reason: 'task 文件不存在，跳过 D5' }
  const content = readFileSync(abs, 'utf8')
  const meta = parseHarnessMeta(content)
  const strategy = (meta.test_strategy || '').trim()
  if (strategy !== 'required') {
    return { ok: true, reason: `test_strategy=${strategy || 'unset'}，无需 D5 强检查` }
  }
  if (!hasTestArtifacts(target)) {
    return {
      ok: false,
      reason: 'D5: test_strategy=required 但目标仓未声明测试路径或 CI 引用',
    }
  }
  return { ok: true, reason: 'test_strategy=required 且检测到测试/CI 制品' }
}

async function cmdGateCheck(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit gate-check [--target PATH] [--task FILE] [--json]')
    return
  }
  const json = args.includes('--json')
  let rest = args.filter((a) => a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: taskFile, rest: r2 } = takeOption(rest, '--task')
  rest = r2
  if (rest.length > 0) fail(`gate-check 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const mf = await readManifest(target)
  if (!json) {
    console.log('=== Harness gate-check ===')
    console.log(`目标: ${target}`)
    if (mf) {
      console.log(`manifest.version: ${mf.version}`)
      console.log(`manifest.preset: ${mf.preset}`)
    } else {
      console.log(`manifest: (未接入 · 无 ${manifestPath(target)})`)
    }
    console.log('')
  }
  if (!taskFile) fail('gate-check 须指定 --task FILE（1.1.0 P0 子集）')
  const abs = resolveTaskPath(target, taskFile)
  if (!existsSync(abs)) fail(`错误: 未找到 --task 文件 ${abs}`)
  const formatted = formatGateCheck(abs, await readFile(abs, 'utf8'))
  if (json) {
    console.log(
      JSON.stringify(
        {
          command: 'gate-check',
          target,
          task: taskFile,
          blocked: formatted.blocked,
          verdict: formatted.blocked ? 'BLOCKED' : 'PASS',
        },
        null,
        2,
      ),
    )
  } else {
    process.stdout.write(formatted.text)
  }
  if (formatted.blocked) fail('', 2)
  if (!json) {
    console.log('闸检查: 未发现阻塞（仍须 Agent 首输出 GATE_VERIFY · 不得采信 invoke 字面 approved）')
  }
}

async function cmdAudit(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit audit [--target PATH] [--task FILE]')
    return
  }
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: taskFile, rest: r2 } = takeOption(rest, '--task')
  rest = r2
  if (rest.length > 0) fail(`audit 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  console.log(`目标: ${target}`)
  if (taskFile) console.log(`task: ${taskFile}`)

  let gateOk = true
  let gateText = ''
  if (taskFile) {
    const abs = resolveTaskPath(target, taskFile)
    if (!existsSync(abs)) fail(`错误: 未找到 --task 文件 ${abs}`)
    const formatted = formatGateCheck(abs, await readFile(abs, 'utf8'))
    gateText = formatted.text
    gateOk = !formatted.blocked
    process.stdout.write(gateText)
  }
  const test = runTestCheck(target, taskFile)
  console.log(`audit: ${gateOk && test.ok ? 'PASS' : 'FAIL'}`)
  console.log(`  gate-check: ${gateOk ? 'PASS' : 'FAIL'}`)
  console.log(`  test-check: ${test.ok ? 'PASS' : 'FAIL'}`)
  if (test.reason) console.log(`    ${test.reason}`)
  if (!gateOk || !test.ok) fail('ICVO audit 未通过', 2)
}

async function cmdVerify(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit verify [--target PATH] [--task FILE] [--json]')
    return
  }
  const json = args.includes('--json')
  let rest = args.filter((a) => a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: taskFile, rest: r2 } = takeOption(rest, '--task')
  rest = r2
  const { value: specFile, rest: r3 } = takeOption(rest, '--spec')
  rest = r3
  if (specFile) notDelivered('verify --spec')
  if (rest.length > 0) fail(`verify 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  if (!taskFile) fail('verify 须指定 --task FILE（1.1.0 P0 子集）')
  const abs = resolveTaskPath(target, taskFile)
  const label = path.basename(abs)
  const emitJson = (blocked: boolean): void => {
    console.log(
      JSON.stringify(
        {
          command: 'verify',
          target,
          task: taskFile,
          blocked,
          verdict: blocked ? 'BLOCKED' : 'PASS',
        },
        null,
        2,
      ),
    )
  }
  if (!existsSync(abs)) {
    if (json) emitJson(true)
    else console.log(`VERIFY: BLOCKED · task 文件不存在 · ${label}`)
    fail('', 2)
  }
  const content = await readFile(abs, 'utf8')
  const formatted = formatGateCheck(abs, content)
  if (!json) process.stdout.write(formatted.text)
  if (formatted.blocked) {
    const gates = parseHumanGates(content)
    const audit = findGate(gates, 'HG-AUDIT-R1')
    const reason =
      audit?.status !== 'approved' ? 'HG-AUDIT-R1 pending' : formatted.text.includes('HG-TASK-DRAFT')
        ? 'HG-TASK-DRAFT pending'
        : 'gate-check blocked'
    if (json) emitJson(true)
    else console.log(`VERIFY: BLOCKED · ${reason} · ${label}`)
    fail('', 2)
  }
  const test = runTestCheck(target, taskFile)
  if (!test.ok) {
    if (json) emitJson(true)
    else console.log(`VERIFY: BLOCKED · ${test.reason} · ${label}`)
    fail('', 2)
  }
  if (json) emitJson(false)
  else console.log(`VERIFY: PASS · ${label}`)
}

function lintTaskFile(filePath: string, cwd: string): {
  ok: boolean
  errors: LintIssue[]
  warnings: LintIssue[]
  file: string
  slug: string
} {
  const abs = path.resolve(cwd, filePath)
  if (!existsSync(abs)) fail(`task 文件不存在: ${filePath}`)
  const content = readFileSync(abs, 'utf8')
  const lines = content.split('\n')
  const errors: LintIssue[] = []
  const warnings: LintIssue[] = []
  const meta = parseHarnessMeta(content)
  if (!content.includes('## Harness 元信息')) {
    errors.push({ rule: 'E1', message: '缺 ## Harness 元信息 节' })
  } else if (!meta.task_slug) {
    errors.push({ rule: 'E1', message: 'Harness 元信息表缺 task_slug' })
  }
  const statusIdx = lines.findIndex((l) => STATUS_RE.test(l))
  if (statusIdx === -1) {
    errors.push({ rule: 'E2', message: '缺 > **状态** 行' })
  } else {
    const token = lines[statusIdx].match(STATUS_RE)?.[1]?.toLowerCase()
    if (token && !KNOWN_STATUS_TOKENS.has(token)) {
      warnings.push({ rule: 'W1', message: `状态 token 不在已知词表: ${token}`, line: statusIdx + 1 })
    }
  }
  const acceptance = extractSection(content, '## 验收标准', '\n##')
  if (!acceptance) {
    errors.push({ rule: 'E3', message: '缺 ## 验收标准 节' })
  } else if (!CHECKBOX_RE.test(acceptance)) {
    errors.push({ rule: 'E3', message: '## 验收标准 节内无任何勾选项（- [ ] / - [x]）' })
  }
  if (!lines.some((l) => /^#{2,4}\s.*(失败路径|failure_paths)/i.test(l))) {
    errors.push({ rule: 'E4', message: '缺失败路径节（## 失败路径 或 failure_paths）' })
  }
  const selfCheck = extractSection(content, '### 自检结论', '\n##')
  if (!selfCheck) {
    errors.push({ rule: 'E5', message: '缺 ### 自检结论 节' })
  } else {
    const substantive = selfCheck
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !PLACEHOLDER_RE.test(l))
    if (substantive.length === 0) {
      warnings.push({ rule: 'W3', message: '自检结论为占位符（draft 期合法 · close 前须回填）' })
    }
  }
  lines.forEach((l, i) => {
    if (ABS_PATH_RE.test(l)) {
      errors.push({ rule: 'E6', message: `绝对本机路径: ${l.trim().slice(0, 100)}`, line: i + 1 })
    }
  })
  if (meta.task_slug) {
    const fileSlug = extractTaskSlug(abs)
    if (normalizeSlug(meta.task_slug) !== normalizeSlug(fileSlug)) {
      errors.push({
        rule: 'E7',
        message: `slug 不一致: 文件名 ${fileSlug} ≠ 元信息 task_slug ${meta.task_slug}`,
      })
    }
  }
  if (!content.includes('### 人工闸')) {
    warnings.push({ rule: 'W2', message: '缺 ### 人工闸 节（轻量 task 可忽略本提醒）' })
  }
  if (!/^###\s+R0(\b|[^\d]|$)/m.test(content) && !/^#{2,3}\s+.*思考轮/m.test(content)) {
    warnings.push({
      rule: 'W4',
      message: '无思考轮节（SPEC 承载 / bugfix 轨合法豁免 · 有节则查 R0–R5 与控制表）',
    })
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    file: abs,
    slug: meta.task_slug ?? extractTaskSlug(abs),
  }
}

async function cmdTaskLint(args: string[]): Promise<void> {
  const json = args.includes('--json')
  let rest = args.filter((a) => a !== '--json')
  const { value: fileArg, rest: r1 } = takeOption(rest, '--file')
  rest = r1
  if (rest.length > 0) fail(`task lint 未知参数: ${rest.join(' ')}`)
  if (!fileArg) fail('task lint 须指定 --file PATH')
  const result = lintTaskFile(fileArg, process.cwd())
  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    for (const e of result.errors) {
      console.log(`  - [${e.rule}${e.line ? `:L${e.line}` : ''}] ${e.message}`)
    }
    for (const w of result.warnings) {
      console.log(`warn: [${w.rule}${w.line ? `:L${w.line}` : ''}] ${w.message}`)
    }
    console.log(`LINT: ${result.ok ? 'PASS' : 'FAIL'} · ${path.basename(result.file)}`)
  }
  if (!result.ok) fail('', 2)
}

async function cmdTaskClose(args: string[]): Promise<void> {
  const yes = args.includes('--yes')
  const allowUnchecked = args.includes('--allow-unchecked')
  let rest = args.filter((a) => a !== '--yes' && a !== '--allow-unchecked')
  const { value: fileArg, rest: r1 } = takeOption(rest, '--file')
  rest = r1
  const { value: targetArg, rest: r2 } = takeOption(rest, '--target')
  rest = r2
  if (rest.length > 0) fail(`task close 未知参数: ${rest.join(' ')}`)
  if (!fileArg) fail('task close 须指定 --file PATH')
  const abs = path.resolve(process.cwd(), fileArg)
  if (!existsSync(abs)) fail(`task 文件不存在: ${fileArg}`, 2)
  const content = await readFile(abs, 'utf8')
  const meta = parseHarnessMeta(content)
  const fileSlug = extractTaskSlug(abs)
  const slug = meta.task_slug ?? fileSlug
  const blockers: string[] = []
  if (!meta.task_slug) blockers.push('Harness 元信息表缺 task_slug')
  else if (normalizeSlug(meta.task_slug) !== normalizeSlug(fileSlug)) {
    blockers.push(`slug 不一致: 文件名 ${fileSlug} ≠ 元信息 task_slug ${meta.task_slug}`)
  }
  const selfCheck = extractSection(content, '### 自检结论', '\n##')
  if (!selfCheck) blockers.push('缺 ### 自检结论 节')
  else {
    const substantive = selfCheck
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !PLACEHOLDER_RE.test(l))
    if (substantive.length === 0) blockers.push('自检结论未回填（空或纯占位符）')
  }
  const acceptance = extractSection(content, '## 验收标准', '\n##')
  if (!acceptance) blockers.push('缺 ## 验收标准 节')
  else {
    const unchecked = acceptance.split('\n').filter((l) => UNCHECKED_RE.test(l))
    if (unchecked.length > 0 && !allowUnchecked) {
      blockers.push(`验收标准 ${unchecked.length} 项未勾选（或 --allow-unchecked 显式豁免）`)
    }
  }
  const statusLine = content.split('\n').find((l) => STATUS_RE.test(l))
  const status = statusLine ? statusLine.match(STATUS_RE)?.[1]?.toLowerCase() : null
  if (!status) blockers.push('未找到 > **状态** 行')
  else if (!CLOSE_STATUSES.has(status)) {
    blockers.push(`状态非 done/completed（当前: ${status}）`)
  }
  const activeDir = path.dirname(abs)
  const inActive = path.basename(activeDir) === 'active'
  let dest: string | null = null
  if (targetArg && path.basename(targetArg).endsWith('.md')) {
    dest = path.resolve(process.cwd(), targetArg)
  } else if (!inActive) {
    blockers.push('源文件不在 */active/ 且未指定 --target（拒绝对 done 文件二次 close）')
  } else {
    dest = path.join(path.dirname(activeDir), 'done', path.basename(abs))
  }
  if (dest && existsSync(dest)) blockers.push(`目标已存在（不覆盖）: ${dest}`)
  if (blockers.length > 0) {
    for (const b of blockers) console.log(`  - ${b}`)
    console.log(`CLOSE: BLOCKED · ${slug}`)
    fail('', 2)
  }
  if (!yes) {
    console.log('mode: dry-run（未执行 mv · 加 --yes 执行）')
    console.log(`dest: ${dest}`)
    console.log(`CLOSE: PASS · ${slug}`)
    return
  }
  if (!dest) fail('无法解析归档目标', 2)
  mkdirSync(path.dirname(dest), { recursive: true })
  renameSync(abs, dest)
  console.log(`moved: ${abs} → ${dest}`)
  console.log(`CLOSE: PASS · ${slug}`)
}

const TASK_USAGE = 'task lint --file PATH · task close --file PATH [--yes] · task lint-done · task lint-wiki-delta · task check --file PATH'

async function cmdTask(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (sub === '--help' || sub === '-h') {
    console.log(`用法: ${TASK_USAGE}`)
    return
  }
  if (!sub) fail(`task 子命令未知: (空)\n用法: ${TASK_USAGE}`)
  if (sub === 'lint') {
    await cmdTaskLint(rest)
    return
  }
  if (sub === 'close') {
    await cmdTaskClose(rest)
    return
  }
  if (sub === 'lint-done') {
    await cmdTaskLintDone(rest)
    return
  }
  if (sub === 'lint-wiki-delta') {
    await cmdTaskLintWikiDelta(rest)
    return
  }
  if (sub === 'check') {
    await cmdTaskCheck(rest)
    return
  }
  fail(`task 子命令未知: ${sub}\n用法: ${TASK_USAGE}`)
}

export async function runCli(argv: string[]): Promise<void> {
  const pkgVersion = await readPkgVersion()
  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    usage(pkgVersion)
    return
  }
  if (argv.includes('--version') || argv.includes('-V')) {
    console.log(pkgVersion)
    return
  }
  const [cmd, ...rest] = argv
  if (cmd === 'init') {
    await cmdInit(rest, pkgVersion)
    return
  }
  if (cmd === 'upgrade') {
    await cmdUpgrade(rest, pkgVersion)
    return
  }
  if (cmd === 'check') {
    await cmdCheck(rest, pkgVersion)
    return
  }
  if (cmd === 'audit') {
    await cmdAudit(rest)
    return
  }
  if (cmd === 'gate-check') {
    await cmdGateCheck(rest)
    return
  }
  if (cmd === 'verify') {
    await cmdVerify(rest)
    return
  }
  if (cmd === 'task') {
    await cmdTask(rest)
    return
  }
  if (cmd === 'status') {
    await cmdStatus(rest)
    return
  }
  if (cmd === 'timeline') {
    await cmdTimeline(rest)
    return
  }
  if (cmd === 'lifecycle') {
    await cmdLifecycle(rest)
    return
  }
  if (cmd === 'discipline') {
    await cmdDiscipline(rest)
    return
  }
  if (cmd === 'skills') {
    await cmdSkills(rest)
    return
  }
  if (cmd === 'sync') {
    await cmdSync(rest)
    return
  }
  if (cmd === 'graph') {
    await cmdGraph(rest)
    return
  }
  if (cmd === 'wiki') {
    await cmdWiki(rest)
    return
  }
  fail(`未知命令: ${cmd}\n`)
}

function isMain(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    const resolved = path.resolve(entry)
    const self = fileURLToPath(import.meta.url)
    if (resolved === self) return true
    return path.basename(resolved) === path.basename(self)
  } catch {
    return false
  }
}

if (isMain()) {
  runCli(process.argv.slice(2)).catch((err: unknown) => {
    const e = err as { message?: string; exitCode?: number }
    if (e.message) console.error(e.message)
    process.exit(typeof e.exitCode === 'number' ? e.exitCode : 1)
  })
}
