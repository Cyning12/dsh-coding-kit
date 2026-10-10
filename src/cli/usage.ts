import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { HARNESS_META_HEADING, packageRoot } from '../cli-shared.ts'
import { loadMarkdownBundle, type AssetSource } from '../inject-collect.ts'

// DEF-003 阶段二 T6 + PRD_DEF-003 后续棒 + doc-health：close 守卫求值顺序
export const CLOSE_GUARD_ORDER = [
  'close_invoke',
  'close_self_check',
  'close_acceptance',
  'close_slug',
  'close_status',
  'close_review',
  'close_graph_delta',
  'close_kpi',
  'close_experience',
  'close_wiki_delta',
  'close_wiki_promotion',
  'close_pr_merged',
  'close_hub_index',
]
// init --preset 合法词表（DEF-013 D1：当前唯一合法值；新增 preset 须先扩展此常量）
export const VALID_PRESETS = ['harness-only'] as const

// 2.2-W3 C2（安全设计 §7.2 · SPEC 02 §W3）：verify --json 可观测四字段 —— 契约只增不改。
// exitCode 同源纪律（R3）：BLOCKED 退出码唯一常量，JSON 字段与 fail() 共用，禁止两处各算。
export const VERIFY_BLOCKED_EXIT_CODE = 2

// verify --json 可观测载荷：traceId 单次运行标识（进程内时间戳+随机 · 零依赖零云 · 不接外部遥测）；
// source/injectedFiles 复用 M1 注入清单单一实现（inject-collect · DEF-017 同口径 · profile 取注入默认档 l1+l2），
// 作为提示词供应链（T-03）取证基线。
export type VerifyObservability = {
  traceId: string
  source: AssetSource
  injectedFiles: string[]
}

export async function collectVerifyObservability(): Promise<VerifyObservability> {
  const traceId = `verify-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`
  const bundle = await loadMarkdownBundle('l1+l2')
  return { traceId, source: bundle.source, injectedFiles: bundle.files }
}

export async function readPkgVersion(): Promise<string> {
  if (process.env.HARNESS_VERSION) return process.env.HARNESS_VERSION
  const raw = await readFile(path.join(packageRoot(), 'package.json'), 'utf8')
  const pkg = JSON.parse(raw) as { version?: string }
  return pkg.version ?? 'unknown'
}

export function usage(version: string): void {
  console.log(`SpecWave CLI (v${version})
过渡: npx dsh-coding-kit 仍可用（同入口）

用法:
  npx spec-wave --version | -V
  npx spec-wave --help | -h
  npx spec-wave init [--preset NAME] [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt] [--target PATH] [--yes]  （NAME 词表: harness-only）
  npx spec-wave upgrade [--target PATH] [--yes]
  npx spec-wave refresh-ide-blocks [--target PATH] [--dry-run] [--yes] [--json]
  npx spec-wave check [--target PATH]
  npx spec-wave verify [--target PATH] [--task FILE | --spec FILE] [--json] [--with-wiki-lint]
  npx spec-wave gate-check [--target PATH] [--task FILE] [--json]
  npx spec-wave audit [--target PATH] [--task FILE]
  npx spec-wave task lint --file PATH
  npx spec-wave task close --file PATH [--yes] [--json]
  npx spec-wave status [--target PATH] [--task FILE] [--json] [--check]
  npx spec-wave timeline --task FILE [--target PATH] [--json] [--limit N] [--ingest]
  npx spec-wave lifecycle show [--json]
  npx spec-wave lifecycle dry-run --transition ID --from STATE [--task PATH] [--target PATH]
  npx spec-wave discipline show [--json]
  npx spec-wave graph yaml compile|check|export …
  npx spec-wave graph scaffold [--target PATH] [--yes] …  （可审草稿 · 非权威真值）
  npx spec-wave graph ingest|snapshot|axioms …
  npx spec-wave sync index [--target PATH]
  npx spec-wave sync prompts [--target PATH] [--yes] [--force] [--json]
  npx spec-wave skills install [--target DIR] [--out DIR] [--global] [--force] [--with-execute-hats]
  npx spec-wave skills build [--with-execute-hats]
  npx spec-wave skills check
  npx spec-wave host validate [--file PATH] [--json]
  npx spec-wave host apply --tools LIST [--profile core] [--target PATH] [--file PATH] [--json] [--dry-run|--yes]
  npx spec-wave host update [--tools LIST] [--profile core] [--target PATH] [--file PATH] [--json] [--dry-run|--yes] [--force]
  npx spec-wave host verify [--tools LIST|all] [--profile core|expanded] [--target PATH] [--file PATH] [--json]  （物化校验 · 篡改报红 exit 2 · fail-closed）
  npx spec-wave host catalog list [--target PATH] [--json]  （B5 适配表目录 · 内置+用户表来源/完整性 · sha256 呈现即强制）
  npx spec-wave hook-guard --trigger pre-commit|pre-archive [--command GATE_CMD] [--target PATH]  （宿主 hook 门禁分发 · 门禁红 exit 2 阻断）
  npx spec-wave wiki export --json [--target PATH] [--root DIR] [--out FILE|-] [--backlinks|--no-backlinks] [--incremental] [--check-conflicts]
  npx spec-wave pins check [--target PATH] [--json]
  npx spec-wave pins fix [--target PATH] [--yes]  （默认 dry-run · S2 机械拒写）
  npx spec-wave pins check --consumer [--target PATH] [--json] [--truth <path#jsonpath>]
  npx spec-wave pins fix --consumer [--target PATH] [--yes] [--truth <path#jsonpath>]
    分工: release 模式（无 --consumer）= 发布仓自身（assets/release-pins.yaml）· --consumer = 消费仓钉版保鲜（回退链 devDependencies→dependencies→version · 声明源 .spec-wave/pins-consumer.yaml 可选 · 缺省钉 CI workflow 字面）
  npx spec-wave assets verify [--target PATH] [--json]  （assets sha256 完整性 · 偏差 exit 2）
  npx spec-wave assets manifest rebuild [--target PATH] [--yes]  （默认 dry-run · 修复对象=manifest · 资产永不反向改）
  npx spec-wave task lint-done [--target PATH]
  npx spec-wave task lint-wiki-delta [--target PATH] [--scope all|active|done] [--strict] [--json]
    诊断码: wiki_delta_missing（缺字段）· wiki_delta_wrong_section（字段写在 ${HARNESS_META_HEADING} 之外的节 · 替代 missing 不双报）
    --strict 追加: wiki_delta_invalid / wiki_delta_path_missing；task lint --file E8 同口径查 wiki_delta 存在性
  npx spec-wave task check --file PATH

Exit codes (P0 gates · failClosed):
  0  pass / informational (check always exits 0)
  1  usage error or non-blocking failure
  2  gate BLOCKED — do not proceed (verify / gate-check / audit / D5)
`)
}

export const INIT_USAGE =
  'init [--preset NAME] [--tools all|none|LIST] [--profile core|expanded] [--host-adapt|--no-host-adapt] [--target PATH] [--yes]  （NAME 词表: harness-only）'

export const TASK_USAGE =
  'task lint --file PATH · task close --file PATH [--yes] [--json] [--allow-unchecked] [--allow-invoke-gap] [--allow-no-review] [--allow-kpi-gap] [--allow-experience-gap] [--allow-wiki-gap] [--allow-no-pr-merge] [--allow-no-hub] · task lint-done · task lint-wiki-delta · task check --file PATH'
