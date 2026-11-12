#!/usr/bin/env node
/*
 * Open a running JupyterLab in headless Chromium, then report what loaded.
 *
 * The probe reads the live application object (window.jupyterapp), so the
 * server must run with --LabApp.expose_app_in_browser=True.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const HELP = `Usage: node jlab_probe.cjs --url <lab url with token> [options]

Output
  --screenshot <file.png>      save a screenshot (after --exec and --wait)
  --dump <file.json>           save plugins, commands, shell widgets, menus, settings
  --full                       print the full dump on stdout, not the summary
  --dependents <plugin id>     print the plugins that need this plugin (or package), then exit

Actions (in the given order, before the checks and the screenshot)
  --exec <command[:json]>      run an application command, with optional JSON args
  --click <css selector>       click an element
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
  --expect-setting <id>:<key>=<json>   the composite value of a setting
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
    'dependents'
  ]);
  const flags = new Set(['full', 'fail-on-console-error', 'help']);
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
    } else if (['exec', 'click', 'eval'].includes(key)) {
      options.actions.push({ type: key, value });
    } else if (key.startsWith('expect-')) {
      options.checks.push({ type: key.slice('expect-'.length), value });
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
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
    const response = await fetch(`${config.baseUrl}lab/api/settings${token}`);
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
    } else if (type === 'setting') {
      const match = /^(.+?):([^:=]+)=(.*)$/.exec(value);
      if (!match) {
        ok = false;
        detail = 'format is <plugin id>:<key>=<json>';
      } else {
        const [, id, key, raw] = match;
        const actual = await page.evaluate(
          async ([pluginId, settingKey]) => {
            const config = JSON.parse(
              document.getElementById('jupyter-config-data').textContent
            );
            const token = config.token ? `?token=${config.token}` : '';
            const response = await fetch(
              `${config.baseUrl}lab/api/settings/${pluginId}${token}`
            );
            if (!response.ok) {
              return { error: `HTTP ${response.status}` };
            }
            const data = await response.json();
            const user = data.settings || {};
            if (settingKey in user) {
              return { value: user[settingKey] };
            }
            const property = (data.schema.properties || {})[settingKey];
            return { value: property ? property.default : undefined };
          },
          [id, key]
        );
        let expected;
        try {
          expected = JSON.parse(raw);
        } catch (error) {
          expected = raw;
        }
        ok =
          !actual.error &&
          JSON.stringify(actual.value) === JSON.stringify(expected);
        detail = actual.error || `value is ${JSON.stringify(actual.value)}`;
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
  if (options.help || !options.url) {
    console.log(HELP);
    process.exit(options.help ? 0 : 2);
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
        // The result of a command can be a widget: do not return it.
        await page.evaluate(
          async ([commandId, commandArgs]) => {
            await window.jupyterapp.commands.execute(commandId, commandArgs);
          },
          [id, args]
        );
      } else if (action.type === 'click') {
        await page.click(action.value);
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
