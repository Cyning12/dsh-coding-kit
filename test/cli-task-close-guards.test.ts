import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-tcg-'))
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

type FixtureOpts = {
  profile?: string | null
  graphDelta?: string | null
  graphDeltaNote?: string | null
  wikiDelta?: string | null
  wikiDeltaNote?: string | null
  experienceCapture?: string
  kpiAggregator?: string
  kpiBody?: string
  experienceBody?: string
}

const LONG_EXPERIENCE =
  '本轮关账经验：fixture 长文经验总结，覆盖八十字阈值口径。'.repeat(3)

function taskMd(opts: FixtureOpts = {}): string {
  const meta: [string, string][] = [
    ['task_slug', 'cg_ok'],
    ['test_strategy', 'recommended'],
  ]
  if (opts.profile !== null) meta.push(['invoke_retention_profile', opts.profile ?? 'default'])
  if (opts.graphDelta !== null) meta.push(['graph_delta', opts.graphDelta ?? 'none'])
  if (opts.graphDeltaNote !== null) meta.push(['graph_delta_note', opts.graphDeltaNote ?? 'fixture 无图谱增量'])
  if (opts.wikiDelta !== null) meta.push(['wiki_delta', opts.wikiDelta ?? 'none'])
  if (opts.wikiDeltaNote !== null) meta.push(['wiki_delta_note', opts.wikiDeltaNote ?? 'fixture 无 wiki 增量'])
  meta.push(['experience_capture', opts.experienceCapture ?? 'recommended'])
  meta.push(['kpi_aggregator', opts.kpiAggregator ?? 'CLOSE'])
  return [
    '# Task cg_ok',
    '',
    '> **状态**：`done`',
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    ...meta.map(([k, v]) => `| **${k}** | \`${v}\` |`),
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
    '自检已回填：fixture close guards。',
    '',
    '### KPI（00）',
    '',
    opts.kpiBody ?? 'Task_KPI%: 87',
    '',
    '### 经验总结',
    '',
    opts.experienceBody ?? 'fixture 经验总结：无。',
    '',
  ].join('\n')
}

const TASK_REL = 'docs/tasks/active/task_cg_ok_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_cg_ok_audit_R1_2026-08-20.md'
const INVOKE10_REL = 'docs/harness/invokes/by-task/cg_ok/invoke_20260801_10_cg_ok.md'
const INVOKE3040_REL = 'docs/harness/invokes/by-task/cg_ok/invoke_20260802_30_40_cg_ok.md'

async function seedComplete(dir: string, opts: FixtureOpts = {}, artifacts: { review?: boolean; invoke10?: boolean; invoke3040?: boolean } = {}): Promise<void> {
  await writeRel(dir, TASK_REL, taskMd(opts))
  if (artifacts.review !== false) await writeRel(dir, REVIEW_REL, '# R1 fixture')
  if (artifacts.invoke10 !== false) await writeRel(dir, INVOKE10_REL, '# invoke 10 fixture')
  if (artifacts.invoke3040 !== false) await writeRel(dir, INVOKE3040_REL, '# invoke 30+40 merged fixture')
}

function close(dir: string, extra: string[] = []): RunResult {
  return runCli(['task', 'close', '--file', TASK_REL, ...extra], dir)
}

// DEF-003 阶段二 T6：task close 接线 lifecycle.yaml close 转移登记的 close 守卫
// （required_invoke_hats/profile · close_review · graph_delta · KPI · experience · wiki_delta），
// 与 lifecycle dry-run 同一实现源（cli-checks evalCloseGuard · 不复制逻辑）。
// 红→绿钉死：修复前 cmdTaskClose 只查 slug/自检/验收/状态，七项守卫无求值。
// PRD_DEF-003 后续棒：close_wiki_promotion 接线（对照旧包 @cyning/harness@2.24.0
// evaluateWikiPromotionPointer · 红→绿钉死：修复前 evalCloseGuard 对该 id 返回 null → dry-run unevaluated）。
describe('DEF-003 T6 + 后续棒 · task close 守卫接线', { concurrency: 1 }, () => {
  it('全齐 → CLOSE: PASS（dry-run）；--yes 真归档 active→done', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const dry = close(dir)
      assert.equal(dry.status, 0, dry.combined)
      assert.match(dry.combined, /CLOSE: PASS · cg_ok/)
      const yes = close(dir, ['--yes'])
      assert.equal(yes.status, 0, yes.combined)
      assert.match(yes.combined, /CLOSE: PASS · cg_ok/)
      assert.equal(existsSync(path.join(dir, TASK_REL)), false)
      assert.equal(existsSync(path.join(dir, 'docs/tasks/done/task_cg_ok_v1.md')), true)
    })
  })

  it('close_invoke：缺 30/40 invoke → BLOCKED 点名缺项；--allow-invoke-gap 豁免留痕', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, {}, { invoke3040: false })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /CLOSE: BLOCKED · cg_ok/)
      assert.match(bad.combined, /close_invoke/)
      assert.match(bad.combined, /missing invoke hats: 30,40/)
      const waived = close(dir, ['--allow-invoke-gap'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /留痕/)
      assert.match(waived.combined, /--allow-invoke-gap/)
    })
  })

  it('close_invoke profile=full：帽集合与旧包 2.24.0 口径已核对一致（10,20,30,40,00,CLOSE · 不含 22/50）', async () => {
    // 对照旧包 @cyning/harness@2.24.0 lib/task-meta.js INVOKE_RETENTION_PROFILES：
    // full=Object.freeze(['00','10','20','30','40','CLOSE']) —— 22/50 不属于 full；
    // 1.4.0 Wave B 曾解释性定义为 10,20,22,30,40,50,00,CLOSE（多 22/50），本用例钉死修正后口径。
    await withTemp(async (dir) => {
      await seedComplete(dir, { profile: 'full' })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      // fixture 已落 10/30/40 → 缺项恰好 20,00,CLOSE（22/50 不在 required 集合）
      assert.match(bad.combined, /missing invoke hats: 20,00,CLOSE（invoke_retention_profile=full · 或 --allow-invoke-gap 豁免）/)
      // 补齐 20/00/close（无需 22/50）→ PASS
      await writeRel(dir, 'docs/harness/invokes/by-task/cg_ok/invoke_20260803_20_cg_ok.md', '# invoke 20 fixture')
      await writeRel(dir, 'docs/harness/invokes/by-task/cg_ok/invoke_20260804_00_cg_ok.md', '# invoke 00 fixture')
      await writeRel(dir, 'docs/harness/invokes/by-task/cg_ok/invoke_20260805_close_cg_ok.md', '# invoke close fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('close_review：缺 R<n> 审查文 → BLOCKED；--allow-no-review 豁免留痕', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, {}, { review: false })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_review/)
      assert.match(bad.combined, /missing R<n> review/)
      const waived = close(dir, ['--allow-no-review'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /留痕/)
    })
  })

  it('close_graph_delta：缺字段 warn 不挡；none 无 note / 路径不存在 BLOCK；合法路径 PASS', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { graphDelta: null, graphDeltaNote: null })
      const warnOnly = close(dir)
      assert.equal(warnOnly.status, 0, warnOnly.combined)
      assert.match(warnOnly.combined, /close: warn · close_graph_delta/)
      assert.match(warnOnly.combined, /CLOSE: PASS/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { graphDeltaNote: null })
      const noNote = close(dir)
      assert.equal(noNote.status, 2, noNote.combined)
      assert.match(noNote.combined, /close_graph_delta/)
      assert.match(noNote.combined, /graph_delta_note/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { graphDelta: 'docs/_tech_graph/flow_x.md', graphDeltaNote: null })
      const dangling = close(dir)
      assert.equal(dangling.status, 2, dangling.combined)
      assert.match(dangling.combined, /close_graph_delta/)
      assert.match(dangling.combined, /docs\/_tech_graph\/flow_x\.md/)
      await writeRel(dir, 'docs/_tech_graph/flow_x.md', '# graph fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('close_kpi：### KPI 节无可解析分数 → BLOCKED；--allow-kpi-gap 豁免；D1–D5 表可解析 PASS', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { kpiBody: '（kpi_aggregator: CLOSE · 关账回溯填写）' })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_kpi/)
      assert.match(bad.combined, /可解析分数/)
      const waived = close(dir, ['--allow-kpi-gap'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /--allow-kpi-gap/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { kpiBody: '| D1 | 4 |\n| D2 | 5 |' })
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('close_experience：experience_capture=required 且经验节未达标 → BLOCKED；--allow-experience-gap 豁免；≥80 字 PASS', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { experienceCapture: 'required', experienceBody: '（experience_capture: required 时关账必填）' })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_experience/)
      const waived = close(dir, ['--allow-experience-gap'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /--allow-experience-gap/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { experienceCapture: 'required', experienceBody: LONG_EXPERIENCE })
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('close_wiki_delta：缺字段 / none 无 note / 路径不存在 → BLOCKED；--allow-wiki-gap 豁免；合法路径 PASS', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { wikiDelta: null, wikiDeltaNote: null })
      const missing = close(dir)
      assert.equal(missing.status, 2, missing.combined)
      assert.match(missing.combined, /close_wiki_delta/)
      assert.match(missing.combined, /缺 wiki_delta 字段/)
      const waived = close(dir, ['--allow-wiki-gap'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /--allow-wiki-gap/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { wikiDeltaNote: null })
      const noNote = close(dir)
      assert.equal(noNote.status, 2, noNote.combined)
      assert.match(noNote.combined, /close_wiki_delta/)
      assert.match(noNote.combined, /wiki_delta_note/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { wikiDelta: 'docs/coding_wiki/lesson_x.md', wikiDeltaNote: null })
      const dangling = close(dir)
      assert.equal(dangling.status, 2, dangling.combined)
      assert.match(dangling.combined, /close_wiki_delta/)
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  // PRD_DEF-003 后续棒：close_wiki_promotion（语义映射旧包 @cyning/harness@2.24.0
  // lib/close-loop-gates.js evaluateWikiPromotionPointer · 豁免旗标 --allow-wiki-gap 与 wiki_delta 共用）
  it('close_wiki_promotion：experience=required 且 wiki_delta=path 缺晋升指针 → BLOCKED 点名守卫；--allow-wiki-gap 豁免留痕；wiki_promoted: 指针 PASS', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, {
        experienceCapture: 'required',
        wikiDelta: 'docs/coding_wiki/lesson_x.md',
        experienceBody: LONG_EXPERIENCE,
      })
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /CLOSE: BLOCKED · cg_ok/)
      assert.match(bad.combined, /close_wiki_promotion/)
      assert.match(bad.combined, /晋升指针/)
      const waived = close(dir, ['--allow-wiki-gap'])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /CLOSE: PASS/)
      assert.match(waived.combined, /留痕/)
      assert.match(waived.combined, /--allow-wiki-gap/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, {
        experienceCapture: 'required',
        wikiDelta: 'docs/coding_wiki/lesson_x.md',
        experienceBody: LONG_EXPERIENCE + '\nwiki_promoted: docs/coding_wiki/lesson_x.md',
      })
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('close_wiki_promotion 指针词表与跳过口径（旧包对齐）：Wiki: 前缀 / 与 wiki_delta 相同子串 PASS；wiki_delta=none 或 experience≠required 不闸', async () => {
    // Wiki: 前缀指针
    await withTemp(async (dir) => {
      await seedComplete(dir, {
        experienceCapture: 'required',
        wikiDelta: 'docs/coding_wiki/lesson_x.md',
        experienceBody: LONG_EXPERIENCE + '\nWiki: docs/coding_wiki/lesson_x.md（本轮经验已晋升）',
      })
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
    // 与 wiki_delta 相同子串（路径不含 coding_wiki 词 · 纯子串命中）
    await withTemp(async (dir) => {
      await seedComplete(dir, {
        experienceCapture: 'required',
        wikiDelta: 'docs/wiki/lesson_x.md',
        experienceBody: LONG_EXPERIENCE + '\n本轮经验已晋升，详见 docs/wiki/lesson_x.md',
      })
      await writeRel(dir, 'docs/wiki/lesson_x.md', '# wiki fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
    // wiki_delta=none + experience=required：晋升指针不闸（skip pass）
    await withTemp(async (dir) => {
      await seedComplete(dir, { experienceCapture: 'required', experienceBody: LONG_EXPERIENCE })
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
    // wiki_delta=path 但 experience_capture=recommended：跳过（不闸）
    await withTemp(async (dir) => {
      await seedComplete(dir, { wikiDelta: 'docs/coding_wiki/lesson_x.md' })
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const good = close(dir)
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /CLOSE: PASS/)
    })
  })

  it('缺项指明：多守卫同时 fail → blockers 逐项列出各自守卫 id', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { wikiDelta: null, wikiDeltaNote: null, kpiBody: '（占位）' }, { review: false })
      const bad = close(dir)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_review/)
      assert.match(bad.combined, /close_kpi/)
      assert.match(bad.combined, /close_wiki_delta/)
    })
  })

  it('lifecycle dry-run 同口径：close 守卫真求值 · close_wiki_promotion 已接线（R-TRUTH-1 · 未接线残留清零）', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const good = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', TASK_REL, '--target', dir,
      ])
      assert.equal(good.status, 0, good.combined)
      assert.match(good.combined, /close_invoke: pass/)
      assert.match(good.combined, /close_review: pass/)
      assert.match(good.combined, /close_graph_delta: pass/)
      assert.match(good.combined, /close_kpi: pass/)
      assert.match(good.combined, /close_experience: pass/)
      assert.match(good.combined, /close_wiki_delta: pass/)
      // 后续棒已接线：fixture experience_capture=recommended → 跳过 pass（非 unevaluated）
      assert.match(good.combined, /close_wiki_promotion: pass · experience_capture=recommended（非 required · 跳过 wiki 晋升指针）/)
      assert.match(good.combined, /unevaluated_count: 0/)
      assert.doesNotMatch(good.combined, /未接线/)
    })
    await withTemp(async (dir) => {
      // dry-run 同口径真求值：experience=required + wiki path 无指针 → fail 挡；--allow-wiki-gap 转 warn 留痕
      await seedComplete(dir, {
        experienceCapture: 'required',
        wikiDelta: 'docs/coding_wiki/lesson_x.md',
        experienceBody: LONG_EXPERIENCE,
      })
      await writeRel(dir, 'docs/coding_wiki/lesson_x.md', '# wiki fixture')
      const bad = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', TASK_REL, '--target', dir,
      ])
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_wiki_promotion: fail · 经验节缺 wiki 晋升指针/)
      assert.match(bad.combined, /blocked: true/)
      const waived = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', TASK_REL, '--target', dir,
        '--allow-wiki-gap',
      ])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /close_wiki_promotion: warn/)
      assert.match(waived.combined, /--allow-wiki-gap 豁免/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, {}, { review: false })
      const bad = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', TASK_REL, '--target', dir,
      ])
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /close_review: fail/)
      assert.match(bad.combined, /blocked: true/)
      const waived = runCli([
        'lifecycle', 'dry-run',
        '--transition', 'close', '--from', 'done',
        '--task', TASK_REL, '--target', dir,
        '--allow-no-review',
      ])
      assert.equal(waived.status, 0, waived.combined)
      assert.match(waived.combined, /close_review: warn/)
      assert.match(waived.combined, /--allow-no-review 豁免/)
    })
  })
})
