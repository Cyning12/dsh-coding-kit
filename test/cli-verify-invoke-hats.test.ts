import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-vih-'))
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

function taskMd(opts: { slug: string; profile?: string; requiredHats?: string }): string {
  const rows = [
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    '| **test_strategy** | `recommended` |',
  ]
  if (opts.profile) rows.push(`| **invoke_retention_profile** | \`${opts.profile}\` |`)
  if (opts.requiredHats) rows.push(`| **required_invoke_hats** | \`${opts.requiredHats}\` |`)
  return [
    `# Task ${opts.slug}`,
    '',
    '> **状态**：`draft`',
    '',
    '## Harness 元信息',
    '',
    ...rows,
    '',
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    '| HG-TASK-DRAFT | approved | 20,30 | fixture |',
    '| HG-AUDIT-R1 | approved | 30 | fixture |',
    '',
    '## 验收标准',
    '',
    '- [x] fixture item',
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

const TASK_REL = 'docs/tasks/active/task_vih_ok_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_vih_ok_audit_R1_2026-08-20.md'
const INVOKE10_REL = 'docs/harness/invokes/by-task/vih_ok/invoke_20260801_10_vih_ok.md'

async function seed(dir: string, opts: { profile?: string; requiredHats?: string } = {}): Promise<void> {
  await writeRel(dir, TASK_REL, taskMd({ slug: 'vih_ok', ...opts }))
  // 审查文补齐：isolate T5 invoke 检查（review 硬闸属 T4 口径）
  await writeRel(dir, REVIEW_REL, '# R1 fixture')
}

// DEF-003 阶段二 T5：verify 查 pre-30 invoke hats（FRAGMENT_30_gate_verify_v1_zh.md#18 语义：
// required ∩ {10,20,00} 存在性硬闸 · 缺 40 不挡 30 · minimal 无 preRequired 不挡 · --allow-invoke-gap 豁免留痕）。
// 红→绿钉死：修复前 verify 不扫描 invoke 文件，--allow-invoke-gap 被「未知参数」fail-fast（DEF-011 拒绝清单）。
describe('DEF-003 T5 · verify 查 pre-30 invoke hats', { concurrency: 1 }, () => {
  it('缺 pre-30 invoke（default 缺省 required=10,30,40 · ∩{10,20,00}={10}）→ BLOCKED · exit 2', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /VERIFY: BLOCKED · missing pre-30 invoke hats/)
      assert.match(r.combined, /10/, '须点名缺失帽 10')
    })
  })

  it('补 invoke_*_10_* → VERIFY: PASS · exit 0', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      await writeRel(dir, INVOKE10_REL, '# invoke 10 fixture')
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('缺 40 不挡 30：仅落 10 invoke（pre-30 只查 ∩{10,20,00}）→ PASS', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      await writeRel(dir, INVOKE10_REL, '# invoke 10 fixture')
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('minimal profile（required=30 · 无 preRequired）→ 无 invoke 也 PASS', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { profile: 'minimal' })
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('显式 required_invoke_hats=30,40（∩{10,20,00}=∅）→ 无 invoke 也 PASS', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { requiredHats: '30,40' })
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('显式 required_invoke_hats=10,20：缺 20 → BLOCKED 点名 20；合并文件 10_20 双计 → PASS', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { requiredHats: '10,20' })
      await writeRel(dir, INVOKE10_REL, '# invoke 10 fixture')
      const bad = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /missing pre-30 invoke hats/)
      assert.match(bad.combined, /20/, '须点名缺失帽 20')
      await writeRel(dir, 'docs/harness/invokes/by-task/vih_ok/invoke_20260802_10_20_vih_ok.md', '# merged 10+40 fixture')
      const good = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /VERIFY: PASS/)
    })
  })

  it('--allow-invoke-gap 真豁免：exit 0 · VERIFY: PASS · 输出留痕行', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--allow-invoke-gap'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
      assert.match(r.combined, /--allow-invoke-gap/)
      assert.match(r.combined, /豁免/)
    })
  })

  it('--json 缺 invoke → exit 2 · blocked=true · verdict=BLOCKED', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--json'])
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, true)
      assert.equal(payload.verdict, 'BLOCKED')
    })
  })

  it('--json + --allow-invoke-gap → exit 0 · verdict=PASS · waived 留痕缺 invoke hats', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--json', '--allow-invoke-gap'])
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, false)
      assert.equal(payload.verdict, 'PASS')
      const waived = payload.waived as string[]
      assert.ok(Array.isArray(waived), `waived 须为数组: ${r.stdout}`)
      assert.ok(
        waived.some((w) => w.includes('missing pre-30 invoke hats')),
        `waived 须留痕缺 pre-30 invoke hats: ${r.stdout}`,
      )
    })
  })

  it('顺序：缺 R<n> 审查文与缺 invoke 并存 → 先报 missing R<n> review（T4 口径不回退）', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, TASK_REL, taskMd({ slug: 'vih_ok' }))
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /missing R<n> review/)
      assert.equal(/missing pre-30 invoke hats/.test(r.combined), false, 'review BLOCKED 时不应同时报 invoke 缺失')
    })
  })
})
