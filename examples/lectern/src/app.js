import { JupyterFrontEnd } from '@jupyterlab/application';
import { PageConfig } from '@jupyterlab/coreutils';

import { Shell } from './shell';

/**
 * The application: a Jupyter front end with a single-document shell.
 */
export class App extends JupyterFrontEnd {
  constructor(options = {}) {
    const shell = options.shell ?? new Shell();
    super({ ...options, shell, restored: shell.restored });
  }

  name = PageConfig.getOption('appName') || 'Lectern';
  namespace = PageConfig.getOption('appNamespace') || 'lectern';
  version = PageConfig.getOption('appVersion') || 'unknown';

  /**
   * The URLs and server directories of the application, from the page config.
   */
  get paths() {
    const option = PageConfig.getOption;
    return {
      urls: {
        base: option('baseUrl'),
        notFound: option('notFoundUrl'),
        app: option('appUrl'),
        doc: option('docUrl'),
        static: option('staticUrl'),
        settings: option('settingsUrl'),
        themes: option('themesUrl'),
        translations: option('translationsApiUrl'),
        hubHost: option('hubHost') || undefined,
        hubPrefix: option('hubPrefix') || undefined,
        hubUser: option('hubUser') || undefined,
        hubServerName: option('hubServerName') || undefined
      },
      directories: {
        appSettings: option('appSettingsDir'),
        schemas: option('schemasDir'),
        static: option('staticDir'),
        templates: option('templatesDir'),
        themes: option('themesDir'),
        userSettings: option('userSettingsDir'),
        serverRoot: option('serverRoot'),
        workspaces: option('workspacesDir')
      }
    };
  }

  /**
   * Register the plugins of a module: its default export, or an array of
   * plugins (for example a filtered default export).
   */
  registerPluginModule(mod) {
    const data = Array.isArray(mod) ? mod : (mod.default ?? mod);
    for (const plugin of Array.isArray(data) ? data : [data]) {
      try {
        this.registerPlugin(plugin);
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Register the plugins of many modules.
   */
  registerPluginModules(mods) {
    for (const mod of mods) {
      this.registerPluginModule(mod);
    }
  }
}
