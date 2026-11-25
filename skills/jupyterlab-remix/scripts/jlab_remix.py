#!/usr/bin/env python3
"""
Create and check a remix: an application built from JupyterLab packages,
with its own bundle and its own server class.

    python jlab_remix.py new quiet-notebook --kind lab --app-name "Quiet Notebook"
    python jlab_remix.py plan notebook fileeditor
    python jlab_remix.py check quiet-notebook
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

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent / "assets"
GRAPH = ROOT / "core_plugins.json"
NAME_PATTERN = re.compile(r"^[a-z][a-z0-9]*(-[a-z0-9]+)*$")
KINDS = {
    "lab": "the JupyterLab shell with a selected set of plugins",
    "shell": "an own shell and application class",
    "widget": "one page that uses JupyterLab components, with no plugin system",
}
BASE = (
    "@jupyterlab/application-extension",
    "@jupyterlab/apputils-extension",
    "@jupyterlab/translation-extension",
)
TEXT_SUFFIXES = {".js", ".json", ".py", ".toml", ".html", ".css", ".md", ".txt", ""}


def fail(message: str) -> None:
    """
    Print an error and stop.
    """
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def staging_dir(python: str) -> Path:
    """
    Folder of the installed JupyterLab that pins the version of each package.
    """
    code = "import jupyterlab, os; print(os.path.join(os.path.dirname(jupyterlab.__file__), 'staging'))"
    try:
        result = subprocess.run(
            [os.path.abspath(python), "-c", code], capture_output=True, text=True, check=True
        )
    except (OSError, subprocess.CalledProcessError) as error:
        fail(f"cannot find JupyterLab with {python}: {error}")
    return Path(result.stdout.strip())


def pin_versions(package_file: Path, python: str) -> tuple[str, bool]:
    """
    Set the JupyterLab dependencies to the versions of an installed JupyterLab.

    Returns the JupyterLab version and whether a version changed. A remix
    must use one consistent set of packages: the set of its target release.
    """
    staging = staging_dir(python)
    core = json.loads((staging / "package.json").read_text())
    resolutions = core["resolutions"]
    before = package_file.read_text()
    package = json.loads(before)
    # npm refuses an override that differs from a direct dependency: give
    # the direct dependencies the same versions.
    for section in ("dependencies", "devDependencies"):
        for name in package.get(section, {}):
            if name.startswith(("@jupyterlab/", "@lumino/")) and name in resolutions:
                package[section][name] = resolutions[name]
    # The published packages depend on each other with "^" ranges. Without
    # overrides, npm takes a newer minor release for the indirect ones, and
    # the bundle then has two copies of a core package.
    overrides = {
        name: version
        for name, version in sorted(resolutions.items())
        if name.startswith(("@jupyterlab/", "@lumino/"))
    }
    lock = staging / "yarn.lock"
    if lock.is_file():
        match = re.search(r'\n"yjs@[^"]*":\n\s+version: ([^\n]+)', lock.read_text())
        if match:
            # A newer yjs than the one of the release logs warnings.
            overrides["yjs"] = match.group(1).strip()
    package["overrides"] = overrides
    after = json.dumps(package, indent=2) + "\n"
    package_file.write_text(after)
    return core["version"], json.loads(before) != package


def class_name(name: str) -> str:
    """
    Python class name for a project name: quiet-notebook gives QuietNotebook.
    """
    return "".join(part.capitalize() for part in name.split("-"))


def copy_template(source: Path, target: Path, values: dict[str, str]) -> None:
    """
    Copy a template folder and replace the four name tokens.
    """
    for path in sorted(source.rglob("*")):
        relative = path.relative_to(source).as_posix().replace("my_app", values["my_app"])
        destination = target / relative
        if path.is_dir():
            destination.mkdir(parents=True, exist_ok=True)
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        if path.suffix in TEXT_SUFFIXES:
            text = path.read_text()
            for token, value in values.items():
                text = text.replace(token, value)
            destination.write_text(text)
        else:
            shutil.copyfile(path, destination)


def new(args: argparse.Namespace) -> int:
    """
    Write the files of a new remix project.
    """
    name = args.name
    if not NAME_PATTERN.match(name):
        fail("the name must use lower-case letters, digits and single hyphens, and start with a letter")
    template = ASSETS / args.kind
    if not template.is_dir():
        fail(f"no template for the kind '{args.kind}'")
    if args.federated and args.kind != "lab":
        fail("--federated is available for the kind 'lab' only")
    project = Path(args.dest).resolve() / (args.dir or name)
    if project.exists():
        fail(f"{project} already exists")
    values = {
        "my_app": name.replace("-", "_"),
        "my-app": name,
        "MyApp": class_name(name),
        "My App": args.app_name or name.replace("-", " ").title(),
    }
    copy_template(template, project, values)
    if args.federated:
        copy_template(ASSETS / "lab-federated", project, values)

    version = "the release that the template was made for"
    package_file = project / "package.json"
    if args.python and package_file.is_file():
        version, changed = pin_versions(package_file, args.python)

    print(f"Created {project}  (kind: {args.kind}{', with prebuilt extensions' if args.federated else ''})")
    if args.kind == "widget":
        print(f"  Server file: main.py   class: {values['MyApp']}   URL: /{name}")
    else:
        print(f"  Python module: {values['my_app']}   class: {values['MyApp']}   URL: /{name}")
    print(f"  JupyterLab packages: {version}")
    print("Next:")
    print(f"  cd {project}")
    print("  npm install")
    print("  npm run build:prod")
    if args.kind == "widget":
        print("  python main.py     (needs jupyter_server and ipykernel; no wheel for this kind)")
    else:
        print("  uv build --wheel")
    return 0


def pin(args: argparse.Namespace) -> int:
    """
    Pin the JupyterLab packages of a project to another JupyterLab release.
    """
    package_file = Path(args.project).resolve() / "package.json"
    if not package_file.is_file():
        fail(f"{package_file} does not exist")
    version, changed = pin_versions(package_file, args.python)
    if not changed:
        print(f"{package_file} already has the versions of JupyterLab {version}. No change.")
        return 0
    print(f"Pinned the JupyterLab packages of {package_file} to JupyterLab {version}.")
    print("Remove node_modules and package-lock.json, then: npm install && npm run build:prod")
    return 0


def load_graph() -> dict:
    """
    Read the plugins of a stock JupyterLab with their service tokens.
    """
    if not GRAPH.is_file():
        fail(f"{GRAPH} is missing")
    return json.loads(GRAPH.read_text())


def package_of(plugin: str) -> str:
    """
    npm package of a plugin ID.
    """
    return plugin.split(":", 1)[0]


def normalize(name: str) -> str:
    """
    Accept 'notebook', 'notebook-extension' or the full package name.
    """
    if name.startswith("@"):
        return name
    return f"@jupyterlab/{name if name.endswith('-extension') else name + '-extension'}"


def plan(args: argparse.Namespace) -> int:
    """
    Tell which packages a selection needs and which plugins to disable.
    """
    data = load_graph()
    graph = data["plugins"]
    packages = sorted({package_of(plugin) for plugin in graph})
    selected = {normalize(name) for name in args.packages}
    unknown = sorted(selected - set(packages))
    if unknown:
        fail(
            "unknown package(s): " + ", ".join(unknown) + "\nKnown packages:\n  " + "\n  ".join(packages)
        )
    providers = {data["provides"]: plugin for plugin, data in graph.items() if data["provides"]}

    # The main plugin of each selected package must work. Follow what it
    # requires, through the plugins that provide it, and add their packages.
    added: dict[str, str] = {}
    if not args.exact:
        for package in BASE:
            if package not in selected:
                selected.add(package)
                added[package] = "the base of an application with the JupyterLab shell"
        needed = [p for p in graph if package_of(p) in selected and is_main(p, graph)]
        seen = set(needed)
        while needed:
            plugin = needed.pop()
            for token in graph[plugin]["requires"]:
                provider = providers.get(token)
                if not provider or provider in seen:
                    continue
                seen.add(provider)
                needed.append(provider)
                if package_of(provider) not in selected:
                    selected.add(package_of(provider))
                    added[package_of(provider)] = f"provides {token.split(':')[-1]}, for {plugin}"

    available = {
        info["provides"]
        for plugin, info in graph.items()
        if package_of(plugin) in selected and info["provides"]
    }
    disabled: dict[str, str] = {}
    changed = True
    while changed:
        changed = False
        for plugin, info in graph.items():
            if package_of(plugin) not in selected or plugin in disabled:
                continue
            missing = next(
                (t for t in info["requires"] if t in providers and t not in available), None
            )
            if missing:
                disabled[plugin] = missing
                if info["provides"]:
                    available.discard(info["provides"])
                changed = True

    result = {
        "jupyterlab": data["jupyterlab"],
        "packages": sorted(selected),
        "added": added,
        "disable": disabled,
    }
    if args.json:
        print(json.dumps(result, indent=2))
        return 0
    print(f"Plan for JupyterLab {data['jupyterlab']} (from the plugins of a stock application)\n")
    print(f"Packages ({len(selected)}): add each to 'dependencies', to 'jupyterlab.extensions'")
    print("and to the imports of src/index.js")
    for package in sorted(selected):
        note = f"   <- added: {added[package]}" if package in added else ""
        print(f"  {package}{note}")
    print(f"\nPlugins to put in DISABLED ({len(disabled)}): they require a service that no")
    print("selected package provides")
    for plugin, token in sorted(disabled.items()):
        provider = package_of(providers[token])
        print(f"  {plugin}   (needs {token.split(':')[-1]} of {provider})")
    if not disabled:
        print("  (none)")
    by_package: dict[str, list[str]] = {}
    for plugin, token in disabled.items():
        provider = package_of(providers[token])
        if provider not in selected:
            by_package.setdefault(provider, []).append(plugin.split(":", 1)[1])
    if by_package:
        print("\nTo keep some of them, add a package and run the plan again:")
        for provider, plugins in sorted(by_package.items()):
            print(f"  {provider}: {', '.join(sorted(set(plugins)))}")
    print(
        "\nThe plan uses the 'requires' data only. Build, run the probe with "
        "--fail-on-console-error,\nand correct what it reports: a command that a "
        "missing package provides, a warning."
    )
    return 0


def is_main(plugin: str, graph: dict) -> bool:
    """
    Tell if a plugin holds the main function of its package.
    """
    package = package_of(plugin)
    siblings = [p for p in graph if package_of(p) == package]
    if len(siblings) == 1:
        return True
    names = {p.split(":", 1)[1] for p in siblings}
    for key in ("plugin", "tracker", "main", "browser", "manager"):
        if key in names:
            return plugin.endswith(f":{key}")
    return False


def check(args: argparse.Namespace) -> int:
    """
    Check that the lists of a project agree and that the build is present.
    """
    project = Path(args.project).resolve()
    package_file = project / "package.json"
    if not package_file.is_file():
        fail(f"{package_file} does not exist")
    package = json.loads(package_file.read_text())
    problems: list[str] = []
    notes: list[str] = []

    declared = set(package.get("jupyterlab", {}).get("extensions", []))
    dependencies = set(package.get("dependencies", {}))
    entry = project / "src" / "index.js"
    if declared and entry.is_file():
        # The list of plugins can be in another module of src/.
        source = "\n".join(p.read_text() for p in sorted((project / "src").rglob("*.js")))
        imported = set(re.findall(r"""from\s+['"](@jupyterlab/[\w-]+-extension)['"]""", source))
        imported |= set(re.findall(r"""import\(\s*['"](@jupyterlab/[\w-]+-extension)['"]""", source))
        # With pick(), the project selects plugins by name: a package that
        # gives only plugins without settings needs no copy of its schemas.
        by_name = "pick(" in source
        for name in sorted(set() if by_name else imported - declared):
            notes.append(
                f"{name} is imported in src/ but is not in 'jupyterlab.extensions': "
                "the build does not copy its schemas, themes and styles"
            )
        for name in sorted(declared - imported):
            notes.append(f"{name} is in 'jupyterlab.extensions' but no file of src/ imports it")
        for name in sorted((declared | imported) - dependencies):
            problems.append(f"{name} is not in 'dependencies' of package.json")

    module = next(
        (p.parent for p in project.glob("*/app.py") if (p.parent / "__init__.py").is_file()), None
    )
    if module is None and (project / "main.py").is_file():
        # The kind 'widget': a page that runs from its folder.
        if not (project / "build" / "bundle.js").is_file():
            notes.append("build/bundle.js is absent: run 'npm install' and 'npm run build:prod'")
    elif module is None:
        problems.append("no Python package with app.py, and no main.py")
    else:
        for folder in ("static", "schemas", "themes"):
            if folder == "static" or declared:
                if not (module / folder).is_dir():
                    notes.append(f"{module.name}/{folder}/ is absent: run 'npm install' and 'npm run build:prod'")
        if (module / "static").is_dir() and not (module / "static" / "bundle.js").is_file():
            problems.append(f"{module.name}/static/ has no bundle.js")

    wheels = sorted((project / "dist").glob("*.whl"))
    if wheels:
        with zipfile.ZipFile(wheels[-1]) as archive:
            names = archive.namelist()
        count = sum(1 for n in names if "/static/" in n)
        print(f"Wheel {wheels[-1].name}: {len(names)} files, {count} in static/")
        if not count:
            problems.append("the wheel has no static files: build the frontend before the wheel")

    for note in notes:
        print(f"note: {note}")
    if problems:
        print(f"{len(problems)} problem(s) in {project}:")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    print(f"OK: {project}")
    return 0


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub = parser.add_subparsers(dest="action", required=True)

    p = sub.add_parser("new", help="create a remix project")
    p.add_argument("name", help="project name, for example quiet-notebook")
    p.add_argument(
        "--kind",
        choices=sorted(KINDS),
        default="lab",
        help="; ".join(f"{kind}: {text}" for kind, text in KINDS.items()),
    )
    p.add_argument(
        "--federated",
        action="store_true",
        help="kind lab only: also load prebuilt extensions from share/jupyter/labextensions",
    )
    p.add_argument("--app-name", help="name shown in the browser tab")
    p.add_argument("--dest", default=".", help="parent folder (default: current folder)")
    p.add_argument("--dir", help="name of the project folder (default: the project name)")
    p.add_argument(
        "--python",
        help="Python of an environment with JupyterLab: pin the npm packages to that release",
    )
    p.set_defaults(func=new)

    p = sub.add_parser("pin", help="pin the JupyterLab packages to an installed JupyterLab")
    p.add_argument("project")
    p.add_argument("--python", required=True)
    p.set_defaults(func=pin)

    p = sub.add_parser("plan", help="packages and disabled plugins for a selection of core packages")
    p.add_argument("packages", nargs="+", help="for example: notebook fileeditor mainmenu")
    p.add_argument(
        "--exact", action="store_true", help="do not add the packages that the selection requires"
    )
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=plan)

    p = sub.add_parser("check", help="check a project")
    p.add_argument("project")
    p.set_defaults(func=check)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
