/*
 * Entry point: load the prebuilt extensions, then the application.
 *
 * This file must not import a shared package: a prebuilt extension can
 * provide a newer copy of one, and the application takes its copy from the
 * shared scope when index.js loads.
 */

const config = JSON.parse(
  document.getElementById('jupyter-config-data').textContent
);

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    script.async = true;
    script.src = url;
    document.head.appendChild(script);
  });
}

/**
 * Load the container of a prebuilt extension and connect it to the shared
 * scope. The bundler replaces the two __webpack_ names.
 */
async function loadContainer({ name, load }) {
  await loadScript(`${config.fullLabextensionsUrl}/${name}/${load}`);
  await __webpack_init_sharing__('default');
  await window._JUPYTERLAB[name].init(__webpack_share_scopes__.default);
}

async function bootstrap() {
  const results = await Promise.allSettled(
    config.federated_extensions.map(loadContainer)
  );
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  }
  const { main } = await import('./index.js');
  if (document.readyState === 'complete') {
    await main();
  } else {
    window.addEventListener('load', main);
  }
}

void bootstrap();
