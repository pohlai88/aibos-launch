#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AI-BOS Setup Script');
console.log('======================\n');

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

async function setup() {
    try {
        // Check if .env file exists
        if (!fs.existsSync('.env')) {
            console.log('📝 Creating .env file from template...');
            if (fs.existsSync('.env.example')) {
                fs.copyFileSync('.env.example', '.env');
                console.log('✅ .env file created');
            } else {
                console.log('⚠️  .env.example not found, creating basic .env');
                fs.writeFileSync('.env', 'NODE_ENV=development\nAPP_VERSION=0.1.0-foundation\n');
            }
        }

        // Install dependencies
        console.log('📦 Installing dependencies...');
        await runCommand('pnpm', ['install']);

        // Setup Husky
        console.log('🐕 Setting up Husky...');
        await runCommand('npx', ['husky', 'init']);

        // Create pre-commit hook
        const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint
pnpm type-check
pnpm test
`;

        fs.writeFileSync('.husky/pre-commit', preCommitHook);
        fs.chmodSync('.husky/pre-commit', '755');

        console.log('✅ Setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Review and update .env file');
        console.log('2. Run: pnpm dev');
        console.log('3. Run: pnpm test');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();
