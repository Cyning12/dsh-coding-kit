import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fail, resolveTarget, takeOption } from './cli-shared.ts'

export const WIKI_GRAPH_SCHEMA = 'harness.wiki_graph.v1'

export function exportWikiGraph(
  repoRoot: string,
  options: { root?: string } = {},
): {
  schema: string
  root: string
  nodes: { id: string; path: string; title: string }[]
  edges: { source: string; target: string; kind: string }[]
  warnings: string[]
  skipped_illustrative: number
} {
  const rootRel = (options.root || 'docs/coding_wiki').replace(/^\.\/+/, '').replace(/\\/g, '/')
  const absRoot = path.join(repoRoot, rootRel)
  const warnings: string[] = []
  if (!existsSync(absRoot)) {
    const err = new Error(`wiki 根不存在: ${rootRel}`) as Error & { code?: string }
    err.code = 'wiki_root_missing'
    throw err
  }
  const files = listMarkdownFiles(absRoot)
  const nodes: { id: string; path: string; title: string }[] = []
  const nodeByStem = new Map<string, { id: string; path: string; title: string }>()
  const nodeByRel = new Map<string, { id: string; path: string; title: string }>()
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs).replace(/\\/g, '/')
    const stem = path.basename(abs, path.extname(abs))
    const title = extractTitle(readFileSync(abs, 'utf8')) || stem
    const node = { id: rel, path: rel, title }
    nodes.push(node)
    nodeByRel.set(rel, node)
    nodeByStem.set(stem.toLowerCase(), node)
  }
  const edges: { source: string; target: string; kind: string }[] = []
  const edgeKey = new Set<string>()
  let skippedIllustrative = 0
  const pushEdge = (source: string, target: string, kind: string) => {
    if (!source || !target || source === target) return
    const key = `${source}|${target}|${kind}`
    if (edgeKey.has(key)) return
    edgeKey.add(key)
    edges.push({ source, target, kind })
  }
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs).replace(/\\/g, '/')
    const content = readFileSync(abs, 'utf8')
    const dir = path.dirname(abs)
    for (const name of extractWikilinks(content)) {
      const target = resolveWikilink(name, nodeByStem, nodeByRel, repoRoot, dir)
      if (target) {
        pushEdge(rel, target, 'wikilink')
        continue
      }
      if (isIllustrativeWikilink(name)) {
        skippedIllustrative += 1
        continue
      }
      warnings.push(`未解析 wikilink [[${name}]] @ ${rel}`)
    }
    for (const href of extractMdRelLinks(content)) {
      const targetAbs = path.resolve(dir, href.split('#')[0])
      if (!targetAbs.startsWith(absRoot)) continue
      if (!existsSync(targetAbs)) {
        warnings.push(`md 链目标不存在: ${href} @ ${rel}`)
        continue
      }
      const targetRel = path.relative(repoRoot, targetAbs).replace(/\\/g, '/')
      if (nodeByRel.has(targetRel)) pushEdge(rel, targetRel, 'md_link')
    }
  }
  return { schema: WIKI_GRAPH_SCHEMA, root: rootRel, nodes, edges, warnings, skipped_illustrative: skippedIllustrative }
}

function listMarkdownFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (d: string): void => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue
      const p = path.join(d, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (/\.md$/i.test(ent.name)) out.push(p)
    }
  }
  walk(dir)
  return out.sort()
}

function extractTitle(content: string): string | null {
  const m = content.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

function extractWikilinks(content: string): string[] {
  const names: string[] = []
  const re = /\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) names.push(m[1].trim())
  return names
}

function extractMdRelLinks(content: string): string[] {
  const hrefs: string[] = []
  const re = /\[[^\]]*\]\((\.\/[^)\s]+\.md(?:#[^)\s]*)?|\.\.\/[^)\s]+\.md(?:#[^)\s]*)?)\)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) hrefs.push(m[1].trim())
  return hrefs
}

function resolveWikilink(
  name: string,
  nodeByStem: Map<string, { path: string }>,
  nodeByRel: Map<string, { path: string }>,
  repoRoot: string,
  fromDir: string,
): string | null {
  const cleaned = name.replace(/\\/g, '/').replace(/\.md$/i, '')
  const byStem = nodeByStem.get(path.basename(cleaned).toLowerCase())
  if (byStem) return byStem.path
  const asRel = cleaned.replace(/^\.\/+/, '')
  if (nodeByRel.has(asRel)) return asRel
  if (nodeByRel.has(`${asRel}.md`)) return `${asRel}.md`
  const fromRepo = path.relative(repoRoot, path.resolve(fromDir, cleaned)).replace(/\\/g, '/')
  if (nodeByRel.has(fromRepo)) return fromRepo
  if (nodeByRel.has(`${fromRepo}.md`)) return `${fromRepo}.md`
  return null
}

export function isIllustrativeWikilink(name: string): boolean {
  const n = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\.md$/i, '')
  if (!n) return true
  if (/^(wikilink|page|name|link|title|placeholder|example|foo|bar|baz)$/i.test(n)) return true
  if (/^[.…·]+$/.test(n) || n === '...' || n === '…') return true
  return false
}

export async function cmdWiki(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (!sub || sub === '--help' || sub === '-h') {
    console.log(`用法: npx dsh-coding-kit wiki export --json [--target PATH] [--root DIR] [--out FILE|-]
`)
    return
  }
  if (sub !== 'export') fail(`wiki 子命令未知: ${sub}\n用法: wiki export --json`)
  let remaining = rest
  const json = remaining.includes('--json')
  remaining = remaining.filter((a) => a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(remaining, '--target')
  remaining = r1
  const { value: rootArg, rest: r2 } = takeOption(remaining, '--root')
  remaining = r2
  const { value: outArg, rest: r3 } = takeOption(remaining, '--out')
  remaining = r3
  if (remaining.length > 0) fail(`wiki export 未知参数: ${remaining.join(' ')}`)
  if (!json) fail('wiki export 须 --json')
  const target = resolveTarget(process.cwd(), targetArg)
  let graph
  try {
    graph = exportWikiGraph(target, { root: rootArg })
  } catch (e) {
    console.error((e as Error).message || String(e))
    fail('', 2)
  }
  const payload = {
    schema: graph.schema,
    root: graph.root,
    nodes: graph.nodes,
    edges: graph.edges,
    warnings: graph.warnings,
  }
  const text = `${JSON.stringify(payload, null, 2)}\n`
  const out = outArg || '-'
  if (out === '-') process.stdout.write(text)
  else {
    const abs = path.resolve(process.cwd(), out)
    mkdirSync(path.dirname(abs), { recursive: true })
    writeFileSync(abs, text)
    console.error(`wrote: ${abs}`)
  }
  if (graph.warnings.length > 0) {
    for (const w of graph.warnings) console.error(`warn: ${w}`)
  }
}
