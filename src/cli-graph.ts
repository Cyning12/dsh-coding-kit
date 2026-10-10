import { existsSync } from 'node:fs'
import path from 'node:path'
import { fail, packageRoot, printJson, resolveTarget, takeOption, toRel } from './cli-shared.ts'
import {
  checkHgmAgainstTbox,
  checkOntologyFile,
  HGM_ONTOLOGY_SHAPES,
  type HgmOntologyReport,
  loadOntologyDocument,
  ONTOLOGY_CHECK_PROFILE,
  OntologyCheckError,
} from './cli-graph-ontology.ts'
import {
  allGraphIds,
  checkGraph,
  compileGraph,
  exportGraphJson,
  GRAPH_VOCAB_CONFIG_REL,
  GraphYamlError,
  loadTechGraphVocab,
  resolveGraphJsonPath,
} from './cli-graph-yaml.ts'
import {
  buildSnapshot,
  checkAxioms,
  ingestRepoIdempotent,
  loadEvents,
  writeSnapshot,
} from './cli-graph-hgm.ts'
import { cmdGraphScaffold } from './cli-graph-scaffold.ts'
import { cmdGraphDrift } from './cli-graph-drift.ts'
import { cmdGraphIb } from './cli-graph-ib.ts'

export async function cmdGraph(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx spec-wave graph <子命令> [选项]

子命令:
  graph yaml compile --graph-id ID [--target PATH] [--input DIR] [--output FILE]
  graph yaml compile --all [--target PATH] [--input DIR] [--no-recursive]
  graph yaml check --graph-id ID [--target PATH] [--input DIR] [--graph-json FILE]
  graph yaml export --input DIR [--out FILE] [--no-recursive]
  graph scaffold [--target PATH] [--input DIR] [--stack auto|node|python]
                 [--mode full|struct-only] [--strict] [--dry-run|--yes]
                 [--overwrite-draft] [--no-compile]
                 （生成 docs/_tech_graph 可审草稿 · 非已签收真值）
  graph ingest [--target PATH] [--actor ACTOR] [--dry-run]
  graph snapshot [--target PATH]
  graph axioms check [--target PATH] [--json]
  graph ontology check [--file PATH] [--json]
  graph ontology check --hgm [--target PATH] [--file PATH] [--json]
  graph drift [--target PATH] [--input DIR] [--json]
                 （漂移闸 · 只报告不重画 · 模块覆盖 + 边锚点消失）
  graph ib check [--target PATH] [--input DIR] [--json]
                 （点路径闸 · nodes[].implementedBy.path 存在性 · 无 AST）
  graph vocab show [--target PATH] [--json]
                 （诊断合并后词表 · 内置 + 可选 .spec-wave/graph-vocab.yaml）
`)
    return
  }
  const [sub, ...subRest] = args
  if (sub === 'yaml') {
    await cmdGraphYaml(subRest)
    return
  }
  if (sub === 'scaffold') {
    await cmdGraphScaffold(subRest)
    return
  }
  if (sub === 'drift') {
    await cmdGraphDrift(subRest)
    return
  }
  if (sub === 'ib') {
    await cmdGraphIb(subRest)
    return
  }
  if (sub === 'vocab') {
    await cmdGraphVocab(subRest)
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
  if (sub === 'ontology') {
    await cmdGraphOntology(subRest)
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
  const vocabOpts = { targetRoot: cwd }
  if (action === 'export') {
    if (all || graphId) fail('graph yaml export 不使用 --all / --graph-id；请用 --input [--out]')
    try {
      const outPath = outArg ? path.resolve(process.cwd(), outArg) : null
      const { outPath: written } = exportGraphJson(inputRoot, { outPath, recursive, ...vocabOpts })
      console.log(`Exported: ${written}`)
      return
    } catch (err) {
      if (err instanceof GraphYamlError) {
        console.error(err.message)
        fail('', err.exitCode)
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
          const out = compileGraph(id, inputRoot, null, vocabOpts)
          console.log(`Generated: ${out}`)
        }
      } else {
        const out = compileGraph(
          graphId as string,
          inputRoot,
          outputArg ? path.resolve(process.cwd(), outputArg) : null,
          vocabOpts,
        )
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
        const result = checkGraph(id, inputRoot, graphJsonPath, vocabOpts)
        if (result.ok) console.log(`OK: ${id}`)
        else {
          failed = true
          console.error(`ERROR: ${id}\n${result.diff}`)
        }
      }
      if (failed) fail('graph yaml check 发现差异')
      return
    }
    const result = checkGraph(graphId as string, inputRoot, graphJsonPath, vocabOpts)
    if (result.ok) console.log(`OK: YAML matches graph.json ${graphId} slice`)
    else {
      console.error(`ERROR: Diff detected for ${graphId}:\n${result.diff}`)
      fail('graph yaml check 发现差异')
    }
  } catch (err) {
    if (err instanceof GraphYamlError) {
      console.error(err.message)
      fail('', err.exitCode)
    }
    throw err
  }
}

/** 3.1 W4 · 可选诊断：展示内置 + 仓级合并后的 kinds / edge_types */
async function cmdGraphVocab(args: string[]): Promise<void> {
  const [action, ...actionRest] = args
  if (action !== 'show') {
    fail(`graph vocab 动作未知: ${action ?? '(空)'}（支持: show）`)
  }
  let rest = actionRest
  const json = rest.includes('--json')
  rest = rest.filter((a) => a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`graph vocab show 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  let vocab
  try {
    vocab = loadTechGraphVocab(target)
  } catch (err) {
    if (err instanceof GraphYamlError) {
      console.error(err.message)
      fail('', err.exitCode)
    }
    throw err
  }
  const repoPath = path.join(target, GRAPH_VOCAB_CONFIG_REL)
  const report = {
    command: 'graph vocab show',
    target: toRel(process.cwd(), target),
    repo_vocab: existsSync(repoPath) ? GRAPH_VOCAB_CONFIG_REL : '(none)',
    kinds: vocab.kinds.map((id) => ({ id, class: vocab.kindToClass[id] })),
    edge_types: vocab.edgeTypes,
  }
  if (json) {
    printJson(target, report)
    return
  }
  console.log(`target: ${report.target}`)
  console.log(`repo_vocab: ${report.repo_vocab}`)
  console.log(`kinds (${report.kinds.length}):`)
  for (const k of report.kinds) console.log(`  - ${k.id} → ${k.class}`)
  console.log(`edge_types (${report.edge_types.length}):`)
  for (const t of report.edge_types) console.log(`  - ${t}`)
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
  console.log(`目标: ${toRel(process.cwd(), target)}`) // C3（2.2-W2）：目标打印相对化
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

// 3.0 W3 · S4.1：graph ontology check [--file PATH] [--json] —— 对 assets/ontology.yaml（--file 缺省 =
// 包内件 · 显式给出则校验该文件 · 负向 fixture/消费者自查共用入口 · 校验器开放 ≠ 本体内容开放）跑
// SHACL 语义子集校验。exit 语义（fail-closed）：conforms → 0；任一 Violation → 2 逐行点名
// （`shape @ where :: message` · 与探针输出同源）；仅 Warning/Info → 0（报告含警示行）；
// 不可读/解析失败 → 2（F-W3-01）。
async function cmdGraphOntology(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (sub !== 'check') fail(`graph ontology 动作未知: ${sub ?? '(空)'}`)
  let remaining = rest
  const { value: fileArg, rest: r1 } = takeOption(remaining, '--file')
  remaining = r1
  // 3.0-W3 S4.5-2：--hgm = HGM 全量适配面（事件轨 → buildSnapshot → 快照 ⊆ TBox 实例校验）
  const hgm = remaining.includes('--hgm')
  remaining = remaining.filter((a) => a !== '--hgm')
  const { value: targetArg, rest: r2 } = takeOption(remaining, '--target')
  remaining = r2
  const json = remaining.includes('--json')
  remaining = remaining.filter((a) => a !== '--json')
  if (remaining.length > 0) fail(`graph ontology check 未知参数: ${remaining.join(' ')}`)
  const file = fileArg
    ? path.resolve(process.cwd(), fileArg)
    : path.join(packageRoot(), 'assets', 'ontology.yaml')
  if (hgm) {
    await graphOntologyCheckHgm(file, targetArg, json)
    return
  }
  if (targetArg) fail('graph ontology check：--target 仅与 --hgm 同用')
  let report
  try {
    report = checkOntologyFile(file)
  } catch (err) {
    if (err instanceof OntologyCheckError) fail(err.message, 2)
    throw err
  }
  if (json) {
    printJson(process.cwd(), report)
  } else {
    console.log(`ontology: ${toRel(process.cwd(), file)}`)
    console.log(`profile: ${report.profile}（SHACL 语义子集 · 不声称标准合规）`)
    console.log(
      `形状数: ${report.shapes.length} · 实体: classes=${report.entities.classes} ` +
        `relations=${report.entities.relations} axioms=${report.entities.axioms} gates=${report.entities.gates}`,
    )
    console.log(`conforms: ${report.conforms}`)
    for (const v of report.violations) {
      console.log(`  [${v.severity.toUpperCase()}] ${v.shape} @ ${v.where} :: ${v.message}`)
    }
  }
  const hard = report.violations.filter((v) => v.severity === 'Violation')
  if (hard.length > 0) fail(`ontology 校验未通过（Violation × ${hard.length}）`, 2)
}

// 3.0-W3 S4.5-2（F1 受限统一 · HGM 全量适配）：读 <target> 事件轨 → buildSnapshot（复用 cli-graph-hgm
// 不重写）→ 实例校验（node.kind ⊆ TBox classes · edge.type ⊆ TBox relations 经单点映射表 · hat 词汇
// 前缀段归一 Warning 面 F-W3-09）。Violation → exit 2；仅 Warning → exit 0（警示行点名不静默）。
// 零 breaking：纯新增校验面 · graph axioms check / graph snapshot 输出与 exit 语义零变更。
async function graphOntologyCheckHgm(
  file: string,
  targetArg: string | undefined,
  json: boolean,
): Promise<void> {
  const target = resolveTarget(process.cwd(), targetArg)
  let ontologyDoc
  try {
    ontologyDoc = loadOntologyDocument(file)
  } catch (err) {
    if (err instanceof OntologyCheckError) fail(err.message, 2)
    throw err
  }
  const events = loadEvents(target)
  const snapshot = buildSnapshot(events)
  const violations = checkHgmAgainstTbox(snapshot, ontologyDoc)
  const report: HgmOntologyReport = {
    command: 'graph ontology check --hgm',
    ontology: file,
    target,
    profile: ONTOLOGY_CHECK_PROFILE,
    shapes: [...HGM_ONTOLOGY_SHAPES],
    entities: { nodes: Object.keys(snapshot.nodes).length, edges: snapshot.edges.length },
    conforms: violations.filter((v) => v.severity === 'Violation').length === 0,
    violations,
  }
  if (json) {
    printJson(process.cwd(), report)
  } else {
    console.log(`ontology: ${toRel(process.cwd(), file)}`)
    console.log(`target: ${toRel(process.cwd(), target)}`)
    console.log(`profile: ${report.profile}（HGM 实例 ⊆ TBox · SHACL 语义子集 · 不声称标准合规）`)
    console.log(
      `形状数: ${report.shapes.length} · 实体: nodes=${report.entities.nodes} edges=${report.entities.edges}`,
    )
    console.log(`conforms: ${report.conforms}`)
    for (const v of report.violations) {
      console.log(`  [${v.severity.toUpperCase()}] ${v.shape} @ ${v.where} :: ${v.message}`)
    }
  }
  const hard = violations.filter((v) => v.severity === 'Violation')
  if (hard.length > 0) fail(`HGM 实例校验未通过（Violation × ${hard.length}）`, 2)
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
  if (json) printJson(target, result)
  else {
    console.log(`axioms: ${result.ok ? 'PASS' : 'FAIL'}`)
    console.log(`violations: ${result.violations.length}`)
    for (const v of result.violations) {
      console.log(`  [${v.axiom}/${v.severity}] ${v.message}`)
    }
  }
  if (!result.ok) fail('HGM axioms 未通过', 2)
}
