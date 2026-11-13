/*
 * meridian-icons: Codicons for the interface and Seti icons for the files.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = 'meridian-icons';

  const SHARED = ['@jupyterlab/coreutils', '@jupyterlab/ui-components'];

  const STYLESHEETS = ['style.css'];

  /*
   * The SVG files in static/codicons. Each one becomes the icon
   * `meridian-icons:<name>`.
   */
  const CODICONS = [
    'account', 'add', 'arrow-down', 'arrow-swap', 'arrow-up', 'bell', 'bell-dot', 'book',
    'case-sensitive', 'check', 'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up',
    'clear-all', 'close', 'close-all', 'cloud-upload', 'code', 'collapse-all', 'copy',
    'debug-alt', 'debug-console', 'debug-continue', 'debug-pause', 'debug-restart',
    'debug-step-into', 'debug-step-out', 'debug-step-over', 'debug-stop', 'discard', 'edit',
    'ellipsis', 'error', 'expand-all', 'extensions', 'file', 'files', 'filter', 'fold', 'folder',
    'folder-opened', 'gear', 'git-branch', 'go-to-file', 'history', 'home', 'info', 'inspect',
    'json', 'kebab-vertical', 'layers', 'layout-panel', 'layout-sidebar-left',
    'layout-sidebar-right', 'layout-statusbar', 'lightbulb', 'link', 'link-external',
    'list-ordered', 'list-tree', 'list-unordered', 'markdown', 'mortar-board', 'new-file',
    'new-folder', 'notebook', 'open-preview', 'output', 'pass-filled', 'play', 'preview',
    'primitive-square', 'question', 'redo', 'refresh', 'regex', 'remote', 'repo-clone',
    'run-above', 'run-all', 'run-below', 'save', 'screen-full', 'screen-normal', 'search',
    'server-process', 'settings-gear', 'source-control', 'sparkle', 'split-horizontal',
    'symbol-color', 'sync', 'terminal', 'terminal-bash', 'tools', 'trash', 'variable-group',
    'warning', 'whole-word', 'word-wrap', 'workspace-trusted'
  ];

  /*
   * Icons of JupyterLab and of its extensions, drawn with a Codicon.
   */
  const INTERFACE_ICONS = {
    'ui-components:add': 'add',
    'ui-components:bell': 'bell',
    'ui-components:bug': 'debug-alt',
    'ui-components:build': 'tools',
    'ui-components:caret-down': 'chevron-down',
    'ui-components:caret-down-empty': 'chevron-down',
    'ui-components:caret-down-empty-thin': 'chevron-down',
    'ui-components:caret-left': 'chevron-left',
    'ui-components:caret-right': 'chevron-right',
    'ui-components:caret-up': 'chevron-up',
    'ui-components:caret-up-empty-thin': 'chevron-up',
    'ui-components:case-sensitive': 'case-sensitive',
    'ui-components:check': 'check',
    'ui-components:cleaning': 'clear-all',
    'ui-components:close': 'close',
    'ui-components:close-all': 'close-all',
    'ui-components:collapse-all': 'collapse-all',
    'ui-components:copy': 'copy',
    'ui-components:delete': 'trash',
    'ui-components:duplicate': 'copy',
    'ui-components:edit': 'edit',
    'ui-components:ellipses': 'ellipsis',
    'ui-components:expand-all': 'expand-all',
    'ui-components:extension': 'extensions',
    'ui-components:fast-forward': 'run-all',
    'ui-components:file-upload': 'cloud-upload',
    'ui-components:filter': 'filter',
    'ui-components:folder': 'chevron-right',
    'ui-components:home': 'home',
    'ui-components:info': 'info',
    'ui-components:inspector': 'inspect',
    'ui-components:launch': 'link-external',
    'ui-components:link': 'link',
    'ui-components:list': 'list-unordered',
    'ui-components:move-down': 'arrow-down',
    'ui-components:move-up': 'arrow-up',
    'ui-components:new-folder': 'new-folder',
    'ui-components:numbering': 'list-ordered',
    'ui-components:pause': 'debug-pause',
    'ui-components:redo': 'redo',
    'ui-components:refresh': 'refresh',
    'ui-components:regex': 'regex',
    'ui-components:run': 'play',
    'ui-components:running': 'server-process',
    'ui-components:save': 'save',
    'ui-components:search': 'search',
    'ui-components:settings': 'settings-gear',
    'ui-components:step-into': 'debug-step-into',
    'ui-components:step-out': 'debug-step-out',
    'ui-components:step-over': 'debug-step-over',
    'ui-components:stop': 'primitive-square',
    'ui-components:terminal': 'terminal',
    'ui-components:toc': 'list-tree',
    'ui-components:tree-view': 'list-tree',
    'ui-components:trusted': 'workspace-trusted',
    'ui-components:undo': 'discard',
    'git': 'source-control',
    'search-replace:expandAll': 'expand-all',
    'search-replace:wholeWord': 'whole-word',
    'ui-components:folder-open': 'chevron-down'
  };

  /*
   * File type icons of JupyterLab, drawn with a Seti icon and its color.
   */
  const FILE_ICONS = {
    'ui-components:css': ['css', 'blue'],
    'ui-components:file': ['default', 'white'],
    'ui-components:html5': ['html', 'orange'],
    'ui-components:image': ['image', 'purple'],
    'ui-components:javascript': ['javascript', 'yellow'],
    'ui-components:json': ['json', 'yellow'],
    'ui-components:julia': ['julia', 'purple'],
    'ui-components:markdown': ['markdown', 'blue'],
    'ui-components:pdf': ['pdf', 'red'],
    'ui-components:python': ['python', 'blue'],
    'ui-components:spreadsheet': ['csv', 'green'],
    'ui-components:text-editor': ['default', 'white'],
    'ui-components:word': ['word', 'blue'],
    'ui-components:yaml': ['yml', 'purple']
  };

  /*
   * File types that JupyterLab does not know, for an icon in the explorer.
   */
  const EXTRA_FILE_TYPES = [
    { name: 'meridian-toml', displayName: 'TOML', extensions: ['.toml'], seti: ['config', 'grey-light'] },
    { name: 'meridian-config', displayName: 'Config', extensions: ['.cfg', '.ini', '.env'], seti: ['config', 'grey-light'] },
    { name: 'meridian-shell', displayName: 'Shell Script', extensions: ['.sh', '.bash'], seti: ['shell', 'grey'] },
    { name: 'meridian-gitignore', displayName: 'Git Ignore', extensions: [], pattern: '^\\.gitignore$', seti: ['git', 'ignore'] },
    { name: 'meridian-license', displayName: 'License', extensions: [], pattern: '^(LICENSE|LICENCE|COPYING)(\\.(md|txt))?$', seti: ['license', 'yellow'] }
  ];

  const LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="9.25" fill="none" stroke="#0078D4" stroke-width="1.6"/>' +
    '<ellipse cx="12" cy="12" rx="4.2" ry="9.25" fill="none" stroke="#0078D4" stroke-width="1.6"/>' +
    '<path d="M2.9 12h18.2" stroke="#0078D4" stroke-width="1.6"/>' +
    '<path d="M12 2.75v18.5" stroke="#4DAAFC" stroke-width="2"/>' +
    '</svg>';

  function createPlugins(lab) {
    const { PageConfig, URLExt } = lab['@jupyterlab/coreutils'];
    const { LabIcon } = lab['@jupyterlab/ui-components'];

    const base = URLExt.join(PageConfig.getOption('fullLabextensionsUrl'), NAME, 'static');

    const inner = svg => {
      const start = svg.indexOf('>', svg.indexOf('<svg')) + 1;
      return svg.slice(start, svg.lastIndexOf('</svg>')).replace(/fill="currentColor"/g, '');
    };
    const viewBox = svg => (/viewBox="([^"]+)"/.exec(svg) || [null, '0 0 16 16'])[1];

    const codiconSvg = raw =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${viewBox(raw)}">` +
      `<g class="jp-icon3 jp-icon-selectable" fill="#616161">${inner(raw)}</g></svg>`;

    const setiSvg = (raw, color) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${viewBox(raw)}">` +
      `<g class="meridian-seti meridian-seti-${color}">${inner(raw)}</g></svg>`;

    const define = (name, svgstr) => new LabIcon({ name, svgstr });

    async function loadIcons(app) {
      const fetchText = async path => {
        const response = await fetch(`${base}/${path}`);
        if (!response.ok) {
          throw new Error(`${NAME}: cannot load ${path} (${response.status})`);
        }
        return response.text();
      };

      const codicons = {};
      await Promise.all(
        CODICONS.map(async name => {
          codicons[name] = await fetchText(`codicons/${name}.svg`);
        })
      );
      for (const [name, raw] of Object.entries(codicons)) {
        define(`${NAME}:${name}`, codiconSvg(raw));
      }
      for (const [target, name] of Object.entries(INTERFACE_ICONS)) {
        define(target, codiconSvg(codicons[name]));
      }

      const seti = JSON.parse(await fetchText('seti/icons.json'));
      for (const [target, [name, color]] of Object.entries(FILE_ICONS)) {
        define(target, setiSvg(seti[name], color));
      }
      define(
        'ui-components:notebook',
        codiconSvg(codicons['notebook']).replace(
          'class="jp-icon3 jp-icon-selectable" fill="#616161"',
          'class="meridian-seti meridian-seti-orange"'
        )
      );
      for (const type of EXTRA_FILE_TYPES) {
        const [name, color] = type.seti;
        const fileIcon = define(`${NAME}:file-${type.name}`, setiSvg(seti[name], color));
        if (!app.docRegistry.getFileType(type.name)) {
          app.docRegistry.addFileType({
            name: type.name,
            displayName: type.displayName,
            extensions: type.extensions,
            pattern: type.pattern,
            mimeTypes: ['text/plain'],
            fileFormat: 'text',
            contentType: 'file',
            icon: fileIcon
          });
        }
      }

      for (const name of ['ui-components:jupyter', 'ui-components:jupyter-favicon', 'ui-components:jupyterlab-wordmark']) {
        define(name, LOGO_SVG);
      }
    }

    const plugin = {
      id: `${NAME}:plugin`,
      description: 'Draws the interface with Codicons and the file types with Seti icons.',
      autoStart: true,
      activate: app => {
        const timeout = new Promise(resolve => setTimeout(resolve, 4000));
        return Promise.race([loadIcons(app), timeout]).catch(error => {
          console.warn(`${NAME}: icons not loaded`, error);
        });
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
