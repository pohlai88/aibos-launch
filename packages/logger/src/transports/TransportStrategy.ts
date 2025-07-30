import { LogLevel } from '../LogLevel';

// Transport strategy interface for AI-BOS logger

export interface LogContext {
    timestamp: string;
    level: LogLevel;
    message: string;
    [key: string]: unknown;
}

export interface TransportStrategy {
    name: string;
    log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
    isEnabled(level: LogLevel): boolean;
    destroy?(): Promise<void>;
}
