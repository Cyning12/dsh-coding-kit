import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateSkills } from '../src/cli-skills.ts'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const README = path.join(KIT, 'README.md')
const SKILLS_README = path.join(KIT, 'assets', 'skills', 'README.md')
const RENDER_SRC = path.join(KIT, 'src', 'cli-skills.ts')
const PROMPTS_DIR = path.join(KIT, 'assets', 'harness', 'prompts')
const CURRENT_LEGACY_BUILD = 'npx @cyning/harness skills build'
const HARNESS_BUILD_ENTRY = 'harness skills build'

function extractRenderReadmeSrc(src: string): string {
  const start = src.indexOf('function renderReadme')
  const end = src.indexOf('export function generateSkills')
  assert.ok(start >= 0 && end > start, 'renderReadme() 源码边界')
  return src.slice(start, end)
}

function extractPromptBody(readme: string): string {
  const m = readme.match(/````text\r?\n([\s\S]*?)\r?\n````/)
  assert.ok(m && m[1] !== undefined, 'README 须含外层 ≥4 反引号 + text 的可复制 Prompt')
  return m[1]
}

describe('D-DOC 1.2.1 README / renderReadme', { concurrency: 1 }, () => {
  it('D-DOC: README 命令表分列 skills install / build / check；钉 1.6.1 Prompt；路径对照；扫描验证（已对照上游源码）', () => {
    const readme = readFileSync(README, 'utf8')
    assert.match(readme, /npx dsh-coding-kit skills install/)
    assert.match(readme, /npx dsh-coding-kit skills build/)
    assert.match(readme, /npx dsh-coding-kit skills check/)
    assert.equal(/skills build\|check/.test(readme), false)
    assert.equal(/build\|check\|install/.test(readme), false)
    assert.equal(/1\.2\.0 发布前仍允许双包/.test(readme), false)

    const prompt = extractPromptBody(readme)
    assert.doesNotMatch(prompt, /```/)
    assert.doesNotMatch(prompt, /~~~/)
    assert.match(prompt, /dsh-coding-kit@1\.6\.1/)
    assert.match(prompt, /Minimal path/)
    assert.match(prompt, /npx dsh-coding-kit upgrade --yes/)
    assert.match(prompt, /Commands are always npx dsh-coding-kit/)
    assert.match(prompt, /Never write npx @cyning\/harness skills build again/)
    assert.match(prompt, /Recommended \(not required/)
    assert.match(prompt, /npx dsh-coding-kit skills install/)
    assert.match(prompt, /skills install --global/)
    assert.match(readme, /recommended, not required|Recommended \(not required/)
    assert.match(prompt, /\.dsh\/skills/)
    assert.match(prompt, /\$HOME\/\.dsh\/skills/)
    assert.match(prompt, /\.claude\/skills/)
    assert.match(prompt, /\.dsh\/coding-kit/)
    assert.match(prompt, /Do NOT: GitHub Archive/)

    assert.match(readme, /assets\/skills/)
    assert.match(readme, /<repo>\/\.dsh\/skills/)
    assert.match(readme, /\$HOME\/\.dsh\/skills/)
    assert.match(readme, /\.claude\/skills/)
    assert.match(readme, /\.dsh\/coding-kit/)

    assert.match(readme, /installation target/)
    assert.match(readme, /automatically scans/)
    assert.match(readme, /upstream source/)
    assert.match(readme, /loads them on demand/)
    // R-08 已验证口径：扫描验证节 + 证据锚点（DSH 源文件#行）+ 旧免责措辞清零
    assert.match(readme, /### Scan verification \(checked against DSH upstream source\)/)
    assert.match(readme, /Verified \(2026-08-22 · against DSH upstream source deepseek-harness@141eb6f/)
    assert.match(readme, /packages\/skill\/skill-filesystem\/src\/index\.ts:246/)
    assert.match(readme, /:253/)
    assert.match(readme, /rank 100/)
    assert.match(readme, /<name>\/SKILL\.md/)
    assert.match(readme, /frontmatter must include/)
    assert.doesNotMatch(readme, /未对照上游源码做扫描验证|不是「本仓已验证|安装路径不等于已验证|不声称已验证按需加载|不得.*声称已验证/)

    const bashBlocks = [...readme.matchAll(/```bash\r?\n([\s\S]*?)```/g)].map((x) => x[1]).join('\n')
    assert.equal(bashBlocks.includes(CURRENT_LEGACY_BUILD), false)
    const currentAsEntry = [...readme.matchAll(/npx @cyning\/harness skills build/g)]
    assert.equal(currentAsEntry.length, 1)
    assert.match(readme, /Never write npx @cyning\/harness skills build again/)
  })

  it('D-DOC: README / assets/skills/README.md / renderReadme 无现行 harness skills build 入口', () => {
    const readme = readFileSync(README, 'utf8')
    const skillsReadme = readFileSync(SKILLS_README, 'utf8')
    const renderSrc = extractRenderReadmeSrc(readFileSync(RENDER_SRC, 'utf8'))

    assert.equal(renderSrc.includes(CURRENT_LEGACY_BUILD), false)
    assert.equal(skillsReadme.includes(CURRENT_LEGACY_BUILD), false)
    assert.equal(renderSrc.includes(HARNESS_BUILD_ENTRY), false)
    assert.equal(skillsReadme.includes(HARNESS_BUILD_ENTRY), false)
    assert.match(renderSrc, /npx dsh-coding-kit skills build/)
    assert.match(skillsReadme, /npx dsh-coding-kit skills build/)
    assert.match(skillsReadme, /npx dsh-coding-kit skills install/)
    assert.match(skillsReadme, /\.dsh\/skills/)
    assert.match(skillsReadme, /\.claude\/skills/)
    assert.match(skillsReadme, /\.dsh\/coding-kit/)
    assert.match(skillsReadme, /不是.*skill 目录|不是 skill 目录/)
    assert.match(skillsReadme, /安装落点/)
    assert.match(skillsReadme, /自动扫描/)
    assert.match(skillsReadme, /按需加载/)
    assert.match(skillsReadme, /上游源码/)
    // R-08 已验证口径 + 证据锚点 + 旧免责措辞清零
    assert.match(skillsReadme, /已验证（2026-08-22 · 对照 DSH 上游源码 deepseek-harness@141eb6f/)
    assert.match(skillsReadme, /skill-filesystem\/src\/index\.ts:246/)
    assert.doesNotMatch(skillsReadme, /不得.*声称已验证|不是「本仓已验证|未对照上游源码/)

    const bashBlocks = [...readme.matchAll(/```bash\r?\n([\s\S]*?)```/g)].map((x) => x[1]).join('\n')
    assert.equal(bashBlocks.includes(HARNESS_BUILD_ENTRY), false)
    assert.equal(bashBlocks.includes(CURRENT_LEGACY_BUILD), false)
  })

  it('D-DOC: generateSkills README 与 assets/skills/README.md 一致，且无 harness skills build 现行入口', () => {
    const { files } = generateSkills({ promptsDir: PROMPTS_DIR })
    const generated = files.get('README.md')
    assert.ok(generated, 'generateSkills 须产出 README.md')
    const onDisk = readFileSync(SKILLS_README, 'utf8')
    assert.equal(onDisk, generated)
    assert.equal(generated.includes(HARNESS_BUILD_ENTRY), false)
    assert.equal(generated.includes(CURRENT_LEGACY_BUILD), false)
    assert.match(generated, /npx dsh-coding-kit skills build/)
    assert.match(generated, /npx dsh-coding-kit skills build --with-execute-hats/)
  })
})
