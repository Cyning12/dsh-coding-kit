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

// DEF-005 棒已处理：20-spec-audit「verify --spec 机械闸」声称行曾加「未接线」止血标注；
// PRD_DEF-003 后续棒已真接线（verify --spec 真闸 · findSpecReview 单一实现源），
// prompts 源 + skills 生成物同步转「已接线」锚点（见 allowlist 末三条）。
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
  // DEF-003 阶段二 T5：verify pre-30 invoke hats 硬闸真接线（红→绿钉死）
  {
    file: 'assets/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md',
    lineIncludes: '本包已接线**（src/cli.ts cmdVerify · checkPre30InvokeHats',
    evidence: 'src/cli-checks.ts checkPre30InvokeHats + src/cli.ts cmdVerify --allow-invoke-gap 豁免留痕 · test/cli-verify-invoke-hats.test.ts',
  },
  {
    file: 'assets/harness/prompts/TEMPLATE_30_gate_stop.md',
    lineIncludes: 'pre-30 invoke（v2.14+ 硬闸 · 本包已接线）',
    evidence: '同 T5（src/cli-checks.ts checkPre30InvokeHats · test/cli-verify-invoke-hats.test.ts）',
  },
  {
    file: 'assets/skills/harness-20-task-audit/references/TEMPLATE_30_gate_stop.md',
    lineIncludes: 'pre-30 invoke（v2.14+ 硬闸 · 本包已接线）',
    evidence: '同 T5（prompts 源 + skills 生成物副本同源更新）',
  },
  // DEF-003 阶段二 T6：task close 七项守卫真接线（红→绿钉死 · cli-checks evalCloseGuard 单一实现源）
  {
    file: 'assets/harness/invokes/TEMPLATE_invoke.md',
    lineIncludes: '本包已接线**（src/cli-checks.ts evalCloseGuard close_invoke',
    evidence: 'src/cli-checks.ts evalCloseGuard + src/cli.ts cmdTaskClose · test/cli-task-close-guards.test.ts',
  },
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'required 硬闸 · v2.17+ · 本包已接线',
    evidence: 'src/cli-checks.ts evalCloseExperience · test/cli-task-close-guards.test.ts',
  },
  // PRD_DEF-003 后续棒：verify --spec 真闸交付 + to_00 spec_reviews_retention 接线（红→绿钉死）
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'spec_reviews_retention 已接线（verify --spec 真闸交付',
    evidence: 'src/cli-checks.ts findSpecReview/evalSpecReviewsRetention + src/cli-lifecycle.ts evalGuard · test/cli-verify-spec.test.ts',
  },
  {
    file: 'assets/harness/prompts/20-spec-audit.md',
    lineIncludes: '本包已接线**：`verify --spec` 真闸',
    evidence: 'src/cli.ts verifySpecMode + src/cli-checks.ts findSpecReview · test/cli-verify-spec.test.ts',
  },
  {
    file: 'assets/skills/harness-20-spec-audit/SKILL.md',
    lineIncludes: '本包已接线**：`verify --spec` 真闸',
    evidence: '同（prompts 源 + skills 生成物副本同源更新 · skills check 无 drift）',
  },
  // PRD_DEF-003 后续棒：close_wiki_promotion 真接线（红→绿钉死 · 对照旧包 @cyning/harness@2.24.0
  // lib/close-loop-gates.js evaluateWikiPromotionPointer · 与 task close / dry-run 同一实现源）
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'close_wiki_promotion 已接线（见 v2.18 行）',
    evidence: 'src/cli-checks.ts evalCloseWikiPromotion + evalCloseGuard 登记 · test/cli-task-close-guards.test.ts',
  },
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'close_wiki_promotion 已接线（PRD_DEF-003 后续棒 · 见 v2.18 行）',
    evidence: '同上（src/cli-checks.ts evalCloseWikiPromotion）',
  },
  {
    file: 'assets/harness/lifecycle.yaml',
    lineIncludes: 'close_wiki_promotion —— 已接线（PRD_DEF-003 后续棒',
    evidence: '同上（src/cli-checks.ts evalCloseWikiPromotion · test/cli-task-close-guards.test.ts 钉死）',
  },
  {
    file: 'assets/harness/prompts/30-execute-code.md',
    lineIncludes: 'wiki 晋升指针闸 close_wiki_promotion 已接线',
    evidence: '同（src/cli-checks.ts evalCloseWikiPromotion · test/cli-task-close-guards.test.ts）',
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

  it('DEF-003 「未接线」止血标注清退：后续棒全接线后残留清零 · 不得回潮（R-TRUTH-1）', () => {
    // T4/T5/T6 + 后续棒（spec_reviews_retention · close_wiki_promotion）后：全部闸声称均已接线
    // → 任何「未接线」字样残留 = 声称与实现反向漂移（陈旧标注同属 R-TRUTH-1 拦截面）
    for (const rel of [
      'assets/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md',
      'assets/harness/prompts/TEMPLATE_30_gate_stop.md',
      'assets/skills/harness-20-task-audit/references/TEMPLATE_30_gate_stop.md',
      'assets/harness/invokes/TEMPLATE_invoke.md',
      'assets/harness/lifecycle.yaml',
      'assets/harness/prompts/30-execute-code.md',
    ]) {
      const body = readFileSync(path.join(KIT, rel), 'utf8')
      assert.equal(body.includes(UNWIRED_MARK), false, `${rel} 已全接线 · 不得残留未接线标注`)
    }
  })

  it('SPEC.md 含 R-TRUTH-1 设计红线条款', () => {
    const spec = readFileSync(path.join(KIT, 'SPEC.md'), 'utf8')
    assert.match(spec, /声称的能力必须接线或明示未接线/)
    assert.match(spec, /禁止第三态/)
  })
})
