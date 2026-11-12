---
name: jupyterlab-inspect
description: Find out how a JupyterLab installation is set up before you change it. Use it to locate the config and data folders and the right place to write, to find the exact ID of a plugin, setting, command, menu, toolbar item or sidebar widget, to read the schema and default of a setting, to see which extensions are installed, and to explain why a customization does not apply (effective page config, effective overrides, user settings that hide a default). Use it before any JupyterLab customization, and when the user asks "what is the ID of…", "where does JupyterLab read…", "which extensions are installed", or "why does my setting not work".
compatibility: JupyterLab 4.x. The script must run with the Python of the environment that has JupyterLab.
---

# Inspect a JupyterLab installation

A wrong plugin ID or setting key fails silently in JupyterLab. Look up every
ID before you write it. `scripts/jlab_inspect.py` reads the installation from
disk. It needs no server and no browser.

This skill has no lists of IDs. The IDs change between versions and with the
installed extensions, so each one comes from a command that reads the
installation.

Run it with the Python of the target environment:

```bash
<env>/bin/python scripts/jlab_inspect.py <command>
```

Add `--json` before the command for machine-readable output. Add
`--project <dir>` before the command to include a distribution project that
is not installed (its `jupyter-config` and `labextensions` folders).

## Commands

| Command | Answers |
| --- | --- |
| `paths` | Which folders does JupyterLab read? Where do I write for the environment scope and the user scope? |
| `extensions` | Which prebuilt extensions are installed? Which core plugins do they disable? |
| `plugins [text]` | Which plugin IDs exist, and what does each one do? Which are disabled? Which have settings? |
| `schema <plugin-id>` | Which settings does this plugin have, with type, default, and the override in effect? |
| `find <text>` | Which plugin, setting, menu, toolbar item or command matches this word? |
| `menus [menu-id]` | Which main menus and submenus exist? With an ID: which items does the menu have (command, rank, args)? |
| `toolbars [text]` | Which items does each toolbar have, and which plugin has the `toolbar` setting? |
| `context-menu [text]` | Which items does the context menu have (command, selector, rank)? |
| `shortcuts [text]` | Which default shortcuts exist (command, keys, selector, args)? |
| `css-variables [text]` | Which CSS variables do the themes define, with the light and dark values? `--theme <name>` selects other installed themes |
| `shared [text]` | Which npm packages, at which version, does the application share with extensions? |
| `page-config` | Which files set `disabledExtensions`, `appName`…, and what is the merged result? |
| `overrides` | Which files change setting defaults, and what is the merged result? Flags unknown IDs and keys. |
| `user-settings` | Which settings did the user save? These hide all defaults. |

Typical start of a task:

```bash
<env>/bin/python scripts/jlab_inspect.py paths
```

```bash
<env>/bin/python scripts/jlab_inspect.py find "line numbers"
```

```bash
<env>/bin/python scripts/jlab_inspect.py schema @jupyterlab/notebook-extension:tracker
```

`find` matches `lineNumbers` for the text "line numbers". It searches plugin
IDs, titles and descriptions, setting keys and descriptions, keys inside
object defaults (`codeCellConfig.lineNumbers`), menu IDs, toolbar item names
and the commands that the schemas use.

The optional text of a list command keeps the rows that contain it:
`shortcuts "Accel S"`, `toolbars Notebook`, `css-variables font`.

## How JupyterLab finds its files

`paths` prints the folders, marks what is writable, and names the write
targets for each scope. The rules are in the JupyterLab documentation:
https://jupyterlab.readthedocs.io/en/stable/user/directories.html

What to keep in mind:

- **Config** folders hold `labconfig/page_config.d/`,
  `labconfig/default_setting_overrides.d/` and the server config. **Data**
  folders hold `labextensions/<name>/`. In both lists the environment
  (`<sys.prefix>`) is before the user folder.
- The **application directory** (`<sys.prefix>/share/jupyter/lab`) holds the
  built core application, its `schemas/` and `themes/`. Read it, never write
  to it.
- Environment variables can move each folder. `paths` lists the ones that
  are set.

## Plugin IDs

A plugin ID is `<npm package>:<name>`, for example
`@jupyterlab/notebook-extension:tracker`. One package holds many plugins.
`jupyter labextension list` shows packages only, and only the prebuilt ones:
it does not list the core plugins.

1. `jlab_inspect.py plugins <text>` or `find <text>`: the IDs in the files of
   this installation, extensions included, with the description of each
   plugin. The text matches the ID and the description
   (`plugins news` finds `@jupyterlab/apputils-extension:announcements`).
2. `jlab_probe.cjs --list plugins --grep <text>` (skill `jupyterlab-verify`,
   needs a running server): the plugins that the application registered,
   with the service that each one provides and the plugins that need it.
   Use it before you disable or replace a plugin.

The documentation has the same list for the last release, without the
dependencies:
https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#core-plugins

## Command IDs

Menus, toolbars, context menus, shortcuts and launcher cards all refer to
commands by ID, for example `notebook:run-all-cells`.

1. `jlab_inspect.py find <text>`: the commands that a menu, a toolbar or a
   shortcut uses. `menus <menu-id>` shows the commands of one menu in order.
2. `jlab_probe.cjs --list commands --grep <text>` (needs a running server):
   all commands of the application, with their labels, extensions included.

A command belongs to a plugin. When the plugin is disabled, the command does
not exist, and menu items that use it disappear.

## Menus, toolbars, shortcuts, widgets, CSS variables

| To find | Command |
| --- | --- |
| The ID of a menu, the items of a menu | `jlab_inspect.py menus`, `jlab_inspect.py menus jp-mainmenu-file` |
| The name of a toolbar item | `jlab_inspect.py toolbars [text]` |
| A context menu item and its selector | `jlab_inspect.py context-menu [text]` |
| The command that has a key, the keys of a command | `jlab_inspect.py shortcuts [text]` |
| A theme variable and its values | `jlab_inspect.py css-variables [text]` |
| The ID of a sidebar panel or another widget of the shell | `jlab_probe.cjs --list widgets` (needs a running server) |
| The service tokens and the plugins that provide them | `jlab_probe.cjs --list tokens --grep <text>` (needs a running server) |

These commands print what the schemas define, before your overrides. The
`overrides` command prints your changes.

## When a customization does not apply

Check in this order:

1. `page-config`: is the plugin disabled? A disabled plugin ignores all
   settings. Is a file marked `INVALID JSON`?
2. `overrides`: is the override there? Is the plugin ID or the key flagged as
   unknown?
3. `user-settings`: did the user save a value for the same plugin? It wins
   over every default.
4. `paths`: is the folder that you wrote to in the config path? An
   environment variable (`JUPYTER_CONFIG_DIR`, `JUPYTERLAB_SETTINGS_DIR`) can
   move it.
5. Was the server restarted? Page config and overrides are read at startup.
6. The schema: lists such as `menus`, `toolbar`, `shortcuts` merge with the
   built-in items. An item needs `"disabled": true` to go away.

## Go deeper

- Schema files on disk: `<app dir>/schemas/<package>/<plugin>.json`, and
  `<labextensions>/<name>/schemas/<name>/<plugin>.json` for extensions. The
  keys `jupyter.lab.menus`, `jupyter.lab.toolbars` and `jupyter.lab.shortcuts`
  in a schema hold the built-in menus, toolbar items and shortcuts.
- Source of a core plugin: `packages/<name>-extension/src/index.ts(x)` in
  https://github.com/jupyterlab/jupyterlab. Read it to learn what a plugin
  requires, which commands it adds, and which CSS classes it uses.
- Lists of the core plugins, tokens and commands of the last release, in the
  documentation:
  https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html
  and https://jupyterlab.readthedocs.io/en/stable/user/commands.html#commands-list
