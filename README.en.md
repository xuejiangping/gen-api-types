# gen-api-types

#### Introduction

🚀 A CLI tool for automatically generating request interface return types

In TypeScript projects, you often need to write interface return types. However, it's troublesome to manually write them every time by referring to the API documentation. If you encounter third-party interfaces or incomplete documentation, you need to debug the interface first before writing the return types, which is quite a headache.

With this tool, we can mark request interface classes and methods through TypeScript decorators, then dynamically call these interfaces and convert the returned data into TypeScript type definition files, which can be directly used in projects.

> Note:
>
> 1. Because this tool uses TypeScript method decorators, APIs must be written as **API classes + API methods**.
> 2. The CLI dynamically imports and executes marked API modules through the project's bundled `tsx` runtime. No global `tsx` installation is required.
> 3. API methods are executed for real in the CLI process. Make sure required environment variables, network access, and authentication are available.

#### Installation

1. npm installation

```shell
npm install gen-api-types -D
```

#### Usage

##### 1. Mark API classes and methods

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

As shown in the code above:

- `@gen_type_c()` marks an API class.
- `@gen_type_m()` marks a method to execute and convert.
- `args: any[]` contains the arguments passed to the method. Both static and non-static methods are supported.
- `typeName: string` is the generated type name. If omitted, it defaults to `Response_${ClassName}_${MethodName}`.
- Prefer the exported `gen_type_c` and `gen_type_m` aliases. `GatDecorator` is the internal container used for constant-based decorator names and is not required in business code.

Decorator options may span multiple lines:

```ts
@gen_type_m({
	args: [100],
	typeName: 'XXX'
})
```

> Note:

If TypeScript reports the decorator error "The runtime will invoke the decorator with 2 arguments, but the decorator expects 3", set `compilerOptions.experimentalDecorators` to `true` in `tsconfig.json`.

The CLI currently applies a 3-second execution timeout to each API method. Timeouts, synchronous exceptions, and rejected promises are reported as execution failures. A timeout stops waiting for the result but cannot cancel an underlying request that has already started.

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

The CLI scans `.ts` files in the input directories, finds marked classes and methods, and dynamically imports the modules containing them. The decorators execute the API methods during module import; the declaration file is generated after all marked methods finish.

Command output:

```shell
🚀 Start generating API types...
sourceFilesGlob [ 'src\\**\\*.ts' ]
Request results:
  ┌────────────────┬──────────────────────────────────────┐
  │ (index)        │ Values                               │
  ├────────────────┼──────────────────────────────────────┤
  │ ✔️ successList │ 'TestApi.getList TestApi.getWeather' │
  │ ❌ errorList   │ ''                                   │
  └────────────────┴──────────────────────────────────────┘
✅ API type generation completed
```

##### 3. Using the types

By default, a type definition file api-types.d.ts is generated, and the type declarations are not exported:

```ts
type XXX = { name: string };
type Response_TestApi_getWeather = {...}
```

You can configure `include` in tsconfig.json to reference it:

```json
// tsconfig.json
{
	"include": ["api-types.d.ts"]
}
```

Or reference it directly at the top of the interface module file:

```ts
/// <reference path="./api-types.d.ts" />
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

##### 4. Vite plugin

Decorators are needed for type generation, but they normally should not execute when the business application runs or builds. In a Vite project, use the plugin to remove `gen_type_c` and `gen_type_m` from the transformed business code:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { removeGatDecorators } from 'gen-api-types'

export default defineConfig({
	plugins: [removeGatDecorators()],
})
```

The plugin processes `.ts` and `.tsx` files and supports single-line and multi-line decorator options. Use the `gen_type_c` and `gen_type_m` aliases in business code; direct `GatDecorator.gen_type_m()` calls do not match the plugin's current decorator names.

The Vite plugin only affects Vite's transform pipeline. It is not involved when the CLI imports and executes API modules.

#### VS Code Extension

If you use `gen-api-types` in VS Code, you can install the companion extension [gen-api-types-vsce](https://github.com/xuejiangping/gen-api-types-vsce) to generate API return types from the context menu.

![alt text](docs/images/image.png)

The extension does not bundle the CLI. It invokes the version of `gen-api-types` installed locally in the current project.

After installing the extension, right-click in a `.ts` or `.tsx` file containing the decorated APIs and select `Generate API Return Types (gen-api-types)`. By default, the extension will:

- Use the directory containing the current TypeScript file as the `api_dirs` argument
- Generate the type file in the same directory as the current TypeScript file
- Use `api-types.d.ts` as the default output file name
- Ask for confirmation before overwriting an existing output file

You can configure the CLI arguments in the VS Code settings:

| Extension setting            | CLI argument           | Default behavior                                      |
| ---------------------------- | ---------------------- | ----------------------------------------------------- |
| `gen-api-types.projectRoot`  | `-r, --project_root`   | Workspace root containing the current TypeScript file |
| `gen-api-types.outputFile`   | `-O, --output_file`    | `api-types.d.ts`                                      |
| `gen-api-types.outputDir`    | `-o, --output_dir`     | Directory containing the current TypeScript file      |
| `gen-api-types.tsConfigPath` | `-t, --ts_config_path` | Not passed; the CLI uses its default value            |
| `gen-api-types.isExported`   | `--isExported`         | `false`                                               |

The extension is essentially a VS Code entry point for the CLI. Type analysis, API execution, and type-file generation are still handled by `gen-api-types`.
