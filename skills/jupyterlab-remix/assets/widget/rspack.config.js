const path = require('path');
const base = require('@jupyter/builder/lib/webpack.config.base');

module.exports = (env, argv) => ({
  ...base,
  entry: './src/index.js',
  output: {
    ...base.output,
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    chunkFilename: '[name].[contenthash].js',
    clean: true
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  // MathJax names __dirname and the bundle is large: both are expected.
  node: { __dirname: 'mock' },
  performance: { hints: false }
});
