import path from "path";
import { parseArgs } from "util";


// 1. 配置
const PROJECT_ROOT = path.resolve();
const OUTPUT_FILE = 'index.d.ts';
const OUTPUT_DIR = PROJECT_ROOT
const TS_CONFIG_PATH = path.join(PROJECT_ROOT, 'tsconfig.json');



const _arg = parseArgs({
  allowPositionals: true,
  args: process.argv.slice(2),
  options: {
    output_dir: {
      type: 'string',
      short: 'o',
      default: OUTPUT_DIR,
    },
    output_file: {
      type: 'string',
      short: 'O',
      default: OUTPUT_FILE,
    },
    project_root: {
      type: 'string',
      short: 'r',
      default: PROJECT_ROOT,
    },
    ts_config_path: {
      type: 'string',
      short: 't',
      default: TS_CONFIG_PATH,
    },
    help: {
      type: 'boolean',
      short: 'h'
    }
  }
})


export const { positionals, values: { project_root, output_file, output_dir, ts_config_path, help } } = _arg

if (help) {
  console.log(`
  Usage: tsx cli.js [options] [positionals]

  Options:
    -h, --help                  输出帮助信息
    -r, --project_root <path>   项目根目录
    -O, --output_file <path>    输出文件名
    -o, --output_dir <path>     输出目录
    -t, --ts_config_path <path> tsconfig.json 文件路径
    `
  )
  process.exit(0)
}





if (positionals.length == 0) {
  console.error('❌ 错误: 必须指定 API 目录');
  console.log('💡 用法示例: node cli.js ./api-directory');
  process.exit(1)
}
