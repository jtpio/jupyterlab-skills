import '../build/style.js';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/literata/400.css';
import '@fontsource/literata/400-italic.css';
import '@fontsource/literata/600.css';
import '../style/app.css';

import application from '@jupyterlab/application-extension';
import apputils from '@jupyterlab/apputils-extension';
import codemirror from '@jupyterlab/codemirror-extension';
import completer from '@jupyterlab/completer-extension';
import { PageConfig } from '@jupyterlab/coreutils';
import docmanager from '@jupyterlab/docmanager-extension';
import markedparser from '@jupyterlab/markedparser-extension';
import mathjax from '@jupyterlab/mathjax-extension';
import notebook from '@jupyterlab/notebook-extension';
import rendermime from '@jupyterlab/rendermime-extension';
import shortcuts from '@jupyterlab/shortcuts-extension';
import themeLight from '@jupyterlab/theme-light-extension';
import translation from '@jupyterlab/translation-extension';

import { App } from './app';
import paths from './plugins/paths';
import reader from './plugins/reader';
import top from './plugins/top';

/**
 * Keep the plugins of a core package that have the given names: the part
 * of the plugin id after the colon.
 */
function pick(plugins, names) {
  const picked = plugins.filter(({ id }) => names.includes(id.split(':')[1]));
  if (picked.length !== names.length) {
    throw new Error(`Some plugins are missing: ${names.join(', ')}`);
  }
  return picked;
}

window.addEventListener('load', async () => {
  const app = new App();
  app.registerPluginModules([
    pick(application, ['router']),
    pick(apputils, ['settings', 'themes', 'toolbar-registry']),
    pick(codemirror, [
      'binding',
      'extensions',
      'languages',
      'services',
      'themes'
    ]),
    pick(completer, ['base-service', 'manager']),
    pick(docmanager, ['manager', 'opener', 'plugin']),
    markedparser,
    mathjax,
    pick(notebook, [
      'cell-executor',
      'completer',
      'factory',
      'tracker',
      'widget-factory'
    ]),
    rendermime,
    shortcuts,
    themeLight,
    pick(translation, ['translator']),
    paths,
    reader,
    top
  ]);
  if (PageConfig.getOption('exposeAppInBrowser') === 'true') {
    window.jupyterapp = app;
  }
  // The shortcuts plugin fails when another plugin loads its settings
  // before the shortcuts are loaded: activate it first.
  await app.activatePlugin(shortcuts.id);
  await app.start();
});
