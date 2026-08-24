import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  extractTaskSlug,
  fail,
  normalizeSlug,
  parseHarnessMeta,
  resolveTarget,
  takeOption,
} from './cli-shared.ts'

const DONE_DIR_CANDIDATES = ['docs/tasks/done', 'docs/harness/tasks/done']
const INVOKE_DIR_CANDIDATES = ['docs/harness/invokes/by-task', 'invokes/by-task']
const TASK_DIR_CANDIDATES = [
  { rel: 'docs/tasks/active', scope: 'active' },
  { rel: 'docs/tasks/done', scope: 'done' },
  { rel: 'docs/harness/tasks/active', scope: 'active' },
  { rel: 'docs/harness/tasks/done', scope: 'done' },
] as const

function collectMarkdown(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name.startsWith('_') || ent.name.startsWith('.')) continue
      out.push(...collectMarkdown(full))
    } else if (ent.isFile() && ent.name.endsWith('.md') && !/^readme\.md$/i.test(ent.name)) {
      out.push(full)
    }
  }
  return out
}

export function lintDoneInvokes(target: string): {
  ok: boolean
  missing: string[]
  extra: string[]
  doneCount: number
  invokeCount: number
} {
  const doneSlugs = new Map<string, string>()
  for (const rel of DONE_DIR_CANDIDATES) {
    const dir = path.join(target, rel)
    if (!existsSync(dir)) continue
    for (const file of collectMarkdown(dir)) {
      const slug = normalizeSlug(extractTaskSlug(path.basename(file)))
      if (!doneSlugs.has(slug)) {
        doneSlugs.set(slug, path.relative(target, file).replace(/\\/g, '/'))
      }
    }
  }
  const invokeSlugs = new Set<string>()
  for (const rel of INVOKE_DIR_CANDIDATES) {
    const invokeRoot = path.join(target, rel)
    if (!existsSync(invokeRoot)) continue
    for (const ent of readdirSync(invokeRoot, { withFileTypes: true })) {
      if (ent.isDirectory()) invokeSlugs.add(normalizeSlug(ent.name))
    }
  }
  const missing = [...doneSlugs.keys()].filter((s) => !invokeSlugs.has(s)).sort()
  const extra = [...invokeSlugs].filter((s) => !doneSlugs.has(s)).sort()
  return {
    ok: missing.length === 0,
    missing,
    extra,
    doneCount: doneSlugs.size,
    invokeCount: invokeSlugs.size,
  }
}

// DEF-021：wiki_delta strict 词表——none / n/a 为字面值；
// 其余值须为 path 形态（含 / 或 .，如 docs/coding_wiki/x.md 或 coding_wiki/templates）
const WIKI_DELTA_LITERALS = new Set(['none', 'n/a'])
const WIKI_DELTA_PATHISH_RE = /[/.]/

export function lintWikiDeltaMissing(
  target: string,
  options: { scope?: string; strict?: boolean } = {},
): {
  ok: boolean
  missing: { path: string; scope: string; code: string; detail: string }[]
  issues: { path: string; scope: string; code: string; detail: string }[]
  scanned: number
  scope: string
  strict: boolean
} {
  const scope = options.scope || 'all'
  const strict = Boolean(options.strict)
  if (!['all', 'active', 'done'].includes(scope)) {
    throw new Error(`lint-wiki-delta --scope 须为 all|active|done（当前: ${scope}）`)
  }
  const missing: { path: string; scope: string; code: string; detail: string }[] = []
  const issues: { path: string; scope: string; code: string; detail: string }[] = []
  let scanned = 0
  const seen = new Set<string>()
  for (const { rel, scope: dirScope } of TASK_DIR_CANDIDATES) {
    if (scope !== 'all' && scope !== dirScope) continue
    const dir = path.join(target, rel)
    if (!existsSync(dir)) continue
    for (const abs of collectMarkdown(dir)) {
      const relPath = path.relative(target, abs).replace(/\\/g, '/')
      if (seen.has(relPath)) continue
      seen.add(relPath)
      scanned += 1
      const content = readFileSync(abs, 'utf8')
      const meta = parseHarnessMeta(content)
      const raw = meta.wiki_delta
      if (raw == null || String(raw).trim() === '') {
        const row = {
          path: relPath,
          scope: dirScope,
          code: 'wiki_delta_missing',
          detail: '缺 wiki_delta 字段（须 path|none|n/a）',
        }
        missing.push(row)
        issues.push(row)
      } else if (strict) {
        // DEF-021 完成态 A：--strict 在默认档之上追加扩展检查（SPEC G7 note/path 口径）。
        // 词表 path|none|n/a：none / n/a 为字面值；其余按 path 形态处理。
        // 新缺口只入 issues 不入 missing，默认档结果不变。
        const value = String(raw).trim()
        if (!WIKI_DELTA_LITERALS.has(value)) {
          if (!WIKI_DELTA_PATHISH_RE.test(value)) {
            issues.push({
              path: relPath,
              scope: dirScope,
              code: 'wiki_delta_invalid',
              detail: `wiki_delta 值非法: ${value}（须 path|none|n/a）`,
            })
          } else if (!existsSync(path.resolve(target, value))) {
            issues.push({
              path: relPath,
              scope: dirScope,
              code: 'wiki_delta_path_missing',
              detail: `wiki_delta 指向不存在的 wiki 路径（相对仓根）: ${value}`,
            })
          }
        }
      }
    }
  }
  missing.sort((a, b) => a.path.localeCompare(b.path))
  issues.sort((a, b) => a.path.localeCompare(b.path))
  return {
    ok: (strict ? issues : missing).length === 0,
    missing,
    issues: strict ? issues : missing.map((m) => ({ ...m })),
    scanned,
    scope,
    strict,
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/

export function loadTaskSidecar(filePath: string): Record<string, unknown> {
  const raw = readFileSync(filePath, 'utf8')
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch (err) {
    fail(`JSON 解析失败: ${filePath}: ${(err as Error).message}`)
  }
}

export function validateTaskSidecar(
  data: Record<string, unknown>,
  fileLabel = 'task',
): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, errors: [`${fileLabel}: 根节点须为 object`] }
  }
  const allowed = new Set([
    'schema_version',
    'task_slug',
    'test_strategy',
    'test_strategy_note',
    'depends_on',
    'parallel_group',
    'git_branch',
    'worktree_root',
    'epic_slug',
    'status',
    'task_markdown',
  ])
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) errors.push(`${fileLabel}: 未知字段 "${key}"`)
  }
  if (data.schema_version !== '1') errors.push(`${fileLabel}: schema_version 须为 "1"`)
  if (typeof data.task_slug !== 'string' || !SLUG_RE.test(data.task_slug)) {
    errors.push(`${fileLabel}: task_slug 无效（小写 slug）`)
  }
  const strategies = ['required', 'recommended', 'not_applicable']
  if (!strategies.includes(String(data.test_strategy))) {
    errors.push(`${fileLabel}: test_strategy 须为 ${strategies.join(' | ')}`)
  }
  if (data.test_strategy === 'not_applicable') {
    if (typeof data.test_strategy_note !== 'string' || !data.test_strategy_note.trim()) {
      errors.push(`${fileLabel}: test_strategy=not_applicable 须填 test_strategy_note`)
    }
  }
  if (data.depends_on !== undefined) {
    if (!Array.isArray(data.depends_on)) errors.push(`${fileLabel}: depends_on 须为 array`)
    else {
      const seen = new Set<string>()
      for (const dep of data.depends_on) {
        if (typeof dep !== 'string' || !SLUG_RE.test(dep)) {
          errors.push(`${fileLabel}: depends_on 项无效 "${dep}"`)
        }
        if (dep === data.task_slug) errors.push(`${fileLabel}: depends_on 不可自引用 "${dep}"`)
        if (seen.has(dep)) errors.push(`${fileLabel}: depends_on 重复 "${dep}"`)
        seen.add(String(dep))
      }
    }
  }
  if (data.status !== undefined) {
    const statuses = ['draft', 'pending', 'in_progress', 'done']
    if (!statuses.includes(String(data.status))) errors.push(`${fileLabel}: status 无效`)
  }
  return { ok: errors.length === 0, errors }
}

function collectTaskSidecars(dirs: string[]): Map<string, { filePath: string; label: string; data: Record<string, unknown> }> {
  const map = new Map<string, { filePath: string; label: string; data: Record<string, unknown> }>()
  const scanDir = (dir: string): void => {
    if (!existsSync(dir)) return
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) scanDir(full)
      else if (ent.isFile() && ent.name.endsWith('.harness.json')) {
        const data = loadTaskSidecar(full)
        map.set(String(data.task_slug), { filePath: full, label: full, data })
      }
    }
  }
  for (const dir of dirs) scanDir(path.resolve(dir))
  return map
}

function detectDependsOnCycle(
  taskMap: Map<string, { data: Record<string, unknown> }>,
): { ok: boolean; cycle?: string[] } {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  let cyclePath: string[] | null = null
  const dfs = (slug: string, stack: string[]): boolean => {
    if (visited.has(slug)) return false
    if (visiting.has(slug)) {
      const idx = stack.indexOf(slug)
      cyclePath = stack.slice(idx).concat(slug)
      return true
    }
    visiting.add(slug)
    stack.push(slug)
    const deps = (taskMap.get(slug)?.data?.depends_on as string[]) ?? []
    for (const dep of deps) {
      if (dfs(dep, stack)) return true
    }
    stack.pop()
    visiting.delete(slug)
    visited.add(slug)
    return false
  }
  for (const slug of taskMap.keys()) {
    if (dfs(slug, [])) return { ok: false, cycle: cyclePath ?? undefined }
  }
  return { ok: true }
}

export function checkTaskFile(
  filePath: string,
  options: { noCircular?: boolean; registryDirs?: string[] } = {},
): {
  file: string
  task_slug: unknown
  validation: { ok: boolean; errors: string[] }
  cycle: { ok: boolean; cycle?: string[] }
} {
  const abs = path.resolve(filePath)
  const data = loadTaskSidecar(abs)
  const label = path.basename(abs)
  const validation = validateTaskSidecar(data, label)
  const result = {
    file: abs,
    task_slug: data.task_slug,
    validation,
    cycle: { ok: true } as { ok: boolean; cycle?: string[] },
  }
  if (!validation.ok) return result
  if (options.noCircular) {
    const dirs = new Set([path.dirname(abs), ...(options.registryDirs ?? []).map((d) => path.resolve(d))])
    const taskMap = collectTaskSidecars([...dirs])
    if (!taskMap.has(String(data.task_slug))) {
      taskMap.set(String(data.task_slug), { filePath: abs, label, data })
    }
    for (const dep of (data.depends_on as string[]) ?? []) {
      if (!taskMap.has(dep)) {
        validation.errors.push(`${label}: depends_on 未找到 sidecar "${dep}"`)
        validation.ok = false
      }
    }
    if (validation.ok) result.cycle = detectDependsOnCycle(taskMap)
  }
  return result
}

export async function cmdTaskLintDone(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx dsh-coding-kit task lint-done [--target PATH]`)
    return
  }
  let rest = args
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`task lint-done 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const result = lintDoneInvokes(target)
  console.log(`目标: ${target}`)
  console.log(`done slugs: ${result.doneCount} · invoke dirs: ${result.invokeCount}`)
  for (const slug of result.extra) console.log(`warn: invokes 有而 done 无（进行中？）: ${slug}`)
  if (!result.ok) {
    console.log('缺失 invoke 的 done 任务:')
    for (const slug of result.missing) console.log(`  - ${slug}`)
    console.log(`LINT-DONE: FAIL · missing ${result.missing.length}`)
    fail('', 2)
  }
  console.log('LINT-DONE: PASS')
}

export async function cmdTaskLintWikiDelta(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(
      `用法: npx dsh-coding-kit task lint-wiki-delta [--target PATH] [--scope all|active|done] [--strict] [--json]`,
    )
    console.log(
      '  默认档: 缺 wiki_delta 字段（wiki_delta_missing）；--strict 追加值域校验（path|none|n/a）' +
        '与 path 存在性检查（wiki_delta_invalid / wiki_delta_path_missing）',
    )
    return
  }
  const json = args.includes('--json')
  const strict = args.includes('--strict')
  let rest = args.filter((a) => a !== '--json' && a !== '--strict')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: scopeArg, rest: r2 } = takeOption(rest, '--scope')
  rest = r2
  if (rest.length > 0) fail(`task lint-wiki-delta 未知参数: ${rest.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  let result
  try {
    result = lintWikiDeltaMissing(target, { scope: scopeArg || 'all', strict })
  } catch (e) {
    fail((e as Error).message || String(e))
  }
  if (json) console.log(JSON.stringify(result, null, 2))
  else {
    console.log(`目标: ${target}`)
    console.log(
      `scope: ${result.scope} · scanned: ${result.scanned} · strict: ${result.strict} · missing: ${result.missing.length} · issues: ${result.issues.length}`,
    )
    if (!result.ok) {
      const label = result.strict ? 'wiki_delta 缺口（含 --strict）' : '缺 wiki_delta 字段的 task'
      console.log(`${label}:`)
      for (const m of result.issues) {
        console.log(`  - ${m.path}${m.code ? ` · ${m.code}` : ''}${m.detail ? ` · ${m.detail}` : ''}`)
      }
    }
    console.log(result.ok ? 'LINT-WIKI-DELTA: PASS' : `LINT-WIKI-DELTA: FAIL · issues ${result.issues.length}`)
  }
  if (!result.ok) fail('', 2)
}

export async function cmdTaskCheck(rest: string[]): Promise<void> {
  const noCircular = rest.includes('--no-circular')
  let filePath: string | undefined
  const registryDirs: string[] = []
  const filtered: string[] = []
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]
    if (arg === '--no-circular') continue
    if (arg === '--file') {
      filePath = rest[i + 1]
      i += 1
      continue
    }
    if (arg === '--registry') {
      registryDirs.push(rest[i + 1])
      i += 1
      continue
    }
    filtered.push(arg)
  }
  if (filtered.length > 0) fail(`task check 未知参数: ${filtered.join(' ')}`)
  if (!filePath) fail('task check 须指定 --file PATH')
  const result = checkTaskFile(filePath, { noCircular, registryDirs })
  console.log(`文件: ${result.file}`)
  console.log(`task_slug: ${result.task_slug}`)
  if (!result.validation.ok) {
    console.log('schema: FAIL')
    for (const msg of result.validation.errors) console.log(`  - ${msg}`)
    fail('task sidecar 校验失败')
  }
  console.log('schema: OK')
  if (noCircular) {
    if (!result.cycle.ok) {
      console.log(`depends_on: CYCLE ${(result.cycle.cycle ?? []).join(' → ')}`)
      fail('depends_on 存在环')
    }
    console.log('depends_on: acyclic')
  }
}
