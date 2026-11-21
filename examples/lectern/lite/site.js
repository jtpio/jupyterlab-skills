#!/usr/bin/env node
/*
 * Finish the JupyterLite site of Lectern, after the bundle is built.
 *
 *   node lite/site.js <folder of lessons> [site folder]
 *
 * It writes the page, the list of settings schemas and the index of the
 * lessons, in the formats that the JupyterLite services read.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const lessons = path.resolve(process.argv[2] || 'lessons');
const site = path.resolve(process.argv[3] || path.join(root, 'lite-site'));
const build = path.join(site, 'build');
const data = require(path.join(root, 'package.json'));

/*
 * All files below a folder, as paths relative to it.
 */
function walk(folder, prefix = '') {
  return fs.readdirSync(path.join(folder, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory() ? walk(folder, relative) : [relative];
  });
}

/*
 * The settings service reads one file with all the schemas.
 */
function writeSchemas() {
  const folder = path.join(build, 'schemas');
  const all = walk(folder)
    .filter(file => file.endsWith('.json') && !path.basename(file).startsWith('all'))
    .map(file => {
      const dirname = path.posix.dirname(file);
      const origin = JSON.parse(fs.readFileSync(path.join(folder, dirname, 'package.json.orig'), 'utf8'));
      return {
        id: `${dirname}:${path.basename(file, '.json')}`,
        raw: '{}',
        schema: JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8')),
        settings: {},
        version: origin.version
      };
    });
  fs.writeFileSync(path.join(folder, 'all.json'), JSON.stringify(all));
  // The schemas of prebuilt extensions: this application has none.
  fs.writeFileSync(path.join(folder, 'all_federated.json'), '[]');
  return all.length;
}

/*
 * The contents service reads the files from files/ and their list from
 * api/contents/all.json: the model of a folder of the Jupyter Server.
 */
function writeContents() {
  const files = path.join(site, 'files');
  fs.rmSync(files, { recursive: true, force: true });
  fs.mkdirSync(files, { recursive: true });
  const now = new Date().toISOString();
  const content = fs
    .readdirSync(lessons, { withFileTypes: true })
    .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
    .map(entry => {
      const source = path.join(lessons, entry.name);
      const target = path.join(files, entry.name);
      const notebook = entry.name.endsWith('.ipynb');
      if (notebook) {
        // The kernel of the site is "python" (Pyodide). With another name in
        // the notebook, a run before the kernel is ready opens a dialog.
        const model = JSON.parse(fs.readFileSync(source, 'utf8'));
        model.metadata = { ...model.metadata, kernelspec: KERNELSPEC };
        fs.writeFileSync(target, JSON.stringify(model, null, 1) + '\n');
      } else {
        fs.copyFileSync(source, target);
      }
      const stat = fs.statSync(target);
      return {
        content: null,
        created: now,
        format: null,
        last_modified: now,
        mimetype: notebook ? null : entry.name.endsWith('.md') ? 'text/markdown' : 'text/plain',
        name: entry.name,
        path: entry.name,
        size: stat.size,
        type: notebook ? 'notebook' : 'file',
        writable: true
      };
    });
  const index = {
    content,
    created: now,
    format: 'json',
    last_modified: now,
    mimetype: null,
    name: '',
    path: '',
    size: null,
    type: 'directory',
    writable: true
  };
  const api = path.join(site, 'api', 'contents');
  fs.mkdirSync(api, { recursive: true });
  fs.writeFileSync(path.join(api, 'all.json'), JSON.stringify(index, null, 2));
  return content.length;
}

/*
 * The page, with the configuration that a Jupyter Server writes in its template.
 */
function writePage() {
  const overrides = path.join(root, 'lectern', 'settings', 'overrides.json');
  const config = {
    appName: 'Lectern',
    appNamespace: 'lectern',
    appVersion: data.version,
    appUrl: '',
    themesUrl: './build/themes',
    lessonRoutes: 'query',
    contentsAllJsonFile: 'all.json',
    defaultKernelName: 'python',
    federated_extensions: [],
    terminalsAvailable: false,
    settingsOverrides: JSON.parse(fs.readFileSync(overrides, 'utf8'))
  };
  const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  fs.writeFileSync(path.join(site, 'index.html'), template.replace('__CONFIG__', JSON.stringify(config)));
}

/*
 * No language pack: the translator gets an empty one.
 */
function writeTranslations() {
  const folder = path.join(site, 'api', 'translations');
  fs.mkdirSync(folder, { recursive: true });
  const empty = { data: {}, message: '' };
  fs.writeFileSync(path.join(folder, 'en.json'), JSON.stringify(empty));
  fs.writeFileSync(path.join(folder, 'all.json'), JSON.stringify({ data: { en: { displayName: 'English', nativeName: 'English' } }, message: '' }));
}

const KERNELSPEC = { display_name: 'Python (Pyodide)', language: 'python', name: 'python' };

// Python packages that the kernel needs at its start and that the Pyodide
// distribution does not have. With their wheels in the site, the kernel
// starts with no request to pypi.org.
const EXTRA_WHEELS = ['comm'];

/*
 * The kernel installs its Python packages from wheels next to their index.
 * The bundler copies only the wheels that the JavaScript code names.
 */
async function copyWheels() {
  const source = path.join(root, 'node_modules', '@jupyterlite', 'pyodide-kernel', 'pypi');
  const target = path.join(build, 'pypi');
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(source)) {
    fs.copyFileSync(path.join(source, name), path.join(target, name));
  }
  const index = JSON.parse(fs.readFileSync(path.join(target, 'all.json'), 'utf8'));
  const added = [];
  for (const name of EXTRA_WHEELS) {
    try {
      const response = await fetch(`https://pypi.org/pypi/${name}/json`);
      const release = await response.json();
      // The record of PyPI has the format of the index: only the URL changes.
      const wheel = release.urls.find(file => file.filename.endsWith('-py3-none-any.whl'));
      const bytes = Buffer.from(await (await fetch(wheel.url)).arrayBuffer());
      fs.writeFileSync(path.join(target, wheel.filename), bytes);
      const record = { ...wheel, url: `./${wheel.filename}` };
      // The metadata file of PyPI is not in the site: the installer reads the wheel.
      for (const key of ['core-metadata', 'data-dist-info-metadata', 'dist-info-metadata']) {
        delete record[key];
      }
      index[name] = { releases: { [release.info.version]: [record] } };
      added.push(wheel.filename);
    } catch (error) {
      console.warn(`Cannot get the wheel of ${name} (${error.message}): the kernel will ask pypi.org for it.`);
    }
  }
  fs.writeFileSync(path.join(target, 'all.json'), JSON.stringify(index, null, 2));
  return added;
}

async function main() {
  const schemas = writeSchemas();
  const wheels = await copyWheels();
  const count = writeContents();
  writePage();
  writeTranslations();
  // The service worker must be at the root of the site: its scope is its folder.
  fs.copyFileSync(path.join(build, 'service-worker.js'), path.join(site, 'service-worker.js'));
  console.log(`${site}: ${schemas} settings schemas, ${count} lesson files, wheels: ${wheels.join(', ') || 'none'}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
