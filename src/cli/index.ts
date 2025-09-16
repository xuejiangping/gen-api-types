#!/usr/bin/env tsx


import * as path from 'path';
import { Decorator, Project } from 'ts-morph';
import { pathToFileURL } from 'url';
import { output_dir, output_file, positionals } from '../argv';
import { C_DECO_NAME, M_DECO_NAME } from '../constant';
import { GenTypeOptions } from '../decotators';
import { TypeTransformer } from '../transformer';
import { formatResultList } from '../utils';



const sourceFilesGlob = positionals.map(dir => path.normalize(`${dir}/**/*.ts`))
const out_put_target = path.resolve(output_dir, output_file)

// console.log('arg', _arg)
// console.log('sourceFilesGlob', sourceFilesGlob)
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
  const errMsg = `装饰器参数错误`
  try {
    const optionStr = deco.getArguments()[0]?.getText()
    if (!optionStr) return {}
    const option = eval(`(()=>(${optionStr}))()`)
    if (typeof option === 'object') return option
    else throw new Error(errMsg)
  } catch (error) {
    console.warn('parserDecoArgs error', error)
    return {}
  }

}
function getApiMethodsInfo() {
  console.log('sourceFilesGlob', sourceFilesGlob)
  const apiMethodsInfo: ApiMethodInfo[] = []
  // 2. 使用ts-morph创建项目，便于解析源码
  // const project = new Project({ tsConfigFilePath: ts_config_path });
  const project = new Project({});

  project.addSourceFilesAtPaths(sourceFilesGlob);
  // debugger
  // 3. 遍历所有源文件
  for (const sourceFile of project.getSourceFiles()) {

    const classes = sourceFile.getClasses();
    for (const classDeclaration of classes) {
      const c_deco = classDeclaration.getDecorator(C_DECO_NAME)
      if (!c_deco) continue
      const methods = classDeclaration.getMethods();
      for (const method of methods) {

        const className = classDeclaration.getName()!;
        const methodName = method.getName();
        const fullMethodName = `${className}.${methodName}`;

        if (!method.isStatic()) {
          console.warn(`⚠️  ${fullMethodName} is not static method,only static method can be transformed`)
          continue
        }
        // 4. 检查方法是否被我们的装饰器标记
        const m_deco = method.getDecorator(M_DECO_NAME)
        if (!m_deco) continue

        const { args = [], typeName = `Response_${className}_${methodName}` } = parserDecoArgs(m_deco)
        apiMethodsInfo.push({
          className, methodName, fullMethodName, modulePath: sourceFile.getFilePath(),
          typeName, args
        })

      }
    }
  }
  return apiMethodsInfo
}

type ExecuteApiMethodResult = {
  data?: any, typeName: string, fullMethodName: string, error?: any
}
async function executeApiMethods(apiMethodsInfo: ApiMethodInfo[]): Promise<ExecuteApiMethodResult[]> {
  const apiModuleMap = new Map<string, any>();
  const taskList = apiMethodsInfo.map(async (apiMethodInfo) => {
    const { className, methodName, fullMethodName, modulePath, args, typeName } = apiMethodInfo
    console.log(`📋 处理 ${fullMethodName} ...`);
    let apiModule = null
    if (apiModuleMap.has(modulePath)) apiModule = apiModuleMap.get(modulePath)
    else {
      // apiModule = await import(modulePath)
      // debugger
      // console.log('modulePath', modulePath)
      // console.log('pathToFileURL(modulePath).href', pathToFileURL(modulePath).href)

      try {
        apiModule = await import(pathToFileURL(modulePath).href)
        // console.log('apiMethod', apiModule)
        if (apiModule) apiModuleMap.set(modulePath, apiModule)
      } catch (error) {
        console.log('import modulePath error', error)
      }

    }
    const apiMethod = apiModule?.[className]?.[methodName]
    if (apiMethod && typeof apiMethod === 'function') {
      try {
        // console.log(`🔍 Calling ${fullMethodName} with args:`, args);
        const result = apiMethod.apply(apiModule, args)
        if (result instanceof Promise) {
          const data = await result
          // console.log(`${fullMethodName} result`)
          return { data, typeName, fullMethodName }
        }
        return { error: 'not Promise method', fullMethodName, typeName }
      } catch (error) {
        console.error(`❌ ${fullMethodName} execute error:`, error)
        return { error, fullMethodName, typeName }
      }
    } else {
      console.error(`❌ 无法获取 ${fullMethodName}或 非 可调用方法 `)
      return {
        error: `method error`, fullMethodName, typeName
      }
    }
  })

  return Promise.all(taskList)

}


function createDeclarationFile(successList: ExecuteApiMethodResult[]) {
  const ttf = new TypeTransformer({ filePath: out_put_target })
  const tasks = successList.map(async ({ data, typeName, fullMethodName }) => {
    try {
      await ttf.transform(data, typeName)
      return { fullMethodName }
    } catch (error) {
      console.error('transform error', error)
      return { fullMethodName, error }
    }
  })
  return Promise.all(tasks)
}




async function main() {
  try {
    console.log('🚀 开始生成API类型...');
    const apiMethodsInfo = getApiMethodsInfo();

    const executeList = await executeApiMethods(apiMethodsInfo);

    const { successList: executeSuccessList, errorList: executeErrorList } = formatResultList(executeList)
    if (executeErrorList.length) {
      console.group('请求结果：')
      console.table({
        "✔️ executeSuccessList": executeSuccessList.map(item => item.fullMethodName).join(' '),
        "❌ executeErrorList": executeErrorList.map(item => item.fullMethodName).join(' ')
      })
      console.groupEnd()
    }
    const transformList = await createDeclarationFile(executeSuccessList)
    const { successList: transformSuccessList, errorList: transformErrorList } = formatResultList(transformList)

    if (transformErrorList.length) {
      console.group('转换结果：')
      console.table({
        "✔️ transformSuccessList": transformSuccessList.map(item => item.fullMethodName).join(' '),
        "❌ transformErrorList": transformErrorList.map(item => item.fullMethodName).join(' ')
      })
      console.groupEnd()

    }


    console.log('✅ API 类型生成完成：', out_put_target);



  } catch (error) {
    console.error('❌ 出错了', error)
  }

}

main()
