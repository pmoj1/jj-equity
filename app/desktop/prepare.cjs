const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const { buildPaths } = require('./build-paths.cjs');
const { sourceFilter } = require('./source-files.cjs');

async function main() {
  const paths = buildPaths();
  const appRoot = paths.appRoot;
  const dest = paths.runtimeRoot;
  const standalone = path.join(appRoot, 'web/.next/standalone');
  const nested = fs.existsSync(path.join(standalone, 'web/server.js'));
  if (!nested && !fs.existsSync(path.join(standalone, 'server.js'))) throw new Error('The standalone web build is missing. Run npm run build before desktop preparation.');
  for (const required of [path.join(appRoot, 'web/.next/static'), paths.intelligenceDependencies, path.join(paths.intelligenceSource, 'src-tauri/sidecar/local-api-server.mjs')]) {
    if (!fs.existsSync(required)) throw new Error(`Required build input is missing: ${required}. Run the corresponding build step first.`);
  }
  const sqliteRoot = path.dirname(require.resolve('better-sqlite3/package.json', { paths: [appRoot] }));
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.join(dest, 'api'), { recursive: true });
  fs.copyFileSync(process.execPath, path.join(dest, 'node'));
  fs.chmodSync(path.join(dest, 'node'), 0o755);
  await build({ entryPoints: [path.join(appRoot, 'server/src/index.ts')], outfile: path.join(dest, 'api/index.mjs'), bundle: true, platform: 'node', format: 'esm', external: ['better-sqlite3'], banner: {js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);"} });
  fs.cpSync(sqliteRoot, path.join(dest, 'node_modules/better-sqlite3'), { recursive: true, filter: sourceFilter(sqliteRoot) });
  // Normalize both supported Next.js standalone layouts to one launch path.
  const webDest = path.join(dest, 'web');
  fs.cpSync(standalone, nested ? webDest : path.join(webDest, 'web'), { recursive: true, dereference: true });
  fs.rmSync(path.join(webDest, 'data'), { recursive: true, force: true });
  fs.rmSync(path.join(webDest, 'web/data'), { recursive: true, force: true });
  fs.cpSync(path.join(appRoot, 'web/.next/static'), path.join(webDest, 'web/.next/static'), { recursive: true });
  if (fs.existsSync(path.join(appRoot, 'web/public'))) fs.cpSync(path.join(appRoot, 'web/public'), path.join(webDest, 'web/public'), { recursive: true });
  const wmDest = path.join(dest, 'worldmonitor');
  fs.mkdirSync(wmDest, { recursive: true });
  for (const folder of ['api', 'shared', 'data']) {
    const source = path.join(paths.intelligenceSource, folder);
    const safeSource = sourceFilter(source);
    fs.cpSync(source, path.join(wmDest, folder), { recursive: true, filter: file => safeSource(file) && !/\.(test|spec)\.[cm]?[jt]s$/.test(file) && !file.endsWith('.ts') && !file.endsWith('.map') });
  }
  fs.copyFileSync(path.join(paths.intelligenceSource, 'src-tauri/sidecar/local-api-server.mjs'), path.join(wmDest, 'local-api-server.mjs'));
  fs.copyFileSync(path.join(paths.intelligenceSource, 'src-tauri/sidecar/package.json'), path.join(wmDest, 'package.json'));
  fs.copyFileSync(path.join(paths.intelligenceSource, 'LICENSE'), path.join(wmDest, 'LICENSE'));
  fs.copyFileSync(path.join(__dirname, 'intelligence-service.cjs'), path.join(dest, 'intelligence-service.cjs'));
  fs.cpSync(paths.intelligenceDependencies, path.join(wmDest, 'node_modules'), { recursive: true, dereference: true });
  fs.rmSync(path.join(wmDest, 'node_modules/.bin'), {recursive:true,force:true});
  const licences = path.join(dest, 'licences');
  fs.mkdirSync(licences);
  fs.copyFileSync(path.join(appRoot, 'LICENSE'), path.join(licences, 'market-components-MIT.txt'));
  fs.copyFileSync(path.join(paths.intelligenceSource, 'LICENSE'), path.join(licences, 'intelligence-AGPL.txt'));
  fs.copyFileSync(path.join(paths.repositoryRoot, 'SOURCE-NOTICES.md'), path.join(licences, 'SOURCE-NOTICES.md'));
}
main().catch(error => { console.error(error.message); process.exit(1); });
