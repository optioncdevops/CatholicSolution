#!/usr/bin/env node
// @ts-check
/**
 * Regenerates the hosted App Switcher manifests from the canonical registry
 * (src/registry/appCatalog.ts). Run after any change to that file:
 *
 *   npm run sync:app-switcher-manifest
 *
 * Produces two static JSON files under public/integrations/app-switcher/v1/:
 *  - manifest.json      production destinations (each app's externalUrl)
 *  - manifest.dev.json  local-dev destinations (each app's own Vite dev server)
 *
 * Both are served as-is by Vite's public/ handling in every mode, so the
 * hosted switcher script never depends on a build-time macro or bundler step.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'public', 'integrations', 'app-switcher', 'v1');

/**
 * Local dev-server origins for the independently deployed products. Ports match
 * each product's own VITE_DEV_PORT in SaaS_Apps/<project>/.env.development.
 * Kept in sync by hand with src/shared/platform/navigation/solutionNavigation.ts
 * in cfr and cfr-admin (which resolve the same set for in-app navigation).
 */
const developmentAppOrigins = {
  'optionc-school': 'http://localhost:4002',
  'matt-money': 'http://localhost:4003',
  'arc-alerts': 'http://localhost:4004',
  'optionc-parish': 'http://localhost:4005',
  'catholic-content': 'http://localhost:4006',
  'unified-directory': 'http://localhost:4007',
  'support-center': 'http://localhost:4009',
  'ai-lesson-plan': 'http://localhost:4010',
};

const PRODUCTION_PLATFORM_ORIGIN = 'https://cfr.optioncapp.com';
const DEVELOPMENT_PLATFORM_ORIGIN = 'http://localhost:4001';

export function assertApprovedOrigin(value, { allowLocalhost }) {
  const url = new URL(value);
  const isHttps = url.protocol === 'https:';
  const isLocalDev = allowLocalhost && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!isHttps && !isLocalDev) {
    throw new Error(`Refusing to publish non-approved destination "${value}" (must be https:, or http(s) localhost in the dev manifest).`);
  }
  return value;
}

export function buildManifest(apps, { allowLocalhost, appHubHref }) {
  const seen = new Set();
  const manifestApps = apps.map((app) => {
    if (seen.has(app.id)) throw new Error(`Duplicate app id "${app.id}" in registry — refusing to publish an ambiguous manifest.`);
    seen.add(app.id);

    const href = allowLocalhost && developmentAppOrigins[app.id]
      ? developmentAppOrigins[app.id]
      : app.externalUrl;
    if (!href) throw new Error(`App "${app.id}" is launcher-enabled but has no destination URL.`);
    assertApprovedOrigin(href, { allowLocalhost });

    return {
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      category: app.category,
      icon: app.icon,
      gradient: app.gradient,
      href,
      target: app.navigationTarget === 'new-tab' ? 'new-tab' : 'same-tab',
    };
  });

  return {
    version: '1',
    appHubHref: assertApprovedOrigin(appHubHref, { allowLocalhost }),
    apps: manifestApps,
  };
}

export async function main() {
  const registryPath = pathToFileURL(path.join(root, 'src', 'registry', 'appCatalog.ts')).href;
  /** @type {{ availableSwitcherApps: Array<Record<string, unknown>> }} */
  const { availableSwitcherApps } = await import(registryPath);

  if (!Array.isArray(availableSwitcherApps) || availableSwitcherApps.length === 0) {
    throw new Error('Registry produced no launcher-approved apps — refusing to publish an empty manifest.');
  }

  const production = buildManifest(availableSwitcherApps, {
    allowLocalhost: false,
    appHubHref: `${PRODUCTION_PLATFORM_ORIGIN}/apps`,
  });
  const development = buildManifest(availableSwitcherApps, {
    allowLocalhost: true,
    appHubHref: `${DEVELOPMENT_PLATFORM_ORIGIN}/apps`,
  });

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(production, null, 2)}\n`, 'utf8');
  await writeFile(path.join(outDir, 'manifest.dev.json'), `${JSON.stringify(development, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${production.apps.length} apps to public/integrations/app-switcher/v1/manifest.json`);
  console.log(`Wrote ${development.apps.length} apps to public/integrations/app-switcher/v1/manifest.dev.json`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
