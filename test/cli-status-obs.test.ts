import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

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
  return { status: result.status, stdout, stderr, combined: `${stdout}\n${stderr}` }
}

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-status-obs-'))
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

function taskMd(opts: { slug: string; status?: string }): string {
  const status = opts.status ?? 'draft'
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
    '',
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    '| HG-AUDIT-R1 | approved | 30 | fixture |',
    '',
  ].join('\n')
}

type StatusPayload = {
  reviews: { R1: boolean; CLOSE: boolean }
  hgm: { event_count: number | null; last_at: string | null }
}

function statusJson(dir: string, taskRel: string): StatusPayload {
  const r = runCli(['status', '--task', taskRel, '--target', dir, '--json'])
  assert.equal(r.status, 0, r.combined)
  return JSON.parse(r.stdout) as StatusPayload
}

describe('DEF-016 reviews.CLOSE 接线 + event_count 0/null 语义统一（先红）', { concurrency: 1 }, () => {
  it('event_count：空事件轨 → 0；非空轨无匹配 → 0（不再 null）；有匹配 → 计数+last_at', async () => {
    await withTemp(async (dir) => {
      const relA = 'docs/tasks/active/task_obs_a_v1.md'
      await writeRel(dir, relA, taskMd({ slug: 'obs_a' }))
      // 空轨 → 0
      assert.equal(statusJson(dir, relA).hgm.event_count, 0)
      // ingest 后 task A 有匹配事件
      const ingest = runCli(['graph', 'ingest', '--target', dir])
      assert.equal(ingest.status, 0, ingest.combined)
      const withEvents = statusJson(dir, relA).hgm
      assert.ok((withEvents.event_count ?? 0) >= 2, `应有 TaskCreated+Gate 事件: ${JSON.stringify(withEvents)}`)
      assert.ok(withEvents.last_at, 'last_at 应非空')
      // 新增 task B（未 ingest 进事件轨）→ 非空轨无匹配 → 0（修复前为 null）
      const relB = 'docs/tasks/active/task_obs_b_v1.md'
      await writeRel(dir, relB, taskMd({ slug: 'obs_b' }))
      const noMatch = statusJson(dir, relB).hgm
      assert.equal(noMatch.event_count, 0, `非空轨无匹配应为 0: ${JSON.stringify(noMatch)}`)
      assert.equal(noMatch.last_at, null)
    })
  })

  it('event_count：事件轨读取失败（损坏 jsonl）→ null', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_obs_c_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'obs_c' }))
      await writeRel(dir, '.cyning-harness/events/2026-08.jsonl', '{corrupt json\n')
      const payload = statusJson(dir, rel)
      assert.equal(payload.hgm.event_count, null, '读取失败应为 null')
      assert.equal(payload.hgm.last_at, null)
    })
  })

  it('reviews.CLOSE：status=done → true；draft → false；done/ 目录（归档）→ true', async () => {
    await withTemp(async (dir) => {
      const relDone = 'docs/tasks/active/task_close_done_v1.md'
      await writeRel(dir, relDone, taskMd({ slug: 'close_done', status: 'done' }))
      const donePayload = statusJson(dir, relDone)
      assert.equal(donePayload.reviews.CLOSE, true, 'status=done 应 CLOSE=true')
      const relDraft = 'docs/tasks/active/task_close_draft_v1.md'
      await writeRel(dir, relDraft, taskMd({ slug: 'close_draft', status: 'draft' }))
      const draftPayload = statusJson(dir, relDraft)
      assert.equal(draftPayload.reviews.CLOSE, false, 'status=draft 应 CLOSE=false')
      // 归档到 done/ 目录但状态字段未更新 → 目录位置亦是关账信号
      const relArchived = 'docs/tasks/done/task_close_archived_v1.md'
      await writeRel(dir, relArchived, taskMd({ slug: 'close_archived', status: 'in_progress' }))
      const archivedPayload = statusJson(dir, relArchived)
      assert.equal(archivedPayload.reviews.CLOSE, true, 'done/ 目录应 CLOSE=true')
    })
  })
})
