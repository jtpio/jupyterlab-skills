---
name: jupyterlab-extensions
description: Add new behavior to JupyterLab with an extension, created on the fly and without a build step. Use it when configuration is not enough - to add a command, a toolbar or top-bar button, a menu with new actions, a sidebar or main-area panel, a status bar item, a launcher card, a custom home page, a file type, a keyboard shortcut for a new action, a settings schema, or to replace a core part such as the launcher, the splash screen, the logo or the About dialog. Gives a script that scaffolds, checks and installs a plain-JavaScript prebuilt extension into an environment or a distribution project, verified code patterns for the common extension points, and the TypeScript build path for extensions that need npm dependencies. Use it for requests such as "add this to the UI", "add a button that…", "create an extension", "replace the launcher".
compatibility: JupyterLab 4.x (tested with 4.6). Python for the script. Node.js only for the optional syntax check and for the TypeScript path.
---

# Create JupyterLab extensions on the fly

Configuration can only reshape what JupyterLab already has. New behavior
needs a **plugin**, and a plugin ships in a **prebuilt extension**: a folder
in `share/jupyter/labextensions/` with a `package.json` and one JavaScript
file. JupyterLab loads the folder at startup. It needs no rebuild of
JupyterLab.

Two ways to write the JavaScript file:

| Path | When | Cost |
| --- | --- | --- |
| **No build** (default) | The code uses only what JupyterLab shares: `@jupyterlab/*`, `@lumino/*`, `react`, `yjs` | One plain JavaScript file. No Node.js, no `node_modules` |
| **TypeScript build** | You need another npm package, JSX, types, tests, or you will publish to npm | Node.js, about 200 MB of `node_modules`, a build step. See [references/typescript.md](references/typescript.md) |

Use the no-build path unless you have one of the reasons of the second row.

## Workflow

```bash
python scripts/jlab_ext.py new my-lab-tweaks --dest ./extensions --style --schema
```

```bash
python scripts/jlab_ext.py install ./extensions/my-lab-tweaks --python <env>/bin/python --link
```

1. `new` writes the folder. Options: `--style` adds `static/style.css`,
   `--schema` adds a settings schema, `--disable <plugin-id>` names a core
   plugin that the extension replaces (can repeat).
2. Edit `static/remoteEntry.js`: the list `SHARED` and the function
   `createPlugins(lab)`. Leave the container code below the marker alone.
3. `check <folder>` finds the common mistakes (name mismatch, syntax error,
   missing files, bad schema).
4. `install <folder>` copies the folder into the labextensions folder of the
   environment (`--python`), of the user (`--user`), or into an explicit
   folder (`--labextensions-dir`). `--link` makes a symlink: edits are live.
5. After each change in `static/`, run `stamp <folder>`, then reload the
   page. JupyterLab tells the browser to keep the files of `static/` for one
   year. The stamp is a hash of these files in the URL of the entry file
   (`"load": "static/remoteEntry.js?v=1a2b3c4d"` in `package.json`), and the
   template adds it to the stylesheets. Without a new stamp, a browser that
   has the old files keeps them, also after an upgrade of the package.
   `new` and `install` write the stamp, and `check` reports an old one. The
   probe starts a new browser each time, so it always gets the new files.
   JupyterLab reads `package.json` and the schemas at each page load. If the
   extension does not show, restart the server.
6. Verify with the probe of `jupyterlab-verify`:
   `--expect-plugin my-lab-tweaks:plugin --fail-on-console-error`. A sidebar
   panel is hidden until its tab is active: add `--activate <widget id>`
   before a check or a screenshot of it.

For a distribution project, create the extension directly in its
`labextensions/` folder (`--dest <project>/labextensions`), or add plugins to
the core extension that the project already has. Run the project without an
install: `jlab_server.py start --project <project>` (skill
`jupyterlab-verify`). `uninstall <name>` removes what `install` put in place.

`add-schema <folder>` adds the settings schema to an extension that was
created without `--schema`.

## The file you edit

```js
const NAME = 'my-lab-tweaks';

const SHARED = ['@jupyterlab/apputils', '@lumino/widgets'];

const STYLESHEETS = ['style.css'];

function createPlugins(lab) {
  const { ICommandPalette, Notification } = lab['@jupyterlab/apputils'];
  const { Widget } = lab['@lumino/widgets'];

  const plugin = {
    id: `${NAME}:plugin`,
    description: 'What the plugin does.',
    autoStart: true,
    requires: [],
    optional: [ICommandPalette],
    activate: (app, palette) => {
      app.commands.addCommand(`${NAME}:hello`, {
        label: 'Say Hello',
        execute: () => Notification.info('Hello')
      });
      if (palette) {
        palette.addItem({ command: `${NAME}:hello`, category: 'Tweaks' });
      }
    }
  };

  return [plugin];
}
```

- `NAME` must equal `name` in `package.json`. It is also the prefix of plugin
  IDs and command IDs.
- `SHARED` lists the packages to take from JupyterLab. `lab['<package>']` is
  the module. A package that is not in `SHARED` is not in `lab`.
- `createPlugins` returns one plugin or a list. One extension can hold many
  plugins: one per concern is easier to disable later.

### Rules of the no-build path

1. **Plain script.** No `import`, no `export`, no JSX, no TypeScript. With
   React, call `React.createElement`.
2. **Tokens come from `lab`.** A token is the identity of a service
   (`ICommandPalette`). Take it from the shared package, as above.
3. **Only shared packages.** All `@jupyterlab/*` and `@lumino/*` packages,
   `react`, `react-dom`, `yjs`, `@codemirror/state`, `@codemirror/view`,
   `@codemirror/language`, `@jupyter/ydoc`, `@jupyter/web-components`,
   `@jupyter/react-components`. For anything else, use the TypeScript path or
   copy a small library as a second script in `static/` and load it with a
   `<script>` tag from `activate`.
4. **Assets by URL.** Files in `static/` are served at
   `<fullLabextensionsUrl>/<NAME>/static/<file>`. The template loads the
   `STYLESHEETS` this way. Build other URLs with `PageConfig` and `URLExt`
   (see the patterns).

## A plugin

```js
{
  id: 'my-ext:plugin',        // unique, '<package>:<name>'
  description: '…',           // shown in the Plugin Manager
  autoStart: true,            // activate at startup
  requires: [TokenA],         // must exist, else the plugin fails to activate
  optional: [TokenB],         // null when no plugin provides it
  provides: TokenC,           // the plugin is the provider of this service
  activate: (app, a, b) => {  // requires first, then optional, in order
    return service;           // the value for `provides`
  }
}
```

Prefer `optional` over `requires` for every service the plugin can work
without: the user or a distribution can then disable that service.

The concepts (plugins, tokens, services) are in the JupyterLab documentation:
https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html#plugins

The `app` object (`JupyterFrontEnd`):

| Member | Use |
| --- | --- |
| `app.commands` | `addCommand`, `execute`, `hasCommand`, `addKeyBinding` |
| `app.shell` | `add(widget, area, {rank})`, `activateById(id)`, `currentWidget`, `widgets(area)` |
| `app.docRegistry` | File types, widget factories, widget extensions (toolbar buttons per document) |
| `app.serviceManager` | `contents`, `kernels`, `sessions`, `terminals`, `settings`, `kernelspecs` |
| `app.restored` | Promise: the layout is restored. Run startup actions after it |
| `app.contextMenu` | `addItem({command, selector, rank})` |

Shell areas: `top` (the bar with the menus), `left`, `right`, `main`, `down`,
`bottom` (below the main area), `header`, `menu`.

Each extension point, with TypeScript examples:
https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html

## Declare menus, toolbars and shortcuts in a schema

With `--schema`, the extension has `schemas/<name>/plugin.json`. It declares
settings, and it adds UI items without code:

```json
{
  "title": "My Lab Tweaks",
  "type": "object",
  "properties": {
    "greeting": { "type": "string", "title": "Greeting", "default": "Hello" }
  },
  "additionalProperties": false,
  "jupyter.lab.menus": {
    "main": [
      {
        "id": "jp-mainmenu-tweaks",
        "label": "Tweaks",
        "rank": 90,
        "items": [{ "command": "my-lab-tweaks:hello" }]
      }
    ],
    "context": [
      { "command": "my-lab-tweaks:hello", "selector": ".jp-DirListing-content", "rank": 1 }
    ]
  },
  "jupyter.lab.toolbars": {
    "Notebook": [{ "name": "tweaks-hello", "command": "my-lab-tweaks:hello", "rank": 5 }],
    "TopBar": [{ "name": "tweaks-top", "command": "my-lab-tweaks:hello", "rank": 10 }]
  },
  "jupyter.lab.shortcuts": [
    { "command": "my-lab-tweaks:hello", "keys": ["Accel Shift H"], "selector": "body" }
  ]
}
```

- The schema file `plugin.json` belongs to the plugin `<name>:plugin`: keep
  one plugin with that ID in the extension.
- To read the settings, require `ISettingRegistry` and call
  `registry.load('<name>:plugin')` (pattern in the reference).
- To add to an existing menu, use its ID (`jp-mainmenu-file`). The skill
  `jupyterlab-inspect` lists them: `jlab_inspect.py menus` for the menu IDs,
  `jlab_inspect.py toolbars` for the toolbar names.
- A toolbar button shows the `icon` of the command. Without an icon it shows
  the `label`.
- The schema keys are in the documentation:
  [menus](https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#mainmenu),
  [toolbars](https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#toolbar-registry),
  and "Keyboard Shortcuts" on the same page.

## Replace a core plugin

An extension can turn core plugins off in its `package.json`. JupyterLab
applies the list when the extension is installed and enabled:

```json
{
  "jupyterlab": {
    "extension": true,
    "disabledExtensions": ["@jupyterlab/launcher-extension:plugin"],
    "_build": { "load": "static/remoteEntry.js?v=1a2b3c4d", "extension": "./extension" }
  }
}
```

`jlab_ext.py new --disable <id>` writes this. Then provide the replacement:

- If other plugins use the service of the core plugin, your plugin must
  `provides` the same token (`ILauncher`, `ISplashScreen`).
- If menus or buttons call a command of the core plugin, register a command
  with the same ID (`launcher:create`, `help:about`).

[references/replace-core.md](references/replace-core.md) has working code for
the launcher (home page), the splash screen, the logo, the About dialog, the
favicon and the tab title.

## Patterns

[references/patterns.md](references/patterns.md): tested code for

- commands, palette, shortcuts
- widgets in the top bar, sidebars, main area, status bar
- React content
- icons
- notebook toolbar buttons and access to the active notebook and its cells
- launcher cards
- settings: read and react
- a value that stays between sessions (state database)
- panels that survive a page reload
- startup actions
- requests to the Jupyter Server, reading and writing files
- kernels: run code
- dialogs and notifications
- file types
- stylesheets and assets
- the down area: show, hide, and a correction for its size in JupyterLab 4.6

The table of shared packages and tokens is in
[references/tokens.md](references/tokens.md).

## Debug

| Symptom | Cause |
| --- | --- |
| The extension is not in `jupyter labextension list` | The folder is not in a labextensions folder of `jupyter --paths`, or `package.json` has no `jupyterlab._build` |
| Listed, but no plugin in the probe (`--expect-plugin` fails) | Error at load. The console says `Failed to create module: package: <name>`. Often a syntax error (`jlab_ext.py check`), or `NAME` differs from `package.json` |
| `No provider for: <token>` | A `requires` token has no provider: the plugin that provides it is disabled. Move the token to `optional` |
| `lab['…']` is undefined | The package is not in `SHARED` |
| A menu item or toolbar button is missing | The command ID in the schema does not match a registered command, or the plugin ID does not match the schema file name |
| Changes do not show | The browser keeps the files of `static/`: run `jlab_ext.py stamp <folder>`, then reload. Copy install: run `install` again, or use `--link`. Then restart the server |
| A file of `static/` that your code loads (image, JSON, font) stays old | Add the stamp to its URL: `url + STAMP` |
| Settings of the extension are not found | `schemas/<name>/plugin.json` or `schemas/<name>/package.json.orig` is missing |

Always finish with the probe and `--fail-on-console-error`.
