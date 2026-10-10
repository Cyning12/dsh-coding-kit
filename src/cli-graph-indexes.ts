/**
 * 3.2 W3 · graph indexes check — IB ↔ indexes 双向一致闸（opt-in · 只报告 · 零写盘）。
 * 产品钉：SPEC docs/spec/3_2-graph-ib-and-indexes/ · task 3-2-w3-graph-indexes
 * 配置：.spec-wave/graph-indexes.yaml（flow_globs / index_globs）；禁七域硬编码；不进默认 verify。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fail, printJson, resolveTarget, takeOption, toRel } from './cli-shared.ts'
import { GraphYamlError, loadYaml } from './cli-graph-yaml.ts'
import { isSkippableIbPath } from './cli-graph-ib.ts'
import { yamlLoad } from './yaml.ts'

export const GRAPH_INDEXES_CONFIG_REL = '.spec-wave/graph-indexes.yaml'

export type IndexesIssueKind =
  | 'ib_missing_in_index'
  | 'index_missing_in_ib'
  | 'config_invalid'
  | 'index_parse_error'

export type IndexesIssue = {
  kind: IndexesIssueKind
  key: string
  path?: string
  symbol?: string
  source?: string
  detail?: string
}

export type IndexesCheckReport = {
  command: 'graph indexes check'
  ok: boolean
  target: string
  input: string
  config: string
  issues: IndexesIssue[]
  ib_count: number
  index_count: number
  flow_files: number
  index_files: number
}

type IndexesConfig = {
  flowGlobs: string[]
  indexGlobs: string[]
}

type NormKey = {
  key: string
  path: string
  symbol?: string
}

/** 归一化键：path（/）+ 可选 symbol；空 symbol 不进键 */
export function normalizeIbIndexKey(p: string, symbol?: string): string {
  const pathNorm = p.replace(/\\/g, '/').trim()
  const sym = symbol != null ? String(symbol).trim() : ''
  return sym ? `${pathNorm}#${sym}` : pathNorm
}

/** 简易 glob：支持 *（非 /）与 **（跨段）；相对 --input */
export function matchPathGlob(relPath: string, pattern: string): boolean {
  const pathNorm = relPath.replace(/\\/g, '/')
  const pat = pattern.replace(/\\/g, '/').replace(/^\.\//, '')
  const re = globToRegExp(pat)
  return re.test(pathNorm)
}

function globToRegExp(glob: string): RegExp {
  let i = 0
  let out = '^'
  while (i < glob.length) {
    if (glob.startsWith('**/', i)) {
      out += '(?:.*/)?'
      i += 3
      continue
    }
    if (glob.startsWith('**', i)) {
      out += '.*'
      i += 2
      continue
    }
    const ch = glob[i]!
    if (ch === '*') {
      out += '[^/]*'
      i += 1
      continue
    }
    if (ch === '?') {
      out += '[^/]'
      i += 1
      continue
    }
    if (/[.+^${}()|[\]\\]/.test(ch)) out += `\\${ch}`
    else out += ch
    i += 1
  }
  out += '$'
  return new RegExp(out)
}

function walkFiles(root: string): string[] {
  const out: string[] = []
  if (!existsSync(root)) return out
  const walk = (abs: string, rel: string): void => {
    let names: string[]
    try {
      names = readdirSync(abs)
    } catch {
      return
    }
    for (const name of names) {
      if (name === '.git' || name === 'node_modules') continue
      const childAbs = path.join(abs, name)
      const childRel = rel ? `${rel}/${name}` : name
      let st
      try {
        st = statSync(childAbs)
      } catch {
        continue
      }
      if (st.isDirectory()) walk(childAbs, childRel.replace(/\\/g, '/'))
      else if (st.isFile()) out.push(childRel.replace(/\\/g, '/'))
    }
  }
  walk(root, '')
  return out
}

export function expandGlobs(inputRoot: string, globs: string[]): string[] {
  const files = walkFiles(inputRoot)
  const hit = new Set<string>()
  for (const g of globs) {
    const pat = g.replace(/\\/g, '/').trim()
    if (!pat) continue
    for (const f of files) {
      if (matchPathGlob(f, pat)) hit.add(f)
    }
  }
  return [...hit].sort()
}

function loadIndexesConfig(target: string): IndexesConfig | null {
  const abs = path.join(target, GRAPH_INDEXES_CONFIG_REL)
  if (!existsSync(abs)) return null
  let data: unknown
  try {
    data = yamlLoad(readFileSync(abs, 'utf8'))
  } catch (e) {
    fail(
      `graph indexes check: 配置 YAML 坏: ${GRAPH_INDEXES_CONFIG_REL} · ${(e as Error).message}`,
      2,
    )
  }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    fail(`graph indexes check: 配置 schema 非法（根须为 object）: ${GRAPH_INDEXES_CONFIG_REL}`, 2)
  }
  const obj = data as Record<string, unknown>
  if (obj.version != null && obj.version !== 1 && obj.version !== '1') {
    fail(`graph indexes check: version 须为 1: ${GRAPH_INDEXES_CONFIG_REL}`, 2)
  }
  const asStringList = (key: string): string[] => {
    const v = obj[key]
    if (v == null) {
      fail(`graph indexes check: 缺键 ${key}: ${GRAPH_INDEXES_CONFIG_REL}`, 2)
    }
    if (!Array.isArray(v) || v.length === 0 || !v.every((x) => typeof x === 'string')) {
      fail(`graph indexes check: 键 ${key} 须为非空 string[]: ${GRAPH_INDEXES_CONFIG_REL}`, 2)
    }
    return v as string[]
  }
  return {
    flowGlobs: asStringList('flow_globs'),
    indexGlobs: asStringList('index_globs'),
  }
}

type Collected = NormKey & { source: string }

function collectIbFromFlowFiles(inputRoot: string, relFiles: string[]): Collected[] {
  const out: Collected[] = []
  for (const rel of relFiles) {
    const abs = path.join(inputRoot, rel)
    let data
    try {
      data = loadYaml(abs)
    } catch (err) {
      if (err instanceof GraphYamlError) fail(`graph indexes check: ${err.message}`, 2)
      throw err
    }
    const source = rel.replace(/\\/g, '/')
    const nodes = data.nodes || []
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as { id?: string; implementedBy?: unknown }
      if (n == null || typeof n !== 'object') continue
      if (!('implementedBy' in n) || n.implementedBy == null) continue
      const ib = n.implementedBy
      if (ib == null || typeof ib !== 'object' || Array.isArray(ib)) continue
      const obj = ib as { path?: unknown; symbol?: unknown }
      if (typeof obj.path !== 'string') continue
      if (isSkippableIbPath(obj.path)) continue
      if (obj.symbol != null && typeof obj.symbol !== 'string') continue
      const p = obj.path.replace(/\\/g, '/').trim()
      const symbol = typeof obj.symbol === 'string' ? obj.symbol : undefined
      out.push({
        key: normalizeIbIndexKey(p, symbol),
        path: p,
        symbol,
        source,
      })
    }
  }
  return out
}

/**
 * MVP 唯一索引形态：
 * entries: [{ path: string, symbol?: string }]
 */
function collectIndexEntries(
  inputRoot: string,
  relFiles: string[],
): { items: Collected[]; issues: IndexesIssue[] } {
  const items: Collected[] = []
  const issues: IndexesIssue[] = []
  for (const rel of relFiles) {
    const abs = path.join(inputRoot, rel)
    const source = rel.replace(/\\/g, '/')
    let data: unknown
    try {
      data = yamlLoad(readFileSync(abs, 'utf8'))
    } catch (e) {
      issues.push({
        kind: 'index_parse_error',
        key: source,
        source,
        detail: (e as Error).message,
      })
      continue
    }
    if (data == null || typeof data !== 'object' || Array.isArray(data)) {
      issues.push({
        kind: 'index_parse_error',
        key: source,
        source,
        detail: '根须为 object 且含 entries: [{path, symbol?}]',
      })
      continue
    }
    const obj = data as Record<string, unknown>
    const entries = obj.entries
    if (!Array.isArray(entries)) {
      issues.push({
        kind: 'index_parse_error',
        key: source,
        source,
        detail: '须含 entries 数组（MVP 唯一形态）',
      })
      continue
    }
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
      if (e == null || typeof e !== 'object' || Array.isArray(e)) {
        issues.push({
          kind: 'index_parse_error',
          key: `${source}#entries[${i}]`,
          source,
          detail: `entries[${i}] 须为 object`,
        })
        continue
      }
      const ent = e as { path?: unknown; symbol?: unknown }
      if (typeof ent.path !== 'string') {
        issues.push({
          kind: 'index_parse_error',
          key: `${source}#entries[${i}]`,
          source,
          detail: `entries[${i}].path 须为 string`,
        })
        continue
      }
      if (isSkippableIbPath(ent.path)) continue
      if (ent.symbol != null && typeof ent.symbol !== 'string') {
        issues.push({
          kind: 'index_parse_error',
          key: `${source}#entries[${i}]`,
          source,
          detail: `entries[${i}].symbol 若存在须为 string`,
        })
        continue
      }
      const p = ent.path.replace(/\\/g, '/').trim()
      const symbol = typeof ent.symbol === 'string' ? ent.symbol : undefined
      items.push({
        key: normalizeIbIndexKey(p, symbol),
        path: p,
        symbol,
        source,
      })
    }
  }
  return { items, issues }
}

function toUniqueMap(items: Collected[]): Map<string, Collected> {
  const m = new Map<string, Collected>()
  for (const it of items) {
    if (!m.has(it.key)) m.set(it.key, it)
  }
  return m
}

export function runGraphIndexesCheck(opts: {
  target: string
  inputRoot: string
}): IndexesCheckReport {
  const cfg = loadIndexesConfig(opts.target)
  if (cfg == null) {
    // 调用方应在 CLI 层以 exit 1 usage 处理；此路径仅作防御
    fail(
      `graph indexes check: 未配置 ${GRAPH_INDEXES_CONFIG_REL}（opt-in · 见 usage）`,
      1,
    )
  }

  const flowFiles = expandGlobs(opts.inputRoot, cfg.flowGlobs)
  const indexFiles = expandGlobs(opts.inputRoot, cfg.indexGlobs)
  const ibItems = collectIbFromFlowFiles(opts.inputRoot, flowFiles)
  const { items: ixItems, issues: parseIssues } = collectIndexEntries(opts.inputRoot, indexFiles)

  const ibMap = toUniqueMap(ibItems)
  const ixMap = toUniqueMap(ixItems)
  const issues: IndexesIssue[] = [...parseIssues]

  for (const [key, ib] of ibMap) {
    if (!ixMap.has(key)) {
      issues.push({
        kind: 'ib_missing_in_index',
        key,
        path: ib.path,
        symbol: ib.symbol,
        source: ib.source,
        detail: 'IB 有、indexes 无',
      })
    }
  }
  for (const [key, ix] of ixMap) {
    if (!ibMap.has(key)) {
      issues.push({
        kind: 'index_missing_in_ib',
        key,
        path: ix.path,
        symbol: ix.symbol,
        source: ix.source,
        detail: 'indexes 有、IB 无',
      })
    }
  }

  return {
    command: 'graph indexes check',
    ok: issues.length === 0,
    target: opts.target,
    input: opts.inputRoot,
    config: GRAPH_INDEXES_CONFIG_REL,
    issues,
    ib_count: ibMap.size,
    index_count: ixMap.size,
    flow_files: flowFiles.length,
    index_files: indexFiles.length,
  }
}

function printHuman(report: IndexesCheckReport, cwd: string): void {
  console.log(`graph indexes check: ${report.ok ? 'PASS' : 'FAIL'}`)
  console.log(`target: ${toRel(cwd, report.target)}`)
  console.log(`input: ${toRel(cwd, report.input)}`)
  console.log(`config: ${report.config}`)
  console.log(
    `checked: ib=${report.ib_count} index=${report.index_count} flow_files=${report.flow_files} index_files=${report.index_files} issues=${report.issues.length}`,
  )
  for (const d of report.issues) {
    const src = d.source ? ` @ ${d.source}` : ''
    const detail = d.detail ? ` · ${d.detail}` : ''
    console.log(`  [${d.kind}] ${d.key}${src}${detail}`)
  }
  if (report.ok) console.log('（只报告 · 不写盘 · 无 AST · 不进默认 verify）')
}

function printUsage(): void {
  console.log(`用法: npx spec-wave graph indexes check [--target PATH] [--input DIR] [--json]

opt-in 双向闸：对照 flow yaml 的 nodes[].implementedBy 与 indexes YAML entries。
须存在配置文件 .spec-wave/graph-indexes.yaml（相对 --target）：
  version: 1
  flow_globs: ["10_flow_*.graph.yaml"]   # 相对 --input；支持 * 与 **
  index_globs: ["indexes/**/*.yaml"]

indexes YAML MVP 形态（唯一）：
  entries:
    - path: "src/foo.ts"
      symbol: "optional"

未配置 → exit 1（本 usage）。配置坏 / 单向漂移 → exit 2。
空/TBD path 跳过。禁 --write。不进默认 verify。禁七域硬编码（用 glob）。
`)
}

export async function cmdGraphIndexes(args: string[]): Promise<void> {
  const [action, ...actionRest] = args
  if (action !== 'check') {
    fail(`graph indexes 动作未知: ${action ?? '(空)'}（支持: check）`)
  }
  let rest = actionRest
  if (rest.includes('--help') || rest.includes('-h')) {
    printUsage()
    return
  }
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: inputArg, rest: r2 } = takeOption(rest, '--input')
  rest = r2
  const json = rest.includes('--json')
  rest = rest.filter((a) => a !== '--json')
  if (rest.length > 0) fail(`graph indexes check 未知参数: ${rest.join(' ')}`)

  const cwd = process.cwd()
  const target = resolveTarget(cwd, targetArg)
  const inputRoot = inputArg
    ? path.resolve(cwd, inputArg)
    : path.resolve(target, 'docs', '_tech_graph')

  const cfgAbs = path.join(target, GRAPH_INDEXES_CONFIG_REL)
  if (!existsSync(cfgAbs)) {
    printUsage()
    fail(`graph indexes check: 未配置 ${GRAPH_INDEXES_CONFIG_REL}（opt-in）`, 1)
  }

  const report = runGraphIndexesCheck({ target, inputRoot })
  if (json) printJson(cwd, report)
  else printHuman(report, cwd)
  if (!report.ok) fail(`graph indexes check 发现问题 × ${report.issues.length}`, 2)
}
