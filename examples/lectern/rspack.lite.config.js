const path = require('path');
const { Build } = require('@jupyter/builder');
const base = require('@jupyter/builder/lib/webpack.config.base');
const data = require('./package.json');

// The static site: index.html at its root, the bundle and its assets in build/.
const build = path.resolve(__dirname, 'lite-site', 'build');

// Copy the settings schemas, write build/style.js with the CSS imports, and
// get one more configuration for each theme.
const themes = Build.ensureAssets({
  packageNames: data.jupyterlab.extensions,
  output: path.resolve(__dirname, 'build'),
  schemaOutput: build,
  themeOutput: build
});

module.exports = (env, argv) => [
  {
    ...base,
    entry: './src/lite.js',
    output: {
      ...base.output,
      path: build,
      filename: 'bundle.js',
      chunkFilename: '[name].[contenthash].js',
      // The schemas are already in this folder.
      clean: false
    },
    module: {
      ...base.module,
      rules: [
        ...base.module.rules,
        {
          // The service worker of JupyterLite: one file, with its own name.
          resourceQuery: /text/,
          type: 'asset/resource',
          generator: { filename: '[name][ext]' }
        },
        {
          // The workers of the Pyodide kernel are complete files: copy them.
          // The base rule for .js files makes a module of them.
          dependency: 'url',
          test: /\.worker\.js$/,
          type: 'asset/resource'
        },
        {
          // The wheels of the Pyodide kernel and their index, in one folder.
          test: /[\\/]pypi[\\/].*/,
          type: 'asset/resource',
          generator: { filename: 'pypi/[name][ext][query]' }
        }
      ]
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
    // MathJax names __dirname and the bundle is large: both are expected.
    node: { __dirname: 'mock' },
    performance: { hints: false }
  },
  ...themes
];
