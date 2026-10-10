/**
 * 3.1 W3 · graph drift 验收锁
 * 旧测影响面（20 审 N5）：additive 新子命令；既有 graph yaml / scaffold / axioms / ontology 零改语义。
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCore } from './_helpers/core-harness.ts'
import { MODULE_DIR_CANDIDATES } from '../src/cli-graph-scaffold.ts'
import {
  GRAPH_DRIFT_CONFIG_REL,
  globCoversModuleDir,
  parseStructModuleGlobs,
} from '../src/cli-graph-drift.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sw-drift-'))
  await mkdir(path.join(dir, '.git'), { recursive: true })
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function protocolStruct(globRows: Array<{ id: string; glob: string }>): string {
  const rows = globRows
    .map((r) => `| \`${r.id}\` | ${r.id} | \`${r.glob}\` | → | test |`)
    .join('\n')
  return `# 模块表

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
${rows}
`
}

function minimalGraphYaml(opts: {
  graphId?: string
  anchors?: Array<{ path: string }>
}): string {
  const graphId = opts.graphId ?? '00_main'
  const anchors = opts.anchors ?? [{ path: 'src/index.ts' }]
  const anchorYaml = anchors
    .map((a) => `      - path: ${JSON.stringify(a.path)}\n        symbol: "x"`)
    .join('\n')
  return `schema_version: inform_graph.v3
graph_id: "${graphId}"
title: "drift fixture"
nodes:
  - id: "A"
    label: "A"
    kind: "flow"
  - id: "B"
    label: "B"
    kind: "flow"
edges:
  - from: "A"
    to: "B"
    label: "->"
    anchors:
${anchorYaml}
`
}

async function seedCovered(dir: string, opts?: { anchors?: Array<{ path: string }> }): Promise<void> {
  await mkdir(path.join(dir, 'src'), { recursive: true })
  await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
  await writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'drift-fx' }))
  const input = path.join(dir, 'docs/_tech_graph')
  await mkdir(input, { recursive: true })
  await writeFile(path.join(input, '01_struct.md'), protocolStruct([{ id: 'src', glob: 'src/**' }]))
  await writeFile(
    path.join(input, '00_main.graph.yaml'),
    minimalGraphYaml({ anchors: opts?.anchors ?? [{ path: 'src/index.ts' }] }),
  )
}

describe('3.1 W3 · graph drift', { concurrency: 1 }, () => {
  it('钉：MODULE_DIR_CANDIDATES 与 scaffold 同族', () => {
    assert.deepEqual([...MODULE_DIR_CANDIDATES], [
      'src',
      'app',
      'api',
      'lib',
      'server',
      'web',
      'backend',
      'frontend',
      'packages',
      'services',
    ])
    assert.equal(globCoversModuleDir('src/**', 'src'), true)
    assert.equal(globCoversModuleDir('src/core/**', 'src'), true)
    assert.equal(globCoversModuleDir('app/**', 'src'), false)
  })

  it('A1 · graph --help 列出 drift', async () => {
    const r = await runCore(['graph', '--help'], KIT)
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /graph drift/)
  })

  it('A2 · 一级目录未入模块表 → exit 2 · 点名', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      // 仅覆盖 app，不覆盖 src
      await writeFile(path.join(input, '01_struct.md'), protocolStruct([{ id: 'app', glob: 'app/**' }]))
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'TBD' }] }),
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /uncovered_module_dir/)
      assert.match(r.combined, /\bsrc\b/)
    })
  })

  it('A3 · 模块表覆盖全部候选 → exit 0', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir)
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /PASS/)
    })
  })

  it('A4 · 锚点 path 消失 → exit 2 · 点名', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir, { anchors: [{ path: 'src/missing-file.ts' }] })
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /missing_anchor_path/)
      assert.match(r.combined, /src\/missing-file\.ts/)
    })
  })

  it('A5 · path 存在绿 · TBD / 空 path 不咬 exit 2', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir, {
        anchors: [{ path: 'src/index.ts' }, { path: 'TBD' }, { path: '' }],
      })
      // 空 path 在 yaml 校验可能失败；此处直接写含空与 TBD 的 yaml 绕过 compile 校验：
      // loadYaml 不强制 validate —— drift 自收集
      const input = path.join(dir, 'docs/_tech_graph')
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        `schema_version: inform_graph.v3
graph_id: "00_main"
title: "tbd"
nodes:
  - id: "A"
    label: "A"
  - id: "B"
    label: "B"
edges:
  - from: "A"
    to: "B"
    anchors:
      - path: "src/index.ts"
      - path: "TBD"
      - path: ""
`,
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.doesNotMatch(r.combined, /missing_anchor_path/)
    })
  })

  it('A6 · 白名单豁免目录 · 缺省无配置=全检 · 坏 YAML fail-closed', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      await writeFile(path.join(input, '01_struct.md'), protocolStruct([{ id: 'app', glob: 'app/**' }]))
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'TBD' }] }),
      )
      // 缺省无配置 → 红
      const red = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(red.status, 2, red.combined)
      // 豁免 src
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_DRIFT_CONFIG_REL),
        'version: 1\nexempt_dirs:\n  - src\n',
      )
      const green = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(green.status, 0, green.combined)
    })
    await withTemp(async (dir) => {
      await seedCovered(dir)
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(path.join(dir, GRAPH_DRIFT_CONFIG_REL), 'exempt_dirs: [\n')
      const bad = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(bad.status, 2, bad.combined)
      assert.match(bad.combined, /白名单|YAML/)
    })
  })

  it('A7 · --json 经 printJson · 含 drifts', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      await writeFile(path.join(input, '01_struct.md'), protocolStruct([{ id: 'app', glob: 'app/**' }]))
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'TBD' }] }),
      )
      const r = await runCore(['graph', 'drift', '--target', dir, '--json'], KIT)
      assert.equal(r.status, 2, r.combined)
      const payload = JSON.parse(r.stdout.trim()) as {
        command: string
        ok: boolean
        drifts: Array<{ kind: string; path: string }>
      }
      assert.equal(payload.command, 'graph drift')
      assert.equal(payload.ok, false)
      assert.ok(payload.drifts.some((d) => d.kind === 'uncovered_module_dir' && d.path === 'src'))
    })
  })

  it('A8 · 成功与失败路径零写盘 _tech_graph', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir)
      const input = path.join(dir, 'docs/_tech_graph')
      const before = await Promise.all(
        (await readdir(input)).map(async (f) => {
          const st = await stat(path.join(input, f))
          return [f, st.mtimeMs] as const
        }),
      )
      const ok = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(ok.status, 0, ok.combined)
      await writeFile(path.join(input, '01_struct.md'), protocolStruct([{ id: 'app', glob: 'app/**' }]))
      const failR = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(failR.status, 2, failR.combined)
      for (const [f, mtime] of before) {
        if (f === '01_struct.md') continue
        const st = await stat(path.join(input, f))
        assert.equal(st.mtimeMs, mtime, f)
      }
      assert.equal(existsSync(path.join(input, 'shared')), false)
    })
  })

  it('N2 · dogfood 旧列形兼容：模块|职责|读|写 → 覆盖 src', async () => {
    const md = `# 01

| 模块 | 职责 | 读 | 写 | 被谁调 |
|------|------|----|----|--------|
| \`cli.ts\` | CLI | 包根 | 无 | bin |
`
    const parsed = parseStructModuleGlobs(md)
    assert.equal(parsed.layout, 'dogfood_legacy')
    assert.ok(parsed.globs.some((g) => globCoversModuleDir(g, 'src')))
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(input, { recursive: true })
      await writeFile(path.join(input, '01_struct.md'), md)
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'src/index.ts' }] }),
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /dogfood_legacy/)
    })
  })

  it('fail-closed · 01_struct 缺失 → exit 2', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await mkdir(path.join(dir, 'docs/_tech_graph'), { recursive: true })
      await writeFile(
        path.join(dir, 'docs/_tech_graph/00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'TBD' }] }),
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /struct_missing/)
    })
  })

  it('零回归 · graph scaffold --help 仍在', async () => {
    const r = await runCore(['graph', '--help'], KIT)
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /graph scaffold/)
    assert.match(r.combined, /graph yaml/)
  })

  // —— 3.2 W2 · struct_rel ——
  it('W2-A1 · 无配置 / 无 struct_rel → 仍读 01_struct.md（=3.1）', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir)
      const none = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(none.status, 0, none.combined)
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(path.join(dir, GRAPH_DRIFT_CONFIG_REL), 'version: 1\nexempt_dirs: []\n')
      const noKey = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(noKey.status, 0, noKey.combined)
    })
  })

  it('W2-A2 · struct_rel: l1/01_modules.md 协议表覆盖 → 绿（相对 --input）', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(path.join(input, 'l1'), { recursive: true })
      // 故意不写 01_struct.md；模块表在 l1/
      await writeFile(
        path.join(input, 'l1/01_modules.md'),
        protocolStruct([{ id: 'src', glob: 'src/**' }]),
      )
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'src/index.ts' }] }),
      )
      // 诱饵：相对 target 同名路径若被误读会覆盖错表（不可解析）
      await mkdir(path.join(dir, 'l1'), { recursive: true })
      await writeFile(path.join(dir, 'l1/01_modules.md'), '# POINTER only\n')
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_DRIFT_CONFIG_REL),
        'version: 1\nstruct_rel: l1/01_modules.md\n',
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.doesNotMatch(r.combined, /struct_missing|struct_unparseable/)
      assert.match(r.combined, /protocol/)
    })
  })

  it('W2-A3 · struct_rel 指向不存在 → exit 2 · struct_missing', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir)
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_DRIFT_CONFIG_REL),
        'version: 1\nstruct_rel: l1/missing_modules.md\n',
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /struct_missing/)
      assert.match(r.combined, /l1\/missing_modules\.md/)
    })
  })

  it('W2-A4 · struct_rel 指向不可解析 → exit 2 · struct_unparseable', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      const input = path.join(dir, 'docs/_tech_graph')
      await mkdir(path.join(input, 'l1'), { recursive: true })
      await writeFile(path.join(input, 'l1/01_modules.md'), '# POINTER · 无模块表\n')
      await writeFile(
        path.join(input, '00_main.graph.yaml'),
        minimalGraphYaml({ anchors: [{ path: 'TBD' }] }),
      )
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_DRIFT_CONFIG_REL),
        'version: 1\nstruct_rel: l1/01_modules.md\n',
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /struct_unparseable/)
      assert.match(r.combined, /l1\/01_modules\.md/)
    })
  })

  it('W2-A5 · struct_rel 非 string → exit 2 fail-closed', async () => {
    await withTemp(async (dir) => {
      await seedCovered(dir)
      await mkdir(path.join(dir, '.spec-wave'), { recursive: true })
      await writeFile(
        path.join(dir, GRAPH_DRIFT_CONFIG_REL),
        'version: 1\nstruct_rel:\n  - not-a-string\n',
      )
      const r = await runCore(['graph', 'drift', '--target', dir], KIT)
      assert.equal(r.status, 2, r.combined)
      assert.match(r.combined, /struct_rel/)
    })
  })
})
