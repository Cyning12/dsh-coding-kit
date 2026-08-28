import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import {
  buildGraphPayload,
  compileGraph,
  contentStamp,
  generateMarkdown,
} from '../src/cli-graph-yaml.ts'

const STAMP_RE = /^sha256-[a-f0-9]{16}$/
const MIN_YAML = [
  'graph_id: "t_stamp"',
  'title: "content stamp fixture"',
  'nodes:',
  '  - id: "a"',
  '    label: "A"',
  '  - id: "b"',
  '    label: "B"',
  'edges:',
  '  - from: "a"',
  '    to: "b"',
  '    label: "->"',
  '',
].join('\n')

function frontmatterStamp(md: string): string {
  const m = md.match(/^generated_at:\s*(\S+)\s*$/m)
  assert.ok(m, 'md frontmatter 须含 generated_at')
  return m[1] as string
}

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-graph-stamp-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('compile/export generated_at 源内容派生（幂等 · 非 wall-clock）', { concurrency: 1 }, () => {
  it('contentStamp 同字节同值、改字节则变', () => {
    assert.match(contentStamp('abc'), STAMP_RE)
    assert.equal(contentStamp('abc'), contentStamp('abc'))
    assert.notEqual(contentStamp('abc'), contentStamp('abd'))
  })

  it('generateMarkdown 无 sourceRaw 时对同一 data 两次字节相等', () => {
    const data = { graph_id: 't_stamp', title: 'x', nodes: [{ id: 'a', label: 'A' }], edges: [] }
    const a = generateMarkdown(data)
    const b = generateMarkdown(data)
    assert.equal(a, b)
    assert.match(frontmatterStamp(a), STAMP_RE)
  })

  it('compile 同 yaml 两次 md 字节相等；改 yaml 则 stamp 变', async () => {
    await withTemp(async (dir) => {
      const yamlPath = path.join(dir, 't_stamp.graph.yaml')
      await writeFile(yamlPath, MIN_YAML, 'utf8')
      const p1 = compileGraph('t_stamp', dir)
      const md1 = await readFile(p1, 'utf8')
      const p2 = compileGraph('t_stamp', dir)
      const md2 = await readFile(p2, 'utf8')
      assert.equal(p1, p2)
      assert.equal(md1, md2)
      const stamp1 = frontmatterStamp(md1)
      assert.match(stamp1, STAMP_RE)
      assert.equal(stamp1, contentStamp(MIN_YAML))

      await writeFile(yamlPath, MIN_YAML.replace('title: "content stamp fixture"', 'title: "changed"'), 'utf8')
      compileGraph('t_stamp', dir)
      const md3 = await readFile(p1, 'utf8')
      assert.notEqual(md3, md1)
      assert.notEqual(frontmatterStamp(md3), stamp1)
      assert.match(frontmatterStamp(md3), STAMP_RE)
    })
  })

  it('export 同 yaml 语料两次 generated_at 相等；opts.generatedAt 可覆盖', async () => {
    await withTemp(async (dir) => {
      await writeFile(path.join(dir, 't_stamp.graph.yaml'), MIN_YAML, 'utf8')
      const a = buildGraphPayload(dir)
      const b = buildGraphPayload(dir)
      assert.equal(a.generated_at, b.generated_at)
      assert.match(String(a.generated_at), STAMP_RE)
      const forced = buildGraphPayload(dir, { generatedAt: 'forced-stamp' })
      assert.equal(forced.generated_at, 'forced-stamp')
    })
  })
})
