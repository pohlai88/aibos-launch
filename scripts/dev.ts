#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const VERSION = '0.1.0-foundation';

interface Command {
    name: string;
    description: string;
    action: () => Promise<void>;
}

const commands: Command[] = [
    {
        name: 'scaffold',
        description: 'Scaffold a new app or package',
        action: async () => {
            const args = process.argv.slice(3);
            if (args.length < 2) {
                console.log('Usage: pnpm dev scaffold <type> <name>');
                console.log('Types: app, package');
                process.exit(1);
            }

            const [type, name] = args;
            console.log(`Scaffolding ${type}: ${name}`);
            // TODO: Implement scaffolding logic in Phase 2
        }
    },
    {
        name: 'validate',
        description: 'Validate manifest and configuration',
        action: async () => {
            console.log('Validating manifest and configuration...');
            // TODO: Implement validation logic in Phase 2
        }
    },
    {
        name: 'test',
        description: 'Run tests with coverage',
        action: async () => {
            console.log('Running tests with coverage...');
            await runCommand('pnpm', ['test']);
        }
    },
    {
        name: 'coverage',
        description: 'Show test coverage report',
        action: async () => {
            console.log('Generating coverage report...');
            await runCommand('pnpm', ['test', '--coverage']);
        }
    },
    {
        name: 'version',
        description: 'Show AI-BOS version',
        action: async () => {
            console.log(`AI-BOS Version: ${VERSION}`);
        }
    }
];

async function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
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

function showHelp(): void {
    console.log('AI-BOS Development CLI');
    console.log(`Version: ${VERSION}\n`);
    console.log('Usage: pnpm dev <command> [options]\n');
    console.log('Commands:');

    commands.forEach(cmd => {
        console.log(`  ${cmd.name.padEnd(15)} ${cmd.description}`);
    });

    console.log('\nExamples:');
    console.log('  pnpm dev scaffold app my-app');
    console.log('  pnpm dev validate');
    console.log('  pnpm dev test');
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        return;
    }

    const commandName = args[0];
    const command = commands.find(cmd => cmd.name === commandName);

    if (!command) {
        console.error(`Unknown command: ${commandName}`);
        console.log('Run "pnpm dev --help" for available commands');
        process.exit(1);
    }

    try {
        await command.action();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}
