#!/usr/bin/env node
// 强制使用 tsx 执行当前目录下的 TypeScript 文件


const { exec,execFile,spawn } = require('child_process');
const path = require('path');
const { promisify } = require('util')
const p_exec = promisify(exec);
const args = process.argv.slice(2);
; (async function () {

  try {
    await p_exec('tsx -v')
    try {
      // const cli_path = path.resolve(__dirname,'../src/cli/index.ts')
      const cli_path = path.resolve('dist/gen_api_types.cli.min.js')

      const cp = spawn('tsx',[cli_path,...args],{ stdio: 'inherit',shell: true })
      cp.on('error',err => console.error('执行 tsx 命令失败',err))



    } catch (error) {
      // console.error('执行 tsx 命令失败',error)
    }


  } catch (error) {
    console.error('请安装 tsx',error)
  }

})();

