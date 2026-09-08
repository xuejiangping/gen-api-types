import type { Plugin } from 'vite';
import { DECO_NAME_C, DECO_NAME_M } from '../../constant/index.ts';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * 去掉装饰器，用于在项目运行/构建时，gen-api-types的装饰器不会有任何副作用，影响到原来项目代码
 * @param decorators 
 * @returns 
 */
export function removeDecorators(decorators: string[]): Plugin {
  const names = decorators.map(escapeRegExp).join('|');

  const decoratorRegex = new RegExp(
    `^[ \\t]*@(?:${names})(?:\\s*\\([\\s\\S]*?\\))?[ \\t]*\\r?\\n?`,
    'gm'
  );

  return {
    name: 'removeDecorators',
    enforce: 'pre',

    transform(code, id) {
      if (!/\.(ts|tsx)(\?.*)?$/.test(id)) {
        return;
      }

      const transformedCode = code.replace(decoratorRegex, '');

      if (transformedCode === code) {
        return;
      }

      return {
        code: transformedCode,
        map: null
      };
    }
  };
}

export function removeGatDecorators() {
  const decorators = [DECO_NAME_M, DECO_NAME_C]
  return removeDecorators(decorators)
}