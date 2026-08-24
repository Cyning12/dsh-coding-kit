import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'coding-kit'
export const inject = ['tools', 'systemPrompt']

const CONTEXT_NAME = 'coding-kit.standards'
const MAX_INJECT_CHARS = 24_000
const S2_SKIP_PREFIXES = ['docs/tasks', 'reviews', 'invokes/by-task'] as const

type Profile = 'l1' | 'l1+l2' | 'full'
type AssetSource = 'override' | 'package'

interface SystemPromptApi {
  context: (entry: {
    name: string
    order: number
    text: string | (() => string)
  }) => () => void
}

function packageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '..')
}

function defaultAssetsRoot(): string {
  return path.join(packageRoot(), 'assets')
}

// DEF-017: 从 cwd 逐级向上探测 .coding-kit / .dsh/coding-kit，
// 在最近的含 .git 的祖先目录处截止（git root 内向上查找；无 .git 时查到文件系统根）。
function userOverrideRoot(): string | undefined {
  let dir = process.cwd()
  for (;;) {
    const candidates = [
      path.join(dir, '.coding-kit'),
      path.join(dir, '.dsh', 'coding-kit'),
    ]
    const hit = candidates.find((candidate) => existsSync(candidate))
    if (hit) return hit
    if (existsSync(path.join(dir, '.git'))) return undefined
    const parent = path.dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

function resolveReadRoot(): { root: string; source: AssetSource } {
  const override = userOverrideRoot()
  if (override) return { root: override, source: 'override' }
  return { root: defaultAssetsRoot(), source: 'package' }
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return []
  const out: string[] = []
  const walk = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(current, ent.name)
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue
        await walk(full)
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        out.push(full)
      }
    }
  }
  await walk(dir)
  out.sort((a, b) => a.localeCompare(b))
  return out
}

function includeForProfile(profile: Profile, relFromRoot: string): boolean {
  const n = relFromRoot.replace(/\\/g, '/')
  const inStandards = n.startsWith('standards/')
  const inWiki = n.startsWith('coding_wiki/')
  if (!inStandards && !inWiki) return false
  if (profile === 'l1' && inStandards) {
    return n.includes('L1') || n.endsWith('README.md') || n.includes('SOURCES')
  }
  return true
}

export async function loadMarkdownBundle(profile: Profile): Promise<{
  markdown: string
  files: string[]
  truncated: boolean
  source: AssetSource
  root: string
}> {
  const { root, source } = resolveReadRoot()
  const files: string[] = []
  for (const relDir of ['standards', 'coding_wiki']) {
    const found = await listMarkdownFiles(path.join(root, relDir))
    for (const abs of found) {
      const rel = path.relative(root, abs)
      if (!includeForProfile(profile, rel)) continue
      files.push(abs)
    }
  }

  const parts: string[] = [
    '# Coding Standards',
    '',
    'Follow these project coding standards and context wiki when generating or modifying code.',
    'Do not ignore these constraints in favor of generic style.',
    '',
  ]
  // DEF-017: 按文件边界截断——追加下一文件前预算长度，超限则跳过该文件及其余文件；
  // files 只列实际注入的文件，被略文件可由 root 下全集减去 files 推出。
  const injectedFiles: string[] = []
  let truncated = false
  for (const file of files) {
    const rel = path.relative(root, file)
    const body = (await readFile(file, 'utf8')).trim()
    const candidate = [...parts, `## ${rel}`, '', body, ''].join('\n')
    if (candidate.length > MAX_INJECT_CHARS) {
      truncated = true
      break
    }
    parts.push(`## ${rel}`, '', body, '')
    injectedFiles.push(rel)
  }

  let markdown = parts.join('\n')
  if (truncated) {
    markdown = `${markdown}\n\n<!-- truncated at ${MAX_INJECT_CHARS} chars -->\n`
  }
  return {
    markdown,
    files: injectedFiles,
    truncated,
    source,
    root,
  }
}

function isS2Path(destRel: string): boolean {
  const n = destRel.replace(/\\/g, '/')
  return S2_SKIP_PREFIXES.some((seg) => n === seg || n.startsWith(`${seg}/`))
}

export async function copyDirNoClobber(
  src: string,
  dest: string,
): Promise<{ copied: string[]; skipped: string[] }> {
  const copied: string[] = []
  const skipped: string[] = []
  const walk = async (current: string, destCurrent: string, rel: string): Promise<void> => {
    if (!existsSync(current)) return
    const entries = await readdir(current, { withFileTypes: true })
    await mkdir(destCurrent, { recursive: true })
    for (const ent of entries) {
      const from = path.join(current, ent.name)
      const to = path.join(destCurrent, ent.name)
      const childRel = rel ? `${rel}/${ent.name}` : ent.name
      if (isS2Path(childRel)) {
        skipped.push(childRel)
        continue
      }
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue
        await walk(from, to, childRel)
      } else if (ent.isFile()) {
        if (existsSync(to)) {
          skipped.push(childRel)
          continue
        }
        await copyFile(from, to)
        copied.push(childRel)
      }
    }
  }
  await walk(src, dest, '')
  return { copied, skipped }
}

function maybeLegacyHint(): string {
  const markers = [
    path.join(process.cwd(), '.cyning-harness'),
    path.join(process.cwd(), 'docs', 'harness'),
  ]
  if (markers.some((p) => existsSync(p))) {
    return 'hint: detected legacy cyning-harness layout; this plugin does not run verify/gate-check. See README.'
  }
  return ''
}

export function apply(ctx: Context): void {
  const systemPrompt = ctx.get('systemPrompt') as SystemPromptApi | undefined
  let disposeContext: (() => void) | undefined

  ctx.tools.register(defineTool({
    name: 'apply_coding_standards',
    description:
      'Load ICVO coding standards and coding_wiki from dsh-coding-kit assets ' +
      '(or project .coding-kit override) and inject them into this session. ' +
      'Does nothing until explicitly called. Use when the user asks to apply coding standards, ' +
      'follow the coding kit, or generate code under project discipline.',
    parameters: {
      profile: {
        type: 'string',
        enum: ['l1', 'l1+l2', 'full'],
        description: 'l1 = L1 + wiki; l1+l2 = all standards + wiki (default); full: currently equivalent to l1+l2, reserved for extended bundles.',
      },
      persist: {
        type: 'boolean',
        description: 'Default true: register systemPrompt.context for later turns. False: one-shot tool result only.',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args) {
      const profile = (args.profile as Profile | undefined) ?? 'l1+l2'
      const persist = args.persist !== false
      const bundle = await loadMarkdownBundle(profile)
      const hint = maybeLegacyHint()

      if (bundle.files.length === 0) {
        return `apply_coding_standards: no markdown files under ${bundle.root} (source=${bundle.source}).`
      }

      if (persist) {
        if (!systemPrompt) {
          return [
            'apply_coding_standards: persist requested but systemPrompt service is unavailable.',
            `source=${bundle.source} files=${bundle.files.length}`,
            'Fallback: one-shot preview follows.',
            hint,
            '',
            bundle.markdown.slice(0, 4000),
          ].filter(Boolean).join('\n')
        }
        disposeContext?.()
        disposeContext = systemPrompt.context({
          name: CONTEXT_NAME,
          order: 50,
          text: bundle.markdown,
        })
      }

      const lines = [
        persist
          ? 'Coding standards registered into system prompt context `coding-kit.standards`.'
          : 'Coding standards returned one-shot (not persisted into system prompt).',
        `profile=${profile} source=${bundle.source} root=${bundle.root}`,
        `files=${bundle.files.length} truncated=${bundle.truncated} chars=${bundle.markdown.length}`,
        ...bundle.files.map((f) => `- ${f}`),
        hint,
      ]
      if (!persist) {
        lines.push('', bundle.markdown)
      }
      return lines.filter(Boolean).join('\n')
    },
  }))

  ctx.tools.register(defineTool({
    name: 'init_coding_kit',
    description:
      'Copy coding-kit template assets into this project without overwriting existing files. ' +
      'Never writes docs/tasks, reviews, or invokes/by-task (S2). Call only when the user asks to initialize templates.',
    parameters: {
      dest: {
        type: 'string',
        enum: ['.coding-kit', '.dsh/coding-kit'],
        description: 'Destination relative to process.cwd(). Default .coding-kit',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args) {
      const destRel = (args.dest as string | undefined) ?? '.coding-kit'
      if (destRel !== '.coding-kit' && destRel !== '.dsh/coding-kit') {
        return 'init_coding_kit: dest not allowed'
      }
      const dest = path.resolve(process.cwd(), destRel)
      const src = defaultAssetsRoot()
      if (!existsSync(src)) {
        return `init_coding_kit failed: package assets not found at ${src}`
      }
      const result = await copyDirNoClobber(src, dest)
      return [
        `init_coding_kit: dest=${dest}`,
        `copied=${result.copied.length} skipped_existing_or_s2=${result.skipped.length}`,
        result.copied.length ? `copied:\n${result.copied.map((f) => `- ${f}`).join('\n')}` : '',
        result.skipped.length
          ? `skipped:\n${result.skipped.slice(0, 50).map((f) => `- ${f}`).join('\n')}`
          : '',
      ].filter(Boolean).join('\n')
    },
  }))
}
