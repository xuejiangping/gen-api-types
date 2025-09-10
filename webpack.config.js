import path from 'path'

/** @type {import('webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/cli/index.ts',
  experiments: {
    // outputModule: true  // 启用实验性的ES模块输出
  },
  output: {
    path: path.resolve('dist'),
    filename: 'gen_api_types.min.js',
    // libraryTarget: 'module',
    library: 'genApiTypes', // 库的名称（可选）
    libraryTarget: 'umd',   // 支持多种模块格式
    globalObject: 'this',   // 适配浏览器和 Node.js 环境
    umdNamedDefine: true
    // chunkFormat: 'commonjs'
  },
  // 添加 resolve 配置来解决 Node.js 内置模块解析问题
  resolve: {
    /**************************************************
    *  fallback 配置选项，当正常解析失败时，重定向模块请求
    * 
    * 当前项目中，当编译的 target 设置为 node 时，webpack 会默认将 node 内置模块（如 path、fs 等）作为外部依赖处理
    * 如果target为浏览器或类似的环境,若使用node中的模块，需要添加对应的resolve.alias
    * 
     **************************************************/
    extensions: ['.ts','.js'],
    fallback: {

    },
    alias: {



    },
  },

  target: ["node"],
  externals: {
    /**************************************************
    *
    *  ${externalsType} ${libraryName} 语法，
    *  即构建结果中的依赖会用 ${libraryName} 引用，引用方法由externalsType决定
    *  如：'commonjs @vue/compiler-sfc' 构建结果为：require('@vue/compiler-sfc')
    *
     **************************************************/


    //   '@vue/compiler-sfc': 'commonjs @vue/compiler-sfc',
    module: {

    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          configFile: path.resolve('./tsconfig.prod.json'),
        }
      }]
    }]
  }


}