#!/usr/bin/env node
/*
 * Smoke test of Meridian: start it, use it as a person does, and check the
 * result of each action.
 *
 *   node tests/smoke.cjs [--meridian <command>] [--screenshots <folder>]
 *
 * With no option, the test starts the `meridian` command of the PATH on a
 * copy of the demo folder, in a browser with no window. To watch the test:
 *
 *   node tests/smoke.cjs --headed 1 [--slow 400] [--window x,y,width,height] [--scale 1.2]
 */

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const TOLERANCE = 2;

/*
 * What this test must know about the application.
 */
const APP = {
  title: 'Meridian',
  darkTheme: 'Meridian Dark',
  lightTheme: 'Meridian Light',
  welcome: '.mrd-Welcome',
  pythonFile: 'weather/io.py',
  secondFile: 'weather/stats.py',
  quickOpenText: 'io.py',
  notebook: 'explore.ipynb',
  notebookOutput: 'Brest',
  searchText: 'load_stations',
  views: [
    ['Control+Shift+F', '#jp-search-replace', 'search'],
    ['Control+Shift+G', '#jp-git-sessions', 'Git view'],
    ['Control+Shift+X', '[id="extensionmanager.main-view"]', 'extension manager'],
    ['Control+Shift+E', '#filebrowser', 'file browser']
  ],
  movableView: 'jp-property-inspector'
};

/*
 * Console errors of stock JupyterLab 4.6 that this test also causes there.
 */
const KNOWN_ERRORS = [
  // The debugger asks the kernel for its state while "Close All Tabs" stops the kernel.
  /Could not restore the debugger state/
];

const HANDLES = {
  sideBar: '#jp-main-split-panel > .lm-SplitPanel-handle:not(.lm-mod-hidden)',
  panel: '#jp-main-vsplit-panel > .lm-SplitPanel-handle:not(.lm-mod-hidden)',
  editors: '#jp-main-dock-panel > .lm-DockPanel-handle:not(.lm-mod-hidden)'
};

function options() {
  const values = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    values[argv[i].replace(/^--/, '')] = argv[i + 1];
  }
  return values;
}

function freePort() {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/*
 * Start Meridian on a copy of the demo folder, with a clean user state.
 */
async function startServer(command) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'meridian-smoke-'));
  const root = path.join(work, 'workspace');
  fs.cpSync(path.join(__dirname, '..', 'demo'), root, { recursive: true });
  if (!fs.existsSync(path.join(root, '.git'))) {
    // The Git view needs a repository with one commit and one change.
    const git = (...args) => spawn('git', ['-c', 'user.name=Smoke Test', '-c', 'user.email=smoke@example.org', ...args], { cwd: root, stdio: 'ignore' });
    for (const args of [['init', '-q', '-b', 'main'], ['add', '-A'], ['commit', '-q', '-m', 'Add the demo project']]) {
      await new Promise(resolve => git(...args).on('exit', resolve));
    }
    fs.appendFileSync(path.join(root, 'README.md'), '\nA change that is not committed.\n');
  }
  const port = await freePort();
  const token = 'smoke';
  const args = [
    '--no-browser',
    '--expose-app-in-browser',
    `--port=${port}`,
    '--ServerApp.port_retries=0',
    `--IdentityProvider.token=${token}`,
    `--ServerApp.root_dir=${root}`
  ];
  if (process.getuid && process.getuid() === 0) {
    args.push('--allow-root');
  }
  const log = fs.openSync(path.join(work, 'server.log'), 'w');
  const child = spawn(command, args, {
    cwd: root,
    stdio: ['ignore', log, log],
    env: {
      ...process.env,
      JUPYTERLAB_SETTINGS_DIR: path.join(work, 'settings'),
      JUPYTERLAB_WORKSPACES_DIR: path.join(work, 'workspaces')
    }
  });
  let failure = null;
  const stopped = new Promise(resolve => child.on('exit', resolve));
  child.on('error', error => (failure = error));
  child.on('exit', code => (failure = failure || new Error(`the server stopped with code ${code}`)));
  const stop = async () => {
    child.kill();
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    await stopped;
    clearTimeout(timer);
    fs.rmSync(work, { recursive: true, force: true });
  };
  const url = `http://127.0.0.1:${port}/lab?token=${token}`;
  const limit = Date.now() + 60000;
  for (;;) {
    if (failure || Date.now() > limit) {
      const tail = fs.readFileSync(path.join(work, 'server.log'), 'utf8').trim().split('\n').slice(-5).join('\n');
      const reason = failure ? failure.message : 'the server did not start';
      if (failure) {
        fs.rmSync(work, { recursive: true, force: true });
      } else {
        await stop();
      }
      throw new Error(`${reason}\n${tail}`);
    }
    const ready = await fetch(url).then(response => response.ok).catch(() => false);
    if (ready) {
      return { url, stop };
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/*
 * Open the browser: with no window, or as a window at a given place.
 */
async function openBrowser(opts, url) {
  if (!opts.headed) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    return { page, close: () => browser.close(), resize: (width, height) => page.setViewportSize({ width, height }) };
  }
  const scale = Number(opts.scale || 1);
  const [x, y, width, height] = (opts.window || '0,0,1440,900').split(',').map(Number);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'meridian-smoke-browser-'));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: null,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      `--app=${url}`,
      // The place and the size are in CSS pixels: the scale factor makes the device pixels.
      `--window-position=${Math.round(x / scale)},${Math.round(y / scale)}`,
      `--window-size=${Math.round(width / scale)},${Math.round(height / scale)}`,
      `--force-device-scale-factor=${scale}`,
      '--hide-scrollbars',
      '--no-first-run'
    ]
  });
  const page = context.pages()[0] || (await context.waitForEvent('page'));
  const session = await context.newCDPSession(page);
  const { windowId } = await session.send('Browser.getWindowForTarget');
  const start = await page.evaluate(() => ({ width: window.outerWidth, height: window.outerHeight }));
  return {
    page,
    close: async () => {
      await context.close();
      fs.rmSync(profile, { recursive: true, force: true });
    },
    // A size of zero puts the first size of the window back.
    resize: (w, h) => session.send('Browser.setWindowBounds', { windowId, bounds: { width: w || start.width, height: h || start.height } })
  };
}

async function main() {
  const opts = options();
  const slow = Number(opts.slow || 0);
  const server = opts.url ? { url: opts.url, stop: async () => undefined } : await startServer(opts.meridian || 'meridian');
  const start = `${server.url}${server.url.includes('?') ? '&' : '?'}reset`;
  const browser = await openBrowser(opts, start);
  const page = browser.page;
  const consoleErrors = [];
  page.on('console', message => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', error => consoleErrors.push(String(error)));

  const failures = [];
  let passed = 0;
  const group = name => console.log(`\n${name}`);
  const check = (name, pass, detail = '') => {
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
    if (pass) {
      passed++;
    } else {
      failures.push(name);
    }
  };
  const near = (name, actual, expected) =>
    check(name, Math.abs(actual - expected) <= TOLERANCE, `${Math.round(actual)} px, expected ${Math.round(expected)} px`);
  const settle = (ms = 500) => page.waitForTimeout(ms + slow);
  const visible = selector => page.locator(selector).first().isVisible().catch(() => false);
  const size = () => page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));

  /*
   * Size and position of the first visible element, or zeros.
   */
  const box = async selector => {
    const found = await page.locator(selector).first().boundingBox({ timeout: 2000 }).catch(() => null);
    return found || { x: 0, y: 0, width: 0, height: 0 };
  };
  /*
   * Drag in small steps, as a person does: one large step hides a handle
   * that follows the pointer with a delay.
   */
  const drag = async (selector, dx, dy, index = 0) => {
    const handle = await page.locator(selector).nth(index).boundingBox();
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step++) {
      await page.mouse.move(x + (dx * step) / 10, y + (dy * step) / 10);
      await page.waitForTimeout(20 + slow / 10);
    }
    await page.mouse.up();
    await settle();
  };
  const press = async (keys, ms = 600) => {
    await page.keyboard.press(keys);
    await settle(ms);
  };
  const type = text => page.keyboard.type(text, { delay: slow ? 70 : 0 });
  // A command can return a widget, which the browser cannot send back.
  const run = (id, args) => page.evaluate(([id, args]) => window.jupyterapp.commands.execute(id, args).then(() => null), [id, args]);
  let shots = 0;
  const shot = async name => {
    if (opts.screenshots) {
      fs.mkdirSync(opts.screenshots, { recursive: true });
      await page.screenshot({ path: path.join(opts.screenshots, `${String(++shots).padStart(2, '0')}-${name}.png`) });
    }
  };
  const switchSide = async side => {
    await page.locator(`.jp-SideBar.jp-mod-${side} .lm-TabBar-tab[data-id="${APP.movableView}"]`).click({ button: 'right' });
    await page.locator('.lm-Menu-itemLabel', { hasText: 'Switch Sidebar Side' }).click();
    await settle(1000);
  };

  try {
    if (!opts.headed) {
      await page.goto(start);
    }
    await page.waitForFunction(() => window.jupyterapp, null, { timeout: 60000 });
    await page.evaluate(() => window.jupyterapp.restored);
    await page.locator(APP.welcome).waitFor({ timeout: 30000 });
    await settle(1500);

    group('Start');
    check(`the title is ${APP.title}`, (await page.title()).includes(APP.title));
    check('the Welcome tab shows', await visible(APP.welcome));
    check('the dark theme is the default', (await page.evaluate(() => document.body.dataset.jpThemeName)) === APP.darkTheme, await page.evaluate(() => document.body.dataset.jpThemeName));
    let view = await size();
    let dock = await box('#jp-main-dock-panel');
    near('the editors reach the right edge of the window', dock.x + dock.width, view.width);
    await shot('start');

    group('Files and editor');
    await press('Control+p', 800);
    await type(APP.quickOpenText);
    await settle(900);
    await press('Enter', 2000);
    const tab = await page.evaluate(() => window.jupyterapp.shell.currentWidget && window.jupyterapp.shell.currentWidget.title.label);
    check('Ctrl+P opens a file by its name', path.basename(APP.pythonFile) === tab, String(tab));
    const colors = await page.evaluate(() => new Set(Array.from(document.querySelectorAll('.jp-FileEditor .cm-line span')).map(node => getComputedStyle(node).color)).size);
    check('the Python file has syntax colors', colors >= 3, `${colors} colors`);
    const server = await page.locator('#jp-main-statusbar', { hasText: 'Fully initialized' }).waitFor({ timeout: 45000 }).then(() => true, () => false);
    check('the language server is ready', server);
    for (const keys of ['Control+Shift+P', 'F1']) {
      await press(keys, 800);
      check(`${keys.replace('Control', 'Ctrl')} opens the command palette`, await visible('#command-palette'));
      await press('Escape', 400);
    }
    await shot('editor');

    group('Side bar');
    for (const [keys, selector, name] of APP.views) {
      await press(keys, 900);
      check(`${keys.replace('Control', 'Ctrl')} shows the ${name}`, await visible(selector));
    }
    const sideBar = (await box('#jp-left-stack')).width;
    await drag(HANDLES.sideBar, 120, 0);
    near('divider: 120 px to the right', (await box('#jp-left-stack')).width, sideBar + 120);
    dock = await box('#jp-main-dock-panel');
    near('the editors still reach the right edge', dock.x + dock.width, view.width);
    await drag(HANDLES.sideBar, -120, 0);
    near('divider: 120 px back', (await box('#jp-left-stack')).width, sideBar);
    const before = await box('#jp-main-dock-panel');
    for (const round of [1, 2]) {
      await press('Control+b');
      near(`Ctrl+B hides the side bar (${round})`, (await box('#jp-left-stack')).width, 0);
      await press('Control+b');
      near(`Ctrl+B shows it with the same width (${round})`, (await box('#jp-left-stack')).width, sideBar);
    }
    near('the editors have the same width as before', (await box('#jp-main-dock-panel')).width, before.width);

    group('Panel and terminal');
    await press('Control+`', 500);
    await page.locator('#jp-down-stack .jp-Terminal .xterm-screen').waitFor({ timeout: 15000 });
    await settle(2000);
    check('Ctrl+` opens a terminal in the panel', await visible('#jp-down-stack .jp-Terminal'));
    // The terminal draws on a canvas: read the effect of the command, not the screen.
    await type('echo terminal-$((40+2)) > smoke-terminal.txt');
    await press('Enter', 1500);
    const written = await page.evaluate(() =>
      window.jupyterapp.serviceManager.contents.get('smoke-terminal.txt', { content: true }).then(model => model.content, () => '')
    );
    check('the terminal runs a command', written.includes('terminal-42'), written.trim());
    const panel = (await box('#jp-down-stack')).height;
    const screen = (await box('#jp-down-stack .xterm-screen')).height;
    await drag(HANDLES.panel, 0, -150);
    near('divider: 150 px up', (await box('#jp-down-stack')).height, panel + 150);
    const grown = (await box('#jp-down-stack .xterm-screen')).height - screen;
    check('the terminal takes the new room', grown >= 100, `${Math.round(grown)} px more`);
    await shot('panel');
    await drag(HANDLES.panel, 0, 150);
    near('divider: 150 px back', (await box('#jp-down-stack')).height, panel);
    for (const round of [1, 2]) {
      await press('Control+j');
      near(`Ctrl+J hides the panel (${round})`, (await box('#jp-down-stack')).height, 0);
      await press('Control+j');
      near(`Ctrl+J shows it with the same height (${round})`, (await box('#jp-down-stack')).height, panel);
    }
    await press('Control+j');

    group('Editors side by side');
    await run('docmanager:open', { path: APP.secondFile, options: { mode: 'split-right' } });
    await settle(1500);
    const editor = '#jp-main-dock-panel > .lm-DockPanel-widget:not(.lm-mod-hidden)';
    const first = (await box(editor)).width;
    await drag(HANDLES.editors, -100, 0);
    near('divider: 100 px to the left', (await box(editor)).width, first - 100);
    await shot('editors');

    group('Notebook');
    await run('docmanager:open', { path: APP.notebook });
    await page.locator('.jp-NotebookPanel:not(.lm-mod-hidden) .jp-Cell').first().waitFor({ timeout: 15000 });
    await settle(1500);
    await run('notebook:run-all-cells');
    const output = page.locator('.jp-NotebookPanel:not(.lm-mod-hidden) .jp-OutputArea-output', { hasText: APP.notebookOutput }).first();
    const ran = await output.waitFor({ timeout: 60000 }).then(() => true).catch(() => false);
    check('Run All gives the output of the cells', ran);
    await settle(800);
    await shot('notebook');

    group('Search and Git');
    // The search reads the files on the disk: save the notebook first.
    await run('docmanager:save-all');
    await press('Control+Shift+F', 1000);
    await type(APP.searchText);
    await press('Enter', 2500);
    const hits = await page.locator('#jp-search-replace').innerText().catch(() => '');
    check('the search across files finds the text', hits.includes(path.basename(APP.pythonFile)), hits.split('\n').find(line => /result/i.test(line)) || '');
    await press('Control+Shift+G', 1500);
    const git = await page.locator('#jp-git-sessions').innerText().catch(() => '');
    check('the Git view shows the changed file', /README\.md/.test(git));
    await shot('search-git');
    await press('Control+Shift+E', 800);

    group('Secondary side bar');
    near('no view on the right: no room is taken', (await box('#jp-right-stack')).width, 0);
    await switchSide('left');
    const right = (await box('#jp-right-stack')).width;
    check('Switch Sidebar Side moves a view to the right', right > 0, `${Math.round(right)} px`);
    await drag(HANDLES.sideBar, -80, 0, 1);
    near('right divider: 80 px to the left', (await box('#jp-right-stack')).width, right + 80);
    await shot('right-side-bar');
    await switchSide('right');
    view = await size();
    dock = await box('#jp-main-dock-panel');
    near('the view is back on the left: no room on the right', dock.x + dock.width, view.width);

    group('Settings and Welcome');
    await press('Control+,', 2500);
    check('Ctrl+, opens the settings', await visible('#setting-editor'));
    await run('docmanager:save-all');
    await run('application:close-all');
    await settle(1500);
    check('the Welcome tab comes back when all tabs are closed', await visible(APP.welcome));
    await page.locator(`${APP.welcome} button`, { hasText: 'New Notebook' }).click();
    const created = await page.locator('.jp-NotebookPanel:not(.lm-mod-hidden) .jp-Cell').first().waitFor({ timeout: 20000 }).then(() => true, () => false);
    check('New Notebook of the Welcome tab makes a notebook', created);
    await settle(1000);

    group('Themes');
    await run('apputils:change-theme', { theme: APP.lightTheme });
    await settle(2000);
    check('the light theme applies', (await page.evaluate(() => document.body.dataset.jpThemeLight)) === 'true');
    await shot('light-theme');
    await run('apputils:change-theme', { theme: APP.darkTheme });
    await settle(2000);
    check('the dark theme applies again', (await page.evaluate(() => document.body.dataset.jpThemeLight)) === 'false');

    group('Small window');
    view = await size();
    // A window on a display gets three quarters of its size.
    const small = opts.headed ? [Math.round(view.width * 0.75), Math.round(view.height * 0.75)] : [1100, 700];
    await browser.resize(...small);
    await settle(1200);
    view = await size();
    dock = await box('#jp-main-dock-panel');
    const status = await box('#jp-main-statusbar');
    near('the editors reach the right edge', dock.x + dock.width, view.width);
    near('the status bar is at the bottom', status.y + status.height, view.height);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check('the page has no horizontal overflow', overflow <= 0, `${overflow} px`);
    await shot('small-window');
    await browser.resize(opts.headed ? 0 : 1440, opts.headed ? 0 : 900);
    await settle(1200);

    group('Browser console');
    const errors = consoleErrors.filter(text => !KNOWN_ERRORS.some(pattern => pattern.test(text)));
    const known = consoleErrors.length - errors.length;
    check('no error in the browser console', errors.length === 0, errors.slice(0, 3).join(' | ').slice(0, 300) || (known ? `${known} known message of JupyterLab ignored` : ''));
  } catch (error) {
    check('the test ran to its end', false, String(error.message).split('\n')[0]);
    await shot('failure');
  } finally {
    await settle(slow ? 1500 : 0).catch(() => undefined);
    await browser.close();
    await server.stop();
  }
  console.log(failures.length ? `\n${failures.length} check(s) failed, ${passed} passed` : `\nAll ${passed} checks passed`);
  process.exit(failures.length ? 1 : 0);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
