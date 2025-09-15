#!/usr/bin/env node
// 强制使用 tsx 执行当前目录下的 TypeScript 文件
require('child_process').spawnSync(
  'tsx',
  [require.resolve('../src/cli/index.ts'),...process.argv.slice(2)],
  { stdio: 'inherit' }
);