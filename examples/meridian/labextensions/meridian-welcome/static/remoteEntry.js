/*
 * meridian-welcome: the Welcome page of Meridian, in place of the launcher.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = 'meridian-welcome';

  const SHARED = [
    '@jupyterlab/application',
    '@jupyterlab/apputils',
    '@jupyterlab/coreutils',
    '@jupyterlab/docmanager',
    '@jupyterlab/launcher',
    '@jupyterlab/settingregistry',
    '@jupyterlab/ui-components',
    '@lumino/commands',
    '@lumino/widgets'
  ];

  const STYLESHEETS = ['style.css'];

  const FIRST_STEPS = [
    { icon: 'sparkle', title: 'Find any command', text: 'The Command Palette runs every command of Meridian.', command: 'meridian-lab:show-commands', keys: 'Accel Shift P' },
    { icon: 'go-to-file', title: 'Open a file by its name', text: 'Quick Open finds a file of the workspace as you type.', command: 'quickopen:activate', keys: 'Accel P' },
    { icon: 'search', title: 'Search across files', text: 'Find and replace text in all the files of the workspace.', command: 'meridian-lab:show-search', keys: 'Accel Shift F' },
    { icon: 'terminal', title: 'Use the terminal', text: 'Run commands in the panel below the editors.', command: 'meridian-lab:toggle-terminal', keys: 'Accel `' },
    { icon: 'symbol-color', title: 'Choose a color theme', text: 'Switch between the dark and the light theme.', command: 'meridian-lab:select-color-theme', keys: 'Accel K + Accel T' }
  ];

  const WATERMARK = [
    ['Show All Commands', 'meridian-lab:show-commands', 'Accel Shift P'],
    ['Go to File', 'quickopen:activate', 'Accel P'],
    ['Find in Files', 'meridian-lab:show-search', 'Accel Shift F'],
    ['Toggle Terminal', 'meridian-lab:toggle-terminal', 'Accel `'],
    ['Open Settings', 'settingeditor:open', 'Accel ,']
  ];

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === 'onclick') {
        node.addEventListener('click', value);
      } else if (key === 'text') {
        node.textContent = value;
      } else {
        node.setAttribute(key, value);
      }
    }
    for (const child of children || []) {
      if (child) {
        node.appendChild(child);
      }
    }
    return node;
  }

  function keyLabel(keys) {
    const node = el('span', { class: 'meridian-Keys' });
    for (const chord of keys.split(' ')) {
      const group = el('span', { class: 'meridian-Keys-chord' });
      for (const key of chord.split('+')) {
        group.appendChild(el('kbd', { text: key }));
      }
      node.appendChild(group);
    }
    return node;
  }

  function createPlugins(lab) {
    const { ILabShell } = lab['@jupyterlab/application'];
    const { MainAreaWidget } = lab['@jupyterlab/apputils'];
    const { PageConfig, PathExt } = lab['@jupyterlab/coreutils'];
    const { IRecentsManager } = lab['@jupyterlab/docmanager'];
    const { ILauncher } = lab['@jupyterlab/launcher'];
    const { ISettingRegistry } = lab['@jupyterlab/settingregistry'];
    const { LabIcon } = lab['@jupyterlab/ui-components'];
    const { CommandRegistry } = lab['@lumino/commands'];
    const { Widget } = lab['@lumino/widgets'];

    /*
     * The keys of a command as the platform writes them, or a fallback.
     */
    const keysOf = (app, command, preferred) => {
      const wanted = preferred.split(' + ').map(k => CommandRegistry.normalizeKeystroke(k)).join(' ');
      const bindings = app.commands.keyBindings.filter(b => b.command === command);
      const binding = bindings.find(b => b.keys.join(' ') === wanted) || bindings[0];
      return binding ? binding.keys.map(k => CommandRegistry.formatKeystroke(k)).join(' ') : '';
    };

    const icon = name => {
      const node = el('span', { class: 'meridian-Welcome-icon' });
      LabIcon.resolve({ icon: `meridian-icons:${name}` }).element({ container: node });
      return node;
    };

    function buildPage(app, recents, settings) {
      const run = (command, args) => event => {
        event.preventDefault();
        void app.commands.execute(command, args);
      };
      const action = (iconName, label, command, args) =>
        app.commands.hasCommand(command)
          ? el('li', {}, [
              el('a', { href: '#', class: 'meridian-Welcome-link', onclick: run(command, args) }, [
                icon(iconName),
                el('span', { text: label })
              ])
            ])
          : null;

      const recentList = el('ul', { class: 'meridian-Welcome-list meridian-Welcome-recent' });
      const fillRecent = async () => {
        let entries = [];
        if (recents) {
          entries = recents.recentlyOpened
            .filter(item => item.contentType !== 'directory')
            .map(item => ({ path: item.path }));
        }
        if (entries.length === 0) {
          try {
            const listing = await app.serviceManager.contents.get('', { content: true });
            entries = listing.content
              .filter(item => item.type !== 'directory' && !item.name.startsWith('.'))
              .sort((a, b) => (a.last_modified < b.last_modified ? 1 : -1))
              .map(item => ({ path: item.path }));
          } catch (error) {
            entries = [];
          }
        }
        recentList.textContent = '';
        for (const entry of entries.slice(0, 6)) {
          const folder = PathExt.dirname(entry.path);
          recentList.appendChild(
            el('li', {}, [
              el('a', { href: '#', class: 'meridian-Welcome-link', onclick: run('docmanager:open', { path: entry.path }) }, [
                el('span', { text: PathExt.basename(entry.path) })
              ]),
              el('span', { class: 'meridian-Welcome-path', text: folder ? `${rootName()}/${folder}` : rootName() })
            ])
          );
        }
        if (entries.length === 0) {
          recentList.appendChild(el('li', { class: 'meridian-Welcome-empty', text: 'No recent files.' }));
        }
      };
      void fillRecent();

      const steps = el('ul', { class: 'meridian-Welcome-steps' });
      for (const step of FIRST_STEPS) {
        steps.appendChild(
          el('li', {}, [
            el('button', { class: 'meridian-Welcome-step', type: 'button', onclick: run(step.command) }, [
              icon(step.icon),
              el('span', { class: 'meridian-Welcome-stepText' }, [
                el('span', { class: 'meridian-Welcome-stepTitle', text: step.title }),
                el('span', { class: 'meridian-Welcome-stepDescription', text: step.text })
              ]),
              keyLabel(keysOf(app, step.command, step.keys))
            ])
          ])
        );
      }

      const checkbox = el('input', { type: 'checkbox', id: 'meridian-welcome-startup' });
      checkbox.checked = settings ? settings.composite.showOnStartup !== false : true;
      checkbox.addEventListener('change', () => {
        if (settings) {
          void settings.set('showOnStartup', checkbox.checked);
        }
      });

      return el('div', { class: 'meridian-Welcome-page' }, [
        el('div', { class: 'meridian-Welcome-header' }, [
          el('h1', { class: 'meridian-Welcome-title', text: 'Meridian' }),
          el('p', { class: 'meridian-Welcome-subtitle', text: 'Code and notebooks, side by side' })
        ]),
        el('div', { class: 'meridian-Welcome-columns' }, [
          el('div', { class: 'meridian-Welcome-column' }, [
            el('h2', { text: 'Start' }),
            el('ul', { class: 'meridian-Welcome-list' }, [
              action('new-file', 'New File...', 'meridian-lab:new-file'),
              action('notebook', 'New Notebook', 'notebook:create-new', { kernelName: 'python3' }),
              action('go-to-file', 'Open...', 'quickopen:activate'),
              action('terminal', 'Terminal', 'meridian-lab:new-terminal'),
              action('repo-clone', 'Clone Git Repository...', 'git:clone')
            ]),
            el('h2', { text: 'Recent' }),
            recentList
          ]),
          el('div', { class: 'meridian-Welcome-column' }, [
            el('h2', { text: 'First Steps' }),
            steps
          ])
        ]),
        el('div', { class: 'meridian-Welcome-footer' }, [
          checkbox,
          el('label', { for: 'meridian-welcome-startup', text: 'Show welcome page when no document is open' })
        ])
      ]);
    }

    function rootName() {
      const root = (PageConfig.getOption('serverRoot') || '').replace(/[\\/]+$/, '');
      return PathExt.basename(root.replace(/\\/g, '/')) || 'workspace';
    }

    function addWatermark(app, dock) {
      if (!dock || dock.querySelector('.meridian-Watermark')) {
        return;
      }
      const rows = WATERMARK.map(([label, command, keys]) =>
        el('div', { class: 'meridian-Watermark-row' }, [
          el('span', { class: 'meridian-Watermark-label', text: label }),
          keyLabel(keysOf(app, command, keys))
        ])
      );
      dock.appendChild(
        el('div', { class: 'meridian-Watermark' }, [
          el('div', { class: 'meridian-Watermark-logo' }),
          el('div', { class: 'meridian-Watermark-keys' }, rows)
        ])
      );
    }

    const plugin = {
      id: `${NAME}:plugin`,
      description: 'A Welcome page in place of the launcher. Provides the launcher service.',
      autoStart: true,
      provides: ILauncher,
      optional: [ILabShell, IRecentsManager, ISettingRegistry],
      activate: (app, labShell, recents, registry) => {
        const items = [];
        let welcome = null;
        let settings = null;
        let closedByUser = false;

        const create = args => {
          if (welcome && !welcome.isDisposed) {
            app.shell.activateById(welcome.id);
            return welcome;
          }
          const content = new Widget({ node: buildPage(app, recents, settings) });
          content.addClass('meridian-Welcome');
          welcome = new MainAreaWidget({ content });
          welcome.id = 'meridian-welcome';
          welcome.title.label = 'Welcome';
          welcome.title.closable = true;
          welcome.title.icon = LabIcon.resolve({ icon: 'ui-components:jupyter' });
          welcome.addClass('meridian-WelcomePanel');
          welcome.toolbar.hide();
          welcome.disposed.connect(() => {
            closedByUser = true;
          });
          app.shell.add(welcome, 'main', { activate: args && args.activate !== false, ref: args && args.ref });
          return welcome;
        };

        app.commands.addCommand('launcher:create', {
          label: 'Welcome',
          caption: 'Open the Welcome page',
          execute: args => create(args || {})
        });

        const ready = registry
          ? registry.load(`${NAME}:plugin`).then(loaded => {
              settings = loaded;
            }).catch(() => undefined)
          : Promise.resolve();

        if (labShell) {
          void Promise.all([app.restored, ready]).then(() => {
            const dock = document.getElementById('jp-main-dock-panel');
            addWatermark(app, dock);
            const update = () => {
              const empty = labShell.isEmpty('main');
              if (dock) {
                dock.classList.toggle('meridian-mod-empty', empty);
              }
              if (!empty && Array.from(labShell.widgets('main')).some(w => w !== welcome)) {
                closedByUser = false;
              }
              const enabled = !settings || settings.composite.showOnStartup !== false;
              if (empty && enabled && !closedByUser) {
                create({ activate: true });
              }
            };
            labShell.layoutModified.connect(update);
            update();
          });
        }

        return {
          add: item => {
            items.push(item);
            return {
              isDisposed: false,
              dispose() {
                const index = items.indexOf(item);
                if (index !== -1) {
                  items.splice(index, 1);
                }
                this.isDisposed = true;
              }
            };
          }
        };
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
