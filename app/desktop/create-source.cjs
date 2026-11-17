const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync: run } = require('node:child_process');
const { buildPaths } = require('./build-paths.cjs');
const { sourceFilter, sourceManifest } = require('./source-files.cjs');
const paths = buildPaths();
const version = require('./package.json').version;
if (!fs.existsSync(path.join(paths.intelligenceSource, 'LICENSE'))) throw new Error('Companion intelligence source and its licence are required. Set JJ_WORLD_MONITOR_SOURCE to its folder.');
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-equity-source-'));
try {
  const dest = path.join(stage, 'J&J-Equity-Source');
  fs.mkdirSync(dest);
  fs.mkdirSync(paths.outputRoot, { recursive: true });
  // Copy the working source, not git archive HEAD: local fixes must be included.
  fs.cpSync(paths.appRoot, path.join(dest, 'app'), { recursive: true, filter: sourceFilter(paths.appRoot) });
  fs.cpSync(paths.intelligenceSource, path.join(dest, 'worldmonitor'), { recursive: true, filter: sourceFilter(paths.intelligenceSource) });
  for (const name of ['README.md', 'SOURCE-NOTICES.md', 'LICENSE']) {
    const source = path.join(paths.repositoryRoot, name);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(dest, name));
  }
  fs.writeFileSync(path.join(dest, 'BUILD.md'), `# J&J Equity ${version}\n\nKeep app/ and worldmonitor/ beside each other. Use Node.js 24 and npm. From app/ run npm ci, npm test, npm run test:desktop and npm run build. For an Apple Silicon desktop package, run npm run desktop:build on macOS with its command-line tools available.\n\nThe build compiles the companion intelligence API handlers for J&J Equity’s native widgets. It does not build or embed the companion web application. Provider-specific credentials remain optional and must be configured privately.\n\nSet JJ_WORLD_MONITOR_SOURCE, JJ_BUILD_DIR, JJ_WM_RUNTIME_DEPS or JJ_OUTPUT_DIR to override build locations. A packaged Mac application is locally ad-hoc signed, not notarized.\n\nThis source archive excludes credentials, environment files other than templates, local portfolios, caches and installed dependencies. SOURCE-MANIFEST.json records the archived file checksums. Third-party attribution is in SOURCE-NOTICES.md.\n`);
  fs.writeFileSync(path.join(dest, 'SOURCE-MANIFEST.json'), JSON.stringify(sourceManifest(dest), null, 2) + '\n');
  const archive = path.join(paths.outputRoot, 'J&J-Equity-Source.zip');
  fs.rmSync(archive, { force: true });
  if (process.platform === 'darwin') run('ditto', ['-c', '-k', '--keepParent', dest, archive]);
  else run('zip', ['-q', '-r', archive, path.basename(dest)], { cwd: stage });
  console.log(`J&J Equity source archive: ${archive}`);
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
