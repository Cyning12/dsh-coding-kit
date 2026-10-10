import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { packageRoot } from './cli-shared.ts'
import { yamlLoad } from './yaml.ts'

export const SCHEMA_VERSION = 'inform_graph.v3'
const FREEZE_ID = 'TECH_GRAPH_S2_FREEZE_20260519_V2_3'
const DEFAULT_SKIP_DIRS = new Set(['node_modules', '.git', 'shared'])

export class GraphYamlError extends Error {
  readonly filePath: string | null
  readonly line: number | null
  /** 仓级词表坏档/冲突用 2；其余默认 1（与既有 GraphYamlError 面兼容） */
  readonly exitCode: number
  constructor(
    message: string,
    opts: { path?: string | null; line?: number | null; exitCode?: number } = {},
  ) {
    super(message)
    this.name = 'GraphYamlError'
    this.filePath = opts.path ?? null
    this.line = opts.line ?? null
    this.exitCode = opts.exitCode ?? 1
  }
}

/** 3.2 W1：可选 IB；缺省无 IB 的旧图零回归。symbol 透传不做 AST。 */
type YamlNode = {
  id?: string
  label?: string
  kind?: string
  implementedBy?: { path?: string; symbol?: string }
}
type YamlEdge = {
  from?: string
  to?: string
  mark?: string
  type?: string
  label?: string
  anchors?: { path?: string; symbol?: string; line?: number }[]
}
type YamlGraph = {
  graph_id?: string
  title?: string
  description?: string
  version?: string
  direction?: string
  schema_version?: string
  notes?: unknown
  nodes?: YamlNode[]
  edges?: YamlEdge[]
}

// 3.0-W3 S4.5-3（F1 受限统一 · tech-graph 浅登记）：kind 枚举 / kind→class 映射 / 边型词表的唯一加载点 =
// 内置 assets/tech-graph-vocab.yaml（tech: namespace 表现层词汇登记档 · 非产品本体类 · F-W3-10）
// + 可选仓级 `.spec-wave/graph-vocab.yaml` 合并（3.1 W4 · F-1② · 缺省无文件 = 3.0.2 仅内置）。
// 本函数是 src 内唯一加载点（单源校验 · 验收 #6 grep 断言锚）；原 kind 硬编码枚举（validateGraphYaml）
// 与 KIND_TO_CLASS（generateMermaid · 20 审 R1-A3 点名的第二硬拷贝）双硬拷贝已同迁本档。
// 内置档坏 = 随包资产损坏 → GraphYamlError fail-loud（不静默回退硬拷贝 —— 回退即双份真值回潮）。
// 仓级档坏 / kinds 冲突 → exitCode 2 · 点名路径/键。
export const GRAPH_VOCAB_CONFIG_REL = '.spec-wave/graph-vocab.yaml'

type TechGraphVocab = {
  kinds: string[]
  kindToClass: Record<string, 'phase' | 'doc' | 'infra'>
  edgeTypes: string[]
}

const MERMAID_CLASSES = ['phase', 'doc', 'infra'] as const

/** cache key：无 target → builtin；有 target → 绝对路径（防跨仓串味） */
const techGraphVocabCache = new Map<string, TechGraphVocab>()

function parseBuiltinVocab(): TechGraphVocab {
  const file = path.join(packageRoot(), 'assets', 'tech-graph-vocab.yaml')
  let doc: unknown
  try {
    doc = yamlLoad(readFileSync(file, 'utf8'))
  } catch (err) {
    throw new GraphYamlError(`tech-graph-vocab.yaml 不可读或解析失败: ${(err as Error).message}`, { path: file })
  }
  const d = (doc ?? {}) as { version?: unknown; kinds?: unknown; edge_types?: unknown }
  const kinds: string[] = []
  const kindToClass: Record<string, 'phase' | 'doc' | 'infra'> = {}
  for (const [i, k] of (Array.isArray(d.kinds) ? d.kinds : []).entries()) {
    const entry = (k ?? {}) as { id?: unknown; class?: unknown }
    if (typeof entry.id !== 'string' || !entry.id) {
      throw new GraphYamlError(`tech-graph-vocab.yaml 校验失败: kinds[${i}] 缺 id`, { path: file })
    }
    if (typeof entry.class !== 'string' || !(MERMAID_CLASSES as readonly string[]).includes(entry.class)) {
      throw new GraphYamlError(`tech-graph-vocab.yaml 校验失败: kinds[${i}].class 非法: ${String(entry.class)}`, {
        path: file,
      })
    }
    kinds.push(entry.id)
    kindToClass[entry.id] = entry.class as 'phase' | 'doc' | 'infra'
  }
  const edgeTypes = Array.isArray(d.edge_types) ? d.edge_types.map(String) : []
  if (d.version !== '1' || kinds.length === 0 || edgeTypes.length === 0) {
    throw new GraphYamlError('tech-graph-vocab.yaml 校验失败: 缺 version:"1"/kinds/edge_types', { path: file })
  }
  return { kinds, kindToClass, edgeTypes }
}

function mergeRepoVocab(builtin: TechGraphVocab, targetRoot: string): TechGraphVocab {
  const abs = path.join(targetRoot, GRAPH_VOCAB_CONFIG_REL)
  if (!existsSync(abs)) return builtin

  let doc: unknown
  try {
    doc = yamlLoad(readFileSync(abs, 'utf8'))
  } catch (err) {
    throw new GraphYamlError(
      `仓级词表 YAML 坏: ${GRAPH_VOCAB_CONFIG_REL} · ${(err as Error).message}`,
      { path: abs, exitCode: 2 },
    )
  }
  if (doc == null || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new GraphYamlError(`仓级词表 schema 非法（根须为 object）: ${GRAPH_VOCAB_CONFIG_REL}`, {
      path: abs,
      exitCode: 2,
    })
  }
  const d = doc as { version?: unknown; kinds?: unknown; edge_types?: unknown }
  if (d.version != null && d.version !== 1 && d.version !== '1') {
    throw new GraphYamlError(`仓级词表 version 须为 1: ${GRAPH_VOCAB_CONFIG_REL}`, {
      path: abs,
      exitCode: 2,
    })
  }

  const kindToClass: Record<string, 'phase' | 'doc' | 'infra'> = { ...builtin.kindToClass }
  const kinds = [...builtin.kinds]
  if (d.kinds != null) {
    if (!Array.isArray(d.kinds)) {
      throw new GraphYamlError(`仓级词表 kinds 须为 array: ${GRAPH_VOCAB_CONFIG_REL}`, {
        path: abs,
        exitCode: 2,
      })
    }
    for (const [i, k] of d.kinds.entries()) {
      const entry = (k ?? {}) as { id?: unknown; class?: unknown }
      if (typeof entry.id !== 'string' || !entry.id) {
        throw new GraphYamlError(`仓级词表校验失败: kinds[${i}] 缺 id: ${GRAPH_VOCAB_CONFIG_REL}`, {
          path: abs,
          exitCode: 2,
        })
      }
      if (typeof entry.class !== 'string' || !(MERMAID_CLASSES as readonly string[]).includes(entry.class)) {
        throw new GraphYamlError(
          `仓级词表校验失败: kinds[${i}].class 非法: ${String(entry.class)}: ${GRAPH_VOCAB_CONFIG_REL}`,
          { path: abs, exitCode: 2 },
        )
      }
      const cls = entry.class as 'phase' | 'doc' | 'infra'
      const existing = kindToClass[entry.id]
      if (existing != null && existing !== cls) {
        throw new GraphYamlError(
          `仓级词表与内置冲突: kinds id=${entry.id} class 内置=${existing} 仓级=${cls}: ${GRAPH_VOCAB_CONFIG_REL}`,
          { path: abs, exitCode: 2 },
        )
      }
      if (existing == null) {
        kinds.push(entry.id)
        kindToClass[entry.id] = cls
      }
    }
  }

  const edgeSet = new Set(builtin.edgeTypes)
  if (d.edge_types != null) {
    if (!Array.isArray(d.edge_types) || !d.edge_types.every((x) => typeof x === 'string')) {
      throw new GraphYamlError(`仓级词表 edge_types 须为 string[]: ${GRAPH_VOCAB_CONFIG_REL}`, {
        path: abs,
        exitCode: 2,
      })
    }
    for (const t of d.edge_types as string[]) edgeSet.add(t)
  }

  return { kinds, kindToClass, edgeTypes: [...edgeSet] }
}

/**
 * 加载 tech-graph 词表。
 * @param targetRoot 消费仓根；传入且存在 `.spec-wave/graph-vocab.yaml` 则与内置合并。
 *                   缺省 / 无文件 → 仅内置（= 3.0.2 行为）。
 */
export function loadTechGraphVocab(targetRoot?: string | null): TechGraphVocab {
  const key = targetRoot ? path.resolve(targetRoot) : ''
  const hit = techGraphVocabCache.get(key)
  if (hit) return hit
  const builtinKey = ''
  let builtin = techGraphVocabCache.get(builtinKey)
  if (!builtin) {
    builtin = parseBuiltinVocab()
    techGraphVocabCache.set(builtinKey, builtin)
  }
  if (!targetRoot) return builtin
  const merged = mergeRepoVocab(builtin, path.resolve(targetRoot))
  techGraphVocabCache.set(key, merged)
  return merged
}

// 校验钩②（S4.5-3 · Warning 级新增 · 不咬 exit）：显式 edges[].type ∉ 登记档 edge_types → Warning 行。
// 表现层开放惯例保留（::label 派生自定义 type 合法 · edgeToGraphV2）—— 登记 ≠ 封闭，浅登记只把隐式枚举变显式。
export function collectTechVocabWarnings(
  data: YamlGraph,
  filePath: string | null = null,
  targetRoot?: string | null,
): string[] {
  const { edgeTypes } = loadTechGraphVocab(targetRoot)
  const warnings: string[] = []
  for (const [i, e] of (data.edges ?? []).entries()) {
    if (e == null || typeof e !== 'object' || Array.isArray(e)) continue
    if (e.type && !edgeTypes.includes(e.type)) {
      warnings.push(
        `edges[${i}].type 未在 tech-graph 词汇登记档（tech: namespace）: ${e.type}（表现层开放惯例 · Warning 不咬 exit）`,
      )
    }
  }
  return filePath ? warnings.map((w) => `${filePath}: ${w}`) : warnings
}

function printTechVocabWarnings(data: YamlGraph, filePath: string, targetRoot?: string | null): void {
  for (const w of collectTechVocabWarnings(data, filePath, targetRoot)) console.error(`[warning] ${w}`)
}

export function loadYaml(filePath: string): YamlGraph {
  const raw = readFileSync(filePath, 'utf8')
  try {
    return yamlLoad(raw) as YamlGraph
  } catch (err) {
    const e = err as { message?: string; mark?: { line?: number } }
    const line = e.mark?.line != null ? e.mark.line + 1 : null
    throw new GraphYamlError(`YAML 解析失败: ${e.message ?? String(err)}`, { path: filePath, line })
  }
}

export function validateGraphYaml(
  data: YamlGraph | null | undefined,
  filePath: string | null = null,
  targetRoot?: string | null,
): string[] {
  const errors: string[] = []
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('根节点须为 object')
    return errors
  }
  const required = ['graph_id', 'title', 'nodes', 'edges'] as const
  for (const key of required) {
    if (!(key in data)) errors.push(`缺少必填字段: ${key}`)
  }
  if (data.schema_version != null && data.schema_version !== SCHEMA_VERSION) {
    errors.push(`schema_version 建议为 ${SCHEMA_VERSION}，实际为 ${data.schema_version}`)
  }
  // DEF-032③：声明值（data.graph_id）为 graph_id 唯一真值源，须为裸 slug（禁 /）；
  // 路径命名空间 id（如 l0/00_main）仅作输入兼容定位（allGraphIds / --graph-id），不参与校验与输出。
  if (data.graph_id != null && !/^[a-zA-Z0-9_]+$/.test(String(data.graph_id))) {
    errors.push(`graph_id 非法: ${data.graph_id}`)
  }
  if (data.nodes != null) {
    if (!Array.isArray(data.nodes)) errors.push('nodes 须为 array')
    else {
      const seen = new Set<string>()
      const vocabKinds = loadTechGraphVocab(targetRoot).kinds
      data.nodes.forEach((n, i) => {
        if (n == null || typeof n !== 'object' || Array.isArray(n)) {
          errors.push(`nodes[${i}] 须为 object`)
          return
        }
        if (!n.id) errors.push(`nodes[${i}] 缺少 id`)
        else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(n.id))) {
          errors.push(`nodes[${i}].id 非法: ${n.id}`)
        }
        if (!n.label) errors.push(`nodes[${i}] 缺少 label`)
        if (n.id && seen.has(n.id)) errors.push(`重复节点 id: ${n.id}`)
        if (n.id) seen.add(n.id)
        // 3.0-W3 S4.5-3：kind 枚举从登记档读（原硬编码数组已单源化 · 恒等 fixture 钉逐字等价）
        if (n.kind != null && !vocabKinds.includes(n.kind)) {
          errors.push(`nodes[${i}].kind 非法: ${n.kind}`)
        }
        // 3.2 W1：可选 implementedBy 形状校验（存在则须 object · path 为 string；symbol 可选 string）
        if ('implementedBy' in n && n.implementedBy != null) {
          const ib = n.implementedBy as unknown
          if (typeof ib !== 'object' || Array.isArray(ib)) {
            errors.push(`nodes[${i}].implementedBy 须为 object`)
          } else {
            const obj = ib as { path?: unknown; symbol?: unknown }
            if (typeof obj.path !== 'string') {
              errors.push(`nodes[${i}].implementedBy.path 须为 string`)
            }
            if (obj.symbol != null && typeof obj.symbol !== 'string') {
              errors.push(`nodes[${i}].implementedBy.symbol 若存在须为 string`)
            }
          }
        }
      })
    }
  }
  if (data.edges != null) {
    if (!Array.isArray(data.edges)) errors.push('edges 须为 array')
    else {
      const nodeIds = new Set((data.nodes || []).map((n) => n?.id).filter(Boolean) as string[])
      data.edges.forEach((e, i) => {
        if (e == null || typeof e !== 'object' || Array.isArray(e)) {
          errors.push(`edges[${i}] 须为 object`)
          return
        }
        if (!e.from) errors.push(`edges[${i}] 缺少 from`)
        if (!e.to) errors.push(`edges[${i}] 缺少 to`)
        if (e.from && !nodeIds.has(e.from)) errors.push(`edges[${i}] 引用未知节点: ${e.from}`)
        if (e.to && !nodeIds.has(e.to)) errors.push(`edges[${i}] 引用未知节点: ${e.to}`)
        if (e.anchors != null) {
          if (!Array.isArray(e.anchors)) errors.push(`edges[${i}].anchors 须为 array`)
          else {
            e.anchors.forEach((a, j) => {
              if (!a || typeof a !== 'object') errors.push(`edges[${i}].anchors[${j}] 须为 object`)
              else if (!a.path) errors.push(`edges[${i}].anchors[${j}] 缺少 path`)
            })
          }
        }
      })
    }
  }
  if (errors.length > 0 && filePath) return errors.map((e) => `${filePath}: ${e}`)
  return errors
}

export function allGraphIds(
  inputRoot: string,
  opts: { recursive?: boolean; maxDepth?: number; skipDirs?: string[]; includeShared?: boolean } = {},
): string[] {
  if (!existsSync(inputRoot)) return []
  const recursive = opts.recursive !== false
  const maxDepth = opts.maxDepth ?? 8
  const skipDirs = new Set(opts.skipDirs || [...DEFAULT_SKIP_DIRS])
  if (opts.includeShared) skipDirs.delete('shared')
  if (!recursive) {
    return readdirSync(inputRoot)
      .filter((name) => name.endsWith('.graph.yaml'))
      .map((name) => name.slice(0, -'.graph.yaml'.length))
      .sort()
  }
  const found = new Map<string, string>()
  const walk = (dir: string, depth: number, relPrefix: string): void => {
    if (depth > maxDepth) return
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      const name = ent.name
      if (ent.isDirectory()) {
        if (skipDirs.has(name)) continue
        const nextRel = relPrefix ? `${relPrefix}/${name}` : name
        walk(path.join(dir, name), depth + 1, nextRel)
        continue
      }
      if (!ent.isFile() || !name.endsWith('.graph.yaml')) continue
      const id = relPrefix
        ? `${relPrefix}/${name.slice(0, -'.graph.yaml'.length)}`
        : name.slice(0, -'.graph.yaml'.length)
      const abs = path.join(dir, name)
      if (found.has(id)) {
        throw new GraphYamlError(`graphId 冲突: "${id}"\n  - ${found.get(id)}\n  - ${abs}`)
      }
      found.set(id, abs)
    }
  }
  walk(inputRoot, 0, '')
  return [...found.keys()].sort()
}

export function yamlPathFor(inputRoot: string, graphId: string): string {
  return path.join(inputRoot, `${graphId}.graph.yaml`)
}

export function mdPathFor(inputRoot: string, graphId: string): string {
  return path.join(inputRoot, `${graphId}.md`)
}

export function resolveGraphJsonPath(inputRoot: string, explicitPath: string | null = null): string {
  if (explicitPath) return explicitPath
  const shared = path.join(inputRoot, 'shared', 'graph.json')
  if (existsSync(shared)) return shared
  return path.join(inputRoot, 'graph.json')
}

/**
 * 源内容派生戳：同 UTF-8 字节 → 同 stamp。形态 `sha256-<16hex>`，YAML 当纯量（非嵌套键）。
 * 用于 compile md frontmatter 与 export graph.json 的 generated_at，去掉 wall-clock。
 */
export function contentStamp(source: string): string {
  const hex = createHash('sha256').update(source, 'utf8').digest('hex').slice(0, 16)
  return `sha256-${hex}`
}

function stampYamlCorpus(inputRoot: string, graphIds: string[]): string {
  const parts: string[] = []
  for (const graphId of graphIds) {
    parts.push(`${graphId}\n${readFileSync(yamlPathFor(inputRoot, graphId), 'utf8')}`)
  }
  return contentStamp(parts.join('\0'))
}

function classifyLabel(label: string): [string, boolean] {
  const t = String(label || '').trim()
  if (t.startsWith('::') && t.length > 2) return [t.slice(2).trim() || 'meta', true]
  if (t.includes('~>')) return ['async_calls', false]
  if (t.includes('?>') || t === '?>') return ['condition', true]
  return ['depends_on', true]
}

function edgeToGraphV2(edge: YamlEdge): { mark: string; type: string; sync: boolean; label: string } {
  const mark = edge.mark || ''
  const label = edge.label || ''
  const explicitType = edge.type || ''
  let baseMark: string
  let baseLabel: string
  let inferredType: string
  if (mark) {
    if (mark === 'classDiagram') {
      baseMark = 'classDiagram'
      baseLabel = ''
      inferredType = 'has_metadata'
    } else if (mark === '~>') {
      baseMark = '~>'
      // DEF-031（D1）：拓扑协议标记作为边属性呈现，不丢弃 label 文本
      baseLabel = label
      inferredType = 'async_calls'
    } else if (mark === '?>') {
      baseMark = '?>'
      baseLabel = label
      inferredType = 'condition'
    } else if (mark.startsWith('::')) {
      baseMark = mark
      baseLabel = label
      inferredType = mark.slice(2) || 'meta'
    } else if (mark.startsWith('[') && mark.endsWith(']')) {
      baseMark = mark
      baseLabel = label
      inferredType = 'depends_on'
    } else if (mark === '->') {
      baseMark = '->'
      baseLabel = label
      inferredType = label ? classifyLabel(label)[0] : 'depends_on'
    } else {
      baseMark = mark
      baseLabel = label
      inferredType = label ? classifyLabel(label)[0] : 'depends_on'
    }
  } else {
    baseMark = '->'
    baseLabel = label
    if (!label) inferredType = 'depends_on'
    else if (label === 'classDiagram') {
      baseMark = 'classDiagram'
      baseLabel = ''
      inferredType = 'has_metadata'
    } else if (label === '?>') {
      baseMark = '?>'
      baseLabel = ''
      inferredType = 'condition'
    } else if (label.startsWith('::')) {
      baseMark = label
      baseLabel = ''
      inferredType = label.slice(2) || 'meta'
    } else inferredType = classifyLabel(label)[0]
  }
  const finalType = explicitType || inferredType
  return { mark: baseMark, type: finalType, sync: finalType !== 'async_calls', label: baseLabel }
}

function normalizeAnchors(anchors: YamlEdge['anchors']): { path: string; symbol: string; line?: number }[] {
  if (!anchors) return []
  return anchors.map((a) => {
    const out: { path: string; symbol: string; line?: number } = { path: a.path || '', symbol: a.symbol || '' }
    if (a.line != null) out.line = a.line
    return out
  })
}

export function buildGraphPayload(
  inputRoot: string,
  opts: {
    generatedAt?: string | null
    freezeId?: string
    recursive?: boolean
    targetRoot?: string | null
  } = {},
): Record<string, unknown> {
  if (!existsSync(inputRoot)) throw new GraphYamlError(`输入目录不存在: ${inputRoot}`)
  const recursive = opts.recursive !== false
  const freezeId = opts.freezeId ?? FREEZE_ID
  const targetRoot = opts.targetRoot
  const graphIds = allGraphIds(inputRoot, { recursive })
  const nodes: Record<string, unknown>[] = []
  const edges: Record<string, unknown>[] = []
  const graphs: Record<string, unknown>[] = []
  for (const graphId of graphIds) {
    const yamlPath = yamlPathFor(inputRoot, graphId)
    const data = loadYaml(yamlPath)
    const validationErrors = validateGraphYaml(data, yamlPath, targetRoot)
    if (validationErrors.length > 0) throw new GraphYamlError(validationErrors.join('\n'))
    printTechVocabWarnings(data, yamlPath, targetRoot) // 钩② · stderr Warning
    // DEF-032①（D2）：graph_id 真值源 = yaml 声明值（如 00_main）；
    // 路径命名空间 id（如 l0/00_main）仅作输入兼容定位，不写入输出。
    const declaredId = data.graph_id != null ? String(data.graph_id) : graphId
    graphs.push({
      id: declaredId,
      title: data.title,
      source_yaml_path: path.relative(inputRoot, yamlPath).replace(/\\/g, '/'),
    })
    for (const n of data.nodes || []) {
      // 3.2 W1 · N2：合法 IB 透传进 graph.json（禁止静默丢字段）；无 IB 节点不增键
      const nodeOut: Record<string, unknown> = { id: n.id, label: n.label, graph_id: declaredId }
      if (n.implementedBy != null && typeof n.implementedBy === 'object' && !Array.isArray(n.implementedBy)) {
        const ib: Record<string, unknown> = { path: n.implementedBy.path ?? '' }
        if (n.implementedBy.symbol != null) ib.symbol = n.implementedBy.symbol
        nodeOut.implementedBy = ib
      }
      nodes.push(nodeOut)
    }
    for (const e of data.edges || []) {
      const { mark, type, sync, label } = edgeToGraphV2(e)
      edges.push({
        from: e.from,
        to: e.to,
        mark,
        type,
        sync,
        label,
        anchors: normalizeAnchors(e.anchors),
        graph_id: declaredId,
      })
    }
  }
  nodes.sort((a, b) => String(a.id).localeCompare(String(b.id)))
  edges.sort((a, b) => {
    for (const k of ['graph_id', 'from', 'to', 'mark', 'type', 'sync', 'label']) {
      const va = a[k] ?? ''
      const vb = b[k] ?? ''
      if (va !== vb) return String(va).localeCompare(String(vb))
    }
    return 0
  })
  return {
    schema_version: 'graph_v2',
    freeze_id: freezeId,
    generated_at: opts.generatedAt || stampYamlCorpus(inputRoot, graphIds),
    nodes,
    edges,
    graphs,
  }
}

export function exportGraphJson(
  inputRoot: string,
  opts: {
    outPath?: string | null
    recursive?: boolean
    generatedAt?: string | null
    freezeId?: string
    targetRoot?: string | null
  } = {},
): { outPath: string; payload: Record<string, unknown> } {
  const payload = buildGraphPayload(inputRoot, opts)
  const outPath = opts.outPath || path.join(inputRoot, 'shared', 'graph.json')
  mkdirSync(path.dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return { outPath, payload }
}

function formatAnchorComment(anchor: { path?: string; symbol?: string; line?: number }): string {
  // Mermaid 行注释只认 %%（flowchart.md § Comments；官网 syntax-reference）。
  // IDE Markdown 预览遇到 // 注释会解析失败，导致整图节点横排、边丢失（DEF-023）。
  const p = anchor.path || ''
  const symbol = anchor.symbol || ''
  const line = anchor.line
  if (!p) return ''
  if (line != null) return `%% → ${p}#L${line}`
  if (symbol) return `%% → ${p}::${symbol}`
  return `%% → ${p}`
}

/**
 * Mermaid 文本转义（entity code，flowchart.md § Entity codes to escape characters）。
 * 顺序敏感：先转 #，避免二次转义后续生成的 entity code。
 */
function escapeMermaidText(text: string): string {
  return String(text)
    .replace(/#/g, '#35;')
    .replace(/"/g, '#quot;')
    .replace(/\|/g, '#124;')
}

function generateMermaid(data: YamlGraph, targetRoot?: string | null): string {
  const nodes = new Map((data.nodes || []).map((n) => [n.id || '', n]))
  const direction = data.direction || 'TD'
  const lines = [`flowchart ${direction}`]
  for (const [nid, node] of nodes) {
    const label = node.label || nid
    // 节点文本一律双引号包裹（flowchart.md § Special characters that break syntax），
    // 否则含空格 / () / / / + 等字符的标签会让 IDE 预览解析失败（DEF-023）。
    const text = `"${escapeMermaidText(label)}"`
    let shape: string
    if (label.includes('子流程') || label.endsWith('子流程')) shape = `[[${text}]]`
    else if (nid === 'Q' || nid === 'E') shape = `[[${text}]]`
    else shape = `[${text}]`
    lines.push(`    ${nid}${shape}`)
  }
  lines.push('')
  for (const e of data.edges || []) {
    const src = e.from
    const dst = e.to
    const mark = e.mark || '->'
    const label = e.label || ''
    // 带标签边官方形态：src -->|"text"| dst（flowchart.md § A link with arrow head and text）。
    // yaml 中 label: "->" 表示裸执行边（99_mermaid_protocol.md §6），不渲染文本。
    let text = label && label !== '->' ? label : ''
    if (!text && mark && mark !== '->') text = mark
    let edgeLine: string
    if (text) edgeLine = `    ${src} -->|"${escapeMermaidText(text)}"| ${dst}`
    else edgeLine = `    ${src} --> ${dst}`
    lines.push(edgeLine)
    for (const a of e.anchors || []) {
      const comment = formatAnchorComment(a)
      if (comment) lines.push(`    ${comment}`)
    }
  }
  lines.push('')
  lines.push('    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px')
  lines.push('    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px')
  lines.push('    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px')
  // DEF-033（R6）：class 段以 nodes[].kind 为真值源（kind→class 映射，同 generateNodeTable 的 kind 读取）；
  // 无 kind（或未知 kind）时保留 id 推断作兜底（历史行为，仅供未标注 kind 的旧 yaml）。
  // 3.0-W3 S4.5-3（20 审 R1-A3）：KIND_TO_CLASS 第二硬拷贝同迁登记档（单源 · loadTechGraphVocab）
  const KIND_TO_CLASS = loadTechGraphVocab(targetRoot).kindToClass
  // E5（noUncheckedIndexedAccess）：键集合钉死为三类，classGroups.X 访问免收窄（纯类型收紧 · 零运行时变化）
  const classGroups: Record<'phase' | 'doc' | 'infra', string[]> = { phase: [], doc: [], infra: [] }
  for (const [nid, node] of nodes) {
    let cls = node.kind ? KIND_TO_CLASS[node.kind] : undefined
    if (!cls) {
      // 兜底：id 推断（无 kind 或未知 kind 时）
      if (['Q', 'E', 'U1', 'U2', 'RAG', 'T2S', 'RPC', 'FTS'].includes(nid)) cls = 'phase'
      else if (nid.includes('DOC')) cls = 'doc'
      else if (['AUTH', 'EV_TYPES'].includes(nid)) cls = 'infra'
    }
    if (cls) classGroups[cls].push(nid)
  }
  if (classGroups.phase.length) lines.push(`    class ${classGroups.phase.join(',')} phase`)
  if (classGroups.doc.length) lines.push(`    class ${classGroups.doc.join(',')} doc`)
  if (classGroups.infra.length) lines.push(`    class ${classGroups.infra.join(',')} infra`)
  return lines.join('\n')
}

function generateNodeTable(data: YamlGraph): string {
  const lines = ['### Nodes', '', '| ID | Label | Kind |', '|----|-------|------|']
  for (const n of data.nodes || []) {
    const label = String(n.label || '').replace(/\|/g, '\\|')
    lines.push(`| ${n.id} | ${label} | ${n.kind || ''} |`)
  }
  return lines.join('\n')
}

function generateEdgeTable(data: YamlGraph): string {
  const lines = [
    '### Edges',
    '',
    '| From | To | Mark | Type | Label | Anchors |',
    '|------|----|------|------|-------|---------|',
  ]
  for (const e of data.edges || []) {
    const { mark, type } = edgeToGraphV2(e)
    const label = String(e.label || '').replace(/\|/g, '\\|')
    const anchors = e.anchors || []
    const anchorSummary = anchors.length ? `${anchors.length} anchor(s)` : ''
    lines.push(`| ${e.from || ''} | ${e.to || ''} | ${mark} | ${type} | ${label} | ${anchorSummary} |`)
  }
  return lines.join('\n')
}

function generateNotesSection(data: YamlGraph): string {
  const notes = data.notes
  if (!notes) return ''
  let body: string
  if (typeof notes === 'string') body = notes
  else if (Array.isArray(notes)) body = notes.join('\n\n')
  else body = String(notes)
  return `\n\n## Notes\n\n${body}\n`
}

function generateSubGraphLinks(graphId: string): string {
  if (graphId !== '00_main') return ''
  return [
    '## Sub-graph Links',
    '',
    '- `Struct`: [`01_struct.md`](01_struct.md)（手写 · 无 `.graph.yaml`）',
    '- `Version`: [`02_version.md`](02_version.md)（手写 · 无 `.graph.yaml`）',
    '- 子图编辑源见 `docs/_tech_graph/*.graph.yaml`',
    '',
  ].join('\n')
}

export function generateMarkdown(
  data: YamlGraph,
  opts: {
    sourcePath?: string | null
    sourceRaw?: string | null
    generatedAt?: string | null
    targetRoot?: string | null
  } = {},
): string {
  const graphId = data.graph_id || 'main'
  const title = data.title || graphId
  const description = data.description || ''
  const version = data.version || ''
  const generatedAt = opts.generatedAt || contentStamp(opts.sourceRaw ?? JSON.stringify(data))
  const src = opts.sourcePath || `docs/_tech_graph/${graphId}.graph.yaml`
  const frontmatter = `---
graph_id: ${graphId}
version: ${version}
generated_at: ${generatedAt}
source: ${src}
---
`
  const header = `# ${title}\n\n${description}`.trim()
  const mermaid = generateMermaid(data, opts.targetRoot)
  const subLinks = generateSubGraphLinks(graphId)
  const notes = generateNotesSection(data)
  const body = `${header}

## Mermaid

\`\`\`mermaid
${mermaid}
\`\`\`

## Structured Data

${generateNodeTable(data)}

${generateEdgeTable(data)}${notes}${subLinks ? `\n\n${subLinks}` : ''}
`
  return `${frontmatter}\n${body}`
}

export function compileGraph(
  graphId: string,
  inputRoot: string,
  outputPath: string | null = null,
  opts: { targetRoot?: string | null } = {},
): string {
  const yamlPath = yamlPathFor(inputRoot, graphId)
  if (!existsSync(yamlPath)) throw new GraphYamlError(`YAML 源不存在: ${yamlPath}`)
  const raw = readFileSync(yamlPath, 'utf8')
  const data = loadYaml(yamlPath)
  const targetRoot = opts.targetRoot
  const validationErrors = validateGraphYaml(data, yamlPath, targetRoot)
  if (validationErrors.length > 0) throw new GraphYamlError(validationErrors.join('\n'))
  printTechVocabWarnings(data, yamlPath, targetRoot) // 钩② · stderr Warning · stdout/产物/exit 零漂移
  const md = generateMarkdown(data, {
    sourcePath: path.relative(inputRoot, yamlPath).replace(/\\/g, '/'),
    sourceRaw: raw,
    targetRoot,
  })
  const outPath = outputPath || mdPathFor(inputRoot, graphId)
  writeFileSync(outPath, md, 'utf8')
  return outPath
}

export function loadGraphJson(graphJsonPath: string): Record<string, unknown> | null {
  if (!existsSync(graphJsonPath)) return null
  const raw = readFileSync(graphJsonPath, 'utf8')
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch (err) {
    const e = err as { message?: string }
    throw new GraphYamlError(`graph.json 解析失败: ${e.message ?? String(err)}`, { path: graphJsonPath })
  }
}

export function checkGraph(
  graphId: string,
  inputRoot: string,
  graphJsonPath: string,
  opts: { targetRoot?: string | null } = {},
): { ok: boolean; diff: string } {
  const yamlPath = yamlPathFor(inputRoot, graphId)
  if (!existsSync(yamlPath)) throw new GraphYamlError(`YAML 源不存在: ${yamlPath}`)
  const yamlData = loadYaml(yamlPath)
  const targetRoot = opts.targetRoot
  const validationErrors = validateGraphYaml(yamlData, yamlPath, targetRoot)
  if (validationErrors.length > 0) throw new GraphYamlError(validationErrors.join('\n'))
  printTechVocabWarnings(yamlData, yamlPath, targetRoot) // 钩② · stderr Warning
  if (!existsSync(graphJsonPath)) return { ok: false, diff: `graph.json 不存在: ${graphJsonPath}` }
  const graphJson = loadGraphJson(graphJsonPath)
  // DEF-032②（D3）：与 export 同一 id 真值源（yaml 声明值），路径 id 仅作输入兼容定位。
  const declaredId = yamlData.graph_id != null ? String(yamlData.graph_id) : graphId
  const jsonNodes = ((graphJson?.nodes as { id?: string; graph_id?: string }[]) || []).filter(
    (n) => n?.graph_id === declaredId,
  )
  const jsonEdges = (
    (graphJson?.edges as { graph_id?: string; from?: string; to?: string; mark?: string; type?: string }[]) || []
  ).filter((e) => e?.graph_id === declaredId && 'from' in e && 'to' in e)
  const yamlNodes = new Map((yamlData.nodes || []).map((n) => [n.id || '', n]))
  const yamlNodeIds = new Set(yamlNodes.keys())
  const jsonNodeIds = new Set(jsonNodes.map((n) => n.id || ''))
  const diffs: string[] = []
  if (yamlNodeIds.size !== jsonNodeIds.size || ![...yamlNodeIds].every((id) => jsonNodeIds.has(id))) {
    const onlyYaml = [...yamlNodeIds].filter((id) => !jsonNodeIds.has(id))
    const onlyJson = [...jsonNodeIds].filter((id) => !yamlNodeIds.has(id))
    if (onlyYaml.length) diffs.push(`Nodes only in YAML: ${onlyYaml.sort().join(', ')}`)
    if (onlyJson.length) diffs.push(`Nodes only in JSON: ${onlyJson.sort().join(', ')}`)
  }
  if ((yamlData.nodes || []).length !== jsonNodes.length) {
    diffs.push(`Node count mismatch: YAML=${(yamlData.nodes || []).length}, JSON=${jsonNodes.length}`)
  }
  const yamlEdgeSet = new Set(
    (yamlData.edges || []).map((e) => {
      const { mark, type } = edgeToGraphV2(e)
      return JSON.stringify([e.from, e.to, mark, type])
    }),
  )
  const jsonEdgeSet = new Set(
    jsonEdges.map((e) => JSON.stringify([e.from, e.to, e.mark || '->', e.type || 'depends_on'])),
  )
  if (yamlEdgeSet.size !== jsonEdgeSet.size || ![...yamlEdgeSet].every((k) => jsonEdgeSet.has(k))) {
    const onlyYaml = [...yamlEdgeSet].filter((k) => !jsonEdgeSet.has(k)).map((k) => JSON.parse(k))
    const onlyJson = [...jsonEdgeSet].filter((k) => !yamlEdgeSet.has(k)).map((k) => JSON.parse(k))
    if (onlyYaml.length) diffs.push(`Edges only in YAML: ${JSON.stringify(onlyYaml)}`)
    if (onlyJson.length) diffs.push(`Edges only in JSON: ${JSON.stringify(onlyJson)}`)
  }
  if ((yamlData.edges || []).length !== jsonEdges.length) {
    diffs.push(`Edge count mismatch: YAML=${(yamlData.edges || []).length}, JSON=${jsonEdges.length}`)
  }
  if (diffs.length === 0) return { ok: true, diff: '' }
  return { ok: false, diff: diffs.join('\n') }
}
