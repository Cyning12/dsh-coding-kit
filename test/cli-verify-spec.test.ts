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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-vspec-'))
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

function specMd(slug: string, extraMeta = ''): string {
  return [
    `# SPEC ${slug}`,
    '',
    '> **track**：`feature`',
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **spec_slug** | \`${slug}\` |`,
    extraMeta,
    '',
    '## 范围',
    '',
    '- fixture',
    '',
  ].join('\n')
}

const SPEC_REL = 'docs/spec/SPEC-foo_v1.md'

async function seedSpec(dir: string, rel = SPEC_REL, slug = 'foo', extraMeta = ''): Promise<void> {
  await writeRel(dir, rel, specMd(slug, extraMeta))
}

// verify --spec 真闸交付（PRD_DEF-003 后续棒 · 旧包 @cyning/harness@2.24.0 lib/verify.js
// verifySpecTarget + lib/task-meta.js findSpecReview/shouldSkipSpecAudit 语义映射）。
// 红→绿钉死：交付前 --spec 走 notDelivered（exit 1「本包未交付」）；dry-run to_00
// spec_reviews_retention 恒 unevaluated「未接线」。
describe('verify --spec · SPEC 审查文存在性真闸（spec_reviews_retention 接线）', { concurrency: 1 }, () => {
  it('缺 spec R<n> 审查文 → VERIFY: BLOCKED · missing spec R<n> review · exit 2', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /VERIFY: BLOCKED · missing spec R<n> review/)
      assert.match(r.combined, /SPEC-foo_v1\.md/)
    })
  })

  it('补 docs/harness/reviews/spec_<slug>_audit_R1_*（推荐命名）→ VERIFY: PASS · exit 0', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      await writeRel(dir, 'docs/harness/reviews/spec_foo_audit_R1_2026-08-25.md', '# R1 fixture')
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS · SPEC-foo_v1\.md/)
    })
  })

  it('reviews/ 备选目录同样认可（与 findReview 双路径口径一致）', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      await writeRel(dir, 'reviews/spec_foo_audit_R2_x.md', '# R2 fixture')
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('旧包兼容命名：spec_<slug>_ACCEPT_R<n>_* 与 task_<slug>_spec_ACCEPT_R<n>_* 均认（旧包 findSpecReview 三模式）', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      await writeRel(dir, 'docs/harness/reviews/spec_foo_ACCEPT_R1_x.md', '# ACCEPT fixture')
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
    })
    await withTemp(async (dir) => {
      await seedSpec(dir)
      await writeRel(dir, 'docs/harness/reviews/task_foo_spec_ACCEPT_R1_x.md', '# ACCEPT fixture')
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
    })
  })

  it('slug 推导：文件名 SPEC-bar_v2.md（无元信息表）→ 匹配 spec_bar_audit_R1_*（去 SPEC- 前缀与 _v<n> 后缀）', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'docs/spec/SPEC-bar_v2.md', '# SPEC bar\n\n## 范围\n\n- fixture\n')
      await writeRel(dir, 'docs/harness/reviews/spec_bar_audit_R1_x.md', '# R1 fixture')
      const r = runCli(['verify', '--spec', 'docs/spec/SPEC-bar_v2.md', '--target', dir])
      assert.equal(r.status, 0, r.combined)
    })
  })

  it('--allow-no-spec-review 真豁免：exit 0 · VERIFY: PASS · 文本留痕', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--allow-no-spec-review'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
      assert.match(r.combined, /--allow-no-spec-review/)
      assert.match(r.combined, /豁免/)
    })
  })

  it('--allow-no-review 在 --spec 模式作豁免别名（与 T4 口径一致）：exit 0 · 留痕', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--allow-no-review'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /VERIFY: PASS/)
      assert.match(r.combined, /--allow-no-review/)
    })
  })

  it('--json 缺审查文 → exit 2 · blocked=true · verdict=BLOCKED；--allow-no-spec-review → waived[] 留痕', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const blocked = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--json'])
      assert.equal(blocked.status, 2, blocked.combined)
      const b = JSON.parse(blocked.stdout) as Record<string, unknown>
      assert.equal(b.command, 'verify')
      assert.equal(b.spec, SPEC_REL)
      assert.equal(b.blocked, true)
      assert.equal(b.verdict, 'BLOCKED')
      const waived = runCli(['verify', '--spec', SPEC_REL, '--target', dir, '--json', '--allow-no-spec-review'])
      assert.equal(waived.status, 0, waived.combined)
      const w = JSON.parse(waived.stdout) as Record<string, unknown>
      assert.equal(w.blocked, false)
      assert.equal(w.verdict, 'PASS')
      const list = w.waived as string[]
      assert.ok(Array.isArray(list), `waived 须为数组: ${waived.stdout}`)
      assert.ok(list.some((x) => x.includes('missing spec R<n> review')), `waived 须留痕缺审查文: ${waived.stdout}`)
    })
  })

  it('skip_spec_audit 元信息豁免 → INFO + PASS exit 0（无需审查文）', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir, SPEC_REL, 'foo', '| **skip_spec_audit** | `true` |')
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /skip SPEC review gate（bugfix \/ skip_spec_audit）/)
      assert.match(r.combined, /VERIFY: PASS/)
    })
  })

  it('track=bugfix 元信息豁免 → PASS exit 0；正文说明文字不得豁免（旧包 shouldSkipSpecAudit 口径）', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir, 'docs/spec/SPEC-bug_v1.md', 'bug', '| **track** | `bugfix` |')
      const r = runCli(['verify', '--spec', 'docs/spec/SPEC-bug_v1.md', '--target', dir])
      assert.equal(r.status, 0, r.combined)
    })
    await withTemp(async (dir) => {
      // 正文出现 track: bugfix 说明文字但无元信息/文首 track 行 → 不豁免
      await writeRel(dir, 'docs/spec/SPEC-txt_v1.md', '# SPEC txt\n\n豁免写法：track: bugfix 即可跳过。\n')
      const r = runCli(['verify', '--spec', 'docs/spec/SPEC-txt_v1.md', '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /missing spec R<n> review/)
    })
  })

  it('--task 与 --spec 互斥 → exit 1（旧包语义）', async () => {
    const r = runCli(['verify', '--task', 'whatever.md', '--spec', 'foo.md'])
    assert.equal(r.status, 1, r.combined)
    assert.match(r.combined, /--task 与 --spec 互斥/)
  })

  it('--spec 文件不存在 → exit 1（用法错误 · 旧包语义）', async () => {
    await withTemp(async (dir) => {
      const r = runCli(['verify', '--spec', 'docs/spec/SPEC-none_v1.md', '--target', dir])
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /未找到 --spec 文件/)
    })
  })

  it('不再 fail-loud：--spec 路径不得出现「本包未交付」文案', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const r = runCli(['verify', '--spec', SPEC_REL, '--target', dir])
      assert.equal(/未交付|不支持/.test(r.combined), false, `仍走 notDelivered: ${r.combined}`)
    })
  })

  it('回归：不带 --task/--spec 的 verify → exit 1 提示须指定（行为不回退）', () => {
    const r = runCli(['verify'])
    assert.equal(r.status, 1, r.combined)
    assert.match(r.combined, /须指定 --task FILE 或 --spec FILE/)
  })

  it('lifecycle dry-run to_00：spec_reviews_retention 真求值（--task 携带 SPEC 路径）· 缺审查文 fail 挡 · --allow-no-spec-review 转 warn 留痕', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir)
      const blocked = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_00', '--from', 'draft',
        '--task', SPEC_REL, '--target', dir,
      ])
      assert.equal(blocked.status, 2, blocked.combined)
      assert.match(blocked.combined, /spec_reviews_retention: fail · missing spec R<n> review/)
      assert.match(blocked.combined, /blocked: true/)
      const waived = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_00', '--from', 'draft',
        '--task', SPEC_REL, '--target', dir, '--allow-no-spec-review',
      ])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /spec_reviews_retention: warn/)
      assert.match(waived.combined, /--allow-no-spec-review 豁免/)
      await writeRel(dir, 'docs/harness/reviews/spec_foo_audit_R1_x.md', '# R1 fixture')
      const pass = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_00', '--from', 'draft',
        '--task', SPEC_REL, '--target', dir,
      ])
      assert.equal(pass.status, 0, pass.combined)
      assert.match(pass.combined, /spec_reviews_retention: pass/)
    })
  })

  it('lifecycle dry-run to_00：skip_spec_audit SPEC → 守卫 pass（元信息豁免）', async () => {
    await withTemp(async (dir) => {
      await seedSpec(dir, SPEC_REL, 'foo', '| **skip_spec_audit** | `true` |')
      const r = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_00', '--from', 'draft',
        '--task', SPEC_REL, '--target', dir,
      ])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /spec_reviews_retention: pass · skip SPEC review gate/)
    })
  })
})
