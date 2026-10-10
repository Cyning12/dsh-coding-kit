/**
 * 3.1 W1 · graph scaffold 验收锁
 * 旧测影响面（20 审 N1）：本套件 additive；既有 graph yaml 套件（cli-p0 C8 / f1-unify 等）零改语义。
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCore } from './_helpers/core-harness.ts'
import {
  FLOW_MAX_NODES,
  SCAN_MAX_DEPTH,
  SCAN_MAX_FILES,
} from '../src/cli-graph-scaffold.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function withTemp(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sw-scaffold-'))
  await mkdir(path.join(dir, '.git'), { recursive: true })
  try {
    await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function seedMiniApp(dir: string): Promise<void> {
  await mkdir(path.join(dir, 'src'), { recursive: true })
  await writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'mini', main: 'src/index.ts' }))
  await writeFile(path.join(dir, 'src/index.ts'), 'export const main = () => 1\n')
  await writeFile(path.join(dir, 'src/handler.ts'), 'export function handle() {}\n')
}

describe('3.1 W1 · graph scaffold', { concurrency: 1 }, () => {
  it('上限常量钉：深度 4 · 文件 200 · 节点 16', () => {
    assert.equal(SCAN_MAX_DEPTH, 4)
    assert.equal(SCAN_MAX_FILES, 200)
    assert.equal(FLOW_MAX_NODES, 16)
  })

  it('A1 · graph --help 列出 scaffold', async () => {
    const r = await runCore(['graph', '--help'], KIT)
    assert.equal(r.status, 0, r.combined)
    assert.match(r.combined, /graph scaffold/)
  })

  it('A2 · 无 --yes → dry-run 零写盘', async () => {
    await withTemp(async (dir) => {
      await seedMiniApp(dir)
      const r = await runCore(['graph', 'scaffold', '--target', dir], KIT)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, /dry-run/)
      assert.equal(existsSync(path.join(dir, 'docs/_tech_graph')), false)
    })
  })

  it('A3 · --yes 与 --dry-run 同现 → exit 1', async () => {
    await withTemp(async (dir) => {
      await seedMiniApp(dir)
      const r = await runCore(['graph', 'scaffold', '--target', dir, '--yes', '--dry-run'], KIT)
      assert.equal(r.status, 1, r.combined)
      assert.match(r.combined, /互斥/)
    })
  })

  it('A4 · --yes --mode full 写盘集合 + 清单 + pending 人签', async () => {
    await withTemp(async (dir) => {
      await seedMiniApp(dir)
      const r = await runCore(['graph', 'scaffold', '--target', dir, '--yes'], KIT)
      assert.equal(r.status, 0, r.combined)
      const root = path.join(dir, 'docs/_tech_graph')
      for (const f of [
        '00_main.graph.yaml',
        '01_struct.md',
        '10_flow_MAIN.graph.yaml',
        '99_mermaid_protocol.md',
        'REVIEW_CHECKLIST.md',
        '00_main.md',
        '10_flow_MAIN.md',
      ]) {
        assert.equal(existsSync(path.join(root, f)), true, f)
      }
      const struct = await readFile(path.join(root, '01_struct.md'), 'utf8')
      assert.match(struct, /scaffold_status: draft/)
      assert.match(struct, /HG-GRAPH-MODULES \|\s*pending/)
      const checklist = await readFile(path.join(root, 'REVIEW_CHECKLIST.md'), 'utf8')
      assert.match(checklist, /可审草稿|草稿/)
      assert.doesNotMatch(checklist, /自动权威/)
    })
  })

  it('A5 · struct-only：清单 + PENDING_FLOWS · 无强制 10_flow yaml', async () => {
    await withTemp(async (dir) => {
      await seedMiniApp(dir)
      const r = await runCore(
        ['graph', 'scaffold', '--target', dir, '--yes', '--mode', 'struct-only'],
        KIT,
      )
      assert.equal(r.status, 0, r.combined)
      const root = path.join(dir, 'docs/_tech_graph')
      assert.equal(existsSync(path.join(root, 'REVIEW_CHECKLIST.md')), true)
      assert.equal(existsSync(path.join(root, 'PENDING_FLOWS.md')), true)
      assert.equal(existsSync(path.join(root, '10_flow_MAIN.graph.yaml')), false)
      assert.equal(existsSync(path.join(root, '00_main.graph.yaml')), true)
    })
  })

  it('A6 · 非空拒写；--overwrite-draft 可覆写草稿', async () => {
    await withTemp(async (dir) => {
      await seedMiniApp(dir)
      const first = await runCore(['graph', 'scaffold', '--target', dir, '--yes'], KIT)
      assert.equal(first.status, 0, first.combined)
      const blocked = await runCore(['graph', 'scaffold', '--target', dir, '--yes'], KIT)
      assert.equal(blocked.status, 2, blocked.combined)
      assert.match(blocked.combined, /非空|拒写/)
      const ok = await runCore(
        ['graph', 'scaffold', '--target', dir, '--yes', '--overwrite-draft'],
        KIT,
      )
      assert.equal(ok.status, 0, ok.combined)
    })
  })

  it('A7 · --strict 轻检失败 → exit 2；默认不咬 exit', async () => {
    await withTemp(async (dir) => {
      // 无 src 等目录 → 模块 glob 零命中
      await writeFile(path.join(dir, 'README.md'), '# empty\n')
      const soft = await runCore(['graph', 'scaffold', '--target', dir, '--yes', '--no-compile'], KIT)
      assert.equal(soft.status, 0, soft.combined)
      // 清掉以便 strict 路径：用 overwrite
      const hard = await runCore(
        ['graph', 'scaffold', '--target', dir, '--yes', '--overwrite-draft', '--strict', '--no-compile'],
        KIT,
      )
      assert.equal(hard.status, 2, hard.combined)
      assert.match(hard.combined, /strict|轻检/)
    })
  })

  it('A8 · 触顶截断：清单含截断说明 · 流程节点 ≤16', async () => {
    await withTemp(async (dir) => {
      await mkdir(path.join(dir, 'src'), { recursive: true })
      await writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'big', main: 'src/index.ts' }))
      await writeFile(path.join(dir, 'src/index.ts'), 'export {}\n')
      // 制造大量 handler 文件以触发节点截断
      for (let i = 0; i < 40; i++) {
        await writeFile(path.join(dir, 'src', `handler_${i}.ts`), `export const h${i} = ${i}\n`)
      }
      const r = await runCore(['graph', 'scaffold', '--target', dir, '--yes'], KIT)
      assert.equal(r.status, 0, r.combined)
      const checklist = await readFile(path.join(dir, 'docs/_tech_graph/REVIEW_CHECKLIST.md'), 'utf8')
      assert.match(checklist, /截断|节点/)
      const flow = await readFile(path.join(dir, 'docs/_tech_graph/10_flow_MAIN.graph.yaml'), 'utf8')
      const ids = [...flow.matchAll(/^\s*- id: "([^"]+)"/gm)].map((m) => m[1])
      assert.ok(ids.length <= FLOW_MAX_NODES, `nodes=${ids.length}`)
    })
  })

  it('非法 --stack → exit 1', async () => {
    await withTemp(async (dir) => {
      const r = await runCore(['graph', 'scaffold', '--target', dir, '--stack', 'ruby'], KIT)
      assert.equal(r.status, 1, r.combined)
    })
  })
})
