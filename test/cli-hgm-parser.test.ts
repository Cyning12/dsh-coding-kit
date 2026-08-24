import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { parseHumanGates } from '../src/cli-shared.ts'
import {
  filterEventsForTask,
  ingestRepoIdempotent,
  loadEvents,
  parseTaskMarkdown,
} from '../src/cli-graph-hgm.ts'

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-hgm-parser-'))
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

function taskMd(opts: { slug: string; status?: string; audit?: string; draft?: string }): string {
  const status = opts.status ?? 'draft'
  const audit = opts.audit ?? 'approved'
  const draft = opts.draft ?? 'approved'
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
    '| **test_strategy** | `recommended` |',
    '',
    '### 人工闸',
    '',
    '| human_gate_id | status | blocks_hats | 说明 |',
    '|---------------|--------|-------------|------|',
    `| HG-TASK-DRAFT | ${draft} | 20,30 | fixture |`,
    `| HG-AUDIT-R1 | ${audit} | 30 | fixture |`,
    '',
    '## 验收标准',
    '',
    '- [x] fixture item',
    '',
  ].join('\n')
}

type AnyEvent = {
  event_id: string
  type: string
  occurred_at: string
  actor: string
  subject: string
  data: Record<string, unknown>
  source: string
}

function ev(type: string, subject: string, data: Record<string, unknown> = {}): AnyEvent {
  return {
    event_id: `evt:test:${type}:${subject}`,
    type,
    occurred_at: '2026-08-22T00:00:00.000Z',
    actor: 'test',
    subject,
    data,
    source: 'test',
  }
}

describe('DEF-015 解析器统一 / 幂等键 / slug 匹配（T1 先红）', { concurrency: 1 }, () => {
  it('(a) 同一 task 经 parseHumanGates 与 parseTaskMarkdown 得同一闸集合（规范化逐项相等）', () => {
    const content = taskMd({ slug: 'parser_ok', draft: 'pending', audit: 'approved' })
    const shared = parseHumanGates(content)
      .map((g) => ({
        id: g.id,
        status: g.status,
        blocks: g.blocksHats.split(/[,\s]+/).filter(Boolean).sort(),
      }))
      .sort((x, y) => x.id.localeCompare(y.id))
    const hgm = parseTaskMarkdown(content, 'task_parser_ok_v1.md').gates
      .map((g) => ({ id: g.human_gate_id, status: g.status, blocks: [...g.blocks_hats].sort() }))
      .sort((x, y) => x.id.localeCompare(y.id))
    assert.ok(shared.length >= 2, 'fixture 应至少解析出两道闸')
    assert.deepEqual(hgm, shared)
  })

  it('(b) 互子串 slug（tl_ok / tl_ok2）各自事件互不串扰', () => {
    const events = [
      ev('TaskCreated', 'task:tl_ok', { task_slug: 'tl_ok' }),
      ev('TaskCreated', 'task:tl_ok2', { task_slug: 'tl_ok2' }),
      ev('GateStatusChanged', 'gate:tl_ok:HG-AUDIT-R1', { task_slug: 'tl_ok', new_status: 'approved' }),
      // 无 data.task_slug 的结构化 subject：子串兜底会把 tl_ok2 事件误配给 tl_ok
      ev('GateStatusChanged', 'gate:tl_ok2:HG-AUDIT-R1', { new_status: 'approved' }),
      // 非结构化 subject 且无 data.task_slug：宁缺勿滥，不参与 task 过滤
      ev('RepositoryAdopted', 'repo:tl_ok', {}),
    ]
    const forOk = filterEventsForTask(events as never, 'tl_ok')
    assert.equal(
      forOk.length,
      2,
      `tl_ok 应恰好匹配 2 条事件: ${JSON.stringify(forOk.map((e) => e.subject))}`,
    )
    assert.ok(
      forOk.every((e) => !String(e.subject).includes('tl_ok2')),
      'tl_ok 的过滤结果不得含 tl_ok2 事件',
    )
    const forOk2 = filterEventsForTask(events as never, 'tl_ok2')
    assert.equal(forOk2.length, 2)
  })

  it('(c) 闸状态 pending→approved 后重跑 ingest 补发 GateStatusChanged（old_status 取自事件轨）', async () => {
    await withTemp(async (dir) => {
      const rel = 'docs/tasks/active/task_gate_flip_v1.md'
      await writeRel(dir, rel, taskMd({ slug: 'gate_flip', audit: 'pending' }))
      const first = ingestRepoIdempotent(dir, { actor: 'test', source: 'test' })
      assert.ok(first.count >= 3, `首次 ingest 应产生 TaskCreated + 2 道闸事件: ${first.count}`)
      const noChange = ingestRepoIdempotent(dir, { actor: 'test', source: 'test' })
      assert.equal(noChange.count, 0, '无变化时重跑应为全量跳过')
      await writeRel(dir, rel, taskMd({ slug: 'gate_flip', audit: 'approved' }))
      const flipped = ingestRepoIdempotent(dir, { actor: 'test', source: 'test' })
      const gateEvents = flipped.events.filter(
        (e) => e.type === 'GateStatusChanged' && e.subject === 'gate:gate_flip:HG-AUDIT-R1',
      )
      assert.equal(
        gateEvents.length,
        1,
        `闸状态变化应补发 1 条 GateStatusChanged: ${JSON.stringify(flipped.events.map((e) => [e.type, e.subject]))}`,
      )
      assert.equal(gateEvents[0].data.old_status, 'pending')
      assert.equal(gateEvents[0].data.new_status, 'approved')
      const onDisk = loadEvents(dir).filter(
        (e) => e.type === 'GateStatusChanged' && e.subject === 'gate:gate_flip:HG-AUDIT-R1',
      )
      assert.equal(onDisk.length, 2, '事件轨应含首态 + 迁移两条记录（旧事件保留不重写）')
    })
  })
})
