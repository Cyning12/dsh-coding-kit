import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readAsset(rel: string): string {
  return readFileSync(path.join(KIT, rel), 'utf8')
}

// task_prompts-ci-alignment（K4/K6/K7）· prompts/模板文案 grep 断言。
// 命令串真值：assets/ci/samples/lint-wiki-delta.yml.example 的 run: 行（验收钉死逐字一致）。
const LINT_CMD = 'npx --yes dsh-coding-kit task lint-wiki-delta --target .'

describe('prompts-ci-alignment · 命令串真值锚', { concurrency: 1 }, () => {
  it('CI sample run: 行仍为钉死真值（漂移则须同步 prompts 文案与本测试）', () => {
    const sample = readAsset('assets/ci/samples/lint-wiki-delta.yml.example')
    const m = /^ *run: (.+)$/m.exec(sample)
    assert.ok(m, 'CI sample 缺 run 行')
    assert.equal(m![1], LINT_CMD)
  })
})

describe('prompts-ci-alignment · W1（K4）bulk-split 早检', { concurrency: 1 }, () => {
  it('00-orchestrator 默认行为表含 bulk-split 早检行，命令串与 CI sample 逐字一致', () => {
    const body = readAsset('assets/harness/prompts/00-orchestrator.md')
    assert.ok(body.includes(LINT_CMD), '00-orchestrator 缺与 CI sample 逐字一致的 lint-wiki-delta 命令串')
    assert.match(body, /bulk-split/)
    assert.match(body, /≥2 个 active task/)
    assert.match(body, /派第一棒 30 前/)
  })

  it('10-task-requirements 含批量拆 task 预填义务与 --scope all|active 取舍', () => {
    const body = readAsset('assets/harness/prompts/10-task-requirements.md')
    assert.match(body, /批量拆 task/)
    assert.match(body, /预填/)
    assert.ok(body.includes('## Harness 元信息'), '须点名 ## Harness 元信息 节')
    assert.ok(body.includes('wiki_delta'), '须点名 wiki_delta 字段')
    assert.ok(body.includes('--scope all'), '须含 --scope all 取舍说明')
    assert.ok(body.includes('--scope active'), '须含 --scope active 取舍说明')
  })
})

describe('prompts-ci-alignment · 全域防虚构旗标', { concurrency: 1 }, () => {
  it('改动资产均无 --scope changed 等虚构旗标（仅 all|active|done 存在）', () => {
    for (const rel of [
      'assets/harness/prompts/00-orchestrator.md',
      'assets/harness/prompts/10-task-requirements.md',
      'assets/harness/prompts/20-task-audit.md',
      'assets/harness/prompts/40-self-check.md',
      'assets/harness/templates/TASK_TEMPLATE.md',
    ]) {
      assert.equal(readAsset(rel).includes('--scope changed'), false, rel + ' 含虚构旗标 --scope changed')
    }
  })
})
