# A custom shell (kind `shell`)

In the kind `shell`, the application is not the `JupyterLab` class. It is
your subclass of `JupyterFrontEnd` with a shell that you write. The template
gives a working one: a top bar, an optional menu bar and one document at a
time. This reference tells what the shell must supply, and what core plugins
expect. All of it was found by a build and a run on JupyterLab 4.6.6.

## Files of the template

| File | Role |
| --- | --- |
| `src/shell.js` | The shell: a Lumino `Widget` with a `BoxLayout`. Areas `top`, `menu`, `main` |
| `src/app.js` | `class App extends JupyterFrontEnd`: name, version, `paths`, plugin registration |
| `src/index.js` | Selects the core plugins by name (`pick()`), registers them and yours, starts the application |
| `src/plugins/paths.js` | Provides `JupyterFrontEnd.IPaths` from the page config |
| `src/plugins/opener.js` | Opens the notebook that the URL names, or shows a start page |
| `src/plugins/top.js` | The brand and the buttons of the top bar |
| `style/app.css` | Layout of the shell and your look |
| `<module>/app.py` | The server class, with a handler for `/<name>/notebooks/<path>` |

## What the shell must implement

`JupyterFrontEnd.IShell` is small. Core plugins and the browser probe use
these members:

| Member | Used by | Notes |
| --- | --- | --- |
| `add(widget, area, options)` | Document manager, your plugins | `options.rank` orders the widgets of `top` and `menu`. Warn for an unknown area; do not throw |
| `currentWidget` | Notebook commands | A notebook command is enabled only when the notebook tracker's widget is the shell's current widget |
| `currentChanged` | Document manager, trackers | A Lumino `Signal` with `{oldValue, newValue}` |
| `activateById(id)` | Document manager, the probe (`--activate`) | Show the widget and call `widget.activate()` |
| `widgets(area)` | Document manager, the probe | An iterator. An unknown area gives an empty iterator |
| `restored` (a promise, on the shell or the application) | Many plugins, the probe | It must resolve. The template resolves it when the first widget is in `main` |

To add an area (a left panel, a footer), add a Lumino panel to the layout in
the constructor, a `case` in `add()`, and an entry in `widgets()` and
`activateById()`. For a split between two areas, use a `SplitPanel` in place
of one of the panels.

A child of a `SplitPanel` that hides and shows again gets a default size.
Keep the sizes of the user:

```js
setTextVisible(visible) {
  if (!visible) {
    this._sizes = this._split.relativeSizes();
  }
  this._text.setHidden(!visible);
  if (visible && this._sizes) {
    this._split.setRelativeSizes(this._sizes);
  }
}
```

The divider of a `SplitPanel` is `.lm-SplitPanel-handle`; a hidden widget
has the class `lm-mod-hidden`.

To replace the document in `main` (the next page of a guide, another
notebook), open the new one first, then save and close the old one:

```js
async function closeDocument(docManager, widget) {
  if (!widget || widget.isDisposed) {
    return;
  }
  const context = docManager.contextForWidget(widget);
  if (context?.model.dirty && context.contentsModel?.writable !== false) {
    await context.save();
  }
  widget.close();
}
```

`docManager` is the service of the token `IDocumentManager`
(`@jupyterlab/docmanager`). With the setting `kernelShutdown: true` of
`@jupyterlab/notebook-extension:tracker` in `settings/overrides.json`, the
kernel of a closed notebook stops.

Layout CSS that the shell needs:

```css
body {
  margin: 0;
}
#my-app-shell {
  position: absolute;
  inset: 0;
}
#my-app-top {
  min-height: 40px;
}
```

A panel with stretch 0 in a `BoxLayout` gets its CSS `min-height`, not the
height of its content: set `min-height` for bars.

## Select core plugins by name

With the JupyterLab shell, you take whole packages and disable a few
plugins. With your own shell it is the opposite: many core plugins require
`ILabShell` or check that the application is JupyterLab, so you take the few
plugins that you need. `pick(package, [names])` in `src/index.js` does this
and stops at page load with an error if a name does not exist.

The set of the template (25 core plugins) opens, edits, runs and saves a
notebook:

| Package | Plugins to keep | Why |
| --- | --- | --- |
| `application-extension` | `router` | URL routing. Needs `IPaths` |
| `apputils-extension` | `settings`, `themes`, `toolbar-registry` | Settings, the theme manager, toolbars defined in settings |
| `codemirror-extension` | `binding`, `extensions`, `languages`, `services`, `themes` | The editor. Without `binding`, typed text does not reach the cell model |
| `completer-extension` | `base-service`, `manager` | Tab completion |
| `docmanager-extension` | `manager`, `opener`, `plugin` | Open and save documents |
| `notebook-extension` | `cell-executor`, `completer`, `factory`, `tracker`, `widget-factory` | The notebook |
| `translation-extension` | `translator` | Required by most plugins |
| `markedparser`, `mathjax`, `rendermime`, `shortcuts`, `theme-light` | all | Markdown, LaTeX, outputs, key bindings, the theme |

Only one stand-in was necessary: a plugin that provides
`JupyterFrontEnd.IPaths`. For this set, `ILabShell`, `ILayoutRestorer`,
`IStateDB`, `IStatusBar`, `ICommandPalette` and `IMainMenu` are optional.

Plugins that do not work outside JupyterLab, with their message:

| Message | Plugins |
| --- | --- |
| `…:shell did not find a LabShell instance.` | Each plugin that requires `ILabShell`: application `shell`, `layout`, `logo`, `move-widget`, `property-inspector`; apputils `palette-restorer`; docmanager `path-status`, `saving-status`; notebook `execution-indicator` |
| `<id> must be activated in JupyterLab.` | application `dirty`, `info`, `main`, `paths`, `status` |
| `No provider for: <token>` | A plugin that requires a package that is not in the bundle (status bar, search, table of contents, form registry, file browser) |

To add a feature, find its plugin in `core-plugins.md` (skill
`jupyterlab-inspect`), add its name to `pick()`, build, and read the
console. Provide the token that it requires with a small plugin of your own,
or leave the plugin out.

`jlab_remix.py plan` describes the JupyterLab shell. For a custom shell, use
it with `--exact` to see what a set of packages requires, and ignore the
lines about `application-extension`.

## Details that cost time

- **Shortcuts first.** The shortcuts plugin fails
  (`Cannot read properties of undefined (reading 'schema')`) when another
  plugin loads its settings before it. The template activates it before
  `app.start()`: keep that line.
- **A schema must be copied.** A plugin with settings needs its package in
  `jupyterlab.extensions` of `package.json`, or the console shows
  `Schema not found`. A plugin without settings (the router) does not.
- **Command state.** `currentChanged` occurs before the document is ready,
  so `docmanager:save` is disabled at that moment. After `widget.revealed`,
  call `app.commands.notifyCommandChanged()` to refresh your buttons.
- **New notebook.** `notebook:create-new` without `kernelName` opens the
  kernel dialog. Pass `{ kernelName: 'python3' }` to skip it.
- **Close.** `widget.close()` on a changed document opens the stock
  confirmation dialog.
- **Server routes.** `jupyterlab_server` ends its handlers with a catch-all
  for `/<name>/.*`. Add yours before `super().initialize_handlers()`, as the
  template does. The stock `LabHandler` serves the same page for more URLs.
- **One application for each server.** All `LabServerApp` applications of a
  server write to one page config. The template sets
  `load_other_extensions = False`.
- **Not in the template:** a warning for unsaved changes when the page
  closes, a dark theme, a context menu, prebuilt extensions.

## What the probe needs

The probe of `jupyterlab-verify` works with a custom application when:

- the frontend sets `window.jupyterapp` if the page config has
  `exposeAppInBrowser` (the template does);
- `app.restored` resolves;
- the server class has the configurable options `expose_app_in_browser`,
  `user_settings_dir` and `workspaces_dir` (the template has them);
- you start the server with `--app-class <Class> --path <name>`.

`--server` opens the start page. For a notebook URL, take the URL from
`jlab_server.py url` and add the path:
`…/<name>/notebooks/<file>?token=…`, with `--url`.
