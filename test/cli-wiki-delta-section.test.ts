import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { lintWikiDeltaMissing } from '../src/cli-task-extra.ts'
import { lintTaskFile } from '../src/cli-checks.ts'

// T1（task_wiki_delta_section_diagnostics · K1/K2）：
// K1 —— lintWikiDeltaMissing 区分「字段完全缺失」与「字段写错节名」（wiki_delta_wrong_section 替代 missing · 不双报）。
// K2 —— lintTaskFile 新增 E8：## Harness 元信息 节在但缺 wiki_delta 行 → error（仅查存在性 · 错节文案指向正确节名）。
// 红→绿钉死：实现前 wrong_section / E8 均不存在。

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-wds-'))
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

// ---- fixtures（JS 模板常量）----

// 错节：无权威节，wiki_delta 行写在 '## Harness' 节表格内（PR #72 事故形态 · L11 为字段行）
const WRONG_SECTION_MD = [
  '# Task wd_wrong',
  '',
  '> **状态**：`draft`',
  '',
  '## Harness',
  '',
  '| 字段 | 值 |',
  '|------|-----|',
  '| **task_slug** | `wd_wrong` |',
  '| **wiki_delta** | `none` |',
  '',
  '## 验收标准',
  '',
  '- [ ] fixture item',
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

// 错节大小写变体：'## harness 元信息'（权威节名大小写敏感 · 不兼容只诊断）
const CASE_VARIANT_MD = WRONG_SECTION_MD.replace('## Harness', '## harness 元信息').replaceAll(
  'wd_wrong',
  'wd_case',
)

// 完全缺失：权威节在但无任何 wiki_delta 行
const MISSING_MD = [
  '# Task wd_missing',
  '',
  '> **状态**：`draft`',
  '',
  '## Harness 元信息',
  '',
  '| 字段 | 值 |',
  '|------|-----|',
  '| **task_slug** | `wd_missing` |',
  '| **test_strategy** | `recommended` |',
  '',
  '## 验收标准',
  '',
  '- [ ] fixture item',
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

// 正常：权威节内含 wiki_delta 行
const OK_MD = MISSING_MD.replaceAll('wd_missing', 'wd_ok').replace(
  '| **test_strategy** | `recommended` |',
  '| **test_strategy** | `recommended` |\n| **wiki_delta** | `none` |',
)

// 错节（分裂形态）：权威节在但 wiki_delta 行写在后面 '## 附录' 节表格内
const SPLIT_WRONG_MD = MISSING_MD.replaceAll('wd_missing', 'wd_split').replace(
  '### 自检结论（执行者）',
  '## 附录\n\n| 字段 | 值 |\n|------|-----|\n| **wiki_delta** | `none` |\n\n### 自检结论（执行者）',
)

const HINT_RE = /须在 `## Harness 元信息` 表格内/

async function seed(dir: string, rel: string, body: string): Promise<string> {
  return writeRel(dir, path.join('docs/tasks/active', rel), body)
}

describe('T1-K1 · lint-wiki-delta 错节诊断码 wiki_delta_wrong_section', { concurrency: 1 }, () => {
  it('错节 fixture：wrong_section 替代 missing（不双报）· detail 含节名/行号/fix hint', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_wrong_v1.md', WRONG_SECTION_MD)
      const r = lintWikiDeltaMissing(dir)
      assert.equal(r.ok, false)
      assert.equal(r.missing.length, 1)
      assert.equal(r.issues.length, 1)
      assert.equal(r.issues[0].code, 'wiki_delta_wrong_section')
      assert.equal(
        r.issues.some((i) => i.code === 'wiki_delta_missing'),
        false,
        '错节场景不得双报 wiki_delta_missing',
      )
      assert.match(r.issues[0].detail, /Harness/)
      assert.match(r.issues[0].detail, /L11/)
      assert.match(r.issues[0].detail, HINT_RE)
    })
  })

  it('大小写变体（## harness 元信息）→ wrong_section', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_case_v1.md', CASE_VARIANT_MD)
      const r = lintWikiDeltaMissing(dir)
      assert.equal(r.ok, false)
      assert.equal(r.issues[0].code, 'wiki_delta_wrong_section')
      assert.match(r.issues[0].detail, /harness 元信息/)
      assert.match(r.issues[0].detail, HINT_RE)
    })
  })

  it('完全缺失 fixture：仍 wiki_delta_missing（现状不变）', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_missing_v1.md', MISSING_MD)
      const r = lintWikiDeltaMissing(dir)
      assert.equal(r.ok, false)
      assert.equal(r.issues.length, 1)
      assert.equal(r.issues[0].code, 'wiki_delta_missing')
      assert.equal(
        r.issues.some((i) => i.code === 'wiki_delta_wrong_section'),
        false,
      )
    })
  })

  it('正常 fixture：ok · 无 issues；--strict 亦 PASS', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_ok_v1.md', OK_MD)
      const def = lintWikiDeltaMissing(dir)
      assert.equal(def.ok, true)
      assert.equal(def.issues.length, 0)
      const strict = lintWikiDeltaMissing(dir, { strict: true })
      assert.equal(strict.ok, true)
      assert.equal(strict.issues.length, 0)
    })
  })

  it('--strict 错节：只报 wrong_section（无值可校 · 不触发 invalid/path_missing）', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_wrong_v1.md', WRONG_SECTION_MD)
      const r = lintWikiDeltaMissing(dir, { strict: true })
      assert.equal(r.ok, false)
      assert.equal(r.issues.length, 1)
      assert.equal(r.issues[0].code, 'wiki_delta_wrong_section')
    })
  })

  it('CLI 端到端：错节 exit=2 · 人读含 wrong_section 不含 missing；--json 同码同文案', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_wrong_v1.md', WRONG_SECTION_MD)
      const human = runCli(['task', 'lint-wiki-delta', '--target', dir])
      assert.equal(human.status, 2, human.combined)
      assert.match(human.combined, /wiki_delta_wrong_section/)
      assert.doesNotMatch(human.combined, /wiki_delta_missing/)
      assert.match(human.combined, /LINT-WIKI-DELTA: FAIL/)

      const json = runCli(['task', 'lint-wiki-delta', '--target', dir, '--json'])
      assert.equal(json.status, 2, json.combined)
      const parsed = JSON.parse(json.stdout)
      assert.equal(parsed.ok, false)
      assert.equal(parsed.issues[0].code, 'wiki_delta_wrong_section')
      assert.match(parsed.issues[0].detail, HINT_RE)
    })
  })

  it('exit 码族不变：正常 exit=0 · 缺口 exit=2 · 坏 scope exit=1', async () => {
    await withTemp(async (dir) => {
      await seed(dir, 'task_wd_ok_v1.md', OK_MD)
      assert.equal(runCli(['task', 'lint-wiki-delta', '--target', dir]).status, 0)
      assert.equal(
        runCli(['task', 'lint-wiki-delta', '--target', dir, '--scope', 'bogus']).status,
        1,
      )
    })
  })
})

describe('T1-K2 · task lint E8（wiki_delta 存在性 · 与 close_wiki_delta 对齐）', { concurrency: 1 }, () => {
  it('权威节在但缺 wiki_delta 行 → E8 error（仅查存在性 · 无 draft 豁免）', async () => {
    await withTemp(async (dir) => {
      const abs = await seed(dir, 'task_wd_missing_v1.md', MISSING_MD)
      const r = lintTaskFile(abs, dir)
      const e8 = r.errors.filter((e) => e.rule === 'E8')
      assert.equal(e8.length, 1, JSON.stringify(r.errors))
      assert.match(e8[0].message, /wiki_delta/)
      assert.equal(r.ok, false)
    })
  })

  it('补齐 wiki_delta 行后 E8 消失（lint 全量 PASS）', async () => {
    await withTemp(async (dir) => {
      const abs = await seed(dir, 'task_wd_ok_v1.md', OK_MD)
      const r = lintTaskFile(abs, dir)
      assert.equal(
        r.errors.some((e) => e.rule === 'E8'),
        false,
      )
      assert.equal(r.ok, true, JSON.stringify(r.errors))
    })
  })

  it('错节场景 E8 文案指向正确节名（含节名/行号）', async () => {
    await withTemp(async (dir) => {
      const abs = await seed(dir, 'task_wd_split_v1.md', SPLIT_WRONG_MD)
      const r = lintTaskFile(abs, dir)
      const e8 = r.errors.filter((e) => e.rule === 'E8')
      assert.equal(e8.length, 1, JSON.stringify(r.errors))
      assert.match(e8[0].message, /## Harness 元信息/)
      assert.match(e8[0].message, /附录/)
      assert.equal(typeof e8[0].line, 'number')
    })
  })

  it('CLI 端到端：task lint --file 缺失 fixture exit≠0 且输出 E8', async () => {
    await withTemp(async (dir) => {
      const abs = await seed(dir, 'task_wd_missing_v1.md', MISSING_MD)
      const r = runCli(['task', 'lint', '--file', abs])
      assert.notEqual(r.status, 0, r.combined)
      assert.match(r.combined, /E8/)
      assert.match(r.combined, /LINT: FAIL/)
    })
  })
})
