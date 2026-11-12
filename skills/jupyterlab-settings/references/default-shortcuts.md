# Default keyboard shortcuts

From a stock JupyterLab 4.6.6. To change a default shortcut, disable it (same
`command`, `keys` and `selector`, plus `"disabled": true`) and add the new one, in the
`shortcuts` setting of `@jupyterlab/shortcuts-extension:shortcuts`.
`Accel` is Cmd on macOS and Ctrl on other systems.

| Command | Keys | Selector |
| --- | --- | --- |
| `application:activate-next-tab` | `Ctrl Shift ]` | `body` |
| `application:activate-next-tab-bar` | `Ctrl Shift .` | `body` |
| `application:activate-previous-tab` | `Ctrl Shift [` | `body` |
| `application:activate-previous-tab-bar` | `Ctrl Shift ,` | `body` |
| `application:close` | `Alt W` | `.jp-Activity` |
| `application:toggle-fullscreen-mode` | `F11` | `body` |
| `application:toggle-left-area` | `Ctrl B` | `body` |
| `application:toggle-mode` | `Ctrl Shift D` | `body` |
| `application:toggle-right-area` | `Ctrl J` | `body` |
| `application:toggle-sidebar-widget` | `Alt 1` | `body` |
| `application:toggle-sidebar-widget` | `Alt 2` | `body` |
| `application:toggle-sidebar-widget` | `Alt 3` | `body` |
| `application:toggle-sidebar-widget` | `Alt 4` | `body` |
| `application:toggle-sidebar-widget` | `Alt 5` | `body` |
| `application:toggle-sidebar-widget` | `Alt 6` | `body` |
| `application:toggle-sidebar-widget` | `Alt 7` | `body` |
| `application:toggle-sidebar-widget` | `Alt 8` | `body` |
| `application:toggle-sidebar-widget` | `Alt 9` | `body` |
| `application:toggle-sidebar-widget` | `Alt 0` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 1` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 2` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 3` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 4` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 5` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 6` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 7` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 8` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 9` | `body` |
| `application:toggle-sidebar-widget` | `Alt Shift 0` | `body` |
| `apputils:activate-command-palette` | `Ctrl Shift C` | `body` |
| `apputils:display-shortcuts` | `Ctrl Shift H` | `body` |
| `apputils:print` | `Ctrl P` | `body` |
| `codemirror:delete-line` | `Ctrl D` | `.cm-content` |
| `codemirror:delete-line` | `Ctrl Shift K` | `.cm-content` |
| `codemirror:markdown-toggle-bold` | `Ctrl B` | `.cm-content[data-language='markdown']` |
| `codemirror:select-next-occurrence` | `Ctrl Shift D` | `.cm-content` |
| `codemirror:toggle-block-comment` | `Alt A` | `.cm-content` |
| `codemirror:toggle-comment` | `Ctrl /` | `.cm-content` |
| `completer:invoke-console` | `Tab` | `.jp-CodeConsole-promptCell .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |
| `completer:invoke-file` | `Tab` | `.jp-FileEditor .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |
| `completer:invoke-notebook` | `Tab` | `.jp-Notebook.jp-mod-editMode .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |
| `completer:select-console` | `Enter` | `.jp-ConsolePanel .jp-mod-completer-active` |
| `completer:select-file` | `Enter` | `.jp-FileEditor .jp-mod-completer-active` |
| `completer:select-notebook` | `Enter` | `.jp-Notebook .jp-mod-completer-active` |
| `console:linebreak` | `Ctrl Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |
| `console:run-forced` | `Shift Enter` | `.jp-CodeConsole[data-jp-interaction-mode='notebook'] .jp-CodeConsole-promptCell` |
| `console:run-forced` | `Shift Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |
| `console:run-unforced` | `Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |
| `debugger:continue` | `F9` | `body` |
| `debugger:invoke-console-completer` | `Tab` | `.jp-ConsolePanel.jp-DebugConsole .jp-DebugConsole-widget .jp-CodeConsole-promptCell .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |
| `debugger:next` | `F10` | `[data-jp-debugger-stopped-threads='true']` |
| `debugger:run-in-console` | `Shift Enter` | `.jp-ConsolePanel.jp-DebugConsole .jp-DebugConsole-widget .jp-CodeConsole-promptCell` |
| `debugger:select-console-completion` | `Enter` | `.jp-ConsolePanel.jp-DebugConsole .jp-DebugConsole-widget .jp-mod-completer-active` |
| `debugger:show-panel` | `Ctrl Shift E` | `body` |
| `debugger:stepIn` | `F11` | `[data-jp-debugger-stopped-threads='true']` |
| `debugger:stepOut` | `Shift F11` | `[data-jp-debugger-stopped-threads='true']` |
| `debugger:terminate` | `Shift F9` | `[data-jp-debugger-stopped-threads='true']` |
| `docmanager:save` | `Ctrl S` | `body` |
| `docmanager:save-as` | `Ctrl Shift S` | `body` |
| `documentsearch:end` | `Escape` | `.jp-mod-search-active` |
| `documentsearch:highlightNext` | `Ctrl G` | `.jp-mod-searchable` |
| `documentsearch:highlightPrevious` | `Ctrl Shift G` | `.jp-mod-searchable` |
| `documentsearch:start` | `Ctrl F` | `.jp-mod-searchable` |
| `documentsearch:startWithReplace` | `Ctrl H` | `.jp-mod-searchable` |
| `documentsearch:toggleSearchInSelection` | `Alt L` | `.jp-mod-search-active` |
| `editmenu:redo` | `Ctrl Shift Z` | `[data-jp-undoer]` |
| `editmenu:redo` | `Ctrl Y` | `[data-jp-undoer]` |
| `editmenu:undo` | `Ctrl Z` | `[data-jp-undoer]` |
| `extensionmanager:show-panel` | `Ctrl Shift X` | `body` |
| `filebrowser:copy` | `Ctrl C` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:cut` | `Ctrl X` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:delete` | `Delete` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:duplicate` | `Ctrl D` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:go-up` | `Backspace` | `.jp-DirListing:focus` |
| `filebrowser:go-up` | `Backspace` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:paste` | `Ctrl V` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:rename` | `F2` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:select-all` | `Ctrl A` | `.jp-DirListing-content .jp-DirListing-itemText` |
| `filebrowser:toggle-main` | `Ctrl Shift F` | `body` |
| `filemenu:close-and-cleanup` | `Ctrl Shift Q` | `.jp-Activity` |
| `imageviewer:flip-horizontal` | `H` | `.jp-ImageViewer` |
| `imageviewer:flip-vertical` | `V` | `.jp-ImageViewer` |
| `imageviewer:invert-colors` | `I` | `.jp-ImageViewer` |
| `imageviewer:reset-image` | `0` | `.jp-ImageViewer` |
| `imageviewer:rotate-clockwise` | `]` | `.jp-ImageViewer` |
| `imageviewer:rotate-counterclockwise` | `[` | `.jp-ImageViewer` |
| `imageviewer:zoom-in` | `=` | `.jp-ImageViewer` |
| `imageviewer:zoom-out` | `-` | `.jp-ImageViewer` |
| `inline-completer:accept` | `Tab` | `.jp-mod-inline-completer-active` |
| `inline-completer:accept` | `Alt End` | `.jp-mod-inline-completer-active` |
| `inline-completer:invoke` | `Alt \` | `.jp-mod-completer-enabled` |
| `inline-completer:next` | `Alt ]` | `.jp-mod-completer-enabled` |
| `inline-completer:previous` | `Alt [` | `.jp-mod-completer-enabled` |
| `inspector:toggle` | `Ctrl I` | `body` |
| `kernelmenu:interrupt` | `I`, `I` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |
| `kernelmenu:restart` | `0`, `0` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |
| `launcher:create` | `Ctrl Shift L` | `body` |
| `notebook:access-next-history-entry` | `Alt ArrowDown` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:access-previous-history-entry` | `Alt ArrowUp` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:change-cell-to-code` | `Y` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:change-cell-to-heading-1` | `1` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-heading-2` | `2` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-heading-3` | `3` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-heading-4` | `4` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-heading-5` | `5` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-heading-6` | `6` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |
| `notebook:change-cell-to-markdown` | `M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:change-cell-to-raw` | `R` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:collapse-all-headings` | `Ctrl Shift ArrowLeft` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:copy-cell` | `C` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:cut-cell` | `X` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:delete-cell` | `D`, `D` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:enter-command-mode` | `Escape` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:enter-command-mode` | `Ctrl M` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:enter-edit-mode` | `Enter` | `.jp-Notebook.jp-mod-commandMode .jp-Cell:focus` |
| `notebook:expand-all-headings` | `Ctrl Shift ArrowRight` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-above` | `Shift ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-above` | `Shift K` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-below` | `Shift ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-below` | `Shift J` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-bottom` | `Shift End` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:extend-marked-cells-top` | `Shift Home` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:insert-cell-above` | `A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:insert-cell-below` | `B` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:insert-heading-above` | `Shift A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:insert-heading-below` | `Shift B` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:merge-cell-above` | `Ctrl Backspace` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:merge-cell-below` | `Ctrl Shift M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:merge-cells` | `Shift M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cell-down` | `Ctrl Shift ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cell-up` | `Ctrl Shift ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-down` | `ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-down` | `J` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-heading-above-or-collapse` | `ArrowLeft` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-heading-below-or-expand` | `ArrowRight` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-up` | `ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:move-cursor-up` | `K` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:paste-cell-below` | `V` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:redo-cell-action` | `Shift Z` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:run-cell` | `Ctrl Enter` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:run-cell` | `Ctrl Enter` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:run-cell-and-insert-below` | `Alt Enter` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:run-cell-and-insert-below` | `Alt Enter` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:run-cell-and-select-next` | `Shift Enter` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:select-all` | `Ctrl A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:split-cell-at-cursor` | `Ctrl Shift -` | `.jp-Notebook.jp-mod-editMode` |
| `notebook:toggle-render-side-by-side-current` | `Shift R` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `notebook:undo-cell-action` | `Z` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
| `property-inspector:show-panel` | `Ctrl Shift U` | `body` |
| `recentmenu:reopen-last` | `Ctrl Shift T` | `body` |
| `runmenu:run` | `Shift Enter` | `[data-jp-code-runner]` |
| `running:show-modal` | `Ctrl Alt A` | `body` |
| `running:show-panel` | `Ctrl Shift B` | `body` |
| `settingeditor:open` | `Ctrl ,` | `body` |
| `settingeditor:save` | `Ctrl S` | `.jp-SettingEditor` |
| `tabsmenu:activate-previously-used-tab` | `Ctrl Shift '` | `body` |
| `toc:show-panel` | `Ctrl Shift K` | `body` |
| `tooltip:dismiss` | `Escape` | `body.jp-mod-tooltip .jp-Notebook` |
| `tooltip:dismiss` | `Escape` | `body.jp-mod-tooltip .jp-CodeConsole-promptCell` |
| `tooltip:launch-console` | `Shift Tab` | `.jp-CodeConsole-promptCell .jp-InputArea-editor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace)` |
| `tooltip:launch-file` | `Shift Tab` | `.jp-FileEditor .jp-CodeMirrorEditor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace)` |
| `tooltip:launch-notebook` | `Shift Tab` | `.jp-Notebook.jp-mod-editMode .jp-InputArea-editor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace):not(.jp-mod-completer-active)` |
| `viewmenu:line-numbering` | `Shift L` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |
