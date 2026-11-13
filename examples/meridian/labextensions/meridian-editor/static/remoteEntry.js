/*
 * meridian-editor: syntax colors of the editors and the cell gutter of the
 * notebooks (run button and execution count).
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = 'meridian-editor';

  const SHARED = [
    '@codemirror/language',
    '@codemirror/view',
    '@jupyterlab/cells',
    '@jupyterlab/codeeditor',
    '@jupyterlab/codemirror',
    '@jupyterlab/notebook',
    '@jupyterlab/ui-components',
    '@lezer/highlight'
  ];

  const STYLESHEETS = ['style.css'];

  /*
   * The "?v=..." of this file, for the other files of static/. The browser
   * keeps them for one year: only a new URL loads a changed file.
   */
  const STAMP = document.currentScript ? new URL(document.currentScript.src).search : '';

  function createPlugins(lab) {
    const { HighlightStyle, syntaxHighlighting } = lab['@codemirror/language'];
    const { EditorView } = lab['@codemirror/view'];
    const { InputPrompt } = lab['@jupyterlab/cells'];
    const { IEditorServices } = lab['@jupyterlab/codeeditor'];
    const { IEditorThemeRegistry } = lab['@jupyterlab/codemirror'];
    const { NotebookPanel } = lab['@jupyterlab/notebook'];
    const { LabIcon } = lab['@jupyterlab/ui-components'];
    const { tags: t } = lab['@lezer/highlight'];

    /*
     * Colors come from the Meridian themes; the fallbacks are the dark ones.
     */
    const syntax = (name, fallback) => `var(--meridian-syntax-${name}, ${fallback})`;
    const color = (name, fallback) => `var(--meridian-editor-${name}, ${fallback})`;

    const highlightStyle = HighlightStyle.define([
      {
        tag: [t.keyword, t.definitionKeyword, t.modifier, t.operatorKeyword, t.bool, t.null, t.self, t.atom],
        color: syntax('keyword', '#569cd6')
      },
      { tag: [t.controlKeyword, t.moduleKeyword], color: syntax('control', '#c586c0') },
      {
        tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName)), t.macroName],
        color: syntax('function', '#dcdcaa')
      },
      {
        tag: [t.className, t.definition(t.className), t.typeName, t.namespace],
        color: syntax('type', '#4ec9b0')
      },
      {
        tag: [t.variableName, t.definition(t.variableName), t.propertyName, t.definition(t.propertyName), t.attributeName, t.labelName],
        color: syntax('variable', '#9cdcfe')
      },
      { tag: [t.string, t.special(t.string), t.character, t.monospace, t.url], color: syntax('string', '#ce9178') },
      { tag: t.url, textDecoration: 'underline' },
      { tag: [t.escape, t.special(t.brace)], color: syntax('escape', '#d7ba7d') },
      { tag: t.regexp, color: syntax('regexp', '#d16969') },
      { tag: [t.number, t.integer, t.float], color: syntax('number', '#b5cea8') },
      { tag: [t.comment, t.lineComment, t.blockComment, t.docComment, t.quote], color: syntax('comment', '#6a9955') },
      {
        tag: [t.operator, t.arithmeticOperator, t.compareOperator, t.logicOperator, t.bitwiseOperator, t.updateOperator, t.definitionOperator, t.derefOperator],
        color: syntax('operator', '#d4d4d4')
      },
      { tag: [t.punctuation, t.separator, t.paren, t.bracket, t.squareBracket, t.brace, t.angleBracket], color: syntax('punctuation', '#d4d4d4') },
      { tag: t.meta, color: syntax('function', '#dcdcaa') },
      { tag: t.tagName, color: syntax('keyword', '#569cd6') },
      {
        tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6],
        color: syntax('heading', '#569cd6'),
        fontWeight: 'bold'
      },
      { tag: t.strong, color: syntax('heading', '#569cd6'), fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: syntax('string', '#ce9178') },
      { tag: t.contentSeparator, color: syntax('punctuation', '#d4d4d4') },
      { tag: t.inserted, color: syntax('number', '#b5cea8') },
      { tag: t.deleted, color: syntax('string', '#ce9178') },
      { tag: t.changed, color: syntax('keyword', '#569cd6') },
      { tag: t.invalid, color: syntax('invalid', '#f44747') }
    ]);

    const editorTheme = EditorView.theme({
      '&': {
        backgroundColor: color('background', 'var(--jp-layout-color0)'),
        color: color('foreground', 'var(--jp-content-font-color1)')
      },
      '.jp-CodeConsole &, .jp-Notebook &': {
        backgroundColor: 'transparent'
      },
      '.cm-content': {
        caretColor: color('cursor', '#aeafad')
      },
      '.cm-scroller': {
        fontFamily: 'inherit'
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeft: `2px solid ${color('cursor', '#aeafad')}`
      },
      '.cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: color('inactive-selection', '#3a3d41')
      },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
        backgroundColor: color('selection', '#264f78')
      },
      '.cm-gutters': {
        backgroundColor: color('background', 'var(--jp-layout-color0)'),
        color: color('line-number', '#6e7681'),
        border: 'none'
      },
      '.jp-Notebook & .cm-gutters, .jp-CodeConsole & .cm-gutters': {
        backgroundColor: 'transparent'
      },
      '.cm-gutter': {
        backgroundColor: 'transparent'
      },
      '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 12px 0 16px'
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: color('line-number-active', '#cccccc')
      },
      '.cm-activeLine': {
        backgroundColor: 'transparent',
        boxShadow: `inset 0 0 0 2px ${color('line-highlight-border', '#282828')}`
      },
      '.jp-Notebook & .cm-activeLine, .jp-CodeConsole & .cm-activeLine': {
        boxShadow: 'none'
      },
      '&.cm-focused .cm-matchingBracket, .cm-matchingBracket': {
        backgroundColor: color('bracket-match-background', 'rgba(0, 100, 0, 0.1)'),
        outline: `1px solid ${color('bracket-match-border', '#888888')}`
      },
      '.cm-selectionMatch': {
        backgroundColor: color('selection-highlight', 'rgba(173, 214, 255, 0.15)')
      },
      '.cm-searchMatch': {
        backgroundColor: color('find-match-highlight', 'rgba(234, 92, 0, 0.33)'),
        color: 'inherit'
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: `${color('find-match', '#9e6a03')} !important`,
        color: 'inherit !important'
      },
      '.cm-foldPlaceholder': {
        backgroundColor: 'transparent',
        border: 'none',
        color: color('line-number', '#6e7681')
      },
      '.cm-tooltip': {
        backgroundColor: color('widget-background', '#202020'),
        color: color('foreground', '#cccccc'),
        border: `1px solid ${color('widget-border', '#454545')}`,
        borderRadius: '3px'
      },
      '.cm-panels': {
        backgroundColor: color('widget-background', '#202020'),
        color: color('foreground', '#cccccc')
      }
    });

    const theme = {
      id: `${NAME}:theme`,
      description: 'The "meridian" editor theme: token colors of the default dark and light themes.',
      autoStart: true,
      requires: [IEditorThemeRegistry],
      activate: (app, registry) => {
        registry.addTheme({
          name: 'meridian',
          displayName: 'Meridian',
          theme: [editorTheme, syntaxHighlighting(highlightStyle)]
        });
      }
    };

    /*
     * The input prompt of a cell: a run button above the execution count,
     * written "[3]" as in the notebooks of the desktop editors.
     */
    function createPromptClass(app) {
      return class MeridianPrompt extends InputPrompt {
        constructor() {
          super();
          this.addClass('meridian-Prompt');
          this._meridianCount = null;
          this._count = document.createElement('div');
          this._count.className = 'meridian-Prompt-count';
          const run = document.createElement('button');
          run.className = 'meridian-Prompt-run';
          run.title = 'Execute Cell (Ctrl+Enter)';
          run.setAttribute('aria-label', 'Execute Cell');
          LabIcon.resolve({ icon: 'meridian-icons:play' }).element({ container: run });
          run.addEventListener('mousedown', event => event.preventDefault());
          run.addEventListener('click', event => {
            event.stopPropagation();
            this._runCell();
          });
          this.node.textContent = '';
          this.node.append(run, this._count);
        }

        get executionCount() {
          return this._meridianCount;
        }

        set executionCount(value) {
          this._meridianCount = value;
          if (this._count) {
            this._count.textContent = value === null || value === undefined ? '' : `[${value || ' '}]`;
          }
          this.toggleClass('meridian-mod-running', value === '*');
        }

        _runCell() {
          let cell = this.parent;
          while (cell && !(cell.parent && cell.parent.hasClass('jp-Notebook'))) {
            cell = cell.parent;
          }
          const notebook = cell && cell.parent;
          if (!notebook) {
            return;
          }
          const index = notebook.widgets.indexOf(cell);
          if (index >= 0) {
            notebook.activeCellIndex = index;
            notebook.deselectAll();
            void app.commands.execute('notebook:run-cell');
          }
        }
      };
    }

    const notebookFactory = {
      id: `${NAME}:notebook-factory`,
      description: 'Notebook and cell factory with the Meridian cell gutter.',
      autoStart: true,
      provides: NotebookPanel.IContentFactory,
      requires: [IEditorServices],
      activate: (app, editorServices) => {
        const Prompt = createPromptClass(app);
        class Factory extends NotebookPanel.ContentFactory {
          createInputPrompt() {
            return new Prompt();
          }
        }
        return new Factory({ editorFactory: editorServices.factoryService.newInlineEditor });
      }
    };

    return [theme, notebookFactory];
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
