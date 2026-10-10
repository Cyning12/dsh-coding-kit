import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { CliError } from '../src/cli-shared.ts'
import { cmdRefreshIdeBlocks } from '../src/cli-refresh-ide-blocks.ts'
import { cmdUpgrade } from '../src/cli/init.ts'
import { readPkgVersion } from '../src/cli/usage.ts'

// R-07：refresh-ide-blocks 子命令测试矩阵 M01–M19
// SPEC: docs/spec/self-tech-graph/reference/POINTERS.md#R07
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

const PB = '<!-- cyning-harness:begin -->'
const PE = '<!-- cyning-harness:end -->'
const LB = '<!-- cyning-harness-local:begin -->'
const LE = '<!-- cyning-harness-local:end -->'
const OLD_VERIFY = 'npx @cyning/harness verify --target . --task docs/tasks/active/task_*.md'

type RunResult = { status: number | null; stdout: string; stderr: string; combined: string }

function runCli(args: string[], cwd: string): RunResult {
  const r = spawnSync(process.execPath, ['--experimental-strip-types', CLI_TS, ...args], {
    encoding: 'utf8',
    cwd,
    env: { ...process.env },
  })
  return {
    status: r.status,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    combined: `${r.stdout ?? ''}\n${r.stderr ?? ''}`,
  }
}

// E3（3.0 W0 第一批 · task_3_0_w0_refactor_prep）：spawn 型断言下沉 —— 进程内直调
// 被测 cmd* 核心实现（零子进程），断言逐字保留。输出捕获与 exit 码映射对齐
// bin/exitWithCliError 行为（CliError.exitCode → status · message → stderr）。
// 标注「烟测」的用例保留 runCli spawn（bin→CLI 全链 · 每文件 ≤5 条）。
function makeCore(fn: (args: string[]) => Promise<void>): (args: string[]) => Promise<RunResult> {
  return async (args) => {
    const out: string[] = []
    const err: string[] = []
    const origLog = console.log
    const origError = console.error
    const origWrite = process.stdout.write
    console.log = (...a: unknown[]) => {
      out.push(a.map(String).join(' '))
    }
    console.error = (...a: unknown[]) => {
      err.push(a.map(String).join(' '))
    }
    process.stdout.write = ((chunk: unknown) => {
      out.push(String(chunk).replace(/\n$/, ''))
      return true
    }) as typeof process.stdout.write
    let status = 0
    try {
      await fn(args)
    } catch (e) {
      if (e instanceof CliError) {
        status = e.exitCode
        if (e.message) err.push(e.message)
      } else {
        throw e
      }
    } finally {
      console.log = origLog
      console.error = origError
      process.stdout.write = origWrite
    }
    const stdout = out.length > 0 ? out.join('\n') + '\n' : ''
    const stderr = err.length > 0 ? err.join('\n') + '\n' : ''
    return { status, stdout, stderr, combined: `${stdout}\n${stderr}` }
  }
}

const runRefresh = makeCore(cmdRefreshIdeBlocks)
const runUpgrade = makeCore(async (args) => cmdUpgrade(args, await readPkgVersion()))

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-r07-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function writeRel(root: string, rel: string, body: string): Promise<void> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
}

function parseJson(stdout: string): Record<string, unknown> {
  const line = stdout.trim().split('\n').filter((l) => l.trim().startsWith('{')).pop()
  assert.ok(line, `stdout 须含单行 JSON: ${stdout}`)
  return JSON.parse(line) as Record<string, unknown>
}

function gitOk(args: string[], cwd: string): void {
  const r = spawnSync('git', args, { encoding: 'utf8', cwd })
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`)
}

// 3.0-W5 R-6 前置探测（硬约束 10）：实跑式 git --version 判（非 which 式 · F-W5-07）·
// 与 w2-shell-hook.test.ts:47-49 先例同构（各文件同构口径 · task S5.5）。
function gitAvailable(): boolean {
  return spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0
}

async function initGitRepo(dir: string): Promise<void> {
  gitOk(['init', '-q'], dir)
  gitOk(['add', '-A'], dir)
  gitOk(['-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'init'], dir)
}

// M01/M02/M03 共用 fixture：块外含旧字面散文（V6 块外零 diff 断言面）
const M01_BODY = [
  '# 仓根 AGENTS',
  '',
  `散文提及 ${OLD_VERIFY} 在块外，绝不可动。`,
  '',
  PB,
  '3. 改码前：',
  `   - 运行 \`${OLD_VERIFY}\``,
  PE,
  '',
  '尾部正文保持不变。',
  '',
].join('\n')

describe('R-07 refresh-ide-blocks', { concurrency: 1 }, () => {
  // 烟测（bin→CLI 全链）
  it('M01: 基本替换 — 块内 A1 归零、块外同字面字节不变', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r = runCli(['refresh-ide-blocks', '--yes', '--target', dir], dir)
      assert.equal(r.status, 0, r.combined)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.match(now, /npx spec-wave verify --target \. --task docs\/tasks\/active\/task_\*\.md/)
      assert.equal(now.includes(`运行 \`npx @cyning/harness`), false, '块内旧字面须归零')
      assert.equal(now.includes('npx npx'), false, '替换不得产生 npx npx 双前缀')
      assert.ok(now.includes(`散文提及 ${OLD_VERIFY} 在块外`), '块外同字面字节不变')
      assert.ok(now.includes(PB) && now.includes(PE), 'marker 行不动')
      assert.ok(now.endsWith('尾部正文保持不变。\n'), '尾部正文字节不变')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M02: 幂等重跑 — 第二次 files_written=0、字节不变、exit 0', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r1 = await runRefresh(['--yes', '--target', dir])
      assert.equal(r1.status, 0, r1.combined)
      const after1 = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      const r2 = await runRefresh(['--yes', '--json', '--target', dir])
      assert.equal(r2.status, 0, r2.combined)
      const report = parseJson(r2.stdout)
      const totals = report.totals as { files_written: number }
      assert.equal(totals.files_written, 0, r2.stdout)
      const after2 = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.equal(after2, after1, '幂等：第二次运行文件字节不变')
    })
  })

  // 烟测（bin→CLI 全链）
  it('M03: dry-run 默认 — 零写入、报告含计划、exit 0；显式 --dry-run 同效', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r = runCli(['refresh-ide-blocks', '--target', dir], dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /dry-run/)
      assert.match(r.combined, /计划写入/)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), M01_BODY, 'dry-run 零写入')
      const r2 = runCli(['refresh-ide-blocks', '--dry-run', '--target', dir], dir)
      assert.equal(r2.status, 0, r2.combined)
      assert.match(r2.combined, /计划写入/)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), M01_BODY, '显式 --dry-run 零写入')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M04: 旗标冲突 — --yes 与 --dry-run 同现 exit 1', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r = await runRefresh(['--yes', '--dry-run', '--target', dir])
      assert.equal(r.status, 1, r.combined)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), M01_BODY)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M05: 无 marker 文件 — blocks=0、不写、exit 0', async () => {
    await withTemp(async (dir) => {
      const body = '# plain AGENTS\n无 marker。\n'
      await writeRel(dir, 'AGENTS.md', body)
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const files = report.files as Array<{ path: string; blocks: number }>
      const f = files.find((x) => x.path === 'AGENTS.md')
      assert.ok(f, r.stdout)
      assert.equal(f.blocks, 0)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M06: 发现面为空 — files_scanned=0、exit 0', async () => {
    await withTemp(async (dir) => {
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const totals = report.totals as { files_scanned: number }
      assert.equal(totals.files_scanned, 0, r.stdout)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M07: 多块同文件 — 两个 product 块均处理、计数正确', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- \`npx @cyning/harness verify\``,
        PE,
        '块间正文。',
        PB,
        `- \`npx @cyning/harness audit\``,
        PE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const totals = report.totals as { product_blocks: number; rewrites: number }
      assert.equal(totals.product_blocks, 2, r.stdout)
      assert.equal(totals.rewrites, 2, r.stdout)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 0, ry.combined)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify') && now.includes('npx spec-wave audit'))
      assert.ok(now.includes('块间正文。'), '块间正文字节不变')
    })
  })

  // 烟测（bin→CLI 全链）
  it('M08: 畸形三子例 — 嵌套 begin / begin 无 end / end 无 begin → 整文件 MALFORMED', async () => {
    const cases: Array<[string, string]> = [
      ['nested_begin', [PB, 'a', PB, 'b', PE, ''].join('\n')],
      ['unclosed_begin', [PB, 'a', ''].join('\n')],
      ['unmatched_end', ['a', PE, ''].join('\n')],
    ]
    for (const [name, body] of cases) {
      await withTemp(async (dir) => {
        await writeRel(dir, 'AGENTS.md', body)
        const rd = runCli(['refresh-ide-blocks', '--target', dir], dir)
        assert.equal(rd.status, 0, `${name} dry-run: ${rd.combined}`)
        assert.match(rd.combined, /malformed/i, `${name} dry-run 须报告 malformed`)
        const ry = runCli(['refresh-ide-blocks', '--yes', '--target', dir], dir)
        assert.equal(ry.status, 2, `${name} --yes: ${ry.combined}`)
        assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body, `${name} 零写入`)
        assert.equal(existsSync(path.join(dir, '.coding-kit', 'backups')), false, `${name} 不产生备份`)
      })
    }
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M09: local 块跳过 — local 内旧字面不动、skipped_local_blocks=1', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- \`npx @cyning/harness verify\``,
        PE,
        '',
        LB,
        `- local 自定义 \`npx @cyning/harness audit\``,
        LE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const r = await runRefresh(['--yes', '--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const files = report.files as Array<{ skipped_local_blocks: number }>
      assert.equal(files[0]?.skipped_local_blocks, 1, r.stdout)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify'), 'product 块已刷')
      assert.ok(now.includes('local 自定义 `npx @cyning/harness audit`'), 'local 块内旧字面不动')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M10: local 嵌套在 product 块内 → MALFORMED、--yes exit 2 零写入', async () => {
    await withTemp(async (dir) => {
      const body = [PB, `- \`npx @cyning/harness verify\``, LB, 'x', LE, PE, ''].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 2, ry.combined)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body, '零写入')
      const rd = await runRefresh(['--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      assert.match(rd.combined, /malformed/i)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M11: S2 断言闸 — --target 落在 docs/tasks 内 → exit 2、零写入', async () => {
    await withTemp(async (dir) => {
      const body = [PB, `- \`npx @cyning/harness verify\``, PE, ''].join('\n')
      await writeRel(dir, 'docs/tasks/x/AGENTS.md', body)
      const target = path.join(dir, 'docs', 'tasks', 'x')
      const r = await runRefresh(['--yes', '--target', target])
      assert.equal(r.status, 2, r.combined)
      assert.equal(await readFile(path.join(target, 'AGENTS.md'), 'utf8'), body, '零写入')
    })
  })

  // 烟测（bin→CLI 全链）
  it('M12: 脏树 fail-fast — git 仓 + 未提交变更 + --yes → exit 2、零写入、无备份', async (t) => {
    if (!gitAvailable()) {
      t.skip('git 不可用（环境不具备 · 硬约束 10 · R-6）')
      return
    }
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', '# clean\n')
      await initGitRepo(dir)
      const dirty = [PB, `- \`npx @cyning/harness verify\``, PE, ''].join('\n')
      await writeRel(dir, 'AGENTS.md', dirty)
      const r = runCli(['refresh-ide-blocks', '--yes', '--target', dir], dir)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /脏|dirty|git status/i)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), dirty, '零写入')
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'backups')), false, '备份目录不产生')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M13: 非 git target — --yes 可写、git=none、stdout 含警告行', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r = await runRefresh(['--yes', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /非 git|git: none/i)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify'), '非 git 仓仍可写')
      const rj = await runRefresh(['--dry-run', '--json', '--target', dir])
      assert.equal(rj.status, 0, rj.combined)
      const report = parseJson(rj.stdout)
      assert.equal(report.git, 'none', rj.stdout)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M14: 多版本混杂 MIXED — --yes exit 2 零写入；dry-run exit 0 报告 mixed', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- 旧 \`npx @cyning/harness verify\``,
        `- 新 \`npx spec-wave check\``,
        PE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 2, ry.combined)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body, '零写入')
      const rd = await runRefresh(['--json', '--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      const report = parseJson(rd.stdout)
      const files = report.files as Array<{ status: string }>
      assert.equal(files[0]?.status, 'mixed', rd.stdout)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M15: 多 IDE 文件 — AGENTS/CLAUDE/.mdc 同 target；.mdc 无块恒 no-op', async () => {
    await withTemp(async (dir) => {
      const block = [PB, `- \`npx @cyning/harness verify\``, PE, ''].join('\n')
      const mdc = `# cursor rule\n散文 \`npx @cyning/harness verify\` 无 marker。\n`
      await writeRel(dir, 'AGENTS.md', block)
      await writeRel(dir, 'CLAUDE.md', block)
      await writeRel(dir, '.cursor/rules/x.mdc', mdc)
      const r = await runRefresh(['--yes', '--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const totals = report.totals as { files_scanned: number; files_written: number }
      assert.equal(totals.files_scanned, 3, r.stdout)
      assert.equal(totals.files_written, 2, r.stdout)
      assert.ok((await readFile(path.join(dir, 'AGENTS.md'), 'utf8')).includes('npx spec-wave verify'))
      assert.ok((await readFile(path.join(dir, 'CLAUDE.md'), 'utf8')).includes('npx spec-wave verify'))
      assert.equal(await readFile(path.join(dir, '.cursor/rules/x.mdc'), 'utf8'), mdc, '.mdc 恒 no-op')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M16: 映射表全覆盖 — A1–A4 全替换（A2/A3 丢钉版）、B1–B5 仅计数不替换', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- 旧验证 \`npx @cyning/harness verify --target .\``,
        `- 钉版 \`npx @cyning/harness@2.24.0 check\``,
        `- yes 钉版 \`npx --yes @cyning/harness@1.0.0 init\``,
        `- 裸 bin \`harness skills build\``,
        `- env \`CYNING_HARNESS=1\` 需人工`,
        `- 旗标 \`--with-scripts\` 需人工`,
        `- 脚本 \`wizard/install.sh\` 需人工`,
        `- script 名 \`"harness:check"\` 需人工`,
        `- 安装 \`npm i @cyning/harness\` 需人工`,
        PE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const rd = await runRefresh(['--dry-run', '--json', '--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body, 'dry-run 零写入')
      const report = parseJson(rd.stdout)
      const f = (report.files as Array<{
        rewrites: Array<{ rule: string; count: number; dropped_pin: boolean }>
        report_only: Array<{ rule: string; count: number }>
      }>)[0]
      assert.ok(f, rd.stdout)
      const rw = Object.fromEntries(f.rewrites.map((x) => [x.rule, x]))
      assert.equal(rw.A1?.count, 1, rd.stdout)
      assert.equal(rw.A2?.count, 1, rd.stdout)
      assert.equal(rw.A2?.dropped_pin, true, 'A2 钉版丢弃须记 dropped_pin')
      assert.equal(rw.A3?.count, 1, rd.stdout)
      assert.equal(rw.A3?.dropped_pin, true, 'A3 钉版丢弃须记 dropped_pin')
      assert.equal(rw.A4?.count, 1, rd.stdout)
      const ro = Object.fromEntries(f.report_only.map((x) => [x.rule, x.count]))
      for (const b of ['B1', 'B2', 'B3', 'B4', 'B5']) assert.ok((ro[b] ?? 0) >= 1, `${b} 须计数: ${rd.stdout}`)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 0, ry.combined)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify --target .'), 'A1 替换')
      assert.ok(now.includes('npx spec-wave check'), 'A2 替换且丢钉版')
      assert.equal(now.includes('@2.24.0'), false, 'A2 钉版整体丢弃')
      assert.ok(now.includes('npx --yes spec-wave init'), 'A3 保留 --yes 丢钉版')
      assert.equal(now.includes('npx npx'), false, '替换不得产生 npx npx 双前缀')
      assert.ok(now.includes('npx spec-wave skills build'), 'A4 替换')
      // V7：B 组字面写盘后原样存在
      assert.ok(now.includes('CYNING_HARNESS=1'), 'B1 不替换')
      assert.ok(now.includes('--with-scripts'), 'B2 不替换')
      assert.ok(now.includes('wizard/install.sh'), 'B3 不替换')
      assert.ok(now.includes('"harness:check"'), 'B4 不替换')
      assert.ok(now.includes('npm i @cyning/harness'), 'B5 不替换')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M17: A4 防二刷 — 已含 npx spec-wave skills build 不误命中', async () => {
    await withTemp(async (dir) => {
      const body = [PB, `- \`npx spec-wave skills build\``, PE, ''].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const r = await runRefresh(['--yes', '--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const totals = report.totals as { rewrites: number; files_written: number }
      assert.equal(totals.rewrites, 0, r.stdout)
      assert.equal(totals.files_written, 0, r.stdout)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), body, '字节不变')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M17b: B-REFRESH A5–A7 — npx dsh-coding-kit[@pin|/--yes] → npx spec-wave', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- \`npx dsh-coding-kit verify\``,
        `- \`npx dsh-coding-kit@2.1.1 check\``,
        `- \`npx --yes dsh-coding-kit@2.1.1 init\``,
        PE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const rd = await runRefresh(['--dry-run', '--json', '--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      const report = parseJson(rd.stdout)
      const f = (report.files as Array<{
        rewrites: Array<{ rule: string; count: number; dropped_pin: boolean }>
      }>)[0]
      assert.ok(f, rd.stdout)
      const rw = Object.fromEntries(f.rewrites.map((x) => [x.rule, x]))
      assert.equal(rw.A5?.count, 1, rd.stdout)
      assert.equal(rw.A6?.count, 1, rd.stdout)
      assert.equal(rw.A6?.dropped_pin, true, rd.stdout)
      assert.equal(rw.A7?.count, 1, rd.stdout)
      assert.equal(rw.A7?.dropped_pin, true, rd.stdout)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 0, ry.combined)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify'), 'A5')
      assert.ok(now.includes('npx spec-wave check'), 'A6')
      assert.ok(now.includes('npx --yes spec-wave init'), 'A7')
      assert.equal(now.includes('dsh-coding-kit'), false, '旧 kit 字面归零')
      assert.equal(now.includes('@2.1.1'), false, '钉版丢弃')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M17c: A8 — npx specgate[@pin|/--yes] → npx spec-wave（钉版丢弃）', async () => {
    await withTemp(async (dir) => {
      const body = [
        PB,
        `- \`npx specgate verify\``,
        `- \`npx specgate@2.1.1 check\``,
        `- \`npx --yes specgate@2.1.1 init\``,
        PE,
        '',
      ].join('\n')
      await writeRel(dir, 'AGENTS.md', body)
      const rd = await runRefresh(['--dry-run', '--json', '--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      const report = parseJson(rd.stdout)
      const f = (report.files as Array<{
        rewrites: Array<{ rule: string; count: number; dropped_pin: boolean }>
      }>)[0]
      assert.ok(f, rd.stdout)
      const rw = Object.fromEntries(f.rewrites.map((x) => [x.rule, x]))
      assert.equal(rw.A8?.count, 3, rd.stdout)
      assert.equal(rw.A8?.dropped_pin, true, rd.stdout)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 0, ry.combined)
      const now = await readFile(path.join(dir, 'AGENTS.md'), 'utf8')
      assert.ok(now.includes('npx spec-wave verify'), 'A8 plain')
      assert.ok(now.includes('npx spec-wave check'), 'A8 pin')
      assert.ok(now.includes('npx --yes spec-wave init'), 'A8 yes+pin')
      assert.equal(now.includes('npx specgate'), false, '旧 specgate 字面归零')
      assert.equal(now.includes('@2.1.1'), false, '钉版丢弃')
    })
  })

  // 烟测（bin→CLI 全链）
  it('M18: 报告与 exit 码 — 人类表字段齐全、--json 合 §5.4 schema', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const rh = runCli(['refresh-ide-blocks', '--target', dir], dir)
      assert.equal(rh.status, 0, rh.combined)
      for (const kw of ['refresh-ide-blocks', 'AGENTS.md', '状态', 'A1', '汇总', 'files_scanned', '计划写入', '回滚']) {
        assert.ok(rh.combined.includes(kw), `人类表缺字段 ${kw}: ${rh.combined}`)
      }
      const rj = runCli(['refresh-ide-blocks', '--json', '--target', dir], dir)
      assert.equal(rj.status, 0, rj.combined)
      const report = parseJson(rj.stdout)
      assert.equal(report.schema, 'dsh-coding-kit/refresh-ide-blocks-report@1')
      assert.equal(report.mode, 'dry-run')
      assert.equal(typeof report.target, 'string')
      assert.ok(['clean', 'dirty', 'none'].includes(String(report.git)), rj.stdout)
      const totals = report.totals as Record<string, number>
      for (const k of ['files_scanned', 'product_blocks', 'rewrites', 'report_only', 'files_written']) {
        assert.equal(typeof totals[k], 'number', `totals.${k}`)
      }
      const f = (report.files as Array<Record<string, unknown>>)[0]
      assert.ok(f)
      assert.equal(f.path, 'AGENTS.md')
      assert.equal(f.blocks, 1)
      assert.equal(f.status, 'ok')
      assert.equal(f.written, false)
      assert.ok(Array.isArray(f.rewrites) && Array.isArray(f.report_only), rj.stdout)
      // exit 三档：0（本例/M03）· 1（M04）· 2（M12）分别已断言
    })
  })

  // 下沉（进程内直调 cmdUpgrade）
  it('M19a: upgrade 内嵌提示 — stdout 含提示行、IDE 文件字节不变、exit 码不变', async () => {
    await withTemp(async (dir) => {
      await writeRel(
        dir,
        '.coding-kit/manifest.json',
        `${JSON.stringify({ version: '1.2.0', preset: 'harness-only', ide: [], from_version: null, upgraded_at: '2026-08-16T00:00:00Z' }, null, 2)}\n`,
      )
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const r = await runUpgrade(['--yes', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /refresh-ide-blocks --yes/, 'upgrade 后须含提示行')
      assert.match(r.combined, /检测到 \d+ 处 IDE 块内旧命令字面/)
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), M01_BODY, 'upgrade 不写 IDE 文件')
      const mf = JSON.parse(await readFile(path.join(dir, '.coding-kit', 'manifest.json'), 'utf8')) as { version: string }
      assert.equal(mf.version, '3.1.0', 'upgrade 既有 manifest 语义不变')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('M19b: 备份与回滚 — 备份字节等于改前、恢复后等于原始、保留 5 代', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      const backupsRoot = path.join(dir, '.coding-kit', 'backups', 'refresh-ide-blocks')
      const blockLine = (n: number) => [PB, `- 第${n}轮 \`npx @cyning/harness verify\``, PE, ''].join('\n')
      // 首轮：M01_BODY → 备份须等于 M01_BODY
      const r1 = await runRefresh(['--yes', '--target', dir])
      assert.equal(r1.status, 0, r1.combined)
      let gens = readdirSync(backupsRoot)
      assert.equal(gens.length, 1, '须有一代备份')
      const backup1 = readFileSync(path.join(backupsRoot, gens[0] ?? '', 'AGENTS.md'), 'utf8')
      assert.equal(backup1, M01_BODY, '备份字节等于改前')
      // 回滚：备份 cp 回 → 字节等于原始
      await copyFile(path.join(backupsRoot, gens[0] ?? '', 'AGENTS.md'), path.join(dir, 'AGENTS.md'))
      assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), M01_BODY, '备份恢复后字节等于原始')
      // 5 代保留：再造 5 轮变更 → 总计 6 代 → 清理为 5
      for (let i = 0; i < 5; i++) {
        await writeRel(dir, 'AGENTS.md', blockLine(i))
        const r = await runRefresh(['--yes', '--target', dir])
        assert.equal(r.status, 0, r.combined)
      }
      gens = readdirSync(backupsRoot)
      assert.equal(gens.length, 5, `备份保留最近 5 代，实际 ${gens.length}`)
    })
  })
})

describe('DEF-029 无 marker 文件旧字面仅报告（plain_mentions · 只读扫描 · 绝不改写）', { concurrency: 1 }, () => {
  const PLAIN_BODY = '# 05-harness-starter\n\n- 运行 `npx @cyning/harness verify --target .`\n'

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('D29-1: 无 marker .mdc 含 npx @cyning/harness → plain_mentions 命中 A1、schema 仍 @1、文件字节不变、exit 0', async () => {
    await withTemp(async (dir) => {
      const rel = '.cursor/rules/05-harness-starter.mdc'
      await writeRel(dir, rel, PLAIN_BODY)
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      assert.equal(report.schema, 'dsh-coding-kit/refresh-ide-blocks-report@1', 'schema 保持 @1 向后兼容增量')
      const plains = report.plain_mentions as Array<{ path: string; rule: string; count: number }>
      assert.ok(Array.isArray(plains), `--json 须含 top-level plain_mentions: ${r.stdout}`)
      const hit = plains.find((m) => m.path === rel && m.rule === 'A1')
      assert.ok(hit, `plain_mentions 须命中 A1: ${JSON.stringify(plains)}`)
      assert.equal(hit.count, 1)
      assert.equal(await readFile(path.join(dir, rel), 'utf8'), PLAIN_BODY, '无 marker 文件绝不改写')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('D29-2: 人类报告含「无 marker 检出（仅报告，不刷写）」段；dry-run 与 --yes 均报告且零写入', async () => {
    await withTemp(async (dir) => {
      const rel = '.cursor/rules/05-harness-starter.mdc'
      await writeRel(dir, rel, PLAIN_BODY)
      const rd = await runRefresh(['--target', dir])
      assert.equal(rd.status, 0, rd.combined)
      assert.match(rd.combined, /无 marker 检出（仅报告，不刷写）/, rd.combined)
      assert.ok(rd.combined.includes(rel), rd.combined)
      const ry = await runRefresh(['--yes', '--target', dir])
      assert.equal(ry.status, 0, ry.combined)
      assert.match(ry.combined, /无 marker 检出（仅报告，不刷写）/, ry.combined)
      assert.equal(await readFile(path.join(dir, rel), 'utf8'), PLAIN_BODY, '--yes 下无 marker 文件仍零写入')
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'backups')), false, '仅报告不产生备份')
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('D29-3: A4 防二刷同适用 — 已迁移行 npx spec-wave skills check 不报；裸 harness skills build 报 A4', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', '# a\n\n- `npx spec-wave skills check`\n')
      await writeRel(dir, 'CLAUDE.md', '# c\n\n- `harness skills build`\n')
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const plains = report.plain_mentions as Array<{ path: string; rule: string; count: number }>
      assert.ok(Array.isArray(plains), r.stdout)
      assert.equal(
        plains.some((m) => m.path === 'AGENTS.md'),
        false,
        `已迁移行不得报 plain_mentions: ${JSON.stringify(plains)}`,
      )
      const a4 = plains.find((m) => m.path === 'CLAUDE.md' && m.rule === 'A4')
      assert.ok(a4, `裸 harness skills build 须报 A4: ${JSON.stringify(plains)}`)
      assert.equal(a4.count, 1)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('D29-4: 有 product 块文件不进 plain_mentions（块扫描口径不变）；B5 散文引用命中仅报告', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'AGENTS.md', M01_BODY)
      await writeRel(dir, 'CLAUDE.md', '# c\n\n散文引用 @cyning/harness 包名。\n')
      const r = await runRefresh(['--json', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const report = parseJson(r.stdout)
      const plains = report.plain_mentions as Array<{ path: string; rule: string; count: number }>
      assert.equal(
        plains.some((m) => m.path === 'AGENTS.md'),
        false,
        `有 product 块文件不进 plain_mentions: ${JSON.stringify(plains)}`,
      )
      const b5 = plains.find((m) => m.path === 'CLAUDE.md' && m.rule === 'B5')
      assert.ok(b5, `散文裸 @cyning/harness 须命中 B5: ${JSON.stringify(plains)}`)
      assert.equal(b5.count, 1)
    })
  })

  // 下沉（进程内直调 cmdRefreshIdeBlocks）
  it('D29-5: 仅报告不触发 preflight fail-fast — git 干净仓仅 plain 命中 --yes exit 0、零写入、零备份', async (t) => {
    if (!gitAvailable()) {
      t.skip('git 不可用（环境不具备 · 硬约束 10 · R-6）')
      return
    }
    await withTemp(async (dir) => {
      const rel = '.cursor/rules/05-harness-starter.mdc'
      await writeRel(dir, rel, PLAIN_BODY)
      await initGitRepo(dir)
      const r = await runRefresh(['--yes', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /无 marker 检出（仅报告，不刷写）/, r.combined)
      assert.equal(await readFile(path.join(dir, rel), 'utf8'), PLAIN_BODY, '零写入')
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'backups')), false, '零备份')
    })
  })
})
