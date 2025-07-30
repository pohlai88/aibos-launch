import { z } from 'zod';

// Common validation schemas for AI-BOS

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * Date validation schema
 */
export const dateSchema = z.string().datetime('Invalid date format');

/**
 * Environment validation schema
 */
export const environmentSchema = z.enum(['development', 'production', 'test']);

/**
 * Log level validation schema
 */
export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

/**
 * Version validation schema
 */
export const versionSchema = z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semantic versioning format (e.g., 1.0.0)');

/**
 * Validate a value against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, value: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(value);
    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, error: result.error.issues[0]?.message || 'Validation failed' };
    }
}

/**
 * Safe parse a value against a schema
 */
export function safeParse<T>(schema: z.ZodSchema<T>, value: unknown) {
    return schema.safeParse(value);
}
