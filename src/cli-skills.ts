import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fail, packageRoot } from './cli-shared.ts'
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
    .filter((f) => !/^(README|FRAGMENT_|TEMPLATE_)/.test(f))
    .sort()
  const out: SkillPrompt[] = []
  for (const file of files) {
    const content = readFileSync(path.join(promptsDir, file), 'utf8')
    const { frontmatter, body, parseError } = parseSkillPrompt(content)
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
  const excluded = withExecuteHats
    ? ''
    : `
## 执行帽缺席说明

\`harness-30-execute\` / \`harness-40-self-check\`（执行帽）**不在本分发**：其 skill 化须先通过 T1 闸绕开评测（\`eval/t1_gate_bypass/\` S1–S3）。
评测/维护者可用 \`harness skills build --with-execute-hats\` 本地生成（仅供评测环境，勿装入生产 client）。
`
  return `# skills/ · Agent Skills 标准封装（生成物 · 勿手改）

> **本目录由 \`harness skills build\` 生成**；真值 = \`harness/prompts/\` 条文（frontmatter + 正文）。
> 改动请改条文后重跑 build；\`harness skills check\` 会拦截任何手改 drift。
> 规范：https://agentskills.io/specification

## 安装（各 client 路径不同 · 复制或软链均可）

| client | 放置路径 |
|--------|----------|
| Claude Code | \`<repo>/.claude/skills/\` 或 \`~/.claude/skills/\` |
| 其他 skills 兼容 client | 见各 client 文档（Cursor / Codex / Copilot / Gemini CLI …） |

## 技能清单

| skill | hat_id | 用途 |
|-------|--------|------|
${rows}
${excluded}`
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

export async function cmdSkills(args: string[]): Promise<void> {
  const promptsDir = path.join(packageRoot(), 'assets', 'harness', 'prompts')
  const skillsDir = path.join(packageRoot(), 'assets', 'skills')
  const [sub, ...rest] = args
  if (!sub || sub === '--help' || sub === '-h' || args.includes('--help') || args.includes('-h')) {
    console.log(`用法:
  npx dsh-coding-kit skills build [--with-execute-hats]
  npx dsh-coding-kit skills check
`)
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
  fail(`skills 子命令未知: ${sub ?? '(空)'}\n用法: skills build [--with-execute-hats] · skills check`)
}
