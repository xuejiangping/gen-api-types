# gen-api-types

#### 介绍

🚀 一个自动生成请求接口返回类型的 cli 小工具

在 ts 项目中，经常需要编写接口返回类型。但是每次都要查看接口文档，手动编写非常麻烦。如果遇到一些第三方接口或者接口文档不全的情况，还需要先调试接口后，再编写接口返回类型，很令人头疼

借助这个工具，我们可以通过 ts 装饰器来标记请求接口的类和方法，然后动态调用这些接口，并将接口返回的数据转换成 ts 类型文件，这样我们就可以在项目中直接使用了

> 注意：
>
> 1. 由于需要使用 TypeScript 方法装饰器，接口需要以 **API 类 + API 方法** 的形式书写。
> 2. CLI 会动态导入并执行标记的 API 模块，因此通过项目内置的 `tsx` 运行，不需要全局安装 `tsx`。
> 3. API 方法会在 CLI 进程中真实执行，请确保运行所需的环境变量、网络权限和鉴权配置已经准备好。

#### 安装教程

1.npm 安装

```shell
npm install gen-api-types -D
```

#### 使用说明

##### 1. 标记 API 类和方法

```ts
import { gen_type_c, gen_type_m } from 'gen-api-types'

@gen_type_c()
export class TestApi {
	@gen_type_m({
		args: [100],
		typeName: 'XXX',
	})
	static async getList(id: number): Promise<XXX> {
		return asleep(1000).then(() => {
			return { name: 'zs', id }
		})
	}

	@gen_type_m()
	getWeather(): Promise<Response_TestApi_getWeather> {
		return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
	}
}
```

如上面代码所示:

- `@gen_type_c()` 标记 API 类。
- `@gen_type_m()` 标记需要执行并生成类型的方法。
- `args: any[]` 是调用方法时传入的参数，支持静态方法和非静态方法。
- `typeName: string` 是生成的类型名称；不指定时默认为 `Response_${类名}_${方法名}`。
- 推荐使用导出的 `gen_type_c`、`gen_type_m` 别名。`GatDecorator` 是内部用于按常量名称注册装饰器的容器，不是业务代码必须使用的入口。

装饰器参数可以跨多行书写：

```ts
@gen_type_m({
	args: [100],
	typeName: 'XXX'
})
```

> 注意：

若使用装饰器时 TypeScript 报错“运行时将使用 2 个自变量调用修饰器，但修饰器需要 3 个”，请将 `tsconfig.json` 中的 `compilerOptions.experimentalDecorators` 设置为 `true`。

CLI 默认会为单个 API 方法设置 5 秒执行超时。超时、同步异常或 Promise rejection 都会被记录为该方法的执行失败；超时只能停止等待，不能取消已经发出的底层请求。

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

CLI 会扫描输入目录中的 `.ts` 文件，找到标记的类和方法后，动态导入包含这些方法的模块。模块导入时装饰器会执行 API 方法，所有方法完成后再生成声明文件。

命令输出：

```shell
🚀 开始生成API类型...
sourceFilesGlob [ 'src\\**\\*.ts' ]
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

默认生成类型文件 api-types.d.ts，且类型声明没有导出

```ts
type XXX = { name: string };
type Response_TestApi_getWeather = {...}
```

可在`tsconfig.json`中配置`include`引用

```json
// tsconfig.json
{
	"include": ["api-types.d.ts"]
}
```

或者直接在接口模块文件顶部通过 reference 引用:

```ts
/// <reference path="./api-types.d.ts" />
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

##### 4. Vite 插件

装饰器只用于生成类型，业务项目正常运行或构建时通常不需要执行这些装饰器。Vite 项目可以使用插件移除 `gen_type_c` 和 `gen_type_m`，避免装饰器在业务运行时产生副作用：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { removeGatDecorators } from 'gen-api-types'

export default defineConfig({
	plugins: [removeGatDecorators()],
})
```

插件只处理 `.ts` 和 `.tsx` 文件，并支持单行或多行装饰器参数。推荐在业务代码中使用 `gen_type_c`、`gen_type_m` 别名；如果直接使用 `GatDecorator.gen_type_m()`，不会匹配插件当前的装饰器名称。

Vite 插件只影响 Vite 的转换流程，不参与 CLI 的 API 执行流程。

#### VS Code 插件

如果你在 VS Code 中使用 `gen-api-types` ，可以安装配套插件 [gen-api-types-vsce](https://github.com/xuejiangping/gen-api-types-vsce)，通过右键菜单生成 API 返回类型。
![alt text](docs/images/image.png)

插件不会内置 CLI，它会调用当前业务项目本地安装的 `gen-api-types`：

安装插件后，在已标记装饰器的 `.ts` / `.tsx` 文件中右键选择 `生成 API 返回类型(gen-api-types)` 即可。插件会默认：

- 将当前 TypeScript 文件所在目录作为 `api_dirs` 参数
- 将类型文件生成到当前 TypeScript 文件同目录
- 使用 `api-types.d.ts` 作为默认输出文件名
- 输出文件已存在时弹出覆盖确认

插件支持在 VS Code 设置中配置 CLI 参数：

| 插件配置项                   | 对应 CLI 参数          | 默认行为                          |
| ---------------------------- | ---------------------- | --------------------------------- |
| `gen-api-types.projectRoot`  | `-r, --project_root`   | 当前 TS 文件所在 workspace 根目录 |
| `gen-api-types.outputFile`   | `-O, --output_file`    | `api-types.d.ts`                  |
| `gen-api-types.outputDir`    | `-o, --output_dir`     | 当前 TS 文件所在目录              |
| `gen-api-types.tsConfigPath` | `-t, --ts_config_path` | 不传，由 CLI 使用默认值           |
| `gen-api-types.isExported`   | `--isExported`         | `false`                           |

插件本质上是对 CLI 的 VS Code 入口封装，类型分析、接口执行和类型文件生成仍由 `gen-api-types` 完成。
