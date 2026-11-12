"""
Serve one page that shows one notebook with JupyterLab components.

Run `python main.py` in the folder of the notebooks. The page is at
`/my-app/<path of a notebook>`; `/my-app` shows `test.ipynb`.
"""

from pathlib import Path

from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin
from jupyter_server.extension.handler import ExtensionHandlerJinjaMixin, ExtensionHandlerMixin
from tornado import web
from traitlets import Unicode

HERE = Path(__file__).parent


def _jupyter_server_extension_points():
    """
    Tell Jupyter Server where the application is.
    """
    return [{"module": __name__, "app": MyApp}]


class PageHandler(ExtensionHandlerJinjaMixin, ExtensionHandlerMixin, JupyterHandler):
    """
    Render the page for the notebook that the URL names.
    """

    @web.authenticated
    def get(self, path):
        """
        Write the page with its configuration data.
        """
        page_config = {
            "appName": "My App",
            "baseUrl": self.base_url,
            "wsUrl": self.ws_url,
            "notebookPath": path or self.extensionapp.default_notebook,
        }
        self.write(self.render_template("index.html", page_config=page_config))


class MyApp(ExtensionAppJinjaMixin, ExtensionApp):
    """
    A Jupyter Server with the page and its static files.
    """

    name = "my-app"
    extension_url = "/my-app"
    file_url_prefix = "/my-app"
    load_other_extensions = False
    static_paths = [str(HERE / "build")]
    template_paths = [str(HERE / "templates")]

    default_notebook = Unicode(
        "test.ipynb",
        config=True,
        help="The notebook that shows when the URL has no path.",
    )

    def initialize_handlers(self):
        """
        Serve the page with and without the path of a notebook.
        """
        self.handlers.append(("/my-app(?:/(.*))?", PageHandler))


if __name__ == "__main__":
    MyApp.launch_instance()
