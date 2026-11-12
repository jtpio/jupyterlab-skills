---
name: jupyterlab-theming
description: Change the look of JupyterLab - colors, fonts, spacing, density, the style of tabs, toolbars, sidebars, notebook cells and the launcher, and which elements show. Use it to create a custom theme (light, dark, or a pair) without a build step, to set it as the default, to restyle or hide parts of the interface with CSS, to bundle fonts, and to choose between a theme, an extension stylesheet and custom.css. Gives a script that scaffolds a complete theme extension from a built-in theme, the catalog of theme CSS variables, and the selectors of the main interface parts. Use it for requests such as "make it look like…", "change the colors", "use this font", "dark mode by default", "make the UI more compact", "brand it".
compatibility: JupyterLab 4.x (tested with 4.6). The script needs the Python of an environment that has JupyterLab.
---

# Restyle JupyterLab

Three levels. Use the lowest one that does the job.

| Level | Use for | How |
| --- | --- | --- |
| **1. Select a theme** | A built-in or installed theme as the default | A setting. No CSS |
| **2. Stylesheet** | A few rules on top of any theme: hide an element, round the tabs, compact spacing | `style.css` of an extension, or `custom.css` for one user |
| **3. Theme extension** | A complete look: palette, fonts, optional dark variant. The user can select it in Settings → Theme | `scripts/new_theme.py` |

## Level 1: select a theme

Default override (skill `jupyterlab-settings`):

```json
{ "@jupyterlab/apputils-extension:themes": { "theme": "JupyterLab Dark" } }
```

Built-in: `JupyterLab Light`, `JupyterLab Dark`,
`JupyterLab Dark High Contrast`. Follow the system preference with
`"adaptive-theme": true` plus `preferred-light-theme` and
`preferred-dark-theme`. Other themes install with pip (search PyPI for
"jupyterlab theme"); the name to use is the one in Settings → Theme.

## Level 2: stylesheet

**For an environment or a distribution**: a stylesheet in an extension. It
loads for every user and ships in a package.

```bash
python ../jupyterlab-extensions/scripts/jlab_ext.py new my-style --dest ./extensions --style
```

Write the rules in `static/style.css`, install the extension, restart the
server once. Later edits need only a browser reload. If the skill
`jupyterlab-extensions` is not available, create the three files by hand: see
"Stylesheet-only extension" in
[references/selectors.md](references/selectors.md).

**For one user, quickly**: `custom.css`.

1. Write `<user config dir>/custom/custom.css` (`~/.jupyter/custom/custom.css`).
2. Start with `jupyter lab --custom-css`, or set `LabApp.custom_css = True`
   in `jupyter_server_config.json`.

`custom.css` is read from the user config folder only. It cannot ship in an
environment or a package.

Rules for both:

- Use the theme variables, not fixed colors, so that the rule works in light
  and dark themes: `background: var(--jp-layout-color2)`.
- Set a variable on `:root` to change it everywhere:
  `:root { --jp-border-radius: 6px; }`. A stylesheet of an extension loads
  before the theme, so a theme wins when both set the same variable on
  `:root`. Use `body` or `.jp-ThemedContainer` as the selector to win over
  the theme: `body { --jp-code-font-size: 14px; }`.
- Limit a rule to one theme with the attributes of `body`:
  `body[data-jp-theme-light="false"] …`,
  `body[data-jp-theme-name="JupyterLab Dark"] …`.
- Selectors of the main parts are in
  [references/selectors.md](references/selectors.md), with recipes: hide a
  sidebar tab, compact toolbars, rounded tabs, wider notebook, larger text.

## Level 3: theme extension

```bash
python scripts/new_theme.py my-theme --theme "Paper:light" --theme "Paper Night:dark" --dest ./extensions --python <env>/bin/python
```

Each `--theme` is `LABEL:BASE`, with `light` or `dark` as the base. The
script writes a no-build extension:

```
my-theme/
├── package.json
├── static/remoteEntry.js          registers the themes
└── themes/my-theme/
    ├── paper/
    │   ├── base.css               full copy of the built-in light theme
    │   └── index.css              your overrides
    └── paper-night/
        ├── base.css               full copy of the built-in dark theme
        └── index.css
```

1. Edit `index.css` of each theme. Redefine variables in `:root`, then add
   rules for what variables cannot reach. Do not edit `base.css`.
2. Install the folder into `share/jupyter/labextensions/`:
   `jlab_ext.py install` of the skill `jupyterlab-extensions`, or copy it
   there, or create it in the `labextensions/` folder of a distribution
   project.
3. Make it the default (skill `jupyterlab-settings`):

   ```json
   {
     "@jupyterlab/apputils-extension:themes": {
       "theme": "Paper",
       "adaptive-theme": false,
       "preferred-light-theme": "Paper",
       "preferred-dark-theme": "Paper Night"
     }
   }
   ```

4. Restart the server. Verify with the probe (skill `jupyterlab-verify`):
   `--expect-theme "Paper" --screenshot paper.png`. Open a notebook before the
   screenshot (`--exec 'notebook:create-new:{"kernelName":"python3"}'`): most
   of the variables show there.

Why the full copy: JupyterLab has no fallback values. A theme that defines
only its own colors leaves fonts, sizes and borders undefined, and the
interface breaks. `base.css` gives every variable a value; `index.css` loads
after it and wins.

### The variables that matter most

```css
:root {
  /*
   * Surfaces. 0: notebook and editor background. 1: panels, toolbars, menus.
   * 2: sidebars, tab bar, hover. 3: dock background, pressed. 4: strongest.
   */
  --jp-layout-color0: #fbf7ee;
  --jp-layout-color1: #fbf7ee;
  --jp-layout-color2: #f1ead9;
  --jp-layout-color3: #e2d8bf;
  --jp-layout-color4: #8a7f66;

  /*
   * Borders, from the strongest (0) to the faintest (3).
   */
  --jp-border-color0: #cdbf9f;
  --jp-border-color1: #d8ccb0;
  --jp-border-color2: #e6dcc6;
  --jp-border-color3: #efe7d6;
  --jp-border-radius: 4px;

  /*
   * Text of the interface. 0 is the strongest, 3 is for disabled items.
   */
  --jp-ui-font-color0: rgba(43, 38, 32, 1);
  --jp-ui-font-color1: rgba(43, 38, 32, 0.87);
  --jp-ui-font-color2: rgba(43, 38, 32, 0.6);
  --jp-ui-font-color3: rgba(43, 38, 32, 0.38);

  /*
   * Text of the content: Markdown cells and rendered output.
   */
  --jp-content-font-color0: rgba(43, 38, 32, 1);
  --jp-content-font-color1: rgba(43, 38, 32, 0.87);
  --jp-content-font-color2: rgba(43, 38, 32, 0.6);
  --jp-content-font-color3: rgba(43, 38, 32, 0.38);
  --jp-content-link-color: #b4532a;

  /*
   * Brand: selection, active tab, primary buttons, focus. 1 is the main one,
   * 0 is darker, 2 to 4 are lighter tints.
   */
  --jp-brand-color0: #8f3f1e;
  --jp-brand-color1: #b4532a;
  --jp-brand-color2: #d98b68;
  --jp-brand-color3: #f0cdbb;
  --jp-brand-color4: #f8e6dc;
  --jp-accent-color1: #2f7d6d;

  /*
   * Fonts: interface, content (Markdown), code.
   */
  --jp-ui-font-family: 'Inter', system-ui, sans-serif;
  --jp-ui-font-size1: 13px;
  --jp-content-font-family: 'Source Serif 4', Georgia, serif;
  --jp-content-font-size1: 16px;
  --jp-code-font-family: 'JetBrains Mono', monospace;
  --jp-code-font-size: 13px;

  /*
   * Cells.
   */
  --jp-cell-editor-background: #f4eedf;
  --jp-cell-editor-border-color: transparent;
  --jp-cell-editor-active-background: #fffdf7;
  --jp-cell-editor-active-border-color: var(--jp-brand-color1);
  --jp-notebook-multiselected-color: #f8e6dc;

  /*
   * Inverse surfaces: tooltips, dark badges.
   */
  --jp-inverse-layout-color0: #2b2620;
}
```

For a dark theme the scale runs the other way: `--jp-layout-color0` is the
darkest surface and the font colors are light.

Also restyle, when the palette changes a lot:

- **Editor syntax colors**: `--jp-mirror-editor-keyword-color`,
  `-string-color`, `-comment-color`, `-number-color`, `-def-color`,
  `-variable-color`, `-operator-color`, `-builtin-color`… (22 variables).
- **State colors**: `--jp-warn-color*`, `--jp-error-color*`,
  `--jp-success-color*`, `--jp-info-color*`.
- **Icons**: `--jp-icon-contrast-color0…3`, and the file type colors
  (`--jp-notebook-icon-color`, `--jp-jupyter-icon-color`).
- **Scrollbars**: `--jp-scrollbar-thumb-color`,
  `--jp-scrollbar-background-color`; they apply when the theme registers with
  `themeScrollbars: true` (in `THEMES` of `static/remoteEntry.js`). The
  built-in light theme leaves them empty: a light theme with themed
  scrollbars must set its own values.

The full list with the light and dark values:
[references/css-variables.md](references/css-variables.md).

### Fonts

Do not link to a font CDN: many JupyterLab installations have no internet
access, and the result differs between machines. Bundle the files.

1. Put `.woff2` files in the theme folder, for example
   `themes/my-theme/fonts/Inter-Variable.woff2`. Sources: the `@fontsource`
   packages on npm (`npm pack @fontsource-variable/inter`, then take the
   `files/*.woff2`), or the release files of the font project. Check that the
   license permits redistribution (the SIL Open Font License does).
2. Declare them at the top of `index.css`, with a path relative to the CSS
   file:

   ```css
   @font-face {
     font-family: 'Inter';
     font-style: normal;
     font-weight: 100 900;
     font-display: swap;
     src: url('../fonts/Inter-Variable.woff2') format('woff2');
   }
   ```

3. Use them: `--jp-ui-font-family: 'Inter', system-ui, sans-serif;`. Always
   keep a system fallback.

In a stylesheet-only extension, put the fonts in `static/fonts/` and use
`url('fonts/…')`.

### Rules beyond variables

A theme file can hold any CSS. Typical additions in `index.css`:

```css
/*
 * Flat tabs with an underline for the active one.
 */
.lm-DockPanel-tabBar .lm-TabBar-tab {
  border: none;
  background: transparent;
}
.lm-DockPanel-tabBar .lm-TabBar-tab.lm-mod-current {
  box-shadow: inset 0 -2px 0 var(--jp-brand-color1);
}

/*
 * Serif headings in Markdown cells.
 */
.jp-RenderedHTMLCommon h1,
.jp-RenderedHTMLCommon h2 {
  font-family: var(--jp-content-font-family);
  font-weight: 600;
}
```

Rules in a theme apply only while the theme is active. Rules that must hold
with every theme belong in a stylesheet (level 2).

Two themes of one extension can share rules: put them in
`themes/<name>/common.css` and start each `index.css` with
`@import url('../common.css');`.

In a distribution project, run `jlab_dist.py check --fix` after you add the
theme: it marks the extension as owned by the Python package.

## Check the result

- Probe with `--scale 2 --screenshot` and look at the image: the home page,
  an open notebook with a code cell, a Markdown cell and an output, the file
  browser, a menu, a dialog, the command palette, the settings editor.
- Check contrast: text on `layout-color1` and `layout-color2`, the selected
  row of the file browser (white text on `brand-color1`), disabled text.
- For a pair of themes, switch with
  `--exec 'apputils:change-theme:{"theme":"Paper Night"}'` and look again.
- `--fail-on-console-error`: a 404 on a font or CSS file shows as an error.
