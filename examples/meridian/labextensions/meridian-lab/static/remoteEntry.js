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
  const VERSION = '0.1.2';

  const SHARED = [
    '@jupyterlab/application',
    '@jupyterlab/apputils',
    '@jupyterlab/coreutils',
    '@jupyterlab/filebrowser',
    '@jupyterlab/fileeditor',
    '@jupyterlab/lsp',
    '@jupyterlab/notebook',
    '@jupyterlab/settingregistry',
    '@jupyterlab/statusbar',
    '@jupyterlab/terminal',
    '@jupyterlab/ui-components',
    '@lumino/commands',
    '@lumino/widgets'
  ];

  const STYLESHEETS = ['style.css'];

  /*
   * The "?v=..." of this file, for the other files of static/. The browser
   * keeps them for one year: only a new URL loads a changed file.
   */
  const STAMP = document.currentScript ? new URL(document.currentScript.src).search : '';

  const LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="9.25" fill="none" stroke="#0078D4" stroke-width="1.6"/>' +
    '<ellipse cx="12" cy="12" rx="4.2" ry="9.25" fill="none" stroke="#0078D4" stroke-width="1.6"/>' +
    '<path d="M2.9 12h18.2" stroke="#0078D4" stroke-width="1.6"/>' +
    '<path d="M12 2.75v18.5" stroke="#4DAAFC" stroke-width="2"/>' +
    '</svg>';

  /*
   * Views of the activity bar: command, widget, title of the side bar.
   */
  const VIEWS = [
    { command: 'show-explorer', id: 'filebrowser', label: 'Explorer', title: 'Explorer', icon: 'files' },
    { command: 'show-search', id: 'jp-search-replace', label: 'Search', title: 'Search' },
    { command: 'show-scm', id: 'jp-git-sessions', label: 'Source Control', title: 'Source Control' },
    { command: 'show-run', id: 'jp-debugger-sidebar', label: 'Run', title: 'Run and Debug' },
    { command: 'show-extensions', id: 'extensionmanager.main-view', label: 'Extensions', title: 'Extensions' },
    { command: 'show-running', id: 'jp-running-sessions', label: 'Running', title: 'Running' },
    { command: 'show-properties', id: 'jp-property-inspector', label: 'Properties', title: 'Properties' }
  ];

  function createPlugins(lab) {
    const { ILabShell } = lab['@jupyterlab/application'];
    const {
      Dialog,
      ICommandPalette,
      ISplashScreen,
      IThemeManager,
      showDialog
    } = lab['@jupyterlab/apputils'];
    const { PageConfig, PathExt, URLExt } = lab['@jupyterlab/coreutils'];
    const { IDefaultFileBrowser } = lab['@jupyterlab/filebrowser'];
    const { IEditorTracker } = lab['@jupyterlab/fileeditor'];
    const { ILSPDocumentConnectionManager } = lab['@jupyterlab/lsp'];
    const { INotebookTracker, NotebookActions } = lab['@jupyterlab/notebook'];
    const { ISettingRegistry } = lab['@jupyterlab/settingregistry'];
    const { IStatusBar } = lab['@jupyterlab/statusbar'];
    const { ITerminalTracker } = lab['@jupyterlab/terminal'];
    const { CommandToolbarButton, LabIcon, Toolbar } = lab['@jupyterlab/ui-components'];
    const { CommandRegistry } = lab['@lumino/commands'];
    const { CommandPalette, Menu, Widget } = lab['@lumino/widgets'];

    const cmd = name => `${NAME}:${name}`;

    /*
     * Icons of the meridian-icons extension. The placeholders take the real
     * drawing as soon as that extension defines them.
     */
    const icon = name => LabIcon.resolve({ icon: `meridian-icons:${name}` });

    /*
     * Nodes drawn before the icon set was loaded: they are drawn again once
     * the application is restored.
     */
    const drawnIcons = [];

    function codiconElement(name, className) {
      const node = document.createElement('span');
      node.className = `meridian-Codicon ${className || ''}`.trim();
      icon(name).element({ container: node });
      drawnIcons.push([node, name]);
      return node;
    }

    function redrawIcons() {
      for (const [node, name] of drawnIcons.splice(0)) {
        node.textContent = '';
        icon(name).element({ container: node });
      }
    }

    function rootFolderName() {
      const root = (PageConfig.getOption('serverRoot') || '').replace(/[\\/]+$/, '');
      return PathExt.basename(root.replace(/\\/g, '/')) || 'workspace';
    }

    function staticUrl(file) {
      return URLExt.join(PageConfig.getOption('fullLabextensionsUrl'), NAME, 'static', file) + STAMP;
    }

    /*
     * A modal list in the style of the command palette, with its own
     * commands: used to pick a theme or the type of a new file.
     */
    function showQuickPick(options) {
      const registry = new CommandRegistry();
      const palette = new CommandPalette({ commands: registry });
      palette.addClass('meridian-QuickPick-list');
      options.items.forEach((item, index) => {
        const id = `pick:${index}`;
        registry.addCommand(id, {
          label: item.label,
          caption: item.caption || '',
          isToggled: () => !!item.current,
          execute: () => item.run()
        });
        palette.addItem({ command: id, category: item.group || '', rank: index });
      });

      const host = new Widget();
      host.addClass('meridian-QuickPick');
      host.addClass('jp-ThemedContainer');
      host.node.setAttribute('role', 'dialog');
      const layoutHost = document.createElement('div');
      host.node.appendChild(layoutHost);

      let closed = false;
      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        document.removeEventListener('pointerdown', onPointerDown, true);
        palette.dispose();
        host.dispose();
        if (options.onClose) {
          options.onClose();
        }
      };
      const onPointerDown = event => {
        if (!host.node.contains(event.target)) {
          close();
        }
      };

      Widget.attach(host, document.body);
      Widget.attach(palette, layoutHost);
      palette.inputNode.placeholder = options.placeholder || '';
      palette.node.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      });
      registry.commandExecuted.connect(() => close());
      document.addEventListener('pointerdown', onPointerDown, true);
      palette.activate();
      palette.inputNode.focus();
      return { close };
    }

    const core = {
      id: `${NAME}:plugin`,
      description: `The About dialog of ${APP_NAME}, and the menus and keys of its schema.`,
      autoStart: true,
      optional: [ICommandPalette],
      activate: (app, palette) => {
        app.commands.addCommand('help:about', {
          label: `About ${APP_NAME}`,
          execute: () => {
            const body = document.createElement('div');
            body.className = 'meridian-About';
            body.innerHTML =
              `<div class="meridian-About-logo">${LOGO_SVG}</div>` +
              `<div class="meridian-About-text">` +
              `<div class="meridian-About-name">${APP_NAME}</div>` +
              `<div>Version ${VERSION}</div>` +
              `<div>JupyterLab ${app.version}</div>` +
              `<div class="meridian-About-credits">Icons: Codicons (CC BY 4.0) and Seti UI (MIT). ` +
              `Fonts: Open Sans and Noto Sans Mono (SIL OFL 1.1).</div>` +
              `</div>`;
            const content = new Widget({ node: body });
            return showDialog({
              title: APP_NAME,
              body: content,
              buttons: [Dialog.okButton({ label: 'OK' })]
            });
          }
        });
        if (palette) {
          palette.addItem({ command: 'help:about', category: 'Help' });
        }
      }
    };

    const splash = {
      id: `${NAME}:splash`,
      description: 'A plain splash screen with the logo of the application.',
      autoStart: true,
      provides: ISplashScreen,
      activate: () => ({
        show: () => {
          const node = document.createElement('div');
          node.id = 'meridian-splash';
          node.style.cssText =
            'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;' +
            'justify-content:center;background:#1f1f1f;transition:opacity 150ms';
          node.innerHTML = `<div style="width:96px;height:96px;opacity:.35">${LOGO_SVG}</div>`;
          document.body.appendChild(node);
          return {
            isDisposed: false,
            dispose: function () {
              this.isDisposed = true;
              node.style.opacity = '0';
              setTimeout(() => node.remove(), 160);
            }
          };
        }
      })
    };

    const titleBar = {
      id: `${NAME}:title-bar`,
      description: 'Logo, command center and layout buttons of the title bar; the favicon.',
      autoStart: true,
      optional: [ILabShell],
      activate: (app, labShell) => {
        const logo = new Widget();
        logo.id = 'jp-MainLogo';
        logo.addClass('meridian-Logo');
        logo.node.innerHTML = LOGO_SVG;
        logo.node.title = APP_NAME;
        app.shell.add(logo, 'top', { rank: 0 });

        const center = new Widget();
        center.id = 'meridian-command-center';
        center.addClass('meridian-CommandCenter');
        const box = document.createElement('div');
        box.className = 'meridian-CommandCenter-box';
        box.title = 'Search files by name (Ctrl+P)';
        box.appendChild(codiconElement('search'));
        const label = document.createElement('span');
        label.className = 'meridian-CommandCenter-label';
        label.textContent = rootFolderName();
        box.appendChild(label);
        box.addEventListener('click', () => void app.commands.execute('quickopen:activate'));
        center.node.appendChild(box);
        app.shell.add(center, 'top', { rank: 500 });

        const layout = new Widget();
        layout.id = 'meridian-layout-controls';
        layout.addClass('meridian-LayoutControls');
        const buttons = [
          ['layout-sidebar-left', 'Toggle Primary Side Bar (Ctrl+B)', 'application:toggle-left-area', () => labShell && !labShell.leftCollapsed],
          ['layout-panel', 'Toggle Panel (Ctrl+J)', cmd('toggle-panel'), () => labShell && !labShell.downCollapsed],
          ['layout-sidebar-right', 'Toggle Secondary Side Bar (Ctrl+Alt+B)', 'application:toggle-right-area', () => labShell && !labShell.rightCollapsed]
        ];
        const refresh = [];
        for (const [name, title, command, isOn] of buttons) {
          const button = document.createElement('button');
          button.className = 'meridian-LayoutControls-button';
          button.title = title;
          button.appendChild(codiconElement(name));
          button.addEventListener('click', () => void app.commands.execute(command));
          layout.node.appendChild(button);
          refresh.push(() => button.classList.toggle('meridian-mod-on', !!isOn()));
        }
        app.shell.add(layout, 'top', { rank: 1000 });
        if (labShell) {
          labShell.layoutModified.connect(() => refresh.forEach(f => f()));
        }
        refresh.forEach(f => f());

        void app.restored.then(() => setTimeout(redrawIcons, 0));

        const href = staticUrl('favicon.svg');
        document.querySelectorAll('link.favicon').forEach(link => {
          link.type = 'image/svg+xml';
          link.href = href;
        });
      }
    };

    const views = {
      id: `${NAME}:views`,
      description: 'Views of the activity bar, the Explorer with its sections, and the Manage menu.',
      autoStart: true,
      requires: [ILabShell],
      optional: [IDefaultFileBrowser, ICommandPalette],
      activate: (app, labShell, browser, palette) => {
        const { commands } = app;

        // A person can move a view to the other side bar.
        const findView = id =>
          [...labShell.widgets('left'), ...labShell.widgets('right')].find(w => w.id === id);

        const focusInput = (root, selector) => {
          const field = root && root.node.querySelector(selector);
          if (field) {
            requestAnimationFrame(() => field.focus());
          }
        };

        for (const view of VIEWS) {
          commands.addCommand(cmd(view.command), {
            label: view.label,
            caption: `Show ${view.title}`,
            execute: () => {
              app.shell.activateById(view.id);
              const widget = view.id === 'filebrowser' ? browser : findView(view.id);
              if (view.id === 'jp-search-replace') {
                focusInput(widget, 'jp-text-field');
              } else if (view.id === 'filebrowser' && widget) {
                widget.listing.node.focus();
              }
            }
          });
          if (palette) {
            palette.addItem({ command: cmd(view.command), category: 'View' });
          }
        }

        commands.addCommand(cmd('show-commands'), {
          label: 'Command Palette...',
          caption: 'Show all commands',
          execute: () => commands.execute('apputils:activate-command-palette')
        });

        commands.addCommand(cmd('find-in-files'), {
          label: 'Find in Files',
          execute: () => commands.execute(cmd('show-search'))
        });
        commands.addCommand(cmd('replace-in-files'), {
          label: 'Replace in Files',
          execute: async () => {
            await commands.execute(cmd('show-search'));
            const panel = findView('jp-search-replace');
            const toggle = panel && panel.node.querySelector('.jp-search-replace-collapser, [title*="Replace"]');
            const replaceField = panel && panel.node.querySelectorAll('jp-text-field')[1];
            if (toggle && !replaceField) {
              toggle.click();
            }
          }
        });

        const outlineSection = () => {
          const toc = browser && browser.sections.find(w => w.id === 'table-of-contents');
          return toc || null;
        };
        commands.addCommand(cmd('show-outline'), {
          label: 'Outline',
          caption: 'Show the outline of the document',
          execute: () => {
            const toc = outlineSection();
            if (!toc) {
              return commands.execute('toc:show-panel');
            }
            app.shell.activateById('filebrowser');
            const accordion = browser.accordionPanel;
            const index = accordion ? accordion.widgets.indexOf(toc) : -1;
            if (index >= 0 && toc.isHidden) {
              accordion.expand(index);
            }
          }
        });

        for (const view of VIEWS) {
          const widget = view.id === 'filebrowser' ? browser : findView(view.id);
          if (widget && view.icon) {
            widget.title.icon = icon(view.icon);
          }
        }

        void app.restored.then(() => {
          for (const view of VIEWS) {
            const widget = view.id === 'filebrowser' ? browser : findView(view.id);
            if (!widget) {
              continue;
            }
            widget.title.caption = view.title;
            widget.addClass('meridian-View');
            const header = document.createElement('div');
            header.className = 'meridian-ViewTitle';
            header.textContent = view.title;
            widget.node.insertBefore(header, widget.node.firstChild);
          }
          if (browser) {
            setUpExplorer(app, browser, findView('table-of-contents'));
          }
          addManageButton(app);
          // JupyterLab hides a side area only when its side bar changes. With
          // no view on the right, that does not occur, and an empty area shows.
          if (labShell.isEmpty('right')) {
            labShell.collapseRight();
          }
        });
      }
    };

    function setUpExplorer(app, browser, toc) {
      const toolbar = new Toolbar();
      const actions = [
        ['new-file', 'filebrowser:create-new-file', 'New File...'],
        ['new-folder', 'filebrowser:create-new-directory', 'New Folder...'],
        ['refresh', 'filebrowser:refresh', 'Refresh Explorer']
      ];
      for (const [name, command, caption] of actions) {
        toolbar.addItem(
          name,
          new CommandToolbarButton({ commands: app.commands, id: command, icon: icon(name), caption, label: '' })
        );
      }
      browser.mainPanel.toolbar = toolbar;
      browser.mainPanel.title.label = rootFolderName();
      browser.addClass('meridian-Explorer');
      if (toc && typeof browser.addSection === 'function') {
        toc.title.label = 'Outline';
        browser.addSection(toc);
        const accordion = browser.accordionPanel;
        if (accordion) {
          accordion.setRelativeSizes([0.75, 0.25]);
        }
      }
    }

    function addManageButton(app) {
      const bar = document.querySelector('.jp-SideBar.jp-mod-left');
      if (!bar || bar.querySelector('.meridian-ActivityBar-bottom')) {
        return;
      }
      const menu = new Menu({ commands: app.commands });
      menu.addClass('meridian-ManageMenu');
      for (const command of [
        'apputils:activate-command-palette',
        'quickopen:activate',
        null,
        'settingeditor:open',
        'apputils:display-shortcuts',
        'extensionmanager:show-panel',
        null,
        cmd('select-color-theme')
      ]) {
        if (command) {
          menu.addItem({ command });
        } else {
          menu.addItem({ type: 'separator' });
        }
      }
      const bottom = document.createElement('div');
      bottom.className = 'meridian-ActivityBar-bottom';
      const manage = document.createElement('button');
      manage.className = 'meridian-ActivityBar-button';
      manage.title = 'Manage';
      manage.appendChild(codiconElement('settings-gear'));
      manage.addEventListener('click', () => {
        const rect = manage.getBoundingClientRect();
        menu.open(rect.right + 4, rect.bottom);
      });
      bottom.appendChild(manage);
      bar.appendChild(bottom);
    }

    const panel = {
      id: `${NAME}:panel`,
      description: 'The panel below the editors: toggle it, open the terminal in it, run code in it.',
      autoStart: true,
      requires: [ILabShell],
      optional: [ITerminalTracker, IEditorTracker, IThemeManager, ICommandPalette, ISettingRegistry],
      activate: (app, labShell, terminals, editors, themes, palette, registry) => {
        const { commands } = app;
        let gpuAcceleration = false;
        if (registry) {
          void registry.load(`${NAME}:plugin`).then(settings => {
            const read = () => {
              gpuAcceleration = settings.composite.terminalGpuAcceleration === true;
            };
            settings.changed.connect(read);
            read();
          });
        }

        const panelTerminals = () =>
          terminals ? Array.from(labShell.widgets('down')).filter(w => terminals.has(w)) : [];

        const createTerminal = async () => {
          const widget = await commands.execute('terminal:create-new');
          if (widget && widget.content && widget.content.ready) {
            await widget.content.ready;
          }
          return widget;
        };

        /*
         * JupyterLab makes the panel smaller each time it shows it again: it
         * applies the saved size before the layout knows that the panel is
         * visible. Apply that size again, after the layout.
         */
        const keepPanelSize = () => {
          const node = document.getElementById('jp-down-stack');
          if (!node || typeof ResizeObserver === 'undefined') {
            return;
          }
          const verticalSplit = () => {
            let widget = Array.from(labShell.widgets('down'))[0];
            while (widget && typeof widget.setRelativeSizes !== 'function') {
              widget = widget.parent;
            }
            return widget || null;
          };
          let fraction = 0;
          let hidden = true;
          new ResizeObserver(() => {
            const split = node.offsetHeight > 0 ? verticalSplit() : null;
            if (!split) {
              hidden = true;
              return;
            }
            if (hidden && fraction > 0) {
              split.setRelativeSizes([1 - fraction, fraction]);
            } else {
              fraction = split.relativeSizes()[1];
            }
            hidden = false;
          }).observe(node);
        };
        void app.restored.then(keepPanelSize);

        commands.addCommand(cmd('toggle-panel'), {
          label: 'Toggle Panel Visibility',
          isToggled: () => !labShell.downCollapsed && !labShell.isEmpty('down'),
          execute: async () => {
            if (labShell.isEmpty('down')) {
              await createTerminal();
            } else if (labShell.downCollapsed) {
              labShell.expandDown();
            } else {
              labShell.collapseDown();
              if (labShell.currentWidget) {
                labShell.currentWidget.activate();
              }
            }
          }
        });

        commands.addCommand(cmd('toggle-terminal'), {
          label: 'Terminal',
          caption: 'Toggle the terminal in the panel',
          execute: async () => {
            const existing = panelTerminals();
            if (existing.length === 0) {
              return createTerminal();
            }
            const active = existing.find(w => w.node.contains(document.activeElement));
            if (active && !labShell.downCollapsed) {
              labShell.collapseDown();
              if (labShell.currentWidget) {
                labShell.currentWidget.activate();
              }
              return;
            }
            const target = (terminals.currentWidget && existing.includes(terminals.currentWidget))
              ? terminals.currentWidget
              : existing[existing.length - 1];
            app.shell.activateById(target.id);
            return target;
          }
        });

        commands.addCommand(cmd('new-terminal'), {
          label: 'New Terminal',
          execute: () => createTerminal()
        });

        const sendToTerminal = async text => {
          let target = panelTerminals().pop();
          if (!target) {
            target = await createTerminal();
          }
          app.shell.activateById(target.id);
          target.content.session.send({ type: 'stdin', content: [text] });
        };

        const currentPath = () => {
          const widget = labShell.currentWidget;
          return widget && widget.context ? widget.context.path : null;
        };

        commands.addCommand(cmd('run-active-file'), {
          label: 'Run Active File',
          caption: 'Run the Python file of the active editor in the terminal',
          isEnabled: () => /\.py$/.test(currentPath() || ''),
          execute: async () => {
            const path = currentPath();
            if (!path) {
              return;
            }
            await commands.execute('docmanager:save');
            await sendToTerminal(`python '${path.replace(/'/g, "'\\''")}'\r`);
          }
        });

        commands.addCommand(cmd('run-selected-text'), {
          label: 'Run Selected Text',
          caption: 'Send the selected text of the editor to the terminal',
          isEnabled: () => !!(editors && editors.currentWidget),
          execute: async () => {
            const widget = editors && editors.currentWidget;
            if (!widget) {
              return;
            }
            const editor = widget.content.editor;
            const selection = editor.getSelection();
            const source = editor.model.sharedModel.getSource();
            const start = editor.getOffsetAt(selection.start);
            const end = editor.getOffsetAt(selection.end);
            const text = start === end
              ? source.split('\n')[selection.start.line]
              : source.slice(Math.min(start, end), Math.max(start, end));
            await sendToTerminal(`${text}\r`);
          }
        });

        if (palette) {
          for (const name of ['toggle-panel', 'toggle-terminal', 'new-terminal', 'run-active-file', 'run-selected-text']) {
            palette.addItem({ command: cmd(name), category: 'Terminal' });
          }
        }

        if (terminals) {
          const applyColors = widget => {
            const term = widget.content;
            const xterm = term && term._term;
            if (!xterm || !xterm.options) {
              return;
            }
            const style = getComputedStyle(document.body);
            const read = name => style.getPropertyValue(`--meridian-terminal-${name}`).trim();
            if (!read('background')) {
              return;
            }
            const theme = { ...term.getXTermTheme() };
            for (const key of [
              'background', 'foreground', 'cursor', 'selectionBackground',
              'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
              'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
              'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'
            ]) {
              const value = read(key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`));
              if (value) {
                theme[key] = value;
              }
            }
            xterm.options.theme = theme;
          };
          const schedule = widget => setTimeout(() => applyColors(widget), 0);
          /*
           * Without GPU acceleration, the WebGL addon goes away and xterm.js
           * draws with its DOM renderer.
           */
          const useDomRenderer = widget => {
            const xterm = widget.content._term;
            const manager = xterm && xterm._addonManager;
            if (gpuAcceleration || !manager) {
              return;
            }
            for (const entry of manager._addons.slice()) {
              if (entry.instance && typeof entry.instance.onContextLoss === 'function') {
                entry.instance.dispose();
              }
            }
          };
          terminals.widgetAdded.connect((sender, widget) => {
            widget.title.className = `${widget.title.className || ''} meridian-TerminalTab`.trim();
            widget.toolbar.hide();
            applyColors(widget);
            void widget.content.ready.then(() => {
              useDomRenderer(widget);
              schedule(widget);
            });
            widget.content.themeChanged.connect(() => schedule(widget));
          });
          if (themes) {
            themes.themeChanged.connect(() => setTimeout(() => terminals.forEach(applyColors), 300));
          }
        }

        void app.restored.then(() => addPanelActions(app, labShell));
        skipShellForKeys(app);
      }
    };

    /*
     * Keys of the workbench that a terminal must not take, as the
     * "commands to skip shell" of the desktop code editors. A key chord
     * (Ctrl+K Ctrl+T) also goes to the workbench.
     */
    function skipShellForKeys(app) {
      const keys = new Set(
        [
          'Accel J', 'Accel `', 'Accel Shift `', 'Accel Shift P', 'F1', 'Accel P', 'Accel B',
          'Accel Shift E', 'Accel Shift F', 'Accel Shift G', 'Accel Shift X', 'Accel Shift D',
          'Accel Shift M', 'Accel ,', 'Accel K', 'Accel Alt B'
        ].map(k => CommandRegistry.normalizeKeystroke(k))
      );
      let chordUntil = 0;
      window.addEventListener(
        'keydown',
        event => {
          const target = event.target;
          if (!(target instanceof Element) || !target.closest('.jp-Terminal')) {
            return;
          }
          const keystroke = CommandRegistry.keystrokeForKeydownEvent(event);
          if (!keystroke) {
            return;
          }
          const inChord = Date.now() < chordUntil;
          if (!inChord && !keys.has(keystroke)) {
            return;
          }
          chordUntil = keystroke === CommandRegistry.normalizeKeystroke('Accel K') ? Date.now() + 2000 : 0;
          event.stopPropagation();
          app.commands.processKeydownEvent(event);
        },
        true
      );
    }

    function addPanelActions(app, labShell) {
      const tabBar = document.querySelector('#jp-down-stack > .lm-TabBar');
      if (!tabBar || tabBar.querySelector('.meridian-PanelActions')) {
        return;
      }
      const actions = document.createElement('div');
      actions.className = 'meridian-PanelActions';
      const items = [
        ['add', 'New Terminal (Ctrl+Shift+`)', () => app.commands.execute(cmd('new-terminal'))],
        ['trash', 'Kill Terminal', () => {
          const current = Array.from(labShell.widgets('down')).find(w => w.isVisible);
          if (current) {
            current.close();
          }
        }],
        ['close', 'Hide Panel (Ctrl+J)', () => app.commands.execute(cmd('toggle-panel'))]
      ];
      for (const [name, title, run] of items) {
        const button = document.createElement('button');
        button.className = 'meridian-PanelActions-button';
        button.title = title;
        button.appendChild(codiconElement(name));
        button.addEventListener('click', event => {
          event.stopPropagation();
          void run();
        });
        actions.appendChild(button);
      }
      tabBar.appendChild(actions);
    }

    const quickPicks = {
      id: `${NAME}:quick-picks`,
      description: 'Color theme picker and New File picker.',
      autoStart: true,
      optional: [IThemeManager, ICommandPalette],
      activate: (app, themes, palette) => {
        const { commands } = app;

        commands.addCommand(cmd('select-color-theme'), {
          label: 'Color Theme',
          caption: 'Select the color theme',
          isEnabled: () => !!themes,
          execute: () => {
            const names = themes.themes.slice();
            const items = names
              .map(name => ({
                label: themes.getDisplayName ? themes.getDisplayName(name) : name,
                group: themes.isLight(name) ? 'light themes' : 'dark themes',
                current: name === themes.theme,
                run: () => commands.execute('apputils:change-theme', { theme: name })
              }))
              .sort((a, b) => (a.group === b.group ? 0 : a.group === 'light themes' ? -1 : 1));
            showQuickPick({ placeholder: 'Select Color Theme (Up/Down Keys to Preview)', items });
          }
        });

        commands.addCommand(cmd('new-file'), {
          label: 'New File...',
          execute: () => {
            const specs = app.serviceManager.kernelspecs.specs;
            const kernels = specs ? Object.keys(specs.kernelspecs) : [];
            const items = [
              { label: 'Text File', group: 'Built-in', run: () => commands.execute('fileeditor:create-new') },
              { label: 'Python File', group: 'Built-in', run: () => commands.execute('fileeditor:create-new', { fileExt: '.py' }) },
              { label: 'Markdown File', group: 'Built-in', run: () => commands.execute('fileeditor:create-new-markdown-file') }
            ];
            for (const kernelName of kernels) {
              const display = specs.kernelspecs[kernelName].display_name;
              items.push({
                label: `Jupyter Notebook (${display})`,
                group: 'Notebook',
                run: () => commands.execute('notebook:create-new', { kernelName })
              });
            }
            items.push({ label: 'Terminal', group: 'Other', run: () => commands.execute(cmd('new-terminal')) });
            showQuickPick({ placeholder: 'Select File Type or Enter File Name...', items });
          }
        });

        commands.addCommand(cmd('open-file'), {
          label: 'Open File...',
          execute: () => commands.execute('quickopen:activate')
        });

        if (palette) {
          palette.addItem({ command: cmd('select-color-theme'), category: 'Preferences' });
          palette.addItem({ command: cmd('new-file'), category: 'File' });
        }
      }
    };

    const notebookCommands = {
      id: `${NAME}:notebook`,
      description: 'Commands of the notebook toolbar: add a code or Markdown cell.',
      autoStart: true,
      optional: [INotebookTracker],
      activate: (app, notebooks) => {
        const insert = type => () => {
          const panel = notebooks && notebooks.currentWidget;
          if (!panel) {
            return;
          }
          const notebook = panel.content;
          NotebookActions.insertBelow(notebook);
          NotebookActions.changeCellType(notebook, type);
          notebook.mode = 'edit';
        };
        const enabled = () => !!(notebooks && notebooks.currentWidget);
        app.commands.addCommand(cmd('insert-code-cell'), {
          label: args => (args.toolbar ? 'Code' : 'Insert Code Cell'),
          caption: 'Add a code cell below',
          icon: icon('add'),
          isEnabled: enabled,
          execute: insert('code')
        });
        app.commands.addCommand(cmd('insert-markdown-cell'), {
          label: args => (args.toolbar ? 'Markdown' : 'Insert Markdown Cell'),
          caption: 'Add a Markdown cell below',
          icon: icon('add'),
          isEnabled: enabled,
          execute: insert('markdown')
        });
        app.commands.addCommand(cmd('show-variables'), {
          label: 'Variables',
          caption: 'Show the variables of the kernel in the panel',
          icon: icon('variable-group'),
          execute: () => app.commands.execute('variableinspector:open')
        });
        app.commands.addCommand(cmd('show-problems'), {
          label: 'Problems',
          caption: 'Show the problems that the language server found',
          execute: () => app.commands.execute('lsp:show-diagnostics-panel')
        });
        app.commands.addCommand(cmd('show-output'), {
          label: 'Output',
          caption: 'Show the log console in the panel',
          execute: () => app.commands.execute('logconsole:open')
        });
      }
    };

    const statusBarItems = {
      id: `${NAME}:status-bar`,
      description: 'Remote indicator and problem counts in the status bar; order of the items.',
      autoStart: true,
      optional: [IStatusBar, ILSPDocumentConnectionManager],
      activate: (app, statusBar, lsp) => {
        if (!statusBar) {
          return;
        }
        const tag = (id, item) => {
          if (item && item.item && item.item.node) {
            item.item.node.dataset.meridianStatus = id;
          }
        };
        const register = statusBar.registerStatusItem.bind(statusBar);
        statusBar.registerStatusItem = (id, item) => {
          tag(id, item);
          return register(id, item);
        };
        for (const [id, item] of Object.entries(statusBar._statusItems || {})) {
          tag(id, item);
        }

        const remote = new Widget();
        remote.addClass('meridian-RemoteIndicator');
        remote.node.title = `Jupyter Server: ${location.host}`;
        remote.node.appendChild(codiconElement('remote'));
        remote.node.addEventListener('click', () => void app.commands.execute('running:show-panel'));
        statusBar.registerStatusItem(`${NAME}:remote`, { item: remote, align: 'left', rank: -1000 });

        const problems = new Widget();
        problems.addClass('meridian-Problems');
        problems.node.title = 'No Problems';
        const errorCount = document.createElement('span');
        const warningCount = document.createElement('span');
        problems.node.append(codiconElement('error'), errorCount, codiconElement('warning'), warningCount);
        problems.node.addEventListener('click', () => void app.commands.execute(cmd('show-problems')));
        statusBar.registerStatusItem(`${NAME}:problems`, { item: problems, align: 'left', rank: 10 });

        const byDocument = new Map();
        const render = () => {
          let errors = 0;
          let warnings = 0;
          for (const counts of byDocument.values()) {
            errors += counts.errors;
            warnings += counts.warnings;
          }
          errorCount.textContent = String(errors);
          warningCount.textContent = String(warnings);
          problems.node.title = errors + warnings === 0
            ? 'No Problems'
            : `Errors: ${errors}, Warnings: ${warnings}`;
        };
        render();

        if (lsp) {
          const seen = new WeakSet();
          const listen = connection => {
            if (!connection || seen.has(connection) || !connection.serverNotifications) {
              return;
            }
            seen.add(connection);
            connection.serverNotifications['textDocument/publishDiagnostics'].connect((sender, params) => {
              const diagnostics = params.diagnostics || [];
              byDocument.set(params.uri, {
                errors: diagnostics.filter(d => d.severity === 1).length,
                warnings: diagnostics.filter(d => d.severity === 2).length
              });
              render();
            });
          };
          lsp.connected.connect((sender, data) => listen(data.connection));
          lsp.closed.connect((sender, data) => {
            if (data && data.virtualDocument) {
              byDocument.delete(data.virtualDocument.uri);
              render();
            }
          });
          for (const connection of lsp.connections.values()) {
            listen(connection);
          }
        }
      }
    };

    const breadcrumbs = {
      id: `${NAME}:breadcrumbs`,
      description: 'The path of the file above each text editor.',
      autoStart: true,
      activate: app => {
        app.docRegistry.addWidgetExtension('Editor', {
          createNew: (widget, context) => {
            const bar = new Widget();
            bar.addClass('meridian-Breadcrumbs');
            const render = () => {
              bar.node.textContent = '';
              const parts = [rootFolderName(), ...context.path.split('/')];
              parts.forEach((part, index) => {
                if (index > 0) {
                  bar.node.appendChild(codiconElement('chevron-right', 'meridian-Breadcrumbs-separator'));
                }
                const item = document.createElement('span');
                item.className = 'meridian-Breadcrumbs-item';
                if (index === parts.length - 1) {
                  const fileType = app.docRegistry.getFileTypesForPath(context.path)[0];
                  if (fileType && fileType.icon) {
                    widget.title.icon = fileType.icon;
                    const iconNode = document.createElement('span');
                    iconNode.className = 'meridian-Breadcrumbs-icon';
                    fileType.icon.element({ container: iconNode });
                    item.appendChild(iconNode);
                  }
                }
                item.appendChild(document.createTextNode(part));
                bar.node.appendChild(item);
              });
            };
            context.pathChanged.connect(render);
            render();
            widget.toolbar.insertItem(0, 'meridian-breadcrumbs', bar);
            return bar;
          }
        });
      }
    };

    /*
     * The settings form of jupyterlab-lsp validates the "language_servers"
     * field alone, without the definitions that its references point to, and
     * logs an error each time the Settings editor opens. The field gets a
     * copy of the definitions.
     */
    const lspSettingsFix = {
      id: `${NAME}:lsp-settings-fix`,
      description: 'Lets the language server settings form resolve the references of its schema.',
      autoStart: true,
      optional: [ISettingRegistry],
      activate: (app, registry) => {
        if (!registry) {
          return;
        }
        const id = '@jupyter-lsp/jupyterlab-lsp:plugin';
        const patch = () => {
          const plugin = registry.plugins[id];
          const schema = plugin && plugin.schema;
          const field = schema && schema.properties && schema.properties.language_servers;
          if (field && schema.definitions && !field.definitions) {
            field.definitions = schema.definitions;
          }
        };
        registry.pluginChanged.connect((sender, changed) => {
          if (changed === id) {
            patch();
          }
        });
        patch();
        void app.restored.then(patch);
      }
    };

    return [core, splash, titleBar, views, panel, quickPicks, notebookCommands, statusBarItems, breadcrumbs, lspSettingsFix];
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
