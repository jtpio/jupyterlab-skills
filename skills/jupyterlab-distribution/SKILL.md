---
name: jupyterlab-distribution
description: Package a customized JupyterLab as one installable Python package - a "distribution" such as xtralab - that brings JupyterLab, its configuration (disabled plugins, default settings, layout, menus), its extensions and themes, extra dependencies, a launch command and its own name. Use it when the user wants an artifact to install or share instead of changes in one environment - "make this a package", "create my own JupyterLab app", "something I can pip install", "ship these customizations to my team", "turn this environment into a wheel". Gives a script that scaffolds the project, imports customizations already made in an environment, and checks the project and the wheel; plus the steps to build, test in a clean environment, and brand the application.
compatibility: JupyterLab 4.x (tested with 4.6). Python 3.9 or newer. A build front end, uv or the `build` package. No Node.js unless the distribution contains a TypeScript extension.
---

# Package JupyterLab as a distribution

A distribution is a normal Python package whose wheel carries **data files**
that pip copies below `sys.prefix`:

```
etc/jupyter/labconfig/page_config.d/<name>.json                 disabled plugins, appName
etc/jupyter/labconfig/default_setting_overrides.d/<name>.json   default settings
share/jupyter/labextensions/<extension>/…                       extensions and themes
```

JupyterLab reads these folders at startup. The package depends on
`jupyterlab` and on any extension packages it wants, and it adds a command
that starts the application. No build of JupyterLab, no Node.js.

## Workflow

```bash
python scripts/jlab_dist.py new my-lab --app-name "My Lab" --python <env>/bin/python
```

1. **Create** the project (above). `--python` pins the JupyterLab version
   range to that of an environment. Other options: `--command` (name of the
   launch command, default: the package name), `--dir` (name of the project
   folder, default: the package name), `--description`,
   `--depends <requirement>` (repeat for each extra dependency), `--dest`.
2. **Fill** it, in one of two ways (they combine):
   - Write into the project: config with
     `jlab_config.py --config-dir my-lab/jupyter-config --name my-lab …`
     (skill `jupyterlab-settings`), extensions with
     `jlab_ext.py new <ext> --dest my-lab/labextensions` (skill
     `jupyterlab-extensions`), themes with
     `new_theme.py <theme> --dest my-lab/labextensions` (skill
     `jupyterlab-theming`).
   - Import from an environment that you customized and tested:

     ```bash
     python scripts/jlab_dist.py collect my-lab --python <env>/bin/python
     ```

     It merges the snippets named `50-custom.json` (the default name of
     `jlab_config.py`; change with `--snippet`) and copies the extensions that
     `jlab_ext.py` installed (add others with `--extension <name>`).
3. **Run it while you work**, with no install. The server reads the project
   folders directly:

   ```bash
   python <verify>/jlab_server.py start --name my-lab --python <env>/bin/python --project my-lab --root-dir /tmp/my-lab-demo
   ```

   ```bash
   node <verify>/jlab_probe.cjs --server my-lab --fail-on-console-error --screenshot my-lab.png
   ```

   After a change to a JSON file: `jlab_server.py restart --name my-lab`.
   `<env>` is any environment with JupyterLab that does **not** have the
   distribution installed. The inspect script reads the project the same
   way: `<env>/bin/python <inspect>/jlab_inspect.py --project my-lab overrides`.
4. **Check** the project, before each build. `--fix` marks every extension
   in `labextensions/` as owned by the package (themes and extensions that
   other scripts created are not). It also writes a new stamp for each
   extension whose `static/` files changed: without it, the browser of a
   person who upgrades keeps the JavaScript and CSS of the old version.

   ```bash
   python scripts/jlab_dist.py check my-lab --fix
   ```

5. **Build** the wheel:

   ```bash
   cd my-lab && uv build --wheel
   ```

   Without uv: `python -m pip install build && python -m build --wheel`.
6. **Check the wheel** (`check` lists its data files when `dist/` has one),
   then **test in a clean environment**. This is the real test: it proves
   that the wheel alone carries everything.

   ```bash
   uv venv /tmp/my-lab-test && uv pip install --python /tmp/my-lab-test/bin/python dist/my_lab-0.1.0-py3-none-any.whl
   ```

   ```bash
   python <verify>/jlab_server.py start --name my-lab --cmd /tmp/my-lab-test/bin/my-lab --root-dir /tmp/my-lab-demo
   ```

   ```bash
   node <verify>/jlab_probe.cjs --server my-lab --expect-title "My Lab" --fail-on-console-error --screenshot my-lab.png
   ```

   `<verify>` is `scripts/` of the skill `jupyterlab-verify`, `<inspect>`
   that of `jupyterlab-inspect`. Without uv: `python -m venv` and
   `pip install`.
7. **Hand over**: the path of the wheel, the install and run commands, and
   what the distribution changes. Do not publish to PyPI and do not push to a
   remote unless the user asks.

## The project

```
my-lab/
├── pyproject.toml
├── README.md
├── my_lab/
│   ├── __init__.py                    version
│   ├── __main__.py                    python -m my_lab
│   └── cli.py                         the `my-lab` command
├── jupyter-config/                    → etc/jupyter/
│   └── labconfig/
│       ├── page_config.d/my-lab.json
│       └── default_setting_overrides.d/my-lab.json
└── labextensions/                     → share/jupyter/labextensions/
    └── my-lab/                        core extension of the application
        ├── package.json
        ├── install.json
        ├── schemas/my-lab/plugin.json     menus, toolbar items, shortcuts, settings
        └── static/
            ├── remoteEntry.js             plugins: starts with an About command
            └── style.css
```

The two arrows are these lines of `pyproject.toml`:

```toml
[tool.hatch.build.targets.wheel.shared-data]
"jupyter-config" = "etc/jupyter"
"labextensions" = "share/jupyter/labextensions"
```

- Every file below `jupyter-config/` and `labextensions/` goes into the
  wheel. Keep only what must ship.
- Each folder in `labextensions/` is one extension. The core extension
  `my-lab` is the place for the code and CSS of the application itself. Its
  schema belongs to the plugin `my-lab:plugin`: declare the menus, toolbar
  buttons and shortcuts of your own commands there (skill
  `jupyterlab-extensions`). Add more folders for themes or for separate
  features. Real folders only: no symlinks.
- Name the snippets after the package (`my-lab.json`): files of different
  packages in the same `.d` folder must not collide.
- More server-side files go the same way. For example
  `jupyter-config/jupyter_server_config.d/my-lab.json` to enable a server
  extension of the package.

## The launch command

`my_lab/cli.py` starts JupyterLab with two additions:

- **A separate user state.** It sets `JUPYTERLAB_SETTINGS_DIR` and
  `JUPYTERLAB_WORKSPACES_DIR` to a folder of the distribution
  (`<user config>/my-lab/`). Settings that the user saved in a plain
  JupyterLab then do not hide the defaults of the distribution, and the
  reverse.
- **Default arguments.** `DEFAULT_ARGS` holds server options that config
  files cannot ship (general options in `jupyter_server_config.d` have no
  effect). Arguments of the user come after them and win:

  ```python
  DEFAULT_ARGS: list[str] = ["--LabApp.default_url=/lab/tree/welcome.ipynb"]
  ```

All `jupyter lab` options work: `my-lab --port 9000 --no-browser`.

Important: the config files apply to **every** JupyterLab that starts from
the environment where the package is installed, also a plain `jupyter lab`.
The environment is the application. Tell the user to install the
distribution in its own environment. Tools that do this by default:

```bash
uvx my-lab
```

```bash
uv tool install my-lab
```

```bash
pipx install my-lab
```

From a local wheel: `uvx --from ./dist/my_lab-0.1.0-py3-none-any.whl my-lab`.

## Brand the application

| What | How | Skill |
| --- | --- | --- |
| Name in the browser tab and in dialogs | `"appName": "My Lab"` in `page_config.d/my-lab.json` (the scaffold sets it) | `jupyterlab-settings` |
| Colors and fonts | Theme extension in `labextensions/`, set as the default theme | `jupyterlab-theming` |
| Logo, favicon, About dialog, splash screen, home page | Plugins in the core extension, which disables the core plugins it replaces | `jupyterlab-extensions`, `references/replace-core.md` |
| Fewer menus, toolbars, panels | Overrides and disabled plugins in `jupyter-config/` | `jupyterlab-settings` |
| More features | `--depends jupyterlab-git` and other extension packages | |

The scaffold already adds the command `<name>:about` ("About My Lab"). To
make it the Help → About entry, see `replace-core.md`: disable the core About
plugin, register `help:about`, and put the Help menu item back in the
schema.

## Dependencies

`pyproject.toml`:

```toml
dependencies = [
    "jupyterlab>=4.6,<5",
    "jupyterlab-git>=0.51",
    "ipywidgets",
]
```

- Keep the upper bound on JupyterLab: plugin IDs and settings can change in a
  major version.
- Prebuilt extensions from PyPI install with the distribution and need no
  other step. Their settings can get defaults in your overrides file, and
  their plugins can be disabled in your page config.
- A kernel is not part of JupyterLab: `jupyterlab` brings `ipykernel`. Add
  other kernels or libraries (pandas, matplotlib) when the application needs
  them.

## Update a distribution

1. Change the files, raise `version` in `pyproject.toml` and in
   `<module>/__init__.py`.
2. `jlab_dist.py check`, build, test in a clean environment.
3. After an upgrade of JupyterLab: install the distribution with the new
   version in a clean environment, run `jlab_inspect.py overrides` there (it
   flags plugin IDs and keys that no longer exist), and probe with
   `--fail-on-console-error`.

## Problems

| Symptom | Cause |
| --- | --- |
| The wheel has no data files | The `shared-data` table is missing or the folders moved. `jlab_dist.py check` tells |
| Config applies in the development environment but not after `pip install` | You tested with files in `etc/jupyter` of the development environment, not with the wheel. Test in a clean environment |
| The defaults do not apply for one user | The user has saved settings. With the launch command they are separate; with a plain `jupyter lab` in the same environment they are not |
| An extension of the wheel is not loaded | Its folder name differs from `name` in its `package.json`, or it is a symlink |
| `pip uninstall` leaves folders | Only empty folders stay. Files that the package did not install (created by hand in the same folders) also stay |

## Other targets

- **conda**: the same wheel layout works in a conda recipe (`noarch: python`,
  `pip install .`). The data files go to `$PREFIX/etc/jupyter` and
  `$PREFIX/share/jupyter`.
- **Docker**: `pip install` the wheel in the image, set the launch command as
  the entry point with `--ip=0.0.0.0 --no-browser`.
- **JupyterHub**: install the wheel in the environment of the single-user
  servers. The config files apply to the JupyterLab that the hub starts.
- **JupyterLite**: a different build system (`jupyter lite build`). The same
  extensions and overrides can be reused, but the packaging differs. See
  https://jupyterlite.readthedocs.io.

A full example of a distribution, with a TypeScript extension, a desktop
application and a JupyterLite site: https://github.com/jtpio/xtralab
