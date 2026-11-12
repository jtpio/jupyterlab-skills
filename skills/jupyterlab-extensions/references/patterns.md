# Extension patterns

Code for `createPlugins(lab)` of a no-build extension. All snippets were run
on JupyterLab 4.6. Each one names the packages to add to `SHARED`. In a
TypeScript extension, the same names are imports.

## Contents

- [Command, palette, shortcut](#command-palette-shortcut)
- [Widget in the top bar](#widget-in-the-top-bar)
- [Sidebar panel](#sidebar-panel)
- [Main area panel](#main-area-panel)
- [Panel that survives a reload](#panel-that-survives-a-reload)
- [React content](#react-content)
- [Icons](#icons)
- [Status bar item](#status-bar-item)
- [Launcher card](#launcher-card)
- [Notebook toolbar button](#notebook-toolbar-button)
- [Work with the active notebook](#work-with-the-active-notebook)
- [Settings](#settings)
- [Keep a value between sessions](#keep-a-value-between-sessions)
- [Startup actions](#startup-actions)
- [Server requests and files](#server-requests-and-files)
- [Run code in a kernel](#run-code-in-a-kernel)
- [Render Markdown](#render-markdown)
- [Dialogs and notifications](#dialogs-and-notifications)
- [Menus from code](#menus-from-code)
- [File types](#file-types)
- [Stylesheets and assets](#stylesheets-and-assets)
- [React to the application state](#react-to-the-application-state)

## Command, palette, shortcut

`SHARED`: `@jupyterlab/apputils`

```js
const { ICommandPalette } = lab['@jupyterlab/apputils'];

const plugin = {
  id: `${NAME}:commands`,
  autoStart: true,
  optional: [ICommandPalette],
  activate: (app, palette) => {
    const command = `${NAME}:run-and-save`;
    app.commands.addCommand(command, {
      label: 'Run All and Save',
      caption: 'Run all cells, then save the notebook',
      isEnabled: () => app.commands.hasCommand('notebook:run-all-cells'),
      execute: async args => {
        await app.commands.execute('notebook:run-all-cells');
        await app.commands.execute('docmanager:save');
      }
    });
    if (palette) {
      palette.addItem({ command, category: 'Notebook' });
    }
    app.commands.addKeyBinding({
      command,
      keys: ['Accel Shift S'],
      selector: '.jp-Notebook'
    });
  }
};
```

A command can also set `icon`, `isVisible`, `isToggled`, and can compute
`label` from `args`. Prefer shortcuts in the schema
(`jupyter.lab.shortcuts`): the user can then change them in the settings.

## Widget in the top bar

`SHARED`: `@lumino/widgets`

```js
const { Widget } = lab['@lumino/widgets'];

activate: app => {
  const brand = new Widget();
  brand.id = 'my-brand';
  brand.addClass('my-brand');
  brand.node.textContent = 'My Lab';
  app.shell.add(brand, 'top', { rank: 0 });
}
```

Ranks in the top area: the logo is 0, the menu bar and the title 100, the
top bar toolbar (`TopBar`) 900. A rank above 900 goes to the right end. For a
button that runs a command, use the `TopBar` toolbar in the schema: it needs
no code.

## Sidebar panel

`SHARED`: `@lumino/widgets`, `@jupyterlab/ui-components`

```js
const { Widget } = lab['@lumino/widgets'];
const { LabIcon } = lab['@jupyterlab/ui-components'];

const icon = new LabIcon({
  name: `${NAME}:notes`,
  svgstr:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path class="jp-icon3" fill="#616161" d="M5 3h14v18H5z"/></svg>'
});

activate: app => {
  const panel = new Widget();
  panel.id = 'my-notes-panel';
  panel.title.icon = icon;
  panel.title.caption = 'Notes';
  panel.addClass('my-notes-panel');
  panel.node.innerHTML = '<h3>Notes</h3>';
  app.shell.add(panel, 'left', { rank: 200 });
}
```

Use `'right'` for the right side. A sidebar tab shows `title.icon`; the
caption is the tooltip. The panel is closed until the user selects its tab;
open it from code with `app.shell.activateById('my-notes-panel')`. Ranks of the built-in left tabs: file browser 100,
running 200, table of contents 400, extension manager 1000.

## Main area panel

`SHARED`: `@jupyterlab/apputils`, `@lumino/widgets`

```js
const { MainAreaWidget } = lab['@jupyterlab/apputils'];
const { Widget } = lab['@lumino/widgets'];

app.commands.addCommand(`${NAME}:open`, {
  label: 'Open My Panel',
  execute: () => {
    const content = new Widget();
    content.addClass('my-panel');
    content.node.innerHTML = '<h2>My panel</h2>';
    const widget = new MainAreaWidget({ content });
    widget.id = `my-panel-${Date.now()}`;
    widget.title.label = 'My Panel';
    widget.title.closable = true;
    app.shell.add(widget, 'main');
    app.shell.activateById(widget.id);
  }
});
```

Options of `app.shell.add(widget, 'main', options)`: `mode`
(`'split-right'`, `'split-left'`, `'split-top'`, `'split-bottom'`,
`'tab-after'`, `'tab-before'`), `ref` (ID of the widget to place it next to),
`activate`. `MainAreaWidget` gives the panel a toolbar (`widget.toolbar`) and
focus handling. A panel that needs no toolbar hides it:
`widget.toolbar.hide()`.

## Panel that survives a reload

`SHARED`: `@jupyterlab/application`, `@jupyterlab/apputils`, `@lumino/widgets`

```js
const { ILayoutRestorer } = lab['@jupyterlab/application'];
const { MainAreaWidget, WidgetTracker } = lab['@jupyterlab/apputils'];
const { Widget } = lab['@lumino/widgets'];

const plugin = {
  id: `${NAME}:panel`,
  autoStart: true,
  optional: [ILayoutRestorer],
  activate: (app, restorer) => {
    const tracker = new WidgetTracker({ namespace: 'my-panel' });
    const command = `${NAME}:open-panel`;
    app.commands.addCommand(command, {
      label: 'My Panel',
      execute: () => {
        let widget = tracker.currentWidget;
        if (!widget || widget.isDisposed) {
          const content = new Widget();
          content.node.innerHTML = '<h2>My panel</h2>';
          widget = new MainAreaWidget({ content });
          widget.id = 'my-panel';
          widget.title.label = 'My Panel';
          widget.title.closable = true;
          void tracker.add(widget);
        }
        if (!widget.isAttached) {
          app.shell.add(widget, 'main');
        }
        app.shell.activateById(widget.id);
      }
    });
    if (restorer) {
      void restorer.restore(tracker, { command, name: () => 'my-panel' });
    }
  }
};
```

The restorer runs the command again after a reload when the panel was open.
A sidebar widget is restored with `restorer.add(widget, 'my-notes-panel')`.

## React content

`SHARED`: `@jupyterlab/apputils`, `react`

```js
const { ReactWidget } = lab['@jupyterlab/apputils'];
const React = lab['react'];
const h = React.createElement;

function Counter() {
  const [count, setCount] = React.useState(0);
  return h(
    'div',
    { className: 'my-counter' },
    h('p', null, `Clicked ${count} times`),
    h('button', { onClick: () => setCount(count + 1) }, 'Click')
  );
}

const content = ReactWidget.create(h(Counter));
```

`content` is a Lumino widget: add it to the shell, or wrap it in a
`MainAreaWidget`. JSX needs a build; `React.createElement` does not.

## Icons

`SHARED`: `@jupyterlab/ui-components`

```js
const { LabIcon, addIcon, runIcon, notebookIcon } = lab['@jupyterlab/ui-components'];

const myIcon = new LabIcon({ name: `${NAME}:logo`, svgstr: '<svg …>…</svg>' });
```

- Use an icon as `icon` of a command, as `widget.title.icon`, or render it
  into a node: `myIcon.element({ container: node, height: '18px', width: '18px' })`.
- Classes inside the SVG make it follow the theme: `jp-icon3` on a `fill`
  (normal icon color), `jp-icon-brand0` (brand color), `jp-icon-accent0`.
- Built-in icons are exports of `@jupyterlab/ui-components` (`addIcon`,
  `closeIcon`, `runIcon`, `saveIcon`, `notebookIcon`, `folderIcon`,
  `settingsIcon`, `jupyterIcon`…). In a schema, refer to an icon by name:
  `"icon": "ui-components:run"`, or `"icon": "<NAME>:logo"` for your own.

## Status bar item

`SHARED`: `@jupyterlab/statusbar`, `@lumino/widgets`

```js
const { IStatusBar } = lab['@jupyterlab/statusbar'];
const { Widget } = lab['@lumino/widgets'];

const plugin = {
  id: `${NAME}:status`,
  autoStart: true,
  optional: [IStatusBar],
  activate: (app, statusBar) => {
    if (!statusBar) {
      return;
    }
    const item = new Widget();
    item.node.textContent = 'Ready';
    statusBar.registerStatusItem(`${NAME}:status`, {
      item,
      align: 'left',
      rank: 0,
      isActive: () => true
    });
  }
};
```

`align`: `'left'`, `'middle'` or `'right'`. Keep `IStatusBar` optional: the
status bar can be disabled.

## Launcher card

`SHARED`: `@jupyterlab/launcher`

```js
const { ILauncher } = lab['@jupyterlab/launcher'];

const plugin = {
  id: `${NAME}:launcher`,
  autoStart: true,
  optional: [ILauncher],
  activate: (app, launcher) => {
    if (launcher) {
      launcher.add({ command: `${NAME}:open-panel`, category: 'Other', rank: 0 });
    }
  }
};
```

The card uses the `label` and the `icon` of the command. Categories of the
stock launcher: `Notebook`, `Console`, `Other`. A new category name makes a
new section.

## Notebook toolbar button

Without code: `jupyter.lab.toolbars` → `Notebook` in the schema. With code,
for a button that needs the notebook:

`SHARED`: `@jupyterlab/apputils`, `@jupyterlab/notebook`

```js
const { ToolbarButton } = lab['@jupyterlab/apputils'];
const { NotebookActions } = lab['@jupyterlab/notebook'];

activate: app => {
  app.docRegistry.addWidgetExtension('Notebook', {
    createNew: panel => {
      const button = new ToolbarButton({
        label: 'Run all',
        tooltip: 'Run all cells',
        onClick: () => NotebookActions.runAll(panel.content, panel.sessionContext)
      });
      panel.toolbar.insertItem(0, 'my-run-all', button);
      return button;
    }
  });
}
```

`createNew` runs for each notebook that opens. The same call with `'Editor'`
adds to text editors. `ToolbarButton` also takes `icon`, `className`,
`enabled`.

## Work with the active notebook

`SHARED`: `@jupyterlab/notebook`

```js
const { INotebookTracker, NotebookActions } = lab['@jupyterlab/notebook'];

const plugin = {
  id: `${NAME}:notebooks`,
  autoStart: true,
  optional: [INotebookTracker],
  activate: (app, notebooks) => {
    if (!notebooks) {
      return;
    }
    app.commands.addCommand(`${NAME}:count-cells`, {
      label: 'Count Cells',
      isEnabled: () => notebooks.currentWidget !== null,
      execute: () => {
        const panel = notebooks.currentWidget;
        const model = panel.content.model;
        const cells = [];
        for (let i = 0; i < model.cells.length; i++) {
          const cell = model.cells.get(i);
          cells.push({ type: cell.type, source: cell.sharedModel.getSource() });
        }
        console.log(panel.context.path, cells.length, 'cells');
        return cells.length;
      }
    });
    notebooks.currentChanged.connect((sender, panel) => {
      // `panel` is the new active notebook, or null.
    });
    notebooks.widgetAdded.connect((sender, panel) => {
      // A notebook opened.
    });
  }
};
```

- `panel.content` is the `Notebook` widget: `activeCell`, `activeCellIndex`,
  `model`, `mode`.
- `panel.context`: `path`, `save()`, `ready` (promise).
- `panel.sessionContext.session.kernel`: the kernel connection.
- Insert a cell: `NotebookActions.insertBelow(panel.content)`, then
  `panel.content.activeCell.model.sharedModel.setSource('print(1)')`.
- Insert several cells at an index, with content, in one step:

  ```js
  const notebook = panel.content;
  const index = notebook.activeCellIndex + 1;
  notebook.model.sharedModel.insertCells(index, [
    { cell_type: 'markdown', source: '## New section' },
    { cell_type: 'code', source: '' }
  ]);
  notebook.activeCellIndex = index;
  ```

- React to edits: `panel.content.model.contentChanged.connect(callback)`
  fires for each change in the notebook; `model.cells.changed` fires when
  cells are added, moved or removed. Debounce the callback when it is not
  cheap (a word count).
- Other trackers work the same way: `IEditorTracker` (`@jupyterlab/fileeditor`),
  `IConsoleTracker` (`@jupyterlab/console`), `ITerminalTracker`
  (`@jupyterlab/terminal`).

## Settings

`SHARED`: `@jupyterlab/settingregistry`. Needs the schema
`schemas/<NAME>/plugin.json` (create the extension with `--schema`).

```js
const { ISettingRegistry } = lab['@jupyterlab/settingregistry'];

const plugin = {
  id: `${NAME}:plugin`,
  autoStart: true,
  requires: [ISettingRegistry],
  activate: async (app, registry) => {
    const settings = await registry.load(`${NAME}:plugin`);
    const apply = () => {
      const compact = settings.composite.compact === true;
      document.body.classList.toggle('my-compact', compact);
    };
    settings.changed.connect(apply);
    apply();
  }
};
```

- `settings.composite`: defaults plus user values. `settings.user`: user
  values only. `settings.set('compact', true)` saves a user value.
- Read a setting of another plugin the same way:
  `registry.load('@jupyterlab/apputils-extension:themes')`.
- A distribution sets the default of your setting in
  `default_setting_overrides.d`, like any other setting.

## Keep a value between sessions

`SHARED`: `@jupyterlab/statedb`

The state database is a small key-value store of the application. It is
saved with the workspace. The name of the token is
`@jupyterlab/coreutils:IStateDB`, but the object comes from
`@jupyterlab/statedb`.

```js
const { IStateDB } = lab['@jupyterlab/statedb'];

const plugin = {
  id: `${NAME}:counter`,
  autoStart: true,
  requires: [IStateDB],
  activate: (app, state) => {
    const key = `${NAME}:count`;
    app.commands.addCommand(`${NAME}:count`, {
      label: 'Count',
      execute: async () => {
        // fetch returns undefined when the key does not exist.
        const value = await state.fetch(key);
        const count = (typeof value === 'number' ? value : 0) + 1;
        await state.save(key, count);
        return count;
      }
    });
  }
};
```

`state.remove(key)` deletes a value. Values are JSON. For a value that the
user must see and edit, use a setting instead.

## Startup actions

```js
activate: app => {
  void app.restored.then(async () => {
    if (!app.shell.currentWidget) {
      await app.commands.execute('docmanager:open', { path: 'README.md' });
    }
  });
}
```

`app.restored` resolves when the saved layout is back. Use it for anything
that opens widgets, else the restore closes or duplicates them. To open a
document from code, `docmanager:open` takes `path` and `factory`
(`'Notebook'`, `'Editor'`, `'Markdown Preview'`).

## Server requests and files

`SHARED`: `@jupyterlab/services`, `@jupyterlab/coreutils`

```js
const { ServerConnection } = lab['@jupyterlab/services'];
const { URLExt } = lab['@jupyterlab/coreutils'];

async function getStatus() {
  const settings = ServerConnection.makeSettings();
  const url = URLExt.join(settings.baseUrl, 'api/status');
  const response = await ServerConnection.makeRequest(url, {}, settings);
  if (!response.ok) {
    throw new ServerConnection.ResponseError(response);
  }
  return response.json();
}
```

`makeRequest` adds the token and the XSRF header. Files go through the
contents manager:

```js
const contents = app.serviceManager.contents;

const listing = await contents.get('', { content: true });        // root folder
const names = listing.content.map(item => item.name);

await contents.save('notes/todo.md', {
  type: 'file',
  format: 'text',
  content: '# Todo\n'
});

contents.fileChanged.connect((sender, change) => {
  // change.type: 'new' | 'delete' | 'rename' | 'save'
});
```

## Run code in a kernel

```js
async function runCode(app, code) {
  await app.serviceManager.ready;
  const kernel = await app.serviceManager.kernels.startNew({ name: 'python3' });
  try {
    const future = kernel.requestExecute({ code });
    let output = '';
    future.onIOPub = message => {
      if (message.header.msg_type === 'stream') {
        output += message.content.text;
      }
    };
    await future.done;
    return output;
  } finally {
    await kernel.shutdown();
  }
}
```

For the kernel of an open notebook, use
`panel.sessionContext.session.kernel.requestExecute(...)`.

## Render Markdown

Render a Markdown string as JupyterLab does in a Markdown cell (headings,
code, LaTeX, links). The plugin requires `IRenderMimeRegistry`.

`SHARED`: `@jupyterlab/rendermime`

```js
const { IRenderMimeRegistry, MimeModel, RenderMimeRegistry } = lab['@jupyterlab/rendermime'];

async function renderMarkdown(rendermime, contents, path, source) {
  // The resolver makes relative links and images point to the folder of `path`.
  const registry = rendermime.clone({
    resolver: new RenderMimeRegistry.UrlResolver({ path, contents })
  });
  const widget = registry.createRenderer('text/markdown');
  await widget.renderModel(new MimeModel({ data: { 'text/markdown': source } }));
  return widget;
}
```

`rendermime` is the service of `IRenderMimeRegistry`, `contents` is
`app.serviceManager.contents`. The result is a Lumino widget: add it to a
panel or to the shell. Read the source of a file with
`(await contents.get(path, { content: true })).content`.

## Dialogs and notifications

`SHARED`: `@jupyterlab/apputils`

```js
const { Dialog, showDialog, showErrorMessage, InputDialog, Notification } =
  lab['@jupyterlab/apputils'];

const result = await showDialog({
  title: 'Delete the outputs?',
  body: 'This clears the outputs of all cells.',
  buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Delete' })]
});
if (result.button.accept) {
  // …
}

const name = await InputDialog.getText({ title: 'Name of the page' });
if (name.button.accept && name.value) {
  // …
}

Notification.info('Saved', { autoClose: 3000 });
Notification.error('Cannot reach the server', {
  actions: [{ label: 'Retry', callback: () => void retry() }]
});
await showErrorMessage('Export failed', error);
```

Other notification types: `success`, `warning`, `promise`.

## Menus from code

Prefer the schema (`jupyter.lab.menus`). From code:

`SHARED`: `@jupyterlab/mainmenu`, `@lumino/widgets`

```js
const { IMainMenu } = lab['@jupyterlab/mainmenu'];
const { Menu } = lab['@lumino/widgets'];

const plugin = {
  id: `${NAME}:menu`,
  autoStart: true,
  optional: [IMainMenu],
  activate: (app, mainMenu) => {
    if (!mainMenu) {
      return;
    }
    mainMenu.fileMenu.addGroup([{ command: `${NAME}:open-panel` }], 0);

    const menu = new Menu({ commands: app.commands });
    menu.title.label = 'Studio';
    menu.addItem({ command: `${NAME}:open-panel` });
    menu.addItem({ type: 'separator' });
    menu.addItem({ command: 'notebook:create-new' });
    mainMenu.addMenu(menu, true, { rank: 50 });

    app.contextMenu.addItem({
      command: `${NAME}:open-panel`,
      selector: '.jp-Notebook',
      rank: 0
    });
  }
};
```

Built-in menus on `mainMenu`: `fileMenu`, `editMenu`, `viewMenu`, `runMenu`,
`kernelMenu`, `tabsMenu`, `settingsMenu`, `helpMenu`.

## File types

```js
activate: app => {
  app.docRegistry.addFileType({
    name: 'recipe',
    displayName: 'Recipe',
    extensions: ['.recipe'],
    mimeTypes: ['text/markdown'],
    fileFormat: 'text',
    contentType: 'file',
    icon: myIcon
  });
}
```

The file browser shows the icon and the name. The file opens in the text
editor, which accepts all text files. A viewer of its own needs a widget
factory (`app.docRegistry.addWidgetFactory`): write that one in TypeScript.
`setDefaultWidgetFactory(type, factory)` works only for a factory that
already lists the file type.

## Stylesheets and assets

The template loads the files of `STYLESHEETS` from `static/`. Build other
URLs like this:

`SHARED`: `@jupyterlab/coreutils`

```js
const { PageConfig, URLExt } = lab['@jupyterlab/coreutils'];

const staticUrl = URLExt.join(
  PageConfig.getOption('fullLabextensionsUrl'),
  NAME,
  'static'
);
const logoUrl = `${staticUrl}/logo.svg`;
```

In CSS, a relative `url(logo.svg)` resolves next to the stylesheet. Fonts
work the same way: put `.woff2` files in `static/fonts/` and write
`@font-face { src: url(fonts/Name.woff2) format('woff2'); }`. Do not load
fonts or scripts from a CDN: JupyterLab often runs without internet access.

Use the CSS variables of the theme (`var(--jp-layout-color1)`,
`var(--jp-ui-font-color1)`, `var(--jp-brand-color1)`) so that your widgets
follow the light and dark themes. See the skill `jupyterlab-theming`.

## React to the application state

`SHARED`: `@jupyterlab/application`, `@jupyterlab/apputils`

```js
const { ILabShell } = lab['@jupyterlab/application'];
const { IThemeManager } = lab['@jupyterlab/apputils'];

const plugin = {
  id: `${NAME}:state`,
  autoStart: true,
  optional: [ILabShell, IThemeManager],
  activate: (app, labShell, themes) => {
    if (labShell) {
      labShell.currentChanged.connect((sender, change) => {
        // change.newValue is the active main-area widget, or null.
      });
      labShell.layoutModified.connect(() => {
        const empty = labShell.isEmpty('main');
      });
    }
    if (themes) {
      themes.themeChanged.connect(() => {
        const dark = !themes.isLight(themes.theme);
      });
    }
  }
};
```

`ILabShell` adds to `app.shell`: `mode` (`'single-document'` or
`'multiple-document'`, can be set), `collapseLeft()`, `expandLeft()`,
`collapseRight()`, `expandRight()`, `leftCollapsed`, `rightCollapsed`,
`isEmpty(area)`, `currentChanged`, `layoutModified`.

A focus mode is a command that saves this state, then collapses both sides:

```js
let saved = null;
app.commands.addCommand(`${NAME}:toggle-focus`, {
  label: 'Toggle Focus Mode',
  isToggled: () => saved !== null,
  execute: () => {
    if (saved === null) {
      saved = { left: !labShell.leftCollapsed, right: !labShell.rightCollapsed };
      labShell.collapseLeft();
      labShell.collapseRight();
      document.body.classList.add('my-focus');
    } else {
      if (saved.left) {
        labShell.expandLeft();
      }
      if (saved.right) {
        labShell.expandRight();
      }
      document.body.classList.remove('my-focus');
      saved = null;
    }
  }
});
```
