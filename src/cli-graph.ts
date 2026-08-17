import path from 'node:path'
import { fail, resolveTarget, takeOption } from './cli-shared.ts'
import {
  allGraphIds,
  checkGraph,
  compileGraph,
  exportGraphJson,
  GraphYamlError,
  resolveGraphJsonPath,
} from './cli-graph-yaml.ts'
import {
  buildSnapshot,
  checkAxioms,
  ingestRepoIdempotent,
  loadEvents,
  writeSnapshot,
} from './cli-graph-hgm.ts'

export async function cmdGraph(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx dsh-coding-kit graph <子命令> [选项]

子命令:
  graph yaml compile --graph-id ID [--target PATH] [--input DIR] [--output FILE]
  graph yaml compile --all [--target PATH] [--input DIR] [--no-recursive]
  graph yaml check --graph-id ID [--target PATH] [--input DIR] [--graph-json FILE]
  graph yaml export --input DIR [--out FILE] [--no-recursive]
  graph ingest [--target PATH] [--actor ACTOR] [--dry-run]
  graph snapshot [--target PATH]
  graph axioms check [--target PATH] [--json]
`)
    return
  }
  const [sub, ...subRest] = args
  if (sub === 'yaml') {
    await cmdGraphYaml(subRest)
    return
  }
  if (sub === 'ingest') {
    await cmdGraphIngest(subRest)
    return
  }
  if (sub === 'snapshot') {
    await cmdGraphSnapshot(subRest)
    return
  }
  if (sub === 'axioms') {
    await cmdGraphAxioms(subRest)
    return
  }
  fail(`graph 子命令未知: ${sub ?? '(空)'}`)
}

async function cmdGraphYaml(args: string[]): Promise<void> {
  const [action, ...actionRest] = args
  if (action !== 'compile' && action !== 'check' && action !== 'export') {
    fail(`graph yaml 动作未知: ${action ?? '(空)'}`)
  }
  const all = actionRest.includes('--all')
  const noRecursive = actionRest.includes('--no-recursive')
  let rest = actionRest.filter((a) => a !== '--all' && a !== '--no-recursive')
  const recursive = !noRecursive
  const { value: graphId, rest: r1 } = takeOption(rest, '--graph-id')
  rest = r1
  const { value: inputArg, rest: r2 } = takeOption(rest, '--input')
  rest = r2
  const { value: outputArg, rest: r3 } = takeOption(rest, '--output')
  rest = r3
  const { value: graphJsonArg, rest: r4 } = takeOption(rest, '--graph-json')
  rest = r4
  const { value: outArg, rest: r5 } = takeOption(rest, '--out')
  rest = r5
  const { value: targetArg, rest: r6 } = takeOption(rest, '--target')
  rest = r6
  if (rest.length > 0) fail(`graph yaml ${action} 未知参数: ${rest.join(' ')}`)
  const cwd = resolveTarget(process.cwd(), targetArg)
  const inputRoot = inputArg ? path.resolve(process.cwd(), inputArg) : path.resolve(cwd, 'docs', '_tech_graph')
  if (action === 'export') {
    if (all || graphId) fail('graph yaml export 不使用 --all / --graph-id；请用 --input [--out]')
    try {
      const outPath = outArg ? path.resolve(process.cwd(), outArg) : null
      const { outPath: written } = exportGraphJson(inputRoot, { outPath, recursive })
      console.log(`Exported: ${written}`)
      return
    } catch (err) {
      if (err instanceof GraphYamlError) {
        console.error(err.message)
        fail('', 1)
      }
      throw err
    }
  }
  if (!all && !graphId) fail('须指定 --graph-id ID 或 --all')
  const graphJsonPath = resolveGraphJsonPath(
    inputRoot,
    graphJsonArg ? path.resolve(process.cwd(), graphJsonArg) : null,
  )
  try {
    if (action === 'compile') {
      if (all) {
        const ids = allGraphIds(inputRoot, { recursive })
        if (ids.length === 0) {
          console.log('未找到 *.graph.yaml')
          return
        }
        for (const id of ids) {
          const out = compileGraph(id, inputRoot)
          console.log(`Generated: ${out}`)
        }
      } else {
        const out = compileGraph(graphId as string, inputRoot, outputArg ? path.resolve(process.cwd(), outputArg) : null)
        console.log(`Generated: ${out}`)
      }
      return
    }
    if (all) {
      const ids = allGraphIds(inputRoot, { recursive })
      if (ids.length === 0) {
        console.log('未找到 *.graph.yaml')
        return
      }
      let failed = false
      for (const id of ids) {
        const result = checkGraph(id, inputRoot, graphJsonPath)
        if (result.ok) console.log(`OK: ${id}`)
        else {
          failed = true
          console.error(`ERROR: ${id}\n${result.diff}`)
        }
      }
      if (failed) fail('graph yaml check 发现差异')
      return
    }
    const result = checkGraph(graphId as string, inputRoot, graphJsonPath)
    if (result.ok) console.log(`OK: YAML matches graph.json ${graphId} slice`)
    else {
      console.error(`ERROR: Diff detected for ${graphId}:\n${result.diff}`)
      fail('graph yaml check 发现差异')
    }
  } catch (err) {
    if (err instanceof GraphYamlError) {
      console.error(err.message)
      fail('', 1)
    }
    throw err
  }
}

async function cmdGraphIngest(args: string[]): Promise<void> {
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: actor, rest: r2 } = takeOption(rest, '--actor')
  rest = r2
  const dryRun = rest.includes('--dry-run')
  rest = rest.filter((a) => a !== '--dry-run')
  if (rest.length > 0) fail(`graph ingest 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const result = ingestRepoIdempotent(target, { actor: actor || 'system', source: 'cli', dryRun })
  console.log(`目标: ${target}`)
  console.log(`新事件: ${result.count}`)
  console.log(`跳过（已存在）: ${result.skipped}`)
  if (dryRun) console.log('mode: dry-run（未写入）')
}

async function cmdGraphSnapshot(args: string[]): Promise<void> {
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`graph snapshot 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const events = loadEvents(target)
  const snapshot = buildSnapshot(events)
  const out = writeSnapshot(target, snapshot)
  console.log(`events: ${events.length}`)
  console.log(`nodes: ${Object.keys(snapshot.nodes).length}`)
  console.log(`edges: ${snapshot.edges.length}`)
  console.log(`snapshot: ${out}`)
}

async function cmdGraphAxioms(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (sub !== 'check') fail(`graph axioms 动作未知: ${sub ?? '(空)'}`)
  let remaining = rest
  const { value: targetArg, rest: r1 } = takeOption(remaining, '--target')
  remaining = r1
  const json = remaining.includes('--json')
  remaining = remaining.filter((a) => a !== '--json')
  if (remaining.length > 0) fail(`graph axioms check 未知参数: ${remaining.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const events = loadEvents(target)
  const snapshot = buildSnapshot(events)
  const result = checkAxioms(snapshot, events)
  if (json) console.log(JSON.stringify(result, null, 2))
  else {
    console.log(`axioms: ${result.ok ? 'PASS' : 'FAIL'}`)
    console.log(`violations: ${result.violations.length}`)
    for (const v of result.violations) {
      console.log(`  [${v.axiom}/${v.severity}] ${v.message}`)
    }
  }
  if (!result.ok) fail('HGM axioms 未通过', 2)
}
