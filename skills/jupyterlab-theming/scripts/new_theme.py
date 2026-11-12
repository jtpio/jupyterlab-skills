#!/usr/bin/env python3
"""
Create a JupyterLab theme extension that needs no build.

Each theme starts as a full copy of a built-in theme (base.css) plus a
small file of overrides (index.css). A theme that defines only some of
the variables leaves the rest of the interface without style.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

NAME_PATTERN = re.compile(r"^(@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*$")
BUILTIN = {
    "light": "@jupyterlab/theme-light-extension",
    "dark": "@jupyterlab/theme-dark-extension",
}

ENTRY = r"""/*
 * __NAME__: JupyterLab theme(s) without a build step.
 *
 * JupyterLab loads this file with a <script> tag. It must stay plain
 * JavaScript: no import, no export.
 */
(function () {
  'use strict';

  const NAME = '__NAME__';

  /*
   * One entry for each theme. `path` is relative to themes/ in this folder.
   */
  const THEMES = __THEMES__;

  function createPlugins(lab) {
    const { IThemeManager } = lab['@jupyterlab/apputils'];

    return [
      {
        id: `${NAME}:plugin`,
        description: 'Registers the themes of __NAME__.',
        autoStart: true,
        requires: [IThemeManager],
        activate: (app, manager) => {
          for (const theme of THEMES) {
            manager.register({
              name: theme.name,
              displayName: theme.name,
              isLight: theme.isLight,
              themeScrollbars: theme.themeScrollbars,
              // base.css first: index.css overrides it.
              load: () =>
                Promise.all([
                  manager.loadCSS(`${theme.path}/base.css`),
                  manager.loadCSS(`${theme.path}/index.css`)
                ]),
              unload: () => Promise.resolve()
            });
          }
        }
      }
    ];
  }

  // ---------------------------------------------------------------------
  // Module federation container. Do not change the code below.
  // ---------------------------------------------------------------------

  const SHARED = ['@jupyterlab/apputils'];
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
      const plugins = createPlugins(lab);
      return () => ({ __esModule: true, default: plugins });
    }
  };

  window._JUPYTERLAB = window._JUPYTERLAB || {};
  window._JUPYTERLAB[NAME] = container;
})();
"""

OVERRIDES = """/*
 * __LABEL__: overrides of the built-in __BASE__ theme.
 *
 * base.css holds the full set of variables. Change the look here:
 * redefine variables in :root, then add rules for what variables
 * cannot reach.
 */

:root {
  /*
   * Example: --jp-brand-color1: #b4532a;
   */
}
"""


def fail(message: str) -> None:
    """
    Print an error and stop.
    """
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def builtin_css(python: str, base: str) -> str:
    """
    Read the CSS of a built-in theme from the target environment.
    """
    code = "from jupyterlab.commands import get_app_dir; print(get_app_dir())"
    try:
        result = subprocess.run([python, "-c", code], capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError) as error:
        fail(f"cannot find JupyterLab with {python}: {error}")
    path = Path(result.stdout.strip()) / "themes" / BUILTIN[base] / "index.css"
    if not path.is_file():
        fail(f"{path} does not exist")
    return path.read_text()


def pretty(css: str) -> str:
    """
    Put each declaration of minified CSS on its own line.
    """
    css = re.sub(r"\s*{\s*", " {\n  ", css)
    css = re.sub(r";\s*(?!base64)", ";\n  ", css)
    css = re.sub(r"\s*}\s*", "\n}\n\n", css)
    return css.strip() + "\n"


def slug(label: str) -> str:
    """
    Folder name for a theme label.
    """
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")


def main() -> int:
    """
    Parse the command line and write the theme extension.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", help="npm-style name of the extension, for example my-lab-theme")
    parser.add_argument(
        "--theme",
        action="append",
        required=True,
        metavar="LABEL:BASE",
        help="theme label and base, 'light' or 'dark', for example 'Paper:light' (can repeat)",
    )
    parser.add_argument("--dest", default=".", help="parent folder (default: current folder)")
    parser.add_argument(
        "--python",
        default=sys.executable,
        help="Python of an environment that has JupyterLab, source of the base themes",
    )
    parser.add_argument("--version", default="0.1.0")
    args = parser.parse_args()

    if not NAME_PATTERN.match(args.name):
        fail("the name must be a valid npm package name, in lower case")
    target = Path(args.dest).resolve() / args.name
    if target.exists():
        fail(f"{target} already exists")

    themes = []
    for item in args.theme:
        label, _, base = item.rpartition(":")
        if not label or base not in BUILTIN:
            fail(f"--theme must be LABEL:light or LABEL:dark, got '{item}'")
        themes.append((label, base))

    python = os.path.abspath(args.python)
    entries = []
    for label, base in themes:
        folder = target / "themes" / args.name / slug(label)
        folder.mkdir(parents=True)
        (folder / "base.css").write_text(
            f"/*\n * Copy of the built-in JupyterLab {base} theme.\n"
            " * Do not edit: put the changes in index.css.\n */\n\n"
            + pretty(builtin_css(python, base))
        )
        (folder / "index.css").write_text(
            OVERRIDES.replace("__LABEL__", label).replace("__BASE__", base)
        )
        entries.append(
            {
                "name": label,
                "isLight": base == "light",
                "themeScrollbars": base == "dark",
                "path": f"{args.name}/{slug(label)}",
            }
        )

    static = target / "static"
    static.mkdir()
    listing = json.dumps(entries, indent=2).replace("\n", "\n  ")
    (static / "remoteEntry.js").write_text(
        ENTRY.replace("__NAME__", args.name).replace("__THEMES__", listing)
    )
    package = {
        "name": args.name,
        "version": args.version,
        "description": "JupyterLab themes: " + ", ".join(label for label, _ in themes),
        "jupyterlab": {
            "extension": True,
            "themePath": "themes",
            "_build": {"load": "static/remoteEntry.js", "extension": "./extension"},
        },
    }
    (target / "package.json").write_text(json.dumps(package, indent=2) + "\n")
    (target / "install.json").write_text(
        json.dumps(
            {
                "packageManager": "jlab-ext",
                "packageName": args.name,
                "uninstallInstructions": (
                    f"Remove the folder share/jupyter/labextensions/{args.name}"
                ),
            },
            indent=2,
        )
        + "\n"
    )

    print(f"Created {target}")
    for label, base in themes:
        print(f"  theme '{label}' ({base}): themes/{args.name}/{slug(label)}/index.css")
    print("Install it with jlab_ext.py install (jupyterlab-extensions skill), or copy the")
    print("folder to <prefix>/share/jupyter/labextensions/. Then restart the server.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
