"""
The server side of Lectern: one page and the JupyterLab server endpoints.
"""

from importlib import metadata
from pathlib import Path

from jupyter_core.paths import jupyter_config_dir
from jupyterlab_server import LabServerApp
from jupyterlab_server.handlers import LabHandler
from traitlets import Bool, default

HERE = Path(__file__).parent


class Lectern(LabServerApp):
    """
    Serve the page at `/lectern` (the start page) and at
    `/lectern/lessons/<NN-slug>` (a lesson).
    """

    name = "lectern"
    app_name = "Lectern"
    version = metadata.version("lectern")
    app_version = version
    description = "A two-pane lesson reader: Markdown text next to its notebook"

    # The page, and the prefix of the settings, themes and translations endpoints.
    app_url = "/lectern"
    extension_url = "/lectern"
    default_url = "/lectern"
    file_url_prefix = "/lectern/lessons"

    # The application is self-contained: other server extensions (JupyterLab)
    # write to the same page config, and prebuilt extensions cannot load.
    load_other_extensions = False
    labextensions_path = []

    static_dir = str(HERE / "static")
    templates_dir = str(HERE / "templates")
    schemas_dir = str(HERE / "schemas")
    themes_dir = str(HERE / "themes")
    # Without a value, the server reads overrides.json from the current folder.
    app_settings_dir = str(HERE / "settings")

    expose_app_in_browser = Bool(
        False,
        config=True,
        help="Expose the application object as window.jupyterapp, for tests.",
    )

    @default("user_settings_dir")
    def _default_user_settings_dir(self):
        return str(Path(jupyter_config_dir()) / "lectern" / "user-settings")

    @default("workspaces_dir")
    def _default_workspaces_dir(self):
        return str(Path(jupyter_config_dir()) / "lectern" / "workspaces")

    def initialize_handlers(self):
        """
        Add the lesson page before the handlers of jupyterlab_server,
        which end with a catch-all for `/lectern/.*`.
        """
        page_config = self.serverapp.web_app.settings.setdefault("page_config_data", {})
        page_config["exposeAppInBrowser"] = self.expose_app_in_browser
        self.handlers.append((f"{self.app_url}/lessons/.*", LabHandler))
        super().initialize_handlers()


main = Lectern.launch_instance
