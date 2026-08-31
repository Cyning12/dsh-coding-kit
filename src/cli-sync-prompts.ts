import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fail, packageRoot, resolveTarget, takeOption } from './cli-shared.ts'

/** Starter 白名单（R1 钉死 · 不含 README.md） */
export const SYNC_PROMPT_FILES = [
  '00-orchestrator.md',
  '10-task-requirements.md',
  '10-spec-requirements.md',
  '20-task-audit.md',
  '20-spec-audit.md',
  '30-execute-code.md',
  '40-self-check.md',
  'FRAGMENT_30_gate_verify_v1_zh.md',
  'FRAGMENT_hat_reanchor_v1_zh.md',
  'FRAGMENT_00_delegate_only_v1_zh.md',
  'TEMPLATE_30_gate_stop.md',
] as const

export const SYNC_TEMPLATE_FILES = ['TASK_TEMPLATE.md'] as const

export type SyncPromptEntry = {
  packageRel: string
  targetRel: string
}

export type SyncPromptsPlan = {
  skip: SyncPromptEntry[]
  add: SyncPromptEntry[]
  conflict: SyncPromptEntry[]
}

export type SyncPromptsResult = SyncPromptsPlan & {
  dryRun: boolean
  written: SyncPromptEntry[]
}

export const SYNC_PROMPTS_USAGE = `用法:
  npx dsh-coding-kit sync prompts [--target PATH] [--yes] [--force] [--json]

  默认 dry-run（零写入）；--yes 写入 add 项并创建目标目录；conflict 默认不覆盖，--force 显式覆盖。
  前置：目标仓须已有 .cyning-harness/manifest.json（先 init）。`

function sha256(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex')
}

function manifestPath(target: string): string {
  return path.join(target, '.cyning-harness', 'manifest.json')
}

export function listSyncPromptEntries(): SyncPromptEntry[] {
  const out: SyncPromptEntry[] = []
  for (const name of SYNC_PROMPT_FILES) {
    out.push({
      packageRel: path.join('assets', 'harness', 'prompts', name).replace(/\\/g, '/'),
      targetRel: path.join('docs', 'harness', 'prompts', name).replace(/\\/g, '/'),
    })
  }
  for (const name of SYNC_TEMPLATE_FILES) {
    out.push({
      packageRel: path.join('assets', 'harness', 'templates', name).replace(/\\/g, '/'),
      targetRel: path.join('docs', 'harness', 'templates', name).replace(/\\/g, '/'),
    })
  }
  return out
}

export function planSyncPrompts(target: string, root = packageRoot()): SyncPromptsPlan {
  const skip: SyncPromptEntry[] = []
  const add: SyncPromptEntry[] = []
  const conflict: SyncPromptEntry[] = []
  for (const entry of listSyncPromptEntries()) {
    const srcAbs = path.join(root, entry.packageRel)
    const destAbs = path.join(target, entry.targetRel)
    const srcBody = readFileSync(srcAbs, 'utf8')
    const srcHash = sha256(srcBody)
    if (!existsSync(destAbs)) {
      add.push(entry)
      continue
    }
    const destHash = sha256(readFileSync(destAbs, 'utf8'))
    if (destHash === srcHash) skip.push(entry)
    else conflict.push(entry)
  }
  return { skip, add, conflict }
}

function printHumanReport(result: SyncPromptsResult): void {
  const mode = result.dryRun ? 'dry-run' : 'apply'
  console.log(`sync prompts (${mode}):`)
  const sections: Array<[string, SyncPromptEntry[]]> = [
    ['skip', result.skip],
    ['add', result.add],
    ['conflict', result.conflict],
  ]
  for (const [label, items] of sections) {
    console.log(`  ${label} (${items.length}):`)
    if (items.length === 0) {
      console.log('    (无)')
      continue
    }
    for (const item of items) {
      if (label === 'conflict') {
        console.log(
          `    ${item.targetRel} — 本地已改 · 未覆盖 · 对照包内 ${item.packageRel}`,
        )
      } else {
        console.log(`    ${item.targetRel}`)
      }
    }
  }
  if (!result.dryRun && result.written.length > 0) {
    console.log(`  written (${result.written.length}):`)
    for (const item of result.written) console.log(`    ${item.targetRel}`)
  }
  if (result.dryRun) {
    console.log('（dry-run · 零写入 · 加 --yes 执行）')
  }
}

export function applySyncPrompts(
  target: string,
  opts: { yes: boolean; force: boolean; root?: string },
): SyncPromptsResult {
  const root = opts.root ?? packageRoot()
  const plan = planSyncPrompts(target, root)
  const dryRun = !opts.yes
  const written: SyncPromptEntry[] = []
  if (dryRun) {
    return { ...plan, dryRun: true, written }
  }
  const toWrite = [...plan.add]
  if (opts.force) toWrite.push(...plan.conflict)
  for (const entry of toWrite) {
    const srcAbs = path.join(root, entry.packageRel)
    const destAbs = path.join(target, entry.targetRel)
    mkdirSync(path.dirname(destAbs), { recursive: true })
    writeFileSync(destAbs, readFileSync(srcAbs, 'utf8'), 'utf8')
    written.push(entry)
  }
  return { ...plan, dryRun: false, written }
}

export async function cmdSyncPrompts(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(SYNC_PROMPTS_USAGE)
    return
  }
  const yes = args.includes('--yes')
  const force = args.includes('--force')
  let rest = args.filter((a) => a !== '--yes' && a !== '--force')
  const json = rest.includes('--json')
  rest = rest.filter((a) => a !== '--json')
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  if (rest.length > 0) fail(`sync prompts 未知参数: ${rest.join(' ')}`)

  const target = resolveTarget(process.cwd(), targetArg)
  if (!existsSync(manifestPath(target))) {
    fail(
      '未接入（无 .cyning-harness/manifest.json）。建议: npx dsh-coding-kit init --preset harness-only --yes',
    )
  }

  const result = applySyncPrompts(target, { yes, force })
  if (json) {
    console.log(
      JSON.stringify(
        {
          dry_run: result.dryRun,
          skip: result.skip.map((e) => e.targetRel),
          add: result.add.map((e) => e.targetRel),
          conflict: result.conflict.map((e) => e.targetRel),
          written: result.written.map((e) => e.targetRel),
        },
        null,
        2,
      ),
    )
  } else {
    printHumanReport(result)
  }

  if (!result.dryRun && result.conflict.length > 0 && !force) {
    fail('存在 conflict 文件未覆盖（加 --force 显式覆盖，或人工合并后重跑）', 1)
  }
}
