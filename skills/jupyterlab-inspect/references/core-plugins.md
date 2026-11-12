# Core plugins

All 224 plugins of a stock JupyterLab 4.6.6, from the live application.
Other versions and installations differ: get the exact list with the browser probe
of the `jupyterlab-verify` skill, or with `jlab_inspect.py plugins`.

- **S**: the plugin has a settings schema (`jlab_inspect.py schema <id>`).
- **Provides**: the service token of the plugin. A replacement plugin must provide it.
- **Breaks**: plugins that fail to activate when this plugin is disabled, because
  they require its token (directly or through another plugin). Disable them too,
  or use a setting to hide the feature.

A package name alone (the heading) disables all the plugins of the package.

## @jupyterlab/application-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:commands` | S | Adds commands related to the shell. |  |  |
| `:context-menu` | S | Populates the context menu. |  |  |
| `:dirty` |  | Adds safeguard dialog when closing the browser tab with unsaved modifications. |  |  |
| `:faviconbusy` |  | Handles the favicon depending on the application status. |  |  |
| `:info` |  | Provides the application information. | IInfo | `@jupyterlab/pluginmanager-extension:plugin` |
| `:layout` |  | Provides the shell layout restorer. | ILayoutRestorer | `@jupyterlab/apputils-extension:palette-restorer` |
| `:logo` |  | Sets the application logo. |  |  |
| `:main` |  | Initializes the application and provides the URL tree path handler. | ITreePathUpdater |  |
| `:mimedocument` |  | Provides a mime document widget tracker. | IMimeDocumentTracker |  |
| `:move-widget` | S | Adds commands and context menu items to move widgets between areas. |  |  |
| `:notfound` |  | Defines the behavior for not found URL (aka route). |  |  |
| `:paths` |  | Provides the application paths. | IPaths | **118 plugins** (core service) |
| `:property-inspector` | S | Provides the property inspector. | IPropertyInspectorProvider |  |
| `:router` |  | Provides the URL router | IRouter | **22 plugins** (core service) |
| `:shell` | S | Provides the JupyterLab shell. It has an extended API compared to `app.shell`. | ILabShell | **11 plugins** (core service) |
| `:status` |  | Provides the application status. | ILabStatus | `@jupyterlab/application-extension:faviconbusy`, `@jupyterlab/settingeditor-extension:form-ui`, `@jupyterlab/settingeditor-extension:plugin` |
| `:top-bar` | S | Adds a toolbar to the top area (next to the main menu bar). |  |  |
| `:tree-resolver` |  | Provides the tree route resolver | ITreeResolver | `@jupyterlab/application-extension:main` |

## @jupyterlab/apputils-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:announcements` |  | Add the announcement feature. It will fetch news on the internet and check for application updates. |  |  |
| `:kernel-status` |  | Provides the kernel status indicator model. | IKernelStatusModel | `@jupyterlab/console-extension:kernel-status`, `@jupyterlab/notebook-extension:kernel-status` |
| `:kernels-settings` | S | Reserves the name for kernel settings. |  |  |
| `:licenses-client` |  | The licenses client plugin for fetching licenses. | ILicensesClient | `@jupyterlab/apputils-extension:licenses-plugin` |
| `:licenses-plugin` |  | Adds licenses reporting tools. |  |  |
| `:movable-section-registry` |  | Provides the movable section registry for panels that exchange moveable sections. | IMovableSectionRegistry |  |
| `:move-sections` |  | Enables moving sections between any registered source and target sidebars. |  |  |
| `:notification` | S | Add the notification center and its status indicator. |  |  |
| `:palette` | S | Provides the command palette. | ICommandPalette |  |
| `:palette-restorer` |  | Restores the command palette. |  |  |
| `:print` | S | Add the print capability |  |  |
| `:resolver` |  | Provides the window name resolver. | IWindowResolver | `@jupyterlab/application-extension:main`, `@jupyterlab/workspaces-extension:commands`, `@jupyterlab/workspaces-extension:sidebar`, `@jupyterlab/workspaces-extension:indicator`, `@jupyterlab/workspaces-extension:menu` |
| `:running-sessions-status` |  | Add the running sessions and terminals status bar item. |  |  |
| `:sanitizer` | S | Provides the HTML sanitizer. | ISanitizer | `@jupyterlab/debugger-extension:debug-console`, `@jupyterlab/notebook-extension:toc` |
| `:sessionDialogs` | S | Provides the session context dialogs. | ISessionContextDialogs |  |
| `:settings` |  | Provides the setting registry. | ISettingRegistry | **135 plugins** (core service) |
| `:settings-connector` |  | Provides the settings connector. | ISettingConnector |  |
| `:splash` |  | Provides the splash screen. | ISplashScreen |  |
| `:state` |  | Provides the application state. It is stored per workspaces. | IStateDB | **15 plugins** (core service) |
| `:subshell-settings` |  | Kernel subshell settings. |  |  |
| `:themes` | S | Provides the theme manager. | IThemeManager | `@jupyterlab/apputils-extension:themes-palette-menu`, `@jupyterlab/theme-dark-extension:plugin`, `@jupyterlab/theme-dark-high-contrast-extension:plugin`, `@jupyterlab/theme-light-extension:plugin` |
| `:themes-palette-menu` |  | Adds theme commands to the menu and the command palette. |  |  |
| `:toggle-header` |  | Adds a command to display the main area widget content header. |  |  |
| `:toolbar-registry` |  | Provides toolbar items registry. | IToolbarWidgetRegistry | **30 plugins** (core service) |
| `:utilityCommands` | S | Adds meta commands to run set of other commands. |  |  |
| `:workspaces` |  | Add workspace file type. |  |  |

## @jupyterlab/audio-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Adds a viewer for audio files |  |  |

## @jupyterlab/cell-toolbar-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Add the cells toolbar. |  |  |

## @jupyterlab/celltags-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds the cell tags editor. |  |  |

## @jupyterlab/codemirror-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:binding` |  | Register the CodeMirror extension factory binding the editor and the shared model. |  |  |
| `:commands` |  | Registers commands acting on selected/active CodeMirror editor. |  |  |
| `:extensions` |  | Provides the CodeMirror extension factory registry. | IEditorExtensionRegistry | **54 plugins** (core service) |
| `:languages` |  | Provides the CodeMirror languages registry. | IEditorLanguageRegistry | **54 plugins** (core service) |
| `:line-col-status` |  | Provides the code editor cursor position model. | IPositionModel | `@jupyterlab/console-extension:cursor-position`, `@jupyterlab/fileeditor-extension:cursor-position`, `@jupyterlab/notebook-extension:cursor-position` |
| `:services` |  | Provides the service to instantiate CodeMirror editors. | IEditorServices | **52 plugins** (core service) |
| `:themes` |  | Provides the CodeMirror theme registry | IEditorThemeRegistry | **55 plugins** (core service) |

## @jupyterlab/completer-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:base-service` |  | Adds context and kernel completion providers. |  |  |
| `:inline-completer` | S | Registers the inline completer factory; adds inline completer commands, shortcuts and settings. |  |  |
| `:inline-completer-factory` |  | Provides a factory for inline completer. | IInlineCompleterFactory | `@jupyterlab/completer-extension:inline-completer` |
| `:inline-history` |  | Adds inline completion provider suggesting code from execution history. |  |  |
| `:manager` | S | Provides the completion provider manager. | ICompletionProviderManager | `@jupyterlab/completer-extension:base-service`, `@jupyterlab/completer-extension:inline-history`, `@jupyterlab/completer-extension:inline-completer`, `@jupyterlab/debugger-extension:completions`, `@jupyterlab/debugger-extension:debug-console` |

## @jupyterlab/console-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:cell-executor` |  | Provides the console cell executor. | IConsoleCellExecutor | **9 plugins** (core service) |
| `:completer` | S | Adds completion to the console. |  |  |
| `:cursor-position` |  | Adds the console to the code editor cursor position model. |  |  |
| `:factory` |  | Provides the console widget content factory. | IContentFactory | **10 plugins** (core service) |
| `:foreign` | S | Add foreign handler of IOPub messages to the console. |  |  |
| `:kernel-status` |  | Adds the console to the kernel status indicator model. |  |  |
| `:tracker` | S | Provides the console widget tracker. | IConsoleTracker | **8 plugins** (core service) |

## @jupyterlab/csvviewer-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:csv` | S | Adds viewer for CSV file types |  |  |
| `:tsv` | S | Adds viewer for TSV file types. |  |  |

## @jupyterlab/debugger-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:completions` |  | Provides debugger-based completions. |  |  |
| `:config` |  | Provides the debugger configuration | IDebuggerConfig | **11 plugins** (core service) |
| `:consoles` |  | Add debugger capability to the consoles. |  |  |
| `:debug-console` |  | Debugger console to enable evaluation in debugger context. |  |  |
| `:display-registry` |  | Provides the debugger display registry for cell/file display names. | IDebuggerDisplayRegistry |  |
| `:files` |  | Adds debugger capabilities to files. |  |  |
| `:main` | S | Initialize the debugger user interface. |  |  |
| `:notebooks` |  | Adds debugger capability to notebooks and provides the debugger notebook handler. | IDebuggerHandler | `@jupyterlab/debugger-extension:variables` |
| `:service` |  | Provides the debugger service. | IDebugger | **9 plugins** (core service) |
| `:sidebar` |  | Provides the debugger sidebar. | IDebuggerSidebar | `@jupyterlab/debugger-extension:main` |
| `:source-viewer` |  | Initialize the debugger sources viewer. | IDebuggerSourceViewer |  |
| `:sources` |  | Provides the source feature for debugging | IDebuggerSources | `@jupyterlab/debugger-extension:source-viewer` |
| `:variables` |  | Adds variables renderer and inspection in the debugger variable panel. |  |  |

## @jupyterlab/docmanager-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:contexts` |  | Adds the handling of opened documents dirty state. |  |  |
| `:dialogs` |  | Provides default dialogs for document management operations. | IDocumentManagerDialogs |  |
| `:download` | S | Adds command to download files. |  |  |
| `:manager` |  | Provides the document manager. | IDocumentManager | **25 plugins** (core service) |
| `:open-browser-tab` |  | Adds command to open a browser tab. |  |  |
| `:opener` |  | Provides the widget opener. | IDocumentWidgetOpener | **26 plugins** (core service) |
| `:path-status` |  | Adds a file path indicator in the status bar. |  |  |
| `:plugin` | S | Adds commands and settings to the document manager. |  |  |
| `:recents` |  | Provides a manager of recently opened and closed documents. | IRecentsManager | `@jupyterlab/mainmenu-extension:recents`, `@jupyterlab/running-extension:recently-closed` |
| `:saving-status` |  | Adds a saving status indicator. |  |  |

## @jupyterlab/documentsearch-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:labShellWidgetListener` |  | Active search on valid document |  |  |
| `:plugin` | S | Provides the document search registry. | ISearchProviderRegistry | `@jupyterlab/documentsearch-extension:labShellWidgetListener`, `@jupyterlab/fileeditor-extension:search`, `@jupyterlab/notebook-extension:search` |

## @jupyterlab/extensionmanager-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds the extension manager plugin. |  |  |

## @jupyterlab/filebrowser-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:browser` | S | Set up the default file browser commands and state restoration | IFileBrowserCommands | `@jupyterlab/filebrowser-extension:widget` |
| `:create-new-language-file` |  | Adds context menu entries for creating Python/R/Julia files |  |  |
| `:default-file-browser` |  | Provides the default file browser | IDefaultFileBrowser | **9 plugins** (core service) |
| `:download` | S | Adds the download file commands. Disabling this plugin will NOT disable downloading files from the server, if the user enters the appropriate download URLs. |  |  |
| `:factory` |  | Provides the file browser factory. | IFileBrowserFactory | **17 plugins** (core service) |
| `:file-upload-status` |  | Adds a file upload status widget. |  |  |
| `:notify-upload` |  | Adds feature to auto-open supported files after upload |  |  |
| `:open-browser-tab` | S | Adds the open-in-new-browser-tab features. |  |  |
| `:open-url` |  | Adds the feature "Open files from remote URLs". |  |  |
| `:open-with` | S | Adds the open-with feature allowing an user to pick the non-preferred document viewer. |  |  |
| `:settings` |  | Set up the default file browser settings |  |  |
| `:share-file` |  | Adds the "Copy Shareable Link" command; useful for JupyterHub deployment for example. |  |  |
| `:widget` | S | Adds the file browser to the application shell. |  |  |

## @jupyterlab/fileeditor-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:completer` | S | Adds the completer capability to the file editor. |  |  |
| `:cursor-position` |  | Adds a file editor cursor position status widget. |  |  |
| `:editor-syntax-status` |  | Adds a file editor syntax status widget. |  |  |
| `:language-server` |  | Adds Language Server capability to the file editor. |  |  |
| `:plugin` | S | Provides the file editor widget tracker. | IEditorTracker | **7 plugins** (core service) |
| `:search` |  | Adds search capability to the file editor. |  |  |
| `:tab-space-status` |  | Adds a file editor indentation status widget. |  |  |
| `:widget-factory` |  | Provides the factory for creating file editors. | IEditorWidgetFactory | **8 plugins** (core service) |

## @jupyterlab/help-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:about` | S | Adds a "About" dialog feature. |  |  |
| `:jupyter-forum` | S | Adds command to open the Jupyter Forum website. |  |  |
| `:licenses-commands` |  | Add licenses commands for backwards compatibility. |  |  |
| `:open` |  | Add command to open websites as panel or browser tab. |  |  |
| `:resources` |  | Adds menu entries to Jupyter reference documentation websites. |  |  |

## @jupyterlab/htmlviewer-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds HTML file viewer and provides its tracker. | IHTMLViewerTracker |  |

## @jupyterlab/hub-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:connectionlost` |  | Provides a service to be notified when the connection to the hub server is lost. | IConnectionLost |  |
| `:menu` | S | Adds hub related commands to the menu. |  |  |
| `:plugin` |  | Registers commands related to the hub server |  |  |

## @jupyterlab/imageviewer-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds image viewer and provide its tracker. | IImageTracker |  |

## @jupyterlab/inspector-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:consoles` | S | Adds code introspection support to consoles. |  |  |
| `:inspector` | S | Provides the code introspection widget. | IInspector | `@jupyterlab/inspector-extension:consoles`, `@jupyterlab/inspector-extension:notebooks` |
| `:notebooks` | S | Adds code introspection to notebooks. |  |  |

## @jupyterlab/javascript-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:factory` |  | Adds renderer for JavaScript content. |  |  |

## @jupyterlab/json-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:factory` |  | Adds renderer for JSON content. |  |  |

## @jupyterlab/json-lines-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:factory` |  | Adds renderer for JSONLines content. |  |  |

## @jupyterlab/launcher-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Provides the launcher tab service. | ILauncher |  |

## @jupyterlab/logconsole-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Provides the logger registry. | ILoggerRegistry |  |

## @jupyterlab/lsp-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:code-extractor-manager` |  | Provides the code extractor manager. | ILSPCodeExtractorsManager | `@jupyterlab/fileeditor-extension:language-server`, `@jupyterlab/notebook-extension:language-server` |
| `:feature` |  | Provides the language server feature manager. | ILSPFeatureManager | `@jupyterlab/fileeditor-extension:language-server`, `@jupyterlab/notebook-extension:language-server` |
| `:plugin` | S | Provides the language server connection manager. | ILSPDocumentConnectionManager | `@jupyterlab/fileeditor-extension:language-server`, `@jupyterlab/lsp-extension:settings`, `@jupyterlab/notebook-extension:language-server` |
| `:settings` |  | Provides the language server settings. |  |  |
| `:tracker` |  | Provides the tracker of `WidgetLSPAdapter`. | IWidgetLSPAdapterTracker | `@jupyterlab/fileeditor-extension:language-server`, `@jupyterlab/lsp-extension:plugin`, `@jupyterlab/notebook-extension:language-server`, `@jupyterlab/lsp-extension:settings` |

## @jupyterlab/mainmenu-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds and provides the application main menu. | IMainMenu | `@jupyterlab/help-extension:resources`, `@jupyterlab/mainmenu-extension:recents` |
| `:recents` |  | Adds sub-menu for opening recent documents to the File section of the main menu. |  |  |

## @jupyterlab/markdownviewer-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds markdown file viewer and provides its tracker. | IMarkdownViewerTracker |  |

## @jupyterlab/markedparser-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Provides the Markdown parser. | IMarkdownParser |  |

## @jupyterlab/mathjax-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Provides the LaTeX mathematical expression interpreter. | ILatexTypesetter |  |

## @jupyterlab/mermaid-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:context-commands` |  | Provides context menu commands for mermaid diagrams. |  |  |
| `:core` |  | Provides the Mermaid manager. | IMermaidManager | `@jupyterlab/mermaid-extension:markdown`, `@jupyterlab/mermaid-extension:context-commands` |
| `:factory` |  | Provides a renderer for mermaid text-based diagrams. |  |  |
| `:markdown` |  | Provides the Mermaid markdown renderer. | IMermaidMarkdown |  |

## @jupyterlab/metadataform-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:metadataforms` | S | Provides the metadata form registry. | IMetadataFormProvider | `@jupyterlab/notebook-extension:update-raw-mimetype` |

## @jupyterlab/notebook-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:active-cell-tool` |  | Adds active cell field in the metadata editor tab. |  |  |
| `:cell-counter-status` |  | Adds a notebook cell counter status widget. |  |  |
| `:cell-executor` |  | Provides the notebook cell executor. | INotebookCellExecutor | **26 plugins** (core service) |
| `:cloned-outputs` |  | Adds the clone output feature. |  |  |
| `:code-console` |  | Adds the notebook code consoles features. |  |  |
| `:completer` | S | Adds the code completion capability to notebooks. |  |  |
| `:copy-output` |  | Adds the copy cell outputs feature. |  |  |
| `:cursor-position` |  | Adds the notebook cursor position status. |  |  |
| `:execution-indicator` |  | Adds a notebook execution status widget. |  |  |
| `:export` | S | Adds the export notebook commands. |  |  |
| `:factory` |  | Provides the notebook and cell factory. | IContentFactory | **27 plugins** (core service) |
| `:kernel-status` |  | Adds the notebook kernel status. |  |  |
| `:language-server` |  | Adds language server capability to the notebooks. |  |  |
| `:log-output` |  | Adds cell outputs log to the application logger. |  |  |
| `:metadata-editor` |  | Adds metadata form for full metadata editor. |  |  |
| `:mode-status` |  | Adds a notebook mode status widget. |  |  |
| `:open-with-no-kernel` |  | Adds the "Notebook (no kernel)" option to the Open With menu. |  |  |
| `:search` |  | Adds search capability to notebooks. |  |  |
| `:toc` |  | Adds table of content capability to the notebooks |  |  |
| `:tools` | S | Provides the notebook tools. | INotebookTools | `@jupyterlab/metadataform-extension:metadataforms`, `@jupyterlab/notebook-extension:update-raw-mimetype` |
| `:tracker` | S | Provides the notebook widget tracker. | INotebookTracker | **25 plugins** (core service) |
| `:trust-status` |  | Adds the notebook trusted status widget. |  |  |
| `:update-raw-mimetype` |  | Adds metadata form editor for raw cell mimetype. |  |  |
| `:widget-factory` |  | Provides the notebook widget factory. | INotebookWidgetFactory | **26 plugins** (core service) |

## @jupyterlab/pdf-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:factory` |  | Adds renderer for PDF content. |  |  |

## @jupyterlab/pluginmanager-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Enable or disable individual plugins. | IPluginManager |  |

## @jupyterlab/rendermime-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Provides the render mime registry. | IRenderMimeRegistry | **46 plugins** (core service) |

## @jupyterlab/running-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Provides the running session managers. | IRunningSessionManagers | `@jupyterlab/running-extension:sidebar`, `@jupyterlab/running-extension:recently-closed`, `@jupyterlab/running-extension:search-tabs`, `@jupyterlab/workspaces-extension:sidebar` |
| `:recently-closed` |  | Adds recently closed documents list. |  |  |
| `:search-tabs` |  | Adds a widget to search open and closed tabs. |  |  |
| `:sidebar` |  | Provides the running session sidebar. | IRunningSessionsSidebar |  |

## @jupyterlab/services-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:config-section-manager` |  | Provides the config section manager. | IConfigSectionManager |  |
| `:connection-status` |  | Provides the default connection status. | IConnectionStatus |  |
| `:content-provider-warning` |  | Warn if user is overwriting the deprecated contentprovider plugin. |  |  |
| `:contents-manager` |  | The default contents manager plugin. | IContentsManager |  |
| `:default-content-provider` |  | The default content provider for the contents manager. | IDefaultContentProvider | `@jupyterlab/services-extension:content-provider-warning` |
| `:default-drive` |  | The default drive for the contents manager. | IDefaultDrive | `@jupyterlab/audio-extension:plugin`, `@jupyterlab/services-extension:contents-manager`, `@jupyterlab/video-extension:plugin` |
| `:event-manager` |  | The event manager plugin. | IEventManager |  |
| `:kernel-manager` |  | The kernel manager plugin. | IKernelManager | `@jupyterlab/services-extension:session-manager` |
| `:kernel-spec-manager` |  | The kernel spec manager plugin. | IKernelSpecManager |  |
| `:nbconvert-manager` |  | The nbconvert manager plugin. | INbConvertManager |  |
| `:server-settings` |  | The default server settings plugin. | IServerSettings | `@jupyterlab/services-extension:contents-manager` |
| `:service-manager` |  | The default service manager plugin. | IServiceManager |  |
| `:session-manager` |  | The session manager plugin. | ISessionManager |  |
| `:setting-manager` |  | The setting manager plugin. | ISettingManager |  |
| `:terminal-manager` |  | The terminal manager plugin. | ITerminalManager |  |
| `:user-manager` |  | The user manager plugin. | IUserManager |  |
| `:workspace-manager` |  | The workspace manager plugin. | IWorkspaceManager |  |

## @jupyterlab/settingeditor-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:form-ui` | S | Adds the interactive settings editor and provides its tracker. | ISettingEditorTracker |  |
| `:plugin` | S | Adds the JSON settings editor and provides its tracker. | IJSONSettingEditorTracker |  |

## @jupyterlab/shortcuts-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:shortcuts` | S | Adds the keyboard shortcuts editor. |  |  |

## @jupyterlab/statusbar-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Provides the application status bar. | IStatusBar | `@jupyterlab/apputils-extension:kernel-status`, `@jupyterlab/apputils-extension:running-sessions-status`, `@jupyterlab/console-extension:kernel-status`, `@jupyterlab/notebook-extension:kernel-status` |

## @jupyterlab/terminal-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:open-folder-in-terminal` |  | Adds an "Open in Terminal" command for the file browser. |  |  |
| `:plugin` | S | Adds terminal and provides its tracker. | ITerminalTracker | `@jupyterlab/terminal-extension:open-folder-in-terminal` |

## @jupyterlab/theme-dark-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Adds a dark theme. |  |  |

## @jupyterlab/theme-dark-high-contrast-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Adds a dark high contrast theme. |  |  |

## @jupyterlab/theme-light-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Adds a light theme. |  |  |

## @jupyterlab/toc-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:registry` | S | Provides the table of contents registry. | ITableOfContentsRegistry | `@jupyterlab/notebook-extension:toc`, `@jupyterlab/toc-extension:tracker` |
| `:tracker` |  | Adds the table of content widget and provides its tracker. | ITableOfContentsTracker |  |

## @jupyterlab/tooltip-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:consoles` | S | Adds the tooltip capability to consoles. |  |  |
| `:files` | S | Adds the tooltip capability to file editors. |  |  |
| `:manager` |  | Provides the tooltip manager. | ITooltipManager | `@jupyterlab/tooltip-extension:consoles`, `@jupyterlab/tooltip-extension:notebooks`, `@jupyterlab/tooltip-extension:files` |
| `:notebooks` | S | Adds the tooltip capability to notebooks. |  |  |

## @jupyterlab/translation-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` | S | Adds translation commands and settings. |  |  |
| `:translator` |  | Provides the application translation object. | ITranslator | **113 plugins** (core service) |
| `:translator-connector` |  | Provides the application translation connector. | ITranslatorConnector | `@jupyterlab/translation-extension:plugin` |

## @jupyterlab/ui-components-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:form-renderer-registry` |  | Provides the settings form renderer registry. | IFormRendererRegistry | `@jupyterlab/metadataform-extension:metadataforms`, `@jupyterlab/notebook-extension:metadata-editor`, `@jupyterlab/notebook-extension:active-cell-tool`, `@jupyterlab/settingeditor-extension:form-ui`, `@jupyterlab/notebook-extension:update-raw-mimetype` |
| `:labicon-manager` |  | Provides the icon manager. | ILabIconManager |  |

## @jupyterlab/vega5-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:factory` |  | Provides a renderer for Vega 5 and Vega-Lite 3 to 5 content. |  |  |

## @jupyterlab/video-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  | Adds a viewer for video files |  |  |

## @jupyterlab/workspaces-extension

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:commands` |  | Add workspace commands. | IWorkspaceCommands | `@jupyterlab/workspaces-extension:sidebar`, `@jupyterlab/workspaces-extension:menu`, `@jupyterlab/workspaces-extension:indicator` |
| `:indicator` | S | Adds a workspace indicator element at topbar |  |  |
| `:menu` | S | Populates "File" main menu with Workspaces submenu. |  |  |
| `:model` |  | Provides a model for available workspaces. | IWorkspacesModel | `@jupyterlab/workspaces-extension:commands`, `@jupyterlab/workspaces-extension:sidebar`, `@jupyterlab/workspaces-extension:indicator`, `@jupyterlab/workspaces-extension:menu` |
| `:sidebar` | S | Populates running sidebar with workspaces. |  |  |

## jupyterlab_pygments

| Plugin | S | Description | Provides | Breaks |
| --- | --- | --- | --- | --- |
| `:plugin` |  |  |  |  |
