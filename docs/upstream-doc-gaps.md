# Gaps in the upstream documentation

The skills link to the JupyterLab documentation for the meaning of a
feature. This file lists the facts that the skills must still hold, because
the documentation does not have them. Each one is a possible contribution
upstream. When one lands, replace the text in the skill with a link.

How each item was checked:

- **Behavior**: tested on JupyterLab 4.6.6 with jupyterlab_server 2.28.1 and
  jupyter_server 2.21.1 (Linux, Python 3.13), and read in the source that the
  item names.
- **Documentation**: a text search of `docs/source` in `jupyterlab/jupyterlab`
  at commit `8e96f61` (`main`, version 4.7.0-beta.1, 12 November 2026). "No
  match" means that the search terms do not occur there. The pages of other
  projects are named where they were checked.

No issue or pull request was opened for these items.

## Summary

| # | Fact | Documentation today | Skill that holds it |
| --- | --- | --- | --- |
| 1 | `labconfig/default_setting_overrides.json` and `.d/` change setting defaults | No match | `jupyterlab-settings` |
| 2 | `labconfig/page_config.d/*.json` and the merge order | No match | `jupyterlab-settings` |
| 3 | Page config keys `lockedExtensions`, `appName`, `quitButton`, `notebookStartsKernel` | Not in the list of keys | `jupyterlab-settings` |
| 4 | How an override changes a default: objects merge, other values replace | Not described | `jupyterlab-settings` |
| 5 | A default shortcut is identified by its keys and selector | Not described | `jupyterlab-settings` |
| 6 | The theme setting `overrides` ignores default overrides | No match | `jupyterlab-settings`, `jupyterlab-theming` |
| 7 | `custom.css` loads from the user config folder only | Not exact | `jupyterlab-theming` |
| 8 | A disabled plugin breaks the plugins that require its service | No warning | `jupyterlab-settings`, `jupyterlab-verify` |
| 9 | `jupyter_server_config.d` applies only to `jpserver_extensions` | Not found (Jupyter Server) | `jupyterlab-settings` |
| 10 | `--LabApp.expose_app_in_browser` and `window.jupyterapp` | Migration guide only | `jupyterlab-verify` |
| 11 | The files of a prebuilt extension, as a contract | Not described | `jupyterlab-extensions`, `jupyterlab-theming` |
| 12 | A theme must define all theme variables | Not described | `jupyterlab-theming` |
| 13 | An application from the published npm packages | No page | `jupyterlab-remix` |
| 14 | Plugin metadata as data (a feature, not a text) | Not available | `jupyterlab-settings`, `jupyterlab-remix` |

## Configuration

### 1. Default setting overrides in `labconfig`

- **Fact.** Each config folder of `jupyter --paths` can hold
  `labconfig/default_setting_overrides.json` and
  `labconfig/default_setting_overrides.d/*.json`. They change the default of
  any setting, they layer by config folder, and a package can install one
  with `shared-data`. xtralab and the skills use this as the primary way to
  ship defaults.
- **Evidence.** `jupyterlab_server/settings_utils.py`, function
  `_get_overrides`: `ConfigManager(config_dir_name="labconfig")` then
  `cm.get("default_setting_overrides")`.
- **Documentation.** No match for `default_setting_overrides`. The page
  "Advanced Usage" describes only
  `<application directory>/settings/overrides.json`.
- **Where.** `docs/source/user/directories.md`, section "LabConfig
  Directories", next to `page_config.json`.
- **Removes.** The section "Default setting overrides" of
  `skills/jupyterlab-settings/references/config-files.md`.

### 2. The drop-in folder `page_config.d`

- **Fact.** `labconfig/page_config.d/*.json` files merge with
  `labconfig/page_config.json`. Inside one config folder the `.d` files apply
  in name order, then `page_config.json`. Between folders, the folder of
  higher priority wins.
- **Evidence.** `jupyterlab_server/config.py`, function `get_page_config`,
  through the `ConfigManager` of Jupyter Server.
- **Documentation.** No match for `page_config.d`.
- **Where.** The same section, "LabConfig Directories".
- **Removes.** The first paragraph of "Page config" in `config-files.md`.

### 3. Page config keys that the list does not have

- **Fact.** The section "LabConfig Directories" lists `terminalsAvailable`,
  `disabledExtensions` and `deferredExtensions`. The application also reads
  `lockedExtensions`, `appName` (title of the tab and name in dialogs),
  `quitButton` and `notebookStartsKernel` from the same files.
- **Evidence.** `PageConfig.getOption('appName')` in
  `packages/application/src/lab.ts`, `'quitButton'` in
  `packages/mainmenu-extension/src/index.ts`, `'notebookStartsKernel'` in
  `packages/notebook-extension/src/index.ts`.
- **Documentation.** `lockedExtensions` occurs only in the migration guide
  (the section "Locking and Unlocking Plugins" gives the CLI, not the key).
  `appName` and `quitButton` occur only in old changelogs. No match for
  `notebookStartsKernel`.
- **Where.** The list of keys in "LabConfig Directories".
- **Removes.** The table of keys in `config-files.md`.

### 4. How an override changes a default

- **Fact.** When the default of a setting is an object, the override merges
  into it, recursively. A list, string, number or boolean replaces the
  default. A key that the schema does not have is added and has no effect. A
  plugin ID that does not exist is ignored with no error. The list settings
  `menus`, `contextMenu`, `toolbar` and `shortcuts` then merge with the
  built-in items in the application.
- **Evidence.** `jupyterlab_server/settings_utils.py`, function `_override`.
- **Documentation.** The section `overrides.json` has one example with a
  string value and no rule.
- **Where.** `docs/source/user/directories.md`, section `overrides.json`.
- **Removes.** The list "How JupyterLab applies one override" in
  `config-files.md` and the bullets of "Change a default" in
  `skills/jupyterlab-settings/SKILL.md`.

### 5. The identity of a default shortcut

- **Fact.** Between default shortcuts (built-in ones and those of an
  overrides file), JupyterLab identifies a shortcut by its keys and selector.
  The command does not count. An entry with `"disabled": true` removes every
  default with the same keys and selector, also one that the same file adds.
  Two enabled defaults with the same keys and selector: one is kept, the
  other is dropped with a console warning.
- **Evidence.** `packages/settingregistry/src/settingregistry.ts`,
  `SettingRegistry.reconcileShortcuts`.
- **Documentation.** `docs/source/user/interface.md` shows how to disable a
  built-in shortcut "using their exact keys and selectors" in the user
  settings. It does not give the rule, and not the case of defaults from an
  overrides file, where a new shortcut on the same keys and selector is
  removed too.
- **Where.** `docs/source/user/interface.md`, section "Keyboard Shortcuts".
- **Removes.** "Keyboard shortcuts: the rules" in
  `skills/jupyterlab-settings/SKILL.md` (the rules; the recipe to take a key
  that is in use stays).

### 6. The theme setting `overrides` ignores default overrides

- **Fact.** The key `overrides` of `@jupyterlab/apputils-extension:themes`
  (font families and sizes) applies only from the user settings. A value in
  an overrides file has no effect.
- **Evidence.** `packages/apputils/src/thememanager.ts` reads
  `this._settings.user['overrides']`.
- **Documentation.** No match.
- **Where.** This is possibly a defect, not a missing text: the manager
  could read the composite value. An issue is the correct first step.
- **Removes.** The note in `config-files.md`.

### 7. `custom.css` loads from the user config folder only

- **Fact.** With `--custom-css`, JupyterLab serves `custom/custom.css` from
  the user config folder (`~/.jupyter`, or `JUPYTER_CONFIG_DIR`). A file in
  the config folder of an environment (`<sys.prefix>/etc/jupyter/custom/`)
  does not load, so a package cannot ship one.
- **Evidence.** `jupyterlab/labapp.py` serves `/custom/` from the server
  setting `static_custom_path`.
- **Documentation.** `docs/source/user/custom_css.md` says "the jupyter
  `config` directory" and points to `jupyter --paths`, which lists more than
  one folder.
- **Where.** `docs/source/user/custom_css.md`.
- **Removes.** One sentence of `skills/jupyterlab-theming/SKILL.md`.

### 8. A disabled plugin breaks the plugins that require its service

- **Fact.** When a plugin that provides a service is disabled, each plugin
  that lists the token in `requires` does not activate, and the browser
  console shows `No provider for: <token>`. No tool outside the browser
  lists these dependents.
- **Evidence.** Test: disable `@jupyterlab/running-extension:plugin`; four
  plugins do not activate.
- **Documentation.** No match for `No provider`. The sections on
  `disabledExtensions` and `jupyter labextension disable` have no warning.
- **Where.** `docs/source/user/extensions.md`, section "Enabling and
  Disabling Extensions".
- **Removes.** A part of "Disable or hide a feature" in
  `skills/jupyterlab-settings/SKILL.md`. Item 14 removes the data file.

### 9. `jupyter_server_config.d` applies only to `jpserver_extensions`

- **Fact.** A JSON file in `jupyter_server_config.d/` can turn a server
  extension on or off. A general option in such a file, for example
  `ServerApp.quit_button` or `LabApp.custom_css`, has no effect. General
  options must be in `jupyter_server_config.json` (or `.py`) or on the
  command line.
- **Evidence.** Test with Jupyter Server 2.21.1.
- **Documentation.** This belongs to Jupyter Server. The string
  `jupyter_server_config.d` does not occur on the pages "Configuring
  Extensions" and "Configuring a Jupyter Server" of
  jupyter-server.readthedocs.io (checked 12 November 2026). Other pages were
  not searched.
- **Where.** The Jupyter Server documentation, and a note in
  `docs/source/user/directories.md`.
- **Removes.** The note below the table "Server config" in `config-files.md`.

## Extensions and themes

### 10. The application object in the browser

- **Fact.** `jupyter lab --expose-app-in-browser` (the option
  `LabApp.expose_app_in_browser`) sets `window.jupyterapp`. Test tools need
  it to read the plugins, the commands and the shell of the running
  application. Galata uses it.
- **Documentation.** `jupyterapp` occurs only in the migration guide and in
  the 3.x changelog. No match for `expose_app_in_browser`.
- **Where.** `docs/source/extension/extension_dev.md`, section "Testing your
  extension".
- **Removes.** One paragraph of `skills/jupyterlab-verify/SKILL.md`.

### 11. The files of a prebuilt extension

- **Fact.** JupyterLab loads a folder in `share/jupyter/labextensions/` that
  has a `package.json` with `jupyterlab._build.load` and a script that
  registers a module federation container on `window._JUPYTERLAB[<name>]`.
  Settings need `schemas/<name>/<plugin>.json` and
  `schemas/<name>/package.json.orig`. Themes need
  `themes/<name>/<theme>/index.css`. With this, an extension that uses only
  shared packages needs no build: one plain JavaScript file.
- **Documentation.** The section "Prebuilt Extensions" describes the output
  of the build tool, not the files as a contract. No match for `_JUPYTERLAB`
  or `package.json.orig`.
- **Where.** A decision for the JupyterLab team: the layout is an
  implementation detail today. If it becomes a documented contract, the
  no-build path of the skills has a stable base. If not, the skills keep the
  template and its check.
- **Removes.** Nothing soon. The template and the rules stay in
  `skills/jupyterlab-extensions`.

### 12. A theme must define all theme variables

- **Fact.** The theme variables have no fallback values. A theme that
  defines only some of them leaves fonts, sizes and borders undefined, and
  the interface breaks. A new theme must start from a full copy of a
  built-in theme.
- **Documentation.** The sections "Theme plugins" and "Theme path" do not
  say it.
- **Where.** `docs/source/extension/extension_dev.md`, section "Theme path".
- **Removes.** "Why the full copy" in `skills/jupyterlab-theming/SKILL.md`.

## Applications made from the packages

### 13. An application from the published npm packages

- **Fact.** The folder `examples/` of the repository has applications made
  from the JupyterLab packages, but they build inside the monorepo with
  workspace versions. A project that uses the published packages needs more:
  - The packages depend on each other with `^` ranges. Without a pin of all
    `@jupyterlab/*` and `@lumino/*` packages (npm `overrides` or yarn
    `resolutions`, from `jupyterlab/staging/package.json`), the bundle can
    get two copies of a core package, and plugins fail with
    `No provider for: <token>`.
  - The build must copy the schemas and themes of the selected packages
    (`Build.ensureAssets` of `@jupyter/builder`).
  - The server needs a `LabServerApp` subclass with its own `app_url`,
    `static_dir`, `templates_dir`, `schemas_dir`, `themes_dir` and
    `app_settings_dir`.
  - With a shell that is not `LabShell`, some core plugins stop with
    `did not find a LabShell instance` or `must be activated in JupyterLab`.
- **Documentation.** No page describes how to build such an application. No
  match for `ensureAssets`.
- **Where.** A new page in `docs/source/developer/` or
  `docs/source/extension/`, with a link to the examples and to
  https://github.com/jupyterlab-contrib/jupyterlab-app-cookiecutter.
- **Removes.** Large parts of `skills/jupyterlab-remix/SKILL.md` and its
  references. The templates and the script stay.

## One feature that removes a copy of data

### 14. Plugin metadata as data

- **Need.** For each plugin: ID, description, the token that it provides,
  the tokens that it requires. Tools need it to find the plugins that break
  when a plugin is disabled (item 8), and to plan the plugins of an
  application (item 13).
- **Today.** The data exists only in the running application
  (`app.pluginRegistry`, a private member). The skills keep a copy for stock
  JupyterLab 4.6.6 in `core_plugins.json`, and `jlab_inspect.py` reads plugin
  IDs and descriptions from the minified bundles with a regular expression.
  The documentation has a generated list of the core plugins with their
  descriptions, without the tokens.
- **Proposal.** Write the metadata to a JSON file in the application
  directory at build time, or print it with a command such as
  `jupyter labextension list --plugins`.
- **Removes.** `core_plugins.json` in two skills, the regular expressions in
  `jlab_inspect.py` and `jlab_config.py`, and `tools/update_plugin_data.py`.

## Already in the documentation

The skills now link to these pages and do not repeat them:

| Topic | Page |
| --- | --- |
| Folders, `page_config.json`, matching rules of `disabledExtensions` | https://jupyterlab.readthedocs.io/en/stable/user/directories.html |
| Enable, disable and lock plugins with the CLI | https://jupyterlab.readthedocs.io/en/stable/user/extensions.html |
| Layout, toolbars, menu bar, context menu settings | https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html |
| Custom CSS | https://jupyterlab.readthedocs.io/en/stable/user/custom_css.html |
| Workspaces and URLs | https://jupyterlab.readthedocs.io/en/stable/user/workspaces.html, https://jupyterlab.readthedocs.io/en/stable/user/urls.html |
| Plugins, tokens, prebuilt extensions with a build | https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html |
| Lists of core plugins and tokens, extension points | https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html |
| List of commands | https://jupyterlab.readthedocs.io/en/stable/user/commands.html |
