#!/usr/bin/env python3
"""
Write JupyterLab configuration snippets, with checks against the installation.

Run it with the Python of the environment that has JupyterLab:

    <env>/bin/python jlab_config.py disable @jupyterlab/extensionmanager-extension
    <env>/bin/python jlab_config.py set @jupyterlab/apputils-extension:themes theme '"JupyterLab Dark"'

The script only writes its own files (default name: 50-custom.json) in
labconfig/page_config.d and labconfig/default_setting_overrides.d.
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from pathlib import Path

try:
    from jupyter_core.paths import jupyter_config_dir, jupyter_config_path, jupyter_path
    from jupyterlab.commands import get_app_dir, get_user_settings_dir
except ImportError as error:
    print(
        f"error: {error}.\nRun this script with the Python of the environment "
        "that has JupyterLab, for example .venv/bin/python jlab_config.py show",
        file=sys.stderr,
    )
    sys.exit(2)

PLUGIN_ID = re.compile(r"""\bid:\s*["'`]((?:@[\w.-]+/)?[\w.-]+:[\w:./-]+)["'`]""")
# Some core plugins keep their ID in a constant: match the literal too.
CORE_PLUGIN_ID = re.compile(r"""["'`](@jupyterlab/[\w-]+-extension:[\w-]+)["'`]""")
LIST_KEYS_MERGED_BY_LAB = {"menus", "contextMenu", "toolbar", "shortcuts"}


def fail(message: str) -> None:
    """
    Print an error and stop.
    """
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def warn(message: str) -> None:
    """
    Print a warning.
    """
    print(f"warning: {message}", file=sys.stderr)


def parse_value(text: str) -> object:
    """
    Read a command-line value as JSON. A bare word becomes a string.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def config_root(args: argparse.Namespace) -> Path:
    """
    Jupyter config folder that receives the snippets.
    """
    if args.config_dir:
        return Path(args.config_dir).resolve()
    scope = args.scope
    env_dir = Path(sys.prefix) / "etc" / "jupyter"
    if scope == "auto":
        in_env = sys.prefix != sys.base_prefix or bool(os.environ.get("CONDA_PREFIX"))
        scope = "env" if in_env and str(env_dir) in jupyter_config_path() else "user"
    return env_dir if scope == "env" else Path(jupyter_config_dir())


def snippet(args: argparse.Namespace, kind: str) -> Path:
    """
    Path of the snippet file of this script for one kind of config.
    """
    return config_root(args) / "labconfig" / f"{kind}.d" / f"{args.name}.json"


def read(path: Path) -> dict:
    """
    Load a snippet, or an empty dict when the file does not exist.
    """
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as error:
        fail(f"{path} is not valid JSON ({error}). Repair or delete it first.")


def write(path: Path, data: dict) -> None:
    """
    Save a snippet. Delete the file when no data remains.
    """
    if not data:
        if path.is_file():
            path.unlink()
            print(f"Removed {path} (empty)")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Wrote {path}")


def schema_files() -> dict[str, Path]:
    """
    Map each plugin ID that has a settings schema to its file.
    """
    found: dict[str, Path] = {}
    core = Path(get_app_dir()) / "schemas"
    for path in core.rglob("*.json"):
        found[f"{path.parent.relative_to(core).as_posix()}:{path.stem}"] = path
    for root in reversed(jupyter_path("labextensions")):
        for path in glob.glob(f"{root}/**/schemas/**/*.json", recursive=True):
            package, _, name = path.split("schemas/", 1)[1].rpartition("/")
            found[f"{package}:{name[: -len('.json')]}"] = Path(path)
    return found


def known_plugins() -> set[str]:
    """
    Plugin IDs found in the schemas and the JavaScript bundles.
    """
    found = set(schema_files())
    folders = [Path(get_app_dir()) / "static"]
    for root in jupyter_path("labextensions"):
        folders += [Path(p) for p in glob.glob(f"{root}/**/static", recursive=True)]
    for folder in folders:
        for path in folder.glob("*.js"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            found.update(match.group(1) for match in PLUGIN_ID.finditer(text))
            found.update(match.group(1) for match in CORE_PLUGIN_ID.finditer(text))
    return found


def installed_extensions() -> set[str]:
    """
    Names of the prebuilt extensions in the labextensions folders.
    """
    names: set[str] = set()
    for root in jupyter_path("labextensions"):
        for pattern in ("*/package.json", "@*/*/package.json"):
            for path in Path(root).glob(pattern):
                names.add(path.parent.relative_to(root).as_posix())
    return names


def default_shortcuts() -> list[dict]:
    """
    Shortcuts that the schemas of the installation define.
    """
    found: list[dict] = []
    for path in schema_files().values():
        try:
            found += json.loads(path.read_text()).get("jupyter.lab.shortcuts", [])
        except json.JSONDecodeError:
            continue
    return found


def check_shortcuts(entries: list) -> None:
    """
    Warn about entries that JupyterLab drops because of a key collision.

    JupyterLab identifies a shortcut by its keys and selector, not by its
    command. Overrides count as defaults, like the shortcuts of the schemas.
    """

    def identity(entry: dict) -> tuple:
        return (tuple(entry.get("keys", [])), entry.get("selector"))

    stock = default_shortcuts()
    disabled = {identity(e) for e in entries if isinstance(e, dict) and e.get("disabled")}
    for entry in entries:
        if not isinstance(entry, dict) or "keys" not in entry:
            continue
        keys = " + ".join(entry["keys"])
        same = [d for d in stock if identity(d) == identity(entry) and not d.get("disabled")]
        if entry.get("disabled"):
            if not same:
                warn(
                    f"the disabled shortcut {keys} on '{entry.get('selector')}' matches no "
                    "default shortcut: keys and selector must be those of the default."
                )
            continue
        if identity(entry) in disabled:
            warn(
                f"{entry.get('command')} on {keys}: a disabled entry with the same keys and "
                "selector removes this shortcut too. Give the new shortcut another "
                "selector that matches the same elements, for example 'html body' "
                "in place of 'body'."
            )
            continue
        others = sorted({d["command"] for d in same if d["command"] != entry.get("command")})
        if others:
            warn(
                f"{keys} on '{entry.get('selector')}' is already the shortcut of "
                f"{', '.join(others)}. JupyterLab keeps one of them only. Add an entry "
                "that disables the old one (same keys and selector, \"disabled\": true) "
                "and give the new shortcut another selector that matches the same "
                "elements, for example 'html body' in place of 'body'."
            )


def check_plugin(target: str, plugins: set[str]) -> None:
    """
    Warn when a plugin or package name matches nothing in the installation.
    """
    packages = {plugin.split(":", 1)[0] for plugin in plugins}
    if target in plugins or target in packages:
        return
    # The plugin IDs of a hand-written extension are not always in its files.
    if target.split(":", 1)[0] in installed_extensions():
        return
    try:
        pattern = re.compile(target)
        if any(pattern.fullmatch(item) for item in plugins | packages):
            return
    except re.error:
        pass
    close = sorted(p for p in plugins if target.split(":")[0] in p)[:8]
    hint = ("\n  Similar IDs:\n    " + "\n    ".join(close)) if close else ""
    warn(f"'{target}' matches no plugin or package of this installation.{hint}")


def dependents(targets: list[str], already: set[str]) -> dict[str, str]:
    """
    Core plugins that cannot activate when the targets are disabled.

    Maps each dependent to the service token that it loses. The data comes
    from a stock JupyterLab (core_plugins.json), so it knows core plugins only.
    """
    path = Path(__file__).with_name("core_plugins.json")
    if not path.is_file():
        return {}
    graph = json.loads(path.read_text())["plugins"]

    def matches(plugin: str, names: set[str]) -> bool:
        return plugin in names or plugin.split(":", 1)[0] in names

    gone = set(targets) | already
    lost: dict[str, str] = {}
    changed = True
    while changed:
        changed = False
        tokens = {
            data["provides"]: plugin
            for plugin, data in graph.items()
            if data["provides"] and (matches(plugin, gone) or plugin in lost)
        }
        for plugin, data in graph.items():
            if plugin in lost or matches(plugin, gone):
                continue
            missing = next((token for token in data["requires"] if token in tokens), None)
            if missing:
                lost[plugin] = missing
                changed = True
    return lost


def check_setting(plugin: str, key: str, value: object) -> None:
    """
    Check a setting against the schema of the plugin. Stop on a clear error.
    """
    schemas = schema_files()
    if plugin not in schemas:
        close = sorted(p for p in schemas if plugin.split(":")[0] in p)[:8]
        hint = ("\n  Similar IDs:\n    " + "\n    ".join(close)) if close else ""
        fail(f"no settings schema for '{plugin}'. A wrong ID has no effect.{hint}")
    schema = json.loads(schemas[plugin].read_text())
    properties = schema.get("properties", {})
    if key not in properties:
        fail(
            f"'{key}' is not a setting of {plugin}. "
            f"Settings: {', '.join(properties) or '(none)'}"
        )
    try:
        import jsonschema
    except ImportError:
        return
    fragment = dict(properties[key])
    fragment["definitions"] = schema.get("definitions", {})
    target = value
    default = properties[key].get("default")
    # JupyterLab merges an override of an object into the default of the schema.
    if isinstance(value, dict) and isinstance(default, dict):
        target = {**default, **value}
    try:
        jsonschema.validate(target, fragment)
    except jsonschema.ValidationError as error:
        fail(f"value for {plugin} -> {key} does not match the schema: {error.message}")
    except jsonschema.SchemaError:
        return


def cmd_disable(args: argparse.Namespace) -> None:
    """
    Add plugins or packages to disabledExtensions.
    """
    path = snippet(args, "page_config")
    data = read(path)
    plugins = known_plugins() if not args.no_validate else set()
    disabled = data.setdefault("disabledExtensions", {})
    for target in args.targets:
        if plugins:
            check_plugin(target, plugins)
        disabled[target] = True
        if args.lock:
            data.setdefault("lockedExtensions", {})[target] = True
    cascade(args, disabled, plugins)
    write(path, data)


def cascade(args: argparse.Namespace, disabled: dict, plugins: set[str]) -> None:
    """
    Add the plugins that require a disabled plugin, or only report them.
    """
    targets = [target for target, off in disabled.items() if off]
    lost = dependents(targets, set())
    lost = {plugin: token for plugin, token in lost.items() if not plugins or plugin in plugins}
    if not lost:
        return
    verb = "Left enabled" if args.no_cascade else "Also disabled"
    print(f"{verb}: {len(lost)} plugin(s) that require a disabled plugin:")
    for plugin, token in sorted(lost.items()):
        print(f"  {plugin}  (needs {token.split(':')[-1]})")
        if not args.no_cascade:
            disabled[plugin] = True
    if args.no_cascade:
        print("These plugins will log activation errors in the browser console.")


def cmd_enable(args: argparse.Namespace) -> None:
    """
    Remove plugins from the snippet, or force them on with --force.
    """
    path = snippet(args, "page_config")
    data = read(path)
    disabled = data.setdefault("disabledExtensions", {})
    for target in args.targets:
        if args.force:
            # false wins against a 'true' in a file of lower priority.
            disabled[target] = False
        else:
            disabled.pop(target, None)
        data.get("lockedExtensions", {}).pop(target, None)
    for key in ("disabledExtensions", "lockedExtensions"):
        if key in data and not data[key]:
            del data[key]
    write(path, data)


def cmd_page(args: argparse.Namespace) -> None:
    """
    Set or remove a top-level page config key, for example appName.
    """
    path = snippet(args, "page_config")
    data = read(path)
    if args.value is None:
        data.pop(args.key, None)
    else:
        data[args.key] = parse_value(args.value)
    write(path, data)


def cmd_set(args: argparse.Namespace) -> None:
    """
    Set the default value of a setting.
    """
    value = parse_value(args.value)
    if not args.no_validate:
        # --append gives one item of the list, or a list of items.
        checked = [value] if args.append and not isinstance(value, list) else value
        check_setting(args.plugin, args.key, checked)
    path = snippet(args, "default_setting_overrides")
    data = read(path)
    section = data.setdefault(args.plugin, {})
    if args.append:
        current = section.get(args.key, [])
        if not isinstance(current, list):
            fail(f"--append needs a list, but {args.key} is {type(current).__name__}")
        section[args.key] = current + (value if isinstance(value, list) else [value])
    elif args.merge and isinstance(value, dict) and isinstance(section.get(args.key), dict):
        section[args.key] = {**section[args.key], **value}
    else:
        section[args.key] = value
    write(path, data)
    if args.key == "shortcuts" and not args.no_validate:
        check_shortcuts(section[args.key])
    if args.key in LIST_KEYS_MERGED_BY_LAB:
        print(
            f"Note: JupyterLab merges '{args.key}' with the built-in items. "
            'Remove a built-in item with "disabled": true.'
        )


def cmd_unset(args: argparse.Namespace) -> None:
    """
    Remove a default override, or all overrides of a plugin.
    """
    path = snippet(args, "default_setting_overrides")
    data = read(path)
    if args.key is None:
        data.pop(args.plugin, None)
    elif args.plugin in data:
        data[args.plugin].pop(args.key, None)
        if not data[args.plugin]:
            del data[args.plugin]
    write(path, data)


def cmd_user_set(args: argparse.Namespace) -> None:
    """
    Write a user setting. It has priority over all defaults, for one user.
    """
    value = parse_value(args.value)
    if not args.no_validate:
        check_setting(args.plugin, args.key, value)
    package, _, name = args.plugin.rpartition(":")
    path = Path(get_user_settings_dir()) / package / f"{name}.jupyterlab-settings"
    data = {}
    if path.is_file():
        text = path.read_text()
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            try:
                import json5

                data = json5.loads(text)
            except Exception:
                fail(f"cannot parse {path}. Edit it by hand.")
    data[args.key] = value
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=4) + "\n")
    print(f"Wrote {path}")


def cmd_apply(args: argparse.Namespace) -> None:
    """
    Apply a JSON file with the keys "disable", "page" and "overrides".
    """
    spec = json.loads(Path(args.file).read_text())
    unknown = set(spec) - {"disable", "lock", "page", "overrides"}
    if unknown:
        fail(f"unknown keys in {args.file}: {', '.join(sorted(unknown))}")
    page_path = snippet(args, "page_config")
    page = read(page_path)
    plugins = known_plugins() if not args.no_validate else set()
    for target in spec.get("disable", []):
        if plugins:
            check_plugin(target, plugins)
        page.setdefault("disabledExtensions", {})[target] = True
    if spec.get("disable"):
        cascade(args, page["disabledExtensions"], plugins)
    for target in spec.get("lock", []):
        page.setdefault("lockedExtensions", {})[target] = True
    page.update(spec.get("page", {}))
    write(page_path, page)

    overrides_path = snippet(args, "default_setting_overrides")
    overrides = read(overrides_path)
    for plugin, values in spec.get("overrides", {}).items():
        for key, value in values.items():
            if not args.no_validate:
                check_setting(plugin, key, value)
            overrides.setdefault(plugin, {})[key] = value
            if key == "shortcuts" and not args.no_validate:
                check_shortcuts(value)
    write(overrides_path, overrides)


def cmd_show(args: argparse.Namespace) -> None:
    """
    Print the snippets of this script.
    """
    for kind in ("page_config", "default_setting_overrides"):
        path = snippet(args, kind)
        print(f"# {path}")
        print(json.dumps(read(path), indent=2) if path.is_file() else "(not present)")


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--scope",
        choices=["auto", "env", "user"],
        default="auto",
        help="env: <sys.prefix>/etc/jupyter; user: the user config folder; "
        "auto: env inside a virtual environment, else user",
    )
    parser.add_argument(
        "--config-dir",
        help="explicit Jupyter config folder, for example the jupyter-config "
        "folder of a distribution project",
    )
    parser.add_argument("--name", default="50-custom", help="base name of the snippet files")
    parser.add_argument(
        "--no-validate", action="store_true", help="do not check IDs and values"
    )
    parser.add_argument(
        "--no-cascade",
        action="store_true",
        help="do not add the plugins that require a disabled plugin",
    )
    sub = parser.add_subparsers(dest="action", required=True)

    p = sub.add_parser("disable", help="disable plugins or packages")
    p.add_argument("targets", nargs="+")
    p.add_argument("--lock", action="store_true", help="also lock them in the Plugin Manager")
    p.set_defaults(func=cmd_disable)

    p = sub.add_parser("enable", help="undo a disable")
    p.add_argument("targets", nargs="+")
    p.add_argument(
        "--force",
        action="store_true",
        help="write 'false', to re-enable what a file of lower priority disables",
    )
    p.set_defaults(func=cmd_enable)

    p = sub.add_parser("page", help="set a page config key (omit the value to remove it)")
    p.add_argument("key")
    p.add_argument("value", nargs="?")
    p.set_defaults(func=cmd_page)

    p = sub.add_parser("set", help="set the default of a setting")
    p.add_argument("plugin")
    p.add_argument("key")
    p.add_argument("value", help="JSON value")
    p.add_argument("--append", action="store_true", help="append to the list in the snippet")
    p.add_argument("--merge", action="store_true", help="merge into the object in the snippet")
    p.set_defaults(func=cmd_set)

    p = sub.add_parser("unset", help="remove a default override")
    p.add_argument("plugin")
    p.add_argument("key", nargs="?")
    p.set_defaults(func=cmd_unset)

    p = sub.add_parser("user-set", help="write a user setting (highest priority)")
    p.add_argument("plugin")
    p.add_argument("key")
    p.add_argument("value", help="JSON value")
    p.set_defaults(func=cmd_user_set)

    p = sub.add_parser("apply", help="apply a JSON file of changes")
    p.add_argument("file")
    p.set_defaults(func=cmd_apply)

    sub.add_parser("show", help="print the snippets").set_defaults(func=cmd_show)

    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
