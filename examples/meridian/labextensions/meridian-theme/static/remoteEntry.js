/*
 * meridian-theme: JupyterLab theme(s) without a build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export.
 */
(function () {
  'use strict';

  const NAME = 'meridian-theme';

  /*
   * One entry for each theme. `path` is relative to themes/ in this folder.
   */
  const THEMES = [
    {
      "name": "Meridian Dark",
      "isLight": false,
      "themeScrollbars": true,
      "path": "meridian-theme/meridian-dark"
    },
    {
      "name": "Meridian Light",
      "isLight": true,
      "themeScrollbars": true,
      "path": "meridian-theme/meridian-light"
    }
  ];

  function createPlugins(lab) {
    const { IThemeManager } = lab['@jupyterlab/apputils'];

    return [
      {
        id: `${NAME}:plugin`,
        description: 'Registers the themes of meridian-theme.',
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
