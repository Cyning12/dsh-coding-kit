import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCore } from './_helpers/core-harness.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')
const S2_RELS = ['docs/tasks', 'reviews', 'invokes/by-task'] as const

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-cli-'))
  // 2.2-W2 C1-b：verify/audit/gate-check 的 --target 须落 git 仓内 → fixture seed .git（消费者仓仿真）
  await mkdir(path.join(dir, '.git'), { recursive: true })
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

function taskMd(opts: {
  slug: string
  status?: string
  audit?: string
  draft?: string
  draftBlocks?: string
  testStrategy?: string
  includeAcceptance?: boolean
  includeFailure?: boolean
  includeSelfCheck?: boolean
  selfCheckBody?: string
  checked?: boolean
  includeGates?: boolean
  wikiDelta?: string
}): string {
  const status = opts.status ?? 'draft'
  const audit = opts.audit ?? 'pending'
  const draft = opts.draft ?? 'pending'
  const draftBlocks = opts.draftBlocks ?? '20,30'
  const testStrategy = opts.testStrategy ?? 'recommended'
  const checked = opts.checked === true ? '[x]' : '[ ]'
  const selfBody = opts.selfCheckBody ?? '（30/40 回填）'
  const parts: string[] = [
    `# Task ${opts.slug}`,
    '',
    `> **状态**：\`${status}\``,
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    `| **test_strategy** | \`${testStrategy}\` |`,
    // 3.0-W6 N2-C 登记项：lint 入链后 fixture 默认补 wiki_delta=none（E8 lint-clean）· 显式 null 维持缺行形态
    ...(opts.wikiDelta === null ? [] : [`| **wiki_delta** | \`${opts.wikiDelta ?? 'none'}\` |`]),
    '',
  ]
  if (opts.includeGates !== false) {
    parts.push(
      '### 人工闸',
      '',
      '| human_gate_id | status | blocks_hats | 说明 |',
      '|---------------|--------|-------------|------|',
      `| HG-TASK-DRAFT | ${draft} | ${draftBlocks} | fixture |`,
      `| HG-AUDIT-R1 | ${audit} | 30 | fixture |`,
      '',
    )
  }
  if (opts.includeAcceptance !== false) {
    parts.push('## 验收标准', '', `- ${checked} fixture item`, '')
  }
  if (opts.includeFailure !== false) {
    parts.push('## 失败路径', '', '| F | Scenario |', '|---|----------|', '| F1 | fixture |', '')
  }
  if (opts.includeSelfCheck !== false) {
    parts.push('### 自检结论（执行者）', '', selfBody, '')
  }
  return parts.join('\n')
}

describe('C* CLI P0 runtime', { concurrency: 1 }, () => {
  it('C-bin / version: package.json 为 3.2.0 且三 bin（spec-wave + specgate + dsh-coding-kit）', async () => {
    const pkgRaw = await readFile(path.join(KIT, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw) as {
      name?: string
      version: string
      bin?: Record<string, string>
    }
    assert.equal(pkg.name, 'spec-wave')
    assert.equal(pkg.version, '3.2.0')
    assert.notEqual(pkg.version, '1.0.0')
    assert.notEqual(pkg.version, '0.1.0')
    assert.ok(pkg.bin && pkg.bin['spec-wave'], 'missing bin.spec-wave')
    assert.ok(pkg.bin && pkg.bin.specgate, 'missing bin.specgate')
    assert.ok(pkg.bin && pkg.bin['dsh-coding-kit'], 'missing bin.dsh-coding-kit')
    for (const key of ['spec-wave', 'specgate', 'dsh-coding-kit'] as const) {
      const binPath = path.join(KIT, pkg.bin![key])
      assert.equal(existsSync(binPath), true, `bin file missing: ${binPath}`)
    }
  })

  it('R-HELP: --help 列出 P0 与 G1–G7，含 spec-wave，无「未交付（1.2.0）」', async () => {
    const r = runCli(['--help'])
    assert.equal(r.status, 0)
    const help = r.combined
    assert.match(help, /spec-wave/)
    for (const name of [
      'init',
      'upgrade',
      'check',
      'verify',
      'gate-check',
      'audit',
      'task lint',
      'task close',
      'status',
      'timeline',
      'lifecycle',
      'discipline',
      'graph',
      'sync',
      'skills',
      'wiki',
      'lint-done',
      'lint-wiki-delta',
      'task check',
    ]) {
      assert.match(help, new RegExp(name.replace(' ', '\\s+')))
    }
    assert.match(help, /lifecycle(?:\s+dry-run|\s+show)/)
    assert.equal(/未交付（1\.2\.0）/.test(help), false)
    assert.equal(/未交付/.test(help), false)
  })

  it('R-HELP README: 完成态 3.2.0；双入口；加载≠注入；钉版后可去旧包', async () => {
    const readme = await readFile(path.join(KIT, 'README.md'), 'utf8')
    assert.match(readme, /spec-wave@3\.2\.0/)
    assert.match(readme, /Loading\s*≠\s*injecting/)
    assert.match(readme, /apply_coding_standards/)
    assert.match(readme, /dsh plugin add/)
    assert.match(readme, /npx spec-wave/)
    assert.match(readme, /drop `@cyning\/harness`/)
    assert.match(readme, /devDependency/)
    assert.match(readme, /upgrade --yes/)
    assert.match(readme, /Multi-host in one package/)
    assert.match(readme, /host apply --tools cursor,claude/)
    assert.match(readme, /Claude Code/)
    assert.equal(/dsh init --coding-kit/.test(readme), false)
    assert.equal(/未交付（1\.2\.0）/.test(readme), false)
    assert.equal(/1\.1\.0 未交付/.test(readme), false)
    assert.equal(/当成 1\.1\.0 已可用/.test(readme), false)
    assert.equal(/dsh-coding-kit@1\.1\.0/.test(readme), false)
  })

  it('D8: 三 bin spec-wave+specgate+dsh-coding-kit；patch 为 insert；pack 不含 SPEC.md', async () => {
    const pkgRaw = await readFile(path.join(KIT, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw) as {
      name?: string
      version: string
      bin?: Record<string, string>
      files?: string[]
    }
    assert.equal(pkg.name, 'spec-wave')
    assert.equal(pkg.version, '3.2.0')
    assert.ok(pkg.bin)
    assert.deepEqual(Object.keys(pkg.bin), ['spec-wave', 'specgate', 'dsh-coding-kit'])
    assert.equal(Object.prototype.hasOwnProperty.call(pkg.bin, 'cyning-harness'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(pkg.bin, 'harness'), false)
    assert.equal(Array.isArray(pkg.files) && pkg.files.includes('SPEC.md'), false)

    const patch = await readFile(path.join(KIT, 'cordis.patch.yml'), 'utf8')
    assert.match(patch, /^\s*- insert:/m)
    assert.match(patch, /id:\s*coding-kit/)
    assert.match(patch, /name:\s*dsh-coding-kit/)
    assert.equal(/^\s*-?\s*op:/m.test(patch), false)
    assert.equal(/^\s*path:/m.test(patch), false)
    assert.equal(/^\s*value:/m.test(patch), false)

    const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      encoding: 'utf8',
      cwd: KIT,
      env: { ...process.env },
    })
    assert.equal(pack.status, 0, `${pack.stdout}\n${pack.stderr}`)
    const parsed = JSON.parse(pack.stdout) as Array<{
      id?: string
      filename?: string
      version?: string
      files?: Array<{ path: string }>
    }>
    assert.ok(Array.isArray(parsed) && parsed[0])
    const info = parsed[0]
    assert.equal(info.version, '3.2.0')
    assert.match(String(info.filename ?? info.id ?? ''), /spec-wave-3\.2\.0/)
    const paths = (info.files ?? []).map((f) => f.path.replace(/\\/g, '/'))
    const joined = paths.join('\n')
    assert.equal(paths.includes('SPEC.md'), false, 'pack must not contain SPEC.md')
    assert.match(joined, /(^|\n)cordis\.patch\.yml(\n|$)/)
    assert.match(joined, /(^|\n)bin\/specgate\.js(\n|$)/)
    assert.match(joined, /(^|\n)bin\/dsh-coding-kit\.js(\n|$)/)
    assert.match(joined, /(^|\n)lib\/index\.js(\n|$)/)
    assert.equal(paths.some((p) => p === 'assets/standards' || p.startsWith('assets/standards/')), true)
    assert.equal(paths.some((p) => p.includes('docs/dsh_coding_kit_init')), false)
    assert.equal(paths.some((p) => p === 'src' || p.startsWith('src/')), false)
    assert.equal(paths.some((p) => p === 'node_modules' || p.startsWith('node_modules/')), false)
  })

  it('upgrade 已注册：--help 可见且调用不是 §2.2 失败口', async () => {
    const help = await runCore(['--help'])
    assert.match(help.combined, /\bupgrade\b/)
    await withTemp(async (dir) => {
      const r = await runCore(['upgrade', '--yes', '--target', dir])
      assert.notEqual(r.status, 0)
      assert.equal(/未交付（1\.2\.0）/.test(r.combined), false)
      assert.match(r.combined, /init|manifest|未接入/)
    })
  })

  it('C1: init --preset harness-only --yes 写出 version=3.2.0 且不写 S2', async () => {
    await withTemp(async (dir) => {
      const r = await runCore([
        'init',
        '--preset',
        'harness-only',
        '--tools',
        'none',
        '--yes',
        '--target',
        dir,
      ])
      assert.equal(r.status, 0, r.combined)
      const mfPath = path.join(dir, '.coding-kit', 'manifest.json')
      assert.equal(existsSync(mfPath), true)
      const mf = JSON.parse(await readFile(mfPath, 'utf8')) as { version: string }
      assert.equal(mf.version, '3.2.0')
      for (const rel of S2_RELS) {
        assert.equal(existsSync(path.join(dir, rel)), false, `S2 leaked: ${rel}`)
      }
    })
  })

  it('C3: verify --task pending → exit 2 且 VERIFY: BLOCKED', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_pending_gate_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'pending_gate', audit: 'pending', draft: 'pending' }))
      const r = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /VERIFY: BLOCKED/)
    })
  })

  it('C4: verify --task approved + 结构合法 → exit 0 且 VERIFY: PASS', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_approved_ok_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'approved_ok',
          status: 'draft',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'recommended',
        }),
      )
      // DEF-003 T4：verify 查 R<n> 审查文存在性 · 补审查文保持本用例 PASS 口径
      await writeRel(dir, 'docs/harness/reviews/task_approved_ok_audit_R1_2026-08-20.md', '# R1 fixture\n\n## 结论\n\nPASS · 零内容阻塞（fixture）\n\n审查结论：fixture 范围与验收全项合规，无阻塞遗留，准予关账。\n')
      // DEF-003 T5：verify 查 pre-30 invoke hats（default required=10,30,40 · ∩{10,20,00}={10} 须落盘才 PASS）
      await writeRel(dir, 'docs/harness/invokes/by-task/approved_ok/invoke_20260801_10_approved_ok.md', '# invoke 10 fixture')
      const r = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('C5: gate-check / audit 对 pending 闸非 0，文案含 → 30 不可开工 或 BLOCKED', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_pending_gate_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'pending_gate', audit: 'pending' }))
      const g = await runCore(['gate-check', '--task', rel, '--target', dir])
      assert.notEqual(g.status, 0, g.combined)
      assert.match(g.combined, /→ 30 不可开工|BLOCKED/)
      const a = await runCore(['audit', '--task', rel, '--target', dir])
      assert.notEqual(a.status, 0, a.combined)
      assert.match(a.combined, /→ 30 不可开工|BLOCKED/)
    })
  })

  it('C5b: test_strategy=required 且无测试/CI → audit/verify 非 0', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_d5_required_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'd5_required',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'required',
        }),
      )
      const v = await runCore(['verify', '--task', rel, '--target', dir])
      assert.notEqual(v.status, 0, v.combined)
      assert.match(v.combined, /D5|test_strategy/)
      const a = await runCore(['audit', '--task', rel, '--target', dir])
      assert.notEqual(a.status, 0, a.combined)
      assert.match(a.combined, /D5|test_strategy/)
    })
  })

  it('C5c: 仅 pyproject.toml 无测试制品 → D5 FAIL（非 0，DEF-014 · 1.5.0 WARN→FAIL 硬化）', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_d5_pyproject_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'd5_pyproject',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'required',
        }),
      )
      await writeRel(dir, 'pyproject.toml', '[project]\nname = "demo"\nversion = "0.1.0"\n')
      // DEF-003 T4：verify 查 R<n> 审查文存在性 · 补审查文保持本用例 PASS 口径
      await writeRel(dir, 'docs/harness/reviews/task_d5_pyproject_audit_R1_2026-08-20.md', '# R1 fixture\n\n## 结论\n\nPASS · 零内容阻塞（fixture）\n\n审查结论：fixture 范围与验收全项合规，无阻塞遗留，准予关账。\n')
      // DEF-003 T5：verify 查 pre-30 invoke hats（default required=10,30,40 · ∩{10,20,00}={10} 须落盘才 PASS）
      await writeRel(dir, 'docs/harness/invokes/by-task/d5_pyproject/invoke_20260801_10_d5_pyproject.md', '# invoke 10 fixture')
      const v = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 2, v.combined)
      assert.doesNotMatch(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /D5: test_strategy=required/, v.combined)
      const a = await runCore(['audit', '--task', rel, '--target', dir])
      assert.notEqual(a.status, 0, a.combined)
      assert.doesNotMatch(a.combined, /WARN/, a.combined)
      assert.match(a.combined, /D5/, a.combined)
    })
  })

  it('C5d: 仅无 test 步骤 workflow → D5 FAIL（非 0，DEF-014 · 1.5.0 WARN→FAIL 硬化）', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_d5_lintci_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'd5_lintci',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'required',
        }),
      )
      await writeRel(
        dir,
        '.github/workflows/lint.yml',
        [
          'name: lint',
          'on: [push]',
          'jobs:',
          '  lint:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - name: Run linter',
          '        run: npm run lint',
          '',
        ].join('\n'),
      )
      // DEF-003 T4：verify 查 R<n> 审查文存在性 · 补审查文保持本用例 PASS 口径
      await writeRel(dir, 'docs/harness/reviews/task_d5_lintci_audit_R1_2026-08-20.md', '# R1 fixture\n\n## 结论\n\nPASS · 零内容阻塞（fixture）\n\n审查结论：fixture 范围与验收全项合规，无阻塞遗留，准予关账。\n')
      // DEF-003 T5：verify 查 pre-30 invoke hats（default required=10,30,40 · ∩{10,20,00}={10} 须落盘才 PASS）
      await writeRel(dir, 'docs/harness/invokes/by-task/d5_lintci/invoke_20260801_10_d5_lintci.md', '# invoke 10 fixture')
      const v = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 2, v.combined)
      assert.doesNotMatch(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /D5: test_strategy=required/, v.combined)
    })
  })

  it('C5e: CI 含 pytest 步骤 → D5 真 PASS（无 WARN，DEF-014 回归）', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_d5_pytestci_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'd5_pytestci',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'required',
        }),
      )
      await writeRel(
        dir,
        '.github/workflows/ci.yml',
        [
          'name: ci',
          'on: [push]',
          'jobs:',
          '  test:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - name: Run tests',
          '        run: pytest tests -q',
          '',
        ].join('\n'),
      )
      // DEF-003 T4：verify 查 R<n> 审查文存在性 · 补审查文保持本用例 PASS 口径
      await writeRel(dir, 'docs/harness/reviews/task_d5_pytestci_audit_R1_2026-08-20.md', '# R1 fixture\n\n## 结论\n\nPASS · 零内容阻塞（fixture）\n\n审查结论：fixture 范围与验收全项合规，无阻塞遗留，准予关账。\n')
      // DEF-003 T5：verify 查 pre-30 invoke hats（default required=10,30,40 · ∩{10,20,00}={10} 须落盘才 PASS）
      await writeRel(dir, 'docs/harness/invokes/by-task/d5_pytestci/invoke_20260801_10_d5_pytestci.md', '# invoke 10 fixture')
      const v = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 0, v.combined)
      assert.doesNotMatch(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /VERIFY: PASS/, v.combined)
    })
  })

  it('C5f: test_*.py 文件存在 → D5 真 PASS（无 WARN，DEF-014 回归）', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_d5_pyfile_v1.md'
      await writeRel(
        dir,
        rel,
        taskMd({
          slug: 'd5_pyfile',
          audit: 'approved',
          draft: 'approved',
          testStrategy: 'required',
        }),
      )
      await writeRel(dir, 'test_smoke.py', 'def test_ok():\n    assert True\n')
      // DEF-003 T4：verify 查 R<n> 审查文存在性 · 补审查文保持本用例 PASS 口径
      await writeRel(dir, 'docs/harness/reviews/task_d5_pyfile_audit_R1_2026-08-20.md', '# R1 fixture\n\n## 结论\n\nPASS · 零内容阻塞（fixture）\n\n审查结论：fixture 范围与验收全项合规，无阻塞遗留，准予关账。\n')
      // DEF-003 T5：verify 查 pre-30 invoke hats（default required=10,30,40 · ∩{10,20,00}={10} 须落盘才 PASS）
      await writeRel(dir, 'docs/harness/invokes/by-task/d5_pyfile/invoke_20260801_10_d5_pyfile.md', '# invoke 10 fixture')
      const v = await runCore(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 0, v.combined)
      assert.doesNotMatch(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /VERIFY: PASS/, v.combined)
    })
  })

  it('C6: task lint 缺必填节 E 失败；仅风格 W 不挡', async () => {
    await withTemp(async (dir) => {
      const missing = path.join(dir, 'task_missing_accept.md')
      await writeFile(
        missing,
        taskMd({
          slug: 'missing_accept',
          includeAcceptance: false,
          includeGates: false,
        }),
        'utf8',
      )
      const fail = await runCore(['task', 'lint', '--file', missing], dir)
      assert.notEqual(fail.status, 0, fail.combined)
      assert.match(fail.combined, /LINT: FAIL|E3|验收标准/)

      const warnFile = path.join(dir, 'task_style_only.md')
      await writeFile(
        warnFile,
        taskMd({
          slug: 'style_only',
          includeGates: false,
          selfCheckBody: '（30/40 回填）',
          // T1（K2）：E8 起 wiki_delta 为 lint 必备行；本用例口径为「仅风格 W 不挡」须带齐
          wikiDelta: 'none',
        }),
        'utf8',
      )
      const warn = await runCore(['task', 'lint', '--file', warnFile], dir)
      assert.equal(warn.status, 0, warn.combined)
      assert.match(warn.combined, /warn:|W2|W3|LINT: PASS/)
    })
  })

  it('C7: task close 校验未过拒 mv；过则 active→done', async () => {
    await withTemp(async (dir) => {
      const failRel = 'docs/tasks/active/task_close_fail_v1.md'
      const failAbs = await writeRel(
        dir,
        failRel,
        taskMd({
          slug: 'close_fail',
          status: 'draft',
          audit: 'approved',
          draft: 'approved',
          checked: false,
        }),
      )
      const blocked = await runCore(['task', 'close', '--file', failAbs, '--yes', '--target', dir])
      assert.notEqual(blocked.status, 0, blocked.combined)
      assert.equal(existsSync(failAbs), true)
      assert.equal(existsSync(path.join(dir, 'docs/tasks/done/task_close_fail_v1.md')), false)

      const okRel = 'docs/tasks/active/task_close_ok_v1.md'
      const okAbs = await writeRel(
        dir,
        okRel,
        taskMd({
          slug: 'close_ok',
          status: 'done',
          audit: 'approved',
          draft: 'approved',
          checked: true,
          selfCheckBody: '自检已回填：fixture close ok。',
        }),
      )
      // DEF-003 T6：close 守卫接线后，legacy fixture（无 invoke/review/wiki_delta/KPI 制品）
      // 须显式豁免旗标才过；graph_delta 缺字段为 warn 不挡（lifecycle.yaml 口径）
      const pass = await runCore([
        'task', 'close', '--file', okAbs, '--yes',
        '--allow-invoke-gap', '--allow-no-review', '--allow-kpi-gap', '--allow-wiki-gap',
        '--allow-no-pr-merge',
      ])
      assert.equal(pass.status, 0, pass.combined)
      assert.equal(existsSync(okAbs), false)
      assert.equal(existsSync(path.join(dir, 'docs/tasks/done/task_close_ok_v1.md')), true)
    })
  })

  it('C8 / R-C8: 合法 fixture 上 graph yaml compile 或 skills check → exit 0', async () => {
    await withTemp(async (dir) => {
      const input = path.join(dir, 'docs', '_tech_graph')
      await writeRel(
        dir,
        'docs/_tech_graph/g1.graph.yaml',
        `graph_id: "g1"
title: "rc8"
nodes:
  - id: "A"
    label: "A"
  - id: "B"
    label: "B"
edges:
  - from: "A"
    to: "B"
    label: "->"
`,
      )
      const r = await runCore(
        ['graph', 'yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir],
        dir,
      )
      assert.equal(r.status, 0, r.combined)
      assert.equal(/未交付/.test(r.combined), false)
    })
    const s = await runCore(['skills', 'check'])
    assert.equal(s.status, 0, s.combined)
    assert.equal(/未交付/.test(s.combined), false)
  })

  it('CLI 源码不把闸命令注册为 ctx.tools', async () => {
    const cliSrc = await readFile(CLI_TS, 'utf8')
    assert.equal(cliSrc.includes('ctx.tools.register'), false)
    // 3.0 W0 布局适配（readdir 静态扫描 × src/cli/ 目录布局 · task_3_0_w0_refactor_prep）：
    // withFileTypes + 递归下探 cli 前缀目录（禁跳过目录 —— src/cli/*.ts 不得逃出扫描面）；
    // 扫描面 = src/ 顶层全部 cli* 文件 + cli* 目录内全部 .ts，断言意图与覆盖不缩（00 裁决条件 1）。
    const scanCliSources = async (dir: string, topLevel: boolean): Promise<string[]> => {
      const entries = await readdir(dir, { withFileTypes: true })
      const out: string[] = []
      for (const ent of entries) {
        const full = path.join(dir, ent.name)
        if (ent.isDirectory()) {
          if (topLevel && ent.name.startsWith('cli')) out.push(...(await scanCliSources(full, false)))
          continue
        }
        if (topLevel ? ent.name.startsWith('cli') : ent.name.endsWith('.ts')) out.push(full)
      }
      return out
    }
    for (const file of await scanCliSources(path.join(KIT, 'src'), true)) {
      const body = await readFile(file, 'utf8')
      assert.equal(body.includes('ctx.tools.register'), false, file)
    }
  })
})
