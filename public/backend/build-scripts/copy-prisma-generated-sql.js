/**
 * @fileOverview
 * Script to copy Prisma-generated files (.js and .d.ts) containing functions and types to
 * a target directory
 */

/**
 * Target directory where files will be copied
 */
const TARGET_DIR = './src/prisma-generated-sql';

import { execSync } from 'child_process';
import { join } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

// Get the installation location of @prisma/client
const output = execSync('npm list --depth 1 --parseable @prisma/client', {
  encoding: 'utf8',
});

// Find the specific line containing @prisma/client path
const prismaClientLine = output
  .split('\n')
  .find((line) => line.includes('@prisma/client'));

if (!prismaClientLine) {
  throw new Error('@prisma/client not found');
}

// Construct the path to Prisma's SQL files
const prismaClientPath = join(
  prismaClientLine.replace(/@prisma\/client$/, ''),
  '.prisma',
  'client',
  'sql',
);

// Create target directory if it doesn't exist
if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true });
}

/**
 * Copy relevant files to target directory
 * Includes only .js and .d.ts files, excluding edge-specific files
 */
readdirSync(prismaClientPath)
  .filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.d.ts')) &&
      !file.includes('.edge.'),
  )
  .forEach((file) => {
    const sourcePath = join(prismaClientPath, file);
    const targetPath = join(TARGET_DIR, file);

    copyFileSync(sourcePath, targetPath);
  });
