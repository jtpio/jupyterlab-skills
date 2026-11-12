# Shared packages, tokens and exports

What a no-build extension can take from JupyterLab with
`lab['<package>']`.

## Shared packages

The application shares these groups: `@jupyterlab/*`, `@lumino/*`, `react`,
`react-dom`, `yjs`, `@jupyter/ydoc`, `@jupyter/web-components`,
`@jupyter/react-components`, `@codemirror/state`, `@codemirror/view`,
`@codemirror/language`, `@lezer/common`, `@lezer/highlight`.

The exact list of an installation, with the versions (skill
`jupyterlab-inspect`):

```bash
<env>/bin/python ../jupyterlab-inspect/scripts/jlab_inspect.py shared [text]
```

## Service tokens

Put a token in `requires` or `optional` of a plugin. The service arrives as
an argument of `activate`.

- All core tokens, with a description of each service:
  https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#core-tokens
- The tokens of the running application, extensions included, with the
  plugin that provides each one (skill `jupyterlab-verify`):
  `jlab_probe.cjs --list tokens --grep <text>`.

The name of a token is `<package>:<Name>`, and the object is the export
`<Name>` of that package: `@jupyterlab/apputils:ISplashScreen` is
`lab['@jupyterlab/apputils'].ISplashScreen`. Four names give the wrong
package:

| Token name | Take it from |
| --- | --- |
| `@jupyterlab/coreutils:ISettingRegistry` | `@jupyterlab/settingregistry` |
| `@jupyterlab/coreutils:ISettingConnector` | `@jupyterlab/settingregistry` |
| `@jupyterlab/coreutils:IStateDB` | `@jupyterlab/statedb` |
| `@jupyterlab/application:IConnectionStatus` | `@jupyterlab/services` |

`JupyterFrontEnd.IPaths` (`@jupyterlab/application:IPaths`) is a member of
the class `JupyterFrontEnd`, not a top-level export.

The tokens that customizations use most:

| Token | Package | Service |
| --- | --- | --- |
| `ILabShell` | `@jupyterlab/application` | The shell with the JupyterLab API: mode, areas, signals |
| `ILayoutRestorer` | `@jupyterlab/application` | Restore widgets after a reload |
| `ICommandPalette` | `@jupyterlab/apputils` | Add items to the command palette |
| `IThemeManager` | `@jupyterlab/apputils` | Register and switch themes |
| `IToolbarWidgetRegistry` | `@jupyterlab/apputils` | Named widgets for toolbars defined in schemas |
| `ISettingRegistry` | `@jupyterlab/settingregistry` | Read and write settings |
| `IStateDB` | `@jupyterlab/statedb` | Small key-value store, saved per workspace |
| `ITranslator` | `@jupyterlab/translation` | Translations (`nullTranslator` is a no-op fallback) |
| `IMainMenu` | `@jupyterlab/mainmenu` | Main menu |
| `IStatusBar` | `@jupyterlab/statusbar` | Status bar |
| `ILauncher` | `@jupyterlab/launcher` | Launcher cards |
| `IDocumentManager` | `@jupyterlab/docmanager` | Open, create, rename, close documents |
| `IRecentsManager` | `@jupyterlab/docmanager` | Recently opened and closed documents |
| `IDefaultFileBrowser` | `@jupyterlab/filebrowser` | The file browser of the left sidebar (`model.path`) |
| `INotebookTracker` | `@jupyterlab/notebook` | Open notebooks, the active one |
| `IEditorTracker` | `@jupyterlab/fileeditor` | Open text editors |
| `IRenderMimeRegistry` | `@jupyterlab/rendermime` | Renderers for MIME types. Also renders a Markdown string (see `patterns.md`) |

## Other useful exports

Checked in a running JupyterLab 4.6. The API reference has all exports:
https://jupyterlab.readthedocs.io/en/stable/api/

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
