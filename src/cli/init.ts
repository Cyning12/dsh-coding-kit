import { mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { CliError, fail, kitLayoutJoin, legacyLayoutHint, resolveLayoutFile, resolveTarget, takeOption } from '../cli-shared.ts'
import { cmdHost, listKnownHostIds } from '../cli-host.ts'
import { countStaleIdeLiterals } from '../cli-refresh-ide-blocks.ts'
import { INIT_USAGE, VALID_PRESETS } from './usage.ts'

type Manifest = {
  version: string
  preset: string
  ide: string[]
  from_version: string | null
  upgraded_at: string
}

/** 新写入路径（F4：一律 .coding-kit） */
function manifestWritePath(target: string): string {
  return kitLayoutJoin(target, 'manifest.json')
}

/** 解析路径（读：新优先，legacy 回退） */
export function manifestPath(target: string): string {
  return resolveLayoutFile(target, 'manifest.json').abs
}

export async function readManifest(target: string): Promise<Manifest | null> {
  const hit = resolveLayoutFile(target, 'manifest.json')
  if (hit.source === 'none') return null
  return JSON.parse(await readFile(hit.abs, 'utf8')) as Manifest
}

function nowUtc(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// 数值三元组比较（x.y.z）：-1 a<b · 0 相等 · 1 a>b。
// 限制：不支持 pre-release 形态（如 1.2.2-beta.1）；遇非纯数字段按「不等且方向未知」归 -1（维持旧版可升级提示），版本历史均为纯 x.y.z，未来引入 pre-release 再升级比较器。
// DEF-030：旧包 @cyning/harness 产品线版本形态词表（2.x 系列）。
// from_version 属 kit 线（1.x）时不算跨产品线迁移，回落原「降级安装」语义。
export function isLegacyHarnessLineVersion(version: string): boolean {
  return /^2\./.test(version.trim())
}

export function compareVersion(a: string, b: string): number {
  if (a === b) return 0
  const pa = a.split('.').map((p) => Number.parseInt(p, 10))
  const pb = b.split('.').map((p) => Number.parseInt(p, 10))
  for (let i = 0; i < 3; i++) {
    const x = pa[i]
    const y = pb[i]
    if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) return -1
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

// 2.2 W4 D1 + 3.1 W2：init 成功完成后（含 --yes 非交互路径）打印 quickstart。
// 纪律：① 只许提到真实存在的 CLI 命令（F-W4-01 · test/init.test.ts 对照 usage 断言）；
// ② sync prompts --yes 是 TASK_TEMPLATE 的隐式前置，必须显式化为第 1 步；
// ③ 不物化示例 task 进消费者 docs/tasks/（S2 红线 · F-W4-02），第 2 步仅指引文本；
// ④ 语种英文先行（与 README 现状一致 · R2 口径），与 README「Core objects」节互链；
// ⑤ 第 4 步仅文案提示 graph scaffold（可审草稿 · 非权威真值；init 不捆绑写盘图谱）。
export const INIT_QUICKSTART = `Next steps — quickstart:
  0. Prerequisite: your project must be a git repository (run 'git init'
     first if needed) — step 3's verify requires a git root.
  1. npx spec-wave sync prompts --yes
     (materialize prompt templates, including docs/harness/templates/TASK_TEMPLATE.md)
  2. Create your first task: copy docs/harness/templates/TASK_TEMPLATE.md
     to docs/tasks/active/task_<slug>.md — a task.md is one executable,
     verifiable unit of work (see "Core objects" in README).
  3. npx spec-wave verify --task docs/tasks/active/task_<slug>.md
     (first gate run; hat 30 may change code only after HG-AUDIT-R1=approved)
  4. Next (optional tech-graph): npx spec-wave graph scaffold
     — reviewable draft under docs/_tech_graph/ (default dry-run; --yes writes).
     Not signed architecture truth; do not treat as an authoritative auto graph.
     After write, open REVIEW_CHECKLIST.md; HG-GRAPH-MODULES stays human-only.`

/**
 * 是否允许 init 交互询问 `--tools`。
 * B-INIT-YES：`--yes` ⇒ 非交互（即使 `stdin.isTTY===true` 也禁止读 stdin）。
 */
export function isInteractiveInit(
  stdin: { isTTY?: boolean | undefined } = process.stdin,
  opts: { yes?: boolean } = {},
): boolean {
  if (opts.yes) return false
  return Boolean(stdin.isTTY)
}

export type InitToolsSelection =
  | { mode: 'none' }
  | { mode: 'hosts'; ids: string[]; toolsArg: string }

/** 解析 init `--tools`；`none` 仅 init；`all`=适配表全量 */
export function parseInitToolsArg(
  toolsArg: string,
  knownIds: string[],
): InitToolsSelection {
  const tokens = Array.from(
    new Set(
      toolsArg
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    ),
  )
  if (tokens.length < 1) {
    fail(`init --tools 须为 all|none|LIST（逗号分隔 host_id）\n用法: ${INIT_USAGE}`)
  }
  if (tokens.includes('none')) {
    if (tokens.length !== 1) {
      fail(`init --tools none 不可与其它 host_id 混用\n用法: ${INIT_USAGE}`)
    }
    return { mode: 'none' }
  }
  if (tokens.includes('all')) {
    if (tokens.length !== 1) {
      fail(`init --tools all 不可与其它 host_id 混用\n用法: ${INIT_USAGE}`)
    }
    return { mode: 'hosts', ids: [...knownIds], toolsArg: 'all' }
  }
  const known = new Set(knownIds)
  const unknown = tokens.filter((id) => !known.has(id))
  if (unknown.length > 0) {
    fail(
      `init --tools 未知 host_id: ${unknown.join(', ')}（合法: ${knownIds.join(', ')}）\n用法: ${INIT_USAGE}`,
    )
  }
  return { mode: 'hosts', ids: tokens, toolsArg: tokens.join(',') }
}

/**
 * TTY 询问宿主选型（可注入 stdin/stdout；测用 mock Readable）。
 * 接受：逗号多选 / all / none。
 */
export async function promptInitTools(
  knownIds: string[],
  io: {
    input?: NodeJS.ReadableStream
    output?: NodeJS.WritableStream
  } = {},
): Promise<InitToolsSelection> {
  const input = io.input ?? process.stdin
  const output = io.output ?? process.stdout
  const rl = readline.createInterface({ input, output, terminal: false })
  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => {
      rl.question(q, (answer) => resolve(answer))
    })
  try {
    output.write(
      `请选择要物化的 IDE/宿主（多选逗号分隔，或 all / none）\n可选: ${knownIds.join(', ')}\n`,
    )
    for (;;) {
      const raw = (await ask('> ')).trim()
      if (!raw) {
        output.write('须输入 all、none 或 host_id 列表（不可空）\n')
        continue
      }
      try {
        return parseInitToolsArg(raw, knownIds)
      } catch (err) {
        if (err instanceof CliError) {
          output.write(`${err.message}\n`)
          continue
        }
        throw err
      }
    }
  } finally {
    rl.close()
  }
}

export async function cmdInit(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`用法: npx spec-wave ${INIT_USAGE}`)
    return
  }
  const yes = args.includes('--yes')
  const hostAdapt = args.includes('--host-adapt')
  const noHostAdapt = args.includes('--no-host-adapt')
  if (hostAdapt && noHostAdapt) {
    fail(`init: --host-adapt 与 --no-host-adapt 不可同现\n用法: ${INIT_USAGE}`)
  }
  let rest = args.filter(
    (a) => a !== '--yes' && a !== '--host-adapt' && a !== '--no-host-adapt',
  )
  const { value: preset, rest: r1 } = takeOption(rest, '--preset')
  rest = r1
  const { value: targetArg, rest: r2 } = takeOption(rest, '--target')
  rest = r2
  const hasToolsFlag = rest.includes('--tools')
  const { value: toolsArg, rest: r3 } = takeOption(rest, '--tools')
  rest = r3
  if (hasToolsFlag && toolsArg === undefined) {
    fail(`init --tools 须跟 all|none|LIST\n用法: ${INIT_USAGE}`)
  }
  const { value: profileArg, rest: r4 } = takeOption(rest, '--profile')
  rest = r4
  if (rest.length > 0) fail(`init 未知参数: ${rest.join(' ')}\n用法: ${INIT_USAGE}`)

  const profile = profileArg ?? 'core'
  if (profile !== 'core' && profile !== 'expanded') {
    fail(`init 仅支持 --profile core|expanded（收到: ${profile}）\n用法: ${INIT_USAGE}`)
  }

  const target = resolveTarget(process.cwd(), targetArg)
  const chosenPreset = preset || 'harness-only'
  if (!(VALID_PRESETS as readonly string[]).includes(chosenPreset)) {
    fail(`init --preset 取值非法: ${chosenPreset}（合法词表: ${VALID_PRESETS.join(' / ')}）`)
  }

  const knownIds = listKnownHostIds()
  let selection: InitToolsSelection
  if (toolsArg === undefined) {
    // `--yes` 或非 TTY：禁止读 stdin；须显式 --tools（B-INIT-YES）
    if (!isInteractiveInit(process.stdin, { yes })) {
      fail(
        `init 非交互环境须显式 --tools all|none|LIST（对齐 OpenSpec；禁止假装已询问）\n用法: ${INIT_USAGE}`,
      )
    }
    selection = await promptInitTools(knownIds)
  } else {
    selection = parseInitToolsArg(toolsArg, knownIds)
  }

  const existing = await readManifest(target)
  if (existing) {
    console.log(`manifest 已存在，跳过写入: ${manifestPath(target)}`)
  } else {
    const mf: Manifest = {
      version: pkgVersion,
      preset: chosenPreset,
      ide: [],
      from_version: null,
      upgraded_at: nowUtc(),
    }
    const dest = manifestWritePath(target)
    mkdirSync(path.dirname(dest), { recursive: true })
    await writeFile(dest, `${JSON.stringify(mf, null, 2)}\n`, 'utf8')
    console.log(`已写入 manifest: ${dest}`)
    console.log(`manifest: ${dest}`)
  }

  // freeze：`--no-host-adapt` → 只做过程根，不 apply、不写粘性（避免「记住了却未物化」）
  const shouldApply = selection.mode === 'hosts' && !noHostAdapt
  if (selection.mode === 'none') {
    console.log('已跳过 host 物化（--tools none）')
  } else if (!shouldApply) {
    console.log('已跳过 host 物化（--no-host-adapt；未写粘性）')
  } else {
    const applyArgs = [
      'apply',
      '--tools',
      selection.toolsArg,
      '--profile',
      profile,
      '--target',
      target,
    ]
    if (yes) applyArgs.push('--yes')
    console.log(
      `联动 host apply（同进程）: --tools ${selection.toolsArg} --profile ${profile}${yes ? ' --yes' : '（dry-run；加 --yes 写盘）'}`,
    )
    await cmdHost(applyArgs)
  }

  if (!yes) console.log('init 完成。')
  // 2.2 W4 D1：--yes 与 dry-run 两路径一致打印（输出不一致 = F-W4 测试红）
  console.log(INIT_QUICKSTART)
}

export async function cmdUpgrade(args: string[], pkgVersion: string): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: npx spec-wave upgrade [--target PATH] [--yes]')
    return
  }
  const yes = args.includes('--yes')
  let rest = args.filter((a) => a !== '--yes')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`upgrade 未知参数: ${rest.join(' ')}`)

  const target = resolveTarget(process.cwd(), targetArg)
  const current = await readManifest(target)
  if (!current) {
    fail('未接入（无 .coding-kit/manifest.json 或 legacy .cyning-harness/manifest.json）。建议: npx spec-wave init --preset harness-only --yes')
  }
  const next: Manifest = {
    version: pkgVersion,
    preset: current.preset || 'harness-only',
    ide: Array.isArray(current.ide) ? current.ide : [],
    from_version: current.version === pkgVersion ? current.from_version : current.version,
    upgraded_at: nowUtc(),
  }
  const dest = manifestWritePath(target)
  mkdirSync(path.dirname(dest), { recursive: true })
  await writeFile(dest, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`upgrade: ${current.version} → ${pkgVersion}`)
  console.log(`manifest: ${dest}`)
  const legHint = legacyLayoutHint(target)
  if (legHint) console.log(legHint)
  if (!yes) console.log('upgrade 完成（S2 路径未写入）。')
  // R-07 §5.2：upgrade 内嵌 dry-run 只读提示（不写 IDE 文件、不改 exit 码；扫描异常吞为提示级）
  try {
    const stale = countStaleIdeLiterals(target)
    if (stale > 0) {
      console.log(
        '提示: 检测到 ' + stale + ' 处 IDE 块内旧命令字面；运行 `npx spec-wave refresh-ide-blocks --yes` 刷写（先 `refresh-ide-blocks --dry-run` 看详情）。',
      )
    }
  } catch {
    // 提示级：扫描异常不影响 upgrade 语义
  }
  console.log(
    '提示: manifest 已升级 · prompts 未自动同步（含 FRAGMENT_hat_reanchor / FRAGMENT_00_delegate_only） · 运行 `npx spec-wave sync prompts --yes`（先 `sync prompts` dry-run 看清单）。',
  )
}
