const path = require('path');
const { Build } = require('@jupyter/builder');
const base = require('@jupyter/builder/lib/webpack.config.base');
const data = require('./package.json');

const packageDir = path.resolve(__dirname, 'lectern');

// Copy the settings schemas, write build/style.js with the CSS imports, and
// get one more configuration for each theme.
const themes = Build.ensureAssets({
  packageNames: data.jupyterlab.extensions,
  output: path.resolve(__dirname, 'build'),
  schemaOutput: packageDir,
  themeOutput: packageDir
});

module.exports = (env, argv) => [
  {
    ...base,
    entry: './src/index.js',
    output: {
      ...base.output,
      path: path.join(packageDir, 'static'),
      filename: 'bundle.js',
      chunkFilename: '[name].[contenthash].js',
      clean: true
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
    // MathJax names __dirname and the bundle is large: both are expected.
    node: { __dirname: 'mock' },
    performance: { hints: false }
  },
  ...themes
];
