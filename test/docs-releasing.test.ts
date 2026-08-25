import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RELEASING = path.join(KIT, 'RELEASING.md')

// DEF-001 T5 制度化（1.6.0 Wave B）：「publish 前 commit + tag」写为硬步骤 checklist。
// 红→绿钉死：RELEASING.md 存在且九步齐全有序；README en/zh-CN 各含一行链接。
describe('DEF-001 T5 · RELEASING.md 发版 checklist 制度化', { concurrency: 1 }, () => {
  it('RELEASING.md 存在且含 DEF-001 教训来源标注', () => {
    assert.equal(existsSync(RELEASING), true, '仓根缺 RELEASING.md')
    const body = readFileSync(RELEASING, 'utf8')
    assert.match(body, /DEF-001/)
    assert.match(body, /未提交工作树|工作树未提交|从未提交/)
  })

  it('九步硬 checklist 齐全且顺序正确（①干净树→⑨publish 后核验）', () => {
    const body = readFileSync(RELEASING, 'utf8')
    const steps: Array<[string, RegExp]> = [
      ['① 工作树干净且全部已提交（禁止从未提交工作树 publish）', /工作树干净/],
      ['② typecheck/test/build/test:lib 全绿', /npm run typecheck[\s\S]{0,80}npm test[\s\S]{0,80}npm run build[\s\S]{0,80}npm run test:lib/],
      ['③ CHANGELOG 版本节归拢（日期+版本号）', /CHANGELOG[\s\S]{0,120}版本节|版本节[\s\S]{0,120}CHANGELOG/],
      ['④ 版本钉 pins 同步（README 双文件/测试/ontology/discipline-coverage）', /版本钉|pins/],
      ['⑤ npm version + tag', /npm version/],
      ['⑥ PR 合并 + CI 绿', /CI[\s\S]{0,40}绿|绿[\s\S]{0,40}CI/],
      ['⑦ npm pack --dry-run 检查', /npm pack --dry-run/],
      ['⑧ npm publish 仅人执行', /npm publish[\s\S]{0,80}仅人|仅人[\s\S]{0,80}npm publish/],
      ['⑨ publish 后 npm view 核验 + 过程档状态更新', /npm view/],
    ]
    let prev = -1
    for (const [label, re] of steps) {
      const m = body.match(re)
      assert.ok(m, `checklist 缺步骤：${label}`)
      assert.ok((m.index as number) > prev, `步骤顺序颠倒：${label}`)
      prev = m.index as number
    }
    // 关键禁令钉死
    assert.match(body, /禁止从未提交工作树 publish|禁止.*未提交.*publish/)
    assert.match(body, /CI 未绿禁合|未绿.*禁.*合/)
  })

  it('README en / zh-CN 各含一行 RELEASING.md 链接', () => {
    for (const rel of ['README.md', 'README.zh-CN.md']) {
      const body = readFileSync(path.join(KIT, rel), 'utf8')
      assert.match(body, /\[RELEASING\.md\]\(RELEASING\.md\)/, `${rel} 缺 RELEASING.md 链接`)
    }
  })
})
