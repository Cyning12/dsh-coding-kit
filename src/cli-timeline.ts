import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fail, parseHarnessMeta, resolveTaskPath, toRel } from './cli-shared.ts'
import {
  filterEventsForTask,
  ingestRepoIdempotent,
  loadEvents,
  summarizeEvent,
} from './cli-graph-hgm.ts'

const OBS_TIMELINE_SCHEMA = 'obs_timeline.v1'

export function buildTaskTimeline(
  target: string,
  taskFile: string,
  options: { limit?: number | null; ingest?: boolean; actor?: string } = {},
): {
  payload: {
    schema_version: string
    task_slug: string
    task_path: string
    event_count: number
    returned: number
    limit: number | null
    ingested: boolean
    ingest: { count: number; skipped: number } | null
    events: { occurred_at: string | null; type: string; subject: string; summary: string; event_id: string | null }[]
  }
  warnings: string[]
} {
  const { limit = null, ingest = false, actor = 'system' } = options
  const absTask = resolveTaskPath(target, taskFile)
  if (!existsSync(absTask)) fail(`task 文件不存在: ${taskFile}`)
  const content = readFileSync(absTask, 'utf8')
  const meta = parseHarnessMeta(content)
  const slug = meta.task_slug || path.basename(absTask, '.md')
  let ingestResult: { count: number; skipped: number } | null = null
  if (ingest) {
    ingestResult = ingestRepoIdempotent(target, { actor, source: 'timeline-cli', dryRun: false })
  }
  const all = loadEvents(target)
  let related = filterEventsForTask(all, slug)
  related = [...related].sort(
    (a, b) =>
      String(a.occurred_at || '').localeCompare(String(b.occurred_at || '')) ||
      String(a.event_id || '').localeCompare(String(b.event_id || '')),
  )
  const truncated =
    limit != null && Number.isFinite(limit) && limit >= 0 ? related.slice(0, limit) : related
  const events = truncated.map((e) => ({
    occurred_at: e.occurred_at ?? null,
    type: e.type ?? 'Unknown',
    subject: e.subject ?? '',
    summary: summarizeEvent(e),
    event_id: e.event_id ?? null,
  }))
  const warnings: string[] = []
  if (related.length === 0) {
    warnings.push(
      'WARN: 无 HGM 数据（该 task 无匹配事件）。可先: npx dsh-coding-kit graph ingest --target <repo>；或本命令加 --ingest（显式写盘）',
    )
  }
  return {
    payload: {
      schema_version: OBS_TIMELINE_SCHEMA,
      task_slug: slug,
      task_path: toRel(target, absTask),
      event_count: related.length,
      returned: events.length,
      limit: limit == null ? null : Number(limit),
      ingested: Boolean(ingest),
      ingest: ingestResult,
      events,
    },
    warnings,
  }
}

export function formatTimelineHuman(payload: ReturnType<typeof buildTaskTimeline>['payload']): string {
  const lines = [
    `task: ${payload.task_slug}`,
    `path: ${payload.task_path}`,
    `events: ${payload.event_count}  returned: ${payload.returned}${payload.limit != null ? `  limit=${payload.limit}` : ''}`,
  ]
  if (payload.ingested) {
    lines.push(`ingest: new=${payload.ingest?.count ?? 0}  skipped=${payload.ingest?.skipped ?? 0}`)
  }
  if (payload.events.length === 0) lines.push('(no events)')
  else {
    lines.push('timeline (asc):')
    for (const e of payload.events) {
      lines.push(`  ${e.occurred_at || '—'}  ${e.type}  ${e.subject}  · ${e.summary}`)
    }
  }
  return `${lines.join('\n')}\n`
}
