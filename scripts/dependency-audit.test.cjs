/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS audit tooling. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkAudit } = require('./check-dependency-audit.js');
const NOW = Date.parse('2026-10-31T00:00:00Z');
function fixture() {
  return {
    report: { auditReportVersion: 2, metadata: { vulnerabilities: { total: 1 } }, vulnerabilities: {
      minimatch: { name: 'minimatch', severity: 'moderate', nodes: ['node_modules/minimatch'], via: [
        { name: 'minimatch', severity: 'moderate', url: 'https://github.com/advisories/GHSA-g3hv-75wg-m249' },
      ] },
    } },
    lock: { packages: { 'node_modules/minimatch': { version: '3.1.5', dev: true } } },
  };
}
test('audit accepts only the exact reviewed development-only legacy matcher', () => {
  const { report, lock } = fixture();
  assert.equal(checkAudit(report, lock, NOW).reviewed, 1);
  lock.packages['node_modules/minimatch'].dev = false;
  assert.throws(() => checkAudit(report, lock, NOW), /Production/);
});
test('audit rejects different versions, new advisories, expiry, and incomplete reports', () => {
  const { report, lock } = fixture();
  lock.packages['node_modules/minimatch'].version = '10.2.6';
  assert.throws(() => checkAudit(report, lock, NOW), /version/);
  lock.packages['node_modules/minimatch'].version = '3.1.5';
  assert.throws(() => checkAudit(report, lock, Date.parse('2026-11-07T00:00:00Z')), /expired/);
  report.vulnerabilities.minimatch.via[0].url = 'https://github.com/advisories/new-alert';
  assert.throws(() => checkAudit(report, lock, NOW), /Unreviewed advisory/);
  assert.throws(() => checkAudit({ error: {} }, lock, NOW), /incomplete/);
});
