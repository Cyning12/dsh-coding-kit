import { existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs'
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
import {
  checkPre30InvokeHats,
  findReview,
  lintTaskFile,
  PLACEHOLDER_RE,
  runTestCheck,
} from './cli-checks.ts'
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

const UNCHECKED_RE = /^\s*- \[ \]/
const CLOSE_STATUSES = new Set(['done', 'completed'])
// init --preset 合法词表（DEF-013 D1：当前唯一合法值；新增 preset 须先扩展此常量）
const VALID_PRESETS = ['harness-only'] as const

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
  npx dsh-coding-kit init [--preset NAME] [--target PATH] [--yes]  （NAME 词表: harness-only）
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
  npx dsh-coding-kit lifecycle dry-run --transition ID --from STATE [--task PATH] [--target PATH]
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

// 数值三元组比较（x.y.z）：-1 a<b · 0 相等 · 1 a>b。
// 限制：不支持 pre-release 形态（如 1.2.2-beta.1）；遇非纯数字段按「不等且方向未知」归 -1（维持旧版可升级提示），版本历史均为纯 x.y.z，未来引入 pre-release 再升级比较器。
function compareVersion(a: string, b: string): number {
  if (a === b) return 0
  const pa = a.split('.').map((p) => Number.parseInt(p, 10))
  const pb = b.split('.').map((p) => Number.parseInt(p, 10))
  for (let i = 0; i < 3; i++) {
    const x = pa[i]
    const y = pb[i]
    if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) return -1
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

async function cmdInit(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit init [--preset NAME] [--target PATH] [--yes]  （NAME 词表: harness-only）')
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
  if (!(VALID_PRESETS as readonly string[]).includes(chosenPreset)) {
    fail(`init --preset 取值非法: ${chosenPreset}（合法词表: ${VALID_PRESETS.join(' / ')}）`)
  }
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
  let rest = args.filter((a) => a !== '--yes')
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
  const cmp = compareVersion(manifest.version, pkgVersion)
  if (cmp === 0) {
    console.log('状态: 已是最新')
  } else if (cmp < 0) {
    console.log('状态: 可升级')
    console.log('建议: npx dsh-coding-kit upgrade --yes')
  } else {
    console.log('状态: manifest 版本高于包版本（可能为降级安装）')
    console.log('建议: 核对接入来源（manifest 由更高版本 CLI 写入）')
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
    console.log(
      '用法: npx dsh-coding-kit verify [--target PATH] [--task FILE] [--json] [--allow-no-review] [--allow-invoke-gap]',
    )
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
  // DEF-003 阶段二 T4/T5：--allow-no-review / --allow-invoke-gap 真生效（硬闸豁免 · 留痕）；
  // 其余 --allow-* 仍走 DEF-011 fail-fast（--allow-lint-fail 等归 DEF-011 交接清单）
  const allowNoReview = rest.includes('--allow-no-review')
  rest = rest.filter((a) => a !== '--allow-no-review')
  const allowInvokeGap = rest.includes('--allow-invoke-gap')
  rest = rest.filter((a) => a !== '--allow-invoke-gap')
  if (rest.length > 0) fail(`verify 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  if (!taskFile) fail('verify 须指定 --task FILE（1.1.0 P0 子集）')
  const abs = resolveTaskPath(target, taskFile)
  const label = path.basename(abs)
  const emitJson = (blocked: boolean, waived?: string[]): void => {
    console.log(
      JSON.stringify(
        {
          command: 'verify',
          target,
          task: taskFile,
          blocked,
          verdict: blocked ? 'BLOCKED' : 'PASS',
          ...(waived && waived.length > 0 ? { waived } : {}),
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
  // DEF-003 阶段二 T4：R<n> 审查文存在性硬闸（findReview 与 status / dry-run 同口径 · cli-checks 单一实现源）
  const reviewFound = findReview(target, abs)
  if (!reviewFound && !allowNoReview) {
    if (json) emitJson(true)
    else console.log(`VERIFY: BLOCKED · missing R<n> review · ${label}`)
    fail('', 2)
  }
  const waived: string[] = []
  if (!reviewFound && allowNoReview) {
    waived.push('missing R<n> review（--allow-no-review 豁免）')
    if (!json) {
      console.log('verify: 留痕 · 缺 R<n> 审查文 · --allow-no-review 豁免生效（仍须补审并由维护者签 HG-AUDIT-R1）')
    }
  }
  // DEF-003 阶段二 T5：pre-30 invoke hats 硬闸（required ∩ {10,20,00} · cli-checks 单一实现源，
  // 与 task close 帽集合检查同口径；缺 40 不挡 30 · minimal 无 preRequired 不挡）
  const invoke = checkPre30InvokeHats(target, abs)
  if (!invoke.ok && !allowInvokeGap) {
    if (json) emitJson(true)
    else console.log(`VERIFY: BLOCKED · missing pre-30 invoke hats: ${invoke.missing.join(',')} · ${label}`)
    fail('', 2)
  }
  if (!invoke.ok && allowInvokeGap) {
    waived.push(`missing pre-30 invoke hats: ${invoke.missing.join(',')}（--allow-invoke-gap 豁免）`)
    if (!json) {
      console.log(
        `verify: 留痕 · 缺 pre-30 invoke hats: ${invoke.missing.join(',')}（${invoke.source}）· --allow-invoke-gap 豁免生效（仍须补落 invoke 快照）`,
      )
    }
  }
  if (json) emitJson(false, waived)
  else {
    if (test.warn) console.log(test.reason)
    console.log(`VERIFY: PASS · ${label}`)
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
