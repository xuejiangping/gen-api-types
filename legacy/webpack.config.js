import path from 'node:path'

// Legacy build config. Not used by the current publish flow.
// Kept as a reference in case the project returns to bundled JS output.

/** @type {import('webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/cli/index.ts',
  output: {
    path: path.resolve('dist'),
    filename: 'gen_api_types.cli.min.js',
    library: 'genApiTypes',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {},
    alias: {},
  },
  target: ['node'],
  externals: {
    module: {}
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          configFile: path.resolve('./legacy/tsconfig.prod.json'),
        }
      }]
    }]
  }
}
