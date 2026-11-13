#!/usr/bin/env node
/*
 * Smoke test of Meridian: start it, drag each divider, and compare the sizes.
 *
 *   node tests/smoke.cjs [--meridian <command>] [--url <url>] [--screenshots <folder>]
 *
 * With no option, the test starts the `meridian` command of the PATH on a
 * copy of the demo folder. With --url, it uses a server that already runs;
 * that server needs the option --expose-app-in-browser.
 */

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const TOLERANCE = 2;
const HANDLES = {
  sideBar: '#jp-main-split-panel > .lm-SplitPanel-handle:not(.lm-mod-hidden)',
  panel: '#jp-main-vsplit-panel > .lm-SplitPanel-handle:not(.lm-mod-hidden)',
  editors: '#jp-main-dock-panel > .lm-DockPanel-handle:not(.lm-mod-hidden)',
  sections: '#filebrowser .lm-AccordionPanel > .lm-SplitPanel-handle:not(.lm-mod-hidden)'
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
      const log = fs.readFileSync(path.join(work, 'server.log'), 'utf8').trim().split('\n').slice(-5).join('\n');
      const reason = failure ? failure.message : 'the server did not start';
      if (failure) {
        fs.rmSync(work, { recursive: true, force: true });
      } else {
        await stop();
      }
      throw new Error(`${reason}\n${log}`);
    }
    const ready = await fetch(url).then(response => response.ok).catch(() => false);
    if (ready) {
      return { url, stop };
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function main() {
  const opts = options();
  const server = opts.url ? { url: opts.url, stop: async () => undefined } : await startServer(opts.meridian || 'meridian');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', message => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', error => consoleErrors.push(String(error)));

  const failures = [];
  const check = (name, pass, detail = '') => {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
    if (!pass) {
      failures.push(name);
    }
  };
  const near = (name, actual, expected) =>
    check(name, Math.abs(actual - expected) <= TOLERANCE, `${Math.round(actual)} px, expected ${Math.round(expected)} px`);
  const settle = (ms = 500) => page.waitForTimeout(ms);

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
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await settle();
  };
  const run = (id, args) => page.evaluate(([id, args]) => window.jupyterapp.commands.execute(id, args), [id, args]);
  let shots = 0;
  const shot = async name => {
    if (opts.screenshots) {
      fs.mkdirSync(opts.screenshots, { recursive: true });
      await page.screenshot({ path: path.join(opts.screenshots, `${String(++shots).padStart(2, '0')}-${name}.png`) });
    }
  };
  const switchSide = async side => {
    await page.locator(`.jp-SideBar.jp-mod-${side} .lm-TabBar-tab[data-id="jp-property-inspector"]`).click({ button: 'right' });
    await page.locator('.lm-Menu-itemLabel', { hasText: 'Switch Sidebar Side' }).click();
    await settle(1000);
  };

  try {
    await page.goto(`${server.url}${server.url.includes('?') ? '&' : '?'}reset`);
    await page.waitForFunction(() => window.jupyterapp, null, { timeout: 60000 });
    await page.evaluate(() => window.jupyterapp.restored);
    await page.locator('.meridian-Welcome').waitFor({ timeout: 30000 });
    await settle(1500);

    // Start.
    check('the title is Meridian', (await page.title()).includes('Meridian'));
    const view = page.viewportSize();
    let dock = await box('#jp-main-dock-panel');
    near('the editors reach the right edge of the window', dock.x + dock.width, view.width);
    await shot('start');

    // Side bar.
    await run('docmanager:open', { path: 'solartime/equation.py' });
    await settle(1500);
    const sideBar = (await box('#jp-left-stack')).width;
    await drag(HANDLES.sideBar, 120, 0);
    near('side bar divider: 120 px to the right', (await box('#jp-left-stack')).width, sideBar + 120);
    dock = await box('#jp-main-dock-panel');
    near('the editors still reach the right edge', dock.x + dock.width, view.width);
    await drag(HANDLES.sideBar, -120, 0);
    near('side bar divider: 120 px back', (await box('#jp-left-stack')).width, sideBar);

    // Panel.
    await page.keyboard.press('Control+`');
    await page.locator('#jp-down-stack .jp-Terminal .xterm-screen').waitFor({ timeout: 15000 });
    await settle(1500);
    const panel = (await box('#jp-down-stack')).height;
    const screen = (await box('#jp-down-stack .xterm-screen')).height;
    await drag(HANDLES.panel, 0, -150);
    near('panel divider: 150 px up', (await box('#jp-down-stack')).height, panel + 150);
    const grown = (await box('#jp-down-stack .xterm-screen')).height - screen;
    check('the terminal takes the new room', grown >= 100, `${Math.round(grown)} px more`);
    await shot('panel');
    await drag(HANDLES.panel, 0, 150);
    near('panel divider: 150 px back', (await box('#jp-down-stack')).height, panel);

    // Editors side by side.
    await run('docmanager:open', { path: 'solartime/places.py', options: { mode: 'split-right' } });
    await settle(1500);
    const editor = '#jp-main-dock-panel > .lm-DockPanel-widget:not(.lm-mod-hidden)';
    const first = (await box(editor)).width;
    await drag(HANDLES.editors, -100, 0);
    near('editor divider: 100 px to the left', (await box(editor)).width, first - 100);
    await shot('editors');

    // Sections of the Explorer.
    await run('meridian-lab:show-outline');
    await settle(800);
    const outline = (await box('#table-of-contents')).height;
    check('the Outline section is open', outline > 0, `${Math.round(outline)} px`);
    await drag(HANDLES.sections, 0, -100);
    near('section divider: 100 px up', (await box('#table-of-contents')).height, outline + 100);
    await shot('sections');

    // Keys that hide and show.
    const before = await box('#jp-main-dock-panel');
    await page.keyboard.press('Control+b');
    await settle();
    near('Ctrl+B hides the side bar', (await box('#jp-main-dock-panel')).width, before.width + sideBar + 1);
    await page.keyboard.press('Control+b');
    await settle();
    near('Ctrl+B shows it with the same width', (await box('#jp-left-stack')).width, sideBar);
    await page.keyboard.press('Control+j');
    await settle();
    near('Ctrl+J hides the panel', (await box('#jp-down-stack')).height, 0);
    await page.keyboard.press('Control+j');
    await settle();
    near('Ctrl+J shows it with the same height', (await box('#jp-down-stack')).height, panel);

    // Secondary side bar.
    near('no view on the right: no room is taken', (await box('#jp-right-stack')).width, 0);
    await switchSide('left');
    const right = (await box('#jp-right-stack')).width;
    check('Switch Sidebar Side moves a view to the right', right > 0, `${Math.round(right)} px`);
    await drag(HANDLES.sideBar, -80, 0, 1);
    near('right divider: 80 px to the left', (await box('#jp-right-stack')).width, right + 80);
    await shot('right-side-bar');
    await run('application:toggle-right-area');
    await settle();
    const bar = await box('.jp-SideBar.jp-mod-right');
    dock = await box('#jp-main-dock-panel');
    near('the closed right side bar leaves no gap', dock.x + dock.width, bar.x);
    await switchSide('right');
    dock = await box('#jp-main-dock-panel');
    near('the view is back on the left: no room on the right', dock.x + dock.width, view.width);

    // Window size.
    await page.setViewportSize({ width: 1100, height: 700 });
    await settle(800);
    dock = await box('#jp-main-dock-panel');
    const status = await box('#jp-main-statusbar');
    near('small window: the editors reach the right edge', dock.x + dock.width, 1100);
    near('small window: the status bar is at the bottom', status.y + status.height, 700);
    const menus = await box('#jp-MainMenu .lm-MenuBar-content');
    const field = await box('.meridian-CommandCenter');
    check('small window: the command field is clear of the menus', field.width === 0 || field.x >= menus.x + menus.width, `menus end at ${Math.round(menus.x + menus.width)} px, field starts at ${Math.round(field.x)} px`);
    await shot('small-window');

    check('no error in the browser console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 300));
  } catch (error) {
    check('the test ran to its end', false, String(error.message).split('\n')[0]);
    await shot('failure');
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
  process.exit(failures.length ? 1 : 0);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
