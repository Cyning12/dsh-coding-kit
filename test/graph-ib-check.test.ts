/**
 * 3.2 W1 · graph ib check 验收锁
 * 旧测影响面（20 审 N3）：additive 新子命令 + 可选 IB 字段；
 * 既有 graph drift / yaml / scaffold / axioms / ontology 缺省 stdout/exit 零改语义。
 * 临时 fixture · 勿污染本仓 docs/_tech_graph dogfood。
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCore } from './_helpers/core-harness.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sw-ib-'))
  await mkdir(path.join(dir, '.git'), { recursive: true })
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function graphYaml(opts: {
  graphId?: string
  nodes?: string
}): string {
  const graphId = opts.graphId ?? '00_main'
  const nodes =
    opts.nodes ??
    `  - id: "A"
    label: "A"
    kind: "flow"
  - id: "B"
    label: "B"
    kind: "flow"`
  return `schema_version: inform_graph.v3
graph_id: "${graphId}"
title: "ib fixture"
nodes:
${nodes}
edges:
  - from: "A"
    to: "B"
    label: "->"
`
}

async function seedInput(dir: string, yamlBody: string): Promise<string> {
  const input = path.join(dir, 'docs/_tech_graph')
  await mkdir(input, { recursive: true })
  await writeFile(path.join(input, '00_main.graph.yaml'), yamlBody)
  return input
}

describe('3.2 W1 · graph ib check', { concurrency: 1 }, () => {
  it('A1 · graph --help 列出 ib check', async () => {
    const r = await runCore(['graph', '--help'], KIT)
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /graph ib check/)
  })

  it('A2 · 假 IB path → exit 2 · missing_ib_path', async () => {
    await withTemp(async (dir) => {
      await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/missing-ib.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const r = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /missing_ib_path/)
      assert.match(r.combined, /src\/missing-ib\.ts/)
    })
  })

  it('A3 · 真 IB path → exit 0', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/real.ts'), 'export {}\n')
      await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/real.ts"
      symbol: "cmdX"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const r = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /PASS/)
    })
  })

  it('A4 · 无 implementedBy → exit 0（零打扰 · checked=0）', async () => {
    await withTemp(async (dir) => {
      await seedInput(dir, graphYaml({}))
      const r = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /checked=0|checked_ib=0|checked:\s*0/i)
      assert.doesNotMatch(r.combined, /missing_ib_path/)
    })
  })

  it('A5 · TBD/空/tbd 大小写变体跳过（N1）', async () => {
    await withTemp(async (dir) => {
      await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "TBD"
  - id: "B"
    label: "B"
    kind: "flow"
    implementedBy:
      path: "tbd"
  - id: "C"
    label: "C"
    kind: "flow"
    implementedBy:
      path: ""
  - id: "D"
    label: "D"
    kind: "flow"
    implementedBy:
      path: "  "`,
        }),
      )
      const r = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.doesNotMatch(r.combined, /missing_ib_path/)
    })
  })

  it('A6 · --json 经 printJson · 含 missing_ib_path', async () => {
    await withTemp(async (dir) => {
      await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/gone.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const r = await runCore(['graph', 'ib', 'check', '--target', dir, '--json'], KIT)
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout.trim()) as {
        command: string
        ok: boolean
        issues: Array<{ kind: string; path: string }>
      }
      assert.equal(payload.command, 'graph ib check')
      assert.equal(payload.ok, false)
      assert.ok(payload.issues.some((d) => d.kind === 'missing_ib_path' && d.path === 'src/gone.ts'))
    })
  })

  it('A7 · 成功与失败路径零写盘 _tech_graph', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/real.ts'), 'export {}\n')
      const input = await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/real.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const before = await Promise.all(
        (await readdir(input)).map(async (f) => {
          const st = await stat(path.join(input, f))
          return [f, st.mtimeMs] as const
        }),
      )
      const ok = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(ok.status, 0, ok.combined)
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/missing.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const failR = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(failR.status, 2, failR.combined)
      for (const [f, mtime] of before) {
        if (f === '00_main.graph.yaml') continue
        const st = await stat(path.join(input, f))
        assert.equal(st.mtimeMs, mtime, f)
      }
      assert.equal(existsSync(path.join(input, 'shared')), false)
    })
  })

  it('A8 · 合法 IB 被 graph yaml check/compile 接受 · 透传进 graph.json（N2）', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/cli.ts'), 'export {}\n')
      const input = await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/cli.ts"
      symbol: "main"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const compile = await runCore(
        ['graph', 'yaml', 'compile', '--graph-id', '00_main', '--target', dir, '--input', input],
        KIT,
      )
      assert.equal(compile.status, 0, compile.combined)
      const exportR = await runCore(
        ['graph', 'yaml', 'export', '--input', input, '--out', path.join(input, 'shared', 'graph.json')],
        KIT,
      )
      assert.equal(exportR.status, 0, exportR.combined)
      const payload = JSON.parse(readFileSync(path.join(input, 'shared', 'graph.json'), 'utf8')) as {
        nodes: Array<{ id?: string; implementedBy?: { path?: string; symbol?: string } }>
      }
      const nodeA = payload.nodes.find((n) => n.id === 'A')
      assert.ok(nodeA?.implementedBy)
      assert.equal(nodeA?.implementedBy?.path, 'src/cli.ts')
      assert.equal(nodeA?.implementedBy?.symbol, 'main')
      const nodeB = payload.nodes.find((n) => n.id === 'B')
      assert.equal(nodeB?.implementedBy, undefined)
    })
  })

  it('fail-closed · IB 形状非法 → yaml validate / ib check 红', async () => {
    await withTemp(async (dir) => {
      const input = await seedInput(
        dir,
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy: "src/x.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }),
      )
      const check = await runCore(
        ['graph', 'yaml', 'compile', '--graph-id', '00_main', '--target', dir, '--input', input],
        KIT,
      )
      assert.notEqual(check.status, 0, check.combined)
      assert.match(check.combined, /implementedBy/)
      const ib = await runCore(['graph', 'ib', 'check', '--target', dir, '--input', input], KIT)
      assert.equal(ib.status, 2, ib.combined)
      assert.match(ib.combined, /invalid_ib_shape|implementedBy/)
    })
  })

  it('零回归 · graph drift / scaffold 仍在 help · drift 缺省不含 IB', async () => {
    const help = await runCore(['graph', '--help'], KIT)
    assert.equal(help.status, 0, help.combined)
    assert.match(help.combined, /graph drift/)
    assert.match(help.combined, /graph scaffold/)
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      await writeFile(
        path.join(input, '01_struct.md'),
        `# 模块表

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
| \`src\` | src | \`src/**\` | → | test |
`,
      )
      // 假 IB path · drift 仍应 PASS（缺省只扫边锚点）
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        graphYaml({
          nodes: `  - id: "A"
    label: "A"
    kind: "flow"
    implementedBy:
      path: "src/does-not-exist-for-ib.ts"
  - id: "B"
    label: "B"
    kind: "flow"`,
        }).replace(
          'edges:\n  - from: "A"\n    to: "B"\n    label: "->"\n',
          `edges:
  - from: "A"
    to: "B"
    label: "->"
    anchors:
      - path: "src/index.ts"
`,
        ),
      )
      const drift = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(drift.status, 0, drift.combined)
      const ib = await runCore(['graph', 'ib', 'check', '--target', dir], KIT)
      assert.equal(ib.status, 2, ib.combined)
      assert.match(ib.combined, /missing_ib_path/)
    })
  })
})
