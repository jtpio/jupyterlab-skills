#!/usr/bin/env python3
"""
Write the plugin dependency data of the skills from a stock JupyterLab.

    1. Start a stock JupyterLab with skills/jupyterlab-verify/scripts/jlab_server.py
    2. Save a dump: node jlab_probe.cjs --dump stock.json
    3. python tools/update_plugin_data.py stock.json

The data is the one thing that the scripts cannot read from the files of an
installation: the service that each core plugin provides and requires.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "skills"
# jlab_config.py adds the dependents of a disabled plugin; jlab_remix.py plans
# the plugins of a remix. Each skill keeps its own copy.
SKILLS = ("jupyterlab-settings", "jupyterlab-remix")


def main() -> int:
    """
    Write core_plugins.json from a probe dump.
    """
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    dump = json.loads(Path(sys.argv[1]).read_text())
    graph = {
        "jupyterlab": dump["appVersion"],
        "plugins": {
            plugin["id"]: {"provides": plugin["provides"], "requires": plugin["requires"]}
            for plugin in sorted(dump["plugins"], key=lambda item: item["id"])
            if plugin["id"].startswith("@jupyterlab/")
        },
    }
    text = json.dumps(graph, indent=1) + "\n"
    for skill in SKILLS:
        path = ROOT / skill / "scripts" / "core_plugins.json"
        path.write_text(text)
        print(f"Wrote {path} ({len(graph['plugins'])} plugins of JupyterLab {graph['jupyterlab']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
