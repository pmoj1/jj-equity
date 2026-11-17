const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildPaths } = require('./build-paths.cjs');
const { sourceFilter, sourceManifest } = require('./source-files.cjs');
const { checksumFor, verifyArtifact } = require('./artifact-integrity.cjs');
const { execFileSync } = require('node:child_process');

test('build defaults are relative to the checkout, independent of the shell directory', () => {
  const app = path.join(os.tmpdir(), 'different-checkout', 'app');
  const paths = buildPaths({}, app);
  assert.equal(paths.intelligenceSource, path.join(os.tmpdir(), 'different-checkout', 'worldmonitor'));
  assert.equal(paths.intelligenceDependencies, path.join(os.tmpdir(), 'different-checkout', '.jj-build', 'wm-runtime-deps', 'node_modules'));
  assert.equal(paths.outputRoot, path.join(os.tmpdir(), 'different-checkout', 'outputs'));
  assert.equal(paths.runtimeRoot, path.join(app, 'desktop', 'runtime'));
});

test('source packaging retains modified source and templates while excluding secrets, data and escaping links', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-source-test-'));
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-source-copy-'));
  try {
    for (const name of ['.env', '.env.production', '.env.local', '.api-key', 'positions.sqlite', 'positions.db-wal', 'private.pem', '.env.example', 'module.ts', 'LICENSE']) fs.writeFileSync(path.join(root, name), name === 'module.ts' ? 'modified source' : 'fixture');
    fs.mkdirSync(path.join(root, 'node_modules'));
    fs.writeFileSync(path.join(root, 'node_modules', 'dependency.js'), 'fixture');
    fs.symlinkSync(os.tmpdir(), path.join(root, 'external'));
    fs.cpSync(root, dest, { recursive: true, filter: sourceFilter(root) });
    const paths = sourceManifest(dest).map(file => file.path).sort();
    assert.deepEqual(paths, ['.env.example', 'LICENSE', 'module.ts']);
    assert.equal(fs.readFileSync(path.join(dest, 'module.ts'), 'utf8'), 'modified source');
    assert.equal(sourceManifest(dest).find(file => file.path === 'module.ts').sha256.length, 64);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('release verification refuses missing names and altered archives', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-integrity-test-'));
  const file = path.join(root, 'electron.zip');
  fs.writeFileSync(file, 'fixture archive');
  const checksum = require('node:crypto').createHash('sha256').update('fixture archive').digest('hex');
  try {
    assert.equal(checksumFor(`${checksum} *electron.zip\n`, 'electron.zip'), checksum);
    assert.throws(() => checksumFor(`${checksum} another.zip`, 'electron.zip'), /does not list/);
    await verifyArtifact(file, checksum);
    fs.appendFileSync(file, 'changed');
    await assert.rejects(verifyArtifact(file, checksum), /checksum mismatch/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('the source ZIP works from another directory and includes current companion modifications without private files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-archive-test-'));
  const app = path.join(root, 'app');
  const desktop = path.join(app, 'desktop');
  const companion = path.join(root, 'worldmonitor');
  const output = path.join(root, 'outputs');
  try {
    fs.mkdirSync(desktop, { recursive: true });
    fs.mkdirSync(path.join(companion, '.git'), { recursive: true });
    for (const name of ['create-source.cjs', 'build-paths.cjs', 'source-files.cjs']) fs.copyFileSync(path.join(__dirname, name), path.join(desktop, name));
    fs.writeFileSync(path.join(desktop, 'package.json'), JSON.stringify({ version: '1.3.0' }));
    fs.writeFileSync(path.join(app, 'module.ts'), 'current application source');
    fs.writeFileSync(path.join(app, '.env.production'), 'private fixture');
    fs.writeFileSync(path.join(app, 'portfolio.sqlite'), 'private fixture');
    fs.writeFileSync(path.join(companion, 'LICENSE'), 'companion licence fixture');
    fs.writeFileSync(path.join(companion, 'module.ts'), 'uncommitted companion modification');
    fs.writeFileSync(path.join(companion, '.env'), 'private fixture');
    fs.writeFileSync(path.join(root, 'SOURCE-NOTICES.md'), 'notice fixture');
    const env = { ...process.env, JJ_WORLD_MONITOR_SOURCE: companion, JJ_OUTPUT_DIR: output };
    execFileSync(process.execPath, [path.join(desktop, 'create-source.cjs')], { cwd: os.tmpdir(), env });
    const archive = path.join(output, 'J&J-Equity-Source.zip');
    const listing = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' });
    assert.ok(!listing.includes('.env'));
    assert.ok(!listing.includes('portfolio.sqlite'));
    assert.ok(!listing.includes('/.git/'));
    assert.equal(execFileSync('unzip', ['-p', archive, 'J&J-Equity-Source/worldmonitor/module.ts'], { encoding: 'utf8' }), 'uncommitted companion modification');
    const manifest = JSON.parse(execFileSync('unzip', ['-p', archive, 'J&J-Equity-Source/SOURCE-MANIFEST.json'], { encoding: 'utf8' }));
    assert.ok(manifest.some(file => file.path === 'app/module.ts'));
    assert.ok(manifest.some(file => file.path === 'worldmonitor/module.ts'));
    assert.ok(manifest.some(file => file.path === 'SOURCE-NOTICES.md'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
