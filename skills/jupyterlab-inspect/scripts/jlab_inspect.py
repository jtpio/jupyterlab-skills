#!/usr/bin/env python3
"""
Report how a JupyterLab installation is configured, without a browser.

Run it with the Python of the environment that has JupyterLab:

    <env>/bin/python jlab_inspect.py paths
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from pathlib import Path

def use_project(argv: list[str]) -> None:
    """
    Put a distribution project in front of the Jupyter paths.

    It must run before the import of jupyter_core, which reads the variables.
    """
    if "--project" not in argv:
        return
    index = argv.index("--project")
    if index + 1 >= len(argv):
        return
    project = Path(argv[index + 1]).resolve()
    for variable, folder in (
        ("JUPYTER_CONFIG_PATH", project / "jupyter-config"),
        ("JUPYTER_PATH", project),
    ):
        current = os.environ.get(variable)
        os.environ[variable] = str(folder) + (os.pathsep + current if current else "")


use_project(sys.argv)

try:
    from jupyter_core.paths import (
        jupyter_config_dir,
        jupyter_config_path,
        jupyter_data_dir,
        jupyter_path,
    )
    from jupyterlab.commands import get_app_dir, get_user_settings_dir, get_workspaces_dir
    from jupyterlab_server.config import get_federated_extensions, get_page_config
    from jupyterlab_server.settings_utils import _get_overrides
except ImportError as error:
    print(
        f"error: {error}.\nRun this script with the Python of the environment "
        "that has JupyterLab, for example .venv/bin/python jlab_inspect.py paths",
        file=sys.stderr,
    )
    sys.exit(2)

try:
    import json5
except ImportError:
    json5 = None

PLUGIN_ID = re.compile(r"""\bid:\s*["'`]((?:@[\w.-]+/)?[\w.-]+:[\w:./-]+)["'`]""")
# The description follows the ID in most plugin definitions.
PLUGIN_DESCRIPTION = re.compile(
    r"""\bid:\s*["'`]((?:@[\w.-]+/)?[\w.-]+:[\w:./-]+)["'`],\s*description:\s*"""
    r"""(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)"""
)
# Some core plugins keep their ID in a constant: match the literal too.
CORE_PLUGIN_ID = re.compile(r"""["'`](@jupyterlab/[\w-]+-extension:[\w-]+)["'`]""")


def load_json(path: str | Path) -> dict:
    """
    Read a JSON or JSON5 file. Return an empty dict when it is not valid.
    """
    text = Path(path).read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        if json5 is not None:
            try:
                return json5.loads(text)
            except Exception:
                pass
    return {"__invalid__": True}


def writable(path: str | Path) -> bool:
    """
    Tell if a folder, or its first existing parent, accepts new files.
    """
    path = Path(path)
    while not path.exists() and path != path.parent:
        path = path.parent
    return os.access(path, os.W_OK)


def labextensions_path() -> list[str]:
    """
    Folders that JupyterLab searches for prebuilt extensions.
    """
    return jupyter_path("labextensions")


def config_files(kind: str) -> list[Path]:
    """
    Files that set page config or default setting overrides, lowest priority first.
    """
    files: list[Path] = []
    for root in reversed(jupyter_config_path()):
        base = Path(root) / "labconfig"
        single = base / f"{kind}.json"
        if single.is_file():
            files.append(single)
        files.extend(sorted((base / f"{kind}.d").glob("*.json")))
    return files


def paths() -> dict:
    """
    Collect the folders that matter for customization.
    """
    prefix_config = Path(sys.prefix) / "etc" / "jupyter"
    config = jupyter_config_path()
    user_config = jupyter_config_dir()
    env_listed = str(prefix_config) in config
    return {
        "python": sys.executable,
        "prefix": sys.prefix,
        "in_virtual_env": sys.prefix != sys.base_prefix or bool(os.environ.get("CONDA_PREFIX")),
        "config_path": [
            {"path": p, "exists": os.path.isdir(p), "writable": writable(p)} for p in config
        ],
        "data_path": [
            {"path": p, "exists": os.path.isdir(p), "writable": writable(p)}
            for p in jupyter_path()
        ],
        "app_dir": get_app_dir(),
        "user_settings_dir": get_user_settings_dir(),
        "workspaces_dir": get_workspaces_dir(),
        "labextensions_path": labextensions_path(),
        "write_targets": {
            "environment": {
                "labconfig": str(prefix_config / "labconfig"),
                "server_config": str(prefix_config / "jupyter_server_config.d"),
                "labextensions": str(Path(sys.prefix) / "share" / "jupyter" / "labextensions"),
                "usable": env_listed and writable(prefix_config),
            },
            "user": {
                "labconfig": str(Path(user_config) / "labconfig"),
                "server_config": str(Path(user_config) / "jupyter_server_config.d"),
                "labextensions": str(Path(jupyter_data_dir()) / "labextensions"),
                "usable": writable(user_config),
            },
        },
        "environment_variables": {
            name: os.environ[name]
            for name in (
                "JUPYTER_CONFIG_DIR",
                "JUPYTER_CONFIG_PATH",
                "JUPYTER_DATA_DIR",
                "JUPYTER_PATH",
                "JUPYTER_PREFER_ENV_PATH",
                "JUPYTERLAB_DIR",
                "JUPYTERLAB_SETTINGS_DIR",
                "JUPYTERLAB_WORKSPACES_DIR",
            )
            if name in os.environ
        },
    }


def schema_files() -> dict[str, Path]:
    """
    Map each plugin ID that has a settings schema to its file.
    """
    found: dict[str, Path] = {}
    core = Path(get_app_dir()) / "schemas"
    for path in core.rglob("*.json"):
        package = path.parent.relative_to(core).as_posix()
        found[f"{package}:{path.stem}"] = path
    for root in reversed(labextensions_path()):
        for path in glob.glob(f"{root}/**/schemas/**/*.json", recursive=True):
            relative = path.split("schemas/", 1)[1]
            package, _, name = relative.rpartition("/")
            found[f"{package}:{name[: -len('.json')]}"] = Path(path)
    return found


def bundle_plugins() -> dict[str, dict]:
    """
    Find plugins in the JavaScript bundles: source and description of each ID.

    The bundles are minified, so a plugin that keeps its ID in a constant has
    no description here. The browser probe has the complete data.
    """
    found: dict[str, dict] = {}
    sources = [("core", Path(get_app_dir()) / "static")]
    for name, data in get_federated_extensions(labextensions_path()).items():
        sources.append((name, Path(data["ext_path"]) / "static"))
    for source, folder in sources:
        for path in folder.glob("*.js"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            for match in PLUGIN_ID.finditer(text):
                found.setdefault(match.group(1), {"source": source, "description": ""})
            if source == "core":
                for match in CORE_PLUGIN_ID.finditer(text):
                    found.setdefault(match.group(1), {"source": source, "description": ""})
            for match in PLUGIN_DESCRIPTION.finditer(text):
                description = next(group for group in match.groups()[1:] if group is not None)
                if match.group(1) in found and description:
                    found[match.group(1)]["description"] = description.replace("\\", "")
    return found


def schema_parts(key: str) -> list[tuple[str, object]]:
    """
    The value of one top-level key in each settings schema that has it.
    """
    parts = []
    for plugin_id, path in sorted(schema_files().items()):
        value = load_json(path).get(key)
        if value:
            parts.append((plugin_id, value))
    return parts


def keep(row: dict, text: str | None) -> bool:
    """
    Tell if a row matches the filter text of the command line.
    """
    return not text or text.lower() in json.dumps(row).lower()


def show(rows: list[dict], columns: list[str], args: argparse.Namespace, note: str = "") -> None:
    """
    Print rows as JSON or as aligned columns, with a count on stderr.
    """
    if args.json:
        print(json.dumps(rows, indent=2))
        return
    table = [[("" if row.get(c) is None else str(row[c])) for c in columns] for row in rows]
    widths = [max([len(c)] + [len(line[i]) for line in table]) for i, c in enumerate(columns)]
    for line in [columns] + table:
        print("  ".join(value.ljust(width) for value, width in zip(line, widths)).rstrip())
    print(f"\n{len(rows)} row(s). {note}".rstrip(), file=sys.stderr)


def effective_page_config() -> dict:
    """
    Page config as the server computes it, with the disabled list.
    """
    settings_dir = str(Path(get_app_dir()) / "settings")
    return get_page_config(labextensions_path(), settings_dir)


def is_disabled(plugin_id: str, disabled: list[str]) -> bool:
    """
    Apply the matching rules of JupyterLab: exact ID, package name, or regex.
    """
    package = plugin_id.split(":", 1)[0]
    for pattern in disabled:
        if pattern in (plugin_id, package):
            return True
        try:
            if re.fullmatch(pattern, plugin_id) or re.fullmatch(pattern, package):
                return True
        except re.error:
            continue
    return False


def cmd_paths(args: argparse.Namespace) -> None:
    """
    Print the folders and where to write.
    """
    data = paths()
    if args.json:
        print(json.dumps(data, indent=2))
        return
    print(f"Python:            {data['python']}")
    print(f"Prefix:            {data['prefix']}  (virtual env: {data['in_virtual_env']})")
    print(f"Application dir:   {data['app_dir']}")
    print(f"User settings:     {data['user_settings_dir']}")
    print(f"Workspaces:        {data['workspaces_dir']}")
    print("Config path (highest priority first):")
    for item in data["config_path"]:
        flags = ("exists" if item["exists"] else "missing") + (
            ", writable" if item["writable"] else ", read-only"
        )
        print(f"  {item['path']}  [{flags}]")
    print("Labextensions path:")
    for item in data["labextensions_path"]:
        print(f"  {item}")
    print("Where to write:")
    for scope, target in data["write_targets"].items():
        print(f"  {scope}:{'' if target['usable'] else '  (not usable)'}")
        print(f"    page config and overrides: {target['labconfig']}/")
        print(f"    server config:             {target['server_config']}/")
        print(f"    extensions:                {target['labextensions']}/")
    if data["environment_variables"]:
        print("Environment variables that change the paths:")
        for name, value in data["environment_variables"].items():
            print(f"  {name}={value}")


def cmd_extensions(args: argparse.Namespace) -> None:
    """
    List the prebuilt extensions and the plugins they disable.
    """
    disabled = effective_page_config().get("disabledExtensions", [])
    rows = []
    for name, data in sorted(get_federated_extensions(labextensions_path()).items()):
        lab = data.get("jupyterlab", {})
        rows.append(
            {
                "name": name,
                "version": data.get("version"),
                "path": data.get("ext_path"),
                "enabled": not is_disabled(name, disabled),
                "disables": lab.get("disabledExtensions", []),
                "has_schema": os.path.isdir(os.path.join(data.get("ext_path", ""), "schemas")),
                "has_themes": os.path.isdir(os.path.join(data.get("ext_path", ""), "themes")),
            }
        )
    if args.json:
        print(json.dumps(rows, indent=2))
        return
    for row in rows:
        state = "enabled" if row["enabled"] else "DISABLED"
        print(f"{row['name']} {row['version']}  [{state}]  {row['path']}")
        if row["disables"]:
            print(f"    disables: {', '.join(row['disables'])}")


def cmd_plugins(args: argparse.Namespace) -> None:
    """
    List plugin IDs, with their source and state.
    """
    schemas = schema_files()
    bundles = bundle_plugins()
    disabled = effective_page_config().get("disabledExtensions", [])
    rows = []
    for plugin_id in sorted(set(schemas) | set(bundles)):
        title = ""
        if plugin_id in schemas:
            title = load_json(schemas[plugin_id]).get("title", "")
        bundle = bundles.get(plugin_id, {})
        row = {
            "id": plugin_id,
            "disabled": is_disabled(plugin_id, disabled),
            "has_settings": plugin_id in schemas,
            "title": bundle.get("description") or title,
            "source": bundle.get("source", "schema"),
        }
        if not args.pattern or args.pattern.lower() in f"{plugin_id} {row['title']}".lower():
            rows.append(row)
    if args.json:
        print(json.dumps(rows, indent=2))
        return
    for row in rows:
        marks = []
        if row["disabled"]:
            marks.append("DISABLED")
        if row["has_settings"]:
            marks.append("settings")
        if row["source"] not in ("core", "schema"):
            marks.append(f"from {row['source']}")
        suffix = f"  [{', '.join(marks)}]" if marks else ""
        title = f"  - {row['title']}" if row["title"] else ""
        print(f"{row['id']}{suffix}{title}")
    print(
        f"\n{len(rows)} plugin(s), from the files on disk. For the service that a "
        "plugin provides and the plugins that need it, use the browser probe of "
        "the jupyterlab-verify skill: jlab_probe.cjs --list plugins --grep <text>.",
        file=sys.stderr,
    )


def describe(value: object, limit: int = 100) -> str:
    """
    Short JSON form of a value.
    """
    text = json.dumps(value)
    return text if len(text) <= limit else text[: limit - 3] + "..."


def cmd_schema(args: argparse.Namespace) -> None:
    """
    Show the settings of one plugin: keys, types, defaults, overrides.
    """
    schemas = schema_files()
    if args.plugin not in schemas:
        close = [p for p in schemas if args.plugin.lower() in p.lower()]
        print(f"error: no settings schema for '{args.plugin}'.", file=sys.stderr)
        if close:
            print("Did you mean:\n  " + "\n  ".join(close), file=sys.stderr)
        sys.exit(1)
    schema = load_json(schemas[args.plugin])
    if args.json:
        print(json.dumps(schema, indent=2))
        return
    overrides, _ = _get_overrides(str(Path(get_app_dir()) / "settings"))
    override = overrides.get(args.plugin, {})
    package, _, name = args.plugin.rpartition(":")
    user_file = Path(get_user_settings_dir()) / package / f"{name}.jupyterlab-settings"

    print(f"{args.plugin}  - {schema.get('title', '')}")
    if schema.get("description"):
        print(f"  {schema['description']}")
    print(f"  schema file: {schemas[args.plugin]}")
    print(f"  user file:   {user_file}  [{'exists' if user_file.is_file() else 'not set'}]")
    properties = schema.get("properties", {})
    if properties:
        print("\nSettings:")
    for key, prop in properties.items():
        kind = prop.get("type") or ("enum" if "enum" in prop else "any")
        print(f"  {key}  ({kind})  default: {describe(prop.get('default'))}")
        if key in override:
            print(f"      overridden default: {describe(override[key])}")
        if "enum" in prop:
            print(f"      values: {describe(prop['enum'], 200)}")
        text = prop.get("description") or prop.get("title")
        if text:
            print(f"      {text.strip().splitlines()[0][:160]}")
    for key in override:
        if key not in properties:
            print(f"  {key}: override for a key that is not in the schema: {describe(override[key])}")
    for key in ("jupyter.lab.menus", "jupyter.lab.toolbars", "jupyter.lab.shortcuts"):
        if schema.get(key):
            size = len(json.dumps(schema[key]))
            print(f"\n{key}: present ({size} characters). Use --json to see it.")
    transform = schema.get("jupyter.lab.transform")
    if transform:
        print("\nThis schema merges list values with its defaults (jupyter.lab.transform).")


def cmd_page_config(args: argparse.Namespace) -> None:
    """
    Show the effective page config and the files that feed it.
    """
    files = config_files("page_config")
    effective = effective_page_config()
    if args.json:
        print(json.dumps({"files": [str(f) for f in files], "effective": effective}, indent=2))
        return
    print("Files (lowest priority first):")
    for file in files:
        data = load_json(file)
        note = "  INVALID JSON" if data.get("__invalid__") else ""
        print(f"  {file}{note}")
        for key, value in data.items():
            if key != "__invalid__":
                print(f"      {key}: {describe(value, 300)}")
    if not files:
        print("  (none)")
    print("\nEffective values:")
    for key in sorted(effective):
        if key == "federated_extensions":
            names = [ext["name"] for ext in effective[key]]
            print(f"  federated_extensions: {describe(names, 300)}")
        else:
            print(f"  {key}: {describe(effective[key], 600)}")
    for name, data in get_federated_extensions(labextensions_path()).items():
        declared = data.get("jupyterlab", {}).get("disabledExtensions")
        if declared:
            print(f"\nThe extension {name} disables: {', '.join(declared)}")


def cmd_overrides(args: argparse.Namespace) -> None:
    """
    Show the effective default setting overrides and the files that feed them.
    """
    settings_dir = Path(get_app_dir()) / "settings"
    files = [p for p in sorted(settings_dir.glob("overrides.d/*.json*"))]
    files += [p for p in (settings_dir / "overrides.json", settings_dir / "overrides.json5") if p.is_file()]
    files += config_files("default_setting_overrides")
    effective, error = _get_overrides(str(settings_dir))
    if args.json:
        print(json.dumps({"files": [str(f) for f in files], "effective": effective}, indent=2))
        return
    print("Files (lowest priority first):")
    for file in files:
        data = load_json(file)
        note = "  INVALID JSON" if data.get("__invalid__") else ""
        print(f"  {file}{note}")
    if not files:
        print("  (none)")
    if error:
        print(f"\nerror from JupyterLab: {error}")
    schemas = schema_files()
    print("\nEffective overrides:")
    for plugin_id in sorted(effective):
        known = "" if plugin_id in schemas else "   <-- no schema with this ID"
        print(f"  {plugin_id}{known}")
        properties = load_json(schemas[plugin_id]).get("properties", {}) if plugin_id in schemas else {}
        for key, value in effective[plugin_id].items():
            unknown = "" if (not properties or key in properties) else "   <-- key not in schema"
            print(f"      {key}: {describe(value, 300)}{unknown}")
    if not effective:
        print("  (none)")


def cmd_user_settings(args: argparse.Namespace) -> None:
    """
    List the user settings files. They take priority over all defaults.
    """
    root = Path(get_user_settings_dir())
    rows = []
    for path in sorted(root.rglob("*.jupyterlab-settings")):
        package = path.parent.relative_to(root).as_posix()
        rows.append({"id": f"{package}:{path.stem}", "path": str(path), "value": load_json(path)})
    if args.json:
        print(json.dumps(rows, indent=2))
        return
    print(f"User settings directory: {root}")
    for row in rows:
        print(f"  {row['id']}: {describe(row['value'], 300)}")
    if not rows:
        print("  (no user settings: the defaults apply)")


def menu_data() -> dict[str, dict]:
    """
    The main menus and submenus that the schemas define, with their items.
    """
    menus: dict[str, dict] = {}

    def add(menu: dict, plugin_id: str, parent: str | None) -> None:
        entry = menus.setdefault(
            menu["id"], {"id": menu["id"], "label": "", "rank": None, "parent": parent, "items": []}
        )
        if menu.get("label") and not entry["label"]:
            entry.update(label=menu["label"], rank=menu.get("rank"), defined_in=plugin_id)
        for item in menu.get("items", []):
            if item.get("type") == "submenu" and "submenu" in item:
                name = item["submenu"].get("id")
                if not any(other.get("submenu") == name for other in entry["items"]):
                    entry["items"].append({"submenu": name, "rank": item.get("rank"), "plugin": plugin_id})
                add(item["submenu"], plugin_id, menu["id"])
            elif "command" in item:
                entry["items"].append(
                    {
                        "command": item["command"],
                        "rank": item.get("rank"),
                        "args": item.get("args"),
                        "plugin": plugin_id,
                    }
                )

    for plugin_id, value in schema_parts("jupyter.lab.menus"):
        for menu in value.get("main", []):
            add(menu, plugin_id, None)
    return menus


def cmd_menus(args: argparse.Namespace) -> None:
    """
    List the main menus, or the items of one menu.
    """
    menus = menu_data()
    if not args.menu:
        rows = []

        def add_rows(parent: str | None) -> None:
            children = [menu for menu in menus.values() if menu["parent"] == parent]
            for menu in sorted(children, key=lambda menu: (menu["rank"] is None, menu["rank"] or 0)):
                rows.append(
                    {
                        "menu": menu["id"],
                        "label": menu["label"],
                        "rank": menu["rank"],
                        "submenu_of": menu["parent"],
                        "items": len(menu["items"]),
                    }
                )
                add_rows(menu["id"])

        add_rows(None)
        show(rows, ["menu", "label", "rank", "submenu_of", "items"], args, "Items: menus <menu id>.")
        return
    if args.menu not in menus:
        close = [name for name in menus if args.menu.lower() in name.lower()]
        print(f"error: no menu '{args.menu}'. Menus: {', '.join(close or menus)}", file=sys.stderr)
        sys.exit(1)
    rows = sorted(
        (
            {
                "item": item.get("command") or f"submenu {item['submenu']}",
                "rank": item["rank"],
                "args": json.dumps(item["args"]) if item.get("args") else "",
                "added_by": item["plugin"],
            }
            for item in menus[args.menu]["items"]
        ),
        key=lambda row: (row["rank"] is None, row["rank"] or 0),
    )
    show(
        rows,
        ["item", "rank", "args", "added_by"],
        args,
        "Rank orders the items, lowest first. To remove an item, copy its command and args.",
    )


def cmd_toolbars(args: argparse.Namespace) -> None:
    """
    List the toolbar items that the schemas define.
    """
    rows = []
    for plugin_id, value in schema_parts("jupyter.lab.toolbars"):
        for toolbar, items in value.items():
            for item in items:
                row = {
                    "toolbar": toolbar,
                    "item": item.get("name"),
                    "command": item.get("command", ""),
                    "rank": item.get("rank"),
                    "setting_of": plugin_id,
                }
                if keep(row, args.text):
                    rows.append(row)
    show(
        rows,
        ["toolbar", "item", "command", "rank", "setting_of"],
        args,
        "Change a toolbar with the 'toolbar' setting of the plugin in the last column.",
    )


def cmd_context_menu(args: argparse.Namespace) -> None:
    """
    List the context menu items that the schemas define.
    """
    rows = []
    for plugin_id, value in schema_parts("jupyter.lab.menus"):
        for item in value.get("context", []):
            target = item.get("command") or item.get("type", "")
            if item.get("type") == "submenu":
                target = f"submenu {item.get('submenu', {}).get('id', '')}"
            row = {
                "item": target,
                "selector": item.get("selector", ""),
                "rank": item.get("rank"),
                "args": json.dumps(item["args"]) if item.get("args") else "",
                "added_by": plugin_id,
            }
            if keep(row, args.text):
                rows.append(row)
    show(
        rows,
        ["item", "selector", "rank", "args", "added_by"],
        args,
        "Change them with the 'contextMenu' setting of @jupyterlab/application-extension:context-menu.",
    )


def cmd_shortcuts(args: argparse.Namespace) -> None:
    """
    List the default keyboard shortcuts that the schemas define.
    """
    rows = []
    for plugin_id, value in schema_parts("jupyter.lab.shortcuts"):
        for item in value:
            row = {
                "command": item.get("command"),
                "keys": ", ".join(item.get("keys", [])),
                "selector": item.get("selector", ""),
                "args": json.dumps(item["args"]) if item.get("args") else "",
                "added_by": plugin_id,
            }
            if args.json:
                row["keys"] = item.get("keys", [])
            if keep(row, args.text):
                rows.append(row)
    rows.sort(key=lambda row: (row["command"], str(row["keys"])))
    show(
        rows,
        ["command", "keys", "selector", "args"],
        args,
        "Accel is Cmd on macOS and Ctrl on other systems. "
        "A shortcut is identified by its keys and selector: copy both exactly.",
    )


def theme_variables(theme: str) -> dict[str, str]:
    """
    The CSS variables that an installed theme defines.
    """
    roots = [Path(get_app_dir()) / "themes"]
    roots += [Path(data["ext_path"]) / "themes" for data in get_federated_extensions(labextensions_path()).values()]
    for root in roots:
        for path in root.glob("**/index.css"):
            if theme in path.parent.relative_to(root).as_posix():
                text = path.read_text(encoding="utf-8", errors="ignore")
                return dict(re.findall(r"(--jp-[\w-]+)\s*:\s*([^;}]+)", text))
    print(f"error: no installed theme matches '{theme}'.", file=sys.stderr)
    sys.exit(1)


def cmd_css_variables(args: argparse.Namespace) -> None:
    """
    List the CSS variables of the built-in themes, with their values.
    """
    themes = args.theme or ["theme-light-extension", "theme-dark-extension"]
    values = {theme: theme_variables(theme) for theme in themes}
    names = list(dict.fromkeys(name for theme in themes for name in values[theme]))
    labels = {theme: theme.replace("theme-", "").replace("-extension", "") for theme in themes}
    rows = []
    for name in names:
        row = {"variable": name, **{labels[theme]: values[theme].get(name, "").strip() for theme in themes}}
        if not args.text or args.text.lower() in name.lower():
            rows.append(row)
    show(
        rows,
        ["variable"] + list(labels.values()),
        args,
        "A value such as var(--md-grey-300,#e0e0e0) falls back to the color after the comma.",
    )


def cmd_shared(args: argparse.Namespace) -> None:
    """
    List the packages that the application shares with extensions.
    """
    import jupyterlab

    staging = Path(jupyterlab.__file__).parent / "staging" / "package.json"
    resolutions = load_json(staging).get("resolutions", {})
    rows = [
        {"package": name, "version": version.lstrip("~^")}
        for name, version in sorted(resolutions.items())
        if not args.text or args.text.lower() in name.lower()
    ]
    show(
        rows,
        ["package", "version"],
        args,
        "A no-build extension takes these from the application; a remix pins them.",
    )


def cmd_find(args: argparse.Namespace) -> None:
    """
    Search plugin IDs, setting keys, menu IDs and command IDs for a text.
    """
    needle = args.text.lower()
    # "line numbers" must also match the key lineNumbers.
    compact = needle.replace(" ", "").replace("-", "")
    schemas = schema_files()
    bundles = bundle_plugins()
    hits: list[str] = []
    for plugin_id in sorted(set(schemas) | set(bundles)):
        description = bundles.get(plugin_id, {}).get("description", "")
        if needle in plugin_id.lower():
            hits.append(f"plugin   {plugin_id}")
        elif needle in description.lower():
            hits.append(f"plugin   {plugin_id}  - {description}")
    commands: set[str] = set()
    for plugin_id, path in sorted(schemas.items()):
        schema = load_json(path)
        title = schema.get("title", "")
        if needle in title.lower() and needle not in plugin_id.lower():
            hits.append(f"plugin   {plugin_id}  - {title}")
        for key, prop in schema.get("properties", {}).items():
            text = f"{key} {prop.get('title', '')} {prop.get('description', '')}".lower()
            if needle in text or compact in text:
                hits.append(f"setting  {plugin_id} -> {key}  (default {describe(prop.get('default'), 60)})")
            default = prop.get("default")
            if isinstance(default, dict):
                for inner, value in default.items():
                    if needle in inner.lower() or compact in inner.lower():
                        hits.append(
                            f"setting  {plugin_id} -> {key}.{inner}  (default {describe(value, 60)})"
                        )
        menus = schema.get("jupyter.lab.menus", {})
        for menu in menus.get("main", []):
            if needle in f"{menu.get('id', '')} {menu.get('label', '')}".lower():
                hits.append(f"menu     {menu.get('id')}  - {menu.get('label', '')}")
        for match in re.finditer(r'"command":\s*"([^"]+)"', json.dumps(schema)):
            commands.add(match.group(1))
        for area, items in schema.get("jupyter.lab.toolbars", {}).items():
            for item in items:
                if needle in f"{area} {item.get('name', '')}".lower():
                    hits.append(f"toolbar  {plugin_id} -> {area} -> {item.get('name')}")
    for command in sorted(commands):
        if needle in command.lower():
            hits.append(f"command  {command}")
    print("\n".join(dict.fromkeys(hits)) or "No match.")


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument(
        "--project",
        metavar="DIR",
        help="also read a distribution project that is not installed: "
        "DIR/jupyter-config and DIR/labextensions",
    )
    sub = parser.add_subparsers(dest="action", required=True)
    sub.add_parser("paths", help="folders, and where to write").set_defaults(func=cmd_paths)
    sub.add_parser("extensions", help="prebuilt extensions").set_defaults(func=cmd_extensions)
    p_plugins = sub.add_parser("plugins", help="plugin IDs, with a description")
    p_plugins.add_argument("pattern", nargs="?", help="text that the ID or the description must contain")
    p_plugins.set_defaults(func=cmd_plugins)
    p_schema = sub.add_parser("schema", help="settings of one plugin")
    p_schema.add_argument("plugin", help="plugin ID, for example @jupyterlab/notebook-extension:tracker")
    p_schema.set_defaults(func=cmd_schema)
    sub.add_parser("page-config", help="effective page config").set_defaults(func=cmd_page_config)
    sub.add_parser("overrides", help="effective default overrides").set_defaults(func=cmd_overrides)
    sub.add_parser("user-settings", help="user settings files").set_defaults(func=cmd_user_settings)
    p_menus = sub.add_parser("menus", help="main menus, or the items of one menu")
    p_menus.add_argument("menu", nargs="?", help="menu ID, for example jp-mainmenu-file")
    p_menus.set_defaults(func=cmd_menus)
    for name, func, text in (
        ("toolbars", cmd_toolbars, "toolbar items"),
        ("context-menu", cmd_context_menu, "context menu items"),
        ("shortcuts", cmd_shortcuts, "default keyboard shortcuts"),
    ):
        p_list = sub.add_parser(name, help=text)
        p_list.add_argument("text", nargs="?", help="text that the row must contain")
        p_list.set_defaults(func=func)
    p_shared = sub.add_parser("shared", help="packages that extensions take from the application")
    p_shared.add_argument("text", nargs="?", help="text that the package name must contain")
    p_shared.set_defaults(func=cmd_shared)
    p_css = sub.add_parser("css-variables", help="CSS variables of the themes, with values")
    p_css.add_argument("text", nargs="?", help="text that the variable name must contain")
    p_css.add_argument(
        "--theme",
        action="append",
        help="part of the folder name of an installed theme; repeat to compare "
        "(default: the built-in light and dark themes)",
    )
    p_css.set_defaults(func=cmd_css_variables)
    p_find = sub.add_parser("find", help="search IDs, settings, menus, commands")
    p_find.add_argument("text")
    p_find.set_defaults(func=cmd_find)
    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
