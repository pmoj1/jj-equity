const fs = require('node:fs');
const path = require('node:path');
const { buildPaths } = require('./build-paths.cjs');
const { appRoot } = buildPaths();
const dest = path.join(appRoot, 'web/public/maplibre');
fs.mkdirSync(dest, { recursive: true });
const source = path.dirname(require.resolve('maplibre-gl/package.json', { paths: [appRoot] }));
for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) fs.copyFileSync(path.join(source, 'dist', name), path.join(dest, name));
fs.copyFileSync(path.join(source, 'LICENSE.txt'), path.join(dest, 'LICENSE.txt'));
