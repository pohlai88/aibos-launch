// Manifest types for AI-BOS

export interface ManifestFeature {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    permissions: string[];
    config?: Record<string, unknown>;
}

export interface ManifestPermission {
    id: string;
    name: string;
    description?: string;
    scope?: string[];
}

export interface ManifestConfig {
    environment: string;
    logging?: {
        level: string;
        format: string;
    };
    security?: {
        enabled: boolean;
    };
    [key: string]: unknown;
}

export interface Manifest {
    version: string;
    name: string;
    description?: string;
    features: ManifestFeature[];
    permissions: ManifestPermission[];
    config?: ManifestConfig;
}

export interface ManifestWithSchema {
    schemaVersion: string;
    manifest: Manifest;
    migrations?: Record<string, string>;
}

export interface ManifestValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
