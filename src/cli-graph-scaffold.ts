/**
 * 3.1 W1 · graph scaffold — 业务仓可审草稿脚手架。
 * 产品钉：SPEC docs/spec/3_1-tech-graph-scaffold/ · task 3-1-w1-graph-scaffold
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fail, packageRoot, resolveTarget, takeOption, toRel } from './cli-shared.ts'
import { allGraphIds, compileGraph } from './cli-graph-yaml.ts'

/** 浅扫：最大目录深度（仓根 = 0） */
export const SCAN_MAX_DEPTH = 4
/** 浅扫：最大打开文件数 */
export const SCAN_MAX_FILES = 200
/** 主流程最大节点数 */
export const FLOW_MAX_NODES = 16

export const DRAFT_MARKER = 'scaffold_status: draft'
export const CHECKLIST_NAME = 'REVIEW_CHECKLIST.md'

const MODULE_DIR_CANDIDATES = [
  'src',
  'app',
  'api',
  'lib',
  'server',
  'web',
  'backend',
  'frontend',
  'packages',
  'services',
] as const

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go'])

type Stack = 'auto' | 'node' | 'python'
type Mode = 'full' | 'struct-only'

export type ModuleRow = {
  id: string
  name: string
  glob: string
  hits: number
}

export type ScaffoldPlan = {
  target: string
  inputRoot: string
  mode: Mode
  stack: Stack
  detectedStack: 'node' | 'python' | 'unknown'
  modules: ModuleRow[]
  entryPath: string | null
  flowNodes: { id: string; label: string; path: string | null }[]
  truncated: { depth: boolean; files: boolean; nodes: boolean }
  filesToWrite: string[]
  warnings: string[]
}

function hasDraftMarker(content: string): boolean {
  return content.includes(DRAFT_MARKER)
}

function listTopDirs(root: string): string[] {
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map((d) => d.name)
}

function countGlobHits(root: string, globPat: string): number {
  // 仅支持 `dir/**` / `dir/*` 形态
  const base = globPat.replace(/\/\*\*?$/, '').replace(/\/\*$/, '')
  const abs = path.join(root, base)
  if (!existsSync(abs)) return 0
  let n = 0
  const walk = (dir: string, depth: number) => {
    if (n >= 50) return
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules') continue
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        if (depth < 6) walk(full, depth + 1)
      } else {
        n += 1
        if (n >= 50) return
      }
    }
  }
  const st = statSync(abs)
  if (st.isFile()) return 1
  walk(abs, 0)
  return n
}

function detectStack(root: string, hint: Stack): 'node' | 'python' | 'unknown' {
  if (hint === 'node') return 'node'
  if (hint === 'python') return 'python'
  if (existsSync(path.join(root, 'package.json'))) return 'node'
  if (
    existsSync(path.join(root, 'pyproject.toml')) ||
    existsSync(path.join(root, 'requirements.txt')) ||
    existsSync(path.join(root, 'setup.py'))
  ) {
    return 'python'
  }
  return 'unknown'
}

function findEntry(root: string, stack: 'node' | 'python' | 'unknown'): string | null {
  const candidates =
    stack === 'python'
      ? ['main.py', 'app.py', 'src/main.py', 'api/main.py']
      : [
          'src/index.ts',
          'src/index.js',
          'src/main.ts',
          'src/main.js',
          'app/page.tsx',
          'app/page.ts',
          'index.ts',
          'index.js',
          'main.py',
        ]
  if (stack === 'node' || stack === 'unknown') {
    const pkgPath = path.join(root, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { main?: string }
        if (pkg.main && typeof pkg.main === 'string') {
          const rel = pkg.main.replace(/^\.\//, '')
          if (existsSync(path.join(root, rel))) return rel
        }
      } catch {
        /* ignore */
      }
    }
  }
  for (const c of candidates) {
    if (existsSync(path.join(root, c))) return c
  }
  return null
}

function inferModules(root: string): ModuleRow[] {
  const top = listTopDirs(root)
  const rows: ModuleRow[] = []
  for (const name of MODULE_DIR_CANDIDATES) {
    if (!top.includes(name)) continue
    if (name === 'packages') {
      const pkgRoot = path.join(root, 'packages')
      if (!existsSync(pkgRoot)) continue
      for (const sub of listTopDirs(pkgRoot).slice(0, 8)) {
        const id = sub.replace(/[^a-zA-Z0-9_]+/g, '_').toLowerCase() || 'pkg'
        const glob = `packages/${sub}/**`
        rows.push({
          id: id.slice(0, 32),
          name: sub,
          glob,
          hits: countGlobHits(root, glob),
        })
      }
      continue
    }
    const glob = `${name}/**`
    rows.push({
      id: name,
      name,
      glob,
      hits: countGlobHits(root, glob),
    })
  }
  if (rows.length === 0) {
    rows.push({
      id: 'app',
      name: '应用（探测失败占位）',
      glob: 'src/**',
      hits: countGlobHits(root, 'src/**'),
    })
  }
  return rows.slice(0, 12)
}

type ScanState = {
  filesSeen: number
  truncatedFiles: boolean
  truncatedDepth: boolean
  codeFiles: string[]
}

function shallowScan(root: string): ScanState {
  const state: ScanState = {
    filesSeen: 0,
    truncatedFiles: false,
    truncatedDepth: false,
    codeFiles: [],
  }
  const walk = (dir: string, depth: number) => {
    if (state.truncatedFiles) return
    if (depth > SCAN_MAX_DEPTH) {
      state.truncatedDepth = true
      return
    }
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (state.truncatedFiles) return
      if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') {
        continue
      }
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(full, depth + 1)
      } else {
        state.filesSeen += 1
        if (state.filesSeen > SCAN_MAX_FILES) {
          state.truncatedFiles = true
          return
        }
        const ext = path.extname(ent.name)
        if (CODE_EXT.has(ext)) {
          state.codeFiles.push(path.relative(root, full).split(path.sep).join('/'))
        }
      }
    }
  }
  walk(root, 0)
  return state
}

function pickFlowNodes(
  entry: string | null,
  codeFiles: string[],
): { nodes: { id: string; label: string; path: string | null }[]; truncatedNodes: boolean } {
  const nodes: { id: string; label: string; path: string | null }[] = []
  nodes.push({
    id: 'IN',
    label: '入口',
    path: entry,
  })
  const handlerish = codeFiles.filter((f) =>
    /route|handler|controller|service|router|api|page\./i.test(f),
  )
  const pool = (handlerish.length > 0 ? handlerish : codeFiles).slice(0, FLOW_MAX_NODES - 2)
  let i = 0
  for (const f of pool) {
    i += 1
    nodes.push({
      id: `N${i}`,
      label: path.basename(f),
      path: f,
    })
  }
  nodes.push({ id: 'OUT', label: '出口 / 响应', path: null })
  const truncatedNodes = codeFiles.length + (handlerish.length ? 0 : 0) > FLOW_MAX_NODES - 2
    || handlerish.length > FLOW_MAX_NODES - 2
    || codeFiles.length > FLOW_MAX_NODES - 2
  return { nodes: nodes.slice(0, FLOW_MAX_NODES), truncatedNodes }
}

function collectExistingFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  const walk = (d: string) => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name)
      if (ent.isDirectory()) walk(full)
      else out.push(full)
    }
  }
  walk(dir)
  return out
}

function assertWritable(inputRoot: string, overwriteDraft: boolean, _plannedRelPaths: string[]): void {
  const existing = collectExistingFiles(inputRoot)
  if (existing.length === 0) return
  if (!overwriteDraft) {
    fail(
      `graph scaffold: 目标目录非空，拒写（加 --overwrite-draft 仅覆盖带草稿标记的文件）: ${toRel(process.cwd(), inputRoot)}`,
      2,
    )
  }
  const checklist = path.join(inputRoot, CHECKLIST_NAME)
  const scaffoldOwned =
    existsSync(checklist) && hasDraftMarker(readFileSync(checklist, 'utf8'))
  // 清单带草稿标记 ⇒ 整树视为脚手架产物（含 compile 生成的 *.md）
  if (scaffoldOwned) return
  for (const abs of existing) {
    const rel = path.relative(inputRoot, abs).split(path.sep).join('/')
    const body = readFileSync(abs, 'utf8')
    if (!hasDraftMarker(body)) {
      fail(`graph scaffold: --overwrite-draft 拒写无草稿标记文件: ${rel}`, 2)
    }
  }
}

function buildStructMd(modules: ModuleRow[]): string {
  const rows = modules
    .map((m) => `| \`${m.id}\` | ${m.name} | \`${m.glob}\` | → | 脚手架推断 · 命中 ${m.hits} |`)
    .join('\n')
  return `<!-- ${DRAFT_MARKER} -->
# 模块边界登记表（脚手架草稿）

> **用途**：一级模块边界；**HG-GRAPH-MODULES** approved 后方可 30 改码。  
> **状态**：草稿（${DRAFT_MARKER}）· 须人/Agent 审核后改 YAML/本表。

## 模块表（必填）

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
${rows}

### 填写规则

1. **module_id**：小写 snake_case；全仓唯一。
2. **路径 glob**：能覆盖该模块源码根。
3. **依赖方向**：只写出边。
4. **一级模块**：通常 3～12 行。

## 人签记录

| human_gate_id | status | 签核人 | 日期 | 说明 |
|---------------|--------|--------|------|------|
| HG-GRAPH-MODULES | pending | | | \`01_struct\` 模块表覆盖一级模块 · **脚手架不得自动 approved** |

## 关联

- 顶层图：[\`00_main.md\`](./00_main.md)
- 主 flow：[\`10_flow_MAIN.md\`](./10_flow_MAIN.md)（\`--mode struct-only\` 时可能尚未生成）
`
}

function buildMainYaml(entry: string | null, hasFlow: boolean): string {
  const entryPath = entry ?? 'TBD'
  const flowEdges = hasFlow
    ? `
  - from: "E"
    to: "FLOW_MAIN"
    mark: "::triggers"
    type: "triggers"
  - from: "FLOW_MAIN"
    to: "FLOW_DOC"
    label: "加载"`
    : ''
  return `# ${DRAFT_MARKER}
graph_id: "00_main"
title: "顶层流程总图（脚手架草稿）"
description: "由 graph scaffold 生成 · 须人/Agent 审核"
version: "scaffold-draft"

nodes:
  - id: "Q"
    label: "用户 / 客户端请求"
  - id: "E"
    label: "应用入口"
  - id: "M1"
    label: "核心业务处理"
  - id: "STRUCT_DOC"
    label: ">01_struct.md"${
      hasFlow
        ? `
  - id: "FLOW_MAIN"
    label: "主路径子流程"
  - id: "FLOW_DOC"
    label: ">10_flow_MAIN.md"`
        : ''
    }

edges:
  - from: "Q"
    to: "E"
    label: "->"
    anchors:
      - path: "${entryPath}"
  - from: "E"
    to: "M1"
    label: "->"
    anchors:
      - path: "${entryPath}"
  - from: "E"
    to: "STRUCT_DOC"
    label: "加载"${flowEdges}
`
}

function buildFlowYaml(
  nodes: { id: string; label: string; path: string | null }[],
): string {
  const nodeLines = nodes
    .map((n) => `  - id: "${n.id}"\n    label: ${JSON.stringify(n.label)}`)
    .join('\n')
  const edgeLines: string[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]!
    const b = nodes[i + 1]!
    const anchor =
      a.path != null
        ? `\n    anchors:\n      - path: "${a.path}"`
        : a.id === 'IN' && nodes[0]?.path
          ? `\n    anchors:\n      - path: "${nodes[0].path}"`
          : ''
    edgeLines.push(`  - from: "${a.id}"\n    to: "${b.id}"\n    label: "->"${anchor}`)
  }
  return `# ${DRAFT_MARKER}
graph_id: "10_flow_MAIN"
title: "主路径 Flow（脚手架草稿）"
description: "由 graph scaffold 浅扫生成 · 须人/Agent 审核"
version: "scaffold-draft"

nodes:
${nodeLines}

edges:
${edgeLines.join('\n')}
`
}

function buildPendingFlowsMd(modules: ModuleRow[]): string {
  return `<!-- ${DRAFT_MARKER} -->
# 待补流程清单（--mode struct-only）

脚手架未生成主流程 YAML。建议后续按模块增量补 \`10_flow_<slug>.graph.yaml\`：

${modules.map((m) => `- [ ] \`${m.id}\`（\`${m.glob}\`）`).join('\n')}
`
}

function buildChecklist(plan: ScaffoldPlan, packageVersion: string): string {
  const modLines = plan.modules
    .map(
      (m) =>
        `| \`${m.id}\` | \`${m.glob}\` | ${m.hits} | [ ] |`,
    )
    .join('\n')
  const tbd = [
    ...plan.flowNodes.filter((n) => n.path == null).map((n) => n.id),
    ...(plan.entryPath ? [] : ['入口未探测 → TBD']),
  ]
  const truncBits = [
    plan.truncated.depth ? '深度' : null,
    plan.truncated.files ? '文件数' : null,
    plan.truncated.nodes ? '节点数' : null,
  ].filter(Boolean)
  return `<!-- ${DRAFT_MARKER} -->
# 技术图谱脚手架 · 审核清单

> **状态**：草稿（${DRAFT_MARKER}）· **非**已签收架构真值  
> **HG-GRAPH-MODULES**：仍为 **pending**（仅人可签 · Agent 禁止代签）

## 元信息

| 项 | 值 |
|----|-----|
| 命令 | \`graph scaffold\` |
| 包版本 | ${packageVersion} |
| --mode | ${plan.mode} |
| --stack | ${plan.stack}（探测=${plan.detectedStack}） |
| 入口 | ${plan.entryPath ?? 'TBD'} |
| 浅扫上限 | 深度 ${SCAN_MAX_DEPTH} · 文件 ${SCAN_MAX_FILES} · 节点 ${FLOW_MAX_NODES} |
| 截断 | ${truncBits.length ? truncBits.join('、') + '（已截断）' : '无'} |

## 模块表

| module_id | glob | 命中文件数 | 人审 |
|-----------|------|------------|------|
${modLines}

## 主流程 / 待补

${
  plan.mode === 'struct-only'
    ? '- 模式 struct-only：见 \`PENDING_FLOWS.md\`\n'
    : plan.flowNodes.map((n) => `- \`${n.id}\` ${n.label}${n.path ? ` ← \`${n.path}\`` : ' ← TBD'}`).join('\n')
}

### 可疑 TBD / 缺口

${tbd.length ? tbd.map((t) => `- ${t}`).join('\n') : '- （无）'}

${plan.warnings.length ? `### 警告\n\n${plan.warnings.map((w) => `- ${w}`).join('\n')}` : ''}

## Agent 可跑项

\`\`\`text
npx spec-wave graph yaml compile --all --input docs/_tech_graph --target .
npx spec-wave graph yaml export --input docs/_tech_graph
npx spec-wave graph yaml check --all --input docs/_tech_graph
\`\`\`

期望：compile/export/check exit 0（或仅开放惯例 Warning）。

## 人签提示

1. 审模块表是否像真架构  
2. 审主路径是否像主业务  
3. 在 \`01_struct.md\` 人签表将 \`HG-GRAPH-MODULES\` → approved（**仅人**）
`
}

function readProtocol(): string {
  const p = path.join(packageRoot(), 'assets', 'graph', 'templates', '99_mermaid_protocol.md')
  if (!existsSync(p)) {
    fail(`graph scaffold: 缺少协议模板 ${p}`, 2)
  }
  return readFileSync(p, 'utf8')
}

function packageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot(), 'package.json'), 'utf8')) as {
      version?: string
    }
    return pkg.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export function buildScaffoldPlan(opts: {
  target: string
  inputRoot: string
  mode: Mode
  stack: Stack
}): ScaffoldPlan {
  const detectedStack = detectStack(opts.target, opts.stack)
  const modules = inferModules(opts.target)
  const entryPath = findEntry(opts.target, detectedStack)
  const scan = shallowScan(opts.target)
  const { nodes, truncatedNodes } = pickFlowNodes(entryPath, scan.codeFiles)
  const warnings: string[] = []
  if (!entryPath) warnings.push('未探测到入口文件 · 锚点将标 TBD')
  if (modules.every((m) => m.hits === 0)) warnings.push('全部模块 glob 命中为 0')
  if (scan.filesSeen === 0) warnings.push('探测零信号 · 将写最小草稿')

  const filesToWrite = ['01_struct.md', CHECKLIST_NAME, '99_mermaid_protocol.md', '00_main.graph.yaml']
  if (opts.mode === 'full') filesToWrite.push('10_flow_MAIN.graph.yaml')
  else filesToWrite.push('PENDING_FLOWS.md')

  return {
    target: opts.target,
    inputRoot: opts.inputRoot,
    mode: opts.mode,
    stack: opts.stack,
    detectedStack,
    modules,
    entryPath,
    flowNodes: opts.mode === 'full' ? nodes : [],
    truncated: {
      depth: scan.truncatedDepth,
      files: scan.truncatedFiles,
      nodes: truncatedNodes,
    },
    filesToWrite,
    warnings,
  }
}

function runLightChecks(plan: ScaffoldPlan): string[] {
  const issues: string[] = []
  for (const m of plan.modules) {
    if (m.hits === 0) issues.push(`glob 零命中: ${m.id} (${m.glob})`)
  }
  if (plan.entryPath && plan.entryPath !== 'TBD') {
    if (!existsSync(path.join(plan.target, plan.entryPath))) {
      issues.push(`锚点 path 不存在: ${plan.entryPath}`)
    }
  }
  for (const n of plan.flowNodes) {
    if (n.path && n.path !== 'TBD' && !existsSync(path.join(plan.target, n.path))) {
      issues.push(`锚点 path 不存在: ${n.path}`)
    }
  }
  return issues
}

function writeOutputs(plan: ScaffoldPlan): void {
  mkdirSync(plan.inputRoot, { recursive: true })
  const hasFlow = plan.mode === 'full'
  writeFileSync(path.join(plan.inputRoot, '01_struct.md'), buildStructMd(plan.modules), 'utf8')
  writeFileSync(
    path.join(plan.inputRoot, '00_main.graph.yaml'),
    buildMainYaml(plan.entryPath, hasFlow),
    'utf8',
  )
  if (hasFlow) {
    writeFileSync(
      path.join(plan.inputRoot, '10_flow_MAIN.graph.yaml'),
      buildFlowYaml(plan.flowNodes),
      'utf8',
    )
  } else {
    writeFileSync(
      path.join(plan.inputRoot, 'PENDING_FLOWS.md'),
      buildPendingFlowsMd(plan.modules),
      'utf8',
    )
  }
  // 协议：原文 + 顶行草稿标记（便于 --overwrite-draft）
  const protocol = `<!-- ${DRAFT_MARKER} -->\n` + readProtocol()
  writeFileSync(path.join(plan.inputRoot, '99_mermaid_protocol.md'), protocol, 'utf8')
  writeFileSync(
    path.join(plan.inputRoot, CHECKLIST_NAME),
    buildChecklist(plan, packageVersion()),
    'utf8',
  )
}

export async function cmdGraphScaffold(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx spec-wave graph scaffold [选项]

选项:
  --target PATH              业务仓根（须 git 仓）
  --input DIR                输出目录（缺省 docs/_tech_graph）
  --stack auto|node|python   栈提示（缺省 auto）
  --mode full|struct-only    缺省 full
  --strict                   轻检不过 → exit 2
  --dry-run                  零写盘（与无 --yes 相同）
  --yes                      写盘
  --overwrite-draft          仅覆盖带草稿标记的文件
  --no-compile               写盘后不自动 compile

说明:
  无 --yes → dry-run（零写盘）。
  --yes 与 --dry-run 同现 → 用法错误 exit 1。
  产物为可审草稿，不是已签收架构真值；HG-GRAPH-MODULES 保持 pending。
`)
    return
  }

  const yes = args.includes('--yes')
  const dryRunFlag = args.includes('--dry-run')
  const strict = args.includes('--strict')
  const overwriteDraft = args.includes('--overwrite-draft')
  const noCompile = args.includes('--no-compile')
  let rest = args.filter(
    (a) =>
      a !== '--yes' &&
      a !== '--dry-run' &&
      a !== '--strict' &&
      a !== '--overwrite-draft' &&
      a !== '--no-compile',
  )

  if (yes && dryRunFlag) {
    fail('graph scaffold: --yes 与 --dry-run 互斥，不可同现', 1)
  }

  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: inputArg, rest: r2 } = takeOption(rest, '--input')
  rest = r2
  const { value: stackRaw, rest: r3 } = takeOption(rest, '--stack')
  rest = r3
  const { value: modeRaw, rest: r4 } = takeOption(rest, '--mode')
  rest = r4
  if (rest.length > 0) fail(`graph scaffold 未知参数: ${rest.join(' ')}`, 1)

  const stack = (stackRaw ?? 'auto') as Stack
  if (stack !== 'auto' && stack !== 'node' && stack !== 'python') {
    fail(`graph scaffold: --stack 须为 auto|node|python（收到: ${stackRaw}）`, 1)
  }
  const mode = (modeRaw ?? 'full') as Mode
  if (mode !== 'full' && mode !== 'struct-only') {
    fail(`graph scaffold: --mode 须为 full|struct-only（收到: ${modeRaw}）`, 1)
  }

  const target = resolveTarget(process.cwd(), targetArg, { requireGitRoot: true })
  // 禁止写入 S2
  const inputRoot = inputArg
    ? path.resolve(process.cwd(), inputArg)
    : path.resolve(target, 'docs', '_tech_graph')
  const relInput = toRel(target, inputRoot)
  for (const prefix of ['docs/tasks', 'docs/harness/reviews', 'docs/harness/invokes/by-task']) {
    if (relInput === prefix || relInput.startsWith(prefix + '/')) {
      fail(`graph scaffold: 禁止写入 S2 过程域: ${relInput}`, 2)
    }
  }

  const plan = buildScaffoldPlan({ target, inputRoot, mode, stack })
  const lightIssues = runLightChecks(plan)
  for (const w of lightIssues) {
    if (!plan.warnings.includes(w)) plan.warnings.push(w)
  }

  console.log(`graph scaffold · mode=${mode} · stack=${stack}/${plan.detectedStack}`)
  console.log(`target=${toRel(process.cwd(), target)} · input=${toRel(process.cwd(), inputRoot)}`)
  console.log(`将写入: ${plan.filesToWrite.join(', ')}`)
  console.log(
    `模块 ${plan.modules.length} 行 · 入口=${plan.entryPath ?? 'TBD'} · 流程节点=${plan.flowNodes.length}`,
  )
  if (plan.truncated.depth || plan.truncated.files || plan.truncated.nodes) {
    console.log(
      `浅扫截断: depth=${plan.truncated.depth} files=${plan.truncated.files} nodes=${plan.truncated.nodes}`,
    )
  }
  for (const w of plan.warnings) console.error(`[warning] ${w}`)

  const doWrite = yes
  if (!doWrite) {
    console.log('dry-run · 零写盘（加 --yes 写草稿）')
    if (strict && lightIssues.length > 0) {
      fail(`graph scaffold --strict: 轻检失败 ${lightIssues.length} 项`, 2)
    }
    return
  }

  assertWritable(inputRoot, overwriteDraft, plan.filesToWrite)
  writeOutputs(plan)
  console.log(`已写入草稿 → ${toRel(process.cwd(), inputRoot)}`)
  console.log(`审核清单: ${toRel(process.cwd(), path.join(inputRoot, CHECKLIST_NAME))}`)

  if (strict && lightIssues.length > 0) {
    fail(`graph scaffold --strict: 轻检失败 ${lightIssues.length} 项（草稿已写入）`, 2)
  }

  if (!noCompile) {
    // struct-only：仍 compile 00_main；full：compile all
    try {
      const ids = allGraphIds(inputRoot, { recursive: true })
      for (const id of ids) {
        const out = compileGraph(id, inputRoot)
        console.log(`compile: ${toRel(process.cwd(), out)}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      fail(`graph scaffold: 自动 compile 失败: ${msg}`, 2)
    }
  }
}
