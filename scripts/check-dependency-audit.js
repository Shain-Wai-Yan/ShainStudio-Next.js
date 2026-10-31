/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS audit tooling. */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Reviewed 2026-10-31: the upstream report describes firstPhasePreProcess()
// at optimizationLevel >= 2 in minimatch 10.2.6. Legacy 3.1.5 has neither.
// Modern consumers are overridden to 11.0.3; forcing v11 onto v3 consumers
// breaks their callable CommonJS API. This exact dev-only exception expires.
// https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249
const ADVISORY = 'https://github.com/advisories/GHSA-g3hv-75wg-m249';
const EXPIRES = Date.parse('2026-11-07T00:00:00Z');

function checkAudit(report, lock, now = Date.now()) {
  if (report.error || report.auditReportVersion !== 2 || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
    throw new Error('Audit failed or returned an incomplete report.');
  }
  const entries = Object.entries(report.vulnerabilities);
  if (entries.length !== report.metadata.vulnerabilities.total) throw new Error('Audit counts disagree.');
  if (!entries.length) return { reviewed: 0, affectedPackages: 0 };
  if (now >= EXPIRES) throw new Error('The reviewed legacy minimatch exception expired; review required.');
  let reviewed = 0;
  const reachable = new Set();
  for (const [name, item] of entries) {
    if (item.name !== name || item.severity !== 'moderate' || !item.via?.length || !item.nodes?.length) {
      throw new Error(`Unreviewed vulnerability: ${name}`);
    }
    for (const location of item.nodes) {
      const installed = lock.packages?.[location];
      if (!installed?.dev) throw new Error(`Production or unknown vulnerable dependency: ${location}`);
      if (name === 'minimatch' && installed.version !== '3.1.5') throw new Error('Unreviewed minimatch version.');
    }
    for (const via of item.via) {
      if (typeof via === 'string') {
        if (!report.vulnerabilities[via]) throw new Error('Broken advisory dependency graph.');
      } else {
        if (name !== 'minimatch' || via.name !== 'minimatch' || via.url !== ADVISORY || via.severity !== 'moderate') {
          throw new Error(`Unreviewed advisory: ${via.url || name}`);
        }
        reviewed += 1;
        reachable.add(name);
      }
    }
  }
  if (reviewed !== 1) throw new Error('Expected exactly one reviewed legacy advisory.');
  // Every meta-vulnerability must trace back to the reviewed root, including
  // mutually dependent ESLint packages. Unrelated dependency cycles fail.
  let added = true;
  while (added) {
    added = false;
    for (const [name, item] of entries) {
      if (!reachable.has(name) && item.via.some(via => typeof via === 'string' && reachable.has(via))) {
        reachable.add(name);
        added = true;
      }
    }
  }
  if (reachable.size !== entries.length) throw new Error('Unreviewed advisory dependency graph.');
  return { reviewed, affectedPackages: entries.length };
}
module.exports = { checkAudit };

if (require.main === module) {
  try {
    const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', timeout: 60000, maxBuffer: 5 * 1024 * 1024 });
    if (result.error || ![0, 1].includes(result.status)) throw result.error || new Error('npm audit failed.');
    const lock = JSON.parse(fs.readFileSync(path.join(__dirname, '../package-lock.json'), 'utf8'));
    const checked = checkAudit(JSON.parse(result.stdout), lock);
    console.log(checked.reviewed
      ? `Audit passed with one reviewed dev-only legacy minimatch advisory (${checked.affectedPackages} dependency/meta entries); exception expires 2026-11-07. New advisories and production vulnerabilities remain blocked.`
      : 'Audit passed: no vulnerabilities.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
