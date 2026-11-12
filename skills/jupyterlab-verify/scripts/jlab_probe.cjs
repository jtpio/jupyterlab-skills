#!/usr/bin/env node
/*
 * Open a running JupyterLab in headless Chromium, then report what loaded.
 *
 * The probe reads the live application object (window.jupyterapp), so the
 * server must run with --LabApp.expose_app_in_browser=True.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const HELP = `Usage: node jlab_probe.cjs [--server <name> | --url <lab url with token>] [options]

Target
  --server <name>              a server that jlab_server.py started (default: "default")
  --url <url>                  any JupyterLab URL, with its token
  --keep-workspace             keep the tabs of the last run (default: start from a clean workspace)

Output
  --screenshot <file.png>      save a screenshot (after --exec and --wait)
  --dump <file.json>           save plugins, commands, shell widgets, menus, settings
  --full                       print the full dump on stdout, not the summary
  --dependents <plugin id>     print the plugins that need this plugin (or package), then exit

Actions (in the given order, before the checks and the screenshot)
  --exec <command[:json]>      run an application command, with optional JSON args
  --click <css selector>       click the first visible element that matches
  --press <keys>               press a key or a chord, for example Control+Shift+P or Escape
  --type <text>                type text into the focused element
  --activate <widget id>       show a widget: open its sidebar or select its tab
  --pause <ms>                 wait between two actions
  --eval <javascript>          evaluate an expression in the page (app = window.jupyterapp)
  --wait <ms>                  wait after the actions (default 500)

Checks (each can repeat; exit code 1 when one fails)
  --expect-plugin <id>         the plugin is registered
  --expect-no-plugin <id>      the plugin is not registered (it is disabled)
  --expect-command <id>        the command exists
  --expect-no-command <id>     the command does not exist
  --expect-selector <css>      at least one visible element matches
  --expect-no-selector <css>   no visible element matches
  --expect-title <text>        the page title contains the text
  --expect-theme <name>        the active theme has this name
  --expect-setting <id>:<key>=<json>   the value in effect of a setting. <key> can be a
                               path (codeCellConfig.lineNumbers). An object matches when
                               the setting has at least its keys and values
  --expect-eval <javascript>   the expression is true in the page (app = window.jupyterapp)
  --fail-on-console-error      console errors and page errors fail the run

Browser
  --viewport <WxH>             default 1440x900
  --scale <n>                  device scale factor, default 1 (use 2 for sharp images)
  --color-scheme <light|dark>  preferred color scheme of the browser
  --timeout <ms>               time limit for the application to start (default 60000)
`;

function parseArgs(argv) {
  const single = new Set([
    'url',
    'screenshot',
    'dump',
    'wait',
    'viewport',
    'scale',
    'color-scheme',
    'timeout',
    'dependents',
    'server'
  ]);
  const flags = new Set(['full', 'fail-on-console-error', 'help', 'keep-workspace']);
  const options = { actions: [], checks: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (flags.has(key)) {
      options[key] = true;
      continue;
    }
    const value = argv[++i];
    if (value === undefined) {
      throw new Error(`Missing value for ${arg}`);
    }
    if (single.has(key)) {
      options[key] = value;
    } else if (['exec', 'click', 'eval', 'press', 'type', 'activate', 'pause'].includes(key)) {
      options.actions.push({ type: key, value });
    } else if (key.startsWith('expect-')) {
      options.checks.push({ type: key.slice('expect-'.length), value });
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

/*
 * Read the URL of a server that jlab_server.py started.
 */
function serverUrl(name) {
  const file = path.join(os.tmpdir(), 'jlab-verify', `${name}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')).url;
}

/*
 * Add the "reset" parameter: JupyterLab then ignores the saved workspace.
 */
function withReset(url) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has('reset')) {
    parsed.searchParams.append('reset', '');
  }
  return parsed.toString().replace('reset=', 'reset');
}

/*
 * Tell if `actual` has the keys and values of `expected`.
 */
function contains(actual, expected) {
  if (expected === null || typeof expected !== 'object' || Array.isArray(expected)) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  if (actual === null || typeof actual !== 'object') {
    return false;
  }
  return Object.keys(expected).every(key => contains(actual[key], expected[key]));
}

function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try {
      return require(name);
    } catch (error) {
      // Try the next package name.
    }
  }
  console.error(
    'Playwright is not installed. Install it with:\n' +
      '  npm install --no-save playwright && npx playwright install chromium'
  );
  process.exit(2);
}

/*
 * Runs in the page. Collects the state of the application.
 */
async function collect() {
  const app = window.jupyterapp;
  const config = JSON.parse(
    document.getElementById('jupyter-config-data').textContent
  );
  // The registry is private API, but it is the only source of the tokens.
  const registry = app.pluginRegistry && app.pluginRegistry._plugins;
  const tokenNames = tokens => (tokens || []).map(token => token.name);
  const plugins = app.listPlugins().map(id => {
    const data = registry ? registry.get(id) : null;
    return {
      id,
      activated: app.isPluginActivated(id),
      description: app.getPluginDescription ? app.getPluginDescription(id) : '',
      provides: data && data.provides ? data.provides.name : null,
      requires: data ? tokenNames(data.requires) : [],
      optional: data ? tokenNames(data.optional) : []
    };
  });
  const commands = app.commands.listCommands().map(id => {
    let label = '';
    let caption = '';
    try {
      label = app.commands.label(id);
      caption = app.commands.caption(id);
    } catch (error) {
      // Some labels need arguments.
    }
    return { id, label, caption };
  });
  const shell = {};
  for (const area of ['top', 'menu', 'left', 'right', 'main', 'down', 'bottom', 'header']) {
    try {
      shell[area] = Array.from(app.shell.widgets(area)).map(widget => ({
        id: widget.id,
        label: widget.title.label,
        caption: widget.title.caption,
        visible: widget.isVisible
      }));
    } catch (error) {
      shell[area] = [];
    }
  }
  const menus = Array.from(
    document.querySelectorAll('#jp-MainMenu .lm-MenuBar-itemLabel, #jp-menu-panel .lm-MenuBar-itemLabel')
  ).map(node => node.textContent);
  const shortcuts = app.commands.keyBindings.map(binding => ({
    command: binding.command,
    keys: binding.keys,
    selector: binding.selector
  }));
  let settings = [];
  try {
    const token = config.token ? `?token=${config.token}` : '';
    // A remix serves the settings below its own URL.
    const response = await fetch(`${config.fullSettingsUrl}${token}`);
    const data = await response.json();
    settings = data.settings.map(item => ({
      id: item.id,
      title: item.schema.title,
      properties: Object.keys(item.schema.properties || {})
    }));
  } catch (error) {
    settings = [];
  }
  const themeLink = document.body.dataset.jpThemeName || '';
  return {
    title: document.title,
    appName: config.appName,
    appVersion: config.appVersion,
    theme: themeLink,
    themeLight: document.body.dataset.jpThemeLight,
    mode: app.shell.mode,
    disabledExtensions: config.disabledExtensions,
    federatedExtensions: (config.federated_extensions || []).map(ext => ext.name),
    pageConfig: config,
    plugins,
    commands,
    shell,
    menus,
    shortcuts,
    settings
  };
}

/*
 * Plugins that stop to work when the given plugin is disabled.
 */
function dependents(state, target) {
  const byId = new Map(state.plugins.map(plugin => [plugin.id, plugin]));
  const roots = state.plugins.filter(
    plugin => plugin.id === target || plugin.id.split(':')[0] === target
  );
  const broken = new Map();
  const queue = roots.slice();
  while (queue.length) {
    const current = queue.shift();
    if (!current.provides) {
      continue;
    }
    for (const plugin of state.plugins) {
      if (plugin.requires.includes(current.provides) && !broken.has(plugin.id)) {
        if (roots.includes(plugin)) {
          continue;
        }
        broken.set(plugin.id, current.provides);
        queue.push(plugin);
      }
    }
  }
  const tokens = roots.map(plugin => plugin.provides).filter(Boolean);
  const degraded = state.plugins
    .filter(
      plugin =>
        !roots.includes(plugin) &&
        !broken.has(plugin.id) &&
        plugin.optional.some(token => tokens.includes(token))
    )
    .map(plugin => plugin.id);
  return {
    target,
    found: roots.map(plugin => plugin.id),
    provides: tokens,
    failToActivate: Array.from(broken, ([id, token]) => ({ id, missing: token })),
    loseOptionalFeature: degraded,
    known: roots.length > 0 && byId.size > 0
  };
}

async function runChecks(page, state, checks) {
  const failures = [];
  const pluginIds = new Set(state.plugins.map(plugin => plugin.id));
  const commandIds = new Set(state.commands.map(command => command.id));
  const visibleCount = selector =>
    page.evaluate(sel => {
      return Array.from(document.querySelectorAll(sel)).filter(node => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none'
        );
      }).length;
    }, selector);
  for (const check of checks) {
    const { type, value } = check;
    let ok = true;
    let detail = '';
    if (type === 'plugin') {
      ok = pluginIds.has(value);
    } else if (type === 'no-plugin') {
      ok = !pluginIds.has(value);
    } else if (type === 'command') {
      ok = commandIds.has(value);
    } else if (type === 'no-command') {
      ok = !commandIds.has(value);
    } else if (type === 'selector') {
      ok = (await visibleCount(value)) > 0;
    } else if (type === 'no-selector') {
      const count = await visibleCount(value);
      ok = count === 0;
      detail = `${count} visible`;
    } else if (type === 'title') {
      ok = state.title.includes(value);
      detail = `title is "${state.title}"`;
    } else if (type === 'theme') {
      ok = state.theme === value;
      detail = `theme is "${state.theme}"`;
    } else if (type === 'eval') {
      try {
        const result = await page.evaluate(source => {
          const app = window.jupyterapp;
          return Promise.resolve(eval(source)).then(value => !!value);
        }, value);
        ok = result === true;
        detail = 'the expression is not true';
      } catch (error) {
        ok = false;
        detail = error.message.split('\n')[0];
      }
    } else if (type === 'setting') {
      const match = /^(.+?):([^:=]+)=(.*)$/.exec(value);
      if (!match) {
        ok = false;
        detail = 'format is <plugin id>:<key>=<json>';
      } else {
        const [, id, keyPath, raw] = match;
        const [key, ...rest] = keyPath.split('.');
        const actual = await page.evaluate(
          async ([pluginId, settingKey]) => {
            const config = JSON.parse(
              document.getElementById('jupyter-config-data').textContent
            );
            const token = config.token ? `?token=${config.token}` : '';
            const response = await fetch(
              `${config.fullSettingsUrl}/${pluginId}${token}`
            );
            if (!response.ok) {
              return { error: `HTTP ${response.status}` };
            }
            const data = await response.json();
            const user = data.settings || {};
            const property = (data.schema.properties || {})[settingKey];
            const fallback = property ? property.default : undefined;
            if (!(settingKey in user)) {
              return { value: fallback };
            }
            // An object of the user settings completes the default object.
            const both =
              user[settingKey] && fallback && typeof fallback === 'object' &&
              !Array.isArray(fallback) && typeof user[settingKey] === 'object';
            return { value: both ? { ...fallback, ...user[settingKey] } : user[settingKey] };
          },
          [id, key]
        );
        let expected;
        try {
          expected = JSON.parse(raw);
        } catch (error) {
          expected = raw;
        }
        let current = actual.value;
        for (const part of rest) {
          current = current === null || current === undefined ? undefined : current[part];
        }
        ok = !actual.error && contains(current, expected);
        detail = actual.error || `value is ${JSON.stringify(current)}`;
      }
    } else {
      ok = false;
      detail = 'unknown check';
    }
    if (!ok) {
      failures.push(`expect-${type} ${value}${detail ? ` (${detail})` : ''}`);
    }
  }
  return failures;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (options.url === '') {
    console.error('error: --url is empty. Pass the "url" that jlab_server.py printed, or use --server <name>.');
    process.exit(2);
  }
  if (!options.url) {
    const name = options.server || 'default';
    options.url = serverUrl(name);
    if (!options.url) {
      console.error(
        `error: no server named "${name}". Start one with jlab_server.py, or pass --url.\n` +
          'Run with --help for the options.'
      );
      process.exit(2);
    }
  }
  if (!options['keep-workspace']) {
    options.url = withReset(options.url);
  }
  const { chromium } = loadPlaywright();
  const [width, height] = (options.viewport || '1440x900').split('x').map(Number);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: Number(options.scale || 1),
    colorScheme: options['color-scheme'] || 'light'
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  // Keep the first line only: the stack traces of the minified bundle are noise.
  const record = (list, text) => {
    const line = text.split('\n')[0].slice(0, 400);
    if (!list.includes(line)) {
      list.push(line);
    }
  };
  page.on('console', message => {
    if (message.type() === 'error') {
      record(consoleErrors, message.text());
    } else if (message.type() === 'warning') {
      record(consoleWarnings, message.text());
    }
  });
  page.on('pageerror', error => record(consoleErrors, `pageerror: ${error.message}`));

  const timeout = Number(options.timeout || 60000);
  let exitCode = 0;
  try {
    await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForFunction(() => !!window.jupyterapp, null, { timeout }).catch(() => {
      throw new Error(
        'window.jupyterapp is missing. Start the server with ' +
          '--LabApp.expose_app_in_browser=True (jlab_server.py does this).'
      );
    });
    await page.evaluate(() => window.jupyterapp.restored);
    // The splash screen hides the shell while the layout is restored.
    await page
      .waitForSelector('#jupyterlab-splash', { state: 'detached', timeout: 15000 })
      .catch(() => undefined);
    await page.waitForTimeout(500);

    for (const action of options.actions) {
      if (action.type === 'exec') {
        const index = action.value.indexOf(':{');
        const id = index === -1 ? action.value : action.value.slice(0, index);
        const args = index === -1 ? {} : JSON.parse(action.value.slice(index + 1));
        // The result of a command can be a widget: do not return it. A command
        // that opens a dialog resolves only when the dialog closes: do not wait.
        const finished = await page.evaluate(
          async ([commandId, commandArgs]) => {
            const done = window.jupyterapp.commands
              .execute(commandId, commandArgs)
              .then(() => true);
            const timeout = new Promise(resolve => setTimeout(() => resolve(false), 5000));
            return Promise.race([done, timeout]);
          },
          [id, args]
        );
        if (!finished) {
          console.error(`exec: ${id} did not finish in 5 s (an open dialog?). The probe continues.`);
        }
      } else if (action.type === 'click') {
        // Hidden copies of an element exist in the tabs that are not active.
        await page.locator(action.value).locator('visible=true').first().click();
      } else if (action.type === 'press') {
        await page.keyboard.press(action.value);
      } else if (action.type === 'type') {
        await page.keyboard.type(action.value);
      } else if (action.type === 'pause') {
        await page.waitForTimeout(Number(action.value));
      } else if (action.type === 'activate') {
        await page.evaluate(id => window.jupyterapp.shell.activateById(id), action.value);
      } else if (action.type === 'eval') {
        const result = await page.evaluate(
          source => {
            const app = window.jupyterapp;
            return Promise.resolve(eval(source)).then(value => {
              try {
                return JSON.parse(JSON.stringify(value === undefined ? null : value));
              } catch (error) {
                return String(value);
              }
            });
          },
          action.value
        );
        console.error(`eval: ${JSON.stringify(result)}`);
      }
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(Number(options.wait || 500));

    const state = await page.evaluate(collect);
    state.consoleErrors = consoleErrors;
    state.consoleWarnings = consoleWarnings;

    if (options.dependents) {
      console.log(JSON.stringify(dependents(state, options.dependents), null, 2));
      await browser.close();
      process.exit(0);
    }

    const failures = await runChecks(page, state, options.checks);
    if (options['fail-on-console-error'] && consoleErrors.length) {
      failures.push(`${consoleErrors.length} console error(s)`);
    }

    if (options.screenshot) {
      fs.mkdirSync(path.dirname(path.resolve(options.screenshot)), { recursive: true });
      await page.screenshot({ path: options.screenshot });
    }
    if (options.dump) {
      fs.mkdirSync(path.dirname(path.resolve(options.dump)), { recursive: true });
      fs.writeFileSync(options.dump, JSON.stringify(state, null, 2));
    }

    const summary = options.full
      ? state
      : {
          title: state.title,
          appName: state.appName,
          appVersion: state.appVersion,
          theme: state.theme,
          mode: state.mode,
          plugins: state.plugins.length,
          commands: state.commands.length,
          federatedExtensions: state.federatedExtensions,
          disabledExtensions: state.disabledExtensions,
          menus: state.menus,
          shell: Object.fromEntries(
            Object.entries(state.shell).map(([area, widgets]) => [
              area,
              widgets.map(widget => widget.id)
            ])
          ),
          consoleErrors,
          screenshot: options.screenshot || null,
          dump: options.dump || null,
          failures
        };
    console.log(JSON.stringify(summary, null, 2));
    if (failures.length) {
      exitCode = 1;
    }
  } catch (error) {
    console.error(`Probe failed: ${error.message}`);
    if (consoleErrors.length) {
      console.error(`Console errors:\n${consoleErrors.join('\n')}`);
    }
    exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
}

main();
