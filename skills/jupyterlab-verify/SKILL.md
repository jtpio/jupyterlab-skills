---
name: jupyterlab-verify
description: Prove in a real browser that a JupyterLab customization works. Starts a throwaway JupyterLab server with a clean user profile, opens it in headless Chromium, and reports what loaded - plugins, commands, sidebar widgets, menus, theme, console errors - with pass/fail checks and screenshots. Use it after every change to JupyterLab configuration, extensions, themes or a distribution; to list the exact plugin, command and widget IDs of a running application; to find which plugins break when one is disabled; and to take before/after screenshots for the user. Use it also when the user asks "does it work?", "show me", "take a screenshot of JupyterLab", or when an extension does not load.
compatibility: Python 3.9+ for the server script. Node.js with Playwright and Chromium for the probe. JupyterLab 4.x.
---

# Verify JupyterLab in a browser

Config files and extensions fail silently: a wrong ID is ignored, a broken
extension only logs to the browser console. The only proof is the running
application. Two scripts give that proof without a person at the screen:

- `scripts/jlab_server.py`: start and stop a detached JupyterLab server.
- `scripts/jlab_probe.cjs`: open it in headless Chromium, inspect, check,
  take a screenshot.

## Quick start

```bash
python scripts/jlab_server.py start --python <env>/bin/python --root-dir /tmp/lab-demo
```

```bash
node scripts/jlab_probe.cjs --screenshot /tmp/lab.png --fail-on-console-error
```

```bash
python scripts/jlab_server.py stop
```

`start` prints JSON with the `url` of the server (it includes the token). The
probe finds the server by its name: `--server <name>`, default `default`.
For a server that the script did not start, pass `--url "<url with token>"`.

The probe prints a summary: title, application name and version, theme,
mode, number of plugins and commands, extensions, disabled plugins, menus,
widget IDs of each shell area, console errors, failed checks. The exit code
is 1 when a check fails.

Read the screenshot yourself after each visual change. Numbers do not show a
broken layout.

## The server script

```bash
python scripts/jlab_server.py start [--name NAME] [--python PY | --cmd CMD] [--app-class CLASS] [--path URLPATH] [--project DIR] [--root-dir DIR] [--port N] [--env KEY=VALUE] [-- extra server args]
```

- `--python`: Python of the environment under test. The server runs
  `python -m jupyterlab`.
- `--cmd`: a command to run instead, for example the launch command of a
  distribution: `--cmd /tmp/test-env/bin/my-lab`.
- `--app-class` and `--path`: for a remix (skill `jupyterlab-remix`), an
  application with its own server class and URL. `--app-class MyApp` sets the
  `expose_app_in_browser` option and the clean profile on that class.
  `--path my-app` is the URL path of the application (default `lab`). Use
  both together with `--cmd`.
- `--project`: a distribution project (skill `jupyterlab-distribution`) to
  load without an install. The server reads `DIR/jupyter-config` and
  `DIR/labextensions` in front of the folders of the environment. Use it
  while you develop; the final test is the wheel in a clean environment.
- `--root-dir`: folder that the file browser shows. Use a scratch folder
  with a few sample files, not the project of the user: the probe can create
  notebooks.
- `--name`: label of the server. Use a name of your own (`before`, `after`,
  the project name) when more than one server can run on the machine.
- **Clean profile.** By default the server gets empty user settings and
  workspaces (`JUPYTERLAB_SETTINGS_DIR`, `JUPYTERLAB_WORKSPACES_DIR` in a
  temporary folder). You then see the defaults, not what a person saved.
  `--keep-user-state` uses the real ones.
- It always adds `--LabApp.expose_app_in_browser=True` (the probe needs it),
  a random token, and `--allow-root` when the user is root.
- `restart [--name NAME]`: stop and start again with the same options and
  the same URL, and a new clean profile.
- `url [--name NAME]` prints the URL again. `status` lists the servers.
- `stop [--name NAME]` stops one server. `stop --all` stops the servers that
  were started from the current folder; servers started from other folders
  can belong to other sessions and stay (`--everywhere` stops them too).
- When the server does not start, the script prints the end of its log. The
  path of the log is in the JSON (`log`).
- "A server named … already runs": if it is not yours, do not stop it. Use
  another `--name`.

Restart the server (`restart`) after each change to page config, overrides,
server config, a `package.json` or a schema of an extension, and after you
install or remove an extension. A change in JavaScript or CSS of an installed
extension needs no restart: run the probe again.

The profile lives as long as the server. What a probe run saves as a user
setting stays for the next runs: a theme change
(`apputils:change-theme`), a new start mode. `restart` gives a clean profile
again.

## The probe

```bash
node scripts/jlab_probe.cjs [--server NAME | --url URL] [actions] [checks] [output]
```

Each run starts from a clean workspace: no tab of an earlier run is open.
`--keep-workspace` keeps the tabs. Files that a run creates in the root
folder (`Untitled.ipynb`) stay on disk.

Checks, each can repeat:

| Option | Passes when |
| --- | --- |
| `--expect-plugin <id>` | The plugin is registered |
| `--expect-no-plugin <id>` | The plugin is not registered: it is disabled |
| `--expect-command <id>` / `--expect-no-command <id>` | The command exists / does not exist |
| `--expect-selector <css>` / `--expect-no-selector <css>` | A visible element matches / none does |
| `--expect-title <text>` | The page title contains the text |
| `--expect-theme <name>` | The active theme has this name |
| `--expect-eval '<js>'` | The JavaScript expression is true in the page; `app` is the application |
| `--expect-setting '<plugin>:<key>=<json>'` | The value in effect of a setting matches the JSON. `<key>` can be a path (`codeCellConfig.lineNumbers=true`). An object matches when the setting has at least its keys and values |
| `--fail-on-console-error` | The browser console has no error |

Actions, run in the given order before the checks and the screenshot:

| Option | Does |
| --- | --- |
| `--exec '<command>'` or `--exec '<command>:{"arg": 1}'` | Run an application command |
| `--activate <widget id>` | Show a widget: open its sidebar, or select its tab |
| `--click '<css>'` | Click the first visible element that matches |
| `--press <keys>` | Press a key or a chord: `Control+Shift+P`, `Meta+K`, `Escape`. Proves that a shortcut works |
| `--type '<text>'` | Type into the element that has the focus |
| `--pause <ms>` | Wait between two actions, for example after a notebook opens |
| `--eval '<js>'` | Evaluate JavaScript in the page; `app` is the application. The result prints on stderr as `eval: …` |
| `--wait <ms>` | Wait after all the actions (default 500) |

Output:

| Option | Does |
| --- | --- |
| `--screenshot <file.png>` | Save a screenshot |
| `--scale 2` | Sharp image (device scale factor). Use it for images that a person will see |
| `--viewport 1440x900` | Size of the window |
| `--color-scheme dark` | Browser preference, for adaptive themes |
| `--dump <file.json>` | Save everything: plugins with their tokens, commands with labels, shortcuts, widgets, menus, settings schemas, page config |
| `--full` | Print the full data instead of the summary |
| `--dependents <id>` | Print the plugins that need this plugin or package, then exit |

### Examples

A plugin is gone, a setting applies, nothing broke:

```bash
node scripts/jlab_probe.cjs \
  --expect-no-plugin @jupyterlab/extensionmanager-extension:plugin \
  --expect-setting '@jupyterlab/apputils-extension:themes:theme="JupyterLab Dark"' \
  --expect-theme "JupyterLab Dark" \
  --fail-on-console-error
```

An extension loaded and its panel shows:

```bash
node scripts/jlab_probe.cjs \
  --expect-plugin my-lab-tweaks:plugin \
  --expect-command my-lab-tweaks:open \
  --exec my-lab-tweaks:open \
  --expect-selector '.my-panel' \
  --screenshot /tmp/panel.png --fail-on-console-error
```

A notebook, for a look at a theme or a toolbar:

```bash
node scripts/jlab_probe.cjs \
  --exec 'notebook:create-new:{"kernelName":"python3"}' --wait 2500 \
  --scale 2 --screenshot /tmp/notebook.png
```

What breaks when a plugin is disabled:

```bash
node scripts/jlab_probe.cjs --dependents @jupyterlab/statusbar-extension:plugin
```

`failToActivate` lists the plugins that require the plugin, directly or
through another plugin: disable them too. `loseOptionalFeature` lists the
plugins that keep working without one feature. Run it on a server where the
plugin is still enabled.

Find IDs in a running application (also those of third-party extensions):

```bash
node scripts/jlab_probe.cjs --dump /tmp/lab.json
```

```bash
python -c "import json; d = json.load(open('/tmp/lab.json')); print('\n'.join(c['id'] + '  ' + c['label'] for c in d['commands'] if 'theme' in c['id']))"
```

A shortcut works, and a sidebar panel shows:

```bash
node scripts/jlab_probe.cjs \
  --press Control+K --expect-selector '.jp-ModalCommandPalette' \
  --press Escape \
  --activate my-notes-panel --expect-selector '.my-notes-panel' \
  --screenshot /tmp/panel.png
```

Notes for actions:

- `Accel` of JupyterLab is `Control` on Linux and Windows and `Meta` on
  macOS. The probe runs Chromium on the machine of the server.
- A command that opens a modal (the command palette) needs the focus: the
  modal closes when another widget takes the focus. After
  `notebook:create-new`, add `--pause 1500` before the key press.
- `--expect-selector` counts visible elements only. A sidebar panel is
  hidden until its tab is active (`--activate <widget id>`); a document is
  hidden when another tab is in front.
- `--exec` waits up to 5 s for the command. A command that opens a dialog
  finishes only when the dialog closes: the probe then continues, with the
  dialog open, so a check or a screenshot can see it.
- Click with `--click`, not with `element.click()` in `--eval`. Toolbar
  buttons and the "+" of a tab bar react to pointer events, which a
  synthetic click does not send.
- Prefer `--exec` steps to a long script in `--eval`. Several asynchronous
  steps in one `--eval` can run before JupyterLab is ready for them and log
  errors that a person would never see.

Before and after: start two servers with `--name before` (a stock
environment) and `--name after`, take the same screenshot of both
(`--server before`, `--server after`).

## Read the result

| Result | Meaning | Next step |
| --- | --- | --- |
| `window.jupyterapp is missing` | The page did not load JupyterLab, or the server runs without `expose_app_in_browser` | Start the server with `jlab_server.py`; check the URL and token |
| `expect-plugin` fails for your extension | The extension did not load | See the console errors; `jlab_ext.py check`; is it in `federatedExtensions` of the summary? If not, the server did not find the folder: restart, check `jupyter labextension list` |
| `Failed to create module: package: <name>` in the console | JavaScript error while the extension loads | Syntax, `NAME` mismatch, a package missing in `SHARED` |
| `No provider for: <token>` | A plugin requires a service of a disabled plugin | Disable the dependent too (`--dependents`), or keep the provider, or make the token optional in your plugin |
| `expect-no-plugin` fails | The page config did not apply | `jlab_inspect.py page-config`: wrong folder, invalid JSON, list instead of object, no restart |
| `expect-setting` fails | The override did not apply | `jlab_inspect.py overrides`: wrong plugin ID or key, no restart |
| `expect-theme` fails | The theme name is wrong, or the theme extension did not load | Names are case-sensitive; check `federatedExtensions` |
| `expect-selector` fails but the element exists | The element is hidden: a tab that is not active, a collapsed sidebar | `--exec` the command that shows it (`application:activate-…`, `filebrowser:activate`), or check with `--eval` |
| A 404 in the console | A stylesheet, font or icon path is wrong | Paths are relative to `static/` or to the theme CSS file |
| A console error that you cannot link to your change | It can come from the automation itself, or from stock JupyterLab | Run the same steps on a stock environment (`--name before`). If the error is there too, it is not yours: say so in the report |
| `Skipping … shortcut because it collides` (a warning, in the dump) | Two shortcuts have the same keys and selector | See "Keyboard shortcuts" in the skill `jupyterlab-settings` |
| The screenshot shows a "news" or "update" prompt | Stock behavior | Disable announcements or set `fetchNews` (skill `jupyterlab-settings`) |

Console **warnings** do not fail a run. They are in the dump
(`consoleWarnings`).

## Install Playwright

The probe looks for `playwright`, `playwright-core` or `@playwright/test`.
When none is installed:

```bash
npm install --no-save playwright
```

```bash
npx playwright install chromium
```

Run these in a scratch folder and start the probe from there, or set
`NODE_PATH` to its `node_modules`. In a container, Chromium can need system
libraries: `npx playwright install --with-deps chromium`.

If no browser can run at all, fall back to the static checks of
`jupyterlab-inspect` (`page-config`, `overrides`, `extensions`) and
`jupyter labextension list`, and tell the user that the result was not
verified in a browser.

## Clean up

Stop each server that you started (`stop --name <name>`, or `stop --all`
from the folder where you started them). Remove test notebooks from the root
folder when it was not a scratch folder. The profiles are in the system
temporary folder, below `jlab-verify/`.
