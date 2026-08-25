import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildGraphPayload } from '../src/cli-graph-yaml.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

function runCli(args: string[], cwd: string): { status: number | null; combined: string } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_TS, ...args],
    { encoding: 'utf8', cwd, env: { ...process.env } },
  )
  return { status: result.status, combined: String(result.stdout ?? '') + '\n' + String(result.stderr ?? '') }
}

const L0_MAIN_YAML = [
  'graph_id: "00_main"',
  'title: "DEF-032 declared id fixture"',
  'nodes:',
  '  - id: "a"',
  '    label: "A"',
  '  - id: "b"',
  '    label: "B"',
  'edges:',
  '  - from: "a"',
  '    to: "b"',
  '    label: "调用"',
  '',
].join('\n')

// DEF-031（反馈 D1）：graph yaml export 须保留全部 mark 类型的边 label。
// 拓扑协议标记（?> / ~> / ::… / […]）作为边属性（mark/type）呈现，不得丢弃 label 文本。
// DEF-032（反馈 D2/D3）：export 的 graph_id 真值源 = yaml 声明值（data.graph_id），
// 路径命名空间 id（如 l0/00_main）仅作输入兼容定位；check 与 export 产物互认。

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-graph-export-'))
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

type PayloadEdge = { from: string; to: string; mark: string; type: string; label: string }

function edgesOf(payload: Record<string, unknown>): PayloadEdge[] {
  return payload.edges as PayloadEdge[]
}

describe('DEF-031 export 保留边 label（?> / ~> / ::… / […] 四类 mark）', { concurrency: 1 }, () => {
  it('四类 mark 的 export 输出均含原 label，mark/type 语义不变', async () => {
    await withTemp(async (dir) => {
      await writeFile(
        path.join(dir, 't_label.graph.yaml'),
        [
          'graph_id: "t_label"',
          'title: "DEF-031 label fixture"',
          'nodes:',
          '  - id: "a"',
          '    label: "A"',
          '  - id: "b"',
          '    label: "B"',
          'edges:',
          '  - from: "a"',
          '    to: "b"',
          '    mark: "?>"',
          '    label: "条件成立"',
          '  - from: "a"',
          '    to: "b"',
          '    mark: "~>"',
          '    label: "异步调用"',
          '  - from: "a"',
          '    to: "b"',
          '    mark: "::triggers"',
          '    label: "触发说明"',
          '  - from: "a"',
          '    to: "b"',
          '    mark: "[ok]"',
          '    label: "成功态"',
          '',
        ].join('\n'),
        'utf8',
      )
      const payload = buildGraphPayload(dir)
      const edges = edgesOf(payload)
      assert.equal(edges.length, 4)
      const byMark = new Map(edges.map((e) => [e.mark, e]))
      assert.equal(byMark.get('?>')?.label, '条件成立', '?> 边 label 须保留')
      assert.equal(byMark.get('~>')?.label, '异步调用', '~> 边 label 须保留')
      assert.equal(byMark.get('::triggers')?.label, '触发说明', '::… 边 label 须保留')
      assert.equal(byMark.get('[ok]')?.label, '成功态', '[…] 边 label 须保留')
      // mark/type 语义不回退
      assert.equal(byMark.get('?>')?.type, 'condition')
      assert.equal(byMark.get('~>')?.type, 'async_calls')
      assert.equal(byMark.get('::triggers')?.type, 'triggers')
      assert.equal(byMark.get('[ok]')?.type, 'depends_on')
    })
  })
})

describe('DEF-032 export graph_id 声明值 + check 对齐（D2/D3）', { concurrency: 1 }, () => {
  it('D32-1: yaml 声明 graph_id=00_main（文件位于 l0/ 子目录）→ export 用声明值写 graphs/nodes/edges', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'l0'), { recursive: true })
      await writeFile(path.join(dir, 'l0', '00_main.graph.yaml'), L0_MAIN_YAML, 'utf8')
      const payload = buildGraphPayload(dir)
      const graphs = payload.graphs as { id: string }[]
      assert.deepEqual(graphs.map((g) => g.id), ['00_main'], 'graphs[].id 须为声明值而非路径命名空间 l0/00_main')
      const nodes = payload.nodes as { graph_id: string }[]
      const edges = payload.edges as { graph_id: string }[]
      assert.ok(nodes.length > 0 && nodes.every((n) => n.graph_id === '00_main'), 'nodes[].graph_id 须为声明值')
      assert.ok(edges.length > 0 && edges.every((e) => e.graph_id === '00_main'), 'edges[].graph_id 须为声明值')
    })
  })

  it('D32-2: check --all 与 kit 自产 export 产物互认（同一 id 真值源）→ PASS', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'l0'), { recursive: true })
      await writeFile(path.join(dir, 'l0', '00_main.graph.yaml'), L0_MAIN_YAML, 'utf8')
      const r1 = runCli(['graph', 'yaml', 'export', '--input', dir], dir)
      assert.equal(r1.status, 0, r1.combined)
      const r2 = runCli(['graph', 'yaml', 'check', '--all', '--input', dir], dir)
      assert.equal(r2.status, 0, r2.combined)
      assert.match(r2.combined, /OK: l0\/00_main/, r2.combined)
    })
  })
})
