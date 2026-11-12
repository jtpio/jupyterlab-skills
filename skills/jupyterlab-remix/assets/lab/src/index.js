import { JupyterLab } from '@jupyterlab/application';
import { PageConfig } from '@jupyterlab/coreutils';

import applicationExtension from '@jupyterlab/application-extension';
import apputilsExtension from '@jupyterlab/apputils-extension';
import codemirrorExtension from '@jupyterlab/codemirror-extension';
import completerExtension from '@jupyterlab/completer-extension';
import docmanagerExtension from '@jupyterlab/docmanager-extension';
import filebrowserExtension from '@jupyterlab/filebrowser-extension';
import fileeditorExtension from '@jupyterlab/fileeditor-extension';
import mainmenuExtension from '@jupyterlab/mainmenu-extension';
import markedparserExtension from '@jupyterlab/markedparser-extension';
import notebookExtension from '@jupyterlab/notebook-extension';
import rendermimeExtension from '@jupyterlab/rendermime-extension';
import shortcutsExtension from '@jupyterlab/shortcuts-extension';
import themeDarkExtension from '@jupyterlab/theme-dark-extension';
import themeLightExtension from '@jupyterlab/theme-light-extension';
import translationExtension from '@jupyterlab/translation-extension';
import uiComponentsExtension from '@jupyterlab/ui-components-extension';

import helloPlugin from './plugins/hello';
import launcherPlugin from './plugins/launcher';

import '../style/app.css';

/*
 * Keep the core packages in sync with "jupyterlab.extensions" in
 * package.json: the build reads that list to copy the settings schemas, the
 * themes and the styles.
 */
const extensions = [
  applicationExtension,
  apputilsExtension,
  codemirrorExtension,
  completerExtension,
  docmanagerExtension,
  filebrowserExtension,
  fileeditorExtension,
  mainmenuExtension,
  markedparserExtension,
  notebookExtension,
  rendermimeExtension,
  shortcutsExtension,
  themeDarkExtension,
  themeLightExtension,
  translationExtension,
  uiComponentsExtension,
  helloPlugin,
  launcherPlugin
];

/*
 * Plugins that need a package that is not in the build (status bar, LSP,
 * search, table of contents, metadata form, console, services plugins), and
 * the news of JupyterLab.
 */
const DISABLED = [
  '@jupyterlab/apputils-extension:announcements',
  '@jupyterlab/apputils-extension:kernel-status',
  '@jupyterlab/apputils-extension:kernels-settings',
  '@jupyterlab/apputils-extension:running-sessions-status',
  '@jupyterlab/fileeditor-extension:language-server',
  '@jupyterlab/fileeditor-extension:search',
  '@jupyterlab/notebook-extension:code-console',
  '@jupyterlab/notebook-extension:kernel-status',
  '@jupyterlab/notebook-extension:language-server',
  '@jupyterlab/notebook-extension:search',
  '@jupyterlab/notebook-extension:toc',
  '@jupyterlab/notebook-extension:update-raw-mimetype'
];

async function main() {
  const lab = new JupyterLab();
  lab.registerPlugins(
    extensions.flat().filter(plugin => !DISABLED.includes(plugin.id))
  );
  if (PageConfig.getOption('exposeAppInBrowser').toLowerCase() === 'true') {
    window.jupyterapp = lab;
  }
  await lab.start({ bubblingKeydown: true });
}

window.addEventListener('load', main);
