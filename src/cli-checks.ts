import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  extractSection,
  extractTaskSlug,
  fail,
  normalizeSlug,
  parseHarnessMeta,
  resolveTaskPath,
  STATUS_RE,
} from './cli-shared.ts'
import { WIKI_DELTA_LITERALS, WIKI_DELTA_PATHISH_RE } from './cli-task-extra.ts'

// DEF-003 阶段二 T5/T6：invoke hats 检查单一实现源（verify pre-30 硬闸与 task close 帽集合覆盖共用）。
const INVOKE_DIR_CANDIDATES = ['docs/harness/invokes/by-task', 'invokes/by-task']
const INVOKE_HAT_TOKENS = new Set(['10', '20', '22', '30', '40', '50', '00', 'close'])
// pre-30 帽词表（FRAGMENT_30_gate_verify_v1_zh.md：required ∩ {10,20,00}）
export const PRE30_HATS = ['10', '20', '00']

// 文件名口径 invoke_YYYYMMDD_<hat>[_<hat>...]_<slug>.md：hat token 仅在日期后连续段（TEMPLATE_invoke.md），
// 合并文件（如 30_40）双计。
export function extractHatsFromInvokeName(name: string): string[] {
  const base = path.basename(name, '.md')
  const parts = base.split('_')
  if (parts.length < 4 || parts[0] !== 'invoke') return []
  if (!/^\d{8}$/.test(parts[1])) return []
  const hats: string[] = []
  for (let i = 2; i < parts.length; i += 1) {
    const tok = parts[i].toLowerCase()
    if (!INVOKE_HAT_TOKENS.has(tok)) break
    hats.push(tok)
  }
  return hats
}

// required 集合解析：显式 required_invoke_hats 优先于 invoke_retention_profile；
// 缺省 default=10,30,40 · minimal=30 · full=全帽（含 CLOSE）；未知 profile 按 default 计并留痕于 source。
export function resolveRequiredInvokeHats(meta: Record<string, string>): {
  required: string[]
  source: string
} {
  const explicit = (meta.required_invoke_hats ?? '').trim()
  if (explicit) {
    const required = explicit
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return { required, source: `required_invoke_hats=${explicit}` }
  }
  const profile = (meta.invoke_retention_profile ?? '').trim() || 'default'
  if (profile === 'minimal') return { required: ['30'], source: 'invoke_retention_profile=minimal' }
  if (profile === 'full') {
    return {
      required: ['10', '20', '22', '30', '40', '50', '00', 'CLOSE'],
      source: 'invoke_retention_profile=full',
    }
  }
  const source =
    profile === 'default'
      ? 'invoke_retention_profile=default（缺省）'
      : `invoke_retention_profile=${profile}（未知值 · 按 default 计）`
  return { required: ['10', '30', '40'], source }
}

// 汇聚 docs/harness/invokes/by-task/<slug>/（及 invokes/by-task/ 备选）下全部 invoke 文件的帽 token。
export function collectInvokeHats(target: string, slug: string): Set<string> {
  const found = new Set<string>()
  const dirNames = new Set([slug, normalizeSlug(slug)])
  for (const rel of INVOKE_DIR_CANDIDATES) {
    for (const dirName of dirNames) {
      const dir = path.join(target, rel, dirName)
      if (!existsSync(dir)) continue
      let names: string[] = []
      try {
        names = readdirSync(dir)
      } catch {
        continue
      }
      for (const name of names) {
        if (!name.endsWith('.md')) continue
        for (const hat of extractHatsFromInvokeName(name)) found.add(hat)
      }
    }
  }
  return found
}

export function missingInvokeHats(target: string, slug: string, hats: string[]): string[] {
  if (hats.length === 0) return []
  const found = collectInvokeHats(target, slug)
  return hats.filter((h) => !found.has(h.toLowerCase()))
}

// DEF-003 阶段二 T5（verify pre-30 硬闸真值源）：required ∩ {10,20,00} 文件存在性。
// 缺 40 不挡 30（40 ∉ PRE30_HATS）；minimal / 显式 required 无 pre-30 帽 → preRequired=∅ → 不挡。
export function checkPre30InvokeHats(
  target: string,
  absTask: string,
): { ok: boolean; missing: string[]; preRequired: string[]; source: string } {
  const content = readFileSync(absTask, 'utf8')
  const meta = parseHarnessMeta(content)
  const { required, source } = resolveRequiredInvokeHats(meta)
  const preRequired = required.filter((h) => PRE30_HATS.includes(h))
  const slug = meta.task_slug ?? extractTaskSlug(absTask)
  const missing = missingInvokeHats(target, slug, preRequired)
  return { ok: missing.length === 0, missing, preRequired, source }
}

// ==== DEF-003 阶段二 T6：task close 守卫（lifecycle.yaml close 登记 · cmdTaskClose 与 dry-run 同一实现源） ====

export type CloseGuardOutcome = { status: 'pass' | 'fail' | 'warn'; detail: string }

export const UNCHECKED_RE = /^\s*- \[ \]/
export const CLOSE_STATUSES = new Set(['done', 'completed'])

// task 文件路径推导仓根（task close 无仓根参数 · 与 findReview 的 target 口径对齐）：
// <root>/docs/(harness/)tasks/(active|done)/<file> → <root>；非常规布局回退 task 所在目录。
export function taskTargetRoot(absTask: string): string {
  const norm = absTask.split(path.sep).join('/')
  const m = norm.match(/^(.*)\/docs\/(?:harness\/)?tasks\/(?:active|done)\/[^/]+$/)
  if (m && m[1]) return m[1]
  return path.dirname(absTask)
}

export function evalCloseSlug(absTask: string, content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const fileSlug = extractTaskSlug(absTask)
  if (!meta.task_slug) return { status: 'fail', detail: 'Harness 元信息表缺 task_slug' }
  if (normalizeSlug(meta.task_slug) !== normalizeSlug(fileSlug)) {
    return {
      status: 'fail',
      detail: `slug 不一致: 文件名 ${fileSlug} ≠ 元信息 task_slug ${meta.task_slug}`,
    }
  }
  return { status: 'pass', detail: `slug 一致（${meta.task_slug}）` }
}

export function evalCloseSelfCheck(content: string): CloseGuardOutcome {
  const selfCheck = extractSection(content, '### 自检结论', '\n##')
  if (!selfCheck) return { status: 'fail', detail: '缺 ### 自检结论 节' }
  const substantive = selfCheck
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !PLACEHOLDER_RE.test(l))
  if (substantive.length === 0) return { status: 'fail', detail: '自检结论未回填（空或纯占位符）' }
  return { status: 'pass', detail: '自检结论已回填' }
}

export function evalCloseAcceptance(content: string): CloseGuardOutcome {
  const acceptance = extractSection(content, '## 验收标准', '\n##')
  if (!acceptance) return { status: 'fail', detail: '缺 ## 验收标准 节' }
  const unchecked = acceptance.split('\n').filter((l) => UNCHECKED_RE.test(l))
  if (unchecked.length > 0) {
    return {
      status: 'fail',
      detail: `验收标准 ${unchecked.length} 项未勾选（或 --allow-unchecked 显式豁免）`,
    }
  }
  return { status: 'pass', detail: '验收标准全部勾选' }
}

export function evalCloseStatus(content: string): CloseGuardOutcome {
  const statusLine = content.split('\n').find((l) => STATUS_RE.test(l))
  const status = statusLine ? statusLine.match(STATUS_RE)?.[1]?.toLowerCase() : null
  if (!status) return { status: 'fail', detail: '未找到 > **状态** 行' }
  if (!CLOSE_STATUSES.has(status)) {
    return { status: 'fail', detail: `状态非 done/completed（当前: ${status}）` }
  }
  return { status: 'pass', detail: `状态 ${status}` }
}

// close_invoke：帽集合覆盖（required_invoke_hats 显式优先 · profile 缺省 default=10,30,40 · 合并文件名双计）
export function evalCloseInvokeHats(absTask: string, content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const { required, source } = resolveRequiredInvokeHats(meta)
  const slug = meta.task_slug ?? extractTaskSlug(absTask)
  const missing = missingInvokeHats(taskTargetRoot(absTask), slug, required)
  if (missing.length > 0) {
    return {
      status: 'fail',
      detail: `missing invoke hats: ${missing.join(',')}（${source} · 或 --allow-invoke-gap 豁免）`,
    }
  }
  return { status: 'pass', detail: `invoke hats 齐（${source}）` }
}

// close_review：R<n> 审查文存在性（findReview 与 verify / status / dry-run 同口径）
export function evalCloseReview(absTask: string): CloseGuardOutcome {
  return findReview(taskTargetRoot(absTask), absTask)
    ? { status: 'pass', detail: 'R<n> 审查文存在' }
    : {
        status: 'fail',
        detail: 'missing R<n> review（docs/harness/reviews 与 reviews/ 均无 · 或 --allow-no-review 豁免）',
      }
}

const GRAPH_DELTA_LITERALS = new Set(['none'])

// close_graph_delta（lifecycle.yaml 口径：缺字段 WARN 不挡；none 无 note / 路径不存在 BLOCK）
export function evalCloseGraphDelta(absTask: string, content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const raw = (meta.graph_delta ?? '').trim()
  if (!raw) {
    return { status: 'warn', detail: '缺 graph_delta 字段（warn · 不挡 close · 建议补 path|none）' }
  }
  if (GRAPH_DELTA_LITERALS.has(raw)) {
    if (!(meta.graph_delta_note ?? '').trim()) {
      return { status: 'fail', detail: `graph_delta=${raw} 缺 graph_delta_note 理由` }
    }
    return { status: 'pass', detail: `graph_delta=${raw}（note 在）` }
  }
  if (!existsSync(path.resolve(taskTargetRoot(absTask), raw))) {
    return { status: 'fail', detail: `graph_delta 指向不存在的图谱路径（相对仓根）: ${raw}` }
  }
  return { status: 'pass', detail: `graph_delta 路径存在（${raw}）` }
}

const KPI_TASK_SCORE_RE = /Task_KPI%:\s*\d+(?:\.\d+)?/
const KPI_D_TABLE_RE = /^\|\s*D[1-5]\s*\|/m
const KPI_FOUR_DIM_CELL_RE = /\|\s*[1-5]\s*\|/g

// close_kpi：kpi_aggregator=CLOSE（缺省同 · TASK_TEMPLATE 默认 CLOSE）时 ### KPI 节须含可解析分数
// （Task_KPI%: N / D1–D5 表 / 四维 1–5 四格评分）。
export function evalCloseKpi(content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const agg = (meta.kpi_aggregator ?? '').trim() || 'CLOSE'
  if (agg !== 'CLOSE') return { status: 'pass', detail: `kpi_aggregator=${agg}（非 CLOSE · 不闸）` }
  const section = extractSection(content, '### KPI', '\n##')
  if (!section) {
    return { status: 'fail', detail: 'kpi_aggregator=CLOSE 但缺 ### KPI 节（或 --allow-kpi-gap 豁免）' }
  }
  const body = section.split('\n').slice(1).join('\n')
  if (KPI_TASK_SCORE_RE.test(body)) return { status: 'pass', detail: 'KPI 可解析分数（Task_KPI%）' }
  if (KPI_D_TABLE_RE.test(body)) return { status: 'pass', detail: 'KPI 可解析分数（D1–D5 表）' }
  if (/四维/.test(body) && (body.match(KPI_FOUR_DIM_CELL_RE) ?? []).length >= 4) {
    return { status: 'pass', detail: 'KPI 可解析分数（四维 1–5）' }
  }
  return {
    status: 'fail',
    detail:
      'kpi_aggregator=CLOSE 但 ### KPI 节无可解析分数' +
      '（Task_KPI%: N / D1–D5 表 / 四维 1–5 · 或 --allow-kpi-gap 豁免）',
  }
}

// close_experience：experience_capture=required 硬闸（### 经验总结 须 ≥80 字或 ≥3 条列表；
// 整行圆括号占位/说明行不计入）。
export function evalCloseExperience(content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const mode = (meta.experience_capture ?? '').trim()
  if (mode !== 'required') {
    return { status: 'pass', detail: `experience_capture=${mode || 'unset'}（非 required · 不闸）` }
  }
  const section = extractSection(content, '### 经验总结', '\n##')
  if (!section) {
    return {
      status: 'fail',
      detail: 'experience_capture=required 但缺 ### 经验总结 节（或 --allow-experience-gap 豁免）',
    }
  }
  const substantive = section
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^（.*）$/.test(l))
  const items = substantive.filter((l) => /^[-*]\s+/.test(l))
  const textLen = substantive.join('').length
  if (textLen >= 80 || items.length >= 3) {
    return { status: 'pass', detail: `经验总结已回填（${textLen} 字 / ${items.length} 条）` }
  }
  return {
    status: 'fail',
    detail: 'experience_capture=required 但经验总结未达标（须 ≥80 字或 ≥3 条列表 · 或 --allow-experience-gap 豁免）',
  }
}

// close_wiki_delta（lifecycle.yaml 口径：缺字段 BLOCK；none|n/a 无 note / 路径不存在 BLOCK；
// 词表与 task lint-wiki-delta 同源 · WIKI_DELTA_LITERALS / WIKI_DELTA_PATHISH_RE）
export function evalCloseWikiDelta(absTask: string, content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const raw = (meta.wiki_delta ?? '').trim()
  if (!raw) {
    return { status: 'fail', detail: '缺 wiki_delta 字段（须 path|none|n/a · 或 --allow-wiki-gap 豁免）' }
  }
  if (WIKI_DELTA_LITERALS.has(raw)) {
    if (!(meta.wiki_delta_note ?? '').trim()) {
      return {
        status: 'fail',
        detail: `wiki_delta=${raw} 缺 wiki_delta_note 理由（或 --allow-wiki-gap 豁免）`,
      }
    }
    return { status: 'pass', detail: `wiki_delta=${raw}（note 在）` }
  }
  if (!WIKI_DELTA_PATHISH_RE.test(raw)) {
    return { status: 'fail', detail: `wiki_delta 值非法: ${raw}（须 path|none|n/a）` }
  }
  if (!existsSync(path.resolve(taskTargetRoot(absTask), raw))) {
    return {
      status: 'fail',
      detail: `wiki_delta 指向不存在的 wiki 路径（相对仓根）: ${raw}（或 --allow-wiki-gap 豁免）`,
    }
  }
  return { status: 'pass', detail: `wiki_delta 路径存在（${raw}）` }
}

// close_wiki_promotion（PRD_DEF-003 后续棒 · 语义映射旧包 @cyning/harness@2.24.0
// lib/close-loop-gates.js evaluateWikiPromotionPointer）：仅 experience_capture=required 且
// wiki_delta=path 时闸 —— ### 经验总结 节须含晋升指针（coding_wiki / wiki_promoted: / Wiki: /
// 与 wiki_delta 相同子串）。跳过口径（pass · 与旧包逐字对齐）：未声明 experience_capture /
// ≠required / 无 wiki_delta（缺字段由 close_wiki_delta 挡）/ wiki_delta=none|n/a。
// 豁免旗标与 wiki_delta 共用 --allow-wiki-gap（lifecycle.yaml 登记 · 旧包同口径降旗面）。
// 与旧包差异：经验节标题沿用本包既有约定 ### 经验总结（同 evalCloseExperience 单一抽取口径；
// 旧包额外兼容 Experience/经验/lessons 标题）。
const WIKI_PROMO_LITERAL_RE = /^(none|n\/a)$/i
export function evalCloseWikiPromotion(absTask: string, content: string): CloseGuardOutcome {
  const meta = parseHarnessMeta(content)
  const expMode = (meta.experience_capture ?? '').trim()
  if (!expMode) {
    return { status: 'pass', detail: '未声明 experience_capture · 跳过 wiki 晋升指针' }
  }
  if (expMode.toLowerCase() !== 'required') {
    return {
      status: 'pass',
      detail: `experience_capture=${expMode}（非 required · 跳过 wiki 晋升指针）`,
    }
  }
  const wikiRaw = (meta.wiki_delta ?? '').trim()
  if (!wikiRaw) {
    return { status: 'pass', detail: '无 wiki_delta · 晋升指针由 close_wiki_delta 处理' }
  }
  if (WIKI_PROMO_LITERAL_RE.test(wikiRaw)) {
    return { status: 'pass', detail: `wiki_delta=${wikiRaw} · 不要求经验节 wiki 指针` }
  }
  const section = extractSection(content, '### 经验总结', '\n##')
  if (!section) {
    return {
      status: 'fail',
      detail:
        'experience_capture=required 且 wiki_delta=path 时须有经验节并含 wiki 指针' +
        '（或 --allow-wiki-gap 豁免）',
    }
  }
  const rel = wikiRaw.replace(/^\.\/+/, '').replace(/\\/g, '/')
  const ok =
    /coding_wiki/i.test(section) ||
    /wiki_promoted\s*[:：]/i.test(section) ||
    /(?:^|\n)\s*Wiki\s*[:：]/im.test(section) ||
    (rel !== '' && section.includes(rel))
  if (!ok) {
    return {
      status: 'fail',
      detail:
        '经验节缺 wiki 晋升指针（须含 coding_wiki 路径 / wiki_promoted: / Wiki: /' +
        ' 或与 wiki_delta 相同子串 · 或 --allow-wiki-gap 豁免）',
    }
  }
  return { status: 'pass', detail: '经验节含 wiki 晋升指针' }
}

// close 守卫注册表（lifecycle.yaml close 转移登记顺序）：未登记 id → null（= 未接线 · 调用方明示，
// R-TRUTH-1 禁止第三态；登记守卫全部已接线 —— close_wiki_promotion 于 PRD_DEF-003 后续棒接线，
// to_00 spec_reviews_retention 实现见本文件 evalSpecReviewsRetention（verify --spec 同一实现源））。
export function evalCloseGuard(
  guardId: string,
  absTask: string,
  content: string,
): CloseGuardOutcome | null {
  switch (guardId) {
    case 'close_invoke':
      return evalCloseInvokeHats(absTask, content)
    case 'close_self_check':
      return evalCloseSelfCheck(content)
    case 'close_acceptance':
      return evalCloseAcceptance(content)
    case 'close_slug':
      return evalCloseSlug(absTask, content)
    case 'close_status':
      return evalCloseStatus(content)
    case 'close_review':
      return evalCloseReview(absTask)
    case 'close_graph_delta':
      return evalCloseGraphDelta(absTask, content)
    case 'close_kpi':
      return evalCloseKpi(content)
    case 'close_experience':
      return evalCloseExperience(content)
    case 'close_wiki_delta':
      return evalCloseWikiDelta(absTask, content)
    case 'close_wiki_promotion':
      return evalCloseWikiPromotion(absTask, content)
    default:
      return null
  }
}


// DEF-003 阶段二 T3/T4：verify / lifecycle dry-run / status 共用的检查实现（单一实现源，不复制逻辑）。
// 本模块由 cli.ts（verify / audit / task lint）· cli-lifecycle.ts（dry-run 守卫 adapter）·
// cli-status.ts（status 投影）三方消费。

export type LintIssue = { rule: string; message: string; line?: number }

const CHECKBOX_RE = /^\s*- \[[ xX]\]/m
const ABS_PATH_RE = /(\/(?:Users|home|root)\/[^\s/`\\]|[A-Za-z]:\\Users\\[^\s`\\])/
const KNOWN_STATUS_TOKENS = new Set([
  'draft',
  'pending',
  'in_progress',
  'active',
  'deferred',
  'done',
  'completed',
])
// 自检结论占位符（draft 期合法 · close 前须回填）；cmdTaskClose 亦用
export const PLACEHOLDER_RE = /^（[^）]*(回填|待填)[^）]*）$/

// ==== verify --spec / spec_reviews_retention（PRD_DEF-003 后续棒 · 单一实现源） ====
// 语义映射旧包 @cyning/harness@2.24.0 lib/task-meta.js findSpecReview / shouldSkipSpecAudit /
// extractSpecSlug（lib/verify.js verifySpecTarget 消费）。与旧包差异（PR body 对照）：
//   ① 目录布局与 findReview 同口径扫 docs/harness/reviews 与 reviews/ 双路径（旧包仅 docs/harness/reviews）；
//   ② 旧包 --workspace-root 第二仓根旗标本包不支持（DEF-011 fail-fast 清单既有钉死）。

// SPEC slug 推导：Harness 元信息表 spec_slug 优先；回退文件名去 SPEC[-_] 前缀与 _v<n> 版本后缀。
export function extractSpecSlug(specFile: string, content: string): string {
  const meta = content ? parseHarnessMeta(content) : {}
  if (meta.spec_slug) return meta.spec_slug
  let base = path.basename(specFile, '.md')
  base = base.replace(/^SPEC[-_]/i, '')
  base = base.replace(/_v\d+$/, '')
  return base
}

// bugfix / 显式跳过 10-spec 审计：不要求 SPEC 审查文（lifecycle.yaml to_00 守卫 note 同口径）。
// 只认元信息表 / 文首 track 行——避免命中正文里对规则的说明文字（旧包口径逐字映射）。
export function shouldSkipSpecAudit(content: string): boolean {
  if (!content) return false
  const meta = parseHarnessMeta(content)
  if (String(meta.skip_spec_audit ?? '').toLowerCase() === 'true') return true
  if (String(meta.track ?? '').toLowerCase() === 'bugfix') return true
  if (/^>\s*\*\*track\*\*[：:]\s*`?bugfix\b/im.test(content)) return true
  return false
}

// SPEC 的 R<n> 审查文存在性（verify --spec 与 lifecycle dry-run to_00 同口径）：
// 扫描 docs/harness/reviews 与 reviews/ 双路径（与 findReview 布局一致），命名兼容旧包三模式
//   1. spec_<slug>_audit_R<n>_*.md（推荐）
//   2. spec_<slug>_ACCEPT_R<n>_*.md
//   3. task_<slug>_spec_ACCEPT_R<n>_*.md
export function findSpecReview(target: string, specFile: string, content: string): boolean {
  const dirs = [path.join(target, 'docs/harness/reviews'), path.join(target, 'reviews')]
  const stripVer = (s: string) => s.replace(/_v\d+$/, '')
  const slugNorm = normalizeSlug(stripVer(extractSpecSlug(specFile, content)))
  const PATTERNS = [
    /^spec_(.+?)_audit_R\d+_.*\.md$/i,
    /^spec_(.+?)_ACCEPT_R\d+_.*\.md$/i,
    /^task_(.+?)_spec_ACCEPT_R\d+_.*\.md$/i,
  ]
  for (const reviewsDir of dirs) {
    if (!existsSync(reviewsDir)) continue
    for (const name of readdirSync(reviewsDir)) {
      for (const RE of PATTERNS) {
        const m = name.match(RE)
        if (!m) continue
        if (normalizeSlug(stripVer(m[1])) === slugNorm) return true
        break
      }
    }
  }
  return false
}

// spec_reviews_retention（lifecycle.yaml to_00 登记 · severity=block · allow=--allow-no-spec-review）：
// dry-run 的 --task 在该转移下携带待签收 SPEC 路径（非 task 文件 · 守卫 note「不挂 verify --task」）。
export function evalSpecReviewsRetention(
  target: string,
  absSpec: string,
  content: string,
): CloseGuardOutcome {
  if (shouldSkipSpecAudit(content)) {
    return { status: 'pass', detail: 'skip SPEC review gate（bugfix / skip_spec_audit 元信息豁免）' }
  }
  return findSpecReview(target, absSpec, content)
    ? {
        status: 'pass',
        detail: 'spec R<n> 审查文存在（docs/harness/reviews 或 reviews/ 命中 spec_*_audit_R<n>_* / *_ACCEPT_R<n>_*）',
      }
    : {
        status: 'fail',
        detail: 'missing spec R<n> review（docs/harness/reviews 与 reviews/ 均无 · 或 --allow-no-spec-review 豁免）',
      }
}

// R<n> 审查文存在性（DEF-003 T4 真值源）：扫描 docs/harness/reviews 与 reviews/ 双路径，
// 文件名口径 task_<slug>_audit_R<n>_*.md（slug 去 _v<n> 版本后缀）。
export function findReview(target: string, taskFile: string): boolean {
  const dirs = [path.join(target, 'docs/harness/reviews'), path.join(target, 'reviews')]
  const stripVer = (s: string) => s.replace(/_v\d+$/, '')
  const base = stripVer(path.basename(taskFile, '.md'))
  const RE = /^(task_.+?)_audit_R\d+_.*\.md$/i
  for (const reviewsDir of dirs) {
    if (!existsSync(reviewsDir)) continue
    for (const name of readdirSync(reviewsDir)) {
      const m = name.match(RE)
      if (!m) continue
      if (stripVer(m[1]) === base) return true
    }
  }
  return false
}

function walkFiles(dir: string, depth: number, acc: string[]): void {
  if (depth < 0 || !existsSync(dir)) return
  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return
  }
  for (const name of names) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = path.join(dir, name)
    acc.push(full)
    try {
      if (statSync(full).isDirectory()) walkFiles(full, depth - 1, acc)
    } catch {
      // 忽略瞬时文件
    }
  }
}

// D5 CI 测试步骤匹配模式（DEF-014）：workflow 文本命中任一模式才算「CI 含 test 步骤」
const CI_TEST_STEP_PATTERNS: RegExp[] = [
  /\bpytest\b/,
  /\bvitest\b/,
  /\bjest\b/,
  /\bnpm\s+(run\s+)?test\b/,
  /\bpnpm\s+(run\s+)?test\b/,
  /\byarn\s+test\b/,
  /\bnode\s+--test\b/,
  /\bgo\s+test\b/,
  /\bcargo\s+test\b/,
  /\btox\b/,
  /\bunittest\b/,
  /^\s*-?\s*name\s*:.*\btest\b/im,
]

function workflowHasTestStep(text: string): boolean {
  return CI_TEST_STEP_PATTERNS.some((re) => re.test(text))
}

function listWorkflowFiles(ciDir: string): string[] {
  try {
    return readdirSync(ciDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
  } catch {
    return []
  }
}

// 收紧后的 D5 探测（DEF-014）：强信号探针 + 测试文件名 + CI 含 test 步骤
function hasTestArtifacts(target: string): boolean {
  const probes = [
    'test',
    'tests',
    'spec',
    'specs',
    '__tests__',
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.js',
    'vitest.config.ts',
    'playwright.config.js',
    'playwright.config.ts',
    'cypress.config.js',
    'pytest.ini',
  ]
  for (const p of probes) {
    if (existsSync(path.join(target, p))) return true
  }
  const found: string[] = []
  walkFiles(target, 3, found)
  const testName = /\.(test|spec)\.(js|ts|mjs|cjs)$|_test\.py$|^test_.*\.py$/
  if (found.some((f) => testName.test(path.basename(f)))) return true
  const ciDir = path.join(target, '.github', 'workflows')
  if (existsSync(ciDir)) {
    for (const f of listWorkflowFiles(ciDir)) {
      try {
        if (workflowHasTestStep(readFileSync(path.join(ciDir, f), 'utf8'))) return true
      } catch {
        // 忽略不可读 workflow，继续检查其余文件
      }
    }
  }
  return false
}

// 1.5.0 硬化（DEF-014 过渡结束）：旧启发式（pyproject.toml / setup.py / 任意 workflow 存在）
// 不再放行 —— 新探测失败即 FAIL（verify BLOCKED exit 2 · audit FAIL exit 2）。
export function runTestCheck(
  target: string,
  taskFile: string | undefined,
): { ok: boolean; reason: string } {
  if (!taskFile) return { ok: true, reason: '未指定 --task，跳过 D5' }
  const abs = resolveTaskPath(target, taskFile)
  if (!existsSync(abs)) return { ok: true, reason: 'task 文件不存在，跳过 D5' }
  const content = readFileSync(abs, 'utf8')
  const meta = parseHarnessMeta(content)
  const strategy = (meta.test_strategy || '').trim()
  if (strategy !== 'required') {
    return { ok: true, reason: `test_strategy=${strategy || 'unset'}，无需 D5 强检查` }
  }
  if (hasTestArtifacts(target)) {
    return { ok: true, reason: 'test_strategy=required 且检测到测试/CI 制品' }
  }
  return {
    ok: false,
    reason: 'D5: test_strategy=required 但目标仓未声明测试路径或 CI 引用',
  }
}

export function lintTaskFile(filePath: string, cwd: string): {
  ok: boolean
  errors: LintIssue[]
  warnings: LintIssue[]
  file: string
  slug: string
} {
  const abs = path.resolve(cwd, filePath)
  if (!existsSync(abs)) fail(`task 文件不存在: ${filePath}`)
  const content = readFileSync(abs, 'utf8')
  const lines = content.split('\n')
  const errors: LintIssue[] = []
  const warnings: LintIssue[] = []
  const meta = parseHarnessMeta(content)
  if (!content.includes('## Harness 元信息')) {
    errors.push({ rule: 'E1', message: '缺 ## Harness 元信息 节' })
  } else if (!meta.task_slug) {
    errors.push({ rule: 'E1', message: 'Harness 元信息表缺 task_slug' })
  }
  const statusIdx = lines.findIndex((l) => STATUS_RE.test(l))
  if (statusIdx === -1) {
    errors.push({ rule: 'E2', message: '缺 > **状态** 行' })
  } else {
    const token = lines[statusIdx].match(STATUS_RE)?.[1]?.toLowerCase()
    if (token && !KNOWN_STATUS_TOKENS.has(token)) {
      warnings.push({ rule: 'W1', message: `状态 token 不在已知词表: ${token}`, line: statusIdx + 1 })
    }
  }
  const acceptance = extractSection(content, '## 验收标准', '\n##')
  if (!acceptance) {
    errors.push({ rule: 'E3', message: '缺 ## 验收标准 节' })
  } else if (!CHECKBOX_RE.test(acceptance)) {
    errors.push({ rule: 'E3', message: '## 验收标准 节内无任何勾选项（- [ ] / - [x]）' })
  }
  if (!lines.some((l) => /^#{2,4}\s.*(失败路径|failure_paths)/i.test(l))) {
    errors.push({ rule: 'E4', message: '缺失败路径节（## 失败路径 或 failure_paths）' })
  }
  const selfCheck = extractSection(content, '### 自检结论', '\n##')
  if (!selfCheck) {
    errors.push({ rule: 'E5', message: '缺 ### 自检结论 节' })
  } else {
    const substantive = selfCheck
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !PLACEHOLDER_RE.test(l))
    if (substantive.length === 0) {
      warnings.push({ rule: 'W3', message: '自检结论为占位符（draft 期合法 · close 前须回填）' })
    }
  }
  lines.forEach((l, i) => {
    if (ABS_PATH_RE.test(l)) {
      errors.push({ rule: 'E6', message: `绝对本机路径: ${l.trim().slice(0, 100)}`, line: i + 1 })
    }
  })
  if (meta.task_slug) {
    const fileSlug = extractTaskSlug(abs)
    if (normalizeSlug(meta.task_slug) !== normalizeSlug(fileSlug)) {
      errors.push({
        rule: 'E7',
        message: `slug 不一致: 文件名 ${fileSlug} ≠ 元信息 task_slug ${meta.task_slug}`,
      })
    }
  }
  if (!content.includes('### 人工闸')) {
    warnings.push({ rule: 'W2', message: '缺 ### 人工闸 节（轻量 task 可忽略本提醒）' })
  }
  if (!/^###\s+R0(\b|[^\d]|$)/m.test(content) && !/^#{2,3}\s+.*思考轮/m.test(content)) {
    warnings.push({
      rule: 'W4',
      message: '无思考轮节（SPEC 承载 / bugfix 轨合法豁免 · 有节则查 R0–R5 与控制表）',
    })
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    file: abs,
    slug: meta.task_slug ?? extractTaskSlug(abs),
  }
}
