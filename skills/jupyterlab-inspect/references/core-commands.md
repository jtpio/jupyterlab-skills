# Core commands

All 429 commands of a stock JupyterLab 4.6.6, from the live
application. Use a command ID in menus, toolbars, context menus, shortcuts and the
launcher. Extensions add more commands: get the exact list with the browser probe
of the `jupyterlab-verify` skill (`--dump`).

A command of a disabled plugin does not exist: an item that uses it is not shown.

## __internal

| Command | Label |
| --- | --- |
| `__internal:context-menu-info` | Shift+Right Click for Browser Menu |

## application

| Command | Label |
| --- | --- |
| `application:activate-next-tab` | Activate Next Tab |
| `application:activate-next-tab-bar` | Activate Next Tab Bar |
| `application:activate-previous-tab` | Activate Previous Tab |
| `application:activate-previous-tab-bar` | Activate Previous Tab Bar |
| `application:close` | Close Tab |
| `application:close-all` | Close All Tabs |
| `application:close-other-tabs` | Close All Other Tabs |
| `application:close-right-tabs` | Close Tabs to Right |
| `application:move-widget` | Move Widget |
| `application:reset-layout` | Reset Default Layout |
| `application:reset-widget-zoom` | Reset Widget Zoom |
| `application:set-activity-bar-position` | Set Activity Bar Position |
| `application:set-mode` | Set the layout `mode`. |
| `application:split-tab` | Split Tab |
| `application:toggle-context-menu` | Enable Context Menu |
| `application:toggle-down-area` | Show Down Area |
| `application:toggle-fullscreen-mode` | Fullscreen Mode |
| `application:toggle-header` | Show Header |
| `application:toggle-left-area` | Show Left Sidebar |
| `application:toggle-mode` | Simple Interface |
| `application:toggle-presentation-mode` | Presentation Mode |
| `application:toggle-right-area` | Show Right Sidebar |
| `application:toggle-side-tabbar` | Show Left Activity Bar |
| `application:toggle-sidebar-widget` | Toggle Sidebar Element |
| `application:zoom-in-widget` | Zoom In Active Widget |
| `application:zoom-out-widget` | Zoom Out Active Widget |

## apputils

| Command | Label |
| --- | --- |
| `apputils:activate-command-palette` | Activate Command Palette |
| `apputils:adaptive-theme` | Synchronize with System Settings |
| `apputils:change-dark-theme` | Switch to the provided dark `theme`. |
| `apputils:change-font` | waiting for fonts |
| `apputils:change-light-theme` | Switch to the provided light `theme`. |
| `apputils:change-theme` | Switch to the provided `theme`. |
| `apputils:decr-font-size` | Decrease Font Size |
| `apputils:dismiss-notification` | Dismiss a notification |
| `apputils:display-notifications` | Show Notifications |
| `apputils:display-shortcuts` | Show Keyboard Shortcuts… |
| `apputils:incr-font-size` | Increase Font Size |
| `apputils:license-report` | Download All Licenses as Markdown |
| `apputils:licenses` | Licenses |
| `apputils:licenses-refresh` | Refresh Licenses |
| `apputils:load-statedb` | Load state for the current workspace. |
| `apputils:move-section-back` | Move back |
| `apputils:move-section-to` | Move to |
| `apputils:notify` | Emit a notification |
| `apputils:print` | Print… |
| `apputils:reset` | Reset Application State |
| `apputils:reset-on-load` | Reset state when loading for the workspace. |
| `apputils:run-all-enabled` | Run All Enabled Commands Passed as Args |
| `apputils:run-first-enabled` | Run First Enabled Command |
| `apputils:theme-scrollbars` | Theme Scrollbars |
| `apputils:toggle-header` | Show Header Above Content |
| `apputils:update-notification` | Update a notification |

## cell-toolbar

| Command | Label |
| --- | --- |
| `cell-toolbar:delete` | Delete Cell |

## code-viewer

| Command | Label |
| --- | --- |
| `code-viewer:open` | Open Code Viewer |

## codemirror

| Command | Label |
| --- | --- |
| `codemirror:delete-line` | Delete the current line |
| `codemirror:fold-all` | Fold All Regions |
| `codemirror:fold-current` | Fold Current Region |
| `codemirror:fold-subregions` | Fold All Subregions |
| `codemirror:markdown-toggle-bold` | Toggle Bold |
| `codemirror:select-next-occurrence` | Select Next Occurrence |
| `codemirror:toggle-block-comment` | Toggle Block Comment |
| `codemirror:toggle-comment` | Toggle Comment |
| `codemirror:toggle-tab-focus-mode` | Toggle Tab Focus Mode |
| `codemirror:unfold-all` | Unfold All Regions |
| `codemirror:unfold-current` | Unfold Current Region |
| `codemirror:unfold-subregions` | Unfold All Subregions |

## completer

| Command | Label |
| --- | --- |
| `completer:invoke-console` | Display the completion helper. |
| `completer:invoke-file` | Display the completion helper. |
| `completer:invoke-notebook` | Display the completion helper. |
| `completer:select-console` | Select the completion suggestion. |
| `completer:select-file` | Select the completion suggestion. |
| `completer:select-notebook` | Select the completion suggestion. |

## console

| Command | Label |
| --- | --- |
| `console:change-kernel` | Change Kernel… |
| `console:clear` | Clear Console Cells |
| `console:close-and-shutdown` | Close and Shut Down… |
| `console:create` | Console |
| `console:get-kernel` | Get Kernel |
| `console:inject` | Inject some code in a console. |
| `console:interaction-mode` | Set the console interaction mode. |
| `console:interrupt-kernel` | Interrupt Kernel |
| `console:linebreak` | Insert Line Break |
| `console:open` | Open a console for the provided `path`. |
| `console:prompt-to-bottom` | Prompt to bottom |
| `console:prompt-to-left` | Prompt to left |
| `console:prompt-to-right` | Prompt to right |
| `console:prompt-to-top` | Prompt to top |
| `console:redo` | Redo |
| `console:replace-selection` | Replace Selection in Console |
| `console:restart-kernel` | Restart Kernel… |
| `console:run-forced` | Run Cell (forced) |
| `console:run-unforced` | Run Cell (unforced) |
| `console:shutdown` | Shut Down |
| `console:toggle-autoclosing-brackets` | Auto Close Brackets for Code Console Prompt |
| `console:toggle-show-all-kernel-activity` | Show All Kernel Activity |
| `console:undo` | Undo |

## csv

| Command | Label |
| --- | --- |
| `csv:go-to-line` | Go to Line |

## debugger

| Command | Label |
| --- | --- |
| `debugger:continue` | Pause |
| `debugger:copy-to-clipboard` | Copy to Clipboard |
| `debugger:copy-to-globals` | Copy Variable to Globals |
| `debugger:evaluate` | Evaluate Code |
| `debugger:inspect-variable` | Inspect Variable |
| `debugger:invoke-console-completer` | Display the tab completion widget. |
| `debugger:next` | Next |
| `debugger:open-source` | Open Source |
| `debugger:pause-on-exceptions` | Breakpoints on exception |
| `debugger:render-mime-variable` | Render Variable |
| `debugger:restart-debug` | Restart Kernel and Debug… |
| `debugger:run-in-console` | Execute the current line in debug console. |
| `debugger:select-console-completion` | Select the completion suggestion. |
| `debugger:show-panel` | Debugger Panel |
| `debugger:stepIn` | Step In |
| `debugger:stepOut` | Step Out |
| `debugger:terminate` | Terminate |

## docmanager

| Command | Label |
| --- | --- |
| `docmanager:clear-recents` | Clear Recent Documents |
| `docmanager:clone` | New View for |
| `docmanager:delete` | Delete |
| `docmanager:delete-file` | Delete |
| `docmanager:download` | Download |
| `docmanager:duplicate` | Duplicate |
| `docmanager:new-untitled` | New undefined |
| `docmanager:open` | Open the provided `path`. |
| `docmanager:open-browser-tab` | Open in New Browser Tab |
| `docmanager:reload` | Reload  from Disk |
| `docmanager:rename` | Rename… |
| `docmanager:restore-checkpoint` | Revert  to Checkpoint… |
| `docmanager:save` | Save |
| `docmanager:save-all` | Save All |
| `docmanager:save-as` | Save  As… |
| `docmanager:show-in-file-browser` | Show in File Browser |
| `docmanager:toggle-autosave` | Autosave Documents |

## documentsearch

| Command | Label |
| --- | --- |
| `documentsearch:end` | End Search |
| `documentsearch:highlightNext` | Find Next |
| `documentsearch:highlightPrevious` | Find Previous |
| `documentsearch:start` | Find… |
| `documentsearch:startWithReplace` | Find and Replace… |
| `documentsearch:toggleSearchInSelection` | Search in Selection |

## editmenu

| Command | Label |
| --- | --- |
| `editmenu:clear-all` | Clear All |
| `editmenu:clear-current` | Clear |
| `editmenu:go-to-line` | Go to Line… |
| `editmenu:open` | Open Edit Menu |
| `editmenu:redo` | Redo |
| `editmenu:undo` | Undo |

## extensionmanager

| Command | Label |
| --- | --- |
| `extensionmanager:show-panel` | Extension Manager |
| `extensionmanager:toggle` | Enable Extension Manager |

## filebrowser

| Command | Label |
| --- | --- |
| `filebrowser:activate` | Open the file browser for the provided `path`. |
| `filebrowser:copy` | Copy |
| `filebrowser:copy-download-link` | Copy Download Link |
| `filebrowser:copy-path` | Copy Path |
| `filebrowser:create-new-directory` | New Folder |
| `filebrowser:create-new-file` | New File |
| `filebrowser:create-new-markdown-file` | New Markdown File |
| `filebrowser:cut` | Cut |
| `filebrowser:delete` | Move to Trash |
| `filebrowser:download` | Download |
| `filebrowser:duplicate` | Duplicate |
| `filebrowser:edit-path` | Edit File Browser Path |
| `filebrowser:go-to-path` | Update the file browser to display the provided `path`. |
| `filebrowser:go-up` | Go Up |
| `filebrowser:hide-main` | Hide the file browser. |
| `filebrowser:open` | Open |
| `filebrowser:open-browser-tab` | Open in New Browser Tab |
| `filebrowser:open-path` | Open from Path… |
| `filebrowser:open-url` | Open from URL… |
| `filebrowser:paste` | Paste |
| `filebrowser:refresh` | Refresh File List |
| `filebrowser:rename` | Rename |
| `filebrowser:select-all` | Select All |
| `filebrowser:share-main` | Copy Shareable Link |
| `filebrowser:shutdown` | Shut Down Kernel |
| `filebrowser:toggle-date-created` | Show Date Created Column |
| `filebrowser:toggle-file-checkboxes` | Show File Checkboxes |
| `filebrowser:toggle-file-filter` | Toggle File Filter |
| `filebrowser:toggle-file-size` | Show File Size Column |
| `filebrowser:toggle-hidden-files` | Show Hidden Files |
| `filebrowser:toggle-last-modified` | Show Last Modified Column |
| `filebrowser:toggle-main` | File Browser |
| `filebrowser:toggle-navigate-to-current-directory` | Show Active File in File Browser |
| `filebrowser:toggle-show-full-path` | Show Full Path |
| `filebrowser:toggle-single-click-navigation` | Enable Single Click Navigation |
| `filebrowser:toggle-sort-notebooks-first` | Sort Notebooks Above Files |

## fileeditor

| Command | Label |
| --- | --- |
| `fileeditor:change-font-size` | Change Font Size |
| `fileeditor:change-language` | Change editor language. |
| `fileeditor:change-tabs` | Indent with Tab |
| `fileeditor:change-theme` | jupyter |
| `fileeditor:copy` | Copy |
| `fileeditor:create-console` | Create Console for Editor |
| `fileeditor:create-new` | Text File |
| `fileeditor:create-new-markdown-file` | Markdown File |
| `fileeditor:cut` | Cut |
| `fileeditor:find` | Find… |
| `fileeditor:go-to-line` | Go to Line… |
| `fileeditor:markdown-preview` | Show Markdown Preview |
| `fileeditor:paste` | Paste |
| `fileeditor:redo` | Redo |
| `fileeditor:replace-selection` | Replace Selection in Editor |
| `fileeditor:restart-console` | Restart Kernel |
| `fileeditor:run-all` | Run All Code |
| `fileeditor:run-code` | Run Selected Code |
| `fileeditor:select-all` | Select All |
| `fileeditor:toggle-autoclosing-brackets` | Auto Close Brackets in Text Editor |
| `fileeditor:toggle-autoclosing-brackets-universal` | Auto Close Brackets |
| `fileeditor:toggle-current-line-numbers` | Show Line Numbers |
| `fileeditor:toggle-current-line-wrap` | Wrap Words |
| `fileeditor:toggle-current-match-brackets` | Match Brackets |
| `fileeditor:toggle-line-numbers` | Show Line Numbers |
| `fileeditor:toggle-line-wrap` | Word Wrap |
| `fileeditor:toggle-match-brackets` | Match Brackets |
| `fileeditor:undo` | Undo |

## filemenu

| Command | Label |
| --- | --- |
| `filemenu:close-and-cleanup` | Close and Shut Down |
| `filemenu:create-console` | New Console for Activity |
| `filemenu:logout` | Log Out |
| `filemenu:open` | Open File Menu |
| `filemenu:shutdown` | Shut Down |

## help

| Command | Label |
| --- | --- |
| `help:about` | About JupyterLab |
| `help:jupyter-forum` | Jupyter Forum |
| `help:license-report` | Download All Licenses |
| `help:licenses` | Licenses |
| `help:licenses-refresh` | Refresh Licenses |
| `help:open` | Open the provided `url` in a tab. |

## helpmenu

| Command | Label |
| --- | --- |
| `helpmenu:get-kernel` | Get Kernel |
| `helpmenu:open` | Open Help Menu |

## htmlviewer

| Command | Label |
| --- | --- |
| `htmlviewer:trust-html` | Trust HTML File |

## imageviewer

| Command | Label |
| --- | --- |
| `imageviewer:flip-horizontal` | Flip image horizontally |
| `imageviewer:flip-vertical` | Flip image vertically |
| `imageviewer:invert-colors` | Invert Colors |
| `imageviewer:reset-image` | Reset Image |
| `imageviewer:rotate-clockwise` | Rotate Clockwise |
| `imageviewer:rotate-counterclockwise` | Rotate Counterclockwise |
| `imageviewer:zoom-in` | Zoom In |
| `imageviewer:zoom-out` | Zoom Out |

## inline-completer

| Command | Label |
| --- | --- |
| `inline-completer:accept` | Accept Inline Completion |
| `inline-completer:invoke` | Invoke Inline Completer |
| `inline-completer:next` | Next Inline Completion |
| `inline-completer:previous` | Previous Inline Completion |

## inspector

| Command | Label |
| --- | --- |
| `inspector:close` | Hide Contextual Help |
| `inspector:open` | Show Contextual Help |
| `inspector:toggle` | Show Contextual Help |

## jupyterlab-translation

| Command | Label |
| --- | --- |
| `jupyterlab-translation:en` | English |
| `jupyterlab-translation:install-languages` | Install more languages… |

## kernelmenu

| Command | Label |
| --- | --- |
| `kernelmenu:change` | Change Kernel… |
| `kernelmenu:interrupt` | Interrupt Kernel |
| `kernelmenu:open` | Open Kernel Menu |
| `kernelmenu:reconnect-to-kernel` | Reconnect to Kernel |
| `kernelmenu:restart` | Restart Kernel… |
| `kernelmenu:restart-and-clear` | Restart Kernel and Clear… |
| `kernelmenu:shutdown` | Shut Down Kernel |
| `kernelmenu:shutdownAll` | Shut Down All Kernels… |

## launcher

| Command | Label |
| --- | --- |
| `launcher:create` | New Launcher |

## logconsole

| Command | Label |
| --- | --- |
| `logconsole:add-checkpoint` | Add Checkpoint |
| `logconsole:clear` | Clear Log |
| `logconsole:open` | Show Log Console |
| `logconsole:set-level` | Set log level to `level`. |

## mainmenu

| Command | Label |
| --- | --- |
| `mainmenu:open-first` | Open First Menu |

## markdownviewer

| Command | Label |
| --- | --- |
| `markdownviewer:edit` | Show Markdown Editor |
| `markdownviewer:open` | Markdown Preview |
| `markdownviewer:trust` | Trust Markdown Preview |

## mathjax

| Command | Label |
| --- | --- |
| `mathjax:clipboard` | MathJax Copy Latex |
| `mathjax:scale` | Mathjax Scale Reset |

## mermaid

| Command | Label |
| --- | --- |
| `mermaid:copy-source` | Mermaid Copy Diagram Source |

## notebook

| Command | Label |
| --- | --- |
| `notebook:access-next-history-entry` | Access Next Kernel History Entry |
| `notebook:access-previous-history-entry` | Access Previous Kernel History Entry |
| `notebook:change-cell-to-code` | Change to Code Cell Type |
| `notebook:change-cell-to-heading-1` | Change to Heading 1 |
| `notebook:change-cell-to-heading-2` | Change to Heading 2 |
| `notebook:change-cell-to-heading-3` | Change to Heading 3 |
| `notebook:change-cell-to-heading-4` | Change to Heading 4 |
| `notebook:change-cell-to-heading-5` | Change to Heading 5 |
| `notebook:change-cell-to-heading-6` | Change to Heading 6 |
| `notebook:change-cell-to-markdown` | Change to Markdown Cell Type |
| `notebook:change-cell-to-raw` | Change to Raw Cell Type |
| `notebook:change-kernel` | Change Kernel… |
| `notebook:clear-all-cell-outputs` | Clear Outputs of All Cells |
| `notebook:clear-cell-output` | Clear Cell Output |
| `notebook:close-and-shutdown` | Close and Shut Down Notebook… |
| `notebook:collapse-all-headings` | Collapse All Headings |
| `notebook:copy-cell` | Copy Cell |
| `notebook:copy-selected-text` | Copy Selected Text |
| `notebook:copy-to-clipboard` | Copy Output to Clipboard |
| `notebook:create-console` | New Console for Notebook |
| `notebook:create-new` | Notebook |
| `notebook:create-output-view` | Create New View for Cell Output |
| `notebook:create-subshell-console` | New Subshell Console for Notebook |
| `notebook:cut-cell` | Cut Cell |
| `notebook:cut-selected-text` | Cut Selected Text |
| `notebook:delete-cell` | Delete Cell |
| `notebook:deselect-all` | Deselect All Cells |
| `notebook:disable-output-scrolling` | Disable Scrolling for Outputs |
| `notebook:duplicate-below` | Duplicate Cell Below |
| `notebook:enable-output-scrolling` | Enable Scrolling for Outputs |
| `notebook:enter-command-mode` | Enter Command Mode |
| `notebook:enter-edit-mode` | Enter Edit Mode |
| `notebook:expand-all-headings` | Expand All Headings |
| `notebook:export-to-format` | Save and Export Notebook to the given `format`. |
| `notebook:extend-marked-cells-above` | Extend Selection Above |
| `notebook:extend-marked-cells-below` | Extend Selection Below |
| `notebook:extend-marked-cells-bottom` | Extend Selection to Bottom |
| `notebook:extend-marked-cells-top` | Extend Selection to Top |
| `notebook:get-kernel` | Get Kernel |
| `notebook:hide-all-cell-code` | Collapse All Code |
| `notebook:hide-all-cell-outputs` | Collapse All Outputs |
| `notebook:hide-cell-code` | Collapse Selected Code |
| `notebook:hide-cell-outputs` | Collapse Selected Outputs |
| `notebook:insert-cell-above` | Insert Cell Above |
| `notebook:insert-cell-below` | Insert Cell Below |
| `notebook:insert-heading-above` | Insert Heading Above Current Heading |
| `notebook:insert-heading-below` | Insert Heading Below Current Heading |
| `notebook:interrupt-kernel` | Interrupt Kernel |
| `notebook:merge-cell-above` | Merge Cell Above |
| `notebook:merge-cell-below` | Merge Cell Below |
| `notebook:merge-cells` | Merge Selected Cells |
| `notebook:move-cell-down` | Move Cell Down |
| `notebook:move-cell-up` | Move Cell Up |
| `notebook:move-cursor-down` | Select Cell Below |
| `notebook:move-cursor-heading-above-or-collapse` | Select Heading Above or Collapse Heading |
| `notebook:move-cursor-heading-below-or-expand` | Select Heading Below or Expand Heading |
| `notebook:move-cursor-up` | Select Cell Above |
| `notebook:paste-and-replace-cell` | Paste Cell and Replace |
| `notebook:paste-cell-above` | Paste Cell Above |
| `notebook:paste-cell-below` | Paste Cell Below |
| `notebook:paste-text` | Paste Text |
| `notebook:reconnect-to-kernel` | Reconnect to Kernel |
| `notebook:redo` | Redo |
| `notebook:redo-cell-action` | Redo Cell Operation |
| `notebook:render-all-markdown` | Render All Markdown Cells |
| `notebook:replace-selection` | Replace Selection in Notebook Cell |
| `notebook:restart-and-run-to-selected` | Restart Kernel and Run up to Selected Cell… |
| `notebook:restart-clear-output` | Restart Kernel and Clear Outputs of All Cells… |
| `notebook:restart-kernel` | Restart Kernel… |
| `notebook:restart-run-all` | Restart Kernel and Run All Cells… |
| `notebook:run-all-above` | Run All Above Selected Cell |
| `notebook:run-all-below` | Run Selected Cell and All Below |
| `notebook:run-all-cells` | Run All Cells |
| `notebook:run-cell` | Run Selected Cell and Do not Advance |
| `notebook:run-cell-and-insert-below` | Run Selected Cell and Insert Below |
| `notebook:run-cell-and-select-next` | Run Selected Cell |
| `notebook:run-in-console` | Run Selected Text or Current Line in Console |
| `notebook:select-all` | Select All Cells |
| `notebook:select-last-modified-cell` | Select Last Modified Cell |
| `notebook:select-last-run-cell` | Select current running or last run cell |
| `notebook:select-next-modified-cell` | Select Next Modified Cell |
| `notebook:set-side-by-side-ratio` | Set side-by-side ratio |
| `notebook:show-all-cell-code` | Expand All Code |
| `notebook:show-all-cell-outputs` | Expand All Outputs |
| `notebook:show-cell-code` | Expand Selected Code |
| `notebook:show-cell-outputs` | Expand Selected Outputs |
| `notebook:shutdown-kernel` | Shut Down Kernel |
| `notebook:split-cell-at-cursor` | Split Cell |
| `notebook:toggle-all-cell-line-numbers` | Show Line Numbers |
| `notebook:toggle-autoclosing-brackets` | Auto Close Brackets for All Notebook Cell Types |
| `notebook:toggle-cell-outputs` | Toggle Visibility of Selected Outputs |
| `notebook:toggle-heading-collapse` | Toggle Collapse Notebook Heading |
| `notebook:toggle-output-scrolling` | Toggle Scrolling for Outputs |
| `notebook:toggle-render-side-by-side-current` | Render Side-by-Side |
| `notebook:toggle-virtual-scrollbar` | Show Minimap |
| `notebook:trust` | Trust Notebook |
| `notebook:undo` | Undo |
| `notebook:undo-cell-action` | Undo Cell Operation |

## pluginmanager

| Command | Label |
| --- | --- |
| `pluginmanager:open` | Advanced Plugin Manager |
| `pluginmanager:refresh` | Refresh Plugin List |

## property-inspector

| Command | Label |
| --- | --- |
| `property-inspector:show-panel` | Property Inspector |

## recentmenu

| Command | Label |
| --- | --- |
| `recentmenu:open-recent` | Open a Recent Document (given by `recent` argument) |
| `recentmenu:reopen-last` | Reopen Closed Document |

## rendermime

| Command | Label |
| --- | --- |
| `rendermime:handle-local-link` | Handle Local Link |

## runmenu

| Command | Label |
| --- | --- |
| `runmenu:open` | Open Run Menu |
| `runmenu:restart-and-run-all` | Restart Kernel and Run All |
| `runmenu:run` | Run Selected |
| `runmenu:run-all` | Run All |

## running

| Command | Label |
| --- | --- |
| `running:kernel-new-console` | New Console for Kernel |
| `running:kernel-new-notebook` | New Notebook for Kernel |
| `running:kernel-open-session` | Unknown Session |
| `running:kernel-shut-down` | Shut Down Kernel |
| `running:kernel-shut-down-unused` | Shut Down Unused |
| `running:show-modal` | Search Tabs and Running Sessions |
| `running:show-panel` | Sessions and Tabs |

## settingeditor

| Command | Label |
| --- | --- |
| `settingeditor:export` | Export Settings |
| `settingeditor:import` | Import Settings |
| `settingeditor:open` | Settings Editor |
| `settingeditor:open-json` | Advanced Settings Editor |
| `settingeditor:revert` | Revert User Settings |
| `settingeditor:save` | Save User Settings |

## settingsmenu

| Command | Label |
| --- | --- |
| `settingsmenu:open` | Open Settings Menu |

## shortcuts

| Command | Label |
| --- | --- |
| `shortcuts:add-keybinding` | Add Keybinding |
| `shortcuts:delete-keybinding` | Delete Keybinding |
| `shortcuts:edit-keybinding` | Edit Keybinding |
| `shortcuts:reset-all` | Reset All |
| `shortcuts:toggle-selectors` | Toggle Selectors |

## sidebar

| Command | Label |
| --- | --- |
| `sidebar:switch` | Switch Sidebar Side |

## statusbar

| Command | Label |
| --- | --- |
| `statusbar:toggle` | Show Status Bar |

## tabsmenu

| Command | Label |
| --- | --- |
| `tabsmenu:activate-by-id` | Activate a widget by its `id`. |
| `tabsmenu:activate-previously-used-tab` | Activate Previously Used Tab |
| `tabsmenu:open` | Open Tabs Menu |

## terminal

| Command | Label |
| --- | --- |
| `terminal:copy` | Copy |
| `terminal:create-new` | Terminal |
| `terminal:decrease-font` | Decrease Terminal Font Size |
| `terminal:increase-font` | Increase Terminal Font Size |
| `terminal:open` | Open a terminal by its `name`. |
| `terminal:open-folder-in-terminal` | Open in Terminal |
| `terminal:paste` | Paste |
| `terminal:refresh` | Refresh Terminal |
| `terminal:set-theme` | Set terminal theme to the provided `theme`. |
| `terminal:shut-down` | Shutdown Terminal |

## toc

| Command | Label |
| --- | --- |
| `toc:display-h1-numbering` | Show first-level heading number |
| `toc:display-numbering` | Show heading number in the document |
| `toc:display-outputs-numbering` | Show output headings |
| `toc:run-cells` | Select and Run Cell(s) for this Heading |
| `toc:show-panel` | Table of Contents |
| `toc:toggle-collapse` | Collapse All Headings |

## tooltip

| Command | Label |
| --- | --- |
| `tooltip:dismiss` | Dismiss the tooltip |
| `tooltip:launch-console` | Open the tooltip |
| `tooltip:launch-file` | Open the tooltip |
| `tooltip:launch-notebook` | Open the tooltip |

## tsv

| Command | Label |
| --- | --- |
| `tsv:go-to-line` | Go to Line |

## viewmenu

| Command | Label |
| --- | --- |
| `viewmenu:line-numbering` | Show Line Numbers |
| `viewmenu:match-brackets` | Match Brackets |
| `viewmenu:open` | Open View Menu |
| `viewmenu:show-minimap` | Show Minimap |
| `viewmenu:word-wrap` | Wrap Words |

## workspace-indicator

| Command | Label |
| --- | --- |
| `workspace-indicator:toggle` | Show Workspace Indicator |

## workspace-ui

| Command | Label |
| --- | --- |
| `workspace-ui:clone` | Clone Workspace… |
| `workspace-ui:create-new` | Create New Workspace… |
| `workspace-ui:delete` | Delete Workspace… |
| `workspace-ui:export` | Export Workspace… |
| `workspace-ui:import` | Import Workspace… |
| `workspace-ui:open` | Open Workspace… |
| `workspace-ui:rename` | Rename Workspace… |
| `workspace-ui:reset` | Reset Workspace… |
| `workspace-ui:save` | Save Current Workspace |
| `workspace-ui:save-as` | Save Current Workspace As… |
