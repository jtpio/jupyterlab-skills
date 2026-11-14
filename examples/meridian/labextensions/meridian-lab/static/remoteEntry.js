/*
 * meridian-lab: the core extension of Meridian. No build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = 'meridian-lab';
  const APP_NAME = 'Meridian';

  const SHARED = [
    '@jupyterlab/application',
    '@jupyterlab/apputils',
    '@jupyterlab/terminal',
    '@lumino/commands',
    '@lumino/widgets'
  ];

  /*
   * CSS files in static/ to load with the extension.
   */
  const STYLESHEETS = ['style.css'];

  /*
   * The "?v=..." of this file, for the stylesheets. The browser keeps the
   * files of static/ for one year: only a new URL loads a changed file.
   */
  const STAMP = document.currentScript ? new URL(document.currentScript.src).search : '';

  const START = [
    ['New File', 'fileeditor:create-new', {}],
    ['New Notebook', 'notebook:create-new', { kernelName: 'python3' }],
    ['Open File…', 'quickopen:activate', {}],
    ['Terminal', `${NAME}:toggle-terminal`, {}]
  ];

  const KEYS = [
    ['Command Palette', 'Ctrl+Shift+P', 'F1'],
    ['Quick Open', 'Ctrl+P'],
    ['Toggle Side Bar', 'Ctrl+B'],
    ['Toggle Panel', 'Ctrl+J'],
    ['Toggle Terminal', 'Ctrl+`'],
    ['File Browser', 'Ctrl+Shift+E'],
    ['Search', 'Ctrl+Shift+F'],
    ['Git', 'Ctrl+Shift+G'],
    ['Extensions', 'Ctrl+Shift+X'],
    ['Settings', 'Ctrl+,']
  ];

  /*
   * Keys that reach the application, not the shell, when a terminal has
   * the focus.
   */
  const SKIP_SHELL = [
    'Accel Shift P',
    'F1',
    'Accel P',
    'Accel B',
    'Accel J',
    'Accel Shift E',
    'Accel Shift F',
    'Accel Shift G',
    'Accel Shift X',
    'Accel ,'
  ];

  function createPlugins(lab) {
    const { ILabShell } = lab['@jupyterlab/application'];
    const { ICommandPalette, Dialog, MainAreaWidget, showDialog } = lab['@jupyterlab/apputils'];
    const { ITerminalTracker } = lab['@jupyterlab/terminal'];
    const { CommandRegistry } = lab['@lumino/commands'];
    const { Widget } = lab['@lumino/widgets'];

    const about = {
      id: `${NAME}:plugin`,
      description: `Adds the About ${APP_NAME} command.`,
      autoStart: true,
      optional: [ICommandPalette],
      activate: (app, palette) => {
        const command = `${NAME}:about`;
        app.commands.addCommand(command, {
          label: `About ${APP_NAME}`,
          execute: () =>
            showDialog({
              title: APP_NAME,
              body: `${APP_NAME} 0.2.0, built on JupyterLab ${app.version}.`,
              buttons: [Dialog.okButton()]
            })
        });
        if (palette) {
          palette.addItem({ command, category: 'Help' });
        }
      }
    };

    function createWelcome(app) {
      const accel = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl';
      const kbd = keys => keys.map(k => `<kbd>${k.replace('Ctrl', accel)}</kbd>`).join(' or ');
      const content = new Widget();
      content.addClass('mrd-Welcome');
      content.node.innerHTML = `
        <div class="mrd-Welcome-body">
          <h1>${APP_NAME}</h1>
          <p class="mrd-Welcome-tagline">JupyterLab, with the keys of a code editor</p>
          <h2>Start</h2>
          <ul class="mrd-Welcome-start">${START.map(
            (item, index) => `<li><button data-index="${index}">${item[0]}</button></li>`
          ).join('')}</ul>
          <h2>Keys</h2>
          <dl class="mrd-Welcome-keys">${KEYS.map(
            ([label, ...keys]) => `<dt>${label}</dt><dd>${kbd(keys)}</dd>`
          ).join('')}</dl>
        </div>`;
      content.node.addEventListener('click', event => {
        const button = event.target.closest('button[data-index]');
        if (button) {
          const [, command, args] = START[Number(button.dataset.index)];
          void app.commands.execute(command, args);
        }
      });
      const widget = new MainAreaWidget({ content });
      widget.id = `${NAME}-welcome`;
      widget.title.label = 'Welcome';
      widget.title.closable = true;
      widget.toolbar.hide();
      return widget;
    }

    const welcome = {
      id: `${NAME}:welcome`,
      description: 'A Welcome tab in place of the launcher.',
      autoStart: true,
      requires: [ILabShell],
      activate: (app, labShell) => {
        let widget = null;
        app.commands.addCommand('launcher:create', {
          label: 'Welcome',
          execute: () => {
            if (!widget || widget.isDisposed) {
              widget = createWelcome(app);
            }
            if (!widget.isAttached) {
              app.shell.add(widget, 'main');
            }
            app.shell.activateById(widget.id);
            return widget;
          }
        });
        void app.restored.then(() => {
          const showWhenEmpty = () => {
            if (labShell.isEmpty('main')) {
              void app.commands.execute('launcher:create');
            }
          };
          labShell.layoutModified.connect(showWhenEmpty);
          showWhenEmpty();
          if (labShell.isEmpty('right')) {
            labShell.collapseRight();
          }
        });
      }
    };

    const terminal = {
      id: `${NAME}:terminal`,
      description: 'Shows, focuses or hides the terminal of the panel.',
      autoStart: true,
      requires: [ILabShell],
      optional: [ITerminalTracker],
      activate: (app, labShell, tracker) => {
        app.commands.addCommand(`${NAME}:toggle-terminal`, {
          label: 'Toggle Terminal',
          execute: () => {
            const terminals = Array.from(labShell.widgets('down')).filter(
              w => tracker && tracker.has(w)
            );
            if (terminals.length === 0) {
              return app.commands.execute('terminal:create-new');
            }
            if (terminals.some(w => w.node.contains(document.activeElement))) {
              labShell.collapseDown();
              return;
            }
            const target = terminals.includes(tracker.currentWidget)
              ? tracker.currentWidget
              : terminals[0];
            labShell.expandDown();
            labShell.activateById(target.id);
          }
        });

        const skip = new Set(SKIP_SHELL.map(CommandRegistry.normalizeKeystroke));
        document.addEventListener(
          'keydown',
          event => {
            const inTerminal = event.target.closest && event.target.closest('.jp-Terminal');
            if (inTerminal && skip.has(CommandRegistry.keystrokeForKeydownEvent(event))) {
              app.commands.processKeydownEvent(event);
              event.stopPropagation();
            }
          },
          true
        );
      }
    };

    /*
     * JupyterLab 4.6 makes the down area smaller each time it shows again.
     * Restore the last size once the layout knows that the area is visible.
     */
    const downArea = {
      id: `${NAME}:down-area-size`,
      description: 'Keeps the size of the panel when it is hidden and shown.',
      autoStart: true,
      requires: [ILabShell],
      activate: (app, labShell) => {
        void app.restored.then(() => {
          const node = document.getElementById('jp-down-stack');
          const split = () => {
            let widget = Array.from(labShell.widgets('down'))[0];
            while (widget && typeof widget.setRelativeSizes !== 'function') {
              widget = widget.parent;
            }
            return widget || null;
          };
          let fraction = 0;
          let hidden = true;
          new ResizeObserver(() => {
            const panel = node.offsetHeight > 0 ? split() : null;
            if (!panel) {
              hidden = true;
              return;
            }
            if (hidden && fraction > 0) {
              panel.setRelativeSizes([1 - fraction, fraction]);
            } else {
              fraction = panel.relativeSizes()[1];
            }
            hidden = false;
          }).observe(node);
        });
      }
    };

    return [about, welcome, terminal, downArea];
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
      link.href = base + file + STAMP;
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
