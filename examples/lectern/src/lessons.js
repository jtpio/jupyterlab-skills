const LESSON_FILE = /^(\d+)-(.+)\.(md|ipynb)$/;

/**
 * Find the lessons of a folder: the files `NN-slug.md` and `NN-slug.ipynb`,
 * grouped by `NN-slug` and sorted by number. Either file can be missing.
 */
export async function findLessons(contents, folder = '') {
  const listing = await contents.get(folder, { content: true });
  const byName = new Map();
  for (const item of listing.content) {
    const match = LESSON_FILE.exec(item.name);
    if (!match || item.type === 'directory') {
      continue;
    }
    const [, number, slug, extension] = match;
    const name = `${number}-${slug}`;
    if (!byName.has(name)) {
      byName.set(name, {
        name,
        number: Number(number),
        slug,
        text: null,
        notebook: null
      });
    }
    byName.get(name)[extension === 'md' ? 'text' : 'notebook'] = item.path;
  }
  const lessons = [...byName.values()].sort(
    (a, b) => a.number - b.number || a.name.localeCompare(b.name)
  );
  await Promise.all(
    lessons.map(async lesson => {
      lesson.source = await readText(contents, lesson.text);
      lesson.title = firstHeading(lesson.source) ?? titleFromSlug(lesson.slug);
    })
  );
  return lessons;
}

/**
 * Read a text file. Give `null` for a missing or unreadable file.
 */
export async function readText(contents, path) {
  if (!path) {
    return null;
  }
  try {
    const model = await contents.get(path, {
      content: true,
      type: 'file',
      format: 'text'
    });
    return model.content;
  } catch (error) {
    console.warn(`Lectern cannot read ${path}`, error);
    return null;
  }
}

/**
 * The text of the first Markdown heading (ATX or setext), outside code blocks.
 */
export function firstHeading(source) {
  if (!source) {
    return null;
  }
  const lines = source.split(/\r?\n/);
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      continue;
    }
    const atx = /^ {0,3}#{1,6}\s+(.*?)(\s+#+)?\s*$/.exec(line);
    if (atx && atx[1]) {
      return plain(atx[1]);
    }
    const next = lines[i + 1] ?? '';
    if (line.trim() && /^ {0,3}(=+|-+)\s*$/.test(next)) {
      return plain(line);
    }
  }
  return null;
}

function plain(text) {
  return text.replace(/[*_`]/g, '').trim();
}

function titleFromSlug(slug) {
  const words = slug.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
