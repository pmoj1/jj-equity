const fs = require('node:fs');
const path = require('node:path');
const { execFileSync: run } = require('node:child_process');
const { buildPaths } = require('./build-paths.cjs');
const paths = buildPaths();
const wm = paths.intelligenceSource;
if (!fs.existsSync(path.join(wm, 'package.json'))) throw new Error('Companion intelligence source is missing. Keep worldmonitor/ beside app/ or set JJ_WORLD_MONITOR_SOURCE.');
const options = { cwd: wm, stdio: 'inherit' };
run('npm', ['ci', '--ignore-scripts'], options);
for (const script of ['scripts/generate-inventory-facts.mjs', 'docker/build-handlers.mjs']) run(process.execPath, [script], options);
// J&J Equity consumes native API handlers; the companion Vite UI is not shipped.
// An explicit prepared dependency tree is an input, never an install target.
if (process.env.JJ_WM_RUNTIME_DEPS) {
  if (!fs.existsSync(paths.intelligenceDependencies)) throw new Error('JJ_WM_RUNTIME_DEPS does not point to an existing prepared node_modules directory.');
  console.log('Using the explicitly supplied companion runtime dependencies.');
  process.exit(0);
}
const dependencies = path.join(paths.buildRoot, 'wm-runtime-deps');
fs.mkdirSync(dependencies, { recursive: true });
fs.copyFileSync(path.join(wm, 'docker/runtime-package.json'), path.join(dependencies, 'package.json'));
fs.copyFileSync(path.join(wm, 'docker/runtime-package-lock.json'), path.join(dependencies, 'package-lock.json'));
run('npm', ['ci', '--omit=dev', '--omit=optional', '--ignore-scripts'], { cwd: dependencies, stdio: 'inherit' });
