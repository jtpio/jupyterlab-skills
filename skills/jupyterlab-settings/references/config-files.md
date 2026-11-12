# Config files: formats, folders, precedence

## Folders

`jupyter --paths` lists the **config** folders, highest priority first:

| Folder | Scope | Notes |
| --- | --- | --- |
| `<sys.prefix>/etc/jupyter` | One environment | Where pip and conda packages install their config. Removed when the environment is rebuilt |
| `~/.jupyter` | One user, all environments | `JUPYTER_CONFIG_DIR` replaces it |
| `/usr/local/etc/jupyter`, `/etc/jupyter` | All users | Admin only |

- `JUPYTER_CONFIG_PATH` adds folders in front of the list.
- `JUPYTER_PREFER_ENV_PATH=0` puts the user folder before the environment
  folder. In a virtual environment the environment folder is first by default.
- Docker images, JupyterHub and desktop applications often set these
  variables. Always read the real list with `jupyter --paths`, or with
  `jlab_inspect.py paths`, from the environment that runs the server.

## Page config

Files: `<config>/labconfig/page_config.json` and
`<config>/labconfig/page_config.d/*.json`. All files of all config folders
merge. Inside one folder the files of the `.d` folder apply in name order,
then `page_config.json`. Between folders, the higher priority folder wins.

```json
{
  "appName": "My Lab",
  "disabledExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/apputils-extension:announcements": true
  },
  "lockedExtensions": {
    "@jupyterlab/extensionmanager-extension": true
  },
  "deferredExtensions": {},
  "notebookStartsKernel": false,
  "quitButton": false,
  "terminalsAvailable": true
}
```

| Key | Meaning |
| --- | --- |
| `disabledExtensions` | Object of `"<id or package or regex>": true/false`. Disabled plugins do not load |
| `lockedExtensions` | Same format. The user cannot toggle these plugins |
| `deferredExtensions` | Same format. The plugin loads only when another plugin needs it |
| `appName` | Title of the browser tab, name in dialogs |
| `notebookStartsKernel` | `false`: a notebook opens without starting a kernel |
| `quitButton` | `false`: no File → Shut Down |
| `terminalsAvailable` | `false`: no terminals |

Matching of a `disabledExtensions` key, first match wins:

1. Equal to a package name → all plugins of the package.
2. Regular expression that matches a package name.
3. Equal to a plugin ID.
4. Regular expression that matches a plugin ID.

Three more sources add to `disabledExtensions`:

- An installed extension can name plugins to disable in its `package.json`
  (`jupyterlab.disabledExtensions`, a list). Use it when an extension replaces
  a core plugin. `jlab_inspect.py page-config` shows these.
- The CLI `jupyter labextension disable <id> --level=sys_prefix|user|system`
  writes `labconfig/page_config.json` of that level.
- `<app dir>/settings/page_config.json` (deprecated, list format).

The format is an **object**, not a list, in `labconfig`. A list is silently
wrong there.

## Default setting overrides

Files: `<config>/labconfig/default_setting_overrides.json` and
`<config>/labconfig/default_setting_overrides.d/*.json`. Same merge rules as
page config. An older single file also works:
`<app dir>/settings/overrides.json`. Do not use it for new work: it is inside
the application directory and one package only can own it.

```text
{
  "<plugin id>": {
    "<setting key>": <value>
  }
}
```

How JupyterLab applies one override to the schema of the plugin:

- The setting key exists and its default is an **object**: the override is
  merged into the default, recursively. Give only the keys that change.
- The setting key exists and its default is a list, string, number or
  boolean: the override **replaces** the default.
- The setting key does not exist in the schema: the value is added as a
  default anyway, but no plugin reads it.
- The plugin ID does not exist: ignored, no error.

Four list settings behave differently in the application: `menus`,
`contextMenu`, `toolbar` and `shortcuts`. The plugin that owns them merges
your list with the built-in items from all schemas (`jupyter.lab.menus`,
`jupyter.lab.toolbars`, `jupyter.lab.shortcuts`). Your list holds additions
and items with `"disabled": true`.

Some settings are read from the user settings only, and ignore default
overrides. Known case: `overrides` (fonts) of
`@jupyterlab/apputils-extension:themes`.

## User settings

Folder: `jupyter lab path` → "User Settings directory". Default
`~/.jupyter/lab/user-settings`; `JUPYTERLAB_SETTINGS_DIR` replaces it.

File for the plugin `<package>:<plugin>`:

```
<user settings dir>/<package>/<plugin>.jupyterlab-settings
```

Example: `@jupyterlab/apputils-extension:themes` →
`@jupyterlab/apputils-extension/themes.jupyterlab-settings`.

The content is JSON5: comments and trailing commas are allowed. Only the keys
in the file are user values; other keys fall back to the defaults. The
Settings Editor writes these files. To reset a setting to its default, remove
the key (or the file).

## Workspaces

Folder: `jupyter lab path` → "Workspaces directory". Default
`~/.jupyter/lab/workspaces`; `JUPYTERLAB_WORKSPACES_DIR` replaces it.

A workspace stores the open tabs, the side areas that are open, their sizes
and widgets that the user moved. It wins over the `layout` defaults for that
workspace. To test defaults, use a clean workspace: an empty workspaces
folder, or the URL `…/lab?reset`.

```bash
jupyter lab workspaces export > workspace.json
```

```bash
jupyter lab workspaces import workspace.json
```

## Server config

| File | Merged how | Use for |
| --- | --- | --- |
| `<config>/jupyter_server_config.json` or `.py` | By class and option; higher priority folder wins | Any `ServerApp`, `LabApp`, `ContentsManager`… option |
| `<config>/jupyter_lab_config.json` or `.py` | Same | `LabApp` options |
| `<config>/jupyter_server_config.d/*.json` | Deep merge, but read only for `ServerApp.jpserver_extensions` | Turn a server extension on or off |

Tested with Jupyter Server 2.21: an option such as `ServerApp.quit_button` or
`LabApp.custom_css` in a `.d` file has no effect. Put it in
`jupyter_server_config.json`, or pass it on the command line
(`--LabApp.custom_css=True`). Some extensions read their own section from the
`.d` folder (for example `LanguageServerManager` of `jupyter-lsp`).

Options that affect the UI:

| Option | Effect |
| --- | --- |
| `LabApp.custom_css = True` | Load `<user config>/custom/custom.css` |
| `LabApp.default_url = "/lab/tree/start.ipynb"` | Page that opens first |
| `LabApp.collaborative`, `LabApp.news_url`, `LabApp.check_for_updates_class` | Collaboration, news feed, update check |
| `ServerApp.root_dir` | Folder that the file browser shows |
| `ServerApp.quit_button = False` | No Shut Down entry |
| `ServerApp.terminals_enabled = False` | No terminals |
| `ContentsManager.allow_hidden = True` | Hidden files can be listed |

List all options with `jupyter lab --help-all`.

## Useful URLs of a running server

| URL | Content |
| --- | --- |
| `/lab/api/settings` | All schemas with the defaults in effect and the user values |
| `/lab/api/settings/<plugin id>` | One plugin |
| `/lab?reset` | Start with a clean workspace |
| `/lab/workspaces/<name>` | A named workspace |
| `/lab/extensions/<name>/…` | Files of a prebuilt extension |
| `/lab/api/themes/<path>` | Files of the `themes/` folder of an extension |
