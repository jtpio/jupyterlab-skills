---
name: jupyterlab-settings
description: Change JupyterLab with configuration files, no code. Use it to disable, enable or lock a plugin or a whole extension (status bar, extension manager, debugger, announcements, launcher, table of contents…), to change the default of any setting (theme, autosave, line numbers, file browser, terminal, notebook, completer), to move panels between the left, right, main and bottom areas, to edit the main menu, context menu, toolbars and keyboard shortcuts, to rename the application, and to set server options that affect the UI. Covers page config, default setting overrides, user settings and server config, their precedence, and a script that writes them with validation. Use it for requests such as "disable this extension", "hide this part of the UI", "make this the default", "remove this menu", "change this shortcut".
compatibility: JupyterLab 4.x (tested with 4.6). The script must run with the Python of the environment that has JupyterLab.
---

# Configure JupyterLab with files

JupyterLab reads four kinds of configuration. All are plain JSON files in a
Jupyter config folder. None needs a build.

| Surface | File (below a config folder) | Controls | Read |
| --- | --- | --- | --- |
| **Page config** | `labconfig/page_config.d/*.json` | Which plugins load (`disabledExtensions`), `appName`, other page options | Page load |
| **Default overrides** | `labconfig/default_setting_overrides.d/*.json` | The default value of any setting of any plugin | Server start |
| **User settings** | `<user settings dir>/<package>/<plugin>.jupyterlab-settings` | The value for one user. Highest priority | Live |
| **Server config** | `jupyter_server_config.json`, `jupyter_server_config.d/*.json` | Server and `LabApp` options, server extensions | Server start |

Precedence for one setting, highest first: **user settings → default overrides
→ default in the schema of the plugin**. Page config is not a layer of
settings: a disabled plugin does not load, and its settings have no effect.

Config folders and their order come from `jupyter --paths`. The details are in
[references/config-files.md](references/config-files.md).

## Write with the script

`scripts/jlab_config.py` writes the two `labconfig` snippets. It checks plugin
IDs against the installation, setting keys and value types against the
schema, and it only touches its own files (default name `50-custom.json`).

```bash
<env>/bin/python scripts/jlab_config.py [--scope env|user] [--config-dir DIR] [--name NAME] <command>
```

More options before the command: `--remix PROJECT` (below), `--graph DUMP`
(find the dependents of a disabled plugin from a probe dump, extensions
included), `--no-cascade`, `--no-validate`. `--help` lists all.

| Command | Effect |
| --- | --- |
| `disable <id>...` | Add plugins or whole packages to `disabledExtensions`. `--lock` also locks them in the Plugin Manager |
| `enable <id>...` | Undo. `--force` writes `false`, to re-enable what another file disables |
| `set <plugin> <key> <json>` | Set the default of a setting. `--append` adds to a list, `--merge` merges into an object |
| `unset <plugin> [key]` | Remove an override |
| `page <key> [json]` | Set or remove a page config key, for example `appName` |
| `user-set <plugin> <key> <json>` | Write a user setting |
| `apply <file.json>` | Apply many changes: `{"disable": [], "lock": [], "page": {}, "overrides": {}}` |
| `show` | Print the snippets |

Scope: `--scope env` writes to `<sys.prefix>/etc/jupyter`, `--scope user` to
the user config folder. Without the option, the script uses `env` inside a
virtual environment. `--config-dir` gives an explicit folder: use it with the
`jupyter-config` folder of a distribution project. `--remix <project>` is for
a remix (skill `jupyterlab-remix`): `set`, `unset` and `apply` then write the
file `settings/overrides.json` of the project, and the checks use the schemas
of its build. A remix has no page config.

Examples:

```bash
<env>/bin/python scripts/jlab_config.py disable @jupyterlab/extensionmanager-extension @jupyterlab/apputils-extension:announcements
```

```bash
<env>/bin/python scripts/jlab_config.py set @jupyterlab/apputils-extension:themes theme '"JupyterLab Dark"'
```

```bash
<env>/bin/python scripts/jlab_config.py set @jupyterlab/notebook-extension:tracker codeCellConfig '{"lineNumbers": true}'
```

Values are JSON. Quote them for the shell. A bare word is taken as a string.

You can also write the files by hand: the formats are below. Then check them
with `jlab_inspect.py page-config` and `jlab_inspect.py overrides`.

## Disable or hide a feature

```json
{
  "disabledExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/apputils-extension:announcements": true
  }
}
```

A key is a plugin ID, a package name (all its plugins), or a regular
expression on either
([matching rules](https://jupyterlab.readthedocs.io/en/stable/user/directories.html#labconfig-directories)).
`true` disables. `false` re-enables what a file of lower priority disables.

Before you disable a plugin:

1. **Prefer a setting when one exists.** It is not always better: the news
   prompt at the first start goes away with the setting `fetchNews` set to
   `"false"`, or with the plugin
   `@jupyterlab/apputils-extension:announcements` disabled. Both are fine;
   the cookbook has both. Examples of settings:
   `@jupyterlab/statusbar-extension:plugin` → `visible: false`,
   `@jupyterlab/extensionmanager-extension:plugin` → `enabled: false`,
   `@jupyterlab/cell-toolbar-extension:plugin` → `showToolbar: false`.
2. **Mind the dependents.** A plugin that provides a service token breaks
   the plugins that require it: they log activation errors in the browser
   console. `jlab_config.py disable` knows the core plugins and adds their
   dependents to the snippet (it prints them; `--no-cascade` turns this
   off). For plugins of other extensions, ask the running application:
   `jlab_probe.cjs --dependents <id>` (skill `jupyterlab-verify`).
3. **Keep the foundations.** Do not disable a plugin that many plugins need
   (`:paths`, `:router`, `:shell`, `:settings`, `:state`, `:translator`,
   `:resolver`…). `jlab_probe.cjs --list plugins --grep <text>` prints, for
   each plugin, the service that it provides and the plugins that need it.

Hide one sidebar tab without disabling its plugin: there is no general
setting. Disable the plugin that adds the panel
(`@jupyterlab/running-extension:sidebar`, `@jupyterlab/toc-extension:tracker`,
`@jupyterlab/extensionmanager-extension`, `@jupyterlab/debugger-extension`,
`@jupyterlab/application-extension:property-inspector`), or hide the tab with
CSS (skill `jupyterlab-theming`). The cookbook has the full table.

`lockedExtensions` has the same format. A locked plugin cannot be toggled by
the user in the Plugin Manager or with `jupyter labextension enable`
([docs](https://jupyterlab.readthedocs.io/en/stable/user/extensions.html#locking-plugins)).

The official CLI does the same for one plugin and writes
`labconfig/page_config.json`:

```bash
jupyter labextension disable @jupyterlab/extensionmanager-extension --level=sys_prefix
```

## Change a default

```json
{
  "@jupyterlab/apputils-extension:themes": { "theme": "JupyterLab Dark" },
  "@jupyterlab/docmanager-extension:plugin": { "autosaveInterval": 30 },
  "@jupyterlab/notebook-extension:tracker": {
    "codeCellConfig": { "lineNumbers": true }
  }
}
```

Top-level keys are plugin IDs. Inner keys are the settings of the schema.

- An **object** value merges into the default of the schema: give only the
  keys that change (`codeCellConfig.lineNumbers`).
- A **list or scalar** value replaces the default.
- A wrong plugin ID or key is ignored without an error. Find them with
  `jlab_inspect.py find <text>` and `jlab_inspect.py schema <plugin>`.

## Layout: move panels and bars

Plugin `@jupyterlab/application-extension:shell`.

```json
{
  "@jupyterlab/application-extension:shell": {
    "activityBarPosition": "top",
    "startMode": "single",
    "dockPanelPadding": false,
    "layout": {
      "multiple": {
        "File Browser": { "area": "right" },
        "Table of Contents": { "area": "right", "options": { "rank": 10 } },
        "Terminal": { "area": "down" }
      },
      "single": {
        "File Browser": { "area": "right" }
      }
    }
  }
}
```

- `layout` has one object for the default mode (`multiple`) and one for the
  simple mode (`single`). Set both when the change must hold in both modes.
- A key is a **widget type** (`File Browser`, `Terminal`, `Notebook`) or,
  for a widget with no type, its **widget ID** (`jp-git-sessions`). Areas:
  `left`, `right`, `main`, `down`. `options.rank` orders the tabs of a side
  area.
- Use the type when the widget has one. An ID key for such a widget works at
  start, but the menu item "Switch Sidebar Side" then moves nothing until a
  reload: JupyterLab writes the new side under the type, and the ID key wins.
- `activityBarPosition`: `side`, `top` or `bottom`. `startMode`: `""`,
  `single` or `multiple`.
- Types and IDs: `jlab_probe.cjs --list widgets` (skill `jupyterlab-verify`)
  prints the area, the ID, the type and the label of each widget of the
  running application, extensions included.
- With no widget in the right area, JupyterLab leaves that area open and
  empty. Close it from an extension when the application starts:
  `if (shell.isEmpty('right')) shell.collapseRight()`.
- JupyterLab 4.6 makes the down area smaller each time it is hidden and
  shown again. An application that hides it with a key needs the correction
  in "Down area" of `jupyterlab-extensions/references/patterns.md`.
- The meaning of each key:
  [Layout](https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html#layout-customization)
  in the JupyterLab documentation.

A layout that the user changed by hand is stored in the workspace and wins
over these defaults for that workspace.

## Menus, context menu, toolbars, shortcuts

These four settings are **lists that merge** with the built-in items. Give
only your changes. To remove a built-in item, repeat its identity with
`"disabled": true`.

| What | Plugin | Key | Identity of an item |
| --- | --- | --- | --- |
| Main menu | `@jupyterlab/mainmenu-extension:plugin` | `menus` | menu `id`; inside a menu: `command` + `args` |
| Context menu | `@jupyterlab/application-extension:context-menu` | `contextMenu` | `command` + `selector` + `args` |
| Notebook toolbar | `@jupyterlab/notebook-extension:panel` | `toolbar` | `name` |
| Other toolbars | last column of `jlab_inspect.py toolbars` | `toolbar` | `name` |
| Shortcuts | `@jupyterlab/shortcuts-extension:shortcuts` | `shortcuts` | `keys` + `selector` (not the command) |

```json
{
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      { "id": "jp-mainmenu-run", "disabled": true },
      {
        "id": "jp-mainmenu-file",
        "items": [{ "command": "filebrowser:open-path", "disabled": true }]
      },
      {
        "id": "my-menu",
        "label": "Studio",
        "rank": 50,
        "items": [
          { "command": "notebook:create-new", "rank": 1 },
          { "type": "separator", "rank": 2 },
          { "command": "apputils:change-theme", "args": { "theme": "JupyterLab Dark" }, "rank": 3 }
        ]
      }
    ]
  },
  "@jupyterlab/notebook-extension:panel": {
    "toolbar": [
      { "name": "restart-and-run", "disabled": true },
      { "name": "clear-all", "command": "notebook:clear-all-cell-outputs", "rank": 12 }
    ]
  },
  "@jupyterlab/shortcuts-extension:shortcuts": {
    "shortcuts": [
      { "command": "application:toggle-left-area", "keys": ["Accel B"], "selector": "body", "disabled": true },
      { "command": "apputils:activate-command-palette", "keys": ["Accel K"], "selector": "body" }
    ]
  }
}
```

Read the identity of a built-in item from the installation. Do not write it
from memory: the names change between versions.

| To find | Command (skill `jupyterlab-inspect`) |
| --- | --- |
| Menu IDs, labels, ranks | `jlab_inspect.py menus` |
| Items of one menu: command, rank, args | `jlab_inspect.py menus jp-mainmenu-file` |
| Toolbar item names, and the plugin whose `toolbar` setting changes them | `jlab_inspect.py toolbars [text]` |
| Context menu items: command, selector, rank | `jlab_inspect.py context-menu [text]` |
| Default shortcuts: keys, selector, args | `jlab_inspect.py shortcuts [text]` |
| A command ID that a menu, toolbar or shortcut uses | `jlab_inspect.py find <text>` |
| The command behind a label that the user names ("Log Out") | `jlab_probe.cjs --list commands --grep "Log Out"` (skill `jupyterlab-verify`). The schemas have no labels |
| All commands of the running application, with labels | `jlab_probe.cjs --list commands --grep <text>` (skill `jupyterlab-verify`) |

- `Accel` is Cmd on macOS and Ctrl elsewhere.
- A shortcut does not work while a terminal has the focus: the terminal
  takes the key for the shell. To make some keys reach the application,
  see "Keys that work in a terminal" in
  `jupyterlab-extensions/references/patterns.md`.
- The format of each list is in the JupyterLab documentation:
  [toolbars](https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html#toolbars-customization),
  [menu bar](https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html#menu-bar-customization),
  [context menu](https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html#context-menu-customization).
- A menu item or toolbar button for a command that does not exist is not
  shown. A new command needs an extension (skill `jupyterlab-extensions`).
- The top bar (right of the menus) is the toolbar `TopBar`, setting
  `toolbar` of `@jupyterlab/application-extension:top-bar`.
- Turn the context menu off: `"disabled": true` in
  `@jupyterlab/application-extension:context-menu`.

### Keyboard shortcuts: the rules

JupyterLab identifies a shortcut by its **keys and selector**. The command
does not count. Shortcuts from an overrides file are defaults, like the
built-in ones, and these rules apply between defaults:

1. An entry with `"disabled": true` removes **every** default shortcut with
   the same keys and selector, also one that you add in the same file.
2. Two enabled shortcuts with the same keys and selector: JupyterLab keeps
   one (the command that sorts first by name) and logs a warning. The other
   one is lost without an error.

So, to give a key that is in use to another command:

```json
{
  "@jupyterlab/shortcuts-extension:shortcuts": {
    "shortcuts": [
      { "command": "apputils:print", "keys": ["Accel P"], "selector": "body", "disabled": true },
      { "command": "apputils:activate-command-palette", "keys": ["Accel P"], "selector": "html body" }
    ]
  }
}
```

The new shortcut has a selector that matches the same elements but is a
different text (`html body` for `body`, `body .jp-Notebook` for
`.jp-Notebook`). Rule 1 then does not remove it.

- Before you choose keys, look for them: `jlab_inspect.py shortcuts "Accel P"`.
  Copy `keys` and `selector` from the output exactly (`Accel`, not `Ctrl`).
- `jlab_config.py set … shortcuts …` warns about both cases.
- A free key needs one entry. To move a command to a free key: one entry
  that disables the old keys, one entry with the new keys.

## Application name and other page options

`appName` in page config sets the title of the browser tab and the name in
dialogs:

```json
{ "appName": "My Lab" }
```

Other options a snippet can set: `quitButton`, `terminalsAvailable`,
`notebookStartsKernel`. See
[references/config-files.md](references/config-files.md).

## Server options

Server and `LabApp` options go in the single file `jupyter_server_config.json`
(or `.py`) of a config folder:

```json
{
  "ServerApp": { "quit_button": false },
  "LabApp": { "custom_css": true }
}
```

The drop-in folder `jupyter_server_config.d/` is merged only for
`ServerApp.jpserver_extensions` (which server extensions are on). General
options in a `.d` file have no effect. A distribution should pass such options
from its launch command (skill `jupyterlab-distribution`).

## User settings

Use them when the change is for one person and must win over every default.
The file path splits the plugin ID at the colon:

```
<user settings dir>/@jupyterlab/apputils-extension/themes.jupyterlab-settings
```

```bash
<env>/bin/python scripts/jlab_config.py user-set @jupyterlab/apputils-extension:themes theme '"JupyterLab Dark"'
```

The file is JSON5 (comments allowed). A running application picks a change up
without a restart. Do not use user settings to ship defaults: they belong to
the user.

## Cookbook

[references/recipes.md](references/recipes.md) has the exact snippet for
common requests: quiet startup, minimal UI, single-document mode, kiosk-like
lock-down, editor and notebook defaults, file browser, terminal, menus and
toolbars.

## After each change

1. `jlab_inspect.py page-config` and `overrides`: the change is in the merged
   result, no file is invalid, no ID is flagged.
2. Restart the server. It reads default overrides and server config only
   when it starts. Page config applies at the next page load.
3. Probe in a browser with a clean profile (skill `jupyterlab-verify`):
   `--expect-no-plugin`, `--expect-setting`, `--fail-on-console-error`.
4. Tell the user which files changed and how to undo: delete the snippet, or
   run `jlab_config.py enable` / `unset`.
