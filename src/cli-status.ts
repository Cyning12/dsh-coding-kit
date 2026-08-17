import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  evaluateMayStart30,
  extractHatsFromInvokeFilename,
  fail,
  normalizeSlug,
  parseHarnessMeta,
  parseHumanGates,
  resolveTarget,
  resolveTaskPath,
  STATUS_RE,
  takeOption,
  toRel,
} from './cli-shared.ts'
import { summarizeTaskHgm } from './cli-graph-hgm.ts'

const OBS_STATUS_SCHEMA = 'obs_status.v1'

function extractTaskStatus(content: string): string | null {
  const m = content.match(STATUS_RE)
  return m ? m[1].toLowerCase() : null
}

function listActiveTasks(target: string): string[] {
  const dirs = [path.join(target, 'docs/tasks/active'), path.join(target, 'docs/harness/tasks/active')]
  const out: string[] = []
  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.md') || !name.startsWith('task_')) continue
      out.push(toRel(target, path.join(dir, name)))
    }
  }
  return out.sort()
}

function findLastInvoke(target: string, slug: string): { path: string | null; hat_id: string | null } {
  const empty = { path: null, hat_id: null }
  if (!slug) return empty
  const candidates = [
    path.join(target, 'docs/harness/invokes/by-task', slug),
    path.join(target, 'docs/harness/invokes/by-task', normalizeSlug(slug)),
    path.join(target, 'invokes/by-task', slug),
  ]
  if (slug.includes('-')) {
    candidates.push(path.join(target, 'docs/harness/invokes/by-task', slug.replace(/-/g, '_')))
  }
  let best: { mtimeMs: number; path: string; hat_id: string | null } | null = null
  for (const dir of candidates) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.md')) continue
      const abs = path.join(dir, name)
      const st = statSync(abs)
      if (!best || st.mtimeMs > best.mtimeMs) {
        const hats = extractHatsFromInvokeFilename(name)
        best = {
          mtimeMs: st.mtimeMs,
          path: toRel(target, abs),
          hat_id: hats[0] || null,
        }
      }
    }
  }
  if (!best) return empty
  return { path: best.path, hat_id: best.hat_id }
}

function findReview(target: string, taskFile: string): boolean {
  const dirs = [path.join(target, 'docs/harness/reviews'), path.join(target, 'reviews')]
  const stripVer = (s: string) => s.replace(/_v\d+$/, '')
  const base = stripVer(path.basename(taskFile, '.md'))
  const RE = /^(task_.+?)_audit_R\d+_.*\.md$/i
  for (const reviewsDir of dirs) {
    if (!existsSync(reviewsDir)) continue
    for (const name of readdirSync(reviewsDir)) {
      const m = name.match(RE)
      if (!m) continue
      if (stripVer(m[1]) === base) return true
    }
  }
  return false
}

function buildTaskStatus(target: string, taskFile: string, options: { check?: boolean } = {}) {
  const absTask = resolveTaskPath(target, taskFile)
  if (!existsSync(absTask)) fail(`task 文件不存在: ${taskFile}`)
  const content = readFileSync(absTask, 'utf8')
  const meta = parseHarnessMeta(content)
  const gates = parseHumanGates(content)
  const gateEval = evaluateMayStart30(gates)
  const slug = meta.task_slug || path.basename(absTask, '.md')
  const blockers: string[] = []
  for (const g of gates) {
    if (g.status !== 'approved' && String(g.blocksHats || '').includes('30')) {
      blockers.push(`${g.id}=${g.status}`)
    }
  }
  if (blockers.length === 0 && !gateEval.ok && gateEval.reason) blockers.push(gateEval.reason)
  const reviewFound = findReview(target, absTask)
  const lastInvoke = findLastInvoke(target, slug)
  const hgm = summarizeTaskHgm(target, slug)
  const payload = {
    schema_version: OBS_STATUS_SCHEMA,
    task_slug: slug,
    task_path: toRel(target, absTask),
    status: extractTaskStatus(content) || 'unknown',
    gates: gates.map((g) => ({ id: g.id, status: g.status, blocks_hats: g.blocksHats })),
    may_start_30: gateEval.ok,
    blockers,
    last_invoke: lastInvoke,
    reviews: { R1: reviewFound, CLOSE: false },
    verify_preview: {
      ok: gateEval.ok,
      reason: gateEval.ok ? '闸投影 PASS（非正式 verify）' : gateEval.reason,
    },
    hgm: { event_count: hgm.event_count, last_at: hgm.last_at },
    kpi_section: /^###\s*KPI/m.test(content),
    next_hint: gateEval.ok ? '闸已齐 · 跑 verify 后开 30（status 不替代 verify）' : `签收阻塞闸后再开 30（${blockers[0] || '见 gates'}）`,
  }
  const warnings: string[] = []
  let checkFailed = false
  if (options.check) {
    const checkReasons: string[] = []
    if (!reviewFound) checkReasons.push('missing R<n> review')
    if (!gateEval.ok) {
      checkReasons.push(`may_start_30=false · ${gateEval.reason || blockers.join('; ') || 'blocked'}`)
    }
    if (checkReasons.length > 0) {
      checkFailed = true
      for (const r of checkReasons) warnings.push(`FAIL: status --check · ${r}`)
    } else {
      warnings.push('OK: status --check passed（仍须正式 harness verify；--check ≠ 替代 verify）')
    }
  }
  return { payload, warnings, checkFailed }
}

function formatStatusHuman(payload: ReturnType<typeof buildTaskStatus>['payload']): string {
  const gates =
    payload.gates.length === 0
      ? '  (none)'
      : payload.gates.map((g) => `  - ${g.id}=${g.status}  blocks=${g.blocks_hats || '—'}`).join('\n')
  return [
    `task: ${payload.task_slug}`,
    `path: ${payload.task_path}`,
    `status: ${payload.status}`,
    `gates:`,
    gates,
    `may_start_30: ${payload.may_start_30}`,
    `blockers: ${payload.blockers.length === 0 ? '—' : payload.blockers.join('; ')}`,
    `last_invoke: ${payload.last_invoke.path ?? '—'}  hat=${payload.last_invoke.hat_id ?? '—'}`,
    `reviews: R1=${payload.reviews.R1 ? 'yes' : 'no'}  CLOSE=${payload.reviews.CLOSE ? 'yes' : 'no'}`,
    `verify_preview: ${payload.verify_preview.ok ? 'PASS' : 'BLOCK'}  reason=${payload.verify_preview.reason}`,
    `hgm: events=${payload.hgm.event_count ?? 'unknown'}  last_at=${payload.hgm.last_at ?? '—'}`,
    `next_hint: ${payload.next_hint}`,
    '',
    'NOTE: verify_preview 为只读预览；30 前仍须正式运行 verify。',
  ].join('\n')
}

export async function cmdStatus(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx dsh-coding-kit status [--target PATH] [--task FILE] [--json] [--check]
`)
    return
  }
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: taskFile, rest: r2 } = takeOption(rest, '--task')
  rest = r2
  const json = rest.includes('--json')
  const check = rest.includes('--check')
  rest = rest.filter((a) => a !== '--json' && a !== '--check')
  if (rest.length > 0) fail(`status 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  if (!taskFile) {
    if (check) fail('status --check 须配合 --task FILE')
    const rows = listActiveTasks(target).map((taskPath) => {
      const abs = path.join(target, taskPath)
      const content = readFileSync(abs, 'utf8')
      const meta = parseHarnessMeta(content)
      const gates = parseHumanGates(content)
      const gateEval = evaluateMayStart30(gates)
      const pending = gates.find((g) => g.status !== 'approved' && String(g.blocksHats || '').includes('30'))
      return {
        task_slug: meta.task_slug || path.basename(taskPath, '.md'),
        task_path: taskPath.replace(/\\/g, '/'),
        status: extractTaskStatus(content) || 'unknown',
        blocking_gate: pending ? `${pending.id}=${pending.status}` : null,
        may_start_30: gateEval.ok,
      }
    })
    if (json) console.log(JSON.stringify({ schema_version: 'obs_status_list.v1', tasks: rows }, null, 2))
    else {
      if (rows.length === 0) process.stdout.write('active tasks: (none)\n')
      else {
        const lines = ['active tasks:']
        for (const r of rows) {
          lines.push(
            `  - ${r.task_slug}  status=${r.status}  blocking=${r.blocking_gate || '—'}  may_start_30=${r.may_start_30}  path=${r.task_path}`,
          )
        }
        process.stdout.write(`${lines.join('\n')}\n`)
      }
    }
    return
  }
  const { payload, warnings, checkFailed } = buildTaskStatus(target, taskFile, { check })
  for (const w of warnings) console.error(w)
  if (json) console.log(JSON.stringify(payload, null, 2))
  else console.log(formatStatusHuman(payload))
  if (check && checkFailed) fail('', 2)
}

export async function cmdTimeline(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx dsh-coding-kit timeline --task FILE [--target PATH] [--json] [--limit N] [--ingest]
`)
    return
  }
  let rest = args.filter((a) => a !== '--json' && a !== '--ingest')
  const json = args.includes('--json')
  const ingest = args.includes('--ingest')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: taskOpt, rest: r2 } = takeOption(rest, '--task')
  rest = r2
  const { value: limitRaw, rest: r3 } = takeOption(rest, '--limit')
  rest = r3
  let taskFile = taskOpt
  if (taskFile != null && taskFile.startsWith('-')) {
    fail(`timeline --task 须紧跟文件路径（收到了旗标 ${taskFile}）`)
  }
  if (!taskFile && rest.length === 1 && !rest[0].startsWith('-')) {
    taskFile = rest[0]
    rest = []
  }
  if (rest.length > 0) fail(`timeline 未知参数: ${rest.join(' ')}`)
  if (!taskFile) fail('timeline 须指定 --task FILE')
  let limit: number | null = null
  if (limitRaw != null) {
    limit = Number(limitRaw)
    if (!Number.isFinite(limit) || limit < 0) fail(`timeline --limit 须为非负整数: ${limitRaw}`)
    limit = Math.floor(limit)
  }
  const target = resolveTarget(process.cwd(), targetArg)
  const { buildTaskTimeline, formatTimelineHuman } = await import('./cli-timeline.ts')
  const { payload, warnings } = buildTaskTimeline(target, taskFile, { limit, ingest })
  for (const w of warnings) console.error(w)
  if (json) console.log(JSON.stringify(payload, null, 2))
  else process.stdout.write(formatTimelineHuman(payload))
}
