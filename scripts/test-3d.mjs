/**
 * Runs the procedural try-on geometry checks.
 *
 * The checks live in TypeScript alongside the code they exercise, so this
 * script transpiles them with esbuild, runs them in Node (three's geometry
 * maths needs no GPU), then cleans up.
 *
 * Run with: npm run test:3d   (also run by `npm test`)
 */
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Emitted inside the project so Node resolves the external `three` package
// from the project's node_modules.
const workDir = join(process.cwd(), 'node_modules', '.cache', 'virtuq-3d');
await mkdir(workDir, { recursive: true });
const outFile = join(workDir, 'checks.mjs');

try {
  await build({
    entryPoints: ['scripts/three-checks.entry.ts'],
    outfile: outFile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    external: ['three'],
    logLevel: 'error',
  });

  const module = await import(pathToFileURL(outFile).href);
  console.log('\nTry-on geometry (headless three.js)');
  const { passed, failures, log } = module.runThreeChecks();

  for (const line of log) console.log(line);
  console.log(`\n${passed} passed, ${failures.length} failed\n`);

  await rm(workDir, { recursive: true, force: true });
  process.exit(failures.length === 0 ? 0 : 1);
} catch (error) {
  await rm(workDir, { recursive: true, force: true }).catch(() => {});
  console.error('\nCould not run the 3D checks:', error.message, '\n');
  process.exit(1);
}
