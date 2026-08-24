import { existsSync, mkdirSync, readdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseHumanGates } from './cli-shared.ts'

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
  // DEF-015 D3：闸解析唯一实现为 cli-shared.parseHumanGates（宽松口径）；
  // 本函数仅做结构适配（blocks_hats 拆数组），不再保留私有表头解析。
  const gates = parseHumanGates(content).map((g) => ({
    human_gate_id: g.id,
    status: g.status,
    blocks_hats:
      g.blocksHats && g.blocksHats !== '—' ? g.blocksHats.split(/[,\s]+/).filter(Boolean) : [],
  }))
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
  // DEF-015 T4：GateStatusChanged.old_status 由既有事件轨推导（同 subject 最新 new_status），
  // 无历史才回退 'pending'；loadEvents 按 occurred_at+event_id 排序，后写覆盖先得最新态。
  const priorGateStatus = new Map<string, string>()
  for (const e of loadEvents(target)) {
    if (e.type === 'GateStatusChanged') {
      priorGateStatus.set(e.subject, String(e.data?.new_status ?? 'pending'))
    }
  }
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
  // DEF-022：active task 扫描目录表与 status 对齐（cli-status.ts 双路径布局）；
  // 目录不存在时静默跳过（listMarkdownFiles 的 existsSync 语义）。
  // 同一次运行内两目录出现同 task_slug 时「先扫目录优先、后者跳过」（§7-D2 拍板口径）。
  const ACTIVE_TASK_DIRS = ['docs/tasks/active', 'docs/harness/tasks/active']
  const seenSlugs = new Set<string>()
  for (const relDir of ACTIVE_TASK_DIRS) {
    for (const tf of listMarkdownFiles(path.join(target, relDir))) {
      const parsed = parseTaskMarkdown(readFileSync(tf, 'utf8'), tf)
      if (seenSlugs.has(parsed.task_slug)) continue
      seenSlugs.add(parsed.task_slug)
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
            old_status: priorGateStatus.get(`gate:${parsed.task_slug}:${g.human_gate_id}`) ?? 'pending',
            new_status: g.status,
            task_slug: parsed.task_slug,
            human_gate_id: g.human_gate_id,
            blocks_hats: g.blocks_hats,
          },
          source,
        })
      }
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

// DEF-015 T4/D1：幂等键 = type:subject[:状态摘要]——GateStatusChanged 摘要取 data.new_status，
// TaskCreated 取 data.status，无状态事件（RepositoryAdopted 等）保持两段键。
// 迁移口径：旧两段键事件保留不重写，新键自变更点生效；状态变化后重跑 ingest 会补发新事件。
function idempotencyKey(e: HgmEvent): string {
  const base = `${e.type}:${e.subject}`
  if (e.type === 'GateStatusChanged') return `${base}:${String(e.data?.new_status ?? '')}`
  if (e.type === 'TaskCreated') return `${base}:${String(e.data?.status ?? '')}`
  return base
}

export function ingestRepoIdempotent(
  target: string,
  options: { actor?: string; source?: string; dryRun?: boolean } = {},
): { events: HgmEvent[]; count: number; skipped: number } {
  const existing = loadEvents(target)
  const existingKeys = new Set(existing.map((e) => idempotencyKey(e)))
  const { events, count } = ingestRepo(target, { ...options, dryRun: true })
  const newEvents = events.filter((e) => !existingKeys.has(idempotencyKey(e)))
  if (!options.dryRun) {
    for (const e of newEvents) appendEvent(target, e)
  }
  return { events: newEvents, count: newEvents.length, skipped: count - newEvents.length }
}

export function eventMatchesTaskSlug(event: HgmEvent, slug: string): boolean {
  if (!slug) return false
  const norm = slug.replace(/_/g, '-')
  const dataSlug = event?.data?.task_slug ? String(event.data.task_slug).replace(/_/g, '-') : ''
  // data.task_slug 等值优先
  if (dataSlug && dataSlug === norm) return true
  // DEF-015 T3/D2：subject 侧仅做结构化等值匹配（task:<slug> / gate:<slug>:<hgid>），
  // 删除 includes 子串兜底；无 data.task_slug 且非结构化 subject 的事件一律不匹配（宁缺勿滥）。
  const parts = String(event?.subject || '').split(':')
  let subjectSlug = ''
  if (parts[0] === 'task' && parts.length === 2) subjectSlug = parts[1]
  else if (parts[0] === 'gate' && parts.length === 3) subjectSlug = parts[1]
  if (!subjectSlug) return false
  return subjectSlug.replace(/_/g, '-') === norm
}

export function filterEventsForTask(events: HgmEvent[], slug: string): HgmEvent[] {
  if (!slug || !Array.isArray(events)) return []
  return events.filter((e) => eventMatchesTaskSlug(e, slug))
}

// DEF-016 D3：event_count 语义唯一——0 = 事件轨可读取且与本 task 无匹配事件（含空轨）；
// null 仅表示事件轨读取失败/不可用（catch 分支）。last_at 与 event_count 同生同灭。
export function summarizeTaskHgm(target: string, slug: string): { event_count: number | null; last_at: string | null } {
  try {
    const events = loadEvents(target)
    const related = filterEventsForTask(events, slug)
    if (!slug || related.length === 0) return { event_count: 0, last_at: null }
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
