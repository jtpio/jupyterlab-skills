# The server class of a remix

A remix has a Python class that serves the page, the bundle, the settings and
the themes. It is a subclass of `LabServerApp` from the package
`jupyterlab_server`, the same base that JupyterLab uses. The file is
`<module>/app.py` of the project. All facts below were tested with
`jupyterlab_server` 2.28 and Jupyter Server 2.21.

## Options of the class

| Attribute | Meaning |
| --- | --- |
| `name` | Name of the server extension. Also the folder of the static URL (`/static/<name>/`) and the default folder name for user settings |
| `app_name` | Name in the browser tab (`page_config['appName']`) and in dialogs |
| `version`, `app_version` | Version for `--version` and for the page config |
| `app_url` | URL of the page. The page handler uses this one |
| `extension_url`, `default_url` | URL of the extension and the URL that `/` redirects to. Keep the three URLs the same |
| `file_url_prefix` | Prefix of the file URLs of the document manager (`<app_url>/tree`) |
| `static_dir` | Folder of the bundle. The build writes it |
| `templates_dir` | Folder of `index.html` (a Jinja template) |
| `schemas_dir` | Settings schemas of the compiled plugins. The build copies them |
| `themes_dir` | CSS of the compiled themes. The build writes it |
| `app_settings_dir` | Folder of `overrides.json`: default values of settings. Always set it: with no value the server reads `overrides.json` from the current folder |
| `user_settings_dir`, `workspaces_dir` | Where the settings and workspaces of the user go. Outside the package; the template uses `<jupyter config dir>/<name>/` |
| `labextensions_path`, `extra_labextensions_path` | Folders of prebuilt extensions. Empty lists when the frontend cannot load them |
| `load_other_extensions` | `False`: the server loads no other server extension |
| `serverapp_config` | Options for the Jupyter Server, for example `{"terminals_enabled": False}` |

The options are configurable: `--MyApp.user_settings_dir=…` on the command
line, or a `c.MyApp.…` line in `jupyter_server_config.py`.

## Page config

`jupyterlab_server` fills the page config with the URLs and folders that the
frontend needs (`baseUrl`, `appUrl`, `fullStaticUrl`, `fullSettingsUrl`,
`fullThemesUrl`, `fullWorkspacesApiUrl`, `appName`, `appVersion`…). The
template adds `baseUrl` and `wsUrl` in `index.html`.

Add options of your own in `initialize_settings`:

```python
def initialize_settings(self):
    """
    Add the options of the application to the page config.
    """
    super().initialize_settings()
    page_config = self.serverapp.web_app.settings.setdefault("page_config_data", {})
    page_config["exposeAppInBrowser"] = self.expose_app_in_browser
    page_config["myOption"] = "value"
```

Read them in the frontend with `PageConfig.getOption('myOption')`. Values
arrive as strings.

`exposeAppInBrowser` makes the frontend set `window.jupyterapp`. The browser
probe of the skill `jupyterlab-verify` needs it; `jlab_server.py --app-class
<Class>` turns it on.

## Static files and the browser cache

The server sends the files of `static_dir` with a cache lifetime of one year.
The template loads `bundle.js` through `static_url('bundle.js')`, which adds a
hash of the file to the URL. The other chunks have a hash in their name.

The server computes that hash once. After a rebuild during development,
restart the server (`jlab_server.py restart`).

## More URLs

When the application needs more pages than `app_url` (for example one URL
for each notebook), add handlers in `initialize_handlers`. The template of
the kind `shell` does this: copy it from there.

## Launch

`main = MyApp.launch_instance` is the console script and the target of
`python -m <module>`. All Jupyter Server options work:
`my-app --port 9000 --no-browser --ServerApp.root_dir=…`.

The function `_jupyter_server_extension_points` in `__init__.py` declares
the application as a Jupyter Server extension. This is what
`launch_instance` uses.

## What the server reads from the Jupyter config folders

- `jupyter_server_config.json` and `.py`: yes, as each Jupyter Server.
- `labconfig/page_config.json`: `jupyterlab_server` reads it. The basic
  frontend does not look at `disabledExtensions`; the frontend of the
  `--federated` variant does.
- `labconfig/default_setting_overrides.d`: read, as in JupyterLab.

Do not set `JUPYTER_NO_CONFIG` as the upstream example does: user settings
then go to a temporary folder and are lost.
