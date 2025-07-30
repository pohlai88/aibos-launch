#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 AI-BOS Validation Script');
console.log('===========================\n');

async function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);

        const child = spawn(command, args, { stdio: 'inherit' });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${description}: ${filePath} (missing)`);
        return false;
    }
}

function checkDirectoryExists(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        console.log(`✅ ${description}: ${dirPath}`);
        return true;
    } else {
        console.log(`❌ ${description}: ${dirPath} (missing)`);
        return false;
    }
}

async function validate() {
    let allChecksPassed = true;

    try {
        console.log('📁 Checking directory structure...\n');

        // Check required directories
        const requiredDirs = [
            ['apps', 'Apps directory'],
            ['apps/frontend', 'Frontend app directory'],
            ['apps/backend', 'Backend app directory'],
            ['packages', 'Packages directory'],
            ['packages/shared-infrastructure', 'Shared infrastructure package'],
            ['packages/types', 'Types package'],
            ['packages/logger', 'Logger package'],
            ['packages/backend-core', 'Backend core package'],
            ['manifests', 'Manifests directory'],
            ['manifests/core', 'Core manifests directory'],
            ['scripts', 'Scripts directory'],
            ['test', 'Test directory'],
            ['.github/workflows', 'GitHub workflows directory'],
            ['.husky', 'Husky directory'],
            ['.vscode', 'VS Code directory']
        ];

        requiredDirs.forEach(([dir, description]) => {
            if (!checkDirectoryExists(dir, description)) {
                allChecksPassed = false;
            }
        });

        console.log('\n📄 Checking configuration files...\n');

        // Check required files
        const requiredFiles = [
            ['package.json', 'Root package.json'],
            ['pnpm-workspace.yaml', 'pnpm workspace config'],
            ['turbo.json', 'Turborepo config'],
            ['tsconfig.base.json', 'Base TypeScript config'],
            ['eslint.config.js', 'ESLint config'],
            ['.prettierrc', 'Prettier config'],
            ['.editorconfig', 'Editor config'],
            ['.gitignore', 'Git ignore'],
            ['.nvmrc', 'Node version'],
            ['VERSION', 'Version file'],
            ['manifests/core/app.manifest.json', 'App manifest'],
            ['manifests/core/app.manifest.schema.json', 'Manifest schema'],
            ['test/setup.ts', 'Test setup'],
            ['test/vitest.config.ts', 'Vitest config'],
            ['scripts/dev.ts', 'Development CLI'],
            ['scripts/setup.js', 'Setup script'],
            ['scripts/validate.js', 'Validation script'],
            ['.github/workflows/ci.yml', 'CI pipeline'],
            ['.vscode/settings.json', 'VS Code settings'],
            ['.vscode/extensions.json', 'VS Code extensions']
        ];

        requiredFiles.forEach(([file, description]) => {
            if (!checkFileExists(file, description)) {
                allChecksPassed = false;
            }
        });

        console.log('\n🔧 Running validation commands...\n');

        // Run validation commands
        try {
            await runCommand('pnpm', ['lint']);
            console.log('✅ Linting passed');
        } catch (error) {
            console.log('❌ Linting failed');
            allChecksPassed = false;
        }

        try {
            await runCommand('pnpm', ['type-check']);
            console.log('✅ Type checking passed');
        } catch (error) {
            console.log('❌ Type checking failed');
            allChecksPassed = false;
        }

        try {
            await runCommand('pnpm', ['test']);
            console.log('✅ Tests passed');
        } catch (error) {
            console.log('❌ Tests failed');
            allChecksPassed = false;
        }

        console.log('\n📊 Validation Summary');
        console.log('===================');

        if (allChecksPassed) {
            console.log('✅ All validation checks passed!');
            console.log('🎉 AI-BOS Phase 1 foundation is ready!');
        } else {
            console.log('❌ Some validation checks failed');
            console.log('🔧 Please fix the issues above before proceeding');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

validate();
