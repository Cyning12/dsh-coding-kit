import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ADAPTERS_README = path.join(KIT, 'assets', 'ide', 'adapters', 'README.md')
const FRAGMENT = path.join(KIT, 'assets', 'harness', 'prompts', 'FRAGMENT_30_gate_verify_v1_zh.md')
const ASSETS = path.join(KIT, 'assets')
const PLACEHOLDER = '__HARNESS_GRAPH_MODULES_PATH__'

function listAll(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name)
    if (statSync(abs).isDirectory()) out.push(...listAll(abs))
    else out.push(abs)
  }
  return out
}

describe('D-DOC 1.2.4 DEF-020 · adapters README 声称未实现止血', { concurrency: 1 }, () => {
  it('adapters README 不再声称 graph_modules_path 占位替换链与 git-clean 前置检查', () => {
    const body = readFileSync(ADAPTERS_README, 'utf8')
    assert.equal(body.includes('由 sync 写入'), false, '不得再声称 sync 写 FRAGMENT 占位')
    assert.equal(body.includes('脏树易撞 S5'), false, '不得再声称 S5 脏树拦截')
    assert.equal(/\bS5\b/.test(body), false, 'S5 闸叙事不得出现于 README')
    assert.match(body, /当前不支持/, 'graph_modules_path 须明示当前不支持')
    const hits = body.split(/\r?\n/).filter((l) => /当前不支持|未接线/.test(l))
    assert.ok(hits.length >= 2, `「当前不支持/未接线」声明须 ≥2 处，实测 ${hits.length}`)
    assert.match(body, /无 git-clean 前置检查/)
  })

  it('FRAGMENT_30_gate_verify_v1_zh.md 不含永不被替换的占位符', () => {
    const body = readFileSync(FRAGMENT, 'utf8')
    assert.equal(body.includes(PLACEHOLDER), false)
    assert.equal(body.includes('HG-GRAPH-MODULES'), false, '旧包闸概念行须整行移除')
  })

  // DEF-025 · 与 DEF-020 同口径：TEMPLATE_30_gate_stop 拒开工模板的 HG-GRAPH-MODULES
  // 残留表行已整行删除（源 + skills 生成物 references 副本双侧钉死，防回潮）。
  it('TEMPLATE_30_gate_stop.md 双侧（源 + 生成物副本）不含 HG-GRAPH-MODULES 残留表行（DEF-025）', () => {
    for (const rel of [
      'assets/harness/prompts/TEMPLATE_30_gate_stop.md',
      'assets/skills/harness-20-task-audit/references/TEMPLATE_30_gate_stop.md',
    ]) {
      const body = readFileSync(path.join(KIT, rel), 'utf8')
      assert.equal(
        body.includes('HG-GRAPH-MODULES'),
        false,
        rel + ' 不得残留 HG-GRAPH-MODULES 表行（DEF-025 删行口径）',
      )
    }
  })

  it('全 assets 面无 __HARNESS_GRAPH_MODULES_PATH__ 残留', () => {
    const offenders = listAll(ASSETS).filter((abs) =>
      readFileSync(abs, 'utf8').includes(PLACEHOLDER),
    )
    assert.deepEqual(offenders.map((f) => path.relative(KIT, f)), [])
  })
})
