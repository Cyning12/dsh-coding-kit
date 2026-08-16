import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { copyDirNoClobber } from '../src/index.ts'

async function writeRel(root: string, rel: string, body: string): Promise<void> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
}

describe('T5 init / copyDirNoClobber', { concurrency: 1 }, () => {
  it('T5: 已存在 skip、S2 路径 skip、新文件 copied', async () => {
    const src = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-src-'))
    const dest = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-dest-'))
    try {
      await writeRel(src, 'hello.md', 'new-hello')
      await writeRel(src, 'standards/ok.md', 'copied-ok')
      await writeRel(src, 'docs/tasks/foo.md', 's2-tasks')
      await writeRel(src, 'reviews/r.md', 's2-reviews')
      await writeRel(src, 'invokes/by-task/x.md', 's2-invokes')
      await writeRel(dest, 'hello.md', 'keep-hello')

      const result = await copyDirNoClobber(src, dest)

      assert.ok(result.copied.includes('standards/ok.md'))
      assert.equal(result.copied.includes('hello.md'), false)
      assert.ok(result.skipped.includes('hello.md'))
      assert.ok(result.skipped.includes('docs/tasks'))
      assert.ok(result.skipped.includes('reviews'))
      assert.ok(result.skipped.includes('invokes/by-task'))

      assert.equal(await readFile(path.join(dest, 'hello.md'), 'utf8'), 'keep-hello')
      assert.equal(await readFile(path.join(dest, 'standards', 'ok.md'), 'utf8'), 'copied-ok')
      assert.equal(existsSync(path.join(dest, 'docs', 'tasks', 'foo.md')), false)
      assert.equal(existsSync(path.join(dest, 'reviews', 'r.md')), false)
      assert.equal(existsSync(path.join(dest, 'invokes', 'by-task', 'x.md')), false)
    } finally {
      await rm(src, { recursive: true, force: true })
      await rm(dest, { recursive: true, force: true })
    }
  })
})
