#!/usr/bin/env python3
"""
Create a pip-installable JupyterLab distribution: one Python package that
installs JupyterLab plus configuration, extensions and a launch command.

    python jlab_dist.py new my-lab --app-name "My Lab"
    python jlab_dist.py collect my-lab --python <env>/bin/python
    python jlab_dist.py check my-lab
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

NAME_PATTERN = re.compile(r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")
MARKER = "jlab-ext"

PYPROJECT = """[build-system]
requires = ["hatchling>=1.21"]
build-backend = "hatchling.build"

[project]
name = "__NAME__"
version = "__VERSION__"
description = "__DESCRIPTION__"
readme = "README.md"
requires-python = ">=3.9"
classifiers = [
    "Framework :: Jupyter",
    "Framework :: Jupyter :: JupyterLab",
    "Framework :: Jupyter :: JupyterLab :: 4",
    "Programming Language :: Python :: 3",
]
dependencies = [
__DEPENDENCIES__
]

[project.scripts]
__COMMAND__ = "__MODULE__.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["__MODULE__"]

# Folders that pip copies below sys.prefix. JupyterLab finds them there.
[tool.hatch.build.targets.wheel.shared-data]
"jupyter-config" = "etc/jupyter"
"labextensions" = "share/jupyter/labextensions"

[tool.hatch.build.targets.sdist]
include = ["__MODULE__", "jupyter-config", "labextensions", "README.md"]
"""

README = """# __APP__

__DESCRIPTION__

__APP__ is a JupyterLab distribution: this package installs JupyterLab,
its configuration and its extensions.

## Install and run

```bash
pip install __NAME__
```

```bash
__COMMAND__
```

Install it in a dedicated environment: the configuration applies to each
JupyterLab that starts from the same environment.

## Layout

- `jupyter-config/labconfig/page_config.d/__NAME__.json`: application name,
  disabled plugins.
- `jupyter-config/labconfig/default_setting_overrides.d/__NAME__.json`:
  default values of settings (theme, layout, menus, toolbars, shortcuts).
- `labextensions/`: one folder for each JupyterLab extension. No build step.
- `__MODULE__/cli.py`: the `__COMMAND__` command.

## Build

```bash
uv build --wheel
```
"""

CLI = '''"""
The `__COMMAND__` command: JupyterLab with the defaults of __APP__.
"""

from __future__ import annotations

import os
import sys

# Arguments added before those of the user, who can thus override them.
DEFAULT_ARGS: list[str] = []


def state_dir() -> str:
    """
    Folder for the user settings and workspaces of __APP__.
    """
    from jupyter_core.paths import jupyter_config_dir

    return os.path.join(jupyter_config_dir(), "__NAME__")


def main() -> None:
    """
    Start JupyterLab with a separate user state.
    """
    # Settings saved in a plain JupyterLab must not hide the defaults of
    # __APP__. JupyterLab reads these variables at import time.
    root = state_dir()
    os.environ.setdefault("JUPYTERLAB_SETTINGS_DIR", os.path.join(root, "user-settings"))
    os.environ.setdefault("JUPYTERLAB_WORKSPACES_DIR", os.path.join(root, "workspaces"))
    sys.argv[1:1] = DEFAULT_ARGS

    from jupyterlab.labapp import main as lab_main

    sys.exit(lab_main())


if __name__ == "__main__":
    main()
'''

ENTRY = r"""/*
 * __NAME__: the core extension of __APP__. No build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export, no JSX, no TypeScript.
 */
(function () {
  'use strict';

  const NAME = '__NAME__';
  const APP_NAME = '__APP__';

  /*
   * Packages to take from JupyterLab. Only packages that JupyterLab shares
   * are available (all of @jupyterlab/*, @lumino/*, react, react-dom, yjs).
   */
  const SHARED = ['@jupyterlab/apputils', '@lumino/widgets'];

  /*
   * CSS files in static/ to load with the extension.
   */
  const STYLESHEETS = ['style.css'];

  /*
   * Return the plugin, or the list of plugins.
   * `lab` maps each name in SHARED to its module.
   */
  function createPlugins(lab) {
    const { ICommandPalette, Dialog, showDialog } = lab['@jupyterlab/apputils'];

    const about = {
      id: `${NAME}:about`,
      description: `Adds the About ${APP_NAME} command.`,
      autoStart: true,
      optional: [ICommandPalette],
      activate: (app, palette) => {
        const command = `${NAME}:about`;
        app.commands.addCommand(command, {
          label: `About ${APP_NAME}`,
          execute: () =>
            showDialog({
              title: APP_NAME,
              body: `${APP_NAME} __VERSION__, built on JupyterLab ${app.version}.`,
              buttons: [Dialog.okButton()]
            })
        });
        if (palette) {
          palette.addItem({ command, category: 'Help' });
        }
      }
    };

    return [about];
  }

  // ---------------------------------------------------------------------
  // Module federation container. Do not change the code below.
  // ---------------------------------------------------------------------

  let shareScope = null;

  function compareVersions(a, b) {
    const pa = a.split(/[.-]/).map(part => parseInt(part, 10) || 0);
    const pb = b.split(/[.-]/).map(part => parseInt(part, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  }

  async function loadShared(name) {
    const versions = shareScope && shareScope[name];
    if (!versions) {
      throw new Error(`${NAME}: JupyterLab does not share the package ${name}`);
    }
    const keys = Object.keys(versions).sort(compareVersions);
    // The copy that the application already uses keeps the tokens identical.
    const key = keys.find(version => versions[version].loaded) || keys[keys.length - 1];
    const factory = await versions[key].get();
    return factory();
  }

  function loadStyles() {
    const config = JSON.parse(
      document.getElementById('jupyter-config-data').textContent || '{}'
    );
    const base = `${config.fullLabextensionsUrl}/${NAME}/static/`;
    for (const file of STYLESHEETS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + file;
      link.dataset.extension = NAME;
      document.head.appendChild(link);
    }
  }

  const container = {
    init: async scope => {
      shareScope = scope;
    },
    get: async request => {
      if (request !== './extension') {
        throw new Error(`${NAME}: unknown module ${request}`);
      }
      const lab = {};
      for (const name of SHARED) {
        lab[name] = await loadShared(name);
      }
      loadStyles();
      const plugins = createPlugins(lab);
      // JupyterLab calls the factory synchronously.
      return () => ({ __esModule: true, default: plugins });
    }
  };

  window._JUPYTERLAB = window._JUPYTERLAB || {};
  window._JUPYTERLAB[NAME] = container;
})();
"""


def fail(message: str) -> None:
    """
    Print an error and stop.
    """
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def fill(template: str, values: dict[str, str]) -> str:
    """
    Replace the __KEY__ markers of a template.
    """
    for key, value in values.items():
        template = template.replace(f"__{key}__", value)
    return template


def jupyterlab_requirement(python: str | None) -> str:
    """
    Version range of JupyterLab, from the target environment when it has one.
    """
    if python:
        code = "import jupyterlab; print(jupyterlab.__version__)"
        result = subprocess.run(
            [os.path.abspath(python), "-c", code], capture_output=True, text=True
        )
        match = re.match(r"(\d+)\.(\d+)", result.stdout.strip())
        if result.returncode == 0 and match:
            major, minor = int(match.group(1)), int(match.group(2))
            return f"jupyterlab>={major}.{minor},<{major + 1}"
    return "jupyterlab>=4.5,<5"


def install_json(name: str) -> str:
    """
    Content of install.json for an extension that a Python package owns.
    """
    return (
        json.dumps(
            {
                "packageManager": "python",
                "packageName": name,
                "uninstallInstructions": f"Use your Python package manager to uninstall {name}",
            },
            indent=2,
        )
        + "\n"
    )


def new(args: argparse.Namespace) -> int:
    """
    Write the files of a new distribution project.
    """
    name = args.name
    if not NAME_PATTERN.match(name):
        fail("the name must use lower-case letters, digits and hyphens")
    project = Path(args.dest).resolve() / name
    if project.exists():
        fail(f"{project} already exists")
    module = name.replace("-", "_")
    app = args.app_name or name
    command = args.command or name
    description = args.description or f"{app}: a customized JupyterLab."
    dependencies = [jupyterlab_requirement(args.python), *args.depends]
    values = {
        "NAME": name,
        "MODULE": module,
        "APP": app,
        "COMMAND": command,
        "VERSION": args.version,
        "DESCRIPTION": description.replace('"', "'"),
        "DEPENDENCIES": "\n".join(f'    "{dep}",' for dep in dependencies),
    }

    (project / module).mkdir(parents=True)
    (project / "pyproject.toml").write_text(fill(PYPROJECT, values))
    (project / "README.md").write_text(fill(README, values))
    (project / ".gitignore").write_text("dist/\n__pycache__/\n*.egg-info/\n.venv/\n")
    (project / module / "__init__.py").write_text(
        f'"""\n{app}: a JupyterLab distribution.\n"""\n\n__version__ = "{args.version}"\n'
    )
    (project / module / "__main__.py").write_text(
        f'"""\nRun {app} with `python -m {module}`.\n"""\n\n'
        "from .cli import main\n\nmain()\n"
    )
    (project / module / "cli.py").write_text(fill(CLI, values))

    labconfig = project / "jupyter-config" / "labconfig"
    (labconfig / "page_config.d").mkdir(parents=True)
    (labconfig / "default_setting_overrides.d").mkdir(parents=True)
    (labconfig / "page_config.d" / f"{name}.json").write_text(
        json.dumps({"appName": app, "disabledExtensions": {}}, indent=2) + "\n"
    )
    (labconfig / "default_setting_overrides.d" / f"{name}.json").write_text("{}\n")

    extension = project / "labextensions" / name
    (extension / "static").mkdir(parents=True)
    (extension / "package.json").write_text(
        json.dumps(
            {
                "name": name,
                "version": args.version,
                "description": f"Core extension of {app}",
                "jupyterlab": {
                    "extension": True,
                    "_build": {"load": "static/remoteEntry.js", "extension": "./extension"},
                },
            },
            indent=2,
        )
        + "\n"
    )
    (extension / "install.json").write_text(install_json(name))
    (extension / "static" / "remoteEntry.js").write_text(fill(ENTRY, values))
    (extension / "static" / "style.css").write_text(f"/*\n * Styles of {app}.\n */\n")

    print(f"Created {project}")
    print(f"  config:     {labconfig}")
    print(f"  extension:  {extension}")
    print(f"  command:    {command}  ({module}/cli.py)")
    print("Next: edit the config and the extension, then build with 'uv build --wheel'.")
    return 0


def merge(target: dict, source: dict) -> dict:
    """
    Deep-merge source into target. Values of source win.
    """
    for key, value in source.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            merge(target[key], value)
        else:
            target[key] = value
    return target


def project_name(project: Path) -> str:
    """
    Read the distribution name from pyproject.toml.
    """
    path = project / "pyproject.toml"
    if not path.is_file():
        fail(f"{path} does not exist: not a distribution project")
    match = re.search(r'^name\s*=\s*"([^"]+)"', path.read_text(), re.MULTILINE)
    if not match:
        fail(f"no project name in {path}")
    return match.group(1)


def collect(args: argparse.Namespace) -> int:
    """
    Copy the customizations of an environment into the project.
    """
    project = Path(args.project).resolve()
    name = project_name(project)
    python = os.path.abspath(args.python)
    result = subprocess.run(
        [python, "-c", "import sys; print(sys.prefix)"], capture_output=True, text=True
    )
    if result.returncode != 0:
        fail(f"cannot run {python}")
    prefix = Path(result.stdout.strip())

    for kind in ("page_config", "default_setting_overrides"):
        source = prefix / "etc" / "jupyter" / "labconfig" / f"{kind}.d" / f"{args.snippet}.json"
        if not source.is_file():
            print(f"No {source}")
            continue
        target = project / "jupyter-config" / "labconfig" / f"{kind}.d" / f"{name}.json"
        data = json.loads(target.read_text()) if target.is_file() else {}
        merge(data, json.loads(source.read_text()))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, indent=2) + "\n")
        print(f"Merged {source} into {target}")

    root = prefix / "share" / "jupyter" / "labextensions"
    candidates = [p.parent for p in root.glob("*/package.json")]
    candidates += [p.parent for p in root.glob("@*/*/package.json")]
    for folder in candidates:
        extension = folder.relative_to(root).as_posix()
        install = folder / "install.json"
        manager = None
        if install.is_file():
            manager = json.loads(install.read_text()).get("packageManager")
        # Only what jlab_ext.py installed: pip owns the other extensions.
        if extension not in args.extension and manager != MARKER:
            continue
        target = project / "labextensions" / extension
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(folder.resolve(), target)
        (target / "install.json").write_text(install_json(name))
        print(f"Copied extension {extension} to {target}")
    print("Check the result with: python jlab_dist.py check " + str(project))
    return 0


def check(args: argparse.Namespace) -> int:
    """
    Check the files of a project, and the content of a wheel when given.
    """
    project = Path(args.project).resolve()
    name = project_name(project)
    problems: list[str] = []

    for path in sorted((project / "jupyter-config").rglob("*.json")):
        try:
            data = json.loads(path.read_text())
        except json.JSONDecodeError as error:
            problems.append(f"{path.relative_to(project)} is not valid JSON: {error}")
            continue
        if "page_config" in path.parts[-2] and isinstance(data.get("disabledExtensions"), list):
            problems.append(
                f"{path.relative_to(project)}: disabledExtensions must be an object "
                '({"id": true}), not a list'
            )
    root = project / "labextensions"
    folders = [p.parent for p in root.glob("*/package.json")]
    folders += [p.parent for p in root.glob("@*/*/package.json")]
    for folder in folders:
        package = json.loads((folder / "package.json").read_text())
        build = package.get("jupyterlab", {}).get("_build", {})
        expected = folder.relative_to(root).as_posix()
        if package.get("name") != expected:
            problems.append(f"labextensions/{expected}: package.json name is {package.get('name')}")
        if not build.get("load") or not (folder / build["load"]).is_file():
            problems.append(f"labextensions/{expected}: missing file for jupyterlab._build.load")
        if folder.is_symlink():
            problems.append(f"labextensions/{expected} is a symlink: copy the files instead")
    pyproject = (project / "pyproject.toml").read_text()
    for needle in ('"jupyter-config" = "etc/jupyter"', '"labextensions" = "share/jupyter/labextensions"'):
        if needle not in pyproject:
            problems.append(f"pyproject.toml lacks the shared-data line: {needle}")

    wheels = [Path(args.wheel)] if args.wheel else sorted((project / "dist").glob("*.whl"))
    for wheel in wheels[-1:]:
        with zipfile.ZipFile(wheel) as archive:
            names = archive.namelist()
        data = [n.split(".data/data/", 1)[1] for n in names if ".data/data/" in n]
        print(f"Wheel {wheel.name}: {len(data)} data file(s)")
        for item in data:
            print(f"  {item}")
        if not any(item.startswith("etc/jupyter/labconfig/") for item in data):
            problems.append("the wheel has no etc/jupyter/labconfig files")
        if not any(item.startswith("share/jupyter/labextensions/") for item in data):
            problems.append("the wheel has no share/jupyter/labextensions files")

    if problems:
        print(f"{len(problems)} problem(s) in {name}:")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    print(f"OK: {name}")
    return 0


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub = parser.add_subparsers(dest="action", required=True)

    p = sub.add_parser("new", help="create a distribution project")
    p.add_argument("name", help="package name, for example my-lab")
    p.add_argument("--dest", default=".", help="parent folder (default: current folder)")
    p.add_argument("--app-name", help="name shown in the browser tab")
    p.add_argument("--command", help="name of the launch command (default: the package name)")
    p.add_argument("--description")
    p.add_argument("--version", default="0.1.0")
    p.add_argument(
        "--python", help="Python of an environment with JupyterLab, to pin its version range"
    )
    p.add_argument(
        "--depends",
        action="append",
        default=[],
        metavar="REQUIREMENT",
        help="more dependencies, for example jupyterlab-git (can repeat)",
    )
    p.set_defaults(func=new)

    p = sub.add_parser("collect", help="import the customizations of an environment")
    p.add_argument("project")
    p.add_argument("--python", required=True, help="Python of the customized environment")
    p.add_argument(
        "--snippet", default="50-custom", help="base name of the snippets to import"
    )
    p.add_argument(
        "--extension",
        action="append",
        default=[],
        help="extension to import in addition to those that jlab_ext.py installed",
    )
    p.set_defaults(func=collect)

    p = sub.add_parser("check", help="check a project and its wheel")
    p.add_argument("project")
    p.add_argument("--wheel", help="wheel to inspect (default: the newest in dist/)")
    p.set_defaults(func=check)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
