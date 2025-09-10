// scripts/generate-api-types.ts
import * as path from 'path';
import { Decorator, Project } from 'ts-morph';
import { parseArgs } from 'util';
import { DECO_NAME } from '../constant';
import { GenTypeOptions } from '../decotators';
import { TypeTransformer } from '../transformer';





// 1. 配置
const PROJECT_ROOT = path.resolve();
const OUTPUT_FILE = 'index.d.ts'; // 类型输出目录
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
    deco_name: {
      type: 'string',
      short: 'd',
      default: DECO_NAME,
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
    }
  }
})
const { positionals, values: { project_root, output_file, output_dir, deco_name, ts_config_path } } = _arg
if (positionals.length == 0) throw new Error('no api dirs')
const sourceFilesGlob = positionals.map(apiDir => path.normalize(`${apiDir}/**/*.ts`))

console.log('arg', _arg)
console.log('sourceFilesGlob', sourceFilesGlob)
// debugger

type ApiMethodInfo = {
  className: string,
  methodName: string,
  fullMethodName: string,
  modulePath: string,
  args: any[],
  typeName: string,
}

function parserDecoArgs(deco: Decorator): GenTypeOptions {

  try {
    const optionStr = deco.getArguments()[0]?.getText()
    if (!optionStr) return {}
    const option = eval(`(()=>(${optionStr}))()`)
    if (typeof option === 'object') return option
    else return {}
  } catch (error) {
    return {}
  }

}
function getApiMethodsInfo() {
  console.log('sourceFilesGlob', sourceFilesGlob)
  const apiMethodsInfo: ApiMethodInfo[] = []
  // 2. 使用ts-morph创建项目，便于解析源码
  const project = new Project({ tsConfigFilePath: ts_config_path });
  project.addSourceFilesAtPaths(sourceFilesGlob);
  // 3. 遍历所有源文件
  for (const sourceFile of project.getSourceFiles()) {
    const classes = sourceFile.getClasses();
    for (const classDeclaration of classes) {
      const methods = classDeclaration.getMethods();
      for (const method of methods) {
        // 4. 检查方法是否被我们的装饰器标记
        const deco = method.getDecorator(deco_name)
        // 更可靠的方式：直接从编译后的JS中提取元数据（如果需要）
        // 这种方式更复杂，但更准确，需要编译代码后通过Reflect.getMetadata读取
        // debugger

        if (deco) {
          debugger

          const className = classDeclaration.getName()!;
          const methodName = method.getName();
          const fullMethodName = `${className}.${methodName}`;
          const { args = [], typeName = `Response_${className}_${methodName}` } = parserDecoArgs(deco)
          apiMethodsInfo.push({
            className, methodName, fullMethodName, modulePath: sourceFile.getFilePath(),
            typeName, args
          })

        }
      }
    }
  }
  return apiMethodsInfo
}



async function excuteApiMethods(apiMethodsInfo: ApiMethodInfo[]) {
  const apiModuleMap = new Map<string, any>();
  const taskList = apiMethodsInfo.map(async (apiMethodInfo) => {
    const { className, methodName, fullMethodName, modulePath, args, typeName } = apiMethodInfo
    console.log(`📋 处理 ${fullMethodName}...`);
    let apiModule = null
    if (apiModuleMap.has(modulePath)) apiModule = apiModuleMap.get(modulePath)
    else {
      apiModule = await import(`file:///${modulePath}`)
      if (apiModule) apiModuleMap.set(modulePath, apiModule)
    }

    const apiMethod = apiModule?.[className]?.[methodName]
    if (apiMethod && typeof apiMethod === 'function') {
      try {
        console.log(`🔍 Calling ${fullMethodName} with args:`, args);
        const result = apiMethod.apply(apiModule, args)
        if (result instanceof Promise) {
          const data = await result
          console.log(`${fullMethodName} result:`)
          return { data, typeName }
        }
      } catch (error) {
        console.error(`❌ ${fullMethodName} error:`, error)
      }
    } else {
      console.error(`❌ 无法获取 ${fullMethodName}或 非 可调用方法 `)
    }
  })

  const resultList = await Promise.all(taskList)
  return resultList.filter(item => Boolean(item))
}

function createDeclarationFile(excutedResultList: Awaited<ReturnType<typeof excuteApiMethods>>) {
  const out_put_target = path.resolve(output_dir, output_file)
  // console.log('out_put_target', out_put_target)
  const ttf = new TypeTransformer({ filePath: out_put_target })
  const tasks = excutedResultList.map(item => {
    return ttf.transform(item?.data, item?.typeName!)
  })
  return Promise.all(tasks)
}

async function main() {
  try {
    console.log('🚀 开始生成API类型...');
    const apiMethodsInfo = getApiMethodsInfo();
    const resultList = await excuteApiMethods(apiMethodsInfo);
    await createDeclarationFile(resultList)
    console.log('✅ API类型生成完成');

  } catch (error) {
    console.error('❌ 出错了', error)
  }

}

main()
