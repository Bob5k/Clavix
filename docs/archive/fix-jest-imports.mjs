#!/usr/bin/env node

/**
 * Script to add @jest/globals imports to all test files
 * This is needed for ESM mode with injectGlobals: false
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

// Check if file already has @jest/globals import
function hasJestGlobalsImport(content) {
  return content.includes('@jest/globals');
}

// Add import after the last existing import
function addJestGlobalsImport(content) {
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

  // Determine which Jest globals to import based on usage
  const globals = ['describe', 'it', 'expect'];
  if (content.includes('beforeEach(')) globals.push('beforeEach');
  if (content.includes('afterEach(')) globals.push('afterEach');
  if (content.includes('beforeAll(')) globals.push('beforeAll');
  if (content.includes('afterAll(')) globals.push('afterAll');
  if (content.match(/\bjest\./)) globals.push('jest');

  const importStatement = `import { ${globals.join(', ')} } from '@jest/globals';`;

  if (lastImportIndex >= 0) {
    // Insert after the last import
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    // No imports found, add after leading comments
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    lines.splice(insertIndex, 0, '', importStatement, '');
  }

  return lines.join('\n');
}

// Process all test files
const testFiles = getAllTestFiles(testsDir);
let fixedCount = 0;

for (const filePath of testFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!hasJestGlobalsImport(content)) {
    console.log(`Fixing: ${path.relative(__dirname, filePath)}`);
    const fixed = addJestGlobalsImport(content);
    fs.writeFileSync(filePath, fixed, 'utf-8');
    fixedCount++;
  }
}

console.log(`\nDone! Fixed ${fixedCount} test files.`);
