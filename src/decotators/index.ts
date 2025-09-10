// import 'reflect-metadata';

// 定义一个唯一的metadata key


export interface GenTypeOptions {
  args?: any[];
  typeName?: string;
}

export function gen_type({ args = [], typeName }: GenTypeOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 只存储元数据，不执行任何逻辑
    // Reflect.defineMetadata(
    //   GEN_TYPE_METADATA_KEY,
    //   { args, typeName },
    //   target,
    //   propertyKey
    // );
  };
}



export function GenApi() {
  return function <T>(target: T) {
  };
}