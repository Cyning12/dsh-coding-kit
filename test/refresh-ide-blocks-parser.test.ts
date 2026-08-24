import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseBlocks } from '../src/cli-refresh-ide-blocks.ts'

// R-07 T1：块解析器纯函数单测（SPEC §3.1/§3.2 变体覆盖）
const PB = '<!-- cyning-harness:begin -->'
const PE = '<!-- cyning-harness:end -->'
const LB = '<!-- cyning-harness-local:begin -->'
const LE = '<!-- cyning-harness-local:end -->'

describe('R-07 T1 块解析器（纯函数）', () => {
  it('U1: 大小写变体不是 marker（§3.1 大小写敏感）', () => {
    const r = parseBlocks('<!-- Cyning-Harness:Begin -->\nx\n<!-- Cyning-Harness:End -->\n')
    assert.equal(r.blocks.length, 0)
    assert.equal(r.malformed, null)
  })

  it('U2: 含附加文本的行不是 marker（§3.1 无属性）', () => {
    const r = parseBlocks('<!-- cyning-harness:begin v2 -->\nx\n<!-- cyning-harness:end v2 -->\n')
    assert.equal(r.blocks.length, 0)
    assert.equal(r.malformed, null)
  })

  it('U3: 散文行内引用不构成 marker（§3.1 独立行）', () => {
    const r = parseBlocks(`散文 \`${PB}\` 引用示例\nx\n`)
    assert.equal(r.blocks.length, 0)
    assert.equal(r.malformed, null)
  })

  it('U4: 正常配对 — 块体行为 begin+1..end-1（1-based）', () => {
    const r = parseBlocks(['头', PB, 'a', 'b', PE, '尾', ''].join('\n'))
    assert.equal(r.malformed, null)
    assert.equal(r.blocks.length, 1)
    const b = r.blocks[0]
    assert.ok(b)
    assert.equal(b.kind, 'product')
    assert.equal(b.beginLine, 2)
    assert.equal(b.endLine, 5)
    assert.equal(b.bodyStart, 3)
    assert.equal(b.bodyEnd, 4)
  })

  it('U5: local 块识别并排除（product 外、自身配对合法）', () => {
    const r = parseBlocks([PB, 'a', PE, LB, 'l', LE, ''].join('\n'))
    assert.equal(r.malformed, null)
    assert.equal(r.blocks.length, 2)
    assert.equal(r.blocks[0]?.kind, 'product')
    assert.equal(r.blocks[1]?.kind, 'local')
  })

  it('U6: 嵌套 begin → MALFORMED nested_begin', () => {
    const r = parseBlocks([PB, 'a', PB, 'b', PE, ''].join('\n'))
    assert.equal(r.malformed?.kind, 'nested_begin')
    assert.equal(r.malformed?.line, 3)
  })

  it('U7: begin 无配对 end → MALFORMED unclosed_begin', () => {
    const r = parseBlocks([PB, 'a', ''].join('\n'))
    assert.equal(r.malformed?.kind, 'unclosed_begin')
    assert.equal(r.malformed?.line, 1)
  })

  it('U8: end 无配对 begin → MALFORMED unmatched_end', () => {
    const r = parseBlocks(['a', PE, ''].join('\n'))
    assert.equal(r.malformed?.kind, 'unmatched_end')
    assert.equal(r.malformed?.line, 2)
  })

  it('U9: local begin/end 落在 product 块体内 → MALFORMED local_inside_product', () => {
    const r = parseBlocks([PB, 'a', LB, 'x', LE, PE, ''].join('\n'))
    assert.equal(r.malformed?.kind, 'local_inside_product')
    assert.equal(r.malformed?.line, 3)
  })

  it('U10: 前导/尾随空白 marker 合法（整行正则 \\s* 包裹）', () => {
    const r = parseBlocks(['  ' + PB + '  ', 'a', '\t' + PE, ''].join('\n'))
    assert.equal(r.malformed, null)
    assert.equal(r.blocks.length, 1)
  })

  it('U11: 多块逐块独立', () => {
    const r = parseBlocks([PB, 'a', PE, 'x', PB, 'b', PE, ''].join('\n'))
    assert.equal(r.malformed, null)
    assert.equal(r.blocks.length, 2)
  })

  it('U12: local 自身畸形同样判整文件 MALFORMED', () => {
    const r = parseBlocks([LB, 'l', ''].join('\n'))
    assert.equal(r.malformed?.kind, 'unclosed_begin')
    const r2 = parseBlocks([LE, ''].join('\n'))
    assert.equal(r2.malformed?.kind, 'unmatched_end')
  })
})
