/**
 * The file browser runs "launcher:create" when the main area is empty at
 * startup. This application has no launcher: the command does nothing.
 */
const plugin = {
  id: 'my-app:launcher',
  description: 'Replaces the launcher with an empty main area.',
  autoStart: true,
  activate: app => {
    app.commands.addCommand('launcher:create', { execute: () => undefined });
  }
};

export default plugin;
