"""
Lectern: a two-pane lesson reader made of JupyterLab components.
"""

from .app import Lectern

__version__ = Lectern.version


def _jupyter_server_extension_points():
    """
    Tell Jupyter Server where the application is.
    """
    return [{"module": "lectern", "app": Lectern}]
