# Theme variables

All CSS variables that the built-in themes of JupyterLab 4.6.6 define, with
the light and dark values. A theme must define all of them: `new_theme.py`
copies them into `base.css`, and you override some in `index.css`.

Many values refer to other variables or to the Material palette
(`var(--md-grey-300,#e0e0e0)`: the fallback after the comma is the real
color). Change the variables at the start of a chain and the rest follows.

## Layout and surfaces

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-shadow-base-lightness` | `0` | `32` |
| `--jp-shadow-umbra-color` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .2)` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .2)` |
| `--jp-shadow-penumbra-color` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .14)` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .14)` |
| `--jp-shadow-ambient-color` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .12)` | `rgba(var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), var(--jp-shadow-base-lightness), .12)` |
| `--jp-elevation-z0` | `none` | `none` |
| `--jp-elevation-z1` | `0 2px 1px -1px var(--jp-shadow-umbra-color), 0 1px 1px 0 var(--jp-shadow-penumbra-color), 0 1px 3px 0 var(--jp-shadow-ambient-color)` | `0 2px 1px -1px var(--jp-shadow-umbra-color), 0 1px 1px 0 var(--jp-shadow-penumbra-color), 0 1px 3px 0 var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z2` | `0 3px 1px -2px var(--jp-shadow-umbra-color), 0 2px 2px 0 var(--jp-shadow-penumbra-color), 0 1px 5px 0 var(--jp-shadow-ambient-color)` | `0 3px 1px -2px var(--jp-shadow-umbra-color), 0 2px 2px 0 var(--jp-shadow-penumbra-color), 0 1px 5px 0 var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z4` | `0 2px 4px -1px var(--jp-shadow-umbra-color), 0 4px 5px 0 var(--jp-shadow-penumbra-color), 0 1px 10px 0 var(--jp-shadow-ambient-color)` | `0 2px 4px -1px var(--jp-shadow-umbra-color), 0 4px 5px 0 var(--jp-shadow-penumbra-color), 0 1px 10px 0 var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z6` | `0 3px 5px -1px var(--jp-shadow-umbra-color), 0 6px 10px 0 var(--jp-shadow-penumbra-color), 0 1px 18px 0 var(--jp-shadow-ambient-color)` | `0 3px 5px -1px var(--jp-shadow-umbra-color), 0 6px 10px 0 var(--jp-shadow-penumbra-color), 0 1px 18px 0 var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z8` | `0 5px 5px -3px var(--jp-shadow-umbra-color), 0 8px 10px 1px var(--jp-shadow-penumbra-color), 0 3px 14px 2px var(--jp-shadow-ambient-color)` | `0 5px 5px -3px var(--jp-shadow-umbra-color), 0 8px 10px 1px var(--jp-shadow-penumbra-color), 0 3px 14px 2px var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z12` | `0 7px 8px -4px var(--jp-shadow-umbra-color), 0 12px 17px 2px var(--jp-shadow-penumbra-color), 0 5px 22px 4px var(--jp-shadow-ambient-color)` | `0 7px 8px -4px var(--jp-shadow-umbra-color), 0 12px 17px 2px var(--jp-shadow-penumbra-color), 0 5px 22px 4px var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z16` | `0 8px 10px -5px var(--jp-shadow-umbra-color), 0 16px 24px 2px var(--jp-shadow-penumbra-color), 0 6px 30px 5px var(--jp-shadow-ambient-color)` | `0 8px 10px -5px var(--jp-shadow-umbra-color), 0 16px 24px 2px var(--jp-shadow-penumbra-color), 0 6px 30px 5px var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z20` | `0 10px 13px -6px var(--jp-shadow-umbra-color), 0 20px 31px 3px var(--jp-shadow-penumbra-color), 0 8px 38px 7px var(--jp-shadow-ambient-color)` | `0 10px 13px -6px var(--jp-shadow-umbra-color), 0 20px 31px 3px var(--jp-shadow-penumbra-color), 0 8px 38px 7px var(--jp-shadow-ambient-color)` |
| `--jp-elevation-z24` | `0 11px 15px -7px var(--jp-shadow-umbra-color), 0 24px 38px 3px var(--jp-shadow-penumbra-color), 0 9px 46px 8px var(--jp-shadow-ambient-color)` | `0 11px 15px -7px var(--jp-shadow-umbra-color), 0 24px 38px 3px var(--jp-shadow-penumbra-color), 0 9px 46px 8px var(--jp-shadow-ambient-color)` |
| `--jp-border-width` | `1px` | `1px` |
| `--jp-border-color0` | `var(--md-grey-400,#bdbdbd)` | `var(--md-grey-700,#616161)` |
| `--jp-border-color1` | `var(--md-grey-400,#bdbdbd)` | `var(--md-grey-700,#616161)` |
| `--jp-border-color2` | `var(--md-grey-300,#e0e0e0)` | `var(--md-grey-800,#424242)` |
| `--jp-border-color3` | `var(--md-grey-200,#eee)` | `var(--md-grey-900,#212121)` |
| `--jp-inverse-border-color` | `var(--md-grey-600,#757575)` | `var(--md-grey-600,#757575)` |
| `--jp-border-radius` | `2px` | `2px` |
| `--jp-layout-color0` | `white` | `#111` |
| `--jp-layout-color1` | `white` | `var(--md-grey-900,#212121)` |
| `--jp-layout-color2` | `var(--md-grey-200,#eee)` | `var(--md-grey-800,#424242)` |
| `--jp-layout-color3` | `var(--md-grey-400,#bdbdbd)` | `var(--md-grey-700,#616161)` |
| `--jp-layout-color4` | `var(--md-grey-600,#757575)` | `var(--md-grey-600,#757575)` |
| `--jp-inverse-layout-color0` | `#111` | `white` |
| `--jp-inverse-layout-color1` | `var(--md-grey-900,#212121)` | `white` |
| `--jp-inverse-layout-color2` | `var(--md-grey-800,#424242)` | `var(--md-grey-200,#eee)` |
| `--jp-inverse-layout-color3` | `var(--md-grey-700,#616161)` | `var(--md-grey-400,#bdbdbd)` |
| `--jp-inverse-layout-color4` | `var(--md-grey-600,#757575)` | `var(--md-grey-600,#757575)` |
| `--jp-scrollbar-background-color` | `` | `#3f4244` |
| `--jp-scrollbar-thumb-color` | `` | `104, 112, 114` |
| `--jp-scrollbar-endpad` | `` | `3px` |
| `--jp-scrollbar-thumb-margin` | `` | `3.5px` |
| `--jp-scrollbar-thumb-radius` | `` | `9px` |

## Brand, accent and state colors

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-brand-color0` | `var(--md-blue-900,#0d47a1)` | `var(--md-blue-700,#1976d2)` |
| `--jp-brand-color1` | `var(--md-blue-700,#1976d2)` | `var(--md-blue-500,#2196f3)` |
| `--jp-brand-color2` | `var(--md-blue-300,#64b5f6)` | `var(--md-blue-300,#64b5f6)` |
| `--jp-brand-color3` | `var(--md-blue-100,#bbdefb)` | `var(--md-blue-100,#bbdefb)` |
| `--jp-brand-color4` | `var(--md-blue-50,#e3f2fd)` | `var(--md-blue-50,#e3f2fd)` |
| `--jp-accent-color0` | `var(--md-green-900,#1b5e20)` | `var(--md-green-700,#388e3c)` |
| `--jp-accent-color1` | `var(--md-green-700,#388e3c)` | `var(--md-green-500,#4caf50)` |
| `--jp-accent-color2` | `var(--md-green-300,#81c784)` | `var(--md-green-300,#81c784)` |
| `--jp-accent-color3` | `var(--md-green-100,#c8e6c9)` | `var(--md-green-100,#c8e6c9)` |
| `--jp-warn-color0` | `var(--md-orange-900,#e65100)` | `var(--md-orange-700,#f57c00)` |
| `--jp-warn-color1` | `var(--md-orange-700,#f57c00)` | `var(--md-orange-500,#ff9800)` |
| `--jp-warn-color2` | `var(--md-orange-300,#ffb74d)` | `var(--md-orange-300,#ffb74d)` |
| `--jp-warn-color3` | `var(--md-orange-100,#ffe0b2)` | `var(--md-orange-100,#ffe0b2)` |
| `--jp-error-color0` | `var(--md-red-900,#b71c1c)` | `var(--md-red-700,#d32f2f)` |
| `--jp-error-color1` | `var(--md-red-700,#d32f2f)` | `var(--md-red-500,#f44336)` |
| `--jp-error-color2` | `var(--md-red-300,#e57373)` | `var(--md-red-300,#e57373)` |
| `--jp-error-color3` | `var(--md-red-100,#ffcdd2)` | `var(--md-red-100,#ffcdd2)` |
| `--jp-success-color0` | `var(--md-green-900,#1b5e20)` | `var(--md-green-700,#388e3c)` |
| `--jp-success-color1` | `var(--md-green-700,#388e3c)` | `var(--md-green-500,#4caf50)` |
| `--jp-success-color2` | `var(--md-green-300,#81c784)` | `var(--md-green-300,#81c784)` |
| `--jp-success-color3` | `var(--md-green-100,#c8e6c9)` | `var(--md-green-100,#c8e6c9)` |
| `--jp-info-color0` | `var(--md-cyan-900,#006064)` | `var(--md-cyan-700,#0097a7)` |
| `--jp-info-color1` | `var(--md-cyan-700,#0097a7)` | `var(--md-cyan-500,#00bcd4)` |
| `--jp-info-color2` | `var(--md-cyan-300,#4dd0e1)` | `var(--md-cyan-300,#4dd0e1)` |
| `--jp-info-color3` | `var(--md-cyan-100,#b2ebf2)` | `var(--md-cyan-100,#b2ebf2)` |
| `--jp-accept-color-normal` | `var(--md-blue-700,#1976d2)` | `var(--md-blue-700,#1976d2)` |
| `--jp-accept-color-hover` | `var(--md-blue-800,#1565c0)` | `var(--md-blue-800,#1565c0)` |
| `--jp-accept-color-active` | `var(--md-blue-900,#0d47a1)` | `var(--md-blue-900,#0d47a1)` |
| `--jp-warn-color-normal` | `var(--md-red-700,#d32f2f)` | `var(--md-red-700,#d32f2f)` |
| `--jp-warn-color-hover` | `var(--md-red-800,#c62828)` | `var(--md-red-800,#c62828)` |
| `--jp-warn-color-active` | `var(--md-red-900,#b71c1c)` | `var(--md-red-900,#b71c1c)` |
| `--jp-reject-color-normal` | `var(--md-grey-600,#757575)` | `var(--md-grey-600,#757575)` |
| `--jp-reject-color-hover` | `var(--md-grey-700,#616161)` | `var(--md-grey-700,#616161)` |
| `--jp-reject-color-active` | `var(--md-grey-800,#424242)` | `var(--md-grey-800,#424242)` |
| `--jp-focus-outline-color` | `var(--jp-brand-color1)` | `#38a0f5` |
| `--jp-focus-outline-width` | `2px` | `2px` |

## Interface text

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-ui-font-scale-factor` | `1.2` | `1.2` |
| `--jp-ui-font-size0` | `.83333em` | `.83333em` |
| `--jp-ui-font-size1` | `13px` | `13px` |
| `--jp-ui-font-size2` | `1.2em` | `1.2em` |
| `--jp-ui-font-size3` | `1.44em` | `1.44em` |
| `--jp-ui-font-family` | `system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", helvetica, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` | `system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", helvetica, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |
| `--jp-ui-font-color0` | `#000` | `#fff` |
| `--jp-ui-font-color1` | `rgba(0,0,0,.87)` | `rgba(255,255,255,.87)` |
| `--jp-ui-font-color2` | `rgba(0,0,0,.54)` | `rgba(255,255,255,.54)` |
| `--jp-ui-font-color3` | `rgba(0,0,0,.38)` | `rgba(255,255,255,.38)` |
| `--jp-ui-inverse-font-color0` | `#fff` | `#000` |
| `--jp-ui-inverse-font-color1` | `#fff` | `rgba(0,0,0,.8)` |
| `--jp-ui-inverse-font-color2` | `rgba(255,255,255,.7)` | `rgba(0,0,0,.5)` |
| `--jp-ui-inverse-font-color3` | `rgba(255,255,255,.5)` | `rgba(0,0,0,.3)` |

## Content text (notebook Markdown, rendered output)

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-content-line-height` | `1.6` | `1.6` |
| `--jp-content-font-scale-factor` | `1.2` | `1.2` |
| `--jp-content-font-size0` | `.83333em` | `.83333em` |
| `--jp-content-font-size1` | `14px` | `14px` |
| `--jp-content-font-size2` | `1.2em` | `1.2em` |
| `--jp-content-font-size3` | `1.44em` | `1.44em` |
| `--jp-content-font-size4` | `1.728em` | `1.728em` |
| `--jp-content-font-size5` | `2.0736em` | `2.0736em` |
| `--jp-content-presentation-font-size1` | `17px` | `17px` |
| `--jp-content-heading-line-height` | `1` | `1` |
| `--jp-content-heading-margin-top` | `1.2em` | `1.2em` |
| `--jp-content-heading-margin-bottom` | `.8em` | `.8em` |
| `--jp-content-heading-font-weight` | `500` | `500` |
| `--jp-content-font-color0` | `#000` | `#fff` |
| `--jp-content-font-color1` | `rgba(0,0,0,.87)` | `#fff` |
| `--jp-content-font-color2` | `rgba(0,0,0,.54)` | `rgba(255,255,255,.7)` |
| `--jp-content-font-color3` | `rgba(0,0,0,.38)` | `rgba(255,255,255,.5)` |
| `--jp-content-link-color` | `var(--md-blue-900,#0d47a1)` | `var(--md-blue-300,#64b5f6)` |
| `--jp-content-link-visited-color` | `var(--md-purple-700,#7b1fa2)` | `var(--md-purple-300,#ba68c8)` |
| `--jp-content-font-family` | `system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", helvetica, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` | `system-ui, -apple-system, blinkmacsystemfont, "Segoe UI", helvetica, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |
| `--jp-content-link-hover-color` | `` | `var(--md-blue-400,#42a5f5)` |

## Code text

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-code-font-size` | `13px` | `13px` |
| `--jp-code-line-height` | `1.3077` | `1.3077` |
| `--jp-code-padding` | `5px` | `5px` |
| `--jp-code-font-family-default` | `menlo, consolas, "DejaVu Sans Mono", monospace` | `menlo, consolas, "DejaVu Sans Mono", monospace` |
| `--jp-code-font-family` | `var(--jp-code-font-family-default)` | `var(--jp-code-font-family-default)` |
| `--jp-code-presentation-font-size` | `16px` | `16px` |
| `--jp-code-cursor-width0` | `1.4px` | `1.4px` |
| `--jp-code-cursor-width1` | `2px` | `2px` |
| `--jp-code-cursor-width2` | `4px` | `4px` |

## Notebook and cells

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-cell-padding` | `5px` | `5px` |
| `--jp-cell-collapser-width` | `8px` | `8px` |
| `--jp-cell-collapser-min-height` | `20px` | `20px` |
| `--jp-cell-collapser-not-active-hover-opacity` | `.6` | `.6` |
| `--jp-cell-editor-background` | `var(--md-grey-100,#f5f5f5)` | `var(--jp-layout-color1)` |
| `--jp-cell-editor-border-color` | `var(--md-grey-300,#e0e0e0)` | `var(--md-grey-700,#616161)` |
| `--jp-cell-editor-box-shadow` | `inset 0 0 2px var(--md-blue-300,#64b5f6)` | `inset 0 0 2px var(--md-blue-300,#64b5f6)` |
| `--jp-cell-editor-active-background` | `var(--jp-layout-color0)` | `var(--jp-layout-color0)` |
| `--jp-cell-editor-active-border-color` | `var(--jp-brand-color1)` | `var(--jp-brand-color1)` |
| `--jp-cell-prompt-width` | `64px` | `64px` |
| `--jp-cell-prompt-font-family` | `var(--jp-code-font-family-default)` | `var(--jp-code-font-family-default)` |
| `--jp-cell-prompt-letter-spacing` | `0` | `0` |
| `--jp-cell-prompt-opacity` | `1` | `1` |
| `--jp-cell-prompt-not-active-opacity` | `.5` | `1` |
| `--jp-cell-prompt-not-active-font-color` | `var(--md-grey-700,#616161)` | `var(--md-grey-300,#e0e0e0)` |
| `--jp-cell-inprompt-font-color` | `#307fc1` | `#307fc1` |
| `--jp-cell-outprompt-font-color` | `#bf5b3d` | `#bf5b3d` |
| `--jp-notebook-padding` | `10px` | `10px` |
| `--jp-notebook-select-background` | `var(--jp-layout-color1)` | `var(--jp-layout-color1)` |
| `--jp-notebook-multiselected-color` | `var(--md-blue-50,#e3f2fd)` | `rgba(33,150,243,.24)` |
| `--jp-notebook-scroll-padding` | `calc(100% - var(--jp-code-font-size) * var(--jp-code-line-height) - var(--jp-code-padding) - var(--jp-cell-padding) - 1px)` | `calc(100% - var(--jp-code-font-size) * var(--jp-code-line-height) - var(--jp-code-padding) - var(--jp-cell-padding) - 1px)` |
| `--jp-rendermime-error-background` | `#fdd` | `rgba(244,67,54,.28)` |
| `--jp-rendermime-table-row-background` | `var(--md-grey-100,#cfd8dc)` | `var(--md-grey-900,#212121)` |
| `--jp-rendermime-table-row-hover-background` | `var(--md-light-blue-50,#e1f5fe)` | `rgba(3,169,244,.2)` |
| `--jp-input-box-shadow` | `inset 0 0 2px var(--md-blue-300,#64b5f6)` | `inset 0 0 2px var(--md-blue-300,#64b5f6)` |
| `--jp-input-active-background` | `var(--jp-layout-color1)` | `var(--jp-layout-color0)` |
| `--jp-input-hover-background` | `var(--jp-layout-color1)` | `var(--jp-layout-color2)` |
| `--jp-input-background` | `var(--md-grey-100,#f5f5f5)` | `var(--md-grey-800,#424242)` |
| `--jp-input-border-color` | `var(--jp-inverse-border-color)` | `var(--jp-inverse-border-color)` |
| `--jp-input-active-border-color` | `var(--jp-brand-color1)` | `var(--jp-brand-color1)` |
| `--jp-input-active-box-shadow-color` | `rgba(19,124,189,.3)` | `rgba(19,124,189,.3)` |
| `--jp-collaborator-color1` | `#ffad8e` | `#ad4a00` |
| `--jp-collaborator-color2` | `#dac83d` | `#7b6a00` |
| `--jp-collaborator-color3` | `#72dd76` | `#007e00` |
| `--jp-collaborator-color4` | `#00e4d0` | `#008772` |
| `--jp-collaborator-color5` | `#45d4ff` | `#0079b9` |
| `--jp-collaborator-color6` | `#e2b1ff` | `#8b45c6` |
| `--jp-collaborator-color7` | `#ff9de6` | `#be208b` |
| `--jp-notebook-icon-color` | `#f37626` | `#f37626` |

## Editor syntax colors

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-editor-scroll-padding` | `calc(100% - var(--jp-code-font-size) * var(--jp-code-line-height) - var(--jp-code-padding) - 1px)` | `calc(100% - var(--jp-code-font-size) * var(--jp-code-line-height) - var(--jp-code-padding) - 1px)` |
| `--jp-editor-selected-background` | `#d9d9d9` | `var(--jp-layout-color2)` |
| `--jp-editor-selected-focused-background` | `#d7d4f0` | `rgba(33,150,243,.24)` |
| `--jp-editor-cursor-color` | `var(--jp-ui-font-color0)` | `var(--jp-ui-font-color0)` |
| `--jp-mirror-editor-keyword-color` | `green` | `var(--md-green-500,#4caf50)` |
| `--jp-mirror-editor-atom-color` | `#88f` | `var(--md-blue-300,#64b5f6)` |
| `--jp-mirror-editor-number-color` | `#080` | `var(--md-green-400,#66bb6a)` |
| `--jp-mirror-editor-def-color` | `#00f` | `var(--md-blue-600,#1e88e5)` |
| `--jp-mirror-editor-variable-color` | `var(--md-grey-900,#212121)` | `var(--md-grey-300,#e0e0e0)` |
| `--jp-mirror-editor-variable-2-color` | `#00366d` | `var(--md-blue-500,#2196f3)` |
| `--jp-mirror-editor-variable-3-color` | `#085` | `var(--md-green-600,#43a047)` |
| `--jp-mirror-editor-punctuation-color` | `#05a` | `var(--md-blue-400,#42a5f5)` |
| `--jp-mirror-editor-property-color` | `#05a` | `var(--md-blue-400,#42a5f5)` |
| `--jp-mirror-editor-operator-color` | `#7800c2` | `#d48fff` |
| `--jp-mirror-editor-comment-color` | `#408080` | `#408080` |
| `--jp-mirror-editor-string-color` | `#ba2121` | `#ff7070` |
| `--jp-mirror-editor-string-2-color` | `#708` | `var(--md-purple-300,#ba68c8)` |
| `--jp-mirror-editor-meta-color` | `#a2f` | `#a2f` |
| `--jp-mirror-editor-qualifier-color` | `#555` | `#555` |
| `--jp-mirror-editor-builtin-color` | `green` | `var(--md-green-600,#43a047)` |
| `--jp-mirror-editor-bracket-color` | `#997` | `#997` |
| `--jp-mirror-editor-tag-color` | `#170` | `var(--md-green-700,#388e3c)` |
| `--jp-mirror-editor-attribute-color` | `#00c` | `var(--md-blue-300,#64b5f6)` |
| `--jp-mirror-editor-header-color` | `blue` | `var(--md-blue-500,#2196f3)` |
| `--jp-mirror-editor-quote-color` | `#090` | `var(--md-green-300,#81c784)` |
| `--jp-mirror-editor-link-color` | `#00c` | `var(--md-blue-700,#1976d2)` |
| `--jp-mirror-editor-error-color` | `red` | `red` |
| `--jp-mirror-editor-hr-color` | `#999` | `#999` |

## Toolbars, sidebars, dialogs, other widgets

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-shortcuts-button-background` | `var(--jp-brand-color3)` | `var(--jp-brand-color2)` |
| `--jp-shortcuts-button-hover-background` | `var(--jp-brand-color2)` | `var(--jp-brand-color1)` |
| `--jp-dialog-background` | `rgba(0,0,0,.25)` | `rgba(0,0,0,.6)` |
| `--jp-console-padding` | `10px` | `10px` |
| `--jp-toolbar-border-color` | `var(--jp-border-color1)` | `var(--jp-border-color2)` |
| `--jp-toolbar-micro-height` | `8px` | `8px` |
| `--jp-toolbar-background` | `var(--jp-layout-color1)` | `var(--jp-layout-color1)` |
| `--jp-toolbar-box-shadow` | `0 0 2px 0 rgba(0,0,0,.24)` | `0 0 2px 0 rgba(0,0,0,.8)` |
| `--jp-toolbar-header-margin` | `4px 4px 0 4px` | `4px 4px 0 4px` |
| `--jp-toolbar-active-background` | `var(--md-grey-300,#90a4ae)` | `var(--jp-layout-color0)` |
| `--jp-statusbar-height` | `24px` | `24px` |
| `--jp-vega-background` | `white` | `var(--md-grey-400,#bdbdbd)` |
| `--jp-sidebar-min-width` | `250px` | `250px` |
| `--jp-search-selected-match-background-color` | `#f5c800` | `#ffe100` |
| `--jp-search-selected-match-color` | `black` | `black` |
| `--jp-search-unselected-match-background-color` | `var(--jp-inverse-layout-color0)` | `var(--jp-inverse-layout-color0)` |
| `--jp-search-unselected-match-color` | `var(--jp-ui-inverse-font-color0)` | `var(--jp-ui-inverse-font-color0)` |
| `--jp-console-icon-background-color` | `var(--md-blue-700,#1976d2)` | `var(--md-blue-500,#2196f3)` |
| `--jp-console-icon-color` | `white` | `white` |
| `--jp-switch-color` | `var(--md-grey-400,#bdbdbd)` | `var(--md-grey-400,#bdbdbd)` |
| `--jp-switch-true-position-color` | `var(--md-orange-900,#e65100)` | `var(--md-orange-700,#f57c00)` |
| `--jp-completer-type-background0` | `transparent` | `transparent` |
| `--jp-completer-type-background1` | `#1f77b4` | `#1f77b4` |
| `--jp-completer-type-background2` | `#ff7f0e` | `#ff7f0e` |
| `--jp-completer-type-background3` | `#2ca02c` | `#2ca02c` |
| `--jp-completer-type-background4` | `#d62728` | `#d62728` |
| `--jp-completer-type-background5` | `#9467bd` | `#9467bd` |
| `--jp-completer-type-background6` | `#8c564b` | `#8c564b` |
| `--jp-completer-type-background7` | `#e377c2` | `#e377c2` |
| `--jp-completer-type-background8` | `#7f7f7f` | `#7f7f7f` |
| `--jp-completer-type-background9` | `#bcbd22` | `#bcbd22` |
| `--jp-completer-type-background10` | `#17becf` | `#17becf` |

## Icons

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-icon-contrast-color0` | `var(--md-purple-600,#8e24aa)` | `var(--md-purple-600,#8e24aa)` |
| `--jp-icon-contrast-color1` | `var(--md-green-600,#43a047)` | `var(--md-green-600,#43a047)` |
| `--jp-icon-contrast-color2` | `var(--md-pink-600,#d81b60)` | `var(--md-pink-600,#d81b60)` |
| `--jp-icon-contrast-color3` | `var(--md-blue-600,#1e88e5)` | `var(--md-blue-600,#1e88e5)` |
| `--jp-jupyter-icon-color` | `#f37626` | `#f37626` |
| `--jp-json-icon-color` | `var(--md-orange-700,#f57c00)` | `var(--md-orange-500,#ff9800)` |
| `--jp-terminal-icon-background-color` | `var(--md-grey-800,#424242)` | `var(--md-grey-200,#eee)` |
| `--jp-terminal-icon-color` | `var(--md-grey-200,#eee)` | `var(--md-grey-800,#424242)` |
| `--jp-text-editor-icon-color` | `var(--md-grey-700,#616161)` | `var(--md-grey-200,#eee)` |
| `--jp-inspector-icon-color` | `var(--md-grey-700,#616161)` | `var(--md-grey-200,#eee)` |

## Other

| Variable | Light | Dark |
| --- | --- | --- |
| `--jp-datagrid-font-size` | `12px` | `12px` |
| `--jp-datagrid-font-family` | `var(--jp-content-font-family)` | `var(--jp-content-font-family)` |
