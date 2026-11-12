import {
  CommandToolbarButton,
  jupyterIcon,
  runIcon,
  saveIcon
} from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';

/**
 * Fill the top bar: the brand, then one button for each command.
 */
export default {
  id: 'my-app:top',
  description: 'Adds the brand and the command buttons to the top bar.',
  autoStart: true,
  activate: app => {
    const { commands, shell } = app;

    const brand = new Widget();
    brand.id = 'my-app-brand';
    jupyterIcon.element({
      container: brand.node,
      height: '24px',
      width: '24px'
    });
    brand.node.append(app.name);
    shell.add(brand, 'top', { rank: 0 });

    const buttons = [
      { id: 'notebook:run-all-cells', label: 'Run all', icon: runIcon },
      { id: 'docmanager:save', label: 'Save', icon: saveIcon }
    ];
    buttons.forEach((button, index) => {
      const widget = new CommandToolbarButton({ commands, ...button });
      widget.id = `my-app-button-${index}`;
      shell.add(widget, 'top', { rank: 100 + index });
    });

    // The enabled state of a command can change when the document is ready.
    shell.currentChanged.connect((sender, { newValue }) => {
      const update = () => commands.notifyCommandChanged();
      Promise.resolve(newValue?.revealed).then(update, update);
    });
  }
};
