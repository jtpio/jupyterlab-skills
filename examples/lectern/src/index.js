import './styles';

import { PageConfig } from '@jupyterlab/coreutils';

import { App } from './app';
import plugins, { FIRST_PLUGIN } from './plugins/core';

window.addEventListener('load', async () => {
  const app = new App();
  app.registerPluginModules(plugins);
  if (PageConfig.getOption('exposeAppInBrowser') === 'true') {
    window.jupyterapp = app;
  }
  await app.activatePlugin(FIRST_PLUGIN);
  await app.start();
});
