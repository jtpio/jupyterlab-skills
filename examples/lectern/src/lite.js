/*
 * The entry point of Lectern for JupyterLite: a static site, with no server.
 * The contents, the settings and the kernels are in the browser.
 */
import './styles';

import { PageConfig } from '@jupyterlab/coreutils';
import { IServiceManager } from '@jupyterlab/services';
import services from '@jupyterlab/services-extension';
import liteApplication from '@jupyterlite/application-extension';
import liteApputils from '@jupyterlite/apputils-extension';
import pyodideKernel from '@jupyterlite/pyodide-kernel-extension';
import liteServices from '@jupyterlite/services-extension';
import { PluginRegistry } from '@lumino/coreutils';

import { App } from './app';
import plugins, { FIRST_PLUGIN, pick } from './plugins/core';

window.addEventListener('load', async () => {
  // JupyterLite replaces the service plugins that talk to a Jupyter Server.
  // The other service plugins of JupyterLab stay.
  const registry = new PluginRegistry();
  registry.registerPlugins([
    ...pick(services, [
      'contents-manager',
      'default-content-provider',
      'server-settings',
      'service-manager',
      'terminal-manager'
    ]),
    ...liteServices
  ]);
  const serviceManager = await registry.resolveRequiredService(IServiceManager);

  const app = new App({ pluginRegistry: registry, serviceManager });
  app.registerPluginModules([
    ...plugins,
    // The service worker lets the code of a notebook read the files of the lessons.
    pick(liteApplication, ['service-worker-manager', 'session-context-patch']),
    pick(liteApputils, ['translator-connector']),
    pyodideKernel
  ]);
  if (PageConfig.getOption('exposeAppInBrowser') === 'true') {
    window.jupyterapp = app;
  }
  await app.activatePlugin(FIRST_PLUGIN);
  await app.start();
});
