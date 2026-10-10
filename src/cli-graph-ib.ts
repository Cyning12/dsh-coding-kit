/**
 * 3.2 W1 · graph ib check — 节点 implementedBy.path 存在性闸（只报告 · 零写盘）。
 * 产品钉：SPEC docs/spec/3_2-graph-ib-and-indexes/ · task 3-2-w1-graph-ib-check
 * 与 graph drift 分责：drift=边锚点+模块表；本命令=点 IB。不改 drift 缺省语义。
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fail, printJson, resolveTarget, takeOption, toRel } from './cli-shared.ts'
import { allGraphIds, GraphYamlError, loadYaml, yamlPathFor } from './cli-graph-yaml.ts'

export type IbIssueKind = 'missing_ib_path' | 'invalid_ib_shape'

export type IbIssue = {
  kind: IbIssueKind
  path: string
  source?: string
  node_id?: string
  detail?: string
}

export type IbCheckReport = {
  command: 'graph ib check'
  ok: boolean
  target: string
  input: string
  issues: IbIssue[]
  checked_ib: number
  skipped_ib: number
}

/** TBD 大小写不敏感（SPEC 02 §2.1 / 20 审 N1） */
export function isSkippableIbPath(p: string): boolean {
  const t = p.trim()
  return t === '' || t.toUpperCase() === 'TBD'
}

type CollectedIb = {
  path: string
  source: string
  nodeId: string
  shapeError?: string
}

export function collectImplementedByPaths(inputRoot: string): CollectedIb[] {
  const out: CollectedIb[] = []
  if (!existsSync(inputRoot)) return out
  let ids: string[]
  try {
    ids = allGraphIds(inputRoot, { recursive: true })
  } catch (err) {
    if (err instanceof GraphYamlError) fail(`graph ib check: ${err.message}`, 2)
    throw err
  }
  for (const id of ids) {
    const yamlAbs = yamlPathFor(inputRoot, id)
    let data
    try {
      data = loadYaml(yamlAbs)
    } catch (err) {
      if (err instanceof GraphYamlError) fail(`graph ib check: ${err.message}`, 2)
      throw err
    }
    const source = path.basename(yamlAbs)
    const nodes = data.nodes || []
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as {
        id?: string
        implementedBy?: unknown
      }
      if (n == null || typeof n !== 'object') continue
      if (!('implementedBy' in n) || n.implementedBy == null) continue
      const nodeId = n.id != null ? String(n.id) : `nodes[${i}]`
      const ib = n.implementedBy
      if (ib == null || typeof ib !== 'object' || Array.isArray(ib)) {
        out.push({
          path: '',
          source,
          nodeId,
          shapeError: `implementedBy 须为 object（非 array/scalar）`,
        })
        continue
      }
      const obj = ib as { path?: unknown; symbol?: unknown }
      if (typeof obj.path !== 'string') {
        out.push({
          path: obj.path != null ? String(obj.path) : '',
          source,
          nodeId,
          shapeError: `implementedBy.path 须为 string`,
        })
        continue
      }
      if (obj.symbol != null && typeof obj.symbol !== 'string') {
        out.push({
          path: obj.path,
          source,
          nodeId,
          shapeError: `implementedBy.symbol 若存在须为 string`,
        })
        continue
      }
      out.push({ path: obj.path, source, nodeId })
    }
  }
  return out
}

export function runGraphIbCheck(opts: { target: string; inputRoot: string }): IbCheckReport {
  const issues: IbIssue[] = []
  const collected = collectImplementedByPaths(opts.inputRoot)
  let checked = 0
  let skipped = 0

  for (const item of collected) {
    if (item.shapeError) {
      issues.push({
        kind: 'invalid_ib_shape',
        path: item.path || '(invalid)',
        source: item.source,
        node_id: item.nodeId,
        detail: item.shapeError,
      })
      continue
    }
    if (isSkippableIbPath(item.path)) {
      skipped += 1
      continue
    }
    checked += 1
    const rel = item.path.replace(/\\/g, '/')
    const abs = path.join(opts.target, rel)
    if (!existsSync(abs)) {
      issues.push({
        kind: 'missing_ib_path',
        path: rel,
        source: item.source,
        node_id: item.nodeId,
      })
    }
  }

  return {
    command: 'graph ib check',
    ok: issues.length === 0,
    target: opts.target,
    input: opts.inputRoot,
    issues,
    checked_ib: checked,
    skipped_ib: skipped,
  }
}

function printHuman(report: IbCheckReport, cwd: string): void {
  console.log(`graph ib check: ${report.ok ? 'PASS' : 'FAIL'}`)
  console.log(`target: ${toRel(cwd, report.target)}`)
  console.log(`input: ${toRel(cwd, report.input)}`)
  console.log(
    `checked: checked_ib=${report.checked_ib} skipped=${report.skipped_ib} issues=${report.issues.length}`,
  )
  for (const d of report.issues) {
    const src = d.source ? ` @ ${d.source}` : ''
    const nid = d.node_id ? ` node=${d.node_id}` : ''
    const detail = d.detail ? ` · ${d.detail}` : ''
    console.log(`  [${d.kind}] ${d.path}${src}${nid}${detail}`)
  }
  if (report.ok) console.log('（只报告 · 不写盘 · 无 AST）')
}

export async function cmdGraphIb(args: string[]): Promise<void> {
  const [action, ...actionRest] = args
  if (action !== 'check') {
    fail(`graph ib 动作未知: ${action ?? '(空)'}（支持: check）`)
  }
  let rest = actionRest
  if (rest.includes('--help') || rest.includes('-h')) {
    console.log(`用法: npx spec-wave graph ib check [--target PATH] [--input DIR] [--json]

扫描 nodes[].implementedBy.path 相对 --target 的文件存在性（点路径闸）。
空 / TBD（大小写不敏感）跳过；缺文件 exit 2 · missing_ib_path。
形状非法 exit 2 · invalid_ib_shape。checked=0 → exit 0。
只报告不写盘；不做 symbol AST。与 graph drift（边锚点）分责。
`)
    return
  }
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: inputArg, rest: r2 } = takeOption(rest, '--input')
  rest = r2
  const json = rest.includes('--json')
  rest = rest.filter((a) => a !== '--json')
  if (rest.length > 0) fail(`graph ib check 未知参数: ${rest.join(' ')}`)

  const cwd = process.cwd()
  const target = resolveTarget(cwd, targetArg)
  const inputRoot = inputArg
    ? path.resolve(cwd, inputArg)
    : path.resolve(target, 'docs', '_tech_graph')

  const report = runGraphIbCheck({ target, inputRoot })
  if (json) printJson(cwd, report)
  else printHuman(report, cwd)
  if (!report.ok) fail(`graph ib check 发现问题 × ${report.issues.length}`, 2)
}
