import application from '@jupyterlab/application-extension';
import apputils from '@jupyterlab/apputils-extension';
import codemirror from '@jupyterlab/codemirror-extension';
import completer from '@jupyterlab/completer-extension';
import docmanager from '@jupyterlab/docmanager-extension';
import markedparser from '@jupyterlab/markedparser-extension';
import mathjax from '@jupyterlab/mathjax-extension';
import notebook from '@jupyterlab/notebook-extension';
import rendermime from '@jupyterlab/rendermime-extension';
import shortcuts from '@jupyterlab/shortcuts-extension';
import themeLight from '@jupyterlab/theme-light-extension';
import translation from '@jupyterlab/translation-extension';

import paths from './paths';
import reader from './reader';
import top from './top';

/**
 * Keep the plugins of a core package that have the given names: the part
 * of the plugin id after the colon.
 */
export function pick(plugins, names) {
  const picked = plugins.filter(({ id }) => names.includes(id.split(':')[1]));
  if (picked.length !== names.length) {
    throw new Error(`Some plugins are missing: ${names.join(', ')}`);
  }
  return picked;
}

/**
 * The shortcuts plugin fails when another plugin loads its settings before
 * the shortcuts are loaded: the application activates it first.
 */
export const FIRST_PLUGIN = shortcuts.id;

/**
 * The plugins of Lectern: the same with a Jupyter Server and with JupyterLite.
 */
export default [
  pick(application, ['router']),
  pick(apputils, ['settings', 'themes', 'toolbar-registry']),
  pick(codemirror, ['binding', 'extensions', 'languages', 'services', 'themes']),
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
];
