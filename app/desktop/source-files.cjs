const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const omittedDirectories = new Set([
  '.git', '.next', '.cache', '.claude', '.jj-build', '.vercel', '.evidence-store',
  'node_modules', 'dist', 'runtime', 'outputs', '__pycache__',
]);
const environmentTemplates = new Set(['.env.example', '.env.sample', '.env.template']);

function sourceFilter(root) {
  return source => {
    const relative = path.relative(root, source);
    if (!relative) return true;
    const parts = relative.split(path.sep);
    if (parts.some(part => omittedDirectories.has(part))) return false;
    const name = path.basename(source);
    if (name.startsWith('.env') && !environmentTemplates.has(name)) return false;
    if (['.api-key', '.DS_Store', '.npmrc', '.netrc', '.pypirc'].includes(name)) return false;
    if (/\.(?:db|sqlite|sqlite3)(?:-|$)|\.(?:key|pem|p12|pfx|log|pyc|tsbuildinfo)$/i.test(name)) return false;
    // Never follow a link out of the reviewed source tree into credentials or data.
    return !fs.lstatSync(source).isSymbolicLink();
  };
}

function sourceManifest(root) {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) {
        const contents = fs.readFileSync(target);
        files.push({ path: path.relative(root, target).split(path.sep).join('/'), bytes: contents.length, sha256: crypto.createHash('sha256').update(contents).digest('hex') });
      }
    }
  }
  walk(root);
  return files;
}

module.exports = { sourceFilter, sourceManifest };
