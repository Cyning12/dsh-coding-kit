import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fail, parseHarnessMeta, resolveTarget, takeOption } from './cli-shared.ts'

function extractHatId(filename: string): string {
  const base = path.basename(filename, '.md')
  const parts = base.split('_')
  if (parts.length >= 3 && parts[0] === 'invoke') return parts[2]
  return 'unknown'
}

function collectTaskEntryPoints(target: string): Record<
  string,
  { task_markdown: string; entry_points: Record<string, string> }
> {
  const entryBySlug: Record<string, { task_markdown: string; entry_points: Record<string, string> }> = {}
  const taskDirs = [path.join(target, 'docs/tasks/active'), path.join(target, 'docs/tasks/done')]
  for (const dir of taskDirs) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (!name.startsWith('task_') || !name.endsWith('.md')) continue
      const content = readFileSync(path.join(dir, name), 'utf8')
      const meta = parseHarnessMeta(content)
      const slug = meta.task_slug
      if (!slug) continue
      const points: Record<string, string> = {}
      if (meta.entry_invoke_10_task) points['10'] = meta.entry_invoke_10_task
      if (meta.entry_invoke_20) points['20'] = meta.entry_invoke_20
      if (meta.entry_invoke_30) points['30'] = meta.entry_invoke_30
      if (Object.keys(points).length === 0) continue
      entryBySlug[slug] = {
        task_markdown: path.relative(target, path.join(dir, name)).replace(/\\/g, '/'),
        entry_points: points,
      }
    }
  }
  return entryBySlug
}

export function generateInvokeIndex(target: string): string {
  const byTaskDir = path.join(target, 'docs/harness/invokes/by-task')
  const indexFile = path.join(target, '.cyning-harness', 'invoke_index.json')
  const index: {
    schema_version: string
    generated_at: string
    index: Record<
      string,
      {
        task_slug: string
        invokes: { path: string; mtime: number; hat_id: string }[]
        task_markdown?: string
        entry_points?: Record<string, string>
      }
    >
  } = {
    schema_version: '1',
    generated_at: new Date().toISOString(),
    index: {},
  }
  const taskEntries = collectTaskEntryPoints(target)
  if (existsSync(byTaskDir)) {
    for (const entry of readdirSync(byTaskDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const slug = entry.name
      const slugDir = path.join(byTaskDir, slug)
      const invokes: { path: string; mtime: number; hat_id: string }[] = []
      for (const file of readdirSync(slugDir)) {
        if (!file.startsWith('invoke_') || !file.endsWith('.md')) continue
        const full = path.join(slugDir, file)
        const stat = statSync(full)
        invokes.push({
          path: path.relative(target, full).replace(/\\/g, '/'),
          mtime: Math.floor(stat.mtimeMs / 1000),
          hat_id: extractHatId(file),
        })
      }
      invokes.sort((a, b) => a.path.localeCompare(b.path))
      const record: (typeof index.index)[string] = { task_slug: slug, invokes }
      if (taskEntries[slug]) {
        record.task_markdown = taskEntries[slug].task_markdown
        record.entry_points = taskEntries[slug].entry_points
      }
      index.index[slug] = record
    }
  }
  for (const [slug, data] of Object.entries(taskEntries)) {
    if (!index.index[slug]) {
      index.index[slug] = {
        task_slug: slug,
        invokes: [],
        task_markdown: data.task_markdown,
        entry_points: data.entry_points,
      }
    }
  }
  mkdirSync(path.dirname(indexFile), { recursive: true })
  writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`)
  return indexFile
}

export async function cmdSync(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx dsh-coding-kit sync index [--target PATH]`)
    return
  }
  const [sub, ...rest] = args
  if (sub !== 'index') fail(`sync 子命令未知: ${sub ?? '(空)'}\n用法: sync index [--target PATH]`)
  let remaining = rest
  const { value: targetArg, rest: r1 } = takeOption(remaining, '--target')
  remaining = r1
  if (remaining.length > 0) fail(`sync index 未知参数: ${remaining.join(' ')}`)
  const target = resolveTarget(process.cwd(), targetArg)
  const out = generateInvokeIndex(target)
  console.log(`invoke_index: ${out}`)
}
