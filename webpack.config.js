const path = require('path')

module.exports = (env, argv) => {
  let isProdMode = argv.mode === 'production'

  return {
    entry: path.resolve('./src/plotter.js'),

    devtool: 'source-map',

    output: {
      path: path.resolve('./lib'),
      filename: isProdMode ? 'plotter.min.js' : 'plotter.js',
      library: 'Plotter',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },

    optimization: {
      minimize: isProdMode
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          },
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        }
      ]
    },

    externals: {
      'expr-eval': 'exprEval',
      'konva': 'Konva'
    },

    resolve: {
      extensions: ['.js']
    }
  }
}
