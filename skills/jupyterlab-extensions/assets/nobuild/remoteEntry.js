/*
 * __NAME__: a JupyterLab extension without a build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = '__NAME__';

  /*
   * Packages to take from JupyterLab. Only packages that JupyterLab shares
   * are available (all of @jupyterlab/*, @lumino/*, react, react-dom, yjs).
   */
  const SHARED = ['@jupyterlab/apputils', '@lumino/widgets'];

  /*
   * CSS files in static/ to load with the extension.
   */
  const STYLESHEETS = [__STYLESHEETS__];

  /*
   * Return the plugin, or the list of plugins.
   * `lab` maps each name in SHARED to its module.
   */
  function createPlugins(lab) {
    const { ICommandPalette, Notification } = lab['@jupyterlab/apputils'];

    const plugin = {
      id: `${NAME}:plugin`,
      description: '__DESCRIPTION__',
      autoStart: true,
      optional: [ICommandPalette],
      activate: (app, palette) => {
        const command = `${NAME}:hello`;
        app.commands.addCommand(command, {
          label: 'Hello from __NAME__',
          execute: () => {
            Notification.info('__NAME__ is active.', { autoClose: 3000 });
          }
        });
        if (palette) {
          palette.addItem({ command, category: '__NAME__' });
        }
      }
    };

    return [plugin];
  }

  // ---------------------------------------------------------------------
  // Module federation container. Do not change the code below.
  // ---------------------------------------------------------------------

  let shareScope = null;

  function compareVersions(a, b) {
    const pa = a.split(/[.-]/).map(part => parseInt(part, 10) || 0);
    const pb = b.split(/[.-]/).map(part => parseInt(part, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  }

  async function loadShared(name) {
    const versions = shareScope && shareScope[name];
    if (!versions) {
      throw new Error(`${NAME}: JupyterLab does not share the package ${name}`);
    }
    const keys = Object.keys(versions).sort(compareVersions);
    // The copy that the application already uses keeps the tokens identical.
    const key = keys.find(version => versions[version].loaded) || keys[keys.length - 1];
    const factory = await versions[key].get();
    return factory();
  }

  function loadStyles() {
    const config = JSON.parse(
      document.getElementById('jupyter-config-data').textContent || '{}'
    );
    const base = `${config.fullLabextensionsUrl}/${NAME}/static/`;
    for (const file of STYLESHEETS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + file;
      link.dataset.extension = NAME;
      document.head.appendChild(link);
    }
  }

  const container = {
    init: async scope => {
      shareScope = scope;
    },
    get: async request => {
      if (request !== './extension') {
        throw new Error(`${NAME}: unknown module ${request}`);
      }
      const lab = {};
      for (const name of SHARED) {
        lab[name] = await loadShared(name);
      }
      loadStyles();
      const plugins = createPlugins(lab);
      // JupyterLab calls the factory synchronously.
      return () => ({ __esModule: true, default: plugins });
    }
  };

  window._JUPYTERLAB = window._JUPYTERLAB || {};
  window._JUPYTERLAB[NAME] = container;
})();
