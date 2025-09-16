import * as fs from 'fs/promises';
import { vi } from 'vitest';
import { output_path_test } from './constant';
// 清理测试生成的文件
export async function cleanupTestFiles() {
  try {
    await fs.unlink(output_path_test)
  } catch {
    // 文件不存在时忽略错误
  }
}

// Mock console 方法以避免测试输出混乱
export function mockConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => { })
  vi.spyOn(console, 'warn').mockImplementation(() => { })
  vi.spyOn(console, 'error').mockImplementation(() => { })
}

// 恢复 console 方法
export function restoreConsole() {
  vi.restoreAllMocks()
}
