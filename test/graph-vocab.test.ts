/**
 * 3.1 W4 · 仓级 graph-vocab 合并加载验收锁
 * 旧测影响面（20 审 N4）：additive 仓级面；既有 f1-unify / graph-* / drift / scaffold 零改语义。
 */
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { CliError } from '../src/cli-shared.ts'
import { cmdGraph } from '../src/cli-graph.ts'
import { GRAPH_VOCAB_CONFIG_REL, loadTechGraphVocab } from '../src/cli-graph-yaml.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

type RunResult = { status: number; stdout: string; stderr: string; combined: string }

function makeCore(fn: (args: string[]) => Promise<void>): (args: string[]) => Promise<RunResult> {
  return async (args) => {
    const out: string[] = []
    const err: string[] = []
    const origLog = console.log
    const origError = console.error
    const origWrite = process.stdout.write
    console.log = (...a: unknown[]) => {
      out.push(a.map(String).join(' '))
    }
    console.error = (...a: unknown[]) => {
      err.push(a.map(String).join(' '))
    }
    process.stdout.write = ((chunk: unknown) => {
      out.push(String(chunk).replace(/\n$/, ''))
      return true
    }) as typeof process.stdout.write
    let status = 0
    try {
      await fn(args)
    } catch (e) {
      if (e instanceof CliError) {
        status = e.exitCode
        if (e.message) err.push(e.message)
      } else {
        throw e
      }
    } finally {
      console.log = origLog
      console.error = origError
      process.stdout.write = origWrite
    }
    const stdout = out.length > 0 ? out.join('\n') + '\n' : ''
    const stderr = err.length > 0 ? err.join('\n') + '\n' : ''
    return { status, stdout, stderr, combined: `${stdout}\n${stderr}` }
  }
}

const runGraph = makeCore(cmdGraph)

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sw-vocab-'))
  await mkdir(path.join(dir, '.git'), { recursive: true })
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function minimalGraphYaml(opts: { graphId?: string; edgeType: string }): string {
  const graphId = opts.graphId ?? 'g1'
  return [
    `graph_id: "${graphId}"`,
    'title: "vocab fixture"',
    'nodes:',
    '  - id: "A"',
    '    label: "Alpha"',
    '  - id: "B"',
    '    label: "Beta"',
    'edges:',
    '  - from: "A"',
    '    to: "B"',
    `    type: "${opts.edgeType}"`,
    '',
  ].join('\n')
}

async function seedGraph(dir: string, edgeType: string): Promise<string> {
  const input = path.join(dir, 'docs', '_tech_graph')
  await mkdir(input, { recursive: true })
  await writeFile(path.join(input, 'g1.graph.yaml'), minimalGraphYaml({ edgeType }))
  return input
}

describe('3.1 W4 · graph vocab 仓级扩展', { concurrency: 1 }, () => {
  it('路径常量与 drift/pins 同族', () => {
    assert.equal(GRAPH_VOCAB_CONFIG_REL, '.spec-wave/graph-vocab.yaml')
  })

  it('A1 · 缺省无仓级文件 = 仅内置 · bogus_edge Warning 不咬 exit · depends_on 零 Warning', async () => {
    await withTemp(async (dir) => {
      const input = await seedGraph(dir, 'bogus_edge')
      const r = await runGraph(['yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.stderr, /\[warning\] .*edges\[0\]\.type 未在 tech-graph 词汇登记档.*bogus_edge/)

      await writeFile(path.join(input, 'g2.graph.yaml'), minimalGraphYaml({ graphId: 'g2', edgeType: 'depends_on' }))
      const ok = await runGraph(['yaml', 'compile', '--graph-id', 'g2', '--input', input, '--target', dir])
      assert.equal(ok.status, 0, ok.combined)
      assert.doesNotMatch(ok.stderr, /未在 tech-graph 词汇登记档/)
    })
  })

  it('A2 · 仓级登记 my_ext_edge → compile/check stderr 零「未在 tech-graph 词汇登记档」', async () => {
    await withTemp(async (dir) => {
      const input = await seedGraph(dir, 'my_ext_edge')
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        ['version: "1"', 'edge_types:', '  - my_ext_edge', ''].join('\n'),
      )
      const r = await runGraph(['yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.doesNotMatch(r.stderr, /未在 tech-graph 词汇登记档/)
      assert.match(r.stdout, /Generated:/)

      // check 同挂加载链（A6）
      const chk = await runGraph(['yaml', 'check', '--graph-id', 'g1', '--input', input, '--target', dir])
      // check 可能因无 graph.json 差异非 0，但不因钩② Warning 变 2；且 stderr 无未登记文案
      assert.notEqual(chk.status, 2)
      assert.doesNotMatch(chk.stderr, /未在 tech-graph 词汇登记档/)
    })
  })

  it('A3 · 同 fixture 未登记 type 仍 Warning · 不咬 exit', async () => {
    await withTemp(async (dir) => {
      const input = await seedGraph(dir, 'still_unregistered')
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        ['version: "1"', 'edge_types:', '  - my_ext_edge', ''].join('\n'),
      )
      const r = await runGraph(['yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.stderr, /\[warning\] .*still_unregistered/)
      assert.match(r.stderr, /不咬 exit/)
    })
  })

  it('A4 · 坏 YAML → exit 2 · 点名 .spec-wave/graph-vocab.yaml', async () => {
    await withTemp(async (dir) => {
      const input = await seedGraph(dir, 'depends_on')
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(path.join(dir, GRAPH_VOCAB_CONFIG_REL), 'edge_types: [\n')
      const r = await runGraph(['yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /\.spec-wave\/graph-vocab\.yaml/)
    })
  })

  it('A5 · kinds 同 id 不同 class → exit 2 · 点名冲突键', async () => {
    await withTemp(async (dir) => {
      const input = await seedGraph(dir, 'depends_on')
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        [
          'version: "1"',
          'kinds:',
          '  - id: flow',
          '    class: doc',
          '',
        ].join('\n'),
      )
      const r = await runGraph(['yaml', 'compile', '--graph-id', 'g1', '--input', input, '--target', dir])
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /flow/)
      assert.match(r.combined, /class|冲突|conflict/i)
      assert.match(r.combined, /\.spec-wave\/graph-vocab\.yaml/)
    })
  })

  it('A6 · 合并挂 compile|check：有仓级档时 loadTechGraphVocab(target) 含扩展边型', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        ['version: "1"', 'edge_types:', '  - my_ext_edge', ''].join('\n'),
      )
      const merged = loadTechGraphVocab(dir)
      assert.ok(merged.edgeTypes.includes('my_ext_edge'))
      assert.ok(merged.edgeTypes.includes('depends_on'))
      // 无 target = 仅内置
      const builtin = loadTechGraphVocab()
      assert.ok(!builtin.edgeTypes.includes('my_ext_edge'))
    })
  })

  it('edge 同名并集幂等 · 不判冲突（N1）', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        ['version: "1"', 'edge_types:', '  - depends_on', '  - my_ext_edge', ''].join('\n'),
      )
      const merged = loadTechGraphVocab(dir)
      assert.equal(merged.edgeTypes.filter((t) => t === 'depends_on').length, 1)
      assert.ok(merged.edgeTypes.includes('my_ext_edge'))
    })
  })

  it('A-opt1 · graph vocab show 列出合并后 edge_types（可选）', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_VOCAB_CONFIG_REL),
        ['version: "1"', 'edge_types:', '  - my_ext_edge', ''].join('\n'),
      )
      const help = await runGraph(['--help'])
      assert.equal(help.status, 0, help.combined)
      assert.match(help.combined, /graph vocab/)

      const r = await runGraph(['vocab', 'show', '--target', dir])
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /my_ext_edge/)
      assert.match(r.combined, /depends_on/)
    })
  })
})
