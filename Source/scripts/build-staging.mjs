import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = process.cwd();
const env = { ...process.env, VITE_DEPLOYMENT_TARGET: 'staging' };

function run(modulePath, args) {
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules', modulePath), ...args], {
    cwd,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('typescript/bin/tsc', ['-b']);
run('vite/bin/vite.js', ['build', '--mode', 'production']);
