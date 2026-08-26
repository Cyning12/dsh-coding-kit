import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')
const S2_RELS = ['docs/tasks', 'reviews', 'invokes/by-task'] as const
const S2_FILES = [
  ['docs/tasks/keep.md', 'S2-TASK-BODY-g1g7\n'],
  ['reviews/keep.md', 'S2-REVIEW-BODY-g1g7\n'],
  ['invokes/by-task/keep.md', 'S2-INVOKE-BODY-g1g7\n'],
] as const

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-g1g7-'))
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

function taskMd(opts: {
  slug: string
  status?: string
  audit?: string
  draft?: string
  draftBlocks?: string
  wikiDelta?: string
}): string {
  const status = opts.status ?? 'draft'
  const audit = opts.audit ?? 'approved'
  const draft = opts.draft ?? 'approved'
  const draftBlocks = opts.draftBlocks ?? '20,30'
  const wikiLine =
    opts.wikiDelta === undefined
      ? ''
      : `| **wiki_delta** | \`${opts.wikiDelta}\` |\n`
  return [
    `# Task ${opts.slug}`,
    '',
    `> **状态**：\`${status}\``,
    '',
    '## Harness 元信息',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| **task_slug** | \`${opts.slug}\` |`,
    `| **test_strategy** | \`recommended\` |`,
    wikiLine,
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    `| HG-TASK-DRAFT | ${draft} | ${draftBlocks} | fixture |`,
    `| HG-AUDIT-R1 | ${audit} | 30 | fixture |`,
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
    'fixture self-check filled.',
    '',
  ].join('\n')
}

const GRAPH_YAML = `graph_id: "g1"
title: "fixture graph"
description: "g1g7"
version: "2026-08-16"

nodes:
  - id: "A"
    label: "Alpha"
  - id: "B"
    label: "Beta"

edges:
  - from: "A"
    to: "B"
    label: "->"
`

function listHgmFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (d: string): void => {
    if (!existsSync(d)) return
    for (const name of readdirSync(d)) {
      const full = path.join(d, name)
      try {
        const st = readdirSync(full)
        out.push(...st.map((n) => path.join(full, n)))
        walk(full)
      } catch {
        out.push(full)
      }
    }
  }
  walk(path.join(dir, '.cyning-harness'))
  return out.sort()
}

describe('D1–D7 G1–G7 runtime', { concurrency: 1 }, () => {
  it('D1 / G1: status --task 投影成功；--check 无 --task 非 0', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_status_ok_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'status_ok' }))
      const ok = runCli(['status', '--task', rel, '--target', dir, '--json'])
      assert.equal(ok.status, 0, ok.combined)
      assert.match(ok.combined, /status_ok|obs_status|may_start_30|gates/)
      const bad = runCli(['status', '--check', '--target', dir])
      assert.equal(bad.status, 1, bad.combined)
    })
  })

  it('D1 / G1: timeline 无 --task 非 0；有 --task 打印时间线', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_tl_ok_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'tl_ok' }))
      const miss = runCli(['timeline', '--target', dir])
      assert.equal(miss.status, 1, miss.combined)
      const ok = runCli(['timeline', '--task', rel, '--target', dir])
      assert.equal(ok.status, 0, ok.combined)
      assert.match(ok.combined, /tl_ok|timeline|events/)
    })
  })

  it('D1b: timeline 无 --ingest 成功且不写盘', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_tl_nowrite_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'tl_nowrite' }))
      const before = listHgmFiles(dir)
      const r = runCli(['timeline', '--task', rel, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const after = listHgmFiles(dir)
      assert.deepEqual(after, before)
      assert.equal(existsSync(path.join(dir, '.cyning-harness', 'events')), false)
    })
  })

  it('D2 / G2: lifecycle show / discipline show 成功；未知子命令非 0；dry-run 缺参 exit 1', () => {
    const life = runCli(['lifecycle', 'show', '--json'])
    assert.equal(life.status, 0, life.combined)
    assert.match(life.combined, /states|transitions/)
    const disc = runCli(['discipline', 'show', '--json'])
    assert.equal(disc.status, 0, disc.combined)
    assert.match(disc.combined, /statements|as_of_package_version/)
    const unknown = runCli(['lifecycle', 'explode'])
    assert.notEqual(unknown.status, 0, unknown.combined)
    const missing = runCli(['lifecycle', 'dry-run'])
    assert.equal(missing.status, 1, missing.combined)
  })

  it('D2b: lifecycle dry-run 合法 --transition/--from 成功 exit 0', () => {
    const r = runCli([
      'lifecycle',
      'dry-run',
      '--transition',
      'to_00',
      '--from',
      'draft',
      '--allow-no-spec-review',
    ])
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /dry-run|to_00|structure_ok/)
  })

  it('DEF-019: lifecycle dry-run 支持 --target（--task 相对 target 解析）；缺省=cwd；未知旗标 fail-fast', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_lc_target_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'lc_target' }))
      // DEF-003 T3：reviews_retention 已真接线（缺 R<n> 审查文即 fail/blocked）· 补审查文保持本用例聚焦 --target 解析
      await writeRel(dir, 'docs/harness/reviews/task_lc_target_audit_R1_2026-08-20.md', '# R1 fixture')
      // 带 --target：--task 相对 target 解析成功（cwd=KIT 下该相对路径不存在）
      const withTarget = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_30', '--from', 'draft',
        '--task', rel, '--target', dir,
      ])
      assert.equal(withTarget.status, 0, withTarget.combined)
      assert.match(withTarget.combined, /HG-AUDIT-R1: pass/)
      // 不带 --target：cwd 下不存在该 task → 「--task 不可读」exit 1（现状语义保留）
      const noTarget = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_30', '--from', 'draft',
        '--task', 'docs/tasks/active/task_lc_definitely_missing_v1.md',
      ])
      assert.equal(noTarget.status, 1, noTarget.combined)
      assert.match(noTarget.combined, /--task 不可读/)
      // 未知旗标仍 fail-fast（--target 接线不得破坏）
      const bogus = runCli([
        'lifecycle', 'dry-run', '--transition', 'to_30', '--from', 'draft', '--bogus',
      ])
      assert.equal(bogus.status, 1, bogus.combined)
      assert.match(bogus.combined, /未知参数/)
      assert.match(bogus.combined, /--bogus/)
    })
  })

  it('D3 / G3: graph yaml compile/check/export；check 有 diff 非 0', async () => {
    await withTemp(async (dir) => {
      const input = path.join(dir, 'docs', '_tech_graph')
      await writeRel(dir, 'docs/_tech_graph/g1.graph.yaml', GRAPH_YAML)
      const compiled = runCli(
        ['graph', 'yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir],
        dir,
      )
      assert.equal(compiled.status, 0, compiled.combined)
      assert.equal(existsSync(path.join(input, 'g1.md')), true)

      const exported = runCli(
        ['graph', 'yaml', 'export', '--input', input, '--target', dir],
        dir,
      )
      assert.equal(exported.status, 0, exported.combined)
      assert.equal(existsSync(path.join(input, 'shared', 'graph.json')), true)

      const checkOk = runCli(
        ['graph', 'yaml', 'check', '--graph-id', 'g1', '--input', input, '--target', dir],
        dir,
      )
      assert.equal(checkOk.status, 0, checkOk.combined)

      await writeFile(
        path.join(input, 'g1.graph.yaml'),
        GRAPH_YAML.replace(
          '  - id: "B"\n    label: "Beta"',
          '  - id: "B"\n    label: "Beta"\n  - id: "C"\n    label: "Gamma"',
        ),
        'utf8',
      )
      const checkFail = runCli(
        ['graph', 'yaml', 'check', '--graph-id', 'g1', '--input', input, '--target', dir],
        dir,
      )
      assert.notEqual(checkFail.status, 0, checkFail.combined)
    })
  })

  it('D3 / G3: graph ingest --dry-run 不写盘；snapshot 写盘；axioms 可 PASS/FAIL', async () => {
    await withTemp(async (dir) => {
      await writeRel(
        dir,
        '.cyning-harness/manifest.json',
        `${JSON.stringify({ version: '1.7.0', preset: 'harness-only', ide: [], from_version: null, upgraded_at: '2026-08-16T00:00:00Z' }, null, 2)}\n`,
      )
      await writeRel(dir, 'docs/tasks/active/task_hgm_ok_v1.md', taskMd({ slug: 'hgm_ok' }))
      const dry = runCli(['graph', 'ingest', '--target', dir, '--dry-run'])
      assert.equal(dry.status, 0, dry.combined)
      assert.equal(existsSync(path.join(dir, '.cyning-harness', 'events')), false)

      const snapEmpty = runCli(['graph', 'snapshot', '--target', dir])
      assert.equal(snapEmpty.status, 0, snapEmpty.combined)
      assert.equal(existsSync(path.join(dir, '.cyning-harness', 'graph', 'snapshot.json')), true)

      const axPass = runCli(['graph', 'axioms', 'check', '--target', dir])
      assert.equal(axPass.status, 0, axPass.combined)

      await writeRel(
        dir,
        'docs/tasks/active/task_hgm_fail_v1.md',
        taskMd({ slug: 'hgm_fail', audit: 'pending', status: 'draft' }),
      )
      const ingest = runCli(['graph', 'ingest', '--target', dir])
      assert.equal(ingest.status, 0, ingest.combined)
      const axFail = runCli(['graph', 'axioms', 'check', '--target', dir])
      assert.equal(axFail.status, 2, axFail.combined)
      assert.match(axFail.combined, /FAIL|violations|D2/)
    })
  })

  it('DEF-022: graph ingest 扫 harness 布局（docs/harness/tasks/active）；幂等不回归；timeline --ingest 同口径', async () => {
    // 布局一：仅 docs/harness/tasks/active 落 task（无 docs/tasks/active）
    await withTemp(async (dir) => {
      const rel = 'docs/harness/tasks/active/task_harness_ingest_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'harness_ingest' }))
      const run1 = runCli(['graph', 'ingest', '--target', dir])
      assert.equal(run1.status, 0, run1.combined)
      const eventsDir = path.join(dir, '.cyning-harness', 'events')
      assert.equal(existsSync(eventsDir), true, 'ingest 应写出事件轨')
      const jsonl = readdirSync(eventsDir)
        .filter((n) => n.endsWith('.jsonl'))
        .map((n) => readFileSync(path.join(eventsDir, n), 'utf8'))
        .join('')
      assert.ok(jsonl.includes('"type":"TaskCreated"'), 'jsonl 应含 TaskCreated')
      assert.ok(jsonl.includes('"subject":"task:harness_ingest"'), 'TaskCreated subject 应为 task:harness_ingest')
      assert.ok(jsonl.includes('"type":"GateStatusChanged"'), 'jsonl 应含 GateStatusChanged')
      assert.ok(jsonl.includes('gate:harness_ingest:HG-AUDIT-R1'), 'GateStatusChanged subject 应含闸标识')
      // 幂等回归（T4）：无变化重跑 → skipped 等于首次 count
      const count1 = Number(/新事件: (\d+)/.exec(run1.combined)?.[1] ?? -1)
      assert.ok(count1 >= 3, `首次应产生 TaskCreated + 2 道闸事件: ${run1.combined}`)
      const run2 = runCli(['graph', 'ingest', '--target', dir])
      assert.equal(run2.status, 0, run2.combined)
      const skipped2 = Number(/跳过（已存在）: (\d+)/.exec(run2.combined)?.[1] ?? -1)
      assert.equal(skipped2, count1, `第二次应全量跳过: ${run2.combined}`)
      // 同 slug 撞名（§7-D2）：两目录同 task_slug → 先扫目录（docs/tasks/active）优先、后者跳过
      await writeRel(dir, 'docs/tasks/active/task_dup_slug_v1.md', taskMd({ slug: 'dup_slug' }))
      await writeRel(dir, 'docs/harness/tasks/active/task_dup_slug_v1.md', taskMd({ slug: 'dup_slug' }))
      const run3 = runCli(['graph', 'ingest', '--target', dir])
      assert.equal(run3.status, 0, run3.combined)
      const jsonlAll = readdirSync(eventsDir)
        .filter((n) => n.endsWith('.jsonl'))
        .map((n) => readFileSync(path.join(eventsDir, n), 'utf8'))
        .join('')
      const dupCreated = jsonlAll
        .split('\n')
        .filter((l) => l.includes('"type":"TaskCreated"') && l.includes('"subject":"task:dup_slug"'))
      assert.equal(dupCreated.length, 1, `同 slug 撞名应只记一条 TaskCreated: ${dupCreated.join('|')}`)
      assert.ok(dupCreated[0].includes('docs/tasks/active'), '先扫目录（docs/tasks/active）优先')
    })
    // 布局二（独立 fixture）：timeline --ingest 自动获得同一双路径口径
    await withTemp(async (dir) => {
      const rel = 'docs/harness/tasks/active/task_harness_tl_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'harness_tl' }))
      const tl = runCli(['timeline', '--task', rel, '--target', dir, '--ingest', '--json'])
      assert.equal(tl.status, 0, tl.combined)
      const payload = JSON.parse(tl.stdout) as {
        ingest: { count: number; skipped: number } | null
        event_count: number
      }
      assert.ok((payload.ingest?.count ?? 0) >= 1, `timeline --ingest 应收录 harness 布局 task: ${tl.combined}`)
      assert.ok(payload.event_count >= 1, '时间线应非空（不再命中「无 HGM 数据」警告路径）')
    })
  })

  it('D4 / G4: sync index 写出 index；S2 哈希不变', async () => {
    await withTemp(async (dir) => {
      const hashes: Record<string, string> = {}
      for (const [rel, body] of S2_FILES) {
        await writeRel(dir, rel, body)
        hashes[rel] = sha256(body)
      }
      await writeRel(
        dir,
        'docs/harness/invokes/by-task/sync_ok/invoke_20260816_30_sync_ok.md',
        '# invoke fixture\n',
      )
      const r = runCli(['sync', 'index', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      const indexPath = path.join(dir, '.cyning-harness', 'invoke_index.json')
      assert.equal(existsSync(indexPath), true)
      const idx = JSON.parse(await readFile(indexPath, 'utf8')) as { index?: Record<string, unknown> }
      assert.ok(idx.index && typeof idx.index === 'object')
      for (const [rel, body] of S2_FILES) {
        const now = await readFile(path.join(dir, rel), 'utf8')
        assert.equal(now, body)
        assert.equal(sha256(now), hashes[rel])
      }
    })
  })

  it('D5 / G5: skills check 无 drift → 0；人为 drift → exit 2；build 不写消费者 S2', async () => {
    const pass = runCli(['skills', 'check'])
    assert.equal(pass.status, 0, pass.combined)

    const driftRel = path.join(KIT, 'assets', 'skills', '_g1g7_drift.txt')
    await writeFile(driftRel, 'drift-fixture\n', 'utf8')
    try {
      const fail = runCli(['skills', 'check'])
      assert.equal(fail.status, 2, fail.combined)
      assert.match(fail.combined, /SKILLS CHECK: FAIL/)
    } finally {
      await rm(driftRel, { force: true })
    }

    await withTemp(async (dir) => {
      const hashes: Record<string, string> = {}
      for (const [rel, body] of S2_FILES) {
        await writeRel(dir, rel, body)
        hashes[rel] = sha256(body)
      }
      const built = runCli(['skills', 'build'])
      assert.equal(built.status, 0, built.combined)
      for (const rel of S2_RELS) {
        assert.equal(existsSync(path.join(dir, rel, 'keep.md')), true)
      }
      for (const [rel, body] of S2_FILES) {
        assert.equal(await readFile(path.join(dir, rel), 'utf8'), body)
        assert.equal(sha256(await readFile(path.join(dir, rel), 'utf8')), hashes[rel])
      }
    })
  })

  it('D6 / G6: wiki export --json 成功；无根 exit 2；缺 --json exit 1', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'docs/coding_wiki/home.md', '# Home\n\nSee [[page]].\n')
      await writeRel(dir, 'docs/coding_wiki/page.md', '# Page\n')
      const ok = runCli(['wiki', 'export', '--json', '--target', dir])
      assert.equal(ok.status, 0, ok.combined)
      assert.match(ok.combined, /harness\.wiki_graph\.v1|"nodes"/)
      const noJson = runCli(['wiki', 'export', '--target', dir])
      assert.equal(noJson.status, 1, noJson.combined)
    })
    await withTemp(async (dir) => {
      const missing = runCli(['wiki', 'export', '--json', '--target', dir])
      assert.equal(missing.status, 2, missing.combined)
    })
  })

  it('D7 / G7: task lint-done / lint-wiki-delta / check 各一条 FAIL + PASS', async () => {
    await withTemp(async (dir) => {
      await writeRel(dir, 'docs/tasks/done/task_missing_invoke_v1.md', taskMd({ slug: 'missing_invoke' }))
      const lintFail = runCli(['task', 'lint-done', '--target', dir])
      assert.equal(lintFail.status, 2, lintFail.combined)
      assert.match(lintFail.combined, /LINT-DONE: FAIL/)

      await writeRel(
        dir,
        'docs/harness/invokes/by-task/missing-invoke/invoke_20260816_30_x.md',
        '# invoke\n',
      )
      const lintPass = runCli(['task', 'lint-done', '--target', dir])
      assert.equal(lintPass.status, 0, lintPass.combined)
      assert.match(lintPass.combined, /LINT-DONE: PASS/)
    })

    await withTemp(async (dir) => {
      await writeRel(dir, 'docs/tasks/active/task_wiki_gap_v1.md', taskMd({ slug: 'wiki_gap' }))
      const wikiFail = runCli(['task', 'lint-wiki-delta', '--target', dir])
      assert.equal(wikiFail.status, 2, wikiFail.combined)
      assert.match(wikiFail.combined, /LINT-WIKI-DELTA: FAIL/)

      await writeRel(
        dir,
        'docs/tasks/active/task_wiki_ok_v1.md',
        taskMd({ slug: 'wiki_ok', wikiDelta: 'none' }),
      )
      await rm(path.join(dir, 'docs/tasks/active/task_wiki_gap_v1.md'), { force: true })
      const wikiPass = runCli(['task', 'lint-wiki-delta', '--target', dir])
      assert.equal(wikiPass.status, 0, wikiPass.combined)
      assert.match(wikiPass.combined, /LINT-WIKI-DELTA: PASS/)
    })

    await withTemp(async (dir) => {
      const good = path.join(dir, 'ok.harness.json')
      await writeFile(
        good,
        `${JSON.stringify(
          {
            schema_version: '1',
            task_slug: 'sidecar_ok',
            test_strategy: 'recommended',
          },
          null,
          2,
        )}\n`,
        'utf8',
      )
      const checkOk = runCli(['task', 'check', '--file', good])
      assert.equal(checkOk.status, 0, checkOk.combined)
      assert.match(checkOk.combined, /schema: OK/)

      const bad = path.join(dir, 'bad.harness.json')
      await writeFile(bad, `${JSON.stringify({ schema_version: '9' }, null, 2)}\n`, 'utf8')
      const checkFail = runCli(['task', 'check', '--file', bad])
      assert.notEqual(checkFail.status, 0, checkFail.combined)
      assert.match(checkFail.combined, /schema: FAIL/)
    })
  })

  it('G7-strict: wiki_delta 非法值 / 悬空 path 仅 --strict 档报缺口（DEF-021 完成态 A）', async () => {
    // 非法值（todo）：默认档 PASS（字段存在即过），--strict 档 exit 2 + wiki_delta_invalid
    await withTemp(async (dir) => {
      await writeRel(
        dir,
        'docs/tasks/active/task_wiki_bad_value_v1.md',
        taskMd({ slug: 'wiki_bad_value', wikiDelta: 'todo' }),
      )
      const def = runCli(['task', 'lint-wiki-delta', '--target', dir])
      assert.equal(def.status, 0, def.combined)
      const strict = runCli(['task', 'lint-wiki-delta', '--target', dir, '--strict'])
      assert.equal(strict.status, 2, strict.combined)
      assert.match(strict.combined, /wiki_delta_invalid/)
    })

    // 悬空 path：默认档 PASS，--strict 档 exit 2 + wiki_delta_path_missing
    await withTemp(async (dir) => {
      await writeRel(
        dir,
        'docs/tasks/active/task_wiki_dangling_v1.md',
        taskMd({ slug: 'wiki_dangling', wikiDelta: 'docs/coding_wiki/not_here.md' }),
      )
      const def = runCli(['task', 'lint-wiki-delta', '--target', dir])
      assert.equal(def.status, 0, def.combined)
      const strict = runCli(['task', 'lint-wiki-delta', '--target', dir, '--strict'])
      assert.equal(strict.status, 2, strict.combined)
      assert.match(strict.combined, /wiki_delta_path_missing/)
    })

    // 合法 path（文件存在）+ none/n/a：--strict 档不误伤，仍 PASS
    await withTemp(async (dir) => {
      await writeRel(dir, 'docs/coding_wiki/topics/ok.md', '# wiki\n')
      await writeRel(
        dir,
        'docs/tasks/active/task_wiki_path_v1.md',
        taskMd({ slug: 'wiki_path_ok', wikiDelta: 'docs/coding_wiki/topics/ok.md' }),
      )
      await writeRel(
        dir,
        'docs/tasks/active/task_wiki_none_v1.md',
        taskMd({ slug: 'wiki_none_ok', wikiDelta: 'none' }),
      )
      await writeRel(
        dir,
        'docs/tasks/done/task_wiki_na_v1.md',
        taskMd({ slug: 'wiki_na_ok', wikiDelta: 'n/a' }),
      )
      const strict = runCli(['task', 'lint-wiki-delta', '--target', dir, '--strict'])
      assert.equal(strict.status, 0, strict.combined)
      assert.match(strict.combined, /LINT-WIKI-DELTA: PASS/)
    })
  })
})
