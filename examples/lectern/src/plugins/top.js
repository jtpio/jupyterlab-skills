import { CommandToolbarButton } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';

import {
  brandIcon,
  nextIcon,
  previousIcon,
  resetIcon,
  runAllIcon,
  textIcon
} from '../icons';
import { ILessonReader } from '../tokens';
import { CommandIDs } from './reader';

const RUN_ALL = 'lectern:run-all';
const RESET = 'lectern:reset';
const TOGGLE_TEXT = 'lectern:toggle-text';

/**
 * The top bar: the brand, the title and position of the lesson, the lesson
 * buttons. The lesson parts hide on the start page.
 */
export default {
  id: 'lectern:top',
  description: 'Adds the brand, the lesson title and the buttons to the top bar.',
  autoStart: true,
  requires: [ILessonReader],
  activate: (app, reader) => {
    const { commands, shell } = app;

    commands.addCommand(RUN_ALL, {
      label: 'Run all',
      caption: 'Run all cells of the notebook, from the top',
      isEnabled: () => commands.isEnabled('notebook:run-all-cells'),
      execute: async () => {
        // A click right after the lesson opens waits for the kernel.
        await shell.currentWidget?.sessionContext?.ready;
        return commands.execute('notebook:run-all-cells');
      }
    });
    commands.addCommand(RESET, {
      label: 'Reset',
      caption:
        'Clear the outputs and execution counts of all cells. ' +
        'The code, the file and the kernel stay as they are.',
      isEnabled: () => commands.isEnabled('notebook:clear-all-cell-outputs'),
      execute: () => commands.execute('notebook:clear-all-cell-outputs')
    });
    commands.addCommand(TOGGLE_TEXT, {
      label: () => (shell.textVisible ? 'Hide text' : 'Show text'),
      caption: 'Hide or show the text of the lesson',
      isToggled: () => shell.textVisible,
      execute: () => {
        shell.textVisible = !shell.textVisible;
        commands.notifyCommandChanged(TOGGLE_TEXT);
      }
    });

    const brand = new Widget({ node: document.createElement('button') });
    brand.id = 'lectern-brand';
    brand.node.title = 'All lessons';
    brandIcon.element({ container: brand.node });
    brand.node.append('Lectern');
    brand.node.onclick = () => commands.execute(CommandIDs.home);
    shell.add(brand, 'top', { rank: 0 });

    const title = new Widget();
    title.id = 'lectern-title';
    const name = document.createElement('span');
    name.className = 'lectern-Title-name';
    const position = document.createElement('span');
    position.className = 'lectern-Title-position';
    title.node.append(name, position);
    shell.add(title, 'top', { rank: 10 });

    const lessonParts = [title];
    const groups = [
      [
        { id: CommandIDs.previous, icon: previousIcon },
        { id: CommandIDs.next, icon: nextIcon }
      ],
      [
        { id: RUN_ALL, icon: runAllIcon },
        { id: RESET, icon: resetIcon }
      ],
      [{ id: TOGGLE_TEXT, icon: textIcon }]
    ];
    let rank = 100;
    groups.forEach((group, index) => {
      if (index > 0) {
        const separator = new Widget();
        separator.addClass('lectern-Separator');
        shell.add(separator, 'top', { rank: rank++ });
        lessonParts.push(separator);
      }
      for (const { id, icon } of group) {
        const button = new CommandToolbarButton({ commands, id, icon });
        button.id = `lectern-button-${id.split(':')[1]}`;
        button.addClass('lectern-TopButton');
        shell.add(button, 'top', { rank: rank++ });
        lessonParts.push(button);
      }
    });

    const update = () => {
      const lesson = reader.current;
      for (const part of lessonParts) {
        part.setHidden(!lesson);
      }
      name.textContent = lesson?.title ?? '';
      position.textContent = lesson
        ? `${reader.index + 1} of ${reader.lessons.length}`
        : '';
    };
    reader.changed.connect(update);
    update();

    // The enabled state of the notebook commands changes when it is ready.
    shell.currentChanged.connect((sender, { newValue }) => {
      const refresh = () => commands.notifyCommandChanged();
      Promise.resolve(newValue?.revealed).then(refresh, refresh);
      newValue?.sessionContext?.ready.then(refresh, refresh);
    });
  }
};
