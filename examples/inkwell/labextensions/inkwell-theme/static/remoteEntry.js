/*
 * inkwell-theme: JupyterLab theme(s) without a build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export.
 */
(function () {
  'use strict';

  const NAME = 'inkwell-theme';

  /*
   * One entry for each theme. `path` is relative to themes/ in this folder.
   */
  const THEMES = [
    {
      "name": "Inkwell Paper",
      "isLight": true,
      "themeScrollbars": true,
      "path": "inkwell-theme/inkwell-paper"
    },
    {
      "name": "Inkwell Night",
      "isLight": false,
      "themeScrollbars": true,
      "path": "inkwell-theme/inkwell-night"
    }
  ];

  function createPlugins(lab) {
    const { IThemeManager } = lab['@jupyterlab/apputils'];

    return [
      {
        id: `${NAME}:plugin`,
        description: 'Registers the themes of inkwell-theme.',
        autoStart: true,
        requires: [IThemeManager],
        activate: (app, manager) => {
          for (const theme of THEMES) {
            manager.register({
              name: theme.name,
              displayName: theme.name,
              isLight: theme.isLight,
              themeScrollbars: theme.themeScrollbars,
              // base.css first: index.css overrides it.
              load: () =>
                Promise.all([
                  manager.loadCSS(`${theme.path}/base.css`),
                  manager.loadCSS(`${theme.path}/index.css`)
                ]),
              unload: () => Promise.resolve()
            });
          }
        }
      }
    ];
  }

  // ---------------------------------------------------------------------
  // Module federation container. Do not change the code below.
  // ---------------------------------------------------------------------

  const SHARED = ['@jupyterlab/apputils'];
  let shareScope = null;

  async function loadShared(name) {
    const versions = shareScope && shareScope[name];
    if (!versions) {
      throw new Error(`${NAME}: JupyterLab does not share the package ${name}`);
    }
    const keys = Object.keys(versions).sort();
    const key = keys.find(version => versions[version].loaded) || keys[keys.length - 1];
    const factory = await versions[key].get();
    return factory();
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
      const plugins = createPlugins(lab);
      return () => ({ __esModule: true, default: plugins });
    }
  };

  window._JUPYTERLAB = window._JUPYTERLAB || {};
  window._JUPYTERLAB[NAME] = container;
})();
