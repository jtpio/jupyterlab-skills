#!/usr/bin/env node
/*
 * Smoke test of the JupyterLite site of Lectern, in a real browser.
 *
 *   npm run build:lite
 *   node tests/lite.cjs [site folder]
 *
 * It serves the site from a subfolder, opens the three lessons, runs their
 * notebooks with the Pyodide kernel, and checks that an edit stays in the
 * browser. The browser needs internet access for Pyodide.
 */

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const site = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lite-site'));
const PREFIX = '/docs/lectern/';
const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ipynb': 'application/json',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.whl': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Console messages of JupyterLite that are not faults of the site.
const KNOWN_ERRORS = [
  // The Pyodide kernel rejects its "ready" promise when a kernel stops
  // before it is ready: Lectern stops the kernel when a lesson closes.
  /was disposed/
];

/*
 * Serve the site below PREFIX, as a static host with a subfolder does.
 */
function serve() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    let file = decodeURIComponent(url.pathname);
    if (!file.startsWith(PREFIX)) {
      response.writeHead(404).end();
      return;
    }
    file = path.join(site, file.slice(PREFIX.length) || 'index.html');
    if (!file.startsWith(site) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}${PREFIX}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', message => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', error => consoleErrors.push(String(error)));
  page.on('response', response => response.status() >= 400 && failedRequests.push(`${response.status()} ${response.url()}`));

  const failures = [];
  let passed = 0;
  const check = (name, pass, detail = '') => {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
    if (pass) {
      passed++;
    } else {
      failures.push(name);
    }
  };
  const links = page.locator('a[href*="lesson="]');
  const notebookReady = () => page.locator('.jp-Notebook .jp-Cell').first().waitFor({ timeout: 60000 });
  // The first run loads Pyodide: it can take one minute.
  const runAll = async () => {
    await page.getByRole('button', { name: /run all/i }).first().click();
    return page.locator('.jp-OutputArea-output').first().waitFor({ timeout: 180000 }).then(() => true, () => false);
  };
  const lesson = () => new URL(page.url()).searchParams.get('lesson');

  try {
    await page.goto(base);
    await links.first().waitFor({ timeout: 60000 });
    const slugs = await links.evaluateAll(nodes => nodes.map(node => new URL(node.href).searchParams.get('lesson')));
    check('the start page lists the lessons', slugs.length === 3, slugs.join(', '));

    await links.first().click();
    await notebookReady();
    check('a lesson opens from the list', lesson() === slugs[0], lesson());
    check('lesson 1: Run all gives outputs from the Pyodide kernel', await runAll());
    check('the service worker controls the page', await page.evaluate(() => !!navigator.serviceWorker.controller));

    await page.getByRole('button', { name: /^next/i }).first().click();
    await page.waitForFunction(slug => new URL(location.href).searchParams.get('lesson') === slug, slugs[1], { timeout: 20000 }).catch(() => undefined);
    await notebookReady();
    check('Next goes to lesson 2', lesson() === slugs[1], lesson());
    check('lesson 2: Run all gives outputs', await runAll());
    await page.keyboard.press('Alt+ArrowRight');
    await page.waitForFunction(slug => new URL(location.href).searchParams.get('lesson') === slug, slugs[2], { timeout: 20000 }).catch(() => undefined);
    await notebookReady();
    check('Alt+Right goes to lesson 3', lesson() === slugs[2], lesson());
    check('lesson 3: Run all gives outputs', await runAll());

    const title = await page.title();
    await page.reload();
    await notebookReady();
    check('a reload keeps the lesson of the address', lesson() === slugs[2] && (await page.title()) === title, await page.title());

    // An edit of a notebook stays in the storage of the browser.
    await page.goto(`${base}?lesson=${slugs[0]}`);
    await notebookReady();
    await page.locator('.jp-Notebook .jp-CodeCell .cm-content').last().click();
    await page.keyboard.press('Control+End');
    await page.keyboard.type('\nprint("kept in the browser")');
    await page.locator('#lectern-brand').click();
    await links.first().waitFor({ timeout: 30000 });
    check('the brand goes back to the list', lesson() === null);
    await page.goto(`${base}?lesson=${slugs[0]}`);
    await notebookReady();
    const kept = await page.locator('.jp-Notebook', { hasText: 'kept in the browser' }).waitFor({ timeout: 10000 }).then(() => true, () => false);
    check('an edit of a notebook stays after a reload', kept);

    await page.goto(`${base}?lesson=no-such-lesson`);
    await links.first().waitFor({ timeout: 30000 });
    const note = await page.locator('.lectern-Start-notice').innerText({ timeout: 10000 }).catch(() => '');
    check('an unknown lesson shows the list with a note', note.includes('no-such-lesson'), note || (await page.locator('body').innerText()).slice(0, 120));

    const errors = consoleErrors.filter(text => !KNOWN_ERRORS.some(pattern => pattern.test(text)));
    const known = consoleErrors.length - errors.length;
    check('no error in the browser console', errors.length === 0, errors.slice(0, 3).join(' | ').slice(0, 300) || (known ? `${known} known message of JupyterLite ignored` : ''));
    check('no failed request', failedRequests.length === 0, [...new Set(failedRequests)].slice(0, 3).join(' | '));
  } catch (error) {
    check('the test ran to its end', false, String(error.message).split('\n')[0]);
  } finally {
    await browser.close();
    server.close();
  }
  console.log(failures.length ? `\n${failures.length} check(s) failed, ${passed} passed` : `\nAll ${passed} checks passed`);
  process.exit(failures.length ? 1 : 0);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
