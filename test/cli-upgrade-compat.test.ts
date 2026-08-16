import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')
const S2_FILES = [
  ['docs/tasks/keep.md', 'S2-TASK-BODY-v1\n'],
  ['reviews/keep.md', 'S2-REVIEW-BODY-v1\n'],
  ['invokes/by-task/keep.md', 'S2-INVOKE-BODY-v1\n'],
] as const
const OLD_VERSION = '2.24.0'

type RunResult = {
  status: number | null
  combined: string
}

function runCli(args: string[], cwd: string): RunResult {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_TS, ...args],
    { encoding: 'utf8', cwd, env: { ...process.env } },
  )
  return {
    status: result.status,
    combined: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  }
}

function sha256(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex')
}

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-c2-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function writeRel(root: string, rel: string, body: string): Promise<void> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
}

async function seedOldManifest(dir: string): Promise<void> {
  await writeRel(
    dir,
    '.cyning-harness/manifest.json',
    `${JSON.stringify(
      {
        version: OLD_VERSION,
        preset: 'harness-only',
        ide: ['cursor'],
        from_version: null,
        upgraded_at: '2026-01-01T00:00:00Z',
      },
      null,
      2,
    )}\n`,
  )
}

async function seedS2(dir: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {}
  for (const [rel, body] of S2_FILES) {
    await writeRel(dir, rel, body)
    hashes[rel] = sha256(body)
  }
  return hashes
}

async function readManifest(dir: string): Promise<Record<string, unknown>> {
  const raw = await readFile(path.join(dir, '.cyning-harness', 'manifest.json'), 'utf8')
  return JSON.parse(raw) as Record<string, unknown>
}

async function assertS2Unchanged(dir: string, hashes: Record<string, string>): Promise<void> {
  for (const [rel, body] of S2_FILES) {
    const abs = path.join(dir, rel)
    assert.equal(existsSync(abs), true, `S2 missing after upgrade: ${rel}`)
    const now = await readFile(abs, 'utf8')
    assert.equal(now, body, `S2 content changed: ${rel}`)
    assert.equal(sha256(now), hashes[rel], `S2 hash changed: ${rel}`)
  }
}

describe('C2 CLI upgrade compat', { concurrency: 1 }, () => {
  it('C2: 旧 manifest + S2 上 upgrade --yes 钉 1.1.0，from_version=旧号，S2 哈希不变', async () => {
    await withTemp(async (dir) => {
      await seedOldManifest(dir)
      const hashes = await seedS2(dir)
      const r = runCli(['upgrade', '--yes'], dir)
      assert.equal(r.status, 0, r.combined)
      const mf = await readManifest(dir)
      assert.equal(mf.version, '1.1.0')
      assert.notEqual(mf.version, '1.0.0')
      assert.notEqual(mf.version, '0.1.0')
      assert.equal(Object.prototype.hasOwnProperty.call(mf, 'from_version'), true)
      assert.equal(mf.from_version, OLD_VERSION)
      assert.notEqual(mf.from_version, null)
      await assertS2Unchanged(dir, hashes)
    })
  })

  it('C2: 同版再 upgrade --yes 保留跨版 from_version（不为 null）', async () => {
    await withTemp(async (dir) => {
      await seedOldManifest(dir)
      const hashes = await seedS2(dir)
      const first = runCli(['upgrade', '--yes'], dir)
      assert.equal(first.status, 0, first.combined)
      const second = runCli(['upgrade', '--yes'], dir)
      assert.equal(second.status, 0, second.combined)
      const mf = await readManifest(dir)
      assert.equal(mf.version, '1.1.0')
      assert.equal(mf.from_version, OLD_VERSION)
      assert.notEqual(mf.from_version, null)
      await assertS2Unchanged(dir, hashes)
    })
  })

  it('check: 已钉 1.1.0 → 已是最新 exit 0；旧 version → 可升级', async () => {
    await withTemp(async (dir) => {
      await seedOldManifest(dir)
      const before = runCli(['check'], dir)
      assert.equal(before.status, 0, before.combined)
      assert.match(before.combined, /可升级/)
      const up = runCli(['upgrade', '--yes'], dir)
      assert.equal(up.status, 0, up.combined)
      const after = runCli(['check'], dir)
      assert.equal(after.status, 0, after.combined)
      assert.match(after.combined, /已是最新/)
    })
  })

  it('F1: 无 manifest 的空目录 upgrade --yes → 非 0，文案含 init', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['upgrade', '--yes'], dir)
      assert.notEqual(r.status, 0, r.combined)
      assert.match(r.combined, /init/)
    })
  })
})
