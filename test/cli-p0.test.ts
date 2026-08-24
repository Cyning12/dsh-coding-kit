import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

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
  it('C-bin / version: package.json 为 1.2.4 且有 bin.dsh-coding-kit', async () => {
    const pkgRaw = await readFile(path.join(KIT, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw) as {
      version: string
      bin?: Record<string, string>
    }
    assert.equal(pkg.version, '1.2.4')
    assert.notEqual(pkg.version, '1.0.0')
    assert.notEqual(pkg.version, '0.1.0')
    assert.ok(pkg.bin && pkg.bin['dsh-coding-kit'], 'missing bin.dsh-coding-kit')
    const binPath = path.join(KIT, pkg.bin['dsh-coding-kit'])
    assert.equal(existsSync(binPath), true, `bin file missing: ${binPath}`)
  })

  it('R-HELP: --help 列出 P0 与 G1–G7，无「未交付（1.2.0）」', () => {
    const r = runCli(['--help'])
    assert.equal(r.status, 0)
    const help = r.combined
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

  it('R-HELP README: 完成态 1.2.4；双入口；加载≠注入；钉版后可去旧包', async () => {
    const readme = await readFile(path.join(KIT, 'README.md'), 'utf8')
    assert.match(readme, /dsh-coding-kit@1\.2\.4/)
    assert.match(readme, /加载\s*≠\s*注入/)
    assert.match(readme, /apply_coding_standards/)
    assert.match(readme, /dsh plugin add/)
    assert.match(readme, /npx dsh-coding-kit/)
    assert.match(readme, /去掉 `@cyning\/harness`/)
    assert.match(readme, /devDependency/)
    assert.match(readme, /upgrade --yes/)
    assert.equal(/dsh init --coding-kit/.test(readme), false)
    assert.equal(/未交付（1\.2\.0）/.test(readme), false)
    assert.equal(/1\.1\.0 未交付/.test(readme), false)
    assert.equal(/当成 1\.1\.0 已可用/.test(readme), false)
    assert.equal(/dsh-coding-kit@1\.1\.0/.test(readme), false)
  })

  it('D8: bin 仅 dsh-coding-kit；patch 为 insert；pack 不含 SPEC.md', async () => {
    const pkgRaw = await readFile(path.join(KIT, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw) as {
      version: string
      bin?: Record<string, string>
      files?: string[]
    }
    assert.equal(pkg.version, '1.2.4')
    assert.ok(pkg.bin)
    assert.deepEqual(Object.keys(pkg.bin), ['dsh-coding-kit'])
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
    assert.equal(info.version, '1.2.4')
    assert.match(String(info.filename ?? info.id ?? ''), /dsh-coding-kit-1\.2\.4/)
    const paths = (info.files ?? []).map((f) => f.path.replace(/\\/g, '/'))
    const joined = paths.join('\n')
    assert.equal(paths.includes('SPEC.md'), false, 'pack must not contain SPEC.md')
    assert.match(joined, /(^|\n)cordis\.patch\.yml(\n|$)/)
    assert.match(joined, /(^|\n)bin\/dsh-coding-kit\.js(\n|$)/)
    assert.match(joined, /(^|\n)lib\/index\.js(\n|$)/)
    assert.equal(paths.some((p) => p === 'assets/standards' || p.startsWith('assets/standards/')), true)
    assert.equal(paths.some((p) => p.includes('docs/dsh_coding_kit_init')), false)
    assert.equal(paths.some((p) => p === 'src' || p.startsWith('src/')), false)
    assert.equal(paths.some((p) => p === 'node_modules' || p.startsWith('node_modules/')), false)
  })

  it('upgrade 已注册：--help 可见且调用不是 §2.2 失败口', async () => {
    const help = runCli(['--help'])
    assert.match(help.combined, /\bupgrade\b/)
    await withTemp(async (dir) => {
      const r = runCli(['upgrade', '--yes', '--target', dir])
      assert.notEqual(r.status, 0)
      assert.equal(/未交付（1\.2\.0）/.test(r.combined), false)
      assert.match(r.combined, /init|manifest|未接入/)
    })
  })

  it('C1: init --preset harness-only --yes 写出 version=1.2.4 且不写 S2', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'harness-only', '--yes', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const mfPath = path.join(dir, '.cyning-harness', 'manifest.json')
      assert.equal(existsSync(mfPath), true)
      const mf = JSON.parse(await readFile(mfPath, 'utf8')) as { version: string }
      assert.equal(mf.version, '1.2.4')
      for (const rel of S2_RELS) {
        assert.equal(existsSync(path.join(dir, rel)), false, `S2 leaked: ${rel}`)
      }
    })
  })

  it('C3: verify --task pending → exit 2 且 VERIFY: BLOCKED', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_pending_gate_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'pending_gate', audit: 'pending', draft: 'pending' }))
      const r = runCli(['verify', '--task', rel, '--target', dir])
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
      const r = runCli(['verify', '--task', rel, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('C5: gate-check / audit 对 pending 闸非 0，文案含 → 30 不可开工 或 BLOCKED', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_pending_gate_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'pending_gate', audit: 'pending' }))
      const g = runCli(['gate-check', '--task', rel, '--target', dir])
      assert.notEqual(g.status, 0, g.combined)
      assert.match(g.combined, /→ 30 不可开工|BLOCKED/)
      const a = runCli(['audit', '--task', rel, '--target', dir])
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
      const v = runCli(['verify', '--task', rel, '--target', dir])
      assert.notEqual(v.status, 0, v.combined)
      assert.match(v.combined, /D5|test_strategy/)
      const a = runCli(['audit', '--task', rel, '--target', dir])
      assert.notEqual(a.status, 0, a.combined)
      assert.match(a.combined, /D5|test_strategy/)
    })
  })

  it('C5c: 仅 pyproject.toml 无测试制品 → D5 WARN 过渡（exit 0 且含 WARN，DEF-014）', async () => {
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
      const v = runCli(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 0, v.combined)
      assert.match(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /D5/, v.combined)
      const a = runCli(['audit', '--task', rel, '--target', dir])
      assert.equal(a.status, 0, a.combined)
      assert.match(a.combined, /WARN/, a.combined)
    })
  })

  it('C5d: 仅无 test 步骤 workflow → D5 WARN 过渡（exit 0 且含 WARN，DEF-014）', async () => {
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
      const v = runCli(['verify', '--task', rel, '--target', dir])
      assert.equal(v.status, 0, v.combined)
      assert.match(v.combined, /WARN/, v.combined)
      assert.match(v.combined, /D5/, v.combined)
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
      const v = runCli(['verify', '--task', rel, '--target', dir])
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
      const v = runCli(['verify', '--task', rel, '--target', dir])
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
      const fail = runCli(['task', 'lint', '--file', missing], dir)
      assert.notEqual(fail.status, 0, fail.combined)
      assert.match(fail.combined, /LINT: FAIL|E3|验收标准/)

      const warnFile = path.join(dir, 'task_style_only.md')
      await writeFile(
        warnFile,
        taskMd({
          slug: 'style_only',
          includeGates: false,
          selfCheckBody: '（30/40 回填）',
        }),
        'utf8',
      )
      const warn = runCli(['task', 'lint', '--file', warnFile], dir)
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
      const blocked = runCli(['task', 'close', '--file', failAbs, '--yes', '--target', dir])
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
      const pass = runCli(['task', 'close', '--file', okAbs, '--yes'])
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
      const r = runCli(
        ['graph', 'yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir],
        dir,
      )
      assert.equal(r.status, 0, r.combined)
      assert.equal(/未交付/.test(r.combined), false)
    })
    const s = runCli(['skills', 'check'])
    assert.equal(s.status, 0, s.combined)
    assert.equal(/未交付/.test(s.combined), false)
  })

  it('CLI 源码不把闸命令注册为 ctx.tools', async () => {
    const cliSrc = await readFile(CLI_TS, 'utf8')
    assert.equal(cliSrc.includes('ctx.tools.register'), false)
    const names = await readdir(path.join(KIT, 'src'))
    for (const name of names) {
      if (!name.startsWith('cli')) continue
      const body = await readFile(path.join(KIT, 'src', name), 'utf8')
      assert.equal(body.includes('ctx.tools.register'), false, name)
    }
  })
})
