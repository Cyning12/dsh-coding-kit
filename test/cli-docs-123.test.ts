import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// DEF-002 D-DOC 回归闸：assets 文本面不得残留「现行旧包命令面」。
// 允许保留旧包名的仅剩 D1/D2 拍板的「历史叙事 / 旧机制示例」行，
// 必须逐行登记在下方 LEGACY_ALLOWLIST（文件相对路径 + 行内容精确匹配）。
// DEF-008 T3：扫描面含 templates/ 全目录（含 QUICKREF_v1_zh.md），钉死 templates 无旧包命令面残留。

const LEGACY_ALLOWLIST: Array<{ file: string; line: string }> = [
  // lint-wiki-delta.yml.example · 读 pin 注释块（D2 旧机制示例，#43 注明行覆盖 #47）
  {
    file: 'assets/ci/samples/lint-wiki-delta.yml.example',
    line: '      # 可选 · 读 pin【旧机制示例：旧包 @cyning/harness 已弃用，现行为 dsh-coding-kit；harness.pin.json 为旧包 pin 流程，本包未接线】：',
  },
  {
    file: 'assets/ci/samples/lint-wiki-delta.yml.example',
    line: '      #     npx --yes "@cyning/harness@${PIN}" task lint-wiki-delta --target .',
  },
  // lint-wiki-delta.pin.yml.example · 全文件为 D2 旧机制示例存档（文件头 #2 注明）
  {
    file: 'assets/ci/samples/lint-wiki-delta.pin.yml.example',
    line: '# 【旧机制示例】旧包 @cyning/harness 已弃用，现行为 dsh-coding-kit；本文件仅为旧包 pin 流程存档，',
  },
  {
    file: 'assets/ci/samples/lint-wiki-delta.pin.yml.example',
    line: '# 对比：lint-wiki-delta.yml.example 曾写死 @cyning/harness@2.21（旧包，已弃用，现行为 dsh-coding-kit）。',
  },
  {
    file: 'assets/ci/samples/lint-wiki-delta.pin.yml.example',
    line: '        run: npx --yes "@cyning/harness@${{ steps.pin.outputs.version }}" task lint-wiki-delta --target .',
  },
  {
    file: 'assets/ci/samples/lint-wiki-delta.pin.yml.example',
    line: '      #   run: npx --yes "@cyning/harness@${{ steps.pin.outputs.version }}" task lint-wiki-delta --target . --strict',
  },
  // ONTOLOGY_consumer_slice_v1.md#32 · D1 散文引旧包文档，同行注明
  {
    file: 'assets/harness/templates/ONTOLOGY_consumer_slice_v1.md',
    line: '- **纪律包产品本体**（帽子 / 闸 / HGM）见依赖的 `@cyning/harness` 文档（旧包，已弃用，现行为 dsh-coding-kit），勿在此复制全文。',
  },
]

const LEGACY_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: '@cyning/harness', re: /@cyning\/harness/ },
  { name: 'bare harness skills build/check', re: /(^|[^x ])harness skills (build|check)/ },
]

function listFiles(dir: string, filter: (name: string) => boolean): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name)
    if (statSync(abs).isDirectory()) {
      out.push(...listFiles(abs, filter))
    } else if (filter(name)) {
      out.push(abs)
    }
  }
  return out
}

function scanScope(): string[] {
  const files: string[] = []
  // 帽条文源（含 FRAGMENT/TEMPLATE/README）
  files.push(...listFiles(path.join(KIT, 'assets', 'harness', 'prompts'), (n) => n.endsWith('.md')))
  // skills 生成物
  files.push(...listFiles(path.join(KIT, 'assets', 'skills'), (n) => n.endsWith('.md')))
  // CI 样例
  files.push(...listFiles(path.join(KIT, 'assets', 'ci', 'samples'), (n) => n.endsWith('.example')))
  // DEF-002 T4 补扫资产
  files.push(path.join(KIT, 'assets', 'harness', 'lifecycle.yaml'))
  files.push(path.join(KIT, 'assets', 'coding_wiki', 'templates', 'README.md'))
  // DEF-008 T3：templates/ 全目录（含 QUICKREF_v1_zh.md 与 ONTOLOGY_consumer_slice_v1.md）
  files.push(...listFiles(path.join(KIT, 'assets', 'harness', 'templates'), (n) => n.endsWith('.md')))
  return files
}

describe('D-DOC 1.2.4 DEF-002 · assets 无现行旧包命令面', { concurrency: 1 }, () => {
  it('扫描面内旧包名命中行必须逐行落在 allowlist（清单外命中即失败）', () => {
    const files = scanScope()
    assert.ok(files.length >= 20, `扫描面文件数异常：${files.length}`)
    const violations: string[] = []
    const used = new Set<number>()
    for (const abs of files) {
      const rel = path.relative(KIT, abs)
      const lines = readFileSync(abs, 'utf8').split(/\r?\n/)
      lines.forEach((text, idx) => {
        const hit = LEGACY_PATTERNS.find((p) => p.re.test(text))
        if (!hit) return
        const allowIdx = LEGACY_ALLOWLIST.findIndex(
          (a, i) => !used.has(i) && a.file === rel && a.line === text.trimEnd(),
        )
        if (allowIdx >= 0) {
          used.add(allowIdx)
        } else {
          violations.push(`${rel}#${idx + 1} [${hit.name}]: ${text.trim()}`)
        }
      })
    }
    assert.deepEqual(violations, [], `清单外旧包命令面残留：\n${violations.join('\n')}`)
  })

  it('allowlist 每条必须真实命中（防条目腐化为永久豁免）', () => {
    const files = scanScope()
    const seen = new Set<number>()
    for (const abs of files) {
      const rel = path.relative(KIT, abs)
      const lines = readFileSync(abs, 'utf8').split(/\r?\n/)
      lines.forEach((text) => {
        LEGACY_ALLOWLIST.forEach((a, i) => {
          if (!seen.has(i) && a.file === rel && a.line === text.trimEnd()) seen.add(i)
        })
      })
    }
    const stale = LEGACY_ALLOWLIST.map((a, i) => ({ a, i })).filter(({ i }) => !seen.has(i))
    assert.deepEqual(
      stale.map(({ a }) => `${a.file}: ${a.line.trim().slice(0, 60)}`),
      [],
      'allowlist 存在已不命中的腐化条目，须随资产修订同步清理',
    )
  })

  it('现行命令面断言：prompts 与生成物均为 npx dsh-coding-kit', () => {
    const promptFiles = listFiles(path.join(KIT, 'assets', 'harness', 'prompts'), (n) => n.endsWith('.md'))
    const joined = promptFiles.map((f) => readFileSync(f, 'utf8')).join('\n')
    assert.match(joined, /npx dsh-coding-kit/)
    assert.equal(joined.includes('npx @cyning/harness'), false)
    const skillsFiles = listFiles(path.join(KIT, 'assets', 'skills'), (n) => n.endsWith('.md'))
    const skillsJoined = skillsFiles.map((f) => readFileSync(f, 'utf8')).join('\n')
    assert.equal(skillsJoined.includes('npx @cyning/harness'), false)
    assert.match(skillsJoined, /npx dsh-coding-kit/)
  })
})
