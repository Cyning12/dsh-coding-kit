import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { compileGraph, generateMarkdown } from '../src/cli-graph-yaml.ts'

// DEF-023：编译器 emit 的 Mermaid 必须兼容官方语法（IDE 预览 / mermaid-cli 可渲染）。
// 语法真值：mermaid/packages/mermaid/src/docs/syntax/flowchart.md
//   § Comments（仅 %% 行注释）· § A link with arrow head and text（A-->|text|B）
//   § Special characters that break syntax（引号包裹 + entity code）
// 官网：https://mermaid.js.org/intro/syntax-reference.html · /syntax/flowchart.html

function mermaidBlock(md: string): string {
  const m = md.match(/```mermaid\n([\s\S]*?)```/)
  assert.ok(m, '生成物须含 mermaid 围栏')
  return m[1] as string
}

const FIXTURE = {
  graph_id: 't_emit',
  title: 'DEF-023 emit fixture',
  description: '特殊字符 label + 多边 + 锚点',
  nodes: [
    { id: 'client', label: '用户 / 前端' },
    { id: 'event_gen', label: 'ChatEventStreamer (SSE/WS 共享)' },
    { id: 'main_doc', label: '>../l0/00_main.md' },
    { id: 'Q', label: '查询 子流程' },
    { id: 'api', label: 'POST /api/ops/admin/sync' },
  ],
  edges: [
    {
      from: 'client',
      to: 'api',
      label: 'POST sync payload',
      anchors: [{ path: 'app/ops/admin/sync.py', line: 45 }],
    },
    { from: 'api', to: 'event_gen', label: 'general|overview "quoted"' },
    { from: 'api', to: 'main_doc', label: '->' },
    { from: 'Q', to: 'client', mark: '::triggers', type: 'triggers' },
    { from: 'event_gen', to: 'client' },
  ],
}

describe('DEF-023 generateMermaid IDE 预览兼容', { concurrency: 1 }, () => {
  const block = mermaidBlock(generateMarkdown(FIXTURE))

  it('锚点注释为 %%（Mermaid 唯一合法行注释），无 // 注释', () => {
    assert.ok(block.includes('%% → app/ops/admin/sync.py#L45'), '锚点须为 %% → path#Ln')
    assert.ok(!block.includes('// →'), '禁止 // → 注释')
    assert.ok(!/^\s*\/\//m.test(block), 'mermaid 块内禁止任何 // 行注释')
  })

  it('带标签边默认形态为 src -->|"label"| dst，禁止旧 --"…"--> 形态', () => {
    assert.ok(block.includes('client -->|"POST sync payload"| api'))
    assert.ok(!block.includes('--"'), '禁止 --"label"--> 旧边形态')
    assert.ok(!block.includes('"-->'), '禁止 --"label"--> 旧边形态')
  })

  it('label 为 "->" 或无 label 时输出裸边 -->', () => {
    assert.ok(block.includes('api --> main_doc'), 'label "->" 表示裸执行边')
    assert.ok(block.includes('event_gen --> client'), '无 label 输出裸边')
  })

  it('mark（::triggers 等）无 label 时作为边文本渲染', () => {
    assert.ok(block.includes('Q -->|"::triggers"| client'))
  })

  it('节点标签一律双引号包裹（含空格 / () / / / > 前缀）', () => {
    assert.ok(block.includes('client["用户 / 前端"]'))
    assert.ok(block.includes('event_gen["ChatEventStreamer (SSE/WS 共享)"]'))
    assert.ok(block.includes('main_doc[">../l0/00_main.md"]'))
    assert.ok(block.includes('api["POST /api/ops/admin/sync"]'))
  })

  it('子流程节点保持 [[...]] 形状且文本加引号', () => {
    assert.ok(block.includes('Q[["查询 子流程"]]'))
  })

  it('label 内 | 与 " 按 entity code 转义（#124; / #quot;）', () => {
    assert.ok(block.includes('api -->|"general#124;overview #quot;quoted#quot;"| event_gen'))
  })

  it('compile fixture：mermaid 边行数与 yaml edges 一致', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'dsh-ck-graph-'))
    try {
      const yamlPath = path.join(dir, 't_emit.graph.yaml')
      await writeFile(
        yamlPath,
        [
          'graph_id: "t_emit"',
          'title: "DEF-023 emit fixture"',
          'nodes:',
          '  - id: "client"',
          '    label: "用户 / 前端"',
          '  - id: "event_gen"',
          '    label: "ChatEventStreamer (SSE/WS 共享)"',
          '  - id: "main_doc"',
          '    label: ">../l0/00_main.md"',
          '  - id: "Q"',
          '    label: "查询 子流程"',
          '  - id: "api"',
          '    label: "POST /api/ops/admin/sync"',
          'edges:',
          '  - from: "client"',
          '    to: "api"',
          '    label: "POST sync payload"',
          '    anchors:',
          '      - path: "app/ops/admin/sync.py"',
          '        line: 45',
          '  - from: "api"',
          '    to: "event_gen"',
          '    label: "general|overview"',
          '  - from: "api"',
          '    to: "main_doc"',
          '    label: "->"',
          '  - from: "Q"',
          '    to: "client"',
          '    mark: "::triggers"',
          '    type: "triggers"',
          '  - from: "event_gen"',
          '    to: "client"',
          '',
        ].join('\n'),
        'utf8',
      )
      const outPath = compileGraph('t_emit', dir)
      const md = await readFile(outPath, 'utf8')
      const compiled = mermaidBlock(md)
      const edgeLines = compiled.split('\n').filter((l) => /^\s*\S+\s+-->/.test(l))
      assert.equal(edgeLines.length, 5, 'mermaid 边数须与 yaml edges 一致')
      assert.ok(!compiled.includes('// →'))
      assert.ok(!compiled.includes('--"'))
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
