import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const yaml = require('js-yaml') as {
  load: (input: string) => unknown
  dump: (obj: unknown, opts?: { lineWidth?: number }) => string
}

export function yamlLoad(input: string): unknown {
  return yaml.load(input)
}

export function yamlDump(obj: unknown, opts?: { lineWidth?: number }): string {
  return yaml.dump(obj, opts)
}
