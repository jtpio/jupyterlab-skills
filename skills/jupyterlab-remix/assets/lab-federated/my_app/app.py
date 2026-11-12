"""
The server application of My App.
"""

from importlib.metadata import version
from pathlib import Path

from jupyter_core.paths import jupyter_config_dir
from jupyterlab_server import LabServerApp
from traitlets import Bool, default

__version__ = version("my-app")

HERE = Path(__file__).parent


class MyApp(LabServerApp):
    """
    Serve the frontend in `static/` and its settings, themes and workspaces.
    """

    name = "my-app"
    version = __version__
    app_name = "My App"
    app_version = __version__
    app_url = "/my-app"
    extension_url = "/my-app"
    default_url = "/my-app"
    file_url_prefix = "/my-app/tree"

    static_dir = str(HERE / "static")
    templates_dir = str(HERE / "templates")
    schemas_dir = str(HERE / "schemas")
    themes_dir = str(HERE / "themes")
    # Without a value, the server reads overrides.json from the current folder.
    app_settings_dir = str(HERE / "settings")

    # Prebuilt extensions can have a server extension: the server loads all
    # the server extensions of the environment, but not the terminal API.
    serverapp_config = {"terminals_enabled": False}

    expose_app_in_browser = Bool(
        False,
        config=True,
        help="Expose the application object as window.jupyterapp.",
    )

    @default("user_settings_dir")
    def _default_user_settings_dir(self):
        return str(Path(jupyter_config_dir(), self.name, "user-settings"))

    @default("workspaces_dir")
    def _default_workspaces_dir(self):
        return str(Path(jupyter_config_dir(), self.name, "workspaces"))

    def initialize_settings(self):
        """
        Add the options of the application to the page config.
        """
        super().initialize_settings()
        page_config = self.serverapp.web_app.settings.setdefault("page_config_data", {})
        page_config["exposeAppInBrowser"] = self.expose_app_in_browser


main = MyApp.launch_instance
