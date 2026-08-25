import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { load as yamlLoad } from 'js-yaml'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const YAML = path.join(KIT, 'assets', 'harness', 'discipline-coverage.yaml')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

// DEF-005 T3 · discipline-coverage.yaml 重盘回归闸（先红后绿）。
// ① as_of_package_version 与 package.json version 一致（D3-a 重盘口径）；
// ② status: mechanical 条目 mechanism 不含台账判定「本包不存在」的机制名
//    （名单 = 2026-08-24 T1 台账快照 · 机制合入后须从名单移除）；
// ②b 旧包机制名（evaluateInvokeHatsRetention / test/skills.test.js）仅许出现在含「旧包史实」的行；
// ③ discipline show --json exit 0 且 statements 计数与 yaml 一致；show 输出含口径注记（T4）。

// T1 台账快照：以下机制名在 1.2.3 src/ 全文 grep 无匹配或已被旗标吞掉（DEF-011）
const NOT_WIRED_MECHANISMS: string[] = [
  'evaluateInvokeHatsRetention', // src/ 0 命中（旧包 close 集合闸）
  'test/skills.test.js', // 文件不存在（现行为 test/cli-*.test.ts）
  // 'verify --spec' 已合入（PRD_DEF-003 后续棒 · src/cli.ts verifySpecMode 真闸）→ 按台账纪律移出名单
  '--graph', // gate-check/verify 吞旗标（src/cli.ts#326,#384 · DEF-011）
  'E8', 'E9', 'E10', // task lint 无 E8–E10（现行 E1–E7 + W1–W4 · src/cli.ts#430-511）
]

type Statement = { id: string; status: string; mechanism: string | null; notes: string | null }
type Gap = { id: string; status: string }
type DiscYaml = {
  as_of_package_version: string
  statements: Statement[]
  gaps: Gap[]
}

function loadYaml(): DiscYaml {
  return yamlLoad(readFileSync(YAML, 'utf8')) as DiscYaml
}

function runCli(args: string[]): { status: number | null; out: string } {
  const r = spawnSync(process.execPath, ['--experimental-strip-types', CLI_TS, ...args], {
    encoding: 'utf8',
    cwd: KIT,
    env: { ...process.env },
  })
  return { status: r.status, out: `${r.stdout ?? ''}\n${r.stderr ?? ''}` }
}

describe('D-DOC 1.2.4 DEF-005 · discipline-coverage 与本包实接线对齐', { concurrency: 1 }, () => {
  it('① as_of_package_version === package.json version', () => {
    const data = loadYaml()
    const pkg = JSON.parse(readFileSync(path.join(KIT, 'package.json'), 'utf8')) as { version: string }
    assert.equal(data.as_of_package_version, pkg.version)
  })

  it('② mechanical 条目 mechanism 不含台账「不存在」机制名；status 词表合法', () => {
    const data = loadYaml()
    const allowed = new Set(['mechanical', 'partial', 'prompt-only', 'not_wired'])
    const bad: string[] = []
    for (const s of data.statements) {
      if (!allowed.has(s.status)) bad.push(`${s.id}: 未知 status ${s.status}`)
      if (s.status !== 'mechanical') continue
      const mech = s.mechanism ?? ''
      for (const tok of NOT_WIRED_MECHANISMS) {
        if (mech.includes(tok)) bad.push(`${s.id}: mechanical 但 mechanism 含未接线机制 ${tok}`)
      }
    }
    assert.deepEqual(bad, [], 'mechanical 机制失真：')
  })

  it('②b 旧包机制名仅出现于含「旧包史实」的行', () => {
    const lines = readFileSync(YAML, 'utf8').split(/\r?\n/)
    const hits = lines
      .map((text, idx) => ({ text, idx: idx + 1 }))
      .filter(({ text }) => /evaluateInvokeHatsRetention|test\/skills\.test\.js/.test(text))
      .filter(({ text }) => !text.includes('旧包史实'))
    assert.deepEqual(hits.map((h) => `#${h.idx}: ${h.text.trim().slice(0, 60)}`), [])
  })

  it('③ discipline show --json exit 0 · statements 计数与 yaml 一致 · 含口径注记', () => {
    const data = loadYaml()
    const r = runCli(['discipline', 'show', '--json'])
    assert.equal(r.status, 0, r.out)
    const parsed = JSON.parse(r.out) as { statements?: unknown[]; as_of_package_version?: string }
    assert.equal(parsed.statements?.length, data.statements.length, 'show statements 计数须与 yaml 一致')
    assert.equal(parsed.as_of_package_version, data.as_of_package_version)
    const text = runCli(['discipline', 'show'])
    assert.equal(text.status, 0, text.out)
    assert.match(text.out, /as_of: 1\.6\.0/)
    assert.match(text.out, /status 口径 = 本包实接线/, 'T4 口径注记')
  })
})
