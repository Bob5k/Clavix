/**
 * Tests for version command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';

describe('Version command', () => {
  it('should be able to read package.json version', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    expect(packageJson.version).toBeDefined();
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should have semantic version format', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    // Semantic versioning pattern: major.minor.patch
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/);
  });

  it('should have package name as clavix', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    expect(packageJson.name).toBe('clavix');
  });

  it('package.json should exist at expected location', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');

    const exists = await fs.pathExists(packageJsonPath);

    expect(exists).toBe(true);
  });

  it('should handle version parsing correctly', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    const version = packageJson.version;
    const parts = version.split('.');

    expect(parts.length).toBeGreaterThanOrEqual(3);
    expect(parseInt(parts[0])).toBeGreaterThanOrEqual(0);
    expect(parseInt(parts[1])).toBeGreaterThanOrEqual(0);
    expect(parseInt(parts[2])).toBeGreaterThanOrEqual(0);
  });
});
