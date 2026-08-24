import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = path.join(KIT, 'assets')

// DEF-003 阶段一 · 「声称 vs 实现」回归闸（SPEC.md §9 R-TRUTH-1 的可执行臂）。
// 词表（R5 纪律：只匹配「v2.x+ 硬闸/机械强制/机械闸/机械校验/已接线」声称句式，不匹配纯史实叙事）：
//   一行同时命中 VERSION_RE 与 CLAIM_RE = 能力声称行，必须：
//   ① 同行含「未接线」标注（先 B 止血口径）；或
//   ② 逐行落在 WIRED_CLAIMS_ANCHORS（真接线 / fail-loud 实现锚点，注释注明证据）。
const VERSION_RE = /v2\.\d+\+/
const CLAIM_RE = /硬闸|机械强制|机械闸|机械校验|已接线/
const UNWIRED_MARK = '未接线'

// DEF-005 棒已处理：20-spec-audit「verify --spec 机械闸」声称行已加「未接线」止血标注
// （prompts 源 + skills 生成物同源），实现锚点 allowlist 清空。
// DEF-026 棒：30-execute-code#35「机械校验 invoke hats 集合」声称行已加「未接线」止血标注
// （与 DEF-003 阶段一口径一致 · 接线属阶段二），词表同步扩「机械校验」关键词。
const WIRED_CLAIMS_ANCHORS: Array<{ file: string; lineIncludes: string; evidence: string }> = [
  // DEF-003 阶段二 T3：to_30 三守卫真接线（dry-run adapter 真求值 · 红→绿钉死）
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'reviews_retention · audit_D5 · task_lint 已接线（PRD_DEF-003 阶段二 T3',
    evidence: 'src/cli-lifecycle.ts evalGuard（reviews_retention/audit_D5/task_lint 真求值）· test/cli-lifecycle-guards.test.ts',
  },
  // DEF-003 阶段二 T4：verify R<n> 审查文存在性硬闸真接线（红→绿钉死）
  {
    file: 'assets/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md',
    lineIncludes: '本包已接线**（src/cli.ts cmdVerify',
    evidence: 'src/cli.ts cmdVerify findReview 硬闸 + --allow-no-review 豁免留痕 · test/cli-verify-review.test.ts',
  },
]

function listAssets(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name)
    if (statSync(abs).isDirectory()) out.push(...listAssets(abs))
    else if (/\.(md|yaml|yml|example)$/.test(name)) out.push(abs)
  }
  return out
}

describe('D-DOC 1.2.4 DEF-003 · 资产声称必须接线或明示未接线', { concurrency: 1 }, () => {
  it('v2.x+ 闸声称行必须含「未接线」标注或落在实现锚点 allowlist', () => {
    const files = listAssets(ASSETS)
    assert.ok(files.length >= 30, `扫描面文件数异常：${files.length}`)
    const violations: string[] = []
    const used = new Set<number>()
    for (const abs of files) {
      const rel = path.relative(KIT, abs)
      const lines = readFileSync(abs, 'utf8').split(/\r?\n/)
      lines.forEach((text, idx) => {
        if (!VERSION_RE.test(text) || !CLAIM_RE.test(text)) return
        if (text.includes(UNWIRED_MARK)) return
        const anchorIdx = WIRED_CLAIMS_ANCHORS.findIndex(
          (a, i) => !used.has(i) && a.file === rel && text.includes(a.lineIncludes),
        )
        if (anchorIdx >= 0) {
          used.add(anchorIdx)
        } else {
          violations.push(`${rel}#${idx + 1}: ${text.trim().slice(0, 80)}`)
        }
      })
    }
    assert.deepEqual(
      violations,
      [],
      `闸声称行缺「未接线」标注且不在实现锚点 allowlist（SPEC §9 R-TRUTH-1）：\n${violations.join('\n')}`,
    )
  })

  it('实现锚点 allowlist 每条必须真实命中（防腐化为永久豁免）', () => {
    const files = listAssets(ASSETS)
    const seen = new Set<number>()
    for (const abs of files) {
      const rel = path.relative(KIT, abs)
      const lines = readFileSync(abs, 'utf8').split(/\r?\n/)
      lines.forEach((text) => {
        WIRED_CLAIMS_ANCHORS.forEach((a, i) => {
          if (!seen.has(i) && a.file === rel && text.includes(a.lineIncludes)) seen.add(i)
        })
      })
    }
    const stale = WIRED_CLAIMS_ANCHORS.map((a, i) => ({ a, i })).filter(({ i }) => !seen.has(i))
    assert.deepEqual(stale.map(({ a }) => a.file), [], 'allowlist 存在已不命中的腐化条目')
  })

  it('DEF-003 六锚点「未接线」止血标注在位（阶段一 T1 钉死）', () => {
    const frag = readFileSync(path.join(ASSETS, 'harness', 'prompts', 'FRAGMENT_30_gate_verify_v1_zh.md'), 'utf8')
    // T4 后：#16 R<n> 审查文硬闸已接线（见 allowlist 锚点）；#18 pre-30 invoke hats 未接线标注保留（T5 范围）
    assert.ok(frag.split(/\r?\n/).filter((l) => l.includes(UNWIRED_MARK)).length >= 1, 'FRAGMENT 须 ≥1 处未接线（pre-30 invoke hats · T5 接线前保留）')
    for (const rel of [
      'assets/harness/prompts/TEMPLATE_30_gate_stop.md',
      'assets/harness/invokes/TEMPLATE_invoke.md',
      'assets/harness/lifecycle.yaml',
    ]) {
      const body = readFileSync(path.join(KIT, rel), 'utf8')
      assert.ok(body.includes(UNWIRED_MARK), `${rel} 须含未接线标注`)
      assert.ok(body.includes('PRD_DEF-003 阶段二'), `${rel} 须附接线计划指针`)
    }
  })

  it('SPEC.md 含 R-TRUTH-1 设计红线条款', () => {
    const spec = readFileSync(path.join(KIT, 'SPEC.md'), 'utf8')
    assert.match(spec, /声称的能力必须接线或明示未接线/)
    assert.match(spec, /禁止第三态/)
  })
})
