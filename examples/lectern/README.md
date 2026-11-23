# Lectern

![A lesson in Lectern: the text on the left, its notebook on the right](screenshots/lesson.webp)

Lectern is a two-pane lesson reader for teaching with notebooks. The text of a
lesson (Markdown, read-only) shows on the left, its notebook (editable,
runnable) on the right, with a divider that you can drag. It is a separate web
application built from JupyterLab npm packages: it has its own bundle, its own
shell and its own server class. It does not use the installed JupyterLab.

## Where it comes from

A coding agent built Lectern as a test of the skill `jupyterlab-remix` of
this repository. It got the skills and a product brief, and no other source
of JupyterLab knowledge. The project is the output of that run, with three
additions: this section, the `lessons/` and `screenshots/` folders, and the
full list of package versions in `package.json` (`overrides`). The
JupyterLite build (see below) came later; it is not the work of that agent.
The project shows what the skill produces; it is not a maintained product.

![The start page with the list of lessons](screenshots/start.webp)

## Lessons

A lesson is a pair of files in the folder that the server shows:

```
01-lists.md         the text: its first heading is the title of the lesson
01-lists.ipynb      the notebook
```

- `/lectern` shows the lessons in the order of their number.
- `/lectern/lessons/01-lists` opens one lesson.
- A lesson with only one of the two files opens with a note in the other pane.

Top bar: Previous, Next, Run all, Reset, Hide text. **Reset** clears the
outputs and execution counts of all cells (`notebook:clear-all-cell-outputs`).
It does not change the code, does not restart the kernel and does not save.

Keys: `Shift Enter` runs a cell, `Alt →` and `Alt ←` go to the next and the
previous lesson.

When you leave a lesson, Lectern saves its notebook (if it changed) and
closes it, which also stops its kernel.

## Build and run

Needs Node.js 20 or newer, Python 3.10 or newer and uv.

```bash
npm install
npm run build:prod
uv build --wheel
```

```bash
uv venv .venv && uv pip install --python .venv/bin/python dist/lectern-0.1.0-py3-none-any.whl
.venv/bin/lectern --ServerApp.root_dir=lessons
```

The wheel contains the bundle: the target machine needs no Node.js. During
development, `npm run build` (with source maps) and an editable install
(`uv pip install -e .`) are faster; restart the server after each build.

The folder `lessons/` has three sample lessons. They are not in the wheel.

## JupyterLite: the same application with no server

Lectern also builds as a static site. The contents, the settings and the
kernel are then in the browser: [JupyterLite](https://jupyterlite.readthedocs.io)
0.8 gives the services, and Pyodide runs the Python code.

```bash
npm install
```

```bash
npm run build:lite
```

```bash
python -m http.server 8000 --directory lite-site
```

Open `http://localhost:8000/`. The folder `lite-site/` works from any static
host and from any subfolder, for example GitHub Pages. To use other lessons:
`node lite/site.js <folder of lessons>` after the build.

What differs from the server build:

- `src/lite.js` is the entry point. It registers the service plugins of
  `@jupyterlite/services-extension` in place of those that talk to a Jupyter
  Server, resolves the service manager from them, and adds the Pyodide
  kernel (`@jupyterlite/pyodide-kernel-extension`). The plugins of Lectern
  are the same list (`src/plugins/core.js`).
- A static site has one page, so the lesson is in the query string:
  `?lesson=01-lists`, not `/lectern/lessons/01-lists`. The page option
  `lessonRoutes` selects this in `src/plugins/reader.js`.
- `rspack.lite.config.js` has three more rules: the service worker of
  JupyterLite, the workers of the Pyodide kernel, and its wheels.
- `lite/site.js` writes what a Jupyter Server gives at run time: the page with
  its configuration, the list of settings schemas, and the index of the
  lessons (`api/contents/all.json`, `files/`). It gives each notebook the
  kernel name `python`, and it adds the wheel of `comm` to the package index
  of the kernel, so that the kernel starts with no request to pypi.org.

`node tests/lite.cjs` serves the site from a subfolder and uses it in a
browser: the three lessons, Run all with the Pyodide kernel, Next, a reload,
an edit that stays, an unknown lesson. It has 14 checks and needs Playwright.

Limits of the JupyterLite build:

- The browser needs internet access: it loads Pyodide from cdn.jsdelivr.net.
- The first Run all takes some seconds: the kernel starts in the browser.
- A lesson can use the Python standard library and the packages of the
  Pyodide distribution. Other packages need `%pip install` in the notebook.
- An edit of a notebook stays in the storage of the browser, not in a file.
- The console can show "<id> was disposed" when a lesson closes before its
  kernel is ready. The Pyodide kernel gives this message; nothing is wrong.

## Layout of the project

```
package.json                 npm packages; "jupyterlab.extensions" lists the
                             packages whose schemas, themes and CSS the build copies
rspack.config.js             the bundle
rspack.lite.config.js        the bundle of the JupyterLite site
src/index.js                 the entry point with a Jupyter Server
src/lite.js                  the entry point for JupyterLite
src/styles.js                the fonts and the stylesheets
src/plugins/core.js          picks the core plugins and adds ours
src/app.js                   the application class
src/shell.js                 the shell: top bar, start page, text | notebook split
src/lessons.js               finds the lessons of a folder and their titles
src/icons.js                 the icons of the top bar
src/tokens.js                the ILessonReader token
src/plugins/paths.js         provides JupyterFrontEnd.IPaths
src/plugins/reader.js        routes, start page, text pane, notebook pane, navigation
src/plugins/top.js           brand, lesson title and position, buttons
style/app.css                the look: palette, fonts, layout
lectern/app.py               the server class (URL /lectern, /lectern/lessons/...)
lectern/settings/overrides.json   default settings: notebook toolbar, shortcuts,
                             kernel shutdown on close
lectern/static, schemas, themes   written by the build (not in git)
lite/index.html, lite/site.js     the page and the site script of the JupyterLite build
lite-site/                   written by the JupyterLite build (not in git)
tests/lite.cjs               smoke test of the JupyterLite site, with a browser
```

## From the template, and what is new

The project started from the kind `shell` template of the `jupyterlab-remix`
skill (`jlab_remix.py new lectern --kind shell`).

Kept from the template: the build setup (`package.json`, `rspack.config.js`,
`pyproject.toml`), the application class (`src/app.js`), the selection of 25
core plugins with `pick()` (now in `src/plugins/core.js`), the `paths` plugin, the server
class and the page template.

New:

- The shell has two more areas: `home` (start page) and `text` (left pane),
  and a Lumino `SplitPanel` between the text and the notebook (`main`). It
  keeps the width of the text pane when the pane hides and shows again.
- `reader.js` replaces the template `opener.js`: lesson routes, start page,
  rendered Markdown with the rendermime registry, notebook per lesson,
  Previous/Next.
- `top.js` is rewritten: lesson title and position, grouped buttons, own
  commands `lectern:run-all`, `lectern:reset`, `lectern:toggle-text`.
- Settings overrides: the notebook toolbar keeps only Run, Stop (interrupt),
  Restart and the cell type; `Alt ArrowRight`/`Alt ArrowLeft` call
  `lectern:next`/`lectern:previous`; a closed notebook stops its kernel.
- The look: CSS variables of JupyterLab and own rules on top of the light
  theme, fonts from npm (`@fontsource`: Literata, IBM Plex Sans, IBM Plex
  Mono, SIL Open Font License).

## Known limits

The agent reported these and did not correct them:

- The width of the text pane is not kept after a page reload.
- Lectern saves a changed notebook when you leave a lesson, so the edits of
  a student change the files of the lessons folder. Reset does not restore
  the original code.
- A link from the text of one lesson to another `.md` file opens the raw
  file, not the lesson.
- There is no kernel busy indicator, no dark theme, and no warning for
  unsaved changes when the page closes.
