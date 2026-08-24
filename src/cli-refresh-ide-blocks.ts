// R-07：消费者仓 IDE marker 块旧命令字面自动刷写
// SPEC: docs/dsh_coding_kit_optimization/06_epics/PRD_R07_ide_block_rewrite.md
// 分层：T1 parseBlocks（§3 纯函数）→ T2 rewriteBody（§4 映射表）→ T3 拒写闸/备份（§6）→ T4 命令与报告（§5）
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fail, resolveTarget, takeOption } from './cli-shared.ts'

// ---------- T1：marker 块解析器（§3 冻结形态 · 纯函数 · 不写盘） ----------

// §3.1：整行精确匹配；仅 HTML 注释；大小写敏感；无属性；独立行
const PRODUCT_BEGIN_RE = /^\s*<!-- cyning-harness:begin -->\s*$/
const PRODUCT_END_RE = /^\s*<!-- cyning-harness:end -->\s*$/
const LOCAL_BEGIN_RE = /^\s*<!-- cyning-harness-local:begin -->\s*$/
const LOCAL_END_RE = /^\s*<!-- cyning-harness-local:end -->\s*$/

export type BlockKind = 'product' | 'local'

export type BlockSpan = {
  kind: BlockKind
  /** 1-based 行号（含 marker 行本身） */
  beginLine: number
  endLine: number
  /** 块体首行（1-based）；空块时 bodyStart > bodyEnd */
  bodyStart: number
  /** 块体末行（1-based，含） */
  bodyEnd: number
}

export type MalformedKind =
  | 'unclosed_begin'
  | 'unmatched_end'
  | 'nested_begin'
  | 'local_inside_product'

export type Malformed = { kind: MalformedKind; line: number }

export type ParseResult = { blocks: BlockSpan[]; malformed: Malformed | null }

// §3.2：栈式配对（顺序扫描 · 不引入 Markdown 语义）；任一畸形 → 整文件 MALFORMED（不 salvage）
export function parseBlocks(text: string): ParseResult {
  const lines = text.split('\n')
  const blocks: BlockSpan[] = []
  let state: 'outside' | 'product' | 'local' = 'outside'
  let openLine = 0
  const malformed = (kind: MalformedKind, line: number): ParseResult => ({
    blocks,
    malformed: { kind, line },
  })
  for (let i = 0; i < lines.length; i++) {
    const ln = i + 1
    const line = lines[i] ?? ''
    const isPB = PRODUCT_BEGIN_RE.test(line)
    const isPE = PRODUCT_END_RE.test(line)
    const isLB = LOCAL_BEGIN_RE.test(line)
    const isLE = LOCAL_END_RE.test(line)
    if (state === 'outside') {
      if (isPB) {
        state = 'product'
        openLine = ln
      } else if (isLB) {
        state = 'local'
        openLine = ln
      } else if (isPE || isLE) {
        return malformed('unmatched_end', ln)
      }
      continue
    }
    if (state === 'product') {
      if (isPB) return malformed('nested_begin', ln)
      if (isLB || isLE) return malformed('local_inside_product', ln)
      if (isPE) {
        blocks.push({ kind: 'product', beginLine: openLine, endLine: ln, bodyStart: openLine + 1, bodyEnd: ln - 1 })
        state = 'outside'
      }
      continue
    }
    // state === 'local'
    if (isLB || isPB) return malformed('nested_begin', ln)
    if (isPE) return malformed('unmatched_end', ln)
    if (isLE) {
      blocks.push({ kind: 'local', beginLine: openLine, endLine: ln, bodyStart: openLine + 1, bodyEnd: ln - 1 })
      state = 'outside'
    }
  }
  if (state !== 'outside') return malformed('unclosed_begin', openLine)
  return { blocks, malformed: null }
}

// §3.3：IDE 文件发现面（冻结白名单）
export function discoverIdeFiles(target: string): string[] {
  const out: string[] = []
  for (const name of ['AGENTS.md', 'CLAUDE.md']) {
    if (existsSync(path.join(target, name))) out.push(name)
  }
  const rulesDir = path.join(target, '.cursor', 'rules')
  if (existsSync(rulesDir) && statSync(rulesDir).isDirectory()) {
    for (const n of readdirSync(rulesDir)) {
      const abs = path.join(rulesDir, n)
      if (n.endsWith('.mdc') && statSync(abs).isFile()) out.push('.cursor/rules/' + n)
    }
  }
  return out.sort()
}

// ---------- T2：命令字面映射表 + 替换引擎（§4 冻结） ----------

export type RewriteRule = 'A1' | 'A2' | 'A3' | 'A4'
export type ReportRule = 'B1' | 'B2' | 'B3' | 'B4' | 'B5'
export type RewriteHit = { rule: RewriteRule; count: number; dropped_pin: boolean }
export type ReportHit = { rule: ReportRule; count: number }

// §4.1 A1–A3 并一条正则：npx( --yes)? @cyning/harness(@[0-9][^\s"']*)?；前缀级替换不校验子命令
const A_NPX_RE = /npx( --yes)? @cyning\/harness(@[0-9][^\s")']*)?(?![\w/@-])/g
// §4.1 A4：裸 bin 形态；行前缀已含 npx dsh-coding-kit 时防二刷
const A4_RE = /(?<![\w./-])harness skills (build|check)\b/g
// §6.3-2 MIXED：块体内现行字面
const CURRENT_NPX = 'npx dsh-coding-kit'

// §4.2 B 组检出正则（仅报告）
const B1_RE = /CYNING_HARNESS/g
const B2_RE = /--with-scripts/g
const B3_RE = /(?<![\w./-])wizard\/[^\s"')\]]+/g
const B4_RE = /(?<![\w.:/-])harness:[A-Za-z][\w-]*/g
const B5_PKG_RE = /@cyning\/harness/g
const B5_BARE_RE = /(?<![\w./:-])harness [a-z][a-z0-9-]*/g

export type BodyRewrite = {
  text: string
  rewrites: RewriteHit[]
  reportOnly: ReportHit[]
  /** A 组命中总数（MIXED 判定用） */
  aHits: number
}

function bump(list: RewriteHit[], rule: RewriteRule, droppedPin: boolean): void {
  const hit = list.find((h) => h.rule === rule)
  if (hit) {
    hit.count += 1
    hit.dropped_pin = hit.dropped_pin || droppedPin
  } else {
    list.push({ rule, count: 1, dropped_pin: droppedPin })
  }
}

function maskSameLength(m: string): string {
  return ' '.repeat(m.length)
}

// §4.3：纯字面替换 · 行内多处逐个 · 表外不自动改；B 组在「A 组掩蔽后」的文本上检出
export function rewriteBody(body: string): BodyRewrite {
  const rewrites: RewriteHit[] = []
  const masked = body.replace(A_NPX_RE, (m) => maskSameLength(m))
  let text = body.replace(A_NPX_RE, (_m, yes: string | undefined, pin: string | undefined) => {
    const rule: RewriteRule = yes ? 'A3' : pin ? 'A2' : 'A1'
    bump(rewrites, rule, Boolean(pin))
    return 'npx' + (yes ?? '') + ' dsh-coding-kit'
  })
  // A4 逐行处理（防二刷看行前缀）；命中同步掩蔽供 B5 排除
  const maskedLines = masked.split('\n')
  text = text
    .split('\n')
    .map((line, i) => {
      let mline = maskedLines[i] ?? ''
      const out = line.replace(A4_RE, (m, sub: string, offset: number) => {
        if (line.slice(0, offset).includes(CURRENT_NPX)) return m // §4.1 A4 防二刷
        bump(rewrites, 'A4', false)
        mline = mline.replace(m, maskSameLength(m))
        return CURRENT_NPX + ' skills ' + sub
      })
      maskedLines[i] = mline
      return out
    })
    .join('\n')
  const masked2 = maskedLines.join('\n')

  const countOf = (re: RegExp): number => (masked2.match(re) ?? []).length
  const reportOnly: ReportHit[] = []
  const pushReport = (rule: ReportRule, count: number): void => {
    if (count > 0) reportOnly.push({ rule, count })
  }
  pushReport('B1', countOf(B1_RE))
  pushReport('B2', countOf(B2_RE))
  pushReport('B3', countOf(B3_RE))
  pushReport('B4', countOf(B4_RE))
  pushReport('B5', countOf(B5_PKG_RE) + countOf(B5_BARE_RE))
  const aHits = rewrites.reduce((s, h) => s + h.count, 0)
  return { text, rewrites, reportOnly, aHits }
}

// ---------- 单文件扫描（T1+T2 组合 · 仍纯函数） ----------

export type FileStatus = 'ok' | 'mixed' | 'malformed' | 'skipped_local'

export type FileScan = {
  path: string
  blocks: number
  status: FileStatus
  rewrites: RewriteHit[]
  reportOnly: ReportHit[]
  skippedLocalBlocks: number
  malformed: Malformed | null
  /** MIXED 时块内现行字面所在行号（1-based，文件级） */
  mixedLines: number[]
  /** 有 A 组替换时的新全文；无变更为 undefined */
  newText?: string
}

export function scanIdeFile(rel: string, text: string): FileScan {
  const parsed = parseBlocks(text)
  const productBlocks = parsed.blocks.filter((b) => b.kind === 'product')
  const localBlocks = parsed.blocks.filter((b) => b.kind === 'local')
  const base: FileScan = {
    path: rel,
    blocks: productBlocks.length,
    status: 'ok',
    rewrites: [],
    reportOnly: [],
    skippedLocalBlocks: localBlocks.length,
    malformed: parsed.malformed,
    mixedLines: [],
  }
  if (parsed.malformed) {
    base.status = 'malformed'
    return base
  }
  const lines = text.split('\n')
  const rewrites = new Map<RewriteRule, RewriteHit>()
  const reports = new Map<ReportRule, number>()
  const mixedLines: number[] = []
  let aHits = 0
  let hasCurrent = false
  for (const b of productBlocks) {
    if (b.bodyStart > b.bodyEnd) continue
    const body = lines.slice(b.bodyStart - 1, b.bodyEnd).join('\n')
    const r = rewriteBody(body)
    aHits += r.aHits
    for (const h of r.rewrites) {
      const cur = rewrites.get(h.rule)
      if (cur) {
        cur.count += h.count
        cur.dropped_pin = cur.dropped_pin || h.dropped_pin
      } else {
        rewrites.set(h.rule, { ...h })
      }
    }
    for (const h of r.reportOnly) reports.set(h.rule, (reports.get(h.rule) ?? 0) + h.count)
    // MIXED 行号：块体内现行字面——必须看替换前的原始行（替换后必然含 CURRENT_NPX，会假阳性）
    const origBodyLines = lines.slice(b.bodyStart - 1, b.bodyEnd)
    for (let k = 0; k < origBodyLines.length; k++) {
      if ((origBodyLines[k] ?? '').includes(CURRENT_NPX)) {
        hasCurrent = true
        mixedLines.push(b.bodyStart + k)
      }
    }
    lines.splice(b.bodyStart - 1, b.bodyEnd - b.bodyStart + 1, ...r.text.split('\n'))
  }
  base.rewrites = [...rewrites.values()]
  base.reportOnly = [...reports.entries()].map(([rule, count]) => ({ rule, count }))
  if (aHits > 0 && hasCurrent) {
    base.status = 'mixed'
    base.mixedLines = mixedLines
  } else if (productBlocks.length === 0 && localBlocks.length > 0) {
    base.status = 'skipped_local'
  }
  if (aHits > 0) base.newText = lines.join('\n')
  return base
}

// ---------- T3：拒写闸与安全（§6） ----------

// §6.1 S2 拒写前缀（真值 SPEC 1.2.2 #286）
const S2_RE = /(^|[\\/])docs[\\/](tasks|harness[\\/]reviews|harness[\\/]invokes[\\/]by-task)([\\/]|$)/

function assertNotS2(absPath: string): void {
  const norm = path.resolve(absPath)
  if (S2_RE.test(norm)) {
    fail('refresh-ide-blocks: 拒写 · 路径落在 S2 前缀下（docs/tasks · docs/harness/reviews · docs/harness/invokes/by-task）: ' + norm, 2)
  }
}

export type GitState = 'clean' | 'dirty' | 'none'

export function gitState(target: string): GitState {
  try {
    const out = execFileSync('git', ['-C', target, 'status', '--porcelain'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return out.trim() ? 'dirty' : 'clean'
  } catch {
    return 'none'
  }
}

const BACKUP_KEEP = 5 // §12 裁定：备份维持 5 代

function backupsRoot(target: string): string {
  return path.join(target, '.cyning-harness', 'backups', 'refresh-ide-blocks')
}

// §6.5：写盘前原字节复制到 .cyning-harness/backups/refresh-ide-blocks/<UTCts>/<相对路径>
function backupFile(target: string, genDir: string, rel: string): string {
  const src = path.join(target, rel)
  const dest = path.join(genDir, rel)
  mkdirSync(path.dirname(dest), { recursive: true })
  copyFileSync(src, dest)
  return dest
}

// §6.3-4：单文件 tmp+rename 原子写
function atomicWrite(abs: string, body: string): void {
  const tmp = abs + '.tmp-refresh-' + process.pid
  writeFileSync(tmp, body, 'utf8')
  renameSync(tmp, abs)
}

// §6.5：写盘成功后保留最近 5 代时间戳目录
function pruneBackups(target: string): void {
  const root = backupsRoot(target)
  if (!existsSync(root)) return
  const gens = readdirSync(root)
    .filter((n) => statSync(path.join(root, n)).isDirectory())
    .sort()
  for (const old of gens.slice(0, Math.max(0, gens.length - BACKUP_KEEP))) {
    rmSync(path.join(root, old), { recursive: true, force: true })
  }
}

// ---------- T4：命令接线与报告（§5） ----------

const REPORT_SCHEMA = 'dsh-coding-kit/refresh-ide-blocks-report@1'

type ReportFile = {
  path: string
  blocks: number
  status: FileStatus
  rewrites: RewriteHit[]
  report_only: ReportHit[]
  skipped_local_blocks: number
  written: boolean
  backup: string | null
}

type Report = {
  schema: string
  target: string
  mode: 'dry-run' | 'apply'
  git: GitState
  files: ReportFile[]
  totals: {
    files_scanned: number
    product_blocks: number
    rewrites: number
    report_only: number
    files_written: number
  }
  exit: 0
}

const A_LABEL: Record<RewriteRule, string> = {
  A1: 'npx @cyning/harness → npx dsh-coding-kit',
  A2: 'npx @cyning/harness@<version> → npx dsh-coding-kit（钉版丢弃）',
  A3: 'npx --yes @cyning/harness[@<version>] → npx --yes dsh-coding-kit',
  A4: 'harness skills build|check → npx dsh-coding-kit skills build|check',
}
const B_LABEL: Record<ReportRule, string> = {
  B1: 'CYNING_HARNESS env 名（需人工删改）',
  B2: '--with-scripts 旗标（需人工删改）',
  B3: 'wizard/ 路径引用（需人工删改）',
  B4: 'harness:<name> npm script 名（需人工删改）',
  B5: '其他裸 @cyning/harness 引用（需人工删改）',
}
const MALFORMED_LABEL: Record<MalformedKind, string> = {
  unclosed_begin: 'begin 无配对 end',
  unmatched_end: 'end 无配对 begin',
  nested_begin: '嵌套 begin',
  local_inside_product: 'local marker 落在 product 块体内',
}

function printHumanReport(report: Report, scans: FileScan[]): void {
  console.log('=== refresh-ide-blocks (' + report.mode + ') ===')
  console.log('目标: ' + report.target)
  console.log('git: ' + report.git)
  for (const f of report.files) {
    const scan = scans.find((s) => s.path === f.path)
    const mal = scan?.malformed ? '（' + MALFORMED_LABEL[scan.malformed.kind] + '@L' + scan.malformed.line + '）' : ''
    const mix = scan && scan.mixedLines.length > 0 ? '（现行字面行: ' + scan.mixedLines.map((n) => 'L' + n).join(',') + '）' : ''
    console.log('文件: ' + f.path)
    console.log('  块: ' + f.blocks + ' · 状态: ' + f.status + mal + mix)
    for (const h of f.rewrites) {
      console.log('  ' + h.rule + ' ' + A_LABEL[h.rule] + ': ' + h.count + (h.dropped_pin ? '（dropped_pin）' : ''))
    }
    for (const h of f.report_only) {
      console.log('  ' + h.rule + ' ' + B_LABEL[h.rule] + ': ' + h.count)
    }
    if (f.skipped_local_blocks > 0) console.log('  跳过 local 块: ' + f.skipped_local_blocks)
    if (report.mode === 'dry-run') {
      if (f.rewrites.length > 0 && f.status !== 'malformed') console.log('  计划写入（dry-run 未写盘）')
    } else if (f.written) {
      console.log('  已写入（备份: ' + (f.backup ?? 'n/a') + '）')
    }
  }
  const t = report.totals
  console.log('汇总: files_scanned=' + t.files_scanned + ' product_blocks=' + t.product_blocks + ' rewrites=' + t.rewrites + ' report_only=' + t.report_only + ' files_written=' + t.files_written)
  console.log('回滚: git checkout -- <path>（干净树 preflight 保证 git 可用时 diff 即回滚面）；非 git 仓以备份 cp 回（.cyning-harness/backups/refresh-ide-blocks/）')
}

export async function cmdRefreshIdeBlocks(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx dsh-coding-kit refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]')
    return
  }
  const yes = args.includes('--yes')
  const dryRunFlag = args.includes('--dry-run')
  const json = args.includes('--json')
  if (yes && dryRunFlag) fail('refresh-ide-blocks: --yes 与 --dry-run 不可同现', 1)
  let rest = args.filter((a) => a !== '--yes' && a !== '--dry-run' && a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail('refresh-ide-blocks 未知参数: ' + rest.join(' '), 1)
  const target = resolveTarget(process.cwd(), targetArg)
  if (!existsSync(target)) fail('refresh-ide-blocks target 不存在: ' + target, 1)

  // 第一段：全扫（dry-run 与 --yes 共用同一核心）
  const relFiles = discoverIdeFiles(target)
  const scans: FileScan[] = relFiles.map((rel) => scanIdeFile(rel, readFileSync(path.join(target, rel), 'utf8')))
  const git = gitState(target)
  const apply = yes
  const toWrites = scans.filter((s) => s.newText !== undefined)

  // 第二段（--yes 专用）：preflight fail-fast，全过才写盘（§6.3）
  if (apply) {
    for (const s of toWrites) assertNotS2(path.join(target, s.path))
    if (git === 'dirty') {
      fail('refresh-ide-blocks: git 工作树脏（未提交变更），fail-fast 拒写。请先 commit/stash 后重跑。核查: git -C ' + target + ' status --porcelain', 2)
    }
    const malformedFiles = scans.filter((s) => s.status === 'malformed')
    if (malformedFiles.length > 0) {
      const detail = malformedFiles
        .map((s) => s.path + ': ' + MALFORMED_LABEL[s.malformed?.kind ?? 'unclosed_begin'] + '@L' + (s.malformed?.line ?? 0))
        .join('；')
      fail('refresh-ide-blocks: 存在 MALFORMED 文件，fail-fast 拒写（人工修 marker 配对后重跑）: ' + detail, 2)
    }
    const mixedFiles = scans.filter((s) => s.status === 'mixed')
    if (mixedFiles.length > 0) {
      const detail = mixedFiles
        .map((s) => s.path + '（现行字面行: ' + s.mixedLines.map((n) => 'L' + n).join(',') + '）')
        .join('；')
      fail('refresh-ide-blocks: 存在 MIXED 文件（块内新旧命令字面混杂，部分手迁迹象），fail-fast 拒写: ' + detail, 2)
    }
  }
  if (apply && git === 'none' && toWrites.length > 0) {
    console.log('警告: target 非 git 仓（git: none），写盘后无 diff 回滚面，仅可靠备份回滚: ' + target)
  }

  // 写盘阶段：备份 → tmp+rename → 5 代清理
  const reportFiles: ReportFile[] = []
  let genDir: string | null = null
  if (apply && toWrites.length > 0) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    genDir = path.join(backupsRoot(target), ts)
  }
  for (const s of scans) {
    let written = false
    let backup: string | null = null
    if (apply && s.newText !== undefined && genDir) {
      backup = backupFile(target, genDir, s.path)
      atomicWrite(path.join(target, s.path), s.newText)
      written = true
    }
    reportFiles.push({
      path: s.path,
      blocks: s.blocks,
      status: s.status,
      rewrites: s.rewrites,
      report_only: s.reportOnly,
      skipped_local_blocks: s.skippedLocalBlocks,
      written,
      backup,
    })
  }
  if (apply && toWrites.length > 0) pruneBackups(target)

  const totals = {
    files_scanned: scans.length,
    product_blocks: scans.reduce((n, s) => n + s.blocks, 0),
    rewrites: scans.reduce((n, s) => n + s.rewrites.reduce((m, h) => m + h.count, 0), 0),
    report_only: scans.reduce((n, s) => n + s.reportOnly.reduce((m, h) => m + h.count, 0), 0),
    files_written: reportFiles.filter((f) => f.written).length,
  }
  const report: Report = {
    schema: REPORT_SCHEMA,
    target,
    mode: apply ? 'apply' : 'dry-run',
    git,
    files: reportFiles,
    totals,
    exit: 0,
  }
  if (json) console.log(JSON.stringify(report))
  else printHumanReport(report, scans)
}

// §5.2：cmdUpgrade 内嵌 dry-run 只读提示用的轻量计数（永不抛错 · 不读写 manifest · 不写任何文件）
export function countStaleIdeLiterals(target: string): number {
  try {
    let n = 0
    for (const rel of discoverIdeFiles(target)) {
      try {
        const scan = scanIdeFile(rel, readFileSync(path.join(target, rel), 'utf8'))
        n += scan.rewrites.reduce((s, h) => s + h.count, 0)
      } catch {
        // 单文件异常吞为提示级
      }
    }
    return n
  } catch {
    return 0
  }
}
