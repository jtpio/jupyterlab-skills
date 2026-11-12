---
name: jupyterlab-customize
description: Start here for any request to change how JupyterLab looks or behaves. Covers disabling or hiding an extension or a part of the UI, changing a default (theme, layout, editor, notebook, file browser), editing menus, toolbars, context menus and keyboard shortcuts, adding a button, panel, command or home page, restyling or rebranding the application, and packaging the result as an installable JupyterLab distribution. Chooses the right mechanism (page config, setting overrides, user settings, server config, CSS or theme, new extension, Python package) and hands over to the companion skills jupyterlab-inspect, jupyterlab-settings, jupyterlab-extensions, jupyterlab-theming, jupyterlab-distribution, jupyterlab-remix and jupyterlab-verify. Use it also when the user does not say "JupyterLab" but works in a Jupyter notebook environment.
compatibility: JupyterLab 4.x (tested with 4.6). Needs Python and the environment that has JupyterLab. Node.js with Playwright is necessary only for the browser checks.
---

# Customize JupyterLab

JupyterLab is a set of plugins. Each visible feature (status bar, launcher,
file browser, a menu, a toolbar button) comes from a plugin with an ID such as
`@jupyterlab/statusbar-extension:plugin`. To customize JupyterLab is to do one
or more of these five things:

| Lever | What it does | Where it lives | Skill |
| --- | --- | --- | --- |
| **Disable plugins** | Removes a feature | `labconfig/page_config.d/*.json` | `jupyterlab-settings` |
| **Change defaults** | New default for a setting: theme, layout, menus, toolbars, shortcuts, editor | `labconfig/default_setting_overrides.d/*.json` | `jupyterlab-settings` |
| **Style** | Colors, fonts, spacing, hidden elements | theme extension or stylesheet | `jupyterlab-theming` |
| **Add behavior** | New command, button, panel, home page, replacement of a core plugin | extension in `share/jupyter/labextensions/` | `jupyterlab-extensions` |
| **Package** | One `pip install` that brings all of the above | Python project with a wheel | `jupyterlab-distribution` |

A sixth way is not a customization: a **remix** is a new application built
from the JupyterLab npm packages, with its own bundle and shell (skill
`jupyterlab-remix`). Use it only when the five levers cannot give the result:
a different layout, or only a part of the core in the bundle.

Two more skills support the work: `jupyterlab-inspect` finds the IDs and the
folders, `jupyterlab-verify` proves in a real browser that the change works.

## Where the facts come from

These skills hold the procedure, the traps, tested snippets and the scripts.
They do not copy what has a better source:

| Need | Source |
| --- | --- |
| The ID of a plugin, setting, menu, toolbar item, shortcut, CSS variable | The installation: `jlab_inspect.py` (skill `jupyterlab-inspect`) |
| The commands, service tokens and widgets of the running application | The browser probe: `jlab_probe.cjs --list …` (skill `jupyterlab-verify`) |
| The meaning and the format of a JupyterLab feature | The JupyterLab documentation: each skill links to the page |

IDs change between versions and with the installed extensions. Do not write
one from memory. The snippets of the skills carry IDs of JupyterLab 4.6:
check each one with the commands before you use a snippet on another
version. `jlab_config.py` refuses a plugin ID or a setting key that the
installation does not have; it does not check the command, menu and item
names inside a list value.

## Step 1: choose the delivery mode

| The user wants | Mode | Write to |
| --- | --- | --- |
| "Change my JupyterLab", in a project environment | **Environment** | `<env>/etc/jupyter/` and `<env>/share/jupyter/labextensions/` |
| The change for every environment of the user | **User** | the user config folder (`~/.jupyter/` by default) |
| "Make an app", "something I can install or share", many changes | **Distribution** | a Python project, then a wheel |

Default to **Environment** when a virtual environment or conda environment is
active. Say where you wrote, and that a rebuild of the environment removes the
changes. Ask only when the request does not tell which mode fits.

The modes connect: customize an environment first, then freeze it into a
distribution with `jlab_dist.py collect` (see `jupyterlab-distribution`).

## Step 2: follow the loop

1. **Inspect.** Find the config folders, the plugin ID, the setting key or
   the widget ID. Do not guess IDs: a wrong ID fails silently.
   → `jupyterlab-inspect`
2. **Pick the weakest lever that does the job** (table below).
3. **Apply** with the script of the matching skill. The scripts check IDs and
   values against the installation.
4. **Verify** in a browser: plugin gone, setting applied, no console errors.
   → `jupyterlab-verify`
5. **Report**: what changed, in which files, how to undo it, and that the
   server must restart.

## Step 3: map the request to a lever

| Request | Lever | Notes |
| --- | --- | --- |
| "Disable / remove the extension manager, debugger, announcements…" | Disable plugins | Check what depends on the plugin first |
| "Hide the status bar / the logo / a sidebar tab" | A setting when one exists, else disable the plugin | `visible: false` is cleaner than a disabled status bar |
| "Dark theme by default", "line numbers on", "autosave every 30 s" | Change defaults | Key and type come from the schema |
| "Move the file browser to the right", "tabs on top" | Change defaults (`layout`, `activityBarPosition`) | |
| "Remove the Run menu", "add an entry to File", "remove a toolbar button", "change a shortcut" | Change defaults (`menus`, `toolbar`, `contextMenu`, `shortcuts`) | These lists merge with the built-in items |
| "Make this the default for me only" | User settings | Highest priority, one user |
| "Different colors / fonts", "compact", "rounded tabs" | Style | A theme for a full look, a stylesheet for small changes |
| "Add a button / panel / command / status item / launcher card" | Add behavior | No build step in most cases |
| "Replace the launcher / splash screen / logo / About dialog" | Add behavior + disable the core plugin | The extension declares what it replaces |
| "Rename the app", "own favicon" | Page config `appName` + small extension | |
| "Install extension X by default" | Package dependency | Or `pip install` in the environment |
| "Give me something to install" | Package | |
| "A single-document notebook app", "my own shell", "embed a notebook in my page", "only these core plugins in the bundle" | Remix (`jupyterlab-remix`) | Needs Node.js and a build |

Order of preference: **setting → disabled plugin → stylesheet → extension**.
A setting stays visible in the Settings Editor and the user can change it
back. A disabled plugin is gone for everyone. An extension is code to maintain.

## Rules

1. **Never edit files that a package installed**: nothing in `site-packages`,
   no existing file in `share/jupyter/lab/` or in an installed labextension.
   Add your own files next to them. A reinstall keeps your files and replaces
   theirs.
2. **One snippet file per concern**, with a clear name (`50-custom.json`,
   `my-lab.json`). JupyterLab merges all `*.json` files of a `.d` folder.
3. **Valid JSON only.** No comments, no trailing commas.
4. **Restart the server** after a change in default overrides or server
   config: it reads them only when it starts. Page config, a new extension,
   and the JavaScript or CSS of an extension need only a browser reload. A
   restart is never wrong.
5. **User settings win.** A value that the user saved in the Settings Editor
   hides your new default. Verify with a clean profile (`jupyterlab-verify`
   does this), and tell the user when a personal setting hides the change.
6. **Check what a disabled plugin breaks.** A plugin that provides a service
   takes its dependents down with it. The probe of `jupyterlab-verify` lists
   them (`--dependents`).
7. **Do not publish** a package to PyPI or push to a remote unless the user
   asks.

## Reshape JupyterLab into a different application

For a request such as "turn JupyterLab into a focused app for X", combine the
levers in this order. Each step has its skill.

1. Create a distribution project: `jlab_dist.py new` (`jupyterlab-distribution`).
2. Remove what the app does not need: disabled plugins, trimmed menus and
   toolbars, new layout (`jupyterlab-settings`, with `--config-dir` set to the
   `jupyter-config` folder of the project).
3. Give it a look: a theme extension, set as the default theme
   (`jupyterlab-theming`).
4. Give it its own surface: a home page in place of the launcher, a brand in
   the top bar, custom commands and panels (`jupyterlab-extensions`).
5. Name it: `appName`, favicon, About dialog, launch command.
6. Build the wheel, install it in a clean environment, verify with the probe,
   take screenshots (`jupyterlab-verify`).

## Requests that these skills do not cover

- Changes to kernels, to the Jupyter Server API, or to JupyterHub: these are
  server topics. Only the server options that affect the UI are covered.
- A rebuild of the installed JupyterLab application (`jupyter lab build`
  with source extensions). The skills use prebuilt extensions, which need no
  rebuild, or a separate application (skill `jupyterlab-remix`).
- Jupyter Notebook 7 and JupyterLite share most mechanisms, but paths and
  some plugin IDs differ. Check with the inspect tools before you rely on a
  recipe.

## Upstream documentation

- Interface customization: https://jupyterlab.readthedocs.io/en/stable/user/interface_customization.html
- Directories and config files: https://jupyterlab.readthedocs.io/en/stable/user/directories.html
- Extensions for users: https://jupyterlab.readthedocs.io/en/stable/user/extensions.html
- Extension developer guide: https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html
- Common extension points: https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html
- An example of a full distribution: https://github.com/jtpio/xtralab
