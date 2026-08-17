import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export class CliError extends Error {
  readonly exitCode: number
  constructor(message: string, exitCode = 1) {
    super(message)
    this.name = 'CliError'
    this.exitCode = exitCode
  }
}

export type HumanGate = {
  id: string
  status: string
  blocksHats: string
}

export type MayStart = { ok: boolean; reason: string | null }

export const STATUS_RE = /\*\*状态\*\*：?\s*`?([a-z_]+)/i
const META_TICK_RE = /\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`/
const META_PLAIN_RE = /\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|\n]+)\|/
const GATE_ROW_RE =
  /^\|\s*(?:\*\*)?([^*|]+?)(?:\*\*)?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]*)\|/

export function packageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
}

export function resolveTarget(cwd: string, targetArg?: string): string {
  return path.resolve(targetArg || cwd)
}

export function takeOption(
  args: string[],
  name: string,
): { value: string | undefined; rest: string[] } {
  const idx = args.indexOf(name)
  if (idx === -1 || idx + 1 >= args.length) return { value: undefined, rest: args }
  const value = args[idx + 1]
  const rest = args.slice(0, idx).concat(args.slice(idx + 2))
  return { value, rest }
}

export function fail(message: string, exitCode = 1): never {
  throw new CliError(message, exitCode)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractSection(content: string, startMarker: string, endMarker?: string): string | null {
  const startRe = new RegExp(`^${escapeRegExp(startMarker)}`, 'm')
  const startMatch = content.match(startRe)
  if (!startMatch || startMatch.index === undefined) return null
  const start = startMatch.index
  let end = content.length
  if (endMarker) {
    const next = content.indexOf(endMarker, start + startMarker.length)
    if (next !== -1) end = next
  }
  return content.slice(start, end)
}

export function normalizeCell(raw: string): string {
  return raw.replace(/[`*]/g, '').trim()
}

export function parseHarnessMeta(content: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const section = extractSection(content, '## Harness 元信息', '###')
  if (!section) return meta
  for (const line of section.split('\n')) {
    const tick = line.match(META_TICK_RE)
    if (tick) {
      meta[tick[1].trim()] = tick[2].trim()
      continue
    }
    const plain = line.match(META_PLAIN_RE)
    if (!plain) continue
    const key = plain[1].trim()
    const val = plain[2].trim()
    if (!key || key === '字段') continue
    if (/^[-:\s]+$/.test(val)) continue
    if (!(key in meta)) meta[key] = val
  }
  return meta
}

export function parseHumanGates(content: string): HumanGate[] {
  const section = extractSection(content, '### 人工闸', '\n##')
  if (!section) return []
  const gates: HumanGate[] = []
  for (const line of section.split('\n')) {
    const match = line.match(GATE_ROW_RE)
    if (!match) continue
    const id = match[1].trim()
    if (!id.startsWith('HG-') || id.includes('human_gate')) continue
    gates.push({
      id,
      status: normalizeCell(match[2]),
      blocksHats: normalizeCell(match[3]),
    })
  }
  return gates
}

export function findGate(gates: HumanGate[], prefix: string): HumanGate | undefined {
  return gates.find((g) => g.id === prefix || g.id.startsWith(`${prefix}（`) || g.id.startsWith(`${prefix}(`))
}

export function evaluateMayStart30(gates: HumanGate[]): MayStart {
  const audit = findGate(gates, 'HG-AUDIT-R1')
  const draft = findGate(gates, 'HG-TASK-DRAFT')
  const graph = findGate(gates, 'HG-GRAPH-MODULES')
  if (audit?.status !== 'approved') {
    return { ok: false, reason: 'HG-AUDIT-R1 pending' }
  }
  if (draft && draft.status !== 'approved' && draft.blocksHats.includes('30')) {
    return { ok: false, reason: 'HG-TASK-DRAFT pending' }
  }
  if (graph?.status === 'pending') {
    return { ok: false, reason: 'HG-GRAPH-MODULES pending' }
  }
  return { ok: true, reason: null }
}

export function extractTaskSlug(fileName: string): string {
  let base = path.basename(fileName).replace(/\.md$/, '')
  base = base.replace(/^(task_|done_)/, '')
  base = base.replace(/_(\d{8}|\d{4}-\d{2}-\d{2})$/, '')
  base = base.replace(/_v\d+$/, '')
  return base
}

export function normalizeSlug(slug: string): string {
  return String(slug).replace(/_/g, '-')
}

export function resolveTaskPath(target: string, taskFile: string): string {
  return path.isAbsolute(taskFile) ? taskFile : path.join(target, taskFile)
}

export function readTextIfExists(file: string): string | null {
  if (!existsSync(file)) return null
  return readFileSync(file, 'utf8')
}

export function toRel(target: string, abs: string): string {
  const rel = path.relative(target, abs)
  if (!rel || rel.startsWith('..')) return abs.replace(/\\/g, '/')
  return rel.split(path.sep).join('/')
}

export function extractHatsFromInvokeFilename(name: string): string[] {
  const base = path.basename(name, '.md')
  const parts = base.split('_')
  if (parts.length >= 3 && parts[0] === 'invoke') {
    return [parts[2]]
  }
  return []
}
