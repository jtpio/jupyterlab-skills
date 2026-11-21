import { IRouter, JupyterFrontEnd } from '@jupyterlab/application';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import {
  IRenderMimeRegistry,
  MimeModel,
  RenderMimeRegistry
} from '@jupyterlab/rendermime';
import { Signal } from '@lumino/signaling';
import { Panel, Widget } from '@lumino/widgets';

import { findLessons, firstHeading, readText } from '../lessons';
import { ILessonReader } from '../tokens';

const ROUTE = 'lectern:route';

export const CommandIDs = {
  home: 'lectern:home',
  open: 'lectern:open',
  next: 'lectern:next',
  previous: 'lectern:previous'
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

/**
 * The lessons of the folder and the lesson that shows (`null` on the start
 * page).
 */
class LessonReader {
  lessons = [];
  current = null;
  changed = new Signal(this);

  get index() {
    return this.current ? this.lessons.indexOf(this.current) : -1;
  }

  get next() {
    const index = this.index;
    return index >= 0 ? (this.lessons[index + 1] ?? null) : null;
  }

  get previous() {
    const index = this.index;
    return index > 0 ? this.lessons[index - 1] : null;
  }
}

/**
 * The start page: the lessons of the folder, in order.
 */
class StartPage extends Widget {
  constructor(options) {
    super();
    this.id = 'lectern-start';
    this.addClass('lectern-Start');
    this.title.label = 'Lessons';
    this._options = options;
  }

  render(lessons, notice) {
    const { url, open } = this._options;
    const page = element('div', 'lectern-Start-page');
    page.append(element('h1', 'lectern-Start-heading', 'Lessons'));
    page.append(
      element(
        'p',
        'lectern-Start-lead',
        lessons.length
          ? `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}. ` +
              'Each one opens with its text on the left and its notebook on the right.'
          : 'This folder has no lessons. A lesson is a pair of files with a ' +
              'number in front, for example 01-lists.md and 01-lists.ipynb.'
      )
    );
    if (notice) {
      page.append(element('p', 'lectern-Start-notice', notice));
    }
    const list = element('ol', 'lectern-LessonList');
    for (const lesson of lessons) {
      const link = element('a', 'lectern-LessonList-link');
      link.href = url(lesson);
      link.dataset.lesson = lesson.name;
      link.onclick = event => {
        event.preventDefault();
        open(lesson);
      };
      const files = [lesson.text, lesson.notebook].filter(Boolean).join('  ·  ');
      const missing = !lesson.text ? 'no text' : !lesson.notebook ? 'no notebook' : '';
      const body = element('span', 'lectern-LessonList-body');
      body.append(
        element('span', 'lectern-LessonList-title', lesson.title),
        element('span', 'lectern-LessonList-files', files)
      );
      link.append(
        element('span', 'lectern-LessonList-number', String(lesson.number).padStart(2, '0')),
        body
      );
      if (missing) {
        link.append(element('span', 'lectern-LessonList-note', missing));
      }
      list.appendChild(element('li')).appendChild(link);
    }
    page.append(list);
    const keys = element('p', 'lectern-Start-keys');
    keys.innerHTML =
      '<kbd>Shift</kbd> <kbd>Enter</kbd> runs a cell. ' +
      '<kbd>Alt</kbd> <kbd>→</kbd> and <kbd>Alt</kbd> <kbd>←</kbd> go to the next and the previous lesson.';
    page.append(keys);
    this.node.replaceChildren(page);
  }
}

/**
 * The text pane: the Markdown file of the lesson, rendered and read-only.
 */
class LessonText extends Panel {
  constructor(rendermime, contents) {
    super();
    this.id = 'lectern-lesson-text';
    this.addClass('lectern-Text');
    this._rendermime = rendermime;
    this._contents = contents;
  }

  async render(lesson) {
    const old = [...this.widgets];
    let widget;
    if (lesson.source === null) {
      widget = new Widget();
      widget.addClass('lectern-Missing');
      widget.node.append(
        element('h2', '', 'This lesson has no text'),
        element('p', '', `Add ${lesson.name}.md to this folder to give it one.`)
      );
    } else {
      // The resolver makes relative links and images point to the lesson folder.
      const rendermime = this._rendermime.clone({
        resolver: new RenderMimeRegistry.UrlResolver({
          path: lesson.text,
          contents: this._contents
        })
      });
      widget = rendermime.createRenderer('text/markdown');
    }
    widget.addClass('lectern-Text-page');
    this.addWidget(widget);
    old.forEach(item => item.dispose());
    this.node.scrollTop = 0;
    if (lesson.source !== null) {
      await widget.renderModel(
        new MimeModel({ data: { 'text/markdown': lesson.source } })
      );
    }
  }
}

/**
 * The notebook pane of a lesson that has no notebook.
 */
class MissingNotebook extends Widget {
  constructor() {
    super();
    this.id = 'lectern-no-notebook';
    this.addClass('lectern-Missing');
    this.title.label = 'No notebook';
  }

  render(lesson) {
    this.node.replaceChildren(
      element('h2', '', 'This lesson has no notebook'),
      element('p', '', `Add ${lesson.name}.ipynb to this folder to give it one.`)
    );
  }
}

/**
 * Show the start page at `<app>` and a lesson at `<app>/lessons/<NN-slug>`:
 * its text in the left pane, its notebook in the right pane.
 */
export default {
  id: 'lectern:reader',
  description: 'Shows the start page and the lessons of the folder.',
  autoStart: true,
  requires: [
    IRouter,
    IDocumentManager,
    IRenderMimeRegistry,
    JupyterFrontEnd.IPaths
  ],
  provides: ILessonReader,
  activate: (app, router, docManager, rendermime, paths) => {
    const { commands, serviceManager, shell } = app;
    const contents = serviceManager.contents;
    const home = paths.urls.app;
    const prefix = `${home}/lessons/`;
    // A static site has one page: the lesson is then in the query string.
    const byQuery = PageConfig.getOption('lessonRoutes') === 'query';
    const route = lesson =>
      byQuery
        ? `?lesson=${encodeURIComponent(lesson.name)}`
        : prefix + encodeURIComponent(lesson.name);
    const nameOf = args => {
      if (byQuery) {
        return new URLSearchParams(args.search ?? '').get('lesson');
      }
      const path = args.path ?? '';
      return path.startsWith(prefix)
        ? decodeURIComponent(path.slice(prefix.length))
        : null;
    };

    const reader = new LessonReader();
    const start = new StartPage({
      url: lesson => URLExt.join(PageConfig.getBaseUrl(), route(lesson)),
      open: lesson => router.navigate(route(lesson))
    });
    const text = new LessonText(rendermime, contents);
    const missing = new MissingNotebook();
    let notebook = null;

    const closeNotebook = async widget => {
      if (!widget || widget.isDisposed) {
        return;
      }
      const context = docManager.contextForWidget(widget);
      if (context?.model.dirty && context.contentsModel?.writable !== false) {
        try {
          await context.save();
        } catch (error) {
          console.warn(`Lectern cannot save ${context.path}`, error);
        }
      }
      widget.close();
    };

    const showHome = async notice => {
      reader.lessons = await findLessons(contents);
      reader.current = null;
      start.render(reader.lessons, notice);
      shell.add(start, 'home');
      shell.mode = 'home';
      const previous = notebook;
      notebook = null;
      missing.parent = null;
      await closeNotebook(previous);
      document.title = app.name;
      reader.changed.emit();
    };

    const showLesson = async name => {
      let lesson = reader.lessons.find(item => item.name === name);
      if (!lesson) {
        reader.lessons = await findLessons(contents);
        lesson = reader.lessons.find(item => item.name === name);
      }
      if (!lesson) {
        router.navigate(home, { skipRouting: true });
        return showHome(`There is no lesson "${name}" in this folder.`);
      }
      lesson.source = await readText(contents, lesson.text);
      lesson.title = firstHeading(lesson.source) ?? lesson.title;
      reader.current = lesson;
      shell.add(text, 'text');
      shell.mode = 'lesson';
      const rendered = text.render(lesson);

      // Open the new notebook before the old one closes: no empty pane.
      const previous = notebook;
      if (lesson.notebook) {
        notebook = docManager.openOrReveal(lesson.notebook) ?? null;
        missing.parent = null;
      } else {
        notebook = null;
        missing.render(lesson);
        shell.add(missing, 'main');
      }
      if (previous !== notebook) {
        await closeNotebook(previous);
      }
      document.title = `${lesson.title} - ${app.name}`;
      reader.changed.emit();
      await rendered;
    };

    // Routes run one after the other, so that fast key presses do not mix.
    let queue = Promise.resolve();
    commands.addCommand(ROUTE, {
      label: 'Show the Lesson of the URL',
      execute: args => {
        const name = nameOf(args);
        queue = queue
          .then(() =>
            name ? showLesson(name.replace(/\.(md|ipynb)$/, '')) : showHome()
          )
          .catch(error =>
            console.error(`Lectern cannot show ${args.path ?? ''}`, error)
          );
        return queue;
      }
    });
    router.register({ command: ROUTE, pattern: /.*/ });

    reader.changed.connect(() => commands.notifyCommandChanged());

    commands.addCommand(CommandIDs.home, {
      label: 'All Lessons',
      caption: 'Show the list of lessons',
      execute: () => router.navigate(home)
    });
    commands.addCommand(CommandIDs.open, {
      label: args => `Open Lesson ${args.name ?? ''}`.trim(),
      execute: args => {
        const lesson = reader.lessons.find(item => item.name === args.name);
        return lesson && router.navigate(route(lesson));
      }
    });
    commands.addCommand(CommandIDs.next, {
      label: 'Next',
      caption: 'Go to the next lesson (Alt+Right)',
      isEnabled: () => reader.next !== null,
      execute: () => reader.next && router.navigate(route(reader.next))
    });
    commands.addCommand(CommandIDs.previous, {
      label: 'Previous',
      caption: 'Go to the previous lesson (Alt+Left)',
      isEnabled: () => reader.previous !== null,
      execute: () =>
        reader.previous && router.navigate(route(reader.previous))
    });

    return reader;
  }
};
