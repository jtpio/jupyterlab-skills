"""
My App: a JupyterLab remix.
"""

from .app import MyApp, __version__

__all__ = ["MyApp", "__version__"]


def _jupyter_server_extension_points():
    """
    Tell Jupyter Server where to find the application.
    """
    return [{"module": "my_app", "app": MyApp}]
