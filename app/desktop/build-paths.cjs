const path = require('node:path');

function buildPaths(env = process.env, appRoot = path.resolve(__dirname, '..')) {
  const repositoryRoot = path.dirname(appRoot);
  const buildRoot = path.resolve(env.JJ_BUILD_DIR || path.join(repositoryRoot, '.jj-build'));
  return {
    appRoot,
    repositoryRoot,
    buildRoot,
    intelligenceSource: path.resolve(env.JJ_WORLD_MONITOR_SOURCE || path.join(repositoryRoot, 'worldmonitor')),
    intelligenceDependencies: path.resolve(env.JJ_WM_RUNTIME_DEPS || path.join(buildRoot, 'wm-runtime-deps', 'node_modules')),
    outputRoot: path.resolve(env.JJ_OUTPUT_DIR || path.join(repositoryRoot, 'outputs')),
    runtimeRoot: path.join(appRoot, 'desktop', 'runtime'),
  };
}

module.exports = { buildPaths };
