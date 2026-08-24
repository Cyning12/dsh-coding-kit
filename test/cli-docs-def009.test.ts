import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = path.join(KIT, 'assets')

// DEF-009 T1 · assets 相对引用存在性守卫（先红后绿）。
// 扫描面：
//   ① assets/**/*.md 的 ](<相对路径>) 链接（跳过 URL/mailto/锚点/含 < > 的模板占位）；
//   ② assets/**/*.yaml 注释中的相对路径 token（形如 a/b/c.json|md|yaml）。
// 逐一 resolve 到包内真实文件，不存在即悬空引用。
// 豁免：EXEMPTIONS 精确登记（file + target + owner/理由），仅限：
//   - 其他 PRD 名下的悬空指针（修复落地后须同步移除条目；DEF-007 条目已随 1.3.0 修复移除）；
//   - 模板「嵌入后相对」链接（目标路径在消费仓嵌入位置 resolve，非包内位置）。
// 防腐化：每条豁免必须仍真实命中一处悬空（防条目成为永久豁免）。

const EXEMPTIONS: Array<{ file: string; target: string; owner: string }> = [
  // 模板嵌入后相对：VIEW/图谱模板复制到消费仓后 resolve（包内位置不 resolve 属预期）
  { file: 'assets/graph/templates/01_struct.md', target: './00_main.ai.md', owner: 'embedded-relative（嵌入消费仓 _tech_graph/ 后双轨生成）' },
  { file: 'assets/harness/templates/VIEW_done_by_domain.md', target: '../done/README.md', owner: 'embedded-relative（嵌入 docs/tasks/_views/ 后 resolve）' },
  { file: 'assets/harness/templates/VIEW_done_thin_pointer.md', target: '../done/README.md', owner: 'embedded-relative（嵌入 docs/tasks/_views/ 后 resolve）' },
  { file: 'assets/harness/templates/VIEW_done_thin_pointer.md', target: './done_by_domain.md', owner: 'embedded-relative（嵌入 docs/tasks/_views/ 后 resolve）' },
  { file: 'assets/harness/templates/VIEW_done_thin_pointer.md', target: './in_progress.md', owner: 'embedded-relative（嵌入 docs/tasks/_views/ 后 resolve）' },
  // skills 生成物「姊妹帽」跨 skill 引用：目标文件在包内/安装落点均不存在；DEF-009 未列名，
  // 2026-08-24 实测确认悬空，待 00 登记新缺陷后再处理（本棒不动 skills 生成面，防 skills check drift）
  { file: 'assets/skills/harness-10-spec/SKILL.md', target: './10-task-requirements.md', owner: '待登记 · skills 姊妹帽悬空指针' },
  { file: 'assets/skills/harness-10-task/SKILL.md', target: './10-spec-requirements.md', owner: '待登记 · skills 姊妹帽悬空指针' },
  { file: 'assets/skills/harness-20-spec-audit/SKILL.md', target: './20-task-audit.md', owner: '待登记 · skills 姊妹帽悬空指针' },
  { file: 'assets/skills/harness-20-task-audit/SKILL.md', target: './20-spec-audit.md', owner: '待登记 · skills 姊妹帽悬空指针' },
]

interface Hit {
  file: string
  line: number
  target: string
}

function listFiles(dir: string, filter: (name: string) => boolean): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name)
    if (statSync(abs).isDirectory()) out.push(...listFiles(abs, filter))
    else if (filter(name)) out.push(abs)
  }
  return out
}

function collectRefs(): Hit[] {
  const hits: Hit[] = []
  const mdRe = /\]\(([^)\s]+)\)/g
  const yamlTokRe = /(?:\.{1,2}\/)?[\w.-]+\/[\w./-]+\.(?:json|ya?ml|md)/g
  for (const abs of listFiles(ASSETS, (n) => /\.(md|ya?ml)$/.test(n))) {
    const rel = path.relative(KIT, abs)
    const isYaml = /\.ya?ml$/.test(abs)
    const lines = readFileSync(abs, 'utf8').split(/\r?\n/)
    lines.forEach((text, idx) => {
      if (!isYaml) {
        mdRe.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = mdRe.exec(text))) {
          const target = m[1]!.replace(/^<|>$/g, '').split('#')[0]!
          if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue
          if (target.includes('<') || target.includes('>')) continue
          hits.push({ file: rel, line: idx + 1, target })
        }
      } else {
        const cm = /(^|\s)#/.exec(text)
        if (!cm) return
        const comment = text.slice(cm.index + cm[1].length + 1)
        yamlTokRe.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = yamlTokRe.exec(comment))) {
          const target = m[0]
          if (target.includes('<') || target.includes('>')) continue
          hits.push({ file: rel, line: idx + 1, target })
        }
      }
    })
  }
  return hits
}

function dangling(): Hit[] {
  return collectRefs().filter((h) => !existsSync(path.resolve(path.dirname(path.join(KIT, h.file)), h.target)))
}

describe('D-DOC 1.2.4 DEF-009 · assets 相对引用逐一可 resolve', { concurrency: 1 }, () => {
  it('豁免清单外零悬空引用（md 链接 + yaml 注释相对路径）', () => {
    const bad = dangling().filter(
      (h) => !EXEMPTIONS.some((e) => e.file === h.file && e.target === h.target),
    )
    assert.deepEqual(
      bad.map((h) => `${h.file}#${h.line} -> ${h.target}`),
      [],
      '豁免清单外悬空引用（须修复或经 00 登记豁免）：',
    )
  })

  it('豁免每条仍真实命中一处悬空（防腐化为永久豁免；owner PRD 修复后须移除条目）', () => {
    const hits = dangling()
    const stale = EXEMPTIONS.filter(
      (e) => !hits.some((h) => h.file === e.file && h.target === e.target),
    )
    assert.deepEqual(
      stale.map((e) => `${e.file} -> ${e.target} [${e.owner}]`),
      [],
      '豁免条目已不命中（owner PRD 已修复或目标已变动），须同步清理',
    )
  })

  it('扫描面覆盖：md/yaml 引用样本量正常（防空扫假绿）', () => {
    const refs = collectRefs()
    assert.ok(refs.length >= 60, `引用采集数异常：${refs.length}`)
  })
})
