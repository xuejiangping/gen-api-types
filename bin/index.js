#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const cliPath = path.resolve(__dirname, '../src/cli/index.ts');
const tsxCliPath = require.resolve('tsx/cli');

const cp = spawn(process.execPath, [tsxCliPath, cliPath, ...args], {
  stdio: 'inherit',
});

cp.on('exit', code => {
  process.exit(code ?? 1);
});

cp.on('error', err => {
  console.error('执行 gen-api-types 失败', err);
  process.exit(1);
});
