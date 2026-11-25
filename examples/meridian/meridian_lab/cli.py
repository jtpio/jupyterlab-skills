"""
The `meridian` command: JupyterLab with the defaults of Meridian.
"""

from __future__ import annotations

import os
import sys

# Arguments added before those of the user, who can thus override them.
DEFAULT_ARGS: list[str] = []


def state_dir() -> str:
    """
    Folder for the user settings and workspaces of Meridian.
    """
    from jupyter_core.paths import jupyter_config_dir

    return os.path.join(jupyter_config_dir(), "meridian-lab")


def main() -> None:
    """
    Start JupyterLab with a separate user state.
    """
    # Settings saved in a plain JupyterLab must not hide the defaults of
    # Meridian. JupyterLab reads these variables at import time.
    root = state_dir()
    os.environ.setdefault("JUPYTERLAB_SETTINGS_DIR", os.path.join(root, "user-settings"))
    os.environ.setdefault("JUPYTERLAB_WORKSPACES_DIR", os.path.join(root, "workspaces"))
    sys.argv[1:1] = DEFAULT_ARGS

    from jupyterlab.labapp import main as lab_main

    sys.exit(lab_main())


if __name__ == "__main__":
    main()
