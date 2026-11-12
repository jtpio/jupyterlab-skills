# Replace core parts of JupyterLab

To replace a core plugin:

1. Disable it from the `package.json` of your extension
   (`jupyterlab.disabledExtensions`, a list). `jlab_ext.py new --disable <id>`
   writes it. The core plugin comes back when your extension is removed.
2. Provide what the rest of the application expects from it: the **service
   token** (when other plugins use it) and the **command IDs** (when menus,
   buttons or shortcuts call them).

All code below was run on JupyterLab 4.6 in a no-build extension.

| Part | Core plugin to disable | Token to provide | Commands to keep |
| --- | --- | --- | --- |
| Launcher (home page) | `@jupyterlab/launcher-extension:plugin` | `ILauncher` | `launcher:create` |
| Splash screen | `@jupyterlab/apputils-extension:splash` | `ISplashScreen` | |
| Logo, top left | `@jupyterlab/application-extension:logo` | | |
| About dialog | `@jupyterlab/help-extension:about` | | `help:about`, and its Help menu item |
| Favicon | (none) | | |
| Tab title | (none: page config `appName`) | | |
| Command palette | `@jupyterlab/apputils-extension:palette` | `ICommandPalette` | `apputils:activate-command-palette` |
| Status bar | `@jupyterlab/statusbar-extension:plugin` | `IStatusBar` | |
| Main menu | `@jupyterlab/mainmenu-extension:plugin` | `IMainMenu` | |

For the last three rows, a setting or CSS is almost always the better way.
Replace them only when the application must work in a different way.

## Home page in place of the launcher

`package.json`: `"disabledExtensions": ["@jupyterlab/launcher-extension:plugin"]`

`SHARED`: `@jupyterlab/application`, `@jupyterlab/apputils`,
`@jupyterlab/launcher`, `react`

```js
const { ILabShell } = lab['@jupyterlab/application'];
const { MainAreaWidget, ReactWidget } = lab['@jupyterlab/apputils'];
const { ILauncher } = lab['@jupyterlab/launcher'];
const React = lab['react'];
const h = React.createElement;

function Home(props) {
  const { app, items } = props;
  const [files, setFiles] = React.useState([]);
  React.useEffect(() => {
    let active = true;
    app.serviceManager.contents.get('', { content: true }).then(listing => {
      if (active) {
        const notebooks = listing.content
          .filter(item => item.type === 'notebook')
          .sort((a, b) => (a.last_modified < b.last_modified ? 1 : -1))
          .slice(0, 8);
        setFiles(notebooks);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const action = (label, command, args) =>
    h(
      'button',
      {
        className: 'my-home-action',
        key: command + JSON.stringify(args || {}),
        onClick: () => app.commands.execute(command, args)
      },
      label
    );

  return h(
    'div',
    { className: 'my-home' },
    h('h1', null, 'Welcome'),
    h(
      'div',
      { className: 'my-home-actions' },
      action('New notebook', 'notebook:create-new', { kernelName: 'python3' }),
      action('New text file', 'fileeditor:create-new'),
      // Cards that other plugins registered with ILauncher.add().
      items
        .filter(item => app.commands.hasCommand(item.command))
        .map(item =>
          action(app.commands.label(item.command, item.args), item.command, item.args)
        )
    ),
    h('h2', null, 'Recent notebooks'),
    h(
      'ul',
      { className: 'my-home-files' },
      files.map(file =>
        h(
          'li',
          {
            key: file.path,
            onClick: () => app.commands.execute('docmanager:open', { path: file.path })
          },
          file.name
        )
      )
    )
  );
}

const home = {
  id: `${NAME}:home`,
  description: 'A home page in place of the launcher.',
  autoStart: true,
  provides: ILauncher,
  optional: [ILabShell],
  activate: (app, labShell) => {
    const items = [];
    let counter = 0;

    app.commands.addCommand('launcher:create', {
      label: 'Home',
      execute: args => {
        const content = ReactWidget.create(h(Home, { app, items }));
        content.addClass('my-home-widget');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-home-${counter++}`;
        widget.title.label = 'Home';
        widget.title.closable = true;
        app.shell.add(widget, 'main', { activate: args['activate'], ref: args['ref'] });
        return widget;
      }
    });

    if (labShell) {
      // Show the home page when the main area is empty.
      void app.restored.then(() => {
        const maybeCreate = () => {
          if (labShell.isEmpty('main')) {
            void app.commands.execute('launcher:create');
          }
        };
        labShell.layoutModified.connect(maybeCreate);
        maybeCreate();
      });
      // The "+" button of the tab bars.
      labShell.addButtonEnabled = true;
      labShell.addRequested.connect((sender, tabBar) => {
        const title = tabBar.currentTitle || tabBar.titles[tabBar.titles.length - 1];
        return app.commands.execute('launcher:create', { ref: title && title.owner.id });
      });
    }

    // The ILauncher service: other plugins call add() for their cards.
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
```

Notes:

- `launcher:create` keeps the "+" button of the file browser, File → New
  Launcher and the shortcut working. Change the label to rename the menu
  entry.
- Cards arrive while the other plugins activate. The home page renders when
  it opens, after startup, so the list is complete by then.
- An item of `ILauncher.add` has `command`, `args`, `category`, `rank`,
  `kernelIconUrl`, `metadata`. The stock notebook and console plugins add one
  item per kernel.
- Style the page with a stylesheet of the extension (`.my-home …`). Use theme
  variables so that it follows light and dark themes.

To only remove the launcher, without a replacement, the main area stays empty
when all tabs close. That is a valid choice for a single-document
application.

## Splash screen

`package.json`: `"disabledExtensions": ["@jupyterlab/apputils-extension:splash"]`

`SHARED`: `@jupyterlab/apputils`

```js
const { ISplashScreen } = lab['@jupyterlab/apputils'];

const splash = {
  id: `${NAME}:splash`,
  description: 'A custom splash screen.',
  autoStart: true,
  provides: ISplashScreen,
  activate: () => ({
    show: () => {
      const node = document.createElement('div');
      node.id = 'my-splash';
      node.innerHTML = '<div class="my-splash-name">My Lab</div>';
      document.body.appendChild(node);
      return {
        isDisposed: false,
        dispose: () => node.remove()
      };
    }
  })
};
```

```css
#my-splash {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: var(--jp-layout-color0, #fff);
}
```

JupyterLab calls `show()` at startup and disposes the result when the layout
is restored. The stylesheet of the extension may load after the splash
shows: give the node inline styles for the first frame if that matters. To
have no splash screen at all, only disable the core plugin.

## Logo

`package.json`: `"disabledExtensions": ["@jupyterlab/application-extension:logo"]`

`SHARED`: `@jupyterlab/ui-components`, `@lumino/widgets`

```js
const { LabIcon } = lab['@jupyterlab/ui-components'];
const { Widget } = lab['@lumino/widgets'];

const logoIcon = new LabIcon({
  name: `${NAME}:logo`,
  svgstr:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle fill="#b4532a" cx="12" cy="12" r="9"/></svg>'
});

const logo = {
  id: `${NAME}:logo`,
  autoStart: true,
  activate: app => {
    const widget = new Widget();
    widget.id = 'jp-MainLogo';
    logoIcon.element({
      container: widget.node,
      elementPosition: 'center',
      margin: '2px 2px 2px 8px',
      height: 'auto',
      width: '16px'
    });
    app.shell.add(widget, 'top', { rank: 0 });
  }
};
```

The ID `jp-MainLogo` keeps the stock spacing. For a text brand, set
`widget.node.textContent` and style it. To only remove the logo, disable the
core plugin in page config.

## About dialog

`package.json`: `"disabledExtensions": ["@jupyterlab/help-extension:about"]`

`SHARED`: `@jupyterlab/apputils`

```js
const { Dialog, showDialog } = lab['@jupyterlab/apputils'];

const about = {
  id: `${NAME}:about`,
  autoStart: true,
  activate: app => {
    app.commands.addCommand('help:about', {
      label: 'About My Lab',
      execute: () =>
        showDialog({
          title: 'My Lab',
          body: `Version 1.0, built on JupyterLab ${app.version}.`,
          buttons: [Dialog.okButton()]
        })
    });
  }
};
```

The Help menu entry belongs to the schema of the disabled plugin, so it goes
away with it. Put it back in the schema of your extension
(`schemas/<name>/plugin.json`):

```json
{
  "jupyter.lab.menus": {
    "main": [
      {
        "id": "jp-mainmenu-help",
        "items": [{ "command": "help:about", "rank": 0 }]
      }
    ]
  }
}
```

The same lines work in the `menus` override of
`@jupyterlab/mainmenu-extension:plugin`. The label of the entry is the label
of the command.

General rule: a menu item, toolbar button or shortcut that a core plugin
declares in its schema is lost when the plugin is disabled, also when the
command still exists. `jlab_inspect.py --json schema <plugin id>` shows what
a plugin declares.

## Favicon

No plugin to disable. Put `favicon.svg` (or `.ico`, `.png`) in `static/`.

`SHARED`: `@jupyterlab/coreutils`

```js
const { PageConfig, URLExt } = lab['@jupyterlab/coreutils'];

const favicon = {
  id: `${NAME}:favicon`,
  autoStart: true,
  activate: () => {
    const url = URLExt.join(
      PageConfig.getOption('fullLabextensionsUrl'),
      NAME,
      'static',
      'favicon.svg'
    );
    document.querySelectorAll('link.favicon').forEach(link => {
      link.type = 'image/svg+xml';
      link.href = url;
    });
  }
};
```

JupyterLab has two links with the class `favicon`: `idle` and `busy`. It
switches between them while a kernel is busy. The code above gives both the
same image. For a different busy icon, set the `href` of `link.favicon.busy`
to a second file. To stop the switching, disable
`@jupyterlab/application-extension:faviconbusy`.

The browser shows the stock icon until the extension loads. A custom launch
command cannot change that: the icon is part of the page template.

## Tab title and application name

Page config, no code:

```json
{ "appName": "My Lab" }
```

`app.name` in an extension returns this value.

## Remove the "Jupyter" entries of the Help menu

Overrides, no code. The resources come from the plugin
`@jupyterlab/help-extension:resources`; disable it to remove the links to the
JupyterLab documentation, or disable single entries:

```json
{
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      {
        "id": "jp-mainmenu-help",
        "items": [
          { "command": "help:jupyter-forum", "disabled": true },
          { "command": "help:licenses", "disabled": true }
        ]
      }
    ]
  }
}
```
