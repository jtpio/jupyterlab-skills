import { NotebookActions } from '@jupyterlab/notebook';
import {
  addIcon,
  copyIcon,
  cutIcon,
  deleteIcon,
  fastForwardIcon,
  pasteIcon,
  refreshIcon,
  runIcon,
  saveIcon,
  stopIcon
} from '@jupyterlab/ui-components';

/**
 * The ids of the commands of the notebook.
 */
export const COMMAND_IDS = {
  invoke: 'completer:invoke',
  select: 'completer:select',
  invokeNotebook: 'completer:invoke-notebook',
  selectNotebook: 'completer:select-notebook',
  save: 'notebook:save',
  interrupt: 'notebook:interrupt-kernel',
  restart: 'notebook:restart-kernel',
  restartAndRun: 'notebook:restart-and-run',
  runAndAdvance: 'notebook-cells:run-and-advance',
  run: 'notebook:run-cell',
  editMode: 'notebook:edit-mode',
  commandMode: 'notebook:command-mode',
  selectAbove: 'notebook-cells:select-above',
  selectBelow: 'notebook-cells:select-below',
  extendAbove: 'notebook-cells:extend-above',
  extendBelow: 'notebook-cells:extend-below',
  merge: 'notebook-cells:merge',
  split: 'notebook-cells:split',
  undo: 'notebook-cells:undo',
  redo: 'notebook-cells:redo',
  insert: 'notebook-cells:insert',
  deleteCell: 'notebook-cells:delete',
  cut: 'notebook-cells:cut',
  copy: 'notebook-cells:copy',
  paste: 'notebook-cells:paste'
};

/**
 * Add the commands of the notebook and their keyboard shortcuts.
 */
export function setupCommands(commands, panel, handler, sessionContextDialogs) {
  const notebook = panel.content;
  const { sessionContext } = panel;
  const isCodeCell = () => notebook.activeCell?.model.type === 'code';

  /*
   * A toolbar button passes `toolbar: true`: it shows the icon, not the label.
   */
  const add = (id, label, icon, execute) => {
    commands.addCommand(id, {
      label: args => (args.toolbar ? '' : label),
      caption: label,
      icon: args => (args.toolbar ? icon : undefined),
      execute
    });
  };

  add(COMMAND_IDS.invoke, 'Completer: Invoke', undefined, () =>
    handler.invoke()
  );
  add(COMMAND_IDS.select, 'Completer: Select', undefined, () =>
    handler.completer.selectActive()
  );
  add(COMMAND_IDS.invokeNotebook, 'Invoke Notebook', undefined, () =>
    isCodeCell() ? commands.execute(COMMAND_IDS.invoke) : undefined
  );
  add(COMMAND_IDS.selectNotebook, 'Select Notebook', undefined, () =>
    isCodeCell() ? commands.execute(COMMAND_IDS.select) : undefined
  );
  add(COMMAND_IDS.save, 'Save', saveIcon, () => panel.context.save());
  add(COMMAND_IDS.interrupt, 'Interrupt the kernel', stopIcon, () =>
    sessionContext.session?.kernel?.interrupt()
  );
  add(COMMAND_IDS.restart, 'Restart the kernel', refreshIcon, () =>
    sessionContextDialogs.restart(sessionContext)
  );
  add(
    COMMAND_IDS.restartAndRun,
    'Restart the kernel, then run the whole notebook',
    fastForwardIcon,
    async () => {
      if (await sessionContextDialogs.restart(sessionContext)) {
        await NotebookActions.runAll(
          notebook,
          sessionContext,
          sessionContextDialogs
        );
      }
    }
  );
  add(COMMAND_IDS.runAndAdvance, 'Run and advance', runIcon, () =>
    NotebookActions.runAndAdvance(
      notebook,
      sessionContext,
      sessionContextDialogs
    )
  );
  add(COMMAND_IDS.run, 'Run', undefined, () =>
    NotebookActions.run(notebook, sessionContext, sessionContextDialogs)
  );
  add(COMMAND_IDS.editMode, 'Edit mode', undefined, () => {
    notebook.mode = 'edit';
  });
  add(COMMAND_IDS.commandMode, 'Command mode', undefined, () => {
    notebook.mode = 'command';
  });
  add(COMMAND_IDS.selectAbove, 'Select above', undefined, () =>
    NotebookActions.selectAbove(notebook)
  );
  add(COMMAND_IDS.selectBelow, 'Select below', undefined, () =>
    NotebookActions.selectBelow(notebook)
  );
  add(COMMAND_IDS.extendAbove, 'Extend above', undefined, () =>
    NotebookActions.extendSelectionAbove(notebook)
  );
  add(COMMAND_IDS.extendBelow, 'Extend below', undefined, () =>
    NotebookActions.extendSelectionBelow(notebook)
  );
  add(COMMAND_IDS.merge, 'Merge cells', undefined, () =>
    NotebookActions.mergeCells(notebook)
  );
  add(COMMAND_IDS.split, 'Split cell', undefined, () =>
    NotebookActions.splitCell(notebook)
  );
  add(COMMAND_IDS.undo, 'Undo', undefined, () =>
    NotebookActions.undo(notebook)
  );
  add(COMMAND_IDS.redo, 'Redo', undefined, () =>
    NotebookActions.redo(notebook)
  );
  add(COMMAND_IDS.insert, 'Insert a cell below', addIcon, () =>
    NotebookActions.insertBelow(notebook)
  );
  add(COMMAND_IDS.deleteCell, 'Delete the selected cells', deleteIcon, () =>
    NotebookActions.deleteCells(notebook)
  );
  add(COMMAND_IDS.cut, 'Cut the selected cells', cutIcon, () =>
    NotebookActions.cut(notebook)
  );
  add(COMMAND_IDS.copy, 'Copy the selected cells', copyIcon, () =>
    NotebookActions.copy(notebook)
  );
  add(COMMAND_IDS.paste, 'Paste cells from the clipboard', pasteIcon, () =>
    NotebookActions.paste(notebook)
  );

  const commandMode =
    '.jp-Notebook.jp-mod-commandMode:not(.jp-mod-readWrite) :focus';
  const editMode = '.jp-Notebook.jp-mod-editMode';
  const bindings = [
    [
      COMMAND_IDS.invokeNotebook,
      'Tab',
      `${editMode} .jp-mod-completer-enabled`
    ],
    [COMMAND_IDS.selectNotebook, 'Enter', '.jp-mod-completer-active'],
    [COMMAND_IDS.run, 'Ctrl Enter', '.jp-Notebook'],
    [COMMAND_IDS.runAndAdvance, 'Shift Enter', '.jp-Notebook'],
    [COMMAND_IDS.save, 'Accel S', '.jp-Notebook'],
    [COMMAND_IDS.editMode, 'Enter', commandMode],
    [COMMAND_IDS.commandMode, 'Escape', editMode],
    [COMMAND_IDS.split, 'Ctrl Shift -', editMode],
    [COMMAND_IDS.merge, 'Shift M', commandMode],
    [COMMAND_IDS.selectBelow, 'J', commandMode],
    [COMMAND_IDS.selectBelow, 'ArrowDown', commandMode],
    [COMMAND_IDS.selectAbove, 'K', commandMode],
    [COMMAND_IDS.selectAbove, 'ArrowUp', commandMode],
    [COMMAND_IDS.extendAbove, 'Shift K', commandMode],
    [COMMAND_IDS.extendBelow, 'Shift J', commandMode],
    [COMMAND_IDS.undo, 'Z', commandMode],
    [COMMAND_IDS.redo, 'Y', commandMode]
  ];
  for (const [command, key, selector] of bindings) {
    commands.addKeyBinding({ command, keys: [key], selector });
  }
  commands.addKeyBinding({
    command: COMMAND_IDS.interrupt,
    keys: ['I', 'I'],
    selector: commandMode
  });
  commands.addKeyBinding({
    command: COMMAND_IDS.restart,
    keys: ['0', '0'],
    selector: commandMode
  });
}
