#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');

function updateVersion(type = 'patch') {
  try {
    // Read current package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Parse version
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    // Update package.json
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Create git tag
    execSync(`git add package.json`);
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    execSync(`git tag v${newVersion}`);
    
    console.log(`✅ Version updated from ${currentVersion} to ${newVersion}`);
    console.log(`✅ Git tag v${newVersion} created`);
    
    return newVersion;
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const type = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('❌ Invalid version type. Use: major, minor, or patch');
  process.exit(1);
}

updateVersion(type);
