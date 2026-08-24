import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
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

function runCli(args: string[], cwd = KIT): RunResult {
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

describe('DEF-012 verify --spec 文案去版本号化 + 退出码归 1（D1=A · D2=A · D3=A）', { concurrency: 1 }, () => {
  it('verify --spec foo → exit 1，stderr 不含版本号叙事，含「未交付/不支持」状态描述', () => {
    const r = runCli(['verify', '--spec', 'foo'])
    assert.equal(r.status, 1, r.combined)
    assert.equal(/1\.2\.0/.test(r.combined), false, `版本号叙事未清除: ${r.combined}`)
    assert.equal(/1\.2\.x/.test(r.combined), false, `版本号叙事未清除: ${r.combined}`)
    assert.match(r.combined, /未交付|不支持/)
    assert.match(r.combined, /verify --spec/)
  })

  it('verify --task x --spec foo（带 --task）→ 同口径 exit 1', () => {
    const r = runCli(['verify', '--task', 'whatever.md', '--spec', 'foo'])
    assert.equal(r.status, 1, r.combined)
    assert.equal(/1\.2\.0/.test(r.combined), false)
    assert.match(r.combined, /未交付|不支持/)
  })

  it('exit 2 族恢复纯闸语义：--spec 不再出现在 fail(..., 2) 路径（源码级钉死）', async () => {
    const { readFile } = await import('node:fs/promises')
    const src = await readFile(CLI_TS, 'utf8')
    assert.equal(src.includes('1.2.0 范围'), false, 'src/cli.ts 仍含 1.2.0 范围 叙事')
    const fail2Lines = src.split('\n').filter((l) => /fail\(.+,\s*2\)/.test(l))
    assert.equal(
      fail2Lines.some((l) => l.includes('notDelivered') || l.includes('未交付')),
      false,
      `notDelivered 仍走 exit 2: ${fail2Lines.join(' | ')}`,
    )
  })

  it('回归：不带 --spec 的 verify 缺 --task → exit 1 提示须指定（行为不变）', () => {
    const r = runCli(['verify'])
    assert.equal(r.status, 1, r.combined)
    assert.match(r.combined, /须指定 --task FILE/)
  })
})
