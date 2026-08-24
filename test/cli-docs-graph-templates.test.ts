import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES = path.join(KIT, 'assets', 'graph', 'templates')

// DEF-006 T4 · graph 模板与本包编译器漂移回归闸。
// 钉死四点：① 模板目录不再出现旧包脚本面（scripts/graph_yaml_compile.js 等）；
// ② 生成物 md frontmatter 为本包编译器形态（source:/generated_at，非 generated_from/generator: scripts）；
// ③ README 命令面钉 npx dsh-coding-kit graph yaml compile|check；
// ④ protocol 如实描述 check 语义（graph yaml export + graph.json 切片比对），
//    不再声称校验 md↔yaml 同步。

function templateMds(): string[] {
  return readdirSync(TEMPLATES)
    .filter((n) => n.endsWith('.md'))
    .map((n) => path.join(TEMPLATES, n))
}

describe('D-DOC 1.2.4 DEF-006 · graph 模板命令面与本包编译器对齐', { concurrency: 1 }, () => {
  it('① 模板目录无旧包脚本面残留（compile 脚本 / verify 脚本 / cp 旧包路径）', () => {
    const mds = templateMds()
    assert.ok(mds.length >= 4, `模板 md 数量异常：${mds.length}`)
    for (const abs of mds) {
      const body = readFileSync(abs, 'utf8')
      const rel = path.relative(KIT, abs)
      assert.equal(body.includes('scripts/graph_yaml_compile.js'), false, `${rel} 残留旧编译脚本名`)
      assert.equal(body.includes('verify-template-compile.sh'), false, `${rel} 残留旧校验脚本名`)
      assert.equal(/cp -R cyning-harness/.test(body), false, `${rel} 残留旧包复制源路径`)
    }
  })

  it('② 生成物 frontmatter 为本包编译器形态（source: 在、generated_from 不在）', () => {
    for (const name of ['00_main.md', '10_flow_MAIN.md']) {
      const body = readFileSync(path.join(TEMPLATES, name), 'utf8')
      assert.match(body, /^source: /m, `${name} frontmatter 须含 source: `)
      assert.match(body, /^generated_at: /m, `${name} frontmatter 须含 generated_at: `)
      assert.equal(body.includes('generated_from'), false, `${name} 不得含旧 frontmatter generated_from`)
      assert.equal(body.includes('generator: scripts'), false, `${name} 不得含旧 frontmatter generator: scripts`)
      assert.match(body, /^## Mermaid$/m, `${name} 须为本包编译器节结构（## Mermaid）`)
      assert.match(body, /^## Structured Data$/m, `${name} 须为本包编译器节结构（## Structured Data）`)
    }
  })

  it('③ README 命令面钉 npx dsh-coding-kit graph yaml compile / check / export', () => {
    const body = readFileSync(path.join(TEMPLATES, 'README.md'), 'utf8')
    assert.match(body, /npx dsh-coding-kit graph yaml compile/)
    assert.match(body, /npx dsh-coding-kit graph yaml check/)
    assert.match(body, /npx dsh-coding-kit graph yaml export/)
  })

  it('④ protocol 如实描述 check 语义（yaml↔graph.json 切片比对，非 md↔yaml 同步）', () => {
    const body = readFileSync(path.join(TEMPLATES, '99_mermaid_protocol.md'), 'utf8')
    assert.match(body, /graph yaml export/)
    assert.match(body, /graph\.json/)
    assert.match(body, /npx dsh-coding-kit graph yaml compile/)
    assert.equal(
      /检测.*\.md.*同步|\.md 与 .*\.graph\.yaml.*同步/.test(body),
      false,
      'protocol 不得再声称 check 校验 md↔yaml 同步',
    )
  })
})
