#!/usr/bin/env python3
"""
Regenerate the reference catalogs of the skills from a stock JupyterLab.

    1. Start a stock JupyterLab with skills/jupyterlab-verify/scripts/jlab_server.py
    2. Save a dump: node jlab_probe.cjs --url <url> --dump stock.json
    3. <env>/bin/python tools/generate_references.py stock.json
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

from jupyterlab.commands import get_app_dir

ROOT = Path(__file__).resolve().parent.parent / "skills"


def cell(text: object) -> str:
    """
    Make a value safe for a Markdown table cell.
    """
    return str(text or "").replace("|", "\\|").replace("\n", " ").strip()


def dependents(plugins: list[dict]) -> dict[str, list[str]]:
    """
    Map each plugin to the plugins that fail to activate without it.
    """
    result: dict[str, list[str]] = {}
    for root in plugins:
        broken: list[str] = []
        queue = [root]
        while queue:
            current = queue.pop(0)
            if not current["provides"]:
                continue
            for plugin in plugins:
                if (
                    current["provides"] in plugin["requires"]
                    and plugin["id"] not in broken
                    and plugin is not root
                ):
                    broken.append(plugin["id"])
                    queue.append(plugin)
        result[root["id"]] = broken
    return result


def plugins_page(dump: dict, version: str) -> str:
    """
    Catalog of the core plugins, by package.
    """
    plugins = dump["plugins"]
    with_settings = {item["id"] for item in dump["settings"]}
    broken = dependents(plugins)
    groups: dict[str, list[dict]] = defaultdict(list)
    for plugin in plugins:
        groups[plugin["id"].split(":", 1)[0]].append(plugin)
    lines = [
        "# Core plugins",
        "",
        f"All {len(plugins)} plugins of a stock JupyterLab {version}, from the live application.",
        "Other versions and installations differ: get the exact list with the browser probe",
        "of the `jupyterlab-verify` skill, or with `jlab_inspect.py plugins`.",
        "",
        "- **S**: the plugin has a settings schema (`jlab_inspect.py schema <id>`).",
        "- **Provides**: the service token of the plugin. A replacement plugin must provide it.",
        "- **Breaks**: plugins that fail to activate when this plugin is disabled, because",
        "  they require its token (directly or through another plugin). Disable them too,",
        "  or use a setting to hide the feature.",
        "",
        "A package name alone (the heading) disables all the plugins of the package.",
        "",
    ]
    for package in sorted(groups):
        lines += [f"## {package}", "", "| Plugin | S | Description | Provides | Breaks |", "| --- | --- | --- | --- | --- |"]
        for plugin in sorted(groups[package], key=lambda item: item["id"]):
            name = plugin["id"].split(":", 1)[1] if ":" in plugin["id"] else plugin["id"]
            provides = (plugin["provides"] or "").split(":")[-1]
            items = broken[plugin["id"]]
            if len(items) > 6:
                breaks = f"**{len(items)} plugins** (core service)"
            else:
                breaks = ", ".join(f"`{item}`" for item in items)
            lines.append(
                f"| `:{name}` | {'S' if plugin['id'] in with_settings else ''} "
                f"| {cell(plugin['description'])} | {cell(provides)} | {breaks} |"
            )
        lines.append("")
    return "\n".join(lines)


def commands_page(dump: dict, version: str) -> str:
    """
    Catalog of the commands, by prefix.
    """
    groups: dict[str, list[dict]] = defaultdict(list)
    for command in dump["commands"]:
        groups[command["id"].split(":", 1)[0]].append(command)
    lines = [
        "# Core commands",
        "",
        f"All {len(dump['commands'])} commands of a stock JupyterLab {version}, from the live",
        "application. Use a command ID in menus, toolbars, context menus, shortcuts and the",
        "launcher. Extensions add more commands: get the exact list with the browser probe",
        "of the `jupyterlab-verify` skill (`--dump`).",
        "",
        "A command of a disabled plugin does not exist: an item that uses it is not shown.",
        "",
    ]
    for prefix in sorted(groups):
        lines += [f"## {prefix}", "", "| Command | Label |", "| --- | --- |"]
        for command in sorted(groups[prefix], key=lambda item: item["id"]):
            lines.append(f"| `{command['id']}` | {cell(command['label'] or command['caption'])} |")
        lines.append("")
    return "\n".join(lines)


def ui_page(dump: dict, version: str) -> str:
    """
    IDs of the shell widgets, menus and toolbar items.
    """
    schemas = Path(get_app_dir()) / "schemas"
    lines = [
        "# UI identifiers",
        "",
        f"From a stock JupyterLab {version}. Extensions add more: use the browser probe of the",
        "`jupyterlab-verify` skill to list the widgets of a running application.",
        "",
        "## Shell areas and widget IDs",
        "",
        "Use a widget ID as a key of the `layout` setting of",
        "`@jupyterlab/application-extension:shell` to move a widget to another area.",
        "",
        "| Area | Widget ID | Label |",
        "| --- | --- | --- |",
    ]
    for area, widgets in dump["shell"].items():
        for widget in widgets:
            lines.append(f"| {area} | `{widget['id']}` | {cell(widget['label'] or widget['caption'])} |")
    lines += ["", "## Main menus", "", "| Menu ID | Label | Rank | Defined in |", "| --- | --- | --- | --- |"]
    toolbars: list[str] = []
    context: list[str] = []
    menu_items: list[str] = []
    seen: set[str] = set()

    def collect_items(menu_id: str, items: list) -> None:
        for item in items:
            if item.get("type") == "submenu" and "submenu" in item:
                collect_items(item["submenu"].get("id", menu_id), item["submenu"].get("items", []))
            elif "command" in item:
                args = f"`{cell(json.dumps(item['args']))}`" if item.get("args") else ""
                menu_items.append(
                    f"| `{menu_id}` | `{item['command']}` | {item.get('rank', '')} | {args} |"
                )
    for path in sorted(schemas.rglob("*.json")):
        plugin = f"{path.parent.relative_to(schemas).as_posix()}:{path.stem}"
        schema = json.loads(path.read_text())
        for menu in schema.get("jupyter.lab.menus", {}).get("main", []):
            collect_items(menu["id"], menu.get("items", []))
            if "label" in menu and menu["id"] not in seen:
                seen.add(menu["id"])
                lines.append(
                    f"| `{menu['id']}` | {cell(menu['label'])} | {menu.get('rank', '')} | `{plugin}` |"
                )
            for item in menu.get("items", []):
                if item.get("type") == "submenu" and "submenu" in item:
                    sub = item["submenu"]
                    if sub["id"] in seen or not sub.get("label"):
                        continue
                    seen.add(sub["id"])
                    lines.append(
                        f"| `{sub['id']}` | {cell(sub.get('label', ''))} (submenu of `{menu['id']}`) | | `{plugin}` |"
                    )
        for item in schema.get("jupyter.lab.menus", {}).get("context", []):
            target = item.get("command") or item.get("type", "")
            if item.get("type") == "submenu":
                target = f"submenu `{item.get('submenu', {}).get('id', '')}`"
            else:
                target = f"`{target}`"
            context.append(f"| {target} | `{cell(item.get('selector', ''))}` | {item.get('rank', '')} |")
        for factory, items in schema.get("jupyter.lab.toolbars", {}).items():
            for item in items:
                toolbars.append(
                    f"| {factory} | `{item['name']}` | {cell(item.get('command', ''))} "
                    f"| {item.get('rank', '')} | `{plugin}` |"
                )
    lines += [
        "",
        "## Main menu items",
        "",
        "Rank orders the items of a menu, lowest first. Use it to place a new item,",
        "and copy `command` and `args` to disable an item.",
        "",
        "| Menu | Command | Rank | Args |",
        "| --- | --- | --- | --- |",
        *sorted(menu_items),
    ]
    lines += [
        "",
        "## Toolbar items",
        "",
        "Change a toolbar with the `toolbar` setting of the plugin in the last column.",
        "Items without a command are special widgets (kernel name, cell type, spacer).",
        "",
        "| Toolbar | Item name | Command | Rank | Setting of |",
        "| --- | --- | --- | --- | --- |",
        *toolbars,
        "",
        "## Context menu items",
        "",
        "Change them with the `contextMenu` setting of",
        "`@jupyterlab/application-extension:context-menu`. An item is identified by its",
        "command, selector and args.",
        "",
        "| Command | Selector | Rank |",
        "| --- | --- | --- |",
        *context,
        "",
    ]
    return "\n".join(lines)


def shortcuts_page(dump: dict, version: str) -> str:
    """
    Default keyboard shortcuts, as the schemas define them.
    """
    schemas = Path(get_app_dir()) / "schemas"
    rows = []
    for path in sorted(schemas.rglob("*.json")):
        for item in json.loads(path.read_text()).get("jupyter.lab.shortcuts", []):
            rows.append(item)
    lines = [
        "# Default keyboard shortcuts",
        "",
        f"From the schemas of a stock JupyterLab {version}. `Accel` is Cmd on macOS and",
        "Ctrl on other systems. Copy `keys` and `selector` exactly as shown when you",
        "disable a default: JupyterLab identifies a shortcut by its keys and selector.",
        "",
        "Shortcuts with `Cmd` exist on macOS only.",
        "",
        "| Command | Keys | Selector | Args |",
        "| --- | --- | --- | --- |",
    ]
    for item in sorted(rows, key=lambda entry: (entry["command"], entry["keys"])):
        keys = ", ".join(f"`{key}`" for key in item["keys"])
        args = f"`{cell(json.dumps(item['args']))}`" if item.get("args") else ""
        lines.append(f"| `{item['command']}` | {keys} | `{cell(item['selector'])}` | {args} |")
    lines.append("")
    return "\n".join(lines)


GROUPS = [
    ("Layout and surfaces", ("--jp-layout-", "--jp-inverse-layout-", "--jp-border-", "--jp-inverse-border-", "--jp-scrollbar-", "--jp-shadow-", "--jp-elevation-")),
    ("Brand, accent and state colors", ("--jp-brand-", "--jp-accent-", "--jp-warn-", "--jp-error-", "--jp-success-", "--jp-info-", "--jp-accept-", "--jp-reject-", "--jp-focus-")),
    ("Interface text", ("--jp-ui-", "--jp-ui-inverse-")),
    ("Content text (notebook Markdown, rendered output)", ("--jp-content-",)),
    ("Code text", ("--jp-code-",)),
    ("Notebook and cells", ("--jp-cell-", "--jp-notebook-", "--jp-rendermime-", "--jp-input-", "--jp-collaborator-")),
    ("Editor syntax colors", ("--jp-mirror-", "--jp-editor-")),
    ("Toolbars, sidebars, dialogs, other widgets", ("--jp-toolbar-", "--jp-statusbar-", "--jp-sidebar-", "--jp-private-", "--jp-dialog-", "--jp-search-", "--jp-console-", "--jp-vega-", "--jp-switch-", "--jp-shortcuts-", "--jp-toggle-", "--jp-completer-")),
    ("Icons", ("--jp-icon-", "--jp-jupyter-icon-", "--jp-notebook-icon-", "--jp-json-icon-", "--jp-console-icon-", "--jp-terminal-icon-", "--jp-text-editor-icon-", "--jp-inspector-icon-")),
]


def theme_variables(name: str) -> dict[str, str]:
    """
    Read the variables of a built-in theme.
    """
    import re

    path = Path(get_app_dir()) / "themes" / "@jupyterlab" / name / "index.css"
    text = path.read_text()
    return dict(re.findall(r"(--jp-[\w-]+)\s*:\s*([^;}]+)", text))


def variables_page(version: str) -> str:
    """
    Catalog of the CSS variables of the built-in themes.
    """
    light = theme_variables("theme-light-extension")
    dark = theme_variables("theme-dark-extension")
    names = list(dict.fromkeys(list(light) + list(dark)))
    lines = [
        "# Theme variables",
        "",
        f"All CSS variables that the built-in themes of JupyterLab {version} define, with",
        "the light and dark values. A theme must define all of them: `new_theme.py`",
        "copies them into `base.css`, and you override some in `index.css`.",
        "",
        "Many values refer to other variables or to the Material palette",
        "(`var(--md-grey-300,#e0e0e0)`: the fallback after the comma is the real",
        "color). Change the variables at the start of a chain and the rest follows.",
        "",
    ]
    used: set[str] = set()
    for title, prefixes in GROUPS:
        rows = [n for n in names if n.startswith(prefixes) and n not in used]
        if not rows:
            continue
        used.update(rows)
        lines += [f"## {title}", "", "| Variable | Light | Dark |", "| --- | --- | --- |"]
        for name in rows:
            lines.append(f"| `{name}` | `{cell(light.get(name, ''))}` | `{cell(dark.get(name, ''))}` |")
        lines.append("")
    rest = [n for n in names if n not in used]
    if rest:
        lines += ["## Other", "", "| Variable | Light | Dark |", "| --- | --- | --- |"]
        for name in rest:
            lines.append(f"| `{name}` | `{cell(light.get(name, ''))}` | `{cell(dark.get(name, ''))}` |")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    """
    Write the catalogs from a probe dump.
    """
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    dump = json.loads(Path(sys.argv[1]).read_text())
    version = dump["appVersion"]
    outputs = {
        ROOT / "jupyterlab-inspect" / "references" / "core-plugins.md": plugins_page(dump, version),
        ROOT / "jupyterlab-inspect" / "references" / "core-commands.md": commands_page(dump, version),
        ROOT / "jupyterlab-settings" / "references" / "ui-identifiers.md": ui_page(dump, version),
        ROOT / "jupyterlab-settings" / "references" / "default-shortcuts.md": shortcuts_page(dump, version),
        ROOT / "jupyterlab-theming" / "references" / "css-variables.md": variables_page(version),
    }
    # Dependency data for jlab_config.py: it adds the dependents of a disabled plugin.
    graph = {
        "jupyterlab": version,
        "plugins": {
            plugin["id"]: {"provides": plugin["provides"], "requires": plugin["requires"]}
            for plugin in sorted(dump["plugins"], key=lambda item: item["id"])
            if plugin["id"].startswith("@jupyterlab/")
        },
    }
    # jlab_config.py adds the dependents of a disabled plugin; jlab_remix.py
    # plans the plugins of a remix. Each skill keeps its own copy.
    for skill in ("jupyterlab-settings", "jupyterlab-remix"):
        outputs[ROOT / skill / "scripts" / "core_plugins.json"] = json.dumps(graph, indent=1) + "\n"
    for path, text in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        print(f"Wrote {path} ({len(text) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
