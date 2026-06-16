# gen-api-types

#### 介绍

🚀 一个自动生成请求接口返回类型的 cli 小工具

在 ts 项目中，经常需要编写接口返回类型。但是每次都要查看接口文档，手动编写非常麻烦。如果遇到一些第三方接口或者接口文档不全的情况，还需要先调试接口后，再编写接口返回类型，很令人头疼

借助这个工具，我们可以通过 ts 装饰器来标记请求接口的类和方法，然后动态调用这些接口，并将接口返回的数据转换成 ts 类型文件，这样我们就可以在项目中直接使用了

> 注意：
> 该工具需要动态执行 ts 代码（调用项目中的接口模块），因此会通过内置依赖的 `tsx` 执行工具运行，无需额外全局安装 `tsx`。

#### 安装教程

1.npm 安装

```shell
npm install gen-api-types -D

```

#### 使用说明

##### 1. 标记接口类名和方法

```ts
import { gen_type_c, gen_type_m } from 'gen-api-types'

@gen_type_c()
export class TestApi {
	@gen_type_m({ args: [100], typeName: 'XXX' })
	static async getList(id: number): Promise<XXX> {
		return asleep(1000).then(() => {
			return { name: 'zs', id }
		})
	}

	@gen_type_m()
	static getWeather(): Promise<Response_TestApi_getWeather> {
		return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
	}
}
```

如上面代码所示:

- `@gen_type_c`装饰器函数，用来标记接口类。因为工具会动态分析指定目录下的所有 ts 文件，标记接口类，可以帮助我们快速定位接口类
- `@gen_type_m`装饰器函数标记需要转换的请求方法。它可以接收一个配置对象，包含两个字段。
  1.  `typeName: string` 接口返回类型名称，若不指定该字段，默认生成名称为： `Response_${类名}_${方法名}`
  2.  `args：any[] ` 方法参数列表,工具调用请求方法时，会将参数列表传入

##### 2. 执行命令

```shell
npx gen-api-types  -o output_dir -O output_file_name ./api_dir1 ./api_dir2
```

参数说明：

```shell
 Usage: npx gen-api-types [options] [api_dirs...]

Options:
  -h, --help                  输出帮助信息
  -r, --project_root <path>   项目根目录
  -O, --output_file <path>    输出文件名
  -o, --output_dir <path>     输出目录
  -t, --ts_config_path <path> tsconfig.json 文件路径
  --isExported                生成导出的类型声明
```

当然，也可以通过配置 package.json 中的 scripts 来使用

```json
{
	"scripts": {
		"gen_types": "gen-api-types -o output_dir -O output_file_name ./api_dir1 ./api_dir2"
	}
}
```

命令输出：

```shell
🚀 开始生成API类型...
sourceFilesGlob [ 'src\\**\\*.ts' ]
📋 处理 TestApi.getList ...
📋 处理 TestApi.getWeather ...
请求结果：
  ┌────────────────┬──────────────────────────────────────┐
  │ (index)        │ Values                               │
  ├────────────────┼──────────────────────────────────────┤
  │ ✔️ successList │ 'TestApi.getList TestApi.getWeather' │
  │ ❌ errorList   │ ''                                   │
  └────────────────┴──────────────────────────────────────┘
✅ API 类型生成完成
```

##### 3. 使用类型

默认生成类型文件 index.d.ts，且类型声明没有导出

```ts
type XXX = { name: string };
type Response_TestApi_getWeather = {...}
```

可在`tsconfig.json`中配置`include`引用文件

```json
// tsconfig.json
{
	"include": ["index.d.ts"]
}
```

或者直接在接口模块文件顶部通过 reference 引用:

```ts
/// <reference path="./index.d.ts" />
export class TestApi {
	@gen_type_m()
	static getWeather(): Promise<Response_TestApi_getWeather> {
		return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
	}
}

//此时data的类型为Response_TestApi_getWeather
const data = await TestApi.getWeather()
```

如果希望生成可导出的类型声明，可以在执行命令时添加 `--isExported`：

```shell
npx gen-api-types --isExported -o output_dir -O output_file_name ./api_dir1 ./api_dir2
```

生成结果示例：

```ts
export type XXX = { name: string };
export type Response_TestApi_getWeather = {...}
```
