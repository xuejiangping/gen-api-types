import { Project, SourceFile } from "ts-morph";

function inferType(value: any): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "any[]";
    // 取第一个元素类型，假设数组元素类型一致
    return `${inferType(value[0])}[]`;
  } else if (typeof value === "object" && value !== null) {
    const props = Object.entries(value).map(([k, v]) => `${k}: ${inferType(v)}`).join("; ");
    return `{ ${props} }`;
  } else if (typeof value === "string") {
    return "string";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (!value) {
    return "null";
  } else {
    return "any";
  }
}


export class TypeTransformer {
  project: Project;
  sourceFile: SourceFile;
  constructor({ projectOptions = {}, filePath = "types.d.ts" } = {}) {
    this.project = new Project(projectOptions);
    this.sourceFile = this.createSourceFile(filePath);
  }

  createSourceFile(filePath: string) {
    // try {
    //   return project.addSourceFileAtPath(filePath);
    // } catch (error) {
    //   return project.createSourceFile(filePath);
    // }
    return this.project.createSourceFile(filePath, '', { overwrite: true });
  }

  // 根据运行时对象生成类型定义

  generateTypeFromObject(val: any, typeName: string) {

    // 4. 添加类型别名
    this.sourceFile.addTypeAlias({
      name: typeName,
      // isExported: true,
      type: inferType(val)
    });
  }
  transform(res: any, typeName: string, isAsync = true) {

    this.generateTypeFromObject(res, typeName)
    return this.sourceFile.save();
  }

}




