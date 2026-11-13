# Selectors and CSS recipes

Selectors of the main parts of the JupyterLab 4.6 interface. All were found
in a running application. Class names with the prefix `lm-` come from Lumino
(the layout library), those with `jp-` from JupyterLab.

## Map of the interface

| Part | Selector |
| --- | --- |
| Whole application | `body`, `.jp-ThemedContainer` |
| Top bar (logo, menus, top toolbar) | `#jp-top-panel` |
| Logo | `#jp-MainLogo` |
| Menu bar | `#jp-menu-panel`, `#jp-MainMenu`; one menu: `.lm-MenuBar-item` |
| Open menu | `.lm-Menu`, item `.lm-Menu-item` |
| Top toolbar (right of the menus) | `#jp-top-bar` |
| Title in simple mode | `#jp-title-panel-title` |
| Area below the top bar | `#jp-main-content-panel` |
| Left / right activity bar | `.jp-SideBar.jp-mod-left`, `.jp-SideBar.jp-mod-right` |
| One sidebar tab | `.jp-SideBar .lm-TabBar-tab[data-id="filebrowser"]` (the widget ID) |
| Left / right panel content | `#jp-left-stack`, `#jp-right-stack` |
| Main work area | `#jp-main-dock-panel` |
| Tab bar of the main area | `.lm-DockPanel-tabBar` |
| One tab; the active tab | `.lm-TabBar-tab`, `.lm-TabBar-tab.lm-mod-current` |
| "+" button of a tab bar | `.lm-TabBar-addButton` |
| A document or panel in the main area | `.jp-MainAreaWidget` |
| Any toolbar; a toolbar item; a toolbar button | `.jp-Toolbar`, `.jp-Toolbar-item`, `.jp-ToolbarButtonComponent` |
| Divider between two panels | `.lm-SplitPanel-handle`, `.lm-DockPanel-handle` |
| A hidden Lumino widget | `.lm-mod-hidden` |
| Bottom panel (log console, terminals moved down) | `#jp-down-stack` |
| Status bar | `#jp-main-statusbar` |
| Notebook panel; its toolbar | `.jp-NotebookPanel`, `.jp-NotebookPanel-toolbar` |
| Notebook scroll area | `.jp-Notebook`, `.jp-WindowedPanel-outer` |
| A cell; code cell; Markdown cell | `.jp-Cell`, `.jp-CodeCell`, `.jp-MarkdownCell` |
| Active / selected cell | `.jp-Cell.jp-mod-active`, `.jp-Cell.jp-mod-selected` |
| Cell collapser (blue bar at the left) | `.jp-Collapser` |
| Input prompt `[1]:` | `.jp-InputPrompt`; output prompt `.jp-OutputPrompt` |
| Cell editor | `.jp-InputArea-editor`, `.cm-editor` |
| Cell toolbar (inside the active cell) | `.jp-cell-toolbar` |
| Output | `.jp-OutputArea`, `.jp-OutputArea-output` |
| Rendered Markdown and HTML | `.jp-RenderedHTMLCommon`, `.jp-RenderedMarkdown` |
| File browser; its toolbar | `.jp-FileBrowser`, `.jp-FileBrowser-toolbar` |
| Path of the file browser | `.jp-BreadCrumbs` |
| File list; one row | `.jp-DirListing`, `.jp-DirListing-item` |
| Launcher; section title; card | `.jp-Launcher`, `.jp-Launcher-sectionTitle`, `.jp-LauncherCard` |
| Command palette | `.lm-CommandPalette`, modal: `.jp-ModalCommandPalette` |
| Dialog | `.jp-Dialog`, `.jp-Dialog-content` |
| Text editor | `.jp-FileEditor` |
| Terminal | `.jp-Terminal` |
| Settings editor | `.jp-SettingsPanel` |

A toolbar button is a `jp-button` web component: its inner parts are in a
shadow DOM. Size, margin and color on the element work; layout rules for its
content (`gap`) do not reach inside. In the probe, click it with
`--click '<toolbar item selector> jp-button'`. Each toolbar also has one
hidden item, `toolbar-popup-opener`: count the visible items only. One
item by its name: `[data-jp-item-name="restart-and-run"]`, with the names of
`jlab_inspect.py toolbars`.

Find more with the browser developer tools, or with the probe:
`--eval "document.querySelector('<selector>').outerHTML.slice(0, 500)"`.

`body` carries the state of the theme:
`data-jp-theme-name="JupyterLab Light"`, `data-jp-theme-light="true"`,
`data-jp-theme-scrollbars="false"`. The shell carries the mode:
`#main[data-shell-mode="single-document"]`.

## Recipes

Each recipe is plain CSS for `static/style.css` of an extension, for
`custom.css`, or for the `index.css` of a theme.

Hide one sidebar tab (the feature stays available from the View menu):

```css
.jp-SideBar .lm-TabBar-tab[data-id='jp-running-sessions'] {
  display: none;
}
```

Widget IDs: `filebrowser`, `jp-running-sessions`, `table-of-contents`,
`extensionmanager.main-view`, `jp-property-inspector`, `jp-debugger-sidebar`.

Do not hide the status bar, the top bar or the activity bars with
`display: none`: Lumino computes the layout in JavaScript, and the hidden bar
leaves a gap or shifts the tab bar. Use these instead:

| Bar | How |
| --- | --- |
| Status bar | Setting `visible: false` of `@jupyterlab/statusbar-extension:plugin` |
| Activity bars | An activity bar without tabs does not show: disable the plugins of its tabs. The command `application:toggle-side-tabbar` toggles the left one, and the right one with the args `{"side": "right"}` |
| Top bar | In simple mode only: command `application:toggle-header`. In the default mode it stays: restyle it, or remove its content (logo plugin, menus) |

Smaller toolbars:

```css
body {
  --jp-toolbar-micro-height: 4px;
}
.jp-Toolbar {
  min-height: 26px;
}
```

Rounded, flat tabs:

```css
.lm-DockPanel-tabBar .lm-TabBar-tab {
  border: none;
  border-radius: 6px 6px 0 0;
  margin-right: 2px;
}
.lm-DockPanel-tabBar .lm-TabBar-tab.lm-mod-current {
  background: var(--jp-layout-color1);
}
```

Centered, narrower notebook:

```css
.jp-Notebook .jp-WindowedPanel-outer {
  box-sizing: border-box;
  padding-left: max(20px, calc((100% - 900px) / 2)) !important;
  padding-right: max(20px, calc((100% - 900px) / 2)) !important;
}
```

Hide the input prompts and the collapser bar:

```css
.jp-InputPrompt,
.jp-OutputPrompt {
  display: none;
}
.jp-Collapser {
  visibility: hidden;
}
```

Larger text everywhere:

```css
body {
  --jp-ui-font-size1: 15px;
  --jp-content-font-size1: 17px;
  --jp-code-font-size: 15px;
}
```

Outline (table of contents) items. They are web components: the theme
variables do not reach their background, which stays white or grey. Style the
shadow part:

```css
.jp-TableOfContents-content .jp-tocItem,
.jp-TableOfContents-content .jp-tocItem::part(positioning-region) {
  background: transparent;
}
.jp-TableOfContents-content .jp-tocItem::part(positioning-region):hover,
.jp-TableOfContents-content .jp-tocItem[selected]::part(positioning-region) {
  background: var(--jp-layout-color2);
}
```

Other parts of the interface that use the same web components (tree views,
some buttons and fields of the settings editor) take colors from the tokens
of the Jupyter UI toolkit (`--neutral-fill-stealth-rest`, `--accent-fill-rest`…).
When an element ignores the `--jp-` variables, inspect it:
`--eval "getComputedStyle(document.querySelector('<selector>')).backgroundColor"`.

Round the launcher cards:

```css
.jp-LauncherCard {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid var(--jp-border-color2);
}
```

Give the menus and dialogs a softer look:

```css
.lm-Menu {
  border-radius: 8px;
  padding: 4px;
}
.jp-Dialog-content {
  border-radius: 10px;
}
```

## Notes on layout

Lumino positions the panels with absolute coordinates that it computes in
JavaScript. CSS that changes the **size or visibility** of a panel (`width`,
`height`, `margin`, `display: none` on the top bar, the status bar, the
sidebars, `#jp-left-stack`, the dock panel) gives overlaps or gaps. Change
those through settings and commands. Colors, borders, fonts, shadows, radius,
and `display: none` on elements inside a panel (a tab, a button, a prompt)
are safe.

## Stylesheet-only extension

Without the script of the skill `jupyterlab-extensions`, create three files in
`<prefix>/share/jupyter/labextensions/my-style/`:

`package.json`:

```json
{
  "name": "my-style",
  "version": "0.1.0",
  "jupyterlab": {
    "extension": true,
    "_build": { "load": "static/remoteEntry.js?v=1", "extension": "./extension" }
  }
}
```

The browser keeps the files of `static/` for one year. Change the value of
`?v=` after each edit of a file in `static/`: only a new URL loads it again.

`static/remoteEntry.js`:

```js
(function () {
  const NAME = 'my-style';
  const config = JSON.parse(
    document.getElementById('jupyter-config-data').textContent || '{}'
  );
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // The "?v=..." of this file, so that the stylesheet has a new URL too.
  const stamp = new URL(document.currentScript.src).search;
  link.href = `${config.fullLabextensionsUrl}/${NAME}/static/style.css${stamp}`;
  document.head.appendChild(link);

  window._JUPYTERLAB = window._JUPYTERLAB || {};
  window._JUPYTERLAB[NAME] = {
    init: async () => undefined,
    get: async () => () => ({ __esModule: true, default: [] })
  };
})();
```

`static/style.css`: your rules.
