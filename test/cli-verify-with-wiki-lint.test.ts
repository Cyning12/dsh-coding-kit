import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

// 复跑命令字面量：与 assets/ci/samples/lint-wiki-delta.yml.example L33 逐字一致（含 --yes · 全串非子串）
const RERUN_CMD = 'npx --yes dsh-coding-kit task lint-wiki-delta --target .'

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-vwl-'))
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

function taskMd(opts: { slug: string; wikiDelta?: string }): string {
  const rows = [
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    '| **test_strategy** | `recommended` |',
    '| **invoke_retention_profile** | `minimal` |',
  ]
  if (opts.wikiDelta) rows.push(`| **wiki_delta** | \`${opts.wikiDelta}\` |`)
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

const TASK_REL = 'docs/tasks/active/task_wlw_ok_v1.md'
const GAP_REL = 'docs/tasks/active/task_wlw_gap_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_wlw_ok_audit_R1_2026-08-27.md'

// 主 task 自身带 wiki_delta（scope=all 会扫到它）；缺口来自兄弟 active task（K4 场景）
async function seed(dir: string, opts: { withGap?: boolean } = {}): Promise<void> {
  await writeRel(dir, TASK_REL, taskMd({ slug: 'wlw_ok', wikiDelta: 'n/a' }))
  await writeRel(dir, REVIEW_REL, '# R1 fixture')
  if (opts.withGap) await writeRel(dir, GAP_REL, taskMd({ slug: 'wlw_gap' }))
}

// K3（FEEDBACK §3 · task verify-with-wiki-lint）：verify 增 --with-wiki-lint 追加闸，
// 复用 lintWikiDeltaMissing（默认档 · scope=all）；fail → BLOCKED + issues + 与 CI 同命令复跑行。
// 红→绿钉死：交付前 --with-wiki-lint 走「verify 未知参数」fail-fast（exit 1）。
describe('verify --with-wiki-lint（K3 · lint-wiki-delta 并入 verify）', { concurrency: 1 }, () => {
  it('复跑命令字面量与 CI sample L33 锁步（assets 真值钉死）', () => {
    const sample = readFileSync(path.join(KIT, 'assets/ci/samples/lint-wiki-delta.yml.example'), 'utf8')
    assert.ok(
      sample.includes(`run: ${RERUN_CMD}`),
      `CI sample 须含 run: ${RERUN_CMD}（逐字）`,
    )
  })

  it('有缺口 + 旗标 → BLOCKED · exit 2 · stdout 全串含 CI 同命令复跑行', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { withGap: true })
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--with-wiki-lint'])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /VERIFY: BLOCKED/)
      assert.match(r.combined, /wiki_delta/)
      assert.ok(r.combined.includes(RERUN_CMD), `stdout 全串须含 ${RERUN_CMD}: ${r.combined}`)
      assert.ok(r.combined.includes(GAP_REL), `须列出缺口 task 路径: ${r.combined}`)
      assert.match(r.combined, /wiki_delta_missing/)
      assert.match(r.combined, /兄弟/, '文案须说明缺口可能来自兄弟 task（scope=all）')
    })
  })

  it('有缺口 + 无旗标 → PASS（1.7.1 非破坏回归 · 默认行为逐字不变）', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { withGap: true })
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
      assert.equal(r.combined.includes('wiki_delta'), false, '无旗标输出不得出现 wiki_delta 字样')
      assert.equal(r.combined.includes(RERUN_CMD), false)
    })
  })

  it('无缺口 + 旗标 → PASS · 与无旗标同 verdict（附 wiki-lint PASS 信息行）', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const off = runCli(['verify', '--task', TASK_REL, '--target', dir])
      const on = runCli(['verify', '--task', TASK_REL, '--target', dir, '--with-wiki-lint'])
      assert.equal(off.status, 0, off.combined)
      assert.equal(on.status, 0, on.combined)
      assert.match(on.combined, /VERIFY: PASS/)
      assert.match(on.combined, /wiki-lint PASS · scanned: 1/)
      assert.equal(off.combined.includes('wiki-lint'), false)
    })
  })

  it('--json 有缺口 → exit 2 · blocked=true · wiki_lint{ok:false,issues,scanned}', async () => {
    await withTemp(async (dir) => {
      await seed(dir, { withGap: true })
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--with-wiki-lint', '--json'])
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, true)
      assert.equal(payload.verdict, 'BLOCKED')
      const wl = payload.wiki_lint as { ok: boolean; issues: { path: string; code: string }[]; scanned: number }
      assert.ok(wl && typeof wl === 'object', `--json 须含 wiki_lint 块: ${r.stdout}`)
      assert.equal(wl.ok, false)
      assert.equal(wl.scanned, 2)
      assert.ok(
        wl.issues.some((i) => i.path === GAP_REL && i.code === 'wiki_delta_missing'),
        `issues 须含缺口行: ${JSON.stringify(wl.issues)}`,
      )
    })
  })

  it('--json 无缺口 → exit 0 · wiki_lint{ok:true,issues:[],scanned:1}', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--target', dir, '--with-wiki-lint', '--json'])
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      assert.equal(payload.verdict, 'PASS')
      const wl = payload.wiki_lint as { ok: boolean; issues: unknown[]; scanned: number }
      assert.equal(wl.ok, true)
      assert.deepEqual(wl.issues, [])
      assert.equal(wl.scanned, 1)
    })
  })

  it('target 无 docs/tasks/ → scanned:0 · ok:true · 不得误 BLOCKED', async () => {
    await withTemp(async (dir) => {
      // task 落仓根（不在 lint 扫描的 docs/tasks/ 候选目录内）
      await writeRel(dir, 'task_wlw_solo_v1.md', taskMd({ slug: 'wlw_solo' }))
      await writeRel(dir, REVIEW_REL.replace('wlw_ok', 'wlw_solo'), '# R1 fixture')
      const text = runCli(['verify', '--task', 'task_wlw_solo_v1.md', '--target', dir, '--with-wiki-lint'])
      assert.equal(text.status, 0, text.combined)
      assert.match(text.combined, /VERIFY: PASS/)
      const r = runCli(['verify', '--task', 'task_wlw_solo_v1.md', '--target', dir, '--with-wiki-lint', '--json'])
      assert.equal(r.status, 0, r.combined)
      const payload = JSON.parse(r.stdout) as Record<string, unknown>
      const wl = payload.wiki_lint as { ok: boolean; scanned: number }
      assert.equal(wl.ok, true)
      assert.equal(wl.scanned, 0)
    })
  })

  it('--spec 模式同生效（20 审 R1 已定）：兄弟 task 缺口 + 旗标 → BLOCKED 全串命令；无旗标 → PASS', async () => {
    await withTemp(async (dir) => {
      const SPEC_REL = 'docs/spec/SPEC-wlw_v1.md'
      await writeRel(dir, SPEC_REL, [
        '# SPEC wlw',
        '',
        '> **track**：`feature`',
        '',
        '## Harness 元信息',
        '',
        '| 字段 | 值 |',
        '|------|-----|',
        '| **spec_slug** | `wlw` |',
        '',
        '## 范围',
        '',
        '- fixture',
        '',
      ].join('\n'))
      await writeRel(dir, 'docs/harness/reviews/spec_wlw_audit_R1_x.md', '# R1 fixture')
      await writeRel(dir, GAP_REL, taskMd({ slug: 'wlw_gap' }))
      const off = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(off.status, 0, off.combined)
      assert.match(off.combined, /VERIFY: PASS/)
      const on = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--with-wiki-lint'])
      assert.equal(on.status, 2, on.combined)
      assert.match(on.combined, /VERIFY: BLOCKED/)
      assert.ok(on.combined.includes(RERUN_CMD), `stdout 全串须含 ${RERUN_CMD}: ${on.combined}`)
      const js = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--with-wiki-lint', '--json'])
      assert.equal(js.status, 2, js.combined)
      const payload = JSON.parse(js.stdout) as Record<string, unknown>
      assert.equal(payload.blocked, true)
      const wl = payload.wiki_lint as { ok: boolean; scanned: number }
      assert.equal(wl.ok, false)
      assert.equal(wl.scanned, 1)
    })
  })

  it('--task 与 --spec 互斥等既有规则不动（带旗标仍互斥 · exit 1）', async () => {
    await withTemp(async (dir) => {
      await seed(dir)
      const r = runCli(['verify', '--task', TASK_REL, '--spec', 'x.md', '--target', dir, '--with-wiki-lint'])
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /--task 与 --spec 互斥/)
    })
  })

  it('verify --help 与总 usage 均列出 --with-wiki-lint', async () => {
    const help = runCli(['verify', '--help'])
    assert.equal(help.status, 0, help.combined)
    assert.ok(help.combined.includes('--with-wiki-lint'), help.combined)
    const top = runCli(['--help'])
    assert.ok(top.combined.includes('--with-wiki-lint'), top.combined)
  })
})
