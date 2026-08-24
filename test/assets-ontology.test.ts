import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ONTO = path.join(KIT, 'assets', 'ontology.yaml')
const PKG = path.join(KIT, 'package.json')

// DEF-004 T5 · ontology.yaml 资产守卫（防同类指针漂移回归）。
// ① 文件内 ./ 相对路径均真实存在（schemas 段已移除，无悬空指针）；
// ② product_semver 与 package.json version 一致；
// ③ 全文无「harness ontology-check」死命令字样；
// ④ 公理 id 带 ONTO- 前缀，不与 graph axioms 代码公理（D2/D3/S2）撞名。

describe('D-DOC 1.2.4 DEF-004 · ontology.yaml 与包实物对齐', { concurrency: 1 }, () => {
  it('① 无 schemas 段且文件内 ./ 相对路径逐一可 resolve', () => {
    const body = readFileSync(ONTO, 'utf8')
    assert.equal(/^schemas:/m.test(body), false, 'schemas 段应已移除（DEF-004 D1-B）')
    const base = path.dirname(ONTO)
    const dangling: string[] = []
    body.split(/\r?\n/).forEach((text, idx) => {
      const re = /\.\/[\w./-]+\.(?:json|ya?ml|md)/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) {
        if (!existsSync(path.resolve(base, m[0]))) dangling.push(`#${idx + 1} -> ${m[0]}`)
      }
    })
    assert.deepEqual(dangling, [], 'ontology.yaml 内 ./ 相对路径悬空')
  })

  it('② product_semver 与 package.json version 一致', () => {
    const body = readFileSync(ONTO, 'utf8')
    const m = /^product_semver:\s*"([^"]+)"/m.exec(body)
    assert.ok(m, 'product_semver 字段缺失')
    const pkg = JSON.parse(readFileSync(PKG, 'utf8')) as { version: string }
    assert.equal(m![1], pkg.version, 'product_semver 须对齐 package.json version（DEF-004 D2-A）')
  })

  it('③ 无 harness ontology-check 死命令字样，且指向真实命令 graph axioms check', () => {
    const body = readFileSync(ONTO, 'utf8')
    assert.equal(body.includes('harness ontology-check'), false)
    assert.match(body, /graph axioms check/)
    assert.match(body, /未接线/, '须明示 ontology-check 本包未接线')
  })

  it('④ 公理 id 全带 ONTO- 前缀，无与代码公理撞名的裸 id', () => {
    const body = readFileSync(ONTO, 'utf8')
    assert.equal(/^\s+- id: (P1|S2|S5|D1|D2|D3|D7)$/m.test(body), false, '存在裸公理 id')
    const onto = body.match(/^\s+- id: ONTO-/gm) ?? []
    assert.ok(onto.length >= 6, `ONTO- 公理数异常：${onto.length}`)
    assert.match(body, /独立于 graph axioms 代码公理/)
  })
})
