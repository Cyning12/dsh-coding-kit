import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_TS = path.join(KIT, 'src', 'cli.ts')

type RunResult = {
  status: number | null
  stdout: string
  stderr: string
  combined: string
}

function runCli(args: string[], cwd = KIT): RunResult {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_TS, ...args],
    { encoding: 'utf8', cwd, env: { ...process.env } },
  )
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  return {
    status: result.status,
    stdout,
    stderr,
    combined: `${stdout}\n${stderr}`,
  }
}

// 根 usage 独有标记：任一子命令 --help 输出含其中之一即证明回退为根 usage
const ROOT_HEADER = /dsh-coding-kit CLI \(v/
const ROOT_ONLY = /gate-check/

describe('DEF-010 子命令 --help 分发（D1 方案 A：仅 argv[0] 拦截）', { concurrency: 1 }, () => {
  it('根 --help / -h / 无参数：仍输出根 usage，exit 0（行为不变）', () => {
    for (const args of [['--help'], ['-h'], []]) {
      const r = runCli(args)
      assert.equal(r.status, 0, `${args.join(' ')} → ${r.combined}`)
      assert.match(r.combined, ROOT_HEADER)
      assert.match(r.combined, /gate-check/)
      assert.match(r.combined, /skills install/)
    }
  })

  // 已有 help 分支的子命令：--help 输出各自子命令 usage，exit 0，非根 usage
  const SUBCOMMAND_HELP: Array<[string[], RegExp]> = [
    [['skills', '--help'], /skills install/],
    [['wiki', '--help'], /wiki export --json/],
    [['graph', '--help'], /graph yaml compile/],
    [['lifecycle', '--help'], /lifecycle dry-run --transition/],
    [['discipline', '--help'], /discipline show/],
    [['sync', '--help'], /sync index/],
    [['status', '--help'], /status \[--target PATH\]/],
    [['timeline', '--help'], /timeline --task FILE/],
  ]
  for (const [args, marker] of SUBCOMMAND_HELP) {
    it(`${args.join(' ')} → 子命令 usage，exit 0，非根 usage`, () => {
      const r = runCli(args)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, marker)
      assert.equal(ROOT_HEADER.test(r.combined), false, `${args[0]} --help 输出了根 usage 头`)
      assert.equal(ROOT_ONLY.test(r.combined), false, `${args[0]} --help 输出了根 usage（含 gate-check）`)
    })
  }

  // D2 推荐口径：无 help 分支命令补兜底——--help 打印各自用法并 exit 0，不触发真实业务逻辑
  const FALLBACK_HELP: Array<[string[], RegExp]> = [
    [['task', '--help'], /task lint --file/],
    [['verify', '--help'], /verify \[--target PATH\] \[--task FILE\]/],
    [['gate-check', '--help'], /gate-check \[--target PATH\] \[--task FILE\]/],
    [['audit', '--help'], /audit \[--target PATH\] \[--task FILE\]/],
    [['init', '--help'], /init \[--preset/],
    [['upgrade', '--help'], /upgrade \[--target PATH\] \[--yes\]/],
    [['check', '--help'], /check \[--target PATH\]/],
  ]
  for (const [args, marker] of FALLBACK_HELP) {
    it(`${args.join(' ')} → 各自用法，exit 0，不跑业务逻辑`, () => {
      const r = runCli(args)
      assert.equal(r.status, 0, r.combined)
      assert.match(r.combined, marker)
      assert.equal(ROOT_HEADER.test(r.combined), false, `${args[0]} --help 输出了根 usage 头`)
      assert.equal(/VERIFY:/.test(r.combined), false, `${args[0]} --help 不得执行业务输出`)
    })
  }
})
