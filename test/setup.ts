import { beforeAll, afterEach, vi } from 'vitest';
import { mockReset } from 'vitest-mock-extended';

// Global test setup
beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';

    // Mock console methods to reduce noise in tests
    global.console = {
        ...console,
        log: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
});

// Reset all mocks after each test
afterEach(() => {
    mockReset(global);
    vi.clearAllMocks();
});

// Global test utilities
export const testUtils = {
    // Mock environment variables
    mockEnv: (env: Record<string, string>) => {
        Object.entries(env).forEach(([key, value]) => {
            process.env[key] = value;
        });
    },

    // Reset environment variables
    resetEnv: () => {
        process.env.NODE_ENV = 'test';
        process.env.LOG_LEVEL = 'error';
    },

    // Create test manifest
    createTestManifest: (overrides = {}) => ({
        schemaVersion: '1.0.0',
        manifest: {
            version: '1.0.0',
            features: [],
            permissions: [],
            ...overrides,
        },
    }),
};
