import { exec } from 'child_process'
import * as fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { output_dir_test, output_fileName_test, output_path_test } from './constant'
import { cleanupTestFiles, mockConsole, restoreConsole } from './setup'
const execAsync = promisify(exec)
const api_dir_test = path.resolve(__dirname, './api/')
describe('执行命令cli测试', () => {
  beforeEach(async () => {
    await cleanupTestFiles()
    mockConsole()
  })

  afterEach(() => {
    restoreConsole()
  })

  it('根据api中标记的请求方法结果,生成对应的类型', async () => {
    // 执行CLI命令生成类型定义
    const { stdout, stderr } = await execAsync(
      `tsx ./src/cli/index.ts ${api_dir_test} -o ${output_dir_test} -O ${output_fileName_test}`,
      { cwd: process.cwd() }
    )
    // 检查是否有错误输出
    // expect(stderr).toMatch(/SampleApi.getUser execute error/)
    expect(stderr).toBe('')

    // 检查生成的文件是否存在
    const outputPath = output_path_test
    const fileExists = await fs.access(outputPath).then(() => true).catch(() => false)
    expect(fileExists).toBe(true)

    // 读取生成的类型定义文件
    const typeDefinitions = await fs.readFile(outputPath, 'utf-8')

    // 验证生成的类型定义包含预期的类型
    expect(typeDefinitions).toContain('Response_SampleApi_getWeather')
    expect(typeDefinitions).toContain('XXX')
  })
})