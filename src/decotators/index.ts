// import 'reflect-metadata';

import { DECO_NAME_C, DECO_NAME_M } from "../constant/index.ts";
import { executeState } from "../state/index.ts";
import { executeApiMethod } from "../utils/index.ts";

// 定义一个唯一的metadata key


export interface GenTypeOptions {
  args?: any[];
  typeName?: string;
}


const EXEC_TIMEOUT = 5_000
export class GatDecorator {
  static [DECO_NAME_C]() {
    return function <T>(target: T) {
    };
  }
  static [DECO_NAME_M]({ args = [], typeName }: GenTypeOptions = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {


      (async () => {
        const className = typeof target == 'function' ? target.name : target.constructor.name
        const fullMethodName = `${className}.${propertyKey}`
        console.log('fullMethodName', fullMethodName)
        typeName ??= `Response_${className}_${propertyKey}`
        let resultInfo = null
        try {
          const apiMethod = descriptor.value as Function
          // console.log(`🔍 Calling ${fullMethodName} with args:`, args);

          const data = await executeApiMethod({
            timeout: EXEC_TIMEOUT,
            method: () => apiMethod.apply(target, args)
          })

          resultInfo = { data, typeName, fullMethodName }
        } catch (error) {
          console.error(`❌ ${fullMethodName} execute error:`, error)
          resultInfo = { error, fullMethodName, typeName }
        } finally {
          executeState.emit(executeState.EXECUTE_END, resultInfo)
        }
      })();

    };
  }
}

export const gen_type_c = GatDecorator[DECO_NAME_C]
export const gen_type_m = GatDecorator[DECO_NAME_M]
