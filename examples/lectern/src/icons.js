import { LabIcon } from '@jupyterlab/ui-components';

const svg = body =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;

const line =
  'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

export const brandIcon = new LabIcon({
  name: 'lectern:brand',
  svgstr: svg(
    '<path fill="currentColor" d="M2.5 4.6 13.5 2.6v3.2L2.5 7.8z"/>' +
      '<path fill="currentColor" d="M7.2 7.2h1.6v6H7.2z"/>' +
      '<rect fill="currentColor" x="4.5" y="12.6" width="7" height="1.6" rx=".8"/>'
  )
});

export const previousIcon = new LabIcon({
  name: 'lectern:previous',
  svgstr: svg(`<path ${line} d="M10 3.5 5.5 8l4.5 4.5"/>`)
});

export const nextIcon = new LabIcon({
  name: 'lectern:next',
  svgstr: svg(`<path ${line} d="M6 3.5 10.5 8 6 12.5"/>`)
});

export const runAllIcon = new LabIcon({
  name: 'lectern:run-all',
  svgstr: svg('<path fill="currentColor" d="M2.5 3.2v9.6L8 8zM8.3 3.2v9.6L13.8 8z"/>')
});

export const resetIcon = new LabIcon({
  name: 'lectern:reset',
  svgstr: svg(
    `<path ${line} d="M3.6 8.6a4.5 4.5 0 1 0 1.3-4.1"/>` +
      '<path fill="currentColor" d="M2.6 2.2v4.2h4.2z"/>'
  )
});

export const textIcon = new LabIcon({
  name: 'lectern:text',
  svgstr: svg(
    `<rect ${line} x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/>` +
      `<path ${line} d="M7 3v10M3.8 6.2h1.4M3.8 8.4h1.4M3.8 10.6h1.4"/>`
  )
});
