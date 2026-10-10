import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { Readable, PassThrough } from 'node:stream'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { copyDirNoClobber } from '../src/index.ts'
import {
  INIT_QUICKSTART,
  isInteractiveInit,
  parseInitToolsArg,
  promptInitTools,
} from '../src/cli.ts'
import { listKnownHostIds, parseHostToolsSticky } from '../src/cli-host.ts'
import { CliError } from '../src/cli-shared.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')
const STICKY_REL = path.join('.coding-kit', 'host-tools.json')

async function writeRel(root: string, rel: string, body: string): Promise<void> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, body, 'utf8')
}

type RunResult = {
  status: number | null
  stdout: string
  stderr: string
  combined: string
}

function runCli(args: string[], opts: { cwd?: string } = {}): RunResult {
  const env = { ...process.env }
  delete env.DSH_CK_DSH_TOOLS_VERSION
  const result = spawnSync(process.execPath, ['--experimental-strip-types', CLI_TS, ...args], {
    encoding: 'utf8',
    cwd: opts.cwd ?? KIT,
    env,
  })
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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-init-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('T5 init / copyDirNoClobber', { concurrency: 1 }, () => {
  it('T5: 已存在 skip、S2 路径 skip、新文件 copied', async () => {
    const src = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-src-'))
    const dest = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-dest-'))
    try {
      await writeRel(src, 'hello.md', 'new-hello')
      await writeRel(src, 'standards/ok.md', 'copied-ok')
      await writeRel(src, 'docs/tasks/foo.md', 's2-tasks')
      await writeRel(src, 'reviews/r.md', 's2-reviews')
      await writeRel(src, 'invokes/by-task/x.md', 's2-invokes')
      await writeRel(dest, 'hello.md', 'keep-hello')

      const result = await copyDirNoClobber(src, dest)

      assert.ok(result.copied.includes('standards/ok.md'))
      assert.equal(result.copied.includes('hello.md'), false)
      assert.ok(result.skipped.includes('hello.md'))
      assert.ok(result.skipped.includes('docs/tasks'))
      assert.ok(result.skipped.includes('reviews'))
      assert.ok(result.skipped.includes('invokes/by-task'))

      assert.equal(await readFile(path.join(dest, 'hello.md'), 'utf8'), 'keep-hello')
      assert.equal(await readFile(path.join(dest, 'standards', 'ok.md'), 'utf8'), 'copied-ok')
      assert.equal(existsSync(path.join(dest, 'docs', 'tasks', 'foo.md')), false)
      assert.equal(existsSync(path.join(dest, 'reviews', 'r.md')), false)
      assert.equal(existsSync(path.join(dest, 'invokes', 'by-task', 'x.md')), false)
    } finally {
      await rm(src, { recursive: true, force: true })
      await rm(dest, { recursive: true, force: true })
    }
  })
})

describe('2.1.1 W3 init --tools / TTY / host-adapt', { concurrency: 1 }, () => {
  it('非 TTY + 无 --tools → exit 1', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'harness-only', '--target', dir])
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /--tools/)
      assert.match(r.combined, /OpenSpec|非交互/)
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'manifest.json')), false)
    })
  })

  it('2.4.2 B-INIT-YES：--yes 无 --tools → exit 1（快速失败，不挂起）', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'harness-only', '--yes', '--target', dir])
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /--tools/)
      assert.match(r.combined, /OpenSpec|非交互/)
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'manifest.json')), false)
    })
  })

  it('--tools none：写过程根、不物化、不写粘性', async () => {
    await withTemp(async (dir) => {
      const r = runCli([
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
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'manifest.json')), true)
      assert.equal(existsSync(path.join(dir, STICKY_REL)), false)
      assert.equal(existsSync(path.join(dir, '.cursor', 'rules', '05-kit-starter.mdc')), false)
      assert.match(r.combined, /跳过 host 物化/)
    })
  })

  it('tools≠none 联动 apply + 写粘性', async () => {
    await withTemp(async (dir) => {
      const r = runCli([
        'init',
        '--tools',
        'cursor',
        '--profile',
        'core',
        '--yes',
        '--target',
        dir,
      ])
      assert.equal(r.status, 0, r.combined)
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'manifest.json')), true)
      assert.equal(existsSync(path.join(dir, STICKY_REL)), true)
      assert.equal(existsSync(path.join(dir, '.cursor', 'rules', '05-kit-starter.mdc')), true)
      const sticky = parseHostToolsSticky(await readFile(path.join(dir, STICKY_REL), 'utf8'))
      assert.deepEqual(sticky.host_ids, ['cursor'])
      assert.equal(sticky.profile, 'core')
    })
  })

  it('--no-host-adapt：过程根照常、不 apply、不写粘性', async () => {
    await withTemp(async (dir) => {
      const r = runCli([
        'init',
        '--tools',
        'cursor,claude',
        '--no-host-adapt',
        '--yes',
        '--target',
        dir,
      ])
      assert.equal(r.status, 0, r.combined)
      assert.equal(existsSync(path.join(dir, '.coding-kit', 'manifest.json')), true)
      assert.equal(existsSync(path.join(dir, STICKY_REL)), false)
      assert.equal(existsSync(path.join(dir, '.cursor', 'rules', '05-kit-starter.mdc')), false)
      assert.match(r.combined, /--no-host-adapt/)
    })
  })

  it('parseInitToolsArg：all / none / LIST', () => {
    const known = listKnownHostIds()
    assert.equal(parseInitToolsArg('none', known).mode, 'none')
    const all = parseInitToolsArg('all', known)
    assert.equal(all.mode, 'hosts')
    if (all.mode === 'hosts') {
      assert.deepEqual(all.ids, known)
      assert.equal(all.toolsArg, 'all')
    }
    const list = parseInitToolsArg('cursor,claude', known)
    assert.equal(list.mode, 'hosts')
    if (list.mode === 'hosts') assert.deepEqual(list.ids, ['cursor', 'claude'])
    assert.throws(() => parseInitToolsArg('none,cursor', known), CliError)
    assert.throws(() => parseInitToolsArg('bogus-host', known), CliError)
  })

  it('isInteractiveInit：非 TTY 为 false；--yes 即使 isTTY 亦非交互', () => {
    assert.equal(isInteractiveInit({ isTTY: false }), false)
    assert.equal(isInteractiveInit({ isTTY: true }), true)
    assert.equal(isInteractiveInit({ isTTY: true }, { yes: false }), true)
    assert.equal(isInteractiveInit({ isTTY: true }, { yes: true }), false)
    assert.equal(isInteractiveInit({ isTTY: false }, { yes: true }), false)
  })

  it('2.2 W4 D1：--tools none --yes 输出含 quickstart 关键行（含 graph scaffold）', async () => {
    await withTemp(async (dir) => {
      const r = runCli([
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
      assert.match(r.combined, /Next steps.*quickstart/)
      assert.match(r.combined, /npx spec-wave sync prompts --yes/)
      assert.match(r.combined, /docs\/harness\/templates\/TASK_TEMPLATE\.md/)
      assert.match(r.combined, /docs\/tasks\/active\//)
      assert.match(r.combined, /npx spec-wave verify --task/)
      assert.match(r.combined, /npx spec-wave graph scaffold/)
      assert.match(r.combined, /reviewable draft/i)
    })
  })

  it('2.2 W4 D1：dry-run（非 --yes）路径同样打印 quickstart（含 graph scaffold）', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['init', '--preset', 'harness-only', '--tools', 'none', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /init 完成。/)
      assert.match(r.combined, /Next steps.*quickstart/)
      assert.match(r.combined, /npx spec-wave sync prompts --yes/)
      assert.match(r.combined, /npx spec-wave verify --task/)
      assert.match(r.combined, /npx spec-wave graph scaffold/)
      assert.match(r.combined, /reviewable draft/i)
    })
  })

  it('2.3-W3 ③ + 3.1 W2：quickstart 含 git 前提 · 1–3 步保持 · 第 4 步 graph scaffold', () => {
    assert.match(INIT_QUICKSTART, /git init/, 'quickstart 须含 git init 前提提示')
    assert.match(INIT_QUICKSTART, /git repository/, '须明示 git 仓前提')
    // 1/2/3 步关键行保持；第 4 步为图谱下一步（可审草稿口径）
    assert.match(INIT_QUICKSTART, /1\. npx spec-wave sync prompts --yes/)
    assert.match(INIT_QUICKSTART, /2\. Create your first task/)
    assert.match(INIT_QUICKSTART, /3\. npx spec-wave verify --task/)
    assert.match(INIT_QUICKSTART, /4\..*npx spec-wave graph scaffold/)
    assert.match(INIT_QUICKSTART, /reviewable draft/i)
    assert.match(INIT_QUICKSTART, /Not signed architecture truth/)
    // 须含禁称纪律句；不得出现「已是权威真值」式肯定宣称
    assert.match(INIT_QUICKSTART, /do not treat as an authoritative auto graph/i)
    assert.doesNotMatch(INIT_QUICKSTART, /is signed architecture truth/i)

    // F-W4-01：命令集合含 graph scaffold（须与 usage 字面一致）
    const mentioned = [...INIT_QUICKSTART.matchAll(/npx spec-wave ([a-z][a-z-]*(?: [a-z][a-z-]*)?)/g)].map(
      (m) => m[1],
    )
    assert.deepEqual([...new Set(mentioned)].sort(), ['graph scaffold', 'sync prompts', 'verify'])
  })

  it('2.2 W4 D1：quickstart 提到的命令在 CLI usage 中真实存在（F-W4-01）', () => {
    const r = runCli(['--help'])
    assert.equal(r.status, 0, r.combined)
    const mentioned = [...INIT_QUICKSTART.matchAll(/npx spec-wave ([a-z][a-z-]*(?: [a-z][a-z-]*)?)/g)].map(
      (m) => m[1],
    )
    assert.ok(mentioned.length >= 2, 'quickstart 至少提到 2 条 CLI 命令')
    for (const cmd of mentioned) {
      assert.ok(r.combined.includes(cmd), `usage 缺 quickstart 提到的命令: ${cmd}`)
    }
  })

  it('promptInitTools：mock stdin 选 all / none / 列表', async () => {
    const known = listKnownHostIds()

    const outAll = new PassThrough()
    const selAll = await promptInitTools(known, {
      input: Readable.from(['all\n']),
      output: outAll,
    })
    assert.equal(selAll.mode, 'hosts')
    if (selAll.mode === 'hosts') assert.deepEqual(selAll.ids, known)

    const outNone = new PassThrough()
    const selNone = await promptInitTools(known, {
      input: Readable.from(['none\n']),
      output: outNone,
    })
    assert.equal(selNone.mode, 'none')

    const outList = new PassThrough()
    const selList = await promptInitTools(known, {
      input: Readable.from(['cursor,agents\n']),
      output: outList,
    })
    assert.equal(selList.mode, 'hosts')
    if (selList.mode === 'hosts') assert.deepEqual(selList.ids, ['cursor', 'agents'])
  })
})
