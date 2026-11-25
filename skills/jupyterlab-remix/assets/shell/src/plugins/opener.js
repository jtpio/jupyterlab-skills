import { IRouter, JupyterFrontEnd } from '@jupyterlab/application';
import { PageConfig, PathExt, URLExt } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Widget } from '@lumino/widgets';

const ROUTE = 'my-app:route';
const NEW_NOTEBOOK = 'my-app:new-notebook';

/**
 * The start page: the notebooks of the root folder and a button for a new one.
 */
class StartPage extends Widget {
  constructor(options) {
    super();
    this.id = 'my-app-start';
    this.addClass('my-app-Start');
    this.title.label = 'Notebooks';
    this._options = options;
  }

  /**
   * Read the root folder again and render the list.
   */
  async refresh() {
    const { contents, url, navigate, create } = this._options;
    const folder = await contents.get('', { content: true });
    const heading = document.createElement('h1');
    heading.textContent = this.title.label;
    const button = document.createElement('button');
    button.className = 'jp-mod-styled jp-mod-accept';
    button.textContent = 'New notebook';
    button.onclick = create;
    const list = document.createElement('ul');
    for (const item of folder.content) {
      if (item.type !== 'notebook') {
        continue;
      }
      const link = document.createElement('a');
      link.textContent = item.name;
      link.href = url(item.path);
      link.onclick = event => {
        event.preventDefault();
        navigate(link.pathname);
      };
      list.appendChild(document.createElement('li')).appendChild(link);
    }
    this.node.replaceChildren(heading, button, list);
  }
}

/**
 * Open the notebook that the URL names (`<app>/notebooks/<path>`), or show
 * the start page. Keep the URL and the page title in step with the document.
 */
export default {
  id: 'my-app:opener',
  description: 'Opens the notebook of the URL, or shows the start page.',
  autoStart: true,
  requires: [IRouter, IDocumentManager, JupyterFrontEnd.IPaths],
  activate: (app, router, docManager, paths) => {
    const { commands, serviceManager, shell } = app;
    const prefix = `${paths.urls.app}/notebooks/`;
    const start = new StartPage({
      contents: serviceManager.contents,
      url: path =>
        URLExt.join(PageConfig.getBaseUrl(), prefix, URLExt.encodeParts(path)),
      navigate: path => router.navigate(path),
      create: () => commands.execute(NEW_NOTEBOOK)
    });

    commands.addCommand(ROUTE, {
      label: 'Open the Document of the URL',
      execute: async args => {
        const { path } = args;
        if (path.startsWith(prefix)) {
          docManager.openOrReveal(
            decodeURIComponent(path.slice(prefix.length))
          );
          return;
        }
        if (!start.isAttached) {
          shell.add(start, 'main');
        }
        shell.activateById(start.id);
        await start.refresh();
      }
    });
    router.register({ command: ROUTE, pattern: /.*/ });

    commands.addCommand(NEW_NOTEBOOK, {
      label: 'New Notebook',
      execute: async () => {
        // A kernel name prevents the kernel selection dialog.
        await serviceManager.kernelspecs.ready;
        const kernelName = serviceManager.kernelspecs.specs?.default ?? '';
        return commands.execute('notebook:create-new', { kernelName });
      }
    });

    const sync = () => {
      const widget = shell.currentWidget;
      const context = widget && docManager.contextForWidget(widget);
      context?.pathChanged.connect(sync);
      const target = context
        ? prefix + URLExt.encodeParts(context.path)
        : paths.urls.app;
      if (router.current.path !== target) {
        // Without a document, the route command shows the start page.
        router.navigate(target, { skipRouting: !!widget });
      }
      const name = context
        ? PathExt.basename(context.path)
        : widget?.title.label;
      document.title = name ? `${name} - ${app.name}` : app.name;
    };
    shell.currentChanged.connect(sync);
  }
};
