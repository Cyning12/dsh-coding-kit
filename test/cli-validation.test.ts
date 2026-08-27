import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

type RunResult = {
  status: number | null
  stdout: string
  stderr: string
  combined: string
}

function runCli(args: string[], cwd: string): RunResult {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_TS, ...args],
    { encoding: 'utf8', cwd, env: { ...process.env } },
  )
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  return {
    status: result.status,
    stdout,
    stderr,
    combined: `${stdout}\n${stderr}`,
  }
}

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-validation-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function seedManifest(
  dir: string,
  version: string,
  fromVersion: string | null = null,
): Promise<void> {
  const abs = path.join(dir, '.cyning-harness', 'manifest.json')
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(
    abs,
    `${JSON.stringify(
      {
        version,
        preset: 'harness-only',
        ide: [],
        from_version: fromVersion,
        upgraded_at: '2026-01-01T00:00:00Z',
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
}

const MANIFEST_REL = path.join('.cyning-harness', 'manifest.json')

describe('DEF-013 init/upgrade/check 取值与版本校验（D1 钉 harness-only · D2 移除 --force 静默吞 · D3 三向判定）', { concurrency: 1 }, () => {
  // T1: preset 词表校验
  it('T1 负例: init --preset bogus → status 非 0，含非法值与词表，manifest 不写入', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'bogus', '--yes', '--target', dir], dir)
      assert.notEqual(r.status, 0, r.combined)
      assert.match(r.combined, /bogus/)
      assert.match(r.combined, /harness-only/)
      assert.equal(existsSync(path.join(dir, MANIFEST_REL)), false, '非法 preset 不得写入 manifest')
    })
  })

  it('T1 正例: init --preset harness-only → status 0 且 manifest.preset 钉 harness-only', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'harness-only', '--yes', '--target', dir], dir)
      assert.equal(r.status, 0, r.combined)
      const mf = JSON.parse(await readFile(path.join(dir, MANIFEST_REL), 'utf8')) as {
        preset: string
      }
      assert.equal(mf.preset, 'harness-only')
    })
  })

  it('T1 缺省: init 不带 --preset → status 0 且 manifest.preset 缺省 harness-only', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--yes', '--target', dir], dir)
      assert.equal(r.status, 0, r.combined)
      const mf = JSON.parse(await readFile(path.join(dir, MANIFEST_REL), 'utf8')) as {
        preset: string
      }
      assert.equal(mf.preset, 'harness-only')
    })
  })

  // T2: upgrade --force 不再静默吞
  it('T2: upgrade --force --yes → status 非 0，输出含 force，manifest.version 不被改写', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.2.0')
      const r = runCli(['upgrade', '--force', '--yes'], dir)
      assert.notEqual(r.status, 0, r.combined)
      assert.match(r.combined, /force/)
      assert.match(r.combined, /未知参数|未支持/)
      const mf = JSON.parse(await readFile(path.join(dir, MANIFEST_REL), 'utf8')) as {
        version: string
      }
      assert.equal(mf.version, '1.2.0', '被拒后 manifest.version 不得改写')
    })
  })

  it('T2 回归: upgrade --yes → status 0，version 钉包版本', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.2.0')
      const r = runCli(['upgrade', '--yes'], dir)
      assert.equal(r.status, 0, r.combined)
      const mf = JSON.parse(await readFile(path.join(dir, MANIFEST_REL), 'utf8')) as {
        version: string
        from_version: string
      }
      assert.equal(mf.version, '1.8.0')
      assert.equal(mf.from_version, '1.2.0')
    })
  })

  // T3: check semver 三向判定
  it('T3 高版本: manifest 99.0.0 > 包版本 → status 0，不含「可升级」，含高版本提示', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '99.0.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.doesNotMatch(r.combined, /可升级/)
      assert.match(r.combined, /高于包版本/)
      assert.doesNotMatch(r.combined, /upgrade --yes/, '高版本分支不得建议 upgrade')
    })
  })

  it('T3 低版本回归: manifest 1.2.0 < 包版本 → status 0，含「可升级」', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.2.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /可升级/)
    })
  })

  it('T3 等版本回归: manifest 1.8.0 = 包版本 → status 0，含「已是最新」', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.8.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /已是最新/)
    })
  })

  // --help 不被新校验拦截（DEF-010 交互）
  it('init --help / upgrade --help / check --help → exit 0 usage', async () => {
    await withTemp(async (dir) => {
      for (const cmd of ['init', 'upgrade', 'check']) {
        const r = runCli([cmd, '--help'], dir)
        assert.equal(r.status, 0, r.combined)
        assert.match(r.combined, new RegExp(`${cmd} \\[`))
      }
    })
  })
})

describe('DEF-028 check 跨产品线迁移语义（from_version 非 null + 版本高于 → 迁移文案，不再误报降级；exit 码不变）', { concurrency: 1 }, () => {
  it('D28-1: version=2.24.0 + from_version=2.24.0（旧包迁来）→ 跨产品线迁移文案、建议 upgrade、无降级警告', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '2.24.0', '2.24.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /跨产品线迁移/, r.combined)
      assert.match(r.combined, /@cyning\/harness 2\.24\.0/, r.combined)
      assert.match(r.combined, /dsh-coding-kit 1\.8\.0/, r.combined)
      assert.match(r.combined, /npx dsh-coding-kit upgrade --yes/, '迁移分支须建议 upgrade')
      assert.doesNotMatch(r.combined, /降级安装/, '跨产品线迁移场景不得报降级警告')
    })
  })

  it('D28-2: version=2.24.0 + from_version=null → 保留原「可能为降级安装」三向判定', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '2.24.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /高于包版本（可能为降级安装）/, r.combined)
      assert.doesNotMatch(r.combined, /跨产品线迁移/, 'from_version=null 不得走迁移分支')
      assert.doesNotMatch(r.combined, /upgrade --yes/, '降级分支不得建议 upgrade')
    })
  })

  it('D28-3: from_version 非 null 但版本相等/低于 → 走原「已是最新 / 可升级」分支', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.8.0', '1.2.0')
      const r1 = runCli(['check'], dir)
      assert.equal(r1.status, 0, r1.combined)
      assert.match(r1.combined, /已是最新/, r1.combined)
      assert.doesNotMatch(r1.combined, /跨产品线迁移/)
      await seedManifest(dir, '1.2.0', '1.1.0')
      const r2 = runCli(['check'], dir)
      assert.equal(r2.status, 0, r2.combined)
      assert.match(r2.combined, /可升级/, r2.combined)
      assert.doesNotMatch(r2.combined, /跨产品线迁移/)
    })
  })
})

describe('DEF-030 check 跨产品线判据收窄（仅旧包 2.x 产品线 from_version 走迁移文案；kit 线 1.x 回落降级语义）', { concurrency: 1 }, () => {
  it('D30-1: version=2.24.0 + from_version=2.20.0（旧包 2.x 产品线）→ 跨产品线迁移文案', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '2.24.0', '2.20.0')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /跨产品线迁移/, r.combined)
      assert.match(r.combined, /npx dsh-coding-kit upgrade --yes/, '迁移分支须建议 upgrade')
      assert.doesNotMatch(r.combined, /降级安装/, '旧产品线迁移不得报降级警告')
    })
  })

  it('D30-2: version=1.9.0 + from_version=1.5.1（kit 线 1.x · 高于包）→ 回落原「可能为降级安装」语义，不走迁移文案', async () => {
    await withTemp(async (dir) => {
      await seedManifest(dir, '1.9.0', '1.5.1')
      const r = runCli(['check'], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /高于包版本（可能为降级安装）/, r.combined)
      assert.doesNotMatch(r.combined, /跨产品线迁移/, 'kit 线 from_version 不得走迁移分支')
      assert.doesNotMatch(r.combined, /upgrade --yes/, '降级分支不得建议 upgrade')
    })
  })
})
