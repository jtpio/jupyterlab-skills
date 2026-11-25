import { Notification } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu, Widget } from '@lumino/widgets';

const COMMAND = 'my-app:hello';

/**
 * An example of an application plugin: a command, a button in the top area
 * and a menu.
 */
const plugin = {
  id: 'my-app:hello',
  description: 'Adds the "Say Hello" command, its button and its menu.',
  autoStart: true,
  requires: [IMainMenu],
  activate: (app, mainMenu) => {
    app.commands.addCommand(COMMAND, {
      label: 'Say Hello',
      execute: () => {
        Notification.info(`Hello from ${app.name}!`, { autoClose: 3000 });
      }
    });

    const button = new Widget({ node: document.createElement('button') });
    button.id = 'my-app-hello';
    button.addClass('my-app-HelloButton');
    button.node.textContent = 'Hello';
    button.node.addEventListener('click', () => {
      void app.commands.execute(COMMAND);
    });
    app.shell.add(button, 'top', { rank: 1000 });

    const menu = new Menu({ commands: app.commands });
    menu.title.label = app.name;
    menu.addItem({ command: COMMAND });
    mainMenu.addMenu(menu, true, { rank: 2000 });
  }
};

export default plugin;
