import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fail, findGate, packageRoot, parseHumanGates, takeOption } from './cli-shared.ts'
import { yamlLoad } from './yaml.ts'

type LifecycleData = {
  version: string
  states: { id: string; note?: string }[]
  transitions: {
    id: string
    from: string[]
    to: string
    hat?: string
    description?: string
    guards: {
      id: string
      command_or_check: string
      severity: string
      allow_flag?: string
    }[]
  }[]
}

type DisciplineData = {
  version: string
  as_of_package_version: string
  scope: string
  statements?: { id: string; source: string; summary: string; status: string }[]
  gaps?: { id: string; title: string; status: string }[]
}

function assetsHarnessFile(name: string): string {
  return path.join(packageRoot(), 'assets', 'harness', name)
}

function loadLifecycle(): { data: LifecycleData; filePath: string } {
  const filePath = assetsHarnessFile('lifecycle.yaml')
  if (!existsSync(filePath)) fail(`lifecycle.yaml 不存在: ${filePath}`)
  let data: LifecycleData
  try {
    data = yamlLoad(readFileSync(filePath, 'utf8')) as LifecycleData
  } catch (err) {
    fail(`lifecycle.yaml 解析失败: ${(err as Error).message}`)
  }
  if (!data?.version || !Array.isArray(data.states) || !Array.isArray(data.transitions)) {
    fail('lifecycle.yaml 校验失败: 缺 version/states/transitions')
  }
  return { data, filePath }
}

function loadDiscipline(): { data: DisciplineData; filePath: string } {
  const filePath = assetsHarnessFile('discipline-coverage.yaml')
  if (!existsSync(filePath)) fail(`discipline-coverage.yaml 不存在: ${filePath}`)
  let data: DisciplineData
  try {
    data = yamlLoad(readFileSync(filePath, 'utf8')) as DisciplineData
  } catch (err) {
    fail(`discipline-coverage.yaml 解析失败: ${(err as Error).message}`)
  }
  if (!data?.version || !data.as_of_package_version || !Array.isArray(data.statements)) {
    fail('discipline-coverage.yaml 校验失败')
  }
  return { data, filePath }
}

function formatLifecycleShow(data: LifecycleData): string {
  const lines = [
    `lifecycle v${data.version}`,
    '',
    '## states',
    ...data.states.map((s) => `- ${s.id}${s.note ? ` · ${s.note}` : ''}`),
    '',
    '## transitions',
  ]
  for (const t of data.transitions) {
    lines.push(`### ${t.id} · ${t.from.join('|')} → ${t.to}${t.hat ? ` · hat=${t.hat}` : ''}`)
    if (t.description) lines.push(`  ${t.description}`)
    for (const g of t.guards) {
      const allow = g.allow_flag ? ` · allow=${g.allow_flag}` : ''
      lines.push(`  - [${g.severity}] ${g.id}: ${g.command_or_check}${allow}`)
    }
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}

function formatDisciplineShow(data: DisciplineData): string {
  const byStatus: Record<string, number> = {}
  for (const s of data.statements ?? []) byStatus[s.status] = (byStatus[s.status] ?? 0) + 1
  const gapBy: Record<string, number> = {}
  for (const g of data.gaps ?? []) gapBy[g.status] = (gapBy[g.status] ?? 0) + 1
  const lines = [
    `discipline-coverage v${data.version}`,
    `as_of: ${data.as_of_package_version}`,
    `scope: ${data.scope}`,
    '',
    `## statements (${data.statements?.length ?? 0})`,
    ...Object.entries(byStatus)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, n]) => `- ${k}: ${n}`),
    '',
    `## gaps (${data.gaps?.length ?? 0})`,
  ]
  if ((data.gaps?.length ?? 0) === 0) lines.push('- （无）')
  else {
    lines.push(
      ...Object.entries(gapBy)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, n]) => `- ${k}: ${n}`),
    )
  }
  lines.push('', '## sample statements（最多 12）')
  for (const s of (data.statements ?? []).slice(0, 12)) {
    const sum = s.summary.length > 72 ? `${s.summary.slice(0, 69)}…` : s.summary
    lines.push(`- [${s.status}] ${s.id}: ${sum}`)
  }
  lines.push('', '注: SoT = assets/harness/discipline-coverage.yaml · show 只读')
  lines.push('注: status 口径 = 本包实接线（not_wired = 声称但本包未接线 · 旧包机制见 yaml notes）')
  return lines.join('\n')
}

type DryRunFlags = {
  allowNoReview?: boolean
  allowLintFail?: boolean
  allowNoSpecReview?: boolean
  allowInvokeGap?: boolean
  allowUnchecked?: boolean
  allowKpiGap?: boolean
  allowExperienceGap?: boolean
  allowWikiGap?: boolean
}

function flagsAllow(flags: DryRunFlags, allowFlag?: string): boolean {
  if (allowFlag === '--allow-no-review') return Boolean(flags.allowNoReview)
  if (allowFlag === '--allow-lint-fail') return Boolean(flags.allowLintFail)
  if (allowFlag === '--allow-no-spec-review') return Boolean(flags.allowNoSpecReview)
  if (allowFlag === '--allow-invoke-gap') return Boolean(flags.allowInvokeGap)
  if (allowFlag === '--allow-unchecked') return Boolean(flags.allowUnchecked)
  if (allowFlag === '--allow-kpi-gap') return Boolean(flags.allowKpiGap)
  if (allowFlag === '--allow-experience-gap') return Boolean(flags.allowExperienceGap)
  if (allowFlag === '--allow-wiki-gap') return Boolean(flags.allowWikiGap)
  return false
}

function dryRunTransition(opts: {
  transitionId: string
  fromState: string
  taskPath?: string
  flags: DryRunFlags
  cwd: string
}): {
  engine: string
  lifecycle_doc_version: string
  transition_id: string | null
  from: string | null
  to: string | null
  hat: string | null
  structure_ok: boolean
  guards: { id: string; severity: string; status: string; detail: string | null; allow_flag: string | null }[]
  blocked: boolean
  unevaluated_count: number
  detail?: string
  exitCode: number
} {
  const { data } = loadLifecycle()
  const knownIds = data.transitions.map((t) => t.id)
  const transition = data.transitions.find((t) => t.id === opts.transitionId)
  if (!transition) {
    return {
      engine: 'lifecycle-dry-run',
      lifecycle_doc_version: data.version,
      transition_id: opts.transitionId,
      from: opts.fromState,
      to: null,
      hat: null,
      structure_ok: false,
      guards: [],
      blocked: true,
      unevaluated_count: 0,
      detail: `未知 transition: ${opts.transitionId}（已知: ${knownIds.join(', ')}）`,
      exitCode: 2,
    }
  }
  if (!opts.fromState || !transition.from.includes(opts.fromState)) {
    return {
      engine: 'lifecycle-dry-run',
      lifecycle_doc_version: data.version,
      transition_id: transition.id,
      from: opts.fromState,
      to: transition.to,
      hat: transition.hat ?? null,
      structure_ok: false,
      guards: [],
      blocked: true,
      unevaluated_count: 0,
      detail: `from "${opts.fromState}" ∉ ${JSON.stringify(transition.from)}`,
      exitCode: 2,
    }
  }
  const absTask = opts.taskPath
    ? path.isAbsolute(opts.taskPath)
      ? opts.taskPath
      : path.resolve(opts.cwd, opts.taskPath)
    : null
  if (opts.taskPath && absTask && !existsSync(absTask)) fail(`--task 不可读: ${opts.taskPath}`)
  const canEval = Boolean(absTask)
  const guards: {
    id: string
    severity: string
    status: string
    detail: string | null
    allow_flag: string | null
  }[] = []
  for (const g of transition.guards) {
    if (!canEval || (g.id !== 'HG-AUDIT-R1' && g.id !== 'HG-TASK-DRAFT')) {
      guards.push({
        id: g.id,
        severity: g.severity,
        status: 'unevaluated',
        detail: !canEval ? '无 --task · 未求值' : '本波未接线 adapter',
        allow_flag: g.allow_flag ?? null,
      })
      continue
    }
    const content = readFileSync(absTask as string, 'utf8')
    const gates = parseHumanGates(content)
    const row = findGate(gates, g.id)
    let status = 'fail'
    let detail = `闸表无 ${g.id} 行`
    if (row) {
      if (row.status === 'approved') {
        status = 'pass'
        detail = `${g.id}=approved`
      } else {
        status = 'fail'
        detail = `${g.id}=${row.status}（须 approved）`
      }
    }
    if (status === 'fail' && g.allow_flag && flagsAllow(opts.flags, g.allow_flag)) {
      status = 'warn'
      detail = `${detail}（${g.allow_flag} 豁免）`
    }
    guards.push({
      id: g.id,
      severity: g.severity,
      status,
      detail,
      allow_flag: g.allow_flag ?? null,
    })
  }
  const unevaluated_count = guards.filter((g) => g.status === 'unevaluated').length
  const blocked = guards.some((g) => g.severity === 'block' && g.status === 'fail')
  return {
    engine: 'lifecycle-dry-run',
    lifecycle_doc_version: data.version,
    transition_id: transition.id,
    from: opts.fromState,
    to: transition.to,
    hat: transition.hat ?? null,
    structure_ok: true,
    guards,
    blocked,
    unevaluated_count,
    exitCode: blocked ? 2 : 0,
  }
}

function formatLifecycleDryRun(report: ReturnType<typeof dryRunTransition>): string {
  const lines = [
    '=== Harness lifecycle dry-run ===',
    `engine: ${report.engine}`,
    `lifecycle: v${report.lifecycle_doc_version}`,
    `transition: ${report.transition_id} · ${report.from} → ${report.to}${report.hat ? ` · hat=${report.hat}` : ''}`,
    `structure_ok: ${report.structure_ok}`,
    `blocked: ${report.blocked}`,
    `unevaluated_count: ${report.unevaluated_count}`,
  ]
  if (report.detail) lines.push(`detail: ${report.detail}`)
  if (report.unevaluated_count > 0) {
    lines.push('WARN: 存在未求值守卫 · unevaluated ≠ pass（勿当作已通过）')
  }
  lines.push('', '## guards')
  for (const g of report.guards) {
    const d = g.detail ? ` · ${g.detail}` : ''
    lines.push(`- [${g.severity}] ${g.id}: ${g.status}${d}`)
  }
  lines.push('', '注: dry-run 为旁路资格报告 · 不替代 verify / gate-check')
  return lines.join('\n')
}

export async function cmdLifecycle(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (!sub || sub === '--help' || sub === '-h' || args.includes('--help') || args.includes('-h')) {
    console.log(`用法:
  npx dsh-coding-kit lifecycle show [--json]
  npx dsh-coding-kit lifecycle dry-run --transition ID --from STATE [--task PATH] [--json]
       [--allow-no-review] [--allow-lint-fail] [--allow-no-spec-review]
       [--allow-invoke-gap] [--allow-unchecked]
`)
    return
  }
  if (sub === 'show') {
    const json = rest.includes('--json')
    const unknown = rest.filter((a) => a !== '--json')
    if (unknown.length > 0) fail(`lifecycle show 未知参数: ${unknown.join(' ')}`)
    const { data } = loadLifecycle()
    if (json) console.log(JSON.stringify(data, null, 2))
    else console.log(formatLifecycleShow(data))
    return
  }
  if (sub === 'dry-run') {
    let remaining = rest
    const { value: transitionId, rest: r1 } = takeOption(remaining, '--transition')
    remaining = r1
    const { value: fromState, rest: r2 } = takeOption(remaining, '--from')
    remaining = r2
    const { value: taskPath, rest: r3 } = takeOption(remaining, '--task')
    remaining = r3
    const json = remaining.includes('--json')
    const flags: DryRunFlags = {
      allowNoReview: remaining.includes('--allow-no-review'),
      allowLintFail: remaining.includes('--allow-lint-fail'),
      allowNoSpecReview: remaining.includes('--allow-no-spec-review'),
      allowInvokeGap: remaining.includes('--allow-invoke-gap'),
      allowUnchecked: remaining.includes('--allow-unchecked'),
      allowKpiGap: remaining.includes('--allow-kpi-gap'),
      allowExperienceGap: remaining.includes('--allow-experience-gap'),
      allowWikiGap: remaining.includes('--allow-wiki-gap'),
    }
    remaining = remaining.filter(
      (a) =>
        a !== '--json' &&
        a !== '--allow-no-review' &&
        a !== '--allow-lint-fail' &&
        a !== '--allow-no-spec-review' &&
        a !== '--allow-invoke-gap' &&
        a !== '--allow-unchecked' &&
        a !== '--allow-kpi-gap' &&
        a !== '--allow-experience-gap' &&
        a !== '--allow-wiki-gap',
    )
    if (remaining.length > 0) fail(`lifecycle dry-run 未知参数: ${remaining.join(' ')}`)
    if (!transitionId || !fromState) {
      fail('lifecycle dry-run 须 --transition <id> 与 --from <state>\n提示: lifecycle show')
    }
    const report = dryRunTransition({
      transitionId,
      fromState,
      taskPath,
      flags,
      cwd: process.cwd(),
    })
    if (json) console.log(JSON.stringify(report, null, 2))
    else console.log(formatLifecycleDryRun(report))
    if (report.exitCode && report.exitCode !== 0) fail('', report.exitCode)
    return
  }
  fail(`lifecycle 子命令未知: ${sub}\n用法: lifecycle show [--json] · lifecycle dry-run --transition ID --from STATE`)
}

export async function cmdDiscipline(args: string[]): Promise<void> {
  const [sub, ...rest] = args
  if (!sub || sub === '--help' || sub === '-h' || args.includes('--help') || args.includes('-h')) {
    console.log(`用法:
  npx dsh-coding-kit discipline show [--json]
`)
    return
  }
  if (sub === 'show') {
    const json = rest.includes('--json')
    const unknown = rest.filter((a) => a !== '--json')
    if (unknown.length > 0) fail(`discipline show 未知参数: ${unknown.join(' ')}`)
    const { data } = loadDiscipline()
    if (json) console.log(JSON.stringify(data, null, 2))
    else console.log(formatDisciplineShow(data))
    return
  }
  fail(`discipline 子命令未知: ${sub ?? '(空)'}\n用法: discipline show [--json]`)
}
