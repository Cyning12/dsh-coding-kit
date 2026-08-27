import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const README = path.join(KIT, 'README.md')
const ADAPTERS_DIR = path.join(KIT, 'assets', 'ide', 'adapters')
const ADAPTERS_README = path.join(ADAPTERS_DIR, 'README.md')
const LEGACY_NPX = 'npx @cyning/harness'

function listExampleFiles(): string[] {
  return readdirSync(ADAPTERS_DIR)
    .filter((n) => n.endsWith('.example'))
    .map((n) => path.join(ADAPTERS_DIR, n))
}

describe('1.2.2 E2 adapters + README FAQ', { concurrency: 1 }, () => {
  it('P2-1: 三 adapters .example 无现行 npx @cyning/harness；含 npx dsh-coding-kit verify', () => {
    const files = listExampleFiles()
    assert.equal(files.length, 3, '须有三个 .example')
    for (const abs of files) {
      const body = readFileSync(abs, 'utf8')
      assert.equal(
        body.includes(LEGACY_NPX),
        false,
        `${path.basename(abs)} 不得含现行 ${LEGACY_NPX}`,
      )
      assert.match(body, /npx dsh-coding-kit verify/)
    }
  })

  it('P2: adapters README 现行入口为 dsh-coding-kit；marker 可保留', () => {
    const body = readFileSync(ADAPTERS_README, 'utf8')
    assert.match(body, /npx dsh-coding-kit/)
    assert.match(body, /node_modules\/dsh-coding-kit\/assets\/ide\/adapters/)
    assert.equal(/\/path\/to\/cyning-harness\/wizard\/install\.sh/.test(body), false)
    assert.equal(
      /^cp cyning-harness\//m.test(body),
      false,
      '手工 cp 不得再以 cyning-harness/ 为现行源路径',
    )
    // marker 字符串可保留（块界，非 npx）
    assert.match(body, /cyning-harness:begin/)
    assert.match(body, /cyning-harness:end/)
  })

  it('P3-1: 根 README 钉 1.9.0；FAQ auto-install-peers=false；Prompt 围栏纪律', () => {
    const readme = readFileSync(README, 'utf8')
    assert.match(readme, /dsh-coding-kit@1\.9\.0/)
    assert.equal(/1\.2\.1\.1/.test(readme), false)
    assert.match(readme, /auto-install-peers=false/)
    assert.match(readme, /peerDependenciesMeta|optional/)
    assert.match(readme, /DSH host plugin contract|host plugin contract/)

    const m = readme.match(/````text\r?\n([\s\S]*?)\r?\n````/)
    assert.ok(m && m[1] !== undefined, '须含外层 ≥4 反引号 + text Prompt')
    const prompt = m[1]
    assert.doesNotMatch(prompt, /```/)
    assert.doesNotMatch(prompt, /~~~/)
    assert.match(prompt, /dsh-coding-kit@1\.9\.0/)
    assert.match(prompt, /version pinned at 1\.9\.0/)
  })

  it('D8: npm pack --dry-run 不含 SPEC.md；filename 含 1.9.0', () => {
    const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      encoding: 'utf8',
      cwd: KIT,
      env: { ...process.env },
    })
    assert.equal(pack.status, 0, pack.stderr || pack.stdout)
    const info = JSON.parse(pack.stdout.trim()) as Array<{
      filename?: string
      files?: Array<{ path: string }>
    }>
    const entry = Array.isArray(info) ? info[0] : info
    assert.ok(entry)
    assert.match(String(entry.filename ?? ''), /dsh-coding-kit-1\.9\.0/)
    const paths = (entry.files ?? []).map((f) => f.path)
    assert.equal(paths.some((p) => /(^|\/)SPEC\.md$/.test(p)), false)
    assert.ok(paths.some((p) => p.startsWith('bin/')))
    assert.ok(paths.some((p) => p.startsWith('lib/')))
    assert.ok(paths.some((p) => p.startsWith('assets/')))
    assert.ok(paths.includes('cordis.patch.yml'))
  })
})
