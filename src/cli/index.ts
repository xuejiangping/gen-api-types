#!/usr/bin/env tsx


import * as path from 'path';
import { Project } from 'ts-morph';
import { pathToFileURL } from 'url';
import { isExported, output_dir, output_file, positionals } from '../argv';
import { DECO_NAME_C, DECO_NAME_M } from '../constant';
import { ExecuteApiMethodResult, executeState } from '../state';
import { TypeTransformer } from '../transformer';
import { formatResultList } from '../utils';

// console.log('positionals', positionals)

const sourceFilesGlob = positionals.map(dir => path.normalize(`${dir}/**/*.ts`))
const out_put_target = path.resolve(output_dir, output_file)

// console.log('arg', _arg)
// console.log('sourceFilesGlob', sourceFilesGlob)
// debugger


function getModulePathSet() {
  console.log('sourceFilesGlob', sourceFilesGlob)
  const modulePathSet: Set<string> = new Set()
  // 2. 使用ts-morph创建项目，便于解析源码
  // const project = new Project({ tsConfigFilePath: ts_config_path });
  const project = new Project({});
  project.addSourceFilesAtPaths(sourceFilesGlob);
  // console.log('project.getSourceFiles().length', project.getSourceFiles().length)
  // debugger
  // 3. 遍历所有源文件
  for (const sourceFile of project.getSourceFiles()) {

    const classes = sourceFile.getClasses();
    for (const classDeclaration of classes) {
      const c_deco = classDeclaration.getDecorator(DECO_NAME_C)
      if (!c_deco) continue
      const methods = classDeclaration.getMethods();
      for (const method of methods) {
        const className = classDeclaration.getName()!;
        const methodName = method.getName();
        const fullMethodName = `${className}.${methodName}`;

        // 4. 检查方法是否被我们的装饰器标记
        const m_deco = method.getDecorator(DECO_NAME_M)
        if (!m_deco) continue
        executeState.emit(executeState.ADD_TASK, fullMethodName)
        const modulePath = sourceFile.getFilePath()
        if (!modulePathSet.has(modulePath)) modulePathSet.add(modulePath)


      }
    }
  }
  return modulePathSet
}


/**
 * 引入包含标记的方法的模块，触发装饰器执行，记录执行结果
 * @param modulePathSet 
 * @returns 
 */
async function importApiModule<T extends string>(modulePathSet: Set<T>) {
  modulePathSet.forEach(modulePath => import(pathToFileURL(modulePath).href))
}


function createDeclarationFile(successList: ExecuteApiMethodResult[]) {
  const ttf = new TypeTransformer({ filePath: out_put_target, isExported })
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
    const modulePathSet = getModulePathSet();
    if (modulePathSet.size == 0) return console.warn('⚠️ 未找到需要转换的API,请检查api_dir 和 gen_type装饰器标注是否正确!')
    importApiModule(modulePathSet);
    // executeState.addListener(executeState.TASKLIST_CLEAR, executeResultList=>{
    // })

    const executeResultList = await executeState.promise
    const { successList: executeSuccessList, errorList: executeErrorList } = formatResultList(executeResultList)
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
    if (transformSuccessList.length) console.log('✅ API 类型生成完成：', out_put_target);
  } catch (error) {
    console.error('❌ 出错了', error)
  }

}

main()
