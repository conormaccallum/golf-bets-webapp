const fs = require('node:fs');
const crypto = require('node:crypto');
const manifest = JSON.parse(fs.readFileSync('lib/strategy-manifest.json', 'utf8'));
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const payload = Object.fromEntries(Object.entries(manifest).filter(([key]) => !['contentHash', 'releaseId'].includes(key)));
const digest = crypto.createHash('sha256').update(JSON.stringify(canonical(payload))).digest('hex');
if (digest !== manifest.contentHash || !manifest.releaseId.endsWith(digest.slice(0, 12))) {
  throw new Error('Strategy manifest content/identity mismatch; copy the verified model contract before building.');
}
console.log(`Verified strategy contract: ${manifest.releaseId}`);
