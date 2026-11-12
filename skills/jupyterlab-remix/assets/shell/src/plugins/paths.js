import { JupyterFrontEnd } from '@jupyterlab/application';

/**
 * Provide the URLs and directories of the application to the core plugins.
 */
export default {
  id: 'my-app:paths',
  description: 'Provides the URLs and directories of the application.',
  autoStart: true,
  provides: JupyterFrontEnd.IPaths,
  activate: app => app.paths
};
