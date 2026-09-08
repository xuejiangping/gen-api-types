// import 'reflect-metadata';

import { DECO_NAME_C, DECO_NAME_M } from "../constant";
import { executeState } from "../state";

// 定义一个唯一的metadata key


export interface GenTypeOptions {
  args?: any[];
  typeName?: string;
}
/**
 * 标记方法
 */
export function gen_type_m({ args = [], typeName }: GenTypeOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    console.log('propertyKey', propertyKey)
    // 只存储元数据，不执行任何逻辑
    // Reflect.defineMetadata(
    //   GEN_TYPE_METADATA_KEY,
    //   { args, typeName },
    //   target,
    //   propertyKey
    // );
  };
}


/**
 * 标记类
 */
export function gen_type_c() {
  return function <T>(target: T) {
  };
}


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
          const result = apiMethod.apply(target, args)
          const data = await Promise.resolve(result)

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
