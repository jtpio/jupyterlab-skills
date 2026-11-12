import '@jupyterlab/notebook/style/index.js';
import '@jupyterlab/completer/style/index.js';
import '@jupyterlab/mathjax-extension/style/index.js';
import '@jupyterlab/theme-light-extension/style/theme.css';
import '../style/index.css';

import { applyJupyterTheme } from '@jupyter/web-components';
import {
  SessionContextDialogs,
  Toolbar as AppToolbar
} from '@jupyterlab/apputils';
import {
  CodeMirrorEditorFactory,
  CodeMirrorMimeTypeService,
  EditorExtensionRegistry,
  EditorLanguageRegistry,
  EditorThemeRegistry,
  ybinding
} from '@jupyterlab/codemirror';
import {
  Completer,
  CompleterModel,
  CompletionHandler,
  KernelCompleterProvider,
  ProviderReconciliator
} from '@jupyterlab/completer';
import { PageConfig } from '@jupyterlab/coreutils';
import { DocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { createMarkdownParser } from '@jupyterlab/markedparser-extension';
import { MathJaxTypesetter } from '@jupyterlab/mathjax-extension';
import {
  ExecutionIndicator,
  NotebookModelFactory,
  NotebookPanel,
  NotebookWidgetFactory,
  StaticNotebook,
  ToolbarItems,
  runCell,
  setCellExecutor
} from '@jupyterlab/notebook';
import {
  RenderMimeRegistry,
  standardRendererFactories
} from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { CommandToolbarButton, Toolbar } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';

import { COMMAND_IDS, setupCommands } from './commands';

/**
 * The languages of the editors: Python for code cells and Markdown.
 */
function createLanguages() {
  const languages = new EditorLanguageRegistry();
  EditorLanguageRegistry.getDefaultLanguages()
    .filter(language =>
      ['ipython', 'python'].includes(language.name.toLowerCase())
    )
    .forEach(language => {
      languages.addLanguage(language);
    });
  languages.addLanguage({
    name: 'ipythongfm',
    mime: 'text/x-ipythongfm',
    load: async () => {
      const m = await import('@codemirror/lang-markdown');
      return m.markdown({ codeLanguages: info => languages.findBest(info) });
    }
  });
  return languages;
}

/**
 * The CodeMirror extensions of each editor: the defaults, plus the binding
 * of the editor to the shared model of its cell.
 */
function createEditorExtensions() {
  const themes = new EditorThemeRegistry();
  EditorThemeRegistry.getDefaultThemes().forEach(theme => {
    themes.addTheme(theme);
  });
  const registry = new EditorExtensionRegistry();
  EditorExtensionRegistry.getDefaultExtensions({ themes }).forEach(factory => {
    registry.addExtension(factory);
  });
  registry.addExtension({
    name: 'shared-model-binding',
    factory: options => {
      const sharedModel = options.model.sharedModel;
      return EditorExtensionRegistry.createImmutableExtension(
        ybinding({
          ytext: sharedModel.ysource,
          undoManager: sharedModel.undoManager ?? undefined
        })
      );
    }
  });
  return registry;
}

/**
 * Connect a completer to the active cell of the notebook and to its kernel.
 */
function createCompleter(panel) {
  const completer = new Completer({
    editor: null,
    model: new CompleterModel()
  });
  const createReconciliator = () =>
    new ProviderReconciliator({
      context: {
        widget: panel,
        editor: panel.content.activeCell?.editor ?? null,
        session: panel.sessionContext.session
      },
      providers: [new KernelCompleterProvider()],
      timeout: 1000
    });
  const handler = new CompletionHandler({
    completer,
    reconciliator: createReconciliator()
  });
  void panel.sessionContext.ready.then(() => {
    handler.reconciliator = createReconciliator();
  });
  panel.content.activeCellChanged.connect((sender, cell) => {
    handler.editor = cell && cell.editor;
  });
  completer.hide();
  completer.addClass('jp-ThemedContainer');
  Widget.attach(completer, document.body);
  return handler;
}

function createApp(manager) {
  // Without an executor, each run of a cell logs a warning.
  setCellExecutor({ runCell });

  const commands = new CommandRegistry();
  document.addEventListener(
    'keydown',
    event => {
      commands.processKeydownEvent(event);
    },
    true
  );

  const languages = createLanguages();
  const rendermime = new RenderMimeRegistry({
    initialFactories: standardRendererFactories,
    latexTypesetter: new MathJaxTypesetter(),
    markdownParser: createMarkdownParser(languages)
  });

  // The page has one document: nothing opens next to it.
  const opener = {
    open: () => undefined,
    opened: { connect: () => false, disconnect: () => false }
  };
  const docRegistry = new DocumentRegistry();
  const docManager = new DocumentManager({
    registry: docRegistry,
    manager,
    opener
  });

  const editorFactory = new CodeMirrorEditorFactory({
    extensions: createEditorExtensions(),
    languages
  });
  const sessionContextDialogs = new SessionContextDialogs();
  const toolbarFactory = panel =>
    [
      COMMAND_IDS.save,
      COMMAND_IDS.insert,
      COMMAND_IDS.deleteCell,
      COMMAND_IDS.cut,
      COMMAND_IDS.copy,
      COMMAND_IDS.paste,
      COMMAND_IDS.runAndAdvance,
      COMMAND_IDS.interrupt,
      COMMAND_IDS.restart,
      COMMAND_IDS.restartAndRun
    ]
      .map(id => ({
        name: id,
        widget: new CommandToolbarButton({
          commands,
          id,
          args: { toolbar: true }
        })
      }))
      .concat([
        { name: 'cellType', widget: ToolbarItems.createCellTypeItem(panel) },
        { name: 'spacer', widget: Toolbar.createSpacerItem() },
        {
          name: 'kernelName',
          widget: AppToolbar.createKernelNameItem(
            panel.sessionContext,
            sessionContextDialogs
          )
        },
        {
          name: 'executionProgress',
          widget: ExecutionIndicator.createExecutionIndicatorItem(panel)
        }
      ]);

  docRegistry.addModelFactory(new NotebookModelFactory({}));
  docRegistry.addWidgetFactory(
    new NotebookWidgetFactory({
      name: 'Notebook',
      modelName: 'notebook',
      fileTypes: ['notebook'],
      defaultFor: ['notebook'],
      preferKernel: true,
      canStartKernel: true,
      rendermime,
      contentFactory: new NotebookPanel.ContentFactory({
        editorFactory: editorFactory.newInlineEditor
      }),
      mimeTypeService: new CodeMirrorMimeTypeService(languages),
      toolbarFactory,
      notebookConfig: {
        ...StaticNotebook.defaultNotebookConfig,
        windowingMode: 'none'
      }
    })
  );

  const panel = docManager.open(PageConfig.getOption('notebookPath'));
  panel.id = 'main';
  panel.addClass('jp-ThemedContainer');
  setupCommands(commands, panel, createCompleter(panel), sessionContextDialogs);

  Widget.attach(panel, document.body);
  window.addEventListener('resize', () => {
    panel.update();
  });
}

window.addEventListener('load', async () => {
  applyJupyterTheme();
  const manager = new ServiceManager();
  await manager.ready;
  createApp(manager);
});
