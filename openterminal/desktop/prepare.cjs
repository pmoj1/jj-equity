const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
async function main() {
  const dest = path.resolve('desktop/runtime');
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.join(dest, 'api'), { recursive: true });
  fs.copyFileSync(process.execPath, path.join(dest, 'node'));
  fs.chmodSync(path.join(dest, 'node'), 0o755);
  await build({ entryPoints: ['server/src/index.ts'], outfile: path.join(dest, 'api/index.mjs'), bundle: true, platform: 'node', format: 'esm', external: ['better-sqlite3'], banner: {js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);"} });
  for(const name of ['better-sqlite3']) fs.cpSync(path.join('node_modules',name), path.join(dest,'node_modules',name), { recursive:true, verbatimSymlinks:true });
  fs.cpSync('web/.next/standalone', path.join(dest, 'web'), { recursive:true, verbatimSymlinks:true });
  fs.rmSync(path.join(dest, 'web/data'), { recursive:true, force:true });
  fs.cpSync('web/.next/static', path.join(dest, 'web/web/.next/static'), { recursive:true, verbatimSymlinks:true });
  if(fs.existsSync('web/public')) fs.cpSync('web/public', path.join(dest, 'web/web/public'), { recursive:true, verbatimSymlinks:true });
  const wm = process.env.JJ_WORLD_MONITOR_SOURCE || path.resolve('../worldmonitor');
  const wmDest = path.join(dest, 'worldmonitor');
  fs.mkdirSync(wmDest, { recursive:true });
  for(const folder of ['api', 'shared', 'data']) fs.cpSync(path.join(wm, folder), path.join(wmDest, folder), { recursive:true, verbatimSymlinks:true, filter: source => !/\.(test|spec)\.[cm]?[jt]s$/.test(source) && !source.endsWith('.ts') && !source.endsWith('.map') });
  fs.copyFileSync(path.join(wm,'src-tauri/sidecar/local-api-server.mjs'), path.join(wmDest,'local-api-server.mjs'));
  fs.copyFileSync(path.join(wm,'src-tauri/sidecar/package.json'), path.join(wmDest,'package.json'));
  fs.copyFileSync(path.join(wm,'LICENSE'), path.join(wmDest,'LICENSE'));
  fs.copyFileSync('desktop/intelligence-service.cjs', path.join(dest,'intelligence-service.cjs'));
  const runtimeDeps = process.env.JJ_WM_RUNTIME_DEPS || path.resolve('../work/wm-runtime-deps/node_modules');
  fs.cpSync(runtimeDeps, path.join(wmDest,'node_modules'), { recursive:true, verbatimSymlinks:true });
  fs.rmSync(path.join(wmDest,'node_modules/.bin'), {recursive:true,force:true});
  fs.copyFileSync('LICENSE', path.join(dest,'OpenTerminal-LICENSE'));
}
main().catch(error => { console.error(error); process.exit(1); });
