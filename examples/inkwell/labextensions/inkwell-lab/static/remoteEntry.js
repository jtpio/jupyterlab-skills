/*
 * inkwell-lab: the core extension of Inkwell. No build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = 'inkwell-lab';
  const APP_NAME = 'Inkwell';
  const VERSION = '0.1.0';
  const PAPER = 'Inkwell Paper';
  const NIGHT = 'Inkwell Night';

  /*
   * Packages to take from JupyterLab. Only packages that JupyterLab shares
   * are available (all of @jupyterlab/*, @lumino/*, react, react-dom, yjs).
   */
  const SHARED = [
    '@jupyterlab/application',
    '@jupyterlab/apputils',
    '@jupyterlab/coreutils',
    '@jupyterlab/launcher',
    '@jupyterlab/notebook',
    '@jupyterlab/ui-components',
    '@lumino/widgets',
    'react'
  ];

  /*
   * CSS files in static/ to load with the extension.
   */
  const STYLESHEETS = ['style.css'];

  const MARK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path class="jp-icon-brand0" fill="#2b45b8" d="M12 2.2c4.1 5.1 6.9 8.9 6.9 12.4a6.9 6.9 0 0 1-13.8 0C5.1 11.1 7.9 7.3 12 2.2z"/>' +
    '<path fill="#fcf9f2" opacity=".55" d="M9.3 13.4c.4-1.7 1.3-3.3 2.4-4.9-.3 2.1-.6 3.6-.3 5.5.2 1.1-.5 1.8-1.2 1.6-.7-.2-1.1-1.1-.9-2.2z"/>' +
    '</svg>';

  function createPlugins(lab) {
    const { ILabShell } = lab['@jupyterlab/application'];
    const {
      ICommandPalette,
      IThemeManager,
      ISplashScreen,
      Dialog,
      MainAreaWidget,
      ReactWidget,
      showDialog
    } = lab['@jupyterlab/apputils'];
    const { PageConfig, URLExt } = lab['@jupyterlab/coreutils'];
    const { ILauncher } = lab['@jupyterlab/launcher'];
    const { INotebookTracker } = lab['@jupyterlab/notebook'];
    const { LabIcon } = lab['@jupyterlab/ui-components'];
    const { Widget } = lab['@lumino/widgets'];
    const React = lab['react'];
    const h = React.createElement;

    const icon = (name, body) =>
      new LabIcon({
        name: `${NAME}:${name}`,
        svgstr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`
      });
    const markIcon = new LabIcon({ name: `${NAME}:mark`, svgstr: MARK_SVG });
    const sectionIcon = icon(
      'section',
      '<g class="jp-icon3" fill="#616161">' +
        '<rect x="3" y="4.5" width="12" height="2.6" rx="1.3"/>' +
        '<rect x="3" y="10" width="8" height="1.8" rx=".9"/>' +
        '<rect x="3" y="14" width="8" height="1.8" rx=".9"/>' +
        '<rect x="3" y="18" width="6" height="1.8" rx=".9"/>' +
        '<rect x="16.1" y="11" width="1.8" height="9" rx=".9"/>' +
        '<rect x="12.5" y="14.6" width="9" height="1.8" rx=".9"/></g>'
    );
    const focusIcon = icon(
      'focus',
      '<g class="jp-icon3" fill="#616161">' +
        '<path d="M3 8V5a2 2 0 0 1 2-2h3v2H5v3H3zm13-5h3a2 2 0 0 1 2 2v3h-2V5h-3V3zM3 16h2v3h3v2H5a2 2 0 0 1-2-2v-3zm16 0h2v3a2 2 0 0 1-2 2h-3v-2h3v-3z"/>' +
        '<circle cx="12" cy="12" r="3"/></g>'
    );
    const themeIcon = icon(
      'theme',
      '<path class="jp-icon3" fill="#616161" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 2v15a7.5 7.5 0 0 1 0-15z"/>'
    );
    const homeIcon = icon(
      'home',
      '<path class="jp-icon3" fill="#616161" d="M12 3.2 2.8 11h2.7v9h5v-5.5h3V20h5v-9h2.7L12 3.2z"/>'
    );

    const staticUrl = () =>
      URLExt.join(PageConfig.getOption('fullLabextensionsUrl'), NAME, 'static');

    /*
     * Home page in place of the launcher.
     */
    function relativeTime(iso) {
      const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
      if (seconds < 60) {
        return 'just now';
      }
      if (seconds < 3600) {
        return `${Math.round(seconds / 60)} min ago`;
      }
      if (seconds < 86400) {
        const hours = Math.round(seconds / 3600);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      }
      if (seconds < 7 * 86400) {
        const days = Math.round(seconds / 86400);
        return `${days} day${days === 1 ? '' : 's'} ago`;
      }
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    function prettyTitle(name) {
      const base = name.replace(/\.(ipynb|md)$/i, '').replace(/[-_]+/g, ' ').trim();
      return base.charAt(0).toUpperCase() + base.slice(1);
    }

    function greeting() {
      const hour = new Date().getHours();
      if (hour < 12) {
        return 'Good morning.';
      }
      return hour < 18 ? 'Good afternoon.' : 'Good evening.';
    }

    function Home(props) {
      const { app } = props;
      const [files, setFiles] = React.useState(null);
      React.useEffect(() => {
        let active = true;
        const contents = app.serviceManager.contents;
        const load = () =>
          contents
            .get('', { content: true })
            .then(listing => {
              if (active) {
                setFiles(
                  listing.content
                    .filter(item => item.type === 'notebook' || /\.md$/i.test(item.name))
                    .sort((a, b) => (a.last_modified < b.last_modified ? 1 : -1))
                );
              }
            })
            .catch(() => active && setFiles([]));
        load();
        const onChange = () => load();
        contents.fileChanged.connect(onChange);
        return () => {
          active = false;
          contents.fileChanged.disconnect(onChange);
        };
      }, []);

      const open = path => app.commands.execute('docmanager:open', { path });
      const newEssay = async () => {
        const panel = await app.commands.execute('notebook:create-new', { kernelName: 'python3' });
        if (!panel || !panel.context) {
          return;
        }
        await panel.context.ready;
        const model = panel.content.model;
        // `defaultCell` does not apply to the first cell of a new notebook.
        if (model.cells.length === 1 && model.cells.get(0).sharedModel.getSource() === '') {
          model.sharedModel.insertCells(0, [
            {
              cell_type: 'markdown',
              source: '# Untitled essay\n\n*One sentence that says what this essay shows.*',
              metadata: {}
            }
          ]);
          panel.content.activeCellIndex = 1;
        }
      };
      const notebooks = (files || []).filter(item => item.type === 'notebook');
      const notes = (files || []).filter(item => item.type !== 'notebook');
      const latest = notebooks[0];

      const action = (key, title, text, iconRef, onClick, extra) =>
        h(
          'button',
          Object.assign(
            { key, className: 'inkwell-action', type: 'button', onClick },
            extra || {}
          ),
          h(iconRef.react, { className: 'inkwell-action-icon', tag: 'span' }),
          h('span', { className: 'inkwell-action-title' }, title),
          h('span', { className: 'inkwell-action-text' }, text)
        );

      const list = (items, empty) =>
        items.length === 0
          ? h('p', { className: 'inkwell-home-empty' }, empty)
          : h(
              'ul',
              { className: 'inkwell-home-files' },
              items.slice(0, 8).map(item =>
                h(
                  'li',
                  { key: item.path },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'inkwell-home-file',
                      'data-path': item.path,
                      onClick: () => open(item.path)
                    },
                    h('span', { className: 'inkwell-home-file-title' }, prettyTitle(item.name)),
                    h('span', { className: 'inkwell-home-file-name' }, item.name),
                    h(
                      'span',
                      { className: 'inkwell-home-file-time' },
                      relativeTime(item.last_modified)
                    )
                  )
                )
              )
            );

      const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      return h(
        'div',
        { className: 'inkwell-home' },
        h(
          'header',
          { className: 'inkwell-home-head' },
          h('p', { className: 'inkwell-home-kicker' }, `${APP_NAME} · ${today}`),
          h(
            'h1',
            { className: 'inkwell-home-title' },
            greeting(),
            ' ',
            h('em', null, 'What will you write today?')
          ),
          h(
            'p',
            { className: 'inkwell-home-lede' },
            'An essay is a notebook: prose first, a little code for the evidence, and a chart where it earns its place.'
          )
        ),
        h(
          'section',
          { className: 'inkwell-home-actions', 'aria-label': 'Start' },
          action(
            'essay',
            'New essay',
            'A notebook for prose, code and charts',
            sectionIcon,
            () => void newEssay(),
            { 'data-action': 'new-essay' }
          ),
          action(
            'note',
            'New note',
            'A Markdown page for ideas and outlines',
            LabIcon.resolve({ icon: 'ui-components:markdown' }),
            () => app.commands.execute('fileeditor:create-new-markdown-file'),
            { 'data-action': 'new-note' }
          ),
          action(
            'continue',
            'Continue writing',
            latest ? prettyTitle(latest.name) : 'No essay yet',
            markIcon,
            () => latest && open(latest.path),
            { 'data-action': 'continue', disabled: !latest }
          )
        ),
        h(
          'section',
          { className: 'inkwell-home-recent' },
          h(
            'div',
            { className: 'inkwell-home-column' },
            h('h2', null, 'Recent essays'),
            files === null
              ? h('p', { className: 'inkwell-home-empty' }, 'Loading…')
              : list(notebooks, 'No notebooks in this folder yet.')
          ),
          h(
            'div',
            { className: 'inkwell-home-column' },
            h('h2', null, 'Notes'),
            files === null
              ? h('p', { className: 'inkwell-home-empty' }, 'Loading…')
              : list(notes, 'No Markdown notes yet.')
          )
        )
      );
    }

    const home = {
      id: `${NAME}:home`,
      description: 'The Inkwell home page, in place of the launcher.',
      autoStart: true,
      provides: ILauncher,
      optional: [ILabShell, ICommandPalette],
      activate: (app, labShell, palette) => {
        const items = [];
        let counter = 0;
        const homes = () =>
          Array.from(app.shell.widgets('main')).filter(w => w.hasClass('inkwell-home-panel'));

        app.commands.addCommand('launcher:create', {
          label: 'Home',
          caption: 'Open the Inkwell home page',
          icon: homeIcon,
          execute: (args = {}) => {
            const existing = homes()[0];
            if (existing) {
              app.shell.activateById(existing.id);
              return existing;
            }
            const content = ReactWidget.create(h(Home, { app }));
            content.addClass('inkwell-home-content');
            const widget = new MainAreaWidget({ content });
            widget.addClass('inkwell-home-panel');
            widget.toolbar.hide();
            widget.id = `inkwell-home-${counter++}`;
            widget.title.label = 'Home';
            widget.title.icon = homeIcon;
            widget.title.closable = true;
            app.shell.add(widget, 'main', {
              activate: args['activate'] !== false,
              ref: args['ref']
            });
            return widget;
          }
        });
        app.commands.addCommand(`${NAME}:home`, {
          label: 'Home',
          caption: 'Open the Inkwell home page',
          icon: homeIcon,
          execute: () => app.commands.execute('launcher:create')
        });
        if (palette) {
          palette.addItem({ command: `${NAME}:home`, category: APP_NAME });
        }

        if (labShell) {
          void app.restored.then(() => {
            const maybeCreate = () => {
              if (labShell.isEmpty('main')) {
                void app.commands.execute('launcher:create');
              }
            };
            labShell.layoutModified.connect(maybeCreate);
            maybeCreate();
          });
          labShell.addButtonEnabled = true;
          labShell.addRequested.connect((sender, tabBar) => {
            const title = tabBar.currentTitle || tabBar.titles[tabBar.titles.length - 1];
            return app.commands.execute('launcher:create', { ref: title && title.owner.id });
          });
        }

        return {
          add: item => {
            items.push(item);
            return {
              isDisposed: false,
              dispose: () => {
                const index = items.indexOf(item);
                if (index !== -1) {
                  items.splice(index, 1);
                }
              }
            };
          }
        };
      }
    };

    /*
     * Brand in the top bar, in place of the Jupyter logo.
     */
    const brand = {
      id: `${NAME}:brand`,
      description: 'The Inkwell mark and wordmark in the top bar.',
      autoStart: true,
      activate: app => {
        const widget = new Widget();
        widget.id = 'inkwell-brand';
        widget.addClass('inkwell-brand');
        widget.node.title = `${APP_NAME} home`;
        const mark = document.createElement('span');
        mark.className = 'inkwell-brand-mark';
        markIcon.element({ container: mark, height: '18px', width: '18px' });
        const word = document.createElement('span');
        word.className = 'inkwell-brand-word';
        word.textContent = APP_NAME;
        widget.node.append(mark, word);
        widget.node.addEventListener('click', () => {
          void app.commands.execute('launcher:create');
        });
        app.shell.add(widget, 'top', { rank: 0 });
      }
    };

    /*
     * Favicon.
     */
    const favicon = {
      id: `${NAME}:favicon`,
      description: 'The Inkwell favicon.',
      autoStart: true,
      activate: () => {
        const url = `${staticUrl()}/favicon.svg`;
        document.querySelectorAll('link.favicon').forEach(link => {
          link.type = 'image/svg+xml';
          link.href = url;
        });
      }
    };

    /*
     * About dialog: Help > About Inkwell.
     */
    const about = {
      id: `${NAME}:about`,
      description: `The About ${APP_NAME} dialog.`,
      autoStart: true,
      optional: [ICommandPalette],
      activate: (app, palette) => {
        app.commands.addCommand('help:about', {
          label: `About ${APP_NAME}`,
          execute: () => {
            const body = h(
              'div',
              { className: 'inkwell-about' },
              h(markIcon.react, { className: 'inkwell-about-mark', tag: 'div' }),
              h('div', { className: 'inkwell-about-name' }, APP_NAME),
              h(
                'p',
                { className: 'inkwell-about-tagline' },
                'A calm notebook studio for data essays.'
              ),
              h(
                'dl',
                { className: 'inkwell-about-facts' },
                h('dt', null, 'Version'),
                h('dd', null, VERSION),
                h('dt', null, 'Built on'),
                h('dd', null, `JupyterLab ${app.version}`),
                h('dt', null, 'Type'),
                h('dd', null, 'Newsreader, Inter, JetBrains Mono (SIL OFL)')
              ),
              h(
                'p',
                { className: 'inkwell-about-note' },
                'Write in Markdown cells, keep the evidence in code cells, and let the outline on the left keep you oriented.'
              )
            );
            void showDialog({
              title: `About ${APP_NAME}`,
              body,
              buttons: [Dialog.okButton({ label: 'Back to writing' })]
            });
          }
        });
        if (palette) {
          palette.addItem({ command: 'help:about', category: APP_NAME });
        }
      }
    };

    /*
     * Splash screen while the layout is restored.
     */
    const splash = {
      id: `${NAME}:splash`,
      description: 'The Inkwell splash screen.',
      autoStart: true,
      provides: ISplashScreen,
      activate: () => ({
        show: () => {
          const node = document.createElement('div');
          node.id = 'inkwell-splash';
          node.setAttribute(
            'style',
            'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;' +
              'align-items:center;justify-content:center;gap:18px;background:#fcf9f2;' +
              'color:#1e1b16;font-family:Newsreader,Georgia,serif;transition:opacity .3s'
          );
          node.innerHTML =
            `<div class="inkwell-splash-drop" style="width:64px;height:64px">${MARK_SVG}</div>` +
            `<div style="font-size:34px;font-style:italic;font-weight:600;letter-spacing:-.01em">${APP_NAME}</div>` +
            '<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;letter-spacing:.12em;' +
            'text-transform:uppercase;color:rgba(30,27,22,.55)">Filling the pen…</div>';
          document.body.appendChild(node);
          return {
            isDisposed: false,
            dispose: function () {
              if (this.isDisposed) {
                return;
              }
              this.isDisposed = true;
              node.style.opacity = '0';
              setTimeout(() => node.remove(), 320);
            }
          };
        }
      })
    };

    /*
     * Writing commands: Insert Section, Toggle Focus Mode, theme toggle.
     */
    const commands = {
      id: `${NAME}:commands`,
      description: 'Insert Section, Toggle Focus Mode and the theme toggle.',
      autoStart: true,
      optional: [INotebookTracker, ILabShell, IThemeManager, ICommandPalette],
      activate: (app, notebooks, labShell, themes, palette) => {
        const insertSection = `${NAME}:insert-section`;
        const toggleFocus = `${NAME}:toggle-focus`;
        const toggleTheme = `${NAME}:toggle-theme`;

        app.commands.addCommand(insertSection, {
          label: 'Insert Section',
          caption: 'Insert a "## New section" Markdown cell and an empty code cell',
          icon: sectionIcon,
          isEnabled: () => !!(notebooks && notebooks.currentWidget),
          execute: () => {
            const panel = notebooks && notebooks.currentWidget;
            if (!panel || !panel.content.model) {
              return;
            }
            const notebook = panel.content;
            const index = notebook.model.cells.length === 0 ? 0 : notebook.activeCellIndex + 1;
            notebook.model.sharedModel.insertCells(index, [
              { cell_type: 'markdown', source: '## New section', metadata: {} },
              { cell_type: 'code', source: '', metadata: {}, outputs: [], execution_count: null }
            ]);
            const heading = notebook.widgets[index];
            if (heading && 'rendered' in heading) {
              heading.rendered = true;
            }
            notebook.activeCellIndex = index + 1;
            notebook.deselectAll();
            notebook.mode = 'command';
            void notebook.scrollToItem(index + 1);
          }
        });

        let focus = false;
        let saved = null;
        const TABBAR = 'application:toggle-side-tabbar';
        const showTabbar = (side, show) => {
          if (
            app.commands.hasCommand(TABBAR) &&
            app.commands.isToggled(TABBAR, { side }) !== show
          ) {
            void app.commands.execute(TABBAR, { side });
          }
        };
        app.commands.addCommand(toggleFocus, {
          label: args => (args.short ? 'Focus' : 'Toggle Focus Mode'),
          caption: 'Hide the side areas and the chrome for distraction-free writing',
          icon: focusIcon,
          isToggled: () => focus,
          execute: () => {
            focus = !focus;
            if (labShell) {
              if (focus) {
                saved = {
                  left: !labShell.leftCollapsed,
                  right: !labShell.rightCollapsed,
                  mode: labShell.mode
                };
                labShell.collapseLeft();
                labShell.collapseRight();
                labShell.mode = 'single-document';
                showTabbar('left', false);
                showTabbar('right', false);
              } else {
                // Without a saved state (focus began before a reload), open everything.
                const state = saved || { left: true, right: true, mode: 'multiple-document' };
                labShell.mode = state.mode;
                showTabbar('left', true);
                showTabbar('right', true);
                if (state.left) {
                  labShell.expandLeft();
                }
                if (state.right) {
                  labShell.expandRight();
                }
                saved = null;
              }
            }
            document.body.classList.toggle('inkwell-focus', focus);
            app.commands.notifyCommandChanged(toggleFocus);
          }
        });

        const currentTheme = () => (themes ? themes.theme : document.body.dataset.jpThemeName);
        app.commands.addCommand(toggleTheme, {
          label: args => {
            if (!args.short) {
              return 'Night Theme';
            }
            return currentTheme() === NIGHT ? 'Paper' : 'Night';
          },
          caption: 'Switch between Inkwell Paper and Inkwell Night',
          icon: themeIcon,
          isToggled: () => currentTheme() === NIGHT,
          execute: () =>
            app.commands.execute('apputils:change-theme', {
              theme: currentTheme() === NIGHT ? PAPER : NIGHT
            })
        });
        if (themes) {
          themes.themeChanged.connect(() => app.commands.notifyCommandChanged(toggleTheme));
        }
        if (notebooks) {
          notebooks.currentChanged.connect(() => app.commands.notifyCommandChanged(insertSection));
        }

        if (palette) {
          for (const command of [insertSection, toggleFocus, toggleTheme]) {
            palette.addItem({ command, category: APP_NAME });
          }
        }
      }
    };

    /*
     * Live word count of the Markdown cells of the active notebook.
     */
    function countWords(text) {
      const clean = text
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, ' ')
        .replace(/[#>*_~|=]+/g, ' ');
      const words = clean.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu);
      return words ? words.length : 0;
    }

    const wordCount = {
      id: `${NAME}:word-count`,
      description: 'Live word count of the Markdown cells of the active notebook, in the top bar.',
      autoStart: true,
      optional: [INotebookTracker, ILabShell],
      activate: (app, notebooks, labShell) => {
        if (!notebooks) {
          return;
        }
        const widget = new Widget();
        widget.id = 'inkwell-word-count';
        widget.addClass('inkwell-word-count');
        widget.node.setAttribute('aria-live', 'polite');
        widget.node.title = 'Words in the Markdown cells of this notebook';
        app.shell.add(widget, 'top', { rank: 1000 });

        let timer = 0;
        const update = () => {
          const panel = notebooks.currentWidget;
          const visible = !!panel && (!labShell || app.shell.currentWidget === panel);
          widget.node.classList.toggle('inkwell-hidden', !visible);
          if (!visible || !panel.content.model) {
            widget.node.textContent = '';
            return;
          }
          const cells = panel.content.model.cells;
          let words = 0;
          for (let i = 0; i < cells.length; i++) {
            const cell = cells.get(i);
            if (cell.type === 'markdown') {
              words += countWords(cell.sharedModel.getSource());
            }
          }
          const minutes = Math.max(1, Math.round(words / 230));
          widget.node.textContent = '';
          const count = document.createElement('span');
          count.className = 'inkwell-word-count-value';
          count.textContent = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'}`;
          const read = document.createElement('span');
          read.className = 'inkwell-word-count-read';
          read.textContent = `${minutes} min read`;
          widget.node.append(count, read);
          widget.node.dataset.words = String(words);
        };
        const schedule = () => {
          clearTimeout(timer);
          timer = setTimeout(update, 200);
        };
        notebooks.widgetAdded.connect((sender, panel) => {
          void panel.context.ready.then(() => {
            panel.content.model.contentChanged.connect(schedule);
            schedule();
          });
        });
        notebooks.currentChanged.connect(schedule);
        if (labShell) {
          labShell.currentChanged.connect(schedule);
        }
        void app.restored.then(update);
      }
    };

    return [home, brand, favicon, about, splash, commands, wordCount];
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
