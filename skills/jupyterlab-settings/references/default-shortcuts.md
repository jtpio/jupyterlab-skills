# Default keyboard shortcuts

From the schemas of a stock JupyterLab 4.6.6. `Accel` is Cmd on macOS and
Ctrl on other systems. Copy `keys` and `selector` exactly as shown when you
disable a default: JupyterLab identifies a shortcut by its keys and selector.

Shortcuts with `Cmd` exist on macOS only.

| Command | Keys | Selector | Args |
| --- | --- | --- | --- |
| `application:activate-next-tab` | `Ctrl Shift ]` | `body` |  |
| `application:activate-next-tab-bar` | `Ctrl Shift .` | `body` |  |
| `application:activate-previous-tab` | `Ctrl Shift [` | `body` |  |
| `application:activate-previous-tab-bar` | `Ctrl Shift ,` | `body` |  |
| `application:close` | `Alt W` | `.jp-Activity` |  |
| `application:toggle-down-area` | `` | `body` |  |
| `application:toggle-fullscreen-mode` | `F11` | `body` |  |
| `application:toggle-left-area` | `Accel B` | `body` |  |
| `application:toggle-mode` | `Accel Shift D` | `body` |  |
| `application:toggle-presentation-mode` | `` | `body` |  |
| `application:toggle-right-area` | `Accel J` | `body` |  |
| `application:toggle-sidebar-widget` | `Alt 0` | `body` | `{"side": "left", "index": 9}` |
| `application:toggle-sidebar-widget` | `Alt 1` | `body` | `{"side": "left", "index": 0}` |
| `application:toggle-sidebar-widget` | `Alt 2` | `body` | `{"side": "left", "index": 1}` |
| `application:toggle-sidebar-widget` | `Alt 3` | `body` | `{"side": "left", "index": 2}` |
| `application:toggle-sidebar-widget` | `Alt 4` | `body` | `{"side": "left", "index": 3}` |
| `application:toggle-sidebar-widget` | `Alt 5` | `body` | `{"side": "left", "index": 4}` |
| `application:toggle-sidebar-widget` | `Alt 6` | `body` | `{"side": "left", "index": 5}` |
| `application:toggle-sidebar-widget` | `Alt 7` | `body` | `{"side": "left", "index": 6}` |
| `application:toggle-sidebar-widget` | `Alt 8` | `body` | `{"side": "left", "index": 7}` |
| `application:toggle-sidebar-widget` | `Alt 9` | `body` | `{"side": "left", "index": 8}` |
| `application:toggle-sidebar-widget` | `Alt Shift 0` | `body` | `{"side": "right", "index": 9}` |
| `application:toggle-sidebar-widget` | `Alt Shift 1` | `body` | `{"side": "right", "index": 0}` |
| `application:toggle-sidebar-widget` | `Alt Shift 2` | `body` | `{"side": "right", "index": 1}` |
| `application:toggle-sidebar-widget` | `Alt Shift 3` | `body` | `{"side": "right", "index": 2}` |
| `application:toggle-sidebar-widget` | `Alt Shift 4` | `body` | `{"side": "right", "index": 3}` |
| `application:toggle-sidebar-widget` | `Alt Shift 5` | `body` | `{"side": "right", "index": 4}` |
| `application:toggle-sidebar-widget` | `Alt Shift 6` | `body` | `{"side": "right", "index": 5}` |
| `application:toggle-sidebar-widget` | `Alt Shift 7` | `body` | `{"side": "right", "index": 6}` |
| `application:toggle-sidebar-widget` | `Alt Shift 8` | `body` | `{"side": "right", "index": 7}` |
| `application:toggle-sidebar-widget` | `Alt Shift 9` | `body` | `{"side": "right", "index": 8}` |
| `apputils:activate-command-palette` | `Accel Shift C` | `body` |  |
| `apputils:display-shortcuts` | `Accel Shift H` | `body` |  |
| `apputils:print` | `Accel P` | `body` |  |
| `codemirror:delete-line` | `Accel D` | `.cm-content` |  |
| `codemirror:delete-line` | `Accel Shift K` | `.cm-content` |  |
| `codemirror:markdown-toggle-bold` | `Accel B` | `.cm-content[data-language='markdown']` |  |
| `codemirror:select-next-occurrence` | `Accel Shift D` | `.cm-content` |  |
| `codemirror:toggle-block-comment` | `Alt A` | `.cm-content` |  |
| `codemirror:toggle-comment` | `Accel /` | `.cm-content` |  |
| `completer:invoke-console` | `Tab` | `.jp-CodeConsole-promptCell .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |  |
| `completer:invoke-file` | `Tab` | `.jp-FileEditor .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |  |
| `completer:invoke-notebook` | `Tab` | `.jp-Notebook.jp-mod-editMode .jp-mod-completer-enabled:not(.jp-mod-at-line-beginning)` |  |
| `console:linebreak` | `Accel Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |  |
| `console:run-forced` | `Shift Enter` | `.jp-CodeConsole[data-jp-interaction-mode='notebook'] .jp-CodeConsole-promptCell` |  |
| `console:run-forced` | `Shift Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |  |
| `console:run-unforced` | `Enter` | `.jp-CodeConsole[data-jp-interaction-mode='terminal'] .jp-CodeConsole-promptCell` |  |
| `debugger:continue` | `F9` | `body` |  |
| `debugger:next` | `F10` | `[data-jp-debugger-stopped-threads='true']` |  |
| `debugger:show-panel` | `Accel Shift E` | `body` |  |
| `debugger:stepIn` | `F11` | `[data-jp-debugger-stopped-threads='true']` |  |
| `debugger:stepOut` | `Shift F11` | `[data-jp-debugger-stopped-threads='true']` |  |
| `debugger:terminate` | `Shift F9` | `[data-jp-debugger-stopped-threads='true']` |  |
| `docmanager:save` | `Accel S` | `body` |  |
| `docmanager:save-as` | `Accel Shift S` | `body` |  |
| `documentsearch:end` | `Escape` | `.jp-mod-search-active` |  |
| `documentsearch:highlightNext` | `Accel G` | `.jp-mod-searchable` |  |
| `documentsearch:highlightPrevious` | `Accel Shift G` | `.jp-mod-searchable` |  |
| `documentsearch:start` | `Accel F` | `.jp-mod-searchable` |  |
| `documentsearch:startWithReplace` | `Accel H` | `.jp-mod-searchable` |  |
| `documentsearch:toggleSearchInSelection` | `Alt L` | `.jp-mod-search-active` |  |
| `editmenu:clear-all` | `` | `[data-jp-undoer]` |  |
| `editmenu:clear-current` | `` | `[data-jp-undoer]` |  |
| `editmenu:find` | `` | `[data-jp-undoer]` |  |
| `editmenu:find-and-replace` | `` | `[data-jp-undoer]` |  |
| `editmenu:redo` | `` | `[data-jp-undoer]` |  |
| `editmenu:redo` | `Accel Shift Z` | `[data-jp-undoer]` |  |
| `editmenu:undo` | `Accel Z` | `[data-jp-undoer]` |  |
| `extensionmanager:show-panel` | `Accel Shift X` | `body` |  |
| `filebrowser:copy` | `Accel C` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:cut` | `Accel X` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:delete` | `Delete` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:duplicate` | `Accel D` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:go-up` | `Backspace` | `.jp-DirListing:focus` |  |
| `filebrowser:go-up` | `Backspace` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:paste` | `Accel V` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:rename` | `F2` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:select-all` | `Accel A` | `.jp-DirListing-content .jp-DirListing-itemText` |  |
| `filebrowser:toggle-main` | `Accel Shift F` | `body` |  |
| `filemenu:close-and-cleanup` | `Ctrl Shift Q` | `.jp-Activity` |  |
| `imageviewer:flip-horizontal` | `H` | `.jp-ImageViewer` |  |
| `imageviewer:flip-vertical` | `V` | `.jp-ImageViewer` |  |
| `imageviewer:invert-colors` | `I` | `.jp-ImageViewer` |  |
| `imageviewer:reset-image` | `0` | `.jp-ImageViewer` |  |
| `imageviewer:rotate-clockwise` | `]` | `.jp-ImageViewer` |  |
| `imageviewer:rotate-counterclockwise` | `[` | `.jp-ImageViewer` |  |
| `imageviewer:zoom-in` | `=` | `.jp-ImageViewer` |  |
| `imageviewer:zoom-out` | `-` | `.jp-ImageViewer` |  |
| `inline-completer:accept` | `Alt End` | `.jp-mod-inline-completer-active` |  |
| `inline-completer:accept` | `Tab` | `.jp-mod-inline-completer-active` |  |
| `inline-completer:invoke` | `Alt \` | `.jp-mod-completer-enabled` |  |
| `inline-completer:next` | `Alt ]` | `.jp-mod-completer-enabled` |  |
| `inline-completer:previous` | `Alt [` | `.jp-mod-completer-enabled` |  |
| `inspector:toggle` | `Accel I` | `body` |  |
| `kernelmenu:interrupt` | `I`, `I` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |  |
| `kernelmenu:restart` | `0`, `0` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |  |
| `kernelmenu:restart-and-clear` | `` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |  |
| `kernelmenu:shutdown` | `` | `[data-jp-kernel-user]:not(.jp-mod-readWrite) :focus:not(:read-write)` |  |
| `launcher:create` | `Accel Shift L` | `body` |  |
| `notebook:access-next-history-entry` | `Alt ArrowDown` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:access-previous-history-entry` | `Alt ArrowUp` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:change-cell-to-code` | `Y` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:change-cell-to-heading-1` | `1` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-heading-2` | `2` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-heading-3` | `3` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-heading-4` | `4` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-heading-5` | `5` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-heading-6` | `6` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) .jp-MarkdownCell:focus` |  |
| `notebook:change-cell-to-markdown` | `M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:change-cell-to-raw` | `R` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:collapse-all-headings` | `Ctrl Shift ArrowLeft` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:copy-cell` | `C` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:cut-cell` | `X` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:delete-cell` | `D`, `D` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:enter-command-mode` | `Ctrl M` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:enter-command-mode` | `Escape` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:enter-edit-mode` | `Enter` | `.jp-Notebook.jp-mod-commandMode .jp-Cell:focus` |  |
| `notebook:expand-all-headings` | `Ctrl Shift ArrowRight` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-above` | `Shift ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-above` | `Shift K` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-below` | `Shift ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-below` | `Shift J` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-bottom` | `Shift End` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:extend-marked-cells-top` | `Shift Home` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:insert-cell-above` | `A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:insert-cell-below` | `B` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:insert-heading-above` | `Shift A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:insert-heading-below` | `Shift B` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:merge-cell-above` | `Ctrl Backspace` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:merge-cell-below` | `Ctrl Shift M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:merge-cells` | `Shift M` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cell-down` | `Ctrl Shift ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cell-up` | `Ctrl Shift ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-down` | `ArrowDown` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-down` | `J` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-heading-above-or-collapse` | `ArrowLeft` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-heading-below-or-expand` | `ArrowRight` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-up` | `ArrowUp` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:move-cursor-up` | `K` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:paste-cell-below` | `V` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:redo-cell-action` | `Shift Z` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:run-cell` |  | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:run-cell` |  | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:run-cell` | `Accel Enter` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:run-cell` | `Accel Enter` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:run-cell-and-insert-below` | `Alt Enter` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:run-cell-and-insert-below` | `Alt Enter` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:run-cell-and-select-next` | `Shift Enter` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:run-in-console` | `` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:select-all` | `Accel A` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:split-cell-at-cursor` | `Ctrl Shift -` | `.jp-Notebook.jp-mod-editMode` |  |
| `notebook:toggle-render-side-by-side-current` | `Shift R` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `notebook:undo-cell-action` | `Z` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `property-inspector:show-panel` | `Accel Shift U` | `body` |  |
| `recentmenu:reopen-last` | `Accel Shift T` | `body` |  |
| `runmenu:restart-and-run-all` | `` | `[data-jp-code-runner]` |  |
| `runmenu:run` | `Shift Enter` | `[data-jp-code-runner]` |  |
| `runmenu:run-all` | `` | `[data-jp-code-runner]` |  |
| `running:show-modal` | `Accel Alt A` | `body` |  |
| `running:show-panel` | `Accel Shift B` | `body` |  |
| `settingeditor:open` | `Accel ,` | `body` |  |
| `settingeditor:save` | `Accel S` | `.jp-SettingEditor` |  |
| `tabsmenu:activate-previously-used-tab` | `Accel Shift '` | `body` |  |
| `toc:show-panel` | `Accel Shift K` | `body` |  |
| `tooltip:dismiss` | `Escape` | `body.jp-mod-tooltip .jp-CodeConsole-promptCell` |  |
| `tooltip:dismiss` | `Escape` | `body.jp-mod-tooltip .jp-Notebook` |  |
| `tooltip:launch-console` | `Shift Tab` | `.jp-CodeConsole-promptCell .jp-InputArea-editor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace)` |  |
| `tooltip:launch-file` | `Shift Tab` | `.jp-FileEditor .jp-CodeMirrorEditor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace)` |  |
| `tooltip:launch-notebook` | `Shift Tab` | `.jp-Notebook.jp-mod-editMode .jp-InputArea-editor:not(.jp-mod-has-primary-selection):not(.jp-mod-in-leading-whitespace):not(.jp-mod-completer-active)` |  |
| `viewmenu:line-numbering` | `Shift L` | `.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus` |  |
| `viewmenu:match-brackets` | `` | `.jp-Notebook.jp-mod-commandMode` |  |
