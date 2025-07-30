import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./test/setup.ts'],
        mockReset: true,
        snapshotSerializers: ['@vitest/snapshot-serializer-raw'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
                'coverage/',
                '**/*.d.ts',
                '**/*.config.*',
                'test/',
            ],
        },
    },
    resolve: {
        alias: {
            '@ai-bos': resolve(__dirname, '../packages'),
            '@ai-bos/shared-infrastructure': resolve(__dirname, '../packages/shared-infrastructure/src'),
            '@ai-bos/types': resolve(__dirname, '../packages/types/src'),
            '@ai-bos/logger': resolve(__dirname, '../packages/logger/src'),
            '@ai-bos/backend-core': resolve(__dirname, '../packages/backend-core/src'),
        },
    },
});
