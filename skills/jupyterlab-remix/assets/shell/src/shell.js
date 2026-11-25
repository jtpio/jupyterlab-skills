import { PromiseDelegate } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { BoxLayout, Panel, StackedPanel, Widget } from '@lumino/widgets';

const DEFAULT_RANK = 900;

/**
 * The application shell: a top bar, a menu bar and one document at a time.
 * It implements `JupyterFrontEnd.IShell`.
 */
export class Shell extends Widget {
  constructor() {
    super();
    this.id = 'my-app-shell';

    this._top = new Panel();
    this._top.id = 'my-app-top';
    this._menu = new Panel();
    this._menu.id = 'my-app-menu';
    this._menu.hide();
    this._main = new StackedPanel();
    this._main.id = 'my-app-main';
    this._main.widgetRemoved.connect(this._onMainWidgetRemoved, this);

    const layout = new BoxLayout({ direction: 'top-to-bottom', spacing: 0 });
    for (const [panel, stretch] of [
      [this._top, 0],
      [this._menu, 0],
      [this._main, 1]
    ]) {
      BoxLayout.setStretch(panel, stretch);
      layout.addWidget(panel);
    }
    this.layout = layout;
  }

  /**
   * The document that shows in the main area.
   */
  get currentWidget() {
    return this._current;
  }

  /**
   * A signal emitted when another document shows in the main area.
   */
  get currentChanged() {
    return this._currentChanged;
  }

  /**
   * A promise that resolves when the first document is in the main area.
   */
  get restored() {
    return this._restored.promise;
  }

  /**
   * Add a widget to an area. A widget added to `main` hides the previous one.
   */
  add(widget, area = 'main', options = {}) {
    switch (area) {
      case 'top':
        this._insert(this._top, widget, options.rank);
        break;
      case 'menu':
        this._insert(this._menu, widget, options.rank);
        this._menu.show();
        break;
      case 'main':
        if (!widget.id) {
          console.error('A widget in the main area must have an id.');
          return;
        }
        this._main.addWidget(widget);
        this._setCurrent(widget);
        this._restored.resolve();
        break;
      default:
        console.warn(
          `The shell has no area "${area}": ${widget.id} is ignored.`
        );
    }
  }

  /**
   * Show the widget with the given id and give it the focus.
   */
  activateById(id) {
    for (const area of ['main', 'top', 'menu']) {
      for (const widget of this.widgets(area)) {
        if (widget.id === id) {
          if (area === 'main') {
            this._setCurrent(widget);
          }
          widget.activate();
          return;
        }
      }
    }
  }

  /**
   * Iterate over the widgets of an area. An unknown area has no widgets.
   */
  *widgets(area = 'main') {
    const panels = { top: this._top, menu: this._menu, main: this._main };
    if (panels[area]) {
      yield* panels[area].widgets;
    }
  }

  _insert(panel, widget, rank = DEFAULT_RANK) {
    this._ranks.set(widget, rank);
    const index = panel.widgets.findIndex(
      other => this._ranks.get(other) > rank
    );
    panel.insertWidget(index === -1 ? panel.widgets.length : index, widget);
  }

  _setCurrent(widget) {
    const oldValue = this._current;
    if (oldValue === widget) {
      return;
    }
    this._current = widget;
    for (const other of this._main.widgets) {
      other.setHidden(other !== widget);
    }
    this._currentChanged.emit({ oldValue, newValue: widget });
  }

  _onMainWidgetRemoved(sender, widget) {
    if (widget === this._current) {
      const widgets = this._main.widgets;
      this._setCurrent(widgets[widgets.length - 1] ?? null);
    }
  }

  _current = null;
  _currentChanged = new Signal(this);
  _ranks = new WeakMap();
  _restored = new PromiseDelegate();
}
