# UI identifiers

From a stock JupyterLab 4.6.6. Extensions add more: use the browser probe of the
`jupyterlab-verify` skill to list the widgets of a running application.

## Shell areas and widget IDs

Use a widget ID as a key of the `layout` setting of
`@jupyterlab/application-extension:shell` to move a widget to another area.

| Area | Widget ID | Label |
| --- | --- | --- |
| top | `jp-MainLogo` |  |
| top | `jp-menu-panel` |  |
| top | `jp-title-panel-title` |  |
| top | `jp-top-bar` |  |
| menu | `jp-MainMenu` |  |
| left | `filebrowser` | File Browser (Ctrl+Shift+F) |
| left | `jp-running-sessions` | Running Terminals and Kernels |
| left | `table-of-contents` | Table of Contents |
| left | `extensionmanager.main-view` | Extension Manager |
| right | `jp-property-inspector` | Property Inspector |
| right | `jp-debugger-sidebar` | Debugger |
| main | `launcher-0` | Launcher |
| bottom | `jp-main-statusbar` |  |

## Main menus

| Menu ID | Label | Rank | Defined in |
| --- | --- | --- | --- |
| `jp-mainmenu-view-appearance` | Appearance (submenu of `jp-mainmenu-view`) | | `@jupyterlab/application-extension:commands` |
| `jp-mainmenu-settings-apputilstheme` | Theme (submenu of `jp-mainmenu-settings`) | | `@jupyterlab/apputils-extension:themes` |
| `jp-mainmenu-codefold` | Code Folding (submenu of `jp-mainmenu-view`) | | `@jupyterlab/codemirror-extension:plugin` |
| `jp-mainmenu-settings-consoleexecute` | Console Run Keystroke (submenu of `jp-mainmenu-settings`) | | `@jupyterlab/console-extension:tracker` |
| `jp-mainmenu-view-codemirror-language` | Text Editor Syntax Highlighting (submenu of `jp-mainmenu-view`) | | `@jupyterlab/fileeditor-extension:plugin` |
| `jp-mainmenu-settings-fileeditorindent` | Text Editor Indentation (submenu of `jp-mainmenu-settings`) | | `@jupyterlab/fileeditor-extension:plugin` |
| `jp-mainmenu-settings-codemirror-theme` | Text Editor Theme (submenu of `jp-mainmenu-settings`) | | `@jupyterlab/fileeditor-extension:plugin` |
| `jp-mainmenu-file` | File | 1 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-file-new` | New (submenu of `jp-mainmenu-file`) | | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-edit` | Edit | 2 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-view` | View | 3 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-run` | Run | 4 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-kernel` | Kernel | 5 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-tabs` | Tabs | 500 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-settings` | Settings | 999 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-help` | Help | 1000 | `@jupyterlab/mainmenu-extension:plugin` |
| `jp-mainmenu-file-notebookexport` | Save and Export Notebook As (submenu of `jp-mainmenu-file`) | | `@jupyterlab/notebook-extension:export` |
| `jp-mainmenu-settings-language` | Language (submenu of `jp-mainmenu-settings`) | | `@jupyterlab/translation-extension:plugin` |
| `jp-mainmenu-file-workspaces` | Workspaces (submenu of `jp-mainmenu-file`) | | `@jupyterlab/workspaces-extension:menu` |

## Main menu items

Rank orders the items of a menu, lowest first. Use it to place a new item,
and copy `command` and `args` to disable an item.

| Menu | Command | Rank | Args |
| --- | --- | --- | --- |
| `jp-mainmenu-codefold` | `codemirror:fold-all` | 5 |  |
| `jp-mainmenu-codefold` | `codemirror:fold-current` | 1 |  |
| `jp-mainmenu-codefold` | `codemirror:fold-subregions` | 3 |  |
| `jp-mainmenu-codefold` | `codemirror:unfold-all` | 6 |  |
| `jp-mainmenu-codefold` | `codemirror:unfold-current` | 2 |  |
| `jp-mainmenu-codefold` | `codemirror:unfold-subregions` | 4 |  |
| `jp-mainmenu-edit` | `documentsearch:highlightNext` | 10 |  |
| `jp-mainmenu-edit` | `documentsearch:highlightPrevious` | 10 |  |
| `jp-mainmenu-edit` | `documentsearch:startWithReplace` | 10 |  |
| `jp-mainmenu-edit` | `documentsearch:start` | 10 |  |
| `jp-mainmenu-edit` | `editmenu:clear-all` | 10 |  |
| `jp-mainmenu-edit` | `editmenu:clear-current` | 10 |  |
| `jp-mainmenu-edit` | `editmenu:go-to-line` | 200 |  |
| `jp-mainmenu-edit` | `editmenu:redo` | 0 |  |
| `jp-mainmenu-edit` | `editmenu:undo` | 0 |  |
| `jp-mainmenu-edit` | `notebook:copy-cell` | 5 |  |
| `jp-mainmenu-edit` | `notebook:cut-cell` | 5 |  |
| `jp-mainmenu-edit` | `notebook:delete-cell` | 6 |  |
| `jp-mainmenu-edit` | `notebook:deselect-all` | 7 |  |
| `jp-mainmenu-edit` | `notebook:merge-cell-above` | 9 |  |
| `jp-mainmenu-edit` | `notebook:merge-cell-below` | 9 |  |
| `jp-mainmenu-edit` | `notebook:merge-cells` | 9 |  |
| `jp-mainmenu-edit` | `notebook:move-cell-down` | 8 |  |
| `jp-mainmenu-edit` | `notebook:move-cell-up` | 8 |  |
| `jp-mainmenu-edit` | `notebook:paste-and-replace-cell` | 5 |  |
| `jp-mainmenu-edit` | `notebook:paste-cell-above` | 5 |  |
| `jp-mainmenu-edit` | `notebook:paste-cell-below` | 5 |  |
| `jp-mainmenu-edit` | `notebook:redo-cell-action` | 4 |  |
| `jp-mainmenu-edit` | `notebook:select-all` | 7 |  |
| `jp-mainmenu-edit` | `notebook:split-cell-at-cursor` | 9 |  |
| `jp-mainmenu-edit` | `notebook:undo-cell-action` | 4 |  |
| `jp-mainmenu-file-new` | `console:create` | 1 |  |
| `jp-mainmenu-file-new` | `fileeditor:create-new-markdown-file` | 30 |  |
| `jp-mainmenu-file-new` | `fileeditor:create-new` | 30 |  |
| `jp-mainmenu-file-new` | `notebook:create-new` | 10 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:clone` | 2 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:create-new` | 1 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:delete` | 10 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:export` | 7 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:import` | 6 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:open` | 0 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:rename` | 3 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:reset` | 9 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:save-as` | 5 |  |
| `jp-mainmenu-file-workspaces` | `workspace-ui:save` | 4 |  |
| `jp-mainmenu-file` | `application:close-all` | 3.2 |  |
| `jp-mainmenu-file` | `application:close` | 3 |  |
| `jp-mainmenu-file` | `apputils:print` | 98 |  |
| `jp-mainmenu-file` | `docmanager:clone` | 2 |  |
| `jp-mainmenu-file` | `docmanager:download` | 6 |  |
| `jp-mainmenu-file` | `docmanager:duplicate` | 5 |  |
| `jp-mainmenu-file` | `docmanager:reload` | 5 |  |
| `jp-mainmenu-file` | `docmanager:rename` | 5 |  |
| `jp-mainmenu-file` | `docmanager:restore-checkpoint` | 5 |  |
| `jp-mainmenu-file` | `docmanager:save-all` | 4 |  |
| `jp-mainmenu-file` | `docmanager:save-as` | 4 |  |
| `jp-mainmenu-file` | `docmanager:save` | 4 |  |
| `jp-mainmenu-file` | `filebrowser:open-path` | 1 |  |
| `jp-mainmenu-file` | `filebrowser:open-url` | 1 |  |
| `jp-mainmenu-file` | `filemenu:close-and-cleanup` | 3.1 |  |
| `jp-mainmenu-file` | `filemenu:create-console` | 2.1 |  |
| `jp-mainmenu-file` | `filemenu:logout` | 99 |  |
| `jp-mainmenu-file` | `filemenu:shutdown` | 99 |  |
| `jp-mainmenu-file` | `hub:control-panel` | 100 |  |
| `jp-mainmenu-file` | `hub:logout` | 100 |  |
| `jp-mainmenu-file` | `launcher:create` | 0.99 |  |
| `jp-mainmenu-help` | `apputils:display-shortcuts` | 0.1 |  |
| `jp-mainmenu-help` | `help:about` | 0 |  |
| `jp-mainmenu-help` | `help:jupyter-forum` | 2 |  |
| `jp-mainmenu-help` | `inspector:toggle` | 0.1 |  |
| `jp-mainmenu-kernel` | `debugger:restart-debug` | 1.2 |  |
| `jp-mainmenu-kernel` | `kernelmenu:change` | 3 |  |
| `jp-mainmenu-kernel` | `kernelmenu:interrupt` | 0 |  |
| `jp-mainmenu-kernel` | `kernelmenu:reconnect-to-kernel` | 1.5 |  |
| `jp-mainmenu-kernel` | `kernelmenu:restart-and-clear` | 1 |  |
| `jp-mainmenu-kernel` | `kernelmenu:restart` | 1 |  |
| `jp-mainmenu-kernel` | `kernelmenu:shutdownAll` | 2 |  |
| `jp-mainmenu-kernel` | `kernelmenu:shutdown` | 2 |  |
| `jp-mainmenu-kernel` | `notebook:restart-and-run-to-selected` | 1 |  |
| `jp-mainmenu-kernel` | `runmenu:restart-and-run-all` | 1.1 |  |
| `jp-mainmenu-run` | `notebook:render-all-markdown` | 12 |  |
| `jp-mainmenu-run` | `notebook:run-all-above` | 11 |  |
| `jp-mainmenu-run` | `notebook:run-all-below` | 11 |  |
| `jp-mainmenu-run` | `notebook:run-cell-and-insert-below` | 10 |  |
| `jp-mainmenu-run` | `notebook:run-cell` | 10 |  |
| `jp-mainmenu-run` | `notebook:run-in-console` | 10 |  |
| `jp-mainmenu-run` | `runmenu:restart-and-run-all` | 999 |  |
| `jp-mainmenu-run` | `runmenu:run-all` | 999 |  |
| `jp-mainmenu-run` | `runmenu:run` | 0 |  |
| `jp-mainmenu-settings-apputilstheme` | `apputils:adaptive-theme` |  |  |
| `jp-mainmenu-settings-apputilstheme` | `apputils:decr-font-size` |  | `{"key": "code-font-size"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:decr-font-size` |  | `{"key": "content-font-size1"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:decr-font-size` |  | `{"key": "ui-font-size1"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:incr-font-size` |  | `{"key": "code-font-size"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:incr-font-size` |  | `{"key": "content-font-size1"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:incr-font-size` |  | `{"key": "ui-font-size1"}` |
| `jp-mainmenu-settings-apputilstheme` | `apputils:theme-scrollbars` |  |  |
| `jp-mainmenu-settings-consoleexecute` | `console:interaction-mode` |  | `{"interactionMode": "notebook"}` |
| `jp-mainmenu-settings-consoleexecute` | `console:interaction-mode` |  | `{"interactionMode": "terminal"}` |
| `jp-mainmenu-settings-fileeditorindent` | `fileeditor:change-tabs` |  |  |
| `jp-mainmenu-settings-fileeditorindent` | `fileeditor:change-tabs` |  | `{"size": "1"}` |
| `jp-mainmenu-settings-fileeditorindent` | `fileeditor:change-tabs` |  | `{"size": "2"}` |
| `jp-mainmenu-settings-fileeditorindent` | `fileeditor:change-tabs` |  | `{"size": "4"}` |
| `jp-mainmenu-settings-fileeditorindent` | `fileeditor:change-tabs` |  | `{"size": "8"}` |
| `jp-mainmenu-settings` | `docmanager:toggle-autosave` | 4 |  |
| `jp-mainmenu-settings` | `extensionmanager:toggle` | 100 |  |
| `jp-mainmenu-settings` | `filebrowser:toggle-navigate-to-current-directory` | 5 |  |
| `jp-mainmenu-settings` | `fileeditor:change-font-size` | 30 | `{"delta": -1, "isMenu": true}` |
| `jp-mainmenu-settings` | `fileeditor:change-font-size` | 30 | `{"delta": 1, "isMenu": true}` |
| `jp-mainmenu-settings` | `fileeditor:toggle-autoclosing-brackets-universal` | 30 |  |
| `jp-mainmenu-settings` | `settingeditor:open` | 1000 |  |
| `jp-mainmenu-tabs` | `application:activate-next-tab-bar` | 0 |  |
| `jp-mainmenu-tabs` | `application:activate-next-tab` | 0 |  |
| `jp-mainmenu-tabs` | `application:activate-previous-tab-bar` | 0 |  |
| `jp-mainmenu-tabs` | `application:activate-previous-tab` | 0 |  |
| `jp-mainmenu-tabs` | `tabsmenu:activate-previously-used-tab` | 0 |  |
| `jp-mainmenu-view-appearance-activity-bar-position` | `application:set-activity-bar-position` | 0 | `{"position": "side"}` |
| `jp-mainmenu-view-appearance-activity-bar-position` | `application:set-activity-bar-position` | 1 | `{"position": "top"}` |
| `jp-mainmenu-view-appearance-activity-bar-position` | `application:set-activity-bar-position` | 2 | `{"position": "bottom"}` |
| `jp-mainmenu-view-appearance` | `application:reset-layout` | 53 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-down-area` | 15 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-fullscreen-mode` | 0 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-header` | 16 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-left-area` | 11 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-mode` | 0 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-presentation-mode` | 0 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-right-area` | 13 |  |
| `jp-mainmenu-view-appearance` | `application:toggle-side-tabbar` | 12 | `{"side": "left"}` |
| `jp-mainmenu-view-appearance` | `application:toggle-side-tabbar` | 14 | `{"side": "right"}` |
| `jp-mainmenu-view-appearance` | `statusbar:toggle` | 15 |  |
| `jp-mainmenu-view-appearance` | `viewmenu:show-minimap` | 50 |  |
| `jp-mainmenu-view-appearance` | `workspace-indicator:toggle` | 16 |  |
| `jp-mainmenu-view` | `apputils:activate-command-palette` | 0 |  |
| `jp-mainmenu-view` | `apputils:display-notifications` | 9.92 |  |
| `jp-mainmenu-view` | `debugger:show-panel` | 5 |  |
| `jp-mainmenu-view` | `extensionmanager:show-panel` | 9 |  |
| `jp-mainmenu-view` | `filebrowser:toggle-hidden-files` | 9.95 |  |
| `jp-mainmenu-view` | `filebrowser:toggle-main` | 1 |  |
| `jp-mainmenu-view` | `logconsole:open` | 9.95 |  |
| `jp-mainmenu-view` | `notebook:hide-all-cell-code` | 10 |  |
| `jp-mainmenu-view` | `notebook:hide-all-cell-outputs` | 10 |  |
| `jp-mainmenu-view` | `notebook:hide-cell-code` | 10 |  |
| `jp-mainmenu-view` | `notebook:hide-cell-outputs` | 10 |  |
| `jp-mainmenu-view` | `notebook:show-all-cell-code` | 11 |  |
| `jp-mainmenu-view` | `notebook:show-all-cell-outputs` | 11 |  |
| `jp-mainmenu-view` | `notebook:show-cell-code` | 11 |  |
| `jp-mainmenu-view` | `notebook:show-cell-outputs` | 11 |  |
| `jp-mainmenu-view` | `notebook:toggle-render-side-by-side-current` | 12 |  |
| `jp-mainmenu-view` | `property-inspector:show-panel` | 2 |  |
| `jp-mainmenu-view` | `running:show-panel` | 3 |  |
| `jp-mainmenu-view` | `toc:show-panel` | 4 |  |
| `jp-mainmenu-view` | `viewmenu:line-numbering` | 10 |  |
| `jp-mainmenu-view` | `viewmenu:match-brackets` | 10 |  |
| `jp-mainmenu-view` | `viewmenu:word-wrap` | 10 |  |

## Toolbar items

Change a toolbar with the `toolbar` setting of the plugin in the last column.
Items without a command are special widgets (kernel name, cell type, spacer).

| Toolbar | Item name | Command | Rank | Setting of |
| --- | --- | --- | --- | --- |
| TopBar | `spacer` |  | 50 | `@jupyterlab/application-extension:top-bar` |
| Cell | `duplicate-cell` | notebook:duplicate-below |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| Cell | `move-cell-up` | notebook:move-cell-up |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| Cell | `move-cell-down` | notebook:move-cell-down |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| Cell | `insert-cell-above` | notebook:insert-cell-above |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| Cell | `insert-cell-below` | notebook:insert-cell-below |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| Cell | `delete-cell` | cell-toolbar:delete |  | `@jupyterlab/cell-toolbar-extension:plugin` |
| ConsolePanel | `run` | console:run-forced | 0 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `restart` | console:restart-kernel | 10 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `clear` | console:clear | 20 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `spacer` |  | 100 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `kernelName` |  | 1000 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `kernelStatus` |  | 1010 | `@jupyterlab/console-extension:tracker` |
| ConsolePanel | `promptPosition` |  | 1020 | `@jupyterlab/console-extension:tracker` |
| CSVTable | `delimiter` |  | 10 | `@jupyterlab/csvviewer-extension:csv` |
| TSVTable | `delimiter` |  | 10 | `@jupyterlab/csvviewer-extension:tsv` |
| FileBrowser | `new-directory` | filebrowser:create-new-directory | 10 | `@jupyterlab/filebrowser-extension:widget` |
| FileBrowser | `uploader` |  | 20 | `@jupyterlab/filebrowser-extension:widget` |
| FileBrowser | `refresh` | filebrowser:refresh | 30 | `@jupyterlab/filebrowser-extension:widget` |
| FileBrowser | `toggle-file-filter` | filebrowser:toggle-file-filter | 40 | `@jupyterlab/filebrowser-extension:widget` |
| HTML Viewer | `refresh` |  | 10 | `@jupyterlab/htmlviewer-extension:plugin` |
| HTML Viewer | `trust` |  | 20 | `@jupyterlab/htmlviewer-extension:plugin` |
| FileBrowser | `new-launcher` | launcher:create | 1 | `@jupyterlab/launcher-extension:plugin` |
| LogConsole | `add-checkpoint` | logconsole:add-checkpoint | 10 | `@jupyterlab/logconsole-extension:plugin` |
| LogConsole | `clear` | logconsole:clear | 20 | `@jupyterlab/logconsole-extension:plugin` |
| LogConsole | `set-level` | logconsole:set-level | 30 | `@jupyterlab/logconsole-extension:plugin` |
| Notebook | `save` |  | 10 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `insert` | notebook:insert-cell-below | 20 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `cut` | notebook:cut-cell | 21 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `copy` | notebook:copy-cell | 22 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `paste` | notebook:paste-cell-below | 23 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `run` | notebook:run-cell-and-select-next | 30 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `interrupt` | notebook:interrupt-kernel | 31 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `restart` | notebook:restart-kernel | 32 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `restart-and-run` | notebook:restart-run-all | 33 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `cellType` |  | 40 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `spacer` |  | 100 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `kernelName` |  | 1000 | `@jupyterlab/notebook-extension:panel` |
| Notebook | `executionProgress` |  | 1002 | `@jupyterlab/notebook-extension:panel` |
| TopBar | `workspaceIndicator` |  | 1000 | `@jupyterlab/workspaces-extension:indicator` |

## Context menu items

Change them with the `contextMenu` setting of
`@jupyterlab/application-extension:context-menu`. An item is identified by its
command, selector and args.

| Command | Selector | Rank |
| --- | --- | --- |
| `application:close` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 4 |
| `application:close` | `.jp-SideBar .lm-TabBar-tab.lm-mod-closable[data-id]` | 4 |
| `application:close` | `#jp-down-stack .lm-TabBar-tab.lm-mod-closable[data-id]` | 4 |
| `application:close-other-tabs` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 4 |
| `application:close-all` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 4 |
| `application:close-right-tabs` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 5 |
| submenu `jp-mainmenu-view-split-tab-submenu` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 5 |
| `__internal:context-menu-info` | `body` | 9007199254740991 |
| submenu `jp-contextmenu-move-widget` | `.lm-TabBar-tab[data-id]` | 510 |
| `sidebar:switch` | `.jp-SideBar .lm-TabBar-tab` | 500 |
| `console:toggle-show-all-kernel-activity` | `.jp-CodeConsole` | 20 |
| `console:undo` | `.jp-CodeConsole-promptCell` | 1 |
| `console:redo` | `.jp-CodeConsole-promptCell` | 2 |
| `console:clear` | `.jp-CodeConsole-content` | 10 |
| `console:restart-kernel` | `.jp-CodeConsole` | 30 |
| `debugger:inspect-variable` | `.jp-DebuggerVariables-body .jp-DebuggerVariables-grid` |  |
| `debugger:render-mime-variable` | `.jp-DebuggerVariables-body` |  |
| `debugger:copy-to-clipboard` | `.jp-DebuggerVariables-body` |  |
| `debugger:copy-to-globals` | `.jp-DebuggerVariables-body.jp-debuggerVariables-local` |  |
| `docmanager:rename` | `[data-type="document-title"]` | 20 |
| `docmanager:duplicate` | `[data-type="document-title"]` | 21 |
| `docmanager:delete` | `[data-type="document-title"]` | 22 |
| `docmanager:clone` | `[data-type="document-title"]` | 23 |
| `docmanager:show-in-file-browser` | `[data-type="document-title"]` | 24 |
| `separator` | `.jp-DirListing-content` | 0 |
| `filebrowser:open` | `.jp-DirListing-item[data-isdir]` | 1 |
| `separator` | `.jp-DirListing-item[data-isdir]` | 4 |
| `filebrowser:rename` | `.jp-DirListing-item[data-isdir]` | 5 |
| `filebrowser:delete` | `.jp-DirListing-item[data-isdir]` | 6 |
| `filebrowser:cut` | `.jp-DirListing-item[data-isdir]` | 7 |
| `filebrowser:copy` | `.jp-DirListing-item[data-isdir]` | 8 |
| `filebrowser:paste` | `.jp-DirListing-content` | 8.5 |
| `filebrowser:duplicate` | `.jp-DirListing-item[data-isdir="false"]` | 9 |
| `separator` | `.jp-DirListing-item[data-isdir]` | 10 |
| `filebrowser:shutdown` | `.jp-DirListing-item[data-isdir="false"].jp-mod-running` | 11 |
| `separator` | `.jp-DirListing-item[data-isdir]` | 12 |
| `filebrowser:copy-path` | `.jp-DirListing-item[data-isdir]` | 14 |
| `filebrowser:toggle-last-modified` | `.jp-DirListing-header` | 14 |
| `filebrowser:toggle-date-created` | `.jp-DirListing-header` | 15 |
| `filebrowser:toggle-file-size` | `.jp-DirListing-header` | 16 |
| `filebrowser:toggle-file-checkboxes` | `.jp-DirListing-header` | 17 |
| `filebrowser:toggle-sort-notebooks-first` | `.jp-DirListing-header` | 18 |
| `filebrowser:share-main` | `.jp-DirListing-item[data-isdir]` | 17 |
| `separator` | `.jp-DirListing-item[data-isdir]` | 50 |
| `filebrowser:create-new-file` | `.jp-DirListing-content` | 51 |
| `filebrowser:create-new-directory` | `.jp-DirListing-content` | 55 |
| `filebrowser:download` | `.jp-DirListing-item[data-isdir="false"]` | 9 |
| `filebrowser:copy-download-link` | `.jp-DirListing-item[data-isdir="false"]` | 13 |
| `filebrowser:open-browser-tab` | `.jp-DirListing-item[data-isdir="false"]` | 1.6 |
| submenu `jp-contextmenu-open-with` | `.jp-DirListing-item[data-isdir="false"]` | 1.3 |
| `fileeditor:undo` | `.jp-FileEditor` | 1 |
| `fileeditor:redo` | `.jp-FileEditor` | 2 |
| `fileeditor:cut` | `.jp-FileEditor` | 3 |
| `fileeditor:copy` | `.jp-FileEditor` | 4 |
| `fileeditor:paste` | `.jp-FileEditor` | 5 |
| `fileeditor:select-all` | `.jp-FileEditor` | 6 |
| `fileeditor:create-console` | `.jp-FileEditor` | 10 |
| `fileeditor:markdown-preview` | `.jp-FileEditor` | 11 |
| `imageviewer:zoom-in` | `.jp-ImageViewer` | 1 |
| `imageviewer:zoom-out` | `.jp-ImageViewer` | 2 |
| `imageviewer:reset-image` | `.jp-ImageViewer` | 3 |
| `imageviewer:rotate-clockwise` | `.jp-ImageViewer` | 4 |
| `imageviewer:rotate-counterclockwise` | `.jp-ImageViewer` | 5 |
| `imageviewer:flip-horizontal` | `.jp-ImageViewer` | 6 |
| `imageviewer:flip-vertical` | `.jp-ImageViewer` | 7 |
| `imageviewer:invert-colors` | `.jp-ImageViewer` | 8 |
| `inspector:toggle` | `.jp-CodeConsole-promptCell` | 5 |
| `inspector:toggle` | `.jp-Notebook` | 50 |
| `logconsole:open` | `.jp-Notebook` | 60 |
| `filemenu:create-console` | `[data-type="document-title"].jp-mod-current` | 10 |
| `recentmenu:reopen-last` | `#jp-main-dock-panel .lm-DockPanel-tabBar .lm-TabBar-tab` | 6 |
| `markdownviewer:edit` | `.jp-RenderedMarkdown` |  |
| `separator` | `.MathJax` | 12 |
| `mathjax:clipboard` | `.MathJax` | 13 |
| `mathjax:scale` | `.MathJax` | 13 |
| `mathjax:scale` | `.MathJax` | 13 |
| `separator` | `.MathJax` | 13 |
| `separator` | `.jp-Notebook .jp-Cell` | 0 |
| `notebook:cut-cell` | `.jp-Notebook .jp-Cell` | 1 |
| `notebook:copy-cell` | `.jp-Notebook .jp-Cell` | 2 |
| `notebook:paste-cell-below` | `.jp-Notebook .jp-Cell` | 3 |
| `notebook:copy-selected-text` | `.jp-Notebook .jp-Cell` | 3 |
| `notebook:cut-selected-text` | `.jp-Notebook .jp-InputArea-editor` | 3 |
| `notebook:paste-text` | `.jp-Notebook .jp-InputArea-editor` | 3 |
| `separator` | `.jp-Notebook .jp-Cell` | 4 |
| `notebook:delete-cell` | `.jp-Notebook .jp-Cell` | 5 |
| `separator` | `.jp-Notebook .jp-Cell` | 6 |
| `notebook:split-cell-at-cursor` | `.jp-Notebook .jp-Cell` | 7 |
| `notebook:merge-cells` | `.jp-Notebook .jp-Cell` | 8 |
| `notebook:merge-cell-above` | `.jp-Notebook .jp-Cell` | 8 |
| `notebook:merge-cell-below` | `.jp-Notebook .jp-Cell` | 8 |
| `separator` | `.jp-Notebook .jp-Cell` | 9 |
| `notebook:create-output-view` | `.jp-Notebook .jp-CodeCell` | 10 |
| `separator` | `.jp-Notebook .jp-CodeCell` | 11 |
| `notebook:clear-cell-output` | `.jp-Notebook .jp-CodeCell` | 12 |
| `separator` | `.jp-Notebook` | 20 |
| `notebook:toggle-output-scrolling` | `.jp-Notebook` | 21 |
| `separator` | `.jp-Notebook` | 30 |
| `notebook:undo-cell-action` | `.jp-Notebook` | 31 |
| `notebook:redo-cell-action` | `.jp-Notebook` | 32 |
| `notebook:restart-kernel` | `.jp-Notebook` | 33 |
| `separator` | `.jp-Notebook` | 40 |
| `notebook:create-console` | `.jp-Notebook` | 41 |
| `notebook:create-subshell-console` | `.jp-Notebook` | 42 |
| `notebook:create-new` | `.jp-DirListing-content` | 52 |
| `running:kernel-new-console` | `.jp-RunningSessions-item.jp-mod-kernel` | 0 |
| `running:kernel-new-notebook` | `.jp-RunningSessions-item.jp-mod-kernel` | 1 |
| `separator` | `.jp-RunningSessions-item.jp-mod-kernel` | 2 |
| submenu `jp-contextmenu-connected-sessions` | `.jp-RunningSessions-item.jp-mod-kernel` | 3 |
| `separator` | `.jp-RunningSessions-item.jp-mod-kernel` | 4 |
| `running:kernel-shut-down` | `.jp-RunningSessions-item.jp-mod-kernel` | 5 |
| `shortcuts:edit-keybinding` | `.jp-Shortcuts-ShortcutKeysContainer` | 0 |
| `shortcuts:delete-keybinding` | `.jp-Shortcuts-ShortcutKeysContainer` | 1 |
| `shortcuts:add-keybinding` | `.jp-Shortcuts-Row` | 2 |
| `shortcuts:toggle-selectors` | `.jp-Shortcuts-Top` | 3 |
| `shortcuts:reset-all` | `.jp-Shortcuts-Top` | 4 |
| `terminal:copy` | `.jp-Terminal` | 1 |
| `terminal:paste` | `.jp-Terminal` | 2 |
| `terminal:refresh` | `.jp-Terminal` | 3 |
| `terminal:open-folder-in-terminal` | `.jp-DirListing-item[data-isdir="true"]` | 2 |
| `toc:run-cells` | `.jp-TableOfContents-content[data-document-type="notebook"] .jp-tocItem` |  |
| `workspace-ui:clone` | `.jp-RunningSessions-item.jp-mod-workspace` | 0 |
| `workspace-ui:rename` | `.jp-RunningSessions-item.jp-mod-workspace` | 1 |
| `workspace-ui:reset` | `.jp-RunningSessions-item.jp-mod-workspace` | 2 |
| `workspace-ui:delete` | `.jp-RunningSessions-item.jp-mod-workspace` | 3 |
| `workspace-ui:export` | `.jp-RunningSessions-item.jp-mod-workspace` | 4 |
| `separator` | `.jp-RunningSessions-item.jp-mod-workspace` | 5 |
| `workspace-ui:import` | `.jp-RunningSessions-section:has(.jp-mod-workspace)` | 6 |
| `workspace-ui:create-new` | `.jp-RunningSessions-section:has(.jp-mod-workspace)` | 7 |
