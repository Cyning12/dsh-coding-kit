import { existsSync, mkdirSync, readdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const HGM_DIR = '.cyning-harness'
const EVENTS_DIR = 'events'
const SNAPSHOT_FILE = 'graph/snapshot.json'

export class HgmError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HgmError'
  }
}

export type HgmEvent = {
  event_id: string
  type: string
  occurred_at: string
  actor: string
  subject: string
  data: Record<string, unknown>
  source: string
}

export type HgmSnapshot = {
  nodes: Record<string, Record<string, unknown>>
  edges: Record<string, unknown>[]
  projections: {
    task_status: Record<string, string>
    gate_status: Record<string, string>
    rejected_events: string[]
  }
  generated_at: string
}

export function eventsDir(target: string): string {
  return path.join(target, HGM_DIR, EVENTS_DIR)
}

export function eventsFileForMonth(target: string, date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return path.join(eventsDir(target), `${y}-${m}.jsonl`)
}

export function snapshotPath(target: string): string {
  return path.join(target, HGM_DIR, SNAPSHOT_FILE)
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function isoDate(date = new Date()): string {
  return date.toISOString()
}

function eventId(date = new Date(), seq = 0): string {
  const d = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  return `evt:${d}:${String(seq).padStart(3, '0')}`
}

export function appendEvent(target: string, event: HgmEvent): string {
  const file = eventsFileForMonth(target, new Date(event.occurred_at))
  ensureDir(path.dirname(file))
  appendFileSync(file, `${JSON.stringify(event)}\n`)
  return file
}

export function loadEvents(target: string): HgmEvent[] {
  const dir = eventsDir(target)
  if (!existsSync(dir)) return []
  const events: HgmEvent[] = []
  const files = readdirSync(dir)
    .filter((n) => n.endsWith('.jsonl'))
    .sort()
  for (const f of files) {
    const raw = readFileSync(path.join(dir, f), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        events.push(JSON.parse(trimmed) as HgmEvent)
      } catch (err) {
        const e = err as { message?: string }
        throw new HgmError(`JSONL 解析失败 ${f}: ${e.message ?? String(err)}`)
      }
    }
  }
  events.sort(
    (a, b) =>
      String(a.occurred_at).localeCompare(String(b.occurred_at)) ||
      String(a.event_id).localeCompare(String(b.event_id)),
  )
  return events
}

export function parseTaskMarkdown(content: string, fileName: string): {
  task_slug: string
  title: string
  status: string
  gates: { human_gate_id: string; status: string; blocks_hats: string[] }[]
  must_read: string[]
} {
  const slugMatch =
    content.match(/\*\*task_slug\*\*\s*[:：]\s*`?([a-zA-Z0-9_-]+)`?/) ||
    fileName.match(/task_([a-zA-Z0-9_-]+)_v\d+/)
  const taskSlug = slugMatch ? slugMatch[1] : path.basename(fileName, '.md')
  const titleMatch = content.match(/^#\s+Task\s*[·•]\s*(.+)$/m) || content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : taskSlug
  const statusMatch = content.match(/\*\*状态\*\*\s*[:：]\s*`?([a-zA-Z0-9_-]+)`?/)
  const status = statusMatch ? statusMatch[1] : 'pending'
  const gates: { human_gate_id: string; status: string; blocks_hats: string[] }[] = []
  const gateHeader = content.search(/^\s*\|\s*human_gate_id\s*\|/m)
  if (gateHeader !== -1) {
    const tableStart = content.lastIndexOf('\n', gateHeader) + 1
    let tableEnd = content.indexOf('\n\n', gateHeader)
    if (tableEnd === -1) tableEnd = content.length
    const table = content.slice(tableStart, tableEnd).trim()
    const lines = table.split('\n').filter((l) => l.trim().startsWith('|'))
    for (let i = 2; i < lines.length; i += 1) {
      const cols = lines[i].split('|').map((c) => c.trim().replace(/\*/g, ''))
      if (cols.length >= 3) {
        const humanGateId = cols[1]
        const gateStatus = cols[2]
        const blocksHats =
          cols[3] && cols[3] !== '—' ? cols[3].split(/[,\s]+/).filter(Boolean) : []
        if (humanGateId && gateStatus) {
          gates.push({ human_gate_id: humanGateId, status: gateStatus, blocks_hats: blocksHats })
        }
      }
    }
  }
  const mustRead: string[] = []
  const mustReadMatch = content.match(/MUST_READ|must_read|必须阅读/)
  if (mustReadMatch) {
    const sectionStart = content.indexOf(mustReadMatch[0])
    const sectionEnd = content.indexOf('\n\n', sectionStart)
    const section = content.slice(sectionStart, sectionEnd === -1 ? content.length : sectionEnd)
    const paths = section.match(/`(docs\/[^`]+\.(?:md|yaml|graph\.yaml))`/g) || []
    for (const p of paths) mustRead.push(p.slice(1, -1))
  }
  return { task_slug: taskSlug, title, status, gates, must_read: mustRead }
}

function listMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.join(dir, e.name))
}

export function ingestRepo(
  target: string,
  options: { actor?: string; source?: string; dryRun?: boolean; occurredAt?: string } = {},
): { events: HgmEvent[]; count: number } {
  const actor = options.actor || 'system'
  const source = options.source || 'cli'
  const dryRun = Boolean(options.dryRun)
  const occurredAt = options.occurredAt || isoDate()
  const events: HgmEvent[] = []
  let seq = 0
  const manifestPath = path.join(target, HGM_DIR, 'manifest.json')
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      version?: string
      preset?: string
      ide?: string[]
    }
    events.push({
      event_id: eventId(new Date(occurredAt), seq++),
      type: 'RepositoryAdopted',
      occurred_at: occurredAt,
      actor,
      subject: `repo:${path.basename(target)}`,
      data: {
        manifest_version: manifest.version,
        preset: manifest.preset,
        ide: manifest.ide || [],
      },
      source,
    })
  }
  const activeDir = path.join(target, 'docs/tasks/active')
  for (const tf of listMarkdownFiles(activeDir)) {
    const parsed = parseTaskMarkdown(readFileSync(tf, 'utf8'), tf)
    const taskSubject = `task:${parsed.task_slug}`
    events.push({
      event_id: eventId(new Date(occurredAt), seq++),
      type: 'TaskCreated',
      occurred_at: occurredAt,
      actor,
      subject: taskSubject,
      data: {
        task_slug: parsed.task_slug,
        title: parsed.title,
        status: parsed.status,
        path: path.relative(target, tf),
        must_read: parsed.must_read,
      },
      source,
    })
    for (const g of parsed.gates) {
      events.push({
        event_id: eventId(new Date(occurredAt), seq++),
        type: 'GateStatusChanged',
        occurred_at: occurredAt,
        actor,
        subject: `gate:${parsed.task_slug}:${g.human_gate_id}`,
        data: {
          old_status: 'pending',
          new_status: g.status,
          task_slug: parsed.task_slug,
          human_gate_id: g.human_gate_id,
          blocks_hats: g.blocks_hats,
        },
        source,
      })
    }
  }
  if (!dryRun) {
    for (const e of events) appendEvent(target, e)
  }
  return { events, count: events.length }
}

export function buildSnapshot(events: HgmEvent[]): HgmSnapshot {
  const nodes = new Map<string, Record<string, unknown>>()
  const edges: Record<string, unknown>[] = []
  const ensureNode = (id: string, label: string, kind: string, extra: Record<string, unknown> = {}) => {
    if (!nodes.has(id)) nodes.set(id, { id, label, kind, ...extra })
    return nodes.get(id)
  }
  const addEdge = (from: string, to: string, type: string, props: Record<string, unknown> = {}) => {
    edges.push({ from, to, type, ...props })
  }
  const sorted = [...events].sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)))
  const taskStatus = new Map<string, string>()
  const gateStatus = new Map<string, string>()
  const rejectedEvents: HgmEvent[] = []
  for (const e of sorted) {
    const { type, subject, data } = e
    switch (type) {
      case 'RepositoryAdopted':
        ensureNode(subject, String(data.preset || subject), 'BusinessRepository', {
          manifest_version: data.manifest_version,
        })
        break
      case 'TaskCreated':
        ensureNode(subject, String(data.title), 'Task', { status: data.status, path: data.path })
        taskStatus.set(subject, String(data.status))
        break
      case 'GateStatusChanged':
        ensureNode(subject, String(data.human_gate_id), 'HumanGate', {
          task_slug: data.task_slug,
          status: data.new_status,
        })
        gateStatus.set(subject, String(data.new_status))
        addEdge(`task:${String(data.task_slug)}`, subject, 'HAS_GATE', { since: e.occurred_at })
        {
          const hats = Array.isArray(data.blocks_hats) ? data.blocks_hats : []
          for (const hat of hats) {
            const hatId = String(hat)
            ensureNode(`hat:${hatId}`, hatId, 'Hat')
            addEdge(subject, `hat:${hatId}`, 'BLOCKS', { hat_id: hatId })
          }
        }
        break
      case 'HumanGateRejected':
        rejectedEvents.push(e)
        break
      default:
        break
    }
  }
  return {
    nodes: Object.fromEntries(nodes),
    edges,
    projections: {
      task_status: Object.fromEntries(taskStatus),
      gate_status: Object.fromEntries(gateStatus),
      rejected_events: rejectedEvents.map((e) => e.event_id),
    },
    generated_at: isoDate(),
  }
}

function checkRejectedToDraft(events: HgmEvent[] | null): { axiom: string; severity: string; message: string; node: string }[] {
  const violations: { axiom: string; severity: string; message: string; node: string }[] = []
  if (!events || events.length === 0) return violations
  const sorted = [...events].sort(
    (a, b) =>
      String(a.occurred_at).localeCompare(String(b.occurred_at)) ||
      String(a.event_id).localeCompare(String(b.event_id)),
  )
  for (let i = 0; i < sorted.length; i += 1) {
    const rej = sorted[i]
    if (
      rej.type !== 'HumanGateRejected' &&
      !(rej.type === 'GateStatusChanged' && rej.data?.new_status === 'rejected')
    ) {
      continue
    }
    const taskSlug = rej.data?.task_slug
    if (!taskSlug) continue
    const taskSubject = `task:${String(taskSlug)}`
    const hasDraftFollowUp = sorted.slice(i + 1).some(
      (e) =>
        e.type === 'TaskStatusChanged' &&
        e.subject === taskSubject &&
        e.data?.new_status === 'draft',
    )
    if (!hasDraftFollowUp) {
      violations.push({
        axiom: 'rejected→draft',
        severity: 'error',
        message: `gate rejected（${rej.event_id}）后缺少 TaskStatusChanged(draft) 回退`,
        node: rej.subject,
      })
    }
  }
  return violations
}

export function checkAxioms(
  snapshot: HgmSnapshot,
  events: HgmEvent[] | null = null,
): { ok: boolean; violations: { axiom: string; severity: string; message: string; node: string }[] } {
  const violations: { axiom: string; severity: string; message: string; node: string }[] = []
  const { nodes, edges, projections } = snapshot
  const nodeMap = new Map(Object.entries(nodes))
  const outgoing = (id: string, type: string) =>
    edges.filter((e) => e.from === id && e.type === type)
  for (const [id, node] of nodeMap) {
    if (node.kind === 'HumanGate' && node.status === 'pending') {
      const blocks30 = outgoing(id, 'BLOCKS').some((e) => String(e.hat_id).includes('30'))
      if (blocks30) {
        violations.push({
          axiom: 'D2',
          severity: 'error',
          message: `gate ${id} pending 且阻塞 30 帽`,
          node: id,
        })
      }
    }
  }
  for (const [taskId, status] of Object.entries(projections.task_status || {})) {
    if (status === 'in_progress') {
      const checked = edges.some(
        (e) => e.to === taskId && e.type === 'CHECKED' && e.exit_code === 0,
      )
      if (!checked) {
        violations.push({
          axiom: 'D3',
          severity: 'warn',
          message: `task ${taskId} in_progress 但无通过 GateCheckRun`,
          node: taskId,
        })
      }
    }
  }
  violations.push(...checkRejectedToDraft(events))
  const s2Prefixes = ['docs/tasks/', 'reviews/', 'invokes/by-task/', 'docs/harness/reviews/', 'docs/harness/invokes/by-task/']
  for (const edge of edges) {
    if (edge.type === 'SYNCED') {
      const files = (edge.files_touched as string[]) || []
      for (const f of files) {
        if (s2Prefixes.some((p) => f.startsWith(p))) {
          violations.push({
            axiom: 'S2',
            severity: 'error',
            message: `sync 事件 touch S2 保护域: ${f}`,
            node: String(edge.from),
          })
        }
      }
    }
  }
  return {
    ok: violations.filter((v) => v.severity === 'error').length === 0,
    violations,
  }
}

export function writeSnapshot(target: string, snapshot: HgmSnapshot): string {
  const p = snapshotPath(target)
  ensureDir(path.dirname(p))
  writeFileSync(p, `${JSON.stringify(snapshot, null, 2)}\n`)
  return p
}

export function ingestRepoIdempotent(
  target: string,
  options: { actor?: string; source?: string; dryRun?: boolean } = {},
): { events: HgmEvent[]; count: number; skipped: number } {
  const existing = loadEvents(target)
  const existingKeys = new Set(existing.map((e) => `${e.type}:${e.subject}`))
  const { events, count } = ingestRepo(target, { ...options, dryRun: true })
  const newEvents = events.filter((e) => !existingKeys.has(`${e.type}:${e.subject}`))
  if (!options.dryRun) {
    for (const e of newEvents) appendEvent(target, e)
  }
  return { events: newEvents, count: newEvents.length, skipped: count - newEvents.length }
}

export function eventMatchesTaskSlug(event: HgmEvent, slug: string): boolean {
  if (!slug) return false
  const norm = slug.replace(/_/g, '-')
  const subj = String(event?.subject || '')
  const dataSlug = event?.data?.task_slug ? String(event.data.task_slug).replace(/_/g, '-') : ''
  if (dataSlug && dataSlug === norm) return true
  if (subj.includes(slug)) return true
  if (subj.replace(/_/g, '-').includes(norm)) return true
  return false
}

export function filterEventsForTask(events: HgmEvent[], slug: string): HgmEvent[] {
  if (!slug || !Array.isArray(events)) return []
  return events.filter((e) => eventMatchesTaskSlug(e, slug))
}

export function summarizeTaskHgm(target: string, slug: string): { event_count: number | null; last_at: string | null } {
  try {
    const events = loadEvents(target)
    if (!events.length) return { event_count: 0, last_at: null }
    const related = filterEventsForTask(events, slug)
    if (!slug || related.length === 0) return { event_count: null, last_at: null }
    const last = related[related.length - 1]
    return { event_count: related.length, last_at: last.occurred_at || null }
  } catch {
    return { event_count: null, last_at: null }
  }
}

export function summarizeEvent(event: HgmEvent): string {
  const d = event?.data || {}
  const type = event?.type || 'Unknown'
  switch (type) {
    case 'TaskCreated':
      return `created status=${d.status || '—'} title=${d.title || '—'}`
    case 'GateStatusChanged':
      return `${d.human_gate_id || 'gate'}: ${d.old_status || '?'}→${d.new_status || '?'}`
    default:
      return Object.keys(d).length ? JSON.stringify(d).slice(0, 120) : type
  }
}
