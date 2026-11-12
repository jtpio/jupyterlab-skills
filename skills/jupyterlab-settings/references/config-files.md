# Config files: formats, folders, precedence

This file holds the rules that the JupyterLab documentation does not give,
and the traps. For the rest, it links to the documentation:

- Folders of Jupyter: https://docs.jupyter.org/en/latest/use/jupyter-directories.html
- Folders of JupyterLab, `page_config.json`, `overrides.json`:
  https://jupyterlab.readthedocs.io/en/stable/user/directories.html
- Enable, disable and lock plugins:
  https://jupyterlab.readthedocs.io/en/stable/user/extensions.html#enable-disable-config

## Folders

`jlab_inspect.py paths` prints the config folders of the environment, highest
priority first, and where to write for each scope. Read the real list, do
not assume it:

- In a virtual environment, `<sys.prefix>/etc/jupyter` is first, then the
  user folder (`~/.jupyter`). `JUPYTER_PREFER_ENV_PATH=0` puts the user
  folder first.
- `JUPYTER_CONFIG_DIR` replaces the user folder. `JUPYTER_CONFIG_PATH` adds
  folders in front of the list.
- Docker images, JupyterHub and desktop applications often set these
  variables.

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
  "notebookStartsKernel": false,
  "quitButton": false,
  "terminalsAvailable": true
}
```

| Key | Meaning |
| --- | --- |
| `disabledExtensions` | Object of `"<id or package or regex>": true/false`. Disabled plugins do not load. The matching rules are in the documentation (first link) |
| `lockedExtensions` | Same format. The user cannot toggle these plugins |
| `deferredExtensions` | Same format. The plugin loads only when another plugin needs it |
| `appName` | Title of the browser tab, name in dialogs |
| `notebookStartsKernel` | `false`: a notebook opens without starting a kernel |
| `quitButton` | `false`: no File → Shut Down |
| `terminalsAvailable` | `false`: no terminals |

Traps:

- The format is an **object**, not a list, in `labconfig`. A list is silently
  wrong there.
- Two more sources add to `disabledExtensions`, and
  `jlab_inspect.py page-config` shows both: an installed extension that names
  plugins in its `package.json` (`jupyterlab.disabledExtensions`), and the
  CLI `jupyter labextension disable <id> --level=sys_prefix|user|system`,
  which writes `labconfig/page_config.json` of that level.

## Default setting overrides

Files: `<config>/labconfig/default_setting_overrides.json` and
`<config>/labconfig/default_setting_overrides.d/*.json`. Same merge rules as
page config. The documentation describes only the older single file
`<app dir>/settings/overrides.json`. Do not use that one for new work: it is
inside the application directory and one package only can own it.

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

File for the plugin `<package>:<plugin>`, in the user settings directory that
`jlab_inspect.py paths` prints (`JUPYTERLAB_SETTINGS_DIR` replaces it):

```
<user settings dir>/<package>/<plugin>.jupyterlab-settings
```

Example: `@jupyterlab/apputils-extension:themes` →
`@jupyterlab/apputils-extension/themes.jupyterlab-settings`.

The content is JSON5. Only the keys in the file are user values; other keys
fall back to the defaults. To reset a setting to its default, remove the key
(or the file).

## Workspaces

A workspace stores the open tabs, the side areas that are open, their sizes
and the widgets that the user moved. It wins over the `layout` defaults for
that workspace. To test defaults, use a clean workspace: an empty workspaces
folder (`JUPYTERLAB_WORKSPACES_DIR`), or the URL `…/lab?reset`.

Documentation: https://jupyterlab.readthedocs.io/en/stable/user/workspaces.html
and https://jupyterlab.readthedocs.io/en/stable/user/urls.html

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
| `/lab/extensions/<name>/…` | Files of a prebuilt extension |
| `/lab/api/themes/<path>` | Files of the `themes/` folder of an extension |
