/**
 * 3.2 W3 · graph indexes check 验收锁
 * 旧测影响面（20 审 N5）：additive 新子命令；不进默认 verify；
 * 既有 graph ib / drift / yaml 缺省 stdout/exit 零改语义。
 * 临时 fixture · 勿污染本仓 docs/_tech_graph dogfood。
 */
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCore } from './_helpers/core-harness.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sw-ix-'))
  await mkdir(path.join(dir, '.git'), { recursive: true })
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function flowYaml(opts: { graphId?: string; path: string; symbol?: string }): string {
  const graphId = opts.graphId ?? '10_flow_demo'
  const sym =
    opts.symbol != null
      ? `
      symbol: "${opts.symbol}"`
      : ''
  return `schema_version: inform_graph.v3
graph_id: "${graphId}"
title: "indexes fixture"
nodes:
  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "${opts.path}"${sym}
  - id: "B"
    label: "B"
    kind: "flow"
edges:
  - from: "A"
    to: "B"
    label: "->"
`
}

async function seedConfigured(
  dir: string,
  opts: {
    flowPath?: string
    flowSymbol?: string
    indexEntries?: Array<{ path: string; symbol?: string }>
    configExtra?: string
    flowGlobs?: string[]
    indexGlobs?: string[]
    nestFlow?: boolean
  },
): Promise<void> {
  const input = path.join(dir, 'docs/_tech_graph')
  await mkdir(input, { recursive: true })
  const flowRel = opts.nestFlow
    ? 'nested/10_flow_demo.graph.yaml'
    : '10_flow_demo.graph.yaml'
  if (opts.nestFlow) await mkdir(path.join(input, 'nested'), { recursive: true })
  await writeFile(
    path.join(input, flowRel),
    flowYaml({
      path: opts.flowPath ?? 'src/cli.ts',
      symbol: opts.flowSymbol,
    }),
  )
  await mkdir(path.join(input, 'indexes'), { recursive: true })
  const entries = opts.indexEntries ?? [{ path: opts.flowPath ?? 'src/cli.ts', symbol: opts.flowSymbol }]
  const entriesYaml = entries
    .map((e) => {
      const sym = e.symbol != null ? `\n    symbol: "${e.symbol}"` : ''
      return `  - path: "${e.path}"${sym}`
    })
    .join('\n')
  await writeFile(
    path.join(input, 'indexes/by_path.yaml'),
    `entries:\n${entriesYaml}\n`,
  )
  const flowGlobs = opts.flowGlobs ?? ['10_flow_*.graph.yaml', '**/10_flow_*.graph.yaml']
  const indexGlobs = opts.indexGlobs ?? ['indexes/**/*.yaml']
  const flowYamlList = flowGlobs.map((g) => `  - "${g}"`).join('\n')
  const indexYamlList = indexGlobs.map((g) => `  - "${g}"`).join('\n')
  await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
  await writeFile(
    path.join(dir, '.spec-wave/graph-indexes.yaml'),
    `version: 1
flow_globs:
${flowYamlList}
index_globs:
${indexYamlList}
${opts.configExtra ?? ''}`,
  )
}

describe('3.2 W3 · graph indexes check', { concurrency: 1 }, () => {
  it('A1 · graph --help 列出 indexes check', async () => {
    const r = await runCore(['graph', '--help'], KIT)
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /graph indexes check/)
  })

  it('A2 · 无配置 → exit 1 usage', async () => {
    await withTemp(async (dir) => {
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /用法:|未配置|graph-indexes\.yaml/)
    })
  })

  it('A3 · 配置合法且 IB=IX → exit 0', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, { flowPath: 'src/cli.ts', flowSymbol: 'main' })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /PASS/)
    })
  })

  it('A4 · IB 多一条 → exit 2 · ib_missing_in_index', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, {
        flowPath: 'src/only-in-ib.ts',
        indexEntries: [{ path: 'src/other.ts' }],
      })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /ib_missing_in_index/)
      assert.match(r.combined, /src\/only-in-ib\.ts/)
    })
  })

  it('A5 · IX 多一条 → exit 2 · index_missing_in_ib', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, {
        flowPath: 'src/cli.ts',
        indexEntries: [
          { path: 'src/cli.ts' },
          { path: 'src/extra-in-ix.ts' },
        ],
      })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /index_missing_in_ib/)
      assert.match(r.combined, /src\/extra-in-ix\.ts/)
    })
  })

  it('A6 · 坏配置 → exit 2', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, '.spec-wave/graph-indexes.yaml'),
        `version: 1
flow_globs: "not-an-array"
index_globs:
  - "indexes/**/*.yaml"
`,
      )
      await mkdir(path.join(dir, 'docs/_tech_graph'), { recursive: true })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /flow_globs|schema|非法|非空/)
    })
  })

  it('A7 · --json 可解析差异 · 既有 ib check 零回归', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, {
        flowPath: 'src/gone.ts',
        indexEntries: [{ path: 'src/other.ts' }],
      })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir, '--json'], KIT)
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout.trim()) as {
        command: string
        ok: boolean
        issues: Array<{ kind: string; key: string }>
      }
      assert.equal(payload.command, 'graph indexes check')
      assert.equal(payload.ok, false)
      assert.ok(payload.issues.some((d) => d.kind === 'ib_missing_in_index'))

      // 无配置仓 ib check 仍可跑（零回归形态）
      const ib = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      // fixture flow 有 IB path 但文件可不存在 → ib 红；命令面仍存在且非 usage
      assert.notEqual(ib.status, 1, ib.combined)
      assert.doesNotMatch(ib.combined, /graph indexes/)
    })
  })

  it('A8 · 裸 verify 不强制跑 indexes check', async () => {
    const r = await runCore(
      ['verify', '--target', '.', '--task', 'docs/tasks/done/task_3_2_w3_graph_indexes.md'],
      KIT,
    )
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /VERIFY: PASS/)
    assert.doesNotMatch(r.combined, /graph indexes check/)
  })

  it('glob ** · 嵌套 flow 可命中', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, {
        nestFlow: true,
        flowPath: 'src/nested.ts',
        flowGlobs: ['**/10_flow_*.graph.yaml'],
        indexGlobs: ['indexes/**/*.yaml'],
      })
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
    })
  })

  it('index 非 entries 形态 → exit 2', async () => {
    await withTemp(async (dir) => {
      await seedConfigured(dir, { flowPath: 'src/cli.ts' })
      await writeFile(
        path.join(dir, 'docs/_tech_graph/indexes/by_path.yaml'),
        `- path: "src/cli.ts"\n`,
      )
      const r = await runCore(['graph', 'indexes', 'check', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /index_parse_error|entries/)
    })
  })
})
