# Shared packages, tokens and exports

What a no-build extension can take from JupyterLab with
`lab['<package>']`. All exports below were checked in a running
JupyterLab 4.6.

## Shared packages

All packages of these groups are shared:

- `@jupyterlab/*`: `application`, `apputils`, `cells`, `codeeditor`,
  `codemirror`, `completer`, `console`, `coreutils`, `csvviewer`, `debugger`,
  `docmanager`, `docregistry`, `documentsearch`, `extensionmanager`,
  `filebrowser`, `fileeditor`, `htmlviewer`, `imageviewer`, `inspector`,
  `launcher`, `logconsole`, `lsp`, `mainmenu`, `markdownviewer`, `mermaid`,
  `metadataform`, `nbformat`, `notebook`, `observables`, `outputarea`,
  `pluginmanager`, `property-inspector`, `rendermime`,
  `rendermime-interfaces`, `running`, `services`, `settingeditor`,
  `settingregistry`, `statedb`, `statusbar`, `terminal`, `toc`, `tooltip`,
  `translation`, `ui-components`, `workspaces`
- `@lumino/*`: `algorithm`, `application`, `commands`, `coreutils`,
  `datagrid`, `disposable`, `domutils`, `dragdrop`, `keyboard`, `messaging`,
  `polling`, `properties`, `signaling`, `virtualdom`, `widgets`
- `react`, `react-dom`, `yjs`, `@jupyter/ydoc`, `@jupyter/web-components`,
  `@jupyter/react-components`
- `@codemirror/state`, `@codemirror/view`, `@codemirror/language`,
  `@lezer/common`, `@lezer/highlight`

The exact list of an installation is the `resolutions` object of
`<site-packages>/jupyterlab/staging/package.json`.

## Service tokens

Put a token in `requires` or `optional` of a plugin. The service arrives as
an argument of `activate`.

| Token | Package | Service |
| --- | --- | --- |
| `ILabShell` | `@jupyterlab/application` | The shell with the JupyterLab API: mode, areas, signals |
| `ILayoutRestorer` | `@jupyterlab/application` | Restore widgets after a reload |
| `IRouter` | `@jupyterlab/application` | URL routing |
| `ILabStatus` | `@jupyterlab/application` | Busy and dirty state of the application |
| `ICommandPalette` | `@jupyterlab/apputils` | Add items to the command palette |
| `IThemeManager` | `@jupyterlab/apputils` | Register and switch themes |
| `ISplashScreen` | `@jupyterlab/apputils` | The splash screen |
| `IToolbarWidgetRegistry` | `@jupyterlab/apputils` | Named widgets for toolbars defined in schemas |
| `ISessionContextDialogs` | `@jupyterlab/apputils` | Kernel selection and restart dialogs |
| `ISanitizer` | `@jupyterlab/apputils` | HTML sanitizer |
| `IKernelStatusModel` | `@jupyterlab/apputils` | Kernel status of the status bar |
| `ISettingRegistry` | `@jupyterlab/settingregistry` | Read and write settings |
| `IStateDB` | `@jupyterlab/statedb` | Small key-value store, saved per workspace |
| `ITranslator` | `@jupyterlab/translation` | Translations (`nullTranslator` is a no-op fallback) |
| `IMainMenu` | `@jupyterlab/mainmenu` | Main menu |
| `IStatusBar` | `@jupyterlab/statusbar` | Status bar |
| `ILauncher` | `@jupyterlab/launcher` | Launcher cards |
| `IDocumentManager` | `@jupyterlab/docmanager` | Open, create, rename, close documents |
| `IDocumentWidgetOpener` | `@jupyterlab/docmanager` | Signal when a document widget opens |
| `IRecentsManager` | `@jupyterlab/docmanager` | Recently opened and closed documents |
| `IDefaultFileBrowser` | `@jupyterlab/filebrowser` | The file browser of the left sidebar (`model.path`) |
| `IFileBrowserFactory` | `@jupyterlab/filebrowser` | Create more file browsers |
| `INotebookTracker` | `@jupyterlab/notebook` | Open notebooks, the active one |
| `INotebookWidgetFactory` | `@jupyterlab/notebook` | The notebook factory |
| `INotebookTools` | `@jupyterlab/notebook` | Notebook tools panel |
| `IEditorTracker` | `@jupyterlab/fileeditor` | Open text editors |
| `IConsoleTracker` | `@jupyterlab/console` | Open code consoles |
| `ITerminalTracker` | `@jupyterlab/terminal` | Open terminals |
| `IMarkdownViewerTracker` | `@jupyterlab/markdownviewer` | Open Markdown previews |
| `IImageTracker` | `@jupyterlab/imageviewer` | Open images |
| `IHTMLViewerTracker` | `@jupyterlab/htmlviewer` | Open HTML viewers |
| `IRenderMimeRegistry` | `@jupyterlab/rendermime` | Renderers for output MIME types |
| `IEditorServices` | `@jupyterlab/codeeditor` | Editor factories |
| `IEditorExtensionRegistry` | `@jupyterlab/codemirror` | CodeMirror extensions |
| `IEditorLanguageRegistry` | `@jupyterlab/codemirror` | Editor languages |
| `IEditorThemeRegistry` | `@jupyterlab/codemirror` | Editor themes |
| `ICompletionProviderManager` | `@jupyterlab/completer` | Completion providers |
| `ITableOfContentsRegistry` | `@jupyterlab/toc` | Table of contents providers |
| `ITableOfContentsTracker` | `@jupyterlab/toc` | Active table of contents |
| `IRunningSessionManagers` | `@jupyterlab/running` | Sections of the running panel |
| `IPropertyInspectorProvider` | `@jupyterlab/property-inspector` | Property inspector |
| `ISearchProviderRegistry` | `@jupyterlab/documentsearch` | Search providers |
| `ILoggerRegistry` | `@jupyterlab/logconsole` | Log console |
| `ILSPDocumentConnectionManager` | `@jupyterlab/lsp` | Language server connections |
| `IDebugger` | `@jupyterlab/debugger` | Debugger |
| `IWorkspaceCommands` | `@jupyterlab/workspaces` | Workspace commands |
| `IFormRendererRegistry` | `@jupyterlab/ui-components` | Custom fields of the Settings Editor |
| `ILabIconManager` | `@jupyterlab/ui-components` | Icon manager |
| `IServiceManager`, `IKernelManager`, `ISessionManager`, `IContentsManager` | `@jupyterlab/services` | Parts of `app.serviceManager` |

The "Provides" column of `core-plugins.md` (skill `jupyterlab-inspect`) names
the plugin that provides each token.

## Other useful exports

| Package | Exports |
| --- | --- |
| `@jupyterlab/apputils` | `MainAreaWidget`, `WidgetTracker`, `ReactWidget`, `Dialog`, `showDialog`, `showErrorMessage`, `InputDialog`, `Notification`, `ToolbarButton`, `CommandToolbarButton`, `Clipboard`, `DOMUtils`, `SessionContext`, `createToolbarFactory`, `setToolbar` |
| `@jupyterlab/ui-components` | `LabIcon`, the built-in icons (`addIcon`, `closeIcon`, `runIcon`, `saveIcon`, `folderIcon`, `notebookIcon`, `settingsIcon`, `jupyterIcon`…), `SidePanel`, `PanelWithToolbar`, `Toolbar`, `ToolbarButtonComponent`, `Button`, `UseSignal`, `VDomRenderer`, `VDomModel` |
| `@jupyterlab/coreutils` | `PageConfig`, `URLExt`, `PathExt`, `Time` |
| `@jupyterlab/services` | `ServerConnection` |
| `@jupyterlab/notebook` | `NotebookActions`, `NotebookPanel` |
| `@jupyterlab/cells` | `Cell`, `CodeCell`, `MarkdownCell` |
| `@jupyterlab/docregistry` | `DocumentRegistry`, `ABCWidgetFactory`, `DocumentWidget` |
| `@jupyterlab/launcher` | `Launcher`, `LauncherModel` |
| `@jupyterlab/outputarea` | `OutputArea` |
| `@lumino/widgets` | `Widget`, `Panel`, `BoxPanel`, `SplitPanel`, `StackedPanel`, `TabPanel`, `DockPanel`, `Menu`, `BoxLayout`, `PanelLayout` |
| `@lumino/signaling` | `Signal` |
| `@lumino/coreutils` | `Token`, `UUID`, `JSONExt`, `PromiseDelegate` |
| `@lumino/commands` | `CommandRegistry` |
| `@lumino/disposable` | `DisposableDelegate`, `DisposableSet` |
| `@lumino/polling` | `Poll`, `Debouncer`, `Throttler` |
| `react` | `createElement`, `useState`, `useEffect`, the other hooks |

## Make your own token

A plugin of your extension can provide a service to your other plugins:

```js
const { Token } = lab['@lumino/coreutils'];

const IMyService = new Token(`${NAME}:IMyService`, 'What the service does.');

const provider = {
  id: `${NAME}:service`,
  autoStart: true,
  provides: IMyService,
  activate: app => ({ greet: name => `Hello ${name}` })
};

const consumer = {
  id: `${NAME}:consumer`,
  autoStart: true,
  requires: [IMyService],
  activate: (app, service) => {
    console.log(service.greet('world'));
  }
};
```

Add `@lumino/coreutils` to `SHARED`. The token object works inside one
extension only. To share a service between two extensions, both must get the
same token object: that needs a common npm package and the TypeScript path.
