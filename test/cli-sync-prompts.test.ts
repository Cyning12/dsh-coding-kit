import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { listSyncPromptEntries, SYNC_PROMPT_FILES } from '../src/cli-sync-prompts.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

type RunResult = { status: number | null; stdout: string; stderr: string; combined: string }

function runCli(args: string[], cwd = KIT): RunResult {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', CLI_TS, ...args], {
    encoding: 'utf8',
    cwd,
    env: { ...process.env },
  })
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  return { status: result.status, stdout, stderr, combined: `${stdout}\n${stderr}` }
}

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-sp-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function writeRel(root: string, rel: string, body: string): Promise<string> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
  return abs
}

async function seedManifest(root: string): Promise<void> {
  await writeRel(
    root,
    '.cyning-harness/manifest.json',
    JSON.stringify(
      { version: '1.0.0', preset: 'harness-only', ide: [], from_version: null, upgraded_at: '2026-01-01T00:00:00Z' },
      null,
      2,
    ) + '\n',
  )
}

describe('sync prompts · 前置与 help', { concurrency: 1 }, () => {
  it('无 manifest → fail exit 1', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['sync', 'prompts', '--target', dir], KIT)
      assert.equal(r.status, 1)
      assert.match(r.combined, /manifest\.json/)
    })
  })

  it('sync --help 与 sync prompts --help 列出子命令', () => {
    const root = runCli(['sync', '--help'])
    assert.equal(root.status, 0)
    assert.match(root.combined, /sync prompts/)
    assert.match(root.combined, /sync index/)

    const sub = runCli(['sync', 'prompts', '--help'])
    assert.equal(sub.status, 0)
    assert.match(sub.combined, /sync prompts/)
    assert.doesNotMatch(sub.combined, /gate-check/)
  })

  it('根 usage 含 sync prompts', () => {
    const r = runCli(['--help'])
    assert.match(r.combined, /sync prompts/)
  })
})

describe('sync prompts · 三分与 dry-run', { concurrency: 1 }, () => {
  it('dry-run 默认：全 add · 零写入', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const r = runCli(['sync', 'prompts', '--target', dir], KIT)
      assert.equal(r.status, 0)
      assert.match(r.combined, /dry-run/)
      assert.match(r.combined, /add \(/)
      for (const entry of listSyncPromptEntries()) {
        assert.match(r.combined, new RegExp(entry.targetRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        assert.equal(existsSync(path.join(dir, entry.targetRel)), false)
      }
    })
  })

  it('--yes 写入 add · 目标目录不存在时 mkdir', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const r = runCli(['sync', 'prompts', '--target', dir, '--yes'], KIT)
      assert.equal(r.status, 0)
      for (const entry of listSyncPromptEntries()) {
        const dest = path.join(dir, entry.targetRel)
        assert.ok(existsSync(dest), dest)
        const pkgBody = readFileSync(path.join(KIT, entry.packageRel), 'utf8')
        assert.equal(await readFile(dest, 'utf8'), pkgBody)
      }
    })
  })

  it('二跑 --yes 全 skip（幂等）', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      assert.equal(runCli(['sync', 'prompts', '--target', dir, '--yes'], KIT).status, 0)
      const second = runCli(['sync', 'prompts', '--target', dir, '--yes'], KIT)
      assert.equal(second.status, 0)
      assert.match(second.combined, /skip \(/)
      assert.match(second.combined, /add \(0\)/)
    })
  })

  it('conflict 默认不覆盖 · stdout 含对照包内路径', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const entry = listSyncPromptEntries()[0]
      await writeRel(dir, entry.targetRel, 'LOCAL-MODIFIED-BODY\n')
      const dry = runCli(['sync', 'prompts', '--target', dir], KIT)
      assert.equal(dry.status, 0)
      assert.match(dry.combined, /conflict \(/)
      assert.match(dry.combined, /本地已改 · 未覆盖/)
      assert.match(dry.combined, new RegExp(entry.packageRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

      const apply = runCli(['sync', 'prompts', '--target', dir, '--yes'], KIT)
      assert.equal(apply.status, 1)
      assert.equal(await readFile(path.join(dir, entry.targetRel), 'utf8'), 'LOCAL-MODIFIED-BODY\n')
    })
  })

  it('--force 覆盖 conflict', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const entry = listSyncPromptEntries()[0]
      await writeRel(dir, entry.targetRel, 'LOCAL-MODIFIED-BODY\n')
      const pkgBody = readFileSync(path.join(KIT, entry.packageRel), 'utf8')
      const r = runCli(['sync', 'prompts', '--target', dir, '--yes', '--force'], KIT)
      assert.equal(r.status, 0)
      assert.equal(await readFile(path.join(dir, entry.targetRel), 'utf8'), pkgBody)
    })
  })
})

describe('sync prompts · --json', { concurrency: 1 }, () => {
  it('dry-run JSON 形状', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const r = runCli(['sync', 'prompts', '--target', dir, '--json'], KIT)
      assert.equal(r.status, 0)
      const body = JSON.parse(r.stdout) as {
        dry_run: boolean
        skip: string[]
        add: string[]
        conflict: string[]
        written: string[]
      }
      assert.equal(body.dry_run, true)
      assert.ok(Array.isArray(body.skip))
      assert.equal(body.add.length, listSyncPromptEntries().length)
      assert.deepEqual(body.written, [])
    })
  })

  it('--yes JSON written 与 skip 分区', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const first = listSyncPromptEntries()[0]
      await writeRel(dir, first.targetRel, readFileSync(path.join(KIT, first.packageRel), 'utf8'))
      const r = runCli(['sync', 'prompts', '--target', dir, '--yes', '--json'], KIT)
      assert.equal(r.status, 0)
      const body = JSON.parse(r.stdout) as {
        dry_run: boolean
        skip: string[]
        add: string[]
        written: string[]
      }
      assert.equal(body.dry_run, false)
      assert.ok(body.skip.includes(first.targetRel))
      assert.equal(body.add.length, listSyncPromptEntries().length - 1)
      assert.equal(body.written.length, body.add.length)
    })
  })
})

describe('sync prompts · upgrade 提示行', { concurrency: 1 }, () => {
  it('upgrade 成功 stdout 含 sync prompts 提示', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir)
      const r = runCli(['upgrade', '--target', dir, '--yes'], KIT)
      assert.equal(r.status, 0)
      assert.match(r.combined, /sync prompts --yes/)
    })
  })
})

describe('sync prompts · 白名单钉死', { concurrency: 1 }, () => {
  it('Starter 11 文件 + TASK_TEMPLATE 共 12 项', () => {
    assert.equal(listSyncPromptEntries().length, 12)
    assert.ok(listSyncPromptEntries().every((e) => e.targetRel.startsWith('docs/harness/')))
    assert.ok(SYNC_PROMPT_FILES.includes('FRAGMENT_hat_reanchor_v1_zh.md'))
    assert.ok(SYNC_PROMPT_FILES.includes('FRAGMENT_00_delegate_only_v1_zh.md'))
  })
})
