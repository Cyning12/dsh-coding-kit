import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PEER_CORDIS = '@deepseek-ai/cordis'
const PEER_TOOLS = '@deepseek-ai/dsh-tools'

type Pkg = {
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

function resolvePnpm(): string | null {
  const which = spawnSync('which', ['pnpm'], { encoding: 'utf8' })
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim()
  const enable = spawnSync('corepack', ['enable'], { encoding: 'utf8' })
  if (enable.status !== 0) return null
  const again = spawnSync('which', ['pnpm'], { encoding: 'utf8' })
  if (again.status === 0 && again.stdout.trim()) return again.stdout.trim()
  return null
}

describe('1.2.2 peer optional + default pnpm install', { concurrency: 1 }, () => {
  it('P1-1: peerDependencies 仍在且 peerDependenciesMeta optional×2', async () => {
    const pkg = JSON.parse(await readFile(path.join(KIT, 'package.json'), 'utf8')) as Pkg
    assert.ok(pkg.peerDependencies?.[PEER_CORDIS], 'missing peer @deepseek-ai/cordis')
    assert.ok(pkg.peerDependencies?.[PEER_TOOLS], 'missing peer @deepseek-ai/dsh-tools')
    assert.equal(pkg.peerDependenciesMeta?.[PEER_CORDIS]?.optional, true)
    assert.equal(pkg.peerDependenciesMeta?.[PEER_TOOLS]?.optional, true)
  })

  it('P1-2: 干净 fixture 默认 pnpm add -D file:kit → exit 0 且无 dsh-type-meta', async () => {
    const pnpm = resolvePnpm()
    assert.ok(
      pnpm,
      '环境无 pnpm：已尝试 corepack enable 仍失败；阻塞 P1-2（须装 pnpm 或 corepack）',
    )

    const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-peer-opt-'))
    try {
      await writeFile(
        path.join(dir, 'package.json'),
        `${JSON.stringify({ name: 'dsh-ck-peer-opt-fixture', version: '0.0.0', private: true }, null, 2)}\n`,
        'utf8',
      )
      // 禁止预写 auto-install-peers=false（冒充默认配置）
      assert.equal(existsSync(path.join(dir, '.npmrc')), false)

      const add = spawnSync(
        pnpm,
        ['add', '-D', `file:${KIT}`],
        {
          encoding: 'utf8',
          cwd: dir,
          env: { ...process.env },
          timeout: 180_000,
        },
      )
      const combined = `${add.stdout ?? ''}\n${add.stderr ?? ''}`
      assert.equal(add.status, 0, combined)
      assert.equal(
        /dsh-type-meta/i.test(combined),
        false,
        `安装输出不得含 dsh-type-meta:\n${combined}`,
      )
      assert.equal(existsSync(path.join(dir, 'node_modules', 'dsh-coding-kit')), true)

      const help = spawnSync(pnpm, ['exec', 'dsh-coding-kit', '--help'], {
        encoding: 'utf8',
        cwd: dir,
        env: { ...process.env },
        timeout: 60_000,
      })
      const helpOut = `${help.stdout ?? ''}\n${help.stderr ?? ''}`
      assert.equal(help.status, 0, helpOut)
      assert.match(helpOut, /dsh-coding-kit/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
