import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

// R-07 T5 验收（V10）：文档 grep 断言
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const README = readFileSync(path.join(KIT, 'README.md'), 'utf8')
const ADAPTERS = readFileSync(path.join(KIT, 'assets', 'ide', 'adapters', 'README.md'), 'utf8')
const CHANGELOG = readFileSync(path.join(KIT, 'CHANGELOG.md'), 'utf8')

describe('R-07 T5 文档（V10）', () => {
  it('README 新增 refresh-ide-blocks 子命令节（dry-run 默认 · S2/local 纪律 · 回滚 · 映射表）', () => {
    assert.match(README, /refresh-ide-blocks \[--target PATH\] \[--dry-run\] \[--yes\] \[--json\]/)
    assert.match(README, /### .*refresh-ide-blocks/)
    assert.match(README, /dry-run/)
    assert.match(README, /docs\/tasks\//, 'README 子命令节须声明 S2 拒写')
    assert.match(README, /cyning-harness-local:begin/, 'README 子命令节须声明 local 块不改写')
    assert.match(README, /rollback/, 'README 子命令节须含回滚说明')
    // §4 映射表入产品文档（DEC-R07-EVAL 先行条件）
    assert.match(README, /A1/)
    assert.match(README, /B5/)
    assert.match(README, /dropped_pin|钉版丢弃/)
  })

  it('adapters README#25 声明改写：指向 refresh-ide-blocks，不再绝对化「不自动刷新」', () => {
    assert.match(ADAPTERS, /refresh-ide-blocks/)
    assert.equal(
      ADAPTERS.includes('**不**自动刷新消费者仓已嵌入的 begin/end 块内命令字面'),
      false,
      '旧的绝对化「不自动刷新」表述须移除',
    )
    // 「upgrade 不写 IDE 文件（仅改写 manifest）」语义须保留
    assert.match(ADAPTERS, /upgrade.*manifest/)
  })

  it('CHANGELOG Unreleased 或最新发布节含 refresh-ide-blocks 条目（1.5.0 已归拢发布）', () => {
    // 发版时条目自 Unreleased 归拢进版本节；锚定 1.4.0 之前的所有节（Unreleased + 最新发布），跨版本自维护
    const m = CHANGELOG.match(/## \[Unreleased\][\s\S]*?(?=\n## \[1\.4\.0\])/)
    assert.ok(m, '须有 Unreleased 节')
    assert.match(m[0] ?? '', /refresh-ide-blocks/)
  })
})
