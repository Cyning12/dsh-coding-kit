import assert from 'node:assert/strict'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
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

  it('T3: 超 MAX_INJECT_CHARS 时按文件边界截断：小文件完整、超大文件不进入、truncated=true（DEF-017）', async () => {
    await withTempCwd(async () => {
      await writeOverride('standards/a.md', 'alpha body')
      await writeOverride('standards/b.md', 'bravo body')
      await writeOverride('standards/zz-big.md', 'X'.repeat(MAX_INJECT_CHARS + 4000))
      const bundle = await loadMarkdownBundle('l1+l2')
      assert.equal(bundle.truncated, true)
      assert.ok(bundle.markdown.includes('alpha body'))
      assert.ok(bundle.markdown.includes('bravo body'))
      assert.ok(!bundle.markdown.includes('X'.repeat(100)), '超大文件正文不得进入 bundle')
      assert.ok(bundle.markdown.includes(`<!-- truncated at ${MAX_INJECT_CHARS} chars -->`))
      assert.ok(bundle.markdown.length <= MAX_INJECT_CHARS + TRUNCATION_MARKER.length)
      assert.deepEqual(bundle.files, ['standards/a.md', 'standards/b.md'])
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

  it('T5: monorepo 子目录启动 → override 根向上查找命中 git root 内 .coding-kit（DEF-017）', async () => {
    await withTempCwd(async (dir) => {
      await mkdir(path.join(dir, '.git'), { recursive: true })
      await writeOverride('standards/ov.md', 'ov root body')
      const sub = path.join(dir, 'sub', 'dir')
      await mkdir(sub, { recursive: true })
      process.chdir(sub)
      const bundle = await loadMarkdownBundle('l1+l2')
      assert.equal(bundle.source, 'override')
      // macOS 上 mkdtemp 返回 /var/... 而 chdir 后 cwd 解析为 /private/var/...，统一 realpath 比较
      assert.equal(bundle.root, path.join(await realpath(dir), '.coding-kit'))
      assert.ok(bundle.markdown.includes('ov root body'))
    })
  })

  it('T6: git root 之外的更上层 .coding-kit 不得命中（防误吸，DEF-017）', async () => {
    await withTempCwd(async (dir) => {
      await writeOverride('standards/decoy.md', 'decoy body')
      const repo = path.join(dir, 'repo')
      await mkdir(path.join(repo, '.git'), { recursive: true })
      const sub = path.join(repo, 'sub')
      await mkdir(sub, { recursive: true })
      process.chdir(sub)
      const bundle = await loadMarkdownBundle('l1+l2')
      assert.equal(bundle.source, 'package')
      assert.ok(!bundle.markdown.includes('decoy body'))
    })
  })
})
