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

// 旧启发式（DEF-014 过渡保留）：pyproject.toml / setup.py 存在、或任意 workflow 文件存在即视为有制品。
// 仅用于「新探测失败但旧探测通过 → WARN 不阻塞」过渡分支，下一 minor 硬化后删除。
function hasTestArtifactsLegacy(target: string): boolean {
  if (existsSync(path.join(target, 'pyproject.toml'))) return true
  if (existsSync(path.join(target, 'setup.py'))) return true
  const ciDir = path.join(target, '.github', 'workflows')
  if (existsSync(ciDir) && listWorkflowFiles(ciDir).length > 0) return true
  return false
}

export function runTestCheck(
  target: string,
  taskFile: string | undefined,
): { ok: boolean; reason: string; warn?: boolean } {
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
  if (hasTestArtifactsLegacy(target)) {
    return {
      ok: true,
      warn: true,
      reason:
        'D5: WARN 过渡 · 仅命中旧启发式探针（pyproject.toml / setup.py / 无 test 步骤的 workflow），' +
        '未检测到真实测试制品 · 本版本不阻塞，下一 minor 硬化为 FAIL · ' +
        '请补测试文件（如 *_test.py / *.test.ts）或含 test 步骤的 CI',
    }
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
