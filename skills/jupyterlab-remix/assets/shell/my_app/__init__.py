"""
My App: a single-document notebook application made of JupyterLab components.
"""

from .app import MyApp

__version__ = MyApp.version


def _jupyter_server_extension_points():
    """
    Tell Jupyter Server where the application is.
    """
    return [{"module": "my_app", "app": MyApp}]
