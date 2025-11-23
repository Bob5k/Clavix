#!/usr/bin/env node

/**
 * Script to add __dirname polyfill to test files that use it in ESM
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testsDir = path.join(__dirname, 'tests');

// Find all test files
function getAllTestFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTestFiles(fullPath));
    } else if (entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if file uses __dirname
function usesDirname(content) {
  return content.includes('__dirname');
}

// Check if file already has ESM __dirname polyfill
function hasEsmDirnamePolyfill(content) {
  return content.includes('fileURLToPath(import.meta.url)');
}

// Add ESM __dirname polyfill
function addDirnamePolyfill(content) {
  const lines = content.split('\n');

  // Find the last import statement line
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      // Check if this is a multi-line import
      let j = i;
      while (j < lines.length && !lines[j].includes(';') && !lines[j].includes(' from ')) {
        j++;
      }
      lastImportIndex = j;
      i = j;
    }
  }

  // Check if fileURLToPath is already imported
  const hasFileURLToPath = content.includes("import { fileURLToPath }") || content.includes("import {fileURLToPath");
  const hasDirname = content.includes("import { dirname }") || content.includes("import {dirname");

  const polyfillLines = [];

  if (!hasFileURLToPath) {
    polyfillLines.push("import { fileURLToPath } from 'url';");
  }

  if (!hasDirname && !content.includes("import * as path from 'path'") && !content.includes('import path from \'path\'')) {
    polyfillLines.push("import { dirname } from 'path';");
  }

  if (polyfillLines.length > 0 || !content.includes('const __filename =')) {
    if (polyfillLines.length > 0 && lastImportIndex >= 0) {
      // Insert imports after last import
      polyfillLines.forEach((line, index) => {
        lines.splice(lastImportIndex + 1 + index, 0, line);
      });
      lastImportIndex += polyfillLines.length;
    }

    // Add __filename and __dirname definitions
    if (!content.includes('const __filename =')) {
      lines.splice(lastImportIndex + 1, 0, '');
      lines.splice(lastImportIndex + 2, 0, 'const __filename = fileURLToPath(import.meta.url);');
      lines.splice(lastImportIndex + 3, 0, 'const __dirname = dirname(__filename);');
    }
  }

  return lines.join('\n');
}

// Process all test files
const testFiles = getAllTestFiles(testsDir);
let fixedCount = 0;

for (const filePath of testFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');

  if (usesDirname(content) && !hasEsmDirnamePolyfill(content)) {
    console.log(`Fixing: ${path.relative(__dirname, filePath)}`);
    const fixed = addDirnamePolyfill(content);
    fs.writeFileSync(filePath, fixed, 'utf-8');
    fixedCount++;
  }
}

console.log(`\nDone! Fixed ${fixedCount} test files.`);
