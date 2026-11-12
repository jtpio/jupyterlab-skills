const path = require('path');
const rspack = require('@rspack/core');
const { Build, WPPlugin } = require('@jupyter/builder');
const baseConfig = require('@jupyter/builder/lib/webpack.config.base');

const packageData = require('./package.json');

const buildDir = path.resolve(__dirname, 'build');
const packageDir = path.resolve(__dirname, 'my_app');

/*
 * Copies the settings schemas to my_app/schemas, writes build/style.js (the
 * CSS imports of all extensions) and returns one config per theme, which
 * compiles the theme to my_app/themes.
 */
const assetConfigs = Build.ensureAssets({
  packageNames: packageData.jupyterlab.extensions,
  output: buildDir,
  schemaOutput: packageDir,
  themeOutput: packageDir
});

module.exports = (env, argv) => {
  const production = argv.mode === 'production';
  const app = {
    ...baseConfig,
    mode: production ? 'production' : 'development',
    devtool: production ? false : 'source-map',
    // The extension styles load first, so that style/app.css can override them.
    entry: [path.join(buildDir, 'style.js'), './src/index.js'],
    output: {
      ...baseConfig.output,
      path: path.join(packageDir, 'static'),
      // The server sets the static URL at run time: resolve chunks and
      // assets relative to the URL of bundle.js.
      publicPath: 'auto',
      filename: 'bundle.js',
      chunkFilename: '[name].[contenthash].js',
      clean: true
    },
    performance: { hints: false },
    // Some npm packages, those of JupyterLab among them, have no license file.
    ignoreWarnings: [/license-webpack-plugin: could not find/],
    plugins: [
      ...baseConfig.plugins,
      // The server reads both files for the "Licenses" entry of the Help menu.
      new rspack.CopyRspackPlugin({ patterns: [{ from: 'package.json' }] }),
      new WPPlugin.JSONLicenseWebpackPlugin({
        excludedPackageTest: name => name === packageData.name
      })
    ]
  };
  return [app, ...assetConfigs];
};
