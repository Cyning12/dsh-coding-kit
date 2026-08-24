import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
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

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-flags-'))
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

function taskMd(opts: { slug: string; audit?: string; draft?: string }): string {
  const audit = opts.audit ?? 'approved'
  const draft = opts.draft ?? 'approved'
  return [
    `# Task ${opts.slug}`,
    '',
    '> **状态**：`draft`',
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    '| **test_strategy** | `recommended` |',
    '',
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    `| HG-TASK-DRAFT | ${draft} | 20,30 | fixture |`,
    `| HG-AUDIT-R1 | ${audit} | 30 | fixture |`,
    '',
    '## 验收标准',
    '',
    '- [ ] fixture item',
    '',
    '## 失败路径',
    '',
    '| F | Scenario |',
    '|---|----------|',
    '| F1 | fixture |',
    '',
    '### 自检结论（执行者）',
    '',
    '（30/40 回填）',
    '',
  ].join('\n')
}

const APPROVED_REL = 'docs/tasks/active/task_flags_ok_v1.md'
const PENDING_REL = 'docs/tasks/active/task_flags_pending_v1.md'

async function seedFixtures(dir: string): Promise<void> {
  await writeRel(dir, APPROVED_REL, taskMd({ slug: 'flags_ok' }))
  await writeRel(dir, PENDING_REL, taskMd({ slug: 'flags_pending', audit: 'pending', draft: 'pending' }))
}

describe('DEF-011 verify/gate-check 旗标不再静默吞（D1 fail-fast · D2 --json 最小接通 · D3 拒绝）', { concurrency: 1 }, () => {
  // D1/D3: 无实现语义的旗标一律 exit 1，不再被 filter 丢弃
  const VERIFY_REJECTED: string[][] = [
    ['--allow-invoke-gap'],
    ['--allow-no-review'],
    ['--allow-lint-fail'],
    ['--agent-hint'],
    ['--graph'],
    ['--workspace-root', '/tmp'],
  ]
  for (const extra of VERIFY_REJECTED) {
    it(`verify --task <f> ${extra.join(' ')} → exit 1 且含「未知参数」或「未支持」`, async () => {
      await withTemp(async (dir) => {
        await seedFixtures(dir)
        const r = runCli(['verify', '--task', APPROVED_REL, '--target', dir, ...extra])
        assert.equal(r.status, 1, r.combined)
        assert.match(r.combined, /未知参数|未支持/)
        assert.ok(r.combined.includes(extra[0]), `报错应点名旗标 ${extra[0]}: ${r.combined}`)
        assert.equal(/VERIFY: PASS/.test(r.combined), false, '旗标被拒后不得照常执行 verify')
      })
    })
  }

  it('gate-check --task <f> --graph → exit 1 且含「未知参数」', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const r = runCli(['gate-check', '--task', APPROVED_REL, '--target', dir, '--graph'])
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /未知参数|未支持/)
      assert.match(r.combined, /--graph/)
    })
  })

  // D2: --json 最小接通——stdout 可 JSON.parse，含五字段，exit 码与文本模式一致
  it('verify --task approved --json → exit 0，stdout JSON 五字段，verdict=PASS', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const text = runCli(['verify', '--task', APPROVED_REL, '--target', dir])
      const r = runCli(['verify', '--task', APPROVED_REL, '--target', dir, '--json'])
      assert.equal(r.status, text.status, `exit 码应与文本模式一致: ${r.combined}`)
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.command, 'verify')
      assert.equal(payload.target, dir)
      assert.equal(payload.task, APPROVED_REL)
      assert.equal(payload.blocked, false)
      assert.equal(payload.verdict, 'PASS')
    })
  })

  it('verify --task pending --json → exit 2，JSON blocked=true verdict=BLOCKED', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const text = runCli(['verify', '--task', PENDING_REL, '--target', dir])
      const r = runCli(['verify', '--task', PENDING_REL, '--target', dir, '--json'])
      assert.equal(r.status, text.status, `exit 码应与文本模式一致: ${r.combined}`)
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.command, 'verify')
      assert.equal(payload.blocked, true)
      assert.equal(payload.verdict, 'BLOCKED')
    })
  })

  it('gate-check --task approved --json → exit 0，stdout JSON 五字段，verdict=PASS', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const text = runCli(['gate-check', '--task', APPROVED_REL, '--target', dir])
      const r = runCli(['gate-check', '--task', APPROVED_REL, '--target', dir, '--json'])
      assert.equal(r.status, text.status, `exit 码应与文本模式一致: ${r.combined}`)
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.command, 'gate-check')
      assert.equal(payload.target, dir)
      assert.equal(payload.task, APPROVED_REL)
      assert.equal(payload.blocked, false)
      assert.equal(payload.verdict, 'PASS')
    })
  })

  it('gate-check --task pending --json → exit 2，JSON blocked=true verdict=BLOCKED', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const text = runCli(['gate-check', '--task', PENDING_REL, '--target', dir])
      const r = runCli(['gate-check', '--task', PENDING_REL, '--target', dir, '--json'])
      assert.equal(r.status, text.status, `exit 码应与文本模式一致: ${r.combined}`)
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.command, 'gate-check')
      assert.equal(payload.blocked, true)
      assert.equal(payload.verdict, 'BLOCKED')
    })
  })

  // --help 不得被 fail-fast 拦截（DEF-010 交互）
  it('verify --help / gate-check --help → exit 0 usage，不被未知参数 fail-fast 拦截', () => {
    for (const cmd of ['verify', 'gate-check']) {
      const r = runCli([cmd, '--help'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, new RegExp(`${cmd} \\[--target PATH\\]`))
      assert.equal(/未知参数/.test(r.combined), false)
    }
  })

  // 回归：不带旗标的 verify/gate-check 行为不变（C3/C4 口径）
  it('回归：不带旗标 verify approved → exit 0 VERIFY: PASS；pending → exit 2 VERIFY: BLOCKED', async () => {
    await withTemp(async (dir) => {
      await seedFixtures(dir)
      const ok = runCli(['verify', '--task', APPROVED_REL, '--target', dir])
      assert.equal(ok.status, 0, ok.combined)
      assert.match(ok.combined, /VERIFY: PASS/)
      const bad = runCli(['verify', '--task', PENDING_REL, '--target', dir])
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /VERIFY: BLOCKED/)
    })
  })
})
