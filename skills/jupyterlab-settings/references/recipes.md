# Cookbook

Snippets for common requests. Each block is the content of a file in
`labconfig/page_config.d/` (**page config**) or
`labconfig/default_setting_overrides.d/` (**overrides**). Merge the blocks
that you need into one file per folder, or apply them with
`jlab_config.py apply`.

All IDs and keys are from JupyterLab 4.6. Check them on other versions with
`jlab_inspect.py schema <plugin>`.

## Contents

- [Quiet startup](#quiet-startup)
- [Remove features](#remove-features)
- [Minimal interface](#minimal-interface)
- [Layout](#layout)
- [Theme](#theme)
- [Notebook and editor defaults](#notebook-and-editor-defaults)
- [File browser](#file-browser)
- [Documents and autosave](#documents-and-autosave)
- [Terminal](#terminal)
- [Menus](#menus)
- [Toolbars](#toolbars)
- [Context menu](#context-menu)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Lock down](#lock-down)
- [Language](#language)

## Quiet startup

No news prompt, no update check, no announcements.

Overrides:

```json
{
  "@jupyterlab/apputils-extension:notification": {
    "fetchNews": "false",
    "checkForUpdates": false
  }
}
```

`fetchNews` is a string: `"true"`, `"false"` or `"none"` (ask the user). Or
remove the feature with page config:

```json
{
  "disabledExtensions": {
    "@jupyterlab/apputils-extension:announcements": true
  }
}
```

No toast notifications at all: `"doNotDisturbMode": true` in the same plugin.

## Remove features

Page config. Each row is independent. `jlab_config.py disable <entry>` adds
the plugins of the last column for you: they require the disabled plugin and
log an error in the browser console when they stay enabled. When you write
the file by hand, add them yourself.

| Entry | Removes | Disable also |
| --- | --- | --- |
| `@jupyterlab/extensionmanager-extension` | Extension Manager tab | |
| `@jupyterlab/debugger-extension` | Debugger: sidebar, toolbar button, commands | |
| `@jupyterlab/application-extension:property-inspector` | Property Inspector tab (right) | |
| `@jupyterlab/toc-extension:tracker` | Table of Contents tab | |
| `@jupyterlab/running-extension:sidebar` | Running Terminals and Kernels tab | |
| `@jupyterlab/application-extension:logo` | Jupyter logo, top left | |
| `@jupyterlab/notebook-extension:tools` | Notebook tools in the Property Inspector | `@jupyterlab/metadataform-extension:metadataforms`, `@jupyterlab/notebook-extension:update-raw-mimetype` |
| `@jupyterlab/celltags-extension:plugin` | Cell tags editor | |
| `@jupyterlab/help-extension:jupyter-forum` | Help → Jupyter Forum | |
| `@jupyterlab/hub-extension` | JupyterHub menu entries | |
| `@jupyterlab/terminal-extension` | Terminals: launcher card, menu entries | |
| `@jupyterlab/console-extension` | Code consoles | `@jupyterlab/debugger-extension`, `@jupyterlab/inspector-extension:consoles`, `@jupyterlab/tooltip-extension:consoles` |
| `@jupyterlab/workspaces-extension` | Workspace menu, sidebar and indicator | |
| `@jupyterlab/pluginmanager-extension:plugin` | Plugin Manager (Settings → Advanced Plugin Manager) | |
| `@jupyterlab/settingeditor-extension` | Settings Editor | |
| `@jupyterlab/lsp-extension` | Built-in language server client | `@jupyterlab/fileeditor-extension:language-server`, `@jupyterlab/notebook-extension:language-server` |
| `@jupyterlab/launcher-extension` | Launcher | |
| `@jupyterlab/statusbar-extension:plugin` | Status bar | `@jupyterlab/apputils-extension:kernel-status`, `@jupyterlab/apputils-extension:running-sessions-status`, `@jupyterlab/console-extension:kernel-status`, `@jupyterlab/notebook-extension:kernel-status` |

Example: no extension manager, no debugger, no running tab, no notebook
tools.

```json
{
  "disabledExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/debugger-extension": true,
    "@jupyterlab/running-extension:sidebar": true,
    "@jupyterlab/notebook-extension:tools": true,
    "@jupyterlab/metadataform-extension:metadataforms": true,
    "@jupyterlab/notebook-extension:update-raw-mimetype": true
  }
}
```

Without the launcher, the command `launcher:create` does not exist: the "+"
buttons do nothing and an empty main area stays empty. Replace the launcher
with an extension (skill `jupyterlab-extensions`) or accept the empty area.

Features with a setting. Prefer these: the plugin stays loaded, nothing else
breaks. Overrides:

```json
{
  "@jupyterlab/statusbar-extension:plugin": { "visible": false },
  "@jupyterlab/extensionmanager-extension:plugin": { "enabled": false },
  "@jupyterlab/cell-toolbar-extension:plugin": { "showToolbar": false }
}
```

## Minimal interface

A notebook-first application without the surrounding chrome.

Page config:

```json
{
  "disabledExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/debugger-extension": true,
    "@jupyterlab/application-extension:property-inspector": true,
    "@jupyterlab/apputils-extension:announcements": true,
    "@jupyterlab/running-extension:sidebar": true,
    "@jupyterlab/application-extension:logo": true
  }
}
```

Overrides:

```json
{
  "@jupyterlab/statusbar-extension:plugin": { "visible": false },
  "@jupyterlab/application-extension:shell": { "dockPanelPadding": false },
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      { "id": "jp-mainmenu-tabs", "disabled": true },
      { "id": "jp-mainmenu-kernel", "disabled": true }
    ]
  }
}
```

## Layout

Overrides, plugin `@jupyterlab/application-extension:shell`.

File browser on the right, table of contents on the left, terminals at the
bottom:

```json
{
  "@jupyterlab/application-extension:shell": {
    "layout": {
      "multiple": {
        "filebrowser": { "area": "right" },
        "table-of-contents": { "area": "left" },
        "Terminal": { "area": "down" }
      }
    }
  }
}
```

Sidebar tabs as a horizontal bar above each side area:

```json
{ "@jupyterlab/application-extension:shell": { "activityBarPosition": "top" } }
```

Start in simple mode (one document at a time, no tabs):

```json
{ "@jupyterlab/application-extension:shell": { "startMode": "single" } }
```

No padding around the main area:

```json
{ "@jupyterlab/application-extension:shell": { "dockPanelPadding": false } }
```

Order of the sidebar tabs: `options.rank`, lowest first.

```json
{
  "@jupyterlab/application-extension:shell": {
    "layout": {
      "multiple": {
        "table-of-contents": { "options": { "rank": 1 } },
        "filebrowser": { "options": { "rank": 2 } }
      }
    }
  }
}
```

Command palette as a sidebar panel, not a modal:

```json
{ "@jupyterlab/apputils-extension:palette": { "modal": false } }
```

## Theme

Overrides, plugin `@jupyterlab/apputils-extension:themes`.

```json
{
  "@jupyterlab/apputils-extension:themes": {
    "theme": "JupyterLab Dark",
    "theme-scrollbars": true
  }
}
```

Built-in names: `JupyterLab Light`, `JupyterLab Dark`,
`JupyterLab Dark High Contrast`. A theme extension adds its own name.

Follow the light or dark preference of the operating system:

```json
{
  "@jupyterlab/apputils-extension:themes": {
    "adaptive-theme": true,
    "preferred-light-theme": "JupyterLab Light",
    "preferred-dark-theme": "JupyterLab Dark"
  }
}
```

Font sizes and families without a new theme. JupyterLab reads the key
`overrides` of this plugin from the **user settings only**: a default override
has no effect. Write it as a user setting (for one user), or use a theme or a
stylesheet (skill `jupyterlab-theming`) to ship fonts as a default.

```bash
<env>/bin/python scripts/jlab_config.py user-set @jupyterlab/apputils-extension:themes overrides '{"code-font-size": "14px", "ui-font-size1": "14px"}'
```

Keys of `overrides`: `code-font-family`, `code-font-size`,
`content-font-family`, `content-font-size1`, `ui-font-family`,
`ui-font-size1`. Values are CSS strings.

## Notebook and editor defaults

Overrides.

```json
{
  "@jupyterlab/notebook-extension:tracker": {
    "codeCellConfig": { "lineNumbers": true, "lineWrap": true },
    "markdownCellConfig": { "lineNumbers": false },
    "recordTiming": true,
    "autoStartDefaultKernel": true,
    "kernelShutdown": true,
    "scrollPastEnd": false
  },
  "@jupyterlab/fileeditor-extension:plugin": {
    "editorConfig": { "lineNumbers": true, "lineWrap": true, "rulers": [88] }
  },
  "@jupyterlab/codemirror-extension:plugin": {
    "defaultConfig": {
      "autoClosingBrackets": true,
      "highlightActiveLine": true,
      "highlightTrailingWhitespace": true,
      "codeFolding": true,
      "tabSize": 4
    }
  },
  "@jupyterlab/completer-extension:manager": {
    "autoCompletion": true,
    "showDocumentationPanel": true
  },
  "@jupyterlab/apputils-extension:sessionDialogs": {
    "skipKernelRestartDialog": true
  },
  "@jupyterlab/cell-toolbar-extension:plugin": {
    "askCellDeleteConfirmation": false
  }
}
```

`defaultConfig` of the CodeMirror plugin applies to all editors. The `…Config`
keys of the notebook and the file editor apply to one kind of editor and win.
Each of them (`codeCellConfig`, `markdownCellConfig`, `rawCellConfig`,
`editorConfig`, `promptCellConfig`) accepts every key of `defaultConfig`,
also the keys that its own default does not list: `lineWrap`, `lineNumbers`,
`tabSize`, `rulers`, `autoClosingBrackets`… List the keys with
`jlab_inspect.py schema @jupyterlab/codemirror-extension:plugin`.

`defaultCell: "markdown"` makes new cells Markdown cells. The first cell of a
new notebook stays a code cell.

Do not start a kernel when a notebook opens (page config):

```json
{ "notebookStartsKernel": false }
```

## File browser

Overrides.

```json
{
  "@jupyterlab/filebrowser-extension:browser": {
    "showHiddenFiles": false,
    "singleClickNavigation": true,
    "sortNotebooksFirst": true,
    "showFileSizeColumn": true,
    "showLastModifiedColumn": true,
    "showFileCheckboxes": false,
    "navigateToCurrentDirectory": true,
    "useFuzzyFilter": true
  }
}
```

`showHiddenFiles` also needs the server option
`ContentsManager.allow_hidden = True`.

## Documents and autosave

Overrides.

```json
{
  "@jupyterlab/docmanager-extension:plugin": {
    "autosave": true,
    "autosaveInterval": 30,
    "confirmClosingDocument": false,
    "renameUntitledFileOnSave": false,
    "defaultViewers": { "markdown": "Markdown Preview", "json": "Editor" }
  }
}
```

`defaultViewers` maps a file type to a widget factory: `Editor`,
`Markdown Preview`, `Notebook`, `JSON`, `CSVTable`, `Image`, `HTML Viewer`.

## Terminal

Overrides.

```json
{
  "@jupyterlab/terminal-extension:plugin": {
    "fontFamily": "'JetBrains Mono', monospace",
    "fontSize": 14,
    "theme": "dark",
    "cursorBlink": false,
    "shutdownOnClose": true
  }
}
```

`theme`: `inherit`, `light` or `dark`. Remove terminals completely with the
page config key `"terminalsAvailable": false`, or disable
`@jupyterlab/terminal-extension`.

## Menus

Overrides, plugin `@jupyterlab/mainmenu-extension:plugin`.

Remove whole menus:

```json
{
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      { "id": "jp-mainmenu-run", "disabled": true },
      { "id": "jp-mainmenu-kernel", "disabled": true },
      { "id": "jp-mainmenu-tabs", "disabled": true }
    ]
  }
}
```

Remove one entry, add one entry, reorder a menu:

```json
{
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      {
        "id": "jp-mainmenu-file",
        "items": [
          { "command": "filebrowser:open-path", "disabled": true },
          { "command": "notebook:create-new", "rank": 0.5 }
        ]
      },
      { "id": "jp-mainmenu-help", "rank": 2 }
    ]
  }
}
```

A new menu with a submenu:

```json
{
  "@jupyterlab/mainmenu-extension:plugin": {
    "menus": [
      {
        "id": "my-menu",
        "label": "Studio",
        "rank": 50,
        "items": [
          { "command": "notebook:create-new", "rank": 1 },
          { "type": "separator", "rank": 2 },
          {
            "type": "submenu",
            "rank": 3,
            "submenu": {
              "id": "my-menu-theme",
              "label": "Theme",
              "items": [
                { "command": "apputils:change-theme", "args": { "theme": "JupyterLab Light" } },
                { "command": "apputils:change-theme", "args": { "theme": "JupyterLab Dark" } }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

Ranks of the built-in menus: File 1, Edit 2, View 3, Run 4, Kernel 5,
Tabs 500, Settings 999, Help 1000. To remove the whole menu bar, disable
`@jupyterlab/mainmenu-extension:plugin` only after you check its dependents:
many plugins use it as an option, none requires it.

## Toolbars

Notebook toolbar, plugin `@jupyterlab/notebook-extension:panel`:

```json
{
  "@jupyterlab/notebook-extension:panel": {
    "toolbar": [
      { "name": "cut", "disabled": true },
      { "name": "copy", "disabled": true },
      { "name": "paste", "disabled": true },
      { "name": "restart-and-run", "disabled": true },
      { "name": "run-all", "command": "notebook:run-all-cells", "rank": 11 },
      { "name": "clear-all", "command": "notebook:clear-all-cell-outputs", "rank": 12 }
    ]
  }
}
```

Built-in item names of the notebook toolbar: `save`, `insert`, `cut`, `copy`,
`paste`, `run`, `interrupt`, `restart`, `restart-and-run`, `cellType`,
`spacer`, `kernelName`, `executionProgress`. More toolbars and names are in
`ui-identifiers.md`.

A toolbar item can set `label`, `icon` (name of a registered icon, for
example `ui-components:run`), `caption` and `args`.

Buttons in the top bar, right of the menus, plugin
`@jupyterlab/application-extension:top-bar`:

```json
{
  "@jupyterlab/application-extension:top-bar": {
    "toolbar": [
      { "name": "new-notebook", "command": "notebook:create-new", "label": "New notebook", "rank": 10 }
    ]
  }
}
```

Cell toolbar (inside the active cell), plugin
`@jupyterlab/cell-toolbar-extension:plugin`, same format.

File browser toolbar, plugin `@jupyterlab/filebrowser-extension:widget`: item
names `new-launcher`, `new-directory`, `uploader`, `refresh`,
`toggle-file-filter`.

## Context menu

Overrides, plugin `@jupyterlab/application-extension:context-menu`.

```json
{
  "@jupyterlab/application-extension:context-menu": {
    "contextMenu": [
      {
        "command": "notebook:create-new",
        "selector": ".jp-DirListing-content",
        "rank": 1
      },
      {
        "command": "filebrowser:open-browser-tab",
        "selector": ".jp-DirListing-item[data-isdir=\"false\"]",
        "disabled": true
      }
    ]
  }
}
```

To disable a built-in item, the `command`, `selector` and `args` must be the
same as in the built-in definition (`ui-identifiers.md`). Turn the custom
context menu off, so that the browser menu shows:

```json
{ "@jupyterlab/application-extension:context-menu": { "disabled": true } }
```

## Keyboard shortcuts

Overrides, plugin `@jupyterlab/shortcuts-extension:shortcuts`.

```json
{
  "@jupyterlab/shortcuts-extension:shortcuts": {
    "shortcuts": [
      {
        "command": "apputils:activate-command-palette",
        "keys": ["Accel Shift C"],
        "selector": "body",
        "disabled": true
      },
      {
        "command": "apputils:activate-command-palette",
        "keys": ["Accel K"],
        "selector": "body"
      },
      {
        "command": "notebook:run-all-cells",
        "keys": ["Accel Shift Enter"],
        "selector": ".jp-Notebook"
      }
    ]
  }
}
```

- To move a shortcut: one entry that disables the old keys, one entry with
  the new keys.
- `keys` is a list: more than one string makes a chord (`["Ctrl K", "Ctrl S"]`).
- `selector` is a CSS selector of the element that must hold the focus. Use
  `body` for a global shortcut. Common ones: `.jp-Notebook`,
  `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus`,
  `.jp-Notebook.jp-mod-editMode`, `.jp-FileEditor`, `.jp-CodeConsole`.
- The default list is in `default-shortcuts.md`.

Take a key that another command uses. JupyterLab identifies a shortcut by
keys and selector, so the disabled entry would also remove a new shortcut
with the same selector. Give the new one a selector with a different text
that matches the same elements (`html body` for `body`):

```json
{
  "@jupyterlab/shortcuts-extension:shortcuts": {
    "shortcuts": [
      {
        "command": "apputils:print",
        "keys": ["Accel P"],
        "selector": "body",
        "disabled": true
      },
      {
        "command": "apputils:activate-command-palette",
        "keys": ["Accel P"],
        "selector": "html body"
      }
    ]
  }
}
```

Without the disabled entry, JupyterLab keeps only one of the two commands
(the one that sorts first by name) and logs a warning.

## Lock down

Page config. The user cannot re-enable locked plugins:

```json
{
  "disabledExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/pluginmanager-extension:plugin": true
  },
  "lockedExtensions": {
    "@jupyterlab/extensionmanager-extension": true,
    "@jupyterlab/pluginmanager-extension:plugin": true
  },
  "quitButton": false
}
```

Hide a plugin from the Settings Editor form (it stays in the JSON editor):

```json
{
  "@jupyterlab/settingeditor-extension:form-ui": {
    "toSkip": ["@jupyterlab/apputils-extension:themes"]
  }
}
```

Settings are not a security boundary: a user with a terminal or a kernel can
change the files.

## Language

Overrides. Needs the language pack, for example
`pip install jupyterlab-language-pack-fr-FR`.

```json
{ "@jupyterlab/translation-extension:plugin": { "locale": "fr_FR" } }
```
