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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-vrev-'))
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

function taskMd(slug: string): string {
  return [
    `# Task ${slug}`,
    '',
    '> **状态**：`draft`',
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${slug}\` |`,
    '| **test_strategy** | `recommended` |',
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

const TASK_REL = 'docs/tasks/active/task_vr_ok_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_vr_ok_audit_R1_2026-08-20.md'

async function seedTask(dir: string, rel = TASK_REL, slug = 'vr_ok'): Promise<void> {
  await writeRel(dir, rel, taskMd(slug))
}

// DEF-003 阶段二 T4：verify 对 R<n> 审查文存在性机械强制（FRAGMENT_30_gate_verify_v1_zh.md#16）。
// 红→绿钉死：修复前 verify 不查审查文（findReview 仅供 status 投影），--allow-no-review 被「未知参数」fail-fast。
describe('DEF-003 T4 · verify 查 R<n> 审查文存在性', { concurrency: 1 }, () => {
  it('缺 R<n> 审查文 → VERIFY: BLOCKED · missing R<n> review · exit 2', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /VERIFY: BLOCKED · missing R<n> review/)
    })
  })

  it('补 docs/harness/reviews/task_*_audit_R1_* → VERIFY: PASS · exit 0', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      await writeRel(dir, REVIEW_REL, '# R1 fixture')
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('reviews/ 备选目录同样认可（findReview 双路径口径）', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      await writeRel(dir, 'reviews/task_vr_ok_audit_R2_2026-08-20.md', '# R2 fixture')
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('task 文件 _v<n> 版本后缀不影响审查文匹配（stripVer 口径与 status 一致）', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir, 'docs/tasks/active/task_vr_suff_v3.md', 'vr_suff')
      await writeRel(dir, 'docs/harness/reviews/task_vr_suff_audit_R1_x.md', '# R1 fixture')
      const r = runCli(['verify', '--task', 'docs/tasks/active/task_vr_suff_v3.md', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('--allow-no-review 真豁免：exit 0 · VERIFY: PASS · 输出留痕行', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--allow-no-review'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
      assert.match(r.combined, /--allow-no-review/)
      assert.match(r.combined, /豁免/)
    })
  })

  it('--json 缺审查文 → exit 2 · blocked=true · verdict=BLOCKED', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--json'])
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, true)
      assert.equal(payload.verdict, 'BLOCKED')
    })
  })

  it('--json + --allow-no-review → exit 0 · verdict=PASS · waived 留痕缺审查文', async () => {
    await withTemp(async (dir) => {
      await seedTask(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--json', '--allow-no-review'])
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, false)
      assert.equal(payload.verdict, 'PASS')
      const waived = payload.waived as string[]
      assert.ok(Array.isArray(waived), `waived 须为数组: ${r.stdout}`)
      assert.ok(waived.some((w) => w.includes('missing R<n> review')), `waived 须留痕缺审查文: ${r.stdout}`)
    })
  })

  it('顺序：D5 失败先于审查文检查（既有 D5 BLOCKED 口径不回退）', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, TASK_REL, taskMd('vr_ok').replace('recommended', 'required'))
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /D5: test_strategy=required/)
      assert.equal(/missing R<n> review/.test(r.combined), false, 'D5 BLOCKED 时不应同时报审查文缺失')
    })
  })
})
