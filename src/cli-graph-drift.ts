/**
 * 3.1 W3 · graph drift — 模块表覆盖 + 锚点 path 消失（只报告 · 零写盘）。
 * 产品钉：SPEC docs/spec/3_1-tech-graph-scaffold/ · task 3-1-w3-graph-drift
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fail, printJson, resolveTarget, takeOption, toRel } from './cli-shared.ts'
import { MODULE_DIR_CANDIDATES } from './cli-graph-scaffold.ts'
import { allGraphIds, GraphYamlError, loadYaml, yamlPathFor } from './cli-graph-yaml.ts'
import { yamlLoad } from './yaml.ts'

export const GRAPH_DRIFT_CONFIG_REL = '.spec-wave/graph-drift.yaml'
export const STRUCT_REL_DEFAULT = '01_struct.md'

export type DriftKind =
  | 'uncovered_module_dir'
  | 'missing_anchor_path'
  | 'struct_missing'
  | 'struct_unparseable'
  | 'whitelist_invalid'

export type DriftItem = {
  kind: DriftKind
  path: string
  source?: string
  detail?: string
}

export type DriftReport = {
  command: 'graph drift'
  ok: boolean
  target: string
  input: string
  drifts: DriftItem[]
  checked_dirs: string[]
  checked_anchors: number
  whitelist: string
  struct_layout: 'protocol' | 'dogfood_legacy' | 'none'
}

type Whitelist = {
  exemptDirs: Set<string>
  exemptAnchorPaths: Set<string>
  exemptAnchorPrefixes: string[]
}

function stripTicks(s: string): string {
  return s.trim().replace(/^`+|`+$/g, '').trim()
}

function splitMdRow(line: string): string[] | null {
  const t = line.trim()
  if (!t.startsWith('|')) return null
  const cells = t.split('|').slice(1, -1).map((c) => c.trim())
  if (cells.length === 0) return null
  return cells
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((c) => /^:?-{3,}:?$/.test(c.replace(/\s/g, '')))
}

/** 协议表：含「路径 glob」列；dogfood 旧列形：模块|职责|读|写|… */
export function parseStructModuleGlobs(structMd: string): {
  layout: 'protocol' | 'dogfood_legacy'
  globs: string[]
} {
  const lines = structMd.split(/\r?\n/)
  let header: string[] | null = null
  let globIdx = -1
  let moduleIdx = -1
  let readIdx = -1
  let writeIdx = -1
  let layout: 'protocol' | 'dogfood_legacy' | null = null
  const globs: string[] = []

  for (const line of lines) {
    const cells = splitMdRow(line)
    if (!cells) continue
    if (!header) {
      const joined = cells.join(' ').toLowerCase()
      const g = cells.findIndex((c) => /路径\s*glob|path\s*glob/i.test(c))
      if (g >= 0) {
        header = cells
        globIdx = g
        layout = 'protocol'
        continue
      }
      const m = cells.findIndex((c) => /^模块$|^module$/i.test(c.trim()))
      const duty = cells.findIndex((c) => /职责|读/.test(c))
      if (m >= 0 && duty >= 0) {
        header = cells
        moduleIdx = m
        readIdx = cells.findIndex((c) => /^读$/.test(c.trim()))
        writeIdx = cells.findIndex((c) => /^写$/.test(c.trim()))
        layout = 'dogfood_legacy'
        continue
      }
      continue
    }
    if (isSeparatorRow(cells)) continue
    if (layout === 'protocol' && globIdx >= 0) {
      const raw = cells[globIdx] ?? ''
      const cleaned = stripTicks(raw)
      if (!cleaned || cleaned === '（glob）' || /_TODO_/i.test(cleaned)) continue
      for (const part of cleaned.split(/\s*或\s*|\s+or\s+/i)) {
        const g = stripTicks(part)
        if (g) globs.push(g)
      }
      continue
    }
    if (layout === 'dogfood_legacy') {
      // 旧列形无路径 glob：凡模块/读写单元格暗示 src 或候选根，记为覆盖该一级根
      const texts: string[] = []
      if (moduleIdx >= 0) texts.push(cells[moduleIdx] ?? '')
      if (readIdx >= 0) texts.push(cells[readIdx] ?? '')
      if (writeIdx >= 0) texts.push(cells[writeIdx] ?? '')
      const blob = texts.join(' ')
      for (const dir of MODULE_DIR_CANDIDATES) {
        if (
          new RegExp(`(?:^|[^a-zA-Z0-9_])${dir}(?:/|\\\\|\\b)`, 'i').test(blob) ||
          (dir === 'src' && /\.(ts|tsx|js|jsx|mjs|cjs)\b/i.test(blob))
        ) {
          globs.push(`${dir}/**`)
        }
      }
    }
  }

  if (!layout) {
    throw new Error('01_struct.md 模块表不可解析（须协议列「路径 glob」或 dogfood 旧列形「模块|职责|…」）')
  }
  return { layout, globs: [...new Set(globs)] }
}

/** glob 首段 = 候选一级目录名 → 覆盖该目录 */
export function globCoversModuleDir(glob: string, dir: string): boolean {
  const g = stripTicks(glob).replace(/\\/g, '/')
  if (!g) return false
  const first = g.split('/')[0] ?? ''
  return first === dir
}

function listPresentCandidateDirs(target: string): string[] {
  const out: string[] = []
  for (const name of MODULE_DIR_CANDIDATES) {
    const abs = path.join(target, name)
    try {
      if (existsSync(abs) && statSync(abs).isDirectory()) out.push(name)
    } catch {
      /* ignore */
    }
  }
  return out
}

function resolveStructRel(raw: unknown): string {
  if (raw == null) return STRUCT_REL_DEFAULT
  if (typeof raw !== 'string') {
    fail(
      `graph drift: 白名单键 struct_rel 须为 string: ${GRAPH_DRIFT_CONFIG_REL}`,
      2,
    )
  }
  const rel = raw.replace(/\\/g, '/').trim()
  if (!rel) return STRUCT_REL_DEFAULT
  if (path.isAbsolute(raw) || path.isAbsolute(rel) || /^[A-Za-z]:\//.test(rel)) {
    fail(
      `graph drift: struct_rel 须为相对 --input 的路径（禁止绝对路径）: ${GRAPH_DRIFT_CONFIG_REL}`,
      2,
    )
  }
  return rel.replace(/^\/+/, '')
}

function loadWhitelist(target: string): {
  whitelist: Whitelist
  relLabel: string
  structRel: string
} {
  const abs = path.join(target, GRAPH_DRIFT_CONFIG_REL)
  if (!existsSync(abs)) {
    return {
      whitelist: {
        exemptDirs: new Set(),
        exemptAnchorPaths: new Set(),
        exemptAnchorPrefixes: [],
      },
      relLabel: '(none)',
      structRel: STRUCT_REL_DEFAULT,
    }
  }
  let data: unknown
  try {
    data = yamlLoad(readFileSync(abs, 'utf8'))
  } catch (e) {
    fail(
      `graph drift: 白名单 YAML 坏: ${GRAPH_DRIFT_CONFIG_REL} · ${(e as Error).message}`,
      2,
    )
  }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    fail(`graph drift: 白名单 schema 非法（根须为 object）: ${GRAPH_DRIFT_CONFIG_REL}`, 2)
  }
  const obj = data as Record<string, unknown>
  if (obj.version != null && obj.version !== 1 && obj.version !== '1') {
    fail(`graph drift: 白名单 version 须为 1: ${GRAPH_DRIFT_CONFIG_REL}`, 2)
  }
  const asStringList = (key: string): string[] => {
    const v = obj[key]
    if (v == null) return []
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
      fail(`graph drift: 白名单键 ${key} 须为 string[]: ${GRAPH_DRIFT_CONFIG_REL}`, 2)
    }
    return v as string[]
  }
  const exemptDirs = new Set(asStringList('exempt_dirs').map((d) => d.replace(/\/+$/, '')))
  const exemptAnchorPaths = new Set(
    asStringList('exempt_anchor_paths').map((p) => p.replace(/\\/g, '/')),
  )
  const exemptAnchorPrefixes = asStringList('exempt_anchor_prefixes').map((p) =>
    p.replace(/\\/g, '/'),
  )
  const structRel = resolveStructRel(obj.struct_rel)
  return {
    whitelist: { exemptDirs, exemptAnchorPaths, exemptAnchorPrefixes },
    relLabel: GRAPH_DRIFT_CONFIG_REL,
    structRel,
  }
}

function isAnchorExempt(relPath: string, wl: Whitelist): boolean {
  const p = relPath.replace(/\\/g, '/')
  if (wl.exemptAnchorPaths.has(p)) return true
  return wl.exemptAnchorPrefixes.some((pref) => p === pref || p.startsWith(pref))
}

function isSkippableAnchorPath(p: string): boolean {
  const t = p.trim()
  return t === '' || t.toUpperCase() === 'TBD'
}

export function collectAnchorPaths(
  inputRoot: string,
): Array<{ path: string; source: string }> {
  const out: Array<{ path: string; source: string }> = []
  if (!existsSync(inputRoot)) return out
  let ids: string[]
  try {
    ids = allGraphIds(inputRoot, { recursive: true })
  } catch (err) {
    if (err instanceof GraphYamlError) fail(`graph drift: ${err.message}`, 2)
    throw err
  }
  for (const id of ids) {
    const yamlAbs = yamlPathFor(inputRoot, id)
    let data
    try {
      data = loadYaml(yamlAbs)
    } catch (err) {
      if (err instanceof GraphYamlError) fail(`graph drift: ${err.message}`, 2)
      throw err
    }
    const source = path.basename(yamlAbs)
    for (const e of data.edges || []) {
      for (const a of e.anchors || []) {
        const p = a?.path != null ? String(a.path) : ''
        out.push({ path: p, source })
      }
    }
  }
  return out
}

export function runGraphDrift(opts: {
  target: string
  inputRoot: string
}): DriftReport {
  const drifts: DriftItem[] = []
  const { whitelist, relLabel, structRel } = loadWhitelist(opts.target)
  const structAbs = path.join(opts.inputRoot, structRel)
  let structLayout: DriftReport['struct_layout'] = 'none'
  let globs: string[] = []

  if (!existsSync(structAbs)) {
    drifts.push({
      kind: 'struct_missing',
      path: path.relative(opts.target, structAbs).split(path.sep).join('/') || structRel,
      detail: `${structRel} 缺失`,
    })
  } else {
    try {
      const parsed = parseStructModuleGlobs(readFileSync(structAbs, 'utf8'))
      structLayout = parsed.layout
      globs = parsed.globs
    } catch (e) {
      drifts.push({
        kind: 'struct_unparseable',
        path: structRel,
        detail: (e as Error).message,
      })
    }
  }

  const checkedDirs = listPresentCandidateDirs(opts.target)
  if (structLayout !== 'none' && drifts.every((d) => d.kind !== 'struct_unparseable')) {
    for (const dir of checkedDirs) {
      if (whitelist.exemptDirs.has(dir)) continue
      const covered = globs.some((g) => globCoversModuleDir(g, dir))
      if (!covered) {
        drifts.push({ kind: 'uncovered_module_dir', path: dir })
      }
    }
  }

  const anchors = collectAnchorPaths(opts.inputRoot)
  let checkedAnchors = 0
  for (const a of anchors) {
    if (isSkippableAnchorPath(a.path)) continue
    const rel = a.path.replace(/\\/g, '/')
    if (isAnchorExempt(rel, whitelist)) continue
    checkedAnchors += 1
    const abs = path.join(opts.target, rel)
    if (!existsSync(abs)) {
      drifts.push({ kind: 'missing_anchor_path', path: rel, source: a.source })
    }
  }

  return {
    command: 'graph drift',
    ok: drifts.length === 0,
    target: opts.target,
    input: opts.inputRoot,
    drifts,
    checked_dirs: checkedDirs,
    checked_anchors: checkedAnchors,
    whitelist: relLabel,
    struct_layout: structLayout,
  }
}

function printHuman(report: DriftReport, cwd: string): void {
  console.log(`graph drift: ${report.ok ? 'PASS' : 'FAIL'}`)
  console.log(`target: ${toRel(cwd, report.target)}`)
  console.log(`input: ${toRel(cwd, report.input)}`)
  console.log(`whitelist: ${report.whitelist}`)
  console.log(`struct_layout: ${report.struct_layout}`)
  console.log(
    `checked: dirs=${report.checked_dirs.length} anchors=${report.checked_anchors} drifts=${report.drifts.length}`,
  )
  for (const d of report.drifts) {
    const src = d.source ? ` @ ${d.source}` : ''
    const detail = d.detail ? ` · ${d.detail}` : ''
    console.log(`  [${d.kind}] ${d.path}${src}${detail}`)
  }
  if (report.ok) console.log('（只报告 · 不重画图谱）')
}

export async function cmdGraphDrift(args: string[]): Promise<void> {
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: inputArg, rest: r2 } = takeOption(rest, '--input')
  rest = r2
  const json = rest.includes('--json')
  rest = rest.filter((a) => a !== '--json')
  if (rest.length > 0) fail(`graph drift 未知参数: ${rest.join(' ')}`)

  const cwd = process.cwd()
  const target = resolveTarget(cwd, targetArg)
  const inputRoot = inputArg
    ? path.resolve(cwd, inputArg)
    : path.resolve(target, 'docs', '_tech_graph')

  const report = runGraphDrift({ target, inputRoot })
  if (json) printJson(cwd, report)
  else printHuman(report, cwd)
  if (!report.ok) fail(`graph drift 发现漂移 × ${report.drifts.length}`, 2)
}
