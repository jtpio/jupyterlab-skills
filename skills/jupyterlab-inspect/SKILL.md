---
name: jupyterlab-inspect
description: Find out how a JupyterLab installation is set up before you change it. Use it to locate the config and data folders and the right place to write, to find the exact ID of a plugin, setting, command, menu, toolbar item or sidebar widget, to read the schema and default of a setting, to see which extensions are installed, and to explain why a customization does not apply (effective page config, effective overrides, user settings that hide a default). Use it before any JupyterLab customization, and when the user asks "what is the ID of…", "where does JupyterLab read…", "which extensions are installed", or "why does my setting not work".
compatibility: JupyterLab 4.x. The script must run with the Python of the environment that has JupyterLab.
---

# Inspect a JupyterLab installation

A wrong plugin ID or setting key fails silently in JupyterLab. Look up every
ID before you write it. `scripts/jlab_inspect.py` reads the installation from
disk. It needs no server and no browser.

Run it with the Python of the target environment:

```bash
<env>/bin/python scripts/jlab_inspect.py <command>
```

Add `--json` before the command for machine-readable output.

## Commands

| Command | Answers |
| --- | --- |
| `paths` | Which folders does JupyterLab read? Where do I write for the environment scope and the user scope? |
| `extensions` | Which prebuilt extensions are installed? Which core plugins do they disable? |
| `plugins [text]` | Which plugin IDs exist? Which are disabled? Which have settings? |
| `schema <plugin-id>` | Which settings does this plugin have, with type, default, and the override in effect? |
| `find <text>` | Which plugin, setting, menu, toolbar item or command matches this word? |
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
IDs and titles, setting keys and descriptions, keys inside object defaults
(`codeCellConfig.lineNumbers`), menu IDs, toolbar item names and the commands
that the schemas use.

## How JupyterLab finds its files

`jupyter --paths` prints two lists, highest priority first.

- **config** folders. Each can hold `labconfig/page_config.d/`,
  `labconfig/default_setting_overrides.d/`, `jupyter_server_config.json` and
  `jupyter_server_config.d/`. Order: environment (`<sys.prefix>/etc/jupyter`),
  user (`~/.jupyter`, or `JUPYTER_CONFIG_DIR`), then system folders.
- **data** folders. Each can hold `labextensions/<name>/`. Order: environment
  (`<sys.prefix>/share/jupyter`), user, system.

Three more folders belong to JupyterLab (`jupyter lab path`):

- **Application directory** `<sys.prefix>/share/jupyter/lab`: the built core
  application, its `schemas/` and `themes/`. Read it, never write to it.
- **User settings directory** `~/.jupyter/lab/user-settings`
  (`JUPYTERLAB_SETTINGS_DIR`): what the Settings Editor saves.
- **Workspaces directory** `~/.jupyter/lab/workspaces`
  (`JUPYTERLAB_WORKSPACES_DIR`): saved layouts and open tabs.

`paths` prints all of this, marks what is writable, and names the write
targets for each scope.

## Plugin IDs

A plugin ID is `<npm package>:<name>`, for example
`@jupyterlab/notebook-extension:tracker`. One package holds many plugins.
`jupyter labextension list` shows packages only, and only the prebuilt ones:
it does not list the core plugins.

Sources of IDs, from fastest to most exact:

1. [references/core-plugins.md](references/core-plugins.md): all plugins of a
   stock JupyterLab 4.6, with description, provided service, and the plugins
   that break when it is disabled. Search it with grep.
2. `jlab_inspect.py plugins <text>`: the IDs in the files of this
   installation, including extensions.
3. The browser probe of `jupyterlab-verify` (`--dump`): the plugins that the
   running application registered, with their service tokens.

## Command IDs

Menus, toolbars, context menus, shortcuts and launcher cards all refer to
commands by ID, for example `notebook:run-all-cells`.

1. [references/core-commands.md](references/core-commands.md): all commands
   of a stock JupyterLab 4.6 with their labels.
2. The browser probe (`--dump`): the commands of the running application,
   including those of extensions.

A command belongs to a plugin. When the plugin is disabled, the command does
not exist, and menu items that use it disappear.

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
- Core plugin and token list in the documentation:
  https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html

## Regenerate the catalogs

The catalogs in `references/` come from a live stock JupyterLab. The script
`tools/generate_references.py` at the root of the repository writes them again
for a new version.
