#!/usr/bin/env python3
"""
Check the JSON blocks of a Markdown file against a JupyterLab installation.

    <env>/bin/python tools/check_recipes.py skills/jupyterlab-settings/references/recipes.md

Each block is taken as page config (when it has a page config key) or as
default setting overrides. Plugin IDs, setting keys and value types must
match the installation.
"""

from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE_KEYS = {
    "disabledExtensions",
    "lockedExtensions",
    "deferredExtensions",
    "appName",
    "quitButton",
    "terminalsAvailable",
    "notebookStartsKernel",
    "collaborative",
}


def load_config_script():
    """
    Import jlab_config.py as a module, to reuse its checks.
    """
    path = ROOT / "skills" / "jupyterlab-settings" / "scripts" / "jlab_config.py"
    spec = importlib.util.spec_from_file_location("jlab_config", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    """
    Validate each JSON block and print the problems.
    """
    config = load_config_script()
    plugins = config.known_plugins()
    packages = {plugin.split(":", 1)[0] for plugin in plugins}
    schemas = config.schema_files()
    problems = 0
    for file in sys.argv[1:]:
        text = Path(file).read_text()
        blocks = re.findall(r"```json\n(.*?)```", text, re.DOTALL)
        for index, block in enumerate(blocks, 1):
            try:
                data = json.loads(block)
            except json.JSONDecodeError as error:
                print(f"{file} block {index}: invalid JSON: {error}")
                problems += 1
                continue
            if not isinstance(data, dict):
                continue
            if set(data) & PAGE_KEYS:
                for key in ("disabledExtensions", "lockedExtensions"):
                    for target in data.get(key, {}):
                        if target not in plugins and target not in packages:
                            print(f"{file} block {index}: unknown plugin {target}")
                            problems += 1
                continue
            if not all(":" in key for key in data):
                continue
            for plugin, values in data.items():
                if plugin not in schemas:
                    print(f"{file} block {index}: no schema for {plugin}")
                    problems += 1
                    continue
                for key, value in values.items():
                    try:
                        config.check_setting(plugin, key, value)
                    except SystemExit:
                        print(f"{file} block {index}: bad setting {plugin} -> {key}")
                        problems += 1
        print(f"{file}: {len(blocks)} JSON block(s) checked")
    print("OK" if not problems else f"{problems} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
