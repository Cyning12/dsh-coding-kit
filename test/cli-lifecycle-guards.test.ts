import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-lcg-'))
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

function taskMd(opts: { slug: string; testStrategy?: string; includeAcceptance?: boolean }): string {
  const parts = [
    `# Task ${opts.slug}`,
    '',
    '> **状态**：`draft`',
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    `| **test_strategy** | \`${opts.testStrategy ?? 'recommended'}\` |`,
    '',
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    '| HG-TASK-DRAFT | approved | 20,30 | fixture |',
    '| HG-AUDIT-R1 | approved | 30 | fixture |',
    '',
  ]
  if (opts.includeAcceptance !== false) {
    parts.push('## 验收标准', '', '- [x] fixture item', '')
  }
  parts.push('## 失败路径', '', '| F | Scenario |', '|---|----------|', '| F1 | fixture |', '')
  parts.push('### 自检结论（执行者）', '', '（30/40 回填）', '')
  return parts.join('\n')
}

const OK_REL = 'docs/tasks/active/task_lc_ok_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_lc_ok_audit_R1_2026-08-20.md'

async function seedOk(dir: string): Promise<void> {
  await writeRel(dir, OK_REL, taskMd({ slug: 'lc_ok' }))
}

function dryRun(dir: string, extra: string[] = []): RunResult {
  return runCli([
    'lifecycle', 'dry-run',
    '--transition', 'to_30', '--from', 'draft',
    '--task', OK_REL, '--target', dir,
    ...extra,
  ])
}

// DEF-003 阶段二 T3：lifecycle dry-run 守卫真求值（to_30: reviews_retention / audit_D5 / task_lint）。
// 红→绿钉死：修复前三守卫恒 unevaluated（「本波未接线 adapter」）。
describe('DEF-003 T3 · lifecycle dry-run 守卫真接线（to_30）', { concurrency: 1 }, () => {
  it('reviews_retention：缺 R<n> 审查文 → fail 且 blocked（exit 2）', async () => {
    await withTemp(async (dir) => {
      await seedOk(dir)
      const r = dryRun(dir)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /reviews_retention: fail/)
      assert.match(r.combined, /missing R<n> review/)
      assert.match(r.combined, /blocked: true/)
    })
  })

  it('reviews_retention：补 R<n> 审查文 → pass；to_30 全守卫 evaluated（unevaluated_count: 0）', async () => {
    await withTemp(async (dir) => {
      await seedOk(dir)
      await writeRel(dir, REVIEW_REL, '# R1 fixture\n')
      const r = dryRun(dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /reviews_retention: pass/)
      assert.match(r.combined, /unevaluated_count: 0/)
      assert.match(r.combined, /blocked: false/)
    })
  })

  it('reviews_retention：--allow-no-review 豁免 → warn 留痕且不 blocked', async () => {
    await withTemp(async (dir) => {
      await seedOk(dir)
      const r = dryRun(dir, ['--allow-no-review'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /reviews_retention: warn/)
      assert.match(r.combined, /--allow-no-review 豁免/)
    })
  })

  it('audit_D5：test_strategy=required 且无测试制品 → fail（exit 2）；补测试文件 → pass', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, OK_REL, taskMd({ slug: 'lc_ok', testStrategy: 'required' }))
      await writeRel(dir, REVIEW_REL, '# R1 fixture\n')
      const bad = dryRun(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /audit_D5: fail/)
      assert.match(bad.combined, /D5: test_strategy=required/)
      await writeRel(dir, 'test_smoke.py', 'def test_ok():\n    assert True\n')
      const good = dryRun(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /audit_D5: pass/)
    })
  })

  it('task_lint：lint FAIL（severity=warn）不挡 blocked；--allow-lint-fail 转 warn 留痕', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, OK_REL, taskMd({ slug: 'lc_ok', includeAcceptance: false }))
      await writeRel(dir, REVIEW_REL, '# R1 fixture\n')
      const r = dryRun(dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /task_lint: fail/)
      assert.match(r.combined, /E3/)
      assert.match(r.combined, /blocked: false/)
      const waived = dryRun(dir, ['--allow-lint-fail'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /task_lint: warn/)
      assert.match(waived.combined, /--allow-lint-fail 豁免/)
    })
  })

  it('未接线守卫（仅 close_wiki_promotion）明示「未接线」；spec_reviews_retention 已真求值 · 不再是「本波未接线 adapter」', async () => {
    // DEF-003 T6 后：close_invoke / close_review 等 close_* 守卫已真求值（cli-checks evalCloseGuard
    // 与 task close 同一实现源 · 见 cli-task-close-guards.test.ts）；本用例钉「未接线残留」明示口径。
    // PRD_DEF-003 后续棒：to_00 spec_reviews_retention 已接线（evalSpecReviewsRetention ·
    // verify --spec 同一实现源 · 真求值用例见 cli-verify-spec.test.ts），未接线残留仅 close_wiki_promotion。
    await withTemp(async (dir) => {
      await seedOk(dir)
      const close = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', OK_REL, '--target', dir,
      ])
      // fixture 缺 invoke/review/KPI/wiki_delta 制品 → 已接线守卫真 fail（blocked）；不再恒 unevaluated
      assert.equal(close.status, 2, close.combined)
      assert.match(close.combined, /close_review: fail · missing R<n> review/)
      assert.match(close.combined, /close_invoke: fail · missing invoke hats/)
      assert.match(close.combined, /close_wiki_promotion: unevaluated · 未接线/)
      assert.match(close.combined, /unevaluated ≠ pass/)
      // to_00：--task 携带的是 task 文件（非 SPEC · 无 skip_spec_audit/bugfix 豁免且
      // 无 spec_*_audit_R<n> 审查文）→ spec_reviews_retention 真求值 fail（不再恒 unevaluated）
      const to00 = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'to_00', '--from', 'draft',
        '--task', OK_REL, '--target', dir,
      ])
      assert.equal(to00.status, 2, to00.combined)
      assert.match(to00.combined, /spec_reviews_retention: fail · missing spec R<n> review/)
    })
    const src = readFileSync(path.join(KIT, 'src', 'cli-lifecycle.ts'), 'utf8')
    assert.equal(src.includes('本波未接线 adapter'), false, 'src/cli-lifecycle.ts 仍含「本波未接线 adapter」恒返回路径')
  })

  it('回归：无 --task 时守卫恒 unevaluated（无 task 不求值 · 既有行为不动）', () => {
    const r = runCli(['lifecycle', 'dry-run', '--transition', 'to_30', '--from', 'draft'])
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /无 --task · 未求值/)
  })
})
