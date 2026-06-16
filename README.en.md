# gen-api-types

#### Introduction

🚀 A CLI tool for automatically generating request interface return types

In TypeScript projects, you often need to write interface return types. However, it's troublesome to manually write them every time by referring to the API documentation. If you encounter third-party interfaces or incomplete documentation, you need to debug the interface first before writing the return types, which is quite a headache.

With this tool, we can mark request interface classes and methods through TypeScript decorators, then dynamically call these interfaces and convert the returned data into TypeScript type definition files, which can be directly used in projects.

> Note:
>
> 1. Because this tool uses TypeScript decorators, and decorators currently (TypeScript 5.0) do not support decorating plain functions directly, APIs must be written as **API classes + static API methods**.
> 2. This tool needs to dynamically execute TypeScript code (importing API classes and calling the marked static API methods), so it runs through the bundled `tsx` dependency. No global `tsx` installation is required.

#### Installation

1. npm installation

```shell
npm install gen-api-types -D
```

#### Usage

##### 1. Mark interface class names and methods

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

As shown in the code above:

- `@gen_type_c` decorator function is used to mark interface classes. Since the tool dynamically analyzes all ts files in the specified directory, marking interface classes helps quickly locate them.
- `@gen_type_m` decorator function marks the request methods that need to be converted. It can accept a configuration object with two fields:
  1. `typeName: string` Interface return type name. If not specified, the default name will be: `Response_${ClassName}_${MethodName}`
  2. `args: any[]` Method parameter list. The tool will pass this list when calling the request method.

##### 2. Execute command

```shell
npx gen-api-types -o output_dir -O output_file_name ./api_dir1 ./api_dir2
```

Parameter description:

```shell
Usage: npx gen-api-types [options] [api_dirs...]

Options:
  -h, --help                  Output help information
  -r, --project_root <path>   Project root directory
  -O, --output_file <path>    Output file name
  -o, --output_dir <path>     Output directory
  -t, --ts_config_path <path> Path to tsconfig.json file
  --isExported                Generate exported type declarations
```

You can also use it by configuring scripts in package.json:

```json
{
	"scripts": {
		"gen_types": "gen-api-types -o output_dir -O output_file_name ./api_dir1 ./api_dir2"
	}
}
```

Command output:

```shell
🚀 Start generating API types...
sourceFilesGlob [ 'src\\**\\*.ts' ]
📋 Processing UserApi.getList ...
📋 Processing UserApi.getWeather ...
Request results:
  ┌────────────────┬──────────────────────────────────────┐
  │ (index)        │ Values                               │
  ├────────────────┼──────────────────────────────────────┤
  │ ✔️ successList │ 'UserApi.getList UserApi.getWeather' │
  │ ❌ errorList   │ ''                                   │
  └────────────────┴──────────────────────────────────────┘
✅ API type generation completed
```

##### 3. Using the types

By default, a type definition file index.d.ts is generated, and the type declarations are not exported:

```ts
type XXX = { name: string };
type Response_TestApi_getWeather = {...}
```

You can configure `include` in tsconfig.json to reference the file:

```json
// tsconfig.json
{
	"include": ["index.d.ts"]
}
```

Or reference it directly at the top of the interface module file:

```ts
/// <reference path="./index.d.ts" />
export class TestApi {
	@gen_type_m()
	static getWeather(): Promise<Response_TestApi_getWeather> {
		return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
	}
}

// data is now typed as Response_TestApi_getWeather
const data = await TestApi.getWeather()
```

If you want to generate exported type declarations, add `--isExported` when running the command:

```shell
npx gen-api-types --isExported -o output_dir -O output_file_name ./api_dir1 ./api_dir2
```

Generated output example:

```ts
export type XXX = { name: string };
export type Response_TestApi_getWeather = {...}
```
