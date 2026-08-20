import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platformDir = path.join(root, 'packages/app-switcher/dist/app-switcher/v1');
const cfrDist = path.join(root, 'apps/cfr/dist/integrations/app-switcher');
const versioned = path.join(cfrDist, 'v1');

await mkdir(versioned, { recursive: true });
await copyFile(path.join(platformDir, 'app-switcher.js'), path.join(versioned, 'app-switcher.js'));
await copyFile(path.join(platformDir, 'catalog.js'), path.join(versioned, 'catalog.js'));

// Temporary aliases for integrations created before the v1 path was introduced.
await mkdir(cfrDist, { recursive: true });
await copyFile(path.join(platformDir, 'app-switcher.js'), path.join(cfrDist, 'app-switcher.js'));
await copyFile(path.join(platformDir, 'catalog.js'), path.join(cfrDist, 'catalog.js'));

console.log('Legacy CFR App Switcher bridge copied from the independent platform build.');
