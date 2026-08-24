import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')
const SKILLS_SRC = path.join(KIT, 'assets', 'skills')
const S2_FILES = [
  ['docs/tasks/keep.md', 'S2-TASK-BODY-install\n'],
  ['reviews/keep.md', 'S2-REVIEW-BODY-install\n'],
  ['invokes/by-task/keep.md', 'S2-INVOKE-BODY-install\n'],
] as const
const DEFAULT_SKILL_DIRS = [
  'harness-10-spec',
  'harness-10-task',
  'harness-20-spec-audit',
  'harness-20-task-audit',
] as const
const EXECUTE_DIRS = ['harness-30-execute', 'harness-40-self-check'] as const

type RunResult = {
  status: number | null
  stdout: string
  stderr: string
  combined: string
}

function runCli(
  args: string[],
  opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): RunResult {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', CLI_TS, ...args], {
    encoding: 'utf8',
    cwd: opts.cwd ?? KIT,
    env: { ...process.env, ...opts.env },
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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-install-'))
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

function sha256(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex')
}

function hashTree(dir: string): string {
  const files: string[] = []
  const walk = (cur: string, rel: string): void => {
    if (!existsSync(cur)) return
    for (const name of readdirSync(cur).sort()) {
      const abs = path.join(cur, name)
      const r = rel ? `${rel}/${name}` : name
      if (statSync(abs).isDirectory()) walk(abs, r)
      else files.push(`${r}\0${sha256(readFileSync(abs, 'utf8'))}`)
    }
  }
  walk(dir, '')
  return sha256(files.join('\n'))
}

function executeHatSkillMd(dirName: string): string {
  const hatId = dirName === 'harness-30-execute' ? '30' : '40'
  return [
    '---',
    `name: ${dirName}`,
    'description: fixture execute hat for I9/I12',
    'metadata:',
    `  hat_id: ${hatId}`,
    '  track: starter-experimental',
    '---',
    '',
    'fixture execute hat',
    '',
  ].join('\n')
}

async function seedExecuteHatsInSrc(): Promise<() => Promise<void>> {
  const written: string[] = []
  for (const name of EXECUTE_DIRS) {
    const dir = path.join(SKILLS_SRC, name)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'SKILL.md'), executeHatSkillMd(name), 'utf8')
    written.push(dir)
  }
  return async () => {
    for (const dir of written) await rm(dir, { recursive: true, force: true })
  }
}

describe('1.2.1 skills install I1–I12', { concurrency: 1 }, () => {
  it('I1: install --target 写入 <target>/.dsh/skills；包内 assets/skills 哈希不变；S2 不变', async () => {
    await withTemp(async (dir) => {
      const hashes: Record<string, string> = {}
      for (const [rel, body] of S2_FILES) {
        await writeRel(dir, rel, body)
        hashes[rel] = sha256(body)
      }
      const srcHash = hashTree(SKILLS_SRC)
      const r = runCli(['skills', 'install', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /SKILLS INSTALL: PASS/)
      assert.match(r.combined, /copied=\d+/)
      assert.match(r.combined, /skipped=\d+/)
      const dest = path.join(dir, '.dsh', 'skills')
      assert.match(r.combined, new RegExp(dest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      assert.equal(existsSync(path.join(dest, 'harness-10-spec', 'SKILL.md')), true)
      for (const name of DEFAULT_SKILL_DIRS) {
        assert.equal(existsSync(path.join(dest, name)), true, `missing skill dir: ${name}`)
      }
      assert.equal(hashTree(SKILLS_SRC), srcHash)
      for (const [rel, body] of S2_FILES) {
        assert.equal(await readFile(path.join(dir, rel), 'utf8'), body)
        assert.equal(sha256(await readFile(path.join(dir, rel), 'utf8')), hashes[rel])
      }
    })
  })

  it('I2: no-clobber skip 已有文件；--force 覆盖', async () => {
    await withTemp(async (dir) => {
      const rel = '.dsh/skills/harness-10-spec/SKILL.md'
      await writeRel(dir, rel, 'USER-OWNED\n')
      const noForce = runCli(['skills', 'install', '--target', dir])
      assert.equal(noForce.status, 0, noForce.combined)
      assert.match(noForce.combined, /skipped=[1-9]/)
      assert.equal(await readFile(path.join(dir, rel), 'utf8'), 'USER-OWNED\n')
      const forced = runCli(['skills', 'install', '--target', dir, '--force'])
      assert.equal(forced.status, 0, forced.combined)
      const now = await readFile(path.join(dir, rel), 'utf8')
      assert.notEqual(now, 'USER-OWNED\n')
      assert.match(now, /name:\s*harness-10-spec/)
    })
  })

  it('I3: dest 旁路用户文件在无 --force 时不被整树删除', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, '.dsh/skills/user-keep.txt', 'KEEP-ME\n')
      const r = runCli(['skills', 'install', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.equal(await readFile(path.join(dir, '.dsh', 'skills', 'user-keep.txt'), 'utf8'), 'KEEP-ME\n')
    })
  })

  it('I4: --global + 注入 HOME 写入 $HOME/.dsh/skills（绝对路径，无字面 ~）', async () => {
    await withTemp(async (home) => {
      await withTemp(async (cwd) => {
        const r = runCli(['skills', 'install', '--global'], { cwd, env: { HOME: home } })
        assert.equal(r.status, 0, r.combined)
        const dest = path.join(home, '.dsh', 'skills')
        assert.equal(existsSync(path.join(dest, 'harness-10-spec', 'SKILL.md')), true)
        assert.equal(path.isAbsolute(dest), true)
        assert.equal(dest.includes('~'), false)
        assert.match(r.combined, new RegExp(dest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        assert.equal(r.combined.includes('~'), false)
      })
    })
  })

  it('I5: --global 与 --out / --target 互斥 exit 1', async () => {
    await withTemp(async (home) => {
      await withTemp(async (dir) => {
        const withOut = runCli(['skills', 'install', '--global', '--out', path.join(dir, 'out')], {
          cwd: dir,
          env: { HOME: home },
        })
        assert.equal(withOut.status, 1, withOut.combined)
        const withTarget = runCli(['skills', 'install', '--global', '--target', dir], {
          cwd: dir,
          env: { HOME: home },
        })
        assert.equal(withTarget.status, 1, withTarget.combined)
        assert.equal(existsSync(path.join(home, '.dsh', 'skills')), false)
      })
    })
  })

  it('I5b: --out 与 --target 同时出现 → exit 1', async () => {
    await withTemp(async (dir) => {
      const r = runCli([
        'skills',
        'install',
        '--target',
        dir,
        '--out',
        path.join(dir, 'custom-skills'),
      ])
      assert.equal(r.status, 1, r.combined)
      assert.equal(existsSync(path.join(dir, '.dsh', 'skills')), false)
      assert.equal(existsSync(path.join(dir, 'custom-skills')), false)
    })
  })

  it('I6: dest 指向 .dsh/coding-kit 或 .coding-kit → 非 0，不写入', async () => {
    await withTemp(async (dir) => {
      for (const rel of ['.dsh/coding-kit', '.coding-kit'] as const) {
        const dest = path.join(dir, rel)
        const r = runCli(['skills', 'install', '--out', dest], { cwd: dir })
        assert.notEqual(r.status, 0, r.combined)
        assert.equal(existsSync(path.join(dest, 'harness-10-spec')), false)
      }
    })
  })

  it('I7: dest 指向 S2 三域 → 非 0，不写入', async () => {
    await withTemp(async (dir) => {
      for (const rel of ['docs/tasks', 'reviews', 'invokes/by-task'] as const) {
        const dest = path.join(dir, rel)
        await mkdir(dest, { recursive: true })
        const marker = path.join(dest, 'keep.md')
        await writeFile(marker, 'S2-KEEP\n', 'utf8')
        const r = runCli(['skills', 'install', '--out', dest], { cwd: dir })
        assert.notEqual(r.status, 0, r.combined)
        assert.equal(await readFile(marker, 'utf8'), 'S2-KEEP\n')
        assert.equal(existsSync(path.join(dest, 'harness-10-spec')), false)
      }
    })
  })

  it('I8: 源 assets/skills 缺失 → 非 0 + 可读原因', async () => {
    await withTemp(async (dir) => {
      const bak = `${SKILLS_SRC}.__i8_bak__`
      await rename(SKILLS_SRC, bak)
      try {
        const r = runCli(['skills', 'install', '--target', dir])
        assert.notEqual(r.status, 0, r.combined)
        assert.match(r.combined, /源|assets\/skills|缺失|不存在/)
        assert.equal(existsSync(path.join(dir, '.dsh', 'skills', 'harness-10-spec')), false)
      } finally {
        await rename(bak, SKILLS_SRC)
      }
    })
  })

  it('I9: 默认 dest 不出现 harness-30-execute / harness-40-self-check（即使源里有）', async () => {
    const cleanup = await seedExecuteHatsInSrc()
    try {
      await withTemp(async (dir) => {
        const r = runCli(['skills', 'install', '--target', dir])
        assert.equal(r.status, 0, r.combined)
        const dest = path.join(dir, '.dsh', 'skills')
        for (const name of EXECUTE_DIRS) {
          assert.equal(existsSync(path.join(dest, name)), false, `execute hat leaked: ${name}`)
        }
      })
    } finally {
      await cleanup()
    }
  })

  it('I10: --out 以 ~ 开头 → exit 1；cwd 下无名为 ~ 的目录', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['skills', 'install', '--out', '~/.something'], { cwd: dir })
      assert.equal(r.status, 1, r.combined)
      assert.equal(existsSync(path.join(dir, '~')), false)
      const names = existsSync(dir) ? readdirSync(dir) : []
      assert.equal(names.some((n) => n.startsWith('~')), false)
    })
  })

  it('I11: skills --help / 根 --help 列出 skills install，与 build/check 分列', () => {
    const skillsHelp = runCli(['skills', '--help'])
    assert.equal(skillsHelp.status, 0, skillsHelp.combined)
    assert.match(skillsHelp.combined, /skills install/)
    assert.match(skillsHelp.combined, /skills build/)
    assert.match(skillsHelp.combined, /skills check/)
    assert.equal(/未交付/.test(skillsHelp.combined), false)
    assert.equal(/build\s*\|\s*check\s*\|\s*install/.test(skillsHelp.combined), false)
    // DEF-010: skills --help 必须输出子命令 usage——根 usage 独有串否定断言（任一改动退回根 usage 即红）
    assert.equal(/gate-check/.test(skillsHelp.combined), false, 'skills --help 输出了根 usage（含 gate-check）')
    assert.equal(/lifecycle dry-run/.test(skillsHelp.combined), false, 'skills --help 输出了根 usage（含 lifecycle dry-run）')
    assert.equal(/dsh-coding-kit CLI \(v/.test(skillsHelp.combined), false, 'skills --help 输出了根 usage 头')
    const rootHelp = runCli(['--help'])
    assert.equal(rootHelp.status, 0, rootHelp.combined)
    assert.match(rootHelp.combined, /skills install/)
    assert.match(rootHelp.combined, /skills build/)
    assert.match(rootHelp.combined, /skills check/)
    assert.match(rootHelp.combined, /gate-check/)
    assert.equal(/未交付/.test(rootHelp.combined), false)
    assert.equal(/build\s*\|\s*check\s*\|\s*install/.test(rootHelp.combined), false)
  })

  it('I12: 自备 30/40 源树；--with-execute-hats 出现对应目录，无旗标则跳过', async () => {
    const cleanup = await seedExecuteHatsInSrc()
    try {
      await withTemp(async (dir) => {
        const skipped = runCli(['skills', 'install', '--target', dir])
        assert.equal(skipped.status, 0, skipped.combined)
        for (const name of EXECUTE_DIRS) {
          assert.equal(existsSync(path.join(dir, '.dsh', 'skills', name)), false)
        }
        const included = runCli(['skills', 'install', '--target', dir, '--with-execute-hats'])
        assert.equal(included.status, 0, included.combined)
        for (const name of EXECUTE_DIRS) {
          assert.equal(
            existsSync(path.join(dir, '.dsh', 'skills', name, 'SKILL.md')),
            true,
            `missing execute hat after flag: ${name}`,
          )
        }
      })
    } finally {
      await cleanup()
    }
  })

  it('I-BUILD: skills build 默认 dest 仍为产品包 assets/skills；不得 rm 消费者 .dsh/skills', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, '.dsh/skills/user-keep.txt', 'KEEP-BUILD\n')
      const built = runCli(['skills', 'build'])
      assert.equal(built.status, 0, built.combined)
      assert.match(built.combined, /SKILLS BUILD: PASS/)
      assert.match(built.combined, /assets\/skills/)
      assert.equal(existsSync(path.join(SKILLS_SRC, 'README.md')), true)
      assert.equal(built.combined.includes(path.join(dir, '.dsh', 'skills')), false)
      assert.equal(
        await readFile(path.join(dir, '.dsh', 'skills', 'user-keep.txt'), 'utf8'),
        'KEEP-BUILD\n',
      )
    })
  })

  it('dest 已存在且为文件 → 非 0', async () => {
    await withTemp(async (dir) => {
      const dest = path.join(dir, 'skills-as-file')
      await writeFile(dest, 'not-a-dir\n', 'utf8')
      const r = runCli(['skills', 'install', '--out', dest], { cwd: dir })
      assert.notEqual(r.status, 0, r.combined)
      assert.equal(await readFile(dest, 'utf8'), 'not-a-dir\n')
      assert.equal(statSync(dest).isFile(), true)
    })
  })

  it('未知子命令 / 未知旗标 → exit 1 + usage 含 install', () => {
    const unknownSub = runCli(['skills', 'explode'])
    assert.equal(unknownSub.status, 1, unknownSub.combined)
    assert.match(unknownSub.combined, /未知/)
    assert.match(unknownSub.combined, /install/)
    const unknownFlag = runCli(['skills', 'install', '--bogus'])
    assert.equal(unknownFlag.status, 1, unknownFlag.combined)
    assert.match(unknownFlag.combined, /未知/)
    assert.match(unknownFlag.combined, /install/)
  })
})
