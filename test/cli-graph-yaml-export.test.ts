import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { buildGraphPayload } from '../src/cli-graph-yaml.ts'

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
