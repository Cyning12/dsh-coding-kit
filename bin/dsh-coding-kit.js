#!/usr/bin/env node
import { runCli } from '../lib/cli.js'

runCli(process.argv.slice(2)).catch((err) => {
  if (err && err.message) console.error(err.message)
  process.exit(typeof err?.exitCode === 'number' ? err.exitCode : 1)
})
