import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { realpathSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildDoneSnapshot } from '../src/cli-shared.ts'

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
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-cds-'))
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

function taskMd(): string {
  const meta: [string, string][] = [
    ['task_slug', 'snap_ok'],
    ['test_strategy', 'recommended'],
    ['invoke_retention_profile', 'default'],
    ['graph_delta', 'none'],
    ['graph_delta_note', 'fixture 无图谱增量'],
    ['wiki_delta', 'none'],
    ['wiki_delta_note', 'fixture 无 wiki 增量'],
    ['experience_capture', 'recommended'],
    ['kpi_aggregator', 'CLOSE'],
    ['close_pr_policy', 'exempt'],
    ['close_pr_exempt_note', 'fixture done snapshot'],
  ]
  return [
    '# Task snap_ok',
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
    '自检已回填：fixture done snapshot。',
    '',
    '### KPI（00）',
    '',
    'Task_KPI%: 87',
    '',
    '### 经验总结',
    '',
    'fixture 经验总结：无。',
    '',
  ].join('\n')
}

const TASK_REL = 'docs/tasks/active/task_snap_ok_v1.md'
const DONE_REL = 'docs/tasks/done/task_snap_ok_v1.md'
const REVIEW_REL = 'docs/harness/reviews/task_snap_ok_audit_R1_2026-08-20.md'
const INVOKE10_REL = 'docs/harness/invokes/by-task/snap_ok/invoke_20260801_10_snap_ok.md'
const INVOKE3040_REL = 'docs/harness/invokes/by-task/snap_ok/invoke_20260802_30_40_snap_ok.md'

async function seedComplete(
  dir: string,
  artifacts: { review?: boolean; invoke10?: boolean; invoke3040?: boolean } = {},
): Promise<void> {
  await writeRel(dir, TASK_REL, taskMd())
  if (artifacts.review !== false) await writeRel(dir, REVIEW_REL, '# R1 fixture')
  if (artifacts.invoke10 !== false) await writeRel(dir, INVOKE10_REL, '# invoke 10 fixture')
  if (artifacts.invoke3040 !== false) await writeRel(dir, INVOKE3040_REL, '# invoke 30+40 merged fixture')
}

function close(dir: string, extra: string[] = []): RunResult {
  return runCli(['task', 'close', '--file', TASK_REL, ...extra], dir)
}

function parseJson(r: RunResult): Record<string, unknown> {
  try {
    return JSON.parse(r.stdout) as Record<string, unknown>
  } catch {
    assert.fail(`stdout 非 JSON: ${r.combined}`)
  }
}

// K5（task close-done-snapshot · 拟 1.8.0）：task close PASS 后 stdout 追加 done 片段快照
// （归档路径 + 归档文件 ## Harness 元信息 节摘录 + 禁手写提示）；新增 --json 旗标
// （done_snapshot:{path,harness_meta_section} · READY 恒 null · BLOCKED 仅错误面）。
// done_snapshot null 唯绑「是否真归档」（renameSync / CLOSE: PASS），与豁免旗标无关（20 审 R2 口径裁决）。
// 红→绿钉死：实现前 close 无 --json（未知参数即 fail）且 PASS 后无任何快照输出。
describe('K5 · task close done 片段快照 + --json', { concurrency: 1 }, () => {
  it('PASS --yes：CLOSE: PASS 之后追加快照块（path + 元信息节摘录 + 禁手写提示）', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const r = close(dir, ['--yes'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.stdout, /CLOSE: PASS · snap_ok/)
      const passIdx = r.stdout.indexOf('CLOSE: PASS')
      const snapIdx = r.stdout.indexOf('done_snapshot')
      assert.ok(snapIdx > passIdx, `快照块须在 CLOSE: PASS 之后: ${r.stdout}`)
      assert.match(r.stdout, /done_snapshot · path: .*docs\/tasks\/done\/task_snap_ok_v1\.md/)
      assert.match(r.stdout, /## Harness 元信息/)
      assert.match(r.stdout, /\| \*\*task_slug\*\* \| `snap_ok` \|/)
      assert.match(r.stdout, /禁止手写 done · 以此快照为格式真值/)
    })
  })

  it('dry-run READY：stdout 与 1.7.1 逐字一致（无快照 · 冻结文案回归钉死）', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const r = close(dir)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.stdout, /CLOSE: READY · snap_ok/)
      assert.doesNotMatch(r.stdout, /done_snapshot/)
      assert.doesNotMatch(r.stdout, /禁止手写 done/)
      const realDir = realpathSync(dir)
      const expected =
        'mode: dry-run（未执行 mv · 加 --yes 执行）\n' +
        `dest: ${path.join(realDir, DONE_REL)}\n` +
        'CLOSE: READY · snap_ok\n'
      assert.equal(r.stdout, expected)
    })
  })

  it('--json PASS：done_snapshot {path, harness_meta_section} 与 stdout 摘录同源', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const r = close(dir, ['--yes', '--json'])
      assert.equal(r.status, 0, r.combined)
      const obj = parseJson(r)
      assert.equal(obj.ok, true)
      assert.equal(obj.status, 'PASS')
      const snap = obj.done_snapshot as { path?: string; harness_meta_section?: string } | null
      assert.ok(snap, 'PASS 路径 done_snapshot 非 null')
      assert.ok(snap.path?.endsWith(DONE_REL), `path 须指向归档文件: ${snap.path}`)
      assert.match(snap.harness_meta_section ?? '', /## Harness 元信息/)
      assert.match(snap.harness_meta_section ?? '', /\*\*task_slug\*\* \| `snap_ok`/)
    })
  })

  it('--json READY（dry-run）：done_snapshot 为 null · exit 0', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir)
      const r = close(dir, ['--json'])
      assert.equal(r.status, 0, r.combined)
      const obj = parseJson(r)
      assert.equal(obj.ok, true)
      assert.equal(obj.status, 'READY')
      assert.equal(obj.done_snapshot, null)
    })
  })

  it('--json BLOCKED：非 0 退出 · JSON 仅错误面（无 done_snapshot 字段）', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { review: false })
      const r = close(dir, ['--json'])
      assert.equal(r.status, 2, r.combined)
      const obj = parseJson(r)
      assert.equal(obj.ok, false)
      assert.equal(obj.status, 'BLOCKED')
      assert.match((obj.blockers as string[]).join('\n'), /close_review/)
      assert.equal('done_snapshot' in obj, false, 'BLOCKED JSON 不得含 done_snapshot')
    })
  })

  it('豁免 dry-run（--allow-invoke-gap）：READY 无 stdout 快照 · JSON done_snapshot 仍 null', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { invoke3040: false })
      const dry = close(dir, ['--allow-invoke-gap'])
      assert.equal(dry.status, 0, dry.combined)
      assert.match(dry.stdout, /CLOSE: READY/)
      assert.match(dry.stdout, /--allow-invoke-gap/)
      assert.doesNotMatch(dry.stdout, /done_snapshot/)
      const j = close(dir, ['--allow-invoke-gap', '--json'])
      assert.equal(j.status, 0, j.combined)
      const obj = parseJson(j)
      assert.equal(obj.status, 'READY')
      assert.equal(obj.done_snapshot, null)
      assert.match(((obj.traces as string[]) ?? []).join('\n'), /--allow-invoke-gap/)
    })
  })

  it('豁免 + --yes（--allow-invoke-gap）：真归档 → stdout 快照照打 · JSON done_snapshot 非 null（20 审 R2 口径）', async () => {
    await withTemp(async (dir) => {
      await seedComplete(dir, { invoke3040: false })
      const r = close(dir, ['--allow-invoke-gap', '--yes'])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.stdout, /CLOSE: PASS · snap_ok/)
      assert.match(r.stdout, /--allow-invoke-gap/)
      assert.match(r.stdout, /done_snapshot · path: .*task_snap_ok_v1\.md/)
      assert.match(r.stdout, /禁止手写 done · 以此快照为格式真值/)
    })
    await withTemp(async (dir) => {
      await seedComplete(dir, { invoke3040: false })
      const r = close(dir, ['--allow-invoke-gap', '--yes', '--json'])
      assert.equal(r.status, 0, r.combined)
      const obj = parseJson(r)
      assert.equal(obj.status, 'PASS')
      const snap = obj.done_snapshot as { path?: string; harness_meta_section?: string } | null
      assert.ok(snap, '豁免 + --yes 真归档 → done_snapshot 非 null（null 唯绑是否归档，与豁免无关）')
      assert.ok(snap.path?.endsWith(DONE_REL))
      assert.match(snap.harness_meta_section ?? '', /## Harness 元信息/)
    })
  })

  // 失败路径表「归档文件缺 ## Harness 元信息（异常态）」：close_slug 缺 task_slug 硬 fail 且无豁免旗标，
  // 该异常态经 task close 正常路径不可达 → 以 buildDoneSnapshot helper 单测钉死防御分支。
  it('helper：归档文件有元信息节 → 摘录节原文 · warn 为 null', async () => {
    await withTemp(async (dir) => {
      const abs = await writeRel(dir, DONE_REL, taskMd())
      const snap = buildDoneSnapshot(abs)
      assert.equal(snap.warn, null)
      assert.equal(snap.path, abs)
      assert.match(snap.harness_meta_section, /## Harness 元信息/)
      assert.match(snap.harness_meta_section, /\*\*task_slug\*\* \| `snap_ok`/)
      assert.doesNotMatch(snap.harness_meta_section, /### 人工闸/)
    })
  })

  it('helper：归档文件缺元信息节（异常态）→ canonical 模板占位 + warn 行', async () => {
    await withTemp(async (dir) => {
      const abs = await writeRel(dir, 'docs/tasks/done/task_no_meta_v1.md', '# Task no_meta\n\n> **状态**：`done`\n')
      const snap = buildDoneSnapshot(abs)
      assert.ok(snap.warn, '缺节须带 warn')
      assert.match(snap.warn ?? '', /Harness 元信息/)
      assert.match(snap.harness_meta_section, /## Harness 元信息/)
      // canonical 模板（assets/harness/templates/TASK_TEMPLATE.md）特征行
      assert.match(snap.harness_meta_section, /\*\*audit_profile\*\*/)
      assert.match(snap.harness_meta_section, /\*\*invoke_retention_profile\*\*/)
    })
  })
})
