#!/usr/bin/env python3
"""
Create, check, install and remove JupyterLab extensions that need no build.

An extension of this type is a folder with a package.json and one plain
JavaScript file. JupyterLab loads it from share/jupyter/labextensions.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets" / "nobuild"
MARKER = "jlab-ext"
NAME_PATTERN = re.compile(r"^(@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*$")


def fail(message: str) -> None:
    """
    Print an error and stop.
    """
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def labextensions_dir(args: argparse.Namespace) -> Path:
    """
    Folder that receives the extension, from the command-line options.
    """
    if args.labextensions_dir:
        return Path(args.labextensions_dir).resolve()
    python = os.path.abspath(args.python)
    if args.user:
        code = "from jupyter_core.paths import jupyter_data_dir; print(jupyter_data_dir())"
    else:
        code = "import sys; print(sys.prefix + '/share/jupyter')"
    try:
        result = subprocess.run([python, "-c", code], capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError) as error:
        fail(f"cannot ask {python} for its data folder: {error}")
    return Path(result.stdout.strip()) / "labextensions"


def read_package(source: Path) -> dict:
    """
    Load the package.json of an extension folder.
    """
    path = source / "package.json"
    if not path.is_file():
        fail(f"{path} does not exist")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as error:
        fail(f"{path} is not valid JSON: {error}")


def write_schema(target: Path, name: str, description: str, version: str) -> Path:
    """
    Write an empty settings schema for the plugin <name>:plugin.
    """
    schemas = target / "schemas" / name
    schemas.mkdir(parents=True, exist_ok=True)
    schema = {
        "title": name,
        "description": description,
        "jupyter.lab.menus": {"main": [], "context": []},
        "jupyter.lab.toolbars": {},
        "jupyter.lab.shortcuts": [],
        "type": "object",
        "properties": {},
        "additionalProperties": False,
    }
    path = schemas / "plugin.json"
    path.write_text(json.dumps(schema, indent=2) + "\n")
    # The settings handler reads the version from this file.
    (schemas / "package.json.orig").write_text(
        json.dumps({"name": name, "version": version}, indent=2) + "\n"
    )
    return path


def add_schema(args: argparse.Namespace) -> int:
    """
    Add a settings schema to an extension that has none.
    """
    source = Path(args.source).resolve()
    package = read_package(source)
    name = package["name"]
    path = source / "schemas" / name / "plugin.json"
    if path.exists():
        fail(f"{path} already exists")
    write_schema(source, name, package.get("description", name), package.get("version", "0.1.0"))
    package.setdefault("jupyterlab", {})["schemaDir"] = "schemas"
    (source / "package.json").write_text(json.dumps(package, indent=2) + "\n")
    print(f"Created {path}")
    print(f"The schema belongs to the plugin '{name}:plugin': one plugin must have this ID.")
    return 0


def stamp_value(source: Path) -> str:
    """
    Path of the entry file with a hash of all files of static/.

    JupyterLab tells the browser to keep the files of static/ for one year.
    Only a new URL makes the browser load a changed file.
    """
    static = source / "static"
    digest = hashlib.sha256()
    for file in sorted(path for path in static.rglob("*") if path.is_file()):
        digest.update(file.relative_to(static).as_posix().encode())
        digest.update(file.read_bytes())
    return f"static/remoteEntry.js?v={digest.hexdigest()[:8]}"


def write_stamp(source: Path) -> str:
    """
    Write the stamped path of the entry file into package.json.
    """
    package = read_package(source)
    value = stamp_value(source)
    build = package.setdefault("jupyterlab", {}).setdefault("_build", {})
    if build.get("load") != value:
        build["load"] = value
        (source / "package.json").write_text(json.dumps(package, indent=2) + "\n")
    return value


def stamp(args: argparse.Namespace) -> int:
    """
    Stamp an extension after a change in its static/ folder.
    """
    source = Path(args.source).resolve()
    print(f"{source.name}: {write_stamp(source)}")
    return 0


def new(args: argparse.Namespace) -> int:
    """
    Write the files of a new extension.
    """
    name = args.name
    if not NAME_PATTERN.match(name):
        fail("the name must be a valid npm package name, in lower case")
    target = Path(args.dest).resolve() / name
    if target.exists():
        fail(f"{target} already exists")
    static = target / "static"
    static.mkdir(parents=True)

    description = args.description or f"Customizations for JupyterLab ({name})"
    package: dict = {
        "name": name,
        "version": args.version,
        "description": description,
        "jupyterlab": {
            "extension": True,
            "_build": {"load": "static/remoteEntry.js", "extension": "./extension"},
        },
    }
    if args.disable:
        package["jupyterlab"]["disabledExtensions"] = args.disable
    if args.schema:
        package["jupyterlab"]["schemaDir"] = "schemas"
    (target / "package.json").write_text(json.dumps(package, indent=2) + "\n")
    (target / "install.json").write_text(
        json.dumps(
            {
                "packageManager": MARKER,
                "packageName": name,
                "uninstallInstructions": f"Remove the folder share/jupyter/labextensions/{name}",
            },
            indent=2,
        )
        + "\n"
    )

    template = (ASSETS / "remoteEntry.js").read_text()
    stylesheets = "'style.css'" if args.style else ""
    script = (
        template.replace("__NAME__", name)
        .replace("__DESCRIPTION__", description.replace("'", "\\'"))
        .replace("__STYLESHEETS__", stylesheets)
    )
    (static / "remoteEntry.js").write_text(script)

    if args.style:
        (static / "style.css").write_text(f"/*\n * Styles of {name}.\n */\n")
    if args.schema:
        write_schema(target, name, description, args.version)
    write_stamp(target)

    print(f"Created {target}")
    print(f"Edit {static / 'remoteEntry.js'}: SHARED and createPlugins().")
    print(f"Then: python {Path(__file__).name} install {target} --python <env python>")
    return 0


def check_source(source: Path) -> list[str]:
    """
    Return the problems found in an extension folder.
    """
    problems: list[str] = []
    package = read_package(source)
    name = package.get("name")
    lab = package.get("jupyterlab")
    if not name:
        problems.append("package.json has no 'name'")
    if not isinstance(lab, dict) or "_build" not in lab:
        problems.append("package.json has no 'jupyterlab._build' (JupyterLab ignores the folder)")
        return problems
    build = lab["_build"]
    stamped = build.get("load")
    load = (stamped or "").split("?")[0]
    if not load or not (source / load).is_file():
        problems.append(f"'jupyterlab._build.load' points to a missing file: {stamped}")
    elif load == "static/remoteEntry.js" and stamped != stamp_value(source):
        problems.append(
            "the stamp of static/ is absent or old, and a browser can keep the old files: "
            f"run '{Path(__file__).name} stamp {source}'"
        )
    if not (build.get("extension") or build.get("mimeExtension")):
        problems.append("'jupyterlab._build' needs 'extension' or 'mimeExtension'")
    disabled = lab.get("disabledExtensions", [])
    if not isinstance(disabled, list):
        problems.append("'jupyterlab.disabledExtensions' must be a list in package.json")

    if load and (source / load).is_file():
        entry = source / load
        text = entry.read_text()
        if "_JUPYTERLAB" not in text:
            problems.append(f"{load} does not register window._JUPYTERLAB[name]")
        match = re.search(r"const NAME = '([^']+)'", text)
        if match and match.group(1) != name:
            problems.append(
                f"NAME in {load} is '{match.group(1)}' but package.json says '{name}'"
            )
        if re.search(r"^\s*(import|export)\s", text, re.MULTILINE):
            problems.append(f"{load} uses import/export; it must be a plain script")
        node = shutil.which("node")
        if node:
            result = subprocess.run([node, "--check", str(entry)], capture_output=True, text=True)
            if result.returncode != 0:
                problems.append(f"syntax error in {load}:\n{result.stderr.strip()}")
        for sheet in re.findall(r"const STYLESHEETS = \[([^\]]*)\]", text):
            for file in re.findall(r"'([^']+)'", sheet):
                if not (entry.parent / file).is_file():
                    problems.append(f"stylesheet {file} is missing in {entry.parent.name}/")

    schemas = source / "schemas"
    if schemas.is_dir():
        expected = schemas / name if name else schemas
        files = list(schemas.rglob("*.json"))
        for file in files:
            if file.parent != expected:
                problems.append(f"schema {file.relative_to(source)} must be in schemas/{name}/")
            try:
                data = json.loads(file.read_text())
            except json.JSONDecodeError as error:
                problems.append(f"{file.relative_to(source)} is not valid JSON: {error}")
                continue
            if data.get("type") != "object":
                problems.append(f"{file.relative_to(source)} needs \"type\": \"object\"")
        if files and not (expected / "package.json.orig").is_file():
            problems.append(f"schemas/{name}/package.json.orig is missing")

    themes = source / "themes"
    if themes.is_dir() and not list(themes.rglob("index.css")):
        problems.append("themes/ has no index.css")
    return problems


def check(args: argparse.Namespace) -> int:
    """
    Check an extension folder and report the problems.
    """
    source = Path(args.source).resolve()
    problems = check_source(source)
    if problems:
        print(f"{len(problems)} problem(s) in {source}:")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    print(f"OK: {source}")
    return 0


def is_ours(target: Path) -> bool:
    """
    Tell if this script installed the target.
    """
    if target.is_symlink():
        return True
    install = target / "install.json"
    if not install.is_file():
        return False
    try:
        return json.loads(install.read_text()).get("packageManager") == MARKER
    except json.JSONDecodeError:
        return False


def remove(target: Path) -> None:
    """
    Delete an installed extension (a link or a folder).
    """
    if target.is_symlink():
        target.unlink()
    else:
        shutil.rmtree(target)


def install(args: argparse.Namespace) -> int:
    """
    Copy or link an extension folder into labextensions.
    """
    source = Path(args.source).resolve()
    if (source / "static" / "remoteEntry.js").is_file():
        write_stamp(source)
    problems = check_source(source)
    if problems:
        print("The extension has problems:")
        for problem in problems:
            print(f"  - {problem}")
        if not args.force:
            return 1
    name = read_package(source)["name"]
    root = labextensions_dir(args)
    target = root / name
    if target.exists() or target.is_symlink():
        # A package owns the other folders; pip must remove them.
        if not is_ours(target) and not args.force:
            fail(f"{target} exists and this script did not install it (use --force)")
        remove(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    if args.link:
        target.symlink_to(source, target_is_directory=True)
        print(f"Linked {target} -> {source}")
    else:
        shutil.copytree(source, target)
        print(f"Copied {source} to {target}")
    print("Restart the server to load a new extension.")
    print(f"After a change in static/: python {Path(__file__).name} stamp {source}, then reload")
    print("the page. Without the stamp, a browser keeps the old JavaScript and CSS.")
    return 0


def uninstall(args: argparse.Namespace) -> int:
    """
    Remove an extension that this script installed.
    """
    target = labextensions_dir(args) / args.name
    if not (target.exists() or target.is_symlink()):
        fail(f"{target} does not exist")
    if not is_ours(target) and not args.force:
        fail(f"this script did not install {target}; uninstall its package instead")
    remove(target)
    print(f"Removed {target}")
    return 0


def add_target_options(parser: argparse.ArgumentParser) -> None:
    """
    Add the options that select the labextensions folder.
    """
    parser.add_argument(
        "--python",
        default=sys.executable,
        help="Python of the target environment (default: this Python)",
    )
    parser.add_argument(
        "--user", action="store_true", help="use the user data folder, for all environments"
    )
    parser.add_argument("--labextensions-dir", help="explicit labextensions folder")
    parser.add_argument("--force", action="store_true")


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)

    p_new = sub.add_parser("new", help="create the files of an extension")
    p_new.add_argument("name", help="npm-style name, for example my-lab-tweaks")
    p_new.add_argument("--dest", default=".", help="parent folder (default: current folder)")
    p_new.add_argument("--description")
    p_new.add_argument("--version", default="0.1.0")
    p_new.add_argument("--style", action="store_true", help="add static/style.css")
    p_new.add_argument(
        "--schema",
        action="store_true",
        help="add a settings schema (settings, menus, toolbars, shortcuts)",
    )
    p_new.add_argument(
        "--disable",
        action="append",
        default=[],
        metavar="PLUGIN_ID",
        help="plugin or package that this extension replaces (can repeat)",
    )
    p_new.set_defaults(func=new)

    p_schema = sub.add_parser("add-schema", help="add a settings schema to an extension")
    p_schema.add_argument("source")
    p_schema.set_defaults(func=add_schema)

    p_check = sub.add_parser("check", help="check an extension folder")
    p_check.add_argument("source")
    p_check.set_defaults(func=check)

    p_stamp = sub.add_parser("stamp", help="mark a change in static/, so that browsers load it")
    p_stamp.add_argument("source")
    p_stamp.set_defaults(func=stamp)

    p_install = sub.add_parser("install", help="copy or link into labextensions")
    p_install.add_argument("source")
    p_install.add_argument("--link", action="store_true", help="symlink, for live edits")
    add_target_options(p_install)
    p_install.set_defaults(func=install)

    p_uninstall = sub.add_parser("uninstall", help="remove an installed extension")
    p_uninstall.add_argument("name")
    add_target_options(p_uninstall)
    p_uninstall.set_defaults(func=uninstall)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
