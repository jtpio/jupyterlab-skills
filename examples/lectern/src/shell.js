import { PromiseDelegate } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import {
  BoxLayout,
  Panel,
  SplitPanel,
  StackedPanel,
  Widget
} from '@lumino/widgets';

const DEFAULT_RANK = 900;

/**
 * The application shell: a top bar above either the start page (area `home`)
 * or two panes with a divider, the lesson text (area `text`) and the
 * notebook (area `main`). It implements `JupyterFrontEnd.IShell`.
 */
export class Shell extends Widget {
  constructor() {
    super();
    this.id = 'lectern-shell';

    this._top = new Panel();
    this._top.id = 'lectern-top';
    this._home = new StackedPanel();
    this._home.id = 'lectern-home';
    this._text = new StackedPanel();
    this._text.id = 'lectern-text';
    this._main = new StackedPanel();
    this._main.id = 'lectern-main';
    this._main.widgetRemoved.connect(this._onMainWidgetRemoved, this);

    this._split = new SplitPanel({ orientation: 'horizontal', spacing: 7 });
    this._split.id = 'lectern-split';
    this._split.addWidget(this._text);
    this._split.addWidget(this._main);
    SplitPanel.setStretch(this._text, 9);
    SplitPanel.setStretch(this._main, 11);
    this._split.hide();

    const layout = new BoxLayout({ direction: 'top-to-bottom', spacing: 0 });
    for (const [panel, stretch] of [
      [this._top, 0],
      [this._home, 1],
      [this._split, 1]
    ]) {
      BoxLayout.setStretch(panel, stretch);
      layout.addWidget(panel);
    }
    this.layout = layout;
    this.node.dataset.mode = this._mode;
  }

  /**
   * The document that shows in the notebook pane.
   */
  get currentWidget() {
    return this._current;
  }

  /**
   * A signal emitted when another document shows in the notebook pane.
   */
  get currentChanged() {
    return this._currentChanged;
  }

  /**
   * A promise that resolves when the start page or a document shows.
   */
  get restored() {
    return this._restored.promise;
  }

  /**
   * `home` shows the start page, `lesson` shows the two panes.
   */
  get mode() {
    return this._mode;
  }

  set mode(value) {
    if (value === this._mode) {
      return;
    }
    this._mode = value;
    this.node.dataset.mode = value;
    this._home.setHidden(value !== 'home');
    this._split.setHidden(value !== 'lesson');
  }

  /**
   * Whether the text pane shows next to the notebook.
   */
  get textVisible() {
    return !this._text.isHidden;
  }

  set textVisible(value) {
    if (value === this.textVisible) {
      return;
    }
    // A pane that shows again gets a default size: keep the one of the user.
    if (!value) {
      this._sizes = this._split.relativeSizes();
    }
    this._text.setHidden(!value);
    if (value && this._sizes) {
      this._split.setRelativeSizes(this._sizes);
    }
  }

  /**
   * Add a widget to an area. A widget added to `home`, `text` or `main`
   * hides the earlier widget of that area.
   */
  add(widget, area = 'main', options = {}) {
    switch (area) {
      case 'top':
        this._insert(this._top, widget, options.rank);
        break;
      case 'home':
      case 'text':
        this._show(area === 'home' ? this._home : this._text, widget);
        this._restored.resolve();
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
    for (const area of ['main', 'text', 'home', 'top']) {
      for (const widget of this.widgets(area)) {
        if (widget.id === id) {
          if (area === 'main') {
            this._setCurrent(widget);
          } else if (area !== 'top') {
            this._show(area === 'home' ? this._home : this._text, widget);
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
    const panels = {
      top: this._top,
      home: this._home,
      text: this._text,
      main: this._main
    };
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

  _show(panel, widget) {
    if (widget.parent !== panel) {
      panel.addWidget(widget);
    }
    for (const other of panel.widgets) {
      other.setHidden(other !== widget);
    }
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
  _mode = 'home';
  _ranks = new WeakMap();
  _restored = new PromiseDelegate();
  _sizes = null;
}
