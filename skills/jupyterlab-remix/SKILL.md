---
name: jupyterlab-remix
description: Build a new application from JupyterLab packages - a "remix" with its own JavaScript bundle and its own server class, in place of a customized JupyterLab. Use it when configuration and prebuilt extensions are not enough - an application that compiles in only a chosen subset of the JupyterLab core plugins, an application with its own shell and layout (a single-document notebook application, a kiosk, a dashboard) in the style of Jupyter Notebook 7 or jupyterlab-app-cookiecutter, or a page that embeds one JupyterLab component with no plugin system, as the examples folder of the JupyterLab repository does. Gives a scaffold script with templates that were built and run, a planner that tells which core packages a selection needs and which plugins to disable, the build and packaging steps to a wheel, and the browser checks. Use it for requests such as "build my own application on JupyterLab components", "a minimal notebook app", "remix JupyterLab", "custom shell", "embed a notebook in a page".
compatibility: Templates made and tested with the JupyterLab 4.6 npm packages. Needs Node.js 20 or newer with npm, Python 3.9 or newer, and uv or the `build` package.
---

# Build a remix of JupyterLab

A remix is a new web application that you assemble from the npm packages of
JupyterLab. It has its own bundle, its own page and its own server class. It
is not JupyterLab with changes: nothing of the installed JupyterLab
application is used at run time.

## Remix or distribution?

Most requests do not need a remix. Use the lightest way that does the job.

| Need | Use |
| --- | --- |
| Change defaults, hide features, restyle, add commands and panels; keep the JupyterLab interface and its extensions | Distribution: skills `jupyterlab-settings`, `jupyterlab-extensions`, `jupyterlab-theming`, `jupyterlab-distribution`. No build |
| Only a part of the core plugins in the bundle; a different URL and name; an application that cannot be changed back to JupyterLab | Remix, kind `lab` |
| A different layout: one document and no tabs, a kiosk, a dashboard | Remix, kind `shell` |
| One component (a notebook, a file browser) in a page of your own | Remix, kind `widget` |

Cost of a remix, to tell the user before you start:

- A build step with Node.js (about 450 MB of `node_modules`), for each
  change and each release.
- The bundle belongs to one JupyterLab release. An upgrade is a new build
  and a new test.
- No Extension Manager. Prebuilt extensions load only in the kind `lab` with
  the option `--federated`.
- More code to own: the entry point, the server class, and for the kind
  `shell` the shell itself.

## The three kinds

| Kind | What you get | What you write |
| --- | --- | --- |
| `lab` | The JupyterLab shell (menus, sidebars, dock panel) with the core packages that you select, plus your plugins | The list of packages, your plugins, CSS |
| `shell` | Your own application class and shell: you decide the areas and the layout | The shell, small stand-in plugins for what core plugins require, your plugins, CSS |
| `widget` | One page with components that you construct by hand. No plugins, no settings system | All the wiring: services, registries, commands |

Start with `lab` unless the layout must be different. It is the smallest
step away from JupyterLab, and core plugins work in it without changes.

## Workflow

```bash
python scripts/jlab_remix.py new quiet-notebook --kind lab --app-name "Quiet Notebook" --python <env>/bin/python
```

1. **Create** the project (above). `--python` pins the npm packages to the
   JupyterLab release of that environment; without it the template uses the
   release that it was made for. Other options: `--federated` (kind `lab`:
   also load prebuilt extensions), `--dest`, `--dir`.
2. **Select the packages** (kinds `lab` and `shell`): see "Choose the core
   packages".
3. **Write** your plugins in `src/plugins/`, your CSS in `style/app.css`,
   default settings in `<module>/settings/overrides.json`.
4. **Build**, in the project folder:

   ```bash
   npm install
   ```

   ```bash
   npm run build:prod
   ```

   ```bash
   uv build --wheel
   ```

   `npm install` takes 10 to 30 s, the bundle about 5 s. The wheel contains
   the bundle: the target machine needs no Node.js. Without uv:
   `python -m build --wheel`.
5. **Check** the project: `python scripts/jlab_remix.py check <project>`.
6. **Verify** in a browser, from the wheel in a new environment (skill
   `jupyterlab-verify`):

   ```bash
   uv venv /tmp/remix-test && uv pip install --python /tmp/remix-test/bin/python dist/*.whl
   ```

   ```bash
   python <verify>/jlab_server.py start --name remix --cmd /tmp/remix-test/bin/quiet-notebook --app-class QuietNotebook --path quiet-notebook --root-dir /tmp/remix-demo
   ```

   ```bash
   node <verify>/jlab_probe.cjs --server remix --expect-title "Quiet Notebook" --fail-on-console-error --screenshot remix.png
   ```

   `--app-class` is the Python class of the application, `--path` its URL
   path. `jlab_remix.py new` prints both. They give the probe the
   application object and a clean user profile.
7. **Hand over** the wheel and the launch command. Do not publish.

During development: `npm run build` (faster, with source maps), then
`jlab_server.py restart --name remix`. Install the project once in
development mode with `uv pip install -e .`, after the first build.

## The project (kind `lab`)

```
quiet-notebook/
├── package.json               npm packages, and the list "jupyterlab.extensions"
├── rspack.config.js           bundle, schemas, themes
├── src/
│   ├── index.js               creates the application, registers the plugins
│   └── plugins/               your plugins: one file each
├── style/app.css              your CSS, loaded after the core CSS
├── pyproject.toml             the wheel: the module with the built files
└── quiet_notebook/
    ├── app.py                 the server class
    ├── settings/overrides.json    default values of settings
    ├── templates/index.html   the page
    └── static/, schemas/, themes/    written by the build, not in git
```

The bundler is rspack with `@jupyter/builder`, as in JupyterLab itself. The
source is plain JavaScript modules: `import` works, and you can add any npm
package to `dependencies`. There is no TypeScript step.

## Choose the core packages

Each feature of JupyterLab is a package of plugins
(`@jupyterlab/notebook-extension`, `@jupyterlab/filebrowser-extension`…). A
package that is not in the bundle does not exist in the application.

```bash
python scripts/jlab_remix.py plan notebook fileeditor mainmenu filebrowser shortcuts completer markedparser theme-light
```

The planner knows the plugins of a stock JupyterLab and their service
tokens. It prints:

- the **packages** to use: your selection plus those that the main plugin
  of each selected package requires;
- the **plugins to disable**: plugins of the selected packages that require
  a service of a package that is not selected (the status bar, search, the
  table of contents…);
- which package to add to keep each of those plugins.

Put the result in three places. They must agree; `check` compares them.

1. `dependencies` in `package.json`, with the version of the JupyterLab
   release. `jlab_remix.py pin <project> --python <env>/bin/python` sets
   the versions.
2. `jupyterlab.extensions` in `package.json`. The build reads this list to
   copy the settings schemas, the themes and the CSS of each package.
3. The imports and the `extensions` array in `src/index.js`. The plugins to
   disable go in the `DISABLED` array.

The planner sees required services only. After the build, run the probe with
`--fail-on-console-error` and correct what it shows:

| Console message | Cause | Correction |
| --- | --- | --- |
| `No provider for: <token>` | A plugin requires a package that is not in the bundle | Add the plugin ID to `DISABLED`, or add the package |
| `Command '<id>' not registered` | A plugin calls a command of a missing package | Register a command with that ID that does the job, or nothing (`src/plugins/launcher.js` does this for `launcher:create`), or add the package |
| A feature is absent with no error | Its plugin is in a package that you did not select, or it is an optional service | Add the package |

What the packages give is in `core-plugins.md` of the skill
`jupyterlab-inspect`. Three packages are the base of each `lab` remix:
`application-extension`, `apputils-extension`, `translation-extension`.

## Your own plugins

A plugin in `src/plugins/` is the same object as in a JupyterLab extension:
`id`, `autoStart`, `requires`, `optional`, `activate`. Import tokens and
classes from the packages directly:

```js
import { ICommandPalette } from '@jupyterlab/apputils';

const plugin = {
  id: 'quiet-notebook:hello',
  autoStart: true,
  optional: [ICommandPalette],
  activate: (app, palette) => {
    app.commands.addCommand('quiet-notebook:hello', {
      label: 'Say Hello',
      execute: () => console.log('hello')
    });
    if (palette) {
      palette.addItem({ command: 'quiet-notebook:hello', category: 'Quiet Notebook' });
    }
  }
};

export default plugin;
```

Add the file to the imports and to the `extensions` array of
`src/index.js`. Add each package that you import to `dependencies`
(`npm install @jupyterlab/statusbar@<version of the release>`).

The code patterns of `patterns.md` and `replace-core.md` (skill
`jupyterlab-extensions`) apply: replace `lab['<package>']` with an `import`.
To replace a core plugin, leave its ID out (`DISABLED`) and register yours.
A menu, toolbar button or shortcut for your command: add it in code
(`IMainMenu`, `app.commands.addKeyBinding`), or in the settings override of
the plugin that owns the list (skill `jupyterlab-settings`).

## Settings, style, themes

- **Default settings**: `<module>/settings/overrides.json`, with the same
  format as the default overrides of JupyterLab
  (`{"<plugin id>": {"<key>": <value>}}`). Menus, toolbars, shortcuts and the
  layout go here. The cookbook of the skill `jupyterlab-settings` applies to
  the plugins that are in the bundle.
- **CSS**: `style/app.css`. It loads after the CSS of the core packages.
  Use the theme variables.
- **Themes**: a theme package in the bundle (`theme-light-extension`,
  `theme-dark-extension`) is available by name. For a look of your own, the
  simplest way is CSS in `style/app.css` on top of a built-in theme. A
  separate selectable theme needs the option `--federated` and a theme
  extension (skill `jupyterlab-theming`).
- **Name and URL**: the attributes of the server class, see
  [references/server.md](references/server.md).

## Prebuilt extensions in a remix (`--federated`)

With `--federated`, the kind `lab` shares its core packages and loads the
extensions of `share/jupyter/labextensions`, as JupyterLab does. The no-build
extensions and themes of the other skills then work in the remix, and so do
extensions from PyPI.

- An extension can only use core packages that are in the bundle. One that
  imports a missing package (`@jupyterlab/terminal`, `@jupyterlab/settingeditor`)
  fails to load: add that package to `dependencies`.
- `disabledExtensions` of the page config applies, as in JupyterLab.
- The bundle is larger (about 18 MB in place of 8 MB), because shared
  packages cannot be reduced to the parts in use.
- The server loads the other server extensions of the environment.

Without the option, the server ignores the labextensions folders.

## Kind `shell`: your own layout

```bash
python scripts/jlab_remix.py new solo-notebook --kind shell --app-name "Solo Notebook" --python <env>/bin/python
```

The template is a single-document notebook application: a top bar with a
brand and two buttons, and one notebook that fills the page. The URL
`/<name>/notebooks/<path>` opens a notebook; `/<name>` shows a start page
with the notebooks of the folder.

What differs from the kind `lab`:

- `src/shell.js` is the shell and `src/app.js` the application class. Change
  the areas and the layout there.
- Core plugins are selected **by name** with `pick()` in `src/index.js`,
  because many core plugins work only in the JupyterLab shell. Start from the
  set of the template and add one plugin at a time.
- Your plugins provide what the kept core plugins require (the template has
  `paths`), and the function of the application (`opener`, `top`).
- The build order and the wheel are the same. `uv build --wheel` also runs
  the frontend build when `static/` is absent.

Read [references/shell.md](references/shell.md) before you change the shell
or the plugin set: it has the members that the shell must implement, the
plugins that work outside JupyterLab, and the errors to expect.

Verify a notebook URL with `--url`:

```bash
node <verify>/jlab_probe.cjs --url "http://127.0.0.1:<port>/solo-notebook/notebooks/demo.ipynb?token=<token>" --pause 3000 --exec notebook:run-all-cells --pause 4000 --expect-eval "document.querySelector('.jp-OutputArea-output') !== null" --fail-on-console-error
```

`jlab_server.py url --name <name>` prints the base URL with the token.

## Kind `widget`: components in a page

```bash
python scripts/jlab_remix.py new embed-page --kind widget --python <env>/bin/python
```

The template is one page with one notebook, as `examples/notebook` of the
JupyterLab repository: no application object, no plugins, no settings
system. `src/index.js` constructs each part by hand: the service manager,
the command registry and its key bindings, the editor and language
registries, the rendermime registry, the document registry and manager, the
notebook factories, the toolbar, the completer. `src/commands.js` has the
commands and shortcuts.

- It is not a Python package. `main.py` is a small Jupyter Server
  application (`ExtensionApp`) that serves the page: `python main.py` in the
  folder of the notebooks. It needs `jupyter_server` and `ipykernel`.
- Use this kind to put a component in a page of your own, or to learn how
  the parts connect. For an application, the kinds `lab` and `shell` are
  less code, because plugins do the wiring.
- Verify with the probe in page mode, `--no-app`: the checks on the page
  (`--expect-selector`, `--expect-eval`, `--expect-title`), the actions
  `--click`, `--press`, `--type`, and `--fail-on-console-error` work;
  `--exec` and the plugin checks do not.

  ```bash
  python <verify>/jlab_server.py start --name embed --cmd "<env>/bin/python $PWD/main.py" --path embed-page --root-dir $PWD
  ```

  ```bash
  node <verify>/jlab_probe.cjs --server embed --no-app --pause 3000 --expect-selector '.jp-Notebook .jp-Cell' --click '.jp-Notebook .jp-CodeCell .cm-content' --press Shift+Enter --pause 4000 --expect-eval "document.querySelector('.jp-OutputArea-output') !== null" --fail-on-console-error --screenshot page.png
  ```

## Upgrade to another JupyterLab release

```bash
python scripts/jlab_remix.py pin <project> --python <env with the new JupyterLab>/bin/python
```

Then remove `node_modules` and `package-lock.json`, install, build, and run
the full probe. Plugin IDs and required services change between minor
releases: read the console errors as in "Choose the core packages". The
planner data is from one release (it prints which); for another release, the
errors of the probe are the reference.

## Problems

| Symptom | Cause |
| --- | --- |
| The page is blank, the console says `Failed to load resource` for `bundle.js` | The frontend was not built before the wheel, or `static_dir` is wrong. `check` tells |
| `uv build` fails with `Forced include not found` | Run `npm run build:prod` first: the wheel needs `static/`, `schemas/`, `themes/` |
| Settings of a plugin are missing, `404` for a schema | The package is imported but is not in `jupyterlab.extensions` |
| An old bundle shows after a rebuild | The server keeps the hash of `bundle.js`: restart it |
| Two warnings about Yjs when a notebook opens | `yjs` is newer than the JupyterLab release expects: keep the `overrides` entry of `package.json` |
| `window.jupyterapp is missing` in the probe | Start the server with `--app-class <Class>` and `--path <url path>` |
| The probe reports a 404 for `/lab/api/settings` | An old copy of the probe: the current one reads the settings URL from the page config |
| A prebuilt extension does not load in a `--federated` remix | It needs a core package that is not in the bundle |
| Kind `shell`: `did not find a LabShell instance` or `must be activated in JupyterLab` | A core plugin that works only in the JupyterLab shell: remove its name from `pick()` |
| Kind `shell`: text typed in a cell is lost when the cell runs | The plugin `codemirror-extension:binding` is not in the set |

## References

- [references/server.md](references/server.md): the server class, page
  config, static files, URLs.
- [references/shell.md](references/shell.md): the kind `shell`: what a shell
  must implement, which core plugins work outside JupyterLab, known errors.
- Upstream examples: https://github.com/jupyterlab/jupyterlab/tree/main/examples
  (`app`, `federated`, `notebook`, `filebrowser`, `console`, `terminal`).
- A full application with its own shell: https://github.com/jupyter/notebook
