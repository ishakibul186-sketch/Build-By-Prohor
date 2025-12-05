import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';
import { rm } from 'fs/promises';
// Fix: Resolve typing error for process.exit by importing exit directly from node:process.
import { exit } from 'node:process';

const outdir = 'public';

// Clean the output directory
await rm(outdir, { recursive: true, force: true });

// Create public directory if it doesn't exist
await mkdir(outdir, { recursive: true });

// Build the main JS bundle
try {
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: `${outdir}/index.js`,
    minify: true,
    sourcemap: true,
    target: 'es2020',
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // Copy static files
  await copyFile('index.html', `${outdir}/index.html`);
  await copyFile('google094f0a5dcd31b0ad.html', `${outdir}/google094f0a5dcd31b0ad.html`);
  await copyFile('sitemap.xml', `${outdir}/sitemap.xml`);

  console.log('Build finished successfully!');
} catch (error) {
  console.error('Build failed:', error);
  exit(1);
}
