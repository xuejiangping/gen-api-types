import type { Plugin } from 'vite';


/**
 * vite插件 ，用来打包时移除 gen_type_c,gen_type_m 等装饰器
 * @returns 
 */
export function removeDecorators(decorators: string[]): Plugin {
  return {
    name: 'removeDecorators',
    transform(code, id) {


      return code
    }
  }
}

