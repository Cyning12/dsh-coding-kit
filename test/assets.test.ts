import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { loadMarkdownBundle } from '../src/index.ts'

const MAX_INJECT_CHARS = 24_000
const TRUNCATION_MARKER = `\n\n<!-- truncated at ${MAX_INJECT_CHARS} chars -->\n`

async function withTempCwd(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-assets-'))
  const prev = process.cwd()
  process.chdir(dir)
  try {
    await fn(dir)
  } finally {
    process.chdir(prev)
    await rm(dir, { recursive: true, force: true })
  }
}

async function writeOverride(rel: string, body: string): Promise<void> {
  const abs = path.join(process.cwd(), '.coding-kit', rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
}

describe('T2/T3/T4 loadMarkdownBundle', { concurrency: 1 }, () => {
  it('T2: 临时 standards + coding_wiki fixture 含 # Coding Standards 与文件名二级标题', async () => {
    await withTempCwd(async () => {
      await writeOverride('standards/sample.md', 'standard body')
      await writeOverride('coding_wiki/wiki.md', 'wiki body')
      const bundle = await loadMarkdownBundle('full')
      assert.ok(bundle.markdown.startsWith('# Coding Standards'))
      assert.ok(bundle.markdown.includes('## standards/sample.md'))
      assert.ok(bundle.markdown.includes('## coding_wiki/wiki.md'))
      assert.ok(bundle.markdown.includes('standard body'))
      assert.ok(bundle.markdown.includes('wiki body'))
    })
  })

  it('T3: 超 MAX_INJECT_CHARS 时 truncated=true 且长度不超过上限+截断标记', async () => {
    await withTempCwd(async () => {
      await writeOverride('standards/big.md', 'X'.repeat(MAX_INJECT_CHARS + 4000))
      const bundle = await loadMarkdownBundle('l1+l2')
      assert.equal(bundle.truncated, true)
      assert.ok(bundle.markdown.includes(`<!-- truncated at ${MAX_INJECT_CHARS} chars -->`))
      assert.ok(bundle.markdown.length <= MAX_INJECT_CHARS + TRUNCATION_MARKER.length)
    })
  })

  it('T4: cwd 下 .coding-kit/ 存在时 source=override', async () => {
    await withTempCwd(async () => {
      await writeOverride('standards/only.md', 'override only')
      const bundle = await loadMarkdownBundle('l1+l2')
      assert.equal(bundle.source, 'override')
      assert.ok(bundle.root.endsWith('.coding-kit'))
    })
  })
})
