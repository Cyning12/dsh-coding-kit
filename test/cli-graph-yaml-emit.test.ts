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

describe('DEF-033 generateMermaid class 按 nodes[].kind（R6 · 无 kind 时 id 推断兜底）', { concurrency: 1 }, () => {
  const KIND_FIXTURE = {
    graph_id: 't_kind',
    title: 'DEF-033 kind fixture',
    nodes: [
      { id: 'step_a', label: '流程节点', kind: 'flow' },
      { id: 'model_x', label: '结构节点', kind: 'struct' },
      { id: 'svc_y', label: '外部服务', kind: 'external' },
      { id: 'Q', label: 'id 在白名单但 kind=external', kind: 'external' },
      { id: 'Z_DOC', label: '无 kind 文档节点（id 兜底）' },
      { id: 'plain', label: '无 kind 无推断' },
    ],
    edges: [{ from: 'step_a', to: 'model_x', label: '->' }],
  }
  const block = mermaidBlock(generateMarkdown(KIND_FIXTURE))

  it('kind=flow/struct/external 分别落 phase/doc/infra（不依赖 id 白名单）', () => {
    assert.ok(block.includes('class step_a phase'), 'kind=flow → phase（id 不在旧白名单也须落 class）')
    assert.ok(block.includes('class svc_y,Q infra'), 'kind=external → infra')
  })

  it('kind 优先于 id 白名单：Q 标 kind=external 不得落 phase', () => {
    const phaseLine = block.split('\n').find((l) => /\bclass\b.*\bphase$/.test(l)) || ''
    assert.equal(phaseLine.trim(), 'class step_a phase', 'phase 行仅含 kind=flow 节点')
    assert.ok(!/\bQ\b/.test(phaseLine), 'Q（kind=external）不得出现在 phase 行')
  })

  it('无 kind 时保留 id 推断兜底（Z_DOC → doc），无 kind 无推断不落 class', () => {
    assert.ok(block.includes('class model_x,Z_DOC doc'), 'struct + id 兜底 DOC → doc')
    for (const line of block.split('\n')) {
      if (/^\s*class\s/.test(line)) assert.ok(!/\bplain\b/.test(line), 'plain 不得落任何 class')
    }
  })
})
