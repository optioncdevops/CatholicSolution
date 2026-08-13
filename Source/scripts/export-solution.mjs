import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsRoot = path.join(root, 'apps');
const sharedRoot = path.join(root, 'packages', 'shared', 'src');
const outputRoot = path.join(root, '.artifacts', 'standalone');

const solutions = [
  'app-hub',
  'optionc-school',
  'matt-money',
  'arc-alerts',
  'optionc-parish',
  'catholic-content',
  'unified-directory',
  'support-center',
  'ai-lesson-plan',
];

function usage() {
  console.error(`Usage: npm run export:solution -- <${solutions.join('|')}|all>`);
  process.exit(1);
}

async function copyDirectory(source, destination) {
  await cp(source, destination, {
    recursive: true,
    filter(sourcePath) {
      const name = path.basename(sourcePath);
      return !['node_modules', 'dist', '.artifacts'].includes(name) && !name.endsWith('.tsbuildinfo');
    },
  });
}

async function rewriteStandaloneConfig(destination) {
  const vitePath = path.join(destination, 'vite.config.ts');
  const tsconfigPath = path.join(destination, 'tsconfig.app.json');

  const vite = await readFile(vitePath, 'utf8');
  await writeFile(
    vitePath,
    vite.replace("path.resolve(currentDirectory, '../../packages/shared/src')", "path.resolve(currentDirectory, './src/shared')"),
  );

  const tsconfig = await readFile(tsconfigPath, 'utf8');
  await writeFile(
    tsconfigPath,
    tsconfig
      .replaceAll('../../packages/shared/src/*', 'src/shared/*')
      .replaceAll('../../packages/shared/src', 'src/shared'),
  );
}

async function exportSolution(solution) {
  if (!solutions.includes(solution)) usage();

  const source = path.join(appsRoot, solution);
  const destination = path.join(outputRoot, solution);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await copyDirectory(source, destination);
  await mkdir(path.join(destination, 'src', 'shared'), { recursive: true });
  await copyDirectory(sharedRoot, path.join(destination, 'src', 'shared'));
  await rewriteStandaloneConfig(destination);
  await mkdir(path.join(destination, 'scripts'), { recursive: true });
  await cp(path.join(root, 'scripts', 'build-staging.mjs'), path.join(destination, 'scripts', 'build-staging.mjs'));

  const packagePath = path.join(destination, 'package.json');
  const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
  pkg.name = `${pkg.name}-standalone`;
  pkg.private = true;
  pkg.scripts = {
    ...pkg.scripts,
    'build:development': 'tsc -b && vite build --mode development',
    'build:staging': 'node scripts/build-staging.mjs',
    'build:production': 'tsc -b && vite build --mode production',
  };
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

  const developmentEnv = await readFile(path.join(destination, '.env.development'), 'utf8');
  const port = developmentEnv.match(/^VITE_DEV_PORT=(\d+)$/m)?.[1] ?? '4001';
  await writeFile(
    path.join(destination, 'STANDALONE.md'),
    `# ${solution} standalone deployment\n\nThis folder is generated from the Catholic Solutions monorepo and is self-contained for this SaaS domain.\n\n## Run\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen \`http://localhost:${port}\`. If there is no development session, the solution redirects to the central Login domain defined in \`src/shared/auth/appAuthConfig.ts\` and returns here after authentication. The Central Login application must be available for an unauthenticated browser session.\n\n## Build\n\n\`\`\`bash\nnpm run build:staging\nnpm run build:production\n\`\`\`\n\nDeploy the generated \`dist/\` folder to this solution's configured domain.\n\nDo not manually edit \`src/shared\`; regenerate this standalone package from the monorepo when common platform code changes.\n`,
  );

  console.log(`Exported ${solution} -> ${path.relative(root, destination)}`);
}

const requested = process.argv[2];
if (!requested) usage();

await mkdir(outputRoot, { recursive: true });
if (requested === 'all') {
  for (const solution of solutions) await exportSolution(solution);
} else {
  await exportSolution(requested);
}
