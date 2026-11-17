const crypto = require('node:crypto');
const fs = require('node:fs');

function checksumFor(manifest, filename) {
  for (const line of manifest.split(/\r?\n/)) {
    const match = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
    if (match && match[2] === filename) return match[1].toLowerCase();
  }
  throw new Error(`The release checksum manifest does not list ${filename}.`);
}

async function verifyArtifact(file, expected) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  const actual = hash.digest('hex');
  if (actual !== expected.toLowerCase()) throw new Error('Electron archive checksum mismatch. Remove the cached archive and download the pinned release again.');
  return actual;
}

module.exports = { checksumFor, verifyArtifact };
