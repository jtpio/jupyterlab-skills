# TypeScript extensions (with a build)

Use this path when the no-build path is not enough:

- you need an npm package that JupyterLab does not share (a chart library, a
  parser);
- you want TypeScript types, JSX, unit tests;
- you will publish the extension to npm or PyPI as its own project;
- the extension has a Python server part.

The result is the same kind of folder in `share/jupyter/labextensions/`. The
build bundles your code and the extra dependencies; JupyterLab still needs no
rebuild.

Needs: Node.js 20 or newer, and the Python package `jupyter-builder` (it comes
with JupyterLab 4.6). `jlpm` is the Yarn that JupyterLab ships: it is in the
`bin` folder of the environment, so put that folder on `PATH`.

All commands below were run with JupyterLab 4.6.6, jupyter-builder 1.3,
Node 22.

## Option A: the official template

The template gives a full project: Python package, lint, CI, release setup.

```bash
uvx --with jinja2-time copier copy --trust --defaults \
  -d kind=frontend \
  -d author_name="My Name" \
  -d repository=https://github.com/me/my-lab-ext \
  -d labextension_name=my-lab-ext \
  -d has_settings=true \
  -d test=false \
  -d has_binder=false \
  https://github.com/jupyterlab/extension-template my-lab-ext
```

- `--trust` and `jinja2-time` are mandatory. `author_name` and `repository`
  have no default: without them copier stops.
- `kind`: `frontend`, `frontend-and-server`, `mimerenderer` or `theme`.
- Without `uvx`: `pip install copier jinja2-time`, then `copier copy …`.

Install in development mode and build:

```bash
cd my-lab-ext
```

```bash
pip install -e .
```

```bash
jupyter-builder develop . --overwrite
```

```bash
jupyter labextension list
```

- `pip install -e .` runs `jlpm install` and a development build (about 30 s
  the first time, 230 MB of `node_modules`).
- `jupyter-builder develop` replaces the installed copy with a symlink, so
  that a rebuild is enough to see a change. `jupyter labextension develop`
  still works but is deprecated.
- After each source change: `jlpm build` (about 5 s), then reload the
  browser. Or `jlpm watch` to rebuild on save.
- `jlpm` must be on `PATH`: `export PATH=<env>/bin:$PATH`.

The code is in `src/index.ts`:

```ts
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'my-lab-ext:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  optional: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette | null) => {
    app.commands.addCommand('my-lab-ext:hello', {
      label: 'Hello',
      execute: () => console.log('hello')
    });
    palette?.addItem({ command: 'my-lab-ext:hello', category: 'My Ext' });
  }
};

export default plugin;
```

Every pattern of `patterns.md` works here: replace `lab['<package>']` with an
`import`, and add the package to `dependencies` in `package.json`
(`jlpm add @jupyterlab/notebook`).

Build a wheel:

```bash
jlpm build:prod
```

```bash
uv build --wheel
```

Run `jlpm build:prod` first: the wheel build reuses an existing development
build, which is larger and has source maps. The wheel holds
`share/jupyter/labextensions/my-lab-ext/` and installs with pip, no Node.js
on the target machine.

To put the extension in a distribution (skill `jupyterlab-distribution`):
add the wheel as a dependency of the distribution, or copy the built folder
`my_lab_ext/labextension/` to `<project>/labextensions/my-lab-ext/`.

## Option B: a minimal source folder

Four files, no Python package. Good for a private extension that a
distribution project builds into its `labextensions/` folder.

`package.json`:

```json
{
  "name": "min-ts-ext",
  "version": "0.1.0",
  "private": true,
  "main": "lib/index.js",
  "scripts": { "build": "tsc && jupyter-builder build ." },
  "dependencies": { "@jupyterlab/application": "^4.6.0" },
  "devDependencies": { "@jupyter/builder": "^1.3.0", "typescript": "~5.5.4" },
  "jupyterlab": {
    "extension": true,
    "outputDir": "../labextensions/min-ts-ext"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["DOM", "ES2018"],
    "strict": true,
    "skipLibCheck": true,
    "rootDir": "src",
    "outDir": "lib"
  },
  "include": ["src/*"]
}
```

`.yarnrc.yml` (mandatory with `jlpm`):

```yaml
nodeLinker: node-modules
enableScripts: false
```

`src/index.ts`: as in option A.

```bash
jlpm install
```

```bash
jlpm build
```

- `outputDir` is where the built extension goes. Point it into the
  `labextensions/` folder of a distribution project, or directly into
  `<env>/share/jupyter/labextensions/<name>`.
- `jlpm install` takes about 10 s with a warm cache (170 MB), the build
  about 2 s.
- For JSX, name the file `.tsx` and add `"jsx": "react"` to
  `compilerOptions`, plus `react` and `@types/react` to the dependencies.
- Settings: add `"schemaDir": "schema"` to the `jupyterlab` object and put
  `plugin.json` in `schema/`.
- CSS: add `"style": "style/index.css"` and
  `"styleModule": "style/index.js"` to `package.json`; `style/index.js`
  contains `import './index.css';`.
- Disable a core plugin: `"disabledExtensions": ["<plugin id>"]` in the
  `jupyterlab` object.
- An extra npm package is bundled automatically when it is in
  `dependencies`. Packages that JupyterLab shares are not bundled.

## Problems

| Message | Fix |
| --- | --- |
| `command not found: jlpm` | Put `<env>/bin` on `PATH` |
| `ValueError: Could not find @jupyter/builder` | `.yarnrc.yml` is missing (Yarn used Plug'n'Play), or the devDependency is missing |
| `tsc` errors inside `node_modules` (`lib0`, `@types/react`) | Add `"skipLibCheck": true` |
| TS5108 about `moduleResolution` | Use `"bundler"` |
| `Question "author_name" is required` | Pass `-d author_name=…` to copier |
| `No module named 'jinja2_time'` | Run copier with `--with jinja2-time` |
| The wheel is large and has `.map` files | Run `jlpm build:prod` before the wheel build |
| After `pip uninstall`, the extension is still listed | Remove the symlink in `share/jupyter/labextensions/` by hand |
| Two copies of a token, `No provider for…` at run time | A shared package got bundled. Keep `@jupyterlab/*` and `@lumino/*` in `dependencies` with a `^4` range; do not add them to `sharedPackages` with `bundled: true` |

## Upstream documentation

- Extension tutorial: https://jupyterlab.readthedocs.io/en/stable/extension/extension_tutorial.html
- Developer guide: https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html
- Template: https://github.com/jupyterlab/extension-template
- Examples for each extension point: https://github.com/jupyterlab/extension-examples
