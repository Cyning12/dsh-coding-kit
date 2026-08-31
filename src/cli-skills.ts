import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fail, packageRoot, resolveTarget, takeOption } from './cli-shared.ts'
import { yamlDump, yamlLoad } from './yaml.ts'

export const EXECUTE_TRACK = 'starter-experimental'
const RESOURCE_RE = /(?<![A-Za-z0-9_])(?:FRAGMENT|TEMPLATE)_[A-Za-z0-9_\-]+\.md/g
const MD_LINK_RE = /\]\(\.\/((?:FRAGMENT|TEMPLATE)_[A-Za-z0-9_\-]+\.md)\)/g
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

type Frontmatter = {
  name?: string
  description?: string
  compatibility?: string
  metadata?: { hat_id?: string; track?: string }
  [k: string]: unknown
}

type SkillPrompt = {
  file: string
  frontmatter: Frontmatter
  body: string
  errors: string[]
}

export function parseSkillPrompt(content: string): {
  frontmatter: Frontmatter | null
  body: string
  parseError?: string
} {
  const m = FRONTMATTER_RE.exec(content)
  if (!m) return { frontmatter: null, body: content }
  try {
    return { frontmatter: yamlLoad(m[1]) as Frontmatter, body: m[2] }
  } catch (e) {
    return { frontmatter: null, body: content, parseError: (e as Error).message }
  }
}

export function validateSkillFrontmatter(fm: Frontmatter | null, source: string): string[] {
  const errors: string[] = []
  if (!fm || typeof fm !== 'object') return [`${source}: 缺 frontmatter 或非对象`]
  const { name, description, compatibility } = fm
  if (typeof name !== 'string' || name.length < 1 || name.length > 64) {
    errors.push(`${source}: name 缺失或超长（1–64）`)
  } else if (!NAME_RE.test(name)) {
    errors.push(`${source}: name 非法（仅小写字母/数字/单连字符 · 不得首尾连字符/连续连字符）: ${name}`)
  }
  if (typeof description !== 'string' || description.length < 1) {
    errors.push(`${source}: description 缺失`)
  } else if (description.length > 1024) {
    errors.push(`${source}: description 超长（${description.length} > 1024）`)
  }
  if (compatibility !== undefined) {
    if (typeof compatibility !== 'string' || compatibility.length > 500) {
      errors.push(`${source}: compatibility 超长或非字符串（≤500）`)
    }
  }
  return errors
}

export function loadSkillPrompts({ promptsDir }: { promptsDir: string }): SkillPrompt[] {
  const files = readdirSync(promptsDir)
    .filter((f) => f.endsWith('.md'))
    // 00 全文不进默认 Skills（不建 harness-00）；TEMPLATE / README 非 skill
    // FRAGMENT_* 仅当带合法 skill frontmatter（name）才入分发（re-anchor / 00-delegate）
    .filter((f) => !/^(README|TEMPLATE_|00-)/.test(f))
    .sort()
  const out: SkillPrompt[] = []
  for (const file of files) {
    const content = readFileSync(path.join(promptsDir, file), 'utf8')
    const { frontmatter, body, parseError } = parseSkillPrompt(content)
    if (/^FRAGMENT_/.test(file) && !parseError && !frontmatter?.name) continue
    const errors = parseError
      ? [`${file}: frontmatter YAML 解析失败: ${parseError}`]
      : validateSkillFrontmatter(frontmatter, file)
    out.push({ file, frontmatter: frontmatter || {}, body, errors })
  }
  return out
}

function rewriteLinks(body: string): string {
  return body.replace(MD_LINK_RE, '](references/$1)')
}

function referencedResources(body: string): string[] {
  return [...new Set(body.match(RESOURCE_RE) || [])].sort()
}

function renderSkillMd(frontmatter: Frontmatter, body: string): string {
  return `---\n${yamlDump(frontmatter, { lineWidth: -1 })}---\n${body}`
}

function firstSentence(description: string): string {
  const idx = description.indexOf('。')
  return idx === -1 ? description : description.slice(0, idx + 1)
}

function renderReadme(skills: SkillPrompt[], { withExecuteHats }: { withExecuteHats: boolean }): string {
  const rows = skills
    .map(
      (s) =>
        `| [\`${s.frontmatter.name}/\`](./${s.frontmatter.name}/SKILL.md) | ${s.frontmatter.metadata?.hat_id ?? ''} | ${firstSentence(s.frontmatter.description || '')} |`,
    )
    .join('\n')
  const executeNote = withExecuteHats
    ? ''
    : `
## 执行帽缺席说明

\`harness-30-execute\` / \`harness-40-self-check\`（执行帽）**不在本分发**：其 skill 化须先通过 T1 闸绕开评测（\`eval/t1_gate_bypass/\` S1–S3）。
评测/维护者可用 \`npx dsh-coding-kit skills build --with-execute-hats\` 本地生成（仅供评测环境，勿装入生产 client）。
`
  const zeroNote = `
## 00 全文缺席说明

\`00-orchestrator.md\`（00 全文）**不在本分发**（仅 prompts 同步）。短片段 \`harness-00-delegate-only\` / \`harness-hat-reanchor\` **默认可分发**。
`
  return `# skills/ · Agent Skills 标准封装（生成物 · 勿手改）

> **本目录由 \`npx dsh-coding-kit skills build\` 生成**；真值 = \`harness/prompts/\` 条文（frontmatter + 正文）。
> 改动请改条文后重跑 build；\`npx dsh-coding-kit skills check\` 会拦截任何手改 drift。
> 规范：https://agentskills.io/specification

## 安装（各 client 路径不同 · 复制或软链均可）

| 路径 | 用途 | 谁写入 |
|------|------|--------|
| DSH \`<repo>/.dsh/skills/\` | 消费者 Skill 安装落点 | \`npx dsh-coding-kit skills install\` |
| DSH \`$HOME/.dsh/skills/\` | 用户级安装落点 | \`npx dsh-coding-kit skills install --global\` |
| Claude Code \`<repo>/.claude/skills/\` 或 \`~/.claude/skills/\` | Claude skill 目录 | 用户另拷或 \`--out\`；**默认不写** |

\`.dsh/coding-kit\` / \`.coding-kit\` 是规范覆盖（\`apply_coding_standards\` / \`init_coding_kit\`），**不是** skill 目录，禁止当作 install dest。

已验证（2026-08-22 · 对照 DSH 上游源码 deepseek-harness@141eb6f，dsh 0.1.0-rc.8）：DSH runtime **会自动扫描** \`.dsh/skills\` 与 \`$HOME/.dsh/skills\` 两个 **安装落点** 并 **按需加载**。证据锚点：\`packages/skill/skill-filesystem/src/index.ts:246\`（\`<projectRoot>/.dsh/skills\`，rank 100）与 \`:253\`（\`$DSH_HOME\` 或 \`~/.dsh\` 下 \`skills/\`，rank 400）；目录级文档 \`docs/subsystems/skills.md\`「Local discovery priority」表同口径。结构要求：目录包 \`<name>/SKILL.md\` 或平铺 \`<name>.md\`（index.ts:724-728）；frontmatter 必填 \`name\`/\`description\`，\`name\` 须 kebab-case（index.ts:810-816）。扫描/加载属 DSH runtime 行为契约，随上游版本演进，锚点对应 0.1.0-rc.8。

## 技能清单

| skill | hat_id | 用途 |
|-------|--------|------|
${rows}
${executeNote}${zeroNote}`
}

export function generateSkills({
  promptsDir,
  withExecuteHats = false,
}: {
  promptsDir: string
  withExecuteHats?: boolean
}): { files: Map<string, string>; skills: SkillPrompt[]; errors: string[] } {
  const prompts = loadSkillPrompts({ promptsDir })
  const errors = prompts.flatMap((p) => p.errors)
  const files = new Map<string, string>()
  const selected = prompts.filter(
    (p) => withExecuteHats || p.frontmatter.metadata?.track !== EXECUTE_TRACK,
  )
  for (const p of selected) {
    const name = p.frontmatter.name
    if (!name) continue
    files.set(`${name}/SKILL.md`, renderSkillMd(p.frontmatter, rewriteLinks(p.body)))
    for (const res of referencedResources(p.body)) {
      const src = path.join(promptsDir, res)
      if (existsSync(src)) files.set(`${name}/references/${res}`, readFileSync(src, 'utf8'))
      else errors.push(`${p.file}: 引用的资源不存在: ${res}`)
    }
  }
  files.set('README.md', renderReadme(selected, { withExecuteHats }))
  return { files, skills: selected, errors }
}

export function buildSkills({
  promptsDir,
  outDir,
  withExecuteHats = false,
}: {
  promptsDir: string
  outDir: string
  withExecuteHats?: boolean
}): { written: string[] } {
  const { files, errors } = generateSkills({ promptsDir, withExecuteHats })
  if (errors.length > 0) {
    const err = new Error(`skills build 前置校验失败:\n${errors.join('\n')}`)
    throw err
  }
  rmSync(outDir, { recursive: true, force: true })
  const written: string[] = []
  for (const [rel, content] of [...files.entries()].sort()) {
    const abs = path.join(outDir, rel)
    mkdirSync(path.dirname(abs), { recursive: true })
    writeFileSync(abs, content)
    written.push(rel)
  }
  return { written }
}

function readTreeFiles(dir: string): Map<string, string> {
  const out = new Map<string, string>()
  const walk = (cur: string, rel: string): void => {
    if (!existsSync(cur)) return
    for (const entry of readdirSync(cur, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const abs = path.join(cur, entry.name)
      const r = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(abs, r)
      else out.set(r, readFileSync(abs, 'utf8'))
    }
  }
  if (existsSync(dir)) walk(dir, '')
  return out
}

export function checkSkills({
  promptsDir,
  skillsDir,
}: {
  promptsDir: string
  skillsDir: string
}): { ok: boolean; errors: string[] } {
  const { files: expected, errors } = generateSkills({ promptsDir })
  if (errors.length > 0) return { ok: false, errors }
  const actual = readTreeFiles(skillsDir)
  const driftErrors: string[] = []
  for (const key of [...expected.keys()].sort()) {
    if (!actual.has(key)) driftErrors.push(`缺失: ${key}`)
    else if (actual.get(key) !== expected.get(key)) driftErrors.push(`drift: ${key}`)
  }
  for (const key of [...actual.keys()].sort()) {
    if (!expected.has(key)) driftErrors.push(`多余（非生成物或执行帽误入）: ${key}`)
  }
  return { ok: driftErrors.length === 0, errors: driftErrors }
}

const SKILLS_USAGE = `用法:
  npx dsh-coding-kit skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
  npx dsh-coding-kit skills build [--with-execute-hats]
  npx dsh-coding-kit skills check

落点说明：.dsh/skills 两个安装落点已对照 DSH 上游源码验证（deepseek-harness@141eb6f · 0.1.0-rc.8）——
DSH runtime 自动扫描 <repo>/.dsh/skills 与 $HOME/.dsh/skills 并按需加载；
证据锚点 packages/skill/skill-filesystem/src/index.ts:246 / :253，详见 README「扫描验证」节。
`

const EXECUTE_HAT_DIRS = new Set(['harness-30-execute', 'harness-40-self-check'])

function posixNorm(absPath: string): string {
  return path.resolve(absPath).replace(/\\/g, '/')
}

function isCodingKitDest(absDest: string): boolean {
  const n = posixNorm(absDest)
  return (
    n.endsWith('/.coding-kit') ||
    n.includes('/.coding-kit/') ||
    n.endsWith('/.dsh/coding-kit') ||
    n.includes('/.dsh/coding-kit/')
  )
}

function isS2Dest(absDest: string): boolean {
  const n = posixNorm(absDest)
  if (n.endsWith('/.dsh/skills') || n.includes('/.dsh/skills/')) return false
  return (
    n.endsWith('/docs/tasks') ||
    n.includes('/docs/tasks/') ||
    n.endsWith('/invokes/by-task') ||
    n.includes('/invokes/by-task/') ||
    n.endsWith('/reviews') ||
    n.includes('/reviews/')
  )
}

function isExecuteHatSkipped(
  parentDir: string,
  name: string,
  withExecuteHats: boolean,
): boolean {
  if (withExecuteHats) return false
  if (EXECUTE_HAT_DIRS.has(name)) return true
  const skillMd = path.join(parentDir, name, 'SKILL.md')
  if (!existsSync(skillMd) || !statSync(skillMd).isFile()) return false
  const { frontmatter } = parseSkillPrompt(readFileSync(skillMd, 'utf8'))
  return frontmatter?.metadata?.track === EXECUTE_TRACK
}

function listCopyableSkillDirs(src: string, withExecuteHats: boolean): string[] {
  return readdirSync(src, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && !isExecuteHatSkipped(src, ent.name, withExecuteHats))
    .map((ent) => ent.name)
    .sort()
}

function copySkillsTree({
  src,
  dest,
  force,
  withExecuteHats,
}: {
  src: string
  dest: string
  force: boolean
  withExecuteHats: boolean
}): { copied: number; skipped: number } {
  let copied = 0
  let skipped = 0
  const visit = (from: string, to: string): void => {
    mkdirSync(to, { recursive: true })
    for (const ent of readdirSync(from, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (ent.isDirectory()) {
        if (isExecuteHatSkipped(from, ent.name, withExecuteHats)) continue
        visit(path.join(from, ent.name), path.join(to, ent.name))
        continue
      }
      if (!ent.isFile()) continue
      const destFile = path.join(to, ent.name)
      if (existsSync(destFile) && !force) {
        skipped += 1
        continue
      }
      mkdirSync(path.dirname(destFile), { recursive: true })
      copyFileSync(path.join(from, ent.name), destFile)
      copied += 1
    }
  }
  visit(src, dest)
  return { copied, skipped }
}

function cmdSkillsInstall(args: string[]): void {
  const global = args.includes('--global')
  const force = args.includes('--force')
  const withExecuteHats = args.includes('--with-execute-hats')
  let rest = args.filter(
    (a) => a !== '--global' && a !== '--force' && a !== '--with-execute-hats',
  )
  const { value: targetArg, rest: r1 } = takeOption(rest, '--target')
  rest = r1
  const { value: outArg, rest: r2 } = takeOption(rest, '--out')
  rest = r2
  if (rest.length > 0) fail(`skills install 未知参数: ${rest.join(' ')}\n${SKILLS_USAGE}`)
  const hasTarget = targetArg !== undefined
  const hasOut = outArg !== undefined
  if (global && (hasOut || hasTarget)) {
    fail(`\`--global\` 与 \`--out\` / \`--target\` 互斥\n${SKILLS_USAGE}`)
  }
  if (hasOut && hasTarget) {
    fail(`\`--out\` 与 \`--target\` 互斥\n${SKILLS_USAGE}`)
  }
  if (hasOut && outArg.startsWith('~')) {
    fail(
      '`--out` 不得以 ~ 开头（禁止在 cwd 创建名为 ~ 的目录）。请用绝对路径或 --global',
    )
  }

  let dest: string
  if (global) {
    const home = os.homedir()
    if (!home) fail('无法解析 homedir（请设置 HOME 或改用 --out 绝对路径）')
    dest = path.join(home, '.dsh', 'skills')
  } else if (hasOut) {
    dest = path.resolve(process.cwd(), outArg)
  } else {
    dest = path.join(resolveTarget(process.cwd(), targetArg), '.dsh', 'skills')
  }
  dest = path.resolve(dest)

  if (isCodingKitDest(dest)) {
    fail('拒写：dest 命中 .dsh/coding-kit 或 .coding-kit（规范覆盖目录 ≠ .dsh/skills）')
  }
  if (isS2Dest(dest)) {
    fail('拒写：dest 命中 S2 过程域（docs/tasks/ · reviews/ · invokes/by-task/）')
  }
  // DEBT R-05：第四拒写分支——dest 命中产品包自身 assets/skills（安装源 ≠ 安装落点），
  // 含其子目录；判定基准与下方 src 同根（packageRoot()/assets/skills）。
  const packageSkillsRoot = posixNorm(path.join(packageRoot(), 'assets', 'skills'))
  const destNorm = posixNorm(dest)
  if (destNorm === packageSkillsRoot || destNorm.startsWith(`${packageSkillsRoot}/`)) {
    fail('拒写：dest 命中产品包自身 assets/skills（安装源 ≠ 安装落点，会自我覆盖发布资产）')
  }
  if (existsSync(dest) && !statSync(dest).isDirectory()) {
    fail(`dest 已存在且为文件（非目录）: ${dest}`)
  }

  // DSH_CK_SKILLS_SRC：内部测试钩子（非公开契约，勿依赖）——允许测试把 skills 源
  // 指向临时副本，避免 install 测试改动包内 assets/skills（DEF-018 T4 / D2=a）。
  const src = process.env.DSH_CK_SKILLS_SRC
    ? path.resolve(process.env.DSH_CK_SKILLS_SRC)
    : path.join(packageRoot(), 'assets', 'skills')
  if (!existsSync(src) || !statSync(src).isDirectory()) {
    fail('源 assets/skills 缺失。消费者请重装 npm 包；维护者请先执行 skills build')
  }
  const skillDirs = listCopyableSkillDirs(src, withExecuteHats)
  if (skillDirs.length === 0) {
    fail(
      '源 assets/skills 无可复制 skill 目录（默认跳过 30/40；可 --with-execute-hats 或先 skills build）',
    )
  }

  const { copied, skipped } = copySkillsTree({ src, dest, force, withExecuteHats })
  console.log(`SKILLS INSTALL: PASS · copied=${copied} skipped=${skipped} → ${dest}`)
}

export async function cmdSkills(args: string[]): Promise<void> {
  const promptsDir = path.join(packageRoot(), 'assets', 'harness', 'prompts')
  const skillsDir = path.join(packageRoot(), 'assets', 'skills')
  const [sub, ...rest] = args
  if (!sub || sub === '--help' || sub === '-h' || args.includes('--help') || args.includes('-h')) {
    console.log(SKILLS_USAGE)
    return
  }
  if (sub === 'install') {
    cmdSkillsInstall(rest)
    return
  }
  if (sub === 'build') {
    const withExecuteHats = rest.includes('--with-execute-hats')
    const unknown = rest.filter((a) => a !== '--with-execute-hats')
    if (unknown.length > 0) fail(`skills build 未知参数: ${unknown.join(' ')}`)
    const { written } = buildSkills({ promptsDir, outDir: skillsDir, withExecuteHats })
    console.log(
      `SKILLS BUILD: PASS · ${written.length} 文件 → ${skillsDir}${withExecuteHats ? '（含执行帽 · 仅供评测环境）' : ''}`,
    )
    return
  }
  if (sub === 'check') {
    const unknown = rest.filter((a) => a !== '--json')
    if (unknown.length > 0) fail(`skills check 未知参数: ${unknown.join(' ')}`)
    const r = checkSkills({ promptsDir, skillsDir })
    if (rest.includes('--json')) console.log(JSON.stringify(r, null, 2))
    else if (r.ok) console.log('SKILLS CHECK: PASS · frontmatter 合法 · skills/ 无 drift')
    else console.log(`SKILLS CHECK: FAIL\n${r.errors.map((e) => `  - ${e}`).join('\n')}`)
    if (!r.ok) fail('skills check FAIL', 2)
    return
  }
  fail(`skills 子命令未知: ${sub ?? '(空)'}\n${SKILLS_USAGE}`)
}
