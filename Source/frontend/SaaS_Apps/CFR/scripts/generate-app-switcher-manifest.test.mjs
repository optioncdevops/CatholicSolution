import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertApprovedOrigin, buildManifest } from './generate-app-switcher-manifest.mjs';

test('assertApprovedOrigin accepts https', () => {
  assert.equal(assertApprovedOrigin('https://example.optioncapp.com', { allowLocalhost: false }), 'https://example.optioncapp.com');
});

test('assertApprovedOrigin rejects http in production mode', () => {
  assert.throws(() => assertApprovedOrigin('http://example.com', { allowLocalhost: false }));
});

test('assertApprovedOrigin accepts localhost http only when allowLocalhost is true', () => {
  assert.equal(assertApprovedOrigin('http://localhost:4002', { allowLocalhost: true }), 'http://localhost:4002');
  assert.throws(() => assertApprovedOrigin('http://localhost:4002', { allowLocalhost: false }));
});

test('assertApprovedOrigin rejects non-http(s) schemes', () => {
  assert.throws(() => assertApprovedOrigin('javascript:alert(1)', { allowLocalhost: false }));
});

const sampleApps = [
  { id: 'optionc-school', name: 'OptionC School', shortName: 'School', category: 'SIS', icon: '🎓', gradient: 'g1', externalUrl: 'https://optionc-sms.optioncapp.com', navigationTarget: undefined },
  { id: 'berchmans', name: 'Berchmans', shortName: 'Berchmans', category: 'Liturgy', icon: '🗓️', gradient: 'g2', externalUrl: 'https://berchmans.app', navigationTarget: 'new-tab' },
];

test('buildManifest resolves production hrefs to each app externalUrl', () => {
  const manifest = buildManifest(sampleApps, { allowLocalhost: false, appHubHref: 'https://cfr.optioncapp.com/apps' });
  assert.equal(manifest.apps[0].href, 'https://optionc-sms.optioncapp.com');
  assert.equal(manifest.apps[0].target, 'same-tab');
  assert.equal(manifest.apps[1].target, 'new-tab');
});

test('buildManifest resolves dev hrefs to localhost, not production', () => {
  const manifest = buildManifest(sampleApps, { allowLocalhost: true, appHubHref: 'http://localhost:4001/apps' });
  assert.equal(manifest.apps[0].href, 'http://localhost:4002');
  // Partner app with no local dev server keeps its real external URL even in dev.
  assert.equal(manifest.apps[1].href, 'https://berchmans.app');
});

test('buildManifest rejects duplicate app ids', () => {
  assert.throws(() => buildManifest([sampleApps[0], sampleApps[0]], { allowLocalhost: false, appHubHref: 'https://cfr.optioncapp.com/apps' }));
});

test('buildManifest rejects a launcher-enabled app with no destination', () => {
  const broken = [{ ...sampleApps[0], externalUrl: undefined }];
  assert.throws(() => buildManifest(broken, { allowLocalhost: false, appHubHref: 'https://cfr.optioncapp.com/apps' }));
});
