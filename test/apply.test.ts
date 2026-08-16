import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { apply, inject, name } from '../src/index.ts'

type RegisteredTool = {
  name: string
  execute: (args: unknown, exec: unknown) => Promise<unknown>
}

function createFakeCtx() {
  const registered: RegisteredTool[] = []
  let contextCalls = 0
  const live = new Map<string, true>()
  const systemPrompt = {
    context(entry: { name: string }) {
      contextCalls += 1
      if (live.has(entry.name)) {
        throw new Error(`duplicate context: ${entry.name}`)
      }
      live.set(entry.name, true)
      return () => {
        live.delete(entry.name)
      }
    },
  }
  const ctx = {
    get(service: string) {
      if (service === 'systemPrompt') return systemPrompt
      return undefined
    },
    tools: {
      register(def: RegisteredTool) {
        registered.push(def)
        return () => {}
      },
    },
  }
  return {
    ctx,
    registered,
    contextCalls: () => contextCalls,
    live,
  }
}

describe('T1/T6 apply()', { concurrency: 1 }, () => {
  it('T1: apply() 只 register 工具，不调用 systemPrompt.context', () => {
    const fake = createFakeCtx()
    apply(fake.ctx as never)
    assert.equal(name, 'coding-kit')
    assert.deepEqual(inject, ['tools', 'systemPrompt'])
    assert.equal(fake.contextCalls(), 0)
    const names = fake.registered.map((t) => t.name).sort()
    assert.deepEqual(names, ['apply_coding_standards', 'init_coding_kit'])
  })

  it('源码与测试禁止 ctx.tool()，须 ctx.tools.register(defineTool)', async () => {
    const srcPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.ts')
    const src = await readFile(srcPath, 'utf8')
    const forbidden = 'ctx' + '.tool('
    assert.equal(src.includes(forbidden), false)
    assert.ok(src.includes('ctx.tools.register(defineTool'))
  })

  it('T6: 重复调用 apply_coding_standards 不因 context 重名抛错', async () => {
    const fake = createFakeCtx()
    apply(fake.ctx as never)
    const tool = fake.registered.find((t) => t.name === 'apply_coding_standards')
    assert.ok(tool)
    const exec = { signal: new AbortController().signal }
    await tool.execute({}, exec)
    await assert.doesNotReject(() => tool.execute({}, exec))
    assert.equal(fake.live.has('coding-kit.standards'), true)
    assert.ok(fake.contextCalls() >= 2)
  })
})
